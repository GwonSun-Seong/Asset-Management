// defaultData.js - 기본 데이터와 설정 관리 파일

// [수정] 납입 출처 기본값 상수 (utils.js의 전역 설정 참조, 충돌 방지 위해 변수명 변경)
const DEFAULT_INCOME_SOURCE = window.MONTHLY_INCOME_SOURCE || '월 고정수입';

// 로컬 시간 기준 날짜 문자열 생성 헬퍼 (초기 데이터용)
const getLocalToday = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// 테스트용 과거 날짜 생성 헬퍼 (시나리오 기준일 맞춤용)
const getPastDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// 임의의 과거 자산 히스토리 생성 (50일치, 우상향 및 횡보 패턴)
const generateMockHistory = () => {
    const history = [];
    const today = new Date();
    // 현재 디폴트 자산 합계(약 1500만원)에 맞춰 자연스럽게 도달하도록 시작값 설정
    let currentNetWorth = 1250; 
    
    for (let i = 50; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        
        // 패턴: 50일치 (초기 상승 -> 횡보 -> 최근 급상승)
        let change = 0;
        if (i > 30) change = Math.random() * 8 + 2; // 초기 상승
        else if (i > 15) change = (Math.random() - 0.5) * 15; // 중간 횡보 (등락 반복)
        else change = Math.random() * 10 + 5; // 최근 급상승
        
        currentNetWorth += change;
        
        history.push({
            date: dateStr,
            netWorth: Math.floor(currentNetWorth),
            time: "09:00:00",
            grossWorth: Math.floor(currentNetWorth) // 데모 데이터의 경우 부채가 없는 것으로 가정
        });
    }
    return history;
};

