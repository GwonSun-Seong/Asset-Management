// AssetFlexCard.jsx - 검증된 실자산 포트폴리오 스냅샷 시각화 컴포넌트
import React from 'react';

export default function AssetFlexCard({ snapshot, compact = false }) {
    if (!snapshot) return null;

    const {
        verified = true,
        snapshot_date = '',
        tier_label = '자산가',
        tier_badge = '💎',
        display_mode = 'amount',
        total_net_worth = null,
        portfolio_shares = [],
        top_holdings = [],
        capital_yield = null
    } = snapshot;

    // 만원 단위 억/만 포맷터
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

    if (compact) {
        // 피드 리스트용 미니멀 카드 형태
        return (
            <div className="my-2.5 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-indigo-50/40 dark:from-slate-800/80 dark:to-indigo-950/30 border border-indigo-100/80 dark:border-indigo-900/40 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                    <span className="text-xl p-1.5 bg-white dark:bg-slate-700 rounded-lg shadow-xs border border-indigo-100 dark:border-indigo-800">
                        {tier_badge || '💎'}
                    </span>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-indigo-600 text-white flex items-center gap-0.5 shadow-xs">
                                <span>🛡️</span> 실자산 인증
                            </span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                {tier_label}
                            </span>
                        </div>
                        {display_mode === 'amount' && total_net_worth !== null ? (
                            <div className="text-sm font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                                순자산 {formatKoreanAmount(total_net_worth)}
                            </div>
                        ) : (
                            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                                금액 비공개 (자산 등급 및 포트폴리오 비중 인증)
                            </div>
                        )}
                    </div>
                </div>

                {/* 미니 섹터 비중 요약 바 */}
                {portfolio_shares.length > 0 && (
                    <div className="w-full sm:w-48 flex flex-col gap-1">
                        <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex shadow-inner">
                            {portfolio_shares.map((sec, idx) => (
                                <div 
                                    key={idx} 
                                    style={{ width: `${sec.ratio}%`, backgroundColor: sec.color || '#3B82F6' }} 
                                    title={`${sec.label}: ${sec.ratio}%`}
                                />
                            ))}
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-400 font-medium truncate">
                            {portfolio_shares.slice(0, 3).map((sec, idx) => (
                                <span key={idx}>{sec.label} {sec.ratio}%</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // 상세 모달용 풀 렌더링 카드
    return (
        <div className="my-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 dark:from-slate-850 dark:via-slate-800 dark:to-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/50 shadow-sm">
            {/* 상단 뱃지 & 인증 헤더 */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-indigo-100/80 dark:border-slate-700/60">
                <div className="flex items-center gap-3">
                    <span className="text-3xl p-2.5 bg-white dark:bg-slate-700 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-800">
                        {tier_badge || '💎'}
                    </span>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-indigo-600 text-white flex items-center gap-1 shadow-xs">
                                <span>🛡️</span> 공식 인증 스냅샷
                            </span>
                            <span className="text-sm font-black text-indigo-700 dark:text-indigo-300">
                                {tier_label}
                            </span>
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-1 flex items-center gap-2">
                            <span>기록 시점: {snapshot_date || '인증 완료'}</span>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">인증 완료</span>
                        </div>
                    </div>
                </div>

                {capital_yield && (
                    <div className="text-right">
                        <span className="text-[11px] text-slate-400 block font-medium">예상 자본수익률</span>
                        <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                            연 {capital_yield}%
                        </span>
                    </div>
                )}
            </div>

            {/* 메인 순자산 정보 */}
            <div className="py-4">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">
                    인증된 순자산 총액
                </div>
                {display_mode === 'amount' && total_net_worth !== null ? (
                    <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-baseline gap-2">
                        <span>{formatKoreanAmount(total_net_worth)}</span>
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                            공식 검증 완료
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs bg-indigo-50/70 dark:bg-indigo-950/40 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                        <span>🔒</span> 작성자가 순자산 금액은 비공개하고 자산 등급 및 포트폴리오 비중만 안전하게 인증했습니다.
                    </div>
                )}
            </div>

            {/* 자산 배분 비중 멀티 프로그레스 바 */}
            {portfolio_shares.length > 0 && (
                <div className="space-y-2.5 pt-2">
                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                        <span>📊 자산 포트폴리오 배분</span>
                        <span className="text-slate-400 text-[10px] font-normal">합계 100%</span>
                    </div>
                    <div className="h-3.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex shadow-inner">
                        {portfolio_shares.map((sec, idx) => (
                            <div 
                                key={idx} 
                                style={{ width: `${sec.ratio}%`, backgroundColor: sec.color || '#3B82F6' }} 
                                className="transition-all hover:opacity-90"
                                title={`${sec.label}: ${sec.ratio}%`}
                            />
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-3 pt-1">
                        {portfolio_shares.map((sec, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sec.color || '#3B82F6' }}></span>
                                <span className="font-medium">{sec.label}</span>
                                <span className="font-mono font-bold text-slate-900 dark:text-white">{sec.ratio}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 주요 보유 자산/종목 칩 */}
            {top_holdings.length > 0 && (
                <div className="mt-4 pt-3.5 border-t border-indigo-100/60 dark:border-slate-700/60">
                    <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2">
                        핵심 보유 종목 TOP
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {top_holdings.map((item, idx) => (
                            <div key={idx} className="px-3 py-1.5 bg-white dark:bg-slate-700/80 rounded-xl border border-slate-200/80 dark:border-slate-600 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-xs flex items-center gap-2">
                                <span className="font-bold">{item.name}</span>
                                {item.ratio && <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">{item.ratio}%</span>}
                                {typeof item.rate === 'number' && (
                                    <span className={`text-[10px] font-mono font-bold ${item.rate >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                                        ({item.rate >= 0 ? '+' : ''}{item.rate}%)
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
