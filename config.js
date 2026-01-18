// config.js - 폰트와 색깔 정보 관리 파일
// 다크모드 관련: PRO 모드일 때에만 사용 가능 (코드에서 처리)

tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif']
            },
            colors: {
                deposit: { 50: '#eff6ff', 500: '#3b82f6', 600: '#2563eb', start: '#60a5fa', end: '#3b82f6', darkStart: '#1e3a8a', darkEnd: '#172554' },
                savings: { 50: '#f0fdf4', 500: '#22c55e', 600: '#16a34a', start: '#34d399', end: '#10b981', darkStart: '#14532d', darkEnd: '#052e16' },
                investment: { 50: '#fff7ed', 500: '#f97316', 600: '#ea580c', start: '#fb923c', end: '#f97316', darkStart: '#7c2d12', darkEnd: '#431407' },
                pension: { 50: '#faf5ff', 500: '#a855f7', 600: '#9333ea', start: '#c084fc', end: '#a855f7', darkStart: '#581c87', darkEnd: '#3b0764' },
                realestate: { 50: '#fef7f0', 500: '#f59e0b', 600: '#d97706', start: '#fbbf24', end: '#f59e0b', darkStart: '#78350f', darkEnd: '#451a03' },
                car: { 50: '#ecfeff', 500: '#06b6d4', 600: '#0891b2', start: '#22d3ee', end: '#0891b2', darkStart: '#164e63', darkEnd: '#083344' },
                loan: { 50: '#f3f4f6', 500: '#6b7280', 600: '#4b5563', start: '#9ca3af', end: '#6b7280', darkStart: '#374151', darkEnd: '#111827' },
                misc: { 50: '#f3f4f6', 500: '#6b7280', 600: '#4b5563', start: '#9ca3af', end: '#6b7280', darkStart: '#374151', darkEnd: '#111827' }
            }
        }
    }
};

// PRO 모드 다크 색상 정보 (다크모드 클래스 포함)
const sectorInfo = {
    deposit: { name: '입출금통장', color: 'deposit', icon: '🏦', bgClass: 'bg-blue-50 dark:bg-gradient-to-r dark:from-blue-950/50 dark:to-blue-950/30', textClass: 'text-blue-700 dark:text-blue-100' },
    savings: { name: '저축', color: 'savings', icon: '💰', bgClass: 'bg-green-50 dark:bg-gradient-to-r dark:from-green-950/50 dark:to-green-950/30', textClass: 'text-green-700 dark:text-green-100' },
    investment: { name: '투자', color: 'investment', icon: '📈', bgClass: 'bg-orange-50 dark:bg-gradient-to-r dark:from-orange-950/50 dark:to-orange-950/30', textClass: 'text-orange-700 dark:text-orange-100' },
    pension: { name: '연금', color: 'pension', icon: '🏛️', bgClass: 'bg-purple-50 dark:bg-gradient-to-r dark:from-purple-950/50 dark:to-purple-950/30', textClass: 'text-purple-700 dark:text-purple-100' },
    realestate: { name: '부동산', color: 'realestate', icon: '🏠', bgClass: 'bg-amber-50 dark:bg-gradient-to-r dark:from-amber-950/50 dark:to-amber-950/30', textClass: 'text-amber-700 dark:text-amber-100' },
    car: { name: '자동차', color: 'car', icon: '🚗', bgClass: 'bg-cyan-50 dark:bg-gradient-to-r dark:from-cyan-950/50 dark:to-cyan-950/30', textClass: 'text-cyan-700 dark:text-cyan-100' },
    loan: { name: '대출', color: 'loan', icon: '💳', bgClass: 'bg-gray-100 dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900', textClass: 'text-gray-700 dark:text-gray-300' },
    misc: { name: '기타', color: 'misc', icon: '📦', bgClass: 'bg-gray-50 dark:bg-gradient-to-r dark:from-gray-800/50 dark:to-gray-800/20', textClass: 'text-gray-600 dark:text-gray-400' }
};

// [설정] 서버 설정 사용 여부
window.USE_SERVER_CONFIG = false;

// [설정] Supabase 연결 정보
// Cloudflare Pages 빌드 시 sed 명령어로 __SUPABASE_URL__, __SUPABASE_KEY__, __SECURITY_KEY__가 주입됩니다.
if (!window.SUPABASE_CONFIG) {
    window.SUPABASE_CONFIG = {
        SUPABASE_URL: '__SUPABASE_URL__',
        SUPABASE_KEY: '__SUPABASE_KEY__',
        SECURITY_KEY: '__SECURITY_KEY__'
    };
}

