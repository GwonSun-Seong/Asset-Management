import React, { useState, useEffect, useMemo } from 'react';

export default function LadderAlertModal({
    currentAppData = null,
    onNavigateToLadder = null,
    addToast = null
}) {
    const [savedPlans, setSavedPlans] = useState([]);
    const [isSnoozedSession, setIsSnoozedSession] = useState(() => {
        try {
            return sessionStorage.getItem('ladder_alert_snooze_session') === '1';
        } catch (e) {
            return false;
        }
    });
    const [forcePreview, setForcePreview] = useState(false);

    const loadPlans = () => {
        try {
            const raw = localStorage.getItem('asset_saved_ladder_plans_v1');
            setSavedPlans(raw ? JSON.parse(raw) : []);
        } catch (e) {
            setSavedPlans([]);
        }
    };

    useEffect(() => {
        loadPlans();
        const handleUpdate = () => {
            loadPlans();
            try {
                setIsSnoozedSession(sessionStorage.getItem('ladder_alert_snooze_session') === '1');
            } catch (e) {}
        };
        const handlePreview = () => {
            loadPlans();
            setForcePreview(true);
        };
        window.addEventListener('ladder-plans-updated', handleUpdate);
        window.addEventListener('storage', handleUpdate);
        window.addEventListener('open-ladder-alert-preview', handlePreview);
        return () => {
            window.removeEventListener('ladder-plans-updated', handleUpdate);
            window.removeEventListener('storage', handleUpdate);
            window.removeEventListener('open-ladder-alert-preview', handlePreview);
        };
    }, []);

    // 포트폴리오 실시간 종목 맵
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
                            list.push({
                                key: `${acc.id || acc.name}_${item.id || item.ticker || item.name}`,
                                accountName: acc.name,
                                name: item.name || item.ticker,
                                ticker: item.ticker || '',
                                shares,
                                avgPrice: Math.round(avgPrice),
                                currentPrice: Math.round(currentPrice)
                            });
                        }
                    });
                }
            });
        });
        return list;
    }, [currentAppData]);

    // 목표가에 도달한 미체결·미해제 차수 추출
    const reachedAlerts = useMemo(() => {
        const alerts = [];
        savedPlans.forEach(plan => {
            const liveMatch = portfolioStocks.find(
                s => s.key === plan.stockKey || (s.name === plan.name && s.accountName === plan.accountName) || (plan.ticker && s.ticker === plan.ticker)
            );
            const livePrice = liveMatch ? liveMatch.currentPrice : (plan.savedCurrentPrice || plan.avgPrice || 0);
            const avgPrice = liveMatch ? liveMatch.avgPrice : (plan.avgPrice || 0);

            const reachedRungs = (plan.rungs || []).filter(
                r => !r.executed && !r.dismissed && livePrice >= r.targetPrice
            );

            if (reachedRungs.length > 0) {
                alerts.push({
                    planId: plan.id,
                    name: plan.name,
                    accountName: plan.accountName,
                    avgPrice,
                    livePrice,
                    feeAndTaxPct: plan.feeAndTaxPct,
                    rungs: reachedRungs,
                    isPreviewFallback: false
                });
            }
        });

        // 사용자가 '모달 띄워보기(미리보기)'를 눌렀는데 아직 도달한 차수가 없는 경우 첫 번째 미체결 차수를 미리보기로 표시
        if (forcePreview && alerts.length === 0 && savedPlans.length > 0) {
            savedPlans.forEach(plan => {
                const liveMatch = portfolioStocks.find(
                    s => s.key === plan.stockKey || (s.name === plan.name && s.accountName === plan.accountName) || (plan.ticker && s.ticker === plan.ticker)
                );
                const livePrice = liveMatch ? liveMatch.currentPrice : (plan.savedCurrentPrice || plan.avgPrice || 0);
                const avgPrice = liveMatch ? liveMatch.avgPrice : (plan.avgPrice || 0);
                const previewRung = (plan.rungs || []).find(r => !r.executed) || plan.rungs?.[0];
                if (previewRung) {
                    alerts.push({
                        planId: plan.id,
                        name: plan.name,
                        accountName: plan.accountName,
                        avgPrice,
                        livePrice,
                        feeAndTaxPct: plan.feeAndTaxPct,
                        rungs: [previewRung],
                        isPreviewFallback: true
                    });
                }
            });
        }

        return alerts;
    }, [savedPlans, portfolioStocks, forcePreview]);

    const isOpen = forcePreview ? reachedAlerts.length > 0 : (!isSnoozedSession && reachedAlerts.length > 0);

    if (!isOpen) return null;

    const persistPlans = (nextPlans) => {
        setSavedPlans(nextPlans);
        try {
            localStorage.setItem('asset_saved_ladder_plans_v1', JSON.stringify(nextPlans));
            window.dispatchEvent(new CustomEvent('ladder-plans-updated'));
        } catch (e) {}
    };

    // 1. 다음 접속 시까지 보이지 않기 (세션 스누즈)
    const handleSnoozeUntilNextVisit = () => {
        try {
            sessionStorage.setItem('ladder_alert_snooze_session', '1');
        } catch (e) {}
        setIsSnoozedSession(true);
        setForcePreview(false);
        if (addToast) {
            addToast('⏳ 이번 접속 중에는 분할익절 알림을 숨깁니다. 다음 접속 시 다시 알려드립니다.', 'info');
        }
    };

    // 2. 다시 보이지 않기 (현재 도달한 차수들의 알림 영구 끄기)
    const handleDismissReachedForever = () => {
        const nextPlans = savedPlans.map(plan => {
            const alertItem = reachedAlerts.find(a => a.planId === plan.id);
            if (!alertItem) return plan;
            const reachedSteps = new Set(alertItem.rungs.map(r => r.step));
            return {
                ...plan,
                rungs: (plan.rungs || []).map(r =>
                    reachedSteps.has(r.step) ? { ...r, dismissed: true } : r
                )
            };
        });
        persistPlans(nextPlans);
        setForcePreview(false);
        if (addToast) {
            addToast('🔇 도달한 차수의 알림을 다시 보지 않기로 설정했습니다. (상위 차수 도달 시에는 정상 알림)', 'info');
        }
    };

    // 개별 차수 매도 체결 완료 처리
    const handleMarkRungExecuted = (planId, stepNum, stockName) => {
        const nextPlans = savedPlans.map(plan => {
            if (plan.id !== planId) return plan;
            return {
                ...plan,
                rungs: (plan.rungs || []).map(r =>
                    r.step === stepNum ? { ...r, executed: true, dismissed: true } : r
                )
            };
        });
        persistPlans(nextPlans);
        if (addToast) {
            addToast(`✅ '${stockName}' ${stepNum}차 분할익절 체결 완료로 기록되었습니다!`, 'success');
        }
    };

    const formatWon = (val) => `${Math.round(Number(val) || 0).toLocaleString()}원`;
    const formatManWon = (val) => {
        const man = (Number(val) || 0) / 10000;
        if (Math.abs(man) >= 10000) {
            const eok = Math.floor(Math.abs(man) / 10000);
            const rem = Math.round(Math.abs(man) % 10000);
            return `${val < 0 ? '-' : ''}${eok}억 ${rem > 0 ? `${rem.toLocaleString()}만원` : '원'}`;
        }
        return `${(Math.round(man * 10) / 10).toLocaleString()}만원`;
    };
    const formatSignedManWon = (val) => `${val >= 0 ? '+' : ''}${formatManWon(val)}`;

    return (
        <div className="fixed inset-0 z-[99998] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* 상단 배너 */}
                <div className="p-5 bg-gradient-to-r from-indigo-600 via-violet-600 to-emerald-600 text-white flex items-start justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider">
                                Ladder Exit Target Reached
                            </span>
                            {reachedAlerts.some(a => a.isPreviewFallback) && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                                    미리보기 모드
                                </span>
                            )}
                        </div>
                        <h3 className="text-base sm:text-lg font-black mt-1 flex items-center gap-2">
                            <span>🎯</span> 분할익절(사다리 매도) 목표가 도달 알림!
                        </h3>
                        <p className="text-xs text-indigo-100 mt-0.5 font-bold">
                            저장해 두신 예약매도 주문표의 목표 지정가에 도달한 종목이 있습니다. 기계적 분할익절로 수익을 확정하세요!
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleSnoozeUntilNextVisit}
                        className="text-white/80 hover:text-white text-sm font-black px-2 py-1 rounded-lg hover:bg-white/10 cursor-pointer"
                        title="닫기"
                    >
                        ✕
                    </button>
                </div>

                {/* 도달 종목 & 차수 리스트 */}
                <div className="p-4 sm:p-5 max-h-[60vh] overflow-y-auto space-y-3 bg-slate-50/70 dark:bg-gray-950/50">
                    {reachedAlerts.map(item => (
                        <div
                            key={item.planId}
                            className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-emerald-300 dark:border-emerald-700/80 shadow-xs space-y-3"
                        >
                            <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-gray-700 pb-2.5">
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-sm font-black text-slate-900 dark:text-white">
                                            {item.name}
                                        </span>
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-300">
                                            {item.accountName}
                                        </span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mt-0.5 tabular-nums">
                                        내 평단가 {formatWon(item.avgPrice)} ➔ 현재가 <b className="text-emerald-600 dark:text-emerald-400">{formatWon(item.livePrice)}</b>
                                    </div>
                                </div>
                                <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-xs font-black">
                                    {item.isPreviewFallback ? '🔔 알림 예시' : `🔥 ${item.rungs.length}개 차수 도달`}
                                </span>
                            </div>

                            <div className="space-y-2">
                                {item.rungs.map(r => (
                                    <div
                                        key={r.step}
                                        className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                                    >
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[11px] font-black">
                                                    {r.step}차 매도 타이밍
                                                </span>
                                                <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums">
                                                    목표 지정가 {formatWon(r.targetPrice)} · 주문 수량 <span className="text-indigo-600 dark:text-indigo-400">{r.sellShares.toLocaleString()}주</span>
                                                </span>
                                            </div>
                                            <div className="text-[11px] text-slate-600 dark:text-slate-300 font-bold tabular-nums">
                                                매입가 기준 확정 순수익 <b className="text-emerald-600 dark:text-emerald-400">{formatSignedManWon(r.stepNetProfit)}</b> · 매도 수령액 {formatManWon(r.netSellAmount)}
                                                {r.remainingShares > 0 && ` · 잔여 ${r.remainingShares}주 본전방어선 ${formatWon(r.breakevenFloorPrice)}`}
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleMarkRungExecuted(item.planId, r.step, item.name)}
                                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shrink-0 cursor-pointer transition-colors"
                                        >
                                            ✅ 매도 체결 완료 체크
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* 하단 액션 바: 다시 보이지 않기 & 다음 접속 시까지 보이지 않기 */}
                <div className="p-4 bg-white dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={handleDismissReachedForever}
                            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-slate-300 text-xs font-black transition-colors cursor-pointer"
                            title="현재 도달한 차수에 대해서는 다시 팝업을 띄우지 않습니다 (다음 상위 차수 도달 시에는 알림)"
                        >
                            🔇 다시 보이지 않기 (이 차수 알림 끄기)
                        </button>
                        <button
                            type="button"
                            onClick={handleSnoozeUntilNextVisit}
                            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-600 dark:text-slate-400 text-xs font-bold transition-colors cursor-pointer"
                            title="이번 접속 중에만 팝업을 닫고, 다음에 사이트에 다시 접속했을 때 아직 미체결이면 다시 알려줍니다"
                        >
                            ⏳ 다음 접속 시까지 보이지 않기
                        </button>
                    </div>

                    {onNavigateToLadder && (
                        <button
                            type="button"
                            onClick={() => {
                                setForcePreview(false);
                                handleSnoozeUntilNextVisit();
                                onNavigateToLadder();
                            }}
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition-colors cursor-pointer shrink-0"
                        >
                            🪜 사다리 주문표 보러가기
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