// 공개용 기본값 (제3자 공개 시 사용)
const publicDefaultData = {
    projectionMonths: 12,
    monthlySalary: 250,
    salaryDay: 25,
    targetAmount: 10000, // 목표 자산 금액 (만원)
    goalMode: 'period', // 'period' 또는 'target'
    displayMode: 'amount', // displayMode 기본값
    darkMode: false, // 다크 모드 상태
    rebalancingMode: 'simple', // 'simple' | 'advanced'
    assets: {
        deposit: [
            { id: 'def-dep-1', name: '비상금통장', amount: 100, rate: 2.0, feeRate: 0, monthlyContrib: 5, monthlyContributionFrom: DEFAULT_INCOME_SOURCE, memo: '' },
            { id: 'def-dep-2', name: '생활비통장', amount: 450, rate: 2.0, feeRate: 0, monthlyContrib: 0, monthlyContributionFrom: DEFAULT_INCOME_SOURCE, memo: '' }
        ],
        savings: [
            { id: 'def-sav-1', name: '청년도약계좌', amount: 400, rate: 6.0, feeRate: 0, monthlyContrib: 30, monthlyContributionFrom: DEFAULT_INCOME_SOURCE, memo: '' },
            { id: 'def-sav-2', name: '청약저축', amount: 100, rate: 6.0, feeRate: 0, monthlyContrib: 10, monthlyContributionFrom: DEFAULT_INCOME_SOURCE, memo: '' }
        ],
        investment: [
            { id: 'def-inv-1', name: '직접투자계좌', amount: 500, rate: 10.0, feeRate: 0, monthlyContrib: 10, monthlyContributionFrom: DEFAULT_INCOME_SOURCE, memo: '' },
            { id: 'def-inv-2', name: 'ISA계좌', amount: 250, rate: 10.0, feeRate: 0, monthlyContrib: 10, monthlyContributionFrom: DEFAULT_INCOME_SOURCE, memo: '' },
            { id: 'def-inv-3', name: '금투자', amount: 50, rate: 3.0, feeRate: 0, monthlyContrib: 5, monthlyContributionFrom: DEFAULT_INCOME_SOURCE, memo: '' },
            { id: 'def-inv-4', name: '비트코인', amount: 50, rate: 12.0, feeRate: 0, monthlyContrib: 0, monthlyContributionFrom: DEFAULT_INCOME_SOURCE, memo: '' }
        ],
        pension: [
            { id: 'def-pen-1', name: '연금저축', amount: 100, rate: 10.0, feeRate: 0, monthlyContrib: 10, monthlyContributionFrom: DEFAULT_INCOME_SOURCE, memo: '' }
        ],
        realestate: [
            { id: 'def-re-1', name: '아파트', amount: 0, rate: 5.0, feeRate: 0, monthlyContrib: 0, monthlyContributionFrom: DEFAULT_INCOME_SOURCE, memo: '' }
        ],
        car: [],
        loan: [{ id: 'def-loan-1', name: '신용대출', amount: 500, rate: 3.0, monthlyContrib: 40, monthlyContributionFrom: DEFAULT_INCOME_SOURCE, repaymentMethod: '원리금균등', repaymentAccount: '생활비통장', maturityMonth: 10, loanStartDate: getLocalToday().slice(0,7), memo: '' }],
        misc: [{ id: 'def-misc-1', name: '기타자산', amount: 0, rate: 2.0, feeRate: 0, monthlyContrib: 0, monthlyContributionFrom: DEFAULT_INCOME_SOURCE, memo: '' }]
    },
    monthlyExpenses: [
        { name: '생활비', amount: 80, day: 15 },
        { name: '월세', amount: 40, day: 25 }
    ],
    rebalancingTargets: { deposit: 10, savings: 15, investment: 55, pension: 20, realestate: 0, car: 0, misc: 0 },
    mainCashFlowAccount: '생활비통장',
    baseDate: getLocalToday(), // baseMonth -> baseDate (YYYY-MM-DD)
    autoUpdateBaseDate: false,
    memo: '', // 메모 기능
    history: generateMockHistory(), // 초기 히스토리 데이터
    // [추가] 글로벌 이벤트 및 설정
    expenseEvents: [
        {
            name: '휴대폰 할부',
            amount: 5,
            startMonth: getLocalToday().slice(0,7),
            endMonth: (() => { const d = new Date(); d.setMonth(d.getMonth() + 23); return d.toISOString().slice(0,7); })(),
            day: 20, // 이벤트 발생일
            targetSector: 'deposit',
            targetAsset: 1
        }
    ],
    incomeEvents: [],
    // 기본 시나리오 3종 세트
    scenarios: [
        {
            id: 'sc_aggressive',
            name: '🚀 공격적 투자 (History Beat)',
            createdAt: getPastDate(50), // 히스토리 시작 시점(50일 전)과 동기화
            data: {
                baseDate: getPastDate(50), // 시뮬레이션 기준일도 과거로 설정
                monthlySalary: 450, // 히스토리를 이기기 위해 고소득/고투자 설정
                salaryDay: 25,
                monthlyExpenses: [{ name: '생활비', amount: 100, day: 15 }],
                rebalancingTargets: { deposit: 5, savings: 0, investment: 95, pension: 0, realestate: 0, car: 0, misc: 0 },
                assets: {
                    deposit: [{ id: 'sc1_d1', name: 'CMA', amount: 50, rate: 3.0, feeRate: 0, monthlyContrib: 0, monthlyContributionFrom: DEFAULT_INCOME_SOURCE, memo: '' }],
                    savings: [],
                    investment: [
                        { id: 'sc1_i1', name: '나스닥 3배 레버리지', amount: 800, rate: 25.0, feeRate: 0, monthlyContrib: 250, monthlyContributionFrom: DEFAULT_INCOME_SOURCE, memo: '' },
                        { id: 'sc1_i2', name: '비트코인', amount: 400, rate: 40.0, feeRate: 0, monthlyContrib: 100, monthlyContributionFrom: DEFAULT_INCOME_SOURCE, memo: '' }
                    ],
                    pension: [], realestate: [], car: [], loan: [], misc: []
                }
            }
        },
        {
            id: 'sc_moderate',
            name: '🛡️ 안정적 저축 (Moderate)',
            createdAt: getPastDate(50), // 히스토리 시작 시점(50일 전)과 동기화
            data: {
                baseDate: getPastDate(50), // 시뮬레이션 기준일도 과거로 설정
                monthlySalary: 300,
                salaryDay: 25,
                monthlyExpenses: [{ name: '생활비', amount: 100, day: 15 }],
                rebalancingTargets: { deposit: 20, savings: 80, investment: 0, pension: 0, realestate: 0, car: 0, misc: 0 },
                assets: {
                    deposit: [{ id: 'sc2_d1', name: '파킹통장', amount: 250, rate: 3.0, feeRate: 0, monthlyContrib: 50, monthlyContributionFrom: DEFAULT_INCOME_SOURCE, memo: '' }],
                    savings: [
                        { id: 'sc2_s1', name: '정기예금', amount: 1000, rate: 4.0, feeRate: 0, monthlyContrib: 0, monthlyContributionFrom: DEFAULT_INCOME_SOURCE, memo: '' },
                        { id: 'sc2_s2', name: '적금', amount: 0, rate: 5.0, feeRate: 0, monthlyContrib: 150, monthlyContributionFrom: DEFAULT_INCOME_SOURCE, memo: '' }
                    ],
                    investment: [], pension: [], realestate: [], car: [], loan: [], misc: []
                }
            }
        },
        {
            id: 'sc_conservative',
            name: '📉 경기 침체 (Conservative)',
            createdAt: getPastDate(50), // 히스토리 시작 시점(50일 전)과 동기화
            data: {
                baseDate: getPastDate(50), // 시뮬레이션 기준일도 과거로 설정
                monthlySalary: 200, // 저소득 설정
                salaryDay: 25,
                monthlyExpenses: [{ name: '최소생계비', amount: 150, day: 15 }], // 고비용 설정
                rebalancingTargets: { deposit: 100, savings: 0, investment: 0, pension: 0, realestate: 0, car: 0, misc: 0 },
                assets: {
                    deposit: [{ id: 'sc3_d1', name: '비상금', amount: 1250, rate: 2.0, feeRate: 0, monthlyContrib: 50, monthlyContributionFrom: DEFAULT_INCOME_SOURCE, memo: '' }],
                    savings: [], investment: [], pension: [], realestate: [], car: [], loan: [], misc: []
                }
            }
        }
    ]
};

// 기본 레이아웃 순서 정의
const DEFAULT_LAYOUT_ORDER = [
    'summary', 'scenario', 'charts', 'history', 'budget', 'memo', 
    'rebalance', 'assets', 'expenses', 'events', 'detail-analysis', 'assumptions'
];

// 기본 자산 섹터 순서 정의
const DEFAULT_SECTOR_ORDER = [
    'deposit', 'savings', 'investment', 'pension', 'realestate', 'car', 'loan', 'misc'
];

// 전역으로 노출
window.publicDefaultData = publicDefaultData;
window.DEFAULT_LAYOUT_ORDER = DEFAULT_LAYOUT_ORDER;
window.DEFAULT_SECTOR_ORDER = DEFAULT_SECTOR_ORDER;