import React, { useState, useEffect, useRef } from 'react';

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

const calculateRetirementScore = (savingsRate, currentNetWorth, monthlySalary, monthlyExpense) => {
    const netWorth = Number(currentNetWorth) || 0;
    const salary = Number(monthlySalary) || 0;
    const expense = Number(monthlyExpense) || 150;
    
    const savingsScore = Math.min(45, Math.max(0, savingsRate * 0.6));
    const netWorthScore = Math.min(35, Math.max(0, Math.log10(netWorth + 1) * 7.5));
    const expenseRatio = salary > 0 ? (expense / salary) : 1;
    const expenseScore = Math.min(20, Math.max(0, (1 - expenseRatio) * 25));
    
    return Math.round(savingsScore + netWorthScore + expenseScore);
};

const getProbabilitiesByScore = (score) => {
    if (score < 15)  return { SSR: 0,   SR: 0,   R: 5,  N: 95 };
    if (score < 30)  return { SSR: 0.1, SR: 1.9, R: 18, N: 80 };
    if (score < 45)  return { SSR: 0.5, SR: 5.5, R: 34, N: 60 };
    if (score < 60)  return { SSR: 1.5, SR: 12.5, R: 51, N: 35 };
    if (score < 75)  return { SSR: 4.5, SR: 25.5, R: 55, N: 15 };
    if (score < 90)  return { SSR: 12,  SR: 43,  R: 44, N: 1 };
    return { SSR: 25, SR: 50, R: 25, N: 0 };
};

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

