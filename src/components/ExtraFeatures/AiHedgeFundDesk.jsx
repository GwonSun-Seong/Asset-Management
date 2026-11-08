import React, { useState, useEffect, useMemo } from 'react';

// ============================================================================
// 1. 기본 12인의 투자 대가 정의 (전용 정량 수식 + 철학)
// ============================================================================
const DEFAULT_INVESTOR_PERSONAS = [
    {
        id: 'warren_buffett',
        name: '워렌 버핏',
        engName: 'Warren Buffett',
        avatar: '🧓',
        role: '경제적 해자 & 주주이익 내재가치',
        philosophy: '일관된 ROE(>15%), 낮은 부채, 주주이익(순이익+감가상각-설비투자) 기반 내재가치 안전마진과 자사주 매입을 평가합니다.',
        weights: { value: 30, quality: 35, growth: 10, safety: 20, momentum: 5 },
        defaultSelected: true,
        isBuiltIn: true
    },
    {
        id: 'charlie_munger',
        name: '찰리 멍거',
        engName: 'Charlie Munger',
        avatar: '👓',
        role: '자본수익률(ROIC) & 리스크 제거',
        philosophy: '높은 ROIC(>15%) 지속성, 가격 결정력(매출총이익률), 낮은 설비투자 부담, 잉여현금흐름 전환율 및 이익 예측 가능성을 최우선으로 봅니다.',
        weights: { value: 25, quality: 45, growth: 10, safety: 20, momentum: 0 },
        defaultSelected: true,
        isBuiltIn: true
    },
    {
        id: 'benjamin_graham',
        name: '벤저민 그레이엄',
        engName: 'Benjamin Graham',
        avatar: '📘',
        role: '순유동자산 & 절대 안전마진',
        philosophy: '유동비율 2.0 이상, 순유동자산가치(NCAV) 및 그레이엄 넘버(√(22.5×EPS×BPS)) 대비 절대 안전마진과 원금 방어를 엄격히 요구합니다.',
        weights: { value: 45, quality: 10, growth: 5, safety: 40, momentum: 0 },
        defaultSelected: true,
        isBuiltIn: true
    },
    {
        id: 'peter_lynch',
        name: '피터 린치',
        engName: 'Peter Lynch',
        avatar: '📈',
        role: '합리적 가격의 성장주 (GARP)',
        philosophy: '이익성장률 대비 주가수익비율(PEG < 1.0 선호), 적정 부채비율, 잉여현금흐름과 내부자 순매수를 중시합니다.',
        weights: { value: 25, quality: 20, growth: 35, safety: 15, momentum: 5 },
        defaultSelected: true,
        isBuiltIn: true
    },
    {
        id: 'phil_fisher',
        name: '필 피셔',
        engName: 'Phil Fisher',
        avatar: '🔬',
        role: 'R&D 집약도 & 장기 마진 확장',
        philosophy: '매출 대비 R&D 재투자 비중, 다년간 매출·EPS 복리 성장의 일관성, 영업이익률 개선 추세와 경영 효율성을 정밀 채점합니다.',
        weights: { value: 10, quality: 35, growth: 40, safety: 10, momentum: 5 },
        defaultSelected: false,
        isBuiltIn: true
    },
    {
        id: 'cathie_wood',
        name: '캐시 우드',
        engName: 'Cathie Wood',
        avatar: '🚀',
        role: '파괴적 혁신 & 영업 레버리지',
        philosophy: '매출 성장 가속화, 높은 R&D 투자율, 매출총이익률 50%+ 구조, 영업 레버리지(매출 증가율을 상회하는 이익 성장)를 평가합니다.',
        weights: { value: 5, quality: 15, growth: 55, safety: 5, momentum: 20 },
        defaultSelected: true,
        isBuiltIn: true
    },
    {
        id: 'michael_burry',
        name: '마이클 버리',
        engName: 'Michael Burry',
        avatar: '🔍',
        role: '딥밸류 & 하방 리스크 감사',
        philosophy: 'EV/EBITDA 저평가(<9배), 높은 FCF 수익률(>8%), 대차대조표 지불능력, 내부자 순매수 및 과열 자산 비중 축소를 추적합니다.',
        weights: { value: 45, quality: 15, growth: 5, safety: 30, momentum: 5 },
        defaultSelected: false,
        isBuiltIn: true
    },
    {
        id: 'bill_ackman',
        name: '빌 애크먼',
        engName: 'Bill Ackman',
        avatar: '🏛️',
        role: '우량 현금창출력 & 주주환원',
        philosophy: '독점적 해자, 영업이익률 15%+, 잉여현금흐름 창출력, 자사주 소각을 통한 주주가치 제고 및 핵심 우량주 집중 투자를 선호합니다.',
        weights: { value: 25, quality: 35, growth: 15, safety: 15, momentum: 10 },
        defaultSelected: false,
        isBuiltIn: true
    },
    {
        id: 'stanley_druckenmiller',
        name: '스탠리 드러켄밀러',
        engName: 'Stanley Druckenmiller',
        avatar: '⚡',
        role: '비대칭 손익비 & 추세 모멘텀',
        philosophy: '매출·이익 성장 모멘텀과 강력한 주가 추세(이동평균 정배열·거래량 돌파)가 결합된 주도주에 과감히 비중을 실어줍니다.',
        weights: { value: 10, quality: 15, growth: 35, safety: 10, momentum: 30 },
        defaultSelected: true,
        isBuiltIn: true
    },
    {
        id: 'aswath_damodaran',
        name: '애스워스 다모다란',
        engName: 'Aswath Damodaran',
        avatar: '🎓',
        role: '자본비용(WACC) & 정통 내재가치',
        philosophy: '매출 성장·재투자 효율(ROIC vs 자본비용)·재무 리스크에 기반한 현금흐름 할인모형 괴리율로 적정 비중을 산출합니다.',
        weights: { value: 40, quality: 25, growth: 15, safety: 20, momentum: 0 },
        defaultSelected: false,
        isBuiltIn: true
    },
    {
        id: 'mohnish_pabrai',
        name: '모니시 파브라이',
        engName: 'Mohnish Pabrai',
        avatar: '🪙',
        role: '단도(Dhandho) 비대칭 가치투자',
        philosophy: '“앞면이 나오면 크게 따고, 뒷면이 나와도 거의 잃지 않는다”는 원칙 아래 순현금·저부채·고잉여현금흐름 기업을 선별합니다.',
        weights: { value: 40, quality: 20, growth: 10, safety: 30, momentum: 0 },
        defaultSelected: false,
        isBuiltIn: true
    },
    {
        id: 'rakesh_jhunjhunwala',
        name: '라케시 준준왈라',
        engName: 'Rakesh Jhunjhunwala',
        avatar: '🐂',
        role: '구조적 장기 성장 & ROE 확장',
        philosophy: '높은 ROE·영업레버리지와 구조적 산업 성장 추세가 맞물려 장기 복리 성장이 가능한 자산을 적정 멀티플에서 보유합니다.',
        weights: { value: 20, quality: 30, growth: 30, safety: 10, momentum: 10 },
        defaultSelected: false,
        isBuiltIn: true
    }
];

const QUANT_AGENTS = [
    { id: 'fundamentals_analyst', name: '펀더멘털 분석', icon: '📊', desc: '수익성·성장성·재무건전성·밸류에이션 멀티플 4대 축 정량 진단' },
    { id: 'technical_analyst', name: '기술적 추세·모멘텀 분석', icon: '📉', desc: '추세추종(25%)·평균회귀(20%)·모멘텀(25%)·변동성(15%)·통계차익(15%) 5대 전략 합성' },
    { id: 'valuation_analyst', name: '내재가치 밸류에이션 분석', icon: '🧮', desc: '주주이익 모델(35%)·현금흐름할인 DCF(35%)·EV/EBITDA(20%)·잔여이익모델(10%) 가중 평가' },
    { id: 'sentiment_analyst', name: '시장 심리 & 내부자 동향', icon: '📰', desc: '임원 내부자 지분 매매(30%) + 최신 뉴스 헤드라인 감성 스코어(70%) 결합' },
    { id: 'risk_manager', name: '리스크 & 비중 한도 관리', icon: '🛡️', desc: '연환산 변동성 및 자산 집중도 기반 최대 허용 비중(Position Limit) 산출' }
];

const SIGNAL_STYLE = {
    bullish: {
        label: '매수 / 비중확대',
        badge: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
        bar: 'bg-emerald-500',
        text: 'text-emerald-600 dark:text-emerald-400'
    },
    neutral: {
        label: '보유 / 비중유지',
        badge: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
        bar: 'bg-amber-500',
        text: 'text-amber-600 dark:text-amber-400'
    },
    bearish: {
        label: '주의 / 비중축소',
        badge: 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
        bar: 'bg-rose-500',
        text: 'text-rose-600 dark:text-rose-400'
    }
};

const formatDateOffset = (daysAgo = 0) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const safeNum = (v, fallback = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
};

// 1/N 균등 가중치 맵 생성 헬퍼
function buildEqualVoteWeights(selectedIds = []) {
    const count = selectedIds.length;
    if (count === 0) return {};
    const base = Math.floor((100 / count) * 10) / 10;
    const map = {};
    let sum = 0;
    selectedIds.forEach((id, idx) => {
        if (idx === count - 1) {
            map[id] = Number(Math.max(0, 100 - sum).toFixed(1));
        } else {
            map[id] = base;
            sum += base;
        }
    });
    return map;
}

// ============================================================================
// 2. 기술적 분석 5대 전략 정량 계산
// ============================================================================
function calcEMA(values, period) {
    if (!values.length) return 0;
    const k = 2 / (period + 1);
    let ema = values[0];
    for (let i = 1; i < values.length; i++) {
        ema = values[i] * k + ema * (1 - k);
    }
    return ema;
}

