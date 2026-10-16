import React, { useState, useMemo } from 'react';
import MarkdownRenderer from './MarkdownRenderer';

const PRESET_ITEMS = [
    { label: '🎧 프리미엄 소형가전/취미', name: '소형 가전 / 기호품', price: 30, category: '일상/취미', depreciation: 40 },
    { label: '📱 최신 플래그십 폰/태블릿', name: '아이패드 프로 / 최신 스마트폰', price: 180, category: 'IT/가전', depreciation: 35 },
    { label: '💻 하이엔드 노트북/데스크탑', name: '맥북 프로 / RTX 하이엔드 PC', price: 350, category: 'IT/가전', depreciation: 30 },
    { label: '✈️ 유럽/미주 프리미엄 여행', name: '해외 비즈니스/장거리 여행', price: 500, category: '경험/여가', depreciation: 100 },
    { label: '👜 명품 시계 / 하이엔드 가방', name: '명품 컬렉션 아이템', price: 850, category: '패션/사치재', depreciation: 20 },
    { label: '🚗 준중형~중형 신차 출고', name: '신차 구매 (취등록세 포함)', price: 3800, category: '자동차', depreciation: 25, monthlyMaint: 35 },
    { label: '🏎️ 수입 프리미엄 세단/SUV', name: '수입차 출고', price: 7500, category: '자동차', depreciation: 30, monthlyMaint: 65 }
];

