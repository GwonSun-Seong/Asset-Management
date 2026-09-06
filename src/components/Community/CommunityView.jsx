// CommunityView.jsx - 커뮤니티 메인 3컬럼 뷰 (피드, 카테고리, 주간 인기글, 실자산 인증, 상세/작성 모달 연동)
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PostCard from './PostCard';
import PostDetailModal from './PostDetailModal';
import PostWriteModal from './PostWriteModal';
import { communityService } from './communityService';

export default function CommunityView({
    supabase = null,
    currentUser = null,
    isAdmin = false,
    currentAppData = null,
    currentCalculation = null,
    onLogin = null
}) {
    // 탭 및 필터 상태
    const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'free' | 'finance'
    const [sortOrder, setSortOrder] = useState('latest'); // 'latest' | 'popular'
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState(null);
    const [myPostsOnly, setMyPostsOnly] = useState(false);

    // 데이터 상태
    const [posts, setPosts] = useState([]);
    const [weeklyTop, setWeeklyTop] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;

    // 모달 상태
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

    // 토스트 알림 상태
    const [toastMessage, setToastMessage] = useState(null);
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // 1. 게시글 목록 불러오기
    const loadPosts = useCallback(async () => {
        setIsLoading(true);
        try {
            const queryToSearch = selectedTag ? `#${selectedTag}` : searchQuery;
            const res = await communityService.fetchPosts({
                supabase,
                category: activeCategory,
                sort: sortOrder,
                page: currentPage,
                pageSize,
                searchQuery: queryToSearch
            });

            let list = res.posts || [];
            if (myPostsOnly && currentUser) {
                list = list.filter(p => p.user_id === currentUser.id || p.author_email === currentUser.email);
            }
            setPosts(list);
            setTotalCount(res.totalCount || list.length);
        } catch (err) {
            console.error('Failed to load posts:', err);
        } finally {
            setIsLoading(false);
        }
    }, [supabase, activeCategory, sortOrder, currentPage, searchQuery, selectedTag, myPostsOnly, currentUser]);

    // 2. 주간 인기글 불러오기
    const loadWeeklyTop = useCallback(async () => {
        try {
            const topList = await communityService.fetchWeeklyTop(supabase);
            setWeeklyTop(topList || []);
        } catch (err) {
            console.error('Failed to load weekly top:', err);
        }
    }, [supabase]);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    useEffect(() => {
        loadWeeklyTop();
    }, [loadWeeklyTop]);

    // 글 작성 모달 열기 핸들러 (로그인 여부 체크)
    const handleOpenWriteModal = () => {
        if (!currentUser) {
            if (window.confirm('글 작성을 위해서는 로그인이 필요합니다.\n지금 로그인하시겠습니까?')) {
                if (onLogin) onLogin();
            }
            return;
        }
        setIsWriteModalOpen(true);
    };

    // 새 글 등록 완료 처리
    const handlePostCreated = (newPost) => {
        setIsWriteModalOpen(false);
        showToast('🎉 게시글이 성공적으로 등록되었습니다!');
        loadPosts();
        loadWeeklyTop();
    };

    // 게시글 상세 열기
    const handleOpenPostDetail = (postId) => {
        setSelectedPostId(postId);
        setIsDetailModalOpen(true);
    };

    // 게시글 삭제 완료 처리
    const handlePostDeleted = (deletedPostId) => {
        setIsDetailModalOpen(false);
        setSelectedPostId(null);
        setPosts(prev => prev.filter(p => p.id !== deletedPostId));
        showToast('게시글이 삭제되었습니다.');
        loadWeeklyTop();
    };

    // 좋아요 토글 처리
    const handleLikeToggled = (postId, liked, newLikeCount) => {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, like_count: newLikeCount } : p));
        loadWeeklyTop();
    };

    // 인기 태그 목록 추출 (DB에 실제 존재하는 게시글 기반)
    const popularTags = useMemo(() => {
        const tagMap = {};
        posts.forEach(p => {
            if (p.tags && Array.isArray(p.tags)) {
                p.tags.forEach(t => {
                    if (t && typeof t === 'string' && t.trim()) {
                        const trimmed = t.trim();
                        tagMap[trimmed] = (tagMap[trimmed] || 0) + 1;
                    }
                });
            }
        });
        return Object.entries(tagMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([tag]) => tag);
    }, [posts]);

    // 카테고리 탭 목록 (자유주제, 재테크만 지원 + 전체)
    const categories = [
        { id: 'all', label: '전체', icon: '💬' },
        { id: 'free', label: '자유주제', icon: '☕' },
        { id: 'finance', label: '재테크', icon: '💰' }
    ];

    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    return (
        <div className="w-full text-slate-800 dark:text-slate-100 transition-colors space-y-6">
            {/* 상단 알림 토스트 */}
            {toastMessage && (
                <div className="fixed top-20 right-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-xl shadow-xl font-bold text-sm flex items-center gap-2 animate-bounce">
                    <span>✨</span> {toastMessage}
                </div>
            )}

            {/* ============================================================ */}
            {/* 상단 통합 헤더 및 컨트롤 바 (Asset Planner 네이티브 디자인) */}
            {/* ============================================================ */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                                💬 커뮤니티
                            </h1>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300">
                                Open Forum
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            자산 관리 노하우와 재테크 인사이트를 함께 공유하고 성장하는 공간입니다.
                        </p>
                    </div>

                    {/* + 글쓰기 버튼 */}
                    <button
                        onClick={handleOpenWriteModal}
                        className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all hover:scale-102 active:scale-98 cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                        새 글 쓰기
                    </button>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-700/60 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    {/* 카테고리 필터 탭 */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
                        {categories.map(cat => {
                            const isActive = activeCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        setActiveCategory(cat.id);
                                        setCurrentPage(1);
                                    }}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                                        isActive
                                            ? 'bg-indigo-600 text-white shadow-xs'
                                            : 'bg-gray-100 dark:bg-gray-700/70 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    <span>{cat.icon}</span>
                                    <span>{cat.label}</span>
                                </button>
                            );
                        })}
                        {selectedTag && (
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1.5 rounded-xl flex items-center gap-1">
                                #{selectedTag}
                                <button onClick={() => setSelectedTag(null)} className="hover:text-red-500 ml-1">×</button>
                            </span>
                        )}
                    </div>

                    {/* 검색 바 및 정렬 옵션 */}
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 sm:w-60">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') loadPosts(); }}
                                placeholder="글 제목, 내용 검색..."
                                className="w-full pl-8 pr-7 py-1.5 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden dark:text-white"
                            />
                            <svg className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {searchQuery && (
                                <button
                                    onClick={() => { setSearchQuery(''); setSelectedTag(null); }}
                                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* 정렬 스위처 */}
                        <div className="flex items-center bg-gray-100 dark:bg-gray-700/80 p-0.5 rounded-xl text-xs font-bold">
                            <button
                                onClick={() => setSortOrder('latest')}
                                className={`px-2.5 py-1 rounded-lg transition-all ${
                                    sortOrder === 'latest'
                                        ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-300 shadow-xs'
                                        : 'text-gray-500 dark:text-gray-400'
                                }`}
                            >
                                최신순
                            </button>
                            <button
                                onClick={() => setSortOrder('popular')}
                                className={`px-2.5 py-1 rounded-lg transition-all ${
                                    sortOrder === 'popular'
                                        ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-300 shadow-xs'
                                        : 'text-gray-500 dark:text-gray-400'
                                }`}
                            >
                                인기순
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ============================================================ */}
            {/* 메인 2컬럼 레이아웃: 피드 (좌) + 사이드 위젯 (우) */}
            {/* ============================================================ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* 1. 메인 피드 영역 (lg:col-span-8) */}
                <main className="lg:col-span-8 space-y-4">
                    {/* 🔥 이번주 인기글 (실제 추천글이 있을 때만 표시) */}
                    {weeklyTop && weeklyTop.length > 0 && (
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent dark:from-amber-950/25 dark:via-orange-950/15 border border-amber-200/80 dark:border-amber-800/40 shadow-xs">
                            <div className="flex items-center justify-between mb-2.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">🔥</span>
                                    <h2 className="text-xs font-black text-gray-900 dark:text-white tracking-tight">
                                        이번주 인기글 TOP 3
                                    </h2>
                                </div>
                                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                                    WEEKLY BEST
                                </span>
                            </div>

                            <div className="space-y-1.5">
                                {weeklyTop.map((topPost, idx) => {
                                    const rankBadges = ['🥇', '🥈', '🥉'];
                                    return (
                                        <div
                                            key={topPost.id || idx}
                                            onClick={() => handleOpenPostDetail(topPost.id)}
                                            className="group flex items-center justify-between p-2.5 rounded-xl bg-white/90 dark:bg-gray-800/90 border border-amber-100 dark:border-gray-700 hover:border-amber-400 transition-all cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                                <span className="text-sm flex-shrink-0">{rankBadges[idx] || '⭐'}</span>
                                                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    {topPost.title}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 flex-shrink-0 text-[11px] text-gray-400 font-medium">
                                                <span className="flex items-center gap-1 text-rose-500 font-bold">
                                                    ❤️ {topPost.like_count || 0}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    💬 {topPost.comment_count || 0}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* 피드 게시글 목록 */}
                    <div className="space-y-3.5">
                        {isLoading ? (
                            <div className="p-12 text-center bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                                <div className="inline-block w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                    커뮤니티 글을 불러오는 중입니다...
                                </p>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="p-12 text-center bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                                <div className="text-4xl mb-3">💬</div>
                                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-1">
                                    등록된 게시글이 없습니다.
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                                    첫 번째 이야기를 등록하고 지혜를 나눠보세요!
                                </p>
                                <button
                                    onClick={handleOpenWriteModal}
                                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                                >
                                    첫 글 쓰러 가기
                                </button>
                            </div>
                        ) : (
                            posts.map(post => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    onClick={() => handleOpenPostDetail(post.id)}
                                />
                            ))
                        )}
                    </div>

                    {/* 페이지네이션 */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-1 pt-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                이전
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                        currentPage === page
                                            ? 'bg-indigo-600 text-white shadow-xs'
                                            : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                다음
                            </button>
                        </div>
                    )}
                </main>

                {/* ============================================================ */}
                {/* 3. 우측 사이드바 (내 프로필/활동, 추천글, 가이드) */}
                {/* ============================================================ */}
                {/* ============================================================ */}
                {/* 2. 우측 사이드바 (내 프로필/활동, 인기 태그, 커뮤니티 가이드) */}
                {/* ============================================================ */}
                <aside className="lg:col-span-4 space-y-4">
                    {/* 사용자 프로필 / 활동 카드 */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                내 활동 요약
                            </span>
                            {isAdmin && (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                                    🛡️ 관리자
                                </span>
                            )}
                        </div>

                        {currentUser ? (
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
                                        {(currentUser.full_name || currentUser.email || 'U')[0].toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-bold text-sm text-gray-900 dark:text-white truncate">
                                            {currentUser.full_name || currentUser.email?.split('@')[0]}
                                        </div>
                                        <div className="text-[11px] text-gray-400 truncate">
                                            {currentUser.email}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-750 text-center">
                                        <div className="text-[10px] font-bold text-gray-400">작성글</div>
                                        <div className="text-sm font-black text-gray-800 dark:text-gray-100">
                                            {posts.filter(p => p.user_id === currentUser.id || p.author_email === currentUser.email).length}개
                                        </div>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-750 text-center">
                                        <div className="text-[10px] font-bold text-gray-400">보유 순자산</div>
                                        <div className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                                            {currentCalculation ? `${Math.round(currentCalculation.currentNet / 10000 * 10) / 10}억` : '-'}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setMyPostsOnly(prev => !prev)}
                                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all border ${
                                        myPostsOnly
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                            : 'bg-white dark:bg-gray-750 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    {myPostsOnly ? '✓ 전체 글 보기' : '내가 쓴 글 모아보기'}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-3">
                                <div className="text-2xl mb-2">🔐</div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
                                    로그인 후 글/댓글 작성 및 실자산 포트폴리오 인증 기능을 이용하실 수 있습니다.
                                </p>
                                <button
                                    onClick={onLogin}
                                    className="w-full py-2.5 bg-white dark:bg-gray-750 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-xs"
                                >
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                    </svg>
                                    Google로 로그인
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 인기 태그 칩 (실제 태그가 등록된 글이 있을 때만 표시) */}
                    {popularTags.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm">
                            <div className="flex items-center justify-between mb-2.5 px-1">
                                <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    🏷️ 인기 태그
                                </span>
                                {selectedTag && (
                                    <button
                                        onClick={() => setSelectedTag(null)}
                                        className="text-[10px] text-indigo-500 hover:underline font-bold"
                                    >
                                        초기화
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {popularTags.map((tag, idx) => {
                                    const isSelected = selectedTag === tag;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setSelectedTag(isSelected ? null : tag);
                                                setCurrentPage(1);
                                            }}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                                isSelected
                                                    ? 'bg-indigo-600 text-white shadow-xs'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            #{tag}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* 커뮤니티 이용 수칙 */}
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-[11px] text-gray-500 dark:text-gray-400 space-y-2">
                        <div className="font-black text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                            <span>📜</span> 커뮤니티 가이드
                        </div>
                        <p className="leading-relaxed">
                            • 상호 존중과 배려를 바탕으로 건설적인 금융/재테크 지식을 나눠주세요.
                        </p>
                        <p className="leading-relaxed">
                            • 실자산 인증 기능은 실제 계산 엔진의 세션 데이터만 담아 위변조를 방지합니다.
                        </p>
                        <p className="leading-relaxed">
                            • 욕설, 비방, 불법 리딩방 홍보 등 부적절한 게시글은 관리자에 의해 무통보 삭제됩니다.
                        </p>
                    </div>
                </aside>

            </div>

            {/* ============================================================ */}
            {/* 게시글 작성 모달 */}
            {/* ============================================================ */}
            <PostWriteModal
                isOpen={isWriteModalOpen}
                onClose={() => setIsWriteModalOpen(false)}
                onSubmit={handlePostCreated}
                currentUser={currentUser}
                isAdmin={isAdmin}
                currentAppData={currentAppData}
                currentCalculation={currentCalculation}
            />

            {/* ============================================================ */}
            {/* 게시글 상세 모달 */}
            {/* ============================================================ */}
            <PostDetailModal
                isOpen={isDetailModalOpen}
                postId={selectedPostId}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedPostId(null);
                }}
                currentUser={currentUser}
                isAdmin={isAdmin}
                supabase={supabase}
                onPostDeleted={handlePostDeleted}
                onLikeToggled={handleLikeToggled}
            />
        </div>
    );
}
