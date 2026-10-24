import React, { useState, useMemo } from 'react';

// 월 복리 미래가치(FV) 계산 함수 (초기자산 pv, 월저축 pmt, 연수익률 annualRatePct, 개월수 months)
function calcFutureNetWorth(pv, pmt, annualRatePct, months) {
    if (months <= 0) return pv;
    const r = (Number(annualRatePct) || 0) / 100 / 12;
    if (Math.abs(r) < 1e-7) {
        return pv + pmt * months;
    }
    const compoundFactor = Math.pow(1 + r, months);
    return pv * compoundFactor + pmt * ((compoundFactor - 1) / r);
}

// 목표 미래가치(targetFv) 달성에 필요한 월 추가 저축액(deltaPmt) 역산
function solveRequiredExtraSavings(pv, currentPmt, annualRatePct, months, targetFv) {
    if (months <= 0) return Math.max(0, targetFv - pv);
    const currentFv = calcFutureNetWorth(pv, currentPmt, annualRatePct, months);
    const gap = targetFv - currentFv;
    if (gap <= 0) return 0;

    const r = (Number(annualRatePct) || 0) / 100 / 12;
    if (Math.abs(r) < 1e-7) {
        return gap / months;
    }
    const annuityFactor = (Math.pow(1 + r, months) - 1) / r;
    return annuityFactor > 0 ? gap / annuityFactor : gap / months;
}

// 목표 미래가치(targetFv) 달성에 필요한 연평균 수익률(%) 이진 탐색 역산
function solveRequiredAnnualRate(pv, pmt, months, targetFv) {
    if (months <= 0 || targetFv <= pv) return 0;
    let low = -20;
    let high = 100;
    for (let i = 0; i < 60; i++) {
        const mid = (low + high) / 2;
        const fv = calcFutureNetWorth(pv, pmt, mid, months);
        if (fv < targetFv) {
            low = mid;
        } else {
            high = mid;
        }
    }
    return (low + high) / 2;
}

const GOAL_AMOUNT_PRESETS = [
    { label: '1억 원', val: 10000 },
    { label: '2억 원', val: 20000 },
    { label: '3억 원', val: 30000 },
    { label: '5억 원', val: 50000 },
    { label: '7억 원', val: 70000 },
    { label: '10억 원', val: 100000 }
];

const HORIZON_PRESETS = [
    { label: '1년 (12개월)', months: 12 },
    { label: '2년 (24개월)', months: 24 },
    { label: '3년 (36개월)', months: 36 },
    { label: '5년 (60개월)', months: 60 },
    { label: '7년 (84개월)', months: 84 },
    { label: '10년 (120개월)', months: 120 }
];

