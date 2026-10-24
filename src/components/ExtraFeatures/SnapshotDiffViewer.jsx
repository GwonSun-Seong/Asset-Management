import React, { useState, useMemo, useEffect } from 'react';

const SECTOR_META = {
    deposit: { label: '예적금 · 현금성', icon: '🏦', isDebt: false },
    invest: { label: '주식 · 투자자산', icon: '📈', isDebt: false },
    investment: { label: '주식 · 투자자산', icon: '📈', isDebt: false },
    pension: { label: '연금 · ISA 절세', icon: '🛡️', isDebt: false },
    realEstate: { label: '부동산 · 실물자산', icon: '🏢', isDebt: false },
    realestate: { label: '부동산 · 실물자산', icon: '🏢', isDebt: false },
    loan: { label: '대출 · 차용금(부채)', icon: '💳', isDebt: true }
};

const CANONICAL_SECTORS = [
    { key: 'deposit', label: '예적금 · 현금성', icon: '🏦', isDebt: false },
    { key: 'invest', label: '주식 · 투자자산', icon: '📈', isDebt: false },
    { key: 'pension', label: '연금 · ISA 절세', icon: '🛡️', isDebt: false },
    { key: 'realEstate', label: '부동산 · 실물자산', icon: '🏢', isDebt: false },
    { key: 'loan', label: '대출 · 차용금(부채)', icon: '💳', isDebt: true }
];

const normalizeSectorKey = (sec = '') => {
    const s = String(sec).toLowerCase();
    if (s.includes('invest') || s.includes('stock') || s.includes('crypto')) return 'invest';
    if (s.includes('pension') || s.includes('isa') || s.includes('irp')) return 'pension';
    if (s.includes('real') || s.includes('estate')) return 'realEstate';
    if (s.includes('loan') || s.includes('debt')) return 'loan';
    return 'deposit';
};

