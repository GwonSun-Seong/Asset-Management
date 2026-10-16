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
    addToast = null
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

    useEffect(() => {
        if (sortedSnapshots.length > 0 && !baseSnapshotId) {
            const withDetail = sortedSnapshots.filter(s => s.hasDetail);
            if (withDetail.length > 0) {
                setBaseSnapshotId(withDetail[0].id);
            } else {
                setBaseSnapshotId(sortedSnapshots[0].id);
            }
        }
    }, [sortedSnapshots, baseSnapshotId]);

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
                label: '현재 실시간 포트폴리오 (LIVE)',
                shortLabel: '현재 (LIVE)',
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

    // 1:1 정밀 Diff 연산
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

        // 1. 섹터별 1:1 Diff
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

        // 2. 개별 계좌(Account) 1:1 Diff
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
                    badgeLabel = item.isDebt ? '💳 신규 차입' : '🆕 신규 개설';
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

        // 3. 보유 주식/ETF 종목(stocksList) 1:1 Diff
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

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* 상단 히어로 배너 */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl border border-slate-700/60">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-[10px] font-black uppercase tracking-wider">
                                Time-Machine Git Diff Engine
                            </span>
                            <span className="text-xs text-slate-400 font-bold">
                                총 {sortedSnapshots.length}개 히스토리 기록 (주식·계좌 상세 포함 {sortedSnapshots.filter(s => s.hasDetail).length}개)
                            </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black mt-2 flex items-center gap-2">
                            <span>🕰️</span> 스냅샷 타임머신 1:1 Diff 비교기
                        </h2>
                        <p className="text-xs text-slate-300 mt-1">
                            히스토리 스냅샷과 현재 포트폴리오를 Git 코드 비교하듯 대조하여 어떤 계좌가 늘고 어떤 주식을 몇 주 추매·매도했는지 1:1로 추적합니다.
                        </p>
                    </div>
                </div>

                {/* 시점 A vs 시점 B 선택 컨트롤러 */}
                <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center mt-5 bg-slate-950/50 p-4 rounded-2xl border border-white/10">
                    <div className="md:col-span-5">
                        <label className="block text-[11px] font-black text-indigo-300 mb-1">
                            ⏪ 기준 시점 A (과거 히스토리 선택)
                        </label>
                        <select
                            value={baseSnapshotId}
                            onChange={(e) => setBaseSnapshotId(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {sortedSnapshots.length === 0 && (
                                <option value="">저장된 히스토리 스냅샷이 없습니다</option>
                            )}
                            {sortedSnapshots.map((s) => (
                                <option key={s.id} value={s.id}>
                                    [{s.date}] 순자산 {Math.round(s.netWorth).toLocaleString()}만 {s.hasDetail ? `📦(주식 ${s.stockCount}종·계좌 포함)` : '📊(순자산 요약)'} {s.memo ? `- ${s.memo}` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-1 flex justify-center">
                        <span className="w-9 h-9 rounded-full bg-indigo-600/40 border border-indigo-400/40 flex items-center justify-center text-sm font-black">
                            VS
                        </span>
                    </div>

                    <div className="md:col-span-5">
                        <label className="block text-[11px] font-black text-emerald-300 mb-1">
                            ⏩ 비교 시점 B (현재 또는 다른 스냅샷)
                        </label>
                        <select
                            value={targetSnapshotId}
                            onChange={(e) => setTargetSnapshotId(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-emerald-600/50 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="LIVE">🟢 현재 실시간 포트폴리오 (LIVE 상태)</option>
                            {sortedSnapshots.map((s) => (
                                <option key={s.id} value={s.id}>
                                    [{s.date}] 순자산 {Math.round(s.netWorth).toLocaleString()}만 {s.hasDetail ? `📦(주식 ${s.stockCount}종 포함)` : '📊(요약)'}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* 총괄 4대 지표 Diff 카드 (순자산, 총자산, 총부채, 적용환율) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-850 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                    <div className="text-xs font-bold text-slate-400">순자산 (Net Worth) 변동</div>
                    <div className={`text-2xl font-black mt-1.5 ${diffResult.netDiff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {diffResult.netDiff >= 0 ? '+' : ''}{diffResult.netDiff.toLocaleString()}만원
                        <span className="text-xs ml-1.5 font-extrabold">
                            ({diffResult.netDiff >= 0 ? '+' : ''}{diffResult.netDiffPct}%)
                        </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 font-bold">
                        {Math.round(diffResult.base.netWorth).toLocaleString()}만 ➔ {Math.round(diffResult.target.netWorth).toLocaleString()}만원
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-850 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                    <div className="text-xs font-bold text-slate-400">총자산 (Gross Assets) 변동</div>
                    <div className={`text-2xl font-black mt-1.5 ${diffResult.grossDiff >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {diffResult.grossDiff >= 0 ? '+' : ''}{diffResult.grossDiff.toLocaleString()}만원
                        <span className="text-xs ml-1.5 font-extrabold">
                            ({diffResult.grossDiff >= 0 ? '+' : ''}{diffResult.grossDiffPct}%)
                        </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 font-bold">
                        {Math.round(diffResult.base.grossWorth).toLocaleString()}만 ➔ {Math.round(diffResult.target.grossWorth).toLocaleString()}만원
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-850 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                    <div className="text-xs font-bold text-slate-400">총부채 (Total Debt) 변동</div>
                    <div className={`text-2xl font-black mt-1.5 ${diffResult.debtDiff <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {diffResult.debtDiff > 0 ? '+' : ''}{diffResult.debtDiff.toLocaleString()}만원
                        <span className="text-xs ml-1.5 font-extrabold">
                            ({diffResult.debtDiff > 0 ? '+' : ''}{diffResult.debtDiffPct}%)
                        </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 font-bold">
                        {Math.round(diffResult.base.totalDebt).toLocaleString()}만 ➔ {Math.round(diffResult.target.totalDebt).toLocaleString()}만원
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-850 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                    <div className="text-xs font-bold text-slate-400">USD/KRW 적용 환율 변동</div>
                    <div className={`text-2xl font-black mt-1.5 ${diffResult.fxDiff >= 0 ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`}>
                        {diffResult.fxDiff >= 0 ? '+' : ''}{diffResult.fxDiff.toLocaleString()}원
                        <span className="text-xs ml-1.5 font-extrabold">
                            ({diffResult.fxDiff >= 0 ? '+' : ''}{diffResult.fxDiffPct}%)
                        </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 font-bold">
                        {diffResult.base.fxRate.toLocaleString()}원 ➔ {diffResult.target.fxRate.toLocaleString()}원
                    </div>
                </div>
            </div>

            {!diffResult.base.hasDetail && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-300 font-bold flex items-center gap-2">
                    <span>💡</span>
                    <span>
                        선택하신 과거 기록(<b>{diffResult.base.shortLabel}</b>)은 상세 스냅샷 도입 이전에 저장된 순자산 요약본입니다. 오늘부터 저장되는 히스토리(<b>📦 표시 항목</b>)를 선택하시면 당시 주식 수량·단가 및 계좌별 1:1 비교가 표시됩니다.
                    </span>
                </div>
            )}

            {/* 필터 탭 바 */}
            <div className="flex flex-wrap items-center gap-2">
                {[
                    { id: 'all', label: '🔍 전체 한눈에 보기' },
                    { id: 'stocks', label: `📈 보유 종목 수량·단가·평가액 Diff (${diffResult.stockDiffs.length})` },
                    { id: 'accounts', label: `🏦 개별 계좌 신설·해지·잔액 Diff (${diffResult.accountDiffs.length})` },
                    { id: 'sectors', label: '📊 자산군 섹터 비중 Diff' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            activeTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* 1. 보유 주식/ETF 종목 1:1 Diff 테이블 */}
            {(activeTab === 'all' || activeTab === 'stocks') && (
                <div className="bg-white dark:bg-slate-850 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b dark:border-slate-800 pb-3">
                        <div>
                            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <span>📈</span> 보유 주식 · ETF 종목 1:1 타임머신 대조표
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                기준 시점 대비 어떤 종목을 몇 주 추매(➕)했거나 매도(➖)했는지, 1주당 평가단가와 총 평가금액이 얼마나 변했는지 대조합니다.
                            </p>
                        </div>
                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                            총 {diffResult.stockDiffs.length}개 종목 추적
                        </span>
                    </div>

                    {diffResult.stockDiffs.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-black">
                                        <th className="py-2.5 px-3">종목명 (토스 요청 티커)</th>
                                        <th className="py-2.5 px-3">매매 변동 상태</th>
                                        <th className="py-2.5 px-3 text-right">보유 수량 변화</th>
                                        <th className="py-2.5 px-3 text-right">1주당 단가 변화</th>
                                        <th className="py-2.5 px-3 text-right">시점 A ➔ B 평가액</th>
                                        <th className="py-2.5 px-3 text-right">평가액 증감 (Δ)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                                    {diffResult.stockDiffs.map((st, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                                            <td className="py-3 px-3">
                                                <div className="font-black text-slate-800 dark:text-slate-100">{st.name}</div>
                                                <div className="text-[10px] text-slate-400 font-bold">
                                                    코드: <code className="text-indigo-500">{st.ticker}</code> • {st.accountName}
                                                </div>
                                            </td>
                                            <td className="py-3 px-3">
                                                <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-lg border ${badgeColorMap[st.actionColor]}`}>
                                                    {st.actionBadge}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 text-right font-bold text-slate-700 dark:text-slate-300">
                                                {st.baseShares.toLocaleString()}주 ➔ <b className="text-slate-900 dark:text-white">{st.targetShares.toLocaleString()}주</b>
                                            </td>
                                            <td className="py-3 px-3 text-right font-bold text-slate-600 dark:text-slate-300">
                                                {st.basePrice > 0 ? `${st.basePrice.toLocaleString()}원` : '-'} ➔ <b className="text-slate-900 dark:text-white">{st.targetPrice > 0 ? `${st.targetPrice.toLocaleString()}원` : '-'}</b>
                                                {st.priceChangePct !== null && (
                                                    <div className={`text-[10px] font-bold ${Number(st.priceChangePct) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                        ({Number(st.priceChangePct) >= 0 ? '+' : ''}{st.priceChangePct}%)
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-3 text-right font-bold text-slate-600 dark:text-slate-300">
                                                {st.baseVal.toLocaleString()}만 ➔ <b className="text-slate-900 dark:text-white">{st.targetVal.toLocaleString()}만원</b>
                                            </td>
                                            <td className={`py-3 px-3 text-right font-black ${st.valDiff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                {st.valDiff >= 0 ? '+' : ''}{st.valDiff.toLocaleString()}만원
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-6 text-center text-xs text-slate-400 font-bold">
                            비교할 세부 주식 종목 데이터가 없습니다.
                        </div>
                    )}
                </div>
            )}

            {/* 2. 개별 계좌 1:1 Diff 테이블 */}
            {(activeTab === 'all' || activeTab === 'accounts') && (
                <div className="bg-white dark:bg-slate-850 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b dark:border-slate-800 pb-3">
                        <div>
                            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <span>🏦</span> 개별 계좌 · 대출 항목 1:1 변동 내역
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                새로 개설된 계좌(🆕), 해지·완제된 계좌(🎉/🗑️), 잔액 증감 내역을 큰 변동순으로 정렬합니다.
                            </p>
                        </div>
                        <span className="text-xs font-black text-slate-500">
                            총 {diffResult.accountDiffs.length}개 계좌
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {diffResult.accountDiffs.map((acc, idx) => (
                            <div
                                key={idx}
                                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-3"
                            >
                                <div className="min-w-0 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span>{acc.secIcon}</span>
                                        <span className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">
                                            {acc.name}
                                        </span>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${badgeColorMap[acc.badgeColor]}`}>
                                            {acc.badgeLabel}
                                        </span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 font-bold">
                                        {acc.secLabel} • {acc.baseAmt.toLocaleString()}만 ➔ <b className="text-slate-800 dark:text-slate-200">{acc.targetAmt.toLocaleString()}만원</b>
                                    </div>
                                </div>

                                <div className="text-right flex-shrink-0">
                                    <div className={`text-sm font-black ${
                                        acc.diff === 0
                                            ? 'text-slate-400'
                                            : (acc.isDebt ? acc.diff < 0 : acc.diff > 0)
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-rose-600 dark:text-rose-400'
                                    }`}>
                                        {acc.diff > 0 ? '+' : ''}{acc.diff.toLocaleString()}만원
                                    </div>
                                    {(acc.baseContrib !== acc.targetContrib) && (
                                        <div className="text-[10px] text-indigo-500 font-bold">
                                            월납입 {acc.baseContrib}만 ➔ {acc.targetContrib}만
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. 자산군 섹터별 비중 Diff */}
            {(activeTab === 'all' || activeTab === 'sectors') && (
                <div className="bg-white dark:bg-slate-850 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2 border-b dark:border-slate-800 pb-3">
                        <span>📊</span> 5대 자산군 섹터별 잔액 & 포트폴리오 비중(%p) 변화
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {diffResult.sectorDiffs.map((sec) => (
                            <div
                                key={sec.secKey}
                                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-2"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                                        <span>{sec.icon}</span>
                                        <span>{sec.label}</span>
                                    </span>
                                </div>
                                <div className={`text-base font-black ${
                                    sec.diff === 0
                                        ? 'text-slate-500'
                                        : (sec.isDebt ? sec.diff < 0 : sec.diff > 0)
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-rose-600 dark:text-rose-400'
                                }`}>
                                    {sec.diff > 0 ? '+' : ''}{sec.diff.toLocaleString()}만원
                                </div>
                                <div className="text-[11px] font-bold text-slate-500">
                                    {sec.baseSum.toLocaleString()}만 ➔ {sec.targetSum.toLocaleString()}만
                                </div>
                                {!sec.isDebt && (
                                    <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 pt-1 border-t border-slate-200/60 dark:border-slate-800">
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
