// PostWriteModal.jsx - 커뮤니티 글쓰기 모달 (자산 포트폴리오 스냅샷 & 초경량 WebP 사진 첨부 포함)
import React, { useState, useRef } from 'react';
import AssetFlexCard from './AssetFlexCard';
import { uploadCommunityImage } from './imageUtils';
import { getTierByNetWorth } from './badgeConstants';

export default function PostWriteModal({ 
    isOpen, 
    onClose, 
    onSubmit, 
    currentUser, 
    isAdmin = false,
    currentAppData = null,
    currentCalculation = null,
    supabase = null
}) {
    if (!isOpen) return null;

    const [category, setCategory] = useState('free'); // 'free' | 'finance'
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState([]);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isNotice, setIsNotice] = useState(false);

    // 이미지 첨부 상태 (최대 3장)
    const [images, setImages] = useState([]);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const fileInputRef = useRef(null);

const SNAPSHOT_PREFS_KEY = 'asset_snapshot_pref_v1';

const DEFAULT_SNAPSHOT_PREFS = {
    flexDisplayMode: 'amount', // 'amount' | 'ratio'
    hideTierBadge: false,
    show_net_worth: true,
    show_debt_ratio: true,
    show_expected_return: true,
    show_runway: true,
    show_fire_rate: true,
    show_cash_flow: true,
    show_cash_flow_statement: true,
    show_portfolio_shares: true,
    show_top_holdings: true,
    excluded_holding_names: [],
    excluded_cash_flow_keys: []
};

