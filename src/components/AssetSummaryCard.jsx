import React from 'react';

const AssetSummaryCard = ({ calculation, projectionMonths, baseMonth, baseDate, displayMode, editingPhase, isCalculating }) => {
    const formatNumber = window.formatNumber || ((n) => Number(n || 0).toLocaleString());
    const formatPercent = window.formatPercent || ((n) => (Number(n || 0)).toFixed(1));
    const TEXTS = window.TEXTS || {};
    const lastProj = calculation.monthlyProjections && calculation.monthlyProjections[projectionMonths - 1];
    
    // modals.js에서 로드된 TooltipGuide 사용
    const TooltipGuide = window.TooltipGuide || (() => null);
    const isEditing = editingPhase !== null; // [추가] 편집 모드 여부 확인
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
        <div className="md:col-span-1 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-xl shadow-lg p-6 transition-all duration-300">
            <div>
                <h2 className="text-lg font-semibold mb-2 text-gray-600 dark:text-white">
                    {isEditing ? `🚀 ${editingPhase.displayLabel} 자산 상태 (가상)` : (TEXTS.summary?.currentTotal || "현재 총자산")}
                </h2>
                <div className="flex items-end gap-2">
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{formatNumber(calculation.currentGross, displayMode)}만원</p>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">(순자산 {formatNumber(calculation.currentNet, displayMode)}만원)</span>
                </div>
            </div>
            {!isEditing && (
                <div className="mt-6"> 
                <h2 className="text-lg font-semibold mb-2 text-gray-600 dark:text-white">{projectionMonths}{TEXTS.summary?.projectedTotal || "개월 후 예상"} <span className="text-gray-400 text-sm">({(() => { 
                    try { 
                        const [y,m]= (baseDate || baseMonth || '').split('-').map(Number); 
                        const d = new Date(y||new Date().getFullYear(), (m||1)-1, 1); d.setMonth(d.getMonth()+projectionMonths); return `${String(d.getFullYear()).slice(2)}년 ${String(d.getMonth()+1).padStart(2,'0')}월`; 
                    } catch { return ''; } })()})</span></h2>
                <div className="flex items-end gap-2">
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{formatNumber(calculation.projectedGross, displayMode)}만원</p>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">(순자산 {formatNumber(calculation.projectedNet, displayMode)}만원)</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{TEXTS.summary?.expectedIncrease || "예상 증가액"}: +{formatNumber(calculation.growth, displayMode)}만원 ({formatPercent((calculation.growth) / Math.max(1, calculation.currentGross) * 100)}%)</p>         
                {compLabel && (
                    <p className="text-xs text-gray-400 mt-1">
                        ({compLabel}: {compVal >= 0 ? '+' : ''}{formatNumber(compVal, displayMode)}만원, {compVal >= 0 ? '+' : ''}{formatPercent(compPct)}%)
                    </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {TEXTS.summary?.inflationAdjusted || "인플레이션 고려 시"}: {formatNumber(calculation.realValue, displayMode)}만원
                    <TooltipGuide tip="물가 상승률을 반영하여 현재 가치로 환산한 금액입니다." />
                </p>
                {calculation.fireMetrics && (
                    <div className="mt-6 pt-6 border-t border-blue-200 dark:border-blue-800">
                        <h3 className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-3 flex items-center">
                            {TEXTS.summary?.fireAnalysis || "자립 가능성 분석 (FIRE Analysis)"}
                            <TooltipGuide tip="경제적 자립을 통해 조기 은퇴가 가능한지 분석합니다." />
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                                <span className="text-xs text-gray-500 flex items-center">
                                    {TEXTS.summary?.survivalPeriod || "생존 가능 기간"}
                                    <TooltipGuide tip="추가 소득 없이 현재 자산으로 생활 가능한 예상 기간입니다." />
                                </span>
                                <span className="text-xs font-bold text-gray-900 dark:text-white">
                                    {calculation.totalMonthlyExpense > 0 ? (
                                        calculation.fireMetrics.runwayMonths >= 1200 ? '100년 이상' : `${Math.floor(calculation.fireMetrics.runwayMonths / 12)}년 ${calculation.fireMetrics.runwayMonths % 12}개월`
                                    ) : (
                                        <span className="text-red-500">지출 설정 필요</span>
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                                <span className="text-xs text-gray-500 flex items-center">
                                    {TEXTS.summary?.fireNeeded || "FIRE (4% 법칙) 필요자산"}
                                    <TooltipGuide tip="연간 지출의 25배를 모으면 매년 4%씩 인출해도 원금이 유지된다는 법칙입니다." />
                                </span>
                                <span className="text-xs font-bold text-gray-900 dark:text-white">
                                    {calculation.totalMonthlyExpense > 0 ? formatNumber(calculation.fireMetrics.swr4PercentCapital, displayMode) + '만원' : '-'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            )}
        </div>
    );
};

export default AssetSummaryCard;
