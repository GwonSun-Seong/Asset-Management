// defaultData.js - 기본 데이터와 데모 포트폴리오 설정 관리 파일

// 납입 출처 기본값 상수 (utils.js의 전역 설정 참조)
const DEFAULT_INCOME_SOURCE = window.MONTHLY_INCOME_SOURCE || '월 고정수입';

// 로컬 시간 기준 날짜 문자열 생성 헬퍼 (초기 데이터용)
const getLocalToday = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// 과거 날짜 생성 헬퍼 (시나리오 및 히스토리 기준일 맞춤용)
const getPastDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// 데모용 상세 스냅샷(종목/계좌) 생성 헬퍼 (진행률 progress: 0.0 ~ 1.0)
const buildDemoSnapshotDetail = (progress, netWorth, grossWorth) => {
    const p = Math.max(0.15, Math.min(1, progress));
    const fxRate = Math.round(1290 + p * 90 + Math.sin(p * 12) * 15);
    const loanAmt = Math.max(1600, Math.round(grossWorth - netWorth));

    const stocks = [
        {
            name: 'Vanguard S&P 500 ETF',
            ticker: 'VOO',
            shares: Math.max(5, Math.round(35 * p)),
            price: Math.round(540000 + 200000 * p),
            avgPrice: 610000,
            accountName: '해외주식 직투계좌',
            sector: 'investment'
        },
        {
            name: '엔비디아 (NVIDIA)',
            ticker: 'NVDA',
            shares: Math.max(5, Math.round(30 * p)),
            price: Math.round(75000 + 110000 * p),
            avgPrice: 128000,
            accountName: '해외주식 직투계좌',
            sector: 'investment'
        },
        {
            name: '애플 (Apple)',
            ticker: 'AAPL',
            shares: Math.max(2, Math.round(10 * p)),
            price: Math.round(240000 + 75000 * p),
            avgPrice: 265000,
            accountName: '해외주식 직투계좌',
            sector: 'investment'
        },
        {
            name: 'iShares 미국 20년+ 장기국채 ETF',
            ticker: 'TLT',
            shares: Math.max(5, Math.round(30 * p)),
            price: Math.round(121000 + 4000 * p),
            avgPrice: 121000,
            accountName: '해외주식 직투계좌',
            sector: 'investment'
        },
        {
            name: 'TIGER 미국S&P500',
            ticker: '360750',
            shares: Math.max(80, Math.round(500 * p)),
            price: Math.round(14500 + 5900 * p),
            avgPrice: 16800,
            accountName: '중개형 ISA계좌',
            sector: 'investment'
        },
        {
            name: 'TIGER 미국배당다우존스',
            ticker: '458730',
            shares: Math.max(80, Math.round(500 * p)),
            price: Math.round(10400 + 1800 * p),
            avgPrice: 11100,
            accountName: '중개형 ISA계좌',
            sector: 'investment'
        },
        {
            name: 'TIGER 미국채10년선물',
            ticker: '305080',
            shares: Math.max(50, Math.round(300 * p)),
            price: Math.round(12100 + 900 * p),
            avgPrice: 12400,
            accountName: '중개형 ISA계좌',
            sector: 'investment'
        },
        {
            name: 'ACE KRX금현물',
            ticker: '411060',
            shares: Math.max(50, Math.round(350 * p)),
            price: Math.round(12800 + 5200 * p),
            avgPrice: 14500,
            accountName: 'KRX 금현물 계좌',
            sector: 'investment'
        },
        {
            name: '비트코인 (BTC)',
            ticker: 'KRW-BTC',
            shares: Number((0.015 + 0.02 * p).toFixed(4)),
            price: Math.round(62000000 + 73000000 * p),
            avgPrice: 98000000,
            accountName: '업비트 (가상자산)',
            sector: 'investment'
        },
        {
            name: 'KODEX 미국나스닥100',
            ticker: '379810',
            shares: Math.max(80, Math.round(500 * p)),
            price: Math.round(13200 + 6000 * p),
            avgPrice: 15200,
            accountName: '연금저축펀드',
            sector: 'pension'
        },
        {
            name: 'TIGER 미국S&P500채권혼합',
            ticker: '449180',
            shares: Math.max(50, Math.round(300 * p)),
            price: Math.round(10900 + 1600 * p),
            avgPrice: 11600,
            accountName: '퇴직연금 IRP',
            sector: 'pension'
        }
    ];

    const accounts = [
        { sec: 'deposit', name: '비상금 파킹통장', amount: Math.round(250 + 350 * p), monthlyContrib: 10, rate: 3.2 },
        { sec: 'deposit', name: '생활비통장', amount: Math.round(250 + 100 * p), monthlyContrib: 10, rate: 1.5 },
        { sec: 'savings', name: '청년도약계좌', amount: Math.round(200 + 1650 * p), monthlyContrib: 70, rate: 6.0 },
        { sec: 'savings', name: '주택청약종합저축', amount: Math.round(180 + 270 * p), monthlyContrib: 10, rate: 2.8 },
        { sec: 'investment', name: '해외주식 직투계좌', amount: Math.round(850 + 3000 * p), monthlyContrib: 60, rate: 10.5 },
        { sec: 'investment', name: '중개형 ISA계좌', amount: Math.round(450 + 1700 * p), monthlyContrib: 40, rate: 9.0 },
        { sec: 'investment', name: 'KRX 금현물 계좌', amount: Math.round(120 + 530 * p), monthlyContrib: 10, rate: 6.0 },
        { sec: 'investment', name: '업비트 (가상자산)', amount: Math.round(100 + 400 * p), monthlyContrib: 0, rate: 12.0 },
        { sec: 'pension', name: '연금저축펀드', amount: Math.round(220 + 780 * p), monthlyContrib: 25, rate: 9.5 },
        { sec: 'pension', name: '퇴직연금 IRP', amount: Math.round(100 + 300 * p), monthlyContrib: 10, rate: 7.0 },
        { sec: 'loan', name: '마이너스/신용대출', amount: loanAmt, monthlyContrib: 37, rate: 4.2 }
    ];

    return { fxRate, stocks, accounts };
};

