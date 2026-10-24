import React, { useState, useMemo } from 'react';

const parseYearMonth = (ymStr) => {
    if (!ymStr || typeof ymStr !== 'string') return null;
    const parts = ymStr.trim().split('-');
    if (parts.length < 2) return null;
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    if (isNaN(y) || isNaN(m)) return null;
    return { year: y, month: m };
};

const getMonthDiff = (baseYm, targetYm) => {
    const b = parseYearMonth(baseYm);
    const t = parseYearMonth(targetYm);
    if (!b || !t) return null;
    return (t.year - b.year) * 12 + (t.month - b.month);
};

const addMonthsToYm = (baseYm, offsetMonths) => {
    const b = parseYearMonth(baseYm);
    if (!b) return '';
    const totalMonths = b.year * 12 + (b.month - 1) + Number(offsetMonths || 0);
    const y = Math.floor(totalMonths / 12);
    const m = (totalMonths % 12) + 1;
    return `${y}-${String(m).padStart(2, '0')}`;
};

const formatYmKorean = (ymStr, fullYear = true) => {
    const parsed = parseYearMonth(ymStr);
    if (!parsed) return '시점 미정';
    const yr = fullYear ? parsed.year : String(parsed.year).slice(2);
    return `${yr}년 ${parsed.month}월`;
};

const formatRelativeOffset = (offset) => {
    if (offset === null || offset === undefined || isNaN(offset)) return '';
    if (offset === 0) return '이번 달';
    if (offset < 0) return `${Math.abs(offset)}개월 전`;
    const yrs = Math.floor(offset / 12);
    const mos = offset % 12;
    if (yrs > 0 && mos > 0) return `${yrs}년 ${mos}개월 뒤`;
    if (yrs > 0) return `${yrs}년 뒤`;
    return `${mos}개월 뒤`;
};