export default function ImpulseBuyJudge({
    monthlySalary = 0,
    currentAppData = null,
    currentCalculation = null,
    assetHistory = [],
    addToast = null
}) {
    const [itemName, setItemName] = useState('아이패드 프로 / 최신 IT 기기');
    const [itemPrice, setItemPrice] = useState(180); // 만원 단위
    const [installmentMonths, setInstallmentMonths] = useState(0); // 0 = 일시불
    const [installmentRate, setInstallmentRate] = useState(5.9); // 할부 이자율 (%)
    const [monthlyMaintCost, setMonthlyMaintCost] = useState(0); // 월 추가 유지비 (만원, 차량/구독 등)
    const [aiVerdictText, setAiVerdictText] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiError, setAiError] = useState('');

    // 사용자의 실제 재무 지표 추출
    const metrics = useMemo(() => {
        const netWorth = Number(currentCalculation?.currentNet) || 0;
        const totalAsset = Number(currentCalculation?.currentTotal) || 0;
        const targetAmount = Number(currentAppData?.targetAmount) || 50000;
        const salary = Number(monthlySalary || currentAppData?.monthlySalary) || 350;
        const totalExpense = Number(currentCalculation?.totalMonthlyExpense) || 150;
        const monthlySurplus = Math.max(1, salary - totalExpense);
        const dailySurplus = monthlySurplus / 30.4;
        const hourlyWage = salary / 160; // 월 160시간(주 40시간) 기준 시급(만원)

        // 포트폴리오 가중평균 기대수익률 산출
        let weightedRateSum = 0;
        let productiveAssetSum = 0;
        const loans = [];
        const stocks = [];

        if (currentAppData?.assets) {
            Object.keys(currentAppData.assets).forEach(sec => {
                (currentAppData.assets[sec] || []).forEach(a => {
                    const amt = Number(a.amount) || 0;
                    const rate = Number(a.rate) || 0;
                    if (sec === 'loan') {
                        if (amt > 0) {
                            loans.push({
                                name: a.name,
                                amount: amt,
                                rate: rate,
                                monthlyContrib: Number(a.monthlyContrib) || 0,
                                maturityMonth: Number(a.maturityMonth) || 0
                            });
                        }
                    } else if (amt > 0) {
                        weightedRateSum += amt * rate;
                        productiveAssetSum += amt;
                    }
                    if (Array.isArray(a.linkedItems)) {
                        a.linkedItems.forEach(li => {
                            if (li.ticker && Number(li.currentPrice) > 0 && Number(li.shares) > 0) {
                                stocks.push({
                                    name: li.name,
                                    ticker: li.ticker,
                                    price: Number(li.currentPrice),
                                    shares: Number(li.shares)
                                });
                            }
                        });
                    }
                });
            });
        }

        const avgPortfolioReturn = productiveAssetSum > 0
            ? Math.max(4.0, Math.min(15.0, weightedRateSum / productiveAssetSum))
            : 7.5; // 기본 연 7.5%

        // 자본 체급 지표: 내 금융/생산자산의 하루 ±1% 시장 등락폭 (만원)
        const dailyAssetSwing1Pct = Math.max(1, Math.round((productiveAssetSum > 0 ? productiveAssetSum : netWorth) * 0.01 * 10) / 10);

        return {
            netWorth,
            totalAsset,
            productiveAssetSum,
            dailyAssetSwing1Pct,
            targetAmount,
            salary,
            totalExpense,
            monthlySurplus,
            dailySurplus,
            hourlyWage,
            avgPortfolioReturn,
            loans,
            stocks
        };
    }, [monthlySalary, currentAppData, currentCalculation]);

    // 구매 기회비용 정밀 수학 연산
    const analysis = useMemo(() => {
        const price = Math.max(0, Number(itemPrice) || 0);
        const maint = Math.max(0, Number(monthlyMaintCost) || 0);
        const months = Number(installmentMonths) || 0;
        const instRate = Number(installmentRate) || 0;

        // 할부 이자 총액 계산 (원리금균등)
        let totalInstallmentInterest = 0;
        let monthlyInstallmentPayment = price;
        if (months > 0 && instRate > 0) {
            const r = instRate / 100 / 12;
            monthlyInstallmentPayment = (price * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
            totalInstallmentInterest = Math.max(0, monthlyInstallmentPayment * months - price);
        } else if (months > 0) {
            monthlyInstallmentPayment = price / months;
        }

        const effectiveInitialCost = price + totalInstallmentInterest;
        const rPort = metrics.avgPortfolioReturn / 100;
        const rMonth = rPort / 12;

        // 5년, 10년, 20년 복리 기회비용 (일시불 원금 + 월 유지비 적립식 복리 합산)
        const calcFutureOpportunityCost = (years) => {
            const n = years * 12;
            const fvLump = effectiveInitialCost * Math.pow(1 + rPort, years);
            const fvMaint = maint > 0 && rMonth > 0
                ? maint * ((Math.pow(1 + rMonth, n) - 1) / rMonth)
                : maint * n;
            return Math.round(fvLump + fvMaint);
        };

        const fv5Y = calcFutureOpportunityCost(5);
        const fv10Y = calcFutureOpportunityCost(10);
        const fv20Y = calcFutureOpportunityCost(20);

        // 은퇴(목표 달성) 지연 일수 및 필요 노동 시간
        const delayedDays = Math.round((effectiveInitialCost + maint * 12) / metrics.dailySurplus);
        const delayedMonths = (delayedDays / 30.4).toFixed(1);
        const workHoursRequired = Math.round(effectiveInitialCost / metrics.hourlyWage);
        const workDaysRequired = (workHoursRequired / 8).toFixed(1);

        // 순자산 대비 타격 비율 (%)
        const netWorthRatioNum = metrics.netWorth > 0 ? (effectiveInitialCost / metrics.netWorth) * 100 : 100;
        const netWorthImpactPct = metrics.netWorth > 0 ? netWorthRatioNum.toFixed(2) : '0.00';

        // 보유 주식 대체 매수 기회비용 (S&P500 또는 보유 1위 종목 몇 주 분량인지)
        const priceInWon = effectiveInitialCost * 10000;
        const stockEquivalents = metrics.stocks.slice(0, 3).map(st => ({
            name: st.name,
            ticker: st.ticker,
            unitPrice: st.price,
            buyableShares: Math.floor(priceInWon / st.price)
        }));

        // 대출 중도상환 대체 효과
        const loanComparisons = metrics.loans.map(l => {
            const reducedMonths = l.monthlyContrib > 0 ? (effectiveInitialCost / l.monthlyContrib).toFixed(1) : 0;
            const annualInterestSaved = Math.round(Math.min(effectiveInitialCost, l.amount) * (l.rate / 100) * 10) / 10;
            return {
                name: l.name,
                rate: l.rate,
                reducedMonths,
                annualInterestSaved
            };
        });

        // 종합 판결 등급 (자본 체급 비례: 순자산 비중 + 일일 포트폴리오 1% 등락폭 + 월 잉여저축액 종합 반영)
        const ratioToMonthlySurplus = effectiveInitialCost / metrics.monthlySurplus;
        let verdictGrade = 'B';
        let verdictTitle = '⚠️ 신중한 재검토 권고 (조건부 승인)';
        let verdictColor = 'amber';

        if (
            (netWorthRatioNum <= 0.5 || effectiveInitialCost <= metrics.dailyAssetSwing1Pct || ratioToMonthlySurplus <= 0.2) &&
            maint === 0 &&
            totalInstallmentInterest === 0
        ) {
            verdictGrade = 'S';
            verdictTitle = '💎 즉시 구매 승인 (내 자본 체급 대비 무풍지대 — 하루 주가 1% 등락 이하)';
            verdictColor = 'emerald';
        } else if (
            (netWorthRatioNum <= 1.8 || ratioToMonthlySurplus <= 0.6) &&
            maint <= metrics.monthlySurplus * 0.05
        ) {
            verdictGrade = 'A';
            verdictTitle = '✅ 구매 승인 (내 자산 체급에서 충분히 감당 가능한 합리적 소비)';
            verdictColor = 'emerald';
        } else if (
            (netWorthRatioNum <= 4.5 || ratioToMonthlySurplus <= 1.5) &&
            maint <= metrics.monthlySurplus * 0.15
        ) {
            verdictGrade = 'B';
            verdictTitle = '⚖️ 조건부 승인 (재무 궤도 영향 경미 — 할부 대신 일시불/배당 재원 권장)';
            verdictColor = 'indigo';
        } else if (netWorthRatioNum <= 12.0 || ratioToMonthlySurplus <= 4.5) {
            verdictGrade = 'C';
            verdictTitle = '🚨 주의: 스노우볼 감속 발생 (보너스·수익실현 재원으로 구매 권고)';
            verdictColor = 'amber';
        } else {
            verdictGrade = 'F';
            verdictTitle = '☠️ 기각: 자본 체급 대비 과소비 (은퇴 지연 및 현금흐름 훼손 심각)';
            verdictColor = 'rose';
        }

        return {
            price,
            maint,
            months,
            totalInstallmentInterest: Math.round(totalInstallmentInterest * 10) / 10,
            monthlyInstallmentPayment: Math.round(monthlyInstallmentPayment * 10) / 10,
            effectiveInitialCost: Math.round(effectiveInitialCost * 10) / 10,
            fv5Y,
            fv10Y,
            fv20Y,
            delayedDays,
            delayedMonths,
            workHoursRequired,
            workDaysRequired,
            netWorthRatioNum,
            netWorthImpactPct,
            ratioToMonthlySurplus,
            stockEquivalents,
            loanComparisons,
            verdictGrade,
            verdictTitle,
            verdictColor
        };
    }, [itemPrice, monthlyMaintCost, installmentMonths, installmentRate, metrics]);

    // Gemini AI 판사 최종 판결문 스트리밍 호출
    const handleAskAiJudge = async () => {
        const apiKey = (localStorage.getItem('asset_gemini_api_key') || '').trim();
        if (!apiKey) {
            setAiError('Gemini API 키가 설정되어 있지 않습니다. 우측 상단 [설정 > API 키 관리]에서 등록해주세요.');
            if (window.showApiKeyModal) window.showApiKeyModal();
            return;
        }

        setIsAiLoading(true);
        setAiError('');
        setAiVerdictText('');

        const prompt = `당신은 사용자의 '자본 체급(순자산 규모 및 현금흐름)'을 정확히 꿰뚫어 보는 합리적이고 위트 있는 '대법원 금융 기회비용 수석 판사'입니다.
사용자가 다음 물건의 구매 심의를 요청했습니다. 아래 실제 재무 스펙과 시스템 사전 판정 등급(${analysis.verdictGrade}등급)에 맞춰 판결문을 작성해 주세요.

[⚠️ 절대 준수 원칙 (위반 시 판결 무효)]
1. **날짜 표기 절대 금지**: 당신은 현재가 몇 년 몇 월 며칠인지 알 수 없습니다. 판결문에 '202X년', 'X월 X일', '작성일', '판결일자' 등 어떠한 날짜나 연도도 절대 적지 마세요.
2. **자본 체급 비례 원칙 (억지 비난 및 볼펜 훈계 금지!)**:
   - 현재 사용자의 순자산은 **${Math.round(metrics.netWorth).toLocaleString()}만원**, 월 잉여저축액은 **${Math.round(metrics.monthlySurplus).toLocaleString()}만원**, 보유 자산의 하루 ±1% 시장 등락폭은 **약 ${metrics.dailyAssetSwing1Pct.toLocaleString()}만원**입니다.
   - 이번 구매 금액(${analysis.effectiveInitialCost.toLocaleString()}만원)은 순자산의 **${analysis.netWorthImpactPct}%**에 불과하며, 시스템 판정 등급은 **[${analysis.verdictGrade}등급: ${analysis.verdictTitle}]**입니다.
   - 만약 **S등급 또는 A등급**(순자산의 1.8% 이하이거나 하루 주가 1% 변동폭 안팎인 소액·적정 소비)이라면: **"모나미 볼펜을 사라"거나 "당장 취소하라"는 식의 영혼 없는 짠돌이 훈계를 절대 하지 마세요!** 사용자의 높은 자본 체급과 저축률을 인정하고, "현재 자산 체급에서는 하루 주식 계좌 등락폭보다도 작은 금액이므로 기분 좋게 일시불로 승인한다"고 쿨하고 품격 있게 허가하세요. 단, 가벼운 재테크 위트(예: 소비 금액의 10%만큼 보유 ETF 1주 함께 적립하기 등)만 곁들이세요.
   - 반대로 **C등급 또는 F등급**(순자산 대비 과도한 지출, 고금리 할부 이자 발생, 높은 월 유지비)일 때만 대법관답게 매섭고 신랄하게 팩폭하세요.

[구매 심의 신청 내역]
- 품목명: ${itemName}
- 구매 가격: ${analysis.price.toLocaleString()}만원 (${analysis.months > 0 ? `${analysis.months}개월 할부, 할부이자 ${analysis.totalInstallmentInterest}만원 발생` : '일시불'})
- 월 추가 유지비: ${analysis.maint}만원
- 시스템 사전 산출 등급: **${analysis.verdictGrade}등급** (${analysis.verdictTitle})

[사용자의 실제 재무 체급]
- 현재 순자산: ${Math.round(metrics.netWorth).toLocaleString()}만원 (목표 은퇴자산: ${metrics.targetAmount.toLocaleString()}만원)
- 내 포트폴리오 하루 ±1% 시장 등락폭: 약 ${metrics.dailyAssetSwing1Pct.toLocaleString()}만원
- 월 급여: ${metrics.salary.toLocaleString()}만원 / 월 고정지출: ${Math.round(metrics.totalExpense).toLocaleString()}만원 / 월 잉여저축액: ${Math.round(metrics.monthlySurplus).toLocaleString()}만원
- 포트폴리오 연평균 기대수익률: ${metrics.avgPortfolioReturn.toFixed(1)}%
- 보유 대출 현황: ${metrics.loans.map(l => `${l.name}(잔액 ${l.amount}만원, 금리 ${l.rate}%, 월상환 ${l.monthlyContrib}만원)`).join(', ') || '대출 없음'}
- 보유 주식 대체 기회비용: ${analysis.stockEquivalents.map(s => `${s.name} ${s.buyableShares}주`).join(', ') || '해당 없음'}

[계산된 기회비용 팩트]
- 순자산 대비 비중: ${analysis.netWorthImpactPct}%
- 내 노동 시간 환산: ${analysis.workHoursRequired}시간 (${analysis.workDaysRequired}일 근무치)
- 은퇴 목표 달성 지연: +${analysis.delayedDays}일 (${analysis.delayedMonths}개월)
- 10년 뒤 복리 가치: ${analysis.fv10Y.toLocaleString()}만원

다음 3단 구성으로 깔끔한 마크다운(표 \`| 항목 | 수치 | 평가 |\`, **볼드체** 적극 활용, 날짜 절대 표기 금지)으로 판결하세요:
1. ⚖️ **주문 (판결 요약 및 자본 체급 진단)**: [${analysis.verdictGrade}등급] 선언 및 사용자의 순자산·일일 변동폭 대비 이 지출의 실제 무게감 1~2줄 요약
2. 📊 **기회비용 대조표 (마크다운 표 필수 포함)**: 구매 원금, 순자산 비중, 하루 주가 등락폭 대비 체감도, 10년 복리 가치, 대체 매수 가능 주식/대출 상환 효과를 마크다운 표로 정리
3. 💡 **수석 판사의 최종 집행 지침**: 등급(${analysis.verdictGrade})에 걸맞은 스마트한 결제/사후관리 팁 제시`;

        const models = window.GEMINI_MODELS || ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite'];

        const tryModel = (idx) => {
            if (idx >= models.length) {
                setAiError('AI 판결문 생성에 실패했습니다. API 키 또는 할당량을 확인해주세요.');
                setIsAiLoading(false);
                return;
            }
            const model = models[idx];
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

            if (window.streamGeminiResponse) {
                window.streamGeminiResponse(
                    url,
                    { contents: [{ parts: [{ text: prompt }] }] },
                    (chunkText) => setAiVerdictText(chunkText),
                    () => setIsAiLoading(false),
                    () => tryModel(idx + 1)
                );
            } else {
                setIsAiLoading(false);
                setAiError('스트리밍 유틸리티를 찾을 수 없습니다.');
            }
        };

        tryModel(0);
    };

    const badgeStyles = {
        emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
        amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
        rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* 상단 타이틀 카드 */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-500/20 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-[10px] font-black uppercase tracking-wider">
                                AI Opportunity Cost Judge
                            </span>
                            <span className="text-xs text-slate-400 font-bold">
                                내 평균 복리 {metrics.avgPortfolioReturn.toFixed(1)}% • 시급 {(metrics.hourlyWage * 10000).toLocaleString()}원 기준
                            </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black mt-2 flex items-center gap-2">
                            <span>🛒</span> "이거 사도 될까?" AI 기회비용 재판소
                        </h2>
                        <p className="text-xs text-slate-300 mt-1">
                            사고 싶은 물건의 가격을 입력하면 내 실제 순자산·보유주식·대출금리와 대조하여 은퇴 지연 일수와 10년 뒤 복리 증발액을 즉시 판결합니다.
                        </p>
                    </div>
                    <div className="flex flex-col items-end bg-white/5 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10">
                        <span className="text-[10px] text-slate-400 font-bold">현재 내 일평균 저축 여력</span>
                        <span className="text-lg font-black text-emerald-400">
                            +{Math.round(metrics.dailySurplus * 10) / 10}만원 / 일
                        </span>
                        <span className="text-[10px] text-slate-400">
                            (월 잉여현금 {Math.round(metrics.monthlySurplus).toLocaleString()}만원)
                        </span>
                    </div>
                </div>
            </div>

            {/* 프리셋 원클릭 버튼 바 */}
            <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="text-xs font-black text-slate-600 dark:text-slate-300 mb-2.5 flex items-center gap-1.5">
                    <span>⚡</span> 자주 고민하는 소비 프리셋 원클릭 대입
                </div>
                <div className="flex flex-wrap gap-2">
                    {PRESET_ITEMS.map((preset, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setItemName(preset.name);
                                setItemPrice(preset.price);
                                setMonthlyMaintCost(preset.monthlyMaint || 0);
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700 transition-all cursor-pointer active:scale-95"
                        >
                            {preset.label} ({preset.price.toLocaleString()}만)
                        </button>
                    ))}
                </div>
            </div>

            {/* 메인 입력 + 실시간 판결 대시보드 (2단 그리드) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 좌측: 구매 조건 입력 패널 (5칸) */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-850 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b dark:border-slate-800 pb-3">
                        <span>📝</span> 구매 심의 대상 입력
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                                구매하려는 품목명
                            </label>
                            <input
                                type="text"
                                value={itemName}
                                onChange={(e) => setItemName(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="예: 아이패드 프로, 소나타 신차 등"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                    구매 가격 (만원 단위)
                                </label>
                                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                                    {(Number(itemPrice) * 10000).toLocaleString()}원
                                </span>
                            </div>
                            <input
                                type="number"
                                value={itemPrice}
                                onChange={(e) => setItemPrice(Math.max(0, Number(e.target.value)))}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-base font-black text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <input
                                type="range"
                                min="10"
                                max="10000"
                                step="10"
                                value={Math.min(10000, itemPrice)}
                                onChange={(e) => setItemPrice(Number(e.target.value))}
                                className="w-full mt-2 accent-indigo-600 cursor-pointer"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                                    결제 방식 (할부 개월)
                                </label>
                                <select
                                    value={installmentMonths}
                                    onChange={(e) => setInstallmentMonths(Number(e.target.value))}
                                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                                >
                                    <option value={0}>일시불 (할부 0개월)</option>
                                    <option value={3}>3개월 할부</option>
                                    <option value={6}>6개월 할부</option>
                                    <option value={12}>12개월 할부</option>
                                    <option value={24}>24개월 할부</option>
                                    <option value={36}>36개월 할부</option>
                                    <option value={60}>60개월 풀할부</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                                    할부 연이자율 (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    disabled={installmentMonths === 0}
                                    value={installmentRate}
                                    onChange={(e) => setInstallmentRate(Math.max(0, Number(e.target.value)))}
                                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 disabled:opacity-40"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                    월 추가 유지비 (보험/구독/유류비 등, 만원)
                                </label>
                                <span className="text-[11px] font-bold text-slate-400">없으면 0</span>
                            </div>
                            <input
                                type="number"
                                value={monthlyMaintCost}
                                onChange={(e) => setMonthlyMaintCost(Math.max(0, Number(e.target.value)))}
                                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-slate-100"
                            />
                        </div>
                    </div>

                    {/* AI 판결 요청 버튼 */}
                    <button
                        onClick={handleAskAiJudge}
                        disabled={isAiLoading}
                        className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-sm shadow-lg shadow-indigo-500/20 transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isAiLoading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>대법원 AI 판사가 판결문 작성 중...</span>
                            </>
                        ) : (
                            <>
                                <span>👨‍⚖️</span>
                                <span>AI 금융 판사에게 팩폭 판결문 받기</span>
                            </>
                        )}
                    </button>
                </div>

                {/* 우측: 기회비용 수학적 시뮬레이션 결과 (7칸) */}
                <div className="lg:col-span-7 space-y-5">
                    {/* 1. 종합 등급 배너 */}
                    <div className={`p-5 rounded-3xl border-2 ${badgeStyles[analysis.verdictColor]} flex items-center justify-between gap-4`}>
                        <div className="space-y-1">
                            <div className="text-[11px] font-black uppercase tracking-wider opacity-80">
                                실시간 재무 충격 판정 (자본 체급 비례)
                            </div>
                            <div className="text-lg sm:text-xl font-black">
                                {analysis.verdictTitle}
                            </div>
                            <div className="text-xs opacity-90 font-medium">
                                실질 소요 원금 <b>{analysis.effectiveInitialCost.toLocaleString()}만원</b> (순자산의 {analysis.netWorthImpactPct}% • 내 포트폴리오 하루 ±1% 변동폭 {metrics.dailyAssetSwing1Pct.toLocaleString()}만원 대비 {(analysis.effectiveInitialCost / metrics.dailyAssetSwing1Pct).toFixed(1)}배)
                            </div>
                        </div>
                        <div className="w-16 h-16 rounded-2xl bg-white/80 dark:bg-slate-900/80 flex flex-col items-center justify-center shadow-md flex-shrink-0 border border-current/20">
                            <span className="text-[9px] font-bold opacity-70">판정등급</span>
                            <span className="text-2xl font-black">{analysis.verdictGrade}</span>
                        </div>
                    </div>

                    {/* 2. 4대 핵심 기회비용 메트릭 카드 */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <div className="text-[11px] font-bold text-slate-400">내 수명(노동) 환산</div>
                            <div className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 mt-1">
                                {analysis.workHoursRequired.toLocaleString()}시간
                            </div>
                            <div className="text-[10px] font-bold text-indigo-500 mt-0.5">
                                꼬박 {analysis.workDaysRequired}일 출근치
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <div className="text-[11px] font-bold text-slate-400">은퇴(목표) 지연</div>
                            <div className="text-base sm:text-lg font-black text-rose-600 dark:text-rose-400 mt-1">
                                +{analysis.delayedDays.toLocaleString()}일 후퇴
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                                약 {analysis.delayedMonths}개월 퇴사 지연
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <div className="text-[11px] font-bold text-slate-400">10년 뒤 복리 가치</div>
                            <div className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 mt-1">
                                {analysis.fv10Y.toLocaleString()}만원
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                                5년 뒤 {analysis.fv5Y.toLocaleString()}만 / 20년 뒤 {analysis.fv20Y.toLocaleString()}만
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <div className="text-[11px] font-bold text-slate-400">할부 이자 손실</div>
                            <div className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 mt-1">
                                {analysis.totalInstallmentInterest > 0 ? `+${analysis.totalInstallmentInterest}만원` : '0원 (일시불)'}
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                                {analysis.months > 0 ? `월 ${analysis.monthlyInstallmentPayment.toLocaleString()}만원 납부` : '할부 수수료 없음'}
                            </div>
                        </div>
                    </div>

                    {/* 3. 내 실제 보유 주식 & 보유 대출 대조 섹션 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* 보유 주식 대체 매수 */}
                        <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                            <div className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                                <span>📈</span> 이 돈으로 내 보유 주식을 더 샀다면?
                            </div>
                            {analysis.stockEquivalents.length > 0 ? (
                                <div className="space-y-2">
                                    {analysis.stockEquivalents.map((st, i) => (
                                        <div key={i} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-xl">
                                            <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                                                {st.name}
                                            </span>
                                            <span className="font-black text-indigo-600 dark:text-indigo-400">
                                                +{st.buyableShares.toLocaleString()}주 추가 매수 가능
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400">연동된 주식 종목이 없습니다.</p>
                            )}
                        </div>

                        {/* 보유 대출 상환 대조 */}
                        <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                            <div className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                                <span>🏦</span> 이 돈으로 내 대출/차용금을 갚았다면?
                            </div>
                            {analysis.loanComparisons.length > 0 ? (
                                <div className="space-y-2">
                                    {analysis.loanComparisons.map((ln, i) => (
                                        <div key={i} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-xl">
                                            <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[130px]">
                                                {ln.name} ({ln.rate}%)
                                            </span>
                                            <span className="font-black text-emerald-600 dark:text-emerald-400">
                                                {ln.reducedMonths > 0 ? `만기 ${ln.reducedMonths}개월 단축` : `연이자 ${ln.annualInterestSaved}만 절감`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400">현재 등록된 대출/차용금이 없습니다.</p>
                            )}
                        </div>
                    </div>

                    {/* 4. AI 판결문 출력 영역 */}
                    {(aiVerdictText || aiError) && (
                        <div className="bg-amber-50/70 dark:bg-slate-900 p-5 rounded-3xl border-2 border-amber-300 dark:border-amber-700/60 shadow-md space-y-3 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between border-b border-amber-200 dark:border-slate-800 pb-2">
                                <span className="text-xs font-black text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                                    <span>⚖️</span> 대법원 금융 기회비용 판결문
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200/70 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                                    피청구품: {itemName} ({analysis.verdictGrade}등급)
                                </span>
                            </div>
                            {aiError ? (
                                <div className="text-xs font-bold text-rose-600 dark:text-rose-400">
                                    ⚠️ {aiError}
                                </div>
                            ) : (
                                <MarkdownRenderer content={aiVerdictText} />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
