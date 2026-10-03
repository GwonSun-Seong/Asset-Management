import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';

/**
 * 🏎️ AssetGhostRacing (자산 고스트 레이싱 - 5단 스택 니트로)
 * 
 * - 스페이스바 연타 콤보 시스템: 1단부터 최대 5단까지 강화 가능한 다단계 부스트 (Level 1 ~ 5)
 * - 1단(기본 가속 · 연비 우수) ~ 5단(MAX HYPER GOD-SPEED · 급속 연료 소모)
 * - 니트로 잔여량(nitroGauge)에 따라 유기적으로 크기/형태/색상이 변화하는 유선형 SVG 배기 화염
 * - 🔮 미래의 나 (1년 뒤 시뮬레이션 쉐도우 카트) & 🎯 목표 마일스톤 페이스메이커
 * - 깔끔하고 정돈된 다크 아스팔트 F1 서킷 디자인
 */

const playArcadeSound = () => {};

/**
 * 🏎️ 고화질 레이싱 카트 벡터 렌더러 (Detailed SVG Kart)
 * - 5단 부스트 레벨(boostLevel 0~5)에 따라 진화하는 유기적(Organic) 곡선 SVG 배기 화염
 */
const KartGraphic = ({
    color = '#ef4444',
    isPlayer = false,
    isGhost = false,
    isAth = false,
    isFuture = false,
    isPaceCar = false,
    boostLevel = 0,
    nitroGauge = 100,
    scale = 1
}) => {
    // 니트로 잔여량 비율 (0.0 ~ 1.0)
    const gaugeRatio = Math.max(0, Math.min(1, (nitroGauge || 0) / 100));
    const isBoosting = isPlayer && boostLevel > 0;

    // 5단계 레벨별 유기적 화염 파라미터 연산
    const flameParams = useMemo(() => {
        if (!isPlayer) {
            return {
                length: 14,
                width: 5,
                coreColor: '#fef08a',
                midColor: isAth ? '#f59e0b' : isFuture ? '#c084fc' : isGhost ? '#06b6d4' : '#f97316',
                trailColor: 'transparent',
                glow: 'rgba(249,115,22,0.4)',
                level: 0
            };
        }

        switch (boostLevel) {
            case 1:
                // 1단: 기본 가속 (연비 절약형 부드러운 오렌지 화염)
                return {
                    length: 26 + Math.round(gaugeRatio * 6), // 26 ~ 32px
                    width: 6,
                    coreColor: '#fef08a',
                    midColor: '#f97316',
                    trailColor: '#ea580c',
                    glow: 'rgba(249,115,22,0.5)',
                    level: 1
                };
            case 2:
                // 2단: 더블 부스트 (강렬한 앰버-로즈 투톤 화염)
                return {
                    length: 38 + Math.round(gaugeRatio * 8), // 38 ~ 46px
                    width: 8,
                    coreColor: '#ffffff',
                    midColor: '#f59e0b',
                    trailColor: '#e11d48',
                    glow: 'rgba(245,158,11,0.65)',
                    level: 2
                };
            case 3:
                // 3단: 트리플 오버드라이브 (전기 시안 & 인디고 레이저 플라즈마)
                return {
                    length: 52 + Math.round(gaugeRatio * 10), // 52 ~ 62px
                    width: 10,
                    coreColor: '#ffffff',
                    midColor: '#38bdf8',
                    trailColor: '#6366f1',
                    glow: 'rgba(56,189,248,0.75)',
                    level: 3
                };
            case 4:
                // 4단: 쿼드 맥스 파워 (고출력 트윈 코어 시안-바이올렛)
                return {
                    length: 66 + Math.round(gaugeRatio * 12), // 66 ~ 78px
                    width: 12,
                    coreColor: '#ffffff',
                    midColor: '#06b6d4',
                    trailColor: '#a855f7',
                    glow: 'rgba(6,182,212,0.85)',
                    level: 4
                };
            case 5:
                // 5단: MAX HYPER GOD-SPEED (초극대 86px+ 하이퍼 플라즈마 화염)
                return {
                    length: 82 + Math.round(gaugeRatio * 14), // 82 ~ 96px
                    width: 15,
                    coreColor: '#ffffff',
                    midColor: '#38bdf8',
                    trailColor: '#ec4899',
                    glow: 'rgba(236,72,153,0.9)',
                    level: 5
                };
            default:
                // 0단: 일반 순항 (미세 배기구)
                const isFull = gaugeRatio >= 0.95;
                return {
                    length: isFull ? 15 : 10,
                    width: isFull ? 6 : 4,
                    coreColor: isFull ? '#e0f2fe' : '#fef08a',
                    midColor: isFull ? '#0284c7' : '#ea580c',
                    trailColor: 'transparent',
                    glow: isFull ? 'rgba(56,189,248,0.45)' : 'rgba(234,88,12,0.3)',
                    level: 0
                };
        }
    }, [isPlayer, boostLevel, gaugeRatio, isAth, isFuture, isGhost]);

    return (
        <div 
            className={`relative select-none pointer-events-none ${
                isBoosting ? 'animate-kart-boost-shake' : 'animate-suspension'
            }`} 
            style={{ transform: `scale(${scale})` }}
        >
            {/* 전방 라이트 프로젝션 빔 (부스트 레벨에 따라 광폭 조사) */}
            <div 
                className={`absolute left-[110px] top-[14px] pointer-events-none blur-xs transition-all ${
                    boostLevel >= 4 ? 'w-42 h-14 opacity-80' : boostLevel >= 2 ? 'w-34 h-11 opacity-65' : 'w-26 h-9 opacity-40'
                }`}
                style={{
                    background: isBoosting
                        ? (boostLevel >= 4
                            ? 'radial-gradient(ellipse at left, rgba(56,189,248,0.95) 0%, rgba(236,72,153,0.5) 60%, rgba(59,130,246,0) 85%)'
                            : boostLevel >= 3
                            ? 'radial-gradient(ellipse at left, rgba(56,189,248,0.9) 0%, rgba(99,102,241,0.5) 60%, rgba(59,130,246,0) 80%)'
                            : 'radial-gradient(ellipse at left, rgba(251,146,60,0.85) 0%, rgba(239,68,68,0) 80%)')
                        : isFuture
                        ? 'radial-gradient(ellipse at left, rgba(168,85,247,0.7) 0%, rgba(168,85,247,0) 80%)'
                        : isGhost 
                        ? 'radial-gradient(ellipse at left, rgba(6,182,212,0.6) 0%, rgba(6,182,212,0) 80%)'
                        : isAth
                        ? 'radial-gradient(ellipse at left, rgba(245,158,11,0.7) 0%, rgba(245,158,11,0) 80%)'
                        : isPaceCar
                        ? 'radial-gradient(ellipse at left, rgba(234,179,8,0.8) 0%, rgba(234,179,8,0) 80%)'
                        : 'radial-gradient(ellipse at left, rgba(255,255,255,0.75) 0%, rgba(59,130,246,0) 80%)'
                }}
            />

            {/* ⚡ 5단 전용 전방 초음속 마하 에어로 콘 (Mach Cone) */}
            {isPlayer && boostLevel === 5 && (
                <div className="absolute left-[120px] top-[12px] w-12 h-10 pointer-events-none z-30">
                    <div className="w-full h-full border-r-3 border-t border-b border-cyan-300 rounded-r-full opacity-85 blur-2xs animate-pulse shadow-[0_0_15px_#22d3ee]" />
                </div>
            )}

            {/* 유기적 SVG 배기 화염 (직사각형 없는 순수 유선형 곡선) */}
            {!isPaceCar && (
                <div 
                    className="absolute -left-1 top-[18px] pointer-events-none z-10"
                    style={{
                        transform: 'translate(-100%, -50%)',
                        filter: `drop-shadow(0 0 10px ${flameParams.glow})`
                    }}
                >
                    <svg 
                        width={flameParams.length + 10} 
                        height={flameParams.width * 2 + 6} 
                        viewBox={`0 0 ${flameParams.length + 10} ${flameParams.width * 2 + 6}`}
                        className="overflow-visible"
                    >
                        <defs>
                            <linearGradient id={`flameGrad_${isPlayer ? `p_${boostLevel}` : 'g'}`} x1="100%" y1="50%" x2="0%" y2="50%">
                                <stop offset="0%" stopColor={flameParams.coreColor} />
                                <stop offset="40%" stopColor={flameParams.midColor} />
                                <stop offset="100%" stopColor={flameParams.trailColor} />
                            </linearGradient>
                        </defs>
                        {/* 부드러운 유선형 화염 패스 */}
                        <path 
                            d={`M ${flameParams.length + 5} ${flameParams.width + 3} 
                               C ${flameParams.length * 0.7} ${flameParams.width * 0.2}, 
                                 ${flameParams.length * 0.3} ${flameParams.width * 0.4}, 
                                 2 ${flameParams.width + 3} 
                               C ${flameParams.length * 0.3} ${flameParams.width * 1.6}, 
                                 ${flameParams.length * 0.7} ${flameParams.width * 1.8}, 
                                 ${flameParams.length + 5} ${flameParams.width + 3} Z`}
                            fill={`url(#flameGrad_${isPlayer ? `p_${boostLevel}` : 'g'})`}
                            className={isBoosting ? 'animate-flame-flicker-boost' : 'animate-flame-flicker-idle'}
                        />
                        {/* 코어 중심 백색 팁 */}
                        {isBoosting && (
                            <path 
                                d={`M ${flameParams.length + 5} ${flameParams.width + 3} 
                                   C ${flameParams.length * 0.8} ${flameParams.width * 0.6}, 
                                     ${flameParams.length * 0.5} ${flameParams.width * 0.8}, 
                                     ${flameParams.length * 0.35} ${flameParams.width + 3} 
                                   C ${flameParams.length * 0.5} ${flameParams.width * 1.2}, 
                                     ${flameParams.length * 0.8} ${flameParams.width * 1.4}, 
                                     ${flameParams.length + 5} ${flameParams.width + 3} Z`}
                                fill="#ffffff"
                                opacity="0.95"
                            />
                        )}
                        {/* 4단/5단 전용 초음속 충격 링 (Shock Diamonds) */}
                        {isPlayer && boostLevel >= 4 && (
                            <circle 
                                cx={flameParams.length * 0.5} 
                                cy={flameParams.width + 3} 
                                r={flameParams.width * 0.4} 
                                fill="none" 
                                stroke="#ffffff" 
                                strokeWidth="1" 
                                opacity="0.85" 
                                className="animate-ping" 
                            />
                        )}
                    </svg>

                    {/* 3단 이상 리어 윙 슬립스트림 기류 곡선 */}
                    {isPlayer && boostLevel >= 3 && (
                        <div className="absolute right-0 -top-2 pointer-events-none opacity-60">
                            <svg width="45" height="15" viewBox="0 0 45 15">
                                <path d="M 45 3 C 25 1, 10 4, 0 3" stroke="#38bdf8" strokeWidth="1" fill="none" strokeDasharray="12 6" />
                                <path d="M 45 12 C 25 14, 10 11, 0 12" stroke="#38bdf8" strokeWidth="1" fill="none" strokeDasharray="12 6" />
                            </svg>
                        </div>
                    )}
                </div>
            )}

            {/* 🚨 페이스메이커 (F1 세이프티 카) 전용 렌더링 */}
            {isPaceCar ? (
                <svg width="135" height="52" viewBox="0 0 135 52" className="overflow-visible filter drop-shadow-[0_0_12px_rgba(234,179,8,0.8)]">
                    <defs>
                        <linearGradient id="paceCarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#1e293b" />
                            <stop offset="40%" stopColor="#334155" />
                            <stop offset="80%" stopColor="#eab308" />
                            <stop offset="100%" stopColor="#fef08a" />
                        </linearGradient>
                    </defs>

                    {/* 루프 상단 점멸 경광등 */}
                    <g className="animate-strobe origin-[62px_8px]">
                        <rect x="52" y="7" width="22" height="5" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="1" />
                        <circle cx="56" cy="9.5" r="2.5" fill="#ef4444" className="animate-pulse" />
                        <circle cx="63" cy="9.5" r="2" fill="#fbbf24" />
                        <circle cx="70" cy="9.5" r="2.5" fill="#3b82f6" className="animate-pulse" />
                    </g>

                    {/* 세이프티 카 바디 */}
                    <path 
                        d="M 12 36 L 24 36 L 40 22 L 80 18 L 105 28 L 128 35 L 132 39 L 10 39 Z" 
                        fill="url(#paceCarGrad)" 
                        stroke="#0f172a" 
                        strokeWidth="1.5" 
                    />

                    {/* 도어 데칼 */}
                    <text x="68" y="32" fontSize="7" fontWeight="900" fill="#0f172a" fontStyle="italic" textAnchor="middle">
                        PACE CAR 🚨
                    </text>

                    {/* 휠 */}
                    <g className="animate-spin-fast origin-[26px_38px]">
                        <circle cx="26" cy="38" r="9" fill="#0f172a" stroke="#475569" strokeWidth="2" />
                        <circle cx="26" cy="38" r="5" fill="#eab308" />
                        <circle cx="26" cy="38" r="2" fill="#ffffff" />
                    </g>
                    <g className="animate-spin-fast origin-[110px_38px]">
                        <circle cx="110" cy="38" r="8" fill="#0f172a" stroke="#475569" strokeWidth="2" />
                        <circle cx="110" cy="38" r="4.5" fill="#eab308" />
                        <circle cx="110" cy="38" r="1.8" fill="#ffffff" />
                    </g>
                </svg>
            ) : (
                /* 일반 F1 / 고스트 카트 */
                <svg 
                    width="130" 
                    height="50" 
                    viewBox="0 0 130 50" 
                    className={`overflow-visible filter ${
                        isFuture
                            ? 'drop-shadow-[0_0_12px_rgba(168,85,247,0.85)] opacity-85'
                            : isGhost 
                            ? 'drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] opacity-75' 
                            : isAth
                            ? 'drop-shadow-[0_0_12px_rgba(245,158,11,0.9)]'
                            : isBoosting
                            ? (boostLevel >= 4 ? 'drop-shadow-[0_0_18px_rgba(56,189,248,0.95)]' : 'drop-shadow-[0_0_14px_rgba(239,68,68,0.85)]')
                            : 'drop-shadow-[0_0_10px_rgba(239,68,68,0.7)]'
                    }`}
                >
                    <defs>
                        <linearGradient id={`kartGrad_${color.replace('#','')}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={isFuture ? '#7e22ce' : isGhost ? '#0891b2' : color} stopOpacity={isGhost || isFuture ? 0.65 : 1} />
                            <stop offset="60%" stopColor={isFuture ? '#c084fc' : isGhost ? '#06b6d4' : isAth ? '#fbbf24' : '#f43f5e'} stopOpacity={isGhost || isFuture ? 0.75 : 1} />
                            <stop offset="100%" stopColor={isFuture ? '#f472b6' : isGhost ? '#67e8f9' : '#ffffff'} stopOpacity={isGhost || isFuture ? 0.85 : 1} />
                        </linearGradient>
                        <linearGradient id="spoilerGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                            <stop offset="0%" stopColor="#1e293b" />
                            <stop offset="100%" stopColor="#475569" />
                        </linearGradient>
                    </defs>

                    {/* 섀시 본체 */}
                    <path 
                        d="M 12 36 L 25 36 L 38 28 L 65 24 L 90 28 L 122 36 L 126 39 L 10 39 Z" 
                        fill={`url(#kartGrad_${color.replace('#','')})`}
                        stroke={isFuture ? '#c084fc' : isGhost ? '#22d3ee' : '#0f172a'}
                        strokeWidth="1.5"
                    />

                    {/* 프론트 윙 */}
                    <path d="M 115 35 L 128 35 L 127 41 L 114 41 Z" fill="url(#spoilerGrad)" stroke="#0f172a" strokeWidth="1" />
                    <circle cx="127" cy="38" r="2" fill={isFuture ? '#f472b6' : isGhost ? '#67e8f9' : '#38bdf8'} />

                    {/* 콕핏 & 윈드실드 */}
                    <path 
                        d="M 52 24 L 68 15 L 78 24 Z" 
                        fill={isFuture ? 'rgba(192,132,252,0.4)' : isGhost ? 'rgba(34,211,238,0.4)' : 'rgba(15,23,42,0.85)'}
                        stroke={isFuture ? '#c084fc' : isGhost ? '#22d3ee' : '#38bdf8'}
                        strokeWidth="1"
                    />

                    {/* 드라이버 헬멧 */}
                    <circle 
                        cx="60" 
                        cy="18" 
                        r="6.5" 
                        fill={isFuture ? '#a855f7' : isGhost ? '#0891b2' : isAth ? '#f59e0b' : isPlayer ? '#ef4444' : '#64748b'}
                        stroke="#ffffff"
                        strokeWidth="1"
                    />
                    <path d="M 61 17 Q 66 17 66 20 Q 61 21 61 17 Z" fill="#38bdf8" />

                    {/* 리어 윙 */}
                    <rect x="8" y="16" width="4" height="18" fill="#334155" />
                    <rect x="18" y="18" width="4" height="16" fill="#334155" />
                    <path 
                        d="M 5 14 L 25 14 L 23 18 L 3 18 Z" 
                        fill={isAth ? '#f59e0b' : isFuture ? '#a855f7' : 'url(#spoilerGrad)'}
                        stroke="#ffffff"
                        strokeWidth="0.8"
                    />
                    {isAth && <text x="11" y="13" fontSize="8" fill="#fbbf24">👑</text>}
                    {isFuture && <text x="11" y="13" fontSize="8" fill="#f472b6">🔮</text>}

                    {/* 데칼 번호 */}
                    <circle cx="82" cy="33" r="5" fill="#ffffff" stroke="#0f172a" strokeWidth="0.8" />
                    <text x="82" y="36" fontSize="7" fontWeight="900" fill="#0f172a" textAnchor="middle">
                        {isPlayer ? (boostLevel > 0 ? `${boostLevel}⚡` : '7') : isAth ? '★' : isFuture ? '∞' : 'G'}
                    </text>

                    {/* 회전 리어 휠 */}
                    <g className="animate-spin-fast origin-[25px_38px]">
                        <circle cx="25" cy="38" r="9" fill="#0f172a" stroke="#334155" strokeWidth="2" />
                        <circle cx="25" cy="38" r="5" fill={isAth ? '#fbbf24' : isFuture ? '#c084fc' : '#94a3b8'} />
                        <line x1="25" y1="29" x2="25" y2="47" stroke="#0f172a" strokeWidth="1.5" />
                        <line x1="16" y1="38" x2="34" y2="38" stroke="#0f172a" strokeWidth="1.5" />
                        <circle cx="25" cy="38" r="2" fill="#e2e8f0" />
                    </g>

                    {/* 회전 프론트 휠 */}
                    <g className="animate-spin-fast origin-[105px_38px]">
                        <circle cx="105" cy="38" r="8" fill="#0f172a" stroke="#334155" strokeWidth="2" />
                        <circle cx="105" cy="38" r="4.5" fill={isAth ? '#fbbf24' : isFuture ? '#c084fc' : '#94a3b8'} />
                        <line x1="105" y1="30" x2="105" y2="46" stroke="#0f172a" strokeWidth="1.5" />
                        <line x1="97" y1="38" x2="113" y2="38" stroke="#0f172a" strokeWidth="1.5" />
                        <circle cx="105" cy="38" r="1.8" fill="#e2e8f0" />
                    </g>

                    {/* 5단 초극대 상태 스포일러 전기 스파크 아크 */}
                    {isPlayer && boostLevel === 5 && (
                        <g className="pointer-events-none opacity-90 animate-pulse">
                            <path d="M 6 12 L 14 16 L 20 13" stroke="#38bdf8" strokeWidth="1.5" fill="none" />
                            <path d="M 100 28 L 105 32 L 110 29" stroke="#f472b6" strokeWidth="1.5" fill="none" />
                        </g>
                    )}
                </svg>
            )}
        </div>
    );
};

export default function AssetGhostRacing({
    assetHistory = [],
    currentNet = 0,
    currentGross = 0,
    formatNumber = (n) => n?.toLocaleString() || '0',
    displayMode = 'real',
    isDarkMode = true,
    addToast = () => {},
    targetAmount = 10000,
    monthlyProjections = []
}) {
    // 레이스 리그: 'all' | 'sprint' | 'gp' | 'championship' | 'legacy'
    const [raceMode, setRaceMode] = useState('all');
    // 지표: 'net' | 'gross'
    const [metricType, setMetricType] = useState('net');
    
    // ⚡ 5단 스택 니트로 시스템 상태
    const [boostLevel, setBoostLevel] = useState(0); // 0 (순항) ~ 1..5 (부스트 레벨)
    const [nitroGauge, setNitroGauge] = useState(100);
    const [isDemoMode, setIsDemoMode] = useState(false);

    // 자동 감쇠 타이머 ref (일정 시간 추가 입력 없으면 단계적 하향)
    const decayTimerRef = useRef(null);

    // 5단계 레벨별 속도 계산 (KM/H)
    const currentSpeedKmH = useMemo(() => {
        switch (boostLevel) {
            case 1: return 220;
            case 2: return 255;
            case 3: return 295;
            case 4: return 340;
            case 5: return 395;
            default: return 185;
        }
    }, [boostLevel]);

    // ⚡ 레벨별 니트로 소모 루프 (50ms 단위 실시간 연산)
    // Level 1: 0.30% / 50ms (초당 6.0%, 100에서 완충시 16.6초 지속 - 부드럽고 느린 소모)
    // Level 2: 0.55% / 50ms (초당 11.0%)
    // Level 3: 0.90% / 50ms (초당 18.0%)
    // Level 4: 1.50% / 50ms (초당 30.0%)
    // Level 5: 2.60% / 50ms (초당 52.0% - 5번째는 폭발적 가속 대신 급속 소모!)
    useEffect(() => {
        if (boostLevel === 0) return;

        const drainRates = {
            1: 0.30,
            2: 0.55,
            3: 0.90,
            4: 1.50,
            5: 2.60
        };

        const interval = setInterval(() => {
            setNitroGauge(prev => {
                const next = prev - (drainRates[boostLevel] || 0.30);
                if (next <= 0) {
                    // 연료 완전 소진 시 즉시 부스트 종료
                    setBoostLevel(0);
                    addToast('🔋 니트로 연료 소진! 재충전 중...', 'warning');
                    return 0;
                }
                return next;
            });
        }, 50);

        return () => clearInterval(interval);
    }, [boostLevel, addToast]);

    // 미부스트 시 니트로 자동 완충 (초당 약 +4.5%, 0에서 약 22초 소요)
    useEffect(() => {
        if (boostLevel > 0) return;
        const interval = setInterval(() => {
            setNitroGauge(prev => Math.min(100, prev + 0.45));
        }, 100);
        return () => clearInterval(interval);
    }, [boostLevel]);

    // ⚡ 스페이스바 입력 시 1단계씩 누적 강화 (최대 5단)
    const handleBoostStack = useCallback(() => {
        if (nitroGauge < 8) {
            addToast('⚠️ 니트로 잔여량이 부족합니다! 충전을 기다려주세요.', 'warning');
            return;
        }

        playArcadeSound();

        setBoostLevel(prevLevel => {
            const nextLevel = Math.min(5, prevLevel + 1);

            // 레벨별 토스트 안내
            const messages = {
                1: '⚡ 1단 점화! (연비 우수 순항)',
                2: '⚡⚡ 2단 강화! (더블 부스트 가속)',
                3: '⚡⚡⚡ 3단 돌파! (트리플 오버드라이브)',
                4: '⚡⚡⚡⚡ 4단 쿼드 출력! (초고속 제트 추진)',
                5: '🔥⚡ 5단 MAX HYPER GOD-SPEED! (초극대 출력 · 급속 소모!)'
            };
            addToast(messages[nextLevel], nextLevel === 5 ? 'error' : 'success');

            // 2.5초 동안 추가 입력이 없을 경우 한 단계씩 하향 감쇠
            if (decayTimerRef.current) clearTimeout(decayTimerRef.current);
            decayTimerRef.current = setTimeout(() => {
                setBoostLevel(curr => Math.max(0, curr - 1));
            }, 2500);

            return nextLevel;
        });
    }, [nitroGauge, addToast]);

    // 스페이스바 키 이벤트 바인딩
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space' && !e.repeat) {
                if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
                e.preventDefault();
                handleBoostStack();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (decayTimerRef.current) clearTimeout(decayTimerRef.current);
        };
    }, [handleBoostStack]);

    const todayStr = useMemo(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }, []);

    // 🔮 1년 뒤 미래 예상 자산 (아이디어 9)
    const futureNetProjection = useMemo(() => {
        if (monthlyProjections && monthlyProjections.length >= 12) {
            return Number(monthlyProjections[11].net || monthlyProjections[11].projectedNet || 0);
        }
        if (monthlyProjections && monthlyProjections.length > 0) {
            const last = monthlyProjections[monthlyProjections.length - 1];
            return Number(last.net || last.projectedNet || currentNet * 1.15);
        }
        return Math.round(currentNet * 1.12);
    }, [monthlyProjections, currentNet]);

    // 🎯 목표 마일스톤 페이스메이커 (아이디어 10)
    const paceCarTarget = useMemo(() => {
        const base = targetAmount && targetAmount > currentNet ? targetAmount : null;
        if (base) return base;
        const targets = [1000, 3000, 5000, 10000, 20000, 30000, 50000, 100000, 200000];
        const next = targets.find(t => t > currentNet);
        return next || currentNet * 1.25;
    }, [targetAmount, currentNet]);

    // 🏁 레이서 목록 빌드 (플레이어 + 고스트 + 미래 쉐도우 + 페이스메이커)
    const racers = useMemo(() => {
        const playerVal = metricType === 'net' ? currentNet : currentGross;
        const player = {
            id: 'player_now',
            name: '현재의 나 (PLAYER)',
            label: 'NOW',
            date: todayStr,
            value: playerVal,
            netWorth: currentNet,
            grossWorth: currentGross,
            isPlayer: true,
            isGhost: false,
            isAth: false,
            isFuture: false,
            isPaceCar: false,
            category: 'all',
            color: '#ef4444'
        };

        const listHistory = (assetHistory && assetHistory.length > 0)
            ? assetHistory
            : (isDemoMode ? [
                { date: '2026-09-26', netWorth: currentNet * 0.98, grossWorth: currentGross * 0.98 },
                { date: '2026-09-19', netWorth: currentNet * 0.95, grossWorth: currentGross * 0.95 },
                { date: '2026-09-03', netWorth: currentNet * 0.91, grossWorth: currentGross * 0.91 },
                { date: '2026-08-04', netWorth: currentNet * 0.88, grossWorth: currentGross * 0.88 },
                { date: '2026-07-05', netWorth: currentNet * 0.84, grossWorth: currentGross * 0.84 },
                { date: '2026-04-06', netWorth: currentNet * 0.78, grossWorth: currentGross * 0.78 },
                { date: '2025-10-03', netWorth: currentNet * 0.70, grossWorth: currentGross * 0.70 },
                { date: '2026-09-10', netWorth: currentNet * 1.05, grossWorth: currentGross * 1.05 }
            ] : []);

        const sorted = [...listHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
        const matched = [];
        const usedDates = new Set();
        const nowMs = new Date().getTime();
        const oneDayMs = 24 * 60 * 60 * 1000;

        let ath = sorted[0];
        sorted.forEach(item => {
            const v = metricType === 'net' ? (item.netWorth || 0) : (item.grossWorth || 0);
            const athV = ath ? (metricType === 'net' ? (ath.netWorth || 0) : (ath.grossWorth || 0)) : 0;
            if (v > athV) ath = item;
        });

        const ghostRules = [
            { days: 7, name: '7일 전의 나', id: '7d', category: 'sprint', color: '#06b6d4', tolerance: 3 },
            { days: 14, name: '14일 전의 나', id: '14d', category: 'sprint', color: '#0ea5e9', tolerance: 4 },
            { days: 30, name: '30일 전의 나', id: '30d', category: 'gp', color: '#3b82f6', tolerance: 6 },
            { days: 60, name: '60일 전의 나', id: '60d', category: 'gp', color: '#6366f1', tolerance: 10 },
            { days: 90, name: '90일 전의 나', id: '90d', category: 'championship', color: '#8b5cf6', tolerance: 15 },
            { days: 180, name: '180일 전의 나', id: '180d', category: 'championship', color: '#a855f7', tolerance: 25 },
            { days: 365, name: '1년 전의 나 (YoY)', id: '365d', category: 'legacy', color: '#d946ef', tolerance: 45 },
        ];

        ghostRules.forEach(rule => {
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
                    isFuture: false,
                    isPaceCar: false,
                    category: rule.category,
                    color: rule.color
                });
            }
        });

        // ATH 고스트
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
                    isFuture: false,
                    isPaceCar: false,
                    category: 'legacy',
                    color: '#f59e0b'
                });
            }
        }

        // 🔮 미래 쉐도우 카트
        if (futureNetProjection && futureNetProjection > 0) {
            matched.push({
                id: 'ghost_future',
                name: '1년 뒤의 나 (예상치)',
                label: 'FUTURE SHADOW 🔮',
                date: '1년 뒤 예상',
                value: futureNetProjection,
                netWorth: futureNetProjection,
                grossWorth: futureNetProjection,
                isPlayer: false,
                isGhost: true,
                isAth: false,
                isFuture: true,
                isPaceCar: false,
                category: 'legacy',
                color: '#a855f7'
            });
        }

        // 🎯 목표 페이스메이커
        if (paceCarTarget && paceCarTarget > 0) {
            matched.push({
                id: 'pace_car',
                name: `목표 페이스메이커 (${formatNumber(paceCarTarget, displayMode)}만)`,
                label: 'PACE CAR 🚨',
                date: '목표선',
                value: paceCarTarget,
                netWorth: paceCarTarget,
                grossWorth: paceCarTarget,
                isPlayer: false,
                isGhost: false,
                isAth: false,
                isFuture: false,
                isPaceCar: true,
                category: 'all',
                color: '#eab308'
            });
        }

        let filtered = matched;
        if (raceMode === 'sprint') filtered = matched.filter(m => m.category === 'sprint' || m.isAth || m.isPaceCar);
        else if (raceMode === 'gp') filtered = matched.filter(m => m.category === 'gp' || m.category === 'sprint' || m.isAth || m.isPaceCar);
        else if (raceMode === 'championship') filtered = matched.filter(m => m.category === 'championship' || m.category === 'gp' || m.isAth || m.isFuture || m.isPaceCar);
        else if (raceMode === 'legacy') filtered = matched.filter(m => m.category === 'legacy' || m.isAth || m.isFuture || m.isPaceCar);

        const list = [player, ...filtered];
        list.sort((a, b) => b.value - a.value);

        return list.map((r, i) => ({
            ...r,
            rank: i + 1,
            diffFromPlayer: r.value - playerVal
        }));
    }, [assetHistory, currentNet, currentGross, metricType, raceMode, isDemoMode, todayStr, futureNetProjection, paceCarTarget, formatNumber, displayMode]);

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

    // X좌표 스케일링 (1단~5단 부스트 레벨에 비례하는 전방 서징)
    const { minVal, maxVal } = useMemo(() => {
        const vals = racers.map(r => r.value);
        let min = Math.min(...vals);
        let max = Math.max(...vals);
        const diff = max - min || 1000;
        return { minVal: Math.max(0, min - diff * 0.08), maxVal: max + diff * 0.12 };
    }, [racers]);

    const getKartXPosition = (val, isPlayer) => {
        if (maxVal === minVal) return 42;
        let pct = ((val - minVal) / (maxVal - minVal)) * 50 + 15;
        // 1단(+3%) ~ 5단(+15%) 레벨별 가속 전방 서징
        if (isPlayer && boostLevel > 0) {
            const surgeBonus = boostLevel * 3; // 3%, 6%, 9%, 12%, 15%
            pct = pct + surgeBonus;
        }
        return Math.min(75, Math.max(14, pct));
    };

    return (
        <div className="space-y-4">
            {/* 정돈된 F1 아케이드 CSS 애니메이션 */}
            <style>{`
                @keyframes roadScrollFast {
                    0% { background-position: 0 0; }
                    100% { background-position: -240px 0; }
                }
                @keyframes curbScrollFast {
                    0% { background-position: 0 0; }
                    100% { background-position: -120px 0; }
                }
                @keyframes suspensionBounce {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-1.5px); }
                }
                @keyframes kartBoostShake {
                    0%, 100% { transform: translate(0, 0); }
                    25% { transform: translate(-1px, 0.8px); }
                    50% { transform: translate(1px, -0.8px); }
                    75% { transform: translate(-0.8px, -0.5px); }
                }
                @keyframes flameFlickerIdle {
                    0%, 100% { transform: scaleY(1); opacity: 0.8; }
                    50% { transform: scaleY(1.15) scaleX(0.95); opacity: 1; }
                }
                @keyframes flameFlickerBoost {
                    0%, 100% { transform: scaleY(1) scaleX(1); opacity: 0.9; }
                    50% { transform: scaleY(1.25) scaleX(1.1); opacity: 1; }
                }
                @keyframes spinFast {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes strobeLight {
                    0%, 49% { fill: #ef4444; filter: drop-shadow(0 0 6px #ef4444); }
                    50%, 100% { fill: #3b82f6; filter: drop-shadow(0 0 6px #3b82f6); }
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
                .animate-kart-boost-shake {
                    animation: kartBoostShake 0.05s ease-in-out infinite;
                }
                .animate-flame-flicker-idle {
                    animation: flameFlickerIdle 0.12s ease-in-out infinite;
                }
                .animate-flame-flicker-boost {
                    animation: flameFlickerBoost 0.05s ease-in-out infinite;
                }
                .animate-spin-fast {
                    animation: spinFast 0.12s linear infinite;
                }
                .animate-strobe {
                    animation: strobeLight 0.2s steps(2) infinite;
                }
            `}</style>

            {/* 1. 아케이드 F1 스피드 콕핏 헤더 */}
            <div className={`bg-slate-950 text-white rounded-2xl border-2 transition-all p-4 sm:p-5 relative overflow-hidden ${
                boostLevel === 5 
                    ? 'border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.35)]' 
                    : boostLevel >= 3 
                    ? 'border-cyan-500 shadow-[0_0_25px_rgba(6,182,212,0.3)]' 
                    : boostLevel >= 1 
                    ? 'border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.25)]' 
                    : 'border-slate-800 shadow-xl'
            }`}>
                <div className={`absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-300 ${
                    boostLevel === 5 ? 'bg-pink-600/30 scale-140' :
                    boostLevel >= 3 ? 'bg-cyan-600/25 scale-125' :
                    boostLevel >= 1 ? 'bg-rose-600/20 scale-110' :
                    'bg-indigo-600/10'
                }`} />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* 순위 & 속도 HUD */}
                    <div className="flex items-center gap-3">
                        <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black shadow-lg border-2 transition-all ${
                            boostLevel === 5
                                ? 'bg-gradient-to-br from-pink-500 via-rose-500 to-indigo-600 border-pink-300 text-white shadow-pink-500/50 animate-pulse scale-105'
                                : boostLevel >= 3
                                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 border-cyan-300 text-white shadow-cyan-500/40 animate-pulse'
                                : boostLevel >= 1
                                ? 'bg-gradient-to-br from-rose-500 to-amber-600 border-amber-300 text-white shadow-rose-500/30'
                                : playerRank === 1 
                                ? 'bg-gradient-to-br from-amber-400 to-yellow-600 border-yellow-300 text-slate-950 shadow-amber-500/40' 
                                : 'bg-slate-900 border-indigo-500/50 text-white shadow-indigo-500/20'
                        }`}>
                            <span className="text-[10px] font-mono opacity-80 leading-none">RANK</span>
                            <span className="text-2xl font-black leading-tight">P{playerRank}</span>
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                                    <span>🏎️ 자산 고스트 레이싱</span>
                                </h3>
                                {/* 5단계 레벨 배지 */}
                                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border flex items-center gap-1 transition-all ${
                                    boostLevel === 5 ? 'bg-pink-500/25 text-pink-300 border-pink-500/50 shadow-pink-500/30 animate-pulse' :
                                    boostLevel === 4 ? 'bg-purple-500/25 text-purple-300 border-purple-500/50' :
                                    boostLevel === 3 ? 'bg-cyan-500/25 text-cyan-300 border-cyan-500/50' :
                                    boostLevel === 2 ? 'bg-amber-500/25 text-amber-300 border-amber-500/50' :
                                    boostLevel === 1 ? 'bg-rose-500/25 text-rose-300 border-rose-500/50' :
                                    'bg-slate-800 text-slate-400 border-slate-700'
                                }`}>
                                    <span>{boostLevel > 0 ? '⚡' : '🏁'}</span>
                                    <span>
                                        {boostLevel === 5 ? 'MAX HYPER 5X (초극대)' :
                                         boostLevel === 4 ? 'STAGE 4 (쿼드 출력)' :
                                         boostLevel === 3 ? 'STAGE 3 (오버드라이브)' :
                                         boostLevel === 2 ? 'STAGE 2 (더블 부스트)' :
                                         boostLevel === 1 ? 'STAGE 1 (기본 가속)' :
                                         'READY'}
                                    </span>
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                                <span>순위: <strong>{playerRank}위 / {totalCount}대</strong></span>
                                <span>•</span>
                                <span>속도: <strong className={`font-mono text-sm ${
                                    boostLevel === 5 ? 'text-pink-400 font-black text-base animate-bounce' :
                                    boostLevel >= 3 ? 'text-cyan-300 font-black' :
                                    boostLevel >= 1 ? 'text-rose-400 font-bold' :
                                    'text-slate-200'
                                }`}>{currentSpeedKmH} KM/H</strong></span>
                            </p>
                        </div>
                    </div>

                    {/* 액션 컨트롤러: 5단 스택 니트로 게이지 바 & 스페이스바 연타 버튼 */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* ⚡ 5단 니트로 스택 연료 게이지 셀 */}
                        <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-3">
                            <div className="flex flex-col">
                                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 gap-3">
                                    <div className="flex items-center gap-1.5">
                                        <span>NITRO CELL</span>
                                        {/* 5단 세그먼트 LED 인디케이터 */}
                                        <div className="flex items-center gap-0.5">
                                            {[1, 2, 3, 4, 5].map((lvl) => (
                                                <div 
                                                    key={lvl}
                                                    className={`w-2 h-2 rounded-xs transition-all ${
                                                        boostLevel >= lvl
                                                            ? lvl === 5 ? 'bg-pink-500 shadow-[0_0_6px_#ec4899] animate-pulse'
                                                            : lvl >= 3 ? 'bg-cyan-400 shadow-[0_0_4px_#38bdf8]'
                                                            : 'bg-amber-400 shadow-[0_0_4px_#f59e0b]'
                                                            : 'bg-slate-800 border border-slate-700/60'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <span className={`font-mono font-black ${
                                        nitroGauge >= 70 ? 'text-cyan-400' : nitroGauge >= 35 ? 'text-amber-400' : 'text-rose-400'
                                    }`}>
                                        {Math.round(nitroGauge)}%
                                    </span>
                                </div>

                                {/* 잔여량 비례 프로그레스 바 */}
                                <div className="w-36 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5 mt-0.5">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-75 ${
                                            boostLevel === 5 
                                                ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-cyan-400 shadow-[0_0_10px_#ec4899]'
                                                : boostLevel >= 3 
                                                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_8px_#38bdf8]' 
                                                : nitroGauge >= 35 
                                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_8px_#f59e0b]' 
                                                : 'bg-gradient-to-r from-rose-500 to-red-600 shadow-[0_0_8px_#ef4444]'
                                        }`}
                                        style={{ width: `${nitroGauge}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 🔥 5단 스택 강화 부스터 버튼 (스페이스바 연타) */}
                        <button
                            onClick={handleBoostStack}
                            disabled={nitroGauge < 8}
                            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg ${
                                boostLevel === 5
                                    ? 'bg-gradient-to-r from-pink-500 via-rose-600 to-indigo-600 text-white scale-105 shadow-pink-500/60 ring-2 ring-pink-300 animate-pulse'
                                    : boostLevel >= 3
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white scale-105 shadow-cyan-500/50 ring-2 ring-cyan-300'
                                    : boostLevel >= 1
                                    ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white scale-102 shadow-rose-500/40 ring-1 ring-amber-300'
                                    : nitroGauge >= 8
                                    ? 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white hover:scale-105 active:scale-95 shadow-rose-600/30 cursor-pointer'
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                            }`}
                        >
                            <span>⚡</span>
                            <span>
                                {boostLevel === 0 && 'NITRO (SPACE)'}
                                {boostLevel === 1 && '2단 강화 (SPACE)'}
                                {boostLevel === 2 && '3단 강화 (SPACE)'}
                                {boostLevel === 3 && '4단 강화 (SPACE)'}
                                {boostLevel === 4 && '5단 최대 강화! (SPACE)'}
                                {boostLevel === 5 && '🔥 5X 유지 (SPACE)'}
                            </span>
                        </button>

                        {/* 체험 모드 토글 */}
                        <button
                            onClick={() => {
                                setIsDemoMode(prev => !prev);
                                addToast(!isDemoMode ? '🎮 체험 모드 활성화 (8대 풀 그리드)' : '실제 자산 데이터로 복귀', 'info');
                            }}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                                isDemoMode 
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                        >
                            {isDemoMode ? '체험 모드 ON' : '체험 모드'}
                        </button>
                    </div>
                </div>

                {/* 하단 툴바: 리그 선택 & 기준 전환 */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                    {/* 레이스 리그 탭 */}
                    <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
                        <span className="text-slate-500 px-1.5 font-bold">리그:</span>
                        {[
                            { id: 'all', label: '전체 (ALL)' },
                            { id: 'sprint', label: '스프린트 (7-14일)' },
                            { id: 'gp', label: '그랑프리 (30-60일)' },
                            { id: 'championship', label: '챔피언십 (90-180일)' },
                            { id: 'legacy', label: '레거시 (1년+ATH)' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setRaceMode(tab.id)}
                                className={`px-2 py-1 rounded-md font-semibold transition-all ${
                                    raceMode === tab.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* 지표 기준 */}
                    <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
                        <span className="text-slate-500 px-1.5 font-bold">기준:</span>
                        <button
                            onClick={() => setMetricType('net')}
                            className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                                metricType === 'net' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            순자산 기준
                        </button>
                        <button
                            onClick={() => setMetricType('gross')}
                            className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                                metricType === 'gross' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            총자산 기준
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. OVERTAKE TARGET HUD */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border border-indigo-500/40 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
                <div className="flex items-center gap-3">
                    <div className="text-3xl">
                        {nextTarget?.isPaceCar ? '🚨' : nextTarget?.isFuture ? '🔮' : '🎯'}
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                            {isAllWon ? 'CHAMPION OF THE TRACK' : nextTarget?.isPaceCar ? 'MILESTONE PACE CAR' : 'NEXT OVERTAKE TARGET'}
                        </div>
                        {isAllWon ? (
                            <div className="text-base sm:text-lg font-black text-amber-300 flex items-center gap-1.5">
                                <span>👑 과거의 모든 나를 제치고 역대 최고 기록으로 단독 질주 중!</span>
                            </div>
                        ) : nextTarget ? (
                            <div className="text-sm sm:text-base font-black text-slate-100 flex items-center gap-1.5">
                                <span>다음 추월 목표:</span>
                                <span className={`underline ${nextTarget.isPaceCar ? 'text-amber-400' : nextTarget.isFuture ? 'text-purple-400' : 'text-cyan-400'}`}>
                                    {nextTarget.name}
                                </span>
                                <span className="text-xs text-slate-400 font-normal">({nextTarget.date})</span>
                            </div>
                        ) : (
                            <div className="text-xs text-slate-400">
                                히스토리 기록이 누적되면 차례대로 고스트가 해금되어 출전합니다!
                            </div>
                        )}
                    </div>
                </div>

                {nextTarget && !isAllWon && (
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 text-right">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">추월까지 남은 자산 격차</span>
                        <span className="text-sm sm:text-lg font-black font-mono text-rose-400">
                            +{formatNumber(nextTarget.value - (metricType === 'net' ? currentNet : currentGross), displayMode)}만원
                        </span>
                    </div>
                )}
            </div>

            {/* 3. 2D 멀티레인 서킷 (정돈된 다크 아스팔트 트랙) */}
            <div className="bg-slate-950 rounded-2xl border-2 border-slate-800 shadow-2xl p-4 sm:p-5 relative overflow-hidden">
                {/* 상단 F1 연석 */}
                <div className="w-full h-3 rounded-t-lg animate-curbs border-b border-black opacity-80" />

                {/* 서킷 트랙 바디 */}
                <div className="relative py-2.5 space-y-3 bg-slate-900/90 border-x border-slate-800">
                    {/* 피니시 라인 체커기 바 (우측 숫자 영역 앞쪽에 배치하여 겹침 방지) */}
                    <div className="absolute top-0 bottom-0 right-[115px] sm:right-[135px] w-5 z-20 pointer-events-none opacity-45 bg-[repeating-conic-gradient(#fff_0_25%,#000_0_50%)] [background-size:10px_10px] border-r border-amber-400/60 shadow-lg" />

                    {/* 각 레인별 카트 주행 */}
                    {racers.map((racer) => {
                        const posX = getKartXPosition(racer.value, racer.isPlayer);
                        const isPlayer = racer.isPlayer;

                        return (
                            <div 
                                key={racer.id}
                                className={`relative h-20 sm:h-22 rounded-xl border flex items-center transition-all ${
                                    isPlayer 
                                        ? boostLevel === 5
                                            ? 'bg-slate-950/95 border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.4)] z-25'
                                            : boostLevel >= 3
                                            ? 'bg-slate-950/90 border-cyan-500 shadow-[0_0_25px_rgba(6,182,212,0.3)] z-25'
                                            : boostLevel >= 1
                                            ? 'bg-slate-950/85 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.25)] z-22'
                                            : 'bg-slate-950/80 border-rose-500/70 shadow-[0_0_20px_rgba(239,68,68,0.2)] z-20' 
                                        : racer.isPaceCar
                                        ? 'bg-amber-950/40 border-amber-500/60 shadow-md z-15'
                                        : racer.isFuture
                                        ? 'bg-purple-950/40 border-purple-500/50 shadow-sm z-12'
                                        : racer.isAth
                                        ? 'bg-slate-950/60 border-amber-500/40 z-10'
                                        : 'bg-slate-950/40 border-slate-800/80 z-0'
                                }`}
                            >
                                {/* 도로 중앙 점선 마커 */}
                                <div className="absolute inset-x-0 h-1 top-1/2 -translate-y-1/2 animate-road-scroll pointer-events-none opacity-40" />

                                {/* 좌측 순위 & 라벨 뱃지 */}
                                <div className="absolute left-3 top-2 z-10 flex items-center gap-2 pointer-events-none">
                                    <span className={`text-[11px] font-black px-2 py-0.5 rounded shadow ${
                                        isPlayer ? 'bg-rose-600 text-white' :
                                        racer.isPaceCar ? 'bg-amber-400 text-black font-extrabold' :
                                        racer.isFuture ? 'bg-purple-600 text-white' :
                                        racer.isAth ? 'bg-amber-500 text-black font-extrabold' :
                                        racer.rank === 1 ? 'bg-yellow-400 text-black' : 'bg-slate-800 text-slate-300'
                                    }`}>
                                        {racer.isPaceCar ? '🚨 PACE' : racer.isFuture ? '🔮 FUTURE' : racer.isAth ? '👑 ATH' : `P${racer.rank}`}
                                    </span>
                                    <span className="text-xs font-bold text-slate-200">
                                        {racer.name}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                                        ({racer.date})
                                    </span>
                                </div>

                                {/* 우측 자산 금액 & 격차 HUD (z-30 플로팅 배지) */}
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 z-30 text-right pointer-events-none bg-slate-950/95 border border-slate-700/80 px-2.5 py-1.5 rounded-lg shadow-md min-w-[95px]">
                                    <div className="text-xs sm:text-sm font-black font-mono text-white">
                                        {formatNumber(racer.value, displayMode)}만
                                    </div>
                                    <div className={`text-[10px] font-mono font-bold ${
                                        isPlayer 
                                            ? 'text-rose-400' 
                                            : racer.diffFromPlayer > 0 
                                            ? 'text-rose-400' 
                                            : 'text-emerald-400'
                                    }`}>
                                        {isPlayer ? 'CURRENT' : (
                                            racer.diffFromPlayer > 0 
                                                ? `+${formatNumber(racer.diffFromPlayer, displayMode)}만` 
                                                : `-${formatNumber(Math.abs(racer.diffFromPlayer), displayMode)}만`
                                        )}
                                    </div>
                                </div>

                                {/* 주행 카트 그래픽 */}
                                <div 
                                    className="absolute transition-all ease-out"
                                    style={{
                                        left: `${posX}%`,
                                        transform: 'translateX(-50%)',
                                        transitionDuration: isPlayer && boostLevel > 0 ? '0.18s' : '0.6s'
                                    }}
                                >
                                    <KartGraphic 
                                        color={racer.color}
                                        isPlayer={isPlayer}
                                        isGhost={racer.isGhost}
                                        isAth={racer.isAth}
                                        isFuture={racer.isFuture}
                                        isPaceCar={racer.isPaceCar}
                                        boostLevel={isPlayer ? boostLevel : 0}
                                        nitroGauge={nitroGauge}
                                        scale={0.92}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 하단 F1 연석 */}
                <div className="w-full h-3 rounded-b-lg animate-curbs border-t border-black opacity-80" />
            </div>

            {/* 4. 고스트 해금 현황 (Ghost Roster) */}
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
                                            <span className="text-base">{r.isPlayer ? '🏎️' : r.isAth ? '👑' : r.isFuture ? '🔮' : r.isPaceCar ? '🚨' : '👻'}</span>
                                            <div>
                                                <div className={`font-black ${r.isPlayer ? 'text-rose-400' : r.isAth ? 'text-amber-400' : r.isFuture ? 'text-purple-400' : r.isPaceCar ? 'text-yellow-400' : 'text-slate-200'}`}>
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
