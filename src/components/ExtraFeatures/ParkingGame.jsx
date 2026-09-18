// ParkingGame.jsx - 30초 정밀 주차 미니게임
import React, { useState, useEffect, useRef, useCallback } from 'react';

// Web Audio API 사운드 생성기 (외부 파일 없이 순수 웹 오디오 합성)
class SoundFx {
    constructor() {
        this.ctx = null;
    }

    init() {
        if (!this.ctx && typeof window !== 'undefined') {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playEngine() {
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(45, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(75, this.ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.12);
        } catch (e) {}
    }

    playCrash() {
        if (!this.ctx) return;
        try {
            const bufferSize = this.ctx.sampleRate * 0.4;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.08));
            }
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, this.ctx.currentTime);
            filter.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.4);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            noise.start();
        } catch (e) {}
    }

    playSuccess(score) {
        if (!this.ctx) return;
        try {
            const notes = score >= 95 ? [523.25, 659.25, 783.99, 1046.50] : [440, 554.37, 659.25];
            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.1);
                gain.gain.setValueAtTime(0, this.ctx.currentTime + idx * 0.1);
                gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + idx * 0.1 + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.1 + 0.35);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(this.ctx.currentTime + idx * 0.1);
                osc.stop(this.ctx.currentTime + idx * 0.1 + 0.35);
            });
        } catch (e) {}
    }

    playTick() {
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.06);
        } catch (e) {}
    }

    playHandbrake() {
        if (!this.ctx) return;
        try {
            // 사이드브레이크/파킹 기어 체결 기계음 (라쳇 딸깍-착)
            [0, 0.04, 0.08, 0.13].forEach((delay, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = idx < 3 ? 'square' : 'triangle';
                osc.frequency.setValueAtTime(idx < 3 ? 1100 + idx * 180 : 380, this.ctx.currentTime + delay);
                gain.gain.setValueAtTime(0.12, this.ctx.currentTime + delay);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + (idx < 3 ? 0.025 : 0.08));
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(this.ctx.currentTime + delay);
                osc.stop(this.ctx.currentTime + delay + (idx < 3 ? 0.025 : 0.08));
            });
        } catch (e) {}
    }

    playWarning() {
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.2);
        } catch (e) {}
    }
}

const sound = new SoundFx();

// 2D 박스 회전 충돌 판정용 SAT (Separating Axis Theorem) 알고리즘
function checkOBBCollision(boxA, boxB) {
    const getAxes = (corners) => {
        const axes = [];
        for (let i = 0; i < 4; i++) {
            const p1 = corners[i];
            const p2 = corners[(i + 1) % 4];
            const edge = { x: p2.x - p1.x, y: p2.y - p1.y };
            const normal = { x: -edge.y, y: edge.x };
            const len = Math.hypot(normal.x, normal.y);
            if (len > 0) axes.push({ x: normal.x / len, y: normal.y / len });
        }
        return axes;
    };

    const project = (corners, axis) => {
        let min = Infinity;
        let max = -Infinity;
        for (const c of corners) {
            const dot = c.x * axis.x + c.y * axis.y;
            if (dot < min) min = dot;
            if (dot > max) max = dot;
        }
        return { min, max };
    };

    const axes = [...getAxes(boxA), ...getAxes(boxB)];
    for (const axis of axes) {
        const pA = project(boxA, axis);
        const pB = project(boxB, axis);
        if (pA.max < pB.min || pB.max < pA.min) {
            return false;
        }
    }
    return true;
}

// 차량의 중심점, 길이(진행축), 폭(측면축), 각도 기반 4개 모서리 좌표 생성
// angle=0: 오른쪽(+X)을 향함. Front is +length/2, Rear is -length/2
function getVehicleCorners(cx, cy, length, width, angle) {
    const hl = length / 2;
    const hw = width / 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const corners = [
        { x: hl, y: -hw }, // 전방 좌측
        { x: hl, y: hw },  // 전방 우측
        { x: -hl, y: hw }, // 후방 우측
        { x: -hl, y: -hw } // 후방 좌측
    ];

    return corners.map(c => ({
        x: cx + c.x * cos - c.y * sin,
        y: cy + c.x * sin + c.y * cos
    }));
}

