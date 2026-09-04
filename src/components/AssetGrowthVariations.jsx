import React, { useState } from 'react';

/**
 * 🎨 AssetGrowthModernView (배리에이션 1: FinTech Clean Pro Table)
 * - 무지개떡 배경색 제거 -> 깨끗하고 세련된 단일 화이트/다크 톤 + 은은한 호버 액센트
 * - 촌스러운 '└' 꺾쇠 제거 -> 모던 L자 트리 라인 & 계층형 인덴트
 * - 과도한 주황/빨강 괄호 제거 -> 정돈된 뮤트 뱃지 (Slate Badge)
 * - 정돈된 금융 타이포그래피 (tabular-nums, font-mono, 정렬 최적화)
 * - 섹터별 접기/펼치기(Accordion) 기능 지원
 */
export const AssetGrowthModernView = ({
    sectorInfo,
    currentSectorTotals,
    projectedSectorTotals,
    rebalancingTargets,
    assets,
    calculation,
    currentGrossTotal,
    projectedGrossTotal,
    formatNumber,
    formatPercent,
    displayMode,
    appData = {}
}) => {
    // 모든 섹터 기본 펼침 상태
    const [collapsedSectors, setCollapsedSectors] = useState({});

    const toggleSector = (sectorKey) => {
        setCollapsedSectors(prev => ({ ...prev, [sectorKey]: !prev[sectorKey] }));
    };

    const sectorKeys = Object.keys(sectorInfo || {});

    // 각 섹터별 은은하고 고급스러운 틴트 컬러 스타일 매핑
    const SECTOR_THEMES = {
        deposit: {
            bg: 'bg-blue-50/50 hover:bg-blue-100/60 dark:bg-blue-950/20 dark:hover:bg-blue-950/40',
            border: 'border-l-blue-500',
            iconBg: 'bg-blue-100/70 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
            subline: 'bg-blue-200 dark:bg-blue-900/50'
        },
        savings: {
            bg: 'bg-emerald-50/50 hover:bg-emerald-100/60 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40',
            border: 'border-l-emerald-500',
            iconBg: 'bg-emerald-100/70 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
            subline: 'bg-emerald-200 dark:bg-emerald-900/50'
        },
        investment: {
            bg: 'bg-orange-50/50 hover:bg-orange-100/60 dark:bg-orange-950/20 dark:hover:bg-orange-950/40',
            border: 'border-l-orange-500',
            iconBg: 'bg-orange-100/70 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300',
            subline: 'bg-orange-200 dark:bg-orange-900/50'
        },
        pension: {
            bg: 'bg-purple-50/50 hover:bg-purple-100/60 dark:bg-purple-950/20 dark:hover:bg-purple-950/40',
            border: 'border-l-purple-500',
            iconBg: 'bg-purple-100/70 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300',
            subline: 'bg-purple-200 dark:bg-purple-900/50'
        },
        realestate: {
            bg: 'bg-amber-50/50 hover:bg-amber-100/60 dark:bg-amber-950/20 dark:hover:bg-amber-950/40',
            border: 'border-l-amber-500',
            iconBg: 'bg-amber-100/70 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',
            subline: 'bg-amber-200 dark:bg-amber-900/50'
        },
        car: {
            bg: 'bg-cyan-50/50 hover:bg-cyan-100/60 dark:bg-cyan-950/20 dark:hover:bg-cyan-950/40',
            border: 'border-l-cyan-500',
            iconBg: 'bg-cyan-100/70 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300',
            subline: 'bg-cyan-200 dark:bg-cyan-900/50'
        },
        loan: {
            bg: 'bg-slate-100/60 hover:bg-slate-200/60 dark:bg-slate-800/40 dark:hover:bg-slate-800/60',
            border: 'border-l-slate-500',
            iconBg: 'bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
            subline: 'bg-slate-300 dark:bg-slate-700'
        },
        misc: {
            bg: 'bg-gray-100/50 hover:bg-gray-200/50 dark:bg-gray-800/30 dark:hover:bg-gray-800/50',
            border: 'border-l-gray-400',
            iconBg: 'bg-gray-200/60 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
            subline: 'bg-gray-300 dark:bg-gray-700'
        }
    };

    return (
        <div className="space-y-4">
            {/* 메인 테이블 */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                <table className="w-full text-sm dark:text-slate-200 min-w-[950px] border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/85 dark:bg-slate-800/60 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            <th className="py-3.5 px-4 text-left w-1/4">섹터 / 자산 항목</th>
                            <th className="py-3.5 px-4 text-right">금액 추이 (현재 → 예상)</th>
                            <th className="py-3.5 px-4 text-right">예상 순증감 (수익률)</th>
                            <th className="py-3.5 px-4 text-center">현재 비중</th>
                            <th className="py-3.5 px-4 text-center">예상 비중</th>
                            <th className="py-3.5 px-4 text-right">목표 비중</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {sectorKeys.map(sectorKey => {
                            const theme = SECTOR_THEMES[sectorKey] || SECTOR_THEMES.misc;
                            const current = currentSectorTotals[sectorKey] || { amount: 0, percentage: 0 };
                            const projected = projectedSectorTotals[sectorKey] || { amount: 0, percentage: 0 };
                            const growthRate = current.amount > 0 ? ((projected.amount - current.amount) / current.amount * 100) : 0;
                            const diffAmount = projected.amount - current.amount;
                            const isPositiveGood = sectorKey === 'loan' ? growthRate <= 0 : growthRate >= 0;
                            const targetPct = (rebalancingTargets[sectorKey] ?? Math.round(100 / sectorKeys.length));
                            const isCollapsed = !!collapsedSectors[sectorKey];
                            const subAssets = assets[sectorKey] || [];
                            const hasSubAssets = subAssets.length > 0;

                            // 목표 비중과 예상 비중의 갭(Gap)
                            const weightDiff = projected.percentage - targetPct;

                            return (
                                <React.Fragment key={sectorKey}>
                                    {/* 섹터 메인 헤더 행 (은은한 틴트 배경 + 좌측 4px 포인트 컬러 바) */}
                                    <tr 
                                        onClick={() => hasSubAssets && toggleSector(sectorKey)}
                                        className={`group transition-colors border-l-4 ${theme.border} ${theme.bg} ${hasSubAssets ? 'cursor-pointer' : ''}`}
                                    >
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-2.5">
                                                {/* 토글 화살표 */}
                                                <span className={`text-[10px] text-slate-400 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : 'rotate-0'} ${hasSubAssets ? 'opacity-100' : 'opacity-0'}`}>
                                                    ▼
                                                </span>
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shadow-2xs ${theme.iconBg}`}>
                                                    {sectorInfo[sectorKey].icon}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                                                        {sectorInfo[sectorKey].name}
                                                        {hasSubAssets && (
                                                            <span className="text-[10px] text-slate-500 font-normal px-1.5 py-0.2 rounded-full bg-white/70 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700">
                                                                {subAssets.length}
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2 font-mono tabular-nums">
                                                <span className="text-xs text-slate-400 dark:text-slate-500">{formatNumber(current.amount, displayMode)}</span>
                                                <span className="text-slate-300 dark:text-slate-600 text-xs">→</span>
                                                <span className="text-sm font-black text-slate-900 dark:text-slate-100">{formatNumber(projected.amount, displayMode)}</span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className={`font-mono text-sm font-black tabular-nums ${isPositiveGood ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                                                    {diffAmount > 0 ? '+' : ''}{formatNumber(diffAmount, displayMode)}
                                                </span>
                                                <span className={`text-[11px] font-bold font-mono ${isPositiveGood ? 'text-emerald-600/80 dark:text-emerald-400/80' : 'text-rose-500/80'}`}>
                                                    ({growthRate > 0 ? '+' : ''}{formatPercent(growthRate)}%)
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                                                {formatPercent(current.percentage)}%
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-xs font-black text-slate-900 dark:text-slate-100">
                                                {formatPercent(projected.percentage)}%
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                                                    {formatPercent(targetPct)}%
                                                </span>
                                                {Math.abs(weightDiff) >= 1 && (
                                                    <span className={`text-[10px] font-mono font-semibold px-1 py-0.5 rounded ${weightDiff > 0 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' : 'text-amber-600 bg-amber-50 dark:bg-amber-950/30'}`}>
                                                        {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)}%
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>

                                    {/* 하위 자산 항목들 (트리 인덴트 & 정돈된 서브라벨) */}
                                    {!isCollapsed && subAssets.map((asset, idx) => {
                                        const isLastItem = idx === subAssets.length - 1;
                                        const projectedAmount = calculation.projected[sectorKey]?.[idx]?.amount || 0;
                                        const assetGrowth = projectedAmount - asset.amount;
                                        const assetGrowthRate = asset.amount > 0 ? (assetGrowth / asset.amount * 100) : 0;
                                        const isAssetPositiveGood = sectorKey === 'loan' ? assetGrowthRate <= 0 : assetGrowthRate >= 0;
                                        const currentAssetPercentageInPortfolio = (currentGrossTotal > 0) ? (asset.amount / currentGrossTotal * 100) : 0;
                                        const assetPercentageInPortfolio = (projectedAmount / (projectedGrossTotal || 1) * 100);
                                        const projectedAssetPercentageInSector = (projected.amount > 0) ? (projectedAmount / projected.amount * 100) : 0;
                                        const itemTarget = appData.itemTargets?.[asset.id] ?? Math.round(100 / (subAssets.length || 1));

                                        return (
                                            <tr key={`${sectorKey}-${idx}`} className="group hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                                <td className="py-2.5 px-4">
                                                    <div className="flex items-center pl-7 relative">
                                                        {/* 세련된 SVG 계층 트리 라인 */}
                                                        <div className="absolute left-3 top-0 bottom-0 w-4 pointer-events-none">
                                                            <div className="absolute left-1.5 top-0 bottom-1/2 w-px bg-slate-200 dark:bg-slate-700"></div>
                                                            <div className="absolute left-1.5 top-1/2 w-2.5 h-px bg-slate-200 dark:bg-slate-700"></div>
                                                            {!isLastItem && (
                                                                <div className="absolute left-1.5 top-1/2 bottom-0 w-px bg-slate-200 dark:bg-slate-700"></div>
                                                            )}
                                                        </div>

                                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                                            {asset.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-2.5 px-4 text-right font-mono tabular-nums text-xs">
                                                    <span className="text-slate-400">{formatNumber(asset.amount, displayMode)}</span>
                                                    <span className="text-slate-300 dark:text-slate-600 mx-1.5">→</span>
                                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{formatNumber(projectedAmount, displayMode)}</span>
                                                </td>
                                                <td className="py-2.5 px-4 text-right font-mono tabular-nums text-xs">
                                                    <span className={`font-semibold ${isAssetPositiveGood ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                                                        {assetGrowth > 0 ? '+' : ''}{formatNumber(assetGrowth, displayMode)}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 ml-1 font-normal">
                                                        ({assetGrowthRate > 0 ? '+' : ''}{formatPercent(assetGrowthRate)}%)
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-4 text-center font-mono tabular-nums text-xs text-slate-500">
                                                    {sectorKey !== 'loan' ? `${formatPercent(currentAssetPercentageInPortfolio)}%` : '-'}
                                                </td>
                                                <td className="py-2.5 px-4 text-center font-mono tabular-nums text-xs text-slate-600 dark:text-slate-400">
                                                    {sectorKey !== 'loan' ? (
                                                        <span>
                                                            {formatPercent(assetPercentageInPortfolio)}%
                                                            <span className="text-[10px] text-slate-400 ml-1">
                                                                ({formatPercent(projectedAssetPercentageInSector)}%)
                                                            </span>
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                                <td className="py-2.5 px-4 text-right font-mono tabular-nums text-xs">
                                                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-[11px]">
                                                        {formatPercent(itemTarget)}%
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </React.Fragment>
                            );
                        })}

                        {/* 합계 행 (총자산) */}
                        <tr className="bg-slate-100/90 dark:bg-slate-800/90 font-mono font-black border-t-2 border-slate-300 dark:border-slate-700">
                            <td className="py-3.5 px-4 text-slate-900 dark:text-white font-sans text-sm">
                                💼 총자산 합계 (부채 포함)
                            </td>
                            <td className="py-3.5 px-4 text-right text-sm">
                                <span className="text-xs text-slate-500 font-normal">{formatNumber(calculation.currentGross, displayMode)}</span>
                                <span className="text-slate-400 mx-1">→</span>
                                <span className="text-sm font-black">{formatNumber(calculation.projectedGross, displayMode)}</span>
                            </td>
                            <td className={`py-3.5 px-4 text-right text-sm ${calculation.growth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                                <div>+{formatNumber(calculation.growth, displayMode)}</div>
                                <div className="text-[11px] font-semibold">({formatPercent(calculation.growth / Math.max(1, calculation.currentGross) * 100)}%)</div>
                            </td>
                            <td className="py-3.5 px-4 text-center text-xs text-slate-500">100.0%</td>
                            <td className="py-3.5 px-4 text-center text-xs text-slate-900 dark:text-white">100.0%</td>
                            <td className="py-3.5 px-4 text-right text-xs text-slate-500">100.0%</td>
                        </tr>

                        {/* 순자산 행 */}
                        <tr className="bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-mono font-black border-t border-indigo-200/80 dark:border-indigo-900/60">
                            <td className="py-3.5 px-4 font-sans text-sm flex items-center gap-1.5">
                                <span>💎</span> 순자산 (자산 - 부채)
                            </td>
                            <td className="py-3.5 px-4 text-right text-sm">
                                <span className="text-xs text-indigo-500/80 font-normal">{formatNumber(calculation.currentNet, displayMode)}</span>
                                <span className="text-indigo-300 dark:text-indigo-700 mx-1">→</span>
                                <span className="text-sm font-black text-indigo-700 dark:text-indigo-300">{formatNumber(calculation.projectedNet, displayMode)}</span>
                            </td>
                            <td className={`py-3.5 px-4 text-right text-sm ${(calculation.projectedNet - calculation.currentNet) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                                <div>{(calculation.projectedNet - calculation.currentNet) >= 0 ? '+' : ''}{formatNumber(calculation.projectedNet - calculation.currentNet, displayMode)}</div>
                                <div className="text-[11px] font-semibold">({formatPercent((calculation.projectedNet - calculation.currentNet) / Math.max(1, calculation.currentNet) * 100)}%)</div>
                            </td>
                            <td className="py-3.5 px-4 text-center text-xs text-indigo-400">-</td>
                            <td className="py-3.5 px-4 text-center text-xs text-indigo-400">-</td>
                            <td className="py-3.5 px-4 text-right text-xs text-indigo-400">-</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};