export default function LifeEventTimelineBoard({
    appData = {},
    calculation = {},
    assets = {},
    incomeEvents = [],
    expenseEvents = [],
    formatNumber = (v) => Number(v || 0).toLocaleString(),
    displayMode = 'normal',
    onStartEditingPhase = null,
    editingPhase = null
}) {
    const [horizonMonths, setHorizonMonths] = useState(120); // 36(3년) | 60(5년) | 120(10년)
    const [selectedFilter, setSelectedFilter] = useState('all'); // 'all' | 'phase' | 'loan' | 'event' | 'milestone'
    const [activeItem, setActiveItem] = useState(null);
    const [isChronoExpanded, setIsChronoExpanded] = useState(false);

    const baseYm = useMemo(() => {
        if (appData?.baseDate && appData.baseDate.length >= 7) return appData.baseDate.slice(0, 7);
        if (appData?.baseMonth && appData.baseMonth.length >= 7) return appData.baseMonth.slice(0, 7);
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }, [appData?.baseDate, appData?.baseMonth]);

    const monthlyProjections = calculation?.monthlyProjections || [];

    // 특정 개월 수(offset)의 예상 순자산 반환 (시뮬레이션 기간 내일 때만 정확히 반환)
    const getProjectedNetAt = (offset) => {
        if (offset < 0 || offset >= monthlyProjections.length) return null;
        return monthlyProjections[offset]?.net ?? null;
    };

    // 1. 타임라인 분기점(Phases) 트랙
    const phaseItems = useMemo(() => {
        const phases = Array.isArray(appData?.futurePhases) ? appData.futurePhases : [];
        const sorted = [...phases]
            .map((p, originalIdx) => ({ ...p, originalIdx }))
            .filter(p => p.startDate)
            .sort((a, b) => (a.startDate > b.startDate ? 1 : -1));

        const items = [];
        const firstPhaseOffset = sorted.length > 0 ? Math.max(0, getMonthDiff(baseYm, sorted[0].startDate) ?? horizonMonths) : horizonMonths;

        items.push({
            id: 'phase-base',
            category: 'phase',
            title: '기본 재무 계획 (현재 적용 중)',
            startYm: baseYm,
            endYm: sorted.length > 0 ? sorted[0].startDate : addMonthsToYm(baseYm, horizonMonths),
            startOffset: 0,
            endOffset: Math.min(horizonMonths, firstPhaseOffset),
            badge: '현재 구간',
            detail: `월 급여 ${(Number(appData?.monthlySalary) || 0).toLocaleString()}만원 기준`,
            originalIdx: null
        });

        sorted.forEach((p, idx) => {
            const startOff = getMonthDiff(baseYm, p.startDate);
            if (startOff === null) return;
            const nextP = sorted[idx + 1];
            const endOff = nextP ? (getMonthDiff(baseYm, nextP.startDate) ?? horizonMonths) : horizonMonths;

            const phaseSalary = p.data?.monthlySalary !== undefined ? Number(p.data.monthlySalary) : null;
            const phaseExpenses = Array.isArray(p.data?.monthlyExpenses)
                ? p.data.monthlyExpenses.reduce((s, e) => s + Number(e.amount || 0), 0)
                : null;

            const changeDesc = [];
            if (phaseSalary !== null) changeDesc.push(`월급 ${phaseSalary.toLocaleString()}만`);
            if (phaseExpenses !== null) changeDesc.push(`고정지출 ${phaseExpenses.toLocaleString()}만`);

            items.push({
                id: `phase-${p.originalIdx}`,
                category: 'phase',
                title: p.name || `분기점 #${idx + 1} (${formatYmKorean(p.startDate)})`,
                startYm: p.startDate,
                endYm: nextP ? nextP.startDate : addMonthsToYm(baseYm, horizonMonths),
                startOffset: Math.max(0, startOff),
                endOffset: Math.max(Math.max(0, startOff) + 1, Math.min(horizonMonths, endOff)),
                rawStartOffset: startOff,
                badge: `${formatYmKorean(p.startDate)} 시작`,
                detail: changeDesc.length > 0 ? changeDesc.join(' · ') : '자산·수입·지출 계획 전환',
                netWorthAtStart: getProjectedNetAt(Math.max(0, startOff)),
                originalIdx: p.originalIdx
            });
        });

        return items;
    }, [appData, baseYm, horizonMonths, monthlyProjections]);

    // 2. 대출 상환 & 완제 해방일 트랙
    const loanItems = useMemo(() => {
        const loans = Array.isArray(assets?.loan) ? assets.loan : [];
        return loans
            .map((loan, idx) => {
                const currentBalance = Number(loan.amount) || 0;
                const payment = Math.abs(Number(loan.monthlyContrib) || 0);
                const rate = Number(loan.rate) || 0;
                const method = loan.repaymentMethod || '원리금균등상환';
                if (currentBalance <= 0 && payment <= 0) return null;

                const startYm = (loan.loanStartDate && loan.loanStartDate.length >= 7)
                    ? loan.loanStartDate.slice(0, 7)
                    : baseYm;
                const startOff = getMonthDiff(baseYm, startYm) ?? 0;

                // 1순위: 시뮬레이션 프로젝션에서 실제로 해당 대출 잔액이 0원이 되는 달 탐색
                let payoffOffset = null;
                for (let m = 0; m < monthlyProjections.length; m++) {
                    const loanDetails = monthlyProjections[m]?.sectorDetails?.loan || [];
                    const found = loanDetails.find(d => d.name === loan.name);
                    if (found && Number(found.amount) <= 0.5 && m > Math.max(0, startOff)) {
                        payoffOffset = m;
                        break;
                    }
                }

                // 2순위: 만기 개월수(maturityMonth / loanPeriod) 또는 잔액/월상환액 기반 계산
                if (payoffOffset === null) {
                    const periodMonths = Number(loan.maturityMonth ?? loan.loanPeriod) || 0;
                    if (periodMonths > 0 && loan.loanStartDate) {
                        const targetEndOff = startOff + periodMonths;
                        if (targetEndOff > 0) payoffOffset = targetEndOff;
                    }
                    if (payoffOffset === null && payment > 0 && !method.includes('만기일시')) {
                        const monthlyRate = rate / 100 / 12;
                        const monthlyInterest = currentBalance * monthlyRate;
                        if (payment > monthlyInterest) {
                            if (monthlyRate > 0) {
                                const n = -Math.log(1 - (currentBalance * monthlyRate) / payment) / Math.log(1 + monthlyRate);
                                if (isFinite(n) && n > 0) payoffOffset = Math.ceil(n);
                            } else {
                                payoffOffset = Math.ceil(currentBalance / payment);
                            }
                        }
                    }
                }

                const isPayoffKnown = payoffOffset !== null && payoffOffset > 0 && payoffOffset <= 360;
                const endOffset = isPayoffKnown ? payoffOffset : horizonMonths;
                const payoffYm = isPayoffKnown ? addMonthsToYm(baseYm, payoffOffset) : null;

                return {
                    id: `loan-${idx}-${loan.name}`,
                    category: 'loan',
                    title: loan.name || `대출 #${idx + 1}`,
                    method,
                    currentBalance,
                    payment,
                    rate,
                    startYm,
                    payoffYm,
                    startOffset: Math.max(0, startOff),
                    endOffset,
                    isPayoffKnown,
                    freedMonthlyCash: payment,
                    netWorthAtPayoff: isPayoffKnown ? getProjectedNetAt(endOffset) : null,
                    badge: isPayoffKnown
                        ? `🎉 ${formatYmKorean(payoffYm)} 완제 (월 +${formatNumber(payment, displayMode)}만)`
                        : `${method} · 월 ${formatNumber(payment, displayMode)}만`,
                    detail: `현재 잔액 ${formatNumber(currentBalance, displayMode)}만원 · 금리 ${rate}% · ${method}`
                };
            })
            .filter(Boolean);
    }, [assets?.loan, baseYm, horizonMonths, monthlyProjections, formatNumber, displayMode]);

    // 3. 비정기 목돈 수입 & 지출 이벤트 트랙
    const cashEventItems = useMemo(() => {
        const list = [];
        const processEvents = (arr, type) => {
            (Array.isArray(arr) ? arr : []).forEach((ev, idx) => {
                const startYm = ev.startMonth || ev.startDate || ev.date || '';
                const startOff = getMonthDiff(baseYm, startYm);
                if (startOff === null) return;
                const rawEndYm = ev.endMonth || ev.endDate || startYm;
                const endOff = rawEndYm ? (getMonthDiff(baseYm, rawEndYm) ?? startOff) : startOff;
                const isRange = Boolean(ev.isRange || (endOff > startOff));
                const endYm = isRange ? rawEndYm : startYm;
                const amount = Number(ev.amount) || 0;
                const monthsCount = Math.max(1, endOff - startOff + 1);
                const totalAmount = isRange ? amount * monthsCount : amount;

                list.push({
                    id: `${type}-ev-${idx}-${ev.name}`,
                    category: 'event',
                    eventType: type, // 'income' | 'expense'
                    title: ev.name || (type === 'income' ? '목돈 유입' : '목돈 지출'),
                    amount,
                    totalAmount,
                    isRange,
                    monthsCount,
                    startYm,
                    endYm,
                    startOffset: startOff,
                    endOffset: Math.max(startOff, endOff),
                    netWorthAtEvent: getProjectedNetAt(Math.max(0, startOff)),
                    badge: `${type === 'income' ? '+' : '-'}${formatNumber(totalAmount, displayMode)}만원`,
                    detail: isRange
                        ? `${formatYmKorean(startYm)} ~ ${formatYmKorean(endYm)} (${monthsCount}개월간 매월 ${formatNumber(amount, displayMode)}만원)`
                        : `${formatYmKorean(startYm)} 일시 ${type === 'income' ? '수입' : '지출'} ${formatNumber(amount, displayMode)}만원`
                });
            });
        };

        processEvents(incomeEvents, 'income');
        processEvents(expenseEvents, 'expense');
        return list.sort((a, b) => a.startOffset - b.startOffset);
    }, [incomeEvents, expenseEvents, baseYm, monthlyProjections, formatNumber, displayMode]);

    // 4. 순자산 돌파 마일스톤 자동 감지
    const milestoneItems = useMemo(() => {
        if (!Array.isArray(monthlyProjections) || monthlyProjections.length === 0) return [];
        const currentNet = Number(monthlyProjections[0]?.net) || 0;
        const thresholds = [5000, 10000, 20000, 30000, 50000, 70000, 100000, 150000, 200000, 300000];
        const targetAmt = Number(appData?.targetAmount) || 0;
        if (targetAmt > currentNet && !thresholds.includes(targetAmt)) {
            thresholds.push(targetAmt);
            thresholds.sort((a, b) => a - b);
        }

        const results = [];
        thresholds.forEach((th) => {
            if (th <= currentNet) return;
            const hitIdx = monthlyProjections.findIndex(p => Number(p.net) >= th);
            if (hitIdx > 0 && hitIdx <= horizonMonths) {
                const hitProj = monthlyProjections[hitIdx];
                const ym = addMonthsToYm(baseYm, hitIdx);
                const isUserGoal = th === targetAmt;
                const eokLabel = th >= 10000
                    ? `${(th / 10000).toFixed(th % 10000 === 0 ? 0 : 1)}억원`
                    : `${th.toLocaleString()}만원`;

                results.push({
                    id: `milestone-${th}`,
                    category: 'milestone',
                    title: isUserGoal ? `🎯 목표 순자산 ${eokLabel} 달성!` : `🏆 순자산 ${eokLabel} 돌파`,
                    threshold: th,
                    isUserGoal,
                    startYm: ym,
                    startOffset: hitIdx,
                    endOffset: hitIdx,
                    netWorthAtEvent: hitProj.net,
                    badge: `순자산 ${formatNumber(hitProj.net, displayMode)}만원`,
                    detail: `${formatYmKorean(ym)} (${formatRelativeOffset(hitIdx)}) 예상 순자산 ${eokLabel} 돌파`
                });
            }
        });
        return results;
    }, [monthlyProjections, appData?.targetAmount, baseYm, horizonMonths, formatNumber, displayMode]);

    // 5. 연대기순(Chronological) 통합 마일스톤 카드 리스트
    const chronologicalRoadmap = useMemo(() => {
        const combined = [];

        phaseItems.forEach(p => {
            if (p.id === 'phase-base') return;
            if (p.rawStartOffset >= -1 && p.rawStartOffset <= horizonMonths) {
                combined.push({
                    id: p.id,
                    category: 'phase',
                    categoryLabel: '분기점 전환',
                    icon: '⏳',
                    tone: 'indigo',
                    offset: p.rawStartOffset,
                    ym: p.startYm,
                    title: p.title,
                    subtitle: p.detail,
                    impactBadge: '계획 전환',
                    netWorth: p.netWorthAtStart,
                    fallbackRightLabel: '설정한 분기 계획 적용',
                    rawItem: p
                });
            }
        });

        loanItems.forEach(l => {
            if (l.isPayoffKnown && l.endOffset >= 0 && l.endOffset <= horizonMonths) {
                combined.push({
                    id: `${l.id}-payoff`,
                    category: 'loan',
                    categoryLabel: '대출 완제',
                    icon: '🎉',
                    tone: 'emerald',
                    offset: l.endOffset,
                    ym: l.payoffYm,
                    title: `[${l.title}] 100% 상환 완료`,
                    subtitle: `매월 납입하던 ${formatNumber(l.payment, displayMode)}만원이 가용 현금흐름으로 전환됩니다.`,
                    impactBadge: `월 +${formatNumber(l.payment, displayMode)}만원 여유`,
                    netWorth: l.netWorthAtPayoff,
                    fallbackRightLabel: `원금 ${formatNumber(l.currentBalance, displayMode)}만 완제`,
                    rawItem: l
                });
            }
        });

        cashEventItems.forEach(ev => {
            if (ev.endOffset >= 0 && ev.startOffset <= horizonMonths) {
                const isInc = ev.eventType === 'income';
                combined.push({
                    id: ev.id,
                    category: 'event',
                    categoryLabel: isInc ? '수입 이벤트' : '지출 이벤트',
                    icon: isInc ? '💰' : '💸',
                    tone: isInc ? 'blue' : 'rose',
                    offset: Math.max(0, ev.startOffset),
                    ym: ev.startYm,
                    title: ev.title,
                    subtitle: ev.detail,
                    impactBadge: ev.badge,
                    netWorth: ev.netWorthAtEvent,
                    fallbackRightLabel: ev.isRange ? `${ev.monthsCount}개월 반복` : '일시 반영',
                    rawItem: ev
                });
            }
        });

        milestoneItems.forEach(m => {
            combined.push({
                id: m.id,
                category: 'milestone',
                categoryLabel: m.isUserGoal ? '목표 달성' : '자산 돌파',
                icon: m.isUserGoal ? '🎯' : '🏆',
                tone: 'amber',
                offset: m.startOffset,
                ym: m.startYm,
                title: m.title,
                subtitle: m.detail,
                impactBadge: m.badge,
                netWorth: m.netWorthAtEvent,
                fallbackRightLabel: '',
                rawItem: m
            });
        });

        return combined.sort((a, b) => a.offset - b.offset);
    }, [phaseItems, loanItems, cashEventItems, milestoneItems, horizonMonths, formatNumber, displayMode]);

    const filteredRoadmap = useMemo(() => {
        if (selectedFilter === 'all') return chronologicalRoadmap;
        return chronologicalRoadmap.filter(item => item.category === selectedFilter);
    }, [chronologicalRoadmap, selectedFilter]);

    // 눈금 표시용 5등분 체크포인트 (절대 겹치지 않는 균등 분할)
    const rulerCheckpoints = useMemo(() => {
        const steps = 5;
        const points = [];
        for (let i = 0; i <= steps; i++) {
            const m = Math.round((horizonMonths / steps) * i);
            const ym = addMonthsToYm(baseYm, m);
            const yrShort = ym.slice(2, 4);
            points.push({
                offset: m,
                pct: (m / horizonMonths) * 100,
                label: m === 0 ? '현재' : `'${yrShort}년 (+${Math.round((m / 12) * 10) / 10}년)`
            });
        }
        return points;
    }, [baseYm, horizonMonths]);

    const toneStyleMap = {
        indigo: {
            badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
            border: 'border-indigo-200 dark:border-indigo-800/60',
            impact: 'text-indigo-600 dark:text-indigo-400'
        },
        emerald: {
            badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
            border: 'border-emerald-200 dark:border-emerald-800/60',
            impact: 'text-emerald-600 dark:text-emerald-400'
        },
        blue: {
            badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
            border: 'border-blue-200 dark:border-blue-800/60',
            impact: 'text-blue-600 dark:text-blue-400'
        },
        rose: {
            badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
            border: 'border-rose-200 dark:border-rose-800/60',
            impact: 'text-rose-600 dark:text-rose-400'
        },
        amber: {
            badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
            border: 'border-amber-200 dark:border-amber-800/60',
            impact: 'text-amber-600 dark:text-amber-400'
        }
    };

    const visibleChrono = isChronoExpanded ? filteredRoadmap : filteredRoadmap.slice(0, 6);
    const hiddenChronoCount = Math.max(0, filteredRoadmap.length - 6);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* 1. 상단 헤더 (하단 분기 목록 카드와 100% 동일한 톤앤매너) */}
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg">🗺️</span>
                        <h3 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white">
                            미래 생애주기 · 대출 완제 · 목돈 일정 한눈에 보기
                        </h3>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300">
                            기준: {formatYmKorean(baseYm)}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        설정한 분기점, 대출 상환 완료일, 목돈 수입·지출, 순자산 목표 달성 시점을 시간순으로 보여줍니다.
                    </p>
                </div>

                {/* 조회 기간 선택 버튼 (3년 / 5년 / 10년) */}
                <div className="flex items-center bg-white dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-700 self-start sm:self-auto shrink-0">
                    {[
                        { months: 36, label: '향후 3년' },
                        { months: 60, label: '향후 5년' },
                        { months: 120, label: '향후 10년' }
                    ].map(opt => (
                        <button
                            key={opt.months}
                            type="button"
                            onClick={() => setHorizonMonths(opt.months)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                                horizonMonths === opt.months
                                    ? 'bg-indigo-600 text-white shadow-2xs'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
                {/* 2. 상단 4대 요약 카드 (라이트/다크 자동 대응) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/25 border border-indigo-100 dark:border-indigo-900/50">
                        <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">⏳ 설정된 미래 분기점</div>
                        <div className="text-base sm:text-lg font-black text-gray-900 dark:text-white mt-0.5">
                            {Math.max(0, phaseItems.length - 1)}개 분기
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                            {phaseItems.length > 1 ? `첫 전환: ${formatYmKorean(phaseItems[1].startYm)}` : '아래에서 분기점 추가 가능'}
                        </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/25 border border-emerald-100 dark:border-emerald-900/50">
                        <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">🎉 예정된 대출 완제</div>
                        <div className="text-base sm:text-lg font-black text-gray-900 dark:text-white mt-0.5">
                            {loanItems.filter(l => l.isPayoffKnown && l.endOffset <= horizonMonths).length}건 완제 예정
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                            {loanItems.some(l => l.isPayoffKnown)
                                ? `최단 완제: ${formatYmKorean(loanItems.filter(l => l.isPayoffKnown).sort((a, b) => a.endOffset - b.endOffset)[0].payoffYm)}`
                                : `보유 대출 ${loanItems.length}건`}
                        </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/25 border border-blue-100 dark:border-blue-900/50">
                        <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400">💰 비정기 수입 · 지출</div>
                        <div className="text-base sm:text-lg font-black text-gray-900 dark:text-white mt-0.5">
                            {cashEventItems.length}건 등록됨
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                            수입 {incomeEvents.length}건 · 지출 {expenseEvents.length}건
                        </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/25 border border-amber-100 dark:border-amber-900/50">
                        <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400">🏆 순자산 돌파 시점</div>
                        <div className="text-base sm:text-lg font-black text-gray-900 dark:text-white mt-0.5">
                            {milestoneItems.length}회 달성 예상
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                            {milestoneItems.length > 0 ? `${formatYmKorean(milestoneItems[0].startYm)} 첫 돌파` : '시뮬레이션 기간 내 탐색'}
                        </div>
                    </div>
                </div>

                {/* 3. 통합 기준축 기반 반응형 타임라인 보드 (상단 기준라인과 하위 3개 트랙 1:1 수직 정렬) */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gray-50/70 dark:bg-gray-900/50 border border-gray-200/80 dark:border-gray-700 space-y-4">
                    {/* 타임라인 헤더 */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-xs sm:text-sm font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
                            <span>📊</span>
                            <span>향후 {horizonMonths / 12}년 구간별 진행 타임라인</span>
                        </div>
                        <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500">
                            상단 기준 눈금선(수직 가이드라인)을 따라 모든 트랙이 1:1 동일한 시간 축으로 정렬됩니다
                        </span>
                    </div>

                    {/* 통합 타임라인 좌표 캔버스: 상단 기준라인(Ruler) + 수직 관통 가이드라인 + 3대 트랙 */}
                    <div className="relative rounded-xl bg-white/60 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-700/80 p-3 sm:p-4">
                        {/* 상단 마스터 기준 눈금 헤더 (하단 카드 내부 바의 좌우 여백 px-3.5와 100% 동일하게 맞춤) */}
                        <div className="sticky top-0 z-20 pb-3 mb-4 border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xs px-3.5 pt-1 rounded-t-lg">
                            {/* 눈금 라벨 행 */}
                            <div className="relative h-5 text-[10px] sm:text-[11px] font-bold text-gray-500 dark:text-gray-400">
                                {rulerCheckpoints.map((pt, i) => {
                                    const isFirst = i === 0;
                                    const isLast = i === rulerCheckpoints.length - 1;
                                    return (
                                        <span
                                            key={i}
                                            style={{ left: `${pt.pct}%` }}
                                            className={`absolute top-0 whitespace-nowrap tabular-nums ${
                                                isFirst
                                                    ? 'translate-x-0 text-indigo-600 dark:text-indigo-400 font-black'
                                                    : isLast
                                                    ? '-translate-x-full text-gray-700 dark:text-gray-200 font-extrabold'
                                                    : '-translate-x-1/2'
                                            }`}
                                        >
                                            {pt.label}
                                        </span>
                                    );
                                })}
                            </div>
                            {/* 마스터 기준 라인 & 눈금 핀 (Ticks) */}
                            <div className="relative h-2.5 mt-1 flex items-center">
                                <div className="w-full h-0.5 bg-indigo-200 dark:bg-indigo-900/80 rounded-full" />
                                {rulerCheckpoints.map((pt, i) => (
                                    <div
                                        key={i}
                                        style={{ left: `${pt.pct}%` }}
                                        className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full border-2 ${
                                            i === 0
                                                ? 'bg-indigo-600 border-white dark:border-gray-900 ring-2 ring-indigo-400/40'
                                                : 'bg-white dark:bg-gray-800 border-indigo-400 dark:border-indigo-500'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* 트랙 영역 전체를 관통하는 수직 기준 점선 (하단 카드들의 px-3.5 내부 바 좌표계와 정확히 일치) */}
                        <div className="relative space-y-5">
                            <div className="pointer-events-none absolute inset-y-0 left-3.5 right-3.5 z-0">
                                {rulerCheckpoints.map((pt, i) => (
                                    <div
                                        key={i}
                                        style={{ left: `${pt.pct}%` }}
                                        className={`absolute top-0 bottom-0 border-l ${
                                            i === 0 || i === rulerCheckpoints.length - 1
                                                ? 'border-indigo-300/60 dark:border-indigo-700/50'
                                                : 'border-dashed border-gray-300/80 dark:border-gray-700/80'
                                        }`}
                                    />
                                ))}
                            </div>

                            {/* Track 1: 분기점(Phases) */}
                            <div className="relative z-10 space-y-2">
                                <div className="text-xs font-extrabold text-gray-700 dark:text-gray-200 flex items-center gap-1.5 px-1">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                    <span>1. 타임라인 분기점 구간</span>
                                </div>
                                <div className="space-y-2">
                                    {phaseItems.map((p) => {
                                        const clampedStart = Math.max(0, Math.min(horizonMonths, p.startOffset));
                                        const clampedEnd = Math.max(clampedStart, Math.min(horizonMonths, p.endOffset));
                                        const leftPct = (clampedStart / horizonMonths) * 100;
                                        const widthPct = Math.max(2, ((clampedEnd - clampedStart) / horizonMonths) * 100);
                                        if (p.startOffset > horizonMonths) return null;

                                        return (
                                            <div
                                                key={p.id}
                                                onClick={() => setActiveItem(activeItem?.id === p.id ? null : p)}
                                                className="px-3.5 py-2.5 rounded-xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/90 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer space-y-2 shadow-2xs"
                                            >
                                                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className="font-black text-gray-900 dark:text-white">{p.title}</span>
                                                        <span className="text-[11px] text-gray-500 dark:text-gray-400 hidden sm:inline">({p.detail})</span>
                                                    </div>
                                                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 shrink-0 tabular-nums">
                                                        {formatYmKorean(p.startYm)} ~ {p.endOffset >= horizonMonths ? '계속' : formatYmKorean(p.endYm)}
                                                    </span>
                                                </div>
                                                {/* 상단 기준라인과 1:1 정렬된 타임라인 바 (내부 눈금선 포함) */}
                                                <div className="relative h-3 rounded-full bg-gray-100 dark:bg-gray-700/80 overflow-hidden">
                                                    {rulerCheckpoints.slice(1, -1).map((pt, idx) => (
                                                        <div
                                                            key={idx}
                                                            style={{ left: `${pt.pct}%` }}
                                                            className="absolute top-0 bottom-0 border-l border-dashed border-gray-300/90 dark:border-gray-600 z-10 pointer-events-none"
                                                        />
                                                    ))}
                                                    <div
                                                        className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all shadow-2xs"
                                                        style={{ left: `${leftPct}%`, width: `${Math.min(100 - leftPct, widthPct)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Track 2: 대출 상환 & 완제 해방일 */}
                            <div className="relative z-10 space-y-2">
                                <div className="text-xs font-extrabold text-gray-700 dark:text-gray-200 flex items-center gap-1.5 px-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    <span>2. 대출 상환 구간 및 100% 완제 해방일</span>
                                </div>
                                {loanItems.length > 0 ? (
                                    <div className="space-y-2">
                                        {loanItems.map((loan) => {
                                            const clampedStart = Math.max(0, Math.min(horizonMonths, loan.startOffset));
                                            const clampedEnd = Math.max(clampedStart, Math.min(horizonMonths, loan.endOffset));
                                            const leftPct = (clampedStart / horizonMonths) * 100;
                                            const widthPct = Math.max(2, ((clampedEnd - clampedStart) / horizonMonths) * 100);
                                            const isFinishedWithinHorizon = loan.isPayoffKnown && loan.endOffset <= horizonMonths;

                                            return (
                                                <div
                                                    key={loan.id}
                                                    onClick={() => setActiveItem(activeItem?.id === loan.id ? null : loan)}
                                                    className="px-3.5 py-2.5 rounded-xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/90 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all cursor-pointer space-y-2 shadow-2xs"
                                                >
                                                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                                                            <span className="font-black text-gray-900 dark:text-white flex items-center gap-1">
                                                                <span>💳</span>
                                                                <span>{loan.title}</span>
                                                            </span>
                                                            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium tabular-nums">
                                                                잔액 {formatNumber(loan.currentBalance, displayMode)}만 · 월 {formatNumber(loan.payment, displayMode)}만 ({loan.rate}%)
                                                            </span>
                                                        </div>
                                                        <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-md shrink-0 tabular-nums ${
                                                            isFinishedWithinHorizon
                                                                ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50'
                                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                                        }`}>
                                                            {loan.badge}
                                                        </span>
                                                    </div>

                                                    {/* 상단 기준라인과 1:1 정렬된 타임라인 바 */}
                                                    <div className="relative h-3 rounded-full bg-gray-100 dark:bg-gray-700/80 overflow-hidden">
                                                        {rulerCheckpoints.slice(1, -1).map((pt, idx) => (
                                                            <div
                                                                key={idx}
                                                                style={{ left: `${pt.pct}%` }}
                                                                className="absolute top-0 bottom-0 border-l border-dashed border-gray-300/90 dark:border-gray-600 z-10 pointer-events-none"
                                                            />
                                                        ))}
                                                        <div
                                                            className={`absolute top-0 bottom-0 rounded-full transition-all ${
                                                                isFinishedWithinHorizon
                                                                    ? 'bg-gradient-to-r from-teal-500 to-emerald-400'
                                                                    : 'bg-slate-400 dark:bg-slate-500'
                                                            }`}
                                                            style={{ left: `${leftPct}%`, width: `${Math.min(100 - leftPct, widthPct)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="px-3.5 py-3 rounded-xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/60 dark:border-gray-700 text-xs text-gray-400 font-bold text-center">
                                        등록된 대출 항목이 없습니다 (무차입 상태)
                                    </div>
                                )}
                            </div>

                            {/* Track 3: 비정기 목돈 수입 · 지출 이벤트 (상단 기준라인과 100% 동일한 전체 폭으로 통일) */}
                            <div className="relative z-10 space-y-2">
                                <div className="text-xs font-extrabold text-gray-700 dark:text-gray-200 flex items-center gap-1.5 px-1">
                                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                    <span>3. 비정기 목돈 수입 · 지출 일정</span>
                                </div>
                                {cashEventItems.filter(e => e.endOffset >= 0 && e.startOffset <= horizonMonths).length > 0 ? (
                                    <div className="space-y-2">
                                        {cashEventItems
                                            .filter(e => e.endOffset >= 0 && e.startOffset <= horizonMonths)
                                            .map((ev) => {
                                                const isInc = ev.eventType === 'income';
                                                const clampedStart = Math.max(0, Math.min(horizonMonths, ev.startOffset));
                                                const clampedEnd = Math.max(clampedStart, Math.min(horizonMonths, ev.endOffset));
                                                const leftPct = (clampedStart / horizonMonths) * 100;
                                                const widthPct = ev.isRange
                                                    ? Math.max(2.5, ((clampedEnd - clampedStart + 1) / horizonMonths) * 100)
                                                    : 2.5;

                                                return (
                                                    <div
                                                        key={ev.id}
                                                        onClick={() => setActiveItem(activeItem?.id === ev.id ? null : ev)}
                                                        className="px-3.5 py-2.5 rounded-xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/90 dark:border-gray-700 hover:border-blue-400 transition-all cursor-pointer space-y-2 shadow-2xs"
                                                    >
                                                        <div className="flex items-center justify-between gap-2 text-xs">
                                                            <div className="flex items-center gap-1.5 min-w-0">
                                                                <span>{isInc ? '💰' : '💸'}</span>
                                                                <span className="font-black text-gray-900 dark:text-white truncate">{ev.title}</span>
                                                                <span className="text-[11px] text-gray-400 shrink-0 tabular-nums">({formatYmKorean(ev.startYm)})</span>
                                                            </div>
                                                            <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md shrink-0 tabular-nums ${
                                                                isInc
                                                                    ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300'
                                                                    : 'bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300'
                                                            }`}>
                                                                {ev.badge}
                                                            </span>
                                                        </div>
                                                        {/* 상단 기준라인과 1:1 정렬된 전체 폭 타임라인 바 */}
                                                        <div className="relative h-3 rounded-full bg-gray-100 dark:bg-gray-700/80 overflow-hidden">
                                                            {rulerCheckpoints.slice(1, -1).map((pt, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    style={{ left: `${pt.pct}%` }}
                                                                    className="absolute top-0 bottom-0 border-l border-dashed border-gray-300/90 dark:border-gray-600 z-10 pointer-events-none"
                                                                />
                                                            ))}
                                                            <div
                                                                className={`absolute top-0 bottom-0 rounded-full ${isInc ? 'bg-blue-500' : 'bg-rose-500'}`}
                                                                style={{ left: `${Math.min(97.5, leftPct)}%`, width: `${Math.min(100 - leftPct, widthPct)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                ) : (
                                    <div className="px-3.5 py-3 rounded-xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/60 dark:border-gray-700 text-xs text-gray-400 font-bold text-center">
                                        조회 구간 내 예정된 비정기 수입·지출 이벤트가 없습니다.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 선택된 항목 상세 액션 바 */}
                    {activeItem && (
                        <div className="p-3.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-0.5">
                                <div className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-2">
                                    <span>📌 {activeItem.title}</span>
                                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">({activeItem.badge})</span>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-300">{activeItem.detail}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                {activeItem.category === 'phase' && activeItem.originalIdx !== null && onStartEditingPhase && (
                                    <button
                                        type="button"
                                        disabled={editingPhase !== null}
                                        onClick={() => onStartEditingPhase(activeItem.originalIdx)}
                                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
                                    >
                                        이 분기점 상세 편집
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setActiveItem(null)}
                                    className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-gray-800 text-gray-500 text-xs font-bold border border-gray-200 dark:border-gray-700 cursor-pointer"
                                >
                                    닫기
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 4. 다가오는 순서로 본 주요 일정 카드 그리드 */}
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h4 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                                <span>🗓️</span> 다가오는 순서로 본 내 미래의 굵직한 이벤트
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                현재부터 시간순으로 정렬된 주요 재무 일정입니다.
                            </p>
                        </div>

                        {/* 카테고리 필터 */}
                        <div className="flex flex-wrap items-center gap-1.5">
                            {[
                                { id: 'all', label: `전체 (${chronologicalRoadmap.length})` },
                                { id: 'phase', label: '⏳ 분기점' },
                                { id: 'loan', label: '🎉 대출 완제' },
                                { id: 'event', label: '💰 수입·지출' },
                                { id: 'milestone', label: '🏆 자산 돌파' }
                            ].map(f => (
                                <button
                                    key={f.id}
                                    type="button"
                                    onClick={() => setSelectedFilter(f.id)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        selectedFilter === f.id
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700/70 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {visibleChrono.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {visibleChrono.map((item) => {
                                    const style = toneStyleMap[item.tone] || toneStyleMap.indigo;
                                    return (
                                        <div
                                            key={item.id}
                                            className={`p-4 rounded-xl bg-gray-50/70 dark:bg-gray-900/50 border ${style.border} flex flex-col justify-between gap-2.5`}
                                        >
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${style.badge}`}>
                                                        {item.icon} {item.categoryLabel}
                                                    </span>
                                                    <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400">
                                                        {formatYmKorean(item.ym)} ({formatRelativeOffset(item.offset)})
                                                    </span>
                                                </div>
                                                <div className="text-sm font-black text-gray-900 dark:text-white leading-snug">
                                                    {item.title}
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                                    {item.subtitle}
                                                </p>
                                            </div>

                                            <div className="pt-2 border-t border-gray-200/70 dark:border-gray-700/70 flex items-center justify-between text-xs">
                                                <span className={`font-black ${style.impact}`}>
                                                    {item.impactBadge}
                                                </span>
                                                {item.netWorth !== null && item.netWorth !== undefined ? (
                                                    <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 tabular-nums">
                                                        예상 순자산: <b className="text-gray-800 dark:text-gray-200">{formatNumber(item.netWorth, displayMode)}만</b>
                                                    </span>
                                                ) : item.fallbackRightLabel ? (
                                                    <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                                                        {item.fallbackRightLabel}
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {hiddenChronoCount > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setIsChronoExpanded(prev => !prev)}
                                    className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200/70 dark:bg-gray-700/60 dark:hover:bg-gray-700 text-xs font-extrabold text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
                                >
                                    {isChronoExpanded ? '▲ 주요 일정 6개만 보기 (접기)' : `▼ 나머지 ${hiddenChronoCount}개 미래 일정 더 보기 (전체 ${filteredRoadmap.length}개)`}
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="py-8 text-center text-xs text-gray-400 font-bold">
                            선택한 조건에 해당하는 미래 이벤트가 없습니다.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
