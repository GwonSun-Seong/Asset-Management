import React, { useState, useMemo } from 'react';

// 종목명 및 통화 기반 실질 달러 환노출도(0, 0.5, 1.0) 자동 판별 엔진
function detectInitialFxExposure(item, accountName = '') {
    const name = String(item.name || '').toUpperCase();
    const ticker = String(item.ticker || '').toUpperCase();
    const accName = String(accountName || '').toUpperCase();
    const currency = String(item.currency || 'KRW').toUpperCase();

    // 1. 환헤지(H) 명시 종목은 무조건 0%
    if (
        name.includes('(H)') ||
        name.includes('환헤지') ||
        name.includes('합성H') ||
        name.endsWith(' H')
    ) {
        return {
            ratio: 0,
            autoType: 'hedged',
            badge: '🛡️ 환헤지(H) 0%'
        };
    }

    // 2. 직접 달러 표시 종목 또는 영문 티커(해외 직투)
    const isAlphaTicker = /^[A-Z]{1,5}(\.[A-Z]{1,2})?$/.test(ticker);
    if (currency === 'USD' || isAlphaTicker || accName.includes('달러') || accName.includes('외화')) {
        return {
            ratio: 1.0,
            autoType: 'direct-usd',
            badge: '🇺🇸 해외직투 100%'
        };
    }

    // 3. 국내 상장 미국/글로벌 환노출 ETF (원화 거래지만 실질 100% 달러 연동)
    const usUnhedgedKeywords = [
        '미국', 'S&P', 'SNP', '나스닥', 'NASDAQ', '다우존스', '배당다우',
        '필라델피아', '빅테크', '테크탑', '글로벌', '모건스탠리', 'SOX',
        '미국채', '달러', 'USD', '선진국', '월드', 'MSCI', 'NYSE', '러셀'
    ];
    if (usUnhedgedKeywords.some(kw => name.includes(kw))) {
        return {
            ratio: 1.0,
            autoType: 'kr-listed-us-etf',
            badge: '🇺🇸 국내상장 환노출 100%'
        };
    }

    // 4. 인도/일본/중국/금 등 이종통화 및 간접 환노출 ETF
    const otherFxKeywords = [
        '인도', '니프티', 'NIFTY', '일본', '니케이', '중국', '차이나',
        '항생', '유럽', '유로', '베트남', '신흥국', '금현물', '골드', '국제금'
    ];
    if (otherFxKeywords.some(kw => name.includes(kw))) {
        return {
            ratio: 0.5,
            autoType: 'other-fx-etf',
            badge: '🌏 이종통화/금 50%'
        };
    }

    // 5. 순수 국내 원화 종목 (개별주, CD금리, KOFR, 국내채권 등)
    return {
        ratio: 0,
        autoType: 'krw-pure',
        badge: '🇰🇷 순수 원화 0%'
    };
}