const getSavedSnapshotPrefs = () => {
    try {
        const saved = localStorage.getItem(SNAPSHOT_PREFS_KEY);
        if (saved) {
            return { ...DEFAULT_SNAPSHOT_PREFS, ...JSON.parse(saved) };
        }
    } catch (e) {}
    return DEFAULT_SNAPSHOT_PREFS;
};

    // 자산 포트폴리오 스냅샷 첨부 상태 및 캐시된 사용자 커스텀 설정
    const [attachAssetSnapshot, setAttachAssetSnapshot] = useState(false);
    const [snapshotPrefs, setSnapshotPrefs] = useState(() => getSavedSnapshotPrefs());
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateSnapshotPrefs = (updater) => {
        setSnapshotPrefs(prev => {
            const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
            try {
                localStorage.setItem(SNAPSHOT_PREFS_KEY, JSON.stringify(next));
            } catch (e) {}
            return next;
        });
    };

    // 현재 사용자의 실제 데이터 기반으로 생성되는 자산 스냅샷 계산
    const generateSnapshotFromUserData = (isForPublishing = false) => {
        if (!currentAppData || !currentCalculation) return null;

        const netWorth = currentCalculation.currentNet || 0; // 만원 단위
        const isRatioMode = snapshotPrefs.flexDisplayMode === 'ratio';
        const calculatedTier = getTierByNetWorth(netWorth);
        let tierLabel = isRatioMode ? calculatedTier.label : `${calculatedTier.label} (${calculatedTier.criteria.replace('순자산 ', '')})`;
        let tierBadge = calculatedTier.icon;

        // 섹터별 메타 정보 (색상, 라벨, 아이콘)
        const sectorMeta = {
            investment: { label: '주식/투자', color: '#F97316', icon: '📈' },
            savings: { label: '예적금/저축', color: '#10B981', icon: '💰' },
            deposit: { label: '입출금통장', color: '#3B82F6', icon: '🏦' },
            pension: { label: '연금/퇴직', color: '#A855F7', icon: '🏛️' },
            realestate: { label: '부동산', color: '#F59E0B', icon: '🏠' },
            car: { label: '자동차', color: '#06B6D4', icon: '🚗' },
            misc: { label: '기타자산', color: '#6366F1', icon: '📦' }
        };

        const assets = currentAppData.assets || {};
        let grossTotal = 0;
        const sectorTotals = {};
        Object.keys(assets).forEach(sec => {
            if (sec === 'loan') return;
            const sum = (assets[sec] || []).reduce((acc, a) => acc + Number(a.amount || 0), 0);
            sectorTotals[sec] = sum;
            grossTotal += sum;
        });

        const portfolioShares = Object.keys(sectorTotals)
            .filter(sec => sectorTotals[sec] > 0)
            .map(sec => {
                const meta = sectorMeta[sec] || { label: sec, color: '#64748B', icon: '📁' };
                return {
                    sector: sec,
                    label: meta.label,
                    icon: meta.icon,
                    amount: sectorTotals[sec],
                    ratio: grossTotal > 0 ? Math.round((sectorTotals[sec] / grossTotal) * 100) : 0,
                    color: meta.color
                };
            })
            .sort((a, b) => b.ratio - a.ratio);

        // 상위 보유 종목 및 가중평균 수익률 산출
        const allItems = [];
        let totalWeightedReturn = 0;
        let eligibleAssetTotal = 0;

        Object.keys(assets).forEach(sec => {
            if (sec === 'loan') return;
            (assets[sec] || []).forEach(a => {
                const amt = Number(a.amount || 0);
                if (amt > 0) {
                    const r = typeof a.rate === 'number' ? a.rate : 0;
                    allItems.push({
                        name: a.name,
                        amount: amt,
                        rate: r,
                        sector: sec
                    });
                    totalWeightedReturn += amt * r;
                    eligibleAssetTotal += amt;
                }
            });
        });

        allItems.sort((a, b) => b.amount - a.amount);
        const topHoldings = allItems.slice(0, 8).map(item => {
            const meta = sectorMeta[item.sector] || { label: '자산', icon: '🏷️' };
            return {
                name: item.name,
                sector: item.sector,
                sectorLabel: meta.label,
                sectorIcon: meta.icon,
                amount: item.amount,
                ratio: grossTotal > 0 ? Math.round((item.amount / grossTotal) * 100) : 0,
                rate: item.rate
            };
        });

        // 다차원 재무 지표 계산
        const totalGross = currentCalculation.currentGross || grossTotal;
        const totalDebt = Math.max(0, totalGross - netWorth);
        const debtRatio = totalGross > 0 ? Math.round((totalDebt / totalGross) * 100) : 0;
        const expectedReturn = eligibleAssetTotal > 0 ? parseFloat((totalWeightedReturn / eligibleAssetTotal).toFixed(1)) : 0;

        // 월 소득 및 지출 분석
        const monthlySalary = Number(currentAppData.monthlySalary || 0);
        const monthlyExpense = Number(currentCalculation.totalMonthlyExpense || (currentAppData.monthlyExpenses || []).reduce((acc, e) => acc + Number(e.amount || 0), 0));
        const monthlySavings = Math.max(0, monthlySalary - monthlyExpense);
        const savingsRate = monthlySalary > 0 ? Math.round((monthlySavings / monthlySalary) * 100) : null;

        // 1) 비상금 런웨이 (현금성 자산으로 몇 개월 버틸 수 있는지)
        let runwayMonths = currentCalculation.fireMetrics?.runwayMonths;
        if (runwayMonths === undefined || runwayMonths === null) {
            const liquidCash = (assets.deposit || []).reduce((acc, a) => acc + Number(a.amount || 0), 0) + 
                               (assets.savings || []).reduce((acc, a) => acc + Number(a.amount || 0), 0);
            runwayMonths = monthlyExpense > 0 ? Math.round(liquidCash / monthlyExpense) : 0;
        }

        // 2) FIRE 달성률 (연 지출 x 25 = 4% Rule 기준 은퇴 자본 대비)
        let fireTargetCapital = currentCalculation.fireMetrics?.swr4PercentCapital || 0;
        if (!fireTargetCapital && monthlyExpense > 0) {
            fireTargetCapital = (monthlyExpense * 12) * 25;
        }
        const fireRate = fireTargetCapital > 0 && netWorth > 0 
            ? Math.min(999, Math.round((netWorth / fireTargetCapital) * 100)) 
            : null;

        // 3) 월 순 현금흐름 (월 실수령 수입 - 월 고정지출 총액)
        const monthlyCashFlow = monthlySalary > 0 ? (monthlySalary - monthlyExpense) : null;

        const now = new Date();
        const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

        const isAmountMode = snapshotPrefs.flexDisplayMode === 'amount';

        // 🛡️ 보안 핵심: 발행(DB 업로드) 시 비공개/제외 처리된 모든 데이터를 원천 파기 (Zero-Data Sanitization)
        // 독자가 F12 개발자 도구나 네트워크 응답 패킷을 확인하더라도 비활성화된 데이터가 0바이트(null)로 존재하지 않음

        // 1. 포트폴리오 섹터 배분 정제
        let sanitizedShares = [];
        if (snapshotPrefs.show_portfolio_shares) {
            sanitizedShares = portfolioShares.map(s => ({
                sector: s.sector,
                label: s.label,
                icon: s.icon,
                color: s.color,
                ratio: s.ratio,
                // 비율 모드이거나 비공개 시 실제 원화 금액 원천 파기
                amount: (!isForPublishing || isAmountMode) ? s.amount : null
            }));
        }

        // 2. 핵심 보유 종목 정제 (제외된 종목 및 비활성화 시 완전 삭제)
        let finalHoldings = [];
        if (snapshotPrefs.show_top_holdings) {
            const candidateList = isForPublishing 
                ? topHoldings.filter(h => !(snapshotPrefs.excluded_holding_names || []).includes(h.name)).slice(0, 4)
                : topHoldings;

            finalHoldings = candidateList.map(h => ({
                name: h.name,
                sector: h.sector,
                sectorLabel: h.sectorLabel,
                sectorIcon: h.sectorIcon,
                ratio: h.ratio,
                rate: h.rate,
                // 비율 모드이거나 비공개 시 실제 원화 금액 원천 파기
                amount: (!isForPublishing || isAmountMode) ? h.amount : null
            }));
        }

        // 3. 월간 자금 흐름 리포트 (수입 100% 대비 소비 지출 / 투자저축 / 대출상환 / 잉여금)
        let savingsContribTotal = 0;
        const savingsContribItems = [];
        let loanContribTotal = 0;
        const loanContribItems = [];

        Object.keys(assets).forEach(sec => {
            (assets[sec] || []).forEach(a => {
                const contrib = Number(a.monthlyContrib || 0);
                if (contrib > 0) {
                    if (sec === 'loan') {
                        loanContribTotal += contrib;
                        loanContribItems.push({ name: a.name, amount: contrib, sector: sec });
                    } else {
                        savingsContribTotal += contrib;
                        savingsContribItems.push({ name: a.name, amount: contrib, sector: sec });
                    }
                }
            });
        });

        const expenseList = (currentAppData.monthlyExpenses || [])
            .filter(e => Number(e.amount || 0) > 0)
            .map(e => ({ name: e.name, amount: Number(e.amount || 0) }));
        const livingExpenseTotal = Number(currentCalculation.totalMonthlyExpense || expenseList.reduce((acc, e) => acc + e.amount, 0));

        // 잉여 현금 (월 수입 - 소비지출 - 저축/투자 - 대출상환)
        const surplusAmount = Math.max(0, monthlySalary - livingExpenseTotal - savingsContribTotal - loanContribTotal);

        const baseInflow = monthlySalary > 0 
            ? monthlySalary 
            : (livingExpenseTotal + savingsContribTotal + loanContribTotal);

        const rawCashFlowCategories = [
            {
                key: 'expense',
                label: '소비 지출',
                subLabel: '생활비 · 고정소비',
                icon: '🔻',
                color: '#ef4444',
                amount: livingExpenseTotal,
                ratio: baseInflow > 0 ? Math.round((livingExpenseTotal / baseInflow) * 100) : 0,
                items: expenseList.slice(0, 3)
            },
            {
                key: 'savings',
                label: '투자 / 저축',
                subLabel: '주식 · 적금 납입',
                icon: '📈',
                color: '#10b981',
                amount: savingsContribTotal,
                ratio: baseInflow > 0 ? Math.round((savingsContribTotal / baseInflow) * 100) : 0,
                items: savingsContribItems.slice(0, 3)
            },
            {
                key: 'loan',
                label: '대출 상환',
                subLabel: '원리금 상환액',
                icon: '💳',
                color: '#f97316',
                amount: loanContribTotal,
                ratio: baseInflow > 0 ? Math.round((loanContribTotal / baseInflow) * 100) : 0,
                items: loanContribItems.slice(0, 3)
            },
            {
                key: 'surplus',
                label: '잉여 자금',
                subLabel: '월 순 잉여 현금',
                icon: '💰',
                color: '#6366f1',
                amount: surplusAmount,
                ratio: baseInflow > 0 ? Math.max(0, 100 - (
                    (baseInflow > 0 ? Math.round((livingExpenseTotal / baseInflow) * 100) : 0) +
                    (baseInflow > 0 ? Math.round((savingsContribTotal / baseInflow) * 100) : 0) +
                    (baseInflow > 0 ? Math.round((loanContribTotal / baseInflow) * 100) : 0)
                )) : 0,
                items: []
            }
        ];

        let sanitizedCashFlow = null;
        if (snapshotPrefs.show_cash_flow_statement && baseInflow > 0) {
            const excludedKeys = snapshotPrefs.excluded_cash_flow_keys || [];
            
            // 발행 시에는 제외된 카테고리를 아예 필터링하여 서버로 전송하지 않음 (Zero-Knowledge)
            const activeCategories = isForPublishing 
                ? rawCashFlowCategories.filter(c => !excludedKeys.includes(c.key))
                : rawCashFlowCategories;

            sanitizedCashFlow = {
                monthly_salary: (!isForPublishing || isAmountMode) ? monthlySalary : null,
                base_inflow: (!isForPublishing || isAmountMode) ? baseInflow : null,
                categories: activeCategories.map(c => ({
                    key: c.key,
                    label: c.label,
                    subLabel: c.subLabel,
                    icon: c.icon,
                    color: c.color,
                    ratio: c.ratio,
                    amount: (!isForPublishing || isAmountMode) ? c.amount : null,
                    items: c.items.map(item => ({
                        name: item.name,
                        amount: (!isForPublishing || isAmountMode) ? item.amount : null,
                        ratio: baseInflow > 0 ? Math.round((item.amount / baseInflow) * 100) : 0
                    }))
                }))
            };
        }

        return {
            snapshot_date: dateStr,
            tier_label: snapshotPrefs.hideTierBadge ? null : tierLabel,
            tier_badge: snapshotPrefs.hideTierBadge ? null : tierBadge,
            hide_tier_badge: snapshotPrefs.hideTierBadge,
            display_mode: snapshotPrefs.flexDisplayMode,

            // 순자산 카드 비공개 또는 비율 모드 시 원화 금액 원천 파기
            total_net_worth: (snapshotPrefs.show_net_worth && isAmountMode) ? netWorth : null,
            total_gross_worth: (snapshotPrefs.show_net_worth && isAmountMode) ? totalGross : null,
            total_debt: (snapshotPrefs.show_net_worth && isAmountMode) ? totalDebt : null,

            // 개별 재무 지표 비공개 시 수치 완전 파기 (DB에 null로 저장)
            debt_ratio: snapshotPrefs.show_debt_ratio ? debtRatio : null,
            expected_return: snapshotPrefs.show_expected_return ? expectedReturn : null,
            savings_rate: (snapshotPrefs.show_runway && !runwayMonths) ? savingsRate : null,
            runway_months: snapshotPrefs.show_runway ? runwayMonths : null,
            fire_rate: snapshotPrefs.show_fire_rate ? fireRate : null,
            monthly_cash_flow: snapshotPrefs.show_cash_flow ? monthlyCashFlow : null,
            monthly_savings: (snapshotPrefs.show_cash_flow && isAmountMode) ? monthlySavings : null,

            // 섹션 데이터
            portfolio_shares: sanitizedShares,
            top_holdings: finalHoldings,
            cash_flow_statement: sanitizedCashFlow,

            // 컴포넌트 공개/비공개 플래그
            show_net_worth: snapshotPrefs.show_net_worth,
            show_debt_ratio: snapshotPrefs.show_debt_ratio,
            show_expected_return: snapshotPrefs.show_expected_return,
            show_runway: snapshotPrefs.show_runway,
            show_fire_rate: snapshotPrefs.show_fire_rate,
            show_cash_flow: snapshotPrefs.show_cash_flow,
            show_cash_flow_statement: snapshotPrefs.show_cash_flow_statement,
            show_portfolio_shares: snapshotPrefs.show_portfolio_shares,
            show_top_holdings: snapshotPrefs.show_top_holdings,

            // 발행 시에는 제외 목록조차 서버에 보내지 않음 (이름/키 노출 차단)
            excluded_holding_names: isForPublishing ? [] : (snapshotPrefs.excluded_holding_names || []),
            excluded_cash_flow_keys: isForPublishing ? [] : (snapshotPrefs.excluded_cash_flow_keys || [])
        };
    };

    const previewSnapshot = attachAssetSnapshot ? generateSnapshotFromUserData(false) : null;

    // 태그 입력 핸들러
    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
            e.preventDefault();
            const trimmed = tagInput.trim().replace(/^#/, '');
            if (trimmed && !tags.includes(trimmed) && tags.length < 3) {
                setTags([...tags, trimmed]);
                setTagInput('');
            }
        }
    };

    const removeTag = (index) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    // 서식 툴바 마크다운 삽입 헬퍼
    const insertFormat = (prefix, suffix = prefix) => {
        const textarea = document.getElementById('post-content-textarea');
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = content.substring(start, end);
        const replacement = prefix + (selected || '텍스트') + suffix;
        const nextContent = content.substring(0, start) + replacement + content.substring(end);
        setContent(nextContent);
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected ? selected.length : 3));
        }, 10);
    };

    // 이미지 첨부 선택 및 WebP 압축 업로드 핸들러
    const handleImageSelect = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        if (images.length + files.length > 3) {
            alert('사진은 최대 3장까지만 첨부할 수 있습니다.');
            return;
        }

        setIsUploadingImage(true);
        try {
            let userId = currentUser?.id;
            if (supabase) {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) userId = session.user.id;
            }
            if (!userId) userId = 'guest';

            for (const file of files) {
                try {
                    const uploaded = await uploadCommunityImage(supabase, file, userId);
                    setImages(prev => [...prev, uploaded]);
                } catch (imgErr) {
                    console.warn('Supabase image upload failed, falling back to local preview:', imgErr);
                    const fallbackUploaded = await uploadCommunityImage(null, file, userId);
                    setImages(prev => [...prev, fallbackUploaded]);
                }
            }
        } catch (err) {
            console.error('Image upload failed:', err);
            alert(err.message || '사진 업로드에 실패했습니다.');
        } finally {
            setIsUploadingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // 첨부 이미지 삭제
    const handleRemoveImage = (indexToRemove) => {
        setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            alert('제목을 입력해주세요.');
            return;
        }
        if (!content.trim()) {
            alert('내용을 입력해주세요.');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                category,
                title: title.trim(),
                content: content.trim(),
                tags,
                images: images.map(img => img.url),
                is_notice: isAdmin ? isNotice : false,
                is_anonymous: isAnonymous,
                asset_snapshot: attachAssetSnapshot ? generateSnapshotFromUserData(true) : null
            });
            onClose();
        } catch (err) {
            alert(err.message || '게시글 등록에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 dark:border-slate-800 my-auto flex flex-col max-h-[92vh]">
                
                {/* 헤더 */}
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                        글쓰기
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg p-1"
                    >
                        ✕
                    </button>
                </div>

                {/* 바디 폼 (스크롤 영역) */}
                <div className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
                    {/* 1. 주제 선택 */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                            주제 선택
                        </label>
                        <div className="flex gap-2">
                            {[
                                { id: 'free', label: '자유주제' },
                                { id: 'finance', label: '재테크' }
                            ].map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setCategory(cat.id)}
                                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-black transition-all ${
                                        category === cat.id
                                            ? 'bg-teal-700 text-white shadow-sm ring-2 ring-teal-500/20'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 2. 제목 입력 */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400">제목</label>
                            <span className="text-[10px] text-slate-400 font-mono">{title.length}/100</span>
                        </div>
                        <input 
                            type="text"
                            maxLength={100}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="제목을 입력하세요"
                            className="w-full px-4 py-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm sm:text-base font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition-all"
                        />
                    </div>

                    {/* 3. 본문 에디터 (서식 툴바 + 텍스트에어리어) */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400">내용</label>
                            <span className="text-[10px] text-slate-400 font-mono">{content.length}/5,000</span>
                        </div>
                        <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-teal-600/30 focus-within:border-teal-600 transition-all">
                            {/* 서식 툴바 (B, I, U, S, T, H, quote, link, code) */}
                            <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs">
                                <button type="button" onClick={() => insertFormat('**')} className="w-7 h-7 rounded hover:bg-slate-200 dark:hover:bg-slate-700 font-black" title="굵게">B</button>
                                <button type="button" onClick={() => insertFormat('*')} className="w-7 h-7 rounded hover:bg-slate-200 dark:hover:bg-slate-700 italic font-serif" title="기울임">I</button>
                                <button type="button" onClick={() => insertFormat('<u>', '</u>')} className="w-7 h-7 rounded hover:bg-slate-200 dark:hover:bg-slate-700 underline" title="밑줄">U</button>
                                <button type="button" onClick={() => insertFormat('~~')} className="w-7 h-7 rounded hover:bg-slate-200 dark:hover:bg-slate-700 line-through" title="취소선">S</button>
                                <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></span>
                                <button type="button" onClick={() => insertFormat('### ')} className="px-1.5 h-7 rounded hover:bg-slate-200 dark:hover:bg-slate-700 font-bold" title="제목 (소제목)">H</button>
                                <button type="button" onClick={() => insertFormat('> ')} className="w-7 h-7 rounded hover:bg-slate-200 dark:hover:bg-slate-700 font-serif" title="인용문">“</button>
                                <button type="button" onClick={() => insertFormat('[링크텍스트](', ')')} className="w-7 h-7 rounded hover:bg-slate-200 dark:hover:bg-slate-700" title="링크">🔗</button>
                                <button type="button" onClick={() => insertFormat('`')} className="px-1.5 h-7 rounded hover:bg-slate-200 dark:hover:bg-slate-700 font-mono" title="코드">&lt;/&gt;</button>
                            </div>

                            <textarea
                                id="post-content-textarea"
                                rows={8}
                                maxLength={5000}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="내용을 입력하세요"
                                className="w-full p-4 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed"
                            />
                        </div>
                    </div>

                    {/* 4. 태그 입력 */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                태그 <span className="font-normal text-[11px] text-slate-400">· 최대 3개 · Enter 또는 스페이스로 추가</span>
                            </label>
                            <span className="text-[10px] text-slate-400 font-mono">{tags.length}/3</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl min-h-[46px]">
                            {tags.map((tag, idx) => (
                                <span key={idx} className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs px-2.5 py-1 rounded-xl flex items-center gap-1 font-bold">
                                    #{tag}
                                    <button type="button" onClick={() => removeTag(idx)} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
                                </span>
                            ))}
                            {tags.length < 3 && (
                                <input 
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                    placeholder={tags.length === 0 ? "예: SCHD, 069500" : "태그 입력"}
                                    className="flex-1 min-w-[120px] bg-transparent border-none text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none px-1"
                                />
                            )}
                        </div>
                    </div>

                    {/* 4-1. 📷 첨부된 이미지 미리보기 목록 */}
                    {(images.length > 0 || isUploadingImage) && (
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-700/60">
                            <div className="flex items-center justify-between mb-2.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <span>📷</span> 첨부된 사진 <span className="font-mono text-indigo-600 dark:text-indigo-400">({images.length}/3)</span>
                                </label>
                                <span className="text-[10px] text-slate-400">WebP 초경량 자동 압축 완료</span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {images.map((img, idx) => (
                                    <div key={idx} className="relative group w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xs bg-slate-100 dark:bg-slate-800">
                                        <img src={img.url} alt="첨부 이미지" className="w-full h-full object-cover" />
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveImage(idx)}
                                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/75 hover:bg-black text-white text-xs flex items-center justify-center transition-all shadow-md"
                                            title="사진 삭제"
                                        >
                                            ✕
                                        </button>
                                        <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-xs text-white text-[9px] font-mono px-1 py-0.5 truncate text-center">
                                            {img.size ? `${Math.round(img.size / 1024)}KB` : 'WebP'}
                                        </div>
                                    </div>
                                ))}
                                {isUploadingImage && (
                                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-dashed border-indigo-400 dark:border-indigo-600 flex flex-col items-center justify-center gap-1 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 animate-pulse">
                                        <span className="text-xl">⏳</span>
                                        <span className="text-[10px] font-bold">압축 중...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 5. 📊 내 자산 포트폴리오 스냅샷 첨부 섹션 */}
                    <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input 
                                    type="checkbox"
                                    checked={attachAssetSnapshot}
                                    onChange={(e) => setAttachAssetSnapshot(e.target.checked)}
                                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-xs sm:text-sm font-black text-indigo-900 dark:text-indigo-200 flex items-center gap-1">
                                    <span>📊</span> 내 자산 포트폴리오 스냅샷 첨부
                                </span>
                            </label>
                            {attachAssetSnapshot && (
                                <div className="flex bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold">
                                    <button 
                                        type="button" 
                                        onClick={() => updateSnapshotPrefs({ flexDisplayMode: 'amount' })} 
                                        className={`px-2.5 py-1 rounded transition-all cursor-pointer ${snapshotPrefs.flexDisplayMode === 'amount' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500'}`}
                                    >
                                        금액 공개
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => updateSnapshotPrefs({ flexDisplayMode: 'ratio' })} 
                                        className={`px-2.5 py-1 rounded transition-all cursor-pointer ${snapshotPrefs.flexDisplayMode === 'ratio' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500'}`}
                                    >
                                        금액 비공개 (비중만)
                                    </button>
                                </div>
                            )}
                        </div>

                        {attachAssetSnapshot && (
                            <div className="space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                                    <p className="font-medium">
                                        💡 게시글에 첨부될 실제 스냅샷입니다. 원치 않는 카드나 종목을 클릭하여 바로 비공개 처리할 수 있습니다.
                                    </p>
                                    <label className="flex items-center gap-1.5 cursor-pointer select-none font-bold text-slate-700 dark:text-slate-300">
                                        <input 
                                            type="checkbox"
                                            checked={snapshotPrefs.hideTierBadge}
                                            onChange={(e) => updateSnapshotPrefs({ hideTierBadge: e.target.checked })}
                                            className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span>자산 등급 뱃지 가리기</span>
                                    </label>
                                </div>
                                {previewSnapshot && (
                                    <AssetFlexCard 
                                        snapshot={previewSnapshot} 
                                        compact={false} 
                                        hideTier={snapshotPrefs.hideTierBadge} 
                                        interactive={true}
                                        onToggleMetric={(key) => updateSnapshotPrefs(prev => ({ ...prev, [key]: !prev[key] }))}
                                        onToggleHolding={(name) => updateSnapshotPrefs(prev => {
                                            const list = prev.excluded_holding_names || [];
                                            return {
                                                ...prev,
                                                excluded_holding_names: list.includes(name) 
                                                    ? list.filter(n => n !== name) 
                                                    : [...list, name]
                                            };
                                        })}
                                        onToggleSection={(key) => updateSnapshotPrefs(prev => ({ ...prev, [key]: !prev[key] }))}
                                        onToggleCashFlowCategory={(key) => updateSnapshotPrefs(prev => {
                                            const list = prev.excluded_cash_flow_keys || [];
                                            return {
                                                ...prev,
                                                excluded_cash_flow_keys: list.includes(key)
                                                    ? list.filter(k => k !== key)
                                                    : [...list, key]
                                            };
                                        })}
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    {/* 6. 옵션 (익명 작성, 관리자 공지) */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                                <input 
                                    type="checkbox"
                                    checked={isAnonymous}
                                    onChange={(e) => setIsAnonymous(e.target.checked)}
                                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                                />
                                <span>익명으로 작성 (닉네임 비공개)</span>
                            </label>

                            {isAdmin && (
                                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-black text-amber-600 dark:text-amber-400">
                                    <input 
                                        type="checkbox"
                                        checked={isNotice}
                                        onChange={(e) => setIsNotice(e.target.checked)}
                                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                                    />
                                    <span>📌 전체 공지사항으로 등록</span>
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                {/* 풋터 버튼 (시안 2 하단 매핑) */}
                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex items-center justify-between">
                    {/* 이미지 첨부용 숨김 input */}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        accept="image/*" 
                        multiple 
                        onChange={handleImageSelect} 
                        className="hidden" 
                    />

                    {/* 확장성 준비용 버튼 (사진/투표) */}
                    <div className="flex items-center gap-2">
                        <button 
                            type="button" 
                            disabled={images.length >= 3 || isUploadingImage}
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
                        >
                            <span>📷</span> 사진 추가 ({images.length}/3)
                        </button>
                        <button 
                            type="button" 
                            disabled 
                            title="투표 기능은 추후 지원 예정입니다."
                            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 text-xs font-medium flex items-center gap-1.5 opacity-50 cursor-not-allowed"
                        >
                            <span>🗳️</span> 투표 추가
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-bold transition-all"
                        >
                            취소
                        </button>
                        <button 
                            type="button"
                            disabled={isSubmitting}
                            onClick={handleSubmit}
                            className="px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs sm:text-sm font-black shadow-sm transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? '등록 중...' : '등록'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
