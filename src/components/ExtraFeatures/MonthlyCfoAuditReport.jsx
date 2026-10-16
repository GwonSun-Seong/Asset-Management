import React, { useState, useMemo } from 'react';
import MarkdownRenderer from './MarkdownRenderer';

export default function MonthlyCfoAuditReport({
    monthlySalary = 0,
    currentAppData = null,
    currentCalculation = null,
    assetHistory = [],
    addToast = null
}) {
    const [selectedPeriodDays, setSelectedPeriodDays] = useState(30); // 30일, 90일, 180일, 365일
    const [aiReportText, setAiReportText] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiError, setAiError] = useState('');

    // 자산 히스토리 및 포트폴리오 기반 요인 분해 (Attribution Analysis)
    const auditData = useMemo(() => {
        const netWorthNow = Number(currentCalculation?.currentNet) || 0;
        const grossWorthNow = Number(currentCalculation?.currentTotal) || 0;
        const salary = Number(monthlySalary || currentAppData?.monthlySalary) || 350;
        const fixedExpense = Number(currentCalculation?.totalMonthlyExpense) || 150;
        const monthlySurplus = Math.max(0, salary - fixedExpense);

        const sortedHistory = [...(assetHistory || [])].sort((a, b) => new Date(a.date) - new Date(b.date));

        // 기준 스냅샷 찾기
        const nowTime = Date.now();
        const targetCutoff = nowTime - selectedPeriodDays * 86400 * 1000;
        let basePoint = sortedHistory[0] || { date: new Date().toISOString().slice(0, 10), netWorth: netWorthNow, grossWorth: grossWorthNow };

        for (let i = sortedHistory.length - 1; i >= 0; i--) {
            const ptTime = new Date(sortedHistory[i].date).getTime();
            if (ptTime <= targetCutoff) {
                basePoint = sortedHistory[i];
                break;
            }
        }

        const baseNetWorth = Number(basePoint.netWorth) || netWorthNow;
        const baseGrossWorth = Number(basePoint.grossWorth || basePoint.netWorth) || grossWorthNow;
        const actualDaysElapsed = Math.max(1, Math.round((nowTime - new Date(basePoint.date).getTime()) / 86400000));
        const monthsElapsed = Math.max(0.2, actualDaysElapsed / 30.4);

        const totalNetChange = Math.round(netWorthNow - baseNetWorth);
        const totalNetChangePct = baseNetWorth > 0 ? ((totalNetChange / baseNetWorth) * 100).toFixed(2) : '0.00';

        // 1. 근로소득 순저축 기여분 추산
        const estimatedLaborSavings = Math.round(monthlySurplus * monthsElapsed);

        // 2. 부채 원금 상환 기여분 및 이자 비용 추산
        let monthlyDebtPrincipalPaid = 0;
        let monthlyDebtInterestPaid = 0;
        let totalDebtBalance = 0;
        const loanDetails = [];

        if (currentAppData?.assets?.loan) {
            currentAppData.assets.loan.forEach(l => {
                const amt = Number(l.amount) || 0;
                const rate = Number(l.rate) || 0;
                const contrib = Number(l.monthlyContrib) || 0;
                totalDebtBalance += amt;
                const monthlyInterest = (amt * (rate / 100)) / 12;
                const principalPart = Math.max(0, contrib - monthlyInterest);
                monthlyDebtPrincipalPaid += principalPart;
                monthlyDebtInterestPaid += monthlyInterest;
                loanDetails.push({
                    name: l.name,
                    amount: amt,
                    rate,
                    contrib,
                    monthlyInterest: Math.round(monthlyInterest * 10) / 10,
                    principalPart: Math.round(principalPart * 10) / 10
                });
            });
        }

        const periodDebtPrincipalReduced = Math.round(monthlyDebtPrincipalPaid * monthsElapsed);
        const periodDebtInterestCost = Math.round(monthlyDebtInterestPaid * monthsElapsed);

        // 3. 보유 주식 평가손익 및 효자/부진 종목 분석
        let totalStockInvested = 0;
        let totalStockCurrentVal = 0;
        const stockPerformances = [];

        if (currentAppData?.assets) {
            Object.keys(currentAppData.assets).forEach(sec => {
                (currentAppData.assets[sec] || []).forEach(a => {
                    if (Array.isArray(a.linkedItems)) {
                        a.linkedItems.forEach(item => {
                            const shares = Number(item.shares) || 0;
                            const curP = Number(item.currentPrice) || 0;
                            const avgP = Number(item.avgPrice) || curP;
                            if (shares > 0 && curP > 0) {
                                const invested = (shares * avgP) / 10000;
                                const current = (shares * curP) / 10000;
                                const profit = current - invested;
                                const profitPct = avgP > 0 ? ((curP - avgP) / avgP) * 100 : 0;
                                totalStockInvested += invested;
                                totalStockCurrentVal += current;
                                stockPerformances.push({
                                    name: item.name,
                                    ticker: item.ticker,
                                    invested: Math.round(invested),
                                    current: Math.round(current),
                                    profit: Math.round(profit * 10) / 10,
                                    profitPct: profitPct.toFixed(2)
                                });
                            }
                        });
                    }
                });
            });
        }

        stockPerformances.sort((a, b) => b.profit - a.profit);
        const topStock = stockPerformances[0] || null;
        const worstStock = stockPerformances.length > 1 ? stockPerformances[stockPerformances.length - 1] : null;
        const totalStockProfit = Math.round(totalStockCurrentVal - totalStockInvested);

        // 4. 자본(시장/복리) 변동분 = 총 순자산 변동 - 근로저축 기여분
        const marketAndCapitalEffect = totalNetChange - estimatedLaborSavings;

        // 5. 재무 건전성 핵심 KPI (CFO 지표)
        const debtToAssetRatio = grossWorthNow > 0 ? ((totalDebtBalance / grossWorthNow) * 100).toFixed(1) : '0.0';
        const savingsRatio = salary > 0 ? ((monthlySurplus / salary) * 100).toFixed(1) : '0.0';
        const dsrRatio = salary > 0
            ? (((monthlyDebtPrincipalPaid + monthlyDebtInterestPaid) / salary) * 100).toFixed(1)
            : '0.0';

        // CFO 종합 감사 등급
        let auditGrade = 'A';
        let auditComment = '적정 부채 통제 및 견고한 잉여현금흐름 창출 중';
        if (Number(savingsRatio) >= 50 && totalNetChange >= 0) {
            auditGrade = 'S (최우수)';
            auditComment = '초고속 자본 축적 구간 진입 — 잉여현금흐름 및 부채 상환 완벽';
        } else if (Number(savingsRatio) >= 30) {
            auditGrade = 'A (양호)';
            auditComment = '안정적인 흑자 재무구조 유지 중';
        } else if (totalNetChange < 0) {
            auditGrade = 'C (주의)';
            auditComment = '자산 평가액 하락 또는 지출 초과로 순자산 역성장 발생';
        }

        return {
            actualDaysElapsed,
            baseNetWorth: Math.round(baseNetWorth),
            netWorthNow: Math.round(netWorthNow),
            grossWorthNow: Math.round(grossWorthNow),
            totalDebtBalance: Math.round(totalDebtBalance),
            totalNetChange,
            totalNetChangePct,
            estimatedLaborSavings,
            marketAndCapitalEffect,
            periodDebtPrincipalReduced,
            periodDebtInterestCost,
            loanDetails,
            stockPerformances,
            topStock,
            worstStock,
            totalStockProfit,
            debtToAssetRatio,
            savingsRatio,
            dsrRatio,
            auditGrade,
            auditComment,
            historyCount: sortedHistory.length
        };
    }, [selectedPeriodDays, monthlySalary, currentAppData, currentCalculation, assetHistory]);

    // AI CFO 이사회 감사 보고서 생성
    const handleGenerateAiAudit = async () => {
        const apiKey = (localStorage.getItem('asset_gemini_api_key') || '').trim();
        if (!apiKey) {
            setAiError('Gemini API 키가 설정되어 있지 않습니다. 상단 [설정 > API 키 관리]에서 등록해주세요.');
            if (window.showApiKeyModal) window.showApiKeyModal();
            return;
        }

        setIsAiLoading(true);
        setAiError('');
        setAiReportText('');

        const prompt = `당신은 냉철하고 치밀한 '개인 재무 최고재무책임자(CFO) 겸 내부 감사관'입니다.
아래 사용자의 실제 결산 데이터를 바탕으로 이사회에 보고하듯 격식 있고 예리한 **[CFO 재무 감사 보고서]**를 작성해 주세요.

[⚠️ 절대 준수 작성 원칙]
1. **날짜 및 연도 표기 절대 금지**: 당신은 오늘이 몇 년 몇 월 며칠인지 알 수 없습니다. 보고서 어디에도 '202X년', 'X월 X일', '작성일:', '기준일:', '감사일:' 같은 날짜나 연도를 절대 적지 마세요! 기간을 언급할 때는 오직 **'최근 ${selectedPeriodDays}일 결산 구간(실제 경과 ${auditData.actualDaysElapsed}일)'**이라고만 표기하세요.
2. **가독성 극대화**: 핵심 재무 수치 비교는 반드시 **마크다운 표(\`| 구분 | 금액/지표 | 비중/비고 |\`)**와 **볼드체(\`**강조**\`)**를 활용하여 한눈에 들어오게 작성하세요.

[감사 대상 구간 및 총괄 실적]
- 결산 구간: 최근 ${selectedPeriodDays}일 결산 구간 (${auditData.actualDaysElapsed}일간 변동)
- 기초 순자산: ${auditData.baseNetWorth.toLocaleString()}만원 ➔ 기말(현재) 순자산: ${auditData.netWorthNow.toLocaleString()}만원
- 기간 순자산 증감: ${auditData.totalNetChange >= 0 ? '+' : ''}${auditData.totalNetChange.toLocaleString()}만원 (${auditData.totalNetChangePct}%)
- 총자산: ${auditData.grossWorthNow.toLocaleString()}만원 / 총부채: ${auditData.totalDebtBalance.toLocaleString()}만원 (부채비율 ${auditData.debtToAssetRatio}%)
- 시스템 산출 감사 등급: ${auditData.auditGrade}

[성장 요인 분해 (Attribution Analysis)]
- 근로소득 순저축 기여액: +${auditData.estimatedLaborSavings.toLocaleString()}만원 (저축률 ${auditData.savingsRatio}%)
- 시장/투자 평가변동 기여액: ${auditData.marketAndCapitalEffect >= 0 ? '+' : ''}${auditData.marketAndCapitalEffect.toLocaleString()}만원
- 기간 내 부채 원금 감축액: ${auditData.periodDebtPrincipalReduced.toLocaleString()}만원 (지불 이자비용: ${auditData.periodDebtInterestCost}만원, 월급 대비 원리금상환비율 DSR: ${auditData.dsrRatio}%)

[주식 포트폴리오 손익 명세]
- 전체 주식 누적 평가손익: ${auditData.totalStockProfit >= 0 ? '+' : ''}${auditData.totalStockProfit.toLocaleString()}만원
- 최고 효자 종목(MVP): ${auditData.topStock ? `${auditData.topStock.name} (${auditData.topStock.profit >= 0 ? '+' : ''}${auditData.topStock.profit}만원, ${auditData.topStock.profitPct}%)` : '없음'}
- 최하위 부진 종목(Laggard): ${auditData.worstStock ? `${auditData.worstStock.name} (${auditData.worstStock.profit}만원, ${auditData.worstStock.profitPct}%)` : '없음'}
- 세부 대출 목록: ${auditData.loanDetails.map(l => `${l.name}(잔액 ${l.amount}만, 금리 ${l.rate}%, 월원금 ${l.principalPart}만/이자 ${l.monthlyInterest}만)`).join(', ') || '없음'}

다음 4개 섹션으로 명확하고 전문적인 마크다운 보고서를 작성하세요 (날짜 표기 절대 금지):
1. 📋 **CFO 총평 및 재무제표 핵심 진단**: 순자산 증감의 질(근로저축 주도인지, 투자수익 주도인지) 평가
2. 📊 **자산 증감 요인 분해 요약표 (마크다운 표 필수 포함)**: 기초/기말 순자산, 근로저축 기여, 투자변동 기여, 부채원금 상환 기여, 이자비용을 마크다운 표로 정리하고 감사 의견 제시
3. 🎯 **투자 포트폴리오 및 부채 구조 감사**: 효자 종목과 부진 종목의 편차 진단 및 부채 상환 효율성 코멘트
4. 🚀 **차기 결산 구간 핵심 재무 지침 (Action Directive)**: 순자산 가속을 위해 즉시 실행할 숫자 기반 지침 3가지`;

        const models = window.GEMINI_MODELS || ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite'];

        const tryModel = (idx) => {
            if (idx >= models.length) {
                setAiError('AI 감사 보고서 생성에 실패했습니다. API 키 또는 할당량을 확인해주세요.');
                setIsAiLoading(false);
                return;
            }
            const model = models[idx];
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

            if (window.streamGeminiResponse) {
                window.streamGeminiResponse(
                    url,
                    { contents: [{ parts: [{ text: prompt }] }] },
                    (chunkText) => setAiReportText(chunkText),
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

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* 상단 CFO 헤더 배너 */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl border border-slate-700/60">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                                Executive CFO Audit Report
                            </span>
                            <span className="text-xs text-slate-400 font-bold">
                                최근 {selectedPeriodDays}일 결산 구간 (실제 {auditData.actualDaysElapsed}일간)
                            </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black mt-2 flex items-center gap-2">
                            <span>📊</span> 월간 AI CFO 재무 감사 & 요인분해 보고서
                        </h2>
                        <p className="text-xs text-slate-300 mt-1">
                            내 순자산 변동을 [근로저축 기여분 + 투자/환율 변동분 + 부채원금 상환분]으로 정밀 분해(Attribution)하여 기업 이사회 수준으로 결산합니다.
                        </p>
                    </div>

                    {/* 기간 선택 탭 */}
                    <div className="flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-700/60 self-start md:self-center">
                        {[
                            { label: '최근 30일', days: 30 },
                            { label: '최근 90일', days: 90 },
                            { label: '최근 6개월', days: 180 },
                            { label: '최근 1년', days: 365 }
                        ].map(opt => (
                            <button
                                key={opt.days}
                                onClick={() => setSelectedPeriodDays(opt.days)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                    selectedPeriodDays === opt.days
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 핵심 요인 분해 4대 스코어보드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-850 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                    <div className="text-xs font-bold text-slate-400 flex items-center justify-between">
                        <span>기간 순자산 증감</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            최근 {selectedPeriodDays}일 구간
                        </span>
                    </div>
                    <div className={`text-2xl font-black mt-2 ${auditData.totalNetChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {auditData.totalNetChange >= 0 ? '+' : ''}{auditData.totalNetChange.toLocaleString()}만원
                    </div>
                    <div className="text-xs text-slate-500 mt-1 font-bold">
                        {auditData.baseNetWorth.toLocaleString()}만 ➔ {auditData.netWorthNow.toLocaleString()}만 ({auditData.totalNetChangePct}%)
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-850 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                    <div className="text-xs font-bold text-slate-400 flex items-center justify-between">
                        <span>① 근로저축 기여분 (추정)</span>
                        <span className="text-[10px] font-black text-indigo-500">저축률 {auditData.savingsRatio}%</span>
                    </div>
                    <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
                        +{auditData.estimatedLaborSavings.toLocaleString()}만원
                    </div>
                    <div className="text-xs text-slate-500 mt-1 font-medium">
                        월급 잉여현금 유입 누적액
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-850 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                    <div className="text-xs font-bold text-slate-400 flex items-center justify-between">
                        <span>② 투자·시장 평가 변동</span>
                        <span className="text-[10px] font-black text-amber-500">누적손익 {auditData.totalStockProfit >= 0 ? `+${auditData.totalStockProfit}` : auditData.totalStockProfit}만</span>
                    </div>
                    <div className={`text-2xl font-black mt-2 ${auditData.marketAndCapitalEffect >= 0 ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`}>
                        {auditData.marketAndCapitalEffect >= 0 ? '+' : ''}{auditData.marketAndCapitalEffect.toLocaleString()}만원
                    </div>
                    <div className="text-xs text-slate-500 mt-1 font-medium">
                        주가·환율·복리 자본수익 효과
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-850 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                    <div className="text-xs font-bold text-slate-400 flex items-center justify-between">
                        <span>③ 부채 원금 상환 기여</span>
                        <span className="text-[10px] font-black text-emerald-500">DSR {auditData.dsrRatio}%</span>
                    </div>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                        -{auditData.periodDebtPrincipalReduced.toLocaleString()}만원 감축
                    </div>
                    <div className="text-xs text-slate-500 mt-1 font-medium">
                        기간 이자비용: {auditData.periodDebtInterestCost}만원 지출
                    </div>
                </div>
            </div>

            {/* 중간 섹션: 보유 종목 MVP/역적 & 부채 상환 명세표 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 좌측: 주식 포트폴리오 손익 기여도 감사 (7칸) */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-850 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b dark:border-slate-800 pb-3">
                        <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <span>🏆</span> 보유 종목별 수익 기여도 서열 (Attribution)
                        </h3>
                        <span className="text-xs font-black text-slate-500">
                            총 {auditData.stockPerformances.length}개 종목
                        </span>
                    </div>

                    {auditData.stockPerformances.length > 0 ? (
                        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                            {auditData.stockPerformances.map((st, idx) => {
                                const isPlus = st.profit >= 0;
                                return (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black ${
                                                idx === 0 ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                            }`}>
                                                {idx === 0 ? '👑' : idx + 1}
                                            </span>
                                            <div className="truncate">
                                                <div className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">
                                                    {st.name}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-bold">
                                                    매입 {st.invested.toLocaleString()}만 ➔ 평가 {st.current.toLocaleString()}만
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className={`text-xs font-black ${isPlus ? 'text-red-500' : 'text-blue-500'}`}>
                                                {isPlus ? '+' : ''}{st.profit.toLocaleString()}만원
                                            </div>
                                            <div className={`text-[10px] font-bold ${isPlus ? 'text-red-400' : 'text-blue-400'}`}>
                                                ({isPlus ? '+' : ''}{st.profitPct}%)
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-xs text-slate-400 font-bold">
                            등록된 주식 종목이 없습니다.
                        </div>
                    )}
                </div>

                {/* 우측: 부채 원금/이자 분리 감사 및 AI 호출 (5칸) */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-850 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-5">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b dark:border-slate-800 pb-3">
                            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                <span>🏦</span> 부채 상환 효율 감사 (원금 vs 이자)
                            </h3>
                            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                                감사등급: {auditData.auditGrade}
                            </span>
                        </div>

                        {auditData.loanDetails.length > 0 ? (
                            <div className="space-y-2.5">
                                {auditData.loanDetails.map((ln, idx) => (
                                    <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-black text-slate-800 dark:text-slate-100">{ln.name}</span>
                                            <span className="font-bold text-slate-500">잔액 {ln.amount.toLocaleString()}만 ({ln.rate}%)</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                                월 원금 감축: {ln.principalPart}만원
                                            </span>
                                            <span className="text-rose-500 font-bold">
                                                월 이자 비용: {ln.monthlyInterest}만원
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-xs text-slate-400 py-4 text-center">보유 중인 대출이 없습니다 (무차입 경영 달성).</div>
                        )}
                    </div>

                    <div className="space-y-3 pt-2">
                        <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 text-xs text-indigo-900 dark:text-indigo-200 font-bold">
                            💡 <b>감사 한줄평:</b> {auditData.auditComment}
                        </div>

                        <button
                            onClick={handleGenerateAiAudit}
                            disabled={isAiLoading}
                            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-900 hover:from-slate-800 hover:to-indigo-800 dark:from-indigo-600 dark:to-violet-600 text-white font-black text-sm shadow-lg transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isAiLoading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>AI CFO가 이사회 감사 보고서 집필 중...</span>
                                </>
                            ) : (
                                <>
                                    <span>📋</span>
                                    <span>AI CFO 정밀 감사 보고서 전문 생성</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* AI CFO 감사 보고서 출력 보드 */}
            {(aiReportText || aiError) && (
                <div className="bg-white dark:bg-slate-850 p-6 sm:p-8 rounded-3xl border-2 border-indigo-500/40 shadow-xl space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b dark:border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">📑</span>
                            <h3 className="text-base font-black text-slate-900 dark:text-white">
                                AI 최고재무책임자(CFO) 공식 감사 보고서
                            </h3>
                        </div>
                        <button
                            onClick={() => window.print()}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                        >
                            🖨️ 인쇄 / PDF 보관
                        </button>
                    </div>

                    {aiError ? (
                        <div className="text-xs font-bold text-rose-600 dark:text-rose-400">
                            ⚠️ {aiError}
                        </div>
                    ) : (
                        <MarkdownRenderer content={aiReportText} />
                    )}
                </div>
            )}
        </div>
    );
}

