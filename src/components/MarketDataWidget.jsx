import React, { useState, useEffect, useRef } from 'react';
import { Chart } from 'chart.js';

const MarketDataWidget = ({ darkMode }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const canvasRef = useRef(null);
    const chartInstance = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [marketItems, setMarketItems] = useState(window.INITIAL_MARKET_ITEMS || []);
    const retryCountRef = useRef(0);

    const marketItemsRef = useRef(marketItems);
    useEffect(() => { marketItemsRef.current = marketItems; }, [marketItems]);
    const retryTimeoutRef = useRef(null);

    const fetchMarketData = React.useCallback(async (forceRefresh = false) => {
        const isForce = typeof forceRefresh === 'boolean' ? forceRefresh : true;
        
        if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
        if (isForce) retryCountRef.current = 0;
        setIsLoading(true);

        // Fetch live quotes and rate from Toss API if credentials are set
        let spyCandles = null, qqqCandles = null, gldCandles = null;
        let quotes = {};
        let liveRate = Number(localStorage.getItem('asset_last_usd_krw')) || 1340.50;
        const clientId = localStorage.getItem('toss_client_id');
        const clientSecret = localStorage.getItem('toss_client_secret');
        const hasTossKeys = clientId && clientSecret;

        if (hasTossKeys) {
            // 1. 캔들 조회 시도 (30일치 차트 및 실시간 시세 확보)
            try {
                if (window.fetchTossCandles) {
                    const results = await Promise.allSettled([
                        window.fetchTossCandles('SPY', 30),
                        window.fetchTossCandles('QQQ', 30),
                        window.fetchTossCandles('GLD', 30)
                    ]);
                    spyCandles = results[0].status === 'fulfilled' ? results[0].value : null;
                    qqqCandles = results[1].status === 'fulfilled' ? results[1].value : null;
                    gldCandles = results[2].status === 'fulfilled' ? results[2].value : null;
                }
            } catch (err) {
                console.warn("Toss candles fetch failed in widget:", err);
            }

            // 2. 만약 일부 캔들 조회가 실패한 경우에만 백업용으로 현재가(Quotes) 조회
            const needQuotes = !spyCandles || !qqqCandles || !gldCandles;
            if (needQuotes) {
                try {
                    if (window.fetchTossQuotes) {
                        quotes = await window.fetchTossQuotes(['SPY', 'QQQ', 'GLD']);
                    }
                } catch (err) {
                    console.warn("Toss quotes backup fetch failed in widget:", err);
                }
            }

            // 3. 환율 조회
            try {
                if (window.fetchTossExchangeRate) {
                    liveRate = await window.fetchTossExchangeRate();
                }
            } catch (err) {
                console.warn("Toss exchange rate fetch failed in widget:", err);
            }
        }

        // 과거 30일 데이터 스케일링 함수 (수직 점프 방지용 백업 폴백)
        const getIndexData = (idx, livePrice) => {
            const baseData = window.INITIAL_MARKET_ITEMS[idx].data;
            const lastHistoricalPrice = baseData[baseData.length - 1];
            const scaleFactor = lastHistoricalPrice > 0 ? livePrice / lastHistoricalPrice : 1;
            const chartData = baseData.map(val => val * scaleFactor);
            
            const prevPriceScaled = baseData[baseData.length - 2] * scaleFactor;
            const changePercent = prevPriceScaled > 0 ? ((livePrice - prevPriceScaled) / prevPriceScaled) * 100 : 0;
            return { price: livePrice, change: changePercent, data: chartData };
        };

        // 토스 캔들 기반 인덱스 빌드 함수 (100% 실시세 차트)
        const getCandleIndexData = (candles, multiplier) => {
            const sortedCandles = [...candles].reverse();
            const prices = sortedCandles.map(c => Number(c.closePrice) * multiplier);
            const livePrice = prices[prices.length - 1];
            const prevPrice = prices[prices.length - 2] || livePrice;
            const changePercent = prevPrice > 0 ? ((livePrice - prevPrice) / prevPrice) * 100 : 0;
            return { price: livePrice, change: changePercent, data: prices };
        };

        const targets = [
            { 
                name: 'USD/KRW', 
                fn: async () => {
                    if (hasTossKeys) {
                        return { ...getIndexData(0, liveRate), isLive: true };
                    }
                    return { price: Number(localStorage.getItem('asset_last_usd_krw')) || 1340.50, change: 0.5, data: window.INITIAL_MARKET_ITEMS[0].data, isLive: false };
                }
            },
            { 
                name: 'S&P 500', 
                fn: async () => {
                    if (spyCandles && spyCandles.length >= 2) {
                        return { ...getCandleIndexData(spyCandles, 10.035), isLive: true };
                    }
                    const spyPrice = quotes['SPY']?.price;
                    if (hasTossKeys && spyPrice) {
                        return { ...getIndexData(1, spyPrice * 10.035), isLive: true };
                    }
                    return { price: 5120.30, change: 1.2, data: window.INITIAL_MARKET_ITEMS[1].data, isLive: false };
                }
            },
            { 
                name: 'NASDAQ', 
                fn: async () => {
                    if (qqqCandles && qqqCandles.length >= 2) {
                        return { ...getCandleIndexData(qqqCandles, 35.85), isLive: true };
                    }
                    const qqqPrice = quotes['QQQ']?.price;
                    if (hasTossKeys && qqqPrice) {
                        return { ...getIndexData(2, qqqPrice * 35.85), isLive: true };
                    }
                    return { price: 16050.20, change: 1.5, data: window.INITIAL_MARKET_ITEMS[2].data, isLive: false };
                }
            },
            { 
                name: 'Bitcoin', 
                fn: async () => {
                    const btc = await window.fetchBitcoinData();
                    if (btc && btc.price) {
                        return { ...getIndexData(3, btc.price), isLive: true };
                    }
                    return { price: 65400.00, change: -0.8, data: window.INITIAL_MARKET_ITEMS[3].data, isLive: false };
                }
            },
            { 
                name: 'Gold', 
                fn: async () => {
                    if (gldCandles && gldCandles.length >= 2) {
                        return { ...getCandleIndexData(gldCandles, 10.92), isLive: true };
                    }
                    const gldPrice = quotes['GLD']?.price;
                    if (hasTossKeys && gldPrice) {
                        return { ...getIndexData(4, gldPrice * 10.92), isLive: true };
                    }
                    return { price: 2150.00, change: 0.3, data: window.INITIAL_MARKET_ITEMS[4].data, isLive: false };
                }
            }
        ];

        const itemsToFetch = isForce 
            ? targets 
            : targets.filter(t => {
                const item = marketItemsRef.current.find(m => m.name === t.name);
                return item && !item.isLive;
            });

        if (itemsToFetch.length === 0) {
            setIsLoading(false);
            return;
        }

        try {
            const results = await Promise.allSettled(
                itemsToFetch.map(t => t.fn().then(data => ({ ...t, data })))
            );

            let failCount = 0;

            setMarketItems(prev => {
                const next = [...prev];
                results.forEach(res => {
                    if (res.status === 'fulfilled' && res.value.data) {
                        const { name, data } = res.value;
                        const idx = next.findIndex(item => item.name === name);
                        if (idx === -1) return;

                        const item = next[idx];
                        const sign = data.change >= 0 ? '+' : '';
                        const color = data.change >= 0 ? 'red' : 'blue';
                        
                        if (name === 'USD/KRW') localStorage.setItem('asset_last_usd_krw', data.price.toString());

                        const formattedValue = (item.name === 'Gold' || item.name === 'Bitcoin') 
                            ? `$${data.price.toLocaleString(undefined, {maximumFractionDigits: 2})}`
                            : data.price.toLocaleString(undefined, {maximumFractionDigits: 2});

                        next[idx] = {
                            ...item,
                            value: formattedValue,
                            change: `${sign}${data.change.toFixed(2)}%`,
                            color: color,
                            data: data.data,
                            isLive: !!data.isLive
                        };
                    } else {
                        failCount++;
                    }
                });
                return next;
            });

            if (failCount > 0 && retryCountRef.current < 3) {
                retryCountRef.current += 1;
                retryTimeoutRef.current = setTimeout(() => fetchMarketData(false), 3000);
            }

        } catch (e) {
            console.warn("Market data fetch failed", e);
            if (retryCountRef.current < 3) retryTimeoutRef.current = setTimeout(() => fetchMarketData(false), 5000);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMarketData(true);
        return () => { if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current); };
    }, [fetchMarketData]);

    const currentItem = marketItems[currentIndex];
    const nextItem = () => setCurrentIndex((prev) => (prev + 1) % marketItems.length);
    const prevItem = () => setCurrentIndex((prev) => (prev - 1 + marketItems.length) % marketItems.length);

    useEffect(() => {
        if (canvasRef.current && typeof Chart !== 'undefined') {
            if (chartInstance.current) chartInstance.current.destroy();
            const ctx = canvasRef.current.getContext('2d');
            const isPositive = currentItem.change.startsWith('+');
            const lineColor = isPositive ? '#ef4444' : '#3b82f6';
            const bgColor = isPositive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)';

            const labels = Array.from({length: currentItem.data.length}, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (currentItem.data.length - 1 - i));
                return `${d.getMonth()+1}/${d.getDate()}`;
            });

            chartInstance.current = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        data: currentItem.data,
                        borderColor: lineColor,
                        backgroundColor: bgColor,
                        borderWidth: 2,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    plugins: { 
                        legend: { display: false }, 
                        tooltip: { 
                            enabled: true,
                            backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                            titleColor: darkMode ? '#000' : '#fff',
                            bodyColor: darkMode ? '#000' : '#fff',
                            displayColors: false,
                            callbacks: {
                                label: (context) => {
                                    const val = context.parsed.y;
                                    if (currentItem.name === 'USD/KRW') return `₩${val.toLocaleString()}`;
                                    if (['Bitcoin', 'Gold'].includes(currentItem.name)) return `$${val.toLocaleString()}`;
                                    return val.toLocaleString();
                                }
                            }
                        } 
                    },
                    scales: { 
                        x: { display: true, ticks: { display: false }, grid: { display: false } },
                        y: { display: false } 
                    },
                    layout: { padding: 0 },
                    animation: { duration: 0 }
                }
            });
        }
        return () => { if (chartInstance.current) chartInstance.current.destroy(); };
    }, [currentIndex, darkMode, currentItem]);

    if (!marketItems || marketItems.length === 0) {
        return <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 text-center text-xs text-gray-500 dark:text-gray-400">시장 지표 데이터를 불러올 수 없습니다.</div>;
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">시장 지표</h3>
                    {isLoading ? (
                        <span className="text-[10px] text-blue-500 animate-pulse">업데이트 중...</span>
                    ) : (
                        <span className={`text-[10px] ${currentItem.isLive ? 'text-green-500' : 'text-gray-400'}`}>{currentItem.isLive ? '● 실시간' : '○ 데모'}</span>
                    )}
                </div>
                <div className="flex gap-1">
                    <button onClick={fetchMarketData} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded" title="새로고침"><svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button>
                    <button onClick={prevItem} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg></button>
                    <button onClick={nextItem} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg></button>
                </div>
            </div>
            <div className="flex flex-col">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <div className="text-sm font-bold text-gray-800 dark:text-white">{currentItem.name}</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{currentItem.value}</div>
                    </div>
                    <div className={`text-xs font-bold px-1.5 py-0.5 rounded ${currentItem.change.startsWith('+') ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                        {currentItem.change}
                    </div>
                </div>
                <div className="h-20 w-full">
                    <canvas ref={canvasRef}></canvas>
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>30일 전</span>
                    <span>오늘</span>
                </div>
            </div>
        </div>
    );
};

export default MarketDataWidget;