export default function SnapshotDiffViewer({
    monthlySalary = 0,
    currentAppData = null,
    currentCalculation = null,
    assetHistory = [],
    addToast = null,
    externalBaseDate = '',
    externalTargetDate = '',
    onBaseDateChange = null,
    onTargetDateChange = null,
    isEmbedded = false
}) {
    // 날짜순 정렬된 히스토리 목록 (신규 stocks/accounts 구조 및 구형 snapshot.assets 모두 호환)
    const sortedSnapshots = useMemo(() => {
        const safeHistory = Array.isArray(assetHistory) ? assetHistory : [];
        const list = [...safeHistory]
            .filter(item => item && item.date)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        return list.map((item, idx) => {
            const hasStocks = Array.isArray(item.stocks) && item.stocks.length > 0;
            const hasAccounts = Array.isArray(item.accounts) && item.accounts.length > 0;
            const hasLegacySnap = Boolean(item.snapshot && item.snapshot.assets);
            const hasDetail = hasStocks || hasAccounts || hasLegacySnap;

            return {
                id: `hist-${idx}-${item.date}`,
                index: idx,
                date: item.date,
                netWorth: Number(item.netWorth) || 0,
                grossWorth: Number(item.grossWorth || item.netWorth) || 0,
                fxRate: Number(item.fxRate) || 0,
                stockCount: Array.isArray(item.stocks) ? item.stocks.length : 0,
                memo: item.memo || '',
                hasDetail,
                raw: item
            };
        });
    }, [assetHistory]);

    const [baseSnapshotId, setBaseSnapshotId] = useState('');
    const [targetSnapshotId, setTargetSnapshotId] = useState('LIVE');
    const [activeTab, setActiveTab] = useState('all'); // 'all' | 'stocks' | 'accounts' | 'sectors'
    const [isStocksExpanded, setIsStocksExpanded] = useState(false);
    const [isAccountsExpanded, setIsAccountsExpanded] = useState(false);
    const INITIAL_STOCK_LIMIT = 7;
    const INITIAL_ACCOUNT_LIMIT = 8;

    // 외부(히스토리 차트 클릭 등)에서 전달된 날짜(externalBaseDate / externalTargetDate)와 양방향 동기화
    useEffect(() => {
        if (sortedSnapshots.length === 0) return;
        if (externalBaseDate) {
            const matched = sortedSnapshots.find(s => s.date === externalBaseDate);
            if (matched && matched.id !== baseSnapshotId) {
                setBaseSnapshotId(matched.id);
                return;
            }
        }
        if (!baseSnapshotId || !sortedSnapshots.some(s => s.id === baseSnapshotId)) {
            const withDetail = sortedSnapshots.filter(s => s.hasDetail);
            const fallback = withDetail.length > 0
                ? withDetail[Math.max(0, withDetail.length - 1)]
                : sortedSnapshots[Math.max(0, sortedSnapshots.length - 2)];
            if (fallback) {
                setBaseSnapshotId(fallback.id);
                if (onBaseDateChange) onBaseDateChange(fallback.date);
            }
        }
    }, [sortedSnapshots, externalBaseDate, baseSnapshotId]);

    useEffect(() => {
        if (!externalTargetDate) return;
        if (externalTargetDate === 'LIVE') {
            if (targetSnapshotId !== 'LIVE') setTargetSnapshotId('LIVE');
        } else {
            const matched = sortedSnapshots.find(s => s.date === externalTargetDate);
            if (matched && matched.id !== targetSnapshotId) {
                setTargetSnapshotId(matched.id);
            }
        }
    }, [sortedSnapshots, externalTargetDate, targetSnapshotId]);

    const handleSelectBase = (newId) => {
        setBaseSnapshotId(newId);
        const found = sortedSnapshots.find(s => s.id === newId);
        if (found && onBaseDateChange) {
            onBaseDateChange(found.date);
        }
    };

    const handleSelectTarget = (newId) => {
        setTargetSnapshotId(newId);
        if (newId === 'LIVE') {
            if (onTargetDateChange) onTargetDateChange('LIVE');
        } else {
            const found = sortedSnapshots.find(s => s.id === newId);
            if (found && onTargetDateChange) {
                onTargetDateChange(found.date);
            }
        }
    };

    const handleSwapPoints = () => {
        if (targetSnapshotId === 'LIVE') {
            if (sortedSnapshots.length > 0) {
                const latest = sortedSnapshots[sortedSnapshots.length - 1];
                const oldBaseId = baseSnapshotId;
                handleSelectBase(latest.id);
                handleSelectTarget(oldBaseId);
            }
        } else {
            const oldBaseId = baseSnapshotId;
            const oldTargetId = targetSnapshotId;
            handleSelectBase(oldTargetId);
            handleSelectTarget(oldBaseId);
        }
    };

    // raw assets 객체에서 정규화된 accountsList, stocksList 추출
    const extractFromAssetsObject = (assetsObj) => {
        const accountsList = [];
        const stocksList = [];
        if (!assetsObj || typeof assetsObj !== 'object') {
            return { accountsList, stocksList };
        }

        Object.keys(assetsObj).forEach(secKey => {
            const normSec = normalizeSectorKey(secKey);
            const arr = Array.isArray(assetsObj[secKey]) ? assetsObj[secKey] : [];
            arr.forEach(acc => {
                if (!acc || typeof acc !== 'object') return;
                const accName = String(acc.name || '미지정 계좌').trim();
                accountsList.push({
                    sec: normSec,
                    name: accName,
                    amount: Number(acc.amount) || 0,
                    monthlyContrib: Number(acc.monthlyContrib) || 0,
                    rate: Number(acc.rate) || 0
                });

                if (Array.isArray(acc.linkedItems)) {
                    acc.linkedItems.forEach(li => {
                        if (!li || typeof li !== 'object') return;
                        const ticker = String(li.ticker || '').trim();
                        const shares = Number(li.shares) || 0;
                        if (!ticker || ticker === '사용자 입력 필요' || shares <= 0) return;
                        const price = Number(li.currentPrice || li.basePrice || li.avgPrice) || 0;
                        const avgPrice = Number(li.avgPrice || price) || 0;
                        stocksList.push({
                            name: String(li.name || ticker).trim(),
                            ticker,
                            shares,
                            price,
                            avgPrice,
                            accountName: accName,
                            sector: normSec
                        });
                    });
                }
            });
        });

        return { accountsList, stocksList };
    };

    // 특정 스냅샷 ID를 정규화된 포트폴리오 데이터 구조로 변환
    const resolveSnapshotState = (snapId) => {
        const liveFx = Number(localStorage.getItem('asset_last_usd_krw')) || 1350;

        if (snapId === 'LIVE' || !snapId) {
            const netWorth = Number(currentCalculation?.currentNet) || 0;
            const grossWorth = Number(currentCalculation?.currentTotal) || 0;
            const { accountsList, stocksList } = extractFromAssetsObject(currentAppData?.assets || {});

            return {
                label: '현재 실시간 자산 상태',
                shortLabel: '현재 실시간',
                hasDetail: true,
                netWorth,
                grossWorth,
                totalDebt: Math.max(0, grossWorth - netWorth),
                fxRate: Math.round(liveFx * 100) / 100,
                accountsList,
                stocksList
            };
        }

        const found = sortedSnapshots.find(s => s.id === snapId) || sortedSnapshots[0];
        if (!found) {
            return {
                label: '기록 없음',
                shortLabel: '기록 없음',
                hasDetail: false,
                netWorth: 0,
                grossWorth: 0,
                totalDebt: 0,
                fxRate: liveFx,
                accountsList: [],
                stocksList: []
            };
        }

        const rawItem = found.raw || {};
        let accountsList = [];
        let stocksList = [];

        if (Array.isArray(rawItem.accounts) && rawItem.accounts.length > 0) {
            accountsList = rawItem.accounts.map(a => ({
                sec: normalizeSectorKey(a.sec),
                name: String(a.name || '미지정 계좌').trim(),
                amount: Number(a.amount) || 0,
                monthlyContrib: Number(a.monthlyContrib) || 0,
                rate: Number(a.rate) || 0
            }));
        } else if (rawItem.snapshot?.assets) {
            accountsList = extractFromAssetsObject(rawItem.snapshot.assets).accountsList;
        }

        if (Array.isArray(rawItem.stocks) && rawItem.stocks.length > 0) {
            stocksList = rawItem.stocks.map(s => ({
                name: String(s.name || s.ticker || '미지정 종목').trim(),
                ticker: String(s.ticker || '-').trim(),
                shares: Number(s.shares) || 0,
                price: Number(s.price || s.currentPrice) || 0,
                avgPrice: Number(s.avgPrice || s.price) || 0,
                accountName: String(s.accountName || '').trim(),
                sector: normalizeSectorKey(s.sector || 'invest')
            }));
        } else if (rawItem.snapshot?.assets) {
            stocksList = extractFromAssetsObject(rawItem.snapshot.assets).stocksList;
        }

        let calcGross = 0;
        let calcDebt = 0;
        accountsList.forEach(a => {
            const amt = Number(a.amount) || 0;
            if (a.sec === 'loan') calcDebt += amt;
            else calcGross += amt;
        });

        const netWorth = found.netWorth;
        const grossWorth = calcGross > 0 ? calcGross : found.grossWorth;
        const totalDebt = calcDebt > 0 ? calcDebt : Math.max(0, grossWorth - netWorth);
        const fxRate = Number(rawItem.fxRate) > 0 ? Number(rawItem.fxRate) : liveFx;

        return {
            label: `${found.date} 기록 ${found.memo ? `(${found.memo})` : ''}`,
            shortLabel: found.date,
            hasDetail: found.hasDetail,
            netWorth,
            grossWorth,
            totalDebt,
            fxRate: Math.round(fxRate * 100) / 100,
            accountsList,
            stocksList
        };
    };

    // 시점 간 차이 연산
    const diffResult = useMemo(() => {
        const base = resolveSnapshotState(baseSnapshotId);
        const target = resolveSnapshotState(targetSnapshotId);

        const netDiff = Math.round(target.netWorth - base.netWorth);
        const netDiffPct = base.netWorth > 0 ? ((netDiff / base.netWorth) * 100).toFixed(2) : '0.00';

        const grossDiff = Math.round(target.grossWorth - base.grossWorth);
        const grossDiffPct = base.grossWorth > 0 ? ((grossDiff / base.grossWorth) * 100).toFixed(2) : '0.00';

        const debtDiff = Math.round(target.totalDebt - base.totalDebt);
        const debtDiffPct = base.totalDebt > 0 ? ((debtDiff / base.totalDebt) * 100).toFixed(2) : '0.00';

        const fxDiff = Math.round((target.fxRate - base.fxRate) * 100) / 100;
        const fxDiffPct = base.fxRate > 0 ? ((fxDiff / base.fxRate) * 100).toFixed(2) : '0.00';

        // 1. 섹터별 차이
        const sectorDiffs = CANONICAL_SECTORS.map(secMeta => {
            const secKey = secMeta.key;
            const baseList = base.accountsList.filter(a => a.sec === secKey);
            const targetList = target.accountsList.filter(a => a.sec === secKey);

            const baseSum = Math.round(baseList.reduce((acc, a) => acc + (Number(a.amount) || 0), 0));
            const targetSum = Math.round(targetList.reduce((acc, a) => acc + (Number(a.amount) || 0), 0));
            const diff = targetSum - baseSum;
            const diffPct = baseSum > 0 ? ((diff / baseSum) * 100).toFixed(1) : (targetSum > 0 ? '신규' : '0.0');

            const baseWeight = !secMeta.isDebt && base.grossWorth > 0 ? (baseSum / base.grossWorth) * 100 : 0;
            const targetWeight = !secMeta.isDebt && target.grossWorth > 0 ? (targetSum / target.grossWorth) * 100 : 0;
            const weightDiff = (targetWeight - baseWeight).toFixed(1);

            return {
                secKey,
                ...secMeta,
                baseSum,
                targetSum,
                diff,
                diffPct,
                baseWeight: baseWeight.toFixed(1),
                targetWeight: targetWeight.toFixed(1),
                weightDiff
            };
        });

        // 2. 개별 계좌 차이
        const accountMap = new Map();
        const mergeAccountSide = (list, side) => {
            list.forEach(acc => {
                const secMeta = SECTOR_META[acc.sec] || SECTOR_META.deposit;
                const key = `${acc.sec}::${acc.name}`;
                const existing = accountMap.get(key) || {
                    key,
                    secKey: acc.sec,
                    secLabel: secMeta.label,
                    secIcon: secMeta.icon,
                    isDebt: secMeta.isDebt,
                    name: acc.name,
                    baseAmount: 0,
                    targetAmount: 0,
                    baseContrib: 0,
                    targetContrib: 0,
                    inBase: false,
                    inTarget: false
                };

                if (side === 'base') {
                    existing.baseAmount += Number(acc.amount) || 0;
                    existing.baseContrib += Number(acc.monthlyContrib) || 0;
                    existing.inBase = true;
                } else {
                    existing.targetAmount += Number(acc.amount) || 0;
                    existing.targetContrib += Number(acc.monthlyContrib) || 0;
                    existing.inTarget = true;
                }
                accountMap.set(key, existing);
            });
        };

        mergeAccountSide(base.accountsList, 'base');
        mergeAccountSide(target.accountsList, 'target');

        const accountDiffs = Array.from(accountMap.values())
            .map(item => {
                const baseAmt = Math.round(item.baseAmount * 10) / 10;
                const targetAmt = Math.round(item.targetAmount * 10) / 10;
                const diff = Math.round((targetAmt - baseAmt) * 10) / 10;
                let status = 'UNCHANGED';
                let badgeLabel = '➖ 변동 없음';
                let badgeColor = 'slate';

                if (!item.inBase && item.inTarget && targetAmt > 0) {
                    status = 'NEW';
                    badgeLabel = item.isDebt ? '💳 신규 대출' : '🆕 신규 개설';
                    badgeColor = item.isDebt ? 'rose' : 'emerald';
                } else if (item.inBase && (!item.inTarget || targetAmt === 0) && baseAmt > 0) {
                    status = 'REMOVED';
                    badgeLabel = item.isDebt ? '🎉 전액 상환 완제!' : '🗑️ 해지/전액이동';
                    badgeColor = item.isDebt ? 'emerald' : 'amber';
                } else if (diff > 0) {
                    status = 'UP';
                    badgeLabel = item.isDebt ? '🔺 부채 증가' : '🔺 잔액 증가';
                    badgeColor = item.isDebt ? 'rose' : 'emerald';
                } else if (diff < 0) {
                    status = 'DOWN';
                    badgeLabel = item.isDebt ? '📉 원금 상환 감축' : '🔻 잔액 감소';
                    badgeColor = item.isDebt ? 'emerald' : 'blue';
                }

                return {
                    ...item,
                    baseAmt,
                    targetAmt,
                    diff,
                    status,
                    badgeLabel,
                    badgeColor
                };
            })
            .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

        // 3. 보유 주식/ETF 종목 차이 (평가액 변동폭 큰 순서대로 정렬)
        const stockMap = new Map();
        const mergeStockSide = (list, side) => {
            list.forEach(li => {
                const shares = Number(li.shares) || 0;
                const price = Number(li.price) || 0;
                const avgPrice = Number(li.avgPrice || price) || 0;
                if (shares <= 0 && price <= 0) return;

                const key = String(li.ticker || li.name || 'UNKNOWN').trim().toUpperCase();
                const existing = stockMap.get(key) || {
                    key,
                    ticker: li.ticker || '-',
                    name: li.name || li.ticker || '미지정 종목',
                    accountNames: new Set(),
                    baseShares: 0,
                    targetShares: 0,
                    basePrice: 0,
                    targetPrice: 0,
                    baseAvgPrice: 0,
                    targetAvgPrice: 0,
                    baseValMan: 0,
                    targetValMan: 0
                };

                if (li.accountName) existing.accountNames.add(li.accountName);
                const valMan = (shares * price) / 10000;

                if (side === 'base') {
                    existing.baseShares += shares;
                    existing.basePrice = price;
                    existing.baseAvgPrice = avgPrice;
                    existing.baseValMan += valMan;
                } else {
                    existing.targetShares += shares;
                    existing.targetPrice = price;
                    existing.targetAvgPrice = avgPrice;
                    existing.targetValMan += valMan;
                    existing.name = li.name || existing.name;
                }
                stockMap.set(key, existing);
            });
        };

        mergeStockSide(base.stocksList, 'base');
        mergeStockSide(target.stocksList, 'target');

        const stockDiffs = Array.from(stockMap.values())
            .map(st => {
                const shareDiff = Math.round((st.targetShares - st.baseShares) * 10000) / 10000;
                const baseVal = Math.round(st.baseValMan * 10) / 10;
                const targetVal = Math.round(st.targetValMan * 10) / 10;
                const valDiff = Math.round((targetVal - baseVal) * 10) / 10;
                const priceChangePct = st.basePrice > 0 && st.targetPrice > 0
                    ? (((st.targetPrice - st.basePrice) / st.basePrice) * 100).toFixed(1)
                    : null;

                let actionBadge = '🔒 수량 유지';
                let actionColor = 'slate';
                if (st.baseShares === 0 && st.targetShares > 0) {
                    actionBadge = '🆕 신규 편입';
                    actionColor = 'emerald';
                } else if (st.baseShares > 0 && st.targetShares === 0) {
                    actionBadge = '👋 전량 매도';
                    actionColor = 'amber';
                } else if (shareDiff > 0) {
                    actionBadge = `➕ +${shareDiff.toLocaleString()}주 추매`;
                    actionColor = 'indigo';
                } else if (shareDiff < 0) {
                    actionBadge = `➖ ${shareDiff.toLocaleString()}주 축소`;
                    actionColor = 'rose';
                }

                return {
                    ...st,
                    accountName: Array.from(st.accountNames).join(', ') || '투자계좌',
                    shareDiff,
                    baseVal,
                    targetVal,
                    valDiff,
                    priceChangePct,
                    actionBadge,
                    actionColor
                };
            })
            .sort((a, b) => Math.abs(b.valDiff) - Math.abs(a.valDiff));

        return {
            base,
            target,
            netDiff,
            netDiffPct,
            grossDiff,
            grossDiffPct,
            debtDiff,
            debtDiffPct,
            fxDiff,
            fxDiffPct,
            sectorDiffs,
            accountDiffs,
            stockDiffs
        };
    }, [baseSnapshotId, targetSnapshotId, sortedSnapshots, currentAppData, currentCalculation, monthlySalary]);

    const badgeColorMap = {
        emerald: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
        indigo: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
        amber: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
        rose: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
        blue: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
        slate: 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
    };

    const visibleStocks = isStocksExpanded
        ? diffResult.stockDiffs
        : diffResult.stockDiffs.slice(0, INITIAL_STOCK_LIMIT);
    const hiddenStockCount = Math.max(0, diffResult.stockDiffs.length - INITIAL_STOCK_LIMIT);

    const visibleAccounts = isAccountsExpanded
        ? diffResult.accountDiffs
        : diffResult.accountDiffs.slice(0, INITIAL_ACCOUNT_LIMIT);
    const hiddenAccountCount = Math.max(0, diffResult.accountDiffs.length - INITIAL_ACCOUNT_LIMIT);

    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            {/* 상단 시점 A · B 선택 컨트롤 패널 (앱 라이트/다크 테마 통일) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-gray-800/90 border border-slate-200/80 dark:border-gray-700 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[11px] font-black">
                                🕰️ 시점별 자산 차이 비교
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                                총 {sortedSnapshots.length}개 기록 (상세 기록 {sortedSnapshots.filter(s => s.hasDetail).length}개)
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {isEmbedded
                                ? '위 자산 히스토리 그래프에서 점을 클릭해 [⏪ 기준 A] · [⏩ 비교 B]를 지정하거나 아래 목록에서 비교할 두 날짜를 선택하세요.'
                                : '두 시점 사이에 어떤 계좌가 늘고 어떤 주식을 추매·매도했는지 차이를 비교합니다.'}
                        </p>
                    </div>
                </div>

                {/* 시점 A vs 시점 B 선택 컨트롤러 */}
                <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center bg-white dark:bg-gray-900/70 p-3.5 rounded-xl border border-slate-200/80 dark:border-gray-700">
                    <div className="md:col-span-5">
                        <label className="flex items-center justify-between text-xs font-black text-amber-700 dark:text-amber-400 mb-1.5">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                                ⏪ 기준 시점 A (과거 기록)
                            </span>
                            <span className="text-[10px] text-amber-600 dark:text-amber-300/80 font-bold">차트 노란색 핀</span>
                        </label>
                        <select
                            value={baseSnapshotId}
                            onChange={(e) => handleSelectBase(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-gray-800 border border-amber-300 dark:border-amber-600/60 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                            {sortedSnapshots.length === 0 && (
                                <option value="">저장된 히스토리 기록이 없습니다</option>
                            )}
                            {sortedSnapshots.map((s) => (
                                <option key={s.id} value={s.id}>
                                    [{s.date}] 순자산 {Math.round(s.netWorth).toLocaleString()}만 {s.hasDetail ? `📦(주식 ${s.stockCount}종·계좌 포함)` : '📊(요약 기록)'} {s.memo ? `- ${s.memo}` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-1 flex justify-center">
                        <button
                            type="button"
                            onClick={handleSwapPoints}
                            title="기준 시점 A와 비교 시점 B 맞바꾸기"
                            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-indigo-50 dark:bg-gray-800 dark:hover:bg-indigo-900/40 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-slate-200 flex items-center justify-center text-sm font-black transition-all active:scale-95 cursor-pointer"
                        >
                            ⇄
                        </button>
                    </div>

                    <div className="md:col-span-5">
                        <label className="flex items-center justify-between text-xs font-black text-emerald-700 dark:text-emerald-400 mb-1.5">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                                ⏩ 비교 시점 B (현재 또는 다른 날짜)
                            </span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-300/80 font-bold">차트 초록색 핀</span>
                        </label>
                        <select
                            value={targetSnapshotId}
                            onChange={(e) => handleSelectTarget(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-gray-800 border border-emerald-300 dark:border-emerald-600/60 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="LIVE">🟢 현재 실시간 자산 상태</option>
                            {sortedSnapshots.map((s) => (
                                <option key={s.id} value={s.id}>
                                    [{s.date}] 순자산 {Math.round(s.netWorth).toLocaleString()}만 {s.hasDetail ? `📦(주식 ${s.stockCount}종 포함)` : '📊(요약 기록)'}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* 총괄 4대 지표 차이 카드 (순자산, 총자산, 총부채, 적용환율 - 영어 병기 제거) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-2xs">
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400">순자산 차이</div>
                    <div className={`text-lg sm:text-xl font-black mt-1 tabular-nums ${diffResult.netDiff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {diffResult.netDiff >= 0 ? '+' : ''}{diffResult.netDiff.toLocaleString()}만원
                        <span className="text-[11px] ml-1 font-extrabold">
                            ({diffResult.netDiff >= 0 ? '+' : ''}{diffResult.netDiffPct}%)
                        </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-bold tabular-nums">
                        {Math.round(diffResult.base.netWorth).toLocaleString()}만 ➔ {Math.round(diffResult.target.netWorth).toLocaleString()}만원
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-2xs">
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400">총자산 차이</div>
                    <div className={`text-lg sm:text-xl font-black mt-1 tabular-nums ${diffResult.grossDiff >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {diffResult.grossDiff >= 0 ? '+' : ''}{diffResult.grossDiff.toLocaleString()}만원
                        <span className="text-[11px] ml-1 font-extrabold">
                            ({diffResult.grossDiff >= 0 ? '+' : ''}{diffResult.grossDiffPct}%)
                        </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-bold tabular-nums">
                        {Math.round(diffResult.base.grossWorth).toLocaleString()}만 ➔ {Math.round(diffResult.target.grossWorth).toLocaleString()}만원
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-2xs">
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400">총부채(대출) 차이</div>
                    <div className={`text-lg sm:text-xl font-black mt-1 tabular-nums ${diffResult.debtDiff <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {diffResult.debtDiff > 0 ? '+' : ''}{diffResult.debtDiff.toLocaleString()}만원
                        <span className="text-[11px] ml-1 font-extrabold">
                            ({diffResult.debtDiff > 0 ? '+' : ''}{diffResult.debtDiffPct}%)
                        </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-bold tabular-nums">
                        {Math.round(diffResult.base.totalDebt).toLocaleString()}만 ➔ {Math.round(diffResult.target.totalDebt).toLocaleString()}만원
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-2xs">
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400">적용 환율 차이</div>
                    <div className={`text-lg sm:text-xl font-black mt-1 tabular-nums ${diffResult.fxDiff >= 0 ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`}>
                        {diffResult.fxDiff >= 0 ? '+' : ''}{diffResult.fxDiff.toLocaleString()}원
                        <span className="text-[11px] ml-1 font-extrabold">
                            ({diffResult.fxDiff >= 0 ? '+' : ''}{diffResult.fxDiffPct}%)
                        </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-bold tabular-nums">
                        {diffResult.base.fxRate.toLocaleString()}원 ➔ {diffResult.target.fxRate.toLocaleString()}원
                    </div>
                </div>
            </div>

            {!diffResult.base.hasDetail && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-300 font-bold flex items-center gap-2">
                    <span>💡</span>
                    <span>
                        선택하신 과거 기록(<b>{diffResult.base.shortLabel}</b>)은 상세 스냅샷 도입 이전에 저장된 순자산 요약본입니다. 상세 기록(<b>📦 표시 항목</b>)을 선택하시면 당시 주식 수량·단가 및 계좌별 변화가 함께 표시됩니다.
                    </span>
                </div>
            )}

            {/* 필터 탭 바 */}
            <div className="flex flex-wrap items-center gap-1.5">
                {[
                    { id: 'all', label: '🔍 전체 요약' },
                    { id: 'stocks', label: `📈 보유 주식 차이 (${diffResult.stockDiffs.length})` },
                    { id: 'accounts', label: `🏦 계좌 · 대출 차이 (${diffResult.accountDiffs.length})` },
                    { id: 'sectors', label: '📊 자산군 비중 차이' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            activeTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'bg-white dark:bg-gray-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-gray-700 hover:border-indigo-400'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* 1. 보유 주식/ETF 종목 차이 (기본 상위 7개만 노출 + 폴딩 버튼) */}
            {(activeTab === 'all' || activeTab === 'stocks') && (
                <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-2xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-gray-700 pb-3">
                        <div>
                            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <span>📈</span> 보유 주식 · ETF 종목 변화 내역
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                평가금액 변화폭이 가장 큰 상위 종목부터 정렬됩니다.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                                총 {diffResult.stockDiffs.length}개 종목 중 {visibleStocks.length}개 표시
                            </span>
                            {hiddenStockCount > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setIsStocksExpanded(prev => !prev)}
                                    className="px-2.5 py-1 rounded-lg text-[11px] font-black bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:hover:bg-indigo-900/70 text-indigo-600 dark:text-indigo-300 transition-colors cursor-pointer"
                                >
                                    {isStocksExpanded ? '상위 7개만 접기 ▲' : `+${hiddenStockCount}개 더 보기 ▼`}
                                </button>
                            )}
                        </div>
                    </div>

                    {diffResult.stockDiffs.length > 0 ? (
                        <>
                            {/* 데스크톱 테이블 뷰 */}
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-gray-700 text-slate-400 font-black">
                                            <th className="py-2.5 px-3">종목명 (티커 · 계좌)</th>
                                            <th className="py-2.5 px-3">수량 변동</th>
                                            <th className="py-2.5 px-3 text-right">보유 수량 (A ➔ B)</th>
                                            <th className="py-2.5 px-3 text-right">1주당 단가 (A ➔ B)</th>
                                            <th className="py-2.5 px-3 text-right">평가액 (A ➔ B)</th>
                                            <th className="py-2.5 px-3 text-right">평가액 차이</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-gray-700/60">
                                        {visibleStocks.map((st, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-gray-700/30">
                                                <td className="py-2.5 px-3">
                                                    <div className="font-black text-slate-800 dark:text-slate-100">{st.name}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold">
                                                        <code className="text-indigo-500">{st.ticker}</code> · {st.accountName}
                                                    </div>
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-lg border ${badgeColorMap[st.actionColor]}`}>
                                                        {st.actionBadge}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                                                    {st.baseShares.toLocaleString()}주 ➔ <b className="text-slate-900 dark:text-white">{st.targetShares.toLocaleString()}주</b>
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-bold text-slate-600 dark:text-slate-300 tabular-nums">
                                                    {st.basePrice > 0 ? `${st.basePrice.toLocaleString()}원` : '-'} ➔ <b className="text-slate-900 dark:text-white">{st.targetPrice > 0 ? `${st.targetPrice.toLocaleString()}원` : '-'}</b>
                                                    {st.priceChangePct !== null && (
                                                        <span className={`ml-1 text-[10px] font-bold ${Number(st.priceChangePct) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                            ({Number(st.priceChangePct) >= 0 ? '+' : ''}{st.priceChangePct}%)
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-bold text-slate-600 dark:text-slate-300 tabular-nums">
                                                    {st.baseVal.toLocaleString()}만 ➔ <b className="text-slate-900 dark:text-white">{st.targetVal.toLocaleString()}만원</b>
                                                </td>
                                                <td className={`py-2.5 px-3 text-right font-black tabular-nums ${st.valDiff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                    {st.valDiff >= 0 ? '+' : ''}{st.valDiff.toLocaleString()}만원
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* 모바일 카드 뷰 (글자 잘림 및 가로 스크롤 방지) */}
                            <div className="sm:hidden space-y-2.5">
                                {visibleStocks.map((st, idx) => (
                                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-gray-900/70 border border-slate-200/70 dark:border-gray-700 space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="text-xs font-black text-slate-900 dark:text-white truncate">{st.name}</div>
                                                <div className="text-[10px] text-slate-400 font-bold truncate">
                                                    {st.ticker} · {st.accountName}
                                                </div>
                                            </div>
                                            <span className={`shrink-0 text-[10px] font-black px-2 py-0.5 rounded-md border ${badgeColorMap[st.actionColor]}`}>
                                                {st.actionBadge}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] font-bold pt-1.5 border-t border-slate-200/60 dark:border-gray-700/60">
                                            <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                                                {st.baseShares.toLocaleString()}주 ➔ <b className="text-slate-800 dark:text-slate-200">{st.targetShares.toLocaleString()}주</b>
                                            </span>
                                            <span className={`font-black tabular-nums ${st.valDiff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                {st.valDiff >= 0 ? '+' : ''}{st.valDiff.toLocaleString()}만원 ({st.targetVal.toLocaleString()}만)
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* 하단 폴딩 토글 버튼 */}
                            {hiddenStockCount > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setIsStocksExpanded(prev => !prev)}
                                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 dark:bg-gray-700/60 dark:hover:bg-gray-700 text-xs font-black text-slate-700 dark:text-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                    {isStocksExpanded ? (
                                        <><span>▲</span> 변화폭 상위 {INITIAL_STOCK_LIMIT}개 종목만 보기 (접기)</>
                                    ) : (
                                        <><span>▼</span> 나머지 {hiddenStockCount}개 종목 더 보기 (전체 {diffResult.stockDiffs.length}개 종목 펼치기)</>
                                    )}
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="py-6 text-center text-xs text-slate-400 font-bold">
                            비교할 세부 주식 종목 데이터가 없습니다.
                        </div>
                    )}
                </div>
            )}

            {/* 2. 개별 계좌 차이 (기본 상위 8개 노출 + 폴딩) */}
            {(activeTab === 'all' || activeTab === 'accounts') && (
                <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-2xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-gray-700 pb-3">
                        <div>
                            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <span>🏦</span> 개별 계좌 · 대출 잔액 차이
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                잔액 변화가 큰 순서대로 정렬됩니다.
                            </p>
                        </div>
                        <span className="text-xs font-black text-slate-500 dark:text-slate-400">
                            총 {diffResult.accountDiffs.length}개 계좌 중 {visibleAccounts.length}개 표시
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {visibleAccounts.map((acc, idx) => (
                            <div
                                key={idx}
                                className="p-3.5 rounded-xl bg-slate-50 dark:bg-gray-900/70 border border-slate-200/70 dark:border-gray-700 flex items-center justify-between gap-3"
                            >
                                <div className="min-w-0 space-y-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span>{acc.secIcon}</span>
                                        <span className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">
                                            {acc.name}
                                        </span>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${badgeColorMap[acc.badgeColor]}`}>
                                            {acc.badgeLabel}
                                        </span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold tabular-nums">
                                        {acc.secLabel} · {acc.baseAmt.toLocaleString()}만 ➔ <b className="text-slate-800 dark:text-slate-200">{acc.targetAmt.toLocaleString()}만원</b>
                                    </div>
                                </div>

                                <div className="text-right flex-shrink-0">
                                    <div className={`text-sm font-black tabular-nums ${
                                        acc.diff === 0
                                            ? 'text-slate-400'
                                            : (acc.isDebt ? acc.diff < 0 : acc.diff > 0)
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-rose-600 dark:text-rose-400'
                                    }`}>
                                        {acc.diff > 0 ? '+' : ''}{acc.diff.toLocaleString()}만원
                                    </div>
                                    {(acc.baseContrib !== acc.targetContrib) && (
                                        <div className="text-[10px] text-indigo-500 font-bold tabular-nums">
                                            월납입 {acc.baseContrib}만 ➔ {acc.targetContrib}만
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {hiddenAccountCount > 0 && (
                        <button
                            type="button"
                            onClick={() => setIsAccountsExpanded(prev => !prev)}
                            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 dark:bg-gray-700/60 dark:hover:bg-gray-700 text-xs font-black text-slate-700 dark:text-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                            {isAccountsExpanded ? (
                                <><span>▲</span> 주요 변동 계좌 {INITIAL_ACCOUNT_LIMIT}개만 보기 (접기)</>
                            ) : (
                                <><span>▼</span> 나머지 {hiddenAccountCount}개 계좌 더 보기 (전체 {diffResult.accountDiffs.length}개)</>
                            )}
                        </button>
                    )}
                </div>
            )}

            {/* 3. 자산군 섹터별 비중 변화 */}
            {(activeTab === 'all' || activeTab === 'sectors') && (
                <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-2xs space-y-4">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-gray-700 pb-3">
                        <span>📊</span> 5대 자산군별 잔액 및 비중 변화
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                        {diffResult.sectorDiffs.map((sec) => (
                            <div
                                key={sec.secKey}
                                className="p-3.5 rounded-xl bg-slate-50 dark:bg-gray-900/70 border border-slate-200/70 dark:border-gray-700 space-y-1.5"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                                        <span>{sec.icon}</span>
                                        <span>{sec.label}</span>
                                    </span>
                                </div>
                                <div className={`text-base font-black tabular-nums ${
                                    sec.diff === 0
                                        ? 'text-slate-500'
                                        : (sec.isDebt ? sec.diff < 0 : sec.diff > 0)
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-rose-600 dark:text-rose-400'
                                }`}>
                                    {sec.diff > 0 ? '+' : ''}{sec.diff.toLocaleString()}만원
                                </div>
                                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                                    {sec.baseSum.toLocaleString()}만 ➔ {sec.targetSum.toLocaleString()}만
                                </div>
                                {!sec.isDebt && (
                                    <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 pt-1 border-t border-slate-200/60 dark:border-gray-700">
                                        비중: {sec.baseWeight}% ➔ {sec.targetWeight}% ({Number(sec.weightDiff) > 0 ? `+${sec.weightDiff}` : sec.weightDiff}%p)
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
