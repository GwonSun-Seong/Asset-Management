// utils.js - 유틸리티 함수들

// [추가] 정밀한 금융 계산을 위한 Decimal 헬퍼 (Decimal.js 로드 확인)
const toD = (val) => {
    if (window.Decimal) return new window.Decimal(val || 0);
    return { mul: (v) => toD(val * v), div: (v) => toD(val / v), add: (v) => toD(val + v), sub: (v) => toD(val - v), toNumber: () => val, pow: (v) => toD(Math.pow(val, v)), lte: (v) => val <= v, isZero: () => val === 0 };
};

// 숫자 포맷팅 함수
const formatNumber = (num, displayMode) => {
    if (displayMode === 'percent') return '***'; // [추가] 금액 숨김 모드
    return Math.round(num).toLocaleString();
};

// 퍼센트 포맷팅 함수
const formatPercent = (num) => num.toFixed(1);

// 대출 상환 방식에 따른 월 상환금 계산 함수
const calculateLoanPayment = (principal, annualRate, months, method) => {
    const p = toD(principal);
    if (p.lte(0)) return { payment: 0, interest: 0, principalRepay: 0, totalPayment: 0 };
    const monthlyRate = toD(annualRate).div(100).div(12);
    let payment = toD(0), interest = p.mul(monthlyRate), principalRepay = toD(0);

    if (method === '만기일시') {
        payment = interest; // 매달 이자만 납부
        principalRepay = toD(0);
    } else if (method === '원금균등') {
        principalRepay = months > 0 ? p.div(months) : toD(0);
        payment = principalRepay.add(interest);
    } else { // '원리금균등'이 기본값
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

// 날짜 차이(개월 수) 계산 함수
const getMonthDiff = (start, end) => {
    if (!start || !end) return 0;
    const [sY, sM] = start.split('-').map(Number);
    const [eY, eM] = end.split('-').map(Number);
    return (eY - sY) * 12 + (eM - sM);
};

// 총 자산 계산 (부채 제외)
const calculateGrossTotal = (assetData) => {
    if (!assetData || typeof assetData !== 'object') return 0;
    let sum = 0;
    Object.keys(assetData).forEach(sector => {
        if (sector === 'loan') return; // 부채 제외
        const arr = assetData[sector] || [];
        sum += arr.reduce((s,a)=> s + (a.amount||0), 0);
    });
    return sum;
};

// 섹터별 총액 계산
const getSectorTotals = (assetData, total) => {
    const totals = {};
    if (!assetData || typeof assetData !== 'object') return totals;

    Object.keys(assetData).forEach(sector => {
        if (sector === 'loan') return; // 대출은 비율/차트 계산에서 제외
        if (Array.isArray(assetData[sector])) {
            const sectorTotal = assetData[sector].reduce((sum, asset) => sum + (asset.amount || 0), 0);
            totals[sector] = { amount: sectorTotal, percentage: total > 0 ? (sectorTotal / total * 100) : 0 };
        }
    });
    return totals;
};

// 월별 투영 계산 함수
const calculateMonthlyProjection = (initialData, monthsToProject) => {
    if (!initialData) return { projections: [], warnings: [] };

    // [최적화] structuredClone을 사용하여 더 빠른 깊은 복사 수행 (지원되지 않는 환경 대비 fallback 유지)
    const data = typeof structuredClone === 'function' ? structuredClone(initialData) : JSON.parse(JSON.stringify(initialData));
    const warnings = [];
    const monthlyProjections = [];

    const {
        monthlySalary = 0, assets = {}, monthlyExpenses = [],
        targetAmount = 10000,
        mainCashFlowAccount, baseMonth
    } = data;

    // [개선] 시뮬레이션 엔진 내부에서도 배열 무결성 보장
    const safeMonthlyExpenses = Array.isArray(monthlyExpenses) ? monthlyExpenses : [];
    const safeIncomeEvents = Array.isArray(data.incomeEvents) ? data.incomeEvents : [];
    const safeExpenseEvents = Array.isArray(data.expenseEvents) ? data.expenseEvents : [];

    // 월 가용 현금 계산 (월급 - 고정 지출)
    const totalMonthlyExpense = safeMonthlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const monthlyAvailableCash = monthlySalary - totalMonthlyExpense;

    let currentAssets = {};
    Object.keys(assets).forEach(sector => {
        if (Array.isArray(assets[sector])) {
            currentAssets[sector] = assets[sector].map(asset => ({ ...asset }));
        } else {
            currentAssets[sector] = [];
        }
    });

    // [최적화] 루프 진입 전 필요한 계좌 참조 및 이벤트 인덱스 미리 계산
    const allAccountsFlat = Object.values(currentAssets).flat();
    const cashFlowAccount = allAccountsFlat.find(d => d.name === mainCashFlowAccount);
    
    const precalculateEventIndices = (events) => events.map(event => ({
        ...event,
        startIdx: typeof event.startMonth === 'string' ? getMonthDiff(baseMonth, event.startMonth) + 1 : event.startMonth,
        endIdx: typeof event.endMonth === 'string' ? getMonthDiff(baseMonth, event.endMonth) + 1 : event.endMonth
    }));

    const incomeEventsWithIndices = precalculateEventIndices(safeIncomeEvents);
    const expenseEventsWithIndices = precalculateEventIndices(safeExpenseEvents);

    // 대출 상환 계좌 미리 매핑
    if (currentAssets.loan) {
        currentAssets.loan.forEach(loan => {
            loan._repaymentAccountRef = allAccountsFlat.find(a => a.name === loan.repaymentAccount);
        });
    }

    // [최적화] 루프 외부로 이동하여 불필요한 함수 재선언 방지
    const _internalCalculateTotal = (assetData) => {
        let sum = 0;
        Object.keys(assetData).forEach(sector => {
            const sectorSum = (assetData[sector] || []).reduce((s, a) => s + (a.amount || 0), 0);
            sum += (sector === 'loan') ? -sectorSum : sectorSum;
        });
        return sum;
    };

    for (let month = 0; month <= monthsToProject; month++) {
        if (month > 0) { // Skip initial state for calculations, only record it
            // 1. 이자/수익률 적용
            Object.keys(currentAssets).forEach(sector => {
                if (sector === 'loan') return; // 대출은 상환 단계에서 처리
                currentAssets[sector].forEach(asset => {
                    if (asset.amount > 0) {
                        const feeRate = (asset.feeRate || 0) / 100;
                        const effectiveRate = (asset.rate / 100) * (1 - feeRate);
                        // [수정] Decimal을 사용한 정밀 계산 및 원 단위 보정
                        const nextAmount = toD(asset.amount).mul(toD(1).add(toD(effectiveRate).div(12)));
                        asset.amount = Number(nextAmount.toNumber().toFixed(4));
                    }
                });
            });

            // 2. 이벤트 적용
            incomeEventsWithIndices.forEach(event => {
                if (month >= event.startIdx && month <= event.endIdx) {
                    if (currentAssets[event.targetSector] && currentAssets[event.targetSector][event.targetAsset]) {
                        currentAssets[event.targetSector][event.targetAsset].amount += event.amount;
                    }
                }
            });

            expenseEventsWithIndices.forEach(event => {
                if (month >= event.startIdx && month <= event.endIdx) {
                    const arr = currentAssets[event.targetSector];
                    if (arr && arr[event.targetAsset]) {
                        arr[event.targetAsset].amount = Math.max(0, arr[event.targetAsset].amount - event.amount);
                    }
                }
            });

            // 3. 현금 흐름 및 납입 처리
            let cashInHand = monthlyAvailableCash;

            // 3a. 월급 기반 월납입 (자산 증식)
            Object.keys(currentAssets).forEach(sector => {
                if (sector === 'loan') return;
                currentAssets[sector].forEach(asset => {
                    if (asset.monthlyContrib > 0) {
                        const paymentAmount = asset.monthlyContrib;
                        cashInHand -= paymentAmount;
                        asset.amount += paymentAmount;
                    }
                });
            });

            if (cashInHand < 0) {
                warnings.push({ month, type: 'cashflow', message: `월 ${month}: 월급 기반 월납입액이 월 가용 현금을 초과합니다. (${cashInHand.toFixed(2)}만원 부족)` });
            }

            // [개선] 출금 계좌 계층 구조 (Withdrawal Hierarchy) 적용
            let deficit = -cashInHand;
            if (cashInHand >= 0) {
                if (cashFlowAccount) cashFlowAccount.amount += cashInHand;
            } else {
                // 1. 주 계좌에서 먼저 차감
                if (cashFlowAccount) {
                    const withdraw = Math.min(cashFlowAccount.amount, deficit);
                    cashFlowAccount.amount -= withdraw;
                    deficit -= withdraw;
                }
                // 2. 부족할 경우 투자 -> 저축 -> 기타 순으로 차감
                if (deficit > 0) {
                    const hierarchy = ['investment', 'savings', 'misc', 'pension', 'deposit'];
                    for (const sector of hierarchy) {
                        (currentAssets[sector] || []).forEach(asset => {
                            if (asset.name === mainCashFlowAccount) return;
                            const withdraw = Math.min(asset.amount, deficit);
                            asset.amount -= withdraw;
                            deficit -= withdraw;
                        });
                        if (deficit <= 0) break;
                    }
                }
            }

            // 3b. 대출 상환 (계좌이체 기반) (Fix #1, #3)
            (currentAssets.loan || []).forEach((loan) => {
                const simStartToLoanStart = getMonthDiff(baseMonth, loan.loanStartDate || baseMonth);
                const loanMonthAtSimMonth = month + simStartToLoanStart;

                if (loanMonthAtSimMonth < 1 || loan.amount <= 0 || (loan.maturityMonth !== undefined && loanMonthAtSimMonth > loan.maturityMonth)) return;

                const repaymentAccount = loan._repaymentAccountRef;
                if (!repaymentAccount) {
                    warnings.push({ month, type: 'repayment', message: `[${loan.name}]의 상환계좌(${loan.repaymentAccount})를 찾을 수 없습니다.` });
                    return;
                }

                const monthlyRate = (loan.rate / 100) / 12;
                const interestForMonth = loan.amount * monthlyRate;

                // 1. 이자 가산 (회계적 정밀도: 원금에 이자를 먼저 더함)
                loan.amount += interestForMonth;

                // 2. 상환액 계산 (가산 전 원금 기준)
                const remainingMonths = Math.max(1, (loan.maturityMonth || 0) - loanMonthAtSimMonth + 1);
                const paymentInfo = calculateLoanPayment(loan.amount - interestForMonth, loan.rate, remainingMonths, loan.repaymentMethod);

                // [수정] 사용자 입력 상환액이 있으면 우선 사용, 없으면 자동 계산값 사용 (중복 합산 방지)
                let totalScheduledPayment = (loan.monthlyContrib > 0) ? loan.monthlyContrib : paymentInfo.payment;

                if (totalScheduledPayment > 0) {
                    const actualRepayment = Math.min(totalScheduledPayment, repaymentAccount.amount);
                    repaymentAccount.amount -= actualRepayment;

                    // 3. 상환액 전체 차감 (이자 가산이 선행되었으므로 원리금 전체를 차감)
                    loan.amount -= actualRepayment;

                    if (actualRepayment < totalScheduledPayment) {
                        warnings.push({ month, type: 'repayment', message: `[${loan.name}] 상환액 ${totalScheduledPayment.toFixed(2)}만원 중 ${actualRepayment.toFixed(2)}만원만 상환되었습니다.` });
                    }
                }

                // 만기일시 상환의 만기달 원금 상환 처리
                if (loan.repaymentMethod === '만기일시' && loanMonthAtSimMonth === loan.maturityMonth && loan.amount > 0) {
                    const finalPrincipal = loan.amount;
                    const actualFinalRepayment = Math.min(finalPrincipal, repaymentAccount.amount);
                    repaymentAccount.amount -= actualFinalRepayment;
                    loan.amount -= actualFinalRepayment;
                    if (actualFinalRepayment < finalPrincipal) {
                        warnings.push({ month, type: 'repayment', message: `[${loan.name}] 만기 원금 상환 실패. [${repaymentAccount.name}] 잔액 부족.` });
                    }
                }

                // 부동 소수점 오차 보정 및 0원 처리
                loan.amount = Math.round(loan.amount * 10000) / 10000;
                if (loan.amount < 0.01) loan.amount = 0;
                repaymentAccount.amount = Math.round(repaymentAccount.amount * 10000) / 10000;
                loan.amount = Math.max(0, loan.amount);
            });

            // 3c. 월수입 외 추가 납입/상환 (계좌이체) (Fix #2)
            Object.keys(currentAssets).forEach(sector => {
                currentAssets[sector].forEach(asset => {
                    if (asset.extraContrib > 0 && asset.extraFrom) {
                        // 참조를 깨뜨리지 않도록 수정
                        const fromAccount = allAccountsFlat.find(d => d.name === asset.extraFrom);
                        if (fromAccount) {
                            const actualDeduction = Math.min(asset.extraContrib, fromAccount.amount);
                            fromAccount.amount -= actualDeduction;

                            if (sector === 'loan') {
                                asset.amount = Math.max(0, asset.amount - actualDeduction);
                            } else {
                                asset.amount += actualDeduction;
                            }

                            if (actualDeduction < asset.extraContrib) {
                                warnings.push({
                                    month, type: 'transfer',
                                    message: `월 ${month}: [${fromAccount.name}] 잔액 부족으로 [${asset.name}]에 ${asset.extraContrib}만원 이체 중 ${actualDeduction.toFixed(2)}만원만 실행되었습니다.`
                                });
                            }

                            // 부동 소수점 오차 보정
                            asset.amount = Math.round(asset.amount * 10000) / 10000;
                            fromAccount.amount = Math.round(fromAccount.amount * 10000) / 10000;
                        }
                    }
                });
            });
        }

        // Record current state
        const netAssets = _internalCalculateTotal(currentAssets);
        const grossAssets = Object.keys(currentAssets).filter(k=>k!=='loan').reduce((s,k)=> s + (currentAssets[k]||[]).reduce((sum,a)=>sum+(a.amount||0),0),0);
        const loanSum = (currentAssets['loan']||[]).reduce((s,a)=> s+(a.amount||0), 0);
        const totalAssets = grossAssets + loanSum;

        const sectorTotals = {};
        Object.keys(currentAssets).forEach(sector => {
            if (sector === 'loan') return;
            const sectorSum = (currentAssets[sector]||[]).reduce((sum, asset) => sum + (asset.amount || 0), 0);
            sectorTotals[sector] = { amount: sectorSum, percentage: grossAssets > 0 ? (sectorSum / grossAssets * 100) : 0 };
        });

        const itemTotals = {};
        Object.keys(currentAssets).forEach(sector => {
            itemTotals[sector] = (currentAssets[sector]||[]).map(asset => ({
                id: asset.id, // [개선] 비교를 위해 id 포함
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
            // 매달 전체 자산 객체를 복사하는 대신, 마지막 달만 복사하도록 최적화
            assets: month === monthsToProject ? JSON.parse(JSON.stringify(currentAssets, (k, v) => k === '_repaymentAccountRef' ? undefined : v)) : null
        });
    }
    return { projections: monthlyProjections, warnings };
};

// [추가] 재시도 로직을 포함한 타임아웃 헬퍼 함수
const withRetry = async (fn, maxAttempts = 3, timeoutMs = 12000, delayMs = 2000, onRetry) => {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await Promise.race([
                fn(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error(`요청 시간이 초과되었습니다. (${timeoutMs / 1000}초)`)), timeoutMs)
                )
            ]);
        } catch (error) {
            lastError = error;
            if (attempt < maxAttempts) {
                if (onRetry) onRetry(attempt + 1, maxAttempts);
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }
    }
    throw lastError;
};

// [추가] 데이터 암호화 함수
const encryptData = (data, key) => {
    if (!key) throw new Error('Encryption key is missing or invalid');
    if (!window.CryptoJS || !window.pako) throw new Error('CryptoJS or pako library not loaded');
    const jsonStr = JSON.stringify(data);
    const compressed = window.pako.deflate(jsonStr);
    const wordArray = window.CryptoJS.lib.WordArray.create(compressed);
    return window.CryptoJS.AES.encrypt(wordArray, key).toString();
};

// [추가] 데이터 복호화 함수
const decryptData = (ciphertext, key) => {
    if (!key) throw new Error('Decryption key is missing or invalid');
    if (!window.CryptoJS || !window.pako) throw new Error('CryptoJS or pako library not loaded');
    const decrypted = window.CryptoJS.AES.decrypt(ciphertext, key);
    if (decrypted.sigBytes <= 0) throw new Error('Decryption failed: Invalid key or corrupted data');
    const typedArray = new Uint8Array(decrypted.sigBytes);
    const words = decrypted.words;
    for (let i = 0; i < decrypted.sigBytes; i++) {
        typedArray[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    }
    const decompressed = window.pako.inflate(typedArray, { to: 'string' });
    return JSON.parse(decompressed);
};

// [추가] 색상 이름으로 RGB 값 반환
const getRGB = (colorName) => {
    const colors = {
        blue: '59, 130, 246',
        green: '34, 197, 94',
        orange: '249, 115, 22',
        purple: '168, 85, 247',
        yellow: '234, 179, 8',
        cyan: '6, 182, 212',
        gray: '107, 114, 128',
        red: '239, 68, 68',
        indigo: '79, 70, 229',
        rose: '244, 63, 94',
        emerald: '16, 185, 129',
        amber: '245, 158, 11',
        sky: '14, 165, 233',
        slate: '71, 85, 105',
        teal: '20, 184, 166',
        pink: '236, 72, 153',
        deposit: '59, 130, 246',
        savings: '34, 197, 94',
        investment: '249, 115, 22',
        pension: '168, 85, 247',
        realestate: '245, 158, 11',
        car: '6, 182, 212',
        loan: '107, 114, 128',
        misc: '107, 114, 128'
    };
    if (!colorName || typeof colorName !== 'string') return colors['gray'];
    return colors[colorName.toLowerCase()] || colors['gray'];
};

// [추가] 차트 그라데이션 생성 함수
const createGradient = (ctx, colors) => {
    if (!ctx || !colors) return colors?.start || '#3b82f6';
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, colors?.start || '#3b82f6');
    gradient.addColorStop(1, colors?.end || '#1d4ed8');
    return gradient;
};

// [수정] 일관된 암호화 키 생성 로직
const getEncryptionKey = (mode, secret, email, securityKey) => {
    // [수정] 강화 모드: 이메일 + 사용자 설정 비밀번호 조합으로 보안 강화
    if (mode === 'secure') {
        return (email && secret) ? email + secret : null;
    }
    
    // Normal 모드: 일관성을 위해 이메일을 식별자로 사용 (Salt Consistency)
    const placeholder = '__SECURITY' + '_KEY__';
    // [Fix] Hardened Placeholder Check: Ensure placeholder string is never used as salt
    if (!securityKey || securityKey.includes(placeholder)) return null;
    
    return email + securityKey;
};

// [추가] Supabase 환경변수 검증 및 추출 헬퍼
const validateSupabaseConfig = () => {
    const conf = window.SUPABASE_CONFIG || {};
    const isInvalid = (val, ph) => !val || val === ph || (typeof val === 'string' && val.includes(ph));
    
    const url = isInvalid(conf.SUPABASE_URL, '__SUPABASE' + '_URL__') ? null : conf.SUPABASE_URL;
    const key = isInvalid(conf.SUPABASE_KEY, '__SUPABASE' + '_KEY__') ? null : conf.SUPABASE_KEY;
    // [Fix] Hardened Placeholder Check for SECURITY_KEY
    const sec = isInvalid(conf.SECURITY_KEY, '__SECURITY' + '_KEY__') ? null : conf.SECURITY_KEY;

    if (!url || !key) {
        console.warn("⚠️ Supabase Config Missing or Invalid: App will run in Local Storage Mode.");
    }
    
    return { SUPABASE_URL: url, SUPABASE_KEY: key, SECURITY_KEY: sec };
};

// [추가] CSV 생성 헬퍼
const generateCSV = (assets) => {
    const sectorMap = {
        deposit: '입출금통장', savings: '저축', investment: '투자', pension: '연금',
        realestate: '부동산', car: '자동차', loan: '대출', misc: '기타'
    };
    const headers = ['섹터', '항목명', '현재금액', '수익률', '수수료율', '월납입', '추가납입', '출금계좌', '만기개월', '대출시작일'];
    let csvContent = headers.join(',') + '\n';

    Object.keys(assets).forEach(sector => {
        const koreanSector = sectorMap[sector] || sector;
        (assets[sector] || []).forEach(asset => {
            const row = [
                koreanSector,
                `"${asset.name}"`,
                asset.amount || 0,
                asset.rate || 0,
                asset.feeRate || 0,
                asset.monthlyContrib || 0,
                asset.extraContrib || 0,
                `"${asset.extraFrom || ''}"`,
                asset.maturityMonth || '',
                asset.loanStartDate || ''
            ];
            csvContent += row.join(',') + '\n';
        });
    });
    return csvContent;
};

// [추가] CSV 파싱 헬퍼
const parseCSV = (text) => {
    const reverseSectorMap = {
        '입출금통장': 'deposit', '저축': 'savings', '투자': 'investment', '연금': 'pension',
        '부동산': 'realestate', '자동차': 'car', '대출': 'loan', '기타': 'misc',
        'deposit': 'deposit', 'savings': 'savings', 'investment': 'investment',
        'pension': 'pension', 'realestate': 'realestate', 'car': 'car',
        'loan': 'loan', 'misc': 'misc', '예적금': 'savings', '주식': 'investment', '펀드': 'investment', '부채': 'loan'
    };
    
    const lines = text.split('\n');
    const newAssets = {};
    // 기본 섹터 초기화
    ['deposit', 'savings', 'investment', 'pension', 'realestate', 'car', 'loan', 'misc'].forEach(k => newAssets[k] = []);

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (parts.length < 3) continue;

        const koreanSector = parts[0].trim();
        const sector = reverseSectorMap[koreanSector] || koreanSector;
        if (!newAssets[sector]) newAssets[sector] = [];

        const asset = {
            id: Date.now() + Math.random() + i,
            name: parts[1].replace(/"/g, '').trim(),
            amount: Number(parts[2].replace(/,/g, '')) || 0,
            rate: Number(parts[3].replace(/,/g, '')) || 0,
            feeRate: Number(parts[4].replace(/,/g, '')) || 0,
            monthlyContrib: Number(parts[5].replace(/,/g, '')) || 0,
            extraContrib: Number(parts[6].replace(/,/g, '')) || 0,
            extraFrom: parts[7]?.replace(/"/g, '').trim() || '',
            maturityMonth: Number(parts[8]) || 12,
            loanStartDate: parts[9]?.trim() || ''
        };
        newAssets[sector].push(asset);
    }
    return newAssets;
};

// [추가] 데이터 압축 (Base64)
const compressData = (data) => {
    if (!window.pako) throw new Error('pako library not loaded');
    const jsonString = JSON.stringify(data);
    const compressedDataArray = window.pako.deflate(jsonString);
    // 대용량 데이터 처리를 위해 String.fromCharCode.apply 대신 반복문 사용
    let binaryString = '';
    const len = compressedDataArray.length;
    for (let i = 0; i < len; i++) {
        binaryString += String.fromCharCode(compressedDataArray[i]);
    }
    return btoa(binaryString);
};

// [추가] 데이터 압축 해제 (Base64)
const decompressData = (base64String) => {
    if (!window.pako) throw new Error('pako library not loaded');
    const binaryString = atob(base64String);
    const len = binaryString.length;
    const compressedDataArray = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        compressedDataArray[i] = binaryString.charCodeAt(i);
    }
    const jsonString = window.pako.inflate(compressedDataArray, { to: 'string' });
    return JSON.parse(jsonString);
};

// 전역 객체에 노출
window.formatNumber = formatNumber;
window.formatPercent = formatPercent;
window.calculateGrossTotal = calculateGrossTotal;
window.getSectorTotals = getSectorTotals;
window.calculateMonthlyProjection = calculateMonthlyProjection;
window.calculateLoanPayment = calculateLoanPayment;
window.getMonthDiff = getMonthDiff;
window.withRetry = withRetry;
window.encryptData = encryptData;
window.decryptData = decryptData;
window.getRGB = getRGB;
window.createGradient = createGradient;
window.validateSupabaseConfig = validateSupabaseConfig;
window.getEncryptionKey = getEncryptionKey;
window.generateCSV = generateCSV;
window.parseCSV = parseCSV;
window.compressData = compressData;
window.decompressData = decompressData;