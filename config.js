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
                deposit: { 50: '#eff6ff', 500: '#3b82f6', 600: '#2563eb', start: '#60a5fa', end: '#3b82f6' },
                savings: { 50: '#f0fdf4', 500: '#22c55e', 600: '#16a34a', start: '#34d399', end: '#10b981' },
                investment: { 50: '#fff7ed', 500: '#f97316', 600: '#ea580c', start: '#fb923c', end: '#f97316' },
                pension: { 50: '#faf5ff', 500: '#a855f7', 600: '#9333ea', start: '#c084fc', end: '#a855f7' },
                realestate: { 50: '#fef7f0', 500: '#f59e0b', 600: '#d97706', start: '#fbbf24', end: '#f59e0b' },
                car: { 50: '#ecfeff', 500: '#06b6d4', 600: '#0891b2', start: '#22d3ee', end: '#0891b2' },
                loan: { 50: '#f3f4f6', 500: '#6b7280', 600: '#4b5563', start: '#9ca3af', end: '#6b7280' },
                misc: { 50: '#f3f4f6', 500: '#6b7280', 600: '#4b5563', start: '#9ca3af', end: '#6b7280' }
            }
        }
    }
};

// PRO 모드 다크 색상 정보 (다크모드 클래스 포함)
const sectorInfo = {
    deposit: { name: '입출금통장', color: 'deposit', icon: '🏦', bgClass: 'bg-blue-50 dark:bg-blue-900/20', textClass: 'text-blue-700 dark:text-blue-100' },
    savings: { name: '저축', color: 'savings', icon: '💰', bgClass: 'bg-green-50 dark:bg-green-900/20', textClass: 'text-green-700 dark:text-green-100' },
    investment: { name: '투자', color: 'investment', icon: '📈', bgClass: 'bg-orange-50 dark:bg-orange-900/20', textClass: 'text-orange-700 dark:text-orange-100' },
    pension: { name: '연금', color: 'pension', icon: '🏛️', bgClass: 'bg-purple-50 dark:bg-purple-900/20', textClass: 'text-purple-700 dark:text-purple-100' },
    realestate: { name: '부동산', color: 'realestate', icon: '🏠', bgClass: 'bg-amber-50 dark:bg-amber-900/20', textClass: 'text-amber-700 dark:text-amber-100' },
    car: { name: '자동차', color: 'car', icon: '🚗', bgClass: 'bg-cyan-50 dark:bg-cyan-900/20', textClass: 'text-cyan-700 dark:text-cyan-100' },
    loan: { name: '대출', color: 'loan', icon: '💳', bgClass: 'bg-gray-100 dark:bg-gray-800', textClass: 'text-gray-700 dark:text-gray-300' },
    misc: { name: '기타', color: 'misc', icon: '📦', bgClass: 'bg-gray-50 dark:bg-gray-800/50', textClass: 'text-gray-600 dark:text-gray-400' }
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
        monthlySalary: "월급 (만원)",
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