// 특색 있는 차량 그래픽 렌더러
function drawVehicle(ctx, v, isPlayer = false, gameState = 'playing', keys = {}) {
    const hl = v.length / 2;
    const hw = v.width / 2;

    ctx.save();
    ctx.translate(v.x, v.y);
    ctx.rotate(v.angle);

    // 1. 차체 그림자
    ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    ctx.fillRect(-hl + 3, -hw + 4, v.length, v.width);

    if (isPlayer) {
        // [플레이어 차량]: 골든 옐로우 스포츠 세단
        // 앞바퀴 조향 각도 시각화
        const steerAngle = keys.left ? -0.32 : (keys.right ? 0.32 : 0);
        [-hw - 2, hw + 2].forEach(wheelY => {
            ctx.save();
            ctx.translate(hl - 12, wheelY);
            ctx.rotate(steerAngle);
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(-5, -2, 10, 4);
            ctx.restore();
        });

        // 뒷바퀴
        [-hw - 2, hw + 2].forEach(wheelY => {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(-hl + 8, wheelY - 2, 10, 4);
        });

        // 메인 바디
        ctx.fillStyle = gameState === 'crashed' ? '#991b1b' : '#fbbf24';
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-hl, -hw, v.length, v.width, 6);
        ctx.fill();
        ctx.stroke();

        // 보닛 윤곽 및 에어로 라인
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(hl - 4, -hw + 5);
        ctx.lineTo(hl - 14, -hw + 8);
        ctx.moveTo(hl - 4, hw - 5);
        ctx.lineTo(hl - 14, hw - 8);
        ctx.stroke();

        // 전면 윈드실드 (푸른빛 유리)
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-hl + 24, -hw + 4, 10, v.width - 8);

        // 파노라마 선루프 / 지붕
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-hl + 12, -hw + 4, 12, v.width - 8);

        // 후면 유리
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(-hl + 5, -hw + 4, 7, v.width - 8);

        // 사이드미러
        ctx.fillStyle = '#d97706';
        ctx.fillRect(hl - 18, -hw - 3, 4, 3);
        ctx.fillRect(hl - 18, hw, 4, 3);

        // 전면 헤드라이트 & 전진 조명 빔
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(hl - 3, -hw + 2, 3, 5);
        ctx.fillRect(hl - 3, hw - 7, 3, 5);

        if (gameState === 'playing') {
            ctx.fillStyle = 'rgba(254, 240, 138, 0.22)';
            ctx.beginPath();
            ctx.moveTo(hl, -hw + 3);
            ctx.lineTo(hl + 40, -hw - 14);
            ctx.lineTo(hl + 40, hw + 14);
            ctx.lineTo(hl, hw - 3);
            ctx.closePath();
            ctx.fill();
        }

        // 후면 등: 브레이크 시 밝은 적색, 후진 시 백색 후진등 점등
        const isReversing = v.speed < -0.01;
        const isBraking = keys.down || keys.brake || Math.abs(v.speed) < 0.05;
        ctx.fillStyle = isReversing ? '#ffffff' : (isBraking ? '#ef4444' : '#7f1d1d');
        ctx.fillRect(-hl, -hw + 2, 3, 5);
        ctx.fillRect(-hl, hw - 7, 3, 5);

    } else if (v.type === 'truck') {
        // [1톤 탑차 / 트럭]: 앞 운전석 캡 + 거대한 후면 화물 탑박스
        ctx.fillStyle = '#f1f5f9';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-hl, -hw, v.length - 26, v.width, 3);
        ctx.fill();
        ctx.stroke();

        // 탑차 측면 주름(골판) 라인
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        for (let x = -hl + 8; x < hl - 30; x += 10) {
            ctx.beginPath();
            ctx.moveTo(x, -hw + 2);
            ctx.lineTo(x, hw - 2);
            ctx.stroke();
        }

        // 전방 운전석 캡 (파란색 또는 진회색)
        ctx.fillStyle = v.color || '#1e3a8a';
        ctx.beginPath();
        ctx.roundRect(hl - 26, -hw + 1, 26, v.width - 2, [0, 5, 5, 0]);
        ctx.fill();

        // 캡 전면 유리
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(hl - 12, -hw + 4, 8, v.width - 8);

        // 캡 상단 스포일러 (바람막이)
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(hl - 22, -hw + 4, 8, v.width - 8);

        // 헤드라이트 & 테일라이트
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(hl - 2, -hw + 2, 2, 5);
        ctx.fillRect(hl - 2, hw - 7, 2, 5);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-hl, -hw + 2, 3, 6);
        ctx.fillRect(-hl, hw - 8, 3, 6);

    } else if (v.type === 'suv') {
        // [대형 SUV]: 묵직한 바디, 루프랙, 각진 디자인
        ctx.fillStyle = v.color || '#1e293b';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-hl, -hw, v.length, v.width, 6);
        ctx.fill();
        ctx.stroke();

        // 루프랙 (양쪽 은색 바)
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(-hl + 8, -hw + 3, v.length - 20, 2);
        ctx.fillRect(-hl + 8, hw - 5, v.length - 20, 2);

        // 선루프
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-hl + 12, -hw + 7, v.length - 28, v.width - 14);

        // 윈드실드
        ctx.fillStyle = '#60a5fa';
        ctx.fillRect(hl - 14, -hw + 5, 7, v.width - 10);

        // 헤드라이트 & 테일라이트
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(hl - 2, -hw + 2, 2, 6);
        ctx.fillRect(hl - 2, hw - 8, 2, 6);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-hl, -hw + 2, 3, 6);
        ctx.fillRect(-hl, hw - 8, 3, 6);

    } else if (v.type === 'compact') {
        // [소형 경차]: 짧고 둥근 귀여운 해치백 (캐스퍼/레이 스타일)
        ctx.fillStyle = v.color || '#10b981';
        ctx.strokeStyle = '#047857';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-hl, -hw, v.length, v.width, 7);
        ctx.fill();
        ctx.stroke();

        // 윈드실드 & 루프
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(hl - 12, -hw + 3, 7, v.width - 6);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-hl + 8, -hw + 4, v.length - 22, v.width - 8);

        // 귀여운 원형 헤드라이트
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(hl - 3, -hw + 5, 3, 0, Math.PI * 2);
        ctx.arc(hl - 3, hw - 5, 3, 0, Math.PI * 2);
        ctx.fill();

        // 테일라이트
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-hl, -hw + 2, 3, 5);
        ctx.fillRect(-hl, hw - 7, 3, 5);

    } else if (v.type === 'sports') {
        // [스포츠카]: 대형 리어 스포일러 날개 + 날렵한 보닛
        ctx.fillStyle = v.color || '#dc2626';
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-hl, -hw, v.length, v.width, 5);
        ctx.fill();
        ctx.stroke();

        // 리어 스포일러 (후방 대형 윙)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-hl - 2, -hw + 2, 4, v.width - 4);

        // 보닛 벤트
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(hl - 14, -hw + 6, 6, 3);
        ctx.fillRect(hl - 14, hw - 9, 6, 3);

        // 윈드실드
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-hl + 20, -hw + 4, 10, v.width - 8);

        // 헤드라이트
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(hl - 3, -hw + 2, 3, 4);
        ctx.fillRect(hl - 3, hw - 6, 3, 4);
        ctx.fillStyle = '#f87171';
        ctx.fillRect(-hl, -hw + 2, 3, 4);
        ctx.fillRect(-hl, hw - 6, 3, 4);

    } else {
        // [기본 중형 세단]
        ctx.fillStyle = v.color || '#475569';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-hl, -hw, v.length, v.width, 5);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(hl - 15, -hw + 4, 8, v.width - 8);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-hl + 10, -hw + 4, 14, v.width - 8);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(-hl + 5, -hw + 4, 5, v.width - 8);

        ctx.fillStyle = '#fef08a';
        ctx.fillRect(hl - 2, -hw + 2, 2, 5);
        ctx.fillRect(hl - 2, hw - 7, 2, 5);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-hl, -hw + 2, 3, 5);
        ctx.fillRect(-hl, hw - 7, 3, 5);
    }

    ctx.restore();
}

