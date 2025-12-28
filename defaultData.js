// defaultData.js - 기본 데이터와 설정 관리 파일

// 공개용 기본값 (제3자 공개 시 사용)
const publicDefaultData = {
    projectionMonths: 12,
    monthlySalary: 280,
    targetAmount: 10000, // 목표 자산 금액 (만원)
    goalMode: 'period', // 'period' 또는 'target'
    displayMode: 'amount', // [추가] displayMode 기본값
    darkMode: false, // [추가] 다크 모드 상태
    rebalancingMode: 'simple', // 'simple' | 'advanced'
    assets: {
        deposit: [
            { id: 'def-dep-1', name: '비상금통장', amount: 400, rate: 2.0, feeRate: 0, monthlyContrib: 10, extraContrib: 0, extraFrom: '' },
            { id: 'def-dep-2', name: '생활비통장', amount: 30, rate: 2.0, feeRate: 0, monthlyContrib: 0, extraContrib: 0, extraFrom: '' }
        ],
        savings: [
            { id: 'def-sav-1', name: '청년도약계좌', amount: 140, rate: 6.0, feeRate: 0, monthlyContrib: 0, extraContrib: 20, extraFrom: '비상금통장' },
            { id: 'def-sav-2', name: '청약저축', amount: 180, rate: 6.0, feeRate: 0, monthlyContrib: 10, extraContrib: 0, extraFrom: '' }
        ],
        investment: [
            { id: 'def-inv-1', name: '직접투자계좌', amount: 1400, rate: 10.0, feeRate: 0, monthlyContrib: 0, extraContrib: 0, extraFrom: '' },
            { id: 'def-inv-2', name: 'ISA계좌', amount: 500, rate: 10.0, feeRate: 0, monthlyContrib: 100, extraContrib: 0, extraFrom: '' },
            { id: 'def-inv-3', name: '금투자', amount: 0, rate: 3.0, feeRate: 0, monthlyContrib: 30, extraContrib: 0, extraFrom: '' },
            { id: 'def-inv-4', name: '비트코인', amount: 0, rate: 12.0, feeRate: 0, monthlyContrib: 15, extraContrib: 0, extraFrom: '' }
        ],
        pension: [
            { id: 'def-pen-1', name: '연금저축', amount: 199, rate: 10.0, feeRate: 0, monthlyContrib: 10, extraContrib: 0, extraFrom: '' }
        ],
        realestate: [
            { id: 'def-re-1', name: '아파트', amount: 0, rate: 5.0, feeRate: 0, monthlyContrib: 0, extraContrib: 0, extraFrom: '' }
        ],
        car: [],
        loan: [
            {
                id: 'def-loan-1',
                name: '신용대출',
                amount: 0,
                rate: 3.0,
                monthlyContrib: 0,
                extraContrib: 0,
                extraFrom: '',
                repaymentMethod: '원리금균등',
                repaymentAccount: '생활비통장',
                maturityMonth: 36,
                loanStartDate: new Date().toISOString().slice(0,7)
            }
        ],
        misc: [
            { id: 'def-misc-1', name: '기타자산', amount: 0, rate: 2.0, feeRate: 0, monthlyContrib: 0, extraContrib: 0, extraFrom: '' }
        ]
    },
    monthlyExpenses: [
        { name: '생활비', amount: 100 }
    ],
    expenseEvents: [],
    rebalancingAlerts: {
        deposit: { warning: 5, danger: 10 },
        savings: { warning: 5, danger: 10 },
        investment: { warning: 5, danger: 10 },
        pension: { warning: 5, danger: 10 },
        realestate: { warning: 5, danger: 10 },
        misc: { warning: 5, danger: 10 }
    },
    simpleThresholds: { warning: 5, danger: 10 },
    rebalancingTargets: { /* 섹터별 목표 비중(%) 합계 100 */ },
    mainCashFlowAccount: '생활비통장',
    memo: '' // [추가] 메모 기능
};

// 서버 설정 로드 함수 (주석 처리/해제로 전환)
async function loadServerConfig() {
    if (!USE_SERVER_CONFIG) return publicDefaultData;

    try {
        // const response = await fetch('/api/defaultconfig');
        // return await response.json();
        return publicDefaultData; // 서버 연결 실패시 기본값 사용
    } catch (error) {
        console.error('서버 설정 로드 실패:', error);
        return publicDefaultData;
    }
}

// 전역으로 노출
window.publicDefaultData = publicDefaultData;
window.loadServerConfig = loadServerConfig;