// AssetFlexCard.jsx - 다차원 포트폴리오 및 재무 상태 요약 카드
import React from 'react';
import { TIER_HOVER_TOOLTIP, ASSET_TIER_TABLE } from './badgeConstants';

// 섹터 메타 매핑 (한글명, 고유 테마 컬러, 아이콘)
const SECTOR_META_MAP = {
    investment: { label: '주식/투자', color: '#F97316', icon: '📈' },
    savings: { label: '예적금/저축', color: '#10B981', icon: '💰' },
    deposit: { label: '입출금통장', color: '#3B82F6', icon: '🏦' },
    pension: { label: '연금/퇴직', color: '#A855F7', icon: '🏛️' },
    realestate: { label: '부동산', color: '#F59E0B', icon: '🏠' },
    car: { label: '자동차', color: '#06B6D4', icon: '🚗' },
    loan: { label: '대출/부채', color: '#EF4444', icon: '💳' },
    misc: { label: '기타자산', color: '#6366F1', icon: '📦' }
};

// 기존 데이터 영문 키 및 미지정 키를 정규화하여 한글 라벨과 고유 색상 보장
const normalizeSector = (sec) => {
    const rawKey = (sec.sector || sec.label || '').toLowerCase().trim();
    if (SECTOR_META_MAP[rawKey]) {
        return { ...sec, ...SECTOR_META_MAP[rawKey] };
    }
    if (rawKey.includes('invest') || rawKey.includes('주식') || rawKey.includes('stock')) {
        return { ...sec, ...SECTOR_META_MAP.investment };
    }
    if (rawKey.includes('sav') || rawKey.includes('저축') || rawKey.includes('예적금')) {
        return { ...sec, ...SECTOR_META_MAP.savings };
    }
    if (rawKey.includes('dep') || rawKey.includes('입출') || rawKey.includes('현금')) {
        return { ...sec, ...SECTOR_META_MAP.deposit };
    }
    if (rawKey.includes('pen') || rawKey.includes('연금') || rawKey.includes('퇴직')) {
        return { ...sec, ...SECTOR_META_MAP.pension };
    }
    if (rawKey.includes('real') || rawKey.includes('부동산')) {
        return { ...sec, ...SECTOR_META_MAP.realestate };
    }
    if (rawKey.includes('car') || rawKey.includes('자동차')) {
        return { ...sec, ...SECTOR_META_MAP.car };
    }
    if (rawKey.includes('misc') || rawKey.includes('기타')) {
        return { ...sec, ...SECTOR_META_MAP.misc };
    }
    return {
        ...sec,
        label: sec.label || '기타자산',
        color: sec.color || '#6366F1',
        icon: sec.icon || '📦'
    };
};

// 만원 단위 한국어 억/만 포맷터
const formatKoreanAmount = (manWon) => {
    if (!manWon && manWon !== 0) return '-';
    const num = Number(manWon);
    if (num >= 10000) {
        const eok = Math.floor(num / 10000);
        const remainder = Math.floor(num % 10000);
        return remainder > 0 ? `${eok}억 ${remainder.toLocaleString()}만원` : `${eok}억원`;
    }
    return `${num.toLocaleString()}만원`;
};

