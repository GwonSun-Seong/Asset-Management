// AssetFlexCard.jsx - 다차원 실자산 포트폴리오 및 재무 건전성 공식 인증 카드
import React from 'react';

// 섹터 공식 메타 매핑 (한글명, 고유 테마 컬러, 아이콘)
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

export default function AssetFlexCard({ snapshot, compact = false }) {
    if (!snapshot) return null;

    const {
        verified = true,
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
        portfolio_shares = [],
        top_holdings = [],
        capital_yield = null
    } = snapshot;

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
                    <span className="text-2xl p-2 bg-white dark:bg-slate-700 rounded-xl shadow-xs border border-indigo-100 dark:border-indigo-800 flex-shrink-0">
                        {tier_badge || '💎'}
                    </span>
                    <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-indigo-600 text-white flex items-center gap-0.5 shadow-xs">
                                <span>🛡️</span> 실자산 인증
                            </span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                {tier_label}
                            </span>
                            {debt_ratio === 0 && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                    무부채 클린
                                </span>
                            )}
                            {finalExpectedReturn !== null && (
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                                    기대 연 {finalExpectedReturn}%
                                </span>
                            )}
                        </div>
                        {display_mode === 'amount' && total_net_worth !== null ? (
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
                                순자산 비공개 · 자산 등급 및 포트폴리오 비중 인증 완료
                            </div>
                        )}
                    </div>
                </div>

                {/* 미니 섹터 비중 분할 세그먼트 바 */}
                {normalizedShares.length > 0 && (
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

    // =========================================================================
    // 2. 상세 모달용 풀 렌더링 공식 금융 인증 리포트 카드
    // =========================================================================
    return (
        <div className="my-5 p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/40 dark:from-slate-850 dark:via-slate-800 dark:to-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/50 shadow-md">
            
            {/* 1. 상단 공식 인증 헤더 & 보안 스탬프 */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-indigo-100/80 dark:border-slate-700/60">
                <div className="flex items-center gap-3.5">
                    <span className="text-3xl sm:text-4xl p-2.5 sm:p-3 bg-white dark:bg-slate-700 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-800 flex-shrink-0">
                        {tier_badge || '💎'}
                    </span>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-indigo-600 text-white flex items-center gap-1 shadow-xs">
                                <span>🛡️</span> 공식 인증 스냅샷
                            </span>
                            <span className="text-sm sm:text-base font-black text-indigo-700 dark:text-indigo-300">
                                {tier_label}
                            </span>
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-1 flex items-center gap-2">
                            <span>인증 기준일: {snapshot_date || '최신 검증'}</span>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                                <span>✓</span> 계산 엔진 위변조 방지 완료
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-xs">
                        {display_mode === 'amount' ? '🔓 전 항목 투명 공개' : '🔒 자산 비중 중심 공개'}
                    </span>
                </div>
            </div>

            {/* 2. 핵심 재무 건전성 4대 지표 (Financial Vitals 4-Grid) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 my-5">
                {/* 1) 순자산 총액 */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">인증 순자산</span>
                        <span className="text-sm">💰</span>
                    </div>
                    {display_mode === 'amount' && total_net_worth !== null ? (
                        <div>
                            <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                {formatKoreanAmount(total_net_worth)}
                            </div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 truncate">
                                {total_debt > 0 ? `총자산 ${formatKoreanAmount(total_gross_worth)}` : '무부채 순수 자산'}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400">
                                금액 비공개
                            </div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                                {tier_label} 인증
                            </div>
                        </div>
                    )}
                </div>

                {/* 2) 부채비율 (레버리지 현황) */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">부채비율 (레버리지)</span>
                        <span className="text-sm">⚖️</span>
                    </div>
                    <div>
                        <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                            {debt_ratio}%
                        </div>
                        <div className="text-[10px] font-bold mt-1">
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
                </div>

                {/* 3) 포트폴리오 가중 기대수익률 */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">포트폴리오 기대수익률</span>
                        <span className="text-sm">📈</span>
                    </div>
                    <div>
                        <div className="text-lg sm:text-2xl font-black text-orange-600 dark:text-orange-400 font-mono">
                            {finalExpectedReturn !== null ? `연 ${finalExpectedReturn}%` : '-'}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 truncate">
                            보유 자산 가중평균
                        </div>
                    </div>
                </div>

                {/* 4) 비상금 생존 런웨이 / 저축률 */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                            {runway_months > 0 ? '비상금 생존력' : (savings_rate !== null ? '월 저축률' : '재무 안전 지수')}
                        </span>
                        <span className="text-sm">🛡️</span>
                    </div>
                    <div>
                        <div className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                            {runway_months > 0 ? `${runway_months}개월 버팀` : (savings_rate !== null ? `${savings_rate}%` : '최적화 완료')}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 truncate">
                            {runway_months > 0 ? '무수익 시 생활 버퍼' : (savings_rate !== null ? '월 소득 대비 잉여' : '공식 안전 지표')}
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. 자산 포트폴리오 배분 (분리형 멀티 세그먼트 바 & 범례) */}
            {normalizedShares.length > 0 && (
                <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200">
                        <span className="flex items-center gap-1.5">
                            <span>📊</span> 자산 포트폴리오 배분 구조
                        </span>
                        <span className="text-slate-400 text-[11px] font-normal">합계 100%</span>
                    </div>

                    {/* 분리형 멀티 컬러 막대바: 색상이 뭉치지 않도록 gap-1과 개별 라운딩 적용 */}
                    <div className="h-4 sm:h-5 w-full rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 flex gap-1 shadow-inner border border-slate-200/80 dark:border-slate-700/60 overflow-hidden">
                        {normalizedShares.map((sec, idx) => (
                            <div 
                                key={idx} 
                                style={{ width: `${sec.ratio}%`, backgroundColor: sec.color }} 
                                className="h-full first:rounded-l-lg last:rounded-r-lg rounded-xs transition-all hover:opacity-90 hover:scale-y-105 cursor-pointer"
                                title={`${sec.icon} ${sec.label}: ${sec.ratio}% (${display_mode === 'amount' && sec.amount ? formatKoreanAmount(sec.amount) : ''})`}
                            />
                        ))}
                    </div>

                    {/* 섹터 상세 그리드 범례 */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 pt-1">
                        {normalizedShares.map((sec, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-2xs">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-2xs" style={{ backgroundColor: sec.color }}></span>
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
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

            {/* 4. 주요 핵심 보유 종목 TOP */}
            {top_holdings.length > 0 && (
                <div className="mt-5 pt-4 border-t border-indigo-100/80 dark:border-slate-700/60">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                            <span>🏆</span> 핵심 보유 종목 TOP
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">비중 순</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        {top_holdings.map((item, idx) => {
                            const meta = normalizeSector({ sector: item.sector, label: item.sectorLabel });
                            return (
                                <div key={idx} className="p-3 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-xs flex flex-col justify-between gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1" style={{ backgroundColor: `${meta.color}18`, color: meta.color }}>
                                            <span>{meta.icon}</span> {meta.label}
                                        </span>
                                        {item.ratio && (
                                            <span className="text-xs font-mono font-black text-indigo-600 dark:text-indigo-400">
                                                {item.ratio}%
                                            </span>
                                        )}
                                    </div>
                                    <div className="font-bold text-slate-900 dark:text-white truncate" title={item.name}>
                                        {item.name}
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-100 dark:border-slate-700/40 pt-1.5">
                                        <span>예상 수익률</span>
                                        {typeof item.rate === 'number' && item.rate !== 0 ? (
                                            <span className={`font-bold ${item.rate > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                                                {item.rate > 0 ? '+' : ''}{item.rate}%
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 font-normal">고정/변동</span>
                                        )}
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
