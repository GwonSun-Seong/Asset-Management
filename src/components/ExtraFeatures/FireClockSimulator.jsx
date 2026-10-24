import React, { useState, useMemo } from 'react';

const SWR_OPTIONS = [
    { rate: 3.0, label: '3.0% (초보수적 • 연지출 33.3배)', desc: '초장기 은퇴(40년+) 원금 보존 극대화' },
    { rate: 3.5, label: '3.5% (안전형 • 연지출 28.6배)', desc: '인플레이션 및 하락장 방어형' },
    { rate: 4.0, label: '4.0% (표준 4% 룰 • 연지출 25배)', desc: '트리니티 연구 표준 은퇴 공식' },
    { rate: 4.5, label: '4.5% (배당/적극형 • 연지출 22.2배)', desc: '배당·연금 캐시플로우 중심 인출' }
];

export default function FireClockSimulator({
    monthlySalary = 0,
    currentAppData = null,
    currentCalculation = null,
    addToast = null
}) {
    const [swrRate, setSwrRate] = useState(4.0); // 안전인출률 (%)
    const [baristaMonthlyIncome, setBaristaMonthlyIncome] = useState(100); // 바리스타 FIRE 월 부수입 (만원)
    const [extraMonthlySaving, setExtraMonthlySaving] = useState(0); // 월 추가 저축 부스터 (만원)
    const [customBaseExpense, setCustomBaseExpense] = useState(null); // null이면 앱의 실제 지출 사용

    const baseMetrics = useMemo(() => {
        const netWorth = Number(currentCalculation?.currentNet) || 0;
        const grossWorth = Number(currentCalculation?.currentTotal) || 0;
        const salary = Number(monthlySalary || currentAppData?.monthlySalary) || 350;
        const appExpense = Number(currentCalculation?.totalMonthlyExpense || currentAppData?.monthlyExpenses) || 180;
        const activeExpense = customBaseExpense !== null ? customBaseExpense : Math.max(50, Math.round(appExpense));
        const monthlySurplus = Math.max(0, salary - activeExpense) + extraMonthlySaving;

        // 포트폴리오 가중평균 수익률 산출
        let weightedRateSum = 0;
        let assetSum = 0;
        if (currentAppData?.assets) {
            Object.keys(currentAppData.assets).forEach(sec => {
                if (sec === 'loan') return;
                (currentAppData.assets[sec] || []).forEach(a => {
                    const amt = Number(a.amount) || 0;
                    const rate = Number(a.rate) || 0;
                    if (amt > 0) {
                        weightedRateSum += amt * rate;
                        assetSum += amt;
                    }
                });
            });
        }
        const avgReturnRate = assetSum > 0
            ? Math.max(4.0, Math.min(15.0, weightedRateSum / assetSum))
            : 7.5;

        // 지금 당장 은퇴할 경우 현재 순자산에서 매월 꺼내 쓸 수 있는 안전 인출액
        const currentSafeMonthlyWithdrawal = Math.max(0, Math.round((netWorth * (swrRate / 100)) / 12 * 10) / 10);
        const currentExpenseCoveragePct = activeExpense > 0
            ? Math.min(200, Math.round((currentSafeMonthlyWithdrawal / activeExpense) * 1000) / 10)
            : 0;

        return {
            netWorth,
            grossWorth,
            salary,
            appExpense: Math.round(appExpense),
            activeExpense,
            monthlySurplus,
            avgReturnRate,
            currentSafeMonthlyWithdrawal,
            currentExpenseCoveragePct
        };
    }, [monthlySalary, currentAppData, currentCalculation, customBaseExpense, extraMonthlySaving, swrRate]);

    // 특정 목표 시드(만원)에 도달하기까지 걸리는 개월 수 계산 (실제 monthlyProjections + 복리 방정식 결합)
    const calcMonthsToTarget = (targetSeed, useBooster = true) => {
        const netNow = baseMetrics.netWorth;
        if (targetSeed <= netNow) return 0;

        const projections = currentCalculation?.monthlyProjections || [];
        const monthlyReturn = (baseMetrics.avgReturnRate / 100) / 12;

        // 부스터 미적용 & 기본 지출 그대로일 때는 앱의 정밀 월별 시뮬레이션(대출 상환 스케줄 반영) 우선 탐색
        if (!useBooster || (extraMonthlySaving === 0 && customBaseExpense === null)) {
            if (projections.length > 0) {
                const foundIdx = projections.findIndex(p => Number(p.netWorth) >= targetSeed);
                if (foundIdx !== -1) return foundIdx + 1;
            }
        }

        // 복리 적립 시뮬레이션 (최대 600개월 = 50년)
        let simNet = netNow;
        const baseSurplus = Math.max(10, (baseMetrics.salary - baseMetrics.activeExpense) + (useBooster ? extraMonthlySaving : 0));
        for (let m = 1; m <= 600; m++) {
            simNet = simNet * (1 + monthlyReturn) + baseSurplus;
            if (simNet >= targetSeed) return m;
        }
        return 601; // 50년 초과
    };

    // 4대 FIRE 모델 시뮬레이션 결과
    const fireModels = useMemo(() => {
        const mult = 12 / (swrRate / 100); // 예: SWR 4% -> 월지출 * 300배 (연지출 25배)
        const exp = baseMetrics.activeExpense;

        const definitions = [
            {
                id: 'lean',
                name: 'Lean FIRE',
                krName: '미니멀 생존 은퇴',
                icon: '🌱',
                badge: '최단기 탈출',
                color: 'emerald',
                desc: '필수 생존비(현재 지출의 70%)만 자산 인출로 충당하는 가장 빠른 은퇴',
                monthlyRequiredExpense: Math.round(exp * 0.7),
                monthlyNetWithdrawalNeeded: Math.round(exp * 0.7)
            },
            {
                id: 'barista',
                name: 'Barista FIRE',
                krName: '사이드잡 반은퇴',
                icon: '☕',
                badge: `월 부수입 ${baristaMonthlyIncome}만 결합`,
                color: 'amber',
                desc: `스트레스 없는 일로 월 ${baristaMonthlyIncome}만원을 벌고 부족분만 자산에서 인출`,
                monthlyRequiredExpense: exp,
                monthlyNetWithdrawalNeeded: Math.max(10, exp - baristaMonthlyIncome)
            },
            {
                id: 'regular',
                name: 'Regular FIRE',
                krName: '표준 완전 은퇴',
                icon: '🔥',
                badge: '정석 FIRE',
                color: 'indigo',
                desc: '현재의 생활 수준(월 지출 100%)을 근로소득 없이 영구 유지하는 완전 은퇴',
                monthlyRequiredExpense: exp,
                monthlyNetWithdrawalNeeded: exp
            },
            {
                id: 'fat',
                name: 'Fat FIRE',
                krName: '풍요 럭셔리 은퇴',
                icon: '👑',
                badge: '여유로운 삶',
                color: 'violet',
                desc: '현재 생활비의 150%를 매년 여행·취미와 함께 넉넉히 누리는 상위 은퇴',
                monthlyRequiredExpense: Math.round(exp * 1.5),
                monthlyNetWithdrawalNeeded: Math.round(exp * 1.5)
            }
        ];

        return definitions.map(model => {
            const targetSeed = Math.round(model.monthlyNetWithdrawalNeeded * mult);
            const remainingAmount = Math.max(0, targetSeed - Math.round(baseMetrics.netWorth));
            const progressPct = targetSeed > 0
                ? Math.min(100, Math.max(0, Math.round((baseMetrics.netWorth / targetSeed) * 1000) / 10))
                : 100;

            const monthsWithBooster = calcMonthsToTarget(targetSeed, true);
            const monthsWithoutBooster = calcMonthsToTarget(targetSeed, false);
            const monthsSaved = Math.max(0, monthsWithoutBooster - monthsWithBooster);

            const yearsLeft = Math.floor(monthsWithBooster / 12);
            const remMonthsLeft = monthsWithBooster % 12;

            let timeLabel = '';
            if (monthsWithBooster === 0) {
                timeLabel = '🎉 이미 달성 완료! (즉시 은퇴 가능)';
            } else if (monthsWithBooster > 600) {
                timeLabel = '50년 이상 소요 (저축률/수익률 상향 필요)';
            } else if (yearsLeft > 0) {
                timeLabel = `약 ${yearsLeft}년 ${remMonthsLeft}개월 뒤 (${monthsWithBooster}개월)`;
            } else {
                timeLabel = `약 ${remMonthsLeft}개월 뒤`;
            }

            return {
                ...model,
                targetSeed,
                remainingAmount,
                progressPct,
                monthsToGoal: monthsWithBooster,
                monthsSaved,
                timeLabel,
                isAchieved: monthsWithBooster === 0
            };
        });
    }, [baseMetrics, swrRate, baristaMonthlyIncome, extraMonthlySaving]);

    const colorThemes = {
        emerald: {
            border: 'border-emerald-500/30 dark:border-emerald-500/40',
            bg: 'bg-emerald-500/5 dark:bg-emerald-950/20',
            badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
            bar: 'bg-emerald-500',
            text: 'text-emerald-600 dark:text-emerald-400'
        },
        amber: {
            border: 'border-amber-500/30 dark:border-amber-500/40',
            bg: 'bg-amber-500/5 dark:bg-amber-950/20',
            badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
            bar: 'bg-amber-500',
            text: 'text-amber-600 dark:text-amber-400'
        },
        indigo: {
            border: 'border-indigo-500/30 dark:border-indigo-500/40',
            bg: 'bg-indigo-500/5 dark:bg-indigo-950/20',
            badge: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300',
            bar: 'bg-indigo-600',
            text: 'text-indigo-600 dark:text-indigo-400'
        },
        violet: {
            border: 'border-violet-500/30 dark:border-violet-500/40',
            bg: 'bg-violet-500/5 dark:bg-violet-950/20',
            badge: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
            bar: 'bg-violet-600',
            text: 'text-violet-600 dark:text-violet-400'
        }
    };

    const formatManWon = (val) => {
        const n = Math.round(Number(val) || 0);
        if (n >= 10000) {
            const eok = Math.floor(n / 10000);
            const man = n % 10000;
            return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`;
        }
        return `${n.toLocaleString()}만원`;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* 상단 요약 카드 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-gray-800/90 border border-slate-200 dark:border-gray-700 shadow-xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700/50 text-amber-800 dark:text-amber-300 text-[10px] font-black">
                                은퇴 시점 시뮬레이터
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                                연간 안전인출률 {swrRate}% • 기대복리 연 {baseMetrics.avgReturnRate.toFixed(1)}%
                            </span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
                            <span>🔥</span> 4단계 은퇴 시계 (절약 · 바리스타 · 표준 · 여유)
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            단 하나의 목표액이 아닌, 내 목표 생활비와 은퇴 후 부수입에 맞춘 4가지 은퇴 모델별 필요 자금과 달성 시점을 비교합니다.
                        </p>
                    </div>

                    {/* 지금 당장 은퇴 시 월 안전 인출 가능액 카드 */}
                    <div className="bg-white dark:bg-gray-900 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
                        <div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                                지금 당장 은퇴 시 평생 월 안전 인출액
                            </div>
                            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                                월 {baseMetrics.currentSafeMonthlyWithdrawal.toLocaleString()}만원
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                                현재 순자산 {formatManWon(baseMetrics.netWorth)} × 연 {swrRate}% ÷ 12개월
                            </div>
                        </div>
                        <div className="pl-0 sm:pl-4 sm:border-l border-slate-200 dark:border-gray-700 text-left sm:text-right">
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">현재 생활비 충당률</div>
                            <div className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400">
                                {baseMetrics.currentExpenseCoveragePct}%
                            </div>
                            <div className="text-[10px] text-slate-400">
                                (기준 월지출 {baseMetrics.activeExpense}만원)
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 컨트롤러 패널 (안전인출률 선택 + 바리스타 소득 + 저축 부스터) */}
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-xs space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* 좌측: 안전인출률 선택 */}
                    <div className="lg:col-span-5 space-y-2.5">
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-200">
                            🛡️ 연간 안전인출률 설정
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {SWR_OPTIONS.map(opt => (
                                <button
                                    key={opt.rate}
                                    onClick={() => setSwrRate(opt.rate)}
                                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                        swrRate === opt.rate
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                            : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                                    }`}
                                >
                                    <div className="text-xs font-black">{opt.label}</div>
                                    <div className={`text-[10px] mt-0.5 ${swrRate === opt.rate ? 'text-indigo-100' : 'text-slate-400'}`}>
                                        {opt.desc}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 우측: 슬라이더 3종 (기준 월지출, 바리스타 부수입, 월 추가 저축 부스터) */}
                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">기준 월 생활비</span>
                                <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                                    월 {baseMetrics.activeExpense}만원
                                </span>
                            </div>
                            <input
                                type="range"
                                min="80"
                                max="600"
                                step="10"
                                value={baseMetrics.activeExpense}
                                onChange={(e) => setCustomBaseExpense(Number(e.target.value))}
                                className="w-full accent-indigo-600 cursor-pointer"
                            />
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-[10px] text-slate-400">앱 설정값: {baseMetrics.appExpense}만</span>
                                {customBaseExpense !== null && (
                                    <button
                                        onClick={() => setCustomBaseExpense(null)}
                                        className="text-[10px] font-bold text-indigo-500 underline cursor-pointer"
                                    >
                                        원래대로
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">☕ 바리스타 월 부수입</span>
                                <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                                    +{baristaMonthlyIncome}만원/월
                                </span>
                            </div>
                            <input
                                type="range"
                                min="20"
                                max="300"
                                step="10"
                                value={baristaMonthlyIncome}
                                onChange={(e) => setBaristaMonthlyIncome(Number(e.target.value))}
                                className="w-full accent-amber-500 cursor-pointer"
                            />
                            <div className="text-[10px] text-amber-700/80 dark:text-amber-400/80 mt-1">
                                은퇴 후 소일거리·알바·배당 외 소득
                            </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/40">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">🚀 월 추가 저축 부스터</span>
                                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                                    +{extraMonthlySaving}만원/월
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="250"
                                step="10"
                                value={extraMonthlySaving}
                                onChange={(e) => setExtraMonthlySaving(Number(e.target.value))}
                                className="w-full accent-emerald-600 cursor-pointer"
                            />
                            <div className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 mt-1">
                                저축 증액 시 은퇴 단축 개월 즉시 계산
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4대 FIRE 모델 카드 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {fireModels.map((model) => {
                    const theme = colorThemes[model.color];
                    return (
                        <div
                            key={model.id}
                            className={`p-6 rounded-3xl border-2 ${theme.border} ${theme.bg} bg-white dark:bg-slate-850 shadow-sm space-y-4 transition-all`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800">
                                        {model.icon}
                                    </span>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                                                {model.name}
                                            </h3>
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${theme.badge}`}>
                                                {model.krName}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            {model.desc}
                                        </p>
                                    </div>
                                </div>
                                <span className={`text-xs font-black px-2.5 py-1 rounded-xl ${theme.badge} flex-shrink-0`}>
                                    달성률 {model.progressPct}%
                                </span>
                            </div>

                            {/* 프로그레스 바 */}
                            <div className="space-y-1.5">
                                <div className="w-full h-3 bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${theme.bar} rounded-full transition-all duration-500`}
                                        style={{ width: `${Math.min(100, model.progressPct)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                    <span>현재 순자산: {formatManWon(baseMetrics.netWorth)}</span>
                                    <span>필요 시드: <b className="text-slate-800 dark:text-slate-100">{formatManWon(model.targetSeed)}</b></span>
                                </div>
                            </div>

                            {/* 핵심 수치 3단 박스 */}
                            <div className="grid grid-cols-3 gap-2.5 pt-1">
                                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                                    <div className="text-[10px] font-bold text-slate-400">은퇴 후 월 가용생활비</div>
                                    <div className="text-sm font-black text-slate-800 dark:text-slate-100 mt-0.5">
                                        월 {model.monthlyRequiredExpense}만원
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                        (자산인출 월 {model.monthlyNetWithdrawalNeeded}만)
                                    </div>
                                </div>

                                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                                    <div className="text-[10px] font-bold text-slate-400">남은 부족 시드</div>
                                    <div className="text-sm font-black text-slate-800 dark:text-slate-100 mt-0.5">
                                        {model.remainingAmount > 0 ? formatManWon(model.remainingAmount) : '0원 (달성)'}
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                        연 인출 {(model.monthlyNetWithdrawalNeeded * 12).toLocaleString()}만
                                    </div>
                                </div>

                                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                                    <div className="text-[10px] font-bold text-slate-400">예상 소요 기간</div>
                                    <div className={`text-sm font-black mt-0.5 ${theme.text}`}>
                                        {model.isAchieved
                                            ? '즉시 가능!'
                                            : model.monthsToGoal > 600
                                            ? '50년+'
                                            : `${Math.floor(model.monthsToGoal / 12)}년 ${model.monthsToGoal % 12}개월`}
                                    </div>
                                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                        {model.monthsSaved > 0 ? `⚡ 부스터로 -${model.monthsSaved}개월 단축!` : `총 ${model.monthsToGoal}개월`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
