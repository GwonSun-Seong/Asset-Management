// config.js - 폰트와 색깔 정보 관리 파일
// 다크모드 관련: PRO 모드일 때에만 사용 가능 (코드에서 처리)

tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
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