// 약 3년치(1,080일) 고밀도 자산 성장 & 스노우볼 복리 가속 히스토리 생성
// 순자산 2,400만원(총자산 4,800만 / 대출 2,400만)에서 출발해 현재 순자산 10,200만원(총자산 11,800만 / 대출 1,600만) 도달
const generateMockHistory = () => {
    const history = [];
    const today = new Date();
    const totalSpanDays = 1080;

    // 7일 간격(과거) + 최근 60일은 3일 간격으로 촘촘하게 샘플링 (약 168개 포인트)
    const dayOffsets = [];
    for (let d = totalSpanDays; d > 60; d -= 7) {
        dayOffsets.push(d);
    }
    for (let d = 60; d >= 0; d -= 3) {
        dayOffsets.push(d);
    }
    if (dayOffsets[dayOffsets.length - 1] !== 0) {
        dayOffsets.push(0);
    }

    const startNet = 2400;
    const endNet = 10200;
    const startLoan = 2400;
    const endLoan = 1600;

    // 주요 마일스톤 메모 매핑
    const milestoneMemos = [
        { threshold: 3000, text: '🌱 순자산 3,000만 달성! S&P500 적립식 투자 본격 시작', used: false },
        { threshold: 4500, text: '📈 미 증시 랠리 및 ISA 계좌 납입 한도 증액', used: false },
        { threshold: 5000, text: '🎉 순자산 5,000만 돌파! (시드머니 반환점 통과)', used: false },
        { threshold: 6500, text: '💰 연말 성과급 입금 & 신용대출 원금 중도상환 실행', used: false },
        { threshold: 8000, text: '🚀 순자산 8,000만 돌파! 복리 스노우볼 가속 구간 진입', used: false },
        { threshold: 9500, text: '🏛️ 포트폴리오 리밸런싱 (미국 장기채 TLT & 금현물 비중 확대)', used: false },
        { threshold: 10000, text: '🏆 대망의 순자산 1억 돌파 달성!', used: false }
    ];

    dayOffsets.forEach((daysAgo, idx) => {
        const d = new Date(today);
        d.setDate(today.getDate() - daysAgo);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

        // 0.0 (3년 전) -> 1.0 (오늘)
        const t = (totalSpanDays - daysAgo) / totalSpanDays;

        // 복리 가속 곡선 (초기 완만 -> 후반부 가속: 0.65 * t + 0.35 * t^1.65) + 현실적인 시장 사이클 파동
        const compoundCurve = 0.62 * t + 0.38 * Math.pow(t, 1.65);
        const marketCycle =
            Math.sin(t * Math.PI * 5.5) * 95 * (0.4 + 0.6 * t) +
            Math.cos(t * Math.PI * 13) * 35;

        let netWorth = Math.round(startNet + (endNet - startNet) * compoundCurve + marketCycle);
        if (daysAgo === totalSpanDays) netWorth = startNet;
        if (daysAgo === 0) netWorth = endNet;

        // 부채는 2,400만 -> 1,600만으로 점진적 상환
        const currentLoan = Math.round(startLoan - (startLoan - endLoan) * t);
        const grossWorth = netWorth + currentLoan;

        // 마일스톤 최초 돌파 시점에 메모 부여
        let memo = '';
        for (const ms of milestoneMemos) {
            if (!ms.used && netWorth >= ms.threshold) {
                memo = ms.text;
                ms.used = true;
                break;
            }
        }

        // 월별 포인트, 마일스톤 포인트, 최근 10개 포인트에 상세 스냅샷(종목/계좌) 포함 -> 스냅샷 비교기 즉시 활용 가능
        const includeDetail = Boolean(memo) || idx % 4 === 0 || daysAgo <= 30 || idx === 0;
        const detail = includeDetail ? buildDemoSnapshotDetail(t, netWorth, grossWorth) : null;

        history.push({
            date: dateStr,
            time: '09:00:00',
            netWorth,
            grossWorth,
            grossTotal: grossWorth,
            ...(memo ? { memo } : {}),
            ...(detail ? {
                fxRate: detail.fxRate,
                stocks: detail.stocks,
                accounts: detail.accounts
            } : {})
        });
    });

    return history;
};

// 공개용 데모 기본값 (순자산 1억 200만 / 총자산 1억 1,800만 / 부채 1,600만)
// 현금흐름 완전 균형 설계: 월수입 420만 - 고정지출 130만 = 가용현금 290만 (월납입 245만 + 대출상환 37만 = 282만, 잉여 +8만 자동저축)
const publicDefaultData = {
    projectionMonths: 24,
    monthlySalary: 420,
    salaryDay: 25,
    targetAmount: 30000, // 목표 순자산 3억 (만원)
    goalMode: 'months',
    displayMode: 'amount',
    darkMode: false,
    rebalancingMode: 'simple',
    assets: {
        deposit: [
            {
                id: 'def-dep-1',
                name: '비상금 파킹통장',
                amount: 600,
                rate: 3.2,
                feeRate: 0,
                monthlyContrib: 10,
                monthlyContributionFrom: DEFAULT_INCOME_SOURCE,
                memo: '비상 예비자금 (파킹통장 일복리)',
                purposeTags: [
                    { id: 'def-pt-1', label: '비상예비금', amount: 450 },
                    { id: 'def-pt-2', label: '여행·여가', amount: 150 }
                ]
            },
            { id: 'def-dep-2', name: '생활비통장', amount: 350, rate: 1.5, feeRate: 0, monthlyContrib: 10, monthlyContributionFrom: DEFAULT_INCOME_SOURCE, memo: '월급 입금 및 카드 결제 주계좌' }
        ],
        savings: [
            {
                id: 'def-sav-1',
                name: '청년도약계좌',
                amount: 1850,
                rate: 6.0,
                feeRate: 0,
                monthlyContrib: 70,
                monthlyContributionFrom: DEFAULT_INCOME_SOURCE,
                memo: '정부기여금 포함 비과세 적금',
                purposeTags: [
                    { id: 'def-pt-3', label: '주거·전세', amount: 1200 },
                    { id: 'def-pt-4', label: '결혼자금', amount: 650 }
                ]
            },
            {
                id: 'def-sav-2',
                name: '주택청약종합저축',
                amount: 450,
                rate: 2.8,
                feeRate: 0,
                monthlyContrib: 10,
                monthlyContributionFrom: DEFAULT_INCOME_SOURCE,
                memo: '소득공제 및 청약 1순위 유지',
                purposeTags: [
                    { id: 'def-pt-5', label: '주거·전세', amount: 450 }
                ]
            }
        ],
        investment: [
            {
                id: 'def-inv-1',
                name: '해외주식 직투계좌',
                amount: 3850,
                baseAmount: 15,
                rate: 10.5,
                feeRate: 0,
                monthlyContrib: 60,
                monthlyContributionFrom: DEFAULT_INCOME_SOURCE,
                cashCategory: '현금',
                memo: '미국 핵심 지수·빅테크·장기국채 자산배분',
                linkedItems: [
                    { ticker: 'VOO', name: 'Vanguard S&P 500 ETF', shares: 35, avgPrice: 610000, currentPrice: 740000, basePrice: 731000, change: 9000, changePct: 1.23, category: '지수', autoUpdate: false, syncStatus: 'online' },
                    { ticker: 'NVDA', name: '엔비디아 (NVIDIA)', shares: 30, avgPrice: 128000, currentPrice: 185000, basePrice: 180500, change: 4500, changePct: 2.49, category: '개별주', autoUpdate: false, syncStatus: 'online' },
                    { ticker: 'AAPL', name: '애플 (Apple)', shares: 10, avgPrice: 265000, currentPrice: 315000, basePrice: 312000, change: 3000, changePct: 0.96, category: '개별주', autoUpdate: false, syncStatus: 'online' },
                    { ticker: 'TLT', name: 'iShares 미국 20년+ 장기국채 ETF', shares: 30, avgPrice: 121000, currentPrice: 125000, basePrice: 124200, change: 800, changePct: 0.64, category: '채권', autoUpdate: false, syncStatus: 'online' }
                ]
            },
            {
                id: 'def-inv-2',
                name: '중개형 ISA계좌',
                amount: 2150,
                baseAmount: 130,
                rate: 9.0,
                feeRate: 0,
                monthlyContrib: 40,
                monthlyContributionFrom: DEFAULT_INCOME_SOURCE,
                cashCategory: '현금',
                memo: '국내상장 미국 ETF 비과세·분리과세 계좌',
                purposeTags: [
                    { id: 'def-pt-6', label: '주거·전세', amount: 1000 }
                ],
                linkedItems: [
                    { ticker: '360750', name: 'TIGER 미국S&P500', shares: 500, avgPrice: 16800, currentPrice: 20400, basePrice: 20200, change: 200, changePct: 0.99, category: '지수', autoUpdate: false, syncStatus: 'online' },
                    { ticker: '458730', name: 'TIGER 미국배당다우존스', shares: 500, avgPrice: 11100, currentPrice: 12200, basePrice: 12120, change: 80, changePct: 0.66, category: '지수', autoUpdate: false, syncStatus: 'online' },
                    { ticker: '305080', name: 'TIGER 미국채10년선물', shares: 300, avgPrice: 12400, currentPrice: 13000, basePrice: 12950, change: 50, changePct: 0.39, category: '채권', autoUpdate: false, syncStatus: 'online' }
                ]
            },
            {
                id: 'def-inv-3',
                name: 'KRX 금현물 계좌',
                amount: 650,
                baseAmount: 20,
                rate: 6.0,
                feeRate: 0,
                monthlyContrib: 10,
                monthlyContributionFrom: DEFAULT_INCOME_SOURCE,
                cashCategory: '금',
                memo: '인플레이션 및 달러 헤지용 안전자산',
                linkedItems: [
                    { ticker: '411060', name: 'ACE KRX금현물', shares: 350, avgPrice: 14500, currentPrice: 18000, basePrice: 17850, change: 150, changePct: 0.84, category: '금', autoUpdate: false, syncStatus: 'online' }
                ]
            },
            {
                id: 'def-inv-4',
                name: '업비트 (가상자산)',
                amount: 500,
                baseAmount: 27.5,
                rate: 12.0,
                feeRate: 0,
                monthlyContrib: 0,
                monthlyContributionFrom: DEFAULT_INCOME_SOURCE,
                cashCategory: '코인',
                memo: '포트폴리오 5% 이내 대체자산 편입',
                linkedItems: [
                    { ticker: 'KRW-BTC', name: '비트코인 (BTC)', shares: 0.035, avgPrice: 98000000, currentPrice: 135000000, basePrice: 132000000, change: 3000000, changePct: 2.27, category: '코인', autoUpdate: false, syncStatus: 'online' }
                ]
            }
        ],
        pension: [
            {
                id: 'def-pen-1',
                name: '연금저축펀드',
                amount: 1000,
                baseAmount: 40,
                rate: 9.5,
                feeRate: 0,
                monthlyContrib: 25,
                monthlyContributionFrom: DEFAULT_INCOME_SOURCE,
                cashCategory: '지수',
                memo: '연 600만 세액공제 한도 노후 준비',
                linkedItems: [
                    { ticker: '379810', name: 'KODEX 미국나스닥100', shares: 500, avgPrice: 15200, currentPrice: 19200, basePrice: 18950, change: 250, changePct: 1.32, category: '지수', autoUpdate: false, syncStatus: 'online' }
                ]
            },
            {
                id: 'def-pen-2',
                name: '퇴직연금 IRP',
                amount: 400,
                baseAmount: 25,
                rate: 7.0,
                feeRate: 0,
                monthlyContrib: 10,
                monthlyContributionFrom: DEFAULT_INCOME_SOURCE,
                cashCategory: '채권',
                memo: '안전자산 30% 의무비중 채권혼합형 운용',
                linkedItems: [
                    { ticker: '449180', name: 'TIGER 미국S&P500채권혼합', shares: 300, avgPrice: 11600, currentPrice: 12500, basePrice: 12440, change: 60, changePct: 0.48, category: '채권', autoUpdate: false, syncStatus: 'online' }
                ]
            }
        ],
        realestate: [
            { id: 'def-re-1', name: '오피스텔 전세보증금', amount: 0, rate: 0.0, feeRate: 0, monthlyContrib: 0, monthlyContributionFrom: DEFAULT_INCOME_SOURCE, memo: '' }
        ],
        car: [],
        loan: [
            {
                id: 'def-loan-1',
                name: '마이너스/신용대출',
                amount: 1600,
                rate: 4.2,
                monthlyContrib: 37,
                monthlyContributionFrom: DEFAULT_INCOME_SOURCE,
                repaymentMethod: '원리금균등',
                repaymentAccount: 'salary',
                maturityMonth: 48,
                loanStartDate: getLocalToday().slice(0, 7),
                memo: '금리 우대 직장인 신용대출 (월급에서 원리금 자동상환)'
            }
        ],
        misc: [
            { id: 'def-misc-1', name: '기타자산', amount: 0, rate: 2.0, feeRate: 0, monthlyContrib: 0, monthlyContributionFrom: DEFAULT_INCOME_SOURCE, memo: '' }
        ]
    },
    monthlyExpenses: [
        { name: '식비 · 생활비', amount: 65, day: 15 },
        { name: '주거 · 관리비 · 통신', amount: 45, day: 25 },
        { name: '교통 · 보험 · 구독', amount: 20, day: 10 }
    ],
    expenseEvents: [
        {
            name: '아이패드 할부 잔여분',
            amount: 8,
            startMonth: getLocalToday().slice(0, 7),
            endMonth: (() => { const d = new Date(); d.setMonth(d.getMonth() + 11); return d.toISOString().slice(0, 7); })(),
            day: 20,
            targetSector: 'deposit',
            targetAsset: 1
        }
    ],
    rebalancingAlerts: {
        deposit: { warning: 5, danger: 10 },
        savings: { warning: 5, danger: 10 },
        investment: { warning: 5, danger: 10 },
        pension: { warning: 5, danger: 10 },
        realestate: { warning: 5, danger: 10 },
        car: { warning: 5, danger: 10 },
        misc: { warning: 5, danger: 10 }
    },
    simpleThresholds: { warning: 5, danger: 10 },
    rebalancingTargets: { deposit: 8, savings: 20, investment: 60, pension: 12, realestate: 0, car: 0, misc: 0 },
    baseDate: getLocalToday(),
    mainCashFlowAccount: '생활비통장',
    residualAccount: '비상금 파킹통장',
    history: generateMockHistory(),
    memo: '📌 [데모 포트폴리오 투자 원칙]\n1. 매월 급여(420만) 중 고정지출(130만)을 제외한 가용현금(290만) 범위 내에서 선저축·투자(245만) 및 대출상환(37만) 실행\n2. 매월 남는 잉여현금(+8만)은 비상금 파킹통장으로 자동저축하여 현금흐름 흑자 유지\n3. 투자자산은 지수ETF + 개별주 + 채권 + 금/코인/현금 6대 카테고리 분산 배분 유지',
    // 비교용 기본 시나리오 3종 세트
    scenarios: [
        {
            id: 'sc_aggressive',
            name: '🚀 공격적 성장 (미국 빅테크·지수 집중)',
            createdAt: getPastDate(365),
            data: {
                baseDate: getPastDate(365),
                monthlySalary: 420,
                monthlyExpenses: [{ name: '생활비', amount: 120, day: 15 }],
                assets: {
                    deposit: [{ id: 'sc1_d1', name: 'CMA 파킹', amount: 400, rate: 3.2, feeRate: 0, monthlyContrib: 0, monthlyContributionFrom: DEFAULT_INCOME_SOURCE, memo: '' }],
                    savings: [{ id: 'sc1_s1', name: '청년도약계좌', amount: 1200, rate: 6.0, feeRate: 0, monthlyContrib: 70, monthlyContributionFrom: DEFAULT_INCOME_SOURCE, memo: '' }],
                    investment: [
                        { id: 'sc1_i1', name: '나스닥100 · 빅테크 직투', amount: 4200, rate: 16.5, feeRate: 0, monthlyContrib: 180, monthlyContributionFrom: DEFAULT_INCOME_SOURCE, memo: '' },
                        { id: 'sc1_i2', name: '비트코인', amount: 500, rate: 20.0, feeRate: 0, monthlyContrib: 20, monthlyContributionFrom: DEFAULT_INCOME_SOURCE, memo: '' }
                    ],
                    pension: [{ id: 'sc1_p1', name: '연금저축 (나스닥)', amount: 800, rate: 12.0, feeRate: 0, monthlyContrib: 30, monthlyContributionFrom: DEFAULT_INCOME_SOURCE, memo: '' }],
                    realestate: [], car: [], loan: [], misc: []
                },
                rebalancingTargets: { deposit: 5, savings: 15, investment: 70, pension: 10, realestate: 0, car: 0, misc: 0 }
            }
        },
        {
            id: 'sc_moderate',
            name: '⚖️ 정통 올웨더 (주식·채권·금 균형)',
            createdAt: getPastDate(365),
            data: {
                baseDate: getPastDate(365),
                monthlySalary: 380,
                monthlyExpenses: [{ name: '생활비', amount: 145, day: 15 }],
                assets: {
                    deposit: [{ id: 'sc2_d1', name: '파킹통장', amount: 600, rate: 3.2, feeRate: 0, monthlyContrib: 20, monthlyContributionFrom: DEFAULT_INCOME_SOURCE, memo: '' }],
                    savings: [{ id: 'sc2_s1', name: '청년도약계좌', amount: 1500, rate: 6.0, feeRate: 0, monthlyContrib: 70, monthlyContributionFrom: DEFAULT_INCOME_SOURCE, memo: '' }],
                    investment: [
                        { id: 'sc2_i1', name: 'S&P500 + 미국채 + 금 배분', amount: 4200, rate: 9.0, feeRate: 0, monthlyContrib: 110, monthlyContributionFrom: DEFAULT_INCOME_SOURCE, memo: '' }
                    ],
                    pension: [{ id: 'sc2_p1', name: '연금저축 · IRP', amount: 800, rate: 8.0, feeRate: 0, monthlyContrib: 35, monthlyContributionFrom: DEFAULT_INCOME_SOURCE, memo: '' }],
                    realestate: [], car: [], loan: [], misc: []
                },
                rebalancingTargets: { deposit: 10, savings: 25, investment: 50, pension: 15, realestate: 0, car: 0, misc: 0 }
            }
        },
        {
            id: 'sc_conservative',
            name: '🛡️ 보수적 방어 (예적금·채권 중심)',
            createdAt: getPastDate(365),
            data: {
                baseDate: getPastDate(365),
                monthlySalary: 350,
                monthlyExpenses: [{ name: '생활비', amount: 150, day: 15 }],
                assets: {
                    deposit: [{ id: 'sc3_d1', name: '비상금 CMA', amount: 1500, rate: 3.3, feeRate: 0, monthlyContrib: 50, monthlyContributionFrom: DEFAULT_INCOME_SOURCE, memo: '' }],
                    savings: [{ id: 'sc3_s1', name: '우대금리 정기예적금', amount: 4000, rate: 4.5, feeRate: 0, monthlyContrib: 120, monthlyContributionFrom: DEFAULT_INCOME_SOURCE, memo: '' }],
                    investment: [{ id: 'sc3_i1', name: '국고채 · 단기채 ETF', amount: 1600, rate: 4.2, feeRate: 0, monthlyContrib: 30, monthlyContributionFrom: DEFAULT_INCOME_SOURCE, memo: '' }],
                    pension: [], realestate: [], car: [], loan: [], misc: []
                },
                rebalancingTargets: { deposit: 20, savings: 55, investment: 25, pension: 0, realestate: 0, car: 0, misc: 0 }
            }
        }
    ]
};

// 기본 레이아웃 순서 정의
const DEFAULT_LAYOUT_ORDER = [
    'summary', 'assets', 'expenses', 'events', 'memo', 'rebalance', 
    'budget', 'charts', 'history', 'scenario', 'detail-analysis', 'assumptions', 'community'
];

// 기본 자산 섹터 순서 정의
const DEFAULT_SECTOR_ORDER = [
    'deposit', 'savings', 'investment', 'pension', 'realestate', 'car', 'loan', 'misc'
];

// 전역으로 노출
window.publicDefaultData = publicDefaultData;
window.DEFAULT_LAYOUT_ORDER = DEFAULT_LAYOUT_ORDER;
window.DEFAULT_SECTOR_ORDER = DEFAULT_SECTOR_ORDER;
