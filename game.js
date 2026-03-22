// game.js - 내 노후 뽑기 (저축률 기반 가챠 게임)
const { useState, useEffect, useRef } = React;

const ITEMS = {
    house: [
        { rank: 'SSR', name: '한강뷰 펜트하우스', icon: '🏙️', color: 'text-fuchsia-600 dark:text-fuchsia-400', bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/30', border: 'border-fuchsia-200 dark:border-fuchsia-800' },
        { rank: 'SR', name: '역세권 신축 아파트', icon: '🏢', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30', border: 'border-purple-200 dark:border-purple-800' },
        { rank: 'R', name: '구축 빌라 전세', icon: '🏚️', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800' },
        { rank: 'N', name: '자연인 텐트', icon: '⛺', color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700' }
    ],
    car: [
        { rank: 'SSR', name: '포르쉐 911', icon: '🏎️', color: 'text-fuchsia-600 dark:text-fuchsia-400', bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/30', border: 'border-fuchsia-200 dark:border-fuchsia-800' },
        { rank: 'SR', name: '제네시스 G80', icon: '🚘', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30', border: 'border-purple-200 dark:border-purple-800' },
        { rank: 'R', name: '중고 아반떼', icon: '🚗', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800' },
        { rank: 'N', name: '대중교통', icon: '🚇', color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700' }
    ],
    food: [
        { rank: 'SSR', name: '호텔 파인다이닝', icon: '🍣', color: 'text-fuchsia-600 dark:text-fuchsia-400', bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/30', border: 'border-fuchsia-200 dark:border-fuchsia-800' },
        { rank: 'SR', name: '프리미엄 한우', icon: '🥩', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30', border: 'border-purple-200 dark:border-purple-800' },
        { rank: 'R', name: '동네 국밥', icon: '🍲', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800' },
        { rank: 'N', name: '간헐적 단식(강제)', icon: '⏱️', color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700' }
    ]
};

// 10단계 세분화된 현실 반영 확률 (저축률 기반)
const getProbabilities = (savingsRate) => {
    if (savingsRate < 0)  return { SSR: 0,   SR: 0,   R: 5,  N: 95 }; // 적자 상태
    if (savingsRate < 10) return { SSR: 0.1, SR: 1.9, R: 18, N: 80 }; // 10% 미만
    if (savingsRate < 20) return { SSR: 0.2, SR: 3.8, R: 26, N: 70 }; // 20% 미만
    if (savingsRate < 30) return { SSR: 0.5, SR: 6.5, R: 43, N: 50 }; // 30% 미만
    if (savingsRate < 40) return { SSR: 1,   SR: 12,  R: 57, N: 30 }; // 40% 미만
    if (savingsRate < 50) return { SSR: 2,   SR: 20,  R: 63, N: 15 }; // 50% 미만
    if (savingsRate < 60) return { SSR: 4,   SR: 28,  R: 63, N: 5 };  // 60% 미만
    if (savingsRate < 70) return { SSR: 8,   SR: 37,  R: 54, N: 1 };  // 70% 미만 (N등급 거의 소멸)
    if (savingsRate < 80) return { SSR: 15,  SR: 45,  R: 40, N: 0 };  // 80% 미만 (N등급 완전 면제)
    return { SSR: 25, SR: 50, R: 25, N: 0 };                          // 80% 이상 극강의 짠돌이
};

const getTierName = (rate) => {
    if (rate < 0) return "🚨 파산 직전";
    if (rate < 10) return "💸 오늘만 사는 욜로족";
    if (rate < 20) return "🧚 텅장 요정 (스쳐지나감)";
    if (rate < 30) return "☕ 소비의 행복";
    if (rate < 40) return "📊 평범한 K-직장인";
    if (rate < 50) return "🌱 저축 새싹";
    if (rate < 60) return "🌿 본격 자산 증식러";
    if (rate < 70) return "🔥 파이어족 꿈나무";
    if (rate < 80) return "💎 절약왕";
    return "🤖 숨 쉬듯 돈 모으는 기계";
};

const rollGacha = (probabilities) => {
    const rand = Math.random() * 100;
    if (rand < probabilities.SSR) return 'SSR';
    if (rand < probabilities.SSR + probabilities.SR) return 'SR';
    if (rand < probabilities.SSR + probabilities.SR + probabilities.R) return 'R';
    return 'N';
};

window.RetirementGachaModal = ({ isOpen, onClose, savingsRate }) => {
    const [gameState, setGameState] = useState('intro'); // intro, playing, result
    const [results, setResults] = useState({});
    const [spinItems, setSpinItems] = useState({ house: 0, car: 0, food: 0 });
    const [teaser, setTeaser] = useState('운명의 슬롯이 돌아갑니다...');
    
    const spinIntervals = useRef({ house: null, car: null, food: null });
    const teaserInterval = useRef(null);

    const TEASERS = ["제발 펜트하우스...🙏", "무소유의 삶만은 피하자... 🧘", "영끌 가즈아! 🔥", "내 인생 떡상 기원 🚀", "인생은 한 방! 🎲", "강제 다이어트는 싫어... 😱"];

    const cleanupIntervals = () => {
        Object.values(spinIntervals.current).forEach(clearInterval);
        if (teaserInterval.current) clearInterval(teaserInterval.current);
    };

    useEffect(() => {
        if (!isOpen) { setGameState('intro'); cleanupIntervals(); }
        return cleanupIntervals;
    }, [isOpen]);

    const startGame = () => {
        setGameState('playing');
        setResults({});
        setTeaser(TEASERS[Math.floor(Math.random() * TEASERS.length)]);
        
        const probs = getProbabilities(savingsRate);
        const finalRanks = { house: rollGacha(probs), car: rollGacha(probs), food: rollGacha(probs) };
        
        // 티저 문구 롤링
        teaserInterval.current = setInterval(() => {
            setTeaser(TEASERS[Math.floor(Math.random() * TEASERS.length)]);
        }, 600);

        // 슬롯 롤링 애니메이션
        ['house', 'car', 'food'].forEach((category, idx) => {
            spinIntervals.current[category] = setInterval(() => {
                setSpinItems(prev => ({ ...prev, [category]: Math.floor(Math.random() * 4) }));
            }, 50); // 더 빠른 롤링

            // 점점 뜸을 들이는 쪼는 맛 (1.5초, 2.7초, 4.2초)
            setTimeout(() => {
                clearInterval(spinIntervals.current[category]);
                setResults(prev => ({ ...prev, [category]: ITEMS[category].find(i => i.rank === finalRanks[category]) }));
                if (category === 'food') {
                    clearInterval(teaserInterval.current);
                    setTimeout(() => setGameState('result'), 500);
                }
            }, 1500 + (idx * 1200) + (idx === 2 ? 300 : 0)); // 마지막에 살짝 더 뜸들임
        });
    };

    const getCommentary = () => {
        const ranks = Object.values(results).map(r => r?.rank);
        const ssr = ranks.filter(r => r === 'SSR').length;
        const sr = ranks.filter(r => r === 'SR').length;
        const r = ranks.filter(r => r === 'R').length;
        const n = ranks.filter(r => r === 'N').length;

        // 특별한 밈(Meme) 조합 팩폭 (가장 우선순위 높음)
        if (results.car?.rank === 'SSR' && results.house?.rank === 'N') return { t: "🚙 럭셔리 차박러", d: "포르쉐에서 자면 허리는 아파도 감성은 넘칩니다. 침낭은 챙기셨죠?", c: "text-pink-600" };
        if (results.food?.rank === 'SSR' && results.house?.rank === 'N') return { t: "🍽️ 자연 속 미식가", d: "집은 텐트여도 입맛은 미슐랭 3스타! 별빛 아래 파인다이닝을 즐기세요.", c: "text-orange-500" };
        if (results.house?.rank === 'SSR' && results.food?.rank === 'N') return { t: "🏰 궁궐 속 수도승", d: "펜트하우스에서 매일 간헐적 단식을 하십니다. 뷰 하나는 배부르겠네요.", c: "text-purple-500" };

        // 등급 기반 결과
        if (ssr === 3) return { t: "🎊 완벽한 0.1%의 노후", d: "당신의 저축 습관이 빛을 발했습니다. 돈 냄새가 진동을 하네요!", c: "text-fuchsia-500", isJackpot: true };
        if (ssr === 2) return { t: "💎 다이아수저의 삶", d: "이 정도면 동창회에서 계산서 독박을 써도 타격이 없습니다.", c: "text-fuchsia-600" };
        if (sr === 3) return { t: "🥂 여유로운 상류층", d: "어딜 가나 대우받는 삶! 밸런스가 아주 완벽합니다.", c: "text-purple-500" };
        if (ssr >= 1 && sr >= 1) return { t: "✨ 성공적인 노후", d: "자본주의의 단맛을 제대로 느끼고 계십니다. 훌륭한 방어전이네요.", c: "text-purple-400" };
        if (ssr === 1 || sr >= 2) return { t: "😎 중산층의 표본", d: "남부럽지 않게 살고 있습니다. 다만 사치는 조금 조심하세요.", c: "text-blue-500" };
        if (n === 3) return { t: "🧘 무소유 풀코스", d: "돈은 없지만 환경은 지켰습니다. 욕심을 버리면 마음은 편안해집니다.", c: "text-gray-500" };
        if (n >= 2) return { t: "🏃 강제 무병장수", d: "차비 아끼고 식비 아껴서 강제로 건강해질 운명입니다. 긍정적으로 생각하시죠!", c: "text-gray-600" };
        if (r >= 2) return { t: "😑 소박한 서민의 삶", d: "조금은 빠듯하지만 사람 사는 냄새가 납니다. 저축률을 살짝만 올려보세요.", c: "text-blue-400" };
        return { t: "� 롤러코스터 인생", d: "좋은 것과 나쁜 것이 뒤섞인 혼돈의 노후입니다. 운에만 맡기지 마세요!", c: "text-gray-600" };
    };

    if (!isOpen) return null;
    const probs = getProbabilities(savingsRate);
    const isJackpot = gameState === 'result' && getCommentary().isJackpot;
    const isDoom = savingsRate < 10; // 10% 미만 극악 확률
    const isRuined = gameState === 'result' && getCommentary().c.includes('red'); // 폐지 줍기 확정 상태

    return (
        <div className={`fixed inset-0 backdrop-blur-md flex items-center justify-center z-[200] p-4 overflow-hidden transition-colors duration-700 ${isDoom ? 'bg-red-950/80' : 'bg-black/70'}`}>
            {isJackpot && (
                <div className="absolute inset-0 pointer-events-none z-[210]">
                    <style>{`
                        @keyframes gacha-confetti { 0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(720deg); opacity: 0; } }
                        .gacha-drop { animation: gacha-confetti linear forwards; }
                    `}</style>
                    {Array.from({ length: 40 }).map((_, i) => (
                        <div key={i} className="absolute gacha-drop" style={{
                            left: `${Math.random() * 100}%`, 
                            top: `-10%`,
                            fontSize: `${Math.random() * 1.5 + 1}rem`,
                            animationDelay: `${Math.random() * 1.5}s`,
                            animationDuration: `${Math.random() * 2 + 2}s`
                        }}>
                            {['🎉', '💸', '✨', '💎', '🚀'][Math.floor(Math.random() * 5)]}
                        </div>
                    ))}
                </div>
            )}

            {/* 슬롯머신 & 지진 애니메이션 추가 */}
            <style>{`
                @keyframes slot-fast { 0% { transform: translateY(-40%); filter: blur(2px); opacity: 0.8; } 50% { transform: translateY(40%); filter: blur(2px); opacity: 1; } 100% { transform: translateY(-40%); filter: blur(2px); opacity: 0.8; } }
                .animate-slot-spin { animation: slot-fast 0.08s infinite linear; }
                @keyframes shake-hard { 0%, 100% { transform: translateX(0) translateY(0); } 20% { transform: translateX(-5px) translateY(2px) rotate(-1deg); } 40% { transform: translateX(5px) translateY(-2px) rotate(1deg); } 60% { transform: translateX(-5px) translateY(-2px); } 80% { transform: translateX(5px) translateY(2px) rotate(1deg); } }
                .animate-shake-hard { animation: shake-hard 0.4s ease-in-out; }
                @keyframes pop-in { 0% { transform: scale(0.3); opacity: 0; filter: brightness(2); } 60% { transform: scale(1.15); filter: brightness(1.5); } 100% { transform: scale(1); opacity: 1; filter: brightness(1); } }
                .animate-pop { animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
            `}</style>

            <div className={`bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border w-full max-w-lg overflow-hidden flex flex-col relative z-[205] duration-300
                ${isDoom ? 'border-red-500/50 shadow-[0_0_80px_rgba(220,38,38,0.4)]' : 'border-fuchsia-200 dark:border-fuchsia-900/50'}
                ${isRuined ? 'animate-shake-hard' : 'animate-in zoom-in'}
            `}>
                
                {/* 헤더 */}
                <div className={`p-4 border-b flex justify-between items-center ${isDoom ? 'bg-red-50/50 dark:bg-red-900/20 border-red-200 dark:border-red-900/30' : 'bg-fuchsia-50/50 dark:bg-fuchsia-900/10 border-fuchsia-100 dark:border-fuchsia-900/30'}`}>
                    <h3 className={`text-lg font-bold flex items-center gap-2 ${isDoom ? 'text-red-900 dark:text-red-100' : 'text-fuchsia-900 dark:text-fuchsia-100'}`}>🎰 내 노후 뽑기 (FIRE Gacha)</h3>
                    <button onClick={onClose} className={`text-xl ${isDoom ? 'text-red-400 hover:text-red-600' : 'text-fuchsia-400 hover:text-fuchsia-600'}`}>✕</button>
                </div>

                <div className="flex-1 p-6 flex flex-col justify-center relative overflow-hidden">
                    {gameState === 'intro' && (
                        <div className="text-center space-y-6">
                            <div className="text-6xl animate-bounce">🎲</div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">65세의 나는 어떻게 살고 있을까?</h2>
                            <p className={`text-sm leading-relaxed p-4 rounded-xl ${isDoom ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
                                현재 당신의 수입 대비 저축률은 <strong className="text-fuchsia-600 dark:text-fuchsia-400 text-lg">{savingsRate.toFixed(1)}%</strong> 입니다.<br/>
                                저축 칭호: <strong className="text-gray-900 dark:text-white">[{getTierName(savingsRate)}]</strong><br/>
                                당신의 저축률이 노후 가챠 확률을 직접적으로 조작합니다.
                            </p>
                            
                            {isDoom && (
                                <div className="text-xs font-bold text-white bg-red-600 p-2 rounded-lg animate-pulse">
                                    🚨 저축률 심각: 10% 미만! 강제 미니멀리스트가 될 확률이 매우 높습니다.
                                </div>
                            )}
                            
                            <div className={`grid grid-cols-4 gap-2 text-xs font-bold p-3 rounded-lg border ${isDoom ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-fuchsia-50 dark:bg-fuchsia-900/20 border-fuchsia-100 dark:border-fuchsia-800'}`}>
                                <div className="text-fuchsia-600 dark:text-fuchsia-400">SSR<br/>{probs.SSR}%</div>
                                <div className="text-purple-600 dark:text-purple-400">SR<br/>{probs.SR}%</div>
                                <div className="text-blue-600 dark:text-blue-400">R<br/>{probs.R}%</div>
                                <div className={isDoom ? 'text-red-600 dark:text-red-400 text-lg animate-pulse' : 'text-gray-500 dark:text-gray-400'}>N (소박)<br/>{probs.N}%</div>
                            </div>

                            {/* 카지노 스타일 3D 물리 버튼 */}
                            <div className="pt-2">
                                <button onClick={startGame} className="w-full relative group">
                                    <div className="absolute inset-0 bg-fuchsia-800 dark:bg-fuchsia-950 rounded-2xl transform translate-y-2 group-active:translate-y-0 transition-transform"></div>
                                    <div className="relative w-full py-4 bg-gradient-to-r from-fuchsia-500 to-purple-600 border-2 border-fuchsia-400/50 text-white rounded-2xl font-black text-xl shadow-[0_0_20px_rgba(217,70,239,0.4)] transform group-active:translate-y-2 transition-transform flex items-center justify-center gap-2">
                                        <span>🎰</span> 레버 당기기
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {(gameState === 'playing' || gameState === 'result') && (
                        <div className="flex flex-col items-center h-full space-y-6">
                            <div className="text-center">
                                <div className="text-sm font-bold text-gray-500 dark:text-gray-400">당신의 노후 인생</div>
                                <div className={`text-xl font-black mt-1 ${gameState === 'playing' ? 'text-fuchsia-500 dark:text-fuchsia-400 animate-pulse' : 'text-gray-900 dark:text-white'}`}>
                                    {gameState === 'playing' ? teaser : '가챠 결과 확정!'}
                                </div>
                            </div>

                            {/* 슬롯머신 전광판 디자인 (다크/네온 무드) */}
                            <div className="grid grid-cols-3 gap-3 w-full bg-gray-900 dark:bg-black p-4 rounded-2xl shadow-inner border-4 border-gray-800 dark:border-gray-700 relative">
                                {/* 슬롯머신 글래스 반사 효과 */}
                                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-xl"></div>
                                
                                {['house', 'car', 'food'].map(cat => {
                                    const isReady = !!results[cat];
                                    const item = isReady ? results[cat] : ITEMS[cat][spinItems[cat]];
                                    const isN = isReady && item.rank === 'N';
                                    
                                    return (
                                        <div key={cat} className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-150 relative overflow-hidden
                                            ${isReady ? (isN ? 'bg-gray-800 border-gray-600 grayscale opacity-80' : `${item.bg} ${item.border} shadow-[0_0_15px_rgba(255,255,255,0.2)] animate-pop z-10`) : 'bg-gray-800 border-gray-700'}`}>
                                            
                                            <div className={`text-sm font-black mb-2 px-2 py-0.5 rounded-full z-10 ${isReady ? (isN ? 'text-gray-500 bg-gray-700' : `${item.color} bg-white dark:bg-gray-900 shadow-md`) : 'text-gray-600 bg-gray-800'}`}>
                                                {isReady ? item.rank : '?'}
                                            </div>
                                            <div className={`text-5xl mb-3 h-14 flex items-center justify-center filter drop-shadow-lg ${!isReady ? 'animate-slot-spin opacity-80' : ''}`}>{item.icon}</div>
                                            <div className={`text-[11px] font-bold text-center h-8 flex items-center justify-center break-keep leading-tight z-10 ${isReady ? (isN ? 'text-gray-400' : 'text-gray-900 dark:text-white') : 'text-gray-600'}`}>
                                                {isReady ? item.name : 'Rolling'}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {gameState === 'result' && (
                                <div className="w-full animate-in slide-in-from-bottom-4 space-y-3 mt-4">
                                    <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-2xl text-center border border-gray-200 dark:border-gray-700">
                                        <h4 className={`text-lg font-black mb-2 ${getCommentary().c}`}>{getCommentary().t}</h4>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{getCommentary().d}</p>
                                    </div>
                                    
                                    <div className="flex gap-2 pt-2">
                                        <button onClick={onClose} className="flex-[1] py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-xl font-bold text-sm transition-colors">
                                            현실 복귀
                                        </button>
                                        <button onClick={startGame} className="flex-[2] py-3 bg-fuchsia-600 hover:bg-fuchsia-700 text-white shadow-lg shadow-fuchsia-500/30 rounded-xl font-bold text-sm transition-transform active:scale-95 flex items-center justify-center gap-1">
                                            <span>🔄</span> 다시 뽑기
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