// config.js - 폰트와 색깔 정보 관리 파일

window.tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif']
            },
            colors: {
                deposit: { 50: '#eff6ff', 500: '#3b82f6', 600: '#2563eb', start: '#60a5fa', end: '#3b82f6', darkStart: '#2563eb', darkEnd: '#1e40af' },
                savings: { 50: '#f0fdf4', 500: '#22c55e', 600: '#16a34a', start: '#34d399', end: '#10b981', darkStart: '#16a34a', darkEnd: '#166534' },
                investment: { 50: '#fff7ed', 500: '#f97316', 600: '#ea580c', start: '#fb923c', end: '#f97316', darkStart: '#ea580c', darkEnd: '#9a3412' },
                pension: { 50: '#faf5ff', 500: '#a855f7', 600: '#9333ea', start: '#c084fc', end: '#a855f7', darkStart: '#9333ea', darkEnd: '#6b21a8' },
                realestate: { 50: '#fef7f0', 500: '#f59e0b', 600: '#d97706', start: '#fbbf24', end: '#f59e0b', darkStart: '#d97706', darkEnd: '#92400e' },
                car: { 50: '#ecfeff', 500: '#06b6d4', 600: '#0891b2', start: '#22d3ee', end: '#0891b2', darkStart: '#0891b2', darkEnd: '#155e75' },
                loan: { 50: '#f3f4f6', 500: '#6b7280', 600: '#4b5563', start: '#9ca3af', end: '#6b7280', darkStart: '#6b7280', darkEnd: '#374151' },
                misc: { 50: '#f3f4f6', 500: '#6b7280', 600: '#4b5563', start: '#9ca3af', end: '#6b7280', darkStart: '#6b7280', darkEnd: '#374151' }
            }
        }
    }
};

// PRO 모드 다크 색상 정보 (다크모드 클래스 포함)
const sectorInfo = {
    deposit: { name: '입출금통장', color: 'deposit', icon: '🏦', bgClass: 'bg-blue-50 dark:bg-gradient-to-r dark:from-blue-950/90 dark:to-blue-950/70', textClass: 'text-blue-700 dark:text-blue-100' },
    savings: { name: '저축', color: 'savings', icon: '💰', bgClass: 'bg-green-50 dark:bg-gradient-to-r dark:from-green-950/90 dark:to-green-950/70', textClass: 'text-green-700 dark:text-green-100' },
    investment: { name: '투자', color: 'investment', icon: '📈', bgClass: 'bg-orange-50 dark:bg-gradient-to-r dark:from-orange-950/90 dark:to-orange-950/70', textClass: 'text-orange-700 dark:text-orange-100' },
    pension: { name: '연금', color: 'pension', icon: '🏛️', bgClass: 'bg-purple-50 dark:bg-gradient-to-r dark:from-purple-950/90 dark:to-purple-950/70', textClass: 'text-purple-700 dark:text-purple-100' },
    realestate: { name: '부동산', color: 'realestate', icon: '🏠', bgClass: 'bg-amber-50 dark:bg-gradient-to-r dark:from-amber-950/90 dark:to-amber-950/70', textClass: 'text-amber-700 dark:text-amber-100' },
    car: { name: '자동차', color: 'car', icon: '🚗', bgClass: 'bg-cyan-50 dark:bg-gradient-to-r dark:from-cyan-950/90 dark:to-cyan-950/70', textClass: 'text-cyan-700 dark:text-cyan-100' },
    loan: { name: '대출', color: 'loan', icon: '💳', bgClass: 'bg-gray-100 dark:bg-gradient-to-r dark:from-gray-900 dark:to-gray-950', textClass: 'text-gray-700 dark:text-gray-300' },
    misc: { name: '기타', color: 'misc', icon: '📦', bgClass: 'bg-gray-50 dark:bg-gradient-to-r dark:from-gray-900/90 dark:to-gray-900/70', textClass: 'text-gray-600 dark:text-gray-400' }
};

// [보안] 설정값 은폐 (IIFE Closure)
(function() {
    const _VAULT = {
        SUPABASE_URL: __SUPABASE_URL__,
        SUPABASE_KEY: __SUPABASE_KEY__,
        SECURITY_KEY: __SECURITY_KEY__
    };
    window.getVaultConfig = (key) => _VAULT[key];
})();

