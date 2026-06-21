import React, { useState, useEffect, useMemo } from 'react';

export const SavedScenariosCarousel = ({ 
    scenarios, 
    onLoad, 
    onDelete, 
    onExport, 
    referenceScenarios, 
    onToggleReference, 
    onUpdateReferenceColor, 
    isPro, 
    onOpenProModal 
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    
    useEffect(() => {
        if (currentIndex >= scenarios.length && scenarios.length > 0) {
            setCurrentIndex(scenarios.length - 1);
        }
    }, [scenarios.length, currentIndex]);

    if (scenarios.length === 0) return <div className="text-sm text-gray-500">저장된 시나리오가 없습니다.</div>;

    // 삭제로 인해 currentIndex가 배열의 범위를 벗어나는 렌더링 타이밍을 방어
    const safeIndex = currentIndex >= scenarios.length ? Math.max(0, scenarios.length - 1) : currentIndex;
    const current = scenarios[safeIndex];
    if (!current) return null;

    const currentRef = referenceScenarios.find(r => r.id === current.id);
    const prev = () => setCurrentIndex(p => (p === 0 ? scenarios.length - 1 : p - 1));
    const next = () => setCurrentIndex(p => (p === scenarios.length - 1 ? 0 : p + 1));

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 relative group pb-8">
            <div className="flex items-center justify-between mb-3">
                <button onClick={prev} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="text-center">
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">{current.name}</h4>
                    <p className="text-xs text-gray-500">{new Date(current.createdAt).toLocaleDateString()} 저장</p>
                </div>
                <button onClick={next} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
            
            <div className="flex gap-2 mt-2">
                <button onClick={() => onLoad(current)} className="flex-1 py-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
                    불러오기
                </button>
                <div className="flex-1 flex gap-1">
                    <button 
                        onClick={() => isPro ? onToggleReference(current) : onOpenProModal()} 
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors border ${
                            currentRef 
                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' 
                            : isPro ? 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700'
                        }`}
                        style={currentRef ? { borderColor: currentRef.color, color: currentRef.color, backgroundColor: currentRef.color + '1A' } : {}}
                    >
                        {currentRef ? '기준 해제' : (isPro ? '비교 기준' : '🔒 비교 기준')}
                    </button>
                    {currentRef && (
                        <input 
                            type="color" 
                            value={currentRef.color} 
                            onChange={(e) => onUpdateReferenceColor(current.id, e.target.value)}
                            className="w-8 h-full p-0 border border-gray-200 dark:border-gray-600 rounded overflow-hidden cursor-pointer"
                            title="색상 변경"
                        />
                    )}
                </div>
                {onExport && (
                    <button onClick={() => onExport(current)} className="px-3 py-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg text-xs font-bold transition-colors" title="내보내기">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    </button>
                )}
                <button onClick={() => onDelete(current.id)} className="px-3 py-2 bg-white text-red-500 border border-red-100 hover:bg-red-50 dark:bg-gray-800 dark:border-red-900/30 dark:hover:bg-red-900/20 rounded-lg text-xs font-bold transition-colors">
                    삭제
                </button>
            </div>
            <div className="absolute bottom-2 right-1/2 transform translate-x-1/2 w-full flex justify-center">
                {scenarios.length > 15 ? (
                    <div className="text-[10px] text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">{currentIndex + 1} / {scenarios.length}</div>
                ) : (
                    <div className="flex gap-1">
                        {scenarios.map((_, i) => (
                            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentIndex ? 'bg-gray-400 dark:bg-gray-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export const ScenarioCompare = ({ scenarios, sectorInfo, calculateMonthlyProjection, formatNumber }) => {
    const [selectedIds, setSelectedIds] = useState([]);
    const [compareMode, setCompareMode] = useState('net'); // 'net' | 'gross'
    const toggle = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x=>x!==id) : (prev.length<3 ? [...prev,id] : prev));

    const selected = scenarios.filter(s => selectedIds.includes(s.id)).slice(0,3);
    
    const computeScenarioProjections = (scenarioData) => {
        const tempAppData = { ...scenarioData };
        const result = calculateMonthlyProjection(tempAppData, scenarioData.projectionMonths || 12);
        return result.projections;
    };

    const results = useMemo(() => {
        return selected.map(s => ({
            id: s.id,
            name: s.name,
            data: s.data,
            projections: computeScenarioProjections(s.data)
        }));
    }, [selected, calculateMonthlyProjection]);

    // Determine common months for comparison
    const allMonths = results.flatMap(r => r.projections.map(p => p.month));
    const uniqueMonths = [...new Set(allMonths)].sort((a, b) => a - b);

    // Limit to max 12 comparison points, adjust for long periods
    const maxComparisonMonths = 12;
    let comparisonInterval = 1;
    if (uniqueMonths.length > maxComparisonMonths) {
        comparisonInterval = Math.ceil(uniqueMonths.length / maxComparisonMonths);
    }
    const displayMonths = uniqueMonths.filter((_, index) => index % comparisonInterval === 0);
    if (uniqueMonths.length > 0 && !displayMonths.includes(uniqueMonths[uniqueMonths.length - 1])) {
        displayMonths.push(uniqueMonths[uniqueMonths.length - 1]); // Always include the last month
    }

    const getMonthLabel = (monthIndex, baseMonthStr) => {
        try {
            const [y,m] = (baseMonthStr || new Date().toISOString().slice(0,7)).split('-').map(Number);
            const d = new Date(y, m - 1 + monthIndex);
            return `${String(d.getFullYear()).slice(2)}년 ${String(d.getMonth()+1).padStart(2,'0')}월`;
        } catch { return `월 ${monthIndex}`; }
    };

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                <div className="flex flex-wrap gap-2">
                    {scenarios.map(s => (
                        <button key={s.id} onClick={() => toggle(s.id)} className={`px-3 py-1 border dark:border-gray-600 rounded ${selectedIds.includes(s.id) ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-400 dark:border-blue-500 dark:text-blue-300' : 'hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300'}`}>{s.name}</button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">지표:</span>
                    <select value={compareMode} onChange={e=>setCompareMode(e.target.value)} className="text-xs border rounded px-2 py-1 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:ring-1 focus:ring-blue-500 outline-none">
                        <option value="net">순자산</option>
                        <option value="gross">총자산</option>
                    </select>
                </div>
            </div>
            {results.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm dark:text-gray-300">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="p-3 text-left whitespace-nowrap">섹터/항목</th>
                                {results.map(r => (<th key={r.id} className="p-3 text-right whitespace-nowrap">{r.name} (최종)</th>))}
                                {results.length === 2 && (
                                    <th className="p-3 text-right whitespace-nowrap">차이(금액/비중)</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(sectorInfo).map(sectorKey => (
                                <React.Fragment key={sectorKey}>
                                    <tr className="border-t dark:border-gray-700">
                                        <td className="p-3 font-semibold whitespace-nowrap">{sectorInfo[sectorKey].icon} {sectorInfo[sectorKey].name}</td>
                                        {results.map(r => {
                                            const finalProjection = r.projections[r.projections.length - 1];
                                            const sectorTotal = finalProjection?.sectorTotals[sectorKey] || { amount: 0, percentage: 0 };
                                            return (
                                                <td key={r.id} className="p-3 text-right whitespace-nowrap">
                                                    {formatNumber(sectorTotal.amount)} ({(sectorTotal.percentage || 0).toFixed(1)}%)
                                                </td>
                                            );
                                        })}
                                        {results.length === 2 && (
                                            <td className="p-3 text-right text-indigo-700 dark:text-indigo-400 whitespace-nowrap">
                                                {(() => {
                                                    const finalA = results[0].projections[results[0].projections.length - 1];
                                                    const finalB = results[1].projections[results[1].projections.length - 1];
                                                    const amountA = finalA?.sectorTotals[sectorKey]?.amount || 0;
                                                    const amountB = finalB?.sectorTotals[sectorKey]?.amount || 0;
                                                    const percentA = finalA?.sectorTotals[sectorKey]?.percentage || 0;
                                                    const percentB = finalB?.sectorTotals[sectorKey]?.percentage || 0;
                                                    const diffAmount = amountB - amountA;
                                                    const diffPercent = percentB - percentA;
                                                    const signAmount = diffAmount >= 0 ? '+' : '';
                                                    const signPercent = diffPercent >= 0 ? '+' : '';
                                                    const isGood = sectorKey === 'loan' ? diffAmount <= 0 : diffAmount >= 0;
                                                    const color = isGood ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
                                                    return (
                                                        <div className={color}>
                                                            <span>{signAmount}{formatNumber(diffAmount)}</span>
                                                            <span className="text-xs ml-1">({signPercent}{diffPercent.toFixed(1)}%)</span>
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                        )}
                                    </tr>
                                    {(() => {
                                        const allItems = new Map();
                                        results.forEach(r => {
                                            const finalProjection = r.projections[r.projections.length - 1];
                                            finalProjection?.itemTotals[sectorKey]?.forEach(item => {
                                                const key = item.id || item.name;
                                                if (!allItems.has(key)) {
                                                    allItems.set(key, { name: item.name });
                                                }
                                            });
                                        });
                                        return Array.from(allItems.entries());
                                    })().map(([key, { name }]) => (
                                        <tr key={`${sectorKey}-${key}`} className="border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                            <td className="p-3 pl-8 text-sm text-gray-600 dark:text-gray-400">└ {name}</td>
                                            {results.map(r => {
                                                const finalProjection = r.projections[r.projections.length - 1]; 
                                                const items = finalProjection?.itemTotals[sectorKey] || [];
                                                const itemData = items.find(item => (item.id || item.name) === key) || { amount: 0, percentage: 0 };
                                                return (
                                                    <td key={r.id} className="p-3 text-right text-sm whitespace-nowrap">
                                                        <div>{formatNumber(itemData.amount)}</div>
                                                    </td>
                                                );
                                            })}
                                            {results.length === 2 && (
                                                <td className="p-3 text-right text-sm text-indigo-700 dark:text-indigo-400 whitespace-nowrap">
                                                    {(() => {
                                                        const finalA = results[0].projections[results[0].projections.length - 1]; 
                                                        const finalB = results[1].projections[results[1].projections.length - 1]; 
                                                        const itemsA = finalA?.itemTotals[sectorKey] || [];
                                                        const itemsB = finalB?.itemTotals[sectorKey] || [];
                                                        const itemA = itemsA.find(item => (item.id || item.name) === key) || { amount: 0, percentage: 0 };
                                                        const itemB = itemsB.find(item => (item.id || item.name) === key) || { amount: 0, percentage: 0 };

                                                        const diffAmount = itemB.amount - itemA.amount;
                                                        const signAmount = diffAmount >= 0 ? '+' : '';
                                                        const isGood = sectorKey === 'loan' ? diffAmount <= 0 : diffAmount >= 0;
                                                        const color = isGood ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
                                                        return (
                                                            <div className={color}>
                                                                <div>{signAmount}{formatNumber(diffAmount)}</div>
                                                            </div>
                                                        );
                                                    })()}
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                    }
                                </React.Fragment>
                            ))}
                            <tr className="border-t-2 border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">
                                <td className="p-3 font-bold whitespace-nowrap">총계 ({compareMode === 'gross' ? '총자산' : '순자산'})</td>
                                {results.map(r => {
                                    const finalProjection = r.projections[r.projections.length - 1];
                                    const val = compareMode === 'gross' ? finalProjection?.gross : finalProjection?.net;
                                    return (
                                        <td key={r.id} className="p-3 text-right font-bold whitespace-nowrap">{formatNumber(val || 0)}</td>
                                    );
                                })}
                                {results.length === 2 && (
                                    <td className="p-3 text-right font-bold text-indigo-700 dark:text-indigo-400 whitespace-nowrap">
                                        {(() => { 
                                            const finalA = results[0].projections[results[0].projections.length - 1];
                                            const finalB = results[1].projections[results[1].projections.length - 1];
                                            const valA = compareMode === 'gross' ? finalA?.gross : finalA?.net;
                                            const valB = compareMode === 'gross' ? finalB?.gross : finalB?.net;
                                            const diff = (valB || 0) - (valA || 0); 
                                            const sign = diff >= 0 ? '+' : '';
                                            const color = diff >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
                                            return (
                                                <div className={color}>{sign}{formatNumber(diff)}</div>
                                            );
                                        })()}
                                    </td>
                                )}
                            </tr>
                        </tbody>
                    </table>

                    {/* Monthly Comparison Table */}
                    <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mt-8 mb-4">월별 비교 (최대 12개월)</h4>
                    <table className="w-full text-sm dark:text-gray-300">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="p-3 text-left whitespace-nowrap">월차</th>
                                {results.map(r => (<th key={r.id} className="p-3 text-right whitespace-nowrap">{r.name} ({compareMode === 'gross' ? '총자산' : '순자산'})</th>))}
                                {results.length === 2 && (
                                    <th className="p-3 text-right whitespace-nowrap">차이</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {displayMonths.map(monthIndex => {
                                const monthLabel = getMonthLabel(monthIndex, results[0]?.data.baseMonth);
                                return (
                                    <tr key={monthIndex} className="border-t dark:border-gray-700">
                                        <td className="p-3 font-semibold whitespace-nowrap">{monthLabel}</td>
                                        {results.map(r => {
                                            const projection = r.projections.find(p => p.month === monthIndex);
                                            return (
                                                <td key={r.id} className="p-3 text-right whitespace-nowrap">
                                                    {projection ? formatNumber(compareMode === 'gross' ? projection.gross : projection.net) : '-'}
                                                </td>
                                            );
                                        })}
                                        {results.length === 2 && (
                                            <td className="p-3 text-right text-indigo-700 dark:text-indigo-400 whitespace-nowrap">
                                                {(() => {
                                                    const projA = results[0].projections.find(p => p.month === monthIndex);
                                                    const projB = results[1].projections.find(p => p.month === monthIndex);
                                                    if (projA && projB) {
                                                        const valA = compareMode === 'gross' ? projA.gross : projA.net;
                                                        const valB = compareMode === 'gross' ? projB.gross : projB.net;
                                                        const diff = valB - valA;
                                                        const sign = diff >= 0 ? '+' : '';
                                                        return `${sign}${formatNumber(diff)}`;
                                                    }
                                                    return '-';
                                                })()}
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-sm text-gray-500">비교할 시나리오를 최대 3개 선택하세요.</div>
            )}
        </div>
    );
};
