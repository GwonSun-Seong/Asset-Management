import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';

/**
 * 🏎️ AssetGhostRacing (자산 고스트 레이싱 - 아케이드 하이퍼 드라이브)
 * 
 * - 실제 주행감(Sense of Speed): 무한 스크롤 아스팔트 트랙, 고속 연석, 스피드 라인, 서스펜션 진동
 * - 정교한 F1/고카트 커스텀 벡터 그래픽: 회전 휠, 백파이어 화염 파티클, 헤드라이트 빔, 리어 스포일러
 * - 고스트 홀로그램 셰이더: 반투명 글리치, 네온 와이어프레임, 에테리얼 잔상
 * - 스페이스바 / 버튼 연동 [🔥 NITRO BOOST] 시스템 (부스터 폭주, 스크린 셰이크, 터보 사운드)
 * - 라이벌 1:1 클로즈업 드래그 배틀 뷰 & 8대 종합 서킷 뷰
 * - Cold-start 원칙 엄수 (실제 히스토리만 매칭, 원클릭 체험 모드 지원)
 */

// Web Audio 사운드 (음소거 처리)
const playArcadeSound = () => {};


/**
 * 🏎️ 고화질 레이싱 카트 벡터 컴포넌트 (Detailed SVG Kart)
 * - 전면(우측) 노즈콘, 프론트 윙, 드라이버 헬멧, 스티어링, 리어 윙
 * - 실제 회전하는 휠 애니메이션
 * - 듀얼 백파이어 화염 파티클 (부스터 시 폭발적 확장)
 * - 전방 프로젝션 헤드라이트 빔
 */
