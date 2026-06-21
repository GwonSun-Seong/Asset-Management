import Decimal from 'decimal.js';

const MONTHLY_INCOME_SOURCE = '월 고정수입';

const toD = (val) => {
    return new Decimal(val || 0);
};

const calculateLoanPayment = (principal, annualRate, months, method) => {
    const p = toD(principal);
    if (p.lte(0)) return { payment: 0, interest: 0, principalRepay: 0, totalPayment: 0 };
    const monthlyRate = toD(annualRate).div(100).div(12);
    let payment = toD(0), interest = p.mul(monthlyRate), principalRepay = toD(0);

    if (method === '만기일시') {
        payment = interest;
        principalRepay = toD(0);
    } else if (method === '원금균등') {
        principalRepay = months > 0 ? p.div(months) : toD(0);
        payment = principalRepay.add(interest);
    } else {
        if (months <= 0) payment = p.add(interest);
        else if (monthlyRate.isZero()) payment = months > 0 ? p.div(months) : p;
        else {
            const ratePow = monthlyRate.add(1).pow(months);
            payment = p.mul(monthlyRate).mul(ratePow).div(ratePow.sub(1));
        }
        principalRepay = payment.sub(interest);
    }
    return { 
        payment: payment.toNumber(), 
        interest: interest.toNumber(), 
        principalRepay: principalRepay.toNumber(), 
        totalPayment: payment.toNumber() 
    };
};

const getMonthDiff = (start, end) => {
    if (!start || !end) return 0;
    const [sY, sM] = start.split('-').map(Number);
    const [eY, eM] = end.split('-').map(Number);
    return (eY - sY) * 12 + (eM - sM);
};

const calculateMonthlyProjection = (initialData, monthsToProject) => {
    if (!initialData) return { projections: [], warnings: [] };

    const data = typeof structuredClone === 'function' ? structuredClone(initialData) : JSON.parse(JSON.stringify(initialData));
    const warnings = [];
    const monthlyProjections = [];

    const {
        monthlySalary = 0, assets = {}, monthlyExpenses = [],
        mainCashFlowAccount, residualAccount, baseDate,
        salaryDay = 25,
    } = data;

    const futurePhases = Array.isArray(data.futurePhases) ? data.futurePhases : [];
    const baseMonthYYYYMM = baseDate ? baseDate.slice(0, 7) : new Date().toISOString().slice(0, 7);
    const mappedPhases = futurePhases
        .filter(p => p.startDate)
        .map(p => ({
            ...p,
            _calcStartMonth: getMonthDiff(baseMonthYYYYMM, p.startDate)
        }))
        .filter(p => p._calcStartMonth > 0);
    
    const sortedPhases = [...mappedPhases].sort((a, b) => a._calcStartMonth - b._calcStartMonth);
    let currentPhaseIndex = 0;

    let currentMonthlySalary = monthlySalary;
    let currentSafeMonthlyExpenses = Array.isArray(monthlyExpenses) ? monthlyExpenses : [];
    let currentSalaryDay = salaryDay;
    let currentMainCashFlowAccount = mainCashFlowAccount;
    let currentResidualAccount = residualAccount || mainCashFlowAccount;

    const safeIncomeEvents = Array.isArray(data.incomeEvents) ? data.incomeEvents : [];
    const safeExpenseEvents = Array.isArray(data.expenseEvents) ? data.expenseEvents : [];

    let currentAssets = {
        deposit: [], savings: [], investment: [], pension: [], realestate: [], car: [], loan: [], misc: []
    };
    Object.keys(assets).forEach(sector => {
        if (Array.isArray(assets[sector])) {
            currentAssets[sector] = assets[sector].map(asset => {
                const newAsset = { ...asset, _sector: sector };
                if (newAsset.extraContrib > 0) {
                    newAsset.monthlyContrib = (newAsset.monthlyContrib || 0) + newAsset.extraContrib;
                    delete newAsset.extraContrib;
                }
                if (!newAsset.monthlyContributionFrom) {
                    newAsset.monthlyContributionFrom = MONTHLY_INCOME_SOURCE;
                }
                return newAsset;
            });
        }
    });

    let allAccountsFlat = Object.values(currentAssets).flat();
    let cashFlowAccount = allAccountsFlat.find(d => d.name === currentMainCashFlowAccount);
    
    let baseYear, baseMonthIdx, baseDay;
    if (baseDate && /^\d{4}-\d{2}-\d{2}$/.test(baseDate)) {
        const parts = baseDate.split('-').map(Number);
        baseYear = parts[0];
        baseMonthIdx = parts[1] - 1;
        baseDay = parts[2];
    } else {
        const now = new Date();
        baseYear = now.getFullYear();
        baseMonthIdx = now.getMonth();
        baseDay = now.getDate();
    }

    const precalculateEventIndices = (events) => events.map(event => ({
        ...event,
        startIdx: typeof event.startMonth === 'string' ? getMonthDiff(`${baseYear}-${String(baseMonthIdx+1).padStart(2,'0')}`, event.startMonth) + 1 : event.startMonth,
        endIdx: typeof event.endMonth === 'string' ? getMonthDiff(`${baseYear}-${String(baseMonthIdx+1).padStart(2,'0')}`, event.endMonth) + 1 : event.endMonth,
        day: event.day || 30
    }));

    const incomeEventsWithIndices = precalculateEventIndices(safeIncomeEvents);
    const expenseEventsWithIndices = precalculateEventIndices(safeExpenseEvents);

    const _internalCalculateTotal = (assetData) => {
        let sum = 0;
        Object.keys(assetData).forEach(sector => {
            const sectorSum = (assetData[sector] || []).reduce((s, a) => s + (a.amount || 0), 0);
            sum += (sector === 'loan') ? -sectorSum : sectorSum;
        });
        return sum;
    };

    for (let month = 0; month <= monthsToProject; month++) {
        const simDate = new Date(baseYear, baseMonthIdx + (month === 0 ? 0 : month - 1), 1);
        const simYear = simDate.getFullYear();
        const simMonth = simDate.getMonth();
        const daysInSimMonth = new Date(simYear, simMonth + 1, 0).getDate();
        const startDayOfLoop = (month === 1) ? baseDay : 1;

        while (currentPhaseIndex < sortedPhases.length && month === sortedPhases[currentPhaseIndex]._calcStartMonth && month > 0) {
            const phaseData = sortedPhases[currentPhaseIndex].data;
            if (phaseData) {
                let previousResidualAccountName = currentResidualAccount;

                if (phaseData.monthlySalary !== undefined) currentMonthlySalary = phaseData.monthlySalary;
                if (phaseData.monthlyExpenses !== undefined) currentSafeMonthlyExpenses = Array.isArray(phaseData.monthlyExpenses) ? phaseData.monthlyExpenses : [];
                if (phaseData.salaryDay !== undefined) currentSalaryDay = phaseData.salaryDay;
                if (phaseData.mainCashFlowAccount !== undefined) {
                    currentMainCashFlowAccount = phaseData.mainCashFlowAccount;
                }
                if (phaseData.residualAccount !== undefined) {
                    currentResidualAccount = phaseData.residualAccount;
                }
                
                if (phaseData.assets) {
                    Object.keys(phaseData.assets).forEach(sector => {
                        const phaseSectorOverrides = phaseData.assets[sector] || [];
                        let currentSectorAssets = [...(currentAssets[sector] || [])];
                        
                        phaseSectorOverrides.forEach(pAsset => {
                            const existingIdx = currentSectorAssets.findIndex(a => a.id === pAsset.id || a.name === pAsset.name);
                            
                            if (existingIdx !== -1) {
                                if (pAsset.isDeleted) {
                                    currentSectorAssets.splice(existingIdx, 1);
                                } else {
                                    const existingAsset = currentSectorAssets[existingIdx];
                                    const isExplicitlyModified = pAsset.amount !== undefined || pAsset.monthlyContrib !== undefined;
                                    
                                    currentSectorAssets[existingIdx] = { 
                                        ...existingAsset, 
                                        ...pAsset,
                                        amount: pAsset.amount !== undefined ? pAsset.amount : existingAsset.amount,
                                        _skipTransactionsThisMonth: isExplicitlyModified 
                                    };
                                }
                            } else if (pAsset.name) {
                                currentSectorAssets.push({ ...pAsset, _sector: sector, _skipTransactionsThisMonth: true });
                            }
                        });
                        
                        currentAssets[sector] = currentSectorAssets;
                    });
                }
                
                allAccountsFlat = Object.values(currentAssets).flat();
                cashFlowAccount = allAccountsFlat.find(d => d.name === currentMainCashFlowAccount);
                if (!cashFlowAccount && currentMainCashFlowAccount) {
                    warnings.push({ month, year: simYear, monthNum: simMonth + 1, type: 'config', message: `주계좌(${currentMainCashFlowAccount})를 찾을 수 없습니다.` });
                }
                
                if (previousResidualAccountName && currentResidualAccount && previousResidualAccountName !== currentResidualAccount) {
                    const oldRes = allAccountsFlat.find(a => a.name === previousResidualAccountName);
                    const newRes = allAccountsFlat.find(a => a.name === currentResidualAccount) || cashFlowAccount;
                    if (oldRes && newRes && oldRes.amount > 0) {
                        newRes.amount += oldRes.amount;
                        newRes.amount = Math.round(newRes.amount * 10000) / 10000;
                        oldRes.amount = 0;
                        warnings.push({ month, year: simYear, monthNum: simMonth + 1, type: 'transfer', message: `잔여액 자동저축 계좌 변경으로 인해 [${oldRes.name}]의 잔액이 ${newRes.name}로 일괄 이체되었습니다.` });
                    }
                }
            }
            currentPhaseIndex++;
        }

        if (month > 0) {
            Object.keys(currentAssets).forEach(sector => {
                if (sector === 'loan') return;
                currentAssets[sector].forEach(asset => {
                    if (asset.amount > 0 && !asset._skipTransactionsThisMonth) {
                        const feeRate = (asset.feeRate || 0) / 100;
                        const effectiveRate = (asset.rate / 100) * (1 - feeRate);
                        const daysToApply = (month === 1) ? (daysInSimMonth - startDayOfLoop + 1) : 30;
                        const monthlyFactor = daysToApply / 30;
                        
                        const nextAmount = toD(asset.amount).mul(toD(1).add(toD(effectiveRate).div(12).mul(monthlyFactor)));
                        asset.amount = Number(nextAmount.toNumber().toFixed(4));
                    }
                });
            });

            incomeEventsWithIndices.forEach(event => {
                const effectiveDay = Math.min(event.day, daysInSimMonth);
                const isDateValid = effectiveDay >= startDayOfLoop;
                if (month >= event.startIdx && month <= event.endIdx && isDateValid) {
                    if (currentAssets[event.targetSector] && currentAssets[event.targetSector][event.targetAsset]) {
                        if (!currentAssets[event.targetSector][event.targetAsset]._skipTransactionsThisMonth) {
                            currentAssets[event.targetSector][event.targetAsset].amount += event.amount;
                        }
                    }
                }
            });

            expenseEventsWithIndices.forEach(event => {
                const effectiveDay = Math.min(event.day, daysInSimMonth);
                const isDateValid = effectiveDay >= startDayOfLoop;
                if (month >= event.startIdx && month <= event.endIdx && isDateValid) {
                    const arr = currentAssets[event.targetSector];
                    if (arr && arr[event.targetAsset]) {
                        if (!arr[event.targetAsset]._skipTransactionsThisMonth) {
                            arr[event.targetAsset].amount = Math.max(0, arr[event.targetAsset].amount - event.amount);
                        }
                    }
                }
            });

            let currentMonthSalary = currentMonthlySalary;
            let currentMonthExpenseTotal = 0;
            currentSafeMonthlyExpenses.forEach(exp => {
                currentMonthExpenseTotal += (exp.amount || 0);
            });

            let cashInHand = currentMonthSalary - currentMonthExpenseTotal;

            Object.keys(currentAssets).forEach(sector => {
                if (sector === 'loan') return;
                currentAssets[sector].forEach(asset => {
                    const source = asset.monthlyContributionFrom || MONTHLY_INCOME_SOURCE;
                    if (asset.monthlyContrib > 0 && source === MONTHLY_INCOME_SOURCE) {
                        const paymentAmount = asset.monthlyContrib;
                        cashInHand -= paymentAmount;
                        if (!asset._skipTransactionsThisMonth) {
                            asset.amount += paymentAmount;
                        }
                    }
                });
            });

            (currentAssets.loan || []).forEach((loan) => {
                loan._processedThisMonth = false;

                const simStartToLoanStart = getMonthDiff(loan.loanStartDate || `${baseYear}-${String(baseMonthIdx+1).padStart(2,'0')}`, `${baseYear}-${String(baseMonthIdx+1).padStart(2,'0')}`);
                const loanMonthAtSimMonth = month + simStartToLoanStart;

                if (loanMonthAtSimMonth <= 0 || loan.amount <= 0) return;
                
                const isRepaymentDayPassed = false; 

                if (loan.repaymentAccount === 'salary' || loan.repaymentAccount === '월급(고정수입)') {
                    const monthlyRate = (loan.rate / 100) / 12;
                    const interestForMonth = loan.amount * monthlyRate;

                    if (!loan._skipTransactionsThisMonth) {
                        loan.amount += interestForMonth;
                    }

                    let totalScheduledPayment = 0;
                    let isMaturityPayment = false;

                    if (!isRepaymentDayPassed) {
                        const remainingMonths = Math.max(1, (loan.maturityMonth || 0) - loanMonthAtSimMonth + 1);
                        const baseAmount = loan._skipTransactionsThisMonth ? loan.amount : (loan.amount - interestForMonth);
                        const paymentInfo = calculateLoanPayment(baseAmount, loan.rate, remainingMonths, loan.repaymentMethod);
                        
                        totalScheduledPayment = (loan.monthlyContrib > 0 && loanMonthAtSimMonth <= loan.maturityMonth) ? loan.monthlyContrib : paymentInfo.payment;

                        if (loanMonthAtSimMonth > loan.maturityMonth && loan.repaymentMethod !== '만기일시') {
                            totalScheduledPayment = loan.amount;
                        }

                        if (loan.repaymentMethod === '만기일시' && loanMonthAtSimMonth >= loan.maturityMonth && loan.amount > 0) {
                            isMaturityPayment = true;
                        }
                    }

                    if (totalScheduledPayment > 0) {
                        const actualPayment = Math.min(totalScheduledPayment, loan.amount);
                        cashInHand -= actualPayment;
                        if (!loan._skipTransactionsThisMonth) {
                            loan.amount -= actualPayment;
                        }
                    }

                    if (isMaturityPayment) {
                        const finalPrincipal = loan.amount;
                        cashInHand -= finalPrincipal;
                        if (!loan._skipTransactionsThisMonth) {
                            loan.amount -= finalPrincipal;
                        }
                    }

                    loan.amount = Math.round(loan.amount * 10000) / 10000;
                    if (loan.amount < 0.01) loan.amount = 0;
                    loan.amount = Math.max(0, loan.amount);
                    
                    loan._processedThisMonth = true;
                }
            });

            if (cashInHand < 0) {
                warnings.push({ month, year: simYear, monthNum: simMonth + 1, type: 'cashflow', message: `월급 기반 월납입/대출상환이 가용 현금을 초과하여 자산에서 출금됩니다. (${Math.abs(cashInHand).toFixed(2)}만원 부족)` });
            }

            let deficit = -cashInHand;
            if (cashInHand >= 0) {
                const residualTarget = allAccountsFlat.find(d => d.name === currentResidualAccount) || cashFlowAccount;
                if (residualTarget && !residualTarget._skipTransactionsThisMonth) {
                    residualTarget.amount += cashInHand;
                }
            } else {
                if (cashFlowAccount && !cashFlowAccount._skipTransactionsThisMonth) {
                    const withdraw = Math.min(cashFlowAccount.amount, deficit);
                    cashFlowAccount.amount -= withdraw;
                    deficit -= withdraw;
                }
                if (deficit > 0) {
                    const hierarchy = ['investment', 'savings', 'misc', 'pension', 'deposit'];
                    for (const sector of hierarchy) {
                        (currentAssets[sector] || []).forEach(asset => {
                            if (asset.name === currentMainCashFlowAccount || asset._skipTransactionsThisMonth) return;
                            const withdraw = Math.min(asset.amount, deficit);
                            asset.amount -= withdraw;
                            deficit -= withdraw;
                        });
                        if (deficit <= 0) break;
                    }
                }
                
                if (deficit > 0) {
                    const residualTarget = allAccountsFlat.find(d => d.name === currentResidualAccount) || cashFlowAccount;
                    if (residualTarget && !residualTarget._skipTransactionsThisMonth) {
                        residualTarget.amount -= deficit;
                    }
                }
            }

            (currentAssets.loan || []).forEach((loan) => {
                if (loan._processedThisMonth) return;

                const simStartToLoanStart = getMonthDiff(loan.loanStartDate || `${baseYear}-${String(baseMonthIdx+1).padStart(2,'0')}`, `${baseYear}-${String(baseMonthIdx+1).padStart(2,'0')}`);
                const loanMonthAtSimMonth = month + simStartToLoanStart;

                if (loanMonthAtSimMonth <= 0 || loan.amount <= 0) return;

                const repaymentAccount = allAccountsFlat.find(a => a.name === loan.repaymentAccount);
                
                if (!repaymentAccount && loan.repaymentAccount && loan.repaymentAccount !== 'salary' && !loan._missingAccountWarned) {
                    warnings.push({ month, year: simYear, monthNum: simMonth + 1, type: 'repayment', message: `[${loan.name}] 상환계좌(${loan.repaymentAccount})가 없거나 삭제되어 대출 이자만 누적됩니다.` });
                    loan._missingAccountWarned = true;
                }
                const isRepaymentDayPassed = false; 

                const monthlyRate = (loan.rate / 100) / 12;
                const interestForMonth = loan.amount * monthlyRate;

                if (!loan._skipTransactionsThisMonth) {
                    loan.amount += interestForMonth;
                }

                let totalScheduledPayment = 0;
                let isMaturityPayment = false;

                if (!isRepaymentDayPassed && repaymentAccount) {
                    const remainingMonths = Math.max(1, (loan.maturityMonth || 0) - loanMonthAtSimMonth + 1);
                    const baseAmount = loan._skipTransactionsThisMonth ? loan.amount : (loan.amount - interestForMonth);
                    const paymentInfo = calculateLoanPayment(baseAmount, loan.rate, remainingMonths, loan.repaymentMethod);

                    totalScheduledPayment = (loan.monthlyContrib > 0 && loanMonthAtSimMonth <= loan.maturityMonth) ? loan.monthlyContrib : paymentInfo.payment;
                    
                    if (loanMonthAtSimMonth > loan.maturityMonth && loan.repaymentMethod !== '만기일시') {
                        totalScheduledPayment = loan.amount;
                    }

                    if (loan.repaymentMethod === '만기일시' && loanMonthAtSimMonth >= loan.maturityMonth && loan.amount > 0) {
                        isMaturityPayment = true;
                    }
                }

                if (totalScheduledPayment > 0 && repaymentAccount) {
                    const isSourceLoan = repaymentAccount._sector === 'loan';
                    const actualRepayment = isSourceLoan 
                        ? Math.min(totalScheduledPayment, loan.amount) 
                        : Math.min(totalScheduledPayment, repaymentAccount.amount, loan.amount);

                    if (!repaymentAccount._skipTransactionsThisMonth) {
                        if (isSourceLoan) repaymentAccount.amount += actualRepayment;
                        else repaymentAccount.amount -= actualRepayment;
                    }

                    if (!loan._skipTransactionsThisMonth) {
                        loan.amount -= actualRepayment;
                    }

                    if (actualRepayment < totalScheduledPayment && !repaymentAccount._skipTransactionsThisMonth) {
                        warnings.push({ month, year: simYear, monthNum: simMonth + 1, type: 'repayment', message: `[${loan.name}] 잔액 부족으로 상환액 ${totalScheduledPayment.toFixed(2)}만원 중 ${actualRepayment.toFixed(2)}만원만 상환되었습니다.` });
                    }
                }

                if (isMaturityPayment && repaymentAccount) {
                    const finalPrincipal = loan.amount;
                    const isSourceLoan = repaymentAccount._sector === 'loan';
                    const actualFinalRepayment = isSourceLoan ? finalPrincipal : Math.min(finalPrincipal, repaymentAccount.amount);
                    
                    if (!repaymentAccount._skipTransactionsThisMonth) {
                        if (isSourceLoan) repaymentAccount.amount += actualFinalRepayment;
                        else repaymentAccount.amount -= actualFinalRepayment;
                    }

                    if (!loan._skipTransactionsThisMonth) {
                        loan.amount -= actualFinalRepayment;
                    }

                    if (actualFinalRepayment < finalPrincipal && !repaymentAccount._skipTransactionsThisMonth) {
                        warnings.push({ month, year: simYear, monthNum: simMonth + 1, type: 'repayment', message: `[${loan.name}] 만기 원금 상환 실패. [${repaymentAccount.name}] 잔액 부족.` });
                    }
                }

                loan.amount = Math.round(loan.amount * 10000) / 10000;
                if (loan.amount < 0.01) loan.amount = 0;
                loan.amount = Math.max(0, loan.amount);
                
                if (repaymentAccount) {
                    repaymentAccount.amount = Math.round(repaymentAccount.amount * 10000) / 10000;
                }
            });

            Object.keys(currentAssets).forEach(sector => {
                currentAssets[sector].forEach(asset => {
                    if (asset.monthlyContrib > 0 && asset.monthlyContributionFrom && asset.monthlyContributionFrom !== MONTHLY_INCOME_SOURCE) {
                        const fromAccount = allAccountsFlat.find(d => d.name === asset.monthlyContributionFrom);
                        if (fromAccount) {
                            const isSourceLoan = fromAccount._sector === 'loan';
                            const actualDeduction = isSourceLoan 
                                ? asset.monthlyContrib 
                                : Math.min(asset.monthlyContrib, fromAccount.amount);

                            if (!fromAccount._skipTransactionsThisMonth) {
                                if (isSourceLoan) fromAccount.amount += actualDeduction;
                                else fromAccount.amount -= actualDeduction;
                            }

                            if (!asset._skipTransactionsThisMonth) {
                                if (sector === 'loan') {
                                    asset.amount = Math.max(0, asset.amount - actualDeduction);
                                } else {
                                    asset.amount += actualDeduction;
                                }
                            }

                            if (actualDeduction < asset.monthlyContrib && !fromAccount._skipTransactionsThisMonth) {
                                warnings.push({
                                    month, year: simYear, monthNum: simMonth + 1, type: 'transfer',
                                    message: `[${fromAccount.name}] 잔액 부족으로 [${asset.name}]에 ${asset.monthlyContrib}만원 이체 중 ${actualDeduction.toFixed(2)}만원만 실행되었습니다.`
                                });
                            }

                            asset.amount = Math.round(asset.amount * 10000) / 10000;
                            fromAccount.amount = Math.round(fromAccount.amount * 10000) / 10000;
                        }
                    }
                });
            });
            
            Object.keys(currentAssets).forEach(sector => {
                currentAssets[sector].forEach(asset => {
                    asset.amount = Math.round(asset.amount * 10000) / 10000;
                    delete asset._skipTransactionsThisMonth;
                });
            });
        }

        const netAssets = _internalCalculateTotal(currentAssets);
        const grossAssets = Object.keys(currentAssets).filter(k=>k!=='loan').reduce((s,k)=> s + (currentAssets[k]||[]).reduce((sum,a)=>sum+(a.amount||0),0),0);
        const loanSum = (currentAssets['loan']||[]).reduce((s,a)=> s+(a.amount||0), 0);
        const totalAssets = grossAssets;

        const sectorTotals = {};
        Object.keys(currentAssets).forEach(sector => {
            const sectorSum = (currentAssets[sector]||[]).reduce((sum, asset) => sum + (asset.amount || 0), 0);
            sectorTotals[sector] = { amount: sectorSum, percentage: (sector !== 'loan' && grossAssets > 0) ? (sectorSum / grossAssets * 100) : 0 };
        });

        const itemTotals = {};
        Object.keys(currentAssets).forEach(sector => {
            itemTotals[sector] = (currentAssets[sector]||[]).map(asset => ({
                id: asset.id,
                name: asset.name,
                amount: asset.amount,
                percentage: (sectorTotals[sector]?.amount > 0) ? (asset.amount / sectorTotals[sector].amount * 100) : 0
            }));
        });

        monthlyProjections.push({
            month: month,
            total: totalAssets,
            gross: grossAssets,
            net: netAssets,
            sectorTotals: sectorTotals,
            itemTotals: itemTotals,
            assets: month === monthsToProject ? JSON.parse(JSON.stringify(currentAssets, (k, v) => (k.startsWith('_')) ? undefined : v)) : null
        });
    }
    return { projections: monthlyProjections, warnings, history: data.history };
};

