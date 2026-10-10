// KoreaLifeSimulator.jsx - 5천만 분의 1 : 대한민국 상위 % 인생 시뮬레이터
// 통계청 가계금융복지조사 실데이터 기반 시뮬레이터
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

// ==========================================
// 📊 대한민국 가계금융복지조사 통계청 실데이터 벤치마크 (순자산 백분위 커트라인 - 단위: 만원)
// ==========================================
const KOREA_NET_WORTH_BENCHMARKS = {
    // 전체 가구 기준
    all: [
        { p: 1.0, threshold: 325000, label: '상위 1%' },
        { p: 5.0, threshold: 158000, label: '상위 5%' },
        { p: 10.0, threshold: 105000, label: '상위 10%' },
        { p: 20.0, threshold: 64000, label: '상위 20%' },
        { p: 30.0, threshold: 43000, label: '상위 30%' },
        { p: 50.0, threshold: 24500, label: '상위 50% (중위)' },
        { p: 70.0, threshold: 11000, label: '상위 70%' },
        { p: 90.0, threshold: 2500, label: '상위 90%' }
    ],
    // 연령대별 기준
    byAge: {
        20: [
            { p: 1.0, threshold: 65000 },
            { p: 5.0, threshold: 28000 },
            { p: 10.0, threshold: 18000 },
            { p: 20.0, threshold: 9500 },
            { p: 30.0, threshold: 6000 },
            { p: 50.0, threshold: 3500 },
            { p: 70.0, threshold: 1800 },
            { p: 90.0, threshold: 500 }
        ],
        30: [
            { p: 1.0, threshold: 165000 },
            { p: 5.0, threshold: 85000 },
            { p: 10.0, threshold: 52000 },
            { p: 20.0, threshold: 32000 },
            { p: 30.0, threshold: 23000 },
            { p: 50.0, threshold: 16000 },
            { p: 70.0, threshold: 8500 },
            { p: 90.0, threshold: 2200 }
        ],
        40: [
            { p: 1.0, threshold: 280000 },
            { p: 5.0, threshold: 145000 },
            { p: 10.0, threshold: 102000 },
            { p: 20.0, threshold: 62000 },
            { p: 30.0, threshold: 44000 },
            { p: 50.0, threshold: 31000 },
            { p: 70.0, threshold: 16000 },
            { p: 90.0, threshold: 4500 }
        ],
        50: [
            { p: 1.0, threshold: 360000 },
            { p: 5.0, threshold: 185000 },
            { p: 10.0, threshold: 128000 },
            { p: 20.0, threshold: 76000 },
            { p: 30.0, threshold: 53000 },
            { p: 50.0, threshold: 38000 },
            { p: 70.0, threshold: 19000 },
            { p: 90.0, threshold: 5500 }
        ],
        60: [
            { p: 1.0, threshold: 330000 },
            { p: 5.0, threshold: 165000 },
            { p: 10.0, threshold: 115000 },
            { p: 20.0, threshold: 68000 },
            { p: 30.0, threshold: 46000 },
            { p: 50.0, threshold: 32000 },
            { p: 70.0, threshold: 15500 },
            { p: 90.0, threshold: 4000 }
        ]
    }
};

// 백분위 계산 보간 함수
function getPercentile(netWorth, age) {
    const ageKey = age < 30 ? 20 : age < 40 ? 30 : age < 50 ? 40 : age < 60 ? 50 : 60;
    const ageTable = KOREA_NET_WORTH_BENCHMARKS.byAge[ageKey];
    const allTable = KOREA_NET_WORTH_BENCHMARKS.all;

    const calcRank = (table) => {
        if (netWorth >= table[0].threshold) {
            const diff = netWorth - table[0].threshold;
            const topP = Math.max(0.1, 1.0 - (diff / table[0].threshold) * 0.5);
            return parseFloat(topP.toFixed(1));
        }
        for (let i = 0; i < table.length - 1; i++) {
            const high = table[i];
            const low = table[i + 1];
            if (netWorth >= low.threshold) {
                const ratio = (netWorth - low.threshold) / (high.threshold - low.threshold);
                const p = low.p - ratio * (low.p - high.p);
                return parseFloat(p.toFixed(1));
            }
        }
        const bottom = table[table.length - 1];
        const ratio = Math.max(0, netWorth / bottom.threshold);
        const p = 99.0 - ratio * (99.0 - bottom.p);
        return parseFloat(Math.min(99.9, p).toFixed(1));
    };

    return {
        ageRank: calcRank(ageTable),
        allRank: calcRank(allTable)
    };
}

// 금액 단위 포맷터
function formatKoreanMoney(manwon) {
    const val = Math.round(manwon);
    if (Math.abs(val) >= 10000) {
        const eok = (val / 10000).toFixed(1);
        return `${eok.replace(/\.0$/, '')}억`;
    }
    return `${val.toLocaleString()}만`;
}

// ==========================================
// 💀 대한민국 통계청 완전생명표 및 현실 3대 사망 원인(암·심뇌혈관·불의의 사고) 기반 확률 사망 판정
// ==========================================
function checkLifeTableMortality(age) {
    let prob = 0.0005;
    let causes = [];

    // 전 연령 공통 발생 가능한 치명적 위협 (암, 사고, 심장마비)
    // 20대 청년층도 백혈병, 림프종, 골육종, 빗길 교통사고, 급성 심근경색 등으로 안타까운 사망 발생
    if (age < 30) {
        prob = 0.0006;
        causes = [
            '불의의 고속도로 빗길 교통사고로 안타까운 요절',
            '급성 백혈병 진단 후 급격한 병세 악화로 요절',
            '악성 림프종(혈액암) 투병 끝에 안타까운 요절',
            '청년기 급성 심근경색(돌연사)으로 안타까운 영면',
            '희귀 골육종·육종암 투병 끝에 요절',
            '불의의 산업재해·외상 사고로 안타까운 요절'
        ];
    } else if (age < 40) {
        prob = 0.0010;
        causes = [
            '조기 위암·대장암 악화로 안타까운 영면',
            '불의의 차량 연쇄 충돌 사고로 영면',
            '과로와 스트레스로 인한 급성 심근경색으로 영면',
            '급성 악성 뇌종양 판정 후 투병 끝에 영면',
            '악성 흑색종·혈액암 투병 끝에 영면'
        ];
    } else if (age < 50) {
        prob = 0.0024;
        causes = [
            '말기 간암·위암 진단 후 투병 끝에 영면',
            '과로로 인한 급성 뇌지주막하출혈로 갑작스러운 영면',
            '급성 심근경색(심장마비)으로 영면',
            '고속도로 빗길 대형 교통사고로 영면',
            '대장암 4기 전이로 투병 끝에 영면'
        ];
    } else if (age < 60) {
        prob = 0.0055;
        causes = [
            '말기 췌장암·폐암 투병 끝에 가족들의 배웅 속에 영면',
            '급성 심근경색 및 심부전증으로 영면',
            '뇌출혈 및 뇌혈관 질환으로 영면',
            '간경변증 및 간암 합병증으로 영면',
            '불의의 대형 교통사고로 영면'
        ];
    } else if (age < 70) {
        prob = 0.014;
        causes = [
            '대장암·폐암 합병증 투병 끝에 영면',
            '심혈관 질환 및 심부전으로 영면',
            '뇌졸중 후유증 합병증으로 영면',
            '담도암·췌장암 악화로 영면'
        ];
    } else if (age < 80) {
        prob = 0.040;
        causes = [
            '급성 폐렴 및 호흡기 합병증으로 영면',
            '악성 종양(암) 투병 끝에 가족들의 품에서 영면',
            '심혈관 질환 합병증으로 영면',
            '만성 신부전 합병증으로 영면'
        ];
    } else if (age < 90) {
        prob = 0.075 + (age - 80) * 0.014;
        causes = [
            '노환과 폐렴 합병증으로 가족들의 품에서 평화로운 영면',
            '다발성 장기부전 및 노환으로 평화로운 영면',
            '80대 장수를 누리고 자손들의 배웅 속에 영면'
        ];
    } else if (age < 100) {
        prob = 0.22 + (age - 90) * 0.02;
        causes = [
            '90대 천수(天壽)를 누리고 온 가족의 품에서 평화로운 영면',
            '백세를 앞두고 노환으로 고요하게 영면'
        ];
    } else {
        if (age >= 105) {
            return {
                isDead: true,
                cause: '105세 한국 최고령 자산가로 역사에 이름을 남기고 영면'
            };
        }
        prob = 0.45;
        causes = [
            '100세 상수(上壽)를 누리고 자손 수십 명의 축복 속에 영면',
            '세기를 뛰어넘은 100세 장수 인생을 평화롭게 마무리'
        ];
    }

    if (Math.random() < prob) {
        const cause = causes[Math.floor(Math.random() * causes.length)];
        return { isDead: true, cause: `${age}세 ${cause}` };
    }

    return { isDead: false, cause: '' };
}

// 5대 투자 성향 정의
const ARCHETYPE_LIST = [
    {
        name: '고레버리지 성장 돌격형',
        icon: '🚀',
        color: 'text-amber-400 border-amber-500/50 bg-amber-950/40',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        detail: '대출 레버리지와 투자 자산을 적극 활용하여 빠른 자산 증식을 노립니다.'
    },
    {
        name: '공격적 투자 집중형',
        icon: '🔥',
        color: 'text-rose-400 border-rose-500/50 bg-rose-950/40',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        detail: '자산의 상당 부분을 주식/ETF/투자 자산에 집중한 하이리스크형입니다.'
    },
    {
        name: '밸런스 성장형',
        icon: '⚖️',
        color: 'text-indigo-400 border-indigo-500/50 bg-indigo-950/40',
        badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
        detail: '균형 잡힌 자산 배분으로 안정적인 성장을 추구합니다.'
    },
    {
        name: '원금보존 안정 방어형',
        icon: '🛡️',
        color: 'text-emerald-400 border-emerald-500/50 bg-emerald-950/40',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        detail: '예적금과 연금 중심의 방어적이고 흔들림 없는 구조입니다.'
    },
    {
        name: '실물 부동산 집중형',
        icon: '🏢',
        color: 'text-sky-400 border-sky-500/50 bg-sky-950/40',
        badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        detail: '부동산 실물 자산에 자본이 묶인 전형적인 대한민국 자산가 구조입니다.'
    }
];