export default function ParkingGame({ addToast = null }) {
    const canvasRef = useRef(null);
    const [gameState, setGameState] = useState('ready'); // 'ready' | 'playing' | 'crashed' | 'success' | 'timeover'
    const [parkingMode, setParkingMode] = useState('parallel'); // 'parallel' | 'perpendicular' | 'diagonal'
    const [timeLeft, setTimeLeft] = useState(30.0);
    const [scoreInfo, setScoreInfo] = useState(null);
    const [warningMsg, setWarningMsg] = useState('');
    const [stageNumber, setStageNumber] = useState(1);
    const [isInsideZone, setIsInsideZone] = useState(false);
    const [bestScore, setBestScore] = useState(() => {
        try {
            return Number(localStorage.getItem('parking_game_best_score') || 0);
        } catch {
            return 0;
        }
    });

    // 조작 키 입력 상태
    const keysRef = useRef({
        up: false,
        down: false,
        left: false,
        right: false,
        brake: false
    });

    // 게임 물리 엔진 상태
    const gameRef = useRef({
        car: {
            x: 160,
            y: 280,
            length: 56,
            width: 30,
            angle: 0,
            speed: 0,
            accel: 0.032,       // 부드러운 전후진 가속
            maxSpeed: 0.85,      // 정밀 주차 최고 속도
            maxReverse: -0.60,   // 정밀 후진 제어
            friction: 0.80,     // 키에서 손을 떼면 브레이크 없이도 즉각 감속 정지
            turnSpeed: 0.038    // 부드럽고 예리한 조향
        },
        targetSlot: null,
        parkedCars: [],
        particles: [],
        canvasW: 840,
        canvasH: 520,
        lastTime: 0,
        lastTickSecond: 30,
        mode: 'parallel'
    });

    // 스테이지 생성: 3가지 모드 (평행 주차, T자 직각 주차, 사선 주차)
    const initStage = useCallback((stage = 1, forceMode = null) => {
        const modes = ['parallel', 'perpendicular', 'diagonal'];
        const mode = forceMode || modes[(stage - 1) % modes.length];
        setParkingMode(mode);

        const cw = 840;
        const ch = 520;
        let newTargetSlot = null;
        let cars = [];
        let playerCar = null;

        if (mode === 'parallel') {
            // ==========================================
            // 1. 평행 주차 (Parallel Parking)
            // ==========================================
            const slotLength = 122; // 표준 평행 주차 구역 길이
            const slotWidth = 52;
            const curbY = 115;      // 주차 구역 중심 Y

            const slotPositions = [120, 290, 480, 670];
            const targetIdx = Math.random() > 0.5 ? 1 : 2;

            newTargetSlot = {
                x: slotPositions[targetIdx],
                y: curbY,
                length: slotLength,
                width: slotWidth,
                targetAngle: 0, // 수평 평행
                mode: 'parallel',
                label: '평행 주차 구역'
            };

            const obstacleConfigs = [
                { idx: 0, type: 'truck', length: 88, width: 38, color: '#f8fafc', name: '1톤 택배 탑차' },
                { idx: targetIdx === 1 ? 2 : 1, type: 'suv', length: 72, width: 36, color: '#1e293b', name: '대형 SUV' },
                { idx: 3, type: 'sedan', length: 64, width: 32, color: '#2563eb', name: '중형 세단' }
            ];

            obstacleConfigs.forEach(cfg => {
                const posX = slotPositions[cfg.idx] + (Math.random() - 0.5) * 6;
                cars.push({
                    x: posX,
                    y: curbY + (Math.random() - 0.5) * 2,
                    length: cfg.length,
                    width: cfg.width,
                    angle: 0,
                    type: cfg.type,
                    color: cfg.color,
                    label: cfg.name
                });
            });

            // 반대편 차선(하단)에 정차된 차량 1대 추가
            cars.push({
                x: 620,
                y: 430,
                length: 50,
                width: 28,
                angle: Math.PI,
                type: 'compact',
                color: '#10b981',
                label: '소형 경차'
            });

            // 플레이어 출발 위치: 타겟 앞쪽 주행 차선에서 출발
            playerCar = {
                x: 150,
                y: 280,
                length: 56,
                width: 30,
                angle: 0, // 오른쪽 도로 진행 방향
                speed: 0,
                accel: 0.032,
                maxSpeed: 0.85,
                maxReverse: -0.60,
                friction: 0.80,
                turnSpeed: 0.038
            };

        } else if (mode === 'perpendicular') {
            // ==========================================
            // 2. T자 / 직각 주차 (Perpendicular Bay Parking)
            // ==========================================
            const slotLength = 104;
            const slotWidth = 66;
            const totalCols = 7;
            const startX = 85;
            const spacingX = slotWidth + 16;

            const targetRow = Math.random() > 0.5 ? 0 : 1;
            const targetCol = Math.floor(Math.random() * (totalCols - 2)) + 1;
            const targetY = targetRow === 0 ? 100 : 255;

            newTargetSlot = {
                x: startX + targetCol * spacingX,
                y: targetY,
                length: slotLength,
                width: slotWidth,
                targetAngle: Math.PI / 2, // 세로(90도)
                mode: 'perpendicular',
                label: '직각 T자 주차 구역'
            };

            const vehicleTemplates = [
                { type: 'truck', length: 86, width: 38, color: '#f8fafc' },
                { type: 'suv', length: 68, width: 36, color: '#334155' },
                { type: 'compact', length: 48, width: 28, color: '#06b6d4' },
                { type: 'sedan', length: 60, width: 31, color: '#1d4ed8' },
                { type: 'sports', length: 62, width: 32, color: '#dc2626' }
            ];

            for (let row = 0; row < 2; row++) {
                const curY = row === 0 ? 100 : 255;
                for (let col = 0; col < totalCols; col++) {
                    if (row === targetRow && col === targetCol) continue;
                    const isAdjacent = (row === targetRow && (col === targetCol - 1 || col === targetCol + 1));
                    if (isAdjacent || Math.random() < 0.82) {
                        const tmpl = vehicleTemplates[(col + row * 3) % vehicleTemplates.length];
                        cars.push({
                            x: startX + col * spacingX + (Math.random() - 0.5) * 4,
                            y: curY + (Math.random() - 0.5) * 3,
                            length: tmpl.length,
                            width: tmpl.width,
                            angle: Math.PI / 2 + (Math.random() - 0.5) * 0.04,
                            type: tmpl.type,
                            color: tmpl.color,
                            label: `주차 차량 #${col + 1}`
                        });
                    }
                }
            }

            playerCar = {
                x: 130,
                y: 435,
                length: 56,
                width: 30,
                angle: 0,
                speed: 0,
                accel: 0.032,
                maxSpeed: 0.85,
                maxReverse: -0.60,
                friction: 0.80,
                turnSpeed: 0.038
            };

        } else {
            // ==========================================
            // 3. 사선 주차 (Diagonal 45° Parking - 휴게소 스타일)
            // ==========================================
            const slotLength = 110;
            const slotWidth = 66;
            const slotAngle = -Math.PI / 4; // 45도 기울어짐

            const totalSlots = 6;
            const startX = 140;
            const spacingX = 105;
            const slotY = 160;

            const targetCol = Math.floor(Math.random() * (totalSlots - 2)) + 1;

            newTargetSlot = {
                x: startX + targetCol * spacingX,
                y: slotY,
                length: slotLength,
                width: slotWidth,
                targetAngle: slotAngle,
                mode: 'diagonal',
                label: '사선 45° 주차 구역'
            };

            const carTypes = [
                { type: 'suv', length: 68, width: 36, color: '#1e293b' },
                { type: 'sedan', length: 60, width: 31, color: '#e2e8f0' },
                { type: 'compact', length: 48, width: 28, color: '#f59e0b' },
                { type: 'truck', length: 82, width: 38, color: '#f8fafc' },
                { type: 'sports', length: 62, width: 32, color: '#0284c7' }
            ];

            for (let i = 0; i < totalSlots; i++) {
                if (i === targetCol) continue;
                const tmpl = carTypes[i % carTypes.length];
                cars.push({
                    x: startX + i * spacingX,
                    y: slotY,
                    length: tmpl.length,
                    width: tmpl.width,
                    angle: slotAngle,
                    type: tmpl.type,
                    color: tmpl.color,
                    label: `사선 차량 #${i + 1}`
                });
            }

            playerCar = {
                x: 100,
                y: 410,
                length: 56,
                width: 30,
                angle: -Math.PI / 6,
                speed: 0,
                accel: 0.032,
                maxSpeed: 0.85,
                maxReverse: -0.60,
                friction: 0.80,
                turnSpeed: 0.038
            };
        }

        gameRef.current = {
            ...gameRef.current,
            canvasW: cw,
            canvasH: ch,
            targetSlot: newTargetSlot,
            parkedCars: cars,
            particles: [],
            lastTickSecond: 30,
            mode,
            car: playerCar
        };

        setTimeLeft(30.0);
        setScoreInfo(null);
        setWarningMsg('');
        setIsInsideZone(false);
        setGameState('ready');
    }, []);

    // P 키 누름 또는 화면 P 버튼 클릭 시 주차 평가 트리거
    const handleParkAction = useCallback(() => {
        sound.init();

        if (gameState === 'crashed' || gameState === 'timeover' || gameState === 'success') {
            return;
        }

        const { car, targetSlot } = gameRef.current;
        if (!targetSlot) return;

        // 주차 체결 시 차량 즉시 정지
        car.speed = 0;

        // 플레이어 차량 모서리 좌표
        const playerCorners = getVehicleCorners(car.x, car.y, car.length, car.width, car.angle);

        // 타겟 슬롯의 로컬 좌표계로 변환하여 정밀 평가
        const cosS = Math.cos(-targetSlot.targetAngle);
        const sinS = Math.sin(-targetSlot.targetAngle);
        const halfL = targetSlot.length / 2;
        const halfW = targetSlot.width / 2;

        let cornersInsideCount = 0;
        for (const pt of playerCorners) {
            const dx = pt.x - targetSlot.x;
            const dy = pt.y - targetSlot.y;
            const lx = dx * cosS - dy * sinS;
            const ly = dx * sinS + dy * cosS;
            if (Math.abs(lx) <= halfL + 6 && Math.abs(ly) <= halfW + 6) {
                cornersInsideCount++;
            }
        }

        // 중심 오차 거리 (px)
        const dist = Math.hypot(car.x - targetSlot.x, car.y - targetSlot.y);
        const maxThreshold = Math.hypot(targetSlot.length, targetSlot.width) * 0.75;

        // 주차 구역 밖에서 P를 누른 경우 (실격이 아닌 경고 후 계속 조작 허용)
        if (dist > maxThreshold && cornersInsideCount === 0) {
            sound.playWarning();
            const msg = '⚠️ 주차 공간 밖입니다! 초록색 [P] 주차선 안으로 진입한 뒤 P(파킹)를 누르세요.';
            setWarningMsg(msg);
            setTimeout(() => setWarningMsg(''), 3000);
            if (addToast) addToast(msg, 'warning');
            return;
        }

        // 정상 주차 공간 내에서 P 체결 완료!
        sound.playHandbrake();

        // 각도 오차 계산 (정방향 및 후진 주차 모두 180도 대칭 허용)
        let angleDiff = Math.abs((car.angle - targetSlot.targetAngle) % Math.PI);
        if (angleDiff > Math.PI / 2) angleDiff = Math.PI - angleDiff;
        const angleDeg = Math.round((angleDiff * 180) / Math.PI);

        // 점수 산정 (100점 만점 정밀 평가)
        // 1) 정중앙 위치 점수 (최대 50점)
        const positionScore = Math.max(0, Math.round(50 - dist * 1.4));
        // 2) 각도 평행도 점수 (최대 30점)
        const angleScore = Math.max(0, Math.round(30 - angleDeg * 1.5));
        // 3) 주차선 안착 점수 (최대 20점: 4바퀴/모서리 모두 안착 시 20점)
        let boundaryScore = 20;
        if (cornersInsideCount === 3) boundaryScore = 12;
        else if (cornersInsideCount === 2) boundaryScore = 6;
        else if (cornersInsideCount < 2) boundaryScore = 0;

        const totalScore = Math.min(100, Math.max(10, positionScore + angleScore + boundaryScore));

        let grade = 'PERFECT';
        let comment = '정중앙 완벽 칼주차! (칼주차의 신)';
        if (totalScore >= 95) {
            grade = 'PERFECT';
            comment = '주차의 달인! 한 치의 오차도 없는 신의 손놀림!';
        } else if (totalScore >= 85) {
            grade = 'MASTER';
            comment = '특급 베테랑! 각도와 라인이 아주 깔끔합니다!';
        } else if (totalScore >= 75) {
            grade = 'EXCELLENT';
            comment = '우수 주차! 미세한 오차가 있으나 안전하게 통과!';
        } else if (totalScore >= 60) {
            grade = 'GOOD';
            comment = '합격 주차! 주차선 한쪽으로 다소 쏠림 발생';
        } else {
            grade = 'POOR';
            comment = '턱걸이 주차! 주차선 침범 및 각도 틀어짐 감점';
        }

        const info = {
            score: totalScore,
            positionScore,
            angleScore,
            boundaryScore,
            dist: Math.round(dist),
            angleDeg,
            cornersInside: cornersInsideCount,
            grade,
            comment,
            mode: targetSlot.mode,
            timeLeft: Number(timeLeft.toFixed(1))
        };

        sound.playSuccess(totalScore);
        setScoreInfo(info);
        setGameState('success');

        if (totalScore > bestScore) {
            setBestScore(totalScore);
            try {
                localStorage.setItem('parking_game_best_score', String(totalScore));
            } catch {}
        }
    }, [gameState, timeLeft, bestScore, addToast]);

    // 초기 스테이지 설정
    useEffect(() => {
        initStage(stageNumber);
    }, [initStage, stageNumber]);

    // 키보드 이벤트 리스너
    useEffect(() => {
        const handleKeyDown = (e) => {
            sound.init();

            if (['ArrowUp', 'KeyW', 'ArrowDown', 'KeyS', 'ArrowLeft', 'KeyA', 'ArrowRight', 'KeyD', 'Space'].includes(e.code)) {
                e.preventDefault();
            }

            if (e.code === 'ArrowUp' || e.code === 'KeyW') keysRef.current.up = true;
            if (e.code === 'ArrowDown' || e.code === 'KeyS') keysRef.current.down = true;
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') keysRef.current.left = true;
            if (e.code === 'ArrowRight' || e.code === 'KeyD') keysRef.current.right = true;
            if (e.code === 'Space') keysRef.current.brake = true;
            if (e.code === 'KeyR') initStage(stageNumber);

            // [P] 키를 눌렀을 때만 파킹 체결 및 점수 평가!
            if (e.code === 'KeyP') {
                e.preventDefault();
                handleParkAction();
            }

            // 첫 조작 시 게임 시작
            if (gameState === 'ready' && (keysRef.current.up || keysRef.current.down || keysRef.current.left || keysRef.current.right)) {
                setGameState('playing');
            }
        };

        const handleKeyUp = (e) => {
            if (e.code === 'ArrowUp' || e.code === 'KeyW') keysRef.current.up = false;
            if (e.code === 'ArrowDown' || e.code === 'KeyS') keysRef.current.down = false;
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') keysRef.current.left = false;
            if (e.code === 'ArrowRight' || e.code === 'KeyD') keysRef.current.right = false;
            if (e.code === 'Space') keysRef.current.brake = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [gameState, initStage, stageNumber, handleParkAction]);

    // 메인 게임 루프 (60fps Canvas 렌더링 및 물리 엔진)
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animId;

        const updatePhysics = (dt) => {
            const { car, targetSlot, parkedCars, canvasW, canvasH } = gameRef.current;

            if (gameState === 'playing') {
                // 시간 감소
                setTimeLeft(prev => {
                    const next = Math.max(0, prev - dt);
                    const currentSec = Math.ceil(next);
                    if (currentSec <= 5 && currentSec > 0 && currentSec !== gameRef.current.lastTickSecond) {
                        gameRef.current.lastTickSecond = currentSec;
                        sound.playTick();
                    }
                    if (next <= 0) {
                        setGameState('timeover');
                    }
                    return next;
                });

                // 엔진 사운드 효과
                if (keysRef.current.up || keysRef.current.down) {
                    if (Math.random() < 0.12) sound.playEngine();
                }

                // 가속 및 감속 (부드러운 주차 물리)
                if (keysRef.current.up) {
                    car.speed = Math.min(car.speed + car.accel, car.maxSpeed);
                } else if (keysRef.current.down) {
                    car.speed = Math.max(car.speed - car.accel, car.maxReverse);
                } else {
                    // 키를 놓으면 즉시 자연스럽고 부드럽게 감속 정지
                    car.speed *= car.friction;
                    if (Math.abs(car.speed) < 0.015) car.speed = 0;
                }

                // Space 비상 브레이크
                if (keysRef.current.brake) {
                    car.speed *= 0.5;
                    if (Math.abs(car.speed) < 0.015) car.speed = 0;
                }

                // 조향각 회전
                if (Math.abs(car.speed) > 0.005) {
                    const dir = car.speed > 0 ? 1 : -1;
                    if (keysRef.current.left) {
                        car.angle -= car.turnSpeed * dir;
                    }
                    if (keysRef.current.right) {
                        car.angle += car.turnSpeed * dir;
                    }
                }

                // 위치 업데이트
                car.x += Math.cos(car.angle) * car.speed;
                car.y += Math.sin(car.angle) * car.speed;

                // 벽(외곽 경계선) 충돌 판정
                const playerCorners = getVehicleCorners(car.x, car.y, car.length, car.width, car.angle);
                for (const pt of playerCorners) {
                    if (pt.x < 18 || pt.x > canvasW - 18 || pt.y < 18 || pt.y > canvasH - 18) {
                        handleCrash('외곽 펜스/벽에 충돌했습니다!');
                        return;
                    }
                }

                // 주차된 다른 차량과의 SAT OBB 정밀 충돌 판정
                for (const other of parkedCars) {
                    const otherCorners = getVehicleCorners(other.x, other.y, other.length, other.width, other.angle);
                    if (checkOBBCollision(playerCorners, otherCorners)) {
                        handleCrash(`${other.label || '주차된 차량'}과 충돌했습니다!`);
                        return;
                    }
                }

                // 실시간 타겟 주차 구역 진입 상태 체크 (HUD 가이드 표시용)
                if (targetSlot) {
                    const cosS = Math.cos(-targetSlot.targetAngle);
                    const sinS = Math.sin(-targetSlot.targetAngle);
                    const halfL = targetSlot.length / 2;
                    const halfW = targetSlot.width / 2;
                    const inside = playerCorners.every(pt => {
                        const dx = pt.x - targetSlot.x;
                        const dy = pt.y - targetSlot.y;
                        const lx = dx * cosS - dy * sinS;
                        const ly = dx * sinS + dy * cosS;
                        return Math.abs(lx) <= halfL && Math.abs(ly) <= halfW;
                    });
                    setIsInsideZone(inside);
                }
            }
        };

        const handleCrash = (reason) => {
            sound.playCrash();
            setGameState('crashed');
            const { car } = gameRef.current;
            for (let i = 0; i < 24; i++) {
                gameRef.current.particles.push({
                    x: car.x,
                    y: car.y,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 0.5) * 6,
                    life: 1.0,
                    color: Math.random() > 0.5 ? '#f59e0b' : '#ef4444',
                    size: Math.random() * 4 + 2
                });
            }
        };

        const render = (time) => {
            if (!gameRef.current.lastTime) gameRef.current.lastTime = time;
            const dt = Math.min((time - gameRef.current.lastTime) / 1000, 0.1);
            gameRef.current.lastTime = time;

            updatePhysics(dt);

            const { car, targetSlot, parkedCars, particles, canvasW, canvasH, mode } = gameRef.current;

            // 1. 아스팔트 주차장 배경
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(0, 0, canvasW, canvasH);

            // 주차장 외곽 테두리
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 2;
            ctx.strokeRect(18, 18, canvasW - 36, canvasH - 36);

            // ==========================================
            // 모드별 맵 그래픽 렌더링
            // ==========================================
            if (mode === 'parallel') {
                // 상단 보도블럭 / 인도
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(18, 18, canvasW - 36, 50);

                // 보도블록 패턴
                ctx.strokeStyle = '#1e293b';
                ctx.lineWidth = 1;
                for (let x = 18; x < canvasW - 36; x += 30) {
                    ctx.beginPath();
                    ctx.moveTo(x, 18);
                    ctx.lineTo(x, 68);
                    ctx.stroke();
                }

                // 도로 연석(Curb) 노란색/검정색 체크 패턴
                const curbHeight = 12;
                for (let x = 18; x < canvasW - 36; x += 40) {
                    ctx.fillStyle = ((Math.floor(x / 40) % 2) === 0) ? '#eab308' : '#334155';
                    ctx.fillRect(x, 68, 40, curbHeight);
                }

                // 도로 중앙 노란색 점선
                ctx.strokeStyle = '#eab308';
                ctx.lineWidth = 2.5;
                ctx.setLineDash([16, 14]);
                ctx.beginPath();
                ctx.moveTo(25, 360);
                ctx.lineTo(canvasW - 25, 360);
                ctx.stroke();
                ctx.setLineDash([]);

                // 평행 주차 구획선 그리기
                const slotPositions = [120, 290, 480, 670];
                const slotLen = 122;
                const slotWid = 52;
                const curbY = 115;

                slotPositions.forEach((sx) => {
                    const isTarget = targetSlot && Math.abs(targetSlot.x - sx) < 10;
                    if (isTarget) {
                        // 목표 평행 주차 구역 (네온 에메랄드 강조)
                        ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
                        ctx.fillRect(sx - slotLen / 2, curbY - slotWid / 2, slotLen, slotWid);

                        ctx.strokeStyle = '#10b981';
                        ctx.lineWidth = 3;
                        ctx.setLineDash([8, 6]);
                        ctx.strokeRect(sx - slotLen / 2, curbY - slotWid / 2, slotLen, slotWid);
                        ctx.setLineDash([]);

                        ctx.fillStyle = '#10b981';
                        ctx.font = 'bold 22px sans-serif';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText('P', sx, curbY - 6);

                        ctx.font = 'bold 11px sans-serif';
                        ctx.fillText('평행주차 후 [P] 체결', sx, curbY + 14);
                    } else {
                        // 일반 평행 주차 라인 (흰색 점선)
                        ctx.strokeStyle = '#94a3b8';
                        ctx.lineWidth = 1.5;
                        ctx.setLineDash([6, 6]);
                        ctx.strokeRect(sx - slotLen / 2, curbY - slotWid / 2, slotLen, slotWid);
                        ctx.setLineDash([]);
                    }
                });

            } else if (mode === 'perpendicular') {
                // 도로 중앙선 (노란 점선)
                ctx.strokeStyle = '#eab308';
                ctx.lineWidth = 2.5;
                ctx.setLineDash([16, 14]);
                ctx.beginPath();
                ctx.moveTo(25, 360);
                ctx.lineTo(canvasW - 25, 360);
                ctx.stroke();
                ctx.setLineDash([]);

                // 직각 주차 구획선
                const slotW = 66;
                const slotH = 104;
                const totalCols = 7;
                const startX = 85;
                const spacingX = slotW + 16;

                for (let row = 0; row < 2; row++) {
                    const curY = row === 0 ? 100 : 255;
                    for (let col = 0; col < totalCols; col++) {
                        const sx = startX + col * spacingX;
                        const sy = curY;
                        const isTarget = targetSlot && Math.abs(targetSlot.x - sx) < 10 && Math.abs(targetSlot.y - sy) < 10;

                        if (isTarget) {
                            ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
                            ctx.fillRect(sx - slotW / 2, sy - slotH / 2, slotW, slotH);

                            ctx.strokeStyle = '#10b981';
                            ctx.lineWidth = 3;
                            ctx.setLineDash([8, 6]);
                            ctx.strokeRect(sx - slotW / 2, sy - slotH / 2, slotW, slotH);
                            ctx.setLineDash([]);

                            ctx.fillStyle = '#10b981';
                            ctx.font = 'bold 22px sans-serif';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText('P', sx, sy - 8);

                            ctx.font = 'bold 11px sans-serif';
                            ctx.fillText('정차 후 [P] 체결', sx, sy + 16);
                        } else {
                            ctx.strokeStyle = '#cbd5e1';
                            ctx.lineWidth = 2;
                            ctx.strokeRect(sx - slotW / 2, sy - slotH / 2, slotW, slotH);

                            // 바닥 스토퍼
                            ctx.fillStyle = '#64748b';
                            const stopperY = row === 0 ? sy - slotH / 2 + 8 : sy + slotH / 2 - 12;
                            ctx.fillRect(sx - slotW / 2 + 8, stopperY, slotW - 16, 4);
                        }
                    }
                }

            } else {
                // 사선 45도 주차 구역 (휴게소 스타일)
                const totalSlots = 6;
                const startX = 140;
                const spacingX = 105;
                const slotY = 160;
                const slotLen = 110;
                const slotWid = 66;
                const slotAngle = -Math.PI / 4;

                ctx.strokeStyle = '#cbd5e1';
                ctx.fillStyle = '#cbd5e1';
                ctx.lineWidth = 2;
                ctx.setLineDash([]);

                for (let i = 0; i < totalSlots; i++) {
                    const sx = startX + i * spacingX;
                    const isTarget = targetSlot && Math.abs(targetSlot.x - sx) < 10;

                    ctx.save();
                    ctx.translate(sx, slotY);
                    ctx.rotate(slotAngle);

                    if (isTarget) {
                        ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';
                        ctx.fillRect(-slotLen / 2, -slotWid / 2, slotLen, slotWid);

                        ctx.strokeStyle = '#10b981';
                        ctx.lineWidth = 3;
                        ctx.setLineDash([8, 6]);
                        ctx.strokeRect(-slotLen / 2, -slotWid / 2, slotLen, slotWid);
                        ctx.setLineDash([]);

                        ctx.fillStyle = '#10b981';
                        ctx.font = 'bold 22px sans-serif';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText('P', 0, -8);
                        ctx.font = 'bold 11px sans-serif';
                        ctx.fillText('사선 [P] 체결', 0, 16);
                    } else {
                        ctx.strokeStyle = '#cbd5e1';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(-slotLen / 2, -slotWid / 2, slotLen, slotWid);

                        // 스토퍼
                        ctx.fillStyle = '#64748b';
                        ctx.fillRect(slotLen / 2 - 14, -slotWid / 2 + 8, 4, slotWid - 16);
                    }

                    ctx.restore();
                }

                // 하단 도로 유도선
                ctx.strokeStyle = '#eab308';
                ctx.lineWidth = 2;
                ctx.setLineDash([16, 12]);
                ctx.beginPath();
                ctx.moveTo(30, 360);
                ctx.lineTo(canvasW - 30, 360);
                ctx.stroke();
                ctx.setLineDash([]);
            }

            // 2. 주차된 장애물 차량들 렌더링
            for (const pc of parkedCars) {
                drawVehicle(ctx, pc, false, gameState);
            }

            // 3. 플레이어 차량 렌더링
            drawVehicle(ctx, car, true, gameState, keysRef.current);

            // 4. 충돌 파티클 애니메이션
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life -= dt * 2.5;

                ctx.fillStyle = p.color;
                ctx.globalAlpha = Math.max(0, p.life);
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;

                if (p.life <= 0) particles.splice(i, 1);
            }

            animId = requestAnimationFrame(render);
        };

        animId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animId);
    }, [gameState, timeLeft, bestScore]);

    return (
        <div className="p-4 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 text-white select-none">
            {/* 상단 대시보드 헤더 */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        🚗
                    </span>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                                30초 정밀 주차 게임
                            </h2>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                {parkingMode === 'parallel' ? '평행 주차 코스' : parkingMode === 'perpendicular' ? 'T자 직각 주차' : '휴게소 사선 주차'}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                            주차 구역 정렬 후 <strong className="text-emerald-400 font-mono">[P] 키</strong>를 눌러 파킹 기어를 체결하세요!
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* 모드 선택 탭 */}
                    <div className="hidden md:flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
                        <button
                            type="button"
                            onClick={() => initStage(stageNumber, 'parallel')}
                            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                                parkingMode === 'parallel'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            🚗 평행 주차
                        </button>
                        <button
                            type="button"
                            onClick={() => initStage(stageNumber, 'perpendicular')}
                            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                                parkingMode === 'perpendicular'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            🅿️ T자 직각
                        </button>
                        <button
                            type="button"
                            onClick={() => initStage(stageNumber, 'diagonal')}
                            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                                parkingMode === 'diagonal'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            ↗️ 사선 주차
                        </button>
                    </div>

                    {/* 최고 점수 */}
                    <div className="text-right">
                        <div className="text-[10px] font-bold text-slate-400">🏆 최고 점수</div>
                        <div className="text-sm sm:text-base font-black font-mono text-amber-400">
                            {bestScore}점
                        </div>
                    </div>

                    {/* 타이머 */}
                    <div className="text-right pl-3 border-l border-slate-800">
                        <div className="text-[10px] font-bold text-slate-400">⏱️ 남은 시간</div>
                        <div className={`text-base sm:text-xl font-black font-mono tracking-tight ${
                            timeLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
                        }`}>
                            {timeLeft.toFixed(1)}초
                        </div>
                    </div>

                    {/* 컨트롤 버튼 */}
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => initStage(stageNumber, parkingMode)}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-all cursor-pointer flex items-center gap-1"
                        >
                            <span>🔄</span> 재시작 (R)
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const nextStage = stageNumber + 1;
                                setStageNumber(nextStage);
                                initStage(nextStage);
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                        >
                            <span>🎲</span> 새 코스
                        </button>
                    </div>
                </div>
            </div>

            {/* 메인 캔버스 뷰포트 영역 */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex justify-center items-center shadow-inner">
                <canvas
                    ref={canvasRef}
                    width={840}
                    height={520}
                    className="w-full max-w-[840px] aspect-[840/520] object-contain block"
                />

                {/* 주차 구역 안착 시 실시간 파킹 안내 배너 */}
                {gameState === 'playing' && isInsideZone && (
                    <div className="absolute top-4 inset-x-0 mx-auto w-fit px-4 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-500/80 text-emerald-300 text-xs font-black shadow-lg animate-bounce flex items-center gap-2">
                        <span className="text-base">🅿️</span>
                        <span>주차 구역 진입 완료! 원하는 위치에 정지 후 <strong>[P] 키</strong>를 누르세요!</span>
                    </div>
                )}

                {/* 주차 구역 밖에서 P를 눌렀을 때의 경고 안내 */}
                {warningMsg && (
                    <div className="absolute top-4 inset-x-0 mx-auto w-fit px-4 py-1.5 rounded-full bg-amber-950/90 border border-amber-500/80 text-amber-300 text-xs font-bold shadow-lg animate-in fade-in duration-150">
                        {warningMsg}
                    </div>
                )}

                {/* 게임 준비(Ready) 오버레이 안내 */}
                {gameState === 'ready' && (
                    <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-6 space-y-4">
                        <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-300 text-3xl border border-amber-500/30 animate-bounce">
                            🅿️
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-white">
                                방향키(또는 WASD)를 눌러 출발하세요!
                            </h3>
                            <p className="text-xs text-slate-300 max-w-md">
                                {parkingMode === 'parallel' && '탑차와 SUV 사이 평행주차 공간으로 후진 진입한 뒤 [P]를 누르세요.'}
                                {parkingMode === 'perpendicular' && '다른 차량을 피해 초록색 T자 주차 구역에 진입한 뒤 [P]를 누르세요.'}
                                {parkingMode === 'diagonal' && '사선 45도 주차 라인에 맞춰 진입한 뒤 [P]를 누르세요.'}
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300 pt-2">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-mono">W / ↑ 전진</span>
                            <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-mono">S / ↓ 후진</span>
                            <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-mono">A / D 조향</span>
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-900/60 border border-emerald-600 text-emerald-300 font-mono font-bold">🅿️ [P] 파킹 체결</span>
                            <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-mono">💡 손 떼면 자동 감속정지</span>
                        </div>
                    </div>
                )}

                {/* 충돌(Crashed) 오버레이 */}
                {gameState === 'crashed' && (
                    <div className="absolute inset-0 bg-rose-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-center p-6 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                        <div className="text-4xl">💥</div>
                        <h3 className="text-2xl font-black text-rose-300">
                            CRASH! 주차 접촉 사고
                        </h3>
                        <p className="text-sm text-slate-200">
                            다른 차량 또는 벽에 부딪혔습니다! (주차 실패)
                        </p>
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={() => initStage(stageNumber, parkingMode)}
                                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg transition-all cursor-pointer"
                            >
                                🔄 다시 도전하기 (R)
                            </button>
                        </div>
                    </div>
                )}

                {/* 시간 초과(Time Over) 오버레이 */}
                {gameState === 'timeover' && (
                    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-center p-6 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                        <div className="text-4xl">⏰</div>
                        <h3 className="text-2xl font-black text-amber-400">
                            TIME OVER! 30초 초과
                        </h3>
                        <p className="text-sm text-slate-300">
                            30초 내에 주차를 완료하고 [P]를 체결하지 못했습니다!
                        </p>
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={() => initStage(stageNumber, parkingMode)}
                                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-lg transition-all cursor-pointer"
                            >
                                🔄 다시 도전하기 (R)
                            </button>
                        </div>
                    </div>
                )}

                {/* 성공(Success) P체결 평가 오버레이 */}
                {gameState === 'success' && scoreInfo && (
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 space-y-3.5 animate-in fade-in zoom-in-95 duration-250">
                        <div className="text-4xl">
                            {scoreInfo.score >= 95 ? '🏆' : scoreInfo.score >= 80 ? '🌟' : '👍'}
                        </div>
                        <div>
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                {scoreInfo.grade} PARKING
                            </span>
                            <h3 className="text-3xl font-black text-white mt-1">
                                {scoreInfo.score}점!
                            </h3>
                            <p className="text-sm font-semibold text-emerald-400 mt-0.5">
                                {scoreInfo.comment}
                            </p>
                        </div>

                        {/* 점수 세부 평가표 */}
                        <div className="grid grid-cols-4 gap-2 text-xs bg-slate-900/90 border border-slate-800 rounded-xl p-3 max-w-lg w-full">
                            <div>
                                <div className="text-slate-400 text-[10px]">중앙 정렬</div>
                                <div className="font-bold text-white font-mono mt-0.5">{scoreInfo.positionScore} / 50점</div>
                                <div className="text-[9px] text-slate-500">오차 {scoreInfo.dist}px</div>
                            </div>
                            <div className="border-x border-slate-800 px-1">
                                <div className="text-slate-400 text-[10px]">각도 평행도</div>
                                <div className="font-bold text-white font-mono mt-0.5">{scoreInfo.angleScore} / 30점</div>
                                <div className="text-[9px] text-slate-500">오차 {scoreInfo.angleDeg}°</div>
                            </div>
                            <div className="border-r border-slate-800 pr-1">
                                <div className="text-slate-400 text-[10px]">주차선 침범</div>
                                <div className="font-bold text-emerald-400 font-mono mt-0.5">{scoreInfo.boundaryScore} / 20점</div>
                                <div className="text-[9px] text-slate-500">안착 {scoreInfo.cornersInside}/4바퀴</div>
                            </div>
                            <div>
                                <div className="text-slate-400 text-[10px]">남은 시간</div>
                                <div className="font-bold text-amber-400 font-mono mt-0.5">{scoreInfo.timeLeft}초</div>
                                <div className="text-[9px] text-slate-500">30초 타임어택</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <button
                                type="button"
                                onClick={() => initStage(stageNumber, parkingMode)}
                                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all cursor-pointer"
                            >
                                🔄 현재 코스 재도전
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const next = stageNumber + 1;
                                    setStageNumber(next);
                                    initStage(next);
                                }}
                                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
                            >
                                🚀 다음 주차 코스 진행
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 하단 조작 패널 및 가상 버튼 */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800">
                <div className="text-xs text-slate-400 space-y-0.5">
                    <div>
                        ⌨️ <strong className="text-slate-200">키보드 조작</strong>: <span className="font-mono text-amber-300">W / S</span> (전후진), <span className="font-mono text-amber-300">A / D</span> (조향) · <strong className="text-emerald-400 font-mono">[P] 키</strong> (파킹 체결 및 점수 평가)
                    </div>
                    <div className="text-[11px] text-slate-500">
                        💡 <strong className="text-slate-300">감속/정지</strong>: 키에서 손을 떼면 브레이크 없이 부드럽게 감속 정지합니다. 정렬 후 반드시 <strong className="text-emerald-400">[P]</strong>를 눌러야 점수가 매겨집니다!
                    </div>
                </div>

                {/* 가상 D-패드 및 [P] 파킹 버튼 */}
                <div className="flex items-center gap-3">
                    {/* D-Pad */}
                    <div className="grid grid-cols-3 gap-1 w-28">
                        <div></div>
                        <button
                            type="button"
                            onMouseDown={() => { sound.init(); keysRef.current.up = true; if (gameState === 'ready') setGameState('playing'); }}
                            onMouseUp={() => { keysRef.current.up = false; }}
                            onTouchStart={() => { sound.init(); keysRef.current.up = true; if (gameState === 'ready') setGameState('playing'); }}
                            onTouchEnd={() => { keysRef.current.up = false; }}
                            className="p-2 rounded-lg bg-slate-800 active:bg-amber-600 text-xs font-bold text-center border border-slate-700 select-none cursor-pointer"
                        >
                            ▲
                        </button>
                        <div></div>
                        <button
                            type="button"
                            onMouseDown={() => { sound.init(); keysRef.current.left = true; if (gameState === 'ready') setGameState('playing'); }}
                            onMouseUp={() => { keysRef.current.left = false; }}
                            onTouchStart={() => { sound.init(); keysRef.current.left = true; if (gameState === 'ready') setGameState('playing'); }}
                            onTouchEnd={() => { keysRef.current.left = false; }}
                            className="p-2 rounded-lg bg-slate-800 active:bg-amber-600 text-xs font-bold text-center border border-slate-700 select-none cursor-pointer"
                        >
                            ◀
                        </button>
                        <button
                            type="button"
                            onMouseDown={() => { sound.init(); keysRef.current.down = true; if (gameState === 'ready') setGameState('playing'); }}
                            onMouseUp={() => { keysRef.current.down = false; }}
                            onTouchStart={() => { sound.init(); keysRef.current.down = true; if (gameState === 'ready') setGameState('playing'); }}
                            onTouchEnd={() => { keysRef.current.down = false; }}
                            className="p-2 rounded-lg bg-slate-800 active:bg-amber-600 text-xs font-bold text-center border border-slate-700 select-none cursor-pointer"
                        >
                            ▼
                        </button>
                        <button
                            type="button"
                            onMouseDown={() => { sound.init(); keysRef.current.right = true; if (gameState === 'ready') setGameState('playing'); }}
                            onMouseUp={() => { keysRef.current.right = false; }}
                            onTouchStart={() => { sound.init(); keysRef.current.right = true; if (gameState === 'ready') setGameState('playing'); }}
                            onTouchEnd={() => { keysRef.current.right = false; }}
                            className="p-2 rounded-lg bg-slate-800 active:bg-amber-600 text-xs font-bold text-center border border-slate-700 select-none cursor-pointer"
                        >
                            ▶
                        </button>
                    </div>

                    {/* [P] 파킹 체결 전용 버튼 */}
                    <button
                        type="button"
                        onClick={handleParkAction}
                        className={`px-4 py-3 sm:py-3.5 rounded-xl border font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-1 shadow-lg transition-all cursor-pointer select-none active:scale-95 ${
                            isInsideZone
                                ? 'bg-gradient-to-b from-emerald-500 to-teal-600 text-white border-emerald-300 shadow-emerald-900/50 ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900 animate-pulse'
                                : 'bg-gradient-to-b from-slate-800 to-slate-850 hover:from-emerald-900 hover:to-teal-900 text-emerald-300 border-slate-700'
                        }`}
                    >
                        <span className="text-xl leading-none">🅿️</span>
                        <div className="leading-tight text-center">
                            <div>파킹 기어 체결</div>
                            <div className="text-[10px] text-emerald-200/80 font-mono font-normal">[P] 키</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