function runAllCalculations({ appData, projectionMonths, inflationRate, baseDate, editingPhase, sectorInfo }) {
    const safeAppData = {
        ...appData,
        incomeEvents: Array.isArray(appData.incomeEvents) ? appData.incomeEvents : [],
        expenseEvents: Array.isArray(appData.expenseEvents) ? appData.expenseEvents : [],
    };

    const localTotalMonthlyExpense = (appData.monthlyExpenses || []).reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const localMonthlySalary = Number(appData.monthlySalary || 0);
    const localMaxContrib = Math.max(0, localMonthlySalary - localTotalMonthlyExpense);
    let localTotalContrib = 0;
    
    Object.entries(appData.assets).forEach(([sector, arr]) => {
        if (Array.isArray(arr)) {
            arr.forEach(a => {
                let include = true;
                if (sector === 'loan') {
                    if (a.repaymentAccount !== 'salary') include = false;
                    if (a.loanStartDate) {
                        const [bY, bM] = (baseDate || new Date().toISOString().slice(0, 10)).split('-').map(Number);
                        let effectiveYear = bY;
                        let effectiveMonth = bM;
                        if (editingPhase !== null) {
                            const d = new Date(bY, bM - 1 + editingPhase.startMonth, 1);
                            effectiveYear = d.getFullYear();
                            effectiveMonth = d.getMonth() + 1;
                        }
                        const effectiveTotalMonths = effectiveYear * 12 + effectiveMonth;
                        
                        const [y, m] = a.loanStartDate.split('-').map(Number);
                        const loanStartTotalMonths = y * 12 + m;
                        if (effectiveTotalMonths < loanStartTotalMonths) include = false;
                    }
                } else {
                    const source = a.monthlyContributionFrom || '월 고정수입';
                    if (source !== '월 고정수입') include = false;
                }
                if (include) localTotalContrib += Number(a.monthlyContrib || 0);
            });
        }
    });
    
    let currentTotal = 0;
    let totalNetProfitMonthlyInitial = 0;
    let totalInvestedPrincipal = 0;
    const sectorSums = {};
    
    Object.keys(appData.assets).forEach(sector => {
        if (!sectorSums[sector]) sectorSums[sector] = 0;
        (appData.assets[sector] || []).forEach(asset => {
            const amt = Number(asset.amount || 0);
            if (sector === 'loan') {
                currentTotal -= amt;
            } else {
                currentTotal += amt;
                sectorSums[sector] += amt;
                totalInvestedPrincipal += amt;
                const monthlyProfit = (amt * (Number(asset.rate || 0) / 1200)) * (1 - (Number(asset.feeRate || 0) / 100));
                totalNetProfitMonthlyInitial += monthlyProfit;
            }
        });
    });

    let runwayMonths = 0;
    let debtFreeMonth = -1;
    const maxSimMonths = 1200;
    const simAssets = JSON.parse(JSON.stringify(appData.assets));
    
    if (currentTotal <= 0) {
        runwayMonths = 0;
    } else {
        let simMainAccount = null;
        for (const s in simAssets) {
            const found = simAssets[s].find(a => a.name === appData.mainCashFlowAccount);
            if (found) { simMainAccount = found; break; }
        }
        if (!simMainAccount) {
            const firstSector = Object.keys(simAssets).find(s => s !== 'loan' && simAssets[s].length > 0);
            if (firstSector) simMainAccount = simAssets[firstSector][0];
        }

        for (let m = 1; m <= maxSimMonths; m++) {
            const inflationFactor = Math.pow(1 + inflationRate / 1200, m);
            const currentMonthlyExpense = localTotalMonthlyExpense * inflationFactor;

            let totalLoanRepayment = 0;
            let currentLoanBalance = 0;

            if (simAssets.loan) {
                simAssets.loan.forEach(loan => {
                    if (loan.amount > 0) {
                        const interest = loan.amount * (Number(loan.rate || 0) / 1200);
                        const monthlyPayment = Number(loan.monthlyContrib || 0);
                        
                        let cashOutflow = monthlyPayment;
                        let principalPayment = monthlyPayment - interest;

                        if (loan.amount + interest <= monthlyPayment) {
                            cashOutflow = loan.amount + interest;
                            principalPayment = loan.amount;
                            loan.amount = 0;
                        } else {
                            loan.amount -= principalPayment;
                        }
                        
                        totalLoanRepayment += cashOutflow;
                        currentLoanBalance += loan.amount;
                    }
                });
            }

            if (currentLoanBalance <= 0 && debtFreeMonth === -1) {
                debtFreeMonth = m;
            }
            
            let eventFlow = 0;
            const checkEvent = (e) => {
                if (!e.startMonth || typeof e.startMonth !== 'string' || !e.endMonth || typeof e.endMonth !== 'string') return false;
                const [bY, bM] = baseDate.split('-').map(Number);
                const [sY, sM] = e.startMonth.split('-').map(Number);
                const [eY, eM] = e.endMonth.split('-').map(Number);
                const cur = bY * 12 + bM + m - 1;
                return cur >= (sY * 12 + sM) && cur <= (eY * 12 + eM);
            };
            safeAppData.incomeEvents.forEach(e => { if (checkEvent(e)) eventFlow += Number(e.amount || 0); });
            safeAppData.expenseEvents.forEach(e => { if (checkEvent(e)) eventFlow -= Number(e.amount || 0); });

            const netFlow = eventFlow - currentMonthlyExpense - totalLoanRepayment;

            if (simMainAccount) {
                simMainAccount.amount += netFlow;
            }

            let deficit = 0;
            if (simMainAccount && simMainAccount.amount < 0) {
                deficit = -simMainAccount.amount;
                simMainAccount.amount = 0;

                const liquidationOrder = ['deposit', 'savings', 'investment'];
                for (const sector of liquidationOrder) {
                    if (deficit <= 0) break;
                    if (!simAssets[sector]) continue;

                    for (const asset of simAssets[sector]) {
                        if (deficit <= 0) break;
                        if (asset.name === simMainAccount.name) continue;
                        if (asset.amount <= 0) continue;

                        const taken = Math.min(asset.amount, deficit);
                        asset.amount -= taken;
                        deficit -= taken;
                    }
                }

                if (deficit > 0) {
                    runwayMonths = m - 1;
                    break;
                }
            } else if (!simMainAccount && netFlow < 0) {
                 runwayMonths = m - 1;
                 break;
            }

            Object.keys(simAssets).forEach(sector => {
                if (sector === 'loan') return;
                simAssets[sector].forEach(asset => {
                    if (asset.amount > 0) {
                        const profit = asset.amount * (Number(asset.rate || 0) / 1200) * (1 - (Number(asset.feeRate || 0) / 100));
                        asset.amount += profit;
                    }
                });
            });

            if (m === maxSimMonths) runwayMonths = maxSimMonths;
        }
    }

    const loanInterestInitial = (appData.assets.loan || []).reduce((sum, l) => sum + (Number(l.amount || 0) * Number(l.rate || 0) / 1200), 0);
    const annualFixedExpPostDebt = localTotalMonthlyExpense * 12;
    const swr4PercentCapital = annualFixedExpPostDebt * 25;

    const disposableIncome = Math.max(0, (appData.monthlySalary || 0) - localTotalMonthlyExpense);
    const targetMonths = appData.rebalanceMonths || 12;
    const futureValue = currentTotal + (disposableIncome * targetMonths);
    const sectorGaps = {};
    let totalGap = 0;
    const validSectors = Object.keys(sectorInfo).filter(k => k !== 'loan');
    const itemRecs = {};
    
    validSectors.forEach(sector => {
        const targetPct = (appData.rebalancingTargets && appData.rebalancingTargets[sector] !== undefined) 
            ? appData.rebalancingTargets[sector] 
            : Math.round(100 / validSectors.length);
        const targetBalance = futureValue * (targetPct / 100);
        const currentBalance = sectorSums[sector] || 0;
        const gap = Math.max(0, targetBalance - currentBalance);
        sectorGaps[sector] = gap;
        totalGap += gap;
    });

    const budgetLimited = (totalGap / targetMonths) > disposableIncome;
    const sectorRecs = {};
    validSectors.forEach(sector => {
        if (totalGap === 0) sectorRecs[sector] = 0;
        else {
            sectorRecs[sector] = budgetLimited 
                ? (sectorGaps[sector] / totalGap) * disposableIncome 
                : (sectorGaps[sector] / targetMonths);
        }
    });

    validSectors.forEach(sector => {
        const sectorAssets = appData.assets[sector] || [];
        if (sectorAssets.length === 0) return;
        
        const sectorMonthlyContrib = sectorRecs[sector] || 0;
        const sectorTargetPct = (appData.rebalancingTargets && appData.rebalancingTargets[sector] !== undefined) ? appData.rebalancingTargets[sector] : Math.round(100 / validSectors.length);
        const sectorFutureValue = futureValue * (sectorTargetPct / 100);
        
        let totalItemWeight = 0;
        const currentItemTargets = appData.itemTargets || {};
        sectorAssets.forEach(a => { totalItemWeight += (currentItemTargets[a.id] ?? Math.round(100/sectorAssets.length)); });
        
        let totalItemGap = 0;
        const currentItemGaps = {};
        
        sectorAssets.forEach(a => {
            const weight = (currentItemTargets[a.id] ?? Math.round(100/sectorAssets.length));
            const normWeight = totalItemWeight === 0 ? 0 : (weight / totalItemWeight);
            const targetVal = sectorFutureValue * normWeight;
            const gap = Math.max(0, targetVal - (a.amount || 0));
            currentItemGaps[a.id] = gap;
            totalItemGap += gap;
        });
        
        sectorAssets.forEach(a => {
            itemRecs[a.id] = totalItemGap > 0 ? (currentItemGaps[a.id] / totalItemGap) * sectorMonthlyContrib : 0;
        });
    });

    const { projections: monthlyProjections, warnings } = calculateMonthlyProjection({ ...safeAppData, inflationRate, baseDate }, projectionMonths);

    if (localTotalContrib > localMaxContrib) {
        warnings.unshift({
            month: '설정',
            type: 'budget',
            message: `월납입 한도 초과! ${localTotalContrib - localMaxContrib}만원이 부족합니다. (가용: ${localMaxContrib}만원)`
        });
    }

    const initialProjection = monthlyProjections[0] || {};
    const newCurrentTotal = initialProjection.total || 0;
    const newCurrentNet = initialProjection.net || 0;
    const newCurrentGross = initialProjection.gross || 0;

    const finalProjection = monthlyProjections[monthlyProjections.length - 1];
    const newProjectedTotal = finalProjection ? finalProjection.total : newCurrentTotal;
    const newProjectedNet = finalProjection ? finalProjection.net : newCurrentNet;
    const newProjectedGross = finalProjection ? finalProjection.gross : newCurrentGross;

    const realValue = newProjectedGross / Math.pow(1 + inflationRate / 100, projectionMonths / 12);

    return {
        initial: appData.assets,
        projected: finalProjection ? finalProjection.assets : appData.assets,
        currentTotal: newCurrentTotal,
        currentNet: newCurrentNet,
        currentGross: newCurrentGross,
        projectedTotal: newProjectedTotal,
        projectedNet: newProjectedNet,
        projectedGross: newProjectedGross,
        realValue,
        growth: newProjectedGross - newCurrentGross,
        grand: newCurrentNet,
        monthlyProjections: monthlyProjections,
        warnings: warnings,
        fireMetrics: {
            runwayMonths,
            debtFreeMonth,
            swr4PercentCapital
        },
        totalMonthlyExpense: localTotalMonthlyExpense,
        rebalanceInfo: {
            recs: sectorRecs,
            budgetLimited,
            targetMonths: targetMonths,
            itemRecs
        }
    };
}

self.onmessage = (e) => {
    const { appData, projectionMonths, inflationRate, baseDate, editingPhase, sectorInfo } = e.data;
    try {
        const result = runAllCalculations({ appData, projectionMonths, inflationRate, baseDate, editingPhase, sectorInfo });
        self.postMessage({ success: true, result });
    } catch (err) {
        self.postMessage({ success: false, error: err.message });
    }
};
