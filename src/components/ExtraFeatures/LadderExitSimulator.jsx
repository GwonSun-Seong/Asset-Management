import React, { useState, useMemo, useEffect } from 'react';

const PRESET_STRATEGIES = [
    {
        id: 'safe-532',
        label: '🛡️ 원금방어 우선 (50:30:20)',
        desc: '초기 구간에서 절반을 익절해 빠르게 수익을 확정하고 나머지를 홀딩',
        rungs: [
            { targetGainPct: 10, sellRatioPct: 50 },
            { targetGainPct: 20, sellRatioPct: 30 },
            { targetGainPct: 35, sellRatioPct: 20 }
        ]
    },
    {
        id: 'pyramid-235',
        label: '🚀 추세 추종 피라미드 (20:30:50)',
        desc: '상승 추세가 강할 때 위로 갈수록 매도 물량을 늘려 수익 극대화',
        rungs: [
            { targetGainPct: 15, sellRatioPct: 20 },
            { targetGainPct: 30, sellRatioPct: 30 },
            { targetGainPct: 50, sellRatioPct: 50 }
        ]
    },
    {
        id: 'even-3',
        label: '⚖️ 3등분 정석 분할 (33:33:34)',
        desc: '고점 예측 없이 기계적으로 3번에 나누어 수익을 챙기는 표준 전략',
        rungs: [
            { targetGainPct: 12, sellRatioPct: 33 },
            { targetGainPct: 25, sellRatioPct: 33 },
            { targetGainPct: 40, sellRatioPct: 34 }
        ]
    },
    {
        id: 'even-4',
        label: '🪜 4단 촘촘 사다리 (25×4)',
        desc: '변동성이 큰 종목을 4개 구간으로 잘게 쪼개어 소외감 없이 익절',
        rungs: [
            { targetGainPct: 10, sellRatioPct: 25 },
            { targetGainPct: 20, sellRatioPct: 25 },
            { targetGainPct: 30, sellRatioPct: 25 },
            { targetGainPct: 45, sellRatioPct: 25 }
        ]
    },
    {
        id: 'tenbagger-beast',
        label: '🔥 야수의 텐배거 홀딩 (100:300:700%)',
        desc: '2배에서 원금 일부 회수 후 4배·8배 대시세를 끝까지 발라먹는 야수의 심장 전략',
        rungs: [
            { targetGainPct: 100, sellRatioPct: 30 },
            { targetGainPct: 300, sellRatioPct: 30 },
            { targetGainPct: 700, sellRatioPct: 40 }
        ]
    }
];