export default function ReverseGoalSolver({
    monthlySalary = 0,
    currentAppData = null,
    currentCalculation = null
}) {
    // 현재 사용자의 재무 기초 스펙 추출
    const baseMetrics = useMemo(() => {
        const netWorth = Math.round(Number(currentCalculation?.currentNet) || 0);
        const grossWorth = Math.round(Number(currentCalculation?.currentTotal) || 0);
        const salary = Number(monthlySalary || currentAppData?.monthlySalary) || 350;
        const totalExpense = Math.round(Number(currentCalculation?.totalMonthlyExpense) || 150);
        const monthlySurplus = Math.max(0, salary - totalExpense);

        // 포트폴리오 가중평균 수익률 계산
        let weightedRateSum = 0;
        let assetSum = 0;
        const assets = currentAppData?.assets || {};
        Object.keys(assets).forEach(sec => {
            if (sec === 'loan') return;
            (assets[sec] || []).forEach(a => {
                const amt = Number(a.amount) || 0;
                const rate = Number(a.rate) || 0;
                if (amt > 0) {
                    weightedRateSum += amt * rate;
                    assetSum += amt;
                }
            });
        });
        const avgReturnRate = assetSum > 0
            ? Number((weightedRateSum / assetSum).toFixed(2))
            : 6.0;

        // 현재 순자산보다 한 단계 높은 라운드 넘버를 기본 목표액으로 추천
        const defaultGoal = GOAL_AMOUNT_PRESETS.find(p => p.val > netWorth * 1.3)?.val
            || Math.ceil((netWorth + 10000) / 10000) * 10000;

        return {
            netWorth,
            grossWorth,
            salary,
            totalExpense,
            monthlySurplus,
            avgReturnRate,
            defaultGoal
        };
    }, [monthlySalary, currentAppData, currentCalculation]);

    const [goalAmount, setGoalAmount] = useState(() => baseMetrics.defaultGoal || 30000);
    const [targetMonths, setTargetMonths] = useState(36); // 기본 3년(36개월)
    const [savingsMixRatioPct, setSavingsMixRatioPct] = useState(50); // 하이브리드 플랜에서 저축 분담 비중 (0~100%)

    // 역산(Reverse Engineering) 시뮬레이션 결과
    const solverResult = useMemo(() => {
        const pv = baseMetrics.netWorth;
        const pmt = baseMetrics.monthlySurplus;
        const rNow = baseMetrics.avgReturnRate;
        const n = Math.max(1, Number(targetMonths) || 36);
        const target = Math.max(pv + 100, Number(goalAmount) || 30000);

        // 현재 속도 유지 시 n개월 뒤 예상 순자산
        const baselineFv = Math.round(calcFutureNetWorth(pv, pmt, rNow, n));
        const shortfall = Math.max(0, target - baselineFv);
        const isAlreadyAchievable = shortfall <= 0;

        // [플랜 A] 수익률 고정, 월 추가 저축액만으로 돌파
        const planAExtraSavings = Math.ceil(solveRequiredExtraSavings(pv, pmt, rNow, n, target));
        const planATotalSavings = pmt + planAExtraSavings;
        const planASavingsRateOfSalary = baseMetrics.salary > 0
            ? ((planATotalSavings / baseMetrics.salary) * 100).toFixed(1)
            : '0.0';

        // [플랜 B] 월 저축액 고정, 포트폴리오 수익률 상향만으로 돌파
        const planBRequiredRate = solveRequiredAnnualRate(pv, pmt, n, target);
        const planBRateDelta = Math.max(0, planBRequiredRate - rNow);

        // [플랜 C] 하이브리드 조합 (저축 분담률 savingsMixRatioPct% + 나머지는 수익률로 해결)
        const mixRatio = Math.max(0, Math.min(100, Number(savingsMixRatioPct) || 0)) / 100;
        let planCExtraSavings = 0;
        let planCTotalSavings = pmt;
        let planCRequiredRate = planBRequiredRate;
        let planCRateDelta = planBRateDelta;

        if (mixRatio <= 0.001) {
            // 저축 증액 0%: 온전히 투자 수익률로만 달성 (솔루션 2와 100% 일치)
            planCExtraSavings = 0;
            planCTotalSavings = pmt;
            planCRequiredRate = planBRequiredRate;
            planCRateDelta = planBRateDelta;
        } else if (mixRatio >= 0.999) {
            // 저축 증액 100%: 온전히 저축액만 늘려 달성 (솔루션 1과 100% 일치)
            planCExtraSavings = planAExtraSavings;
            planCTotalSavings = planATotalSavings;
            planCRequiredRate = rNow;
            planCRateDelta = 0;
        } else {
            planCExtraSavings = Math.round(planAExtraSavings * mixRatio);
            planCTotalSavings = pmt + planCExtraSavings;
            planCRequiredRate = solveRequiredAnnualRate(pv, planCTotalSavings, n, target);
            planCRateDelta = Math.max(0, planCRequiredRate - rNow);
        }

        // 연차별(또는 주요 구간별) 현재 궤적 vs 역산 목표 궤적 비교 데이터
        const checkpoints = [];
        const stepMonths = n <= 24 ? 6 : 12;
        for (let m = stepMonths; m <= n; m += stepMonths) {
            checkpoints.push({
                month: m,
                label: m % 12 === 0 ? `${m / 12}년차 (${m}개월)` : `${m}개월 뒤`,
                baseVal: Math.round(calcFutureNetWorth(pv, pmt, rNow, m)),
                targetVal: Math.round(calcFutureNetWorth(pv, planCTotalSavings, planCRequiredRate, m))
            });
        }
        if (checkpoints.length === 0 || checkpoints[checkpoints.length - 1].month !== n) {
            checkpoints.push({
                month: n,
                label: `${n}개월 뒤 (목표일)`,
                baseVal: baselineFv,
                targetVal: target
            });
        }

        return {
            pv,
            pmt,
            rNow,
            n,
            target,
            baselineFv,
            shortfall,
            isAlreadyAchievable,
            planAExtraSavings,
            planATotalSavings,
            planASavingsRateOfSalary,
            planBRequiredRate: Number(planBRequiredRate.toFixed(2)),
            planBRateDelta: Number(planBRateDelta.toFixed(2)),
            planCExtraSavings,
            planCTotalSavings,
            planCRequiredRate: Number(planCRequiredRate.toFixed(2)),
            planCRateDelta: Number(planCRateDelta.toFixed(2)),
            checkpoints
        };
    }, [baseMetrics, goalAmount, targetMonths, savingsMixRatioPct]);

    const formatManWon = (val) => {
        const num = Math.round(Number(val) || 0);
        if (Math.abs(num) >= 10000) {
            const eok = Math.floor(Math.abs(num) / 10000);
            const rem = Math.abs(num) % 10000;
            return `${num < 0 ? '-' : ''}${eok}억${rem > 0 ? ` ${rem.toLocaleString()}만` : ''}원`;
        }
        return `${num.toLocaleString()}만원`;
    };

    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            {/* 상단 헤더 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 shadow-xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 border border-purple-300 dark:border-purple-700/50 text-purple-800 dark:text-purple-300 text-[10px] font-black">
                                목표 달성 계산기
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold tabular-nums">
                                현재 순자산 {formatManWon(baseMetrics.netWorth)} · 월 잉여저축 {baseMetrics.monthlySurplus.toLocaleString()}만원
                            </span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
                            <span>🎯</span> 목표 순자산 달성 계산기: "N년 뒤 M억 모으려면?"
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            현재 속도대로 모았을 때의 결과를 기다리는 대신, <b>내가 원하는 기한과 목표 금액을 먼저 설정하고 오늘 당장 바꿔야 할 저축액·수익률 조합을 계산</b>합니다.
                        </p>
                    </div>

                    {/* 현재 궤적 vs 목표 격차 요약 박스 */}
                    <div className="bg-white dark:bg-gray-900 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
                        <div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                                현재 속도 유지 시 {solverResult.n}개월 뒤 예상
                            </div>
                            <div className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 mt-0.5 tabular-nums">
                                {formatManWon(solverResult.baselineFv)}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 tabular-nums">
                                목표 {formatManWon(solverResult.target)} 대비{' '}
                                {solverResult.isAlreadyAchievable ? (
                                    <span className="text-emerald-600 dark:text-emerald-400 font-black">현재 속도로도 초과 달성!</span>
                                ) : (
                                    <span className="text-rose-500 font-black">-{formatManWon(solverResult.shortfall)} 부족</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 1. 목표 금액 & 목표 기한 설정 바 */}
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-2xs space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* 목표 순자산 선택 */}
                    <div className="space-y-2.5">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-black text-slate-700 dark:text-slate-200">
                                💰 달성하고 싶은 목표 순자산
                            </label>
                            <div className="flex items-center gap-1.5">
                                <input
                                    type="number"
                                    step="1000"
                                    value={goalAmount}
                                    onChange={(e) => setGoalAmount(Number(e.target.value))}
                                    className="w-28 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-right text-xs font-black text-indigo-600 dark:text-indigo-400 tabular-nums"
                                />
                                <span className="text-xs font-bold text-slate-500">만원 ({formatManWon(goalAmount)})</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                            {GOAL_AMOUNT_PRESETS.map(p => (
                                <button
                                    key={p.val}
                                    type="button"
                                    onClick={() => setGoalAmount(p.val)}
                                    className={`py-2 px-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                                        Number(goalAmount) === p.val
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs'
                                            : 'bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400'
                                    }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 목표 달성 기한 선택 */}
                    <div className="space-y-2.5">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-black text-slate-700 dark:text-slate-200">
                                ⏳ 목표 달성 기한 (개월 수)
                            </label>
                            <div className="flex items-center gap-1.5">
                                <input
                                    type="number"
                                    min="6"
                                    max="360"
                                    value={targetMonths}
                                    onChange={(e) => setTargetMonths(Number(e.target.value))}
                                    className="w-20 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-right text-xs font-black text-indigo-600 dark:text-indigo-400 tabular-nums"
                                />
                                <span className="text-xs font-bold text-slate-500">개월 ({(targetMonths / 12).toFixed(1)}년)</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                            {HORIZON_PRESETS.map(h => (
                                <button
                                    key={h.months}
                                    type="button"
                                    onClick={() => setTargetMonths(h.months)}
                                    className={`py-2 px-1.5 rounded-xl text-[11px] font-black border transition-all cursor-pointer ${
                                        Number(targetMonths) === h.months
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs'
                                            : 'bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400'
                                    }`}
                                >
                                    {h.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. 역산된 3가지 달성 솔루션 카드 */}
            {solverResult.isAlreadyAchievable ? (
                <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-center space-y-2">
                    <div className="text-2xl">🎉</div>
                    <h3 className="text-base font-black text-emerald-800 dark:text-emerald-300">
                        현재 저축액({solverResult.pmt.toLocaleString()}만원/월)과 수익률({solverResult.rNow}%)만 유지해도 {solverResult.n}개월 내에 목표({formatManWon(solverResult.target)})를 거뜬히 돌파합니다!
                    </h3>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                        더 높은 목표 금액을 선택하거나 달성 기한을 앞당겨서 역산해 보세요.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* 플랜 A: 저축/절약 단독 돌파 */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 shadow-2xs flex flex-col justify-between space-y-4">
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-[10px] font-black">
                                    솔루션 1 · 현금흐름 정공법
                                </span>
                                <span className="text-[11px] text-slate-400 font-bold">수익률 {solverResult.rNow}% 고정</span>
                            </div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white mt-2">
                                💪 저축·지출절감 단독 돌파
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                투자 위험을 더 지지 않고, 순수하게 월 저축액(또는 부수입·절약)만 늘려서 {solverResult.n}개월 뒤 목표를 맞추는 방법입니다.
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-gray-900 border border-slate-200/70 dark:border-gray-700 space-y-2">
                            <div className="text-[11px] font-bold text-slate-500">매월 추가로 더 모아야 할 금액</div>
                            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                                월 +{solverResult.planAExtraSavings.toLocaleString()}만원
                            </div>
                            <div className="text-[11px] text-slate-500 font-bold tabular-nums pt-1 border-t border-slate-200/60 dark:border-gray-700">
                                월 저축액: {solverResult.pmt.toLocaleString()}만 ➔ <b>{solverResult.planATotalSavings.toLocaleString()}만원</b> (월급의 {solverResult.planASavingsRateOfSalary}%)
                            </div>
                        </div>
                    </div>

                    {/* 플랜 B: 투자 수익률 단독 돌파 */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 shadow-2xs flex flex-col justify-between space-y-4">
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-[10px] font-black">
                                    솔루션 2 · 수익률 극대화
                                </span>
                                <span className="text-[11px] text-slate-400 font-bold">월저축 {solverResult.pmt}만 고정</span>
                            </div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white mt-2">
                                📈 포트폴리오 수익률 단독 돌파
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                현재 월 저축액을 1원도 늘리지 않고, 오직 자산 배분 리밸런싱과 투자 수익률 상향만으로 목표를 돌파하는 조건입니다.
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-gray-900 border border-slate-200/70 dark:border-gray-700 space-y-2">
                            <div className="text-[11px] font-bold text-slate-500">필요한 연평균 복합 수익률</div>
                            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
                                연 {solverResult.planBRequiredRate}%
                                <span className="text-xs font-extrabold ml-1.5 text-rose-500">
                                    (+{solverResult.planBRateDelta}%p 상향)
                                </span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-bold tabular-nums pt-1 border-t border-slate-200/60 dark:border-gray-700">
                                현재 기대수익률 연 {solverResult.rNow}% ➔ <b>연 {solverResult.planBRequiredRate}%</b>
                            </div>
                        </div>
                    </div>

                    {/* 플랜 C: 저축 증액 + 수익률 개선 맞춤 배분 */}
                    <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border-2 border-indigo-500 dark:border-indigo-500/80 shadow-xs flex flex-col justify-between space-y-4">
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-black">
                                    ⭐ 맞춤 솔루션 3 · 황금 배분
                                </span>
                                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-black tabular-nums">
                                    저축 증액 {savingsMixRatioPct}% : 투자 수익률 {100 - savingsMixRatioPct}%
                                </span>
                            </div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white mt-2">
                                ⚖️ 저축 증액 + 수익률 개선 맞춤 배분
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                                저축 증액 비중 슬라이더(0%~100%)로 내가 감당할 수 있는 <b>추가 저축액</b>과 <b>목표 수익률</b>의 현실적 비율을 직접 조절하세요.
                            </p>
                        </div>

                        <div className="space-y-3 bg-white dark:bg-gray-900 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/60">
                            <div>
                                <div className="flex justify-between text-[10px] font-black text-slate-500 mb-1.5">
                                    <span className={savingsMixRatioPct === 0 ? 'text-indigo-600 dark:text-indigo-400 font-black' : ''}>
                                        투자수익 100% (저축 0%)
                                    </span>
                                    <span className="text-indigo-600 dark:text-indigo-400 font-black tabular-nums">
                                        저축 증액 비중 {savingsMixRatioPct}%
                                    </span>
                                    <span className={savingsMixRatioPct === 100 ? 'text-indigo-600 dark:text-indigo-400 font-black' : ''}>
                                        저축 100% (수익률 변동 0%)
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="5"
                                    value={savingsMixRatioPct}
                                    onChange={(e) => setSavingsMixRatioPct(Number(e.target.value))}
                                    className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 dark:bg-gray-700 rounded-lg"
                                />
                                {/* 빠른 비율 선택 칩 */}
                                <div className="flex flex-wrap items-center justify-between gap-1 mt-2">
                                    {[
                                        { label: '수익 100% (저축 0%)', val: 0 },
                                        { label: '저축 30%', val: 30 },
                                        { label: '반반 50:50', val: 50 },
                                        { label: '저축 70%', val: 70 },
                                        { label: '저축 100% (수익 0%)', val: 100 }
                                    ].map(chip => (
                                        <button
                                            key={chip.val}
                                            type="button"
                                            onClick={() => setSavingsMixRatioPct(chip.val)}
                                            className={`px-2 py-1 rounded-md text-[10px] font-extrabold border transition-all cursor-pointer ${
                                                savingsMixRatioPct === chip.val
                                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                                    : 'bg-slate-50 dark:bg-gray-800 border-slate-200 dark:border-gray-700 text-slate-500 hover:border-indigo-300'
                                            }`}
                                        >
                                            {chip.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <div className={`p-2.5 rounded-lg border transition-all ${
                                    savingsMixRatioPct === 0
                                        ? 'bg-indigo-50/50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700'
                                        : 'bg-slate-50 dark:bg-gray-800 border-slate-200/60 dark:border-gray-700'
                                }`}>
                                    <div className="text-[10px] font-bold text-slate-400">월 추가 저축</div>
                                    <div className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
                                        {solverResult.planCExtraSavings === 0 ? '+0원 (증액 없음)' : `+${solverResult.planCExtraSavings.toLocaleString()}만/월`}
                                    </div>
                                    <div className="text-[10px] text-slate-400 tabular-nums mt-0.5">
                                        총 {solverResult.planCTotalSavings.toLocaleString()}만/월 (기존 저축 유지)
                                    </div>
                                </div>
                                <div className={`p-2.5 rounded-lg border transition-all ${
                                    savingsMixRatioPct === 0
                                        ? 'bg-amber-50/50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700'
                                        : 'bg-slate-50 dark:bg-gray-800 border-slate-200/60 dark:border-gray-700'
                                }`}>
                                    <div className="text-[10px] font-bold text-slate-400">필요 연 수익률</div>
                                    <div className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400 tabular-nums mt-0.5">
                                        연 {solverResult.planCRequiredRate}%
                                    </div>
                                    <div className="text-[10px] text-slate-400 tabular-nums mt-0.5">
                                        현재 대비 {solverResult.planCRateDelta >= 0 ? `+${solverResult.planCRateDelta}%p` : `${solverResult.planCRateDelta}%p`}
                                    </div>
                                </div>
                            </div>

                            {savingsMixRatioPct === 0 && (
                                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] font-bold text-amber-800 dark:text-amber-300 text-center">
                                    💡 저축 증액 0%로 설정되어 좌측의 <b>솔루션 2(수익률 단독 돌파)와 100% 동일</b>하게 동작합니다.
                                </div>
                            )}
                            {savingsMixRatioPct === 100 && (
                                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 text-center">
                                    💡 저축 증액 100%로 설정되어 좌측의 <b>솔루션 1(저축 단독 돌파)과 100% 동일</b>하게 동작합니다.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 3. 구간별 현재 궤적 vs 역산 목표 궤적 비교표 */}
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-2xs space-y-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>📈</span> 구간별 순자산 궤적 비교 (현재 속도 vs 맞춤 배분 플랜)
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-gray-700 text-[11px] text-slate-400 font-black">
                                <th className="py-2.5 px-3">경과 시점</th>
                                <th className="py-2.5 px-3 text-right">현재 속도 유지 시</th>
                                <th className="py-2.5 px-3 text-right">추천 플랜 적용 시</th>
                                <th className="py-2.5 px-3 text-right">누적 자산 격차</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-gray-700/60 font-bold">
                            {solverResult.checkpoints.map(cp => {
                                const diff = cp.targetVal - cp.baseVal;
                                return (
                                    <tr key={cp.month} className="hover:bg-slate-50 dark:hover:bg-gray-900/40">
                                        <td className="py-2.5 px-3 font-black text-slate-800 dark:text-slate-100">
                                            {cp.label}
                                        </td>
                                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-500">
                                            {formatManWon(cp.baseVal)}
                                        </td>
                                        <td className="py-2.5 px-3 text-right tabular-nums font-black text-indigo-600 dark:text-indigo-400">
                                            {formatManWon(cp.targetVal)}
                                        </td>
                                        <td className="py-2.5 px-3 text-right tabular-nums font-black text-emerald-600 dark:text-emerald-400">
                                            {diff >= 0 ? `+${formatManWon(diff)}` : formatManWon(diff)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