// [설정] 온보딩 가이드 단계 정의
window.ONBOARDING_STEPS = [
    { id: 'header-actions', title: '기본값 및 시나리오 관리', content: '설정한 데이터를 저장하거나 불러오고, PDF로 내보낼 수 있습니다.', isPro: true },
    { id: 'summary', title: '요약 및 설정', content: '현재 자산 상황과 인플레이션을 반영한 실질 가치를 한눈에 파악할 수 있습니다.', isPro: true },
    { id: 'charts', title: '포트폴리오 차트', content: '자산 구성과 미래 성장 곡선을 시각적 그래프로 확인할 수 있습니다.' },
    { id: 'budget', title: '월납입 예산 관리', content: '월급과 지출을 기반으로 매달 저축 가능한 금액을 계산하고 관리할 수 있습니다.' },
    { id: 'rebalance', title: '리밸런싱', content: '목표 비중과 현재 비중의 차이를 체크하여 최적의 비중을 유지할 수 있습니다.', isPro: true },
    { id: 'assets', title: '자산 상세 입력', content: '보유하신 모든 자산 항목을 섹터별로 상세히 기록할 수 있습니다.' },
    { id: 'events', title: '이벤트성 수입/지출', content: '상여금이나 여행 등 비정기적인 재무 이벤트를 설정해 볼 수 있습니다.' },
    { id: 'detail-analysis', title: '상세 분석', content: '모든 시뮬레이션 결과를 상세한 표 데이터로 분석할 수 있습니다.' }
];


// 전역으로 노출
window.sectorInfo = sectorInfo;

// 사이드바 내비게이션 항목 정의
window.navLabels = {
    summary: { title: "요약 및 설정", icon: "📊" },
    scenario: { title: "시나리오 비교", icon: "🔀" },
    charts: { title: "포트폴리오 차트", icon: "🍩" },
    history: { title: "자산 히스토리", icon: "📈" },
    budget: { title: "예산 관리", icon: "💰" },
    memo: { title: "메모", icon: "📝" },
    rebalance: { title: "리밸런싱", icon: "⚠️" },
    assets: { title: "자산 상세입력", icon: "🏦" },
    expenses: { title: "지출 관리", icon: "💸" },
    events: { title: "이벤트 관리", icon: "🎉" },
    'detail-analysis': { title: "상세 분석", icon: "🔍" },
    assumptions: { title: "가정 사항", icon: "💡" }
};

// [추가] UI 텍스트 리소스 (i18n 준비)
window.TEXTS = {
    titles: {
        summary: "요약 및 설정",
        scenario: "시나리오 비교",
        charts: "포트폴리오 차트",
        history: "자산 히스토리",
        budget: "월납입 예산 관리",
        memo: "메모",
        rebalance: "리밸런싱 설정",
        assets: "자산 상세 입력",
        expenses: "월별 지출 관리",
        events: "이벤트 관리",
        detailAnalysis: "상세 분석",
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

// [추가] 가정 사항 패널 데이터 (인플레이션율 동적 적용을 위해 함수로 정의)
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

// [추가] 시장 지표 위젯 초기 데이터
window.INITIAL_MARKET_ITEMS = [
    { name: 'USD/KRW', value: '1,340.50', change: '+0.5%', color: 'red', data: [1328, 1330, 1332, 1335, 1331, 1334, 1338, 1340, 1342, 1339, 1335, 1330, 1328, 1332, 1335, 1338, 1340, 1345, 1342, 1340, 1338, 1335, 1332, 1330, 1335, 1338, 1340, 1342, 1341, 1340.50] },
    { name: 'S&P 500', value: '5,120.30', change: '+1.2%', color: 'green', data: [4700, 4720, 4750, 4730, 4780, 4800, 4820, 4850, 4840, 4880, 4900, 4920, 4910, 4950, 4980, 5000, 5020, 5010, 5050, 5080, 5100, 5090, 5120, 5150, 5140, 5160, 5150, 5130, 5120, 5120.30] },
    { name: 'NASDAQ', value: '16,050.20', change: '+1.5%', color: 'green', data: [15780, 15800, 15820, 15850, 15830, 15860, 15880, 15900, 15890, 15920, 15940, 15960, 15950, 15980, 16000, 16020, 16010, 16030, 16040, 16020, 16000, 15980, 16000, 16020, 16040, 16060, 16050, 16030, 16040, 16050.20] },
    { name: 'Bitcoin', value: '$65,400', change: '-0.8%', color: 'blue', data: [63800, 64000, 64200, 64500, 64300, 64600, 64800, 65000, 64900, 65200, 65400, 65600, 65500, 65800, 66000, 66200, 66100, 66300, 66400, 66200, 66000, 65800, 66000, 66200, 66400, 66600, 66500, 66300, 66400, 65400] },
    { name: 'Gold', value: '$2,150.00', change: '+0.3%', color: 'orange', data: [2095, 2100, 2105, 2110, 2108, 2112, 2115, 2120, 2118, 2122, 2125, 2130, 2128, 2132, 2135, 2140, 2138, 2142, 2145, 2142, 2140, 2138, 2140, 2142, 2145, 2148, 2145, 2142, 2145, 2150] }
];