export default function RetirementGachaGame({
    monthlySalary = 0,
    currentAppData = null,
    currentCalculation = null,
    savingsRate = 0
}) {
    const currentNetWorth = currentCalculation?.currentNet || 0;
    const monthlyExpense = currentCalculation?.totalMonthlyExpense || 0;

    const [gameState, setGameState] = useState('intro'); // intro, playing, result
    const [results, setResults] = useState({});
    const [spinItems, setSpinItems] = useState({ house: 0, car: 0, food: 0, healthcare: 0, leisure: 0 });
    const [teaser, setTeaser] = useState('운명의 노후 가챠 스핀 대기 중...');
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [guideIndex, setGuideIndex] = useState(0);
    
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
        if (isGuideOpen) {
            const myIndex = TIERS.findIndex(t => simScore >= t.minScore && simScore <= t.maxScore);
            if (myIndex !== -1) {
                setGuideIndex(myIndex);
            }
        }
    }, [isGuideOpen, simScore]);

    useEffect(() => {
        return cleanupIntervals;
    }, []);

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

    const getCommentary = () => {
        const sim = simulateRetirement();
        const ranks = Object.values(results).map(r => r?.rank || 'N');
        const ssr = ranks.filter(r => r === 'SSR').length;
        const sr = ranks.filter(r => r === 'SR').length;
        const r = ranks.filter(r => r === 'R').length;
        const n = ranks.filter(r => r === 'N').length;

        if (sim.survivalRate >= 90 && (ssr + sr <= 1)) {
            return {
                t: "🏦 통장은 든든한 고독한 수도승",
                d: "최종 노후 자금은 약 " + sim.futureAssets.toLocaleString() + "만원으로 은퇴 파산 위험이 전혀 없습니다. 하지만 가챠는 온통 구축 빌라와 국밥, 자가치유뿐이군요. 돈은 많지만 쓰는 재미가 없는 짠돌이 노후입니다!",
                c: "text-indigo-600 dark:text-indigo-400"
            };
        }

        if (sim.survivalRate <= 30 && (ssr >= 2 || ssr + sr >= 3)) {
            return {
                t: "🏎️ 한강뷰 펜트하우스 카푸어",
                d: "가챠 슬롯은 포르쉐와 파인다이닝 등 럭셔리로 뽑혔으나, 정작 노후 자금이 빠르게 바닥나 " + sim.depletionAge + "세 무렵 완전 파산합니다. 화려함 뒤에 가려진 시한부 노후 상태입니다.",
                c: "text-red-500"
            };
        }

        if (ssr >= 4) {
            return {
                t: "👑 자본주의를 지배한 파이어족 황제",
                d: "최종 노후 자금(" + sim.futureAssets.toLocaleString() + "만원)과 한강뷰 펜트하우스, 포르쉐 911 등 최고의 라이프스타일 5성 스탯이 완벽하게 결합했습니다. 성공한 은퇴의 정석입니다.",
                c: "text-fuchsia-600 dark:text-fuchsia-400"
            };
        }

        if (ssr + sr >= 3) {
            return {
                t: "🚙 여유가 넘치는 웰빙 실버라이프",
                d: "의식주와 실버타운 의료 케어, 동남아 골프 레저의 밸런스가 조화롭습니다. 사치스럽지 않으면서도 품격과 안락함을 모두 잡은 모범적인 은퇴 생활입니다.",
                c: "text-purple-600 dark:text-purple-400"
            };
        }

        if (r >= 3) {
            return {
                t: "🍲 국밥과 아반떼가 함께하는 서민 노후",
                d: "구축 빌라 전세와 순대국밥, 넷플릭스 정주행이 주는 소박하고 친숙한 노후입니다. 자산 고갈 속도는 무난히 제어되나, 더 안락한 라이프스타일을 원한다면 재테크 설정을 점검해 보세요.",
                c: "text-blue-500 dark:text-blue-400"
            };
        }

        if (n >= 3) {
            return {
                t: "🧘 무소유 풀코스 등산 훈련소",
                d: "텐트에서 칩거하며 강제 단식을 하고, 건강은 등산 자가치유로 때우는 자연인 노후입니다. 돈을 저축하고 불리는 것만큼 적절히 분배하여 기초 생활 수준을 끌어올려야 합니다.",
                c: "text-gray-500 dark:text-gray-400"
            };
        }

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

    const sim = simulateRetirement();
    const isJackpot = gameState === 'result' && sim.survivalRate >= 95;
    const isDoom = simScore < 30;
    
    const selectedGuideTier = TIERS[guideIndex];
    const isSelectedGuideActive = simScore >= selectedGuideTier.minScore && simScore <= selectedGuideTier.maxScore;

    return (
        <div className="w-full max-w-4xl mx-auto py-2">
            <style>{`
                @keyframes gacha-confetti { 0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(720deg); opacity: 0; } }
                .gacha-drop { animation: gacha-confetti linear forwards; }
                @keyframes slot-fast { 0% { transform: translateY(-30%); filter: blur(2px); opacity: 0.8; } 50% { transform: translateY(30%); filter: blur(2px); opacity: 1; } 100% { transform: translateY(-30%); filter: blur(2px); opacity: 0.8; } }
                .animate-slot-spin { animation: slot-fast 0.08s infinite linear; }
                @keyframes shake-hard { 0%, 100% { transform: translateX(0) translateY(0); } 20% { transform: translateX(-4px) translateY(2px) rotate(-0.5deg); } 40% { transform: translateX(4px) translateY(-2px) rotate(0.5deg); } 60% { transform: translateX(-4px) translateY(-2px); } 80% { transform: translateX(4px) translateY(2px) rotate(0.5deg); } }
                .animate-shake-hard { animation: shake-hard 0.4s ease-in-out; }
                @keyframes pop-in { 0% { transform: scale(0.3); opacity: 0; filter: brightness(2); } 60% { transform: scale(1.1); filter: brightness(1.3); } 100% { transform: scale(1); opacity: 1; filter: brightness(1); } }
                .animate-pop { animation: pop-in 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.2) forwards; }
            `}</style>

            {isJackpot && (
                <div className="fixed inset-0 pointer-events-none z-[210]">
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

            <div className={"bg-white dark:bg-gray-900 rounded-3xl shadow-xl border w-full overflow-hidden flex flex-col relative duration-300 " +
                (isDoom ? 'border-red-500/50 shadow-[0_0_80px_rgba(220,38,38,0.2)]' : 'border-fuchsia-200 dark:border-fuchsia-950/50') + " " +
                (gameState === 'result' && sim.survivalRate <= 15 ? 'animate-shake-hard' : '')
            }>
                {/* 상단 헤더 전광판 */}
                <div className={"p-5 border-b flex justify-between items-center " + (isDoom ? 'bg-red-50/50 dark:bg-red-900/20 border-red-200 dark:border-red-900/30' : 'bg-gradient-to-r from-fuchsia-50/70 via-purple-50/40 to-indigo-50/50 dark:from-fuchsia-950/30 dark:to-indigo-950/30 border-fuchsia-100 dark:border-fuchsia-900/30')}>
                    <div>
                        <h3 className={"text-base font-black flex items-center gap-2 " + (isDoom ? 'text-red-950 dark:text-red-100' : 'text-fuchsia-950 dark:text-fuchsia-100')}>
                            🎰 내 노후 인생 가챠 (Retirement Lifestyle Gacha)
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            실제 내 저축률(<strong>{savingsRate.toFixed(1)}%</strong>)과 순자산(<strong>{Math.round(currentNetWorth).toLocaleString()}만원</strong>) 기반 라이프스타일 셔플
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setIsGuideOpen(!isGuideOpen)}
                            className="text-xs px-3 py-1.5 bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white rounded-xl font-bold shadow-md transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                        >
                            👑 칭호 도감 {isGuideOpen ? '닫기' : '보기'}
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {/* 칭호 도감 오버레이 */}
                    {isGuideOpen && (
                        <div className="mb-6 p-5 bg-fuchsia-50/30 dark:bg-fuchsia-950/20 border border-fuchsia-200 dark:border-fuchsia-800 rounded-2xl space-y-4 animate-in fade-in duration-200">
                            <div className="flex justify-between items-center pb-2 border-b dark:border-gray-800">
                                <h4 className="font-black text-sm text-gray-950 dark:text-white flex items-center gap-1.5">
                                    🏆 전설의 노후 칭호 도감 (7단계)
                                </h4>
                                <span className="text-xs text-gray-400">내 현재: <strong>{currentTierName}</strong></span>
                            </div>

                            <div className="relative flex items-center justify-between py-2 px-1">
                                <button 
                                    onClick={handlePrevGuide}
                                    className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-white rounded-full shadow transition-all active:scale-90 cursor-pointer"
                                >
                                    ◀
                                </button>

                                <div className={"flex-1 mx-4 p-5 rounded-2xl border transition-all duration-200 min-h-[160px] flex flex-col justify-between relative shadow-sm " +
                                    (isSelectedGuideActive 
                                        ? "bg-white dark:bg-gray-800 border-fuchsia-400 dark:border-fuchsia-700 ring-2 ring-fuchsia-400/20" 
                                        : "bg-gray-50/80 dark:bg-gray-850/80 border-gray-200 dark:border-gray-800 opacity-90")
                                }>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] text-gray-400 font-bold">도감 인덱스: {guideIndex + 1} / 7</span>
                                        {isSelectedGuideActive ? (
                                            <span className="text-[10px] font-black text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-100 dark:bg-fuchsia-900/50 px-2 py-0.5 rounded-full shadow-sm animate-pulse border border-fuchsia-200">
                                                현재 달성 ✨
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full border">
                                                미획득 🔒
                                            </span>
                                        )}
                                    </div>

                                    <div className="text-center py-1">
                                        <h3 className="font-black text-sm text-gray-900 dark:text-white">
                                            {selectedGuideTier.name}
                                        </h3>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed break-keep">
                                            {selectedGuideTier.desc}
                                        </p>
                                    </div>

                                    <div className="mt-2 pt-2 border-t dark:border-gray-800 text-center">
                                        <span className="text-[10px] font-black text-fuchsia-600 dark:text-fuchsia-400">
                                            {selectedGuideTier.condition}
                                        </span>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleNextGuide}
                                    className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-white rounded-full shadow transition-all active:scale-90 cursor-pointer"
                                >
                                    ▶
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 인트로 상태 */}
                    {gameState === 'intro' && (
                        <div className="text-center space-y-5 py-4">
                            <div className="text-6xl animate-bounce">🎰</div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white">은퇴 후 내 삶의 등급은 과연 몇 성?</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    현재 나의 저축액과 순자산으로 가동되는 노후 5대 라이프스타일 슬롯머신
                                </p>
                            </div>

                            <div className="max-w-lg mx-auto p-4 rounded-2xl bg-fuchsia-50/20 dark:bg-fuchsia-950/20 border border-fuchsia-100 dark:border-fuchsia-900/40 text-xs space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">현재 내 노후 칭호</span>
                                    <span className="font-black text-sm text-fuchsia-600 dark:text-fuchsia-400">{currentTierName}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">종합 재무 건강 점수</span>
                                    <span className="font-mono font-black text-base text-gray-900 dark:text-white">{simScore}점 / 100점</span>
                                </div>
                            </div>

                            {/* 뽑기 확률 전광판 */}
                            <div className="max-w-lg mx-auto grid grid-cols-4 gap-2 text-xs font-bold p-3.5 rounded-2xl border border-fuchsia-100 dark:border-fuchsia-900 bg-fuchsia-50/20 dark:bg-fuchsia-950/20 shadow-inner">
                                <div className="text-fuchsia-600 dark:text-fuchsia-400">
                                    <span className="block text-[10px] text-gray-400 mb-0.5">SSR 등급</span>
                                    <span className="text-base font-black">{probs.SSR}%</span>
                                </div>
                                <div className="text-purple-600 dark:text-purple-400">
                                    <span className="block text-[10px] text-gray-400 mb-0.5">SR 등급</span>
                                    <span className="text-base font-black">{probs.SR}%</span>
                                </div>
                                <div className="text-blue-600 dark:text-blue-400">
                                    <span className="block text-[10px] text-gray-400 mb-0.5">R 등급</span>
                                    <span className="text-base font-black">{probs.R}%</span>
                                </div>
                                <div className={isDoom ? 'text-red-500 animate-pulse font-black' : 'text-gray-500'}>
                                    <span className="block text-[10px] text-gray-400 mb-0.5">N (자연인)</span>
                                    <span className="text-base font-black">{probs.N}%</span>
                                </div>
                            </div>

                            {isDoom && (
                                <div className="max-w-lg mx-auto text-xs font-black text-white bg-red-600 py-2 px-3 rounded-xl animate-pulse">
                                    🚨 재정 파탄 위험: 종합 점수 30점 미만! 시한부 자산 상태입니다.
                                </div>
                            )}

                            <div className="pt-2 max-w-sm mx-auto">
                                <button onClick={startGame} className="w-full py-4 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-fuchsia-500/25 transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2">
                                    <span>🎰</span> 노후 인생 가챠 돌리기 (SPIN)
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 슬롯 롤링 및 결과 상태 */}
                    {(gameState === 'playing' || gameState === 'result') && (
                        <div className="flex flex-col items-center space-y-6">
                            <div className="text-center">
                                <div className="text-xs font-bold text-gray-400 dark:text-gray-500">노후 라이프스타일 5-SLOT</div>
                                <div className={"text-lg font-black mt-1 " + (gameState === 'playing' ? 'text-fuchsia-500 animate-pulse' : 'text-gray-900 dark:text-white')}>
                                    {gameState === 'playing' ? teaser : '운명 가챠 결과 확정!'}
                                </div>
                            </div>

                            {/* 슬롯머신 계기판 */}
                            <div className="grid grid-cols-5 gap-2.5 w-full bg-gray-950 p-4 rounded-3xl shadow-2xl border-4 border-gray-800 dark:border-gray-700 relative">
                                {['house', 'car', 'food', 'healthcare', 'leisure'].map(cat => {
                                    const isReady = !!results[cat];
                                    const item = isReady ? results[cat] : ITEMS[cat][spinItems[cat]];
                                    const isN = isReady && item.rank === 'N';
                                    const labels = { house: '주거', car: '이동', food: '식사', healthcare: '건강', leisure: '여가' };
                                    
                                    return (
                                        <div 
                                            key={cat} 
                                            className={"flex flex-col items-center p-3 rounded-2xl border transition-all duration-150 relative overflow-hidden min-h-[160px] justify-between " +
                                                (isReady 
                                                    ? (isN ? 'bg-gray-900 border-gray-700 grayscale opacity-60' : (item.bg + " " + item.border + " shadow-[0_0_15px_rgba(255,255,255,0.15)] animate-pop z-10")) 
                                                    : 'bg-gray-900 border-gray-800')
                                            }
                                        >
                                            <div className={"text-[10px] font-black px-2 py-0.5 rounded-full z-10 " + (isReady ? (isN ? 'text-gray-400 bg-gray-800' : (item.color + " bg-white dark:bg-gray-900 shadow-md")) : 'text-gray-700 bg-gray-950')}>
                                                {isReady ? item.rank : '?'}
                                            </div>
                                            <div className={"text-4xl my-2 flex items-center justify-center filter drop-shadow " + (!isReady ? 'animate-slot-spin opacity-85' : '')}>
                                                {item.icon}
                                            </div>
                                            <div className="text-[10px] text-gray-500 font-bold mb-0.5">{labels[cat]}</div>
                                            <div className={"text-[10px] font-bold text-center break-keep leading-tight z-10 " + (isReady ? (isN ? 'text-gray-400' : 'text-gray-900 dark:text-white') : 'text-gray-700')}>
                                                {isReady ? item.name : 'Rolling'}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* 결과 카드 */}
                            {gameState === 'result' && (
                                <div className="w-full space-y-4 animate-in slide-in-from-bottom-3 duration-300">
                                    <div className="grid grid-cols-3 gap-3 bg-fuchsia-50/40 dark:bg-fuchsia-950/20 p-4 rounded-2xl border border-fuchsia-100/40 dark:border-fuchsia-900/30 text-center text-xs">
                                        <div className="border-r border-fuchsia-100/40 dark:border-fuchsia-900/40">
                                            <span className="text-gray-500 block mb-0.5">65세 예상 노후 자금</span>
                                            <span className="font-bold text-gray-900 dark:text-white text-sm">{sim.futureAssets.toLocaleString()}만원</span>
                                        </div>
                                        <div className="border-r border-fuchsia-100/40 dark:border-fuchsia-900/40">
                                            <span className="text-gray-500 block mb-0.5">자산 생존 나이</span>
                                            <span className="font-bold text-fuchsia-600 dark:text-fuchsia-400 text-sm">{sim.survivalYears > 50 ? '100세 이상' : `${sim.depletionAge}세 파산`}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block mb-0.5">생존력 (Survival)</span>
                                            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{sim.survivalRate}%</span>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-2xl text-center border border-gray-200 dark:border-gray-700">
                                        <h4 className={"text-base font-black mb-1.5 " + getCommentary().c}>{getCommentary().t}</h4>
                                        <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed break-keep max-w-xl mx-auto">{getCommentary().d}</p>
                                    </div>

                                    <div className="flex gap-3 max-w-md mx-auto pt-2">
                                        <button 
                                            onClick={() => setGameState('intro')} 
                                            className="flex-1 py-3 bg-gray-150 hover:bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-bold text-xs transition-all cursor-pointer"
                                        >
                                            처음으로
                                        </button>
                                        <button 
                                            onClick={startGame} 
                                            className="flex-2 py-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-fuchsia-500/25 transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                                        >
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
}