const KartGraphic = ({
    color = '#ef4444',
    isPlayer = false,
    isGhost = false,
    isAth = false,
    isBoosting = false,
    name = '',
    scale = 1
}) => {
    return (
        <div className={`relative select-none pointer-events-none ${isPlayer && isBoosting ? 'animate-kart-shake' : 'animate-suspension'}`} style={{ transform: `scale(${scale})` }}>
            {/* 전방 라이트 프로젝션 빔 (우측으로 투사) */}
            <div 
                className="absolute left-[110px] top-[14px] w-28 h-10 pointer-events-none opacity-40 blur-xs"
                style={{
                    background: isGhost 
                        ? 'radial-gradient(ellipse at left, rgba(6,182,212,0.6) 0%, rgba(6,182,212,0) 80%)'
                        : isAth
                        ? 'radial-gradient(ellipse at left, rgba(245,158,11,0.7) 0%, rgba(245,158,11,0) 80%)'
                        : 'radial-gradient(ellipse at left, rgba(255,255,255,0.85) 0%, rgba(59,130,246,0) 80%)'
                }}
            />

            {/* 백파이어 부스터 화염 (좌측 머플러에서 분출) */}
            <div className={`absolute -left-7 top-[16px] flex items-center transition-all ${isBoosting ? 'scale-150 -left-11' : ''}`}>
                <div 
                    className={`w-7 h-4 rounded-l-full blur-2xs ${
                        isBoosting 
                            ? 'bg-gradient-to-l from-yellow-300 via-rose-500 to-indigo-500 animate-flame-intense' 
                            : isGhost
                            ? 'bg-gradient-to-l from-cyan-300 via-blue-500 to-transparent animate-flame'
                            : isAth
                            ? 'bg-gradient-to-l from-yellow-200 via-amber-500 to-transparent animate-flame'
                            : 'bg-gradient-to-l from-yellow-300 via-orange-500 to-transparent animate-flame'
                    }`}
                />
            </div>

            {/* 카트 본체 SVG (좌->우 주행, 가로 130px, 세로 50px) */}
            <svg 
                width="130" 
                height="50" 
                viewBox="0 0 130 50" 
                className={`overflow-visible filter ${
                    isGhost 
                        ? 'drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] opacity-75' 
                        : isAth
                        ? 'drop-shadow-[0_0_12px_rgba(245,158,11,0.9)]'
                        : 'drop-shadow-[0_0_10px_rgba(239,68,68,0.7)]'
                }`}
            >
                <defs>
                    <linearGradient id={`kartGrad_${color.replace('#','')}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={isGhost ? '#0891b2' : color} stopOpacity={isGhost ? 0.65 : 1} />
                        <stop offset="60%" stopColor={isGhost ? '#06b6d4' : isAth ? '#fbbf24' : '#f43f5e'} stopOpacity={isGhost ? 0.75 : 1} />
                        <stop offset="100%" stopColor={isGhost ? '#67e8f9' : '#ffffff'} stopOpacity={isGhost ? 0.85 : 1} />
                    </linearGradient>
                    <linearGradient id="spoilerGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#1e293b" />
                        <stop offset="100%" stopColor="#475569" />
                    </linearGradient>
                </defs>

                {/* 차체 섀시 (Aerodynamic Body) */}
                <path 
                    d="M 12 36 L 25 36 L 38 28 L 65 24 L 90 28 L 122 36 L 126 39 L 10 39 Z" 
                    fill={`url(#kartGrad_${color.replace('#','')})`}
                    stroke={isGhost ? '#22d3ee' : '#0f172a'}
                    strokeWidth="1.5"
                />

                {/* 프론트 윙 (우측 앞 범퍼 스포일러) */}
                <path 
                    d="M 115 35 L 128 35 L 127 41 L 114 41 Z" 
                    fill="url(#spoilerGrad)"
                    stroke="#0f172a"
                    strokeWidth="1"
                />
                <circle cx="127" cy="38" r="2" fill={isGhost ? '#67e8f9' : '#38bdf8'} />

                {/* 콕핏 & 윈드실드 */}
                <path 
                    d="M 52 24 L 68 15 L 78 24 Z" 
                    fill={isGhost ? 'rgba(34,211,238,0.4)' : 'rgba(15,23,42,0.85)'}
                    stroke={isGhost ? '#22d3ee' : '#38bdf8'}
                    strokeWidth="1"
                />

                {/* 드라이버 헬멧 */}
                <circle 
                    cx="60" 
                    cy="18" 
                    r="6.5" 
                    fill={isGhost ? '#0891b2' : isAth ? '#f59e0b' : isPlayer ? '#ef4444' : '#64748b'}
                    stroke="#ffffff"
                    strokeWidth="1"
                />
                {/* 헬멧 바이저 (눈 반사) */}
                <path 
                    d="M 61 17 Q 66 17 66 20 Q 61 21 61 17 Z" 
                    fill="#38bdf8"
                />

                {/* 리어 윙 (대형 다운포스 스포일러 - 좌측 후방) */}
                <rect x="8" y="16" width="4" height="18" fill="#334155" />
                <rect x="18" y="18" width="4" height="16" fill="#334155" />
                <path 
                    d="M 5 14 L 25 14 L 23 18 L 3 18 Z" 
                    fill={isAth ? '#f59e0b' : 'url(#spoilerGrad)'}
                    stroke="#ffffff"
                    strokeWidth="0.8"
                />
                {isAth && (
                    <text x="11" y="13" fontSize="8" fill="#fbbf24">👑</text>
                )}

                {/* 사이드 레이싱 넘버 데칼 */}
                <circle cx="82" cy="33" r="5" fill="#ffffff" stroke="#0f172a" strokeWidth="0.8" />
                <text x="82" y="36" fontSize="7" fontWeight="900" fill="#0f172a" textAnchor="middle">
                    {isPlayer ? '7' : isAth ? '★' : 'G'}
                </text>

                {/* 🛞 회전하는 리어 휠 (좌측 바퀴) */}
                <g className="animate-spin-fast origin-[25px_38px]">
                    <circle cx="25" cy="38" r="9" fill="#0f172a" stroke="#334155" strokeWidth="2" />
                    <circle cx="25" cy="38" r="5" fill={isAth ? '#fbbf24' : '#94a3b8'} />
                    <line x1="25" y1="29" x2="25" y2="47" stroke="#0f172a" strokeWidth="1.5" />
                    <line x1="16" y1="38" x2="34" y2="38" stroke="#0f172a" strokeWidth="1.5" />
                    <circle cx="25" cy="38" r="2" fill="#e2e8f0" />
                </g>

                {/* 🛞 회전하는 프론트 휠 (우측 바퀴) */}
                <g className="animate-spin-fast origin-[105px_38px]">
                    <circle cx="105" cy="38" r="8" fill="#0f172a" stroke="#334155" strokeWidth="2" />
                    <circle cx="105" cy="38" r="4.5" fill={isAth ? '#fbbf24' : '#94a3b8'} />
                    <line x1="105" y1="30" x2="105" y2="46" stroke="#0f172a" strokeWidth="1.5" />
                    <line x1="97" y1="38" x2="113" y2="38" stroke="#0f172a" strokeWidth="1.5" />
                    <circle cx="105" cy="38" r="1.8" fill="#e2e8f0" />
                </g>
            </svg>
        </div>
    );
};

export default function AssetGhostRacing({
    assetHistory = [],
    currentNet = 0,
    currentGross = 0,
    formatNumber = (n) => Number(n).toLocaleString(),
    displayMode = 'amount',
    isDarkMode = false,
    addToast = () => {}
}) {
    // 뷰 모드: 'circuit' (8대 동시 멀티레인 트랙) | 'duel' (라이벌 1:1 드래그 추월 배틀)
    const [viewMode, setViewMode] = useState('circuit');
    // 레이스 리그: 'all' | 'sprint' | 'gp' | 'championship' | 'legacy'
    const [raceMode, setRaceMode] = useState('all');
    // 지표 기준: 'net' (순자산) | 'gross' (총자산)
    const [metricType, setMetricType] = useState('net');
    // 부스터(NITRO) 활성 상태
    const [isNitroActive, setIsNitroActive] = useState(false);
    const [nitroGauge, setNitroGauge] = useState(100);
    // 주행 상태
    const [isRacing, setIsRacing] = useState(true);
    const [speedKmH, setSpeedKmH] = useState(185);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [overtakeBanner, setOvertakeBanner] = useState(null);

    // 키보드 스페이스바 부스터 리스너
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space' && !e.repeat) {
                // 입력창 내 스페이스바 방지
                if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
                e.preventDefault();
                triggerNitro();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [nitroGauge]);

    // 부스터 발동 로직
    const triggerNitro = useCallback(() => {
        if (isNitroActive || nitroGauge < 25) return;
        setIsNitroActive(true);
        setNitroGauge(prev => Math.max(0, prev - 40));
        setSpeedKmH(prev => prev + 75);
        playArcadeSound('boost');

        setTimeout(() => {
            setIsNitroActive(false);
            setSpeedKmH(185);
        }, 1200);
    }, [isNitroActive, nitroGauge]);

    // 니트로 게이지 자동 충전 루프
    useEffect(() => {
        const interval = setInterval(() => {
            setNitroGauge(prev => Math.min(100, prev + 3));
        }, 300);
        return () => clearInterval(interval);
    }, []);

    // 오늘 날짜 KST
    const todayStr = useMemo(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }, []);

    // 고스트 매칭 및 랭킹 정렬 알고리즘 (Cold Start 원칙)
    const racers = useMemo(() => {
        const nowMs = Date.now();
        const oneDayMs = 86400000;
        let historySource = [...assetHistory];

        if (isDemoMode) {
            const baseNet = currentNet > 0 ? currentNet : 12000;
            const baseGross = currentGross > 0 ? currentGross : 18000;
            historySource = [
                { date: '7일 전 (데모)', timestamp: nowMs - 7 * oneDayMs, netWorth: Math.round(baseNet * 0.98), grossWorth: Math.round(baseGross * 0.98) },
                { date: '14일 전 (데모)', timestamp: nowMs - 14 * oneDayMs, netWorth: Math.round(baseNet * 0.95), grossWorth: Math.round(baseGross * 0.95) },
                { date: '30일 전 (데모)', timestamp: nowMs - 30 * oneDayMs, netWorth: Math.round(baseNet * 0.91), grossWorth: Math.round(baseGross * 0.92) },
                { date: '60일 전 (데모)', timestamp: nowMs - 60 * oneDayMs, netWorth: Math.round(baseNet * 0.86), grossWorth: Math.round(baseGross * 0.87) },
                { date: '90일 전 (데모)', timestamp: nowMs - 90 * oneDayMs, netWorth: Math.round(baseNet * 0.80), grossWorth: Math.round(baseGross * 0.82) },
                { date: '180일 전 (데모)', timestamp: nowMs - 180 * oneDayMs, netWorth: Math.round(baseNet * 0.72), grossWorth: Math.round(baseGross * 0.74) },
                { date: '1년 전 (데모)', timestamp: nowMs - 365 * oneDayMs, netWorth: Math.round(baseNet * 0.60), grossWorth: Math.round(baseGross * 0.62) },
                { date: '역대 최고점 (데모)', timestamp: nowMs - 45 * oneDayMs, netWorth: Math.round(baseNet * 1.04), grossWorth: Math.round(baseGross * 1.04) }
            ];
        }

        const playerVal = metricType === 'net' ? currentNet : currentGross;
        const player = {
            id: 'player',
            name: '현재의 나 (YOU)',
            label: 'Player',
            date: todayStr,
            value: playerVal,
            netWorth: currentNet,
            grossWorth: currentGross,
            isPlayer: true,
            isGhost: false,
            isAth: false,
            color: '#ef4444' // Racing Crimson Red
        };

        if (!historySource || historySource.length === 0) {
            return [{ ...player, rank: 1, diffFromPlayer: 0 }];
        }

        const sorted = [...historySource]
            .filter(h => h && (h.netWorth !== undefined || h.grossWorth !== undefined))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        if (sorted.length === 0) {
            return [{ ...player, rank: 1, diffFromPlayer: 0 }];
        }

        // ATH 탐색
        let ath = sorted[0];
        sorted.forEach(h => {
            const v = metricType === 'net' ? (h.netWorth || 0) : (h.grossWorth || 0);
            const athV = metricType === 'net' ? (ath.netWorth || 0) : (ath.grossWorth || 0);
            if (v > athV) ath = h;
        });

        const targetRules = [
            { id: '7d', name: '7일 전의 나', days: 7, tolerance: 3, category: 'sprint', color: '#06b6d4' },
            { id: '14d', name: '14일 전의 나', days: 14, tolerance: 5, category: 'sprint', color: '#0ea5e9' },
            { id: '30d', name: '30일 전의 나', days: 30, tolerance: 8, category: 'gp', color: '#8b5cf6' },
            { id: '60d', name: '60일 전의 나', days: 60, tolerance: 14, category: 'gp', color: '#a855f7' },
            { id: '90d', name: '90일 전의 나', days: 90, tolerance: 20, category: 'championship', color: '#ec4899' },
            { id: '180d', name: '180일 전의 나', days: 180, tolerance: 40, category: 'championship', color: '#f43f5e' },
            { id: '365d', name: '1년 전의 나', days: 365, tolerance: 70, category: 'legacy', color: '#10b981' }
        ];

        const matched = [];
        const usedDates = new Set([todayStr]);

        targetRules.forEach(rule => {
            const targetTime = nowMs - rule.days * oneDayMs;
            let closest = null;
            let minDiff = Infinity;

            sorted.forEach(item => {
                const itemTime = item.timestamp || new Date(item.date).getTime();
                const diff = Math.abs(itemTime - targetTime);
                if (diff / oneDayMs <= rule.tolerance && diff < minDiff && !usedDates.has(item.date)) {
                    minDiff = diff;
                    closest = item;
                }
            });

            if (closest) {
                usedDates.add(closest.date);
                const val = metricType === 'net' ? (closest.netWorth || 0) : (closest.grossWorth || 0);
                matched.push({
                    id: `ghost_${rule.id}`,
                    name: rule.name,
                    label: `${rule.days}일 전`,
                    date: closest.date,
                    value: val,
                    netWorth: closest.netWorth || 0,
                    grossWorth: closest.grossWorth || 0,
                    isPlayer: false,
                    isGhost: true,
                    isAth: false,
                    category: rule.category,
                    color: rule.color
                });
            }
        });

        // ATH 고스트 (현재와 다르고 미포함 시)
        if (ath && !usedDates.has(ath.date)) {
            const athVal = metricType === 'net' ? (ath.netWorth || 0) : (ath.grossWorth || 0);
            if (athVal !== playerVal) {
                matched.push({
                    id: 'ghost_ath',
                    name: '역대 최고점 (ATH)',
                    label: 'CHAMPION',
                    date: ath.date,
                    value: athVal,
                    netWorth: ath.netWorth || 0,
                    grossWorth: ath.grossWorth || 0,
                    isPlayer: false,
                    isGhost: true,
                    isAth: true,
                    category: 'legacy',
                    color: '#f59e0b'
                });
                usedDates.add(ath.date);
            }
        }

        // 모드 필터
        let filtered = matched;
        if (raceMode === 'sprint') filtered = matched.filter(m => m.category === 'sprint' || m.isAth);
        else if (raceMode === 'gp') filtered = matched.filter(m => m.category === 'gp' || m.category === 'sprint' || m.isAth);
        else if (raceMode === 'championship') filtered = matched.filter(m => m.category === 'championship' || m.category === 'gp' || m.isAth);
        else if (raceMode === 'legacy') filtered = matched.filter(m => m.category === 'legacy' || m.isAth);

        const list = [player, ...filtered.slice(0, 7)];
        // 순위: 가치 내림차순
        list.sort((a, b) => b.value - a.value);

        return list.map((r, i) => ({
            ...r,
            rank: i + 1,
            diffFromPlayer: r.value - playerVal
        }));
    }, [assetHistory, currentNet, currentGross, metricType, raceMode, isDemoMode, todayStr]);

    // 플레이어 순위 & 다음 타겟
    const { playerRank, totalCount, nextTarget, isAllWon } = useMemo(() => {
        const playerItem = racers.find(r => r.isPlayer);
        const rank = playerItem ? playerItem.rank : 1;
        const total = racers.length;
        const target = rank > 1 ? racers.find(r => r.rank === rank - 1) : null;
        return {
            playerRank: rank,
            totalCount: total,
            nextTarget: target,
            isAllWon: rank === 1 && total > 1
        };
    }, [racers]);

    // 트랙 위치 스케일 계산 (X 좌표 비율)
    const { minVal, maxVal } = useMemo(() => {
        const vals = racers.map(r => r.value);
        let min = Math.min(...vals);
        let max = Math.max(...vals);
        const diff = max - min || 1000;
        return { minVal: Math.max(0, min - diff * 0.1), maxVal: max + diff * 0.15 };
    }, [racers]);

    const getKartXPosition = (val, isPlayer) => {
        if (maxVal === minVal) return 50;
        let pct = ((val - minVal) / (maxVal - minVal)) * 70 + 12;
        // 부스터 발동 시 플레이어 카트가 일시적으로 전방으로 서지(surge)
        if (isPlayer && isNitroActive) pct = Math.min(94, pct + 8);
        return Math.min(93, Math.max(10, pct));
    };

    return (
        <div className="space-y-4">
            {/* 인라인 아케이드 CSS 애니메이션 정의 (Tailwind 외부 의존성 없이 100% 작동) */}
            <style>{`
                @keyframes roadScrollFast {
                    0% { background-position: 0 0; }
                    100% { background-position: -240px 0; }
                }
                @keyframes curbScrollFast {
                    0% { background-position: 0 0; }
                    100% { background-position: -120px 0; }
                }
                @keyframes speedStreak {
                    0% { transform: translateX(120%); opacity: 0; }
                    40% { opacity: 0.9; }
                    100% { transform: translateX(-120%); opacity: 0; }
                }
                @keyframes suspensionBounce {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-1.5px); }
                }
                @keyframes kartShakeAnim {
                    0%, 100% { transform: translate(0, 0); }
                    25% { transform: translate(-1.5px, 1px); }
                    50% { transform: translate(1.5px, -1px); }
                    75% { transform: translate(-1px, -1px); }
                }
                @keyframes flamePulse {
                    0%, 100% { transform: scale(0.95); opacity: 0.85; }
                    50% { transform: scale(1.25); opacity: 1; }
                }
                @keyframes flameIntensePulse {
                    0%, 100% { transform: scale(1.2) scaleX(1.4); opacity: 0.95; }
                    50% { transform: scale(1.6) scaleX(2.0); opacity: 1; filter: drop-shadow(0 0 10px #f43f5e); }
                }
                @keyframes spinFast {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .animate-road-scroll {
                    background-image: repeating-linear-gradient(90deg, #334155 0px, #334155 40px, transparent 40px, transparent 80px);
                    animation: roadScrollFast 0.35s linear infinite;
                }
                .animate-curbs {
                    background-image: repeating-linear-gradient(90deg, #ef4444 0px, #ef4444 20px, #ffffff 20px, #ffffff 40px);
                    animation: curbScrollFast 0.25s linear infinite;
                }
                .animate-suspension {
                    animation: suspensionBounce 0.12s ease-in-out infinite;
                }
                .animate-kart-shake {
                    animation: kartShakeAnim 0.06s ease-in-out infinite;
                }
                .animate-flame {
                    animation: flamePulse 0.1s ease-in-out infinite;
                }
                .animate-flame-intense {
                    animation: flameIntensePulse 0.06s ease-in-out infinite;
                }
                .animate-spin-fast {
                    animation: spinFast 0.15s linear infinite;
                }
            `}</style>

            {/* 1. 아케이드 F1 스피드 콕핏 헤더 (계기판 & 부스터 HUD) */}
            <div className="bg-slate-950 text-white rounded-2xl border-2 border-slate-800 shadow-2xl p-4 sm:p-5 relative overflow-hidden">
                {/* 배경 네온 앰비언트 글로우 */}
                <div className={`absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-300 ${isNitroActive ? 'bg-rose-600/30 scale-125' : 'bg-indigo-600/15'}`} />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* 타이틀 및 순위 엠블럼 */}
                    <div className="flex items-center gap-3">
                        <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black shadow-lg border-2 transition-all ${
                            playerRank === 1 
                                ? 'bg-gradient-to-br from-amber-400 to-yellow-600 border-yellow-300 text-slate-950 shadow-amber-500/40 animate-pulse' 
                                : 'bg-slate-900 border-indigo-500/50 text-white shadow-indigo-500/20'
                        }`}>
                            <span className="text-[10px] uppercase tracking-widest font-extrabold opacity-80">POS</span>
                            <span className="text-2xl leading-none font-black">{playerRank}</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl sm:text-2xl font-black italic tracking-tighter text-white uppercase flex items-center gap-1.5">
                                    <span>🏁 GHOST RACING</span>
                                    <span className="text-xs not-italic font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white animate-pulse">
                                        LIVE
                                    </span>
                                </h3>
                            </div>
                            <p className="text-xs text-slate-400 font-medium flex items-center gap-2 mt-0.5">
                                <span>순위: <strong>{playerRank}위 / {totalCount}대</strong></span>
                                <span>•</span>
                                <span>속도: <strong className="text-cyan-400 font-mono text-sm">{speedKmH} KM/H</strong></span>
                                {isNitroActive && <span className="text-rose-400 font-black animate-bounce">🔥 NITRO BURST!</span>}
                            </p>
                        </div>
                    </div>

                    {/* 아케이드 컨트롤 HUD (부스터 버튼, 뷰 모드, 사운드, 데모) */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* 뷰 모드 토글 (서킷 vs 1:1 드래그) */}
                        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
                            <button
                                onClick={() => setViewMode('circuit')}
                                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                                    viewMode === 'circuit' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <span>🏎️</span>
                                <span>서킷 뷰 (8대)</span>
                            </button>
                            <button
                                onClick={() => setViewMode('duel')}
                                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                                    viewMode === 'duel' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <span>⚡</span>
                                <span>1:1 드래그 배틀</span>
                            </button>
                        </div>

                        {/* 🔥 부스터 (NITRO) 버튼 */}
                        <button
                            onClick={triggerNitro}
                            disabled={nitroGauge < 25 || isNitroActive}
                            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg ${
                                isNitroActive
                                    ? 'bg-gradient-to-r from-yellow-400 via-rose-500 to-indigo-600 text-white scale-105 shadow-rose-500/50'
                                    : nitroGauge >= 25
                                    ? 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white hover:scale-105 active:scale-95 shadow-rose-600/30 cursor-pointer'
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                            }`}
                            title="스페이스바를 눌러도 부스터가 발동됩니다!"
                        >
                            <span>🔥</span>
                            <span>{isNitroActive ? 'BOOSTING!' : 'NITRO (SPACE)'}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-yellow-300">
                                {Math.round(nitroGauge)}%
                            </span>
                        </button>

                        {/* 데모 모드 (기록 부족 시 8대 풀 그리드 체험) */}
                        <button
                            onClick={() => {
                                setIsDemoMode(prev => !prev);
                                addToast(!isDemoMode ? '🎮 체험 모드 활성화 (8대 풀 그리드)' : '실제 자산 기록 모드로 복귀', 'info');
                            }}
                            className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                                isDemoMode 
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' 
                                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                        >
                            {isDemoMode ? '체험 ON' : '체험 모드'}
                        </button>
                    </div>
                </div>

                {/* 서브 바: 리그 선택 & 지표 토글 */}
                <div className="mt-3 pt-3 border-t border-slate-900 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap gap-1">
                        {[
                            { id: 'all', label: '전체 (ALL)' },
                            { id: 'sprint', label: '스프린트 (7~14일)' },
                            { id: 'gp', label: '그랑프리 (30~60일)' },
                            { id: 'championship', label: '챔피언십 (90~180일)' },
                            { id: 'legacy', label: '레거시 (1년+ & ATH)' }
                        ].map(m => (
                            <button
                                key={m.id}
                                onClick={() => setRaceMode(m.id)}
                                className={`px-2 py-1 rounded-md font-bold transition-all ${
                                    raceMode === m.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-1 font-bold">
                        <button
                            onClick={() => setMetricType('net')}
                            className={`px-2 py-1 rounded-md ${metricType === 'net' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                        >
                            순자산
                        </button>
                        <button
                            onClick={() => setMetricType('gross')}
                            className={`px-2 py-1 rounded-md ${metricType === 'gross' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                        >
                            총자산
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. OVERTAKE TARGET HUD (현장감 있는 추월 타겟 배너) */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border border-indigo-500/40 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
                <div className="flex items-center gap-3">
                    <div className="text-3xl">🎯</div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                            {isAllWon ? 'CHAMPION OF THE TRACK' : 'NEXT OVERTAKE TARGET'}
                        </div>
                        {isAllWon ? (
                            <div className="text-base sm:text-lg font-black text-amber-300 flex items-center gap-1.5">
                                <span>👑 과거의 모든 나를 제치고 역대 최고 기록으로 단독 질주 중!</span>
                            </div>
                        ) : nextTarget ? (
                            <div className="text-sm sm:text-base font-black text-slate-100">
                                다음 추월 상대: <span className="text-cyan-400 underline">{nextTarget.name}</span> ({nextTarget.date})
                            </div>
                        ) : (
                            <div className="text-xs text-slate-400">
                                히스토리 기록이 누적되면 차례대로 고스트가 해금되어 트랙에 출전합니다!
                            </div>
                        )}
                    </div>
                </div>

                {nextTarget && !isAllWon && (
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 text-right">
                        <span className="text-xs text-slate-400">추월까지 남은 자산 격차</span>
                        <span className="text-lg font-black text-rose-400 font-mono">
                            +{formatNumber(nextTarget.value - (metricType === 'net' ? currentNet : currentGross), displayMode)}만원
                        </span>
                    </div>
                )}
            </div>

            {/* 3-A. [뷰 모드 1] 서킷 뷰 (8대 동시 멀티레인 주행 트랙) */}
            {viewMode === 'circuit' && (
                <div className="bg-slate-950 rounded-2xl border-2 border-slate-800 shadow-2xl p-4 sm:p-5 relative overflow-hidden">
                    {/* 상단 연석 (Red & White Curbs Scrolling) */}
                    <div className="w-full h-3 rounded-t-lg animate-curbs border-b border-black opacity-80" />

                    {/* 메인 서킷 아스팔트 바디 */}
                    <div className="bg-slate-900/90 relative py-2 space-y-3">
                        {/* 고속 주행 스피드 라인 (배경 스트릭) */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
                            <div className="w-48 h-0.5 bg-white blur-xs absolute top-1/4 animate-[speedStreak_0.5s_linear_infinite]" />
                            <div className="w-72 h-0.5 bg-cyan-400 blur-xs absolute top-2/4 animate-[speedStreak_0.35s_linear_infinite]" style={{ animationDelay: '0.15s' }} />
                            <div className="w-60 h-0.5 bg-rose-400 blur-xs absolute top-3/4 animate-[speedStreak_0.4s_linear_infinite]" style={{ animationDelay: '0.08s' }} />
                        </div>

                        {/* 피니시 라인 체커기 바 (우측 90% 지점 세로선) */}
                        <div className="absolute top-0 bottom-0 right-[7%] w-5 z-20 pointer-events-none opacity-40 bg-[repeating-conic-gradient(#fff_0_25%,#000_0_50%)] [background-size:10px_10px]" />

                        {/* 각 레이서별 레인 (차선) */}
                        {racers.map((racer, index) => {
                            const posX = getKartXPosition(racer.value, racer.isPlayer);
                            const isPlayer = racer.isPlayer;

                            return (
                                <div 
                                    key={racer.id}
                                    className={`relative h-20 sm:h-22 rounded-xl border flex items-center transition-all ${
                                        isPlayer 
                                            ? 'bg-slate-950/80 border-rose-500/60 shadow-[0_0_25px_rgba(239,68,68,0.25)] z-20' 
                                            : racer.isAth
                                            ? 'bg-slate-950/60 border-amber-500/40 z-10'
                                            : 'bg-slate-950/40 border-slate-800/80 z-0'
                                    }`}
                                >
                                    {/* 차선 중앙 아스팔트 주행 점선 (초고속 스크롤) */}
                                    <div className="absolute inset-x-0 h-1 top-1/2 -translate-y-1/2 animate-road-scroll pointer-events-none opacity-40" />

                                    {/* 좌측 순위 및 레이서 정보 배너 */}
                                    <div className="absolute left-3 top-2 z-10 flex items-center gap-2 pointer-events-none">
                                        <span className={`text-[11px] font-black px-2 py-0.5 rounded shadow ${
                                            racer.rank === 1 ? 'bg-amber-400 text-black' : racer.rank === 2 ? 'bg-slate-200 text-black' : racer.rank === 3 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                                        }`}>
                                            P{racer.rank}
                                        </span>
                                        <span className={`text-xs font-black truncate max-w-[120px] sm:max-w-[180px] ${
                                            isPlayer ? 'text-rose-400 font-extrabold' : racer.isAth ? 'text-amber-400' : 'text-slate-300'
                                        }`}>
                                            {racer.name}
                                        </span>
                                        {isPlayer && (
                                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-600 text-white animate-pulse">
                                                YOU
                                            </span>
                                        )}
                                    </div>

                                    {/* 우측 금액 표시 */}
                                    <div className="absolute right-4 top-2 text-right pointer-events-none">
                                        <span className="text-xs sm:text-sm font-black text-white font-mono">
                                            {formatNumber(racer.value, displayMode)}<span className="text-[10px] text-slate-400 font-normal ml-0.5">만원</span>
                                        </span>
                                    </div>

                                    {/* 🏎️ 카트 아바타 (위치 이동 & 부스터 애니메이션) */}
                                    <div 
                                        className="absolute transition-all ease-out z-20"
                                        style={{
                                            left: `${posX}%`,
                                            transform: 'translateX(-50%)',
                                            transitionDuration: isPlayer && isNitroActive ? '0.2s' : '0.7s'
                                        }}
                                    >
                                        <KartGraphic 
                                            color={racer.color}
                                            isPlayer={isPlayer}
                                            isGhost={racer.isGhost}
                                            isAth={racer.isAth}
                                            isBoosting={isPlayer && isNitroActive}
                                            name={racer.name}
                                            scale={0.9}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 하단 연석 (Red & White Curbs Scrolling) */}
                    <div className="w-full h-3 rounded-b-lg animate-curbs border-t border-black opacity-80" />
                </div>
            )}

            {/* 3-B. [뷰 모드 2] 1:1 드래그 배틀 (라이벌 초근접 추월 캠) */}
            {viewMode === 'duel' && (
                <div className="bg-slate-950 rounded-2xl border-2 border-slate-800 shadow-2xl p-6 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">🔥</span>
                            <h4 className="text-sm font-black text-white uppercase tracking-wider">
                                1:1 라이벌 드래그 스트립 (Close-Up Duel)
                            </h4>
                        </div>
                        <span className="text-xs text-rose-400 font-bold animate-pulse">
                            SPACEBAR 키로 부스터를 점화하여 추월하세요!
                        </span>
                    </div>

                    {/* 2레인 줌인 드래그 트랙 */}
                    <div className="space-y-4 bg-slate-900/90 p-4 rounded-xl relative border border-slate-800">
                        {/* 도로 연석 */}
                        <div className="w-full h-2 rounded animate-curbs opacity-75" />

                        {/* 상단 레인: 라이벌 고스트 (타겟이 없으면 1위인 자신 혹은 최근 고스트) */}
                        {(() => {
                            const rival = nextTarget || (racers.length > 1 ? racers[1] : null);
                            return (
                                <div className="relative h-24 bg-slate-950/70 rounded-xl border border-cyan-500/30 flex items-center px-4 overflow-hidden">
                                    <div className="absolute inset-x-0 h-1 top-1/2 animate-road-scroll opacity-30" />
                                    <div className="absolute left-3 top-2 text-xs font-black text-cyan-400 flex items-center gap-1.5">
                                        <span>👻 RIVAL GHOST:</span>
                                        <span>{rival ? rival.name : '고스트 대기 중'}</span>
                                        {rival && <span className="text-slate-400 font-normal">({rival.date})</span>}
                                    </div>
                                    <div className="absolute right-3 top-2 font-mono text-sm font-black text-white">
                                        {rival ? `${formatNumber(rival.value, displayMode)}만원` : '-'}
                                    </div>

                                    {/* 라이벌 카트 (65% 위치에서 주행) */}
                                    <div className="absolute left-[65%] -translate-x-1/2">
                                        {rival && (
                                            <KartGraphic 
                                                color={rival.color}
                                                isGhost={true}
                                                isAth={rival.isAth}
                                                name={rival.name}
                                                scale={1.15}
                                            />
                                        )}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* 하단 레인: 플레이어 카트 */}
                        <div className="relative h-24 bg-slate-950/90 rounded-xl border border-rose-500/50 flex items-center px-4 overflow-hidden">
                            <div className="absolute inset-x-0 h-1 top-1/2 animate-road-scroll opacity-40" />
                            <div className="absolute left-3 top-2 text-xs font-black text-rose-400 flex items-center gap-1.5">
                                <span>🏎️ PLAYER:</span>
                                <span>현재의 나</span>
                                {isNitroActive && <span className="text-yellow-300 font-extrabold animate-bounce">⚡ OVERDRIVE!</span>}
                            </div>
                            <div className="absolute right-3 top-2 font-mono text-sm font-black text-white">
                                {formatNumber(metricType === 'net' ? currentNet : currentGross, displayMode)}만원
                            </div>

                            {/* 플레이어 카트 (평상시 50%, 부스터 시 75%로 전진하며 추월) */}
                            <div 
                                className="absolute transition-all ease-out"
                                style={{
                                    left: isNitroActive ? '76%' : '48%',
                                    transform: 'translateX(-50%)',
                                    transitionDuration: isNitroActive ? '0.3s' : '0.6s'
                                }}
                            >
                                <KartGraphic 
                                    color="#ef4444"
                                    isPlayer={true}
                                    isBoosting={isNitroActive}
                                    name="현재의 나"
                                    scale={1.2}
                                />
                            </div>
                        </div>

                        {/* 하단 도로 연석 */}
                        <div className="w-full h-2 rounded animate-curbs opacity-75" />
                    </div>
                </div>
            )}

            {/* 4. 고스트 해금 차고 (Ghost Garage) - Cold Start 친화적 게임화 진행도 */}
            <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">🛠️</span>
                        <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200">
                            고스트 차고 및 잠금 해제 현황 (Ghost Roster)
                        </h4>
                    </div>
                    <span className="text-xs text-slate-400">
                        누적 히스토리: <strong className="text-indigo-400">{assetHistory.length}일</strong>
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                    {[
                        { title: '7일 전', req: 7, id: '7d' },
                        { title: '14일 전', req: 14, id: '14d' },
                        { title: '30일 전', req: 30, id: '30d' },
                        { title: '60일 전', req: 60, id: '60d' },
                        { title: '90일 전', req: 90, id: '90d' },
                        { title: '180일 전', req: 180, id: '180d' },
                        { title: '1년 전', req: 365, id: '365d' }
                    ].map(item => {
                        const isUnlocked = racers.some(r => r.id === `ghost_${item.id}`);
                        return (
                            <div 
                                key={item.id}
                                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                                    isUnlocked 
                                        ? 'bg-indigo-950/30 border-indigo-500/40 text-cyan-300' 
                                        : 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-60'
                                }`}
                            >
                                <div className="text-xl mb-1">{isUnlocked ? '🏎️' : '🔒'}</div>
                                <div className="text-xs font-bold text-slate-200">{item.title}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                                    {isUnlocked ? '출전 중' : `${item.req}일 기록`}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 5. 실시간 리더보드 순위표 */}
            <div className="bg-slate-950 text-white rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <span>🏆</span> 실시간 그랑프리 순위표
                    </h4>
                    <span className="text-xs text-slate-400">
                        기준 자산: <strong className="text-white font-mono">{formatNumber(metricType === 'net' ? currentNet : currentGross, displayMode)}만원</strong>
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900/80 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-800">
                            <tr>
                                <th className="p-3.5 pl-5">순위</th>
                                <th className="p-3.5">레이서 / 고스트</th>
                                <th className="p-3.5">기록 일자</th>
                                <th className="p-3.5 text-right">{metricType === 'net' ? '순자산' : '총자산'}</th>
                                <th className="p-3.5 text-right">현재 나와의 격차</th>
                                <th className="p-3.5 text-center">상태</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-mono">
                            {racers.map(r => {
                                const isOvertaken = r.diffFromPlayer < 0;
                                return (
                                    <tr key={r.id} className={`transition-colors ${r.isPlayer ? 'bg-rose-950/30 font-bold' : 'hover:bg-slate-900/50'}`}>
                                        <td className="p-3.5 pl-5 font-black text-sm">
                                            {r.rank === 1 ? '🥇 1st' : r.rank === 2 ? '🥈 2nd' : r.rank === 3 ? '🥉 3rd' : `${r.rank}th`}
                                        </td>
                                        <td className="p-3.5 font-sans flex items-center gap-2">
                                            <span className="text-base">{r.isPlayer ? '🏎️' : r.isAth ? '👑' : '👻'}</span>
                                            <div>
                                                <div className={`font-black ${r.isPlayer ? 'text-rose-400' : r.isAth ? 'text-amber-400' : 'text-slate-200'}`}>
                                                    {r.name}
                                                </div>
                                                <div className="text-[10px] text-slate-500 font-mono">{r.label}</div>
                                            </div>
                                        </td>
                                        <td className="p-3.5 text-slate-400 text-[11px]">{r.date}</td>
                                        <td className="p-3.5 text-right font-black text-white">{formatNumber(r.value, displayMode)}만원</td>
                                        <td className="p-3.5 text-right font-bold">
                                            {r.isPlayer ? (
                                                <span className="text-rose-400 font-black">- (기준)</span>
                                            ) : isOvertaken ? (
                                                <span className="text-emerald-400">+{formatNumber(Math.abs(r.diffFromPlayer), displayMode)}만</span>
                                            ) : (
                                                <span className="text-rose-400">-{formatNumber(r.diffFromPlayer, displayMode)}만</span>
                                            )}
                                        </td>
                                        <td className="p-3.5 text-center font-sans">
                                            {r.isPlayer ? (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white">
                                                    PLAYER
                                                </span>
                                            ) : isOvertaken ? (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                                    추월 완료 🚩
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                                    추월 목표 🎯
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
