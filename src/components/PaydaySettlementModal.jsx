import React, { useState, useMemo, useEffect } from 'react';

export default function PaydaySettlementModal({
    isOpen,
    onClose,
    appData,
    setAppData,
    saveCurrentAsset,
    addToast
}) {
    const now = new Date();
    const currentYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const salaryDay = Number(appData?.salaryDay) || 25;

    // 모든 계좌 목록 (대출 제외)
    const allAssetAccounts = useMemo(() => {
        const list = [];
        const assets = appData?.assets || {};
        Object.keys(assets).forEach(sector => {
            if (sector === 'loan') return;
            (assets[sector] || []).forEach((item, idx) => {
                if (item && item.name && item.name !== '새 항목') {
                    list.push({
                        sector,
                        idx,
                        id: item.id || `${sector}-${idx}`,
                        name: item.name,
                        amount: Number(item.amount) || 0,
                        baseAmount: Number(item.baseAmount) || 0,
                        hasLinkedStocks: Array.isArray(item.linkedItems) && item.linkedItems.length > 0,
                        monthlyContrib: Number(item.monthlyContrib) || 0
                    });
                }
            });
        });
        return list;
    }, [appData]);

    // 기본 월급통장 판별
    const defaultMainAccount = useMemo(() => {
        if (appData?.mainCashFlowAccount && allAssetAccounts.some(a => a.name === appData.mainCashFlowAccount)) {
            return appData.mainCashFlowAccount;
        }
        return allAssetAccounts[0]?.name || '생활비통장';
    }, [appData, allAssetAccounts]);

    const [selectedMainAccount, setSelectedMainAccount] = useState(defaultMainAccount);
    const [actualSalary, setActualSalary] = useState(Number(appData?.monthlySalary) || 0);
    const [extraBonus, setExtraBonus] = useState(0);
    const [autoSaveSnapshot, setAutoSaveSnapshot] = useState(true);
    const [showExpenseDetail, setShowExpenseDetail] = useState(false);

    // 저축/투자 체크리스트 상태
    const [savingsChecks, setSavingsChecks] = useState([]);
    // 대출 상환 체크리스트 상태
    const [loanChecks, setLoanChecks] = useState([]);
    // 고정 소비 지출 (기본값: 모두 미체크 = 앞으로 한 달간 쓸 돈이므로 월급통장에 플러스 유지)
    const [expenseImmediateChecks, setExpenseImmediateChecks] = useState([]);

    useEffect(() => {
        if (!isOpen || !appData) return;

        setSelectedMainAccount(defaultMainAccount);
        setActualSalary(Number(appData.monthlySalary) || 0);
        setExtraBonus(0);

        const assets = appData.assets || {};
        const sList = [];
        Object.keys(assets).forEach(sector => {
            if (sector === 'loan') return;
            (assets[sector] || []).forEach((item, idx) => {
                const contrib = Number(item.monthlyContrib) || 0;
                if (contrib > 0) {
                    sList.push({
                        key: item.id || `${sector}-${idx}`,
                        sector,
                        idx,
                        name: item.name,
                        currentAmount: Number(item.amount) || 0,
                        baseAmount: Number(item.baseAmount) || 0,
                        hasLinkedStocks: Array.isArray(item.linkedItems) && item.linkedItems.length > 0,
                        plannedContrib: contrib,
                        actualContrib: contrib,
                        checked: true // 기본 체크 (이체 완료)
                    });
                }
            });
        });
        setSavingsChecks(sList);

        // 대출 항목 초기화
        const lList = [];
        (assets.loan || []).forEach((loan, idx) => {
            const loanBalance = Number(loan.amount) || 0;
            if (loanBalance <= 0) return;
            const rate = Number(loan.rate) || 0;
            const monthlyInterest = Math.round((loanBalance * (rate / 100 / 12)) * 10) / 10;
            let plannedPayment = Number(loan.monthlyContrib) || 0;
            const method = loan.repaymentMethod || '원리금균등';

            if (plannedPayment <= 0) {
                const months = Math.max(1, Number(loan.maturityMonth) || 12);
                if (method === '만기일시') {
                    plannedPayment = monthlyInterest;
                } else if (method === '원금균등') {
                    plannedPayment = Math.round((loanBalance / months + monthlyInterest) * 10) / 10;
                } else {
                    const r = rate / 100 / 12;
                    if (r > 0) {
                        plannedPayment = Math.round((loanBalance * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)) * 10) / 10;
                    } else {
                        plannedPayment = Math.round((loanBalance / months) * 10) / 10;
                    }
                }
            }

            const defaultPrincipal = method === '만기일시'
                ? 0
                : Math.max(0, Math.round((plannedPayment - monthlyInterest) * 10) / 10);

            lList.push({
                key: loan.id || `loan-${idx}`,
                idx,
                name: loan.name,
                currentBalance: loanBalance,
                rate,
                method,
                monthlyInterest,
                totalPayment: plannedPayment,
                principalRepay: Math.min(loanBalance, defaultPrincipal),
                checked: true
            });
        });
        setLoanChecks(lList);

        // 소비 지출 항목 초기화 (기본: unchecked -> 월급통장에 플러스되어 다음달 동안 소비)
        const eList = (appData.monthlyExpenses || []).filter(e => Number(e.amount) > 0).map((exp, idx) => ({
            key: `exp-${idx}`,
            name: exp.name,
            amount: Number(exp.amount) || 0,
            alreadyWithdrawn: false // false면 아직 안 빠져나간 돈이므로 월급통장에 플러스(+)
        }));
        setExpenseImmediateChecks(eList);
    }, [isOpen, appData, defaultMainAccount]);

    // 정산 계산 요약
    const summary = useMemo(() => {
        const totalInflow = (Number(actualSalary) || 0) + (Number(extraBonus) || 0);

        // 1. 체크된 저축/투자 (해당 계좌로 플러스, 월급통장 유입액에서는 차감)
        // 단, 저축 계좌 자체가 월급통장(selectedMainAccount)과 동일한 경우는 중복 차감 방지
        let checkedSavingsOutflow = 0;
        let uncheckedSavingsRetained = 0;
        savingsChecks.forEach(item => {
            const amt = Number(item.actualContrib) || 0;
            if (item.checked) {
                if (item.name !== selectedMainAccount) {
                    checkedSavingsOutflow += amt;
                }
            } else {
                uncheckedSavingsRetained += amt;
            }
        });

        // 2. 체크된 대출 상환 (대출 원금 차감, 총 상환액만큼 월급통장에서 차감)
        let checkedLoanOutflow = 0;
        let checkedLoanPrincipalCut = 0;
        let uncheckedLoanRetained = 0;
        loanChecks.forEach(item => {
            const pay = Number(item.totalPayment) || 0;
            const prin = Number(item.principalRepay) || 0;
            if (item.checked) {
                checkedLoanOutflow += pay;
                checkedLoanPrincipalCut += prin;
            } else {
                uncheckedLoanRetained += pay;
            }
        });

        // 3. 고정 소비 예산 (다음 달 쓰면서 사라질 돈 = 기본 월급통장에 잔류)
        let alreadySpentExpense = 0;
        let retainedExpenseBudget = 0;
        expenseImmediateChecks.forEach(exp => {
            const amt = Number(exp.amount) || 0;
            if (exp.alreadyWithdrawn) {
                alreadySpentExpense += amt;
            } else {
                retainedExpenseBudget += amt;
            }
        });

        // 월급통장(selectedMainAccount)에 최종 플러스(+) 될 금액
        const mainAccountPlus = Math.round((totalInflow - checkedSavingsOutflow - checkedLoanOutflow - alreadySpentExpense) * 100) / 100;

        const targetMainAccObj = allAssetAccounts.find(a => a.name === selectedMainAccount);
        const currentMainBalance = targetMainAccObj ? targetMainAccObj.amount : 0;
        const afterMainBalance = Math.round((currentMainBalance + mainAccountPlus) * 100) / 100;

        return {
            totalInflow,
            checkedSavingsOutflow,
            uncheckedSavingsRetained,
            checkedLoanOutflow,
            checkedLoanPrincipalCut,
            uncheckedLoanRetained,
            alreadySpentExpense,
            retainedExpenseBudget,
            mainAccountPlus,
            currentMainBalance,
            afterMainBalance,
            targetMainAccHasStocks: targetMainAccObj?.hasLinkedStocks || false
        };
    }, [actualSalary, extraBonus, savingsChecks, loanChecks, expenseImmediateChecks, selectedMainAccount, allAssetAccounts]);

    if (!isOpen) return null;

    const isAlreadySettledThisMonth = appData?.lastPaydaySettledYm === currentYm;
    const hasBackup = !!appData?.lastPaydayBackup;

    const handleToggleAllSavings = (val) => {
        setSavingsChecks(prev => prev.map(item => ({ ...item, checked: val })));
    };

    const handleConfirmSettlement = () => {
        if (!appData || !appData.assets) return;

        // 백업본 생성 (깊은 복사)
        const backupSnapshot = {
            ym: currentYm,
            timestamp: new Date().toISOString(),
            assets: JSON.parse(JSON.stringify(appData.assets)),
            lastPaydaySettledYm: appData.lastPaydaySettledYm || null
        };

        setAppData(prev => {
            const nextAssets = JSON.parse(JSON.stringify(prev.assets || {}));

            // 1. 체크된 저축/투자 계좌에 금액 반영 (주식 연동 계좌는 baseAmount 예수금에도 반영!)
            savingsChecks.forEach(sItem => {
                if (!sItem.checked) return;
                if (sItem.name === selectedMainAccount) return; // 월급통장 자체인 경우 아래 3번에서 통합 반영
                const addAmt = Number(sItem.actualContrib) || 0;
                if (addAmt === 0) return;

                const sectorList = nextAssets[sItem.sector] || [];
                const target = sectorList[sItem.idx];
                if (target) {
                    target.amount = Math.round(((Number(target.amount) || 0) + addAmt) * 100) / 100;
                    if (Array.isArray(target.linkedItems) && target.linkedItems.length > 0) {
                        target.baseAmount = Math.round(((Number(target.baseAmount) || 0) + addAmt) * 100) / 100;
                    }
                }
            });

            // 2. 체크된 대출 원금 차감 반영
            loanChecks.forEach(lItem => {
                if (!lItem.checked) return;
                const cutPrin = Number(lItem.principalRepay) || 0;
                if (cutPrin <= 0) return;

                const loanList = nextAssets.loan || [];
                const targetLoan = loanList[lItem.idx];
                if (targetLoan) {
                    targetLoan.amount = Math.max(0, Math.round(((Number(targetLoan.amount) || 0) - cutPrin) * 100) / 100);
                }
            });

            // 3. 월급통장(selectedMainAccount)에 잔여금(소비예산 + 미이체항목 + 잉여금) 플러스(+) 반영
            let mainAccFound = false;
            Object.keys(nextAssets).forEach(sector => {
                if (sector === 'loan' || mainAccFound) return;
                (nextAssets[sector] || []).forEach(asset => {
                    if (!mainAccFound && asset.name === selectedMainAccount) {
                        mainAccFound = true;
                        asset.amount = Math.round(((Number(asset.amount) || 0) + summary.mainAccountPlus) * 100) / 100;
                        if (Array.isArray(asset.linkedItems) && asset.linkedItems.length > 0) {
                            asset.baseAmount = Math.round(((Number(asset.baseAmount) || 0) + summary.mainAccountPlus) * 100) / 100;
                        }
                    }
                });
            });

            const updated = {
                ...prev,
                assets: nextAssets,
                lastPaydaySettledYm: currentYm,
                lastPaydayBackup: backupSnapshot
            };

            try {
                localStorage.setItem('assetDashboardDataV3', JSON.stringify(updated));
            } catch (e) {
                console.error('Payday settlement localStorage save error:', e);
            }
            return updated;
        });

        if (autoSaveSnapshot && typeof saveCurrentAsset === 'function') {
            setTimeout(() => {
                try { saveCurrentAsset(); } catch (e) {}
            }, 150);
        }

        if (addToast) {
            addToast(`🎉 ${currentMonth}월 월급날 정산 완료! [${selectedMainAccount}]에 ${summary.mainAccountPlus >= 0 ? '+' : ''}${summary.mainAccountPlus.toLocaleString()}만원 반영되었습니다.`, 'success');
        }
        onClose();
    };

    const handleUndoLastSettlement = () => {
        if (!appData?.lastPaydayBackup) return;
        if (!window.confirm('직전 월급날 정산 내역을 취소하고 정산 이전 계좌 잔액으로 되돌리시겠습니까?')) return;

        setAppData(prev => {
            const backup = prev.lastPaydayBackup;
            if (!backup || !backup.assets) return prev;
            const restored = {
                ...prev,
                assets: backup.assets,
                lastPaydaySettledYm: backup.lastPaydaySettledYm || null,
                lastPaydayBackup: null
            };
            try {
                localStorage.setItem('assetDashboardDataV3', JSON.stringify(restored));
            } catch (e) {}
            return restored;
        });

        if (addToast) {
            addToast('↩️ 직전 월급날 정산이 취소되어 이전 잔액으로 복원되었습니다.', 'info');
        }
        onClose();
    };

    const handleDismissForSession = () => {
        try {
            sessionStorage.setItem(`paydayPromptDismissed_${currentYm}`, 'true');
        } catch (e) {}
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* 헤더 */}
                <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-600 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <span className="text-2xl bg-white/15 p-2 rounded-2xl">🗓️</span>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base sm:text-lg font-black tracking-tight">
                                    {currentYear}년 {currentMonth}월 월급날 현금흐름 자동 정산
                                </h2>
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/20 text-white">
                                    급여일 매월 {salaryDay}일
                                </span>
                            </div>
                            <p className="text-[11px] text-white/85 mt-0.5">
                                실행된 저축·부채상환을 체크하면 각 계좌(주식 예수금 포함)에 반영되고, 미이체분 및 다음 달 소비 예산은 월급통장에 플러스(+)됩니다.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleDismissForSession}
                        className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                        title="닫기"
                    >
                        ✕
                    </button>
                </div>

                {/* 이미 정산 완료된 달인 경우 알림 배너 */}
                {isAlreadySettledThisMonth && (
                    <div className="px-5 py-2.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-2 text-xs">
                        <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                            <span>✅</span> 이번 달({currentYear}년 {currentMonth}월)은 이미 정산이 1회 완료되었습니다. 추가 정산하거나 되돌릴 수 있습니다.
                        </span>
                        {hasBackup && (
                            <button
                                type="button"
                                onClick={handleUndoLastSettlement}
                                className="px-2.5 py-1 rounded-lg bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-black text-[11px] hover:bg-amber-300 transition-colors whitespace-nowrap cursor-pointer"
                            >
                                ↩️ 직전 정산 되돌리기
                            </button>
                        )}
                    </div>
                )}

                {/* 본문 스크롤 영역 */}
                <div className="p-5 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
                    {/* 1. 이번 달 수입 & 월급통장 지정 */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/70">
                        <div>
                            <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 mb-1">
                                💰 이번 달 실수령 월급 (만원)
                            </label>
                            <input
                                type="number"
                                value={actualSalary}
                                onChange={(e) => setActualSalary(Number(e.target.value))}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm font-black text-slate-900 dark:text-white text-right focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 mb-1">
                                🎁 추가 상여/부수입 (만원)
                            </label>
                            <input
                                type="number"
                                value={extraBonus}
                                onChange={(e) => setExtraBonus(Number(e.target.value))}
                                placeholder="0"
                                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm font-black text-emerald-600 dark:text-emerald-400 text-right focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 mb-1">
                                🏦 월급 입금(소비체류) 통장
                            </label>
                            <select
                                value={selectedMainAccount}
                                onChange={(e) => setSelectedMainAccount(e.target.value)}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                {allAssetAccounts.map(acc => (
                                    <option key={acc.id} value={acc.name}>
                                        {acc.name} (현재 {acc.amount.toLocaleString()}만)
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* 2. 저축 · 투자 이체 체크리스트 */}
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                                <span>📈</span> 1단계: 월 납입 저축 · 투자 실행 확인
                                <span className="text-[11px] font-bold text-slate-400">({savingsChecks.filter(s => s.checked).length}/{savingsChecks.length}건 체크됨)</span>
                            </h3>
                            {savingsChecks.length > 0 && (
                                <div className="flex items-center gap-1.5 text-[11px]">
                                    <button
                                        type="button"
                                        onClick={() => handleToggleAllSavings(true)}
                                        className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 cursor-pointer"
                                    >
                                        전체 체크
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleToggleAllSavings(false)}
                                        className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-200 cursor-pointer"
                                    >
                                        전체 해제
                                    </button>
                                </div>
                            )}
                        </div>

                        {savingsChecks.length === 0 ? (
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-400">
                                설정된 월 고정 저축/투자 납입 항목이 없습니다.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {savingsChecks.map((item, idx) => (
                                    <div
                                        key={item.key}
                                        className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                                            item.checked
                                                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                                                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 opacity-80'
                                        }`}
                                    >
                                        <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                                            <input
                                                type="checkbox"
                                                checked={item.checked}
                                                onChange={(e) => {
                                                    const val = e.target.checked;
                                                    setSavingsChecks(prev => prev.map((it, i) => i === idx ? { ...it, checked: val } : it));
                                                }}
                                                className="w-4 h-4 rounded accent-emerald-600 cursor-pointer flex-shrink-0"
                                            />
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                                                        {item.name}
                                                    </span>
                                                    {item.hasLinkedStocks && (
                                                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                                                            📈 주식계좌 예수금 반영
                                                        </span>
                                                    )}
                                                    {!item.checked && (
                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                                                            미이체 ➔ {selectedMainAccount}에 잔류(+)
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                                    현재 잔액 {item.currentAmount.toLocaleString()}만
                                                    {item.hasLinkedStocks ? ` (예수금 ${item.baseAmount.toLocaleString()}만)` : ''}
                                                    {item.checked ? (
                                                        <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-1.5">
                                                            ➔ 정산 후 {(item.currentAmount + (Number(item.actualContrib) || 0)).toLocaleString()}만
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </label>

                                        <div className="flex items-center gap-1.5 self-end sm:self-center">
                                            <span className="text-[10px] font-bold text-slate-400">이체액</span>
                                            <input
                                                type="number"
                                                value={item.actualContrib}
                                                onChange={(e) => {
                                                    const val = Number(e.target.value);
                                                    setSavingsChecks(prev => prev.map((it, i) => i === idx ? { ...it, actualContrib: val } : it));
                                                }}
                                                className="w-20 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-xs font-black text-right text-slate-900 dark:text-white"
                                            />
                                            <span className="text-xs font-bold text-slate-500">만</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 3. 대출 · 부채 상환 체크리스트 */}
                    {loanChecks.length > 0 && (
                        <div className="space-y-2.5">
                            <h3 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                                <span>💳</span> 2단계: 대출 상환 확인 (체크 시 대출 원금 차감)
                            </h3>
                            <div className="space-y-2">
                                {loanChecks.map((loan, idx) => (
                                    <div
                                        key={loan.key}
                                        className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                                            loan.checked
                                                ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/60'
                                                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 opacity-80'
                                        }`}
                                    >
                                        <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                                            <input
                                                type="checkbox"
                                                checked={loan.checked}
                                                onChange={(e) => {
                                                    const val = e.target.checked;
                                                    setLoanChecks(prev => prev.map((it, i) => i === idx ? { ...it, checked: val } : it));
                                                }}
                                                className="w-4 h-4 rounded accent-blue-600 cursor-pointer flex-shrink-0"
                                            />
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                                                        {loan.name}
                                                    </span>
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                                        {loan.method} · 연 {loan.rate}%
                                                    </span>
                                                    {!loan.checked && (
                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                                                            미상환 ➔ {selectedMainAccount}에 잔류(+)
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                                    대출 잔액 {loan.currentBalance.toLocaleString()}만 (월 이자 약 {loan.monthlyInterest}만)
                                                    {loan.checked && (
                                                        <span className="text-blue-600 dark:text-blue-400 font-bold ml-1.5">
                                                            ➔ 상환 후 잔액 {Math.max(0, Math.round((loan.currentBalance - (Number(loan.principalRepay) || 0)) * 10) / 10).toLocaleString()}만
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </label>

                                        <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                                            <div className="flex items-center gap-1">
                                                <span className="text-[10px] font-bold text-slate-400">총 출금</span>
                                                <input
                                                    type="number"
                                                    value={loan.totalPayment}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        const nextPrin = loan.method === '만기일시' ? 0 : Math.max(0, Math.round((val - loan.monthlyInterest) * 10) / 10);
                                                        setLoanChecks(prev => prev.map((it, i) => i === idx ? { ...it, totalPayment: val, principalRepay: nextPrin } : it));
                                                    }}
                                                    className="w-16 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-1.5 py-1 text-xs font-black text-right text-slate-900 dark:text-white"
                                                />
                                                <span className="text-[11px] font-bold text-slate-500">만</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="text-[10px] font-bold text-blue-500">원금차감</span>
                                                <input
                                                    type="number"
                                                    value={loan.principalRepay}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        setLoanChecks(prev => prev.map((it, i) => i === idx ? { ...it, principalRepay: val } : it));
                                                    }}
                                                    className="w-16 bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 rounded-lg px-1.5 py-1 text-xs font-black text-right text-blue-600 dark:text-blue-400"
                                                />
                                                <span className="text-[11px] font-bold text-slate-500">만</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 4. 소비 지출 예산 안내 (기본: 다음 달 쓰면서 사라질 돈이므로 월급통장에 플러스) */}
                    <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/25 border border-indigo-200/70 dark:border-indigo-800/50 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-base">🛒</span>
                                <div>
                                    <h4 className="text-xs font-black text-indigo-950 dark:text-indigo-200">
                                        3단계: 다음 달 소비 예산 ({summary.retainedExpenseBudget.toLocaleString()}만원) ➔ [{selectedMainAccount}] 플러스(+) 반영
                                    </h4>
                                    <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80">
                                        소비 지출과 아직 이체하지 않은 항목은 앞으로 한 달간 쓰면서 빠져나갈 돈이므로 <b>{selectedMainAccount}</b> 잔액에 더해집니다.
                                    </p>
                                </div>
                            </div>
                            {expenseImmediateChecks.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setShowExpenseDetail(prev => !prev)}
                                    className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 hover:underline whitespace-nowrap cursor-pointer"
                                >
                                    {showExpenseDetail ? '접기 ▲' : '당일 이미 빠져나간 지출 선택 ▼'}
                                </button>
                            )}
                        </div>

                        {showExpenseDetail && expenseImmediateChecks.length > 0 && (
                            <div className="pt-2 border-t border-indigo-200/60 dark:border-indigo-800/50 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {expenseImmediateChecks.map((exp, idx) => (
                                    <label
                                        key={exp.key}
                                        className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={exp.alreadyWithdrawn}
                                                onChange={(e) => {
                                                    const val = e.target.checked;
                                                    setExpenseImmediateChecks(prev => prev.map((it, i) => i === idx ? { ...it, alreadyWithdrawn: val } : it));
                                                }}
                                                className="w-3.5 h-3.5 rounded accent-rose-500"
                                            />
                                            <span className="font-bold text-slate-700 dark:text-slate-200">{exp.name}</span>
                                        </div>
                                        <span className={`font-black ${exp.alreadyWithdrawn ? 'text-rose-500 line-through' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                            {exp.alreadyWithdrawn ? `이미 출금됨 (-${exp.amount}만)` : `통장 입금 (+${exp.amount}만)`}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 5. 최종 정산 프리뷰 전광판 */}
                    <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-lg">
                        <div className="flex items-center justify-between border-b border-slate-700 pb-2.5">
                            <span className="text-xs font-black text-indigo-300 uppercase tracking-wider">
                                📊 이번 달 정산 반영 요약 미리보기
                            </span>
                            <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={autoSaveSnapshot}
                                    onChange={(e) => setAutoSaveSnapshot(e.target.checked)}
                                    className="w-3.5 h-3.5 rounded accent-indigo-500"
                                />
                                정산 직후 자산 히스토리 자동 기록
                            </label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700">
                                <div className="text-[10px] font-bold text-slate-400">
                                    🏦 [{selectedMainAccount}] 잔액 변화
                                </div>
                                <div className="text-base font-black text-amber-400 mt-0.5 tabular-nums">
                                    {summary.mainAccountPlus >= 0 ? '+' : ''}{summary.mainAccountPlus.toLocaleString()}만원
                                </div>
                                <div className="text-[11px] text-slate-300 mt-0.5 tabular-nums">
                                    {summary.currentMainBalance.toLocaleString()}만 ➔ <b className="text-white">{summary.afterMainBalance.toLocaleString()}만</b>
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1">
                                    (소비예산 {summary.retainedExpenseBudget.toLocaleString()}만 + 미이체 {(summary.uncheckedSavingsRetained + summary.uncheckedLoanRetained).toLocaleString()}만 포함)
                                </div>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700">
                                <div className="text-[10px] font-bold text-slate-400">
                                    📈 저축·투자 계좌 입금 합계
                                </div>
                                <div className="text-base font-black text-emerald-400 mt-0.5 tabular-nums">
                                    +{summary.checkedSavingsOutflow.toLocaleString()}만원
                                </div>
                                <div className="text-[11px] text-slate-300 mt-0.5">
                                    체크된 {savingsChecks.filter(s => s.checked).length}개 계좌 즉시 증액
                                </div>
                                <div className="text-[10px] text-indigo-300 mt-1">
                                    * 주식 연동 계좌는 예수금에 자동 합산
                                </div>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700">
                                <div className="text-[10px] font-bold text-slate-400">
                                    💳 대출 원금 차감 합계
                                </div>
                                <div className="text-base font-black text-sky-400 mt-0.5 tabular-nums">
                                    -{summary.checkedLoanPrincipalCut.toLocaleString()}만원
                                </div>
                                <div className="text-[11px] text-slate-300 mt-0.5">
                                    총 상환 출금 {summary.checkedLoanOutflow.toLocaleString()}만원
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1">
                                    * 순자산 즉각 상승 반영
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 하단 액션 바 */}
                <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        {hasBackup && (
                            <button
                                type="button"
                                onClick={handleUndoLastSettlement}
                                className="px-3 py-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 text-amber-800 dark:text-amber-300 text-xs font-black transition-colors cursor-pointer"
                            >
                                ↩️ 직전 정산 되돌리기
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <button
                            type="button"
                            onClick={handleDismissForSession}
                            className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                        >
                            나중에 하기
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmSettlement}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs sm:text-sm font-black shadow-md transition-all active:scale-95 cursor-pointer"
                        >
                            ✅ 이번 달 정산 확정 및 계좌 반영
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
