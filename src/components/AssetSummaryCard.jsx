import React, { useState } from 'react';

const AssetSummaryCard = (props) => {
    const {
        calculation,
        projectionMonths,
        baseMonth,
        baseDate,
        setBaseDate,
        displayMode,
        editingPhase,
        isCalculating,
        monthlySalary,
        setMonthlySalary,
        salaryDay,
        setSalaryDay,
        autoUpdateBaseDate,
        setAutoUpdateBaseDate,
        onOpenDataManage,
        saveCurrentAsset,
        saveScenario,
        goalMode,
        setGoalMode,
        setProjectionMonths,
        targetAmount,
        setTargetAmount,
        inflationRate,
        setInflationRate
    } = props;

    const [isSettingsExpanded, setIsSettingsExpanded] = useState(false); // 접이식 설정 패널 상태
    const formatNumber = window.formatNumber || ((n) => Number(n || 0).toLocaleString());
    const formatPercent = window.formatPercent || ((n) => (Number(n || 0)).toFixed(1));
    const TEXTS = window.TEXTS || {};
    const lastProj = calculation.monthlyProjections && calculation.monthlyProjections[projectionMonths - 1];
    
    const TooltipGuide = window.TooltipGuide || (() => null);
    const isEditing = editingPhase !== null;
    let compLabel = "";
    let compVal = 0;
    let compPct = 0;

    if (!calculation.error && projectionMonths >= 1 && calculation.monthlyProjections?.length >= projectionMonths) {
        if (projectionMonths <= 12) {
            const prevProj = projectionMonths > 1 ? calculation.monthlyProjections[projectionMonths - 2] : { gross: calculation.currentGross };
            compVal = lastProj.gross - prevProj.gross;
            compPct = prevProj.gross !== 0 ? (compVal / Math.abs(prevProj.gross)) * 100 : 0;
            compLabel = "전월 대비";
        } else {
            const prevProj = calculation.monthlyProjections[projectionMonths - 12];
            compVal = lastProj.gross - prevProj.gross;
            compPct = prevProj.gross !== 0 ? (compVal / Math.abs(prevProj.gross)) * 100 : 0;
            compLabel = "1년 전 대비";
        }
    }

    return (
        <div className="w-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-2xl shadow-lg p-5 transition-all duration-300 relative border border-blue-200/40 dark:border-indigo-850/40">
            {/* 상단 메인 대시보드 뷰 */}
            <div className="flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
                {/* 현재 자산 상태 */}
                <div className="flex-1">
                    <h2 className="text-xs font-black mb-1 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {isEditing ? `🚀 ${editingPhase.displayLabel} 자산 상태 (가상)` : (TEXTS.summary?.currentTotal || "현재 총자산")}
                    </h2>
                    <div className="flex items-end gap-2">
                        <p className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight">{formatNumber(calculation.currentGross, displayMode)}만원</p>
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-0.5">(순자산 {formatNumber(calculation.currentNet, displayMode)}만)</span>
                    </div>
                </div>

                {/* 개월 후 예상 */}
                {!isEditing && (
                    <div className="flex-1 md:border-l md:border-blue-200/40 dark:md:border-indigo-900/30 md:pl-6">
                        <h2 className="text-xs font-black mb-1 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {projectionMonths}{TEXTS.summary?.projectedTotal || "개월 후 예상"} 
                            <span className="text-gray-400 dark:text-gray-500 text-[10px] ml-1">
                                ({(() => { 
                                    try { 
                                        const [y,m]= (baseDate || baseMonth || '').split('-').map(Number); 
                                        const d = new Date(y||new Date().getFullYear(), (m||1)-1, 1); d.setMonth(d.getMonth()+projectionMonths); return `${String(d.getFullYear()).slice(2)}년 ${String(d.getMonth()+1).padStart(2,'0')}월`; 
                                    } catch { return ''; } 
                                })()})
                            </span>
                        </h2>
                        <div className="flex items-end gap-2">
                            <p className="text-2xl sm:text-3xl font-black text-green-600 dark:text-green-400 tracking-tight">{formatNumber(calculation.projectedGross, displayMode)}만원</p>
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-0.5">(순자산 {formatNumber(calculation.projectedNet, displayMode)}만)</span>
                        </div>
                    </div>
                )}

                {/* ⚙️ 접기/펴기 버튼 */}
                {!isEditing && (
                    <button 
                        onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-sm active:scale-95 flex-shrink-0 ${
                            isSettingsExpanded 
                            ? 'bg-blue-600 border-blue-500 text-white shadow-blue-500/20' 
                            : 'bg-white hover:bg-gray-150 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 border-gray-250 dark:border-gray-700'
                        }`}
                    >
                        <svg className={`w-4 h-4 transition-transform duration-300 ${isSettingsExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        설정 및 도구
                    </button>
                )}
            </div>

            {/* 예상 증가율 및 인플레이션 한 줄 배치 (가볍게 여백 절약) */}
            {!isEditing && (
                <div className="mt-3 pt-3 border-t border-blue-200/40 dark:border-indigo-900/30 flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-gray-550 dark:text-gray-400">
                    <p>{TEXTS.summary?.expectedIncrease || "예상 증가액"}: <strong className="text-slate-800 dark:text-slate-200">+{formatNumber(calculation.growth, displayMode)}만원 ({formatPercent((calculation.growth) / Math.max(1, calculation.currentGross) * 100)}%)</strong></p>         
                    {compLabel && (
                        <p>({compLabel}: {compVal >= 0 ? '+' : ''}{formatNumber(compVal, displayMode)}만, {compVal >= 0 ? '+' : ''}{formatPercent(compPct)}%)</p>
                    )}
                    <p className="flex items-center gap-0.5">
                        {TEXTS.summary?.inflationAdjusted || "실질 가치 (물가 반영)"}: <strong className="text-slate-800 dark:text-slate-200">{formatNumber(calculation.realValue, displayMode)}만원</strong>
                        <TooltipGuide tip="물가 상승률을 반영하여 현재 가치로 환산한 금액입니다." />
                    </p>
                </div>
            )}

            {/* 자립 가능성 분석 (2열 콤팩트 카드 배치) */}
            {!isEditing && calculation.fireMetrics && (
                <div className="mt-3 pt-3 border-t border-blue-200/40 dark:border-indigo-900/30">
                    <h3 className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-2 flex items-center">
                        {TEXTS.summary?.fireAnalysis || "자립 가능성 분석 (FIRE Analysis)"}
                        <TooltipGuide tip="경제적 자립을 통해 조기 은퇴가 가능한지 분석합니다." />
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col justify-between p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-150/40 dark:border-gray-700 min-h-[50px]">
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold flex items-center gap-0.5">
                                {TEXTS.summary?.survivalPeriod || "생존 가능 기간"}
                                <TooltipGuide tip="추가 소득 없이 현재 자산으로 생활 가능한 예상 기간입니다." />
                            </span>
                            <span className="text-xs font-black text-gray-900 dark:text-white mt-1">
                                {calculation.totalMonthlyExpense > 0 ? (
                                    calculation.fireMetrics.runwayMonths >= 1200 ? '100년 이상' : `${Math.floor(calculation.fireMetrics.runwayMonths / 12)}년 ${calculation.fireMetrics.runwayMonths % 12}개월`
                                ) : (
                                    <span className="text-red-500">지출 설정 필요</span>
                                )}
                            </span>
                        </div>
                        <div className="flex flex-col justify-between p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-150/40 dark:border-gray-700 min-h-[50px]">
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold flex items-center gap-0.5">
                                {TEXTS.summary?.fireNeeded || "FIRE 필요 자산"}
                                <TooltipGuide tip="연간 지출의 25배를 모으면 매년 4%씩 인출해도 원금이 유지된다는 법칙입니다." />
                            </span>
                            <span className="text-xs font-black text-gray-900 dark:text-white mt-1">
                                {calculation.totalMonthlyExpense > 0 ? formatNumber(calculation.fireMetrics.swr4PercentCapital, displayMode) + '만' : '-'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* [오버홀] 접이식(아코디언) 설정 및 도구 패널 */}
            {!isEditing && isSettingsExpanded && (
                <div className="mt-4 pt-4 border-t border-blue-200/50 dark:border-indigo-900/50 animate-in fade-in slide-in-from-top-4 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                        {/* 1열: 기본 설정 및 데이터 관리 */}
                        <div className="space-y-4">
                            <h3 className="font-black text-indigo-650 dark:text-indigo-400 text-[10px] uppercase tracking-wider mb-1">기본 설정 및 백업</h3>
                            
                            {/* 기준일 & 자동갱신 */}
                            <div className="flex items-center gap-2">
                                <div className="flex-1">
                                    <span className="text-[10px] text-gray-450 dark:text-gray-500 font-bold block mb-1">계산 시작일 (기준일)</span>
                                    <input 
                                        type="date" 
                                        className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none" 
                                        value={baseDate} 
                                        onChange={(e) => setBaseDate(e.target.value)} 
                                    />
                                </div>
                                <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-gray-500 dark:text-gray-400 mt-5 select-none" title="활성화 시 앱을 열 때마다 기준일이 오늘 날짜로 자동 갱신됩니다.">
                                    <input 
                                        type="checkbox" 
                                        className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500"
                                        checked={autoUpdateBaseDate}
                                        onChange={(e) => setAutoUpdateBaseDate(e.target.checked)}
                                    />
                                    자동 갱신
                                </label>
                            </div>

                            {/* [수정] 월 고정 수입 및 수입일 - 테두리 및 여백을 없애고 세련되게 한 줄에 배치 */}
                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <div>
                                    <span className="text-[10px] text-gray-450 dark:text-gray-500 font-bold block mb-1">월 고정 수입 (세후)</span>
                                    <div className="flex items-center gap-1">
                                        <input 
                                            type="number" 
                                            className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none text-right font-black" 
                                            value={monthlySalary} 
                                            onChange={(e) => setMonthlySalary(Number(e.target.value))} 
                                        />
                                        <span className="text-gray-400 font-bold">만</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-450 dark:text-gray-500 font-bold block mb-1">급여 수입일</span>
                                    <div className="flex items-center gap-1">
                                        <select 
                                            className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none font-bold" 
                                            value={salaryDay} 
                                            onChange={(e) => setSalaryDay(Number(e.target.value))}
                                        >
                                            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                                <option key={day} value={day}>{day}일</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* 데이터 백업 관리 아이콘 바 */}
                            <div className="pt-2">
                                <span className="text-[10px] text-gray-450 dark:text-gray-500 font-bold block mb-1.5">데이터 도구 및 저장</span>
                                <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-150/50 dark:border-gray-700/80 gap-1 shadow-inner">
                                    <button 
                                        onClick={onOpenDataManage} 
                                        title="데이터 내보내기 / 불러오기 (JSON/CSV)" 
                                        className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg transition-all duration-200 active:scale-95 group"
                                    >
                                        <svg className="w-4 h-4 mb-0.5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-2m-4-2v8m0 0l-3-3m3 3l3-3" />
                                        </svg>
                                        <span className="text-[8px] font-black tracking-tight whitespace-nowrap">백업/복구</span>
                                    </button>
                                    <div className="w-px h-5 bg-slate-200 dark:bg-slate-700"></div>
                                    <button 
                                        onClick={saveCurrentAsset} 
                                        title="현재 순자산을 기록 히스토리에 저장" 
                                        className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg transition-all duration-200 active:scale-95 group"
                                    >
                                        <svg className="w-4 h-4 mb-0.5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                        <span className="text-[8px] font-black tracking-tight whitespace-nowrap">히스토리</span>
                                    </button>
                                    <div className="w-px h-5 bg-slate-200 dark:bg-slate-700"></div>
                                    <button 
                                        onClick={saveScenario} 
                                        title="현재 저축/투자 계획을 시나리오로 저장" 
                                        className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg transition-all duration-200 active:scale-95 group"
                                    >
                                        <svg className="w-4 h-4 mb-0.5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                        </svg>
                                        <span className="text-[8px] font-black tracking-tight whitespace-nowrap">시나리오</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 2열: 목표 설정 및 물가 */}
                        <div className="space-y-4">
                            <h3 className="font-black text-indigo-650 dark:text-indigo-400 text-[10px] uppercase tracking-wider mb-1">목표 시뮬레이션 설정</h3>

                            {/* 목표 모드 선택 */}
                            <div>
                                <span className="text-[10px] text-gray-450 dark:text-gray-500 font-bold block mb-1">목표 달성 방식</span>
                                <div className="flex bg-white dark:bg-gray-800 p-0.5 rounded-lg border dark:border-gray-700 shadow-sm">
                                    <button 
                                        onClick={() => setGoalMode('months')} 
                                        className={`flex-1 py-1 rounded-md text-[10px] font-black transition-all ${goalMode === 'months' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                    >
                                        목표 기간 기준
                                    </button>
                                    <button 
                                        onClick={() => setGoalMode('amount')} 
                                        className={`flex-1 py-1 rounded-md text-[10px] font-black transition-all ${goalMode === 'amount' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                    >
                                        목표 금액 기준
                                    </button>
                                </div>
                            </div>

                            {/* 목표 기간 / 목표 금액 동적 입력 */}
                            {goalMode === 'months' ? (
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] text-gray-455 dark:text-gray-500 font-bold">목표 예측 기간</span>
                                        <span className="font-black text-indigo-600 dark:text-indigo-400">{projectionMonths}개월 ({formatPercent(projectionMonths / 12)}년)</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="1" 
                                        max="120" 
                                        className="w-full accent-indigo-600 bg-gray-200 dark:bg-gray-700 h-1 rounded-lg appearance-none cursor-pointer" 
                                        value={projectionMonths} 
                                        onChange={(e) => setProjectionMonths(Number(e.target.value))} 
                                    />
                                </div>
                            ) : (
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] text-gray-455 dark:text-gray-500 font-bold">목표 순자산 설정</span>
                                        <span className="font-black text-indigo-600 dark:text-indigo-400">{formatNumber(targetAmount, displayMode)}만원</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <input 
                                            type="range" 
                                            min="1000" 
                                            max="500000" 
                                            step="1000"
                                            className="flex-1 accent-indigo-600 bg-gray-200 dark:bg-gray-700 h-1 rounded-lg appearance-none cursor-pointer" 
                                            value={targetAmount} 
                                            onChange={(e) => setTargetAmount(Number(e.target.value))} 
                                        />
                                        <input 
                                            type="number" 
                                            className="w-20 border dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-2 py-1 text-right text-[10px] font-black focus:ring-1 focus:ring-blue-500 outline-none" 
                                            value={targetAmount} 
                                            onChange={(e) => setTargetAmount(Number(e.target.value))} 
                                        />
                                    </div>
                                </div>
                            )}

                            {/* 인플레이션 (물가상승률) */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] text-gray-455 dark:text-gray-500 font-bold flex items-center gap-0.5">
                                        물가 상승률 (연)
                                        <TooltipGuide tip="예상자산의 미래 실질 가치 계산을 위해 반영할 물가 상승률입니다." />
                                    </span>
                                    <span className="font-black text-indigo-600 dark:text-indigo-400">{inflationRate}%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="10" 
                                        step="0.1" 
                                        className="flex-1 accent-indigo-600 bg-gray-200 dark:bg-gray-700 h-1 rounded-lg appearance-none cursor-pointer" 
                                        value={inflationRate} 
                                        onChange={(e) => setInflationRate(Number(e.target.value))} 
                                    />
                                    <input 
                                        type="number" 
                                        className="w-14 border dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-2 py-1 text-right text-[10px] font-black focus:ring-1 focus:ring-blue-500 outline-none" 
                                        value={inflationRate} 
                                        onChange={(e) => setInflationRate(Number(e.target.value))} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssetSummaryCard;