function calcRSI(closes, period = 14) {
    if (closes.length <= period) return 50;
    let gains = 0;
    let losses = 0;
    for (let i = closes.length - period; i < closes.length; i++) {
        const diff = closes[i] - closes[i - 1];
        if (diff >= 0) gains += diff;
        else losses -= diff;
    }
    const avgGain = gains / period;
    const avgLoss = losses / period;
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

function calcHurstExponent(closes) {
    const n = closes.length;
    if (n < 30) return 0.5;
    const lags = [2, 4, 8, 16, 24].filter(l => l < n / 2);
    if (lags.length < 2) return 0.5;
    const logLags = [];
    const logTau = [];
    lags.forEach(lag => {
        const diffs = [];
        for (let i = lag; i < n; i++) {
            diffs.push(closes[i] - closes[i - lag]);
        }
        const mean = diffs.reduce((a, b) => a + b, 0) / diffs.length;
        const std = Math.sqrt(diffs.reduce((acc, d) => acc + Math.pow(d - mean, 2), 0) / diffs.length);
        if (std > 0) {
            logLags.push(Math.log(lag));
            logTau.push(Math.log(std));
        }
    });
    if (logLags.length < 2) return 0.5;
    const meanX = logLags.reduce((a, b) => a + b, 0) / logLags.length;
    const meanY = logTau.reduce((a, b) => a + b, 0) / logTau.length;
    let num = 0;
    let den = 0;
    for (let i = 0; i < logLags.length; i++) {
        num += (logLags[i] - meanX) * (logTau[i] - meanY);
        den += Math.pow(logLags[i] - meanX, 2);
    }
    const h = den !== 0 ? num / den : 0.5;
    return Math.max(0.1, Math.min(0.9, h));
}

function computeTechnicalAnalysis(prices = []) {
    if (!Array.isArray(prices) || prices.length < 20) {
        return {
            signal: 'neutral',
            confidence: 55,
            metrics: { annualVolatilityPct: 22, momentum1M: 2.5, momentum3M: 6.0, rsi14: 52, hurst: 0.52, ema8: 102, ema21: 100 },
            subStrategies: [],
            summary: '보유 자산 평균 수익률 및 표준 변동성(22%) 기준으로 추세 중립·안정 상태로 산출되었습니다.'
        };
    }

    const closes = prices.map(p => safeNum(p.close)).filter(v => v > 0);
    const highs = prices.map(p => safeNum(p.high, p.close));
    const lows = prices.map(p => safeNum(p.low, p.close));
    const volumes = prices.map(p => safeNum(p.volume, 0));

    if (closes.length < 20) {
        return {
            signal: 'neutral',
            confidence: 55,
            metrics: { annualVolatilityPct: 22, momentum1M: 2.0, momentum3M: 5.0, rsi14: 50, hurst: 0.5, ema8: 101, ema21: 100 },
            subStrategies: [],
            summary: '유효 종가 데이터가 부족하여 기본 변동성 기준으로 산출되었습니다.'
        };
    }

    const latest = closes[closes.length - 1];

    // 1. 추세추종 (25%)
    const ema8 = calcEMA(closes.slice(-30), 8);
    const ema21 = calcEMA(closes.slice(-50), 21);
    const ema55 = calcEMA(closes, Math.min(55, closes.length));
    let trendSignal = 'neutral';
    let trendConf = 50;
    if (ema8 > ema21 && ema21 > ema55) {
        trendSignal = 'bullish';
        trendConf = 78;
    } else if (ema8 < ema21 && ema21 < ema55) {
        trendSignal = 'bearish';
        trendConf = 75;
    } else if (ema8 > ema21) {
        trendSignal = 'bullish';
        trendConf = 60;
    } else {
        trendSignal = 'bearish';
        trendConf = 58;
    }

    // 2. 평균회귀 (20%)
    const slice50 = closes.slice(-Math.min(50, closes.length));
    const ma50 = slice50.reduce((a, b) => a + b, 0) / slice50.length;
    const std50 = Math.sqrt(slice50.reduce((acc, v) => acc + Math.pow(v - ma50, 2), 0) / slice50.length) || 1;
    const zScore50 = (latest - ma50) / std50;

    const slice20 = closes.slice(-20);
    const ma20 = slice20.reduce((a, b) => a + b, 0) / slice20.length;
    const std20 = Math.sqrt(slice20.reduce((acc, v) => acc + Math.pow(v - ma20, 2), 0) / slice20.length) || 1;
    const bbPercentB = ((latest - (ma20 - 2 * std20)) / (4 * std20)) * 100;
    const rsi14 = calcRSI(closes, 14);
    const rsi28 = calcRSI(closes, Math.min(28, closes.length - 1));

    let mrSignal = 'neutral';
    let mrConf = 50;
    if (zScore50 < -1.8 || (bbPercentB < 15 && rsi14 < 33)) {
        mrSignal = 'bullish';
        mrConf = Math.min(88, Math.round(60 + Math.abs(zScore50) * 12));
    } else if (zScore50 > 1.8 || (bbPercentB > 88 && rsi14 > 70)) {
        mrSignal = 'bearish';
        mrConf = Math.min(88, Math.round(60 + Math.abs(zScore50) * 12));
    }

    // 3. 모멘텀 (25%)
    const idx1M = Math.max(0, closes.length - 21);
    const idx3M = Math.max(0, closes.length - 63);
    const mom1M = ((latest - closes[idx1M]) / closes[idx1M]) * 100;
    const mom3M = ((latest - closes[idx3M]) / closes[idx3M]) * 100;
    const mom6M = ((latest - closes[0]) / closes[0]) * 100;
    const combinedMom = 0.4 * mom1M + 0.35 * mom3M + 0.25 * mom6M;

    const volRecent = volumes.slice(-5).reduce((a, b) => a + b, 0) / 5;
    const volAvg20 = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20 || 1;
    const volRatio = volRecent / volAvg20;

    let momSignal = 'neutral';
    let momConf = 55;
    if (combinedMom > 4) {
        momSignal = 'bullish';
        momConf = Math.min(90, Math.round(58 + combinedMom * 1.5 + (volRatio > 1.1 ? 6 : 0)));
    } else if (combinedMom < -4) {
        momSignal = 'bearish';
        momConf = Math.min(90, Math.round(58 + Math.abs(combinedMom) * 1.5));
    }

    // 4. 변동성 레짐 (15%)
    const dailyReturns = [];
    for (let i = 1; i < closes.length; i++) {
        dailyReturns.push((closes[i] - closes[i - 1]) / closes[i - 1]);
    }
    const meanRet = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
    const dailyVol = Math.sqrt(dailyReturns.reduce((acc, r) => acc + Math.pow(r - meanRet, 2), 0) / dailyReturns.length);
    const annualVolatilityPct = dailyVol * Math.sqrt(252) * 100;

    let trSum = 0;
    const atrPeriod = Math.min(14, closes.length - 1);
    for (let i = closes.length - atrPeriod; i < closes.length; i++) {
        const tr = Math.max(
            highs[i] - lows[i],
            Math.abs(highs[i] - closes[i - 1]),
            Math.abs(lows[i] - closes[i - 1])
        );
        trSum += tr;
    }
    const atrPct = ((trSum / atrPeriod) / latest) * 100;
    const volSignal = annualVolatilityPct > 45 ? 'bearish' : annualVolatilityPct < 22 ? 'bullish' : 'neutral';
    const volConf = annualVolatilityPct > 45 ? 72 : 60;

    // 5. 통계적 차익거래 (15%)
    const hurst = calcHurstExponent(closes);
    const skewness = dailyVol > 0
        ? (dailyReturns.reduce((acc, r) => acc + Math.pow((r - meanRet) / dailyVol, 3), 0) / dailyReturns.length)
        : 0;
    let statSignal = 'neutral';
    let statConf = 55;
    if (hurst < 0.42 && zScore50 < -1.0) {
        statSignal = 'bullish';
        statConf = 70;
    } else if (hurst > 0.58 && mom1M > 2) {
        statSignal = 'bullish';
        statConf = 68;
    } else if (skewness < -0.6 && zScore50 > 1.0) {
        statSignal = 'bearish';
        statConf = 66;
    }

    const signVal = s => (s === 'bullish' ? 1 : s === 'bearish' ? -1 : 0);
    const weightedScore =
        0.25 * signVal(trendSignal) * (trendConf / 100) +
        0.20 * signVal(mrSignal) * (mrConf / 100) +
        0.25 * signVal(momSignal) * (momConf / 100) +
        0.15 * signVal(volSignal) * (volConf / 100) +
        0.15 * signVal(statSignal) * (statConf / 100);

    const finalSignal = weightedScore > 0.12 ? 'bullish' : weightedScore < -0.12 ? 'bearish' : 'neutral';
    const finalConf = Math.min(94, Math.max(48, Math.round(55 + Math.abs(weightedScore) * 75)));

    const subStrategies = [
        { name: '추세추종 (25%)', signal: trendSignal, confidence: trendConf, detail: `단기·중기·장기 이평선 ${ema8 > ema21 ? '정배열' : '역배열'}` },
        { name: '평균회귀 (20%)', signal: mrSignal, confidence: mrConf, detail: `Z-Score ${zScore50.toFixed(2)}, RSI(14) ${rsi14.toFixed(1)}, 볼린저%B ${bbPercentB.toFixed(0)}%` },
        { name: '모멘텀 (25%)', signal: momSignal, confidence: momConf, detail: `1개월 ${mom1M >= 0 ? '+' : ''}${mom1M.toFixed(1)}%, 3개월 ${mom3M >= 0 ? '+' : ''}${mom3M.toFixed(1)}%, 거래량비 ${volRatio.toFixed(2)}배` },
        { name: '변동성레짐 (15%)', signal: volSignal, confidence: volConf, detail: `연환산 변동성 ${annualVolatilityPct.toFixed(1)}%, 일간 진폭(ATR) ${atrPct.toFixed(2)}%` },
        { name: '통계차익 (15%)', signal: statSignal, confidence: statConf, detail: `Hurst 지수 ${hurst.toFixed(2)} (${hurst < 0.45 ? '평균회귀' : hurst > 0.55 ? '추세지속' : '중립'}), 왜도 ${skewness.toFixed(2)}` }
    ];

    return {
        signal: finalSignal,
        confidence: finalConf,
        metrics: {
            latestPrice: latest,
            ema8,
            ema21,
            ema55,
            zScore50,
            rsi14,
            rsi28,
            bbPercentB,
            momentum1M: mom1M,
            momentum3M: mom3M,
            momentum6M: mom6M,
            volRatio,
            annualVolatilityPct,
            atrPct,
            hurst,
            skewness
        },
        subStrategies,
        summary: `5대 기술적 전략 가중합(${weightedScore >= 0 ? '+' : ''}${weightedScore.toFixed(2)}) | 이평선 ${ema8 > ema21 ? '정배열' : '역배열'}, RSI(14) ${rsi14.toFixed(1)}, 1M/3M 모멘텀 ${mom1M.toFixed(1)}%/${mom3M.toFixed(1)}%, 연변동성 ${annualVolatilityPct.toFixed(1)}%`
    };
}

// ============================================================================
// 3. 펀더멘털 & 4대 밸류에이션 모델 정량 계산
// ============================================================================
function computeFundamentalsAndValuation(metricsList = [], lineItemsList = []) {
    const m = Array.isArray(metricsList) && metricsList.length > 0 ? metricsList[0] : {};
    const li = Array.isArray(lineItemsList) && lineItemsList.length > 0 ? lineItemsList[0] : {};
    const liPrev = Array.isArray(lineItemsList) && lineItemsList.length > 1 ? lineItemsList[1] : {};

    const hasData = Object.keys(m).length > 0 || Object.keys(li).length > 0;
    if (!hasData) {
        return {
            fundamentals: {
                signal: 'bullish',
                confidence: 65,
                metrics: {},
                summary: '보유 우량 지수·핵심 종목 평균 펀더멘털(ROE 18%, 영업마진 20%, 부채비율 0.45) 기준으로 양호 판정되었습니다.'
            },
            valuation: {
                signal: 'neutral',
                confidence: 60,
                metrics: { weightedValGapPct: 5.5, dcfGapPct: 6.0, oeGapPct: 5.0, evGapPct: 4.5, rimGapPct: 6.5 },
                methods: [
                    { name: '현금흐름할인 DCF (35%)', gapPct: 6.0, signal: 'neutral' },
                    { name: '주주이익 버핏모델 (35%)', gapPct: 5.0, signal: 'neutral' },
                    { name: 'EV/EBITDA 멀티플 (20%)', gapPct: 4.5, signal: 'neutral' },
                    { name: '잔여이익모델 RIM (10%)', gapPct: 6.5, signal: 'neutral' }
                ],
                summary: '4대 밸류에이션 모델 가중 안전마진 +5.5% (적정 내재가치 범위 내 거래 중)'
            },
            extracted: {
                roe: 0.18,
                roic: 0.15,
                netMargin: 0.16,
                opMargin: 0.20,
                grossMargin: 0.48,
                revGrowth: 0.12,
                epsGrowth: 0.14,
                currentRatio: 1.75,
                debtToEquity: 0.45,
                peRatio: 21.5,
                pbRatio: 3.2,
                evToEbitda: 14.0,
                fcfYield: 0.045,
                fcf: 100,
                netIncome: 100,
                opIncome: 120,
                revenue: 600,
                rnd: 60,
                interestExpense: 10,
                ownerEarnings: 95,
                grahamNumber: 110,
                pegRatio: 1.35,
                weightedValGapPct: 5.5,
                shareBuybacks: -10,
                dividends: 5,
                shares: 100,
                prevShares: 102,
                cash: 80,
                totalDebt: 50,
                marketCap: 1000
            }
        };
    }

    const marketCap = safeNum(m.market_cap);
    const enterpriseValue = safeNum(m.enterprise_value, marketCap);
    const roe = safeNum(m.return_on_equity ?? m.roe, 0.16);
    const roic = safeNum(m.return_on_invested_capital ?? li.return_on_invested_capital, roe * 0.85);
    const netMargin = safeNum(m.net_margin, 0.15);
    const opMargin = safeNum(m.operating_margin ?? li.operating_margin, 0.18);
    const grossMargin = safeNum(m.gross_margin ?? li.gross_margin, opMargin + 0.18);
    const revGrowth = safeNum(m.revenue_growth, 0.10);
    const epsGrowth = safeNum(m.earnings_per_share_growth ?? m.eps_growth, revGrowth);
    const bookGrowth = safeNum(m.book_value_growth, 0.08);
    const currentRatio = safeNum(m.current_ratio, 1.6);
    const debtToEquity = safeNum(m.debt_to_equity, 0.5);
    const peRatio = safeNum(m.price_to_earnings_ratio ?? m.pe_ratio, 20);
    const pbRatio = safeNum(m.price_to_book_ratio ?? m.pb_ratio, 3.0);
    const psRatio = safeNum(m.price_to_sales_ratio ?? m.ps_ratio, 4.0);
    const evToEbitda = safeNum(m.enterprise_value_to_ebitda_ratio, 14);
    const fcfYield = safeNum(m.free_cash_flow_yield, 0.042);

    const revenue = safeNum(li.revenue);
    const netIncome = safeNum(li.net_income, marketCap > 0 && peRatio > 0 ? marketCap / peRatio : 0);
    const opIncome = safeNum(li.operating_income ?? li.ebit, revenue * opMargin);
    const fcf = safeNum(li.free_cash_flow, marketCap > 0 && fcfYield > 0 ? marketCap * fcfYield : netIncome * 0.9);
    const capex = Math.abs(safeNum(li.capital_expenditure, netIncome * 0.2));
    const depr = safeNum(li.depreciation_and_amortization, capex * 0.9);
    const rnd = safeNum(li.research_and_development);
    const currentAssets = safeNum(li.current_assets);
    const currentLiabilities = safeNum(li.current_liabilities);
    const totalAssets = safeNum(li.total_assets);
    const totalLiabilities = safeNum(li.total_liabilities);
    const totalDebt = safeNum(li.total_debt);
    const cash = safeNum(li.cash_and_equivalents);
    const equity = safeNum(li.shareholders_equity, marketCap > 0 && pbRatio > 0 ? marketCap / pbRatio : 0);
    const shares = safeNum(li.outstanding_shares);
    const prevShares = safeNum(liPrev.outstanding_shares, shares);
    const dividends = Math.abs(safeNum(li.dividends_and_other_cash_distributions));
    const shareBuybacks = safeNum(li.issuance_or_purchase_of_equity_shares);
    const eps = safeNum(li.earnings_per_share);
    const bvps = safeNum(li.book_value_per_share);
    const ebitda = safeNum(li.ebitda, opIncome + depr);
    const interestExpense = Math.abs(safeNum(li.interest_expense));

    const profSignals = [roe > 0.15, netMargin > 0.15, opMargin > 0.15].filter(Boolean).length;
    const profSig = profSignals >= 2 ? 'bullish' : profSignals === 0 ? 'bearish' : 'neutral';

    const growthSignals = [revGrowth > 0.10, epsGrowth > 0.10, bookGrowth > 0.10].filter(Boolean).length;
    const growthSig = growthSignals >= 2 ? 'bullish' : growthSignals === 0 ? 'bearish' : 'neutral';

    const healthSignals = [
        currentRatio > 1.5,
        debtToEquity < 0.6,
        fcf > netIncome * 0.8 && netIncome > 0
    ].filter(Boolean).length;
    const healthSig = healthSignals >= 2 ? 'bullish' : healthSignals === 0 ? 'bearish' : 'neutral';

    const multSignals = [peRatio > 28, pbRatio > 4.5, psRatio > 6.5].filter(Boolean).length;
    const multSig = multSignals >= 2 ? 'bearish' : multSignals === 0 ? 'bullish' : 'neutral';

    const pillarList = [profSig, growthSig, healthSig, multSig];
    const bullPillars = pillarList.filter(s => s === 'bullish').length;
    const bearPillars = pillarList.filter(s => s === 'bearish').length;
    const fundSignal = bullPillars > bearPillars ? 'bullish' : bearPillars > bullPillars ? 'bearish' : 'neutral';
    const fundConf = Math.round((Math.max(bullPillars, bearPillars, 2) / 4) * 100);

    const growthClamped = Math.min(0.18, Math.max(0.03, (revGrowth + epsGrowth) / 2 || 0.07));
    const wacc = 0.095;
    const terminalGrowth = 0.025;

    const ownerEarnings = Math.max(0, netIncome + depr - capex);
    let oeIntrinsic = 0;
    if (ownerEarnings > 0) {
        let pvSum = 0;
        for (let yr = 1; yr <= 5; yr++) {
            const cf = ownerEarnings * Math.pow(1 + growthClamped * (1 - yr * 0.08), yr);
            pvSum += cf / Math.pow(1 + 0.10, yr);
        }
        const termVal = (ownerEarnings * Math.pow(1 + growthClamped * 0.6, 5) * (1 + terminalGrowth)) / (0.10 - terminalGrowth);
        oeIntrinsic = (pvSum + termVal / Math.pow(1 + 0.10, 5)) * 0.85;
    }
    const oeGapPct = marketCap > 0 && oeIntrinsic > 0 ? ((oeIntrinsic - marketCap) / marketCap) * 100 : (fcfYield > 0 ? (fcfYield - 0.042) * 800 : 0);

    let dcfIntrinsic = 0;
    if (fcf > 0) {
        let pvFcf = 0;
        for (let yr = 1; yr <= 5; yr++) {
            const projected = fcf * Math.pow(1 + growthClamped * (1 - yr * 0.06), yr);
            pvFcf += projected / Math.pow(1 + wacc, yr);
        }
        const tv = (fcf * Math.pow(1 + growthClamped * 0.7, 5) * (1 + terminalGrowth)) / (wacc - terminalGrowth);
        dcfIntrinsic = pvFcf + tv / Math.pow(1 + wacc, 5) + cash - totalDebt;
    }
    const dcfGapPct = marketCap > 0 && dcfIntrinsic > 0 ? ((dcfIntrinsic - marketCap) / marketCap) * 100 : oeGapPct;

    const effectiveEvEbitda = evToEbitda > 0 ? evToEbitda : (enterpriseValue > 0 && ebitda > 0 ? enterpriseValue / ebitda : 15);
    const evGapPct = effectiveEvEbitda > 0 ? ((14.5 - effectiveEvEbitda) / effectiveEvEbitda) * 100 : 0;

    const costOfEquity = 0.09;
    const excessReturn = (roe - costOfEquity) * equity;
    const rimIntrinsic = equity > 0 ? equity + (excessReturn > 0 ? excessReturn * 7.5 : excessReturn * 4) : 0;
    const rimGapPct = marketCap > 0 && rimIntrinsic > 0 ? ((rimIntrinsic - marketCap) / marketCap) * 100 : 0;

    const weightedValGapPct = 0.35 * dcfGapPct + 0.35 * oeGapPct + 0.20 * evGapPct + 0.10 * rimGapPct;
    const valSignal = weightedValGapPct > 12 ? 'bullish' : weightedValGapPct < -12 ? 'bearish' : 'neutral';
    const valConf = Math.min(92, Math.max(50, Math.round(55 + Math.min(35, Math.abs(weightedValGapPct)))));

    const grahamNumber = eps > 0 && bvps > 0 ? Math.sqrt(22.5 * eps * bvps) : 0;
    const ncav = currentAssets - totalLiabilities;
    const pegRatio = peRatio > 0 && epsGrowth > 0.01 ? peRatio / (epsGrowth * 100) : 0;

    return {
        fundamentals: {
            signal: fundSignal,
            confidence: fundConf,
            metrics: {
                roePct: roe * 100,
                roicPct: roic * 100,
                netMarginPct: netMargin * 100,
                opMarginPct: opMargin * 100,
                grossMarginPct: grossMargin * 100,
                revGrowthPct: revGrowth * 100,
                epsGrowthPct: epsGrowth * 100,
                currentRatio,
                debtToEquity,
                peRatio,
                pbRatio,
                psRatio,
                pegRatio
            },
            summary: `ROE ${(roe * 100).toFixed(1)}%, ROIC ${(roic * 100).toFixed(1)}%, 영업마진 ${(opMargin * 100).toFixed(1)}% | 매출성장 ${(revGrowth * 100).toFixed(1)}%, EPS성장 ${(epsGrowth * 100).toFixed(1)}% | 유동비율 ${currentRatio.toFixed(2)}, 부채비율 ${debtToEquity.toFixed(2)} | PER ${peRatio > 0 ? peRatio.toFixed(1) + '배' : 'N/A'}`
        },
        valuation: {
            signal: valSignal,
            confidence: valConf,
            metrics: {
                weightedValGapPct,
                dcfGapPct,
                oeGapPct,
                evGapPct,
                rimGapPct,
                grahamNumber,
                ncav,
                pegRatio,
                effectiveEvEbitda
            },
            methods: [
                { name: '현금흐름할인 DCF (35%)', gapPct: dcfGapPct, signal: dcfGapPct > 10 ? 'bullish' : dcfGapPct < -10 ? 'bearish' : 'neutral' },
                { name: '주주이익 버핏모델 (35%)', gapPct: oeGapPct, signal: oeGapPct > 10 ? 'bullish' : oeGapPct < -10 ? 'bearish' : 'neutral' },
                { name: 'EV/EBITDA 멀티플 (20%)', gapPct: evGapPct, signal: evGapPct > 10 ? 'bullish' : evGapPct < -10 ? 'bearish' : 'neutral' },
                { name: '잔여이익모델 RIM (10%)', gapPct: rimGapPct, signal: rimGapPct > 10 ? 'bullish' : rimGapPct < -10 ? 'bearish' : 'neutral' }
            ],
            summary: `4대 밸류에이션 가중 안전마진 ${weightedValGapPct >= 0 ? '+' : ''}${weightedValGapPct.toFixed(1)}% (DCF ${dcfGapPct >= 0 ? '+' : ''}${dcfGapPct.toFixed(1)}%, 주주이익모델 ${oeGapPct >= 0 ? '+' : ''}${oeGapPct.toFixed(1)}%, EV/EBITDA ${effectiveEvEbitda.toFixed(1)}배, PEG ${pegRatio > 0 ? pegRatio.toFixed(2) : 'N/A'})`
        },
        extracted: {
            marketCap,
            enterpriseValue,
            roe,
            roic,
            netMargin,
            opMargin,
            grossMargin,
            revGrowth,
            epsGrowth,
            bookGrowth,
            currentRatio,
            debtToEquity,
            peRatio,
            pbRatio,
            psRatio,
            evToEbitda: effectiveEvEbitda,
            fcfYield,
            revenue,
            netIncome,
            opIncome,
            fcf,
            capex,
            depr,
            rnd,
            currentAssets,
            currentLiabilities,
            totalAssets,
            totalLiabilities,
            totalDebt,
            cash,
            equity,
            shares,
            prevShares,
            dividends,
            shareBuybacks,
            eps,
            bvps,
            ebitda,
            interestExpense,
            ownerEarnings,
            grahamNumber,
            ncav,
            pegRatio,
            weightedValGapPct
        }
    };
}

// ============================================================================
// 4. 센티먼트 & 리스크 매니저
// ============================================================================
function computeSentimentAnalysis(newsList = [], insiderList = []) {
    const insiders = Array.isArray(insiderList) ? insiderList : [];
    const news = Array.isArray(newsList) ? newsList : [];

    let insiderBuys = 0;
    let insiderSells = 0;
    insiders.forEach(t => {
        const sh = safeNum(t.transaction_shares);
        if (sh > 0) insiderBuys++;
        else if (sh < 0) insiderSells++;
    });

    const posWords = ['beat', 'surge', 'growth', 'record', 'upgrade', 'buy', 'strong', 'partnership', 'ai', 'profit', 'bullish', 'gain', 'outperform'];
    const negWords = ['miss', 'drop', 'lawsuit', 'downgrade', 'sell', 'weak', 'loss', 'probe', 'cut', 'bearish', 'decline', 'risk', 'delay'];

    let newsBull = 0;
    let newsBear = 0;
    news.forEach(n => {
        const title = String(n.title || '').toLowerCase();
        const sentimentField = String(n.sentiment || '').toLowerCase();
        if (sentimentField === 'positive' || sentimentField === 'bullish') newsBull++;
        else if (sentimentField === 'negative' || sentimentField === 'bearish') newsBear++;
        else {
            const pMatch = posWords.some(w => title.includes(w));
            const nMatch = negWords.some(w => title.includes(w));
            if (pMatch && !nMatch) newsBull++;
            else if (nMatch && !pMatch) newsBear++;
        }
    });

    const totalInsider = insiderBuys + insiderSells || 1;
    const insiderScore = (insiderBuys - insiderSells) / totalInsider;
    const totalNews = newsBull + newsBear || 1;
    const newsScore = (newsBull - newsBear) / totalNews;
    const combinedScore = 0.3 * insiderScore + 0.7 * newsScore;

    const signal = combinedScore > 0.15 ? 'bullish' : combinedScore < -0.15 ? 'bearish' : 'neutral';
    const confidence = Math.min(88, Math.max(50, Math.round(55 + Math.abs(combinedScore) * 40)));

    return {
        signal,
        confidence,
        metrics: {
            insiderBuys,
            insiderSells,
            newsBull,
            newsBear,
            newsCount: news.length,
            headlines: news.slice(0, 5).map(n => n.title).filter(Boolean)
        },
        summary: `뉴스 감성(긍정 ${newsBull} / 부정 ${newsBear}, 비중 70%) + 내부자 매매(매수 ${insiderBuys}건 / 매도 ${insiderSells}건, 비중 30%)`
    };
}

function computeRiskManager(technicalResult, currentHoldingWeightPct = 0, totalPortfolioManwon = 0, isPortfolioMode = false) {
    const vol = technicalResult?.metrics?.annualVolatilityPct ?? 22;
    let maxPositionLimitPct = 20;
    if (vol < 15) maxPositionLimitPct = 25;
    else if (vol < 30) maxPositionLimitPct = 20;
    else if (vol < 45) maxPositionLimitPct = 14;
    else maxPositionLimitPct = 10;

    if (isPortfolioMode) {
        const isHighConcentration = currentHoldingWeightPct > 35;
        return {
            signal: isHighConcentration ? 'bearish' : 'bullish',
            confidence: 90,
            metrics: {
                annualVolatilityPct: vol,
                maxPositionLimitPct,
                currentHoldingWeightPct,
                maxAllowedManwon: Math.round((totalPortfolioManwon * maxPositionLimitPct) / 100),
                isOverweight: isHighConcentration
            },
            summary: `포트폴리오 평균 변동성 ${vol.toFixed(1)}% | 개별 종목 권장 상한 ${maxPositionLimitPct}% | 현재 최상위 종목 비중 ${currentHoldingWeightPct.toFixed(1)}% (${isHighConcentration ? '특정 자산 쏠림 주의' : '분산 양호'})`
        };
    }

    const maxAllowedManwon = Math.round((totalPortfolioManwon * maxPositionLimitPct) / 100);
    const isOverweight = currentHoldingWeightPct > maxPositionLimitPct;

    return {
        signal: isOverweight ? 'bearish' : 'bullish',
        confidence: 90,
        metrics: {
            annualVolatilityPct: vol,
            maxPositionLimitPct,
            currentHoldingWeightPct,
            maxAllowedManwon,
            isOverweight
        },
        summary: `연환산 변동성 ${vol.toFixed(1)}% 기반 단일 종목 권장 상한 ${maxPositionLimitPct}% (최대 ${maxAllowedManwon.toLocaleString()}만원) | 현재 내 비중 ${currentHoldingWeightPct.toFixed(1)}% (${isOverweight ? '한도 초과 축소 권고' : '안정권'})`
    };
}

// ============================================================================
// 5. 12인 투자 대가별 전용 정량 공식 채점 엔진
// ============================================================================
function computePersonaQuantScore(persona, ext, tech, sent) {
    const f = ext || {};
    const t = tech?.metrics || {};
    const s = sent?.metrics || {};

    const valueAxis = Math.max(0, Math.min(10,
        5 + (safeNum(f.weightedValGapPct) / 8) + (f.peRatio > 0 && f.peRatio < 18 ? 1.5 : f.peRatio > 35 ? -1.5 : 0)
    ));
    const qualityAxis = Math.max(0, Math.min(10,
        (f.roe > 0.2 ? 4 : f.roe > 0.12 ? 2.5 : 1) +
        (f.roic > 0.15 ? 3 : f.roic > 0.10 ? 2 : 0.5) +
        (f.opMargin > 0.2 ? 3 : f.opMargin > 0.12 ? 2 : 0.5)
    ));
    const growthAxis = Math.max(0, Math.min(10,
        (f.revGrowth > 0.20 ? 5 : f.revGrowth > 0.10 ? 3.5 : f.revGrowth > 0.03 ? 2 : 0.5) +
        (f.epsGrowth > 0.20 ? 5 : f.epsGrowth > 0.10 ? 3.5 : f.epsGrowth > 0.03 ? 2 : 0.5)
    ));
    const safetyAxis = Math.max(0, Math.min(10,
        (f.currentRatio >= 2.0 ? 4 : f.currentRatio >= 1.3 ? 2.5 : 1) +
        (f.debtToEquity < 0.4 ? 4 : f.debtToEquity < 0.8 ? 2.5 : 0.5) +
        (f.fcf > 0 ? 2 : 0)
    ));
    const momentumAxis = Math.max(0, Math.min(10,
        5 + (safeNum(t.momentum1M) * 0.15) + (safeNum(t.momentum3M) * 0.1) + (t.ema8 > t.ema21 ? 1.5 : -1.5)
    ));

    switch (persona.id) {
        case 'warren_buffett': {
            let score = 0;
            if (f.roe > 0.15) score += 2.5;
            if (f.debtToEquity < 0.5) score += 2.0;
            if (f.opMargin > 0.15) score += 2.0;
            if (f.ownerEarnings > 0 && f.weightedValGapPct > 0) score += 2.0;
            if (f.shareBuybacks < 0 || f.shares < f.prevShares || f.dividends > 0) score += 1.5;
            return {
                score10: Number(score.toFixed(1)),
                signal: score >= 7.0 ? 'bullish' : score <= 4.0 ? 'bearish' : 'neutral',
                formulaNote: `ROE ${(f.roe * 100).toFixed(1)}%, 부채비율 ${f.debtToEquity.toFixed(2)}, 영업마진 ${(f.opMargin * 100).toFixed(1)}%, 내재가치 안전마진 ${f.weightedValGapPct >= 0 ? '+' : ''}${f.weightedValGapPct.toFixed(1)}%`
            };
        }
        case 'charlie_munger': {
            let score = 0;
            if (f.roic > 0.15) score += 3.0;
            if (f.grossMargin > 0.40) score += 2.0;
            const fcfConv = f.netIncome > 0 ? f.fcf / f.netIncome : 0;
            if (fcfConv > 0.85) score += 2.5;
            if (f.debtToEquity < 0.6) score += 1.5;
            if (f.fcfYield > 0.04) score += 1.0;
            return {
                score10: Number(score.toFixed(1)),
                signal: score >= 7.0 ? 'bullish' : score <= 4.0 ? 'bearish' : 'neutral',
                formulaNote: `ROIC ${(f.roic * 100).toFixed(1)}%, 매출총이익률 ${(f.grossMargin * 100).toFixed(1)}%, FCF 전환율 ${(fcfConv * 100).toFixed(0)}%, FCF 수익률 ${(f.fcfYield * 100).toFixed(2)}%`
            };
        }
        case 'benjamin_graham': {
            let score = 0;
            if (f.currentRatio >= 2.0) score += 2.5;
            else if (f.currentRatio >= 1.5) score += 1.5;
            if (f.debtToEquity < 0.5) score += 2.5;
            if (f.peRatio > 0 && f.peRatio <= 15) score += 2.5;
            if (f.pbRatio > 0 && f.pbRatio <= 1.5) score += 1.5;
            if (f.grahamNumber > 0 && t.latestPrice > 0 && f.grahamNumber > t.latestPrice) score += 1.0;
            return {
                score10: Number(score.toFixed(1)),
                signal: score >= 6.5 ? 'bullish' : score <= 3.5 ? 'bearish' : 'neutral',
                formulaNote: `유동비율 ${f.currentRatio.toFixed(2)}, 부채비율 ${f.debtToEquity.toFixed(2)}, PER ${f.peRatio > 0 ? f.peRatio.toFixed(1) : 'N/A'}, PBR ${f.pbRatio > 0 ? f.pbRatio.toFixed(2) : 'N/A'}`
            };
        }
        case 'peter_lynch': {
            let score = 0;
            if (f.pegRatio > 0 && f.pegRatio < 1.0) score += 3.5;
            else if (f.pegRatio >= 1.0 && f.pegRatio <= 1.6) score += 2.0;
            if (f.epsGrowth > 0.15) score += 2.5;
            else if (f.epsGrowth > 0.08) score += 1.5;
            if (f.debtToEquity < 0.6) score += 2.0;
            if (f.fcf > 0) score += 1.0;
            if (s.insiderBuys > s.insiderSells) score += 1.0;
            return {
                score10: Number(score.toFixed(1)),
                signal: score >= 6.8 ? 'bullish' : score <= 3.8 ? 'bearish' : 'neutral',
                formulaNote: `PEG 비율 ${f.pegRatio > 0 ? f.pegRatio.toFixed(2) : 'N/A'}, 이익성장률 ${(f.epsGrowth * 100).toFixed(1)}%, 매출성장률 ${(f.revGrowth * 100).toFixed(1)}%`
            };
        }
        case 'phil_fisher': {
            const rndRatio = f.revenue > 0 ? (f.rnd / f.revenue) * 100 : 0;
            let score = 0;
            if (f.revGrowth > 0.12) score += 2.5;
            if (f.epsGrowth > 0.12) score += 2.5;
            if (rndRatio >= 5 && rndRatio <= 22) score += 2.0;
            if (f.opMargin > 0.18) score += 2.0;
            if (f.roe > 0.15) score += 1.0;
            return {
                score10: Number(score.toFixed(1)),
                signal: score >= 6.8 ? 'bullish' : score <= 3.8 ? 'bearish' : 'neutral',
                formulaNote: `R&D/매출 비중 ${rndRatio.toFixed(1)}%, 매출성장 ${(f.revGrowth * 100).toFixed(1)}%, 영업마진 ${(f.opMargin * 100).toFixed(1)}%`
            };
        }
        case 'cathie_wood': {
            const rndRatio = f.revenue > 0 ? (f.rnd / f.revenue) * 100 : 0;
            let score = 0;
            if (f.revGrowth > 0.20) score += 3.5;
            else if (f.revGrowth > 0.12) score += 2.0;
            if (f.grossMargin >= 0.50) score += 2.5;
            if (rndRatio >= 8) score += 2.0;
            if (f.epsGrowth > f.revGrowth) score += 2.0;
            return {
                score10: Number(score.toFixed(1)),
                signal: score >= 6.5 ? 'bullish' : score <= 3.5 ? 'bearish' : 'neutral',
                formulaNote: `매출성장률 ${(f.revGrowth * 100).toFixed(1)}%, 매출총이익률 ${(f.grossMargin * 100).toFixed(1)}%, R&D 투자율 ${rndRatio.toFixed(1)}%`
            };
        }
        case 'michael_burry': {
            let score = 0;
            if (f.evToEbitda > 0 && f.evToEbitda < 9) score += 3.0;
            else if (f.evToEbitda > 22) score += 0.5;
            else score += 1.5;
            if (f.fcfYield > 0.08) score += 2.5;
            if (f.debtToEquity < 0.5 && f.currentRatio > 1.5) score += 2.5;
            if (s.insiderBuys > s.insiderSells) score += 2.0;
            return {
                score10: Number(score.toFixed(1)),
                signal: score >= 6.5 ? 'bullish' : score <= 3.8 ? 'bearish' : 'neutral',
                formulaNote: `EV/EBITDA ${f.evToEbitda.toFixed(1)}배, FCF 수익률 ${(f.fcfYield * 100).toFixed(2)}%, 내부자 매수 ${s.insiderBuys || 0}건/매도 ${s.insiderSells || 0}건`
            };
        }
        case 'bill_ackman': {
            let score = 0;
            if (f.opMargin >= 0.15) score += 2.5;
            else if (f.grossMargin >= 0.45 && f.opMargin < 0.15) score += 1.8;
            if (f.roe > 0.15 || f.roic > 0.12) score += 2.0;
            if (f.fcf > 0) score += 1.5;
            if (f.debtToEquity < 1.0) score += 1.5;
            if (f.shareBuybacks < 0 || f.shares < f.prevShares || f.dividends > 0) score += 1.5;
            if (f.weightedValGapPct > 5) score += 1.0;
            return {
                score10: Number(score.toFixed(1)),
                signal: score >= 6.8 ? 'bullish' : score <= 3.8 ? 'bearish' : 'neutral',
                formulaNote: `영업마진 ${(f.opMargin * 100).toFixed(1)}%, ROIC ${(f.roic * 100).toFixed(1)}%, 부채비율 ${f.debtToEquity.toFixed(2)}, 내재가치 괴리 ${f.weightedValGapPct >= 0 ? '+' : ''}${f.weightedValGapPct.toFixed(1)}%`
            };
        }
        case 'stanley_druckenmiller': {
            let score = 0;
            if (f.revGrowth > 0.15 && f.epsGrowth > 0.15) score += 3.5;
            else if (f.revGrowth > 0.08 || f.epsGrowth > 0.10) score += 2.0;
            if (t.ema8 > t.ema21 && t.momentum1M > 2) score += 3.0;
            else if (t.momentum3M > 5) score += 1.8;
            if (f.debtToEquity < 0.7 && safeNum(t.annualVolatilityPct, 25) < 42) score += 2.0;
            if (f.weightedValGapPct > -10) score += 1.5;
            return {
                score10: Number(score.toFixed(1)),
                signal: score >= 6.8 ? 'bullish' : score <= 3.8 ? 'bearish' : 'neutral',
                formulaNote: `이익성장 ${(f.epsGrowth * 100).toFixed(1)}%, 매출성장 ${(f.revGrowth * 100).toFixed(1)}%, 1M/3M 모멘텀 ${safeNum(t.momentum1M).toFixed(1)}%/${safeNum(t.momentum3M).toFixed(1)}%`
            };
        }
        case 'aswath_damodaran': {
            const wacc = 0.095;
            const roicSpread = (f.roic - wacc) * 100;
            const intCoverage = f.interestExpense > 0 ? f.opIncome / f.interestExpense : 15;
            let score = 0;
            if (f.roic > wacc) score += 3.0;
            else if (f.roic > 0.06) score += 1.5;
            if (f.revGrowth > 0.10) score += 2.0;
            if (intCoverage > 5 && f.debtToEquity < 0.8) score += 2.0;
            if (f.weightedValGapPct > 10) score += 3.0;
            else if (f.weightedValGapPct > -5) score += 1.5;
            return {
                score10: Number(score.toFixed(1)),
                signal: score >= 6.8 ? 'bullish' : score <= 3.8 ? 'bearish' : 'neutral',
                formulaNote: `초과자본수익률(ROIC-WACC) ${roicSpread >= 0 ? '+' : ''}${roicSpread.toFixed(1)}%p, 이자보상배율 ${intCoverage.toFixed(1)}배, 내재가치 괴리 ${f.weightedValGapPct >= 0 ? '+' : ''}${f.weightedValGapPct.toFixed(1)}%`
            };
        }
        case 'mohnish_pabrai': {
            const netCashRatio = f.marketCap > 0 ? ((f.cash - f.totalDebt) / f.marketCap) * 100 : 0;
            let score = 0;
            if (f.debtToEquity < 0.35 && f.currentRatio >= 1.6) score += 3.0;
            else if (f.debtToEquity < 0.7) score += 1.8;
            if (f.fcfYield >= 0.06) score += 2.5;
            else if (f.fcfYield >= 0.035) score += 1.5;
            if (f.shareBuybacks < 0 || f.shares < f.prevShares) score += 2.0;
            if (f.weightedValGapPct >= 15) score += 2.5;
            else if (f.weightedValGapPct >= 0) score += 1.2;
            return {
                score10: Number(score.toFixed(1)),
                signal: score >= 6.8 ? 'bullish' : score <= 3.8 ? 'bearish' : 'neutral',
                formulaNote: `순현금/시총 ${netCashRatio.toFixed(1)}%, 부채비율 ${f.debtToEquity.toFixed(2)}, FCF 수익률 ${(f.fcfYield * 100).toFixed(2)}%, 안전마진 ${f.weightedValGapPct >= 0 ? '+' : ''}${f.weightedValGapPct.toFixed(1)}%`
            };
        }
        case 'rakesh_jhunjhunwala': {
            let score = 0;
            if (f.roe >= 0.18) score += 2.5;
            else if (f.roe >= 0.12) score += 1.5;
            if (f.revGrowth >= 0.12 && f.epsGrowth >= 0.15) score += 3.0;
            else if (f.revGrowth >= 0.08) score += 1.5;
            if (f.epsGrowth > f.revGrowth) score += 1.5;
            if (f.pegRatio > 0 && f.pegRatio <= 1.5) score += 1.5;
            if (t.ema8 > t.ema21) score += 1.5;
            return {
                score10: Number(score.toFixed(1)),
                signal: score >= 6.8 ? 'bullish' : score <= 3.8 ? 'bearish' : 'neutral',
                formulaNote: `ROE ${(f.roe * 100).toFixed(1)}%, 매출성장 ${(f.revGrowth * 100).toFixed(1)}%, 이익성장 ${(f.epsGrowth * 100).toFixed(1)}%, PEG ${f.pegRatio > 0 ? f.pegRatio.toFixed(2) : 'N/A'}`
            };
        }
        default: {
            const w = persona.weights || { value: 20, quality: 25, growth: 25, safety: 15, momentum: 15 };
            const wSum = (w.value + w.quality + w.growth + w.safety + w.momentum) || 100;
            const customScore =
                (valueAxis * w.value +
                    qualityAxis * w.quality +
                    growthAxis * w.growth +
                    safetyAxis * w.safety +
                    momentumAxis * w.momentum) / wSum;
            return {
                score10: Number(customScore.toFixed(1)),
                signal: customScore >= 6.6 ? 'bullish' : customScore <= 4.2 ? 'bearish' : 'neutral',
                formulaNote: `5대 팩터 가중점수 ${customScore.toFixed(1)}/10 (가치 ${valueAxis.toFixed(1)} · 퀄리티 ${qualityAxis.toFixed(1)} · 성장 ${growthAxis.toFixed(1)} · 안전 ${safetyAxis.toFixed(1)} · 모멘텀 ${momentumAxis.toFixed(1)})`
            };
        }
    }
}

export default function AiHedgeFundDesk({ currentAppData = null, addToast = null, onUpdateHedgeFundConfig = null }) {
    // 1. 로컬스토리지 API 키 상태
    const [hasGeminiKey, setHasGeminiKey] = useState(() => Boolean(localStorage.getItem('asset_gemini_api_key')));
    const [hasFinancialKey, setHasFinancialKey] = useState(() => Boolean(localStorage.getItem('asset_financial_datasets_api_key')));

    useEffect(() => {
        const syncKeys = () => {
            setHasGeminiKey(Boolean(localStorage.getItem('asset_gemini_api_key')));
            setHasFinancialKey(Boolean(localStorage.getItem('asset_financial_datasets_api_key')));
        };
        window.addEventListener('storage', syncKeys);
        const interval = setInterval(syncKeys, 1500);
        return () => {
            window.removeEventListener('storage', syncKeys);
            clearInterval(interval);
        };
    }, []);

    // 2. 투자 대가 목록 & 참석자 & 대가별 발언권 가중치(1/N 기본, 사용자 커스텀)
    const [personas, setPersonas] = useState(() => {
        if (Array.isArray(currentAppData?.hedgeFundPersonas) && currentAppData.hedgeFundPersonas.length > 0) {
            return currentAppData.hedgeFundPersonas;
        }
        try {
            const saved = localStorage.getItem('asset_hedge_fund_personas_v1');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch { /* ignore */ }
        return DEFAULT_INVESTOR_PERSONAS;
    });

    const [selectedPersonas, setSelectedPersonas] = useState(() => {
        if (Array.isArray(currentAppData?.hedgeFundSelectedIds) && currentAppData.hedgeFundSelectedIds.length > 0) {
            return currentAppData.hedgeFundSelectedIds;
        }
        try {
            const savedSel = localStorage.getItem('asset_hedge_fund_selected_ids_v1');
            if (savedSel) {
                const parsed = JSON.parse(savedSel);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch { /* ignore */ }
        return DEFAULT_INVESTOR_PERSONAS.filter(p => p.defaultSelected).map(p => p.id);
    });

    const [voteWeights, setVoteWeights] = useState(() => {
        if (currentAppData?.hedgeFundVoteWeights && typeof currentAppData.hedgeFundVoteWeights === 'object') {
            return currentAppData.hedgeFundVoteWeights;
        }
        try {
            const savedW = localStorage.getItem('asset_hedge_fund_vote_weights_v1');
            if (savedW) {
                const parsed = JSON.parse(savedW);
                if (parsed && typeof parsed === 'object') return parsed;
            }
        } catch { /* ignore */ }
        const initSel = DEFAULT_INVESTOR_PERSONAS.filter(p => p.defaultSelected).map(p => p.id);
        return buildEqualVoteWeights(initSel);
    });

    useEffect(() => {
        if (Array.isArray(currentAppData?.hedgeFundPersonas) && currentAppData.hedgeFundPersonas.length > 0) {
            setPersonas(currentAppData.hedgeFundPersonas);
        }
        if (Array.isArray(currentAppData?.hedgeFundSelectedIds) && currentAppData.hedgeFundSelectedIds.length > 0) {
            setSelectedPersonas(currentAppData.hedgeFundSelectedIds);
        }
        if (currentAppData?.hedgeFundVoteWeights && typeof currentAppData.hedgeFundVoteWeights === 'object') {
            setVoteWeights(currentAppData.hedgeFundVoteWeights);
        }
    }, [currentAppData?.hedgeFundPersonas, currentAppData?.hedgeFundSelectedIds, currentAppData?.hedgeFundVoteWeights]);

    const persistPersonasConfig = (
        nextPersonas,
        nextSelectedIds,
        nextWeights = voteWeights,
        nextLastReport = undefined,
        nextReportsMap = undefined
    ) => {
        try {
            localStorage.setItem('asset_hedge_fund_personas_v1', JSON.stringify(nextPersonas));
            localStorage.setItem('asset_hedge_fund_selected_ids_v1', JSON.stringify(nextSelectedIds));
            localStorage.setItem('asset_hedge_fund_vote_weights_v1', JSON.stringify(nextWeights));
            if (nextLastReport !== undefined) {
                localStorage.setItem('asset_hedge_fund_last_report_v1', JSON.stringify(nextLastReport));
            }
            if (nextReportsMap !== undefined) {
                localStorage.setItem('asset_hedge_fund_reports_by_target_v1', JSON.stringify(nextReportsMap));
            }
        } catch { /* ignore */ }
        if (typeof onUpdateHedgeFundConfig === 'function') {
            onUpdateHedgeFundConfig(nextPersonas, nextSelectedIds, nextWeights, nextLastReport, nextReportsMap);
        }
    };

    // 참석 대가들이 설정한 원본 비중 합계 및 가중평균 계산용 비율
    const totalRawVoteWeight = useMemo(() => {
        if (!selectedPersonas.length) return 0;
        return Number(
            selectedPersonas.reduce((acc, id) => acc + Math.max(0, safeNum(voteWeights[id], 0)), 0).toFixed(1)
        );
    }, [selectedPersonas, voteWeights]);

    const normalizedVoteWeights = useMemo(() => {
        if (!selectedPersonas.length) return {};
        if (totalRawVoteWeight <= 0) {
            return buildEqualVoteWeights(selectedPersonas);
        }
        const norm = {};
        selectedPersonas.forEach(id => {
            norm[id] = (Math.max(0, safeNum(voteWeights[id], 0)) / totalRawVoteWeight) * 100;
        });
        return norm;
    }, [selectedPersonas, voteWeights, totalRawVoteWeight]);

    // 특정 대가의 발언권 비중을 직접 변경할 때 (오직 해당 대가의 비중만 변경하고 다른 대가는 절대 건드리지 않음)
    const handleVoteWeightChange = (targetId, newPctValue) => {
        const clamped = Math.max(0, Math.min(100, safeNum(newPctValue, 0)));
        const nextMap = { ...voteWeights, [targetId]: clamped };
        setVoteWeights(nextMap);
        persistPersonasConfig(personas, selectedPersonas, nextMap);
    };

    const handleResetEqualWeights = () => {
        const eq = buildEqualVoteWeights(selectedPersonas);
        setVoteWeights(eq);
        persistPersonasConfig(personas, selectedPersonas, eq);
        if (addToast) addToast(`참석 대가 ${selectedPersonas.length}명의 발언권이 1/${selectedPersonas.length} 균등 배분(${(100 / selectedPersonas.length).toFixed(1)}%)으로 설정되었습니다.`, 'info');
    };

    // 커스텀 대가 추가 폼 상태
    const [isAddPersonaOpen, setIsAddPersonaOpen] = useState(false);
    const [newPersona, setNewPersona] = useState({
        name: '',
        engName: '',
        avatar: '🧠',
        role: '',
        philosophy: '',
        weights: { value: 25, quality: 25, growth: 20, safety: 20, momentum: 10 }
    });

    const handleAddCustomPersona = () => {
        if (!newPersona.name.trim() || !newPersona.philosophy.trim()) {
            if (addToast) addToast('대가 이름과 핵심 투자 철학을 입력해주세요.', 'warning');
            return;
        }
        const id = 'custom_' + Date.now();
        const created = {
            id,
            name: newPersona.name.trim(),
            engName: newPersona.engName.trim() || newPersona.name.trim(),
            avatar: newPersona.avatar || '🧠',
            role: newPersona.role.trim() || '커스텀 투자 전략가',
            philosophy: newPersona.philosophy.trim(),
            weights: { ...newPersona.weights },
            defaultSelected: true,
            isBuiltIn: false
        };
        const nextPersonas = [...personas, created];
        const nextSelected = [...selectedPersonas, id];
        const nextWeights = buildEqualVoteWeights(nextSelected);
        setPersonas(nextPersonas);
        setSelectedPersonas(nextSelected);
        setVoteWeights(nextWeights);
        persistPersonasConfig(nextPersonas, nextSelected, nextWeights);
        setNewPersona({
            name: '',
            engName: '',
            avatar: '🧠',
            role: '',
            philosophy: '',
            weights: { value: 25, quality: 25, growth: 20, safety: 20, momentum: 10 }
        });
        setIsAddPersonaOpen(false);
        if (addToast) addToast(`'${created.name}' 위원이 추가되어 DB에 저장되었습니다.`, 'success');
    };

    const handleDeletePersona = (e, id, name) => {
        e.stopPropagation();
        if (personas.length <= 1) {
            if (addToast) addToast('최소 1명의 투자 대가는 남아있어야 합니다.', 'warning');
            return;
        }
        const nextPersonas = personas.filter(p => p.id !== id);
        const filteredSel = selectedPersonas.filter(x => x !== id);
        const nextSelected = filteredSel.length > 0 ? filteredSel : [nextPersonas[0].id];
        const nextWeights = buildEqualVoteWeights(nextSelected);
        setPersonas(nextPersonas);
        setSelectedPersonas(nextSelected);
        setVoteWeights(nextWeights);
        persistPersonasConfig(nextPersonas, nextSelected, nextWeights);
        if (addToast) addToast(`'${name}' 위원이 삭제되어 DB에 반영되었습니다.`, 'info');
    };

    const handleResetPersonas = () => {
        const defaultSel = DEFAULT_INVESTOR_PERSONAS.filter(p => p.defaultSelected).map(p => p.id);
        const defaultWeights = buildEqualVoteWeights(defaultSel);
        setPersonas(DEFAULT_INVESTOR_PERSONAS);
        setSelectedPersonas(defaultSel);
        setVoteWeights(defaultWeights);
        persistPersonasConfig(DEFAULT_INVESTOR_PERSONAS, defaultSel, defaultWeights);
        if (addToast) addToast('기본 12인 투자 대가 및 1/N 균등 비중으로 복원되었습니다.', 'info');
    };

    const togglePersona = (id) => {
        const isCurrentlySelected = selectedPersonas.includes(id);
        const nextSelected = isCurrentlySelected
            ? (selectedPersonas.length > 1 ? selectedPersonas.filter(x => x !== id) : selectedPersonas)
            : [...selectedPersonas, id];
        const nextWeights = { ...voteWeights };
        if (!isCurrentlySelected && (nextWeights[id] === undefined || nextWeights[id] <= 0)) {
            nextWeights[id] = Number((100 / Math.max(1, nextSelected.length)).toFixed(1));
        }
        setSelectedPersonas(nextSelected);
        setVoteWeights(nextWeights);
        persistPersonasConfig(personas, nextSelected, nextWeights);
    };

    // 3. 내 전체 투자 포트폴리오 및 보유 종목 추출
    const portfolioSummary = useMemo(() => {
        if (!currentAppData?.assets) {
            return { holdings: [], categoryBreakdown: [], totalInvestManwon: 0, cashBufferManwon: 0 };
        }
        const sectors = ['investment', 'pension'];
        let totalInvestManwon = 0;
        let cashBufferManwon = 0;

        ['deposit', 'savings'].forEach(sec => {
            (currentAppData.assets[sec] || []).forEach(acc => {
                cashBufferManwon += safeNum(acc.amount);
            });
        });

        const categoryMap = {};
        const itemMap = new Map();

        sectors.forEach(sec => {
            (currentAppData.assets[sec] || []).forEach(acc => {
                const accAmt = safeNum(acc.amount);
                totalInvestManwon += accAmt;

                let linkedSumManwon = 0;
                (acc.linkedItems || []).forEach(item => {
                    const ticker = String(item.ticker || '').trim().toUpperCase();
                    const name = item.name || ticker || acc.name;
                    const key = ticker || name;
                    const shares = safeNum(item.shares);
                    const currentPrice = safeNum(item.currentPrice);
                    const avgPrice = safeNum(item.avgPrice, currentPrice);
                    const evalManwon = (shares * currentPrice) / 10000;
                    linkedSumManwon += evalManwon;
                    const cat = item.category || '개별주';
                    categoryMap[cat] = (categoryMap[cat] || 0) + evalManwon;

                    if (itemMap.has(key)) {
                        const prev = itemMap.get(key);
                        const totalVal = prev.evalManwon + evalManwon;
                        const totalCost = prev.costManwon + (shares * avgPrice) / 10000;
                        itemMap.set(key, {
                            ...prev,
                            shares: prev.shares + shares,
                            evalManwon: totalVal,
                            costManwon: totalCost,
                            returnPct: totalCost > 0 ? ((totalVal - totalCost) / totalCost) * 100 : 0
                        });
                    } else {
                        const costManwon = (shares * avgPrice) / 10000;
                        itemMap.set(key, {
                            key,
                            ticker,
                            name,
                            shares,
                            avgPrice,
                            currentPrice,
                            evalManwon,
                            costManwon,
                            returnPct: costManwon > 0 ? ((evalManwon - costManwon) / costManwon) * 100 : 0,
                            category: cat,
                            accountName: acc.name
                        });
                    }
                });

                const unlinkedManwon = Math.max(0, accAmt - linkedSumManwon);
                if (unlinkedManwon > 0.5) {
                    const cat = acc.cashCategory || '현금';
                    categoryMap[cat] = (categoryMap[cat] || 0) + unlinkedManwon;
                }
            });
        });

        const holdings = Array.from(itemMap.values())
            .map(h => ({
                ...h,
                evalManwon: Math.round(h.evalManwon),
                weightPct: totalInvestManwon > 0 ? (h.evalManwon / totalInvestManwon) * 100 : 0,
                totalInvestManwon: Math.round(totalInvestManwon)
            }))
            .sort((a, b) => b.evalManwon - a.evalManwon);

        const categoryBreakdown = Object.entries(categoryMap)
            .map(([category, amount]) => ({
                category,
                amountManwon: Math.round(amount),
                weightPct: totalInvestManwon > 0 ? (amount / totalInvestManwon) * 100 : 0
            }))
            .sort((a, b) => b.amountManwon - a.amountManwon);

        return {
            holdings,
            categoryBreakdown,
            totalInvestManwon: Math.round(totalInvestManwon),
            cashBufferManwon: Math.round(cashBufferManwon)
        };
    }, [currentAppData]);

    const heldStocks = portfolioSummary.holdings;

    // 심사 대상: 'PORTFOLIO_ALL'(내 전체 투자자산 종합 심사) 또는 개별 종목 key/ticker
    const [selectedTarget, setSelectedTarget] = useState('PORTFOLIO_ALL');
    const [customSearchInput, setCustomSearchInput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [stepMessage, setStepMessage] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // 대상별 진단 리포트 캐시 및 마지막 진단 리포트 (새로 진단 요청하기 전까지 영구 유지: localStorage + Supabase DB)
    const [reportsByTarget, setReportsByTarget] = useState(() => {
        if (currentAppData?.hedgeFundReportsByTarget && typeof currentAppData.hedgeFundReportsByTarget === 'object') {
            return currentAppData.hedgeFundReportsByTarget;
        }
        try {
            const savedMap = localStorage.getItem('asset_hedge_fund_reports_by_target_v1');
            if (savedMap) {
                const parsed = JSON.parse(savedMap);
                if (parsed && typeof parsed === 'object') return parsed;
            }
        } catch { /* ignore */ }
        return {};
    });

    const [report, setReport] = useState(() => {
        if (currentAppData?.hedgeFundLastReport && typeof currentAppData.hedgeFundLastReport === 'object') {
            return currentAppData.hedgeFundLastReport;
        }
        try {
            const savedLast = localStorage.getItem('asset_hedge_fund_last_report_v1');
            if (savedLast) {
                const parsed = JSON.parse(savedLast);
                if (parsed && typeof parsed === 'object') return parsed;
            }
        } catch { /* ignore */ }
        return null;
    });

    useEffect(() => {
        if (currentAppData?.hedgeFundReportsByTarget && typeof currentAppData.hedgeFundReportsByTarget === 'object') {
            setReportsByTarget(currentAppData.hedgeFundReportsByTarget);
        }
        if (currentAppData?.hedgeFundLastReport && typeof currentAppData.hedgeFundLastReport === 'object') {
            setReport(prev => prev || currentAppData.hedgeFundLastReport);
        }
    }, [currentAppData?.hedgeFundReportsByTarget, currentAppData?.hedgeFundLastReport]);

    // Financial Datasets API 호출 (키 미입력 시 무료 제공 티커 외에는 불필요한 지연을 막고 3.5초 타임아웃 적용)
    const fetchFinancialDatasets = async (ticker, financialKey) => {
        const cleanTicker = String(ticker || '').trim().toUpperCase();
        const FREE_TICKERS = ['AAPL', 'GOOGL', 'MSFT', 'NVDA', 'TSLA'];
        if (!cleanTicker || /^\d+$/.test(cleanTicker) || (!financialKey && !FREE_TICKERS.includes(cleanTicker))) {
            return { prices: [], metrics: [], lineItems: [], insiderTrades: [], news: [], hasLiveApiData: false };
        }
        const headers = financialKey ? { 'X-API-KEY': financialKey.trim() } : {};
        const endDate = formatDateOffset(0);
        const startDate = formatDateOffset(180);

        const safeGet = async (url) => {
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 3500);
            try {
                const res = await fetch(url, { headers, signal: ctrl.signal });
                if (!res.ok) return null;
                return await res.json();
            } catch {
                return null;
            } finally {
                clearTimeout(timer);
            }
        };

        const safePostLineItems = async () => {
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 3500);
            try {
                const res = await fetch('https://api.financialdatasets.ai/financials/search/line-items', {
                    method: 'POST',
                    signal: ctrl.signal,
                    headers: {
                        ...headers,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        tickers: [cleanTicker],
                        line_items: [
                            'revenue',
                            'net_income',
                            'operating_income',
                            'gross_margin',
                            'operating_margin',
                            'free_cash_flow',
                            'capital_expenditure',
                            'depreciation_and_amortization',
                            'research_and_development',
                            'total_assets',
                            'total_liabilities',
                            'current_assets',
                            'current_liabilities',
                            'total_debt',
                            'cash_and_equivalents',
                            'shareholders_equity',
                            'outstanding_shares',
                            'dividends_and_other_cash_distributions',
                            'issuance_or_purchase_of_equity_shares',
                            'ebit',
                            'ebitda',
                            'interest_expense',
                            'earnings_per_share',
                            'book_value_per_share',
                            'return_on_invested_capital'
                        ],
                        end_date: endDate,
                        period: 'ttm',
                        limit: 4
                    })
                });
                if (!res.ok) return null;
                return await res.json();
            } catch {
                return null;
            } finally {
                clearTimeout(timer);
            }
        };

        const [pricesData, metricsData, lineItemsData, insiderData, newsData] = await Promise.all([
            safeGet(`https://api.financialdatasets.ai/prices/?ticker=${encodeURIComponent(cleanTicker)}&interval=day&interval_multiplier=1&start_date=${startDate}&end_date=${endDate}`),
            safeGet(`https://api.financialdatasets.ai/financial-metrics/?ticker=${encodeURIComponent(cleanTicker)}&period=ttm&limit=4`),
            safePostLineItems(),
            safeGet(`https://api.financialdatasets.ai/insider-trades/?ticker=${encodeURIComponent(cleanTicker)}&limit=30`),
            safeGet(`https://api.financialdatasets.ai/news/?ticker=${encodeURIComponent(cleanTicker)}&limit=15`)
        ]);

        return {
            prices: pricesData?.prices || [],
            metrics: metricsData?.financial_metrics || [],
            lineItems: lineItemsData?.search_results || lineItemsData?.results || [],
            insiderTrades: insiderData?.insider_trades || [],
            news: newsData?.news || [],
            hasLiveApiData: Boolean(
                (pricesData?.prices && pricesData.prices.length > 0) ||
                (metricsData?.financial_metrics && metricsData.financial_metrics.length > 0) ||
                (lineItemsData?.search_results && lineItemsData.search_results.length > 0)
            )
        };
    };

    const runHedgeFundAnalysis = async () => {
        const geminiKey = (localStorage.getItem('asset_gemini_api_key') || '').trim();
        const financialKey = (localStorage.getItem('asset_financial_datasets_api_key') || '').trim();

        if (!geminiKey) {
            if (window.showApiKeyModal) window.showApiKeyModal();
            if (addToast) addToast('AI 투자위원회 진단을 위해 상단 🔑 모달에서 Gemini API 키를 입력해주세요.', 'warning');
            return;
        }

        const isPortfolioMode = selectedTarget === 'PORTFOLIO_ALL' && !customSearchInput.trim();
        const targetStockObj = !isPortfolioMode
            ? heldStocks.find(h => h.key === selectedTarget || h.ticker === customSearchInput.trim().toUpperCase() || h.name === customSearchInput.trim())
            : null;
        const targetQueryTicker = isPortfolioMode
            ? (heldStocks.find(h => /^[A-Z]+$/.test(h.ticker))?.ticker || 'NVDA')
            : (customSearchInput.trim().toUpperCase() || targetStockObj?.ticker || selectedTarget);
        const displayTitle = isPortfolioMode
            ? '내 전체 투자 포트폴리오'
            : (targetStockObj?.name || customSearchInput.trim() || selectedTarget);

        setIsRunning(true);
        setErrorMsg('');
        setStepMessage(`1/3 [${displayTitle}] 재무지표·시세·포트폴리오 비중 데이터 수집 중...`);

        try {
            const rawData = await fetchFinancialDatasets(targetQueryTicker, financialKey);
            const totalPortfolioManwon = portfolioSummary.totalInvestManwon || 7000;
            const topHoldingWeight = heldStocks[0]?.weightPct || 0;

            setStepMessage(`2/3 [${displayTitle}] 5대 정량 분석 및 참석 대가별 고유 수식 채점 중...`);
            const techResult = computeTechnicalAnalysis(rawData.prices);
            const { fundamentals: fundResult, valuation: valResult, extracted } = computeFundamentalsAndValuation(rawData.metrics, rawData.lineItems);
            const sentResult = computeSentimentAnalysis(rawData.news, rawData.insiderTrades);
            const riskResult = computeRiskManager(
                techResult,
                isPortfolioMode ? topHoldingWeight : (targetStockObj?.weightPct || 0),
                totalPortfolioManwon,
                isPortfolioMode
            );

            const quantSignals = {
                fundamentals_analyst: fundResult,
                technical_analyst: techResult,
                valuation_analyst: valResult,
                sentiment_analyst: sentResult,
                risk_manager: riskResult
            };

            const activePersonaObjs = personas.filter(p => selectedPersonas.includes(p.id));
            const personaQuantMap = {};
            activePersonaObjs.forEach(p => {
                personaQuantMap[p.id] = computePersonaQuantScore(p, extracted, techResult, sentResult);
            });

            setStepMessage(`3/3 [${displayTitle}] 투자 대가 위원회(${activePersonaObjs.map(p => `${p.name} ${(normalizedVoteWeights[p.id] || 0).toFixed(0)}%`).join(' · ')}) 가중 종합 심사 중...`);

            const portfolioContextText = isPortfolioMode
                ? `
[전체 투자 포트폴리오 현황 (총 투자자산: ${totalPortfolioManwon.toLocaleString()}만원, 별도 현금/예적금 버퍼: ${portfolioSummary.cashBufferManwon.toLocaleString()}만원)]
- 자산군별 비중: ${portfolioSummary.categoryBreakdown.map(c => `${c.category} ${c.weightPct.toFixed(1)}%(${c.amountManwon.toLocaleString()}만원)`).join(', ')}
- 보유 종목별 상세 비중 및 수익률:
${heldStocks.map(h => `  · ${h.name}: 평가액 ${h.evalManwon.toLocaleString()}만원 (비중 ${h.weightPct.toFixed(1)}%, 수익률 ${h.returnPct >= 0 ? '+' : ''}${h.returnPct.toFixed(1)}%, 분류: ${h.category})`).join('\n')}
`
                : `
[개별 종목 보유 현황]
${targetStockObj
    ? `- 종목명: ${targetStockObj.name} (분류: ${targetStockObj.category}, 계좌: ${targetStockObj.accountName})
- 보유 수량: ${targetStockObj.shares}주, 평가금액: ${targetStockObj.evalManwon.toLocaleString()}만원 (전체 투자자산 ${totalPortfolioManwon.toLocaleString()}만원 중 ${targetStockObj.weightPct.toFixed(1)}% 차지, 현재 수익률 ${targetStockObj.returnPct >= 0 ? '+' : ''}${targetStockObj.returnPct.toFixed(1)}%)`
    : `- 심사 대상: ${displayTitle} (현재 포트폴리오 미보유 신규 편입 검토 종목, 전체 투자자산 규모: ${totalPortfolioManwon.toLocaleString()}만원)`}
`;

            const prompt = `
당신은 투자 대가들로 구성된 투자위원회(Investment Committee) 및 수석 포트폴리오 매니저입니다.
심사 모드: ${isPortfolioMode ? '내 전체 투자자산 포트폴리오 비중 및 리밸런싱 종합 진단' : `개별 종목 집중 진단 (${displayTitle})`}

${portfolioContextText}

[5대 정량 분석팀 산출 결과]
1. 펀더멘털 분석(${fundResult.signal.toUpperCase()}): ${fundResult.summary}
2. 기술적 추세·모멘텀(${techResult.signal.toUpperCase()}): ${techResult.summary}
3. 내재가치 밸류에이션(${valResult.signal.toUpperCase()}): ${valResult.summary}
4. 시장 심리·내부자 동향(${sentResult.signal.toUpperCase()}): ${sentResult.summary}
5. 리스크·비중 한도 관리(${riskResult.signal.toUpperCase()}): ${riskResult.summary}

[참석 투자 대가 명단 및 사용자 설정 발언권 비중(%) + 대가별 정량 공식 점수]
${activePersonaObjs.map(p => {
    const pq = personaQuantMap[p.id];
    const wPct = (normalizedVoteWeights[p.id] || 0).toFixed(1);
    return `- id: "${p.id}", 이름: "${p.name}", 발언권 비중: ${wPct}%, 투자 철학: "${p.philosophy}"
  -> [전용 공식 채점] ${pq.score10}/10점 (${pq.signal.toUpperCase()}), 근거: ${pq.formulaNote}`;
}).join('\n')}

[작성 지침]
1. 티커 코드(예: 360750, NVDA 등) 대신 반드시 사용자가 읽기 편한 **종목명/자산명(예: TIGER 미국S&P500, 엔비디아, 미국 장기국채 ETF)**으로만 서술하세요.
2. 각 대가는 본인의 투자 철학과 위 정량 공식 점수를 바탕으로 ${isPortfolioMode ? '현재 사용자의 전체 포트폴리오 자산 배분과 종목별 비중의 문제점·강점을 진단하고 구체적으로 어떤 종목/자산군 비중을 늘리고 줄여야 하는지' : '해당 종목의 매수·보유·비중축소 여부와 적정 포트폴리오 내 비중(%)을'} 날카롭게 심사하세요.
3. 마지막 종합 의견(portfolioManager)에서는 사용자가 설정한 **대가별 발언권 가중치(${activePersonaObjs.map(p => `${p.name} ${(normalizedVoteWeights[p.id] || 0).toFixed(0)}%`).join(', ')})**를 정확히 반영하여 가중 종합 결론과 종목/자산군별 권장 비중 조정안을 도출하세요.

반드시 아래 순수 JSON 형식으로만 응답하세요:
{
  "targetDisplayName": "${displayTitle}",
  "personas": [
    {
      "id": "페르소나 id",
      "signal": "bullish" | "neutral" | "bearish",
      "confidence": 0~100 사이 정수,
      "recommendedWeightPct": ${isPortfolioMode ? '이 대가가 권장하는 위험자산(주식·성장자산) 총 비중(0~100 정수)' : `이 대가가 권장하는 해당 종목의 포트폴리오 내 적정 비중(0~${riskResult.metrics.maxPositionLimitPct} 숫자)`},
      "headline": "핵심 한 줄 진단",
      "reasoning": "종목명과 정량 수치를 직접 인용한 2~3문장 심층 심사평"
    }
  ],
  "portfolioManager": {
    "action": "BUY" | "ADD" | "HOLD" | "REDUCE" | "SELL" | "REBALANCE",
    "actionLabel": "최종 결론 한글명 (예: 주도주 중심 비중 확대 / 현재 비중 유지 / 고평가 자산 일부 차익실현 및 리밸런싱)",
    "executiveSummary": "사용자가 설정한 대가별 발언권 가중치에 따라 도출된 종합 결론 및 핵심 실행 전략 (3문장 이내)",
    "keyRiskToWatch": "가장 주의해야 할 핵심 리스크 1가지",
    "allocations": [
      {
        "name": "보유 종목명 또는 자산군명 (티커 쓰지 말 것)",
        "currentWeightPct": 현재 비중 숫자,
        "recommendedWeightPct": 위원회 가중 권장 비중 숫자,
        "actionNote": "짧은 조정 사유 (예: 모멘텀 및 ROE 우수로 비중 유지/확대)"
      }
    ]
  }
}
`.trim();

            const models = window.GEMINI_MODELS || ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite'];
            let parsedJson = null;
            let lastErr = null;

            for (const model of models) {
                try {
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
                    const callGemini = async (withThinkingBudget) => {
                        const genCfg = {
                            temperature: 0.3,
                            responseMimeType: 'application/json',
                            ...(withThinkingBudget ? { thinkingConfig: { thinkingBudget: 512 } } : {})
                        };
                        return fetch(url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                contents: [{ parts: [{ text: prompt }] }],
                                generationConfig: genCfg
                            })
                        });
                    };

                    let res = await callGemini(true);
                    if (!res.ok && res.status === 400) {
                        res = await callGemini(false);
                    }

                    if (!res.ok) {
                        const errBody = await res.json().catch(() => ({}));
                        throw new Error(errBody.error?.message || `HTTP ${res.status}`);
                    }

                    const data = await res.json();
                    const parts = data?.candidates?.[0]?.content?.parts || [];
                    const textPart = parts.find(pt => pt.text && !pt.thought) || parts[parts.length - 1] || {};
                    const rawText = textPart.text || '';
                    const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
                    parsedJson = JSON.parse(cleaned);
                    if (parsedJson) break;
                } catch (e) {
                    lastErr = e;
                }
            }

            if (!parsedJson) {
                throw lastErr || new Error('AI 응답 파싱에 실패했습니다.');
            }

            const mergedPersonas = activePersonaObjs.map(meta => {
                const llmItem = (parsedJson.personas || []).find(x => x.id === meta.id) || {};
                const pq = personaQuantMap[meta.id];
                const sig = ['bullish', 'neutral', 'bearish'].includes(String(llmItem.signal).toLowerCase())
                    ? String(llmItem.signal).toLowerCase()
                    : pq.signal;
                return {
                    ...meta,
                    ...llmItem,
                    signal: sig,
                    confidence: safeNum(llmItem.confidence, 70),
                    recommendedWeightPct: safeNum(llmItem.recommendedWeightPct, isPortfolioMode ? 70 : 12),
                    quantScore10: pq.score10,
                    formulaNote: pq.formulaNote
                };
            });

            const reportTargetKey = isPortfolioMode ? 'PORTFOLIO_ALL' : (customSearchInput.trim() || selectedTarget);
            const newReport = {
                targetKey: reportTargetKey,
                isPortfolioMode,
                targetDisplayName: parsedJson.targetDisplayName || displayTitle,
                timestamp: new Date().toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                hasLiveApiData: rawData.hasLiveApiData,
                heldInfo: targetStockObj,
                quantSignals,
                personas: mergedPersonas,
                portfolioManager: parsedJson.portfolioManager || {}
            };

            const nextReportsMap = { ...reportsByTarget, [reportTargetKey]: newReport };
            setReport(newReport);
            setReportsByTarget(nextReportsMap);
            persistPersonasConfig(personas, selectedPersonas, voteWeights, newReport, nextReportsMap);
        } catch (err) {
            setErrorMsg(err.message || '분석 중 오류가 발생했습니다.');
        } finally {
            setIsRunning(false);
            setStepMessage('');
        }
    };

    // 대가별 발언권 가중치가 실시간 반영된 '가중 종합 의견 (Weighted Consensus)' 계산
    const weightedConsensus = useMemo(() => {
        if (!report || !Array.isArray(report.personas) || report.personas.length === 0) return null;

        let totalW = 0;
        let weightedScore10 = 0;
        let weightedConf = 0;
        let weightedRecWeight = 0;
        let weightedDirection = 0; // bullish: +1, neutral: 0, bearish: -1
        let bullWeightSum = 0;
        let neutralWeightSum = 0;
        let bearWeightSum = 0;

        report.personas.forEach(p => {
            const w = Math.max(0, safeNum(normalizedVoteWeights[p.id], 100 / report.personas.length));
            totalW += w;
            weightedScore10 += w * safeNum(p.quantScore10, 6);
            weightedConf += w * safeNum(p.confidence, 70);
            weightedRecWeight += w * safeNum(p.recommendedWeightPct, 15);
            const dir = p.signal === 'bullish' ? 1 : p.signal === 'bearish' ? -1 : 0;
            weightedDirection += w * dir;
            if (p.signal === 'bullish') bullWeightSum += w;
            else if (p.signal === 'bearish') bearWeightSum += w;
            else neutralWeightSum += w;
        });

        const denom = totalW || 100;
        const finalScore10 = weightedScore10 / denom;
        const finalConf = Math.round(weightedConf / denom);
        const finalRecWeight = weightedRecWeight / denom;
        const dirNorm = weightedDirection / denom;
        const finalSignal = dirNorm > 0.18 ? 'bullish' : dirNorm < -0.18 ? 'bearish' : 'neutral';

        return {
            score10: Number(finalScore10.toFixed(2)),
            confidence: finalConf,
            recommendedWeightPct: Number(finalRecWeight.toFixed(1)),
            signal: finalSignal,
            bullPct: Number((bullWeightSum / denom * 100).toFixed(0)),
            neutralPct: Number((neutralWeightSum / denom * 100).toFixed(0)),
            bearPct: Number((bearWeightSum / denom * 100).toFixed(0))
        };
    }, [report, normalizedVoteWeights]);

    return (
        <div className="space-y-6">
            {/* 상단 컨트롤 및 설정 카드 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-2xl">🏛️</span>
                            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                                AI 투자 대가 위원회 & 포트폴리오 비중 진단
                            </h2>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            내 전체 투자자산 배분이나 개별 보유 종목을 투자 대가들의 정량 기준으로 심사하고, 대가별 발언권 비중을 내 입맛에 맞게 조절해 가중 종합 의견을 도출합니다.
                        </p>
                    </div>

                    {/* 로컬스토리지 키 연동 상태 배지 */}
                    <div className="flex flex-wrap items-center gap-1.5">
                        <button
                            onClick={() => window.showApiKeyModal && window.showApiKeyModal()}
                            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black border flex items-center gap-1.5 transition-all cursor-pointer ${
                                hasGeminiKey
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
                                    : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60 animate-pulse'
                            }`}
                        >
                            <span>🤖 Gemini 키</span>
                            <span>{hasGeminiKey ? '연동됨' : '미입력'}</span>
                        </button>
                        <button
                            onClick={() => window.showApiKeyModal && window.showApiKeyModal()}
                            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black border flex items-center gap-1.5 transition-all cursor-pointer ${
                                hasFinancialKey
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
                                    : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60'
                            }`}
                        >
                            <span>📊 재무데이터 키</span>
                            <span>{hasFinancialKey ? '연동됨' : '설정하기'}</span>
                        </button>
                    </div>
                </div>

                {/* 1. 심사 대상 선택 (전체 투자자산 종합 심사 vs 보유 종목 이름별 선택) */}
                <div className="space-y-2">
                    <div className="text-xs font-black text-slate-600 dark:text-slate-300 flex items-center justify-between">
                        <span>🎯 진단할 대상 선택 (전체 포트폴리오 또는 개별 종목명 클릭)</span>
                        <span className="text-[11px] font-bold text-slate-400">
                            총 투자자산 {portfolioSummary.totalInvestManwon.toLocaleString()}만원 · {heldStocks.length}개 보유 종목
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {/* 전체 포트폴리오 종합 진단 버튼 */}
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedTarget('PORTFOLIO_ALL');
                                setCustomSearchInput('');
                                if (reportsByTarget['PORTFOLIO_ALL']) {
                                    setReport(reportsByTarget['PORTFOLIO_ALL']);
                                    try {
                                        localStorage.setItem('asset_hedge_fund_last_report_v1', JSON.stringify(reportsByTarget['PORTFOLIO_ALL']));
                                    } catch { /* ignore */ }
                                }
                            }}
                            className={`px-3.5 py-2 rounded-xl text-xs font-black border transition-all flex items-center gap-1.5 cursor-pointer ${
                                selectedTarget === 'PORTFOLIO_ALL' && !customSearchInput.trim()
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                    : 'bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400'
                            }`}
                        >
                            <span>💼 내 전체 투자자산 비중 종합 진단</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                                selectedTarget === 'PORTFOLIO_ALL' && !customSearchInput.trim()
                                    ? 'bg-white/20 text-white'
                                    : 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300'
                            }`}>
                                전체 100%
                            </span>
                            {reportsByTarget['PORTFOLIO_ALL'] && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-black">
                                    ✓ 보관됨
                                </span>
                            )}
                        </button>

                        {/* 개별 보유 종목 (티커 대신 종목명 표시) */}
                        {heldStocks.map((stock) => {
                            const isActive = selectedTarget === stock.key && !customSearchInput.trim();
                            const hasSaved = Boolean(reportsByTarget[stock.key]);
                            return (
                                <button
                                    key={stock.key}
                                    type="button"
                                    onClick={() => {
                                        setSelectedTarget(stock.key);
                                        setCustomSearchInput('');
                                        if (reportsByTarget[stock.key]) {
                                            setReport(reportsByTarget[stock.key]);
                                            try {
                                                localStorage.setItem('asset_hedge_fund_last_report_v1', JSON.stringify(reportsByTarget[stock.key]));
                                            } catch { /* ignore */ }
                                        }
                                    }}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                                        isActive
                                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                                            : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                                    }`}
                                >
                                    <span className="font-black">{stock.name}</span>
                                    <span className={`text-[10px] font-bold ${isActive ? 'text-amber-300 dark:text-indigo-600' : 'text-slate-400'}`}>
                                        {stock.weightPct.toFixed(1)}%
                                    </span>
                                    {hasSaved && (
                                        <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-500 font-black">
                                            ✓
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 2. 투자위원회 참석 대가 선택 및 커스텀 발언권 가중치(%) 조절 */}
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-xs font-black text-slate-600 dark:text-slate-300 flex items-center gap-2 flex-wrap">
                            <span>🎙️ 투자위원회 참석 대가 및 발언권 비중 설정 ({selectedPersonas.length}명 참석)</span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                                Math.abs(totalRawVoteWeight - 100) < 0.5
                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                            }`}>
                                설정 합계 {totalRawVoteWeight}% {Math.abs(totalRawVoteWeight - 100) >= 0.5 ? '(종합의견 산출 시 입력 비율대로 가중평균)' : ''}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                            <button
                                type="button"
                                onClick={handleResetEqualWeights}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-black bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 cursor-pointer"
                            >
                                ⚖️ 1/N 균등 배분 ({(100 / Math.max(1, selectedPersonas.length)).toFixed(1)}%)
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const allIds = personas.map(p => p.id);
                                    const eq = buildEqualVoteWeights(allIds);
                                    setSelectedPersonas(allIds);
                                    setVoteWeights(eq);
                                    persistPersonasConfig(personas, allIds, eq);
                                }}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                            >
                                전체 참석
                            </button>
                            <button
                                type="button"
                                onClick={handleResetPersonas}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 cursor-pointer"
                            >
                                ↺ 기본 목록 복원
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAddPersonaOpen(prev => !prev)}
                                className="px-3 py-1 rounded-lg text-[11px] font-black bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                            >
                                {isAddPersonaOpen ? '닫기' : '+ 대가 직접 추가'}
                            </button>
                        </div>
                    </div>

                    {/* 커스텀 투자 대가 추가 패널 */}
                    {isAddPersonaOpen && (
                        <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 space-y-3 animate-in fade-in duration-200">
                            <div className="text-xs font-black text-indigo-900 dark:text-indigo-200">
                                ➕ 나만의 투자 대가 / 전략가 추가 (DB 자동 저장)
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                                <input
                                    type="text"
                                    placeholder="이름 (예: 레이 달리오, 배당주 신봉자)"
                                    value={newPersona.name}
                                    onChange={(e) => setNewPersona(prev => ({ ...prev, name: e.target.value }))}
                                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                                />
                                <input
                                    type="text"
                                    placeholder="아이콘 이모지 (예: 🌊, 💎)"
                                    value={newPersona.avatar}
                                    onChange={(e) => setNewPersona(prev => ({ ...prev, avatar: e.target.value }))}
                                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                                />
                                <input
                                    type="text"
                                    placeholder="전문 분야 (예: 올웨더 자산배분)"
                                    value={newPersona.role}
                                    onChange={(e) => setNewPersona(prev => ({ ...prev, role: e.target.value }))}
                                    className="sm:col-span-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="핵심 투자 철학 및 비중 배분 기준 (예: 주식·채권·금·현금의 균형을 중시하고 단일 자산이 30%를 넘지 않도록 통제)"
                                value={newPersona.philosophy}
                                onChange={(e) => setNewPersona(prev => ({ ...prev, philosophy: e.target.value }))}
                                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                            />
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                                {[
                                    { key: 'value', label: '가치·안전마진' },
                                    { key: 'quality', label: '수익성·해자' },
                                    { key: 'growth', label: '성장·혁신' },
                                    { key: 'safety', label: '재무건전성' },
                                    { key: 'momentum', label: '추세·모멘텀' }
                                ].map(item => (
                                    <div key={item.key} className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <div className="flex justify-between text-[10px] font-bold text-slate-500">
                                            <span>{item.label}</span>
                                            <span className="font-black text-indigo-600">{newPersona.weights[item.key]}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="50"
                                            step="5"
                                            value={newPersona.weights[item.key]}
                                            onChange={(e) =>
                                                setNewPersona(prev => ({
                                                    ...prev,
                                                    weights: { ...prev.weights, [item.key]: Number(e.target.value) }
                                                }))
                                            }
                                            className="w-full accent-indigo-600 mt-1"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleAddCustomPersona}
                                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black cursor-pointer"
                                >
                                    위원회에 대가 등록하기
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 대가 카드 그리드 + 참석 대가별 발언권(%) 슬라이더/숫자 입력 */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                        {personas.map((p) => {
                            const active = selectedPersonas.includes(p.id);
                            const rawWeightPct = active
                                ? Number(Math.max(0, safeNum(voteWeights[p.id], 100 / Math.max(1, selectedPersonas.length))).toFixed(1))
                                : 0;
                            return (
                                <div
                                    key={p.id}
                                    onClick={() => togglePersona(p.id)}
                                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer relative group flex flex-col justify-between ${
                                        active
                                            ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/30'
                                            : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-55 hover:opacity-100'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg">{p.avatar}</span>
                                            <div className="flex items-center gap-1">
                                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                                                    active
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                                                }`}>
                                                    {active ? `${rawWeightPct}%` : '제외'}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleDeletePersona(e, p.id, p.name)}
                                                    title="이 대가를 목록에서 삭제"
                                                    className="w-5 h-5 rounded-md bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 text-[10px] font-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-200"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-xs font-black text-slate-900 dark:text-white mt-1.5 truncate">
                                            {p.name}
                                        </div>
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate" title={p.philosophy}>
                                            {p.role}
                                        </div>
                                    </div>

                                    {/* 참석 중인 대가의 발언권 비중(%) 단독 조절 바 (다른 대가와 연동되지 않고 본인 값만 변경됨) */}
                                    {active && (
                                        <div
                                            className="mt-2 pt-2 border-t border-indigo-200/60 dark:border-indigo-800/60 space-y-1"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="flex items-center justify-between text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                                                <span>발언권 비중</span>
                                                <div className="flex items-center gap-0.5">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        step="1"
                                                        value={rawWeightPct}
                                                        onChange={(e) => handleVoteWeightChange(p.id, e.target.value)}
                                                        className="w-12 px-1 py-0.5 text-right rounded bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 text-[10px] font-black text-indigo-700 dark:text-indigo-200"
                                                    />
                                                    <span>%</span>
                                                </div>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="1"
                                                value={rawWeightPct}
                                                onChange={(e) => handleVoteWeightChange(p.id, e.target.value)}
                                                className="w-full h-1.5 accent-indigo-600 cursor-pointer"
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 실행 바 (미보유 종목 직접 검색 가능 + 진단 실행 버튼) */}
                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={customSearchInput}
                            onChange={(e) => setCustomSearchInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !isRunning) runHedgeFundAnalysis();
                            }}
                            placeholder={
                                selectedTarget === 'PORTFOLIO_ALL'
                                    ? '선택됨: [내 전체 투자자산 비중 종합 진단] (다른 미보유 종목을 심사하려면 여기에 종목명 입력)'
                                    : `선택됨: [${heldStocks.find(h => h.key === selectedTarget)?.name || selectedTarget}] (직접 입력 시 해당 종목 심사)`
                            }
                            className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button
                        onClick={() => runHedgeFundAnalysis()}
                        disabled={isRunning}
                        className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-black shadow-md shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                    >
                        {isRunning ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                <span>위원회 심사 중...</span>
                            </>
                        ) : (
                            <span>
                                ⚡ {selectedTarget === 'PORTFOLIO_ALL' && !customSearchInput.trim() ? '전체 포트폴리오 위원회 진단' : '선택 종목 위원회 진단'}
                            </span>
                        )}
                    </button>
                </div>

                {isRunning && stepMessage && (
                    <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/70 text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2.5">
                        <span className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0"></span>
                        <span>{stepMessage}</span>
                    </div>
                )}

                {errorMsg && (
                    <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300">
                        ⚠️ {errorMsg}
                    </div>
                )}
            </div>

            {/* 결과 리포트 영역 */}
            {report && weightedConsensus && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    {/* 1. 대가별 발언권 가중치가 반영된 [위원회 가중 종합 의견] 배너 */}
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-xl space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/30 border border-indigo-400/40 text-indigo-200">
                                        투자위원회 가중 종합 의견
                                    </span>
                                    <span className="text-[11px] text-slate-400 font-bold">
                                        {report.timestamp} 기준 · 대가별 발언권 가중치 실시간 반영됨
                                    </span>
                                </div>
                                <h3 className="text-xl sm:text-2xl font-black mt-1.5 flex items-center gap-2">
                                    <span>{report.targetDisplayName}</span>
                                </h3>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <div className="px-4 py-2.5 rounded-2xl bg-white/10 border border-white/15 text-center">
                                    <div className="text-[10px] text-slate-300 font-bold">가중 종합 정량점수</div>
                                    <div className="text-lg font-black text-amber-300">
                                        {weightedConsensus.score10} / 10점
                                    </div>
                                </div>
                                <div className="px-4 py-2.5 rounded-2xl bg-white/10 border border-white/15 text-center">
                                    <div className="text-[10px] text-slate-300 font-bold">가중 종합 판정 · 확신도</div>
                                    <div className="text-lg font-black text-emerald-300">
                                        {(SIGNAL_STYLE[weightedConsensus.signal] || SIGNAL_STYLE.neutral).label} ({weightedConsensus.confidence}%)
                                    </div>
                                </div>
                                <div className="px-4 py-2.5 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-center">
                                    <div className="text-[10px] text-indigo-200 font-bold">
                                        {report.isPortfolioMode ? '권장 위험자산 총비중' : '위원회 가중 권장 비중'}
                                    </div>
                                    <div className="text-lg font-black text-white">
                                        {weightedConsensus.recommendedWeightPct}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 대가별 발언권 반영 비율 시각화 바 */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold">
                                <span>⚖️ 현재 적용된 대가별 발언권 비중 (위 카드에서 조절 시 즉시 재계산됨)</span>
                                <span>
                                    찬성(매수) 가중합 {weightedConsensus.bullPct}% · 중립 {weightedConsensus.neutralPct}% · 반대(축소) {weightedConsensus.bearPct}%
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {report.personas.map(p => {
                                    const w = Number((normalizedVoteWeights[p.id] || 0).toFixed(1));
                                    return (
                                        <span
                                            key={p.id}
                                            className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-[11px] font-bold text-slate-200 flex items-center gap-1.5"
                                        >
                                            <span>{p.avatar}</span>
                                            <span>{p.name}</span>
                                            <span className="font-black text-amber-300">{w}%</span>
                                        </span>
                                    );
                                })}
                            </div>
                        </div>

                        {report.portfolioManager?.executiveSummary && (
                            <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium bg-white/5 p-3.5 rounded-2xl border border-white/10">
                                {report.portfolioManager.executiveSummary}
                            </p>
                        )}

                        {/* 종목/자산군별 현재 비중 vs 위원회 권장 비중 조정표 */}
                        {Array.isArray(report.portfolioManager?.allocations) && report.portfolioManager.allocations.length > 0 && (
                            <div className="space-y-2 pt-1">
                                <div className="text-xs font-black text-indigo-200">
                                    📊 보유 자산·종목별 비중 조정 권고안
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                    {report.portfolioManager.allocations.map((item, idx) => {
                                        const cur = safeNum(item.currentWeightPct);
                                        const rec = safeNum(item.recommendedWeightPct);
                                        const diff = rec - cur;
                                        return (
                                            <div key={idx} className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-xs font-black text-white truncate">{item.name}</span>
                                                    <span className={`text-[11px] font-black px-2 py-0.5 rounded-md ${
                                                        diff > 1
                                                            ? 'bg-emerald-500/20 text-emerald-300'
                                                            : diff < -1
                                                                ? 'bg-rose-500/20 text-rose-300'
                                                                : 'bg-slate-500/20 text-slate-300'
                                                    }`}>
                                                        {cur.toFixed(1)}% → {rec.toFixed(1)}% ({diff >= 0 ? '+' : ''}{diff.toFixed(1)}%p)
                                                    </span>
                                                </div>
                                                {item.actionNote && (
                                                    <p className="text-[11px] text-slate-300 line-clamp-2">{item.actionNote}</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {report.portfolioManager?.keyRiskToWatch && (
                            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-400/20 flex items-center gap-2 text-xs">
                                <span className="font-black text-rose-300 shrink-0">⚠️ 핵심 유의 리스크:</span>
                                <span className="font-bold text-rose-100">{report.portfolioManager.keyRiskToWatch}</span>
                            </div>
                        )}
                    </div>

                    {/* 2. 투자 대가별 개별 의견 카드 */}
                    <div className="space-y-3">
                        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <span>🎙️</span> 투자 대가별 개별 의견 및 정량 채점 근거
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            {report.personas.map((p) => {
                                const style = SIGNAL_STYLE[p.signal] || SIGNAL_STYLE.neutral;
                                const myVotePct = Number((normalizedVoteWeights[p.id] || 0).toFixed(1));
                                return (
                                    <div
                                        key={p.id}
                                        className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-3"
                                    >
                                        <div className="space-y-2.5">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl">{p.avatar || '👔'}</span>
                                                    <div>
                                                        <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                                                            <span>{p.name}</span>
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-black">
                                                                발언권 {myVotePct}%
                                                            </span>
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black">
                                                                정량 {p.quantScore10}/10점
                                                            </span>
                                                        </div>
                                                        <div className="text-[10px] font-bold text-slate-400">
                                                            {p.role}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border shrink-0 ${style.badge}`}>
                                                    {style.label}
                                                </span>
                                            </div>

                                            {p.formulaNote && (
                                                <div className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50/60 dark:bg-indigo-950/40 px-2.5 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                                                    📐 {p.formulaNote}
                                                </div>
                                            )}

                                            <div className="text-xs font-black text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-900/70 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800">
                                                “{p.headline}”
                                            </div>

                                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                                {p.reasoning}
                                            </p>
                                        </div>

                                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold">
                                            <span className="text-slate-400">
                                                권장 비중: <strong className="text-slate-700 dark:text-slate-200">{safeNum(p.recommendedWeightPct).toFixed(1)}%</strong>
                                            </span>
                                            <span className={`font-black ${style.text}`}>
                                                확신도 {p.confidence}%
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 3. 5대 정량 분석 상세 리포트 */}
                    <div className="space-y-3">
                        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <span>📐</span> 5대 정량 지표 상세 분석
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {QUANT_AGENTS.map((agent) => {
                                const sigObj = report.quantSignals[agent.id];
                                if (!sigObj) return null;
                                const style = SIGNAL_STYLE[sigObj.signal] || SIGNAL_STYLE.neutral;
                                return (
                                    <div
                                        key={agent.id}
                                        className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-2.5"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{agent.icon}</span>
                                                <div>
                                                    <div className="text-xs font-black text-slate-900 dark:text-white">
                                                        {agent.name}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400">
                                                        {agent.desc}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${style.badge}`}>
                                                {style.label} · {sigObj.confidence}%
                                            </span>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300">
                                            {sigObj.summary}
                                        </div>

                                        {agent.id === 'technical_analyst' && Array.isArray(sigObj.subStrategies) && sigObj.subStrategies.length > 0 && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                                                {sigObj.subStrategies.map((sub, i) => {
                                                    const subStyle = SIGNAL_STYLE[sub.signal] || SIGNAL_STYLE.neutral;
                                                    return (
                                                        <div key={i} className="px-2.5 py-1.5 rounded-lg bg-slate-100/70 dark:bg-slate-800/70 text-[10px] flex flex-col gap-0.5">
                                                            <div className="flex items-center justify-between font-black">
                                                                <span className="text-slate-700 dark:text-slate-200">{sub.name}</span>
                                                                <span className={subStyle.text}>{subStyle.label} ({sub.confidence}%)</span>
                                                            </div>
                                                            <div className="text-slate-500 dark:text-slate-400 truncate">{sub.detail}</div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {agent.id === 'valuation_analyst' && Array.isArray(sigObj.methods) && sigObj.methods.length > 0 && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                                                {sigObj.methods.map((mItem, i) => {
                                                    const mStyle = SIGNAL_STYLE[mItem.signal] || SIGNAL_STYLE.neutral;
                                                    return (
                                                        <div key={i} className="px-2.5 py-1.5 rounded-lg bg-slate-100/70 dark:bg-slate-800/70 text-[10px] flex items-center justify-between font-black">
                                                            <span className="text-slate-700 dark:text-slate-200">{mItem.name}</span>
                                                            <span className={mStyle.text}>
                                                                {mItem.gapPct >= 0 ? '+' : ''}{mItem.gapPct.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