export default function FxSensitivityDashboard({
    currentAppData = null,
    currentCalculation = null
}) {
    // 현재 실시간 원/달러 환율 가져오기
    const baseUsdKrw = useMemo(() => {
        const live = Number(window.liveExchangeRate) || Number(localStorage.getItem('asset_last_usd_krw')) || 1380;
        return Math.round(live);
    }, []);

    const [targetFxRate, setTargetFxRate] = useState(baseUsdKrw - 80); // 기본 시뮬레이션: 환율 -80원 하락 시
    const [usMarketShockPct, setUsMarketShockPct] = useState(0); // 미장 지수 자체 변동률 (-30% ~ +30%)
    const [manualExposureOverrides, setManualExposureOverrides] = useState({}); // key -> 0 | 0.5 | 1.0

    // 전체 보유 종목 및 계좌 분석
    const exposureData = useMemo(() => {
        const assets = currentAppData?.assets || {};
        const netWorth = Number(currentCalculation?.currentNet) || 0;
        const grossWorth = Number(currentCalculation?.currentTotal) || 0;

        const items = [];
        let pureKrwAccountSum = 0; // 주식 외 일반 예적금/부동산/현금성 원화자산 합계

        Object.keys(assets).forEach(sector => {
            if (sector === 'loan') return;
            (assets[sector] || []).forEach(acc => {
                const hasLinked = Array.isArray(acc.linkedItems) && acc.linkedItems.length > 0;
                if (hasLinked) {
                    // 예수금(baseAmount)은 원화 현금으로 분류 (단, 계좌명에 달러/외화가 있으면 달러로 분류)
                    const baseCash = Number(acc.baseAmount) || 0;
                    if (baseCash > 0) {
                        const isUsdCash = /달러|외화|USD/i.test(acc.name);
                        if (isUsdCash) {
                            const key = `cash_${acc.id || acc.name}`;
                            const override = manualExposureOverrides[key];
                            const ratio = override !== undefined ? override : 1.0;
                            items.push({
                                key,
                                accountName: acc.name,
                                name: `${acc.name} (외화 예수금)`,
                                ticker: 'USD-CASH',
                                evalManwon: Math.round(baseCash * 10) / 10,
                                ratio,
                                autoType: 'direct-usd',
                                badge: ratio === 1 ? '🇺🇸 외화예수금 100%' : ratio === 0.5 ? '🌏 부분연동 50%' : '🛡️ 원화고정 0%'
                            });
                        } else {
                            pureKrwAccountSum += baseCash;
                        }
                    }

                    acc.linkedItems.forEach(li => {
                        const shares = Number(li.shares) || 0;
                        const curPrice = Number(li.currentPrice) || Number(li.avgPrice) || 0;
                        if (shares <= 0 || curPrice <= 0) return;

                        const evalManwon = (shares * curPrice) / 10000;
                        const key = `${acc.id || acc.name}_${li.id || li.ticker || li.name}`;
                        const autoDetected = detectInitialFxExposure(li, acc.name);
                        const override = manualExposureOverrides[key];
                        const ratio = override !== undefined ? override : autoDetected.ratio;

                        let badge = autoDetected.badge;
                        if (override !== undefined) {
                            badge = override === 1.0
                                ? '🇺🇸 수동 달러 100%'
                                : override === 0.5
                                    ? '🌏 수동 부분 50%'
                                    : '🛡️ 수동 원화 0%';
                        }

                        items.push({
                            key,
                            accountName: acc.name,
                            name: li.name || li.ticker,
                            ticker: li.ticker || '',
                            shares,
                            currentPrice: curPrice,
                            evalManwon: Math.round(evalManwon * 10) / 10,
                            ratio,
                            autoType: autoDetected.autoType,
                            badge
                        });
                    });
                } else {
                    const amt = Number(acc.amount) || 0;
                    if (amt > 0) {
                        const isUsdAcc = /달러|외화|USD/i.test(acc.name);
                        if (isUsdAcc) {
                            const key = `acc_${acc.id || acc.name}`;
                            const override = manualExposureOverrides[key];
                            const ratio = override !== undefined ? override : 1.0;
                            items.push({
                                key,
                                accountName: acc.name,
                                name: acc.name,
                                ticker: 'USD',
                                evalManwon: Math.round(amt * 10) / 10,
                                ratio,
                                autoType: 'direct-usd',
                                badge: ratio === 1 ? '🇺🇸 외화자산 100%' : ratio === 0.5 ? '🌏 부분연동 50%' : '🛡️ 원화고정 0%'
                            });
                        } else {
                            pureKrwAccountSum += amt;
                        }
                    }
                }
            });
        });

        items.sort((a, b) => (b.evalManwon * b.ratio) - (a.evalManwon * a.ratio) || b.evalManwon - a.evalManwon);

        // 실질 달러 연동 총액 산출
        const effectiveUsdExposedManwon = items.reduce((sum, it) => sum + it.evalManwon * it.ratio, 0);
        const krListedUsEtfManwon = items
            .filter(it => it.autoType === 'kr-listed-us-etf' && it.ratio > 0)
            .reduce((sum, it) => sum + it.evalManwon * it.ratio, 0);
        const directUsdManwon = items
            .filter(it => it.autoType === 'direct-usd' && it.ratio > 0)
            .reduce((sum, it) => sum + it.evalManwon * it.ratio, 0);

        const effectiveUsdDollars = baseUsdKrw > 0 ? Math.round((effectiveUsdExposedManwon * 10000) / baseUsdKrw) : 0;
        const usdShareOfNetWorthPct = netWorth > 0 ? ((effectiveUsdExposedManwon / netWorth) * 100).toFixed(1) : '0.0';
        const usdShareOfGrossPct = grossWorth > 0 ? ((effectiveUsdExposedManwon / grossWorth) * 100).toFixed(1) : '0.0';

        // 환율 10원당 / 100원당 내 순자산 변동액 (만원)
        const impactPer10Won = baseUsdKrw > 0 ? (effectiveUsdExposedManwon * (10 / baseUsdKrw)) : 0;
        const impactPer100Won = impactPer10Won * 10;

        // 현재 슬라이더(targetFxRate, usMarketShockPct) 적용 시 변동폭
        const fxChangePct = baseUsdKrw > 0 ? ((targetFxRate - baseUsdKrw) / baseUsdKrw) * 100 : 0;
        const mktChangeRatio = (Number(usMarketShockPct) || 0) / 100;
        const fxChangeRatio = baseUsdKrw > 0 ? (targetFxRate - baseUsdKrw) / baseUsdKrw : 0;

        // 복리 교차 효과: (1 + 주가변동) * (1 + 환율변동) - 1
        const combinedMultiplier = (1 + mktChangeRatio) * (1 + fxChangeRatio) - 1;
        const pureFxImpactManwon = effectiveUsdExposedManwon * fxChangeRatio;
        const totalShockImpactManwon = effectiveUsdExposedManwon * combinedMultiplier;
        const simulatedNetWorth = Math.round(netWorth + totalShockImpactManwon);

        // 환율 구간별 시나리오 테이블 (1,200원 ~ 1,500원)
        const rateSteps = [1200, 1250, 1300, 1350, baseUsdKrw, 1400, 1450, 1500]
            .filter((v, idx, arr) => arr.indexOf(v) === idx)
            .sort((a, b) => a - b);

        const scenarioRows = rateSteps.map(rate => {
            const diffWon = rate - baseUsdKrw;
            const diffPct = baseUsdKrw > 0 ? ((diffWon / baseUsdKrw) * 100) : 0;
            const fxDeltaManwon = Math.round(effectiveUsdExposedManwon * (diffPct / 100));
            const combinedDeltaManwon = Math.round(
                effectiveUsdExposedManwon * ((1 + mktChangeRatio) * (1 + diffPct / 100) - 1)
            );
            return {
                rate,
                isCurrent: rate === baseUsdKrw,
                diffWon,
                diffPct: diffPct.toFixed(1),
                fxDeltaManwon,
                combinedDeltaManwon,
                resultingNetWorth: Math.round(netWorth + combinedDeltaManwon)
            };
        });

        return {
            netWorth: Math.round(netWorth),
            grossWorth: Math.round(grossWorth),
            pureKrwAccountSum: Math.round(pureKrwAccountSum),
            items,
            effectiveUsdExposedManwon: Math.round(effectiveUsdExposedManwon),
            krListedUsEtfManwon: Math.round(krListedUsEtfManwon),
            directUsdManwon: Math.round(directUsdManwon),
            effectiveUsdDollars,
            usdShareOfNetWorthPct,
            usdShareOfGrossPct,
            impactPer10Won: Math.round(impactPer10Won * 10) / 10,
            impactPer100Won: Math.round(impactPer100Won),
            fxChangePct: fxChangePct.toFixed(2),
            pureFxImpactManwon: Math.round(pureFxImpactManwon),
            totalShockImpactManwon: Math.round(totalShockImpactManwon),
            simulatedNetWorth,
            scenarioRows
        };
    }, [currentAppData, currentCalculation, baseUsdKrw, targetFxRate, usMarketShockPct, manualExposureOverrides]);

    const handleCycleExposure = (itemKey, currentRatio) => {
        const nextRatio = currentRatio === 1.0 ? 0.0 : currentRatio === 0.0 ? 0.5 : 1.0;
        setManualExposureOverrides(prev => ({ ...prev, [itemKey]: nextRatio }));
    };

    const formatManWon = (val) => {
        const num = Math.round(Number(val) || 0);
        if (Math.abs(num) >= 10000) {
            const eok = Math.floor(Math.abs(num) / 10000);
            const rem = Math.abs(num) % 10000;
            return `${num < 0 ? '-' : ''}${eok}억${rem > 0 ? ` ${rem.toLocaleString()}만` : ''}원`;
        }
        return `${num.toLocaleString()}만원`;
    };

    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            {/* 상단 요약 배너 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 shadow-xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-700/50 text-blue-800 dark:text-blue-300 text-[10px] font-black">
                                국내상장 미국 ETF 환노출 자동 감지
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold tabular-nums">
                                기준 원/달러 환율: {baseUsdKrw.toLocaleString()}원
                            </span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
                            <span>💱</span> 환율 변동 민감도(달러 익스포저) 대시보드
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            해외 직투 종목뿐 아니라 <b>원화로 매수한 국내 상장 미국 ETF(TIGER·KODEX S&P500/나스닥 등 환노출형)</b>까지 합산하여 내 진짜 달러 노출 규모와 환차손익을 계산합니다.
                        </p>
                    </div>

                    {/* 환율 민감도 핵심 KPI 박스 */}
                    <div className="bg-white dark:bg-gray-900 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
                        <div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                                내 실질 달러 연동 자산 총액
                            </div>
                            <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5 tabular-nums">
                                {formatManWon(exposureData.effectiveUsdExposedManwon)}
                                <span className="text-xs font-extrabold ml-1.5 text-slate-400">
                                    (약 ${exposureData.effectiveUsdDollars.toLocaleString()})
                                </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 tabular-nums">
                                순자산 대비 <b>{exposureData.usdShareOfNetWorthPct}%</b> · 총자산 대비 {exposureData.usdShareOfGrossPct}%
                            </div>
                        </div>
                        <div className="pl-0 sm:pl-4 sm:border-l border-slate-200 dark:border-gray-700 text-left sm:text-right">
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">환율 ±10원당 내 자산 변동</div>
                            <div className="text-lg sm:text-xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                                ±{exposureData.impactPer10Won}만원
                            </div>
                            <div className="text-[10px] text-slate-400 tabular-nums">
                                ±100원 변동 시 ±{exposureData.impactPer100Won.toLocaleString()}만원
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 1. 숨은 달러 노출 구조 3분할 카드 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700">
                    <div className="text-[11px] font-bold text-slate-400">🇺🇸 국내 상장 환노출 ETF (원화표기 달러자산)</div>
                    <div className="text-lg font-black text-slate-900 dark:text-white mt-1 tabular-nums">
                        {formatManWon(exposureData.krListedUsEtfManwon)}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                        (H)가 없는 국내 상장 미국/글로벌 ETF로, 환율 등락이 주가에 100% 반영됩니다.
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700">
                    <div className="text-[11px] font-bold text-slate-400">💵 해외 직투 주식 & 외화예수금</div>
                    <div className="text-lg font-black text-slate-900 dark:text-white mt-1 tabular-nums">
                        {formatManWon(exposureData.directUsdManwon)}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                        달러로 직접 보유 중인 해외 주식 및 외화 통장 잔고입니다.
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700">
                    <div className="text-[11px] font-bold text-slate-400">🇰🇷 환율 무풍 자산 (원화 + 환헤지 ETF)</div>
                    <div className="text-lg font-black text-slate-900 dark:text-white mt-1 tabular-nums">
                        {formatManWon(Math.max(0, exposureData.grossWorth - exposureData.effectiveUsdExposedManwon))}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                        국내 개별주, CD금리/환헤지(H) ETF, 예적금, 부동산 등 환율 영향을 받지 않는 자산입니다.
                    </div>
                </div>
            </div>

            {/* 2. 인터랙티브 환율 & 미장 복합 스트레스 슬라이더 */}
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-2xs space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    {/* 좌측 슬라이더 2개 */}
                    <div className="lg:col-span-7 space-y-4">
                        {/* 원/달러 환율 슬라이더 */}
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-gray-900 border border-slate-200/70 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-xs font-black text-slate-700 dark:text-slate-200">
                                    💱 시뮬레이션 원/달러 환율 설정
                                </span>
                                <span className="text-sm font-black text-blue-600 dark:text-blue-400 tabular-nums">
                                    {targetFxRate.toLocaleString()}원 ({targetFxRate >= baseUsdKrw ? '+' : ''}{targetFxRate - baseUsdKrw}원 / {exposureData.fxChangePct}%)
                                </span>
                            </div>
                            <input
                                type="range"
                                min="1100"
                                max="1600"
                                step="10"
                                value={targetFxRate}
                                onChange={(e) => setTargetFxRate(Number(e.target.value))}
                                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 dark:bg-gray-700 rounded-lg"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1 tabular-nums">
                                <button type="button" onClick={() => setTargetFxRate(1200)} className="hover:text-blue-500 cursor-pointer">1,200원 (원화강세)</button>
                                <button type="button" onClick={() => setTargetFxRate(1300)} className="hover:text-blue-500 cursor-pointer">1,300원</button>
                                <button type="button" onClick={() => setTargetFxRate(baseUsdKrw)} className="text-blue-600 dark:text-blue-400 font-black cursor-pointer">현재 ({baseUsdKrw}원)</button>
                                <button type="button" onClick={() => setTargetFxRate(1450)} className="hover:text-blue-500 cursor-pointer">1,450원</button>
                                <button type="button" onClick={() => setTargetFxRate(1550)} className="hover:text-blue-500 cursor-pointer">1,550원 (킹달러)</button>
                            </div>
                        </div>

                        {/* 미국 증시 자체 등락률 슬라이더 (선택 조합) */}
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-gray-900 border border-slate-200/70 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-xs font-black text-slate-700 dark:text-slate-200">
                                    📉 미국 증시(S&P500/나스닥) 지수 변동 동시 적용 (선택)
                                </span>
                                <span className={`text-sm font-black tabular-nums ${
                                    usMarketShockPct > 0 ? 'text-emerald-600' : usMarketShockPct < 0 ? 'text-rose-500' : 'text-slate-500'
                                }`}>
                                    {usMarketShockPct > 0 ? `+${usMarketShockPct}%` : `${usMarketShockPct}%`}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="-30"
                                max="30"
                                step="5"
                                value={usMarketShockPct}
                                onChange={(e) => setUsMarketShockPct(Number(e.target.value))}
                                className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 dark:bg-gray-700 rounded-lg"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                                <button type="button" onClick={() => setUsMarketShockPct(-20)} className="hover:text-rose-500 cursor-pointer">-20% (조정장)</button>
                                <button type="button" onClick={() => setUsMarketShockPct(-10)} className="hover:text-rose-500 cursor-pointer">-10%</button>
                                <button type="button" onClick={() => setUsMarketShockPct(0)} className="text-indigo-600 dark:text-indigo-400 font-black cursor-pointer">0% (순수 환율만 보기)</button>
                                <button type="button" onClick={() => setUsMarketShockPct(10)} className="hover:text-emerald-500 cursor-pointer">+10%</button>
                                <button type="button" onClick={() => setUsMarketShockPct(20)} className="hover:text-emerald-500 cursor-pointer">+20% (랠리)</button>
                            </div>
                        </div>
                    </div>

                    {/* 우측 시뮬레이션 결과 패널 */}
                    <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 space-y-3">
                        <div className="text-xs font-black text-slate-500 dark:text-slate-400">
                            📊 시나리오 적용 시 내 순자산 변화
                        </div>
                        <div className="flex items-baseline justify-between">
                            <span className="text-xs font-bold text-slate-500">순수 환차손익</span>
                            <span className={`text-base font-black tabular-nums ${
                                exposureData.pureFxImpactManwon > 0
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : exposureData.pureFxImpactManwon < 0
                                        ? 'text-rose-500'
                                        : 'text-slate-600 dark:text-slate-300'
                            }`}>
                                {exposureData.pureFxImpactManwon > 0 ? '+' : ''}{exposureData.pureFxImpactManwon.toLocaleString()}만원
                            </span>
                        </div>
                        {usMarketShockPct !== 0 && (
                            <div className="flex items-baseline justify-between">
                                <span className="text-xs font-bold text-slate-500">환율 + 미장 지수 복합 손익</span>
                                <span className={`text-base font-black tabular-nums ${
                                    exposureData.totalShockImpactManwon >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                                }`}>
                                    {exposureData.totalShockImpactManwon >= 0 ? '+' : ''}{exposureData.totalShockImpactManwon.toLocaleString()}만원
                                </span>
                            </div>
                        )}
                        <div className="pt-3 border-t border-slate-200 dark:border-gray-700 flex items-baseline justify-between">
                            <span className="text-xs font-black text-slate-800 dark:text-slate-100">예상 순자산</span>
                            <div className="text-right">
                                <div className="text-xl font-black text-slate-900 dark:text-white tabular-nums">
                                    {formatManWon(exposureData.simulatedNetWorth)}
                                </div>
                                <div className="text-[10px] text-slate-400 font-bold tabular-nums">
                                    현재 {formatManWon(exposureData.netWorth)} 기준
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. 환율 구간별 순자산 조견표 */}
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-2xs space-y-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>📐</span> 원/달러 환율 구간별 내 순자산 조견표
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-gray-700 text-[11px] text-slate-400 font-black">
                                <th className="py-2.5 px-3">원/달러 환율</th>
                                <th className="py-2.5 px-3 text-right">현재 대비 변동</th>
                                <th className="py-2.5 px-3 text-right">순수 환차손익</th>
                                {usMarketShockPct !== 0 && (
                                    <th className="py-2.5 px-3 text-right">미장({usMarketShockPct > 0 ? `+${usMarketShockPct}%` : `${usMarketShockPct}%`}) 합산 손익</th>
                                )}
                                <th className="py-2.5 px-3 text-right">예상 순자산</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-gray-700/60 font-bold">
                            {exposureData.scenarioRows.map(row => (
                                <tr
                                    key={row.rate}
                                    onClick={() => setTargetFxRate(row.rate)}
                                    className={`cursor-pointer transition-colors ${
                                        row.isCurrent
                                            ? 'bg-blue-50/70 dark:bg-blue-950/30 font-black'
                                            : row.rate === targetFxRate
                                                ? 'bg-indigo-50/50 dark:bg-indigo-950/20'
                                                : 'hover:bg-slate-50 dark:hover:bg-gray-900/40'
                                    }`}
                                >
                                    <td className="py-2.5 px-3 tabular-nums text-slate-800 dark:text-slate-100">
                                        {row.rate.toLocaleString()}원
                                        {row.isCurrent && (
                                            <span className="ml-1.5 px-1.5 py-0.5 rounded bg-blue-600 text-white text-[9px] font-black">
                                                현재 기준
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-500">
                                        {row.diffWon > 0 ? `+${row.diffWon}원` : `${row.diffWon}원`} ({row.diffWon > 0 ? `+${row.diffPct}%` : `${row.diffPct}%`})
                                    </td>
                                    <td className={`py-2.5 px-3 text-right tabular-nums font-black ${
                                        row.fxDeltaManwon > 0 ? 'text-emerald-600 dark:text-emerald-400' : row.fxDeltaManwon < 0 ? 'text-rose-500' : 'text-slate-400'
                                    }`}>
                                        {row.fxDeltaManwon > 0 ? '+' : ''}{row.fxDeltaManwon.toLocaleString()}만원
                                    </td>
                                    {usMarketShockPct !== 0 && (
                                        <td className={`py-2.5 px-3 text-right tabular-nums font-black ${
                                            row.combinedDeltaManwon > 0 ? 'text-emerald-600 dark:text-emerald-400' : row.combinedDeltaManwon < 0 ? 'text-rose-500' : 'text-slate-400'
                                        }`}>
                                            {row.combinedDeltaManwon > 0 ? '+' : ''}{row.combinedDeltaManwon.toLocaleString()}만원
                                        </td>
                                    )}
                                    <td className="py-2.5 px-3 text-right tabular-nums font-black text-slate-900 dark:text-white">
                                        {formatManWon(row.resultingNetWorth)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 4. 종목별 환노출 판별 목록 & 원클릭 보정 스위치 */}
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-gray-700 pb-3">
                    <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <span>🔍</span> 보유 종목별 환율 연동 판별 내역 (클릭하여 수동 전환 가능)
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            국내 상장 미국 ETF는 이름에 <code>(H)</code>나 <code>환헤지</code>가 없으면 자동으로 <b>100% 달러 연동</b>으로 분류됩니다. 배지를 클릭하면 직접 바꿀 수 있습니다.
                        </p>
                    </div>
                    {Object.keys(manualExposureOverrides).length > 0 && (
                        <button
                            type="button"
                            onClick={() => setManualExposureOverrides({})}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-gray-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer self-start"
                        >
                            자동 분류로 초기화
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {exposureData.items.map(it => {
                        const fxDelta = Math.round(it.evalManwon * it.ratio * ((targetFxRate - baseUsdKrw) / baseUsdKrw) * 10) / 10;
                        return (
                            <div
                                key={it.key}
                                className="p-3.5 rounded-xl bg-slate-50 dark:bg-gray-900/70 border border-slate-200/70 dark:border-gray-700 flex items-center justify-between gap-3"
                            >
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">
                                            {it.name}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleCycleExposure(it.key, it.ratio)}
                                            title="클릭하여 달러 연동 비율(100% ➔ 0% ➔ 50%) 전환"
                                            className={`px-2 py-0.5 rounded-full text-[10px] font-black cursor-pointer transition-colors ${
                                                it.ratio === 1.0
                                                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-300/60 dark:border-blue-700/50'
                                                    : it.ratio === 0.5
                                                        ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-300/60'
                                                        : 'bg-slate-200 dark:bg-gray-700 text-slate-600 dark:text-slate-300'
                                            }`}
                                        >
                                            {it.badge} ↻
                                        </button>
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mt-1 tabular-nums">
                                        {it.accountName} · 평가액 {it.evalManwon.toLocaleString()}만원 (달러노출 {(it.evalManwon * it.ratio).toFixed(0)}만)
                                    </div>
                                </div>

                                <div className="text-right shrink-0">
                                    <div className="text-[10px] text-slate-400 font-bold">{targetFxRate}원 시 환차손익</div>
                                    <div className={`text-sm font-black tabular-nums ${
                                        fxDelta > 0 ? 'text-emerald-600 dark:text-emerald-400' : fxDelta < 0 ? 'text-rose-500' : 'text-slate-400'
                                    }`}>
                                        {fxDelta > 0 ? `+${fxDelta}` : fxDelta}만원
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
