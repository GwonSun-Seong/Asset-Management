import React, { useState } from 'react';

const AssetSummaryCard = (props) => {
    const {
        calculation, projectionMonths, baseMonth, baseDate, setBaseDate,
        displayMode, editingPhase, isCalculating, monthlySalary, setMonthlySalary,
        salaryDay, setSalaryDay, autoUpdateBaseDate, setAutoUpdateBaseDate,
        onOpenDataManage, saveCurrentAsset, saveScenario, goalMode, setGoalMode,
        setProjectionMonths, targetAmount, setTargetAmount, inflationRate, setInflationRate
    } = props;

    const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
    const formatNumber = window.formatNumber || ((n) => Number(n || 0).toLocaleString());
    const formatPercent = window.formatPercent || ((n) => (Number(n || 0)).toFixed(1));
    const TooltipGuide = window.TooltipGuide || (() => null);
    const isEditing = editingPhase !== null;
    const lastProj = calculation.monthlyProjections?.[projectionMonths - 1];

    let compVal = 0, compPct = 0, compLabel = '';
    if (!calculation.error && projectionMonths >= 1 && calculation.monthlyProjections?.length >= projectionMonths) {
        if (projectionMonths <= 12) {
            const prevProj = projectionMonths > 1 ? calculation.monthlyProjections[projectionMonths - 2] : { gross: calculation.currentGross };
            compVal = lastProj.gross - prevProj.gross;
            compPct = prevProj.gross !== 0 ? (compVal / Math.abs(prevProj.gross)) * 100 : 0;
            compLabel = '전월 대비';
        } else {
            const prevProj = calculation.monthlyProjections[projectionMonths - 12];
            compVal = lastProj.gross - prevProj.gross;
            compPct = prevProj.gross !== 0 ? (compVal / Math.abs(prevProj.gross)) * 100 : 0;
            compLabel = '1년 전 대비';
        }
    }

    const getProjectedDate = () => {
        try {
            const [y, m] = (baseDate || baseMonth || '').split('-').map(Number);
            const d = new Date(y || new Date().getFullYear(), (m || 1) - 1, 1);
            d.setMonth(d.getMonth() + projectionMonths);
            return String(d.getFullYear()).slice(2) + '년 ' + String(d.getMonth() + 1).padStart(2, '0') + '월';
        } catch { return ''; }
    };

    const growthPct = calculation.currentGross > 0 ? (calculation.growth / calculation.currentGross * 100) : 0;
    const fireRunway = calculation.fireMetrics?.runwayMonths ?? 0;
    const fireRunwayText = calculation.totalMonthlyExpense > 0
        ? (fireRunway >= 1200 ? '100년+' : fireRunway >= 12
            ? (Math.floor(fireRunway / 12) + '년 ' + (fireRunway % 12) + '개월')
            : (fireRunway + '개월'))
        : null;

    return (
        <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200/80 dark:border-gray-700/60 overflow-hidden transition-all duration-300">
            {/* 2x2 모바일 / 4x1 데스크톱 콤팩트 그리드 */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100 dark:divide-gray-700/60 bg-white dark:bg-gray-800">
                {/* 1. 현재 총자산 */}
                <div className="p-3.5 sm:p-4 flex flex-col justify-between hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                    <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1 flex items-center justify-between">
                        <span>{isEditing ? '가상 자산' : '현재 총자산'}</span>
                        {isCalculating && <span className="w-2.5 h-2.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tabular-nums tracking-tight">
                        {formatNumber(calculation.currentGross, displayMode)}
                        <span className="text-xs font-bold text-gray-400 ml-0.5">만</span>
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 tabular-nums truncate">
                        순자산 <strong className="text-blue-600 dark:text-blue-400 font-bold">{formatNumber(calculation.currentNet, displayMode)}만</strong>
                    </div>
                </div>

                {/* 2. 예상 자산 */}
                {!isEditing ? (
                    <div className="p-3.5 sm:p-4 flex flex-col justify-between hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                        <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1 flex items-center justify-between">
                            <span>{projectionMonths}개월 후 예상</span>
                            <span className="text-[10px] text-gray-400 font-mono">({getProjectedDate()})</span>
                        </div>
                        <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tabular-nums tracking-tight">
                            {formatNumber(calculation.projectedGross, displayMode)}
                            <span className="text-xs font-bold text-gray-400 ml-0.5">만</span>
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 tabular-nums truncate flex items-center gap-1">
                            <span>순자산 <strong className="text-gray-700 dark:text-gray-300 font-bold">{formatNumber(calculation.projectedNet, displayMode)}만</strong></span>
                            <span className="text-gray-300 dark:text-gray-600">|</span>
                            <span>실질 <strong className="text-gray-700 dark:text-gray-300 font-bold">{formatNumber(calculation.realValue, displayMode)}만</strong></span>
                        </div>
                    </div>
                ) : <div />}

                {/* 3. 예상 증가액 */}
                {!isEditing ? (
                    <div className="p-3.5 sm:p-4 flex flex-col justify-between hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                        <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1">
                            <span>예상 증가액</span>
                        </div>
                        <div className="text-xl sm:text-2xl font-black tabular-nums tracking-tight">
                            <span className={calculation.growth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}>
                                {calculation.growth >= 0 ? '+' : ''}{formatNumber(calculation.growth, displayMode)}
                            </span>
                            <span className="text-xs font-bold text-gray-400 ml-0.5">만</span>
                        </div>
                        <div className="text-[11px] mt-1 flex items-center gap-1 truncate">
                            <span className={`font-black px-1.5 py-0.5 rounded text-[10px] ${growthPct >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/40 text-red-500'}`}>
                                {growthPct >= 0 ? '+' : ''}{formatPercent(growthPct)}%
                            </span>
                            {compLabel && <span className="text-gray-400 text-[10px]">({compLabel} {compVal >= 0 ? '+' : ''}{formatPercent(compPct)}%)</span>}
                        </div>
                    </div>
                ) : <div />}

                {/* 4. 생존 가능 기간 */}
                {!isEditing ? (
                    <div className="p-3.5 sm:p-4 flex flex-col justify-between hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                        <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                            <span>생존 가능 기간</span>
                            <TooltipGuide tip="추가 소득 없이 현재 자산으로 생활 가능한 예상 기간입니다." preferredPosition="bottom" />
                        </div>
                        <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-500 tabular-nums tracking-tight truncate">
                            {fireRunwayText ?? <span className="text-xs text-gray-400 font-normal">지출 설정 필요</span>}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 tabular-nums truncate flex items-center gap-1">
                            {calculation.fireMetrics && calculation.totalMonthlyExpense > 0 ? (
                                <>FIRE <strong className="text-gray-700 dark:text-gray-300 font-bold">{formatNumber(calculation.fireMetrics.swr4PercentCapital, displayMode)}만</strong></>
                            ) : (
                                <span>월 고정지출 기준</span>
                            )}
                        </div>
                    </div>
                ) : <div />}
            </div>

            {/* 하단 콤팩트 설정 토글 바 */}
            {!isEditing && (
                <button
                    onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
                    className="w-full py-2 px-4 bg-gray-50/70 hover:bg-gray-100/70 dark:bg-gray-800/80 dark:hover:bg-gray-700/60 border-t border-gray-100 dark:border-gray-700/60 text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center justify-between transition-colors"
                >
                    <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span>{isSettingsExpanded ? '세부 설정 접기' : '기준일 · 월수입 · 목표 시뮬레이션 설정'}</span>
                    </span>
                    <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isSettingsExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                </button>
            )}

            {/* 접이식 설정 패널 */}
            {!isEditing && isSettingsExpanded && (
                <div className="border-t border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">

                        {/* 1열: 기본 설정 */}
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">기본 설정</h3>
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">계산 기준일</span>
                                    <label className="flex items-center gap-1 text-[10px] text-gray-500 cursor-pointer select-none" title="앱을 열 때마다 오늘 날짜로 자동 갱신">
                                        <input type="checkbox" className="w-3 h-3 rounded accent-blue-600" checked={autoUpdateBaseDate} onChange={(e) => setAutoUpdateBaseDate(e.target.checked)} />
                                        자동 갱신
                                    </label>
                                </div>
                                <input type="date" className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none text-xs" value={baseDate} onChange={(e) => setBaseDate(e.target.value)} />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block mb-1">월 고정 수입</span>
                                    <div className="flex items-center gap-1">
                                        <input type="number" className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-2 py-1.5 text-right font-black text-xs focus:ring-1 focus:ring-blue-500 outline-none" value={monthlySalary} onChange={(e) => setMonthlySalary(Number(e.target.value))} />
                                        <span className="text-gray-400 font-bold flex-shrink-0">만</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block mb-1">급여 수입일</span>
                                    <select className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-2 py-1.5 font-bold text-xs focus:ring-1 focus:ring-blue-500 outline-none" value={salaryDay} onChange={(e) => setSalaryDay(Number(e.target.value))}>
                                        {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}일</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* 2열: 목표 시뮬레이션 */}
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">목표 시뮬레이션</h3>
                            <div className="flex bg-gray-100 dark:bg-gray-800 p-0.5 rounded-lg">
                                <button onClick={() => setGoalMode('months')} className={`flex-1 py-1 rounded-md text-[10px] font-black transition-all ${goalMode === 'months' ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>기간 기준</button>
                                <button onClick={() => setGoalMode('amount')} className={`flex-1 py-1 rounded-md text-[10px] font-black transition-all ${goalMode === 'amount' ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>금액 기준</button>
                            </div>
                            {goalMode === 'months' ? (
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">목표 예측 기간</span>
                                        <span className="font-black text-indigo-600 dark:text-indigo-400 text-xs">{projectionMonths}개월 ({formatPercent(projectionMonths / 12)}년)</span>
                                    </div>
                                    <input type="range" min="1" max="120" className="w-full accent-indigo-600 h-1 rounded-lg appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700" value={projectionMonths} onChange={(e) => setProjectionMonths(Number(e.target.value))} />
                                </div>
                            ) : (
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">목표 순자산</span>
                                        <span className="font-black text-indigo-600 dark:text-indigo-400 text-xs">{formatNumber(targetAmount, displayMode)}만원</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <input type="range" min="1000" max="500000" step="1000" className="flex-1 accent-indigo-600 h-1 rounded-lg appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700" value={targetAmount} onChange={(e) => setTargetAmount(Number(e.target.value))} />
                                        <input type="number" className="w-20 border dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-2 py-1 text-right text-[10px] font-black focus:ring-1 focus:ring-blue-500 outline-none" value={targetAmount} onChange={(e) => setTargetAmount(Number(e.target.value))} />
                                    </div>
                                </div>
                            )}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-0.5">
                                        물가 상승률 (연) <TooltipGuide tip="실질 가치 계산에 반영할 연간 물가 상승률입니다." />
                                    </span>
                                    <span className="font-black text-indigo-600 dark:text-indigo-400 text-xs">{inflationRate}%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="range" min="0" max="10" step="0.1" className="flex-1 accent-indigo-600 h-1 rounded-lg appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700" value={inflationRate} onChange={(e) => setInflationRate(Number(e.target.value))} />
                                    <input type="number" className="w-14 border dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-2 py-1 text-right text-[10px] font-black focus:ring-1 focus:ring-blue-500 outline-none" value={inflationRate} onChange={(e) => setInflationRate(Number(e.target.value))} />
                                </div>
                            </div>
                        </div>

                        {/* 3열: 데이터 도구 */}
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">데이터 도구</h3>
                            <div className="grid grid-cols-3 gap-2">
                                <button onClick={onOpenDataManage} title="데이터 내보내기 / 불러오기" className="flex flex-col items-center justify-center py-3 px-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-200 transition-all active:scale-95 group">
                                    <svg className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-2m-4-2v8m0 0l-3-3m3 3l3-3" /></svg>
                                    <span className="text-[9px] font-black tracking-tight">백업/복구</span>
                                </button>
                                <button onClick={saveCurrentAsset} title="현재 자산을 히스토리에 저장" className="flex flex-col items-center justify-center py-3 px-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:border-indigo-200 transition-all active:scale-95 group">
                                    <svg className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                    <span className="text-[9px] font-black tracking-tight">히스토리</span>
                                </button>
                                <button onClick={saveScenario} title="현재 계획을 시나리오로 저장" className="flex flex-col items-center justify-center py-3 px-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:border-purple-200 transition-all active:scale-95 group">
                                    <svg className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                    <span className="text-[9px] font-black tracking-tight">시나리오</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssetSummaryCard;
