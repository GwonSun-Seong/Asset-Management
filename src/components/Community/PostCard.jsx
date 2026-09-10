// PostCard.jsx - 커뮤니티 피드 리스트용 개별 게시글 카드
import React from 'react';
import AssetFlexCard from './AssetFlexCard';
import { renderBadgeInfo } from './badgeConstants';

export default function PostCard({ post, onClick, onLikeToggle, isLiked = false }) {
    if (!post) return null;

    const categoryLabels = {
        free: '자유주제',
        finance: '재테크'
    };

    const formatDate = (isoStr) => {
        if (!isoStr) return '';
        const d = new Date(isoStr);
        const now = new Date();
        const diffHours = Math.floor((now - d) / (1000 * 60 * 60));
        if (diffHours < 1) return '방금 전';
        if (diffHours < 24) return `${diffHours}시간 전`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays}일 전`;
        return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
    };

    return (
        <div 
            onClick={onClick}
            className={`p-5 rounded-2xl bg-white dark:bg-slate-850 border transition-all duration-200 hover:shadow-md cursor-pointer ${
                post.is_notice 
                    ? 'border-amber-300/80 dark:border-amber-600/50 bg-amber-50/20 dark:bg-amber-950/10' 
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
            }`}
        >
            {/* 카테고리 태그 및 공지 뱃지 */}
            <div className="flex items-center gap-2 mb-2">
                {post.is_notice && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-white flex items-center gap-1 shadow-xs animate-pulse">
                        <span>📌</span> 전체 공지
                    </span>
                )}
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    {categoryLabels[post.category] || post.category || '자유주제'}
                </span>
                {post.tags && post.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="text-[10px] text-indigo-500 dark:text-indigo-400 font-medium">
                        #{tag}
                    </span>
                ))}
            </div>

            {/* 제목 */}
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1 mb-1.5">
                {post.title}
            </h3>

            {/* 본문 요약 (2줄 말줄임) */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-3">
                {post.content}
            </p>

            {/* 첨부 이미지 썸네일 그리드 */}
            {post.images && Array.isArray(post.images) && post.images.length > 0 && (
                <div className="mb-3">
                    {post.images.length === 1 ? (
                        <div className="rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800/80 bg-slate-100 dark:bg-slate-800/50 max-h-[420px] sm:max-h-[480px] flex items-center justify-center">
                            <img 
                                src={post.images[0]} 
                                alt="첨부 이미지" 
                                className="w-full h-auto max-h-[420px] sm:max-h-[480px] object-cover hover:scale-[1.01] transition-transform duration-300"
                                loading="lazy"
                            />
                        </div>
                    ) : (
                        <div className={`grid gap-2 rounded-2xl overflow-hidden ${
                            post.images.length === 2 ? 'grid-cols-2 h-52 sm:h-64' : 'grid-cols-3 h-40 sm:h-52'
                        }`}>
                            {post.images.map((imgUrl, idx) => (
                                <div key={idx} className="relative w-full h-full bg-slate-100 dark:bg-slate-800 overflow-hidden rounded-xl">
                                    <img 
                                        src={imgUrl} 
                                        alt={`첨부 이미지 ${idx + 1}`} 
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                        loading="lazy"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* 자산 스냅샷 미니 위젯 렌더링 */}
            {post.asset_snapshot && (
                <div onClick={(e) => { e.stopPropagation(); onClick(); }}>
                    <AssetFlexCard 
                        snapshot={post.asset_snapshot} 
                        compact={true} 
                        authorProfile={post.author_profile}
                        hideTier={post.hide_tier_badge}
                    />
                </div>
            )}

            {/* 하단 작성자 정보 & 지표 (조회, 좋아요, 댓글) */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                        {post.is_anonymous ? '?' : (post.author_name ? post.author_name.slice(0, 1) : 'U')}
                    </div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {post.author_name || '사용자'}
                    </span>
                    {(() => {
                        const badge = !post.is_anonymous ? renderBadgeInfo(post.author_profile?.selected_badge, post.author_profile, post.asset_snapshot) : null;
                        if (!badge) return null;
                        return (
                            <span 
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50 cursor-help transition-transform hover:scale-105"
                                title={badge.tooltip}
                            >
                                {badge.icon} {badge.label}
                            </span>
                        );
                    })()}
                    <span className="text-[11px] text-slate-400">· {formatDate(post.created_at)}</span>
                </div>

                <div className="flex items-center gap-3 font-medium text-slate-400">
                    <span className="flex items-center gap-1" title="조회수">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        {post.view_count || 0}
                    </span>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onLikeToggle) onLikeToggle(post.id);
                        }}
                        className={`flex items-center gap-1 transition-colors hover:text-rose-500 ${isLiked ? 'text-rose-500 font-bold' : ''}`}
                        title="좋아요"
                    >
                        <span>{isLiked ? '❤️' : '🤍'}</span>
                        {post.like_count || 0}
                    </button>
                    <span className="flex items-center gap-1" title="댓글">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        {post.comment_count || 0}
                    </span>
                </div>
            </div>
        </div>
    );
}
