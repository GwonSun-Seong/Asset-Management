// PostDetailModal.jsx - 커뮤니티 게시글 상세 모달 (본문, 자산 스냅샷 렌더러, 좋아요, 댓글, 삭제)
import React, { useState, useEffect } from 'react';
import AssetFlexCard from './AssetFlexCard';
import { communityService } from './communityService';
import { renderBadgeInfo } from './badgeConstants';

export default function PostDetailModal({
    isOpen,
    postId,
    onClose,
    currentUser,
    isAdmin = false,
    supabase = null,
    onPostDeleted = null,
    onLikeToggled = null
}) {
    if (!isOpen || !postId) return null;

    const [post, setPost] = useState(null);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [comments, setComments] = useState([]);
    const [commentInput, setCommentInput] = useState('');
    const [isCommentAnonymous, setIsCommentAnonymous] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    const categoryLabels = {
        free: '자유주제',
        finance: '재테크'
    };

    const loadData = async () => {
        setIsLoading(true);
        try {
            const currentUserId = currentUser?.id || null;
            const { post: loadedPost, likedByUser } = await communityService.fetchPostDetail(supabase, postId, currentUserId);
            if (loadedPost) {
                setPost(loadedPost);
                setLiked(likedByUser);
                setLikeCount(loadedPost.like_count || 0);
                // 조회수 증가
                communityService.incrementView(supabase, postId);
            }
            const loadedComments = await communityService.fetchComments(supabase, postId);
            setComments(loadedComments || []);
        } catch (err) {
            console.error('Failed to load post detail:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [postId, currentUser]);

    const handleLike = async () => {
        if (!currentUser) {
            alert('좋아요를 누르려면 먼저 로그인해주세요.');
            return;
        }
        try {
            let userId = currentUser.id;
            if (supabase) {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) userId = session.user.id;
            }
            const res = await communityService.toggleLike(supabase, postId, userId);
            setLiked(res.liked);
            setLikeCount(prev => res.liked ? prev + 1 : Math.max(0, prev - 1));
            if (onLikeToggled) onLikeToggled(postId, res.liked);
        } catch (e) {
            alert(e.message || '좋아요 처리에 실패했습니다.');
        }
    };

    const handleDeletePost = async () => {
        if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;
        setIsDeleting(true);
        try {
            let userId = currentUser?.id;
            if (supabase) {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) userId = session.user.id;
            }
            await communityService.deletePost(supabase, postId, userId, isAdmin);
            alert('게시글이 삭제되었습니다.');
            if (onPostDeleted) onPostDeleted(postId);
            onClose();
        } catch (e) {
            alert(e.message || '삭제에 실패했습니다.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            alert('댓글을 작성하려면 로그인이 필요합니다.');
            return;
        }
        if (!commentInput.trim()) return;

        try {
            let userId = currentUser.id;
            let authorName = currentUser.user_metadata?.full_name || currentUser.full_name || currentUser.email?.split('@')[0] || '사용자';
            if (supabase) {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    userId = session.user.id;
                    authorName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || authorName;
                }
            }

            const newComment = await communityService.addComment(supabase, {
                postId,
                user_id: userId,
                content: commentInput.trim(),
                is_anonymous: isCommentAnonymous,
                author_name: authorName
            });
            setComments(prev => [...prev, newComment]);
            setCommentInput('');
            if (post) setPost(prev => ({ ...prev, comment_count: (prev.comment_count || 0) + 1 }));
        } catch (err) {
            alert(err.message || '댓글 등록 실패');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!confirm('댓글을 삭제하시겠습니까?')) return;
        try {
            await communityService.deleteComment(supabase, commentId, postId, currentUser?.id, isAdmin);
            setComments(prev => prev.filter(c => c.id !== commentId));
            if (post) setPost(prev => ({ ...prev, comment_count: Math.max(0, (prev.comment_count || 1) - 1) }));
        } catch (e) {
            alert(e.message || '댓글 삭제 실패');
        }
    };

    const formatDate = (isoStr) => {
        if (!isoStr) return '';
        const d = new Date(isoStr);
        return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    const canDeletePost = currentUser && (currentUser.id === post?.user_id || isAdmin);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 dark:border-slate-800 my-auto flex flex-col max-h-[90vh]">
                
                {/* 헤더 */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/70 dark:bg-slate-850">
                    <div className="flex items-center gap-2">
                        {post?.is_notice && (
                            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-white flex items-center gap-1 shadow-xs">
                                <span>📌</span> 전체 공지
                            </span>
                        )}
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-200/70 dark:bg-slate-700 px-3 py-1 rounded-full">
                            {categoryLabels[post?.category] || post?.category || '자유주제'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {canDeletePost && (
                            <button 
                                onClick={handleDeletePost}
                                disabled={isDeleting}
                                className="text-xs font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 px-3 py-1.5 rounded-xl transition-all"
                            >
                                {isDeleting ? '삭제 중...' : '게시글 삭제'}
                            </button>
                        )}
                        <button 
                            onClick={onClose} 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-base font-bold transition-all"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* 본문 콘텐츠 스크롤 영역 */}
                <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar pb-16">
                    {isLoading ? (
                        <div className="py-20 text-center text-slate-400 text-sm">
                            <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                            <div>게시글 불러오는 중...</div>
                        </div>
                    ) : !post ? (
                        <div className="py-20 text-center text-slate-400 text-sm">
                            게시글을 찾을 수 없습니다.
                        </div>
                    ) : (
                        <>
                            {/* 제목 및 작성자 메타 */}
                            <div>
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug mb-3">
                                    {post.title}
                                </h1>
                                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                                            {post.is_anonymous ? '?' : (post.author_name ? post.author_name.slice(0, 1) : 'U')}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                                    {post.author_name}
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
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-mono">
                                                {formatDate(post.created_at)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 font-medium text-slate-400">
                                        <span>조회 {post.view_count || 0}</span>
                                        <span>댓글 {post.comment_count || comments.length || 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 자산 포트폴리오 스냅샷 카드 렌더링 */}
                            {post.asset_snapshot && (
                                <AssetFlexCard 
                                    snapshot={post.asset_snapshot} 
                                    compact={false} 
                                    authorProfile={post.author_profile}
                                    hideTier={post.hide_tier_badge}
                                />
                            )}

                            {/* 본문 텍스트 */}
                            <div className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap py-2 min-h-[80px]">
                                {post.content}
                            </div>

                            {/* 📷 첨부 이미지 갤러리 */}
                            {post.images && Array.isArray(post.images) && post.images.length > 0 && (
                                <div className="space-y-3 py-3">
                                    <div className={`grid gap-3 ${
                                        post.images.length === 1 ? 'grid-cols-1' : (post.images.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3')
                                    }`}>
                                        {post.images.map((imgUrl, idx) => (
                                            <div key={idx} className="rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-850 shadow-xs group">
                                                <a href={imgUrl} target="_blank" rel="noopener noreferrer" className="block relative cursor-zoom-in">
                                                    <img 
                                                        src={imgUrl} 
                                                        alt={`첨부 이미지 ${idx + 1}`} 
                                                        className="w-full max-h-[500px] object-contain rounded-2xl mx-auto hover:opacity-95 transition-opacity"
                                                        loading="lazy"
                                                    />
                                                    <span className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-black/60 backdrop-blur-xs text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                                        <span>🔍</span> 원본 확대
                                                    </span>
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 태그 목록 */}
                            {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-2">
                                    {post.tags.map((tag, idx) => (
                                        <span 
                                            key={idx}
                                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* 좋아요 액션 버튼 */}
                            <div className="flex justify-center py-4">
                                <button
                                    onClick={handleLike}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-xs transition-all shadow-xs ${
                                        liked 
                                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 shadow-sm scale-105'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 hover:scale-102'
                                    }`}
                                >
                                    <svg className={`w-4 h-4 ${liked ? 'fill-rose-500 text-rose-500' : 'fill-none stroke-current'}`} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    <span>좋아요 {likeCount}</span>
                                </button>
                            </div>

                            {/* 댓글 영역 */}
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                    <span>💬</span> 댓글 ({comments.length})
                                </h3>

                                {/* 댓글 입력 폼 */}
                                <form onSubmit={handleAddComment} className="space-y-2.5 bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                                    <textarea
                                        value={commentInput}
                                        onChange={(e) => setCommentInput(e.target.value)}
                                        placeholder={currentUser ? "의견을 나눠보세요. (타인을 존중하는 건전한 댓글을 지향합니다)" : "댓글을 작성하려면 먼저 로그인해주세요."}
                                        disabled={!currentUser}
                                        rows={3}
                                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden dark:text-white resize-none"
                                    />
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-600 dark:text-slate-400">
                                            <input 
                                                type="checkbox"
                                                checked={isCommentAnonymous}
                                                onChange={(e) => setIsCommentAnonymous(e.target.checked)}
                                                className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                            />
                                            <span>익명 댓글</span>
                                        </label>
                                        <button 
                                            type="submit"
                                            disabled={!currentUser || !commentInput.trim()}
                                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-40 shadow-xs cursor-pointer"
                                        >
                                            댓글 등록
                                        </button>
                                    </div>
                                </form>

                                {/* 댓글 목록 */}
                                <div className="space-y-3 pt-2">
                                    {comments.length === 0 ? (
                                        <div className="py-8 px-4 text-center rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 text-slate-400 text-xs">
                                            💬 아직 등록된 댓글이 없습니다. 첫 번째 의견을 남겨보세요!
                                        </div>
                                    ) : (
                                        comments.map((comment) => {
                                            const canDeleteComment = currentUser && (currentUser.id === comment.user_id || isAdmin);
                                            return (
                                                <div key={comment.id} className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-5 h-5 rounded-full bg-indigo-500 text-white font-bold text-[9px] flex items-center justify-center">
                                                                {comment.is_anonymous ? '?' : (comment.author_name ? comment.author_name.slice(0, 1) : 'U')}
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                                                    {comment.author_name}
                                                                </span>
                                                                {(() => {
                                                                    const badge = !comment.is_anonymous ? renderBadgeInfo(comment.author_profile?.selected_badge, comment.author_profile) : null;
                                                                    if (!badge) return null;
                                                                    return (
                                                                        <span 
                                                                            className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/40 cursor-help"
                                                                            title={badge.tooltip}
                                                                        >
                                                                            {badge.icon} {badge.label}
                                                                        </span>
                                                                    );
                                                                })()}
                                                            </div>
                                                            <span className="text-[10px] text-slate-400">
                                                                {formatDate(comment.created_at)}
                                                            </span>
                                                        </div>
                                                        {canDeleteComment && (
                                                            <button 
                                                                onClick={() => handleDeleteComment(comment.id)}
                                                                className="text-slate-400 hover:text-rose-500 text-[10px] font-bold transition-colors"
                                                            >
                                                                삭제
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-7 whitespace-pre-wrap">
                                                        {comment.content}
                                                    </p>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}