// 온보딩 가이드 단계 정의 (최신 기능: 실시간 주식 연동, AI 비서, 스마트 리밸런싱, 프라이빗 모드 등 완벽 반영)
window.ONBOARDING_STEPS = [
    { 
        id: 'app-title', 
        title: '자산 플래너 시작하기 🚀', 
        content: '상단 타이틀을 클릭하면 자산 금액을 비중(%) 또는 마스킹(***)으로 가려주는 <strong>프라이빗 모드</strong>로 손쉽게 전환할 수 있습니다.' 
    },
    { 
        id: 'header-actions', 
        title: '스마트 도구 & 클라우드 연동 ☁️', 
        content: '증권사 앱 스크린샷 자동 인식(OCR), Gemini AI 자산 분석 비서, 클라우드 실시간 동기화 및 PDF 리포트 추출을 간편하게 이용하세요.', 
        isPro: true 
    },
    { 
        id: 'summary', 
        title: '자산 현황 및 생존 런웨이 요약 📊', 
        content: '총자산, 순자산과 함께 소득 중단 시 현재 지출로 버틸 수 있는 <strong>생존 런웨이(Runway)</strong> 및 은퇴 목표 달성률을 한눈에 파악합니다.', 
        isPro: true 
    },
    { 
        id: 'assets', 
        title: '실시간 주식 연동 & 자산 관리 📈', 
        content: '한국·미국 주식 및 ETF의 토스 OpenAPI 실시간 시세 연동, 계좌별 예수금 통합 집계, 지수·개별주·코인·금·현금 등 5대 자산군 포트폴리오를 상세 관리합니다.' 
    },
    { 
        id: 'rebalance', 
        title: '스마트 리밸런싱 & 월 권장 배분 ⚖️', 
        content: '목표 비중 대비 현재 괴리율을 자동 진단하고, 매달 저축 예산 한도 내에서 어떤 자산을 얼마씩 추가 매수해야 하는지 스마트하게 계산해 줍니다.', 
        isPro: true 
    },
    { 
        id: 'budget', 
        title: '월급 및 고정지출 예산 관리 💰', 
        content: '실수령 급여와 매월 발생하는 고정 생활비를 입력하면, 매달 투자 가능한 여유 자금과 실제 저축률을 실시간 자동 산출합니다.' 
    },
    { 
        id: 'charts', 
        title: '포트폴리오 비중 & 복리 성장 시뮬레이션 🍩', 
        content: '무지개 도넛/트리맵 차트로 종목별 비중을 직관적으로 확인하고, 물가상승률을 감안한 미래 30년 복리 자산 성장 곡선을 시각화합니다.' 
    },
    { 
        id: 'detail-analysis', 
        title: '자본 소득 분석 & 경제적 자유 💡', 
        content: '수면 중 소득, 자산의 시급 환산액, 2채널 자급자족율 등 강력한 패시브 인컴 지표를 통해 경제적 자유(FIRE) 달성을 확인하세요.' 
    }
];


// 전역으로 노출
window.sectorInfo = sectorInfo;

// 사이드바 내비게이션 항목 정의
window.navLabels = {
    summary: { title: "요약 및 설정", icon: "📊" },
    scenario: { title: "시나리오 비교", icon: "🔀" },
    charts: { title: "포트폴리오", icon: "🍩" },
    history: { title: "자산 히스토리", icon: "📈" },
    'life-timeline': { title: "미래 생애주기", icon: "🗺️" },
    'fire-clock': { title: "FIRE 시계", icon: "🔥" },
    budget: { title: "예산 관리", icon: "💰" },
    memo: { title: "메모", icon: "📝" },
    rebalance: { title: "리밸런싱", icon: "⚠️" },
    assets: { title: "자산 상세입력", icon: "🏦" },
    expenses: { title: "지출 관리", icon: "💸" },
    events: { title: "타임라인 & 이벤트", icon: "🎉" },
    'detail-analysis': { title: "상세 분석", icon: "🔍" },
    'capital-income': { title: "자본소득 분석", icon: "💹" },
    assumptions: { title: "가정 사항", icon: "💡" },
    community: { title: "커뮤니티 광장", icon: "💬" },
    tools: { title: "추가 기능", icon: "✨" }
};

