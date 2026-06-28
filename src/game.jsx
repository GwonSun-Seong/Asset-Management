import React from 'react';
// game.jsx - 내 노후 인생 가챠 (종합 재무 스탯 기반 미래 라이프스타일 셔플)
const { useState, useEffect, useRef } = React;

const ITEMS = {
    house: [
        { rank: 'SSR', name: '한강뷰 펜트하우스', icon: '🏙️', color: 'text-fuchsia-600 dark:text-fuchsia-400', bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/30', border: 'border-fuchsia-200 dark:border-fuchsia-800' },
        { rank: 'SR', name: '역세권 신축 아파트', icon: '🏢', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30', border: 'border-purple-200 dark:border-purple-800' },
        { rank: 'R', name: '구축 빌라 전세', icon: '🏚️', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800' },
        { rank: 'N', name: '자연인 텐트', icon: '⛺', color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700' }
    ],
    car: [
        { rank: 'SSR', name: '포르쉐 911 카레라', icon: '🏎️', color: 'text-fuchsia-600 dark:text-fuchsia-400', bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/30', border: 'border-fuchsia-200 dark:border-fuchsia-800' },
        { rank: 'SR', name: '제네시스 G80', icon: '🚘', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30', border: 'border-purple-200 dark:border-purple-800' },
        { rank: 'R', name: '중고 아반떼 MD', icon: '🚗', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800' },
        { rank: 'N', name: '무제한 교통카드 & 도보', icon: '🚇', color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700' }
    ],
    food: [
        { rank: 'SSR', name: '호텔 파인다이닝', icon: '🍣', color: 'text-fuchsia-600 dark:text-fuchsia-400', bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/30', border: 'border-fuchsia-200 dark:border-fuchsia-800' },
        { rank: 'SR', name: '프리미엄 한우 생갈비', icon: '🥩', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30', border: 'border-purple-200 dark:border-purple-800' },
        { rank: 'R', name: '뜨끈한 동네 순대국밥', icon: '🍲', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800' },
        { rank: 'N', name: '간헐적 단식(강제 생존형)', icon: '⏱️', color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700' }
    ],
    healthcare: [
        { rank: 'SSR', name: 'VIP 실버타운 병동 케어', icon: '🏥', color: 'text-fuchsia-600 dark:text-fuchsia-400', bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/30', border: 'border-fuchsia-200 dark:border-fuchsia-800' },
        { rank: 'SR', name: '가정 간호사 & 프리미엄 검진', icon: '🩺', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30', border: 'border-purple-200 dark:border-purple-800' },
        { rank: 'R', name: '국민건강보험 실손 연동 치료', icon: '💊', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800' },
        { rank: 'N', name: '극기훈련 및 등산 위주 자가치유', icon: '🧘', color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700' }
    ],
    leisure: [
        { rank: 'SSR', name: '퍼스트클래스 크루즈 세계일주', icon: '🚢', color: 'text-fuchsia-600 dark:text-fuchsia-400', bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/30', border: 'border-fuchsia-200 dark:border-fuchsia-800' },
        { rank: 'SR', name: '동남아 골프 & 온천 리조트 패키지', icon: '✈️', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30', border: 'border-purple-200 dark:border-purple-800' },
        { rank: 'R', name: '넷플릭스 정주행 & PC방 투어', icon: '📺', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800' },
        { rank: 'N', name: '아파트 단지 산책 & 유튜브 시청', icon: '📱', color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700' }
    ]
};

// 1. 다면적 재무 건강 등급 점수(0~100점) 연산 함수
const calculateRetirementScore = (savingsRate, currentNetWorth, monthlySalary, monthlyExpense) => {
    const netWorth = Number(currentNetWorth) || 0;
    const salary = Number(monthlySalary) || 0;
    const expense = Number(monthlyExpense) || 150;
    
    const savingsScore = Math.min(45, Math.max(0, savingsRate * 0.6));
    const netWorthScore = Math.min(35, Math.max(0, Math.log10(netWorth + 1) * 7.5));
    const expenseRatio = expense / (salary || 150);
    const expenseScore = Math.min(20, Math.max(0, (1 - expenseRatio) * 25));
    
    return Math.round(savingsScore + netWorthScore + expenseScore);
};

// 2. 종합 재무 건강 점수 기준 뽑기 확률 분기
const getProbabilitiesByScore = (score) => {
    if (score < 15)  return { SSR: 0,   SR: 0,   R: 5,  N: 95 };
    if (score < 30)  return { SSR: 0.1, SR: 1.9, R: 18, N: 80 };
    if (score < 45)  return { SSR: 0.5, SR: 5.5, R: 34, N: 60 };
    if (score < 60)  return { SSR: 1.5, SR: 12.5, R: 51, N: 35 };
    if (score < 75)  return { SSR: 4.5, SR: 25.5, R: 55, N: 15 };
    if (score < 90)  return { SSR: 12,  SR: 43,  R: 44, N: 1 };
    return { SSR: 25, SR: 50, R: 25, N: 0 };
};

// 칭호 스펙 및 설명문 테이블
const TIERS = [
    { 
        minScore: 90, 
        maxScore: 100, 
        name: "👑 경제적 자유를 점령한 파이어족 황제", 
        desc: "재테크와 저축 습관이 최상위 0.1% 수준인 황제의 영역입니다. 65세 은퇴 시점 자산이 마를 기미 없이 무제한으로 뻗어나갑니다. 부유함이 철철 넘치는 초호화 노후를 보장받습니다.", 
        condition: "종합 재무 건강 점수 90점 ~ 100점 달성 시 획득" 
    },
    { 
        minScore: 75, 
        maxScore: 89, 
        name: "💎 은둔의 고단수 재테크 자산가", 
        desc: "소비 통제력이 타의 추종을 불허하며 차곡차곡 시드머니를 굴린 고수입니다. 은퇴 시점에 이미 안정적인 고액 자산가로 등극하여 여유롭고 기품 있는 실버 라이프를 영위합니다.", 
        condition: "종합 재무 건강 점수 75점 ~ 89점 달성 시 획득" 
    },
    { 
        minScore: 60, 
        maxScore: 74, 
        name: "🌱 스노우볼 굴리는 저축 성장 꿈나무", 
        desc: "종잣돈 불리기에 한창 탄력을 받은 건실한 상태입니다. 불필요한 사치를 지양하고 저축 비율을 영리하게 가꾸는 자산 증식러로, 중산층 이상의 무난하고 따뜻한 노후가 기대됩니다.", 
        condition: "종합 재무 건강 점수 60점 ~ 74점 달성 시 획득" 
    },
    { 
        minScore: 45, 
        maxScore: 59, 
        name: "📊 평범한 대한민국 K-직장인", 
        desc: "평균 소득 범위 안에서 지극히 상식적이고 무난한 재무 기조를 이어가는 표준적 궤도입니다. 조금만 소비를 조이고 저축으로 밀어붙이면 상위 칭호로 퀀텀점프할 가능성이 높습니다.", 
        condition: "종합 재무 건강 점수 45점 ~ 59점 달성 시 획득" 
    },
    { 
        minScore: 30, 
        maxScore: 44, 
        name: "☕ 소비 요정 & 금융 소외자", 
        desc: "소박한 소비의 유혹에 매달 타협하고 있는 상태입니다. 65세 은퇴 시점에 모아둔 자금이 아슬아슬하여, 미래의 노후 가챠를 돌릴 때 저등급 N(일반) 당첨 확률이 매우 높게 작용합니다.", 
        condition: "종합 재무 건강 점수 30점 ~ 44점 달성 시 획득" 
    },
    { 
        minScore: 15, 
        maxScore: 29, 
        name: "💸 통장 잔고 노후 시한부", 
        desc: "수입 대비 과도한 지출이 고착화되어 미래로 유예할 자산이 거의 마른 경고 상태입니다. 이대로 은퇴하면 은퇴 후 불과 수년 내에 자금 고갈(파산)을 겪게 되므로 빠른 비상대책이 시급합니다.", 
        condition: "종합 재무 건강 점수 15점 ~ 29점 달성 시 획득" 
    },
    { 
        minScore: 0, 
        maxScore: 14, 
        name: "🚨 오늘만 사는 욜로 파산러", 
        desc: "심각한 재정 적자 또는 지출 과잉으로 미래 자산 생존 나이가 극단적으로 짧은 상태입니다. 지금 당장 고정 지출 및 불필요한 낭비를 전면 차단하고 가계부를 전력 복구해야 안전합니다.", 
        condition: "종합 재무 건강 점수 0점 ~ 14점 달성 시 획득" 
    }
];

const getTierNameByScore = (score) => {
    const tier = TIERS.find(t => score >= t.minScore && score <= t.maxScore);
    return tier ? tier.name : "🚨 오늘만 사는 욜로 파산러";
};

const rollGacha = (probabilities) => {
    const rand = Math.random() * 100;
    if (rand < probabilities.SSR) return 'SSR';
    if (rand < probabilities.SSR + probabilities.SR) return 'SR';
    if (rand < probabilities.SSR + probabilities.SR + probabilities.R) return 'R';
    return 'N';
};

window.RetirementGachaModal = ({ isOpen, onClose, savingsRate, currentNetWorth = 0, monthlySalary = 0, monthlyExpense = 0 }) => {
    const [gameState, setGameState] = useState('intro'); // intro, playing, result
    const [results, setResults] = useState({});
    const [spinItems, setSpinItems] = useState({ house: 0, car: 0, food: 0, healthcare: 0, leisure: 0 });
    const [teaser, setTeaser] = useState('운명의 노후 가챠 스핀 대기 중...');
    const [isGuideOpen, setIsGuideOpen] = useState(false); // 칭호 해금 가이드 오버레이 상태
    const [guideIndex, setGuideIndex] = useState(0); // 도감 카드 슬라이더 인덱스
    
    const spinIntervals = useRef({ house: null, car: null, food: null, healthcare: null, leisure: null });
    const teaserInterval = useRef(null);

    const TEASERS = [
        "순자산 및 소비 통제력 대조 중... 📊",
        "종합 재무 건강 등급 산출 중... 🎰",
        "자산 생존 기간 계산 중... ⏳",
        "다이어트 식단 강제 확정 확률 계산 중... 🥩",
        "자연인 텐트 칩거 가능성 대조 중... ⛺",
        "도파민 터지는 미래 스탯 셔플 중... 🚀"
    ];

    const cleanupIntervals = () => {
        Object.values(spinIntervals.current).forEach(clearInterval);
        if (teaserInterval.current) clearInterval(teaserInterval.current);
    };

    const simScore = calculateRetirementScore(savingsRate, currentNetWorth, monthlySalary, monthlyExpense);
    const probs = getProbabilitiesByScore(simScore);
    const currentTierName = getTierNameByScore(simScore);

    useEffect(() => {
        if (isOpen && isGuideOpen) {
            const myIndex = TIERS.findIndex(t => simScore >= t.minScore && simScore <= t.maxScore);
            if (myIndex !== -1) {
                setGuideIndex(myIndex);
            }
        }
    }, [isOpen, isGuideOpen, simScore]);

    useEffect(() => {
        if (!isOpen) { setGameState('intro'); cleanupIntervals(); setIsGuideOpen(false); }
        return cleanupIntervals;
    }, [isOpen]);

    const simulateRetirement = () => {
        const netWorth = Number(currentNetWorth) || 0;
        const salary = Number(monthlySalary) || 0;
        const expense = Number(monthlyExpense) || 150;
        
        const monthlySavings = salary * (Math.max(0, savingsRate) / 100);
        const activeMonths = 240;
        let futureAssets = netWorth;
        for (let i = 0; i < activeMonths; i++) {
            futureAssets = (futureAssets + monthlySavings) * (1 + 0.04 / 12);
        }
        
        let survivalMonths = 0;
        let tempAssets = futureAssets;
        const retirementExpense = expense;
        
        if (monthlySavings <= 0 && netWorth <= 0) {
            survivalMonths = 0;
        } else if (tempAssets > retirementExpense * 600) {
            survivalMonths = 1200;
        } else {
            while (tempAssets > 0 && survivalMonths < 1200) {
                tempAssets = (tempAssets - retirementExpense) * (1 + 0.03 / 12);
                survivalMonths++;
            }
        }

        const survivalYears = Math.floor(survivalMonths / 12);
        const depletionAge = 65 + survivalYears;
        const survivalRate = Math.min(100, Math.max(5, Math.round((survivalMonths / 360) * 100)));

        return {
            futureAssets: Math.round(futureAssets),
            survivalMonths,
            survivalYears,
            depletionAge,
            survivalRate
        };
    };

    const startGame = () => {
        setGameState('playing');
        setResults({});
        setTeaser(TEASERS[Math.floor(Math.random() * TEASERS.length)]);
        
        const finalRanks = { 
            house: rollGacha(probs), 
            car: rollGacha(probs), 
            food: rollGacha(probs),
            healthcare: rollGacha(probs),
            leisure: rollGacha(probs)
        };
        
        teaserInterval.current = setInterval(() => {
            setTeaser(TEASERS[Math.floor(Math.random() * TEASERS.length)]);
        }, 500);

        ['house', 'car', 'food', 'healthcare', 'leisure'].forEach((category, idx) => {
            spinIntervals.current[category] = setInterval(() => {
                setSpinItems(prev => ({ ...prev, [category]: Math.floor(Math.random() * 4) }));
            }, 50);

            setTimeout(() => {
                clearInterval(spinIntervals.current[category]);
                setResults(prev => ({ ...prev, [category]: ITEMS[category].find(i => i.rank === finalRanks[category]) }));
                if (category === 'leisure') {
                    clearInterval(teaserInterval.current);
                    setTimeout(() => setGameState('result'), 500);
                }
            }, 1200 + (idx * 800));
        });
    };

    // [개선] 슬롯 아이템 결과 분포에 철저히 기반한 팩폭 코멘터리 생성기
    const getCommentary = () => {
        const sim = simulateRetirement();
        const ranks = Object.values(results).map(r => r?.rank || 'N');
        const ssr = ranks.filter(r => r === 'SSR').length;
        const sr = ranks.filter(r => r === 'SR').length;
        const r = ranks.filter(r => r === 'R').length;
        const n = ranks.filter(r => r === 'N').length;

        // 1. 자금은 100세 이상 든든한데 정작 슬롯은 R/N등급 소박 위주 (지독한 수도승형 자산가)
        if (sim.survivalRate >= 90 && (ssr + sr <= 1)) {
            return {
                t: "🏦 통장은 든든한 고독한 수도승",
                d: "최종 노후 자금은 약 " + sim.futureAssets.toLocaleString() + "만원으로 은퇴 파산 위험이 전혀 없습니다. 하지만 가챠는 온통 구축 빌라와 국밥, 자가치유뿐이군요. 돈은 많지만 쓰는 재미가 없는 짠돌이 노후입니다!",
                c: "text-indigo-600 dark:text-indigo-400"
            };
        }

        // 2. 자금은 시한부(파산 직전)인데 정작 슬롯은 SSR/SR 위주 호화 당첨 (화려한 파산 카푸어형)
        if (sim.survivalRate <= 30 && (ssr >= 2 || ssr + sr >= 3)) {
            return {
                t: "🏎️ 한강뷰 펜트하우스 카푸어",
                d: "가챠 슬롯은 포르쉐와 파인다이닝 등 럭셔리로 뽑혔으나, 정작 노후 자금이 빠르게 바닥나 " + sim.depletionAge + "세 무렵 완전 파산합니다. 화려함 뒤에 가려진 시한부 노후 상태입니다.",
                c: "text-red-500"
            };
        }

        // 3. 의식주 올 SSR 당첨 (완벽한 상위 0.1% 황제)
        if (ssr >= 4) {
            return {
                t: "👑 자본주의를 지배한 파이어족 황제",
                d: "최종 노후 자금(" + sim.futureAssets.toLocaleString() + "만원)과 한강뷰 펜트하우스, 포르쉐 911 등 최고의 라이프스타일 5성 스탯이 완벽하게 결합했습니다. 성공한 은퇴의 정석입니다.",
                c: "text-fuchsia-600 dark:text-fuchsia-400"
            };
        }

        // 4. SSR 1~2개 + SR 위주 (여유로운 중산층 실버라이프)
        if (ssr + sr >= 3) {
            return {
                t: "🚙 여유가 넘치는 웰빙 실버라이프",
                d: "의식주와 실버타운 의료 케어, 동남아 골프 레저의 밸런스가 조화롭습니다. 사치스럽지 않으면서도 품격과 안락함을 모두 잡은 모범적인 은퇴 생활입니다.",
                c: "text-purple-600 dark:text-purple-400"
            };
        }

        // 5. R등급 도배 (평범하고 소박한 서민형 노후)
        if (r >= 3) {
            return {
                t: "🍲 국밥과 아반떼가 함께하는 서민 노후",
                d: "구축 빌라 전세와 순대국밥, 넷플릭스 정주행이 주는 소박하고 친숙한 노후입니다. 자산 고갈 속도는 무난히 제어되나, 더 안락한 라이프스타일을 원한다면 재테크 설정을 점검해 보세요.",
                c: "text-blue-500 dark:text-blue-400"
            };
        }

        // 6. N등급 도배 (무소유 숲속의 자연인 상태)
        if (n >= 3) {
            return {
                t: "🧘 무소유 풀코스 등산 훈련소",
                d: "텐트에서 칩거하며 강제 단식을 하고, 건강은 등산 자가치유로 때우는 자연인 노후입니다. 돈을 저축하고 불리는 것만큼 적절히 분배하여 기초 생활 수준을 끌어올려야 합니다.",
                c: "text-gray-500 dark:text-gray-400"
            };
        }

        // 7. 기본 하이브리드 (단맛 쓴맛 믹스 혼돈의 노후)
        return {
            t: "🎲 믹스 하이브리드 노후",
            d: "포르쉐를 몰면서 텐트에서 자거나, 펜트하우스에서 강제 단식을 하는 혼돈의 언밸런스 스탯입니다. 최종 노후 자금(" + sim.futureAssets.toLocaleString() + "만원)을 균형 있게 사용할 계획이 권장됩니다.",
            c: "text-gray-700 dark:text-gray-400"
        };
    };

    const handlePrevGuide = () => {
        setGuideIndex(prev => (prev > 0 ? prev - 1 : TIERS.length - 1));
    };

    const handleNextGuide = () => {
        setGuideIndex(prev => (prev < TIERS.length - 1 ? prev + 1 : 0));
    };

    if (!isOpen) return null;
    const sim = simulateRetirement();
    const isJackpot = gameState === 'result' && sim.survivalRate >= 95;
    const isDoom = simScore < 30;
    
    const selectedGuideTier = TIERS[guideIndex];
    const isSelectedGuideActive = simScore >= selectedGuideTier.minScore && simScore <= selectedGuideTier.maxScore;

    return (
        <div className={"fixed inset-0 backdrop-blur-md flex items-center justify-center z-[200] p-4 overflow-hidden transition-colors duration-700 " + (isDoom ? 'bg-red-950/80' : 'bg-black/70')}>
            {isJackpot && (
                <div className="absolute inset-0 pointer-events-none z-[210]">
                    <style>{`
                        @keyframes gacha-confetti { 0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(720deg); opacity: 0; } }
                        .gacha-drop { animation: gacha-confetti linear forwards; }
                    `}</style>
                    {Array.from({ length: 45 }).map((_, i) => (
                        <div key={i} className="absolute gacha-drop" style={{
                            left: (Math.random() * 100) + "%", 
                            top: "-10%",
                            fontSize: (Math.random() * 1.5 + 1) + "rem",
                            animationDelay: (Math.random() * 1.5) + "s",
                            animationDuration: (Math.random() * 2 + 2) + "s"
                        }}>
                            {['🎉', '💸', '✨', '💎', '🚢', '🏰'][Math.floor(Math.random() * 6)]}
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                @keyframes slot-fast { 0% { transform: translateY(-30%); filter: blur(2px); opacity: 0.8; } 50% { transform: translateY(30%); filter: blur(2px); opacity: 1; } 100% { transform: translateY(-30%); filter: blur(2px); opacity: 0.8; } }
                .animate-slot-spin { animation: slot-fast 0.08s infinite linear; }
                @keyframes shake-hard { 0%, 100% { transform: translateX(0) translateY(0); } 20% { transform: translateX(-4px) translateY(2px) rotate(-0.5deg); } 40% { transform: translateX(4px) translateY(-2px) rotate(0.5deg); } 60% { transform: translateX(-4px) translateY(-2px); } 80% { transform: translateX(4px) translateY(2px) rotate(0.5deg); } }
                .animate-shake-hard { animation: shake-hard 0.4s ease-in-out; }
                @keyframes pop-in { 0% { transform: scale(0.3); opacity: 0; filter: brightness(2); } 60% { transform: scale(1.1); filter: brightness(1.3); } 100% { transform: scale(1); opacity: 1; filter: brightness(1); } }
                .animate-pop { animation: pop-in 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.2) forwards; }
            `}</style>

            <div className={"bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border w-full max-w-xl overflow-hidden flex flex-col relative z-[205] duration-300 " +
                (isDoom ? 'border-red-500/50 shadow-[0_0_80px_rgba(220,38,38,0.35)]' : 'border-fuchsia-200 dark:border-fuchsia-950/50') + " " +
                (gameState === 'result' && sim.survivalRate <= 15 ? 'animate-shake-hard' : 'animate-in zoom-in')
            }>
                
                {/* 헤더 */}
                <div className={"p-4 border-b flex justify-between items-center " + (isDoom ? 'bg-red-50/50 dark:bg-red-900/20 border-red-200 dark:border-red-900/30' : 'bg-fuchsia-50/50 dark:bg-fuchsia-900/10 border-fuchsia-100 dark:border-fuchsia-900/30')}>
                    <h3 className={"text-sm font-black flex items-center gap-2 " + (isDoom ? 'text-red-950 dark:text-red-100' : 'text-fuchsia-950 dark:text-fuchsia-100')}>
                        🎰 내 노후 인생 가챠 (Retirement Gacha)
                    </h3>
                    <button onClick={onClose} className={"text-xl font-bold " + (isDoom ? 'text-red-400 hover:text-red-650' : 'text-fuchsia-400 hover:text-fuchsia-600')}>✕</button>
                </div>

                <div className="flex-1 p-6 flex flex-col justify-center relative overflow-hidden">
                    {gameState === 'intro' && !isGuideOpen && (
                        <div className="text-center space-y-5">
                            <div className="text-5xl animate-bounce">🎰</div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white">은퇴 후 내 삶의 등급은 과연 몇 성?</h2>
                            
                            <div className={"text-left p-4 rounded-2xl text-xs space-y-2.5 leading-relaxed relative overflow-hidden " + (isDoom ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200' : 'bg-fuchsia-50/10 dark:bg-fuchsia-900/10 text-gray-600 dark:text-gray-300')}>
                                <div className="flex justify-between items-center border-b dark:border-gray-700 pb-2">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-450 dark:text-gray-500">현재 내 노후 칭호</span>
                                        <span className="text-gray-900 dark:text-white font-black text-sm tracking-tight">{currentTierName}</span>
                                    </div>
                                    <button 
                                        onClick={() => setIsGuideOpen(true)}
                                        className="text-[10px] px-2.5 py-1 bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-750 text-white rounded-lg font-bold shadow-md transition-all active:scale-95 flex items-center gap-1"
                                    >
                                        👑 칭호 가이드 도감
                                    </button>
                                </div>
                                <div className="text-[11px] text-gray-555 dark:text-gray-400 leading-relaxed text-center py-1">
                                    순자산, 저축액, 지출 비율을 연산한 종합 재무 점수(<strong className="text-gray-850 dark:text-gray-200">{simScore}점</strong>)가 가챠 확률을 결정합니다.<br/>
                                    운명의 스핀을 돌려 노후 5대 라이프스타일 획득에 도전하세요!
                                </div>
                            </div>
                            
                            {/* 뽑기 등급 확률 전광판 */}
                            <div className="grid grid-cols-4 gap-2 text-xs font-bold p-3.5 rounded-2xl border border-fuchsia-100 dark:border-fuchsia-900 bg-fuchsia-50/20 dark:bg-fuchsia-950/20 shadow-inner">
                                <div className="text-fuchsia-600 dark:text-fuchsia-400">
                                    <span className="block text-[10px] text-gray-400 mb-0.5">SSR 등급</span>
                                    <span className="text-sm font-black">{probs.SSR}%</span>
                                </div>
                                <div className="text-purple-600 dark:text-purple-400">
                                    <span className="block text-[10px] text-gray-400 mb-0.5">SR 등급</span>
                                    <span className="text-sm font-black">{probs.SR}%</span>
                                </div>
                                <div className="text-blue-600 dark:text-blue-400">
                                    <span className="block text-[10px] text-gray-400 mb-0.5">R 등급</span>
                                    <span className="text-sm font-black">{probs.R}%</span>
                                </div>
                                <div className={isDoom ? 'text-red-500 animate-pulse font-black' : 'text-gray-550 dark:text-gray-400'}>
                                    <span className="block text-[10px] text-gray-400 mb-0.5">N (일반)</span>
                                    <span className="text-sm font-black">{probs.N}%</span>
                                </div>
                            </div>

                            {isDoom && (
                                <div className="text-[10px] font-black text-white bg-red-650 py-1.5 px-3 rounded-lg animate-pulse">
                                    🚨 재정 파탄 위험: 종합 점수 30점 미만! 시한부 자산 파편 상태입니다.
                                </div>
                            )}
                            
                            <div className="pt-2">
                                <button onClick={startGame} className="w-full relative group">
                                    <div className="absolute inset-0 bg-fuchsia-800 dark:bg-fuchsia-950 rounded-2xl transform translate-y-2 group-active:translate-y-0 transition-transform"></div>
                                    <div className="relative w-full py-3.5 bg-gradient-to-r from-fuchsia-500 to-purple-600 border border-fuchsia-400/30 text-white rounded-2xl font-black text-sm shadow-[0_4px_15px_rgba(217,70,239,0.3)] transform group-active:translate-y-2 transition-transform flex items-center justify-center gap-1.5">
                                        🎰 노후 인생 가챠 돌리기 (SPIN)
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* [오버홀] 칭호 해금 가이드 - 슬라이더(캐러셀) 형태로 카드 한 장씩 조회 */}
                    {gameState === 'intro' && isGuideOpen && (
                        <div className="space-y-5 animate-in fade-in zoom-in-95 duration-250">
                            <div className="flex justify-between items-center pb-2 border-b dark:border-gray-800">
                                <h4 className="font-black text-sm text-gray-950 dark:text-white flex items-center gap-1.5">
                                    🏆 전설의 노후 칭호 도감
                                </h4>
                                <button 
                                    onClick={() => setIsGuideOpen(false)}
                                    className="text-xs px-2.5 py-1 bg-gray-150 dark:bg-gray-850 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-lg font-bold transition-all"
                                >
                                    ← 가챠로 복귀
                                </button>
                            </div>

                            {/* 슬라이더 카드 코어 */}
                            <div className="relative flex items-center justify-between py-2 px-1">
                                {/* 좌 화살표 */}
                                <button 
                                    onClick={handlePrevGuide}
                                    className="absolute -left-2 z-10 p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-855 dark:hover:bg-gray-800 text-gray-700 dark:text-white rounded-full shadow transition-all active:scale-90"
                                >
                                    &lt;
                                </button>

                                {/* 중앙 칭호 카드 */}
                                <div className={"flex-1 mx-9 p-5 rounded-2xl border transition-all duration-200 min-h-[190px] flex flex-col justify-between relative shadow-sm " +
                                    (isSelectedGuideActive 
                                        ? "bg-gradient-to-br from-fuchsia-50/70 via-white to-purple-50/70 dark:from-fuchsia-950/20 dark:to-purple-950/20 border-fuchsia-300 dark:border-fuchsia-800/80 ring-2 ring-fuchsia-400/20" 
                                        : "bg-gray-50/60 dark:bg-gray-855/60 border-gray-200 dark:border-gray-800 opacity-90")
                                }>
                                    
                                    {/* 보유 상태 뱃지 */}
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[9px] text-gray-450 dark:text-gray-500 font-bold">도감 인덱스: {guideIndex + 1} / 7</span>
                                        {isSelectedGuideActive ? (
                                            <span className="text-[9px] font-black text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-100 dark:bg-fuchsia-900/50 px-2 py-0.5 rounded-full shadow-sm animate-pulse border border-fuchsia-200 dark:border-fuchsia-800/40">
                                                보유 중 (Active) ✨
                                            </span>
                                        ) : (
                                            <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full border dark:border-gray-750">
                                                미획득 🔒
                                            </span>
                                        )}
                                    </div>

                                    {/* 칭호 타이틀 */}
                                    <div className="text-center py-1">
                                        <h3 className="font-black text-sm text-gray-900 dark:text-white tracking-tight break-keep">
                                            {selectedGuideTier.name}
                                        </h3>
                                    </div>

                                    {/* 칭호 설명 */}
                                    <p className="text-[11px] text-gray-650 dark:text-gray-300 text-center leading-relaxed py-2 break-keep min-h-[60px] flex items-center justify-center">
                                        {selectedGuideTier.desc}
                                    </p>

                                    {/* 해금 점수 및 조건 */}
                                    <div className="mt-2 pt-2 border-t dark:border-gray-800 text-center">
                                        <span className="text-[9px] text-gray-450 dark:text-gray-550 block mb-0.5">해금 필요 스탯 점수</span>
                                        <span className="text-[11px] font-black text-fuchsia-600 dark:text-fuchsia-400">
                                            {selectedGuideTier.condition}
                                        </span>
                                    </div>
                                </div>

                                {/* 우 화살표 */}
                                <button 
                                    onClick={handleNextGuide}
                                    className="absolute -right-2 z-10 p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-855 dark:hover:bg-gray-800 text-gray-700 dark:text-white rounded-full shadow transition-all active:scale-90"
                                >
                                    &gt;
                                </button>
                            </div>

                            <div className="text-[9px] text-center text-gray-400 leading-relaxed pt-1.5 border-t dark:border-gray-850">
                                💡 점수 팁: 저축률을 높이고, 순자산을 쌓고, 벌이 대비 지출을 줄일 때 재무 건강 종합 점수가 상승합니다.
                            </div>
                        </div>
                    )}

                    {(gameState === 'playing' || gameState === 'result') && (
                        <div className="flex flex-col items-center h-full space-y-6">
                            <div className="text-center">
                                <div className="text-xs font-bold text-gray-400 dark:text-gray-500">노후 라이프스타일 랜덤 셔플</div>
                                <div className={"text-base font-black mt-1 " + (gameState === 'playing' ? 'text-fuchsia-500 dark:text-fuchsia-400 animate-pulse' : 'text-gray-900 dark:text-white')}>
                                    {gameState === 'playing' ? teaser : '운명 가챠 결과 확정!'}
                                </div>
                            </div>

                            {/* 슬롯머신 계기판 (5개 지표 확장) */}
                            <div className="grid grid-cols-5 gap-2 w-full bg-gray-950 p-3 rounded-2xl shadow-inner border-4 border-gray-800 dark:border-gray-700 relative">
                                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-xl"></div>
                                
                                {['house', 'car', 'food', 'healthcare', 'leisure'].map(cat => {
                                    const isReady = !!results[cat];
                                    const item = isReady ? results[cat] : ITEMS[cat][spinItems[cat]];
                                    const isN = isReady && item.rank === 'N';
                                    const labels = { house: '주거', car: '이동', food: '식사', healthcare: '건강', leisure: '여가' };
                                    
                                    return (
                                        <div key={cat} className={"flex flex-col items-center p-2.5 rounded-lg border transition-all duration-150 relative overflow-hidden " +
                                            (isReady ? (isN ? 'bg-gray-900 border-gray-700 grayscale opacity-55' : (item.bg + " " + item.border + " shadow-[0_0_10px_rgba(255,255,255,0.15)] animate-pop z-10")) : 'bg-gray-900 border-gray-800')}>
                                            
                                            <div className={"text-[9px] font-black mb-1.5 px-1 rounded-full z-10 " + (isReady ? (isN ? 'text-gray-500 bg-gray-800' : (item.color + " bg-white dark:bg-gray-900 shadow-md")) : 'text-gray-750 bg-gray-950')}>
                                                {isReady ? item.rank : '?'}
                                            </div>
                                            <div className={"text-3xl mb-1.5 h-10 flex items-center justify-center filter drop-shadow " + (!isReady ? 'animate-slot-spin opacity-85' : '')}>{item.icon}</div>
                                            <div className="text-[8px] text-gray-500 font-bold mb-0.5">{labels[cat]}</div>
                                            <div className={"text-[9px] font-bold text-center h-6 flex items-center justify-center break-keep leading-tight z-10 " + (isReady ? (isN ? 'text-gray-400' : 'text-gray-900 dark:text-white') : 'text-gray-700')}>
                                                {isReady ? item.name : 'Rolling'}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {gameState === 'result' && (
                                <div className="w-full animate-in slide-in-from-bottom-4 space-y-4 mt-2">
                                    {/* 실질 지표 요약 카드 */}
                                    <div className="grid grid-cols-3 gap-2 bg-fuchsia-50/40 dark:bg-fuchsia-950/20 p-3 rounded-2xl border border-fuchsia-100/40 dark:border-fuchsia-900/30 text-center text-[10px]">
                                        <div className="border-r border-fuchsia-100/30 dark:border-fuchsia-900/30">
                                            <span className="text-gray-500 block mb-0.5">최종 노후 자금</span>
                                            <span className="font-bold text-gray-855 dark:text-white text-xs">{sim.futureAssets.toLocaleString()}만</span>
                                        </div>
                                        <div className="border-r border-fuchsia-100/30 dark:border-fuchsia-900/30">
                                            <span className="text-gray-500 block mb-0.5">자산 생존 나이</span>
                                            <span className="font-bold text-fuchsia-600 dark:text-fuchsia-400 text-xs">{sim.survivalYears > 50 ? '100세 이상' : sim.depletionAge + "세 파산" }</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block mb-0.5">생존력 (Survival)</span>
                                            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">{sim.survivalRate}%</span>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl text-center border border-gray-200 dark:border-gray-700">
                                        <h4 className={"text-sm font-black mb-1.5 " + getCommentary().c}>{getCommentary().t}</h4>
                                        <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed break-keep">{getCommentary().d}</p>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <button onClick={onClose} className="flex-[1] py-2.5 bg-gray-150 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xs transition-all border dark:border-gray-700">
                                            현실 복귀
                                        </button>
                                        <button onClick={startGame} className="flex-[2] py-2.5 bg-gradient-to-r from-fuchsia-500 to-purple-650 hover:from-fuchsia-600 hover:to-purple-750 text-white shadow-lg shadow-fuchsia-500/20 rounded-xl font-bold text-xs transition-transform active:scale-95 flex items-center justify-center gap-1">
                                            <span>🔄</span> 노후 가챠 다시 돌리기
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