export default function LadderExitSimulator({
    currentAppData = null,
    addToast = null
}) {
    // 보유 중인 모든 주식/ETF 추출
    const portfolioStocks = useMemo(() => {
        const list = [];
        const assets = currentAppData?.assets || {};
        Object.keys(assets).forEach(sector => {
            (assets[sector] || []).forEach(acc => {
                if (Array.isArray(acc.linkedItems)) {
                    acc.linkedItems.forEach(item => {
                        const shares = Number(item.shares) || 0;
                        const avgPrice = Number(item.avgPrice) || Number(item.currentPrice) || 0;
                        const currentPrice = Number(item.currentPrice) || avgPrice || 0;
                        if (shares > 0 && currentPrice > 0) {
                            const gainPct = avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0;
                            list.push({
                                key: `${acc.id || acc.name}_${item.id || item.ticker || item.name}`,
                                accountName: acc.name,
                                name: item.name || item.ticker,
                                ticker: item.ticker || '',
                                shares,
                                avgPrice: Math.round(avgPrice),
                                currentPrice: Math.round(currentPrice),
                                gainPct: Number(gainPct.toFixed(2)),
                                evalAmountManwon: Math.round((shares * currentPrice) / 1000) / 10
                            });
                        }
                    });
                }
            });
        });
        return list.sort((a, b) => b.evalAmountManwon - a.evalAmountManwon);
    }, [currentAppData]);

    const [selectedStockKey, setSelectedStockKey] = useState(() => portfolioStocks[0]?.key || 'custom');
    const [customName, setCustomName] = useState('직접 입력 종목');
    const [customShares, setCustomShares] = useState(100);
    const [customAvgPrice, setCustomAvgPrice] = useState(20000);
    const [customCurrentPrice, setCustomCurrentPrice] = useState(23000);

    // 기준점: 'avg' (내 평단가 대비 +%) | 'current' (현재가 대비 +%)
    const [baseRefMode, setBaseRefMode] = useState('avg');
    const [feeAndTaxPct, setFeeAndTaxPct] = useState(0.165); // 증권사별 직접 입력 지원 (기본값 0.165%)
    const [activePresetId, setActivePresetId] = useState('safe-532');
    const [rungs, setRungs] = useState(PRESET_STRATEGIES[0].rungs);

    // 저장된 예약매도 주문표 목록 (localStorage 연동 + 사이트 접속 팝업 감시용)
    const [savedPlans, setSavedPlans] = useState(() => {
        try {
            const raw = localStorage.getItem('asset_saved_ladder_plans_v1');
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    });

    useEffect(() => {
        const syncPlans = () => {
            try {
                const raw = localStorage.getItem('asset_saved_ladder_plans_v1');
                setSavedPlans(raw ? JSON.parse(raw) : []);
            } catch (e) {}
        };
        window.addEventListener('ladder-plans-updated', syncPlans);
        window.addEventListener('storage', syncPlans);
        return () => {
            window.removeEventListener('ladder-plans-updated', syncPlans);
            window.removeEventListener('storage', syncPlans);
        };
    }, []);

    const persistSavedPlans = (nextPlans) => {
        setSavedPlans(nextPlans);
        try {
            localStorage.setItem('asset_saved_ladder_plans_v1', JSON.stringify(nextPlans));
            window.dispatchEvent(new CustomEvent('ladder-plans-updated'));
        } catch (e) {}
    };

    // 포트폴리오 종목 선택 변경 시 저장된 플랜이 있으면 자동 불러오기 또는 동기화
    useEffect(() => {
        if (selectedStockKey !== 'custom' && portfolioStocks.length > 0) {
            const found = portfolioStocks.find(s => s.key === selectedStockKey);
            if (!found) {
                setSelectedStockKey(portfolioStocks[0].key);
            }
        }
    }, [portfolioStocks, selectedStockKey]);

    const targetStock = useMemo(() => {
        if (selectedStockKey === 'custom' || portfolioStocks.length === 0) {
            const sh = Math.max(1, Number(customShares) || 1);
            const avg = Math.max(1, Number(customAvgPrice) || 1);
            const cur = Math.max(1, Number(customCurrentPrice) || avg);
            const gainPct = ((cur - avg) / avg) * 100;
            return {
                key: `custom_${customName || '직접입력'}`,
                name: customName || '직접 입력 종목',
                ticker: '',
                accountName: '직접 시뮬레이션',
                shares: sh,
                avgPrice: avg,
                currentPrice: cur,
                gainPct: Number(gainPct.toFixed(2))
            };
        }
        return portfolioStocks.find(s => s.key === selectedStockKey) || portfolioStocks[0];
    }, [selectedStockKey, portfolioStocks, customName, customShares, customAvgPrice, customCurrentPrice]);

    const handleSelectPreset = (preset) => {
        setActivePresetId(preset.id);
        // 만약 이미 현재가가 평단가보다 많이 올라있는 경우(예: +25%), 현재가 기준이나 평단가 기준에 맞춰 자연스럽게 세팅
        if (baseRefMode === 'avg' && targetStock.gainPct >= preset.rungs[0].targetGainPct) {
            const baseGain = Math.max(5, Math.ceil(targetStock.gainPct / 5) * 5);
            setRungs(preset.rungs.map((r, i) => ({
                ...r,
                targetGainPct: baseGain + (i + 1) * 10
            })));
        } else {
            setRungs(preset.rungs.map(r => ({ ...r })));
        }
    };

    const handleUpdateRung = (idx, field, val) => {
        setActivePresetId('custom');
        const maxLimit = field === 'targetGainPct' ? 10000 : 100;
        const parsed = Math.min(maxLimit, Math.max(1, Number(val) || 0));
        setRungs(prev => prev.map((r, i) => i === idx ? { ...r, [field]: parsed } : r));
    };

    const handleAddRung = () => {
        if (rungs.length >= 5) return;
        const lastGain = rungs[rungs.length - 1]?.targetGainPct || 30;
        setActivePresetId('custom');
        setRungs(prev => [...prev, { targetGainPct: lastGain + 25, sellRatioPct: 20 }]);
    };

    const handleRemoveRung = (idx) => {
        if (rungs.length <= 2) return;
        setActivePresetId('custom');
        setRungs(prev => prev.filter((_, i) => i !== idx));
    };

    // 사다리 매도 단계별 정밀 계산
    const simulation = useMemo(() => {
        const totalShares = Math.max(1, Math.floor(targetStock.shares));
        const avgPrice = Math.max(1, targetStock.avgPrice);
        const currentPrice = Math.max(1, targetStock.currentPrice);
        const totalCost = totalShares * avgPrice;
        const currentEval = totalShares * currentPrice;
        const currentUnrealizedProfit = currentEval - totalCost;
        const feeRate = Math.max(0, Number(feeAndTaxPct) || 0) / 100;

        // 비중 총합 정규화
        const rawWeightSum = rungs.reduce((acc, r) => acc + (Number(r.sellRatioPct) || 0), 0) || 100;

        let allocatedShares = 0;
        let cumulativeRealizedNetProfit = 0;
        let cumulativeGainVsCurrent = 0;
        let cumulativeCashReceived = 0;
        let remainingShares = totalShares;

        const computedRungs = rungs.map((r, idx) => {
            const isLast = idx === rungs.length - 1;
            const normalizedWeight = (Number(r.sellRatioPct) || 0) / rawWeightSum;

            // 매도 수량 (마지막 단계는 남은 수량 전부 배정)
            const sellShares = isLast
                ? Math.max(0, totalShares - allocatedShares)
                : Math.min(remainingShares, Math.round(totalShares * normalizedWeight));

            allocatedShares += sellShares;
            remainingShares = Math.max(0, totalShares - allocatedShares);

            // 목표 단가 산출
            const basePrice = baseRefMode === 'avg' ? avgPrice : currentPrice;
            const targetPrice = Math.round(basePrice * (1 + (Number(r.targetGainPct) || 0) / 100));

            // 평단가 대비 수익률 및 현재가 대비 필요 상승률
            const gainVsAvgPct = ((targetPrice - avgPrice) / avgPrice) * 100;
            const neededFromCurrentPct = ((targetPrice - currentPrice) / currentPrice) * 100;

            // 해당 차수 매도 금액 및 순수익(수수료 차감 후, 내 매입 평단가 기준 확정 순수익)
            const grossSellAmount = sellShares * targetPrice;
            const feeAmount = Math.round(grossSellAmount * feeRate);
            const netSellAmount = grossSellAmount - feeAmount;
            const costOfSoldShares = sellShares * avgPrice;
            const currentEvalOfSoldShares = sellShares * currentPrice;
            const stepNetProfit = netSellAmount - costOfSoldShares; // 매입가(원금) 기준 확정 순수익
            const stepGainVsCurrent = netSellAmount - currentEvalOfSoldShares; // 현재 평가액 대비 추가 수익

            cumulativeRealizedNetProfit += stepNetProfit;
            cumulativeGainVsCurrent += stepGainVsCurrent;
            cumulativeCashReceived += netSellAmount;

            // 핵심 지표: 남은 물량의 '무적 방어선(손익분기 주가)'
            // 남은 수량(remainingShares)의 평가손실이 지금까지 확정한 누적 수익(cumulativeRealizedNetProfit)과 같아지는 주가
            // 즉, remainingShares * (breakevenPrice - avgPrice) + cumulativeRealizedNetProfit = 0
            // => breakevenPrice = avgPrice - (cumulativeRealizedNetProfit / remainingShares)
            let breakevenFloorPrice = 0;
            let dropBufferFromCurrentPct = 100;
            if (remainingShares > 0) {
                breakevenFloorPrice = Math.max(0, Math.round(avgPrice - (cumulativeRealizedNetProfit / remainingShares)));
                dropBufferFromCurrentPct = ((currentPrice - breakevenFloorPrice) / currentPrice) * 100;
            }

            return {
                step: idx + 1,
                targetGainPct: r.targetGainPct,
                sellRatioPct: r.sellRatioPct,
                normalizedPct: Math.round(normalizedWeight * 100),
                targetPrice,
                gainVsAvgPct: Number(gainVsAvgPct.toFixed(1)),
                neededFromCurrentPct: Number(neededFromCurrentPct.toFixed(1)),
                alreadyReached: targetPrice <= currentPrice,
                sellShares,
                remainingShares,
                netSellAmount,
                stepNetProfit,
                stepGainVsCurrent,
                cumulativeRealizedNetProfit,
                cumulativeGainVsCurrent,
                cumulativeCashReceived,
                breakevenFloorPrice,
                dropBufferFromCurrentPct: Number(dropBufferFromCurrentPct.toFixed(1))
            };
        });

        const totalAvgExitPrice = totalShares > 0 ? Math.round(cumulativeCashReceived / totalShares) : 0;
        const totalNetReturnPct = totalCost > 0 ? ((cumulativeRealizedNetProfit / totalCost) * 100).toFixed(2) : '0.00';
        const totalExtraReturnVsCurrentPct = currentEval > 0 ? ((cumulativeGainVsCurrent / currentEval) * 100).toFixed(2) : '0.00';

        return {
            totalShares,
            avgPrice,
            currentPrice,
            totalCost,
            currentEval,
            currentUnrealizedProfit,
            rawWeightSum,
            computedRungs,
            totalRealizedProfit: cumulativeRealizedNetProfit,
            totalGainVsCurrent: cumulativeGainVsCurrent,
            totalCashReceived: cumulativeCashReceived,
            totalAvgExitPrice,
            totalNetReturnPct,
            totalExtraReturnVsCurrentPct
        };
    }, [targetStock, rungs, baseRefMode, feeAndTaxPct]);

    const formatWon = (val) => `${Math.round(val).toLocaleString()}원`;
    const formatManWon = (val) => {
        const man = val / 10000;
        if (Math.abs(man) >= 10000) {
            const eok = Math.floor(Math.abs(man) / 10000);
            const rem = Math.round(Math.abs(man) % 10000);
            return `${val < 0 ? '-' : ''}${eok}억 ${rem > 0 ? `${rem.toLocaleString()}만원` : '원'}`;
        }
        if (Math.abs(man) >= 10) {
            return `${Math.round(man).toLocaleString()}만원`;
        }
        return `${(Math.round(man * 10) / 10).toLocaleString()}만원`;
    };
    const formatSignedManWon = (val) => `${val >= 0 ? '+' : ''}${formatManWon(val)}`;

    const handleSaveCurrentPlan = () => {
        const planKey = targetStock.key || `custom_${targetStock.name}`;
        const existingPlan = savedPlans.find(p => p.stockKey === planKey || (p.name === targetStock.name && p.accountName === targetStock.accountName));

        const newPlan = {
            id: existingPlan?.id || `ladder_${Date.now()}`,
            stockKey: planKey,
            name: targetStock.name,
            ticker: targetStock.ticker || '',
            accountName: targetStock.accountName || '직접 시뮬레이션',
            shares: simulation.totalShares,
            avgPrice: simulation.avgPrice,
            savedCurrentPrice: simulation.currentPrice,
            baseRefMode,
            feeAndTaxPct: Number(feeAndTaxPct) || 0,
            activePresetId,
            rungs: simulation.computedRungs.map(r => {
                const prevRung = existingPlan?.rungs?.find(pr => pr.step === r.step && pr.targetPrice === r.targetPrice);
                return {
                    step: r.step,
                    targetGainPct: r.targetGainPct,
                    sellRatioPct: r.sellRatioPct,
                    normalizedPct: r.normalizedPct,
                    targetPrice: r.targetPrice,
                    sellShares: r.sellShares,
                    remainingShares: r.remainingShares,
                    netSellAmount: r.netSellAmount,
                    stepNetProfit: r.stepNetProfit,
                    breakevenFloorPrice: r.breakevenFloorPrice,
                    executed: prevRung ? !!prevRung.executed : false,
                    dismissed: prevRung ? !!prevRung.dismissed : false
                };
            }),
            updatedAt: new Date().toISOString()
        };

        const nextPlans = existingPlan
            ? savedPlans.map(p => p.id === existingPlan.id ? newPlan : p)
            : [newPlan, ...savedPlans];

        // 새 플랜 저장 시 세션 스누즈 해제하여 목표가 도달 상태면 바로 확인할 수 있게 함
        try { sessionStorage.removeItem('ladder_alert_snooze_session'); } catch (e) {}
        persistSavedPlans(nextPlans);

        if (addToast) {
            addToast(`💾 '${targetStock.name}' 예약매도 주문표가 저장되었습니다! 목표가 도달 시 접속 팝업으로 알려드립니다.`, 'success');
        }
    };

    const handleLoadPlan = (plan) => {
        const matchedPortfolioStock = portfolioStocks.find(
            s => s.key === plan.stockKey || (s.name === plan.name && s.accountName === plan.accountName) || (plan.ticker && s.ticker === plan.ticker)
        );
        if (matchedPortfolioStock) {
            setSelectedStockKey(matchedPortfolioStock.key);
        } else {
            setSelectedStockKey('custom');
            setCustomName(plan.name);
            setCustomShares(plan.shares);
            setCustomAvgPrice(plan.avgPrice);
            setCustomCurrentPrice(plan.savedCurrentPrice || plan.avgPrice);
        }
        setBaseRefMode(plan.baseRefMode || 'avg');
        setFeeAndTaxPct(plan.feeAndTaxPct ?? 0.165);
        setActivePresetId(plan.activePresetId || 'custom');
        setRungs(plan.rungs.map(r => ({
            targetGainPct: r.targetGainPct,
            sellRatioPct: r.sellRatioPct
        })));
        if (addToast) {
            addToast(`📂 '${plan.name}' 예약매도 주문표를 시뮬레이터로 불러왔습니다.`, 'info');
        }
    };

    const handleDeletePlan = (planId, planName) => {
        const nextPlans = savedPlans.filter(p => p.id !== planId);
        persistSavedPlans(nextPlans);
        if (addToast) {
            addToast(`🗑️ '${planName}' 예약매도 주문표가 삭제되었습니다.`, 'info');
        }
    };

    const handleToggleRungExecution = (planId, stepNum) => {
        const nextPlans = savedPlans.map(p => {
            if (p.id !== planId) return p;
            return {
                ...p,
                rungs: p.rungs.map(r => r.step === stepNum ? { ...r, executed: !r.executed, dismissed: false } : r)
            };
        });
        persistSavedPlans(nextPlans);
    };

    const handleResetPlanAlerts = (planId, planName) => {
        const nextPlans = savedPlans.map(p => {
            if (p.id !== planId) return p;
            return {
                ...p,
                rungs: p.rungs.map(r => ({ ...r, dismissed: false }))
            };
        });
        try { sessionStorage.removeItem('ladder_alert_snooze_session'); } catch (e) {}
        persistSavedPlans(nextPlans);
        if (addToast) {
            addToast(`🔔 '${planName}'의 꺼진 목표가 알림을 다시 활성화했습니다.`, 'success');
        }
    };

    // 현재 선택된 종목이 이미 저장되어 있는지 확인
    const currentSavedPlan = useMemo(() => {
        const planKey = targetStock.key || `custom_${targetStock.name}`;
        return savedPlans.find(p => p.stockKey === planKey || (p.name === targetStock.name && p.accountName === targetStock.accountName));
    }, [savedPlans, targetStock]);

    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            {/* 헤더 카드 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 shadow-xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-300 dark:border-indigo-700/50 text-indigo-800 dark:text-indigo-300 text-[10px] font-black">
                                분할 매도 & 방어선 계산기
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                                내 보유 종목 실시간 연동 · 최대 +10,000%(100배) 지원
                            </span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
                            <span>🪜</span> 분할 익절(사다리 매도) 수익 시뮬레이터
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            한 번에 다 팔아 고점을 놓치거나, 욕심부리다 수익을 반납하지 않도록 단계별 매도 주수와 <b>남은 물량의 무적 방어선(본전 보장 주가)</b>을 계산합니다.
                        </p>
                    </div>

                    {/* 전량 사다리 익절 완료 시 총 예상 수익 요약 */}
                    <div className="bg-white dark:bg-gray-900 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
                        <div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1.5">
                                <span>사다리 전 구간 체결 시 총 확정 순수익</span>
                                <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[9px] font-black border border-emerald-200 dark:border-emerald-800">
                                    매입가(원금) 기준
                                </span>
                            </div>
                            <div className={`text-xl sm:text-2xl font-black mt-0.5 tabular-nums ${simulation.totalRealizedProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                                {formatSignedManWon(simulation.totalRealizedProfit)}
                                <span className="text-xs font-extrabold ml-1.5 text-emerald-500">
                                    (평단 대비 {Number(simulation.totalNetReturnPct) >= 0 ? '+' : ''}{simulation.totalNetReturnPct}%)
                                </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 tabular-nums flex flex-wrap items-center gap-x-2">
                                <span>현재 평가액 대비 추가 이익: <b className="text-indigo-600 dark:text-indigo-400">{formatSignedManWon(simulation.totalGainVsCurrent)}</b> ({Number(simulation.totalExtraReturnVsCurrentPct) >= 0 ? '+' : ''}{simulation.totalExtraReturnVsCurrentPct}%)</span>
                                <span>·</span>
                                <span>총 회수금 {formatManWon(simulation.totalCashReceived)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 1. 종목 선택 및 기준 설정 바 */}
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-2xs space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                    {/* 보유 종목 선택 드롭다운 */}
                    <div className="lg:col-span-5">
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-200 mb-1.5">
                            📌 시뮬레이션 대상 종목 선택
                        </label>
                        <select
                            value={selectedStockKey}
                            onChange={(e) => setSelectedStockKey(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {portfolioStocks.map(st => (
                                <option key={st.key} value={st.key}>
                                    [{st.accountName}] {st.name} ({st.shares}주 · 평단 {st.avgPrice.toLocaleString()}원 · 현재 {st.gainPct >= 0 ? `+${st.gainPct}%` : `${st.gainPct}%`})
                                </option>
                            ))}
                            <option value="custom">✍️ 직접 수치 입력해서 계산하기</option>
                        </select>
                    </div>

                    {/* 목표 수익률 기준점 선택 */}
                    <div className="lg:col-span-4">
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-200 mb-1.5">
                            🎯 단계별 목표가 산정 기준 <span className="text-[10px] font-bold text-slate-400">(순수익은 항상 매입가 기준)</span>
                        </label>
                        <div className="grid grid-cols-2 gap-1.5 bg-slate-100 dark:bg-gray-900 p-1 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setBaseRefMode('avg')}
                                className={`py-2 px-2.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                    baseRefMode === 'avg'
                                        ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                            >
                                내 평단가 대비 +%
                            </button>
                            <button
                                type="button"
                                onClick={() => setBaseRefMode('current')}
                                className={`py-2 px-2.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                    baseRefMode === 'current'
                                        ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                            >
                                현재가 대비 +%
                            </button>
                        </div>
                    </div>

                    {/* 수수료/제세금 직접 입력 + 빠른 칩 */}
                    <div className="lg:col-span-3">
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-200 mb-1.5 flex items-center justify-between">
                            <span>🧾 매도 수수료·거래세율 (%)</span>
                            <span className="text-[10px] font-bold text-slate-400">증권사별 직접 입력</span>
                        </label>
                        <div className="flex items-center gap-1.5">
                            <div className="relative flex-1">
                                <input
                                    type="number"
                                    step="0.001"
                                    min="0"
                                    max="10"
                                    value={feeAndTaxPct}
                                    onChange={(e) => setFeeAndTaxPct(e.target.value)}
                                    placeholder="0.165"
                                    className="w-full pl-3 pr-7 py-2 rounded-xl bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-400 tabular-nums outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 pointer-events-none">%</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-1 mt-1.5">
                            {[
                                { label: 'ETF 0.015%', val: 0.015 },
                                { label: '국내우대 0.165%', val: 0.165 },
                                { label: '국내일반 0.2%', val: 0.2 },
                                { label: '해외우대 0.07%', val: 0.07 },
                                { label: '해외일반 0.25%', val: 0.25 }
                            ].map(opt => (
                                <button
                                    key={opt.label}
                                    type="button"
                                    onClick={() => setFeeAndTaxPct(opt.val)}
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold border transition-all cursor-pointer ${
                                        Number(feeAndTaxPct) === opt.val
                                            ? 'bg-indigo-600 border-indigo-600 text-white'
                                            : 'bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-gray-700 text-slate-500 hover:border-indigo-300'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 직접 입력 모드일 때 입력 폼 노출 */}
                {(selectedStockKey === 'custom' || portfolioStocks.length === 0) && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-gray-700">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 mb-1">종목명</label>
                            <input
                                type="text"
                                value={customName}
                                onChange={(e) => setCustomName(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 mb-1">보유 수량 (주)</label>
                            <input
                                type="number"
                                min="1"
                                value={customShares}
                                onChange={(e) => setCustomShares(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-xs font-bold text-slate-800 dark:text-slate-100 tabular-nums"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 mb-1">내 매입 평단가 (원)</label>
                            <input
                                type="number"
                                min="1"
                                value={customAvgPrice}
                                onChange={(e) => setCustomAvgPrice(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-xs font-bold text-slate-800 dark:text-slate-100 tabular-nums"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 mb-1">현재 주가 (원)</label>
                            <input
                                type="number"
                                min="1"
                                value={customCurrentPrice}
                                onChange={(e) => setCustomCurrentPrice(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-xs font-bold text-slate-800 dark:text-slate-100 tabular-nums"
                            />
                        </div>
                    </div>
                )}

                {/* 선택된 종목의 현재 포지션 요약 바 */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-gray-900/70 border border-slate-200/70 dark:border-gray-700 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                        <div className="text-[10px] font-bold text-slate-400">보유 수량 / 매입원금</div>
                        <div className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 mt-0.5 tabular-nums">
                            {simulation.totalShares.toLocaleString()}주 ({formatManWon(simulation.totalCost)})
                        </div>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-400">내 평단가 ➔ 현재가</div>
                        <div className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 mt-0.5 tabular-nums">
                            {formatWon(simulation.avgPrice)} ➔ <span className="text-indigo-600 dark:text-indigo-400">{formatWon(simulation.currentPrice)}</span>
                        </div>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-400">현재 평가금액</div>
                        <div className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 mt-0.5 tabular-nums">
                            {formatManWon(simulation.currentEval)}
                        </div>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-400">현재 미실현 평가손익</div>
                        <div className={`text-xs sm:text-sm font-black mt-0.5 tabular-nums ${
                            simulation.currentUnrealizedProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                        }`}>
                            {formatSignedManWon(simulation.currentUnrealizedProfit)} ({targetStock.gainPct >= 0 ? `+${targetStock.gainPct}%` : `${targetStock.gainPct}%`})
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. 사다리 전략 프리셋 & 단계별 슬라이더 조정 */}
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-gray-700 pb-3">
                    <div>
                        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <span>🎛️</span> 분할 익절 사다리 설계
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            전략 프리셋을 선택하거나 각 차수별 목표 수익률(슬라이더 최대 +1,000% · 숫자 직접 입력 최대 +10,000%)과 매도 비중을 자유롭게 조절하세요.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {rungs.length < 5 && (
                            <button
                                type="button"
                                onClick={handleAddRung}
                                className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 text-xs font-black transition-colors cursor-pointer"
                            >
                                + 매도 단계 추가 ({rungs.length}/5)
                            </button>
                        )}
                    </div>
                </div>

                {/* 프리셋 버튼들 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                    {PRESET_STRATEGIES.map(preset => (
                        <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleSelectPreset(preset)}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                activePresetId === preset.id
                                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/30'
                                    : 'bg-slate-50 dark:bg-gray-900/60 border-slate-200 dark:border-gray-700 hover:border-slate-300'
                            }`}
                        >
                            <div className="text-xs font-black text-slate-800 dark:text-slate-100">{preset.label}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{preset.desc}</div>
                        </button>
                    ))}
                </div>

                {/* 단계별 상세 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    {simulation.computedRungs.map((rung, idx) => (
                        <div
                            key={rung.step}
                            className="p-4 rounded-xl bg-slate-50 dark:bg-gray-900/80 border border-slate-200 dark:border-gray-700 flex flex-col justify-between space-y-3 relative"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[11px] font-black">
                                        {rung.step}차 익절
                                    </span>
                                    <span className="text-xs font-black text-slate-700 dark:text-slate-200 tabular-nums">
                                        비중 {rung.normalizedPct}% ({rung.sellShares.toLocaleString()}주)
                                    </span>
                                </div>
                                {rungs.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveRung(idx)}
                                        className="text-slate-400 hover:text-rose-500 text-xs font-bold cursor-pointer"
                                        title="이 단계 삭제"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {/* 목표 수익률 & 매도 비중 슬라이더 + 직접 입력 */}
                            <div className="space-y-2.5 bg-white dark:bg-gray-800 p-3 rounded-lg border border-slate-200/70 dark:border-gray-700">
                                <div>
                                    <div className="flex justify-between items-center text-[11px] font-bold mb-1.5">
                                        <span className="text-slate-500">
                                            {baseRefMode === 'avg' ? '평단가 대비 목표 수익률' : '현재가 대비 목표 상승률'}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <span className="text-indigo-600 dark:text-indigo-400 font-black">+</span>
                                            <input
                                                type="number"
                                                min="1"
                                                max="10000"
                                                value={rung.targetGainPct}
                                                onChange={(e) => handleUpdateRung(idx, 'targetGainPct', e.target.value)}
                                                className="w-16 px-1.5 py-0.5 text-right rounded bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 font-black text-xs tabular-nums focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            />
                                            <span className="text-indigo-600 dark:text-indigo-400 font-black">%</span>
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min="3"
                                        max="1000"
                                        step={rung.targetGainPct >= 200 ? 10 : rung.targetGainPct >= 100 ? 5 : 1}
                                        value={Math.min(1000, rung.targetGainPct)}
                                        onChange={(e) => handleUpdateRung(idx, 'targetGainPct', e.target.value)}
                                        className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-gray-700 rounded-lg"
                                    />
                                    {/* 빠른 배수 칩 */}
                                    <div className="flex items-center justify-between gap-1 mt-1.5">
                                        {[
                                            { label: '+30%', val: 30 },
                                            { label: '+50%', val: 50 },
                                            { label: '+100%(2배)', val: 100 },
                                            { label: '+300%(4배)', val: 300 },
                                            { label: '+900%(10배)', val: 900 }
                                        ].map(chip => (
                                            <button
                                                key={chip.val}
                                                type="button"
                                                onClick={() => handleUpdateRung(idx, 'targetGainPct', chip.val)}
                                                className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold transition-colors cursor-pointer ${
                                                    Number(rung.targetGainPct) === chip.val
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-slate-100 dark:bg-gray-700 text-slate-500 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50'
                                                }`}
                                            >
                                                {chip.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-[11px] font-bold mb-1">
                                        <span className="text-slate-500">물량 배정 가중치</span>
                                        <span className="text-slate-700 dark:text-slate-200 font-black tabular-nums">
                                            {rung.sellRatioPct}% (실제 {rung.normalizedPct}%)
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="10"
                                        max="80"
                                        step="5"
                                        value={rung.sellRatioPct}
                                        onChange={(e) => handleUpdateRung(idx, 'sellRatioPct', e.target.value)}
                                        className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-gray-700 rounded-lg"
                                    />
                                </div>
                            </div>

                            {/* 계산된 주문 가격 & 확정 수익 */}
                            <div className="space-y-1.5 text-xs">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 font-bold">목표 지정가</span>
                                    <span className="font-black text-slate-900 dark:text-white tabular-nums">
                                        {formatWon(rung.targetPrice)}
                                        <span className={`ml-1 text-[10px] ${rung.alreadyReached ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
                                            ({rung.alreadyReached ? '현재가 도달 완료' : `현재가 +${rung.neededFromCurrentPct}%`})
                                        </span>
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 font-bold flex items-center gap-1">
                                        <span>{rung.step}차 확정 순수익</span>
                                        <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-black">매입가 기준</span>
                                    </span>
                                    <span className={`font-black tabular-nums ${rung.stepNetProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                                        {formatSignedManWon(rung.stepNetProfit)}
                                        <span className="text-[10px] font-bold ml-1 opacity-80">
                                            (평단 {rung.gainVsAvgPct >= 0 ? '+' : ''}{rung.gainVsAvgPct}%)
                                        </span>
                                    </span>
                                </div>
                                {baseRefMode === 'current' && (
                                    <div className="flex justify-between items-center text-[11px]">
                                        <span className="text-slate-400 font-bold">└ 현재 평가액 대비 추가수익</span>
                                        <span className="font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                                            {formatSignedManWon(rung.stepGainVsCurrent)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 font-bold">누적 회수 현금</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                                        {formatManWon(rung.cumulativeCashReceived)}
                                    </span>
                                </div>
                            </div>

                            {/* 핵심: 남은 물량의 무적 평단가(하락 방어선) */}
                            <div className="pt-2.5 border-t border-slate-200/80 dark:border-gray-700">
                                {rung.remainingShares > 0 ? (
                                    <div className="p-2.5 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/50">
                                        <div className="flex items-center justify-between text-[11px] font-black text-emerald-800 dark:text-emerald-300">
                                            <span>🛡️ 잔여 {rung.remainingShares.toLocaleString()}주 본전 방어선</span>
                                            <span className="tabular-nums">{formatWon(rung.breakevenFloorPrice)}</span>
                                        </div>
                                        <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold mt-1 leading-snug">
                                            매입원금 대비 이미 <b>{formatSignedManWon(rung.cumulativeRealizedNetProfit)}</b> 수익을 확정했으므로, 남은 {rung.remainingShares}주는 현재가 대비 <b>-{rung.dropBufferFromCurrentPct}%</b>({formatWon(rung.breakevenFloorPrice)})까지 내려가도 전체 매매는 본전 이상입니다.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-2.5 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/50 text-center">
                                        <div className="text-[11px] font-black text-indigo-800 dark:text-indigo-300">
                                            🎉 잔여 물량 0주 (전량 익절 완료!)
                                        </div>
                                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold mt-0.5 tabular-nums">
                                            매입원금 대비 최종 확정 순수익 {formatSignedManWon(rung.cumulativeRealizedNetProfit)} 달성
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. 증권사 예약매도 주문표 요약 테이블 & 저장 */}
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <span>📋</span> 증권사 앱 예약매도 주문표 ({targetStock.name})
                            {currentSavedPlan && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-black border border-emerald-300 dark:border-emerald-800">
                                    🔔 목표가 감시 저장됨
                                </span>
                            )}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            주문표를 저장해 두면 사이트 접속 및 실시간 시세 연동 시 <b>목표 지정가에 도달한 차수를 팝업 모달</b>로 즉시 알려드립니다.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={handleSaveCurrentPlan}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-black shadow-sm flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                        >
                            <span>💾</span>
                            <span>{currentSavedPlan ? '이 종목 예약매도 주문표 업데이트 저장' : '이 종목 예약매도 주문표 저장 (목표가 알림 ON)'}</span>
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-gray-700 text-[11px] text-slate-400 font-black">
                                <th className="py-2.5 px-3">차수</th>
                                <th className="py-2.5 px-3 text-right">예약 지정가</th>
                                <th className="py-2.5 px-3 text-right">평단 대비</th>
                                <th className="py-2.5 px-3 text-right">현재가 대비</th>
                                <th className="py-2.5 px-3 text-right">주문 수량</th>
                                <th className="py-2.5 px-3 text-right">매도 수령액</th>
                                <th className="py-2.5 px-3 text-right">차수 확정수익 (매입가 기준)</th>
                                <th className="py-2.5 px-3 text-right">남은 수량 본전방어선</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-gray-700/60 font-bold">
                            {simulation.computedRungs.map(r => (
                                <tr key={r.step} className="hover:bg-slate-50/80 dark:hover:bg-gray-900/40">
                                    <td className="py-2.5 px-3 font-black text-slate-800 dark:text-slate-100">
                                        {r.step}차 매도 ({r.normalizedPct}%)
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                                        {formatWon(r.targetPrice)}
                                    </td>
                                    <td className={`py-2.5 px-3 text-right tabular-nums ${r.gainVsAvgPct >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                                        {r.gainVsAvgPct >= 0 ? '+' : ''}{r.gainVsAvgPct}%
                                    </td>
                                    <td className="py-2.5 px-3 text-right text-indigo-500 dark:text-indigo-400 tabular-nums">
                                        {r.neededFromCurrentPct >= 0 ? '+' : ''}{r.neededFromCurrentPct}%
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-black text-slate-900 dark:text-white tabular-nums">
                                        {r.sellShares.toLocaleString()}주
                                    </td>
                                    <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300 tabular-nums">
                                        {formatManWon(r.netSellAmount)}
                                    </td>
                                    <td className={`py-2.5 px-3 text-right font-black tabular-nums ${r.stepNetProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                                        {formatSignedManWon(r.stepNetProfit)}
                                    </td>
                                    <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-300 tabular-nums">
                                        {r.remainingShares > 0
                                            ? `${formatWon(r.breakevenFloorPrice)} (잔여 ${r.remainingShares}주)`
                                            : '전량 매도 완료'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 4. 저장된 예약매도 주문표 & 실시간 목표가 감시 보드 */}
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-gray-700 pb-3">
                    <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <span>🔔</span> 저장된 예약매도 주문표 & 목표가 도달 감시 목록
                            <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 text-[11px] font-black">
                                {savedPlans.length}개 종목
                            </span>
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            저장된 종목의 현재가가 차수별 목표 지정가에 도달하면 사이트 진입 시 <b>자동 팝업 모달</b>이 뜹니다. 이미 매도한 차수는 클릭해 체결 완료로 체크하세요.
                        </p>
                    </div>
                    {savedPlans.length > 0 && (
                        <button
                            type="button"
                            onClick={() => window.dispatchEvent(new CustomEvent('open-ladder-alert-preview'))}
                            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-black transition-colors cursor-pointer shrink-0"
                        >
                            🔔 목표가 도달 알림 모달 띄워보기
                        </button>
                    )}
                </div>

                {savedPlans.length === 0 ? (
                    <div className="p-6 rounded-xl bg-slate-50 dark:bg-gray-900/50 border border-dashed border-slate-200 dark:border-gray-700 text-center space-y-1">
                        <div className="text-xs font-black text-slate-500 dark:text-slate-400">
                            아직 저장된 예약매도 주문표가 없습니다.
                        </div>
                        <div className="text-[11px] text-slate-400">
                            위 표 우측 상단의 <b>[💾 이 종목 예약매도 주문표 저장]</b> 버튼을 누르면 종목별 익절 계획이 저장되고 목표가 도달 알림이 작동합니다.
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {savedPlans.map(plan => {
                            const liveMatch = portfolioStocks.find(
                                s => s.key === plan.stockKey || (s.name === plan.name && s.accountName === plan.accountName) || (plan.ticker && s.ticker === plan.ticker)
                            );
                            const livePrice = liveMatch ? liveMatch.currentPrice : (plan.savedCurrentPrice || plan.avgPrice);
                            const hasDismissed = (plan.rungs || []).some(r => r.dismissed);

                            return (
                                <div
                                    key={plan.id}
                                    className="p-3.5 rounded-xl bg-slate-50/90 dark:bg-gray-900/70 border border-slate-200 dark:border-gray-700 flex flex-col justify-between gap-3"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                                                    {plan.name}
                                                </span>
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-gray-800 text-slate-600 dark:text-slate-300">
                                                    {plan.accountName}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                                                    수수료 {plan.feeAndTaxPct}%
                                                </span>
                                            </div>
                                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mt-0.5 tabular-nums">
                                                보유 {plan.shares.toLocaleString()}주 · 평단 {formatWon(plan.avgPrice)} · 현재가 <b className="text-indigo-600 dark:text-indigo-400">{formatWon(livePrice)}</b>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => handleLoadPlan(plan)}
                                                className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 hover:border-indigo-400 text-[11px] font-black text-indigo-600 dark:text-indigo-400 cursor-pointer"
                                            >
                                                📂 불러오기
                                            </button>
                                            {hasDismissed && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleResetPlanAlerts(plan.id, plan.name)}
                                                    className="px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-[10px] font-black text-amber-700 dark:text-amber-300 cursor-pointer"
                                                    title="다시 보지 않기로 끈 알림 복구"
                                                >
                                                    🔔 알림켜기
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleDeletePlan(plan.id, plan.name)}
                                                className="px-2 py-1 rounded-lg bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 hover:border-rose-400 text-[11px] font-black text-rose-500 cursor-pointer"
                                                title="주문표 삭제"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>

                                    {/* 차수별 도달 현황 칩 */}
                                    <div className="space-y-1.5">
                                        {(plan.rungs || []).map(r => {
                                            const isReached = livePrice >= r.targetPrice;
                                            const remainPct = livePrice > 0 ? (((r.targetPrice - livePrice) / livePrice) * 100).toFixed(1) : '0.0';
                                            return (
                                                <div
                                                    key={r.step}
                                                    onClick={() => handleToggleRungExecution(plan.id, r.step)}
                                                    className={`px-2.5 py-1.5 rounded-lg border text-[11px] flex items-center justify-between gap-2 cursor-pointer transition-all ${
                                                        r.executed
                                                            ? 'bg-slate-100 dark:bg-gray-800/60 border-slate-200 dark:border-gray-700 text-slate-400 line-through'
                                                            : isReached
                                                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 shadow-2xs'
                                                            : 'bg-white dark:bg-gray-800 border-slate-200/80 dark:border-gray-700 text-slate-700 dark:text-slate-200'
                                                    }`}
                                                    title="클릭하여 매도 체결 완료 / 미체결 전환"
                                                >
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!r.executed}
                                                            onChange={() => {}}
                                                            className="rounded accent-emerald-600 cursor-pointer"
                                                        />
                                                        <span className="font-black">{r.step}차 ({r.sellShares}주)</span>
                                                        <span className="font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                                                            지정가 {formatWon(r.targetPrice)}
                                                        </span>
                                                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold tabular-nums">
                                                            ({formatSignedManWon(r.stepNetProfit)})
                                                        </span>
                                                    </div>
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-black shrink-0 ${
                                                        r.executed
                                                            ? 'bg-slate-200 dark:bg-gray-700 text-slate-600 dark:text-slate-300 no-underline'
                                                            : isReached
                                                            ? 'bg-emerald-600 text-white animate-pulse'
                                                            : r.dismissed
                                                            ? 'bg-slate-200 dark:bg-gray-700 text-slate-500'
                                                            : 'bg-slate-100 dark:bg-gray-700 text-slate-500 dark:text-slate-400'
                                                    }`}>
                                                        {r.executed
                                                            ? '✅ 체결완료'
                                                            : isReached
                                                            ? '🔥 목표가 도달!'
                                                            : r.dismissed
                                                            ? '🔇 알림꺼짐'
                                                            : `목표까지 +${remainPct}%`}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