// UI 텍스트 리소스 (i18n 준비)
window.TEXTS = {
    titles: {
        summary: "요약 및 설정",
        scenario: "시나리오 비교",
        charts: "포트폴리오",
        history: "자산 히스토리",
        fireClock: "FIRE 시계",
        budget: "월납입 예산 관리",
        memo: "메모",
        rebalance: "리밸런싱 설정",
        assets: "자산 상세 입력",
        expenses: "월별 지출 관리",
        events: "타임라인 & 이벤트",
        detailAnalysis: "상세 분석",
        capitalIncome: "자본소득 흐름 분석",
        assumptions: "계산 가정사항"
    },
    summary: {
        currentTotal: "현재 총자산",
        projectedTotal: "개월 후 예상",
        expectedIncrease: "예상 증가액",
        inflationAdjusted: "인플레이션 고려 시",
        fireAnalysis: "자립 가능성 분석 (FIRE Analysis)",
        survivalPeriod: "생존 가능 기간",
        debtFreeExpected: "부채 상환 완료 예상",
        fireNeeded: "FIRE (4% 법칙) 필요자산"
    },
    settings: {
        coreSettings: "핵심 설정",
        monthlySalary: "월 고정 수입 (만원)",
        baseMonth: "기준월 (계산 시작)",
        dataManagement: "데이터 관리",
        goalSettings: "목표 설정",
        periodBased: "기간 기준",
        assetBased: "자산 기준",
        expectedPeriod: "예상 기간 (개월)",
        targetAsset: "목표 자산 (만원)",
        calcGoal: "달성 기간 계산",
        inflationRate: "연간 인플레이션 증가율 (%)"
    },
    charts: {
        currentPortfolio: "현재 포트폴리오",
        projectedPortfolio: "예상 포트폴리오",
        comparison: "현재 vs 예상 자산 비교"
    }
};

// 가정 사항 패널 데이터 (인플레이션율 동적 적용을 위해 함수로 정의)
window.getAssumptionsContent = (inflationRate = 0) => [
    {
        icon: '📈',
        title: '수익률 및 인플레이션',
        content: [
            `연간 인플레이션율: ${inflationRate}% 적용 (매년 복리)`,
            '모든 자산의 수익률은 월 복리로 계산됩니다.',
            '수수료 및 세금은 매월 수익 발생 시 즉시 차감하여 재투자되는 것으로 가정합니다.'
        ]
    },
    {
        icon: '💳',
        title: '대출 및 상환',
        content: [
            '대출 이자는 매월 원금에 가산된 후 상환액이 차감됩니다.',
            '원리금균등: 매월 동일한 금액 상환 (초기 이자 비중 높음)',
            '원금균등: 매월 원금 일정액 + 이자 상환 (초기 상환액 높음)',
            '만기일시: 매월 이자만 납부하다 만기에 원금 일시 상환'
        ]
    }
];

// 시장 지표 위젯 초기 데이터
window.INITIAL_MARKET_ITEMS = [
    { name: 'USD/KRW', value: '1,340.50', change: '+0.5%', color: 'red', isLive: false, data: [1328, 1330, 1332, 1335, 1331, 1334, 1338, 1340, 1342, 1339, 1335, 1330, 1328, 1332, 1335, 1338, 1340, 1345, 1342, 1340, 1338, 1335, 1332, 1330, 1335, 1338, 1340, 1342, 1341, 1340.50] },
    { name: 'S&P 500', value: '5,120.30', change: '+1.2%', color: 'green', isLive: false, data: [4700, 4720, 4750, 4730, 4780, 4800, 4820, 4850, 4840, 4880, 4900, 4920, 4910, 4950, 4980, 5000, 5020, 5010, 5050, 5080, 5100, 5090, 5120, 5150, 5140, 5160, 5150, 5130, 5120, 5120.30] },
    { name: 'NASDAQ', value: '16,050.20', change: '+1.5%', color: 'green', isLive: false, data: [15780, 15800, 15820, 15850, 15830, 15860, 15880, 15900, 15890, 15920, 15940, 15960, 15950, 15980, 16000, 16020, 16010, 16030, 16040, 16020, 16000, 15980, 16000, 16020, 16040, 16060, 16050, 16030, 16040, 16050.20] },
    { name: 'Bitcoin', value: '$65,400', change: '-0.8%', color: 'blue', isLive: false, data: [63800, 64000, 64200, 64500, 64300, 64600, 64800, 65000, 64900, 65200, 65400, 65600, 65500, 65800, 66000, 66200, 66100, 66300, 66400, 66200, 66000, 65800, 66000, 66200, 66400, 66600, 66500, 66300, 66400, 65400] },
    { name: 'Gold', value: '$2,150.00', change: '+0.3%', color: 'orange', isLive: false, data: [2095, 2100, 2105, 2110, 2108, 2112, 2115, 2120, 2118, 2122, 2125, 2130, 2128, 2132, 2135, 2140, 2138, 2142, 2145, 2142, 2140, 2138, 2140, 2142, 2145, 2148, 2145, 2142, 2145, 2150] }
];