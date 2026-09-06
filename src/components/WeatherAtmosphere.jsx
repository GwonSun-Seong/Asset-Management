import React, { useEffect, useRef, useState } from 'react';

/**
 * 🌦️ WeatherAtmosphere
 * 
 * - 화면 좌/우 여백(사이드)에만 100% 완전 격리 렌더링 (중앙 1320px 컨텐츠 무침범).
 * - 단조로운 동그라미 대신 다이아몬드 별빛 프리즘(✦), 유기적인 온기 보케, 물결치는 황금빛 아지랑이 구현.
 * - 적당한 양으로 시원하게 내리는 실감나는 빗줄기와, 하늘을 가르고 번뜩이는 강력한 2단계 갈래 천둥 번개(Forked Lightning).
 * - 관리자 모드가 아닐 때는 배너가 아예 안 보임.
 */
export default function WeatherAtmosphere({ 
    dayProfitPct = 0, 
    enabled = true,
    intensity = 70,
    isPro = true,
    isAdmin = false,
    overrideMode = null,
    thresholds = { high: 1.5, low: -1.5 }
}) {
    const canvasRef = useRef(null);
    const [previewMode, setPreviewMode] = useState(overrideMode);

    // 실제 수익률 기반 기본 날씨 계산 (관리자 모드가 아니면 임의 프리뷰 무시)
    const thHigh = (thresholds && typeof thresholds.high === 'number') ? thresholds.high : 1.5;
    const thSunMin = (thresholds && typeof thresholds.sunMin === 'number') ? thresholds.sunMin : 0;
    const thRainMax = (thresholds && typeof thresholds.rainMax === 'number') ? thresholds.rainMax : 0;
    const thLow = (thresholds && typeof thresholds.low === 'number') ? thresholds.low : -1.5;

    const currentMode = (isAdmin ? previewMode : null) || (() => {
        if (dayProfitPct >= thHigh) return 'gold'; // 황금빛 대폭등
        if (dayProfitPct >= thSunMin && dayProfitPct > 0) return 'sun'; // 화창한 상승 (약상승 이상)
        if (dayProfitPct <= thRainMax && dayProfitPct > thLow) return 'rain'; // 차분한 비 (부슬비 이하)
        if (dayProfitPct < thLow) return 'storm'; // 천둥 번개 폭풍우
        return dayProfitPct >= 0 ? 'sun' : 'rain'; // 중립/보합 구간
    })();

    const weatherConfigs = {
        gold: {
            title: '황금빛 대폭등',
            icon: '☀️',
            desc: '양옆 여백에 황금빛 프리즘 별빛과 따스한 아지랑이가 피어오릅니다.',
            badgeColor: 'text-amber-700 dark:text-amber-300 border-amber-500/40 bg-amber-500/15 shadow-amber-500/10',
            ambientLeft: 'from-amber-500/15 via-orange-500/5 to-white dark:to-transparent',
            ambientRight: 'from-amber-500/15 via-orange-500/5 to-white dark:to-transparent'
        },
        sun: {
            title: '화창한 상승',
            icon: '🌤️',
            desc: '양옆 여백에 온화하고 쾌청한 초록빛 햇살과 미세 입자가 감돕니다.',
            badgeColor: 'text-emerald-700 dark:text-emerald-300 border-emerald-500/40 bg-emerald-500/15 shadow-emerald-500/10',
            ambientLeft: 'from-emerald-500/15 via-teal-500/5 to-white dark:to-transparent',
            ambientRight: 'from-emerald-500/15 via-teal-500/5 to-white dark:to-transparent'
        },
        rain: {
            title: '차분한 비',
            icon: '🌧️',
            desc: '좌우 사이드 여백에 시원한 빗줄기가 떨어지며 은은한 천둥이 칩니다.',
            badgeColor: 'text-blue-700 dark:text-blue-300 border-blue-500/40 bg-blue-500/15 shadow-blue-500/10',
            ambientLeft: 'from-blue-600/20 via-indigo-600/5 to-white dark:to-transparent',
            ambientRight: 'from-blue-600/20 via-indigo-600/5 to-white dark:to-transparent'
        },
        storm: {
            title: '천둥 번개 폭풍우',
            icon: '⚡',
            desc: '좌우 여백에 굵은 장대비와 실시간 번개가 내리꽂힙니다.',
            badgeColor: 'text-purple-700 dark:text-purple-300 border-purple-500/40 bg-purple-500/15 shadow-purple-500/10',
            ambientLeft: 'from-purple-700/25 via-indigo-900/10 to-white dark:to-transparent',
            ambientRight: 'from-purple-700/25 via-indigo-900/10 to-white dark:to-transparent'
        }
    };

    const currentConfig = weatherConfigs[currentMode] || weatherConfigs.sun;

    useEffect(() => {
        if (!enabled || intensity <= 0) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animId;
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
            if (!canvasRef.current) return;
            width = canvasRef.current.width = window.innerWidth;
            height = canvasRef.current.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);

        // 중앙 컨텐츠 폭 (max-w-7xl = 1280px + 좌우 패딩)
        const CONTENT_MAX_WIDTH = 1320;

        const getMarginBounds = () => {
            const sideMargin = Math.max(0, (width - CONTENT_MAX_WIDTH) / 2);
            return {
                leftEnd: sideMargin,
                rightStart: width - sideMargin,
                hasMargin: sideMargin > 35
            };
        };

        const isDarkMode = () => document.documentElement.classList.contains('dark');

        const getRandomMarginX = () => {
            const { leftEnd, rightStart } = getMarginBounds();
            if (Math.random() < 0.5) {
                return Math.random() * Math.max(10, leftEnd - 15);
            } else {
                return rightStart + 15 + Math.random() * Math.max(10, width - rightStart - 15);
            }
        };

        // ===== 🌧️ 1. 빗방울 세팅 (너무 적지도, 너무 쏟아지지도 않는 딱 좋은 밸런스) =====
        const isRainMode = currentMode === 'rain' || currentMode === 'storm';
        const raindrops = [];
        const splashes = [];

        if (isRainMode) {
            // 강도(intensity 0~100) 비율에 맞춰 빗방울 개수 유동적 스케일링
            const intensityRatio = Math.max(0.1, intensity / 70);
            const baseCount = currentMode === 'storm' ? 140 : 85;
            const dropCount = Math.round(baseCount * intensityRatio);
            for (let i = 0; i < dropCount; i++) {
                raindrops.push({
                    x: getRandomMarginX(),
                    y: Math.random() * height,
                    length: Math.random() * 18 + 18,    // 18~36px의 날렵한 빗줄기
                    speed: Math.random() * 8 + 12,      // 12~20px/frame의 시원한 낙하
                    opacity: Math.random() * 0.3 + 0.45, // 0.45 ~ 0.75 선명한 시인성
                    thickness: Math.random() * 0.5 + 0.9, // 0.9 ~ 1.4px의 세련된 굵기
                    slant: currentMode === 'storm' ? -2.8 : -1.6
                });
            }
        }

        // ===== ⚡ 2. 천둥 번개 상태 머신 (intensity 50 기준 약 30초 주기, 좌/우 비대칭 단일 사이드) =====
        let lightningAlpha = 0;
        let lightningBranches = null;
        let lastLightningSide = Math.random() < 0.5 ? 'left' : 'right';
        let lightningStartTime = 0;
        let isLightningActive = false;

        // intensity 50 기준 정확히 약 30초 (25~35초) 간격 연산
        const calculateLightningInterval = () => {
            const factor = 50 / Math.max(15, intensity);
            const base = (currentMode === 'storm' ? 30000 : 65000) * factor;
            const jitter = (Math.random() - 0.5) * 8000 * factor;
            return Math.max(15000, base + jitter);
        };

        // 첫 번개는 로드 후 즉시 치지 않고 20~30초 후 자연스럽게 대기 후 발생
        let nextLightning = Date.now() + (calculateLightningInterval() * 0.8);

        const generateLightningBolt = () => {
            const { leftEnd, rightStart } = getMarginBounds();
            // 좌/우 동시 발생 절대 불가: 매번 왼쪽 또는 오른쪽 중 딱 1곳만 선택 (이전 위치와 번갈아가며 자연스럽게)
            const isLeft = lastLightningSide === 'right' ? (Math.random() < 0.7) : (Math.random() < 0.3);
            lastLightningSide = isLeft ? 'left' : 'right';

            const minX = isLeft ? 15 : rightStart + 15;
            const maxX = isLeft ? Math.max(25, leftEnd - 15) : Math.max(rightStart + 25, width - 15);
            let startX = minX + Math.random() * (maxX - minX);
            let startY = 0;

            const mainPoints = [{ x: startX, y: startY }];
            const forks = [];

            while (startY < height * 0.75) {
                startX += (Math.random() - 0.5) * 45;
                // 선택된 사이드 여백을 절대 벗어나지 않도록 클램핑
                startX = Math.max(minX, Math.min(maxX, startX));
                startY += Math.random() * 30 + 20;
                mainPoints.push({ x: startX, y: startY });

                // 가끔 1개 정도만 섬세한 곁가지 분기
                if (Math.random() > 0.8 && forks.length < 2) {
                    let forkX = startX;
                    let forkY = startY;
                    const forkPoints = [{ x: forkX, y: forkY }];
                    const forkDir = Math.random() < 0.5 ? -1 : 1;
                    for (let f = 0; f < 3; f++) {
                        forkX += (Math.random() * 20 + 6) * forkDir;
                        forkX = Math.max(minX, Math.min(maxX, forkX));
                        forkY += Math.random() * 20 + 10;
                        forkPoints.push({ x: forkX, y: forkY });
                    }
                    forks.push(forkPoints);
                }
            }
            return { main: mainPoints, forks };
        };

        // ===== ☀️ 3. 유기적인 황금빛 아지랑이 & 다이아몬드 프리즘 별빛 파티클 =====
        const isSunMode = currentMode === 'gold' || currentMode === 'sun';
        const sunParticles = [];

        if (isSunMode) {
            const intensityRatio = Math.max(0.1, intensity / 70);
            const baseCount = currentMode === 'gold' ? 50 : 30;
            const count = Math.round(baseCount * intensityRatio);
            for (let i = 0; i < count; i++) {
                sunParticles.push({
                    x: getRandomMarginX(),
                    y: Math.random() * height,
                    type: Math.random() > 0.45 ? 'star' : 'shimmer', // 별빛 프리즘(✦) vs 부드러운 빛무리
                    size: Math.random() * 6 + 4,                     // 크기
                    speedY: -(Math.random() * 0.7 + 0.3),
                    speedX: (Math.random() - 0.5) * 0.3,
                    rotation: Math.random() * Math.PI,
                    rotationSpeed: (Math.random() - 0.5) * 0.02,
                    opacity: Math.random() * 0.4 + 0.4,
                    pulseVal: Math.random() * Math.PI * 2,
                    pulseSpeed: Math.random() * 0.04 + 0.015
                });
            }
        }

        // 다이아몬드 4포인트 별빛 프리즘(✦) 드로잉 헬퍼
        const drawDiamondStar = (cx, cy, radius, alpha, color, rotation) => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(rotation);
            ctx.beginPath();
            
            // 4개 끝이 뾰족한 유기적 별빛 형태
            const inner = radius * 0.22;
            ctx.moveTo(0, -radius);
            ctx.quadraticCurveTo(0, -inner, inner, 0);
            ctx.quadraticCurveTo(0, inner, 0, radius);
            ctx.quadraticCurveTo(0, inner, -inner, 0);
            ctx.quadraticCurveTo(0, -inner, 0, -radius);
            ctx.closePath();

            ctx.fillStyle = color.replace('ALPHA', String(alpha));
            ctx.shadowBlur = radius * 1.8;
            ctx.shadowColor = currentMode === 'gold' ? '#f59e0b' : '#10b981';
            ctx.fill();

            // 중심부에 하얀 하이라이트 코어
            ctx.beginPath();
            ctx.arc(0, 0, inner * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, ' + (alpha * 0.9) + ')';
            ctx.fill();
            ctx.restore();
        };

        // ===== 🎬 메인 렌더 루프 =====
        let frameCount = 0;

        const render = () => {
            frameCount++;
            ctx.clearRect(0, 0, width, height);

            const { leftEnd, rightStart, hasMargin } = getMarginBounds();

            if (!hasMargin) {
                animId = requestAnimationFrame(render);
                return;
            }

            const dark = isDarkMode();

            // 🛡️ [철통 클리핑 마스크] 중앙 1320px 컨텐츠는 0.1픽셀도 침범 불가
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, Math.max(0, leftEnd - 10), height);
            ctx.rect(rightStart + 10, 0, Math.max(0, width - rightStart), height);
            ctx.clip();

            // ─────────────────────────────────────────
            // 🌧️ 1. 비 렌더링
            // ─────────────────────────────────────────
            if (isRainMode) {
                const strokeColor = dark
                    ? (currentMode === 'storm' ? '224, 231, 255' : '191, 219, 254') // 다크모드 밝은 하늘색
                    : (currentMode === 'storm' ? '30, 58, 138' : '37, 99, 235');      // 라이트모드 짙은 잉크블루

                ctx.lineCap = 'round';

                for (let i = 0; i < raindrops.length; i++) {
                    const drop = raindrops[i];

                    ctx.lineWidth = drop.thickness;
                    ctx.strokeStyle = 'rgba(' + strokeColor + ', ' + drop.opacity + ')';

                    ctx.beginPath();
                    ctx.moveTo(drop.x, drop.y);
                    ctx.lineTo(drop.x + drop.slant * 4, drop.y + drop.length);
                    ctx.stroke();

                    drop.y += drop.speed;
                    drop.x += drop.slant;

                    if (drop.y > height - 10) {
                        if (splashes.length < 30 && Math.random() > 0.4) {
                            splashes.push({
                                x: drop.x,
                                y: height - Math.random() * 20,
                                radius: 1,
                                maxRadius: Math.random() * 5 + 3,
                                alpha: 0.55
                            });
                        }
                        drop.y = -drop.length - Math.random() * 25;
                        drop.x = getRandomMarginX();
                    }
                }

                // 바닥 스플래시 물결 링
                for (let i = splashes.length - 1; i >= 0; i--) {
                    const s = splashes[i];
                    ctx.beginPath();
                    ctx.ellipse(s.x, s.y, s.radius * 2.2, s.radius * 0.7, 0, 0, Math.PI * 2);
                    ctx.strokeStyle = 'rgba(' + strokeColor + ', ' + s.alpha + ')';
                    ctx.lineWidth = 1.0;
                    ctx.stroke();

                    s.radius += 0.45;
                    s.alpha -= 0.035;
                    if (s.alpha <= 0) splashes.splice(i, 1);
                }

                // ─────────────────────────────────────────
                // ⚡ 천둥 번개 (intensity 50 기준 약 30초 주기, 단일 사이드 번개 줄기만 렌더링)
                // ─────────────────────────────────────────
                const now = Date.now();

                // 새로운 번개 방전 시작
                if (now > nextLightning && !isLightningActive) {
                    isLightningActive = true;
                    lightningStartTime = now;
                    lightningBranches = generateLightningBolt();
                    nextLightning = now + calculateLightningInterval();
                }

                if (isLightningActive && lightningBranches && lightningBranches.main) {
                    const elapsed = now - lightningStartTime;
                    const totalDuration = 850; // 총 약 0.85초 동안 자연스럽게 지속 (기존 150ms 대비 5배 이상 여유)

                    if (elapsed > totalDuration) {
                        isLightningActive = false;
                        lightningAlpha = 0;
                        lightningBranches = null;
                    } else {
                        // 1) 번개 하향 전개 단계 (0 ~ 160ms): 번개가 위에서 아래로 찌지직 내리꽂힘
                        const strikeProgress = Math.min(1, elapsed / 160);

                        // 2) 잔상 및 밝기 계산 (지속적이고 묵직한 여운)
                        if (elapsed < 160) {
                            // 전개 중: 번쩍이는 강한 번개 광원
                            lightningAlpha = dark ? 0.95 : 0.88;
                        } else if (elapsed < 440) {
                            // 주방전 & 미세 일렉트릭 리플 (160ms ~ 440ms): 번개가 화면에 묵직하게 머무르며 지직거림
                            const flicker = Math.sin((elapsed - 160) * 0.045) * 0.12;
                            lightningAlpha = (dark ? 0.88 : 0.80) + flicker;
                        } else {
                            // 서서히 사라지는 여운 (440ms ~ 850ms): 잔여 이온 채널이 부드럽게 감쇄
                            const fadeProgress = (elapsed - 440) / (totalDuration - 440);
                            lightningAlpha = Math.max(0, Math.pow(1 - fadeProgress, 1.3) * (dark ? 0.82 : 0.72));
                        }

                        if (lightningAlpha > 0.01) {
                            ctx.save();
                            // 번개 줄기 광채 효과 (배경 플래시 없이 오직 선 자체에만 네온 글로우 부여)
                            ctx.shadowBlur = dark ? (elapsed < 400 ? 18 : 10) : (elapsed < 400 ? 12 : 6);
                            ctx.shadowColor = dark ? '#c084fc' : '#6366f1';

                            // 메인 줄기: strikeProgress에 맞춰 위에서 아래로 정교하게 뻗어나감
                            const pts = lightningBranches.main;
                            const drawCount = Math.max(2, Math.ceil(pts.length * strikeProgress));

                            ctx.beginPath();
                            ctx.moveTo(pts[0].x, pts[0].y);
                            for (let b = 1; b < drawCount; b++) {
                                ctx.lineTo(pts[b].x, pts[b].y);
                            }
                            ctx.strokeStyle = dark 
                                ? 'rgba(255, 255, 255, ' + lightningAlpha + ')' 
                                : 'rgba(79, 70, 229, ' + lightningAlpha + ')';
                            ctx.lineWidth = dark ? (elapsed < 400 ? 2.6 : 1.8) : (elapsed < 400 ? 2.2 : 1.5);
                            ctx.stroke();

                            // 곁가지 분기: 메인 줄기가 가지 시작 높이에 도달한 후부터 자연스럽게 전개
                            if (lightningBranches.forks && lightningBranches.forks.length > 0 && strikeProgress > 0.35) {
                                const forkAlpha = lightningAlpha * 0.75;
                                ctx.lineWidth = dark ? 1.2 : 1.0;
                                lightningBranches.forks.forEach(fork => {
                                    if (strikeProgress >= 0.7 || (pts[drawCount - 1] && pts[drawCount - 1].y >= fork[0].y)) {
                                        ctx.beginPath();
                                        ctx.moveTo(fork[0].x, fork[0].y);
                                        for (let f = 1; f < fork.length; f++) {
                                            ctx.lineTo(fork[f].x, fork[f].y);
                                        }
                                        ctx.strokeStyle = dark 
                                            ? 'rgba(233, 213, 255, ' + forkAlpha + ')' 
                                            : 'rgba(99, 102, 241, ' + forkAlpha + ')';
                                        ctx.stroke();
                                    }
                                });
                            }
                            ctx.restore();
                        }
                    }
                }
            }

            // ─────────────────────────────────────────
            // ☀️ 2. 황금빛 프리즘 별빛 & 유기적인 아지랑이 렌더링
            // ─────────────────────────────────────────
            if (isSunMode) {
                const baseColor = currentMode === 'gold' 
                    ? (dark ? 'rgba(251, 191, 36, ALPHA)' : 'rgba(217, 119, 6, ALPHA)') 
                    : (dark ? 'rgba(52, 211, 153, ALPHA)' : 'rgba(16, 185, 129, ALPHA)');

                // 파티클 (다이아몬드 별빛 ✦ + 유기적 빛무리)
                for (let i = 0; i < sunParticles.length; i++) {
                    const p = sunParticles[i];
                    p.pulseVal += p.pulseSpeed;
                    p.rotation += p.rotationSpeed;
                    const a = p.opacity + Math.sin(p.pulseVal) * 0.25;
                    const currentAlpha = Math.max(0.1, Math.min(0.85, a));

                    if (p.type === 'star') {
                        // ✦ 다이아몬드 4포인트 별빛 프리즘
                        drawDiamondStar(p.x, p.y, p.size, currentAlpha, baseColor, p.rotation);
                    } else {
                        // 부드러운 페더링 보케 빛무리 (단조로운 원형이 아닌 은은한 빛 방사)
                        const radGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 1.5);
                        radGrad.addColorStop(0, baseColor.replace('ALPHA', String(currentAlpha * 0.8)));
                        radGrad.addColorStop(0.5, baseColor.replace('ALPHA', String(currentAlpha * 0.3)));
                        radGrad.addColorStop(1, baseColor.replace('ALPHA', '0'));
                        ctx.fillStyle = radGrad;
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
                        ctx.fill();
                    }

                    p.y += p.speedY;
                    p.x += p.speedX + Math.sin(p.pulseVal) * 0.4;

                    if (p.y < -20) {
                        p.y = height + 20;
                        p.x = getRandomMarginX();
                    }
                }
            }

            ctx.restore();

            animId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', handleResize);
        };
    }, [currentMode, enabled, intensity]);

    if (!enabled || intensity <= 0) return null;

    const cyclePreview = () => {
        const order = ['storm', 'rain', 'gold', 'sun'];
        const nextIdx = (order.indexOf(currentMode) + 1) % order.length;
        setPreviewMode(order[nextIdx]);
    };

    return (
        <div className="fixed inset-0 pointer-events-none z-[15] overflow-hidden select-none">
            {/* 1. 사이드 여백 전용 고성능 60fps 캔버스 (중앙 클리핑으로 100% 분리) */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

            {/* 2. 좌측 사이드 여백 앰비언트 글로우 바 */}
            <div className={'hidden xl:block absolute top-0 left-0 bottom-0 w-80 3xl:w-96 bg-gradient-to-r ' + currentConfig.ambientLeft + ' pointer-events-none transition-all duration-1000'} />

            {/* 3. 우측 사이드 여백 앰비언트 글로우 바 */}
            <div className={'hidden xl:block absolute top-0 right-0 bottom-0 w-80 3xl:w-96 bg-gradient-to-l ' + currentConfig.ambientRight + ' pointer-events-none transition-all duration-1000'} />

            {/* 4. 데스크톱 좌측 여백 초슬림 인디케이터 (오직 로컬 개발 환경 및 관리자일 때만 표시, 프로덕션 빌드에서는 절대 비노출) */}
            {isAdmin && (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) && (
                <div className="hidden 2xl:flex fixed top-24 left-6 pointer-events-auto z-20 flex-col items-start gap-1 animate-in fade-in">
                    <button 
                        onClick={cyclePreview}
                        className={'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black backdrop-blur-md border shadow-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ' + currentConfig.badgeColor}
                        title="[로컬 전용] 클릭 시 날씨 변경 (천둥 폭풍우 ⚡ ↔ 비 🌧️ ↔ 황금빛 ☀️ ↔ 화창 🌤️)"
                    >
                        <span className="text-sm">{currentConfig.icon}</span>
                        <span>{currentConfig.title}</span>
                        <span className="text-[10px] opacity-75 font-mono">({dayProfitPct > 0 ? '+' : ''}{dayProfitPct.toFixed(2)}%)</span>
                    </button>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold px-1 max-w-[180px] leading-tight">
                        [로컬 테스트] {currentConfig.desc}
                    </span>
                </div>
            )}
        </div>
    );
}