export default function KoreaLifeSimulator({
    monthlySalary = 0,
    currentAppData = null,
    currentCalculation = null,
    addToast = null
}) {
    // ==========================================
    // 1. 사용자 실데이터 Read-Only 딥카피 및 기본 파싱
    // ==========================================
    const initialUserData = useMemo(() => {
        // 1) 순자산, 총자산: currentCalculation 객체의 실제 키(currentNet, currentGross) 우선 활용
        let netWorth = (currentCalculation && typeof currentCalculation.currentNet === 'number' && !isNaN(currentCalculation.currentNet))
            ? currentCalculation.currentNet
            : 0;
        let grossAssets = (currentCalculation && typeof currentCalculation.currentGross === 'number' && !isNaN(currentCalculation.currentGross))
            ? currentCalculation.currentGross
            : (currentCalculation && typeof currentCalculation.currentTotal === 'number' ? currentCalculation.currentTotal : 0);

        let totalLoan = 0;
        let hasHouse = false;
        let hasCar = false;
        let investmentTotal = 0;
        let pensionTotal = 0;
        let safeTotal = 0;
        let realEstateTotal = 0;
        let miscTotal = 0;
        const stockTickers = [];

        if (currentAppData && currentAppData.assets) {
            const assets = currentAppData.assets;

            // 대출 (loan 섹터)
            totalLoan = (assets.loan || []).reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

            // 투자 (investment 섹터: 직접투자, ISA, 금, 코인 등)
            investmentTotal = (assets.investment || []).reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

            // 연금 (pension 섹터)
            pensionTotal = (assets.pension || []).reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

            // 입출금 & 저축 (deposit + savings)
            safeTotal = (assets.deposit || []).reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
                + (assets.savings || []).reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

            // 부동산 (realestate 섹터)
            realEstateTotal = (assets.realestate || []).reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
            if (realEstateTotal > 0) hasHouse = true;

            // 자동차 (car 섹터 및 misc 검색)
            const carTotal = (assets.car || []).reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
            if (carTotal > 0) hasCar = true;

            // 기타자산 (misc 섹터)
            miscTotal = (assets.misc || []).reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
            if (!hasCar) {
                hasCar = (assets.misc || []).some(item => 
                    /(차|자동차|차량|car|아반떼|그랜저|제네시스|테슬라|bmw|벤츠|k5|소나타|스포티지|쏘렌토)/i.test(item.name || '')
                );
            }

            // 모든 계좌 내 linkedItems 순회하여 실제 보유 종목명(TIGER, KODEX, AMD, 금 등) 추출
            Object.keys(assets).forEach(sector => {
                (assets[sector] || []).forEach(acc => {
                    if (acc.linkedItems && Array.isArray(acc.linkedItems)) {
                        acc.linkedItems.forEach(item => {
                            if (item.name && !stockTickers.includes(item.name)) {
                                stockTickers.push(item.name);
                            }
                        });
                    }
                    if (acc.name && (sector === 'investment' || sector === 'pension')) {
                        if (!stockTickers.includes(acc.name)) {
                            stockTickers.push(acc.name);
                        }
                    }
                });
            });

            // calculation이 0이거나 없을 때 자산 합계로 보정
            if (grossAssets <= 0) {
                grossAssets = safeTotal + investmentTotal + pensionTotal + realEstateTotal + carTotal + miscTotal;
            }
            if (netWorth <= 0 && grossAssets > 0) {
                netWorth = grossAssets - totalLoan;
            }
        } else {
            netWorth = 14000;
            grossAssets = 18000;
            totalLoan = 4000;
        }

        // 비중 연산 (유효 총자산 및 유효 순자산 기준)
        const effectiveGross = Math.max(1, grossAssets);
        const effectiveNet = Math.max(1, netWorth);
        const stockWeight = investmentTotal / effectiveGross;
        const netInvestmentRatio = investmentTotal / effectiveNet;
        const safeWeight = (safeTotal + pensionTotal) / effectiveGross;
        const leverageRatio = totalLoan / effectiveGross;
        const netLeverageRatio = totalLoan / effectiveNet;

        // 투자 성향 자동 진단 (순자산 대비 투자비중 + 대출 레버리지 복합 평가)
        let archetype = '고레버리지 성장 돌격형';
        let archetypeDetail = '대출 레버리지와 투자 자산을 적극 활용하여 빠른 자산 증식을 노립니다.';

        if ((leverageRatio >= 0.2 || netLeverageRatio >= 0.5) && (stockWeight >= 0.15 || netInvestmentRatio >= 0.35)) {
            archetype = '고레버리지 성장 돌격형';
            archetypeDetail = '대출 레버리지와 투자 자산을 적극 활용하여 빠른 자산 증식을 노립니다.';
        } else if (stockWeight >= 0.35 || netInvestmentRatio >= 0.5) {
            archetype = '공격적 투자 집중형';
            archetypeDetail = '자산의 상당 부분을 주식/ETF/투자 자산에 집중한 하이리스크형입니다.';
        } else if (realEstateTotal >= effectiveGross * 0.4) {
            archetype = '실물 부동산 집중형';
            archetypeDetail = '부동산 실물 자산에 자본이 묶인 전형적인 대한민국 자산가 구조입니다.';
        } else if (safeWeight >= 0.5 && stockWeight < 0.2 && netInvestmentRatio < 0.2) {
            archetype = '원금보존 안정 방어형';
            archetypeDetail = '예적금과 연금 중심의 방어적이고 흔들림 없는 구조입니다.';
        } else {
            archetype = '밸런스 성장형';
            archetypeDetail = '균형 잡힌 자산 배분으로 안정적인 성장을 추구합니다.';
        }

        return {
            netWorth: Math.max(10, Math.round(netWorth)),
            grossAssets: Math.max(10, Math.round(grossAssets)),
            totalLoan: Math.round(totalLoan),
            hasHouse,
            hasCar,
            stockTickers: stockTickers.length > 0 ? stockTickers.slice(0, 8) : ['TIGER 미국S&P500', 'KODEX 미국나스닥100', '삼성전자'],
            stockWeight: Math.min(1, Math.max(0.1, stockWeight)),
            safeAssetWeight: safeWeight,
            archetype,
            archetypeDetail,
            salaryManwon: monthlySalary > 0 ? monthlySalary : 350
        };
    }, [currentAppData, currentCalculation, monthlySalary]);

    // ==========================================
    // 2. 시뮬레이터 상태 관리 (독립 샌드박스)
    // ==========================================
    const [simStage, setSimStage] = useState('setup'); // 'setup' | 'running' | 'ended'

    // 설정 값
    const [userAge, setUserAge] = useState(() => {
        const saved = localStorage.getItem('korea_sim_user_age');
        return saved ? parseInt(saved, 10) : 31;
    });
    const [setupHouse, setSetupHouse] = useState(initialUserData.hasHouse);
    const [setupCar, setSetupCar] = useState(initialUserData.hasCar);
    const [setupMarital, setSetupMarital] = useState('single');
    const [setupChildren, setSetupChildren] = useState(0);
    const [setupParent, setSetupParent] = useState('normal'); // 'normal' | 'wealthy' | 'burden'
    const [selectedArchetype, setSelectedArchetype] = useState(initialUserData.archetype);

    // 실데이터 로드 완료 시 setup 기본값 자동 동기화
    useEffect(() => {
        if (initialUserData) {
            setSetupHouse(initialUserData.hasHouse);
            setSetupCar(initialUserData.hasCar);
            setSelectedArchetype(initialUserData.archetype);
        }
    }, [initialUserData.archetype, initialUserData.hasHouse, initialUserData.hasCar]);

    // 런타임 상태
    const [simYear, setSimYear] = useState(0);
    const [currentAge, setCurrentAge] = useState(31);
    const [simNetWorth, setSimNetWorth] = useState(14000);
    const [simGrossAssets, setSimGrossAssets] = useState(18000);
    const [simLoan, setSimLoan] = useState(4000);
    const [simSalary, setSimSalary] = useState(350);
    const [isMarried, setIsMarried] = useState(false);
    const [childrenCount, setChildrenCount] = useState(0);
    const [hasOwnHouse, setHasOwnHouse] = useState(false);
    const [hasCar, setHasCar] = useState(false);
    const [glidePathMode, setGlidePathMode] = useState('auto'); // 'auto' | 'conservative' | 'beast'
    const [isRetired, setIsRetired] = useState(false);
    const [fireAge, setFireAge] = useState(null); // 조기 FIRE 달성 나이

    // 클로저 스모크 방지 및 고속 런타임 동기화를 위한 ref
    const simStateRef = useRef({
        userAge: 31,
        simYear: 0,
        currentAge: 31,
        simNetWorth: 14000,
        simGrossAssets: 18000,
        simLoan: 4000,
        simSalary: 350,
        isMarried: false,
        childrenCount: 0,
        hasOwnHouse: false,
        hasCar: false,
        glidePathMode: 'auto',
        isRetired: false,
        fireAge: null,
        selectedArchetype: initialUserData.archetype,
        setupParent: 'normal'
    });

    // 상태 변경 시 ref 실시간 최신화 동기화
    useEffect(() => {
        simStateRef.current = {
            userAge,
            simYear,
            currentAge,
            simNetWorth,
            simGrossAssets,
            simLoan,
            simSalary,
            isMarried,
            childrenCount,
            hasOwnHouse,
            hasCar,
            glidePathMode,
            isRetired,
            fireAge,
            selectedArchetype,
            setupParent
        };
    }, [userAge, simYear, currentAge, simNetWorth, simGrossAssets, simLoan, simSalary, isMarried, childrenCount, hasOwnHouse, hasCar, glidePathMode, isRetired, fireAge, selectedArchetype, setupParent]);

    // 투자 성향 순환 토글 함수 (셋업 및 런타임 상시 자유 전환)
    const handleCycleArchetype = () => {
        const idx = ARCHETYPE_LIST.findIndex(a => a.name === selectedArchetype);
        const nextIdx = (idx + 1) % ARCHETYPE_LIST.length;
        const nextName = ARCHETYPE_LIST[nextIdx].name;
        setSelectedArchetype(nextName);
        simStateRef.current.selectedArchetype = nextName;
        if (simStage === 'running' && addToast) {
            addToast(`📊 투자 성향을 [${nextName}]으로 변경했습니다.`, 'info');
        }
    };

    // 선택지 제안 쿨다운 관리 (영구 차단 방지: 거절 후 몇 년 뒤 다시 기회 도래)
    const choiceCooldownRef = useRef({});
    const handledChoicesRef = useRef(new Set());
    const childrenAgesRef = useRef([]); // 자녀들의 나이 배열 (성장 단계별 유기적 양육비 연동)
    const recentEventsRef = useRef(new Set()); // 최근 발생한 이벤트 중복 방지 쿨다운 (본거 또보기 방지)

    // 배속 컨트롤
    const [speedMultiplier, setSpeedMultiplier] = useState(1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeChoiceModal, setActiveChoiceModal] = useState(null);

    // 차트용 이력 데이터 (스파크라인)
    const [historyPoints, setHistoryPoints] = useState([]);

    // 타임라인 피드 기록
    const [timelineLogs, setTimelineLogs] = useState([]);

    // 랭킹 & 결산 기록
    const [currentRank, setCurrentRank] = useState({ ageRank: 15.0, allRank: 35.0 });
    const [peakStats, setPeakStats] = useState({ age: 31, netWorth: 0, bestRank: 99 });
    const [worstCrisis, setWorstCrisis] = useState({ age: 31, event: '출발선' });
    const [endReason, setEndReason] = useState('만수무강 완주');

    // 타이머 ref
    const timerRef = useRef(null);

    // ==========================================
    // 3. 시뮬레이션 시작 핸들러
    // ==========================================
    const handleStartSimulation = () => {
        localStorage.setItem('korea_sim_user_age', userAge.toString());

        setCurrentAge(userAge);
        setSimYear(0);
        setSimNetWorth(initialUserData.netWorth);
        setSimGrossAssets(initialUserData.grossAssets);
        setSimLoan(initialUserData.totalLoan);
        setSimSalary(initialUserData.salaryManwon);
        setIsMarried(setupMarital === 'married');
        setChildrenCount(setupChildren);
        setHasOwnHouse(setupHouse);
        setHasCar(setupCar);
        handledChoicesRef.current.clear();
        choiceCooldownRef.current = {};
        childrenAgesRef.current = Array(setupChildren).fill(0).map((_, i) => (i + 1) * 3);
        recentEventsRef.current.clear();
        setGlidePathMode('auto');
        setIsRetired(false);
        setFireAge(null);
        setEndReason('');

        simStateRef.current = {
            userAge,
            simYear: 0,
            currentAge: userAge,
            simNetWorth: initialUserData.netWorth,
            simGrossAssets: initialUserData.grossAssets,
            simLoan: initialUserData.totalLoan,
            simSalary: initialUserData.salaryManwon,
            isMarried: setupMarital === 'married',
            childrenCount: setupChildren,
            hasOwnHouse: setupHouse,
            hasCar: setupCar,
            glidePathMode: 'auto',
            isRetired: false,
            fireAge: null,
            selectedArchetype,
            setupParent
        };

        const initialRank = getPercentile(initialUserData.netWorth, userAge);
        setCurrentRank(initialRank);
        setPeakStats({ age: userAge, netWorth: initialUserData.netWorth, bestRank: initialRank.allRank });
        setWorstCrisis({ age: userAge, event: '출발선' });

        setHistoryPoints([{ age: userAge, netWorth: initialUserData.netWorth, allRank: initialRank.allRank }]);

        const startLog = {
            id: `start-${Date.now()}`,
            age: userAge,
            year: new Date().getFullYear(),
            type: 'milestone',
            title: `대한민국 5,000만 명 속으로 진입`,
            desc: `순자산 ${formatKoreanMoney(initialUserData.netWorth)}원, 동년배 상위 ${initialRank.ageRank}%, 전체 상위 ${initialRank.allRank}%에서 레이스를 시작합니다.`,
            netWorth: initialUserData.netWorth,
            tag: 'START'
        };
        setTimelineLogs([startLog]);

        setSimStage('running');
        setIsPlaying(true);
    };

    // ==========================================
    // 4. 1년 진행 핵심 연산 엔진 (1 Step = 1 Year)
    // ==========================================
    const stepOneYear = useCallback(() => {
        if (activeChoiceModal) return;

        const state = simStateRef.current;
        const nextYear = state.simYear + 1;
        const nextAge = state.userAge + nextYear;

        // 📈 한국은행/통계청 장기 소비자물가상승률(인플레이션) 연 2.5% 복리 반영 지수
        const inflationRate = 0.025;
        const inflationFactor = Math.pow(1 + inflationRate, nextYear);

        // 1) 대한민국 통계청 완전생명표 및 현실 사고/질병 사망 판정
        const mortality = checkLifeTableMortality(nextAge);
        if (mortality.isDead) {
            setIsPlaying(false);
            setEndReason(mortality.cause);
            setSimStage('ended');
            return;
        }

        // 2) 상황 기반(Context-Driven) 인터랙티브 분기 기회 엔진 (물가상승률 연동)
        // (A) 차량 구매/기변 기회: 차가 없을 때 27세 이후 3~4년 주기로 자가용 장만 고민 도래
        if (!state.hasCar && nextAge >= 27 && (nextAge - (choiceCooldownRef.current['car'] || 0) >= 4)) {
            choiceCooldownRef.current['car'] = nextAge;
            const carCost = Math.round(3200 * inflationFactor);
            setIsPlaying(false);
            setActiveChoiceModal({
                id: 'car_choice',
                age: nextAge,
                title: '🚗 자가용 출고의 기로: 마이카 구매 vs 대중교통 절약',
                desc: `출퇴근 편의와 주말 기동성을 위한 차량 구매 기회입니다. (물가 연동 차량가: ${formatKoreanMoney(carCost)}원)`,
                options: [
                    {
                        label: `신차/자가용 출고 (-${formatKoreanMoney(carCost)}원, 오너 드라이버 등극)`,
                        detail: `내 차 마련의 쾌감과 생활 반경 확대. 일시금 -${formatKoreanMoney(carCost)}원 지출.`,
                        action: () => {
                            const newNet = Math.max(100, state.simNetWorth - carCost);
                            state.hasCar = true;
                            state.simNetWorth = newNet;
                            setHasCar(true);
                            setSimNetWorth(newNet);
                            return {
                                title: '첫 자가용 출고 · 오너 드라이버 등극',
                                desc: `첫 차를 출고하여 전국 어디든 누비게 되었습니다. (-${formatKoreanMoney(carCost)}원 지출)`
                            };
                        }
                    },
                    {
                        label: '지금은 대중교통 유지 · 주식 시드머니 보존',
                        detail: '불필요한 차량 감가상각과 유지비를 아껴 시드머니 복리에 집중합니다. (추후 언제든 구매 가능)',
                        action: () => ({
                            title: '대중교통 절약 · 시드머니 복리 집중',
                            desc: '차량 지출을 미루고 투자 원금을 보존했습니다.'
                        })
                    }
                ]
            });
            return;
        }

        // (B) 결혼 기회: 미혼일 때 29세 이후 4년 주기로 소중한 인연과 결혼 고민 기회 도래
        if (!state.isMarried && nextAge >= 29 && (nextAge - (choiceCooldownRef.current['marriage'] || 0) >= 4)) {
            choiceCooldownRef.current['marriage'] = nextAge;
            const weddingCost = Math.round(4200 * inflationFactor);
            setIsPlaying(false);
            setActiveChoiceModal({
                id: 'marriage',
                age: nextAge,
                title: '💍 운명의 갈림길: 결혼과 독립',
                desc: `소중한 인연을 만나 가정을 꾸릴 기회가 찾아왔습니다. (물가 연동 예식/혼수비용: ${formatKoreanMoney(weddingCost)}원)`,
                options: [
                    {
                        label: `결혼하기 (맞벌이 소득 +65% 부스터 획득)`,
                        detail: `예식 및 혼수 비용 -${formatKoreanMoney(weddingCost)}원 지출, 대신 합산 소득 +65% 영구 증가.`,
                        action: () => {
                            const newNet = Math.max(100, state.simNetWorth - weddingCost);
                            const newSalary = Math.round(state.simSalary * 1.65);
                            state.isMarried = true;
                            state.simNetWorth = newNet;
                            state.simSalary = newSalary;
                            setIsMarried(true);
                            setSimNetWorth(newNet);
                            setSimSalary(newSalary);
                            return {
                                title: '결혼 성사 · 새로운 가족의 탄생',
                                desc: `축의금 및 예식 비용 지출(-${formatKoreanMoney(weddingCost)}원). 맞벌이로 가구 월 소득이 크게 증가했습니다.`
                            };
                        }
                    },
                    {
                        label: '지금은 독신 자유 라이프 고수',
                        detail: '목돈 지출을 아끼고 온전히 나만의 자산 증식과 자유를 유지합니다. (추후 언제든 결혼 가능)',
                        action: () => ({
                            title: '비혼 유지 · 나만의 길을 걷다',
                            desc: '결혼 비용을 아껴 공격적인 투자 원금으로 보존했습니다.'
                        })
                    }
                ]
            });
            return;
        }

        // (C) 자녀 출산 기회: 오직 기혼 상태일 때만 3년 주기로 자녀 계획 기회 도래
        if (state.isMarried && state.childrenCount < 2 && nextAge >= 31 && (nextAge - (choiceCooldownRef.current['child'] || 0) >= 3)) {
            choiceCooldownRef.current['child'] = nextAge;
            const birthCost = Math.round(650 * inflationFactor); // 산후조리원 2주 + 초기 유모차/용품 세팅비
            setIsPlaying(false);
            setActiveChoiceModal({
                id: 'child_birth',
                age: nextAge,
                title: '👶 자녀 계획: 새로운 생명의 축복',
                desc: state.childrenCount === 0 
                    ? `아이를 낳아 가정을 완성할 것인가, 부부만의 자유로운 삶(딩크)을 살 것인가의 갈림길입니다. (출산·산후조리 초기비용: ${formatKoreanMoney(birthCost)}원)`
                    : `둘째 아이를 낳아 다자녀 가정을 꾸릴 것인가의 선택입니다. (출산·산후조리 초기비용: ${formatKoreanMoney(birthCost)}원)`,
                options: [
                    {
                        label: `아이 낳기 (자녀 출산 및 양육 단계 시작)`,
                        detail: `산후조리원 및 초기 육아용품(-${formatKoreanMoney(birthCost)}원) 지출. 이후 성장 단계별(초중고 학원비 및 대학 등록금) 양육비가 유기적으로 발생합니다.`,
                        action: () => {
                            const nextCount = state.childrenCount + 1;
                            const newNet = Math.max(100, state.simNetWorth - birthCost);
                            childrenAgesRef.current.push(0); // 0세 신생아 등록
                            state.childrenCount = nextCount;
                            state.simNetWorth = newNet;
                            setChildrenCount(nextCount);
                            setSimNetWorth(newNet);
                            return {
                                title: `👶 ${nextCount}번째 자녀 출산 · 새로운 생명의 탄생`,
                                desc: `눈에 넣어도 안 아플 아이가 태어났습니다! 산후조리원 및 초기 육아용품 세팅(-${formatKoreanMoney(birthCost)}원)을 마치고 부모의 길을 걷습니다.`
                            };
                        }
                    },
                    {
                        label: state.childrenCount === 0 ? '딩크족(DINK) / 무자녀 라이프 유지' : '현재 자녀 수 유지',
                        detail: '양육비와 사교육비 지출을 아껴 여유로운 삶과 자산 복리 축적에 집중합니다.',
                        action: () => ({
                            title: '자유로운 가족 라이프 유지',
                            desc: '추가 양육 비용을 절감하여 여유로운 삶과 투자 엔진의 속도를 유지했습니다.'
                        })
                    }
                ]
            });
            return;
        }

        // (D) 내 집 마련 / 상급지 갈아타기 기회: 시드머니 축적 및 재무 여력 기반 기회 도래
        if (!state.hasOwnHouse && state.simNetWorth >= 6000 && (nextAge - (choiceCooldownRef.current['housing'] || 0) >= 4)) {
            choiceCooldownRef.current['housing'] = nextAge;
            const houseAsset = Math.round(42000 * inflationFactor);
            const houseLoan = Math.round(26000 * inflationFactor);
            setIsPlaying(false);
            setActiveChoiceModal({
                id: 'housing',
                age: nextAge,
                title: '🏠 내 집 마련의 기로: 상급지 청약/영끌 vs 주식 복리 올인',
                desc: `축적된 시드머니를 바탕으로 주담대를 일으켜 아파트를 매수할 기회입니다. (물가 연동 매매가: ${formatKoreanMoney(houseAsset)}원, 주담대: ${formatKoreanMoney(houseLoan)}원)`,
                options: [
                    {
                        label: `영끌 아파트 매수 (자가 등기 완료)`,
                        detail: `주택담보대출 실행(+${formatKoreanMoney(houseLoan)}원) 및 실물 아파트 자산(+${formatKoreanMoney(houseAsset)}원) 편입.`,
                        action: () => {
                            const newLoan = state.simLoan + houseLoan;
                            const newGross = state.simGrossAssets + houseAsset;
                            state.hasOwnHouse = true;
                            state.simLoan = newLoan;
                            state.simGrossAssets = newGross;
                            setHasOwnHouse(true);
                            setSimLoan(newLoan);
                            setSimGrossAssets(newGross);
                            return {
                                title: '수도권 신축 아파트 등기 완료 (내 집 마련)',
                                desc: `주담대를 일으켜 내 집 마련에 성공했습니다. 대한민국 실물 부동산 자산가로 안착했습니다. (+${formatKoreanMoney(houseAsset)}원 자산 편입)`
                            };
                        }
                    },
                    {
                        label: '무주택 유지 · 주식/배당 복리 올인',
                        detail: '부동산 과열을 피하고 유동성 높은 글로벌 주식과 배당 포트폴리오를 지킵니다. (추후 언제든 매수 가능)',
                        action: () => ({
                            title: '금융 자본가 선언 · 주식 복리 집중',
                            desc: '부동산 대신 글로벌 금융자산의 복리 성장에 집중했습니다.'
                        })
                    }
                ]
            });
            return;
        }

        // (E) 50대 투자 체질 전환 선택 (글라이드패스)
        if (nextAge >= 50 && nextAge <= 53 && !handledChoicesRef.current.has('glidepath_choice') && state.glidePathMode === 'auto') {
            handledChoicesRef.current.add('glidepath_choice');
            setIsPlaying(false);
            setActiveChoiceModal({
                id: 'glidepath_choice',
                age: nextAge,
                title: '⚖️ 50대를 맞이한 투자 체질 전환',
                desc: '은퇴가 가시권에 들어왔습니다. 시장의 변동성을 줄이고 안전자산으로 피신하시겠습니까?',
                options: [
                    {
                        label: '안전 인컴·배당형으로 전환 (추천)',
                        detail: '채권과 배당 ETF 비중을 대폭 높여 노후 자금의 안전망을 완성합니다.',
                        action: () => {
                            state.glidePathMode = 'conservative';
                            setGlidePathMode('conservative');
                            return {
                                title: '방어형 인컴 포트폴리오 전환',
                                desc: '변동성을 낮추고 따박따박 나오는 배당금 중심 체질로 안착했습니다.'
                            };
                        }
                    },
                    {
                        label: '영원한 야수의 심장! 주식 70% 고수',
                        detail: '끝까지 공격적 레버리지를 유지합니다. 대박 또는 쪽박의 갈림길입니다.',
                        action: () => {
                            state.glidePathMode = 'beast';
                            setGlidePathMode('beast');
                            return {
                                title: '야수의 심장 고수 · 끝장 승부',
                                desc: '나이와 상관없이 고수익 고위험 자산에 전력을 다합니다.'
                            };
                        }
                    }
                ]
            });
            return;
        }

        // (F) 조기 FIRE(경제적 자유) 돌파 체크 (순자산 25억 이상 & 58세 미만)
        if (!state.fireAge && !state.isRetired && state.simNetWorth >= Math.round(250000 * inflationFactor) && nextAge < 58) {
            setIsPlaying(false);
            setActiveChoiceModal({
                id: 'fire_choice',
                age: nextAge,
                title: '🔥 [대도약] 경제적 자유 (FIRE) 달성!',
                desc: `순자산 ${formatKoreanMoney(state.simNetWorth)}원을 돌파했습니다. 자산 소득이 생활비를 압도합니다. 지금 당장 조기 은퇴하시겠습니까?`,
                options: [
                    {
                        label: '지금 당장 조기 은퇴! 자유인의 삶 시작',
                        detail: '직장을 퇴사하고 자산 배당금과 함께 꿈꾸던 인생 2막을 누립니다.',
                        action: () => {
                            state.isRetired = true;
                            state.fireAge = nextAge;
                            setIsRetired(true);
                            setFireAge(nextAge);
                            return {
                                title: `🎉 ${nextAge}세 조기 은퇴 (FIRE 달성 성공)`,
                                desc: '대한민국 상위 3% 이내의 경제적 자유를 쟁취하고 자유인으로 조기 은퇴했습니다!'
                            };
                        }
                    },
                    {
                        label: '계속 일하며 대한민국 상위 0.1% 노리기',
                        detail: '더 큰 메가 부를 향해 사업과 직장 커리어를 계속 밀고 나갑니다.',
                        action: () => ({
                            title: '커리어 지속 · 초고자산가 도전',
                            desc: '조기 은퇴를 유예하고 대한민국 0.1% 슈퍼 리치를 향해 전진합니다.'
                        })
                    }
                ]
            });
            return;
        }

        // ==========================================
        // 5) 매년 자산 연산 & 다채로운 현실 한국 이벤트 풀 (인플레이션 완벽 연동)
        // ==========================================
        let currentNet = state.simNetWorth;
        let currentLoan = state.simLoan;
        let currentSalary = state.simSalary;
        let currentGross = state.simGrossAssets;

        // (1) 월 소득 & 호봉/물가연동 유기적 변동
        if (nextAge < 58 && !state.isRetired) {
            // 정상 근로기: 물가상승률(2.5%) 방어 + 호봉/성과급(0~2.5%) 인상
            const salaryGrowthRate = 1 + inflationRate + (Math.random() * 0.025);
            currentSalary = Math.round(currentSalary * salaryGrowthRate);
        } else if (nextAge >= 58 && nextAge < 60 && !state.isRetired) {
            // 58~60세: 임금피크제 국면 (-4% ~ 0%)
            const salaryGrowthRate = 1 - (Math.random() * 0.04);
            currentSalary = Math.round(currentSalary * salaryGrowthRate);
        }

        // (2) 대한민국 현실 자녀 성장 단계별 양육비 및 가계 소비 지출 모델
        childrenAgesRef.current = childrenAgesRef.current.map(a => a + 1);
        let childrenLivingCostMonthly = 0;

        if (childrenAgesRef.current.length > 0) {
            childrenAgesRef.current.forEach(childAge => {
                if (childAge <= 6) {
                    // 영유아기 (기저귀, 분유, 어린이집, 돌봄비)
                    childrenLivingCostMonthly += Math.round(55 * inflationFactor);
                } else if (childAge <= 12) {
                    // 초등학교 (기본 양육비 + 예체능/기초 학원비)
                    childrenLivingCostMonthly += Math.round(90 * inflationFactor);
                } else if (childAge <= 18) {
                    // 중·고등학교 (본격 입시 대치/목동 학원가, 과외, 인강)
                    childrenLivingCostMonthly += Math.round(155 * inflationFactor);
                } else if (childAge <= 24) {
                    // 대학교 (등록금 분할 및 자취방/용돈 지원)
                    childrenLivingCostMonthly += Math.round(175 * inflationFactor);
                }
                // 25세 이상: 취업 및 경제적 독립
            });
        } else if (state.childrenCount > 0) {
            childrenLivingCostMonthly += state.childrenCount * Math.round(100 * inflationFactor);
        }

        let annualIncome = 0;
        let annualExpense = 0;

        if (!state.isRetired) {
            annualIncome = currentSalary * 12;
            // 기본 1인 생활비 월 170만 / 부부 맞벌이 시 월 260만 (인플레이션 연동)
            let baseLiving = state.isMarried ? 260 : 170;
            let monthlyLivingCost = Math.round(baseLiving * inflationFactor);

            // 자녀 성장 단계별 양육비 합산
            monthlyLivingCost += childrenLivingCostMonthly;

            // 차량 유지비 (유류비, 자동차세, 보험료 등 월 35만원 * inflationFactor)
            if (state.hasCar) monthlyLivingCost += Math.round(35 * inflationFactor);

            // 부모님 부양 배경 (burden인 경우 월 60만원 * inflationFactor 지원)
            if (state.setupParent === 'burden') monthlyLivingCost += Math.round(60 * inflationFactor);

            annualExpense = monthlyLivingCost * 12;
        } else {
            // 은퇴기: 국민연금(매년 소비자물가변동률 100% 연동 인상) + 축적 자산 인컴 vs 노후 생활비
            const basePension = 140 + (currentSalary > 400 ? 50 : 20);
            const pensionMonthly = Math.round(basePension * inflationFactor);
            annualIncome = pensionMonthly * 12;

            let baseLiving = state.isMarried ? 240 : 160;
            let monthlyLivingCost = Math.round(baseLiving * inflationFactor);
            monthlyLivingCost += childrenLivingCostMonthly;
            if (state.hasCar) monthlyLivingCost += Math.round(25 * inflationFactor);

            annualExpense = monthlyLivingCost * 12;
        }

        // (3) 대출 금리 및 원리금 분할 상환 유기적 연동
        if (currentLoan > 0) {
            const loanInterestRate = 0.038 + (Math.random() * 0.014);
            const annualInterest = Math.round(currentLoan * loanInterestRate);
            annualExpense += annualInterest;

            const netCashFlow = annualIncome - annualExpense;
            if (netCashFlow > 0) {
                const repayAmount = Math.min(currentLoan, Math.round(netCashFlow * 0.4));
                currentLoan -= repayAmount;
                annualExpense += repayAmount;
            }
        }

        // 순 저축액(수지 흑자/적자) 자산 반영
        const annualSavings = annualIncome - annualExpense;
        currentNet += annualSavings;

        // (4) 확률형 거시경제 시장 사이클 엔진 (Monte Carlo Stochastic Model)
        const marketRoll = Math.random();
        let marketCycle = 'normal';
        let baseStockReturn = 0.07;
        let baseBondReturn = 0.035;

        if (marketRoll < 0.09) {
            marketCycle = 'crash';
            baseStockReturn = -0.20 - Math.random() * 0.12;
            baseBondReturn = 0.045;
        } else if (marketRoll < 0.23) {
            marketCycle = 'bear';
            baseStockReturn = -0.04 - Math.random() * 0.08;
            baseBondReturn = 0.035;
        } else if (marketRoll < 0.65) {
            marketCycle = 'normal';
            baseStockReturn = 0.05 + Math.random() * 0.08;
            baseBondReturn = 0.035;
        } else if (marketRoll < 0.90) {
            marketCycle = 'bull';
            baseStockReturn = 0.16 + Math.random() * 0.12;
            baseBondReturn = 0.025;
        } else {
            marketCycle = 'super_bull';
            baseStockReturn = 0.28 + Math.random() * 0.18;
            baseBondReturn = 0.02;
        }

        // 투자 성향 및 체질별 레버리지 & 배분 효과
        let effectiveStockWeight = 0.45;
        let leverageMultiplier = 1.0;

        switch (state.selectedArchetype) {
            case '고레버리지 성장 돌격형':
                effectiveStockWeight = 0.65;
                leverageMultiplier = 1.35;
                break;
            case '공격적 투자 집중형':
                effectiveStockWeight = 0.75;
                leverageMultiplier = 1.1;
                break;
            case '원금보존 안정 방어형':
                effectiveStockWeight = 0.15;
                leverageMultiplier = 0.8;
                break;
            case '실물 부동산 집중형':
                effectiveStockWeight = 0.25;
                leverageMultiplier = 1.0;
                break;
            default:
                effectiveStockWeight = 0.45;
                leverageMultiplier = 1.0;
        }

        // 글라이드패스 적용
        if (state.glidePathMode === 'conservative' || (state.glidePathMode === 'auto' && nextAge >= 55)) {
            effectiveStockWeight = Math.min(effectiveStockWeight, 0.25);
            leverageMultiplier = Math.min(leverageMultiplier, 0.9);
        } else if (state.glidePathMode === 'beast') {
            effectiveStockWeight = Math.max(effectiveStockWeight, 0.75);
            leverageMultiplier = Math.max(leverageMultiplier, 1.2);
        }

        const safeWeight = 1 - effectiveStockWeight;
        const marketReturnRate = (baseStockReturn * effectiveStockWeight * leverageMultiplier) + (baseBondReturn * safeWeight);
        const investProfit = Math.round(currentNet * marketReturnRate);
        currentNet += investProfit;

        // (5) 다채로운 연령별 현실 한국 질환/인생 이벤트 엔진 (인플레이션 연동 & 중복 쿨다운)
        let eventTitle = '';
        let eventDesc = '';
        let eventType = 'normal';

        const sampleTicker = initialUserData.stockTickers[Math.floor(Math.random() * initialUserData.stockTickers.length)] || 'TIGER 미국S&P500';

        // 60세 정년퇴직 처리 & 퇴직금 지급 (비FIRE 근로자 대상)
        if (nextAge >= 60 && !state.isRetired) {
            state.isRetired = true;
            setIsRetired(true);
            const severancePay = Math.round(currentSalary * 12 * 1.5);
            currentNet += severancePay;
            eventType = 'milestone';
            eventTitle = `정년퇴직과 명예로운 직장 졸업 (+퇴직금 ${formatKoreanMoney(severancePay)}원)`;
            eventDesc = `한평생 헌신한 일터를 명예롭게 퇴직하고 퇴직금을 수령했습니다. 국민연금 수령기까지 인생 제2막을 준비합니다.`;
        } else if (nextAge === 60 && state.isRetired) {
            eventType = 'milestone';
            eventTitle = `여유로운 60대 라이프 · 조기 은퇴자의 황금기`;
            eventDesc = `이미 경제적 자유를 달성하여 직장의 구속 없이 여유롭고 품격 있는 60대 인생을 만끽합니다.`;
        } else if (nextAge === 65) {
            eventType = 'boom';
            eventTitle = `국민연금 평생 수령 개시 · 든든한 파이프라인 가동`;
            eventDesc = `그동안 성실히 납부해 온 국민연금(물가 연동 월 약 ${formatKoreanMoney(Math.round(185 * inflationFactor))}원)이 입금되기 시작하며 평생 현금흐름이 완성되었습니다.`;
        } else if (marketCycle === 'crash') {
            eventType = 'crisis';
            eventTitle = `글로벌 경기 침체 및 주식 시장 급락`;
            eventDesc = `세계 경제 긴축과 시장 조정으로 평가손실(${formatKoreanMoney(Math.abs(investProfit))}원)을 겪었으나, 견고한 현금흐름으로 방어했습니다.`;
            setWorstCrisis({ age: nextAge, event: eventTitle });
        } else if (marketCycle === 'super_bull' || marketCycle === 'bull') {
            eventType = 'boom';
            eventTitle = `자산 시장 불장 랠리 · 수익률 폭발`;
            eventDesc = `보유 중인 [${sampleTicker}] 중심의 포트폴리오가 역사적 신고가를 경신하며 +${formatKoreanMoney(investProfit)}원의 수익을 거두었습니다.`;
        } else {
            // 평시 후보군 무작위 추첨: 40여 종의 실제 심평원 다빈도 질환 및 인생 사건 풀 (중복 방지 & 물가 스케일링)
            const candidateEvents = [];

            // [직장 / 커리어 이벤트]
            if (nextAge < 60 && !state.isRetired) {
                candidateEvents.push({
                    id: 'career_bonus',
                    type: 'boom',
                    baseDelta: 1400,
                    title: `역대급 프로젝트 성공 · 성과급 대박`,
                    desc: `담당 프로젝트가 대성공을 거두며 특별 인센티브 ${formatKoreanMoney(Math.round(1400 * inflationFactor))}원이 계좌에 입금되었습니다!`
                });
                candidateEvents.push({
                    id: 'career_side',
                    type: 'normal',
                    baseDelta: 450,
                    title: `직무 특허 및 전문 자문 사이드 프로젝트 수익`,
                    desc: `퇴근 후 준비한 전문 컨설팅 파이프라인에서 ${formatKoreanMoney(Math.round(450 * inflationFactor))}원의 쏠쏠한 수익이 발생했습니다.`
                });
                candidateEvents.push({
                    id: 'career_stable',
                    type: 'normal',
                    baseDelta: 0,
                    title: `평온한 직장 생활과 안정적인 복리 저축`,
                    desc: `동료들과 원만한 관계를 유지하며 매달 월급을 착실히 모아 시드머니를 불려나갑니다.`
                });
            }

            // [연령별 의료 / 질환 풀 (30여 종 세분화 및 물가 스케일링)]
            if (nextAge < 40) {
                // 20~30대 청년기 질환/사고
                candidateEvents.push({
                    id: 'med_appendicitis',
                    type: 'crisis',
                    baseDelta: -180,
                    title: `급성 충수염(맹장염) 복강경 응급 절제술`,
                    desc: `갑작스러운 우하복부 통증으로 응급실 후송 후 복강경 맹장 절제술(-${formatKoreanMoney(Math.round(180 * inflationFactor))}원)을 받았습니다. 다행히 합병증 없이 퇴원했습니다.`
                });
                candidateEvents.push({
                    id: 'med_acl',
                    type: 'crisis',
                    baseDelta: -380,
                    title: `운동 중 무릎 전방십자인대 및 반월상 연골 파열 수술`,
                    desc: `스포츠 활동 중 무릎 부상으로 관절경 인대 재건술과 3개월 재활(-${formatKoreanMoney(Math.round(380 * inflationFactor))}원)을 진행했습니다.`
                });
                candidateEvents.push({
                    id: 'med_thyroid_robot',
                    type: 'crisis',
                    baseDelta: -850,
                    title: `조기 갑상선암 로봇 절제술 및 완치 판정`,
                    desc: `정기검진에서 조기 암을 발견해 로봇 절제술(-${formatKoreanMoney(Math.round(850 * inflationFactor))}원)을 받았습니다. 실손보험 환급과 함께 완치되었습니다.`
                });
                candidateEvents.push({
                    id: 'med_kidney_stone',
                    type: 'crisis',
                    baseDelta: -140,
                    title: `급성 요로결석 체외충격파 쇄석술`,
                    desc: `극심한 옆구리 통증으로 체외충격파 쇄석술(-${formatKoreanMoney(Math.round(140 * inflationFactor))}원)을 받고 안전하게 결석을 배출했습니다.`
                });
                candidateEvents.push({
                    id: 'med_car_accident_young',
                    type: 'crisis',
                    baseDelta: -650,
                    title: `빗길 차량 연쇄 추돌사고 정밀 외상 치료`,
                    desc: `빗길 접촉사고로 차량 정비와 정밀 MRI 검진, 한방 재활치료(-${formatKoreanMoney(Math.round(650 * inflationFactor))}원)를 진행했습니다.`
                });
                candidateEvents.push({
                    id: 'med_pneumothorax',
                    type: 'crisis',
                    baseDelta: -210,
                    title: `자발성 기흉 흉관 삽입술 및 흉부외과 케어`,
                    desc: `갑작스러운 흉통으로 흉관 삽입술(-${formatKoreanMoney(Math.round(210 * inflationFactor))}원)을 받고 폐 기능을 온전히 회복했습니다.`
                });
            } else if (nextAge < 60) {
                // 40~50대 중년기 질환
                candidateEvents.push({
                    id: 'med_colon_esd',
                    type: 'crisis',
                    baseDelta: -320,
                    title: `조기 대장암 선종 내시경 점막하 박리술(ESD)`,
                    desc: `종합검진 대장내시경 중 고위험 선종을 조기 발견하여 ESD 박리술(-${formatKoreanMoney(Math.round(320 * inflationFactor))}원)로 안전하게 절제 완치했습니다.`
                });
                candidateEvents.push({
                    id: 'med_coronary_stent',
                    type: 'crisis',
                    baseDelta: -850,
                    title: `협심증 관상동맥 스텐트 삽입술 및 심혈관 케어`,
                    desc: `가슴 흉통으로 심장혈관조영술 후 스텐트 삽입(-${formatKoreanMoney(Math.round(850 * inflationFactor))}원)을 받았습니다. 골든타임 내 시술로 심장을 지켰습니다.`
                });
                candidateEvents.push({
                    id: 'med_disc_decomp',
                    type: 'crisis',
                    baseDelta: -360,
                    title: `추간판 탈출증(디스크) 수핵감압술 및 신경차단술`,
                    desc: `만성 허리통증과 하지 방사통 완화를 위해 미세 척추 시술(-${formatKoreanMoney(Math.round(360 * inflationFactor))}원)을 시행했습니다.`
                });
                candidateEvents.push({
                    id: 'med_gallbladder',
                    type: 'crisis',
                    baseDelta: -290,
                    title: `담석증 급성 담낭염 복강경 담낭 절제술`,
                    desc: `담낭 결석으로 인한 극심한 복통으로 복강경 담낭 절제술(-${formatKoreanMoney(Math.round(290 * inflationFactor))}원)을 받고 회복했습니다.`
                });
                candidateEvents.push({
                    id: 'med_gout',
                    type: 'crisis',
                    baseDelta: -130,
                    title: `급성 통풍 발작 및 요산 표적 치료`,
                    desc: `엄지발가락 관절 급성 통풍으로 관절강 주사 및 요산 강하 치료(-${formatKoreanMoney(Math.round(130 * inflationFactor))}원)를 시작했습니다.`
                });
                candidateEvents.push({
                    id: 'med_shingles',
                    type: 'crisis',
                    baseDelta: -190,
                    title: `대상포진 및 신경통 통증클리닉 집중 치료`,
                    desc: `면역력 저하로 발생한 대상포진을 초기에 발견하여 항바이러스 신경 치료(-${formatKoreanMoney(Math.round(190 * inflationFactor))}원)로 완치했습니다.`
                });
                candidateEvents.push({
                    id: 'med_implant_bone',
                    type: 'crisis',
                    baseDelta: -450,
                    title: `치조골 이식 및 프리미엄 임플란트 식립`,
                    desc: `잇몸 뼈 이식과 함께 어금니 임플란트 식립(-${formatKoreanMoney(Math.round(450 * inflationFactor))}원)을 완료해 씹는 즐거움을 되찾았습니다.`
                });
                candidateEvents.push({
                    id: 'med_early_cancer_robot',
                    type: 'crisis',
                    baseDelta: -1250,
                    title: `조기 암 다빈치 로봇 수술 및 표적 완치`,
                    desc: `정밀 암 검진에서 1기 병변을 발견해 최신 로봇 수술(-${formatKoreanMoney(Math.round(1250 * inflationFactor))}원)을 받고 깨끗하게 완치되었습니다.`
                });
            } else if (nextAge < 80) {
                // 60~70대 장년/노년기 질환
                candidateEvents.push({
                    id: 'med_cataract',
                    type: 'crisis',
                    baseDelta: -680,
                    title: `노인성 백내장 양안 다초점 인공수정체 삽입술`,
                    desc: `혼탁해진 양쪽 수정체를 제거하고 다초점 렌즈를 삽입(-${formatKoreanMoney(Math.round(680 * inflationFactor))}원)하여 안경 없이 밝고 선명한 세상을 되찾았습니다.`
                });
                candidateEvents.push({
                    id: 'med_knee_arthroplasty',
                    type: 'crisis',
                    baseDelta: -980,
                    title: `퇴행성 관절염 무릎 인공관절 로봇 치환술`,
                    desc: `연골 마모로 인한 관절염에 로봇 인공관절 치환술(-${formatKoreanMoney(Math.round(980 * inflationFactor))}원)을 마쳐 통증 없이 다시 걷게 되었습니다.`
                });
                candidateEvents.push({
                    id: 'med_spinal_stenosis',
                    type: 'crisis',
                    baseDelta: -650,
                    title: `척추관 협착증 양방향 척추내시경 감압술`,
                    desc: `다리 저림을 유발하던 척추관 협착을 내시경 시술(-${formatKoreanMoney(Math.round(650 * inflationFactor))}원)로 넓혀 보행 기능을 회복했습니다.`
                });
                candidateEvents.push({
                    id: 'med_cerebral_thrombo',
                    type: 'crisis',
                    baseDelta: -1150,
                    title: `뇌경색 골든타임 혈전용해 시술 및 뇌혈관 케어`,
                    desc: `급성 뇌혈관 폐색을 골든타임 내 혈전제거술(-${formatKoreanMoney(Math.round(1150 * inflationFactor))}원)로 뚫어 후유장애 없이 기적적으로 회복했습니다.`
                });
                candidateEvents.push({
                    id: 'med_afib_ablation',
                    type: 'crisis',
                    baseDelta: -820,
                    title: `심방세동 3차원 전극도자 절제술 (부정맥 수술)`,
                    desc: `불규칙한 심장 박동을 고주파 전극도자 절제술(-${formatKoreanMoney(Math.round(820 * inflationFactor))}원)로 교정하여 정상 리듬을 되찾았습니다.`
                });
                candidateEvents.push({
                    id: 'med_compression_fracture',
                    type: 'crisis',
                    baseDelta: -390,
                    title: `골다공증성 척추 압박골절 경피적 척추체성형술`,
                    desc: `낙상으로 주저앉은 척추뼈에 의료용 골시멘트를 주입(-${formatKoreanMoney(Math.round(390 * inflationFactor))}원)해 통증을 즉시 잡았습니다.`
                });
                candidateEvents.push({
                    id: 'med_macular_anti_vegf',
                    type: 'crisis',
                    baseDelta: -360,
                    title: `노인성 황반변성 항체 주사 3회차 표적 치료`,
                    desc: `황반변성 진행을 억제하는 안내 주사 치료(-${formatKoreanMoney(Math.round(360 * inflationFactor))}원)로 중심 시력을 안정적으로 지켰습니다.`
                });
            } else {
                // 80대 이상 초고령기 질환
                candidateEvents.push({
                    id: 'med_hearing_aid',
                    type: 'crisis',
                    baseDelta: -520,
                    title: `노인성 난청 양이 프리미엄 AI 보청기 피팅`,
                    desc: `자손들의 목소리를 또렷하게 들을 수 있도록 최신 AI 스마트 보청기(-${formatKoreanMoney(Math.round(520 * inflationFactor))}원)를 맞췄습니다.`
                });
                candidateEvents.push({
                    id: 'med_hip_hemiarthro',
                    type: 'crisis',
                    baseDelta: -880,
                    title: `대퇴골 경부 골절 인공고관절 반치환술`,
                    desc: `고관절 골절에 인공관절 반치환술(-${formatKoreanMoney(Math.round(880 * inflationFactor))}원)을 신속히 시행하여 침상 생활 위기를 극복했습니다.`
                });
                candidateEvents.push({
                    id: 'med_parkinson_rehab',
                    type: 'crisis',
                    baseDelta: -580,
                    title: `경도인지장애 및 뇌신경 정밀 인지재활 케어`,
                    desc: `대학병원 뇌건강센터에서 인지 기능 유지와 뇌혈류 개선을 위한 전문 재활 프로그램(-${formatKoreanMoney(Math.round(580 * inflationFactor))}원)을 수료했습니다.`
                });
                candidateEvents.push({
                    id: 'med_nursing_hospital',
                    type: 'crisis',
                    baseDelta: -680,
                    title: `노환 전문 요양병원 프리미엄 전담 간병 케어`,
                    desc: `체계적인 24시간 전담 간병과 물리치료를 제공하는 프리미엄 요양병원(-${formatKoreanMoney(Math.round(680 * inflationFactor))}원)에서 편안한 회복기를 보냈습니다.`
                });
            }

            // [건강 호재 / 라이프스타일 호재]
            candidateEvents.push({
                id: 'boom_health_check',
                type: 'boom',
                baseDelta: 0,
                title: `종합건강검진 '생체나이 6세 젊음' 판정`,
                desc: `꾸준한 운동과 식단 관리 덕분에 혈압, 혈당, 콜레스테롤 모두 정상, 생체나이가 6세 젊게 판정되었습니다!`
            });
            candidateEvents.push({
                id: 'boom_golf_holeinone',
                type: 'boom',
                baseDelta: 200,
                title: `친선 골프 라운딩 평생 첫 홀인원 달성`,
                desc: `동반자들과 함께한 라운딩에서 기적의 홀인원을 기록하며 홀인원 보험금과 축하금 ${formatKoreanMoney(Math.round(200 * inflationFactor))}원을 받았습니다!`
            });
            candidateEvents.push({
                id: 'boom_wellness_trip',
                type: 'normal',
                baseDelta: -380,
                title: `가족 힐링 온천 여행 및 웰니스 디톡스`,
                desc: `바쁜 일상을 잠시 내려놓고 가족들과 함께 온천 휴양지 여행(-${formatKoreanMoney(Math.round(380 * inflationFactor))}원)을 다녀왔습니다.`
            });

            // [자녀 성장 이벤트]
            if (childrenAgesRef.current.some(age => age >= 27 && age <= 32)) {
                candidateEvents.push({
                    id: 'child_wedding_gift',
                    type: 'crisis',
                    baseDelta: -4500,
                    title: `성인 자녀의 결혼 및 신혼집 전세자금 지원`,
                    desc: `훌륭하게 자란 자녀가 평생의 반려자를 만나 결혼했습니다. 든든한 부모로서 신혼집 마련에 ${formatKoreanMoney(Math.round(4500 * inflationFactor))}원을 지원했습니다.`
                });
            }
            if (childrenAgesRef.current.some(age => age >= 24 && age <= 26)) {
                candidateEvents.push({
                    id: 'child_first_paycheck',
                    type: 'boom',
                    baseDelta: 150,
                    title: `자녀의 첫 취업 성공 및 첫 월급 선물`,
                    desc: `자녀가 당당히 대기업/공기업 취업에 성공하여 첫 월급으로 부모님 감사 선물과 용돈 ${formatKoreanMoney(Math.round(150 * inflationFactor))}원을 건넸습니다.`
                });
            }

            // [부모 배경 이벤트 연동]
            if (state.setupParent === 'wealthy') {
                candidateEvents.push({
                    id: 'parent_gift_seed',
                    type: 'boom',
                    baseDelta: 4500,
                    title: `부모님의 든든한 증여 및 시드머니 지원`,
                    desc: `자산가 부모님으로부터 비과세 증여 및 지원금 ${formatKoreanMoney(Math.round(4500 * inflationFactor))}원을 받아 투자 시드가 크게 확충되었습니다.`
                });
                if (nextAge >= 52) {
                    candidateEvents.push({
                        id: 'parent_inheritance',
                        type: 'boom',
                        baseDelta: 14000,
                        title: `부모님 유산 상속 및 부동산 승계 완료`,
                        desc: `부모님으로부터 알짜 부동산과 금융자산 상속(상속세 납부 후 순수령 약 ${formatKoreanMoney(Math.round(14000 * inflationFactor))}원)이 완료되었습니다.`
                    });
                }
            } else if (state.setupParent === 'burden') {
                candidateEvents.push({
                    id: 'parent_medical_support',
                    type: 'crisis',
                    baseDelta: -550,
                    title: `부모님 노환 및 요양병원 간병비 긴급 지원`,
                    desc: `부모님의 급성 질환 치료비와 간병비 ${formatKoreanMoney(Math.round(550 * inflationFactor))}원을 긴급 지원했습니다. 가계는 빠듯하지만 효도를 다했습니다.`
                });
            }

            // [재테크 / 금융 이벤트]
            candidateEvents.push({
                id: 'invest_ipo_profit',
                type: 'boom',
                baseDelta: 180,
                title: `대어급 공모주 청약 따따블 수익 실현`,
                desc: `공모주 청약이 상장 첫날 급등하여 ${formatKoreanMoney(Math.round(180 * inflationFactor))}원의 짭짤한 용돈을 벌었습니다.`
            });
            candidateEvents.push({
                id: 'invest_dividend_compound',
                type: 'normal',
                baseDelta: 0,
                title: `배당금 자동 재투자와 복리 스노우볼 가속`,
                desc: `계좌로 들어온 배당금이 자동으로 재투자되어 자산의 복리 스노우볼이 한층 더 빠르게 굴러가고 있습니다.`
            });

            // 🎯 최근 12년간 발생한 이벤트 필터링 (본거 또보기 완전 방지)
            let eligibleEvents = candidateEvents.filter(ev => !recentEventsRef.current.has(ev.id));
            if (eligibleEvents.length === 0) {
                recentEventsRef.current.clear();
                eligibleEvents = candidateEvents;
            }

            const chosen = eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)];
            recentEventsRef.current.add(chosen.id);
            if (recentEventsRef.current.size > 15) {
                const oldest = recentEventsRef.current.values().next().value;
                recentEventsRef.current.delete(oldest);
            }

            eventType = chosen.type;
            eventTitle = chosen.title;
            eventDesc = chosen.desc;
            const actualDelta = chosen.baseDelta ? Math.round(chosen.baseDelta * inflationFactor) : 0;
            currentNet += actualDelta;
        }

        // 백분위 랭킹 갱신
        const newRank = getPercentile(currentNet, nextAge);
        setCurrentRank(newRank);

        // 최고 전성기 갱신
        setPeakStats(prevPeak => {
            if (currentNet > prevPeak.netWorth) {
                return { age: nextAge, netWorth: currentNet, bestRank: newRank.allRank };
            }
            return prevPeak;
        });

        // 스파크라인 차트 포인트 추가
        setHistoryPoints(prevPoints => [...prevPoints, { age: nextAge, netWorth: currentNet, allRank: newRank.allRank }]);

        // 타임라인 로그 추가
        const newLog = {
            id: `log-${nextAge}-${Date.now()}`,
            age: nextAge,
            year: new Date().getFullYear() + nextYear,
            type: eventType,
            title: eventTitle,
            desc: eventDesc,
            netWorth: currentNet,
            rank: newRank,
            tag: eventType.toUpperCase()
        };
        setTimelineLogs(prevLogs => [newLog, ...prevLogs]);

        // ref 및 React 상태 동기화
        state.simYear = nextYear;
        state.currentAge = nextAge;
        state.simNetWorth = currentNet;
        state.simGrossAssets = currentGross;
        state.simLoan = currentLoan;
        state.simSalary = currentSalary;

        setSimYear(nextYear);
        setCurrentAge(nextAge);
        setSimNetWorth(currentNet);
        setSimGrossAssets(currentGross);
        setSimLoan(currentLoan);
        setSimSalary(currentSalary);
    }, [activeChoiceModal, initialUserData]);

    // ==========================================
    // 5-1. 유저 능동적 인생 결단 액션 핸들러 (인플레이션 완벽 연동)
    // ==========================================
    const handleManualBuyCar = () => {
        const inflationFactor = Math.pow(1.025, simYear);
        const baseCost = hasCar ? 2500 : 3200;
        const cost = Math.round(baseCost * inflationFactor);
        const newNet = Math.max(100, simNetWorth - cost);
        setSimNetWorth(newNet);
        setHasCar(true);
        simStateRef.current.simNetWorth = newNet;
        simStateRef.current.hasCar = true;

        const title = hasCar ? '프리미엄 신차 기변' : '첫 자가용 출고 · 오너 드라이버 등극';
        const desc = hasCar 
            ? `${currentAge}세, 승차감 좋은 신차로 기변했습니다. (-${formatKoreanMoney(cost)}원 지출, 물가 ${inflationFactor.toFixed(2)}배 반영)`
            : `${currentAge}세, 첫 차를 출고하여 편리한 기동력을 얻었습니다. (-${formatKoreanMoney(cost)}원 지출, 물가 ${inflationFactor.toFixed(2)}배 반영)`;
        setTimelineLogs(prev => [{
            id: `manual-car-${Date.now()}`,
            age: currentAge,
            year: new Date().getFullYear() + simYear,
            type: 'boom',
            title,
            desc,
            netWorth: newNet,
            rank: currentRank,
            tag: 'DECISION'
        }, ...prev]);
        if (addToast) addToast(`🚗 [${title}] 완료! (${formatKoreanMoney(cost)}원 지출)`, 'info');
    };

    const handleManualMarry = () => {
        if (isMarried) return;
        const inflationFactor = Math.pow(1.025, simYear);
        const cost = Math.round(4200 * inflationFactor);
        const newNet = Math.max(100, simNetWorth - cost);
        const newSalary = Math.round(simSalary * 1.65);
        setSimNetWorth(newNet);
        setSimSalary(newSalary);
        setIsMarried(true);
        simStateRef.current.simNetWorth = newNet;
        simStateRef.current.simSalary = newSalary;
        simStateRef.current.isMarried = true;

        const title = '결혼 성사 · 새로운 가족의 탄생';
        const desc = `${currentAge}세, 소중한 인연을 만나 결혼했습니다. 맞벌이로 월 가구 소득이 크게 증가했습니다. (-${formatKoreanMoney(cost)}원 지출, 물가 ${inflationFactor.toFixed(2)}배 반영)`;
        setTimelineLogs(prev => [{
            id: `manual-marry-${Date.now()}`,
            age: currentAge,
            year: new Date().getFullYear() + simYear,
            type: 'boom',
            title,
            desc,
            netWorth: newNet,
            rank: currentRank,
            tag: 'DECISION'
        }, ...prev]);
        if (addToast) addToast(`💍 [${title}] 완료! 맞벌이 소득 부스터 획득!`, 'success');
    };

    const handleManualHaveChild = () => {
        if (!isMarried) {
            if (addToast) addToast('⚠️ 먼저 결혼을 해야 아이를 낳을 수 있습니다.', 'warning');
            else alert('먼저 결혼을 해야 아이를 낳을 수 있습니다.');
            return;
        }
        const inflationFactor = Math.pow(1.025, simYear);
        const cost = Math.round(650 * inflationFactor); // 산후조리원 2주 및 초기 세팅비
        const newNet = Math.max(100, simNetWorth - cost);
        const nextChild = childrenCount + 1;
        childrenAgesRef.current.push(0); // 신생아 등록
        setSimNetWorth(newNet);
        setChildrenCount(nextChild);
        simStateRef.current.simNetWorth = newNet;
        simStateRef.current.childrenCount = nextChild;

        const title = `👶 ${nextChild}번째 자녀 출산 · 새로운 생명의 축복`;
        const desc = `${currentAge}세, 아이가 태어났습니다! 산후조리원 및 초기 육아용품 세팅비(-${formatKoreanMoney(cost)}원) 지출 후, 성장 단계별 양육비가 유기적으로 연동됩니다.`;
        setTimelineLogs(prev => [{
            id: `manual-child-${Date.now()}`,
            age: currentAge,
            year: new Date().getFullYear() + simYear,
            type: 'boom',
            title,
            desc,
            netWorth: newNet,
            rank: currentRank,
            tag: 'DECISION'
        }, ...prev]);
        if (addToast) addToast(`👶 [자녀 출산] 축하합니다! 새로운 가족이 생겼습니다.`, 'success');
    };

    const handleManualBuyHouse = () => {
        const inflationFactor = Math.pow(1.025, simYear);
        const loanAdd = Math.round((hasOwnHouse ? 20000 : 26000) * inflationFactor);
        const assetAdd = Math.round((hasOwnHouse ? 35000 : 42000) * inflationFactor);
        const newLoan = simLoan + loanAdd;
        const newGross = simGrossAssets + assetAdd;
        setSimLoan(newLoan);
        setSimGrossAssets(newGross);
        setHasOwnHouse(true);
        simStateRef.current.simLoan = newLoan;
        simStateRef.current.simGrossAssets = newGross;
        simStateRef.current.hasOwnHouse = true;

        const title = hasOwnHouse ? '상급지 핵심 아파트 갈아타기 완료' : '수도권 신축 아파트 등기 완료 (내 집 마련)';
        const desc = hasOwnHouse 
            ? `${currentAge}세, 상급지로 성공적으로 갈아타 부동산 자산 규모를 확장했습니다. (+${formatKoreanMoney(assetAdd)}원 자산 편입)`
            : `${currentAge}세, 주택담보대출을 일으켜 내 집 마련에 성공했습니다. 실물 부동산 자산가로 안착했습니다. (+${formatKoreanMoney(assetAdd)}원 자산 편입)`;
        setTimelineLogs(prev => [{
            id: `manual-house-${Date.now()}`,
            age: currentAge,
            year: new Date().getFullYear() + simYear,
            type: 'milestone',
            title,
            desc,
            netWorth: simNetWorth,
            rank: currentRank,
            tag: 'DECISION'
        }, ...prev]);
        if (addToast) addToast(`🏠 [${title}] 등기 완료!`, 'success');
    };

    // ==========================================
    // 6. 타이머 및 키보드 스페이스바 리스너
    // ==========================================
    useEffect(() => {
        if (isPlaying && simStage === 'running' && !activeChoiceModal) {
            const baseInterval = 5000;
            const intervalTime = Math.max(500, baseInterval / speedMultiplier);

            timerRef.current = setInterval(() => {
                stepOneYear();
            }, intervalTime);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPlaying, simStage, speedMultiplier, activeChoiceModal, stepOneYear]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (simStage !== 'running' || activeChoiceModal) return;
            if (e.code === 'Space') {
                e.preventDefault();
                stepOneYear();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [simStage, activeChoiceModal, stepOneYear]);

    // ==========================================
    // 7. SNS 카카오톡 클립보드 복사 핸들러
    // ==========================================
    const handleCopyReport = () => {
        const reportText = `[🏆 5천만 분의 1 · 인생 최종 자산 결산서]
━━━━━━━━━━━━━━━━━━━━━━━━━━
• 생존 나이: ${currentAge}세 (${endReason})
• 최종 순자산: ${formatKoreanMoney(simNetWorth)}원
• 대한민국 경제 계급: 상위 ${currentRank.allRank}% (동년배 상위 ${currentRank.ageRank}%)
• 최고 전성기: ${peakStats.age}세 (${formatKoreanMoney(peakStats.netWorth)}원 / 상위 ${peakStats.bestRank}%)
• 겪었던 최대 위기: ${worstCrisis.age}세 (${worstCrisis.event})
• FIRE(경제적 자유): ${fireAge ? `${fireAge}세 조기 은퇴 성공` : '정년 은퇴 완주'}
• 생애 잔여 대출: ${simLoan > 0 ? formatKoreanMoney(simLoan) + '원' : '0원 (전액 상환 완료)'}
• 후대 유산 승계: 약 ${formatKoreanMoney(Math.max(0, simNetWorth * 0.85))}원
━━━━━━━━━━━━━━━━━━━━━━━━━━
"당신은 대한민국 5,000만 명 중 상위 ${currentRank.allRank}% 안에 드는 밀도 높은 자산 인생을 완주했습니다."
👉 자산 플래너 (5천만 분의 1 인생 시뮬레이터)`;

        navigator.clipboard.writeText(reportText).then(() => {
            if (addToast) addToast('📋 최종 결산서가 클립보드에 복사되었습니다! 카톡이나 SNS에 공유해보세요.', 'success');
            else alert('최종 결산서가 클립보드에 복사되었습니다!');
        }).catch(() => {
            alert('클립보드 복사에 실패했습니다.');
        });
    };

    // ==========================================
    // 8. 렌더링 파트
    // ==========================================

    return (
        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden font-sans text-slate-100 animate-in fade-in duration-300">
            {/* 상단 브랜딩 헤더 */}
            <div className="p-4 sm:p-5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <span className="text-2xl sm:text-3xl">🇰🇷</span>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                                5천만 분의 1
                                <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                                    1 in 50 Million
                                </span>
                            </h2>
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                            통계청 가계금융복지조사 실데이터 기반 · 내 자산으로 살아보는 대한민국 상위 % 인생 시뮬레이터
                        </p>
                    </div>
                </div>
            </div>

            {/* ------------------------------------------ */}
            {/* 1단계: 출발 전 '대한민국 경제 주민등록증' (Setup) */}
            {/* ------------------------------------------ */}
            {simStage === 'setup' && (
                <div className="p-5 sm:p-8 space-y-6 max-w-3xl mx-auto">
                    {/* 주민등록증 스타일 카드 */}
                    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 border-2 border-indigo-500/30 rounded-2xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
                            <span className="text-xs font-black font-mono tracking-widest text-indigo-400 uppercase">
                                REPUBLIC OF KOREA · ECONOMIC ID CARD
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">가계금융복지조사 통계 기준</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                            {/* 좌측 증명사진 대체 아이콘 & 투자 성향 토글러 */}
                            <div className="md:col-span-4 flex flex-col items-center justify-center p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-center">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 flex items-center justify-center text-2xl mb-1 shadow-inner">
                                    {ARCHETYPE_LIST.find(a => a.name === selectedArchetype)?.icon || '👤'}
                                </div>
                                <span className="text-xs font-bold text-slate-300">주민등록 명의자</span>

                                {/* 클릭 시 투자 성향 순환 토글 버튼 */}
                                <button
                                    type="button"
                                    onClick={handleCycleArchetype}
                                    title="클릭하여 투자 성향을 변경할 수 있습니다"
                                    className={`mt-2 w-full py-1.5 px-2.5 rounded-lg border text-xs font-black transition-all cursor-pointer hover:scale-[1.03] active:scale-[0.97] flex items-center justify-center gap-1.5 shadow-sm ${
                                        ARCHETYPE_LIST.find(a => a.name === selectedArchetype)?.badge || 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    }`}
                                >
                                    <span>{ARCHETYPE_LIST.find(a => a.name === selectedArchetype)?.icon}</span>
                                    <span>{selectedArchetype}</span>
                                    <span className="text-[10px] opacity-70">🔁</span>
                                </button>

                                <p className="text-[10px] text-slate-400 mt-1.5 leading-tight px-1">
                                    {ARCHETYPE_LIST.find(a => a.name === selectedArchetype)?.detail}
                                </p>
                                <span className="text-[9px] text-indigo-400 font-medium mt-1">
                                    (클릭 시 성향 변경)
                                </span>
                            </div>

                            {/* 우측 인적사항 및 자산 진단 */}
                            <div className="md:col-span-8 space-y-4">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
                                        <div className="text-[10px] text-slate-400 font-medium">현재 순자산</div>
                                        <div className="text-base font-black text-emerald-400 font-mono mt-0.5">
                                            {formatKoreanMoney(initialUserData.netWorth)}원
                                        </div>
                                    </div>
                                    <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
                                        <div className="text-[10px] text-slate-400 font-medium">총자산 / 대출</div>
                                        <div className="text-xs font-bold text-slate-300 font-mono mt-0.5">
                                            {formatKoreanMoney(initialUserData.grossAssets)} / {formatKoreanMoney(initialUserData.totalLoan)}
                                        </div>
                                    </div>
                                    <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
                                        <div className="text-[10px] text-slate-400 font-medium">월 추정소득</div>
                                        <div className="text-sm font-bold text-indigo-300 font-mono mt-0.5">
                                            {initialUserData.salaryManwon}만원
                                        </div>
                                    </div>
                                </div>

                                {/* 나이 슬라이더 선택 (1초 입력) */}
                                <div className="p-3.5 bg-slate-950/80 rounded-xl border border-indigo-500/20 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                                            <span>🎂 시작 나이 설정</span>
                                            <span className="text-[10px] text-slate-500 font-normal">(변경 시 자동 기억)</span>
                                        </label>
                                        <span className="text-base font-black text-indigo-400 font-mono">{userAge}세</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="20" 
                                        max="55" 
                                        value={userAge} 
                                        onChange={(e) => setUserAge(parseInt(e.target.value, 10))}
                                        className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                                        <span>20세 사회초년생</span>
                                        <span>35세</span>
                                        <span>55세 은퇴직전</span>
                                    </div>
                                </div>

                                {/* 실데이터 기반 자동 감지 토글 (집/차/결혼/자녀/부모 배경) */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-1">
                                    {/* 주거 형태 */}
                                    <button 
                                        type="button"
                                        onClick={() => setSetupHouse(!setupHouse)}
                                        className={`p-2 rounded-lg border text-left transition-all ${
                                            setupHouse 
                                                ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-200' 
                                                : 'bg-slate-950/30 border-slate-800 text-slate-400'
                                        }`}
                                    >
                                        <div className="text-[10px] text-slate-500">주거 형태</div>
                                        <div className="text-xs font-bold mt-0.5">{setupHouse ? '🏠 자가 보유' : '🏢 무주택/전월세'}</div>
                                    </button>

                                    {/* 차량 보유 */}
                                    <button 
                                        type="button"
                                        onClick={() => setSetupCar(!setupCar)}
                                        className={`p-2 rounded-lg border text-left transition-all ${
                                            setupCar 
                                                ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-200' 
                                                : 'bg-slate-950/30 border-slate-800 text-slate-400'
                                        }`}
                                    >
                                        <div className="text-[10px] text-slate-500">차량 보유</div>
                                        <div className="text-xs font-bold mt-0.5">{setupCar ? '🚗 차량 보유' : '🚶 대중교통'}</div>
                                    </button>

                                    {/* 결혼 여부 */}
                                    <button 
                                        type="button"
                                        onClick={() => setSetupMarital(setupMarital === 'single' ? 'married' : 'single')}
                                        className={`p-2 rounded-lg border text-left transition-all ${
                                            setupMarital === 'married' 
                                                ? 'bg-rose-950/40 border-rose-500/50 text-rose-200' 
                                                : 'bg-slate-950/30 border-slate-800 text-slate-400'
                                        }`}
                                    >
                                        <div className="text-[10px] text-slate-500">결혼 여부</div>
                                        <div className="text-xs font-bold mt-0.5">{setupMarital === 'married' ? '💍 기혼' : '👤 미혼 (솔로)'}</div>
                                    </button>

                                    {/* 자녀 수 */}
                                    <button 
                                        type="button"
                                        onClick={() => setSetupChildren((setupChildren + 1) % 3)}
                                        className={`p-2 rounded-lg border text-left transition-all ${
                                            setupChildren > 0 
                                                ? 'bg-amber-950/40 border-amber-500/50 text-amber-200' 
                                                : 'bg-slate-950/30 border-slate-800 text-slate-400'
                                        }`}
                                    >
                                        <div className="text-[10px] text-slate-500">자녀 수</div>
                                        <div className="text-xs font-bold mt-0.5">👶 {setupChildren === 0 ? '자녀 없음' : `${setupChildren}명`}</div>
                                    </button>

                                    {/* 부모 배경 */}
                                    <button 
                                        type="button"
                                        onClick={() => setSetupParent(prev => prev === 'normal' ? 'wealthy' : prev === 'wealthy' ? 'burden' : 'normal')}
                                        title="클릭하여 부모님 배경을 변경할 수 있습니다"
                                        className={`p-2 rounded-lg border text-left transition-all ${
                                            setupParent === 'wealthy'
                                                ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                                                : setupParent === 'burden'
                                                ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                                                : 'bg-slate-950/30 border-slate-800 text-slate-400'
                                        }`}
                                    >
                                        <div className="text-[10px] text-slate-500">부모님 배경</div>
                                        <div className="text-xs font-bold mt-0.5">
                                            {setupParent === 'wealthy' ? '👑 자산가 지원' : setupParent === 'burden' ? '🤝 부양 부담' : '🏠 평범한 가정'}
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 시작 버튼 */}
                    <div className="flex justify-center pt-2">
                        <button
                            type="button"
                            onClick={handleStartSimulation}
                            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-sm tracking-wide shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                        >
                            🚀 대한민국 5,000만 명 속으로 뛰어들기 (시뮬레이션 시작)
                        </button>
                    </div>
                </div>
            )}

            {/* ------------------------------------------ */}
            {/* 2단계: 시뮬레이션 진행 화면 (Running) */}
            {/* ------------------------------------------ */}
            {simStage === 'running' && (
                <div className="p-4 sm:p-6 space-y-4">
                    {/* 상단 HUD 대시보드 바 */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 bg-slate-950/90 p-3.5 rounded-xl border border-slate-800">
                        {/* 1. 현재 나이 및 연차 */}
                        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                                <span>현재 나이 / 연차</span>
                                <span className="text-[9px] text-amber-400 font-mono font-bold">물가 {Math.pow(1.025, simYear).toFixed(2)}배</span>
                            </div>
                            <div className="text-lg font-black text-white font-mono mt-0.5 flex items-baseline gap-1.5">
                                <span>{currentAge}세</span>
                                <span className="text-[11px] text-indigo-400 font-normal">(+{simYear}년째)</span>
                            </div>
                        </div>

                        {/* 2. 실시간 순자산 */}
                        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                            <span className="text-[10px] text-slate-400 font-medium">실시간 순자산</span>
                            <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                                {formatKoreanMoney(simNetWorth)}원
                            </div>
                        </div>

                        {/* 3. 동년배 백분위 랭킹 */}
                        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                            <span className="text-[10px] text-slate-400 font-medium">동년배 순자산 순위</span>
                            <div className="text-lg font-black text-amber-400 font-mono mt-0.5">
                                상위 {currentRank.ageRank}%
                            </div>
                        </div>

                        {/* 4. 대한민국 전체 순위 */}
                        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                            <span className="text-[10px] text-slate-400 font-medium">전체 인구 순위</span>
                            <div className="text-base font-black text-indigo-300 font-mono mt-0.5">
                                상위 {currentRank.allRank}%
                            </div>
                        </div>

                        {/* 5. 부채 및 상태 */}
                        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 col-span-2 sm:col-span-1">
                            <span className="text-[10px] text-slate-400 font-medium">대출 / 상태</span>
                            <div className="text-xs font-bold text-slate-300 mt-0.5 flex items-center justify-between">
                                <span>빚: {simLoan > 0 ? formatKoreanMoney(simLoan) + '원' : '상환완료 0원'}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${fireAge ? 'bg-pink-900/50 text-pink-300 border border-pink-500/40' : isRetired ? 'bg-indigo-900/50 text-indigo-300' : 'bg-slate-800 text-slate-300'}`}>
                                    {fireAge ? '🔥 FIRE' : isRetired ? '🏖️ 은퇴' : '💼 근로중'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* [유저 능동적 인생 결단 패널] - 원하는 나이에 언제든 직접 실행 가능 */}
                    <div className="bg-gradient-to-r from-slate-950 via-indigo-950/30 to-slate-950 p-3 rounded-xl border border-indigo-500/30 shadow-lg">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                                <span className="text-indigo-400">⚡</span>
                                <span>인생 주요 결단 (원하는 나이에 언제든 직접 선택 가능)</span>
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleCycleArchetype}
                                    title="클릭하여 투자 성향을 언제든 실시간 변경할 수 있습니다"
                                    className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-all cursor-pointer hover:scale-[1.03] active:scale-[0.97] flex items-center gap-1 shadow-sm ${
                                        ARCHETYPE_LIST.find(a => a.name === selectedArchetype)?.badge || 'bg-indigo-950 text-indigo-300 border-indigo-500/40'
                                    }`}
                                >
                                    <span>{ARCHETYPE_LIST.find(a => a.name === selectedArchetype)?.icon}</span>
                                    <span>{selectedArchetype}</span>
                                    <span className="text-[9px] opacity-70">🔁 변경</span>
                                </button>
                                <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
                                    {isMarried ? '💍 기혼' : '👤 미혼'} · {childrenCount > 0 ? `👶 자녀 ${childrenCount}명` : '👶 무자녀'} · {hasOwnHouse ? '🏠 자가' : '🏢 무주택'} · {hasCar ? '🚗 오너' : '🚶 뚜벅이'}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {/* 1. 차량 결단 */}
                            <button
                                type="button"
                                onClick={handleManualBuyCar}
                                className="p-2 rounded-lg bg-slate-900/90 hover:bg-indigo-950/70 border border-slate-700/80 hover:border-indigo-400/60 text-left transition-all cursor-pointer group shadow-sm"
                            >
                                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                                    <span>{hasCar ? '신차 기변' : '첫 차 출고'}</span>
                                    <span className="text-[9px] text-indigo-400">직접 결단</span>
                                </div>
                                <div className="text-xs font-bold text-white group-hover:text-indigo-200 mt-0.5">
                                    🚗 {hasCar ? '신차/SUV 기변' : `자가용 출고 (-${formatKoreanMoney(Math.round(3200 * Math.pow(1.025, simYear)))}원)`}
                                </div>
                            </button>

                            {/* 2. 결혼 결단 */}
                            <button
                                type="button"
                                onClick={handleManualMarry}
                                disabled={isMarried}
                                className={`p-2 rounded-lg border text-left transition-all shadow-sm ${
                                    isMarried
                                        ? 'bg-slate-950/40 border-slate-800 text-slate-500 cursor-not-allowed'
                                        : 'bg-slate-900/90 hover:bg-pink-950/70 border-slate-700/80 hover:border-pink-400/60 text-white cursor-pointer group'
                                }`}
                            >
                                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                                    <span>결혼 여부</span>
                                    <span className="text-[9px] text-pink-400">{isMarried ? '완료' : '직접 결단'}</span>
                                </div>
                                <div className="text-xs font-bold mt-0.5">
                                    💍 {isMarried ? '결혼 완료 (맞벌이중)' : `결혼하기 (-${formatKoreanMoney(Math.round(4200 * Math.pow(1.025, simYear)))}원)`}
                                </div>
                            </button>

                            {/* 3. 자녀 출산 결단 (오직 기혼일 때만 활성화) */}
                            <button
                                type="button"
                                onClick={handleManualHaveChild}
                                disabled={!isMarried}
                                title={!isMarried ? '먼저 결혼을 해야 자녀를 낳을 수 있습니다' : '자녀 출산'}
                                className={`p-2 rounded-lg border text-left transition-all shadow-sm ${
                                    !isMarried
                                        ? 'bg-slate-950/40 border-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                                        : 'bg-slate-900/90 hover:bg-amber-950/70 border-slate-700/80 hover:border-amber-400/60 text-white cursor-pointer group'
                                }`}
                            >
                                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                                    <span>자녀 계획</span>
                                    <span className="text-[9px] text-amber-400">{isMarried ? '출산 결단' : '결혼 필요'}</span>
                                </div>
                                <div className="text-xs font-bold mt-0.5">
                                    👶 {isMarried ? `아이 낳기 (-${formatKoreanMoney(Math.round(650 * Math.pow(1.025, simYear)))}원)` : '아이 낳기 (기혼 시 가능)'}
                                </div>
                            </button>

                            {/* 4. 내 집 마련 결단 */}
                            <button
                                type="button"
                                onClick={handleManualBuyHouse}
                                className="p-2 rounded-lg bg-slate-900/90 hover:bg-emerald-950/70 border border-slate-700/80 hover:border-emerald-400/60 text-left transition-all cursor-pointer group shadow-sm"
                            >
                                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                                    <span>{hasOwnHouse ? '상급지 갈아타기' : '내 집 마련'}</span>
                                    <span className="text-[9px] text-emerald-400">직접 결단</span>
                                </div>
                                <div className="text-xs font-bold text-white group-hover:text-emerald-200 mt-0.5">
                                    🏠 {hasOwnHouse ? '상급지 핵심 이동' : '영끌 아파트 매수'}
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* [개선 1] 실시간 순자산 궤적 곡선(스파크라인) & 대한민국 백분위 사다리 게이지 */}
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                실시간 생애 자산 궤적곡선 (Life Asset Trajectory)
                            </span>
                            <span className="font-mono text-[11px] text-slate-500">
                                {userAge}세 ➔ {currentAge}세 궤적 ({historyPoints.length}개 년도)
                            </span>
                        </div>

                        {/* 미니 SVG 스파크라인 차트 */}
                        <div className="h-16 w-full bg-slate-900/60 rounded-lg border border-slate-800/80 p-1 relative overflow-hidden flex items-end">
                            {historyPoints.length > 1 ? (
                                (() => {
                                    const minVal = Math.min(...historyPoints.map(p => p.netWorth));
                                    const maxVal = Math.max(...historyPoints.map(p => p.netWorth), minVal + 1);
                                    const range = maxVal - minVal || 1;
                                    const width = 1000;
                                    const height = 55;

                                    const pointsStr = historyPoints.map((pt, idx) => {
                                        const x = (idx / (historyPoints.length - 1)) * width;
                                        const y = height - ((pt.netWorth - minVal) / range) * (height - 10) - 5;
                                        return `${x},${y}`;
                                    }).join(' ');

                                    const firstPoint = `0,${height}`;
                                    const lastPoint = `${width},${height}`;
                                    const areaStr = `${firstPoint} ${pointsStr} ${lastPoint}`;

                                    return (
                                        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                            <defs>
                                                <linearGradient id="sim-spark-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                                                    <stop offset="0%" stop-color="#10b981" stop-opacity="0.35"/>
                                                    <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"/>
                                                </linearGradient>
                                            </defs>
                                            <polygon points={areaStr} fill="url(#sim-spark-grad)" />
                                            <polyline points={pointsStr} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    );
                                })()
                            ) : (
                                <div className="text-center w-full text-[11px] text-slate-500">
                                    시뮬레이션이 진행되면 생애 자산 궤적 곡선이 실시간으로 그려집니다.
                                </div>
                            )}
                        </div>

                        {/* 대한민국 상위 % 사다리 게이지 */}
                        <div className="space-y-1 pt-1">
                            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                                <span>하위 100%</span>
                                <span>상위 50%</span>
                                <span>상위 20%</span>
                                <span>상위 10%</span>
                                <span>상위 5%</span>
                                <span className="text-amber-400 font-bold">상위 1% 👑</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden relative">
                                <div 
                                    className="h-full bg-gradient-to-r from-indigo-500 via-teal-400 to-amber-400 transition-all duration-500 rounded-full"
                                    style={{ width: `${Math.max(2, Math.min(100, 100 - currentRank.allRank))}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* 인터랙션 & 배속 컨트롤 바 */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 px-4 py-2.5 rounded-xl border border-slate-800/80 text-xs">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setIsPlaying(!isPlaying)}
                                className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                    isPlaying 
                                        ? 'bg-amber-600 hover:bg-amber-500 text-white' 
                                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                                }`}
                            >
                                <span>{isPlaying ? '⏸ 일시정지' : '▶ 계속 진행'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={stepOneYear}
                                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all cursor-pointer flex items-center gap-1"
                                title="스페이스바로도 1년씩 전진 가능합니다"
                            >
                                <span>+1년 넘기기</span>
                                <span className="text-[10px] text-slate-400 font-mono">(Space)</span>
                            </button>
                        </div>

                        {/* 우측 배속 조절기 */}
                        <div className="flex items-center gap-1.5 text-slate-400">
                            <span className="text-[11px] font-mono mr-1">배속:</span>
                            {[
                                { mult: 0.5, label: '0.5x' },
                                { mult: 1, label: '1x' },
                                { mult: 2, label: '2x' },
                                { mult: 5, label: '5x' }
                            ].map(item => (
                                <button
                                    key={item.mult}
                                    type="button"
                                    onClick={() => setSpeedMultiplier(item.mult)}
                                    className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                                        speedMultiplier === item.mult 
                                            ? 'bg-indigo-600 text-white' 
                                            : 'bg-slate-900 text-slate-400 hover:text-white'
                                    }`}
                                >
                                    {item.mult}x
                                </button>
                            ))}

                            <button
                                type="button"
                                onClick={() => {
                                    if (confirm('시뮬레이션을 초기화하고 처음 주민등록증 설정으로 돌아갈까요?')) {
                                        setIsPlaying(false);
                                        setSimStage('setup');
                                    }
                                }}
                                className="ml-2 text-slate-500 hover:text-rose-400 text-xs transition-colors cursor-pointer"
                            >
                                ↺ 리셋
                            </button>
                        </div>
                    </div>

                    {/* 타임라인 피드 (에디토리얼 신문/보고서 감성 피드) */}
                    <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-3 max-h-[460px] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <span>📜</span>
                                <span>실시간 인생 사건 기록 (Timeline Feed)</span>
                            </h3>
                            <span className="text-[10px] text-slate-500 font-mono">1년마다 새로운 통계 이벤트 발생</span>
                        </div>

                        {timelineLogs.map((log) => (
                            <div 
                                key={log.id} 
                                className={`p-3.5 rounded-xl border transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${
                                    log.type === 'crisis' 
                                        ? 'bg-rose-950/20 border-rose-500/40 text-rose-200' 
                                        : log.type === 'boom' 
                                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200' 
                                        : log.type === 'milestone' 
                                        ? 'bg-indigo-950/30 border-indigo-500/50 text-indigo-200' 
                                        : 'bg-slate-900/60 border-slate-800/80 text-slate-300'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-black font-mono px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-white">
                                            {log.age}세 ({log.year}년)
                                        </span>
                                        <span className="text-xs font-bold text-slate-100">{log.title}</span>
                                    </div>
                                    <span className="text-[11px] font-mono text-emerald-400 font-bold">
                                        {formatKoreanMoney(log.netWorth)}원
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed pl-1">
                                    {log.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ------------------------------------------ */}
            {/* 3단계: 인터랙티브 분기 선택 모달 (Choice Modal) */}
            {/* ------------------------------------------ */}
            {activeChoiceModal && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border-2 border-indigo-500/60 rounded-2xl p-5 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                            <span className="text-2xl">⚖️</span>
                            <div>
                                <h3 className="text-base font-black text-white">{activeChoiceModal.title}</h3>
                                <span className="text-[11px] text-indigo-400 font-mono">{activeChoiceModal.age}세 인생의 변곡점</span>
                            </div>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                            {activeChoiceModal.desc}
                        </p>

                        <div className="space-y-2.5 pt-2">
                            {activeChoiceModal.options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                        const result = opt.action ? opt.action() : { title: opt.label, desc: opt.detail };
                                        const currentNet = simStateRef.current.simNetWorth;

                                        const choiceLog = {
                                            id: `choice-${Date.now()}`,
                                            age: activeChoiceModal.age,
                                            year: new Date().getFullYear() + simYear,
                                            type: 'milestone',
                                            title: `[선택] ${result.title}`,
                                            desc: result.desc,
                                            netWorth: currentNet,
                                            tag: 'CHOICE'
                                        };
                                        setTimelineLogs(prev => [choiceLog, ...prev]);

                                        setActiveChoiceModal(null);
                                        setIsPlaying(true);
                                    }}
                                    className="w-full p-3.5 rounded-xl border border-slate-700 bg-slate-950/70 hover:bg-indigo-950/40 hover:border-indigo-500/60 text-left transition-all cursor-pointer group"
                                >
                                    <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                                        {opt.label}
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                                        {opt.detail}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ------------------------------------------ */}
            {/* 4단계: 엔딩 '인생 최종 자산 결산서' (Ended) */}
            {/* ------------------------------------------ */}
            {simStage === 'ended' && (
                <div className="p-5 sm:p-8 space-y-6 max-w-2xl mx-auto">
                    {/* 영수증/신문 기사 스타일 결산서 카드 */}
                    <div className="bg-slate-950 border-2 border-amber-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-5 text-center">
                        <div className="border-b border-slate-800 pb-4">
                            <span className="text-xs font-black font-mono tracking-widest text-amber-400 uppercase">
                                FINAL LIFETIME FINANCIAL REPORT · {currentAge} YEARS
                            </span>
                            <h2 className="text-2xl font-black text-white mt-1">
                                🏆 인생 최종 자산 결산서
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">
                                {endReason}
                            </p>
                        </div>

                        {/* 최종 결과 하이라이트 */}
                        <div className="grid grid-cols-2 gap-3 text-left">
                            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                                <div className="text-[10px] text-slate-400">최종 순자산</div>
                                <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
                                    {formatKoreanMoney(simNetWorth)}원
                                </div>
                            </div>

                            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                                <div className="text-[10px] text-slate-400">최종 경제 계급</div>
                                <div className="text-xl font-black text-amber-400 font-mono mt-0.5">
                                    상위 {currentRank.allRank}%
                                </div>
                            </div>
                        </div>

                        {/* 세부 라이프 통계 */}
                        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80 text-left space-y-2 text-xs">
                            <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                                <span className="text-slate-400">최고 자산 전성기:</span>
                                <span className="font-bold font-mono text-white">
                                    {peakStats.age}세 ({formatKoreanMoney(peakStats.netWorth)}원 / 상위 {peakStats.bestRank}%)
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                                <span className="text-slate-400">겪었던 최대 위기:</span>
                                <span className="font-bold text-rose-300">
                                    {worstCrisis.age}세 ({worstCrisis.event})
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                                <span className="text-slate-400">FIRE(경제적 자유):</span>
                                <span className={`font-bold ${fireAge ? 'text-pink-400' : 'text-slate-300'}`}>
                                    {fireAge ? `🎉 ${fireAge}세 조기 은퇴 달성` : '정년 은퇴 완주'}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                                <span className="text-slate-400">생애 최종 부채:</span>
                                <span className="font-bold text-emerald-400 font-mono">
                                    {simLoan > 0 ? formatKoreanMoney(simLoan) + '원' : '0원 (전액 상환 완료)'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">후대에 남겨진 유산:</span>
                                <span className="font-bold font-mono text-indigo-300">
                                    약 {formatKoreanMoney(Math.max(0, simNetWorth * 0.85))}원 (상속세 공제 후)
                                </span>
                            </div>
                        </div>

                        {/* 감성 문구 */}
                        <p className="text-xs text-slate-400 italic pt-2">
                            "당신은 대한민국 5,000만 명 중 상위 {currentRank.allRank}% 안에 드는 밀도 높은 자산 인생을 완주했습니다."
                        </p>

                        {/* [개선 3] 카카오톡/SNS 클립보드 복사 & 리셋 버튼 */}
                        <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                onClick={handleCopyReport}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-black text-xs tracking-wide shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                <span>📋</span>
                                <span>카톡·SNS 자랑용 복사하기</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setSimStage('setup');
                                }}
                                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all cursor-pointer"
                            >
                                ↺ 다른 선택으로 다시 살아보기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