export default function AssetFlexCard({ 
    snapshot, 
    compact = false, 
    authorProfile = null, 
    hideTier = false,
    interactive = false,
    onToggleMetric = null,
    onToggleHolding = null,
    onToggleSection = null,
    onToggleCashFlowCategory = null
}) {
    if (!snapshot) return null;

    const {
        snapshot_date = '',
        tier_label = '자산가',
        tier_badge = '💎',
        display_mode = 'amount',
        total_net_worth = null,
        total_gross_worth = null,
        total_debt = null,
        debt_ratio = 0,
        expected_return = null,
        savings_rate = null,
        runway_months = null,
        fire_rate = null,
        monthly_cash_flow = null,
        portfolio_shares = [],
        top_holdings = [],
        cash_flow_statement = null,
        capital_yield = null,
        
        // Visibility flags (defaults to true)
        show_net_worth = true,
        show_debt_ratio = true,
        show_expected_return = true,
        show_runway = true,
        show_fire_rate = true,
        show_cash_flow = true,
        show_cash_flow_statement = true,
        show_portfolio_shares = true,
        show_top_holdings = true,
        excluded_holding_names = [],
        excluded_cash_flow_keys = []
    } = snapshot;

    // 커스텀 페르소나 뱃지 여부 (욜로, 야수의 심장, 파이어족 등은 금액 구간과 무관한 정체성 뱃지)
    const customBadgeKey = authorProfile?.selected_badge;
    const isCustomPersonaBadge = customBadgeKey && customBadgeKey !== 'tier' && customBadgeKey !== 'none';

    // 티어 뱃지 및 숨김/커스텀 뱃지 계산
    // 🛡️ 금액 비공개(ratio) 모드인 경우 자산 구간(실버, 골드 등)은 금액 유출을 막기 위해 무조건 자동 숨김
    const shouldHideTier = hideTier || 
        snapshot.hide_tier_badge || 
        authorProfile?.hide_tier_badge || 
        authorProfile?.selected_badge === 'none' ||
        (display_mode === 'ratio' && !isCustomPersonaBadge);

    // 금액 비공개(ratio) 모드인 경우 괄호 안의 금액'(1억 이상)' 등을 자동 제거하여 금액 유출 방지
    let displayTierLabel = tier_label || '';
    if (display_mode === 'ratio') {
        displayTierLabel = displayTierLabel.replace(/\s*\(.*?\)/g, '');
    }

    let activeBadgeIcon = tier_badge || '💎';
    let activeBadgeLabel = displayTierLabel;
    let activeBadgeTooltip = '';

    if (customBadgeKey && customBadgeKey !== 'tier') {
        if (customBadgeKey === 'yolo') {
            activeBadgeIcon = '🎉';
            activeBadgeLabel = '욜로';
            activeBadgeTooltip = '🎉 욜로: 현재의 라이프스타일과 행복 중시';
        } else if (customBadgeKey === 'beast') {
            activeBadgeIcon = '🦁';
            activeBadgeLabel = '야수의 심장';
            activeBadgeTooltip = '🦁 야수의 심장: 고수익 고위험! 과감하고 공격적인 투자';
        } else if (customBadgeKey === 'fire') {
            activeBadgeIcon = '🏃‍♂️';
            activeBadgeLabel = '파이어족';
            activeBadgeTooltip = '🏃‍♂️ 파이어족: 경제적 자유 및 조기은퇴 준비 집중';
        } else if (customBadgeKey === 'dividend') {
            activeBadgeIcon = '💸';
            activeBadgeLabel = '배당 러버';
            activeBadgeTooltip = '💸 배당 러버: 현금흐름 및 안정적인 배당주 투자 선호';
        } else if (customBadgeKey === 'investor') {
            activeBadgeIcon = '📈';
            activeBadgeLabel = '가치 투자자';
            activeBadgeTooltip = '📈 가치 투자자: 장기적 기업 가치와 스노우볼 복리 추구';
        } else if (customBadgeKey === 'beginner') {
            activeBadgeIcon = '🌱';
            activeBadgeLabel = '초보 투자자';
            activeBadgeTooltip = '🌱 초보 투자자: 성실히 자산을 불려가는 단계';
        }
    } else {
        const cleanLabel = (displayTierLabel || '').replace(/\s*\(.*?\)/g, '');
        const matched = ASSET_TIER_TABLE.find(t => t.label === cleanLabel);
        activeBadgeTooltip = `${displayTierLabel} (${matched?.criteria || '자산 티어'})\n\n${TIER_HOVER_TOOLTIP}`;
    }

    // 모든 섹터 항목을 정규화하여 고유 색상 및 한글화 보장
    const normalizedShares = (portfolio_shares || []).map(normalizeSector);

    // 기대 수익률 폴백
    const finalExpectedReturn = expected_return !== null && expected_return !== undefined 
        ? expected_return 
        : (capital_yield !== null ? capital_yield : null);

    // =========================================================================
    // 1. 피드 목록용 미니멀 컴팩트 카드 (리스트에 깔끔하게 삽입)
    // =========================================================================
    if (compact) {
        return (
            <div className="my-2.5 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-indigo-50/30 to-blue-50/20 dark:from-slate-800/90 dark:via-indigo-950/20 dark:to-slate-850 border border-indigo-100/80 dark:border-indigo-900/40 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    {!shouldHideTier && (
                        <span 
                            className="text-2xl p-2 bg-white dark:bg-slate-700 rounded-xl shadow-xs border border-indigo-100 dark:border-indigo-800 flex-shrink-0 cursor-help"
                            title={activeBadgeTooltip}
                        >
                            {activeBadgeIcon}
                        </span>
                    )}
                    <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-indigo-600 text-white flex items-center gap-0.5 shadow-xs">
                                <span>📊</span> 자산 요약
                            </span>
                            {!shouldHideTier && activeBadgeLabel && (
                                <span 
                                    className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-help"
                                    title={activeBadgeTooltip}
                                >
                                    {activeBadgeLabel}
                                </span>
                            )}
                            {show_debt_ratio && debt_ratio === 0 && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                    무부채 클린
                                </span>
                            )}
                            {show_expected_return && finalExpectedReturn !== null && (
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                                    기대 연 {finalExpectedReturn}%
                                </span>
                            )}
                            {show_fire_rate && fire_rate !== null && fire_rate !== undefined && (
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                    🔥 FIRE {fire_rate}%
                                </span>
                            )}
                            {show_cash_flow && (
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                    💸 {display_mode === 'amount' && monthly_cash_flow !== null 
                                        ? `월 ${monthly_cash_flow >= 0 ? '+' : ''}${monthly_cash_flow.toLocaleString()}만` 
                                        : (monthly_cash_flow !== null ? (monthly_cash_flow >= 0 ? '흑자 잉여' : '적자 주의') : '현금흐름')}
                                </span>
                            )}
                        </div>
                        {show_net_worth && display_mode === 'amount' && total_net_worth !== null ? (
                            <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-1 flex items-baseline gap-1.5">
                                <span className="text-indigo-600 dark:text-indigo-400">순자산 {formatKoreanAmount(total_net_worth)}</span>
                                {total_debt > 0 && (
                                    <span className="text-[11px] font-normal text-slate-400">
                                        (부채 {formatKoreanAmount(total_debt)})
                                    </span>
                                )}
                            </div>
                        ) : (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                                {show_net_worth ? '순자산 비공개 · 포트폴리오 비중 공유' : '포트폴리오 비중 공유'}
                            </div>
                        )}
                    </div>
                </div>

                {/* 미니 섹터 비중 분할 세그먼트 바 */}
                {show_portfolio_shares && normalizedShares.length > 0 && (
                    <div className="w-full md:w-56 flex flex-col gap-1.5 flex-shrink-0">
                        <div className="h-2.5 w-full rounded-full bg-slate-200/80 dark:bg-slate-700/80 p-0.5 flex gap-0.5 shadow-inner overflow-hidden">
                            {normalizedShares.map((sec, idx) => (
                                <div 
                                    key={idx} 
                                    style={{ width: `${sec.ratio}%`, backgroundColor: sec.color }} 
                                    className="h-full rounded-xs transition-all hover:opacity-90"
                                    title={`${sec.icon} ${sec.label}: ${sec.ratio}%`}
                                />
                            ))}
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate gap-1">
                            {normalizedShares.slice(0, 3).map((sec, idx) => (
                                <span key={idx} className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sec.color }}></span>
                                    {sec.label} {sec.ratio}%
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // 잉여 현금흐름 비율 추출 (비율 모드 시 메트릭 카드에 통일된 % 표시용)
    const surplusCat = cash_flow_statement?.categories?.find(c => c.key === 'surplus');
    const surplusRatio = surplusCat && typeof surplusCat.ratio === 'number' ? surplusCat.ratio : null;

    // =========================================================================
    // 2. 6대 메트릭 카드 정의 (순자산, 부채비율, 기대수익률, 비상금, FIRE, 월현금흐름)
    // =========================================================================
    const allMetricCards = [
        {
            key: 'show_net_worth',
            title: '등록 순자산',
            icon: '💰',
            visible: show_net_worth,
            content: display_mode === 'amount' && total_net_worth !== null ? (
                <div>
                    <div className="h-8 flex items-baseline gap-1">
                        <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                            {formatKoreanAmount(total_net_worth)}
                        </span>
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 truncate">
                        {total_debt > 0 ? `총자산 ${formatKoreanAmount(total_gross_worth)}` : '무부채 순수 자산'}
                    </div>
                </div>
            ) : (
                <div>
                    <div className="h-8 flex items-baseline gap-1">
                        <span className="text-lg sm:text-xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight whitespace-nowrap">
                            금액 비공개
                        </span>
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 truncate">
                        포트폴리오 비중 중심 공유
                    </div>
                </div>
            )
        },
        {
            key: 'show_debt_ratio',
            title: '부채비율 (레버리지)',
            icon: '⚖️',
            visible: show_debt_ratio,
            content: (
                <div>
                    <div className="h-8 flex items-baseline gap-0.5">
                        <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                            {debt_ratio}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-slate-500">%</span>
                    </div>
                    <div className="text-[10px] font-bold mt-1 truncate">
                        {debt_ratio === 0 ? (
                            <span className="text-emerald-600 dark:text-emerald-400">무부채 안심 클린 🌿</span>
                        ) : debt_ratio <= 30 ? (
                            <span className="text-teal-600 dark:text-teal-400">건전한 레버리지 ✅</span>
                        ) : debt_ratio <= 60 ? (
                            <span className="text-amber-600 dark:text-amber-400">적정 대출 관리 구간 ⚠️</span>
                        ) : (
                            <span className="text-rose-500 font-bold">고레버리지 운용 구간 🚨</span>
                        )}
                    </div>
                </div>
            )
        },
        {
            key: 'show_expected_return',
            title: '포트폴리오 기대수익률',
            icon: '📈',
            visible: show_expected_return,
            content: (
                <div>
                    <div className="h-8 flex items-baseline gap-0.5">
                        {finalExpectedReturn !== null ? (
                            <>
                                <span className="text-xs sm:text-sm font-bold text-orange-500 mr-0.5">연</span>
                                <span className="text-xl sm:text-2xl font-black text-orange-600 dark:text-orange-400 font-mono">
                                    {finalExpectedReturn}
                                </span>
                                <span className="text-xs sm:text-sm font-bold text-orange-500">%</span>
                            </>
                        ) : (
                            <span className="text-xl sm:text-2xl font-black text-slate-400 font-mono">-</span>
                        )}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 truncate">
                        보유 자산 가중평균
                    </div>
                </div>
            )
        },
        {
            key: 'show_runway',
            title: '비상금 생존력',
            icon: '🛡️',
            visible: show_runway,
            content: (
                <div>
                    <div className="h-8 flex items-baseline gap-0.5">
                        {runway_months > 0 ? (
                            <>
                                <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                                    {runway_months}
                                </span>
                                <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 ml-0.5">개월</span>
                            </>
                        ) : savings_rate !== null ? (
                            <>
                                <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                                    {savings_rate}
                                </span>
                                <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 ml-0.5">% 저축</span>
                            </>
                        ) : (
                            <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                안정적
                            </span>
                        )}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 truncate">
                        {runway_months > 0 ? '무수익 시 생활 버퍼' : '재무 안전 지표'}
                    </div>
                </div>
            )
        },
        {
            key: 'show_fire_rate',
            title: 'FIRE 목표 달성률',
            icon: '🔥',
            visible: show_fire_rate,
            available: fire_rate !== null && fire_rate !== undefined,
            content: (
                <div>
                    <div className="h-8 flex items-baseline gap-0.5">
                        {fire_rate !== null && fire_rate !== undefined ? (
                            <>
                                <span className="text-xl sm:text-2xl font-black text-amber-500 dark:text-amber-400 font-mono">
                                    {fire_rate}
                                </span>
                                <span className="text-xs sm:text-sm font-bold text-amber-500 dark:text-amber-400">%</span>
                            </>
                        ) : (
                            <span className="text-xl sm:text-2xl font-black text-slate-400 font-mono">-</span>
                        )}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 truncate">
                        4%룰 조기은퇴 자본 대비
                    </div>
                </div>
            )
        },
        {
            key: 'show_cash_flow',
            title: '월간 잉여 현금흐름',
            icon: '💸',
            visible: show_cash_flow,
            available: monthly_cash_flow !== null && monthly_cash_flow !== undefined,
            content: (
                <div>
                    <div className="h-8 flex items-baseline gap-0.5">
                        {monthly_cash_flow !== null && monthly_cash_flow !== undefined ? (
                            display_mode === 'amount' ? (
                                <>
                                    <span className={`text-xl sm:text-2xl font-black font-mono ${monthly_cash_flow >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-500'}`}>
                                        {monthly_cash_flow >= 0 ? '+' : ''}{monthly_cash_flow.toLocaleString()}
                                    </span>
                                    <span className="text-xs sm:text-sm font-bold text-indigo-500 ml-0.5">만원</span>
                                </>
                            ) : (
                                surplusRatio !== null ? (
                                    <>
                                        <span className="text-xs sm:text-sm font-bold text-indigo-500 mr-0.5">월</span>
                                        <span className={`text-xl sm:text-2xl font-black font-mono ${surplusRatio >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-500'}`}>
                                            {surplusRatio >= 0 ? '+' : ''}{surplusRatio}
                                        </span>
                                        <span className="text-xs sm:text-sm font-bold text-indigo-500">%</span>
                                    </>
                                ) : (
                                    <span className={`text-lg sm:text-xl font-black whitespace-nowrap ${monthly_cash_flow >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-500'}`}>
                                        {monthly_cash_flow >= 0 ? '흑자 잉여 💰' : '적자 주의 ⚠️'}
                                    </span>
                                )
                            )
                        ) : (
                            <span className="text-xl sm:text-2xl font-black text-slate-400 font-mono">-</span>
                        )}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 truncate">
                        {monthly_cash_flow !== null && monthly_cash_flow >= 0 ? '월 수입 - 지출 잉여' : '월 지출 초과 발생'}
                    </div>
                </div>
            )
        }
    ];

    // 비인터랙티브 모드에서는 visible: true 인 카드만 렌더링
    const visibleCards = interactive ? allMetricCards : allMetricCards.filter(c => c.visible && c.available !== false);

    // 필터링된 핵심 보유 종목
    const displayHoldings = interactive 
        ? top_holdings 
        : (show_top_holdings ? top_holdings.filter(item => !excluded_holding_names.includes(item.name)) : []);

    // 필터링된 월간 자금 흐름 카테고리
    const rawCashFlowCategories = cash_flow_statement?.categories || [];
    const displayCashFlowCategories = interactive 
        ? rawCashFlowCategories 
        : (show_cash_flow_statement ? rawCashFlowCategories.filter(c => !excluded_cash_flow_keys.includes(c.key)) : []);

    // 그리드 칼럼 계산
    const gridColsClass = visibleCards.length <= 2 
        ? 'grid-cols-1 sm:grid-cols-2' 
        : (visibleCards.length === 3 
            ? 'grid-cols-1 sm:grid-cols-3' 
            : (visibleCards.length === 4 
                ? 'grid-cols-2 lg:grid-cols-4' 
                : 'grid-cols-2 md:grid-cols-3'));

    // =========================================================================
    // 3. 상세 모달 및 작성 모달용 풀 렌더링 포트폴리오 요약 리포트 카드
    // =========================================================================
    return (
        <div className={`my-5 p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/40 dark:from-slate-850 dark:via-slate-800 dark:to-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/50 shadow-md ${
            interactive ? 'ring-2 ring-indigo-500/20' : ''
        }`}>
            
            {/* 1. 상단 헤더 */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-indigo-100/80 dark:border-slate-700/60">
                <div className="flex items-center gap-3.5">
                    {!shouldHideTier && (
                        <span 
                            className="text-3xl sm:text-4xl p-2.5 sm:p-3 bg-white dark:bg-slate-700 rounded-2xl shadow-xs border border-indigo-100 dark:border-indigo-800 flex-shrink-0 cursor-help"
                            title={activeBadgeTooltip}
                        >
                            {activeBadgeIcon}
                        </span>
                    )}
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-indigo-600 text-white flex items-center gap-1 shadow-xs">
                                <span>📊</span> 포트폴리오 스냅샷
                            </span>
                            {!shouldHideTier && activeBadgeLabel && (
                                <span 
                                    className="text-sm sm:text-base font-black text-indigo-700 dark:text-indigo-300 cursor-help"
                                    title={activeBadgeTooltip}
                                >
                                    {activeBadgeLabel}
                                </span>
                            )}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-1 flex items-center gap-2">
                            <span>기준일: {snapshot_date || '등록 시점'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-xs">
                        {display_mode === 'amount' ? '전 항목 수치 공개' : '자산 비중 중심 공개'}
                    </span>
                </div>
            </div>

            {/* 💡 인터랙티브 모드 안내 배너 */}
            {interactive && (
                <div className="mt-3.5 mb-2 px-3.5 py-2 rounded-xl bg-indigo-100/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs font-semibold text-indigo-800 dark:text-indigo-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                        <span>💡</span> 각 카드나 종목을 클릭하면 공개/비공개가 전환됩니다. (회색 카드는 게시글에 미포함)
                    </span>
                    <span className="text-[10px] text-indigo-500 font-normal hidden sm:inline">실시간 반영됨</span>
                </div>
            )}

            {/* 2. 핵심 재무 상태 메트릭 카드 그리드 (클릭하여 개별 공개/비공개 토글 가능) */}
            {visibleCards.length > 0 && (
                <div className={`grid ${gridColsClass} gap-2.5 sm:gap-3 my-4`}>
                    {visibleCards.map((card) => {
                        const isCardActive = card.visible;
                        return (
                            <div 
                                key={card.key}
                                onClick={() => interactive && onToggleMetric && onToggleMetric(card.key)}
                                className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between ${
                                    interactive ? 'cursor-pointer select-none group' : ''
                                } ${
                                    isCardActive 
                                        ? 'bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/60 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-600' 
                                        : 'opacity-40 grayscale scale-[0.98] border-dashed border-slate-300 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-850 hover:opacity-60'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <span>{card.icon}</span> {card.title}
                                    </span>
                                    {interactive && (
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md transition-all ${
                                            isCardActive 
                                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60' 
                                                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                                        }`}>
                                            {isCardActive ? '공개 ✓' : '제외 ✕'}
                                        </span>
                                    )}
                                </div>
                                {card.content}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 3. 자산 포트폴리오 배분 (분리형 멀티 세그먼트 바 & 범례) */}
            {(interactive || show_portfolio_shares) && normalizedShares.length > 0 && (
                <div 
                    onClick={(e) => {
                        if (interactive && !show_portfolio_shares) {
                            e.stopPropagation();
                            onToggleSection && onToggleSection('show_portfolio_shares');
                        }
                    }}
                    className={`space-y-3 pt-2 mt-2 transition-all p-3 rounded-2xl ${
                        interactive && !show_portfolio_shares 
                            ? 'opacity-40 grayscale scale-[0.99] border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-850/60 cursor-pointer hover:opacity-75 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/30' 
                            : ''
                    }`}
                >
                    <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200">
                        <span className="flex items-center gap-1.5">
                            <span>📊</span> 자산 포트폴리오 배분 구조
                            {interactive && !show_portfolio_shares && (
                                <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400">
                                    (클릭하여 복원)
                                </span>
                            )}
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400 text-[11px] font-normal">합계 100%</span>
                            {interactive && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleSection && onToggleSection('show_portfolio_shares');
                                    }}
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                                        show_portfolio_shares 
                                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 hover:bg-emerald-100' 
                                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                                    }`}
                                >
                                    {show_portfolio_shares ? '섹션 공개 ✓' : '✕ 제외됨 (클릭 시 복원)'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 분리형 멀티 컬러 막대바 */}
                    <div 
                        onClick={(e) => {
                            if (interactive && onToggleSection) {
                                e.stopPropagation();
                                onToggleSection('show_portfolio_shares');
                            }
                        }}
                        className={`h-4 sm:h-5 w-full rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 flex gap-1 shadow-inner border border-slate-200/80 dark:border-slate-700/60 overflow-hidden ${
                            interactive ? 'cursor-pointer hover:ring-2 hover:ring-indigo-400/40' : ''
                        }`}
                    >
                        {normalizedShares.map((sec, idx) => (
                            <div 
                                key={idx} 
                                style={{ width: `${sec.ratio}%`, backgroundColor: sec.color }} 
                                className="h-full first:rounded-l-lg last:rounded-r-lg rounded-xs transition-all hover:opacity-90 hover:scale-y-105"
                                title={`${sec.icon} ${sec.label}: ${sec.ratio}% (${display_mode === 'amount' && sec.amount ? formatKoreanAmount(sec.amount) : ''})`}
                            />
                        ))}
                    </div>

                    {/* 섹터 상세 그리드 범례 */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 pt-1">
                        {normalizedShares.map((sec, idx) => (
                            <div 
                                key={idx} 
                                onClick={(e) => {
                                    if (interactive && !show_portfolio_shares) {
                                        e.stopPropagation();
                                        onToggleSection && onToggleSection('show_portfolio_shares');
                                    }
                                }}
                                className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-2xs"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-2xs" style={{ backgroundColor: sec.color }}></span>
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate whitespace-nowrap">
                                        {sec.icon} {sec.label}
                                    </span>
                                </div>
                                <div className="text-right flex-shrink-0 ml-2">
                                    <span className="text-xs font-mono font-black text-slate-900 dark:text-white">
                                        {sec.ratio}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 4. 월간 자금 흐름 배분 구조 (수입 100% 대비 소비 지출 / 투자저축 / 대출상환 / 잉여금) */}
            {(interactive || (show_cash_flow_statement && displayCashFlowCategories.length > 0)) && cash_flow_statement && (
                <div 
                    onClick={(e) => {
                        if (interactive && !show_cash_flow_statement) {
                            e.stopPropagation();
                            onToggleSection && onToggleSection('show_cash_flow_statement');
                        }
                    }}
                    className={`space-y-3 pt-3 mt-4 border-t border-indigo-100/80 dark:border-slate-700/60 transition-all p-3 rounded-2xl ${
                        interactive && !show_cash_flow_statement 
                            ? 'opacity-40 grayscale scale-[0.99] border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-850/60 cursor-pointer hover:opacity-75 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/30' 
                            : ''
                    }`}
                >
                    <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200">
                        <span className="flex items-center gap-1.5">
                            <span>💸</span> 월간 자금 흐름 구조 (Cash Flow)
                            {interactive && (
                                !show_cash_flow_statement ? (
                                    <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400">
                                        (클릭하여 복원)
                                    </span>
                                ) : (
                                    <span className="text-[10px] text-indigo-500 font-normal">
                                        (클릭하여 특정 흐름을 제외할 수 있습니다)
                                    </span>
                                )
                            )}
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400 text-[11px] font-normal">
                                {display_mode === 'amount' && cash_flow_statement.monthly_salary 
                                    ? `월 수입 ${formatKoreanAmount(cash_flow_statement.monthly_salary)} 기준` 
                                    : '수입 100% 기준'}
                            </span>
                            {interactive && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleSection && onToggleSection('show_cash_flow_statement');
                                    }}
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                                        show_cash_flow_statement 
                                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 hover:bg-emerald-100' 
                                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                                    }`}
                                >
                                    {show_cash_flow_statement ? '섹션 공개 ✓' : '✕ 제외됨 (클릭 시 복원)'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 멀티 컬러 자금 흐름 막대바 */}
                    <div 
                        onClick={(e) => {
                            if (interactive && onToggleSection) {
                                e.stopPropagation();
                                onToggleSection('show_cash_flow_statement');
                            }
                        }}
                        className={`h-4 sm:h-5 w-full rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 flex gap-1 shadow-inner border border-slate-200/80 dark:border-slate-700/60 overflow-hidden ${
                            interactive ? 'cursor-pointer hover:ring-2 hover:ring-indigo-400/40' : ''
                        }`}
                    >
                        {displayCashFlowCategories.filter(c => !excluded_cash_flow_keys.includes(c.key) && c.ratio > 0).map((cat, idx) => (
                            <div 
                                key={idx} 
                                style={{ width: `${cat.ratio}%`, backgroundColor: cat.color }} 
                                className="h-full first:rounded-l-lg last:rounded-r-lg rounded-xs transition-all hover:opacity-90 hover:scale-y-105"
                                title={`${cat.icon} ${cat.label}: ${cat.ratio}% (${display_mode === 'amount' && cat.amount ? formatKoreanAmount(cat.amount) : ''})`}
                            />
                        ))}
                    </div>

                    {/* 4대 흐름 카테고리 카드 그리드 */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                        {displayCashFlowCategories.map((cat, idx) => {
                            const isExcluded = excluded_cash_flow_keys.includes(cat.key);
                            return (
                                <div 
                                    key={idx}
                                    onClick={(e) => {
                                        if (!interactive) return;
                                        if (!show_cash_flow_statement) {
                                            e.stopPropagation();
                                            onToggleSection && onToggleSection('show_cash_flow_statement');
                                        } else {
                                            onToggleCashFlowCategory && onToggleCashFlowCategory(cat.key);
                                        }
                                    }}
                                    className={`p-3 sm:p-3.5 rounded-2xl border text-xs font-medium transition-all shadow-xs flex flex-col justify-between gap-2 relative ${
                                        interactive ? 'cursor-pointer select-none' : ''
                                    } ${
                                        isExcluded 
                                            ? 'opacity-40 grayscale scale-[0.98] border-dashed border-slate-300 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-850 hover:opacity-60' 
                                            : 'bg-white dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 hover:border-indigo-300'
                                    }`}
                                >
                                    {/* 1행: 카테고리 라벨 + 상태 버튼 */}
                                    <div className="flex items-center justify-between gap-1.5 min-w-0">
                                        <span 
                                            className="text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 whitespace-nowrap shrink-0"
                                            style={{ backgroundColor: `${cat.color}18`, color: cat.color }}
                                        >
                                            <span className="shrink-0">{cat.icon}</span>
                                            <span className="whitespace-nowrap">{cat.label}</span>
                                        </span>

                                        {interactive ? (
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap shrink-0 transition-all ${
                                                isExcluded 
                                                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-500' 
                                                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60'
                                            }`}>
                                                {isExcluded ? '제외 ✕' : '공개 ✓'}
                                            </span>
                                        ) : null}
                                    </div>

                                    {/* 2행: 비중 및 금액 */}
                                    <div className="py-1">
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-lg sm:text-xl font-black font-mono" style={{ color: cat.color }}>
                                                {cat.ratio}%
                                            </span>
                                            {display_mode === 'amount' && cat.amount !== null && (
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                    {formatKoreanAmount(cat.amount)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                                            {cat.subLabel}
                                        </div>
                                    </div>

                                    {/* 3행: 세부 항목 프리뷰 (최대 2개) */}
                                    {cat.items && cat.items.length > 0 && (
                                        <div className="border-t border-slate-100 dark:border-slate-700/40 pt-1.5 space-y-0.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                            {cat.items.slice(0, 2).map((sub, sIdx) => (
                                                <div key={sIdx} className="flex justify-between items-center truncate">
                                                    <span className="truncate max-w-[65%]">{sub.name}</span>
                                                    <span>{display_mode === 'amount' && sub.amount ? `${sub.amount.toLocaleString()}만` : `${sub.ratio}%`}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 5. 주요 핵심 보유 종목 TOP (개별 클릭으로 민감 항목 제외 가능) */}
            {(interactive || (show_top_holdings && displayHoldings.length > 0)) && (
                <div 
                    onClick={(e) => {
                        if (interactive && !show_top_holdings) {
                            e.stopPropagation();
                            onToggleSection && onToggleSection('show_top_holdings');
                        }
                    }}
                    className={`mt-5 pt-4 border-t border-indigo-100/80 dark:border-slate-700/60 transition-all p-3 rounded-2xl ${
                        interactive && !show_top_holdings 
                            ? 'opacity-40 grayscale scale-[0.99] border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-850/60 cursor-pointer hover:opacity-75 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/30' 
                            : ''
                    }`}
                >
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                            <span>🏆</span> 핵심 보유 종목 TOP
                            {interactive && (
                                !show_top_holdings ? (
                                    <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400">
                                        (클릭하여 복원)
                                    </span>
                                ) : (
                                    <span className="text-[10px] text-indigo-500 font-normal">
                                        (특정 종목을 클릭해 숨길 수 있습니다)
                                    </span>
                                )
                            )}
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-normal">총자산 대비 비중 순</span>
                            {interactive && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleSection && onToggleSection('show_top_holdings');
                                    }}
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                                        show_top_holdings 
                                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 hover:bg-emerald-100' 
                                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                                    }`}
                                >
                                    {show_top_holdings ? '섹션 공개 ✓' : '✕ 제외됨 (클릭 시 복원)'}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                        {displayHoldings.map((item, idx) => {
                            const meta = normalizeSector({ sector: item.sector, label: item.sectorLabel });
                            const isExcluded = excluded_holding_names.includes(item.name);
                            return (
                                <div 
                                    key={idx}
                                    onClick={(e) => {
                                        if (!interactive) return;
                                        if (!show_top_holdings) {
                                            e.stopPropagation();
                                            onToggleSection && onToggleSection('show_top_holdings');
                                        } else {
                                            onToggleHolding && onToggleHolding(item.name);
                                        }
                                    }}
                                    className={`p-3 sm:p-3.5 rounded-2xl border text-xs font-medium transition-all shadow-xs flex flex-col justify-between gap-2 relative ${
                                        interactive ? 'cursor-pointer select-none' : ''
                                    } ${
                                        isExcluded 
                                            ? 'opacity-40 grayscale scale-[0.98] border-dashed border-slate-300 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-850 hover:opacity-60' 
                                            : 'bg-white dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 hover:border-indigo-300'
                                    }`}
                                >
                                    {/* 1행: 카테고리 태그 (좌) + [인터랙티브 시 공개/제외 상태 버튼] 또는 [비인터랙티브 시 비중 태그] (우) */}
                                    <div className="flex items-center justify-between gap-1.5 min-w-0">
                                        <span 
                                            className="text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 whitespace-nowrap shrink-0" 
                                            style={{ backgroundColor: `${meta.color}18`, color: meta.color }}
                                        >
                                            <span className="shrink-0">{meta.icon}</span>
                                            <span className="whitespace-nowrap">{meta.label}</span>
                                        </span>

                                        {interactive ? (
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap shrink-0 transition-all ${
                                                isExcluded 
                                                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800' 
                                                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60'
                                            }`}>
                                                {isExcluded ? '제외 ✕' : '공개 ✓'}
                                            </span>
                                        ) : (
                                            item.ratio ? (
                                                <span className="text-xs font-mono font-black text-indigo-600 dark:text-indigo-400 whitespace-nowrap shrink-0">
                                                    {item.ratio}%
                                                </span>
                                            ) : null
                                        )}
                                    </div>

                                    {/* 2행: 보유 종목 이름 */}
                                    <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate py-0.5" title={item.name}>
                                        {item.name}
                                    </div>

                                    {/* 3행: 하단 비중 & 예상 수익률 */}
                                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/40 pt-1.5 min-w-0">
                                        <div className="flex items-center gap-1 shrink-0">
                                            <span className="text-[10px] text-slate-400">비중</span>
                                            <span className="font-black text-indigo-600 dark:text-indigo-400">
                                                {item.ratio !== null && item.ratio !== undefined ? `${item.ratio}%` : '-'}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                            <span className="text-[10px] text-slate-400">수익률</span>
                                            {typeof item.rate === 'number' && item.rate !== 0 ? (
                                                <span className={`font-bold ${item.rate > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                                                    {item.rate > 0 ? '+' : ''}{item.rate}%
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-[10px] font-normal">고정/변동</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

        </div>
    );
}
