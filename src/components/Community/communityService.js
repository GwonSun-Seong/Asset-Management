// communityService.js - Supabase & 로컬 데이터 레이어

const MOCK_LOCAL_STORAGE_KEY = 'assetDashboard_community_posts_v3';
const MOCK_LIKES_KEY = 'assetDashboard_community_likes_v3';

// 기존 목업 캐시 완전 초기화 (가짜 데이터 제거)
try {
    localStorage.removeItem('assetDashboard_mock_community_posts');
    localStorage.removeItem('assetDashboard_mock_community_likes');
    localStorage.removeItem('assetDashboard_community_posts_v2');
    localStorage.removeItem('assetDashboard_community_likes_v2');
} catch (e) {}

// 초기 데이터 없음 (DB 기반 순수 운영)
const INITIAL_MOCK_POSTS = [];

// 로컬 스토리지 헬퍼
const getLocalPosts = () => {
    try {
        const raw = localStorage.getItem(MOCK_LOCAL_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
};

const saveLocalPosts = (posts) => {
    try {
        localStorage.setItem(MOCK_LOCAL_STORAGE_KEY, JSON.stringify(posts));
    } catch (e) {}
};

const getLocalLikes = () => {
    try {
        const raw = localStorage.getItem(MOCK_LIKES_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
};

const saveLocalLikes = (likes) => {
    try {
        localStorage.setItem(MOCK_LIKES_KEY, JSON.stringify(likes));
    } catch (e) {}
};

// ==============================================================================
// 🌐 커뮤니티 데이터 API 서비스
// ==============================================================================

export const communityService = {
    // 1. 게시글 목록 조회
    async fetchPosts(supabaseOrOptions, maybeOptions) {
        let supabase = supabaseOrOptions;
        let options = maybeOptions || {};
        if (supabaseOrOptions && !supabaseOrOptions.from && typeof supabaseOrOptions === 'object') {
            supabase = supabaseOrOptions.supabase;
            options = supabaseOrOptions;
        }

        const {
            category = 'all',
            sort = 'latest',
            searchQuery = '',
            page = 1,
            pageSize = 20
        } = options;

        if (supabase) {
            try {
                let query = supabase
                    .from('community_posts')
                    .select('*', { count: 'exact' });

                if (category && category !== 'all') {
                    query = query.eq('category', category);
                }

                if (searchQuery && searchQuery.trim()) {
                    const q = searchQuery.trim();
                    if (q.startsWith('#')) {
                        const tag = q.substring(1);
                        query = query.contains('tags', JSON.stringify([tag]));
                    } else {
                        query = query.or(`title.ilike.%${q}%,content.ilike.%${q}%`);
                    }
                }

                // 공지사항 우선 정렬 후 정렬 기준 적용
                if (sort === 'popular') {
                    query = query.order('is_notice', { ascending: false }).order('like_count', { ascending: false }).order('created_at', { ascending: false });
                } else {
                    query = query.order('is_notice', { ascending: false }).order('created_at', { ascending: false });
                }

                const from = (page - 1) * pageSize;
                const to = from + pageSize - 1;
                query = query.range(from, to);

                const { data, error, count } = await query;
                if (!error) {
                    return { posts: data || [], totalCount: count !== null ? count : (data ? data.length : 0), isFallback: false };
                } else {
                    console.warn('Supabase community_posts query error:', error.message);
                }
            } catch (err) {
                console.warn('Supabase community_posts exception:', err.message);
            }
        }

        // 로컬 스토리지 (오프라인 또는 DB 에러 시)
        let posts = getLocalPosts();
        if (category && category !== 'all') {
            posts = posts.filter(p => p.category === category);
        }
        if (searchQuery && searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            if (q.startsWith('#')) {
                const tag = q.substring(1);
                posts = posts.filter(p => p.tags && p.tags.some(t => t.toLowerCase() === tag));
            } else {
                posts = posts.filter(p => p.title?.toLowerCase().includes(q) || p.content?.toLowerCase().includes(q) || (p.tags && p.tags.some(t => t.toLowerCase().includes(q))));
            }
        }

        posts.sort((a, b) => {
            if (a.is_notice && !b.is_notice) return -1;
            if (!a.is_notice && b.is_notice) return 1;
            if (sort === 'popular') {
                return (b.like_count || 0) - (a.like_count || 0) || new Date(b.created_at) - new Date(a.created_at);
            }
            return new Date(b.created_at) - new Date(a.created_at);
        });

        const from = (page - 1) * pageSize;
        const paged = posts.slice(from, from + pageSize);
        return { posts: paged, totalCount: posts.length, isFallback: true };
    },

    // 2. 주간 인기글 TOP 3 가져오기 (좋아요 1개 이상만)
    async fetchWeeklyTop(supabase) {
        if (supabase) {
            try {
                const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
                const { data, error } = await supabase
                    .from('community_posts')
                    .select('id, title, category, like_count, comment_count, view_count, is_notice')
                    .gte('created_at', sevenDaysAgo)
                    .gt('like_count', 0)
                    .order('like_count', { ascending: false })
                    .limit(3);

                if (!error) return data || [];
            } catch (e) {}
        }

        const posts = getLocalPosts();
        return [...posts]
            .filter(p => (p.like_count || 0) > 0)
            .sort((a, b) => (b.like_count || 0) - (a.like_count || 0))
            .slice(0, 3)
            .map(p => ({
                id: p.id,
                title: p.title,
                category: p.category,
                like_count: p.like_count,
                comment_count: p.comment_count,
                view_count: p.view_count
            }));
    },

    // 3. 게시글 상세 조회
    async fetchPostDetail(supabase, postId, currentUserId = null) {
        let post = null;
        let likedByUser = false;

        if (supabase) {
            try {
                const { data, error } = await supabase
                    .from('community_posts')
                    .select('*')
                    .eq('id', postId)
                    .maybeSingle();

                if (!error && data) {
                    post = data;
                    if (currentUserId) {
                        const { data: likeData } = await supabase
                            .from('community_post_likes')
                            .select('post_id')
                            .eq('post_id', postId)
                            .eq('user_id', currentUserId)
                            .maybeSingle();
                        likedByUser = !!likeData;
                    }
                }
            } catch (e) {}
        }

        if (!post) {
            const posts = getLocalPosts();
            post = posts.find(p => p.id === postId);
            if (currentUserId) {
                const likes = getLocalLikes();
                likedByUser = likes.some(l => l.post_id === postId && l.user_id === currentUserId);
            }
        }

        return { post, likedByUser };
    },

    // 4. 새 게시글 생성
    async createPost(supabase, postData) {
        const {
            user_id,
            category,
            title,
            content,
            tags = [],
            is_notice = false,
            is_anonymous = false,
            author_name,
            author_email,
            asset_snapshot = null
        } = postData;

        if (!title.trim()) throw new Error('제목을 입력해주세요.');
        if (!content.trim()) throw new Error('내용을 입력해주세요.');

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user_id);
        const displayAuthorName = is_anonymous ? `익명 (${user_id ? user_id.slice(-4) : '0000'})` : (author_name || '사용자');
        const displayAuthorEmail = is_anonymous ? null : author_email;

        const newPost = {
            id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            user_id,
            category,
            title: title.trim(),
            content: content.trim(),
            tags,
            is_notice: !!is_notice,
            is_anonymous: !!is_anonymous,
            author_name: displayAuthorName,
            author_email: displayAuthorEmail,
            asset_snapshot,
            images: [],
            poll: null,
            view_count: 1,
            like_count: 0,
            comment_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        if (supabase && isUuid) {
            try {
                const { data, error } = await supabase
                    .from('community_posts')
                    .insert([
                        {
                            user_id,
                            category,
                            title: newPost.title,
                            content: newPost.content,
                            tags,
                            is_notice: newPost.is_notice,
                            is_anonymous: newPost.is_anonymous,
                            author_name: displayAuthorName,
                            author_email: displayAuthorEmail,
                            asset_snapshot,
                            images: [],
                            poll: null
                        }
                    ])
                    .select()
                    .single();

                if (error) {
                    console.error('Supabase post insert error:', error);
                    throw new Error(`DB 저장 오류: ${error.message || error.details || '권한 또는 스키마 오류'}`);
                }

                if (data) {
                    return data;
                }
            } catch (e) {
                console.error('Supabase post insert exception:', e);
                throw e;
            }
        }

        // 로컬 폴백 저장 (오프라인 모드 또는 로컬 테스트 계정)
        const posts = getLocalPosts();
        posts.unshift(newPost);
        saveLocalPosts(posts);
        return newPost;
    },

    // 5. 게시글 삭제 (작성자 본인 또는 관리자만 가능)
    async deletePost(supabase, postId, currentUserId, isAdmin = false) {
        if (!currentUserId && !isAdmin) {
            throw new Error('삭제 권한이 없습니다.');
        }

        if (supabase) {
            try {
                let deleteQuery = supabase.from('community_posts').delete().eq('id', postId);
                if (!isAdmin) {
                    deleteQuery = deleteQuery.eq('user_id', currentUserId);
                }
                const { error } = await deleteQuery;
                if (!error) return true;
            } catch (e) {
                console.warn('Supabase post delete failed, fallback to local:', e);
            }
        }

        const posts = getLocalPosts();
        const target = posts.find(p => p.id === postId);
        if (!target) return false;
        if (!isAdmin && target.user_id !== currentUserId) {
            throw new Error('본인의 게시글만 삭제할 수 있습니다.');
        }

        const filtered = posts.filter(p => p.id !== postId);
        saveLocalPosts(filtered);
        return true;
    },

    // 6. 좋아요 토글
    async toggleLike(supabase, postId, currentUserId) {
        if (!currentUserId) throw new Error('로그인이 필요합니다.');

        if (supabase) {
            try {
                const { data: existing } = await supabase
                    .from('community_post_likes')
                    .select('post_id')
                    .eq('post_id', postId)
                    .eq('user_id', currentUserId)
                    .maybeSingle();

                if (existing) {
                    await supabase
                        .from('community_post_likes')
                        .delete()
                        .eq('post_id', postId)
                        .eq('user_id', currentUserId);
                    return { liked: false };
                } else {
                    await supabase
                        .from('community_post_likes')
                        .insert([{ post_id: postId, user_id: currentUserId }]);
                    return { liked: true };
                }
            } catch (e) {
                console.warn('Supabase like toggle failed, fallback to local:', e);
            }
        }

        // 로컬 폴백
        const likes = getLocalLikes();
        const existingIdx = likes.findIndex(l => l.post_id === postId && l.user_id === currentUserId);
        const posts = getLocalPosts();
        const post = posts.find(p => p.id === postId);

        if (existingIdx >= 0) {
            likes.splice(existingIdx, 1);
            saveLocalLikes(likes);
            if (post) {
                post.like_count = Math.max(0, (post.like_count || 1) - 1);
                saveLocalPosts(posts);
            }
            return { liked: false, newCount: post ? post.like_count : 0 };
        } else {
            likes.push({ post_id: postId, user_id: currentUserId, created_at: new Date().toISOString() });
            saveLocalLikes(likes);
            if (post) {
                post.like_count = (post.like_count || 0) + 1;
                saveLocalPosts(posts);
            }
            return { liked: true, newCount: post ? post.like_count : 1 };
        }
    },

    // 7. 댓글 목록 가져오기
    async fetchComments(supabase, postId) {
        if (supabase) {
            try {
                const { data, error } = await supabase
                    .from('community_comments')
                    .select('*')
                    .eq('post_id', postId)
                    .order('created_at', { ascending: true });

                if (!error && data) return data;
            } catch (e) {}
        }

        try {
            const raw = localStorage.getItem(`comments_${postId}`);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    },

    // 8. 댓글 추가
    async addComment(supabase, { postId, user_id, content, is_anonymous = false, author_name }) {
        if (!content.trim()) throw new Error('댓글 내용을 입력해주세요.');

        const newComment = {
            id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            post_id: postId,
            user_id,
            content: content.trim(),
            is_anonymous,
            author_name: is_anonymous ? `익명 (${user_id.slice(-4)})` : author_name,
            created_at: new Date().toISOString()
        };

        if (supabase && user_id) {
            try {
                const { data, error } = await supabase
                    .from('community_comments')
                    .insert([
                        {
                            post_id: postId,
                            user_id,
                            content: newComment.content,
                            is_anonymous,
                            author_name: newComment.author_name
                        }
                    ])
                    .select()
                    .single();

                if (!error && data) return data;
            } catch (e) {}
        }

        // 로컬 저장
        const key = `comments_${postId}`;
        let comments = [];
        try {
            const raw = localStorage.getItem(key);
            if (raw) comments = JSON.parse(raw);
        } catch (e) {}
        comments.push(newComment);
        localStorage.setItem(key, JSON.stringify(comments));

        // 포스트 댓글 카운트 증가
        const posts = getLocalPosts();
        const post = posts.find(p => p.id === postId);
        if (post) {
            post.comment_count = (post.comment_count || 0) + 1;
            saveLocalPosts(posts);
        }

        return newComment;
    },

    // 9. 댓글 삭제
    async deleteComment(supabase, commentId, postId, currentUserId, isAdmin = false) {
        if (supabase) {
            try {
                let query = supabase.from('community_comments').delete().eq('id', commentId);
                if (!isAdmin) query = query.eq('user_id', currentUserId);
                const { error } = await query;
                if (!error) return true;
            } catch (e) {}
        }

        const key = `comments_${postId}`;
        try {
            const raw = localStorage.getItem(key);
            if (raw) {
                let comments = JSON.parse(raw);
                comments = comments.filter(c => c.id !== commentId);
                localStorage.setItem(key, JSON.stringify(comments));
            }
        } catch (e) {}
        return true;
    },

    // 10. 조회수 증가
    async incrementView(supabase, postId) {
        if (supabase) {
            try {
                await supabase.rpc('increment_post_views', { target_post_id: postId });
            } catch (e) {}
        }
        const posts = getLocalPosts();
        const p = posts.find(item => item.id === postId);
        if (p) {
            p.view_count = (p.view_count || 0) + 1;
            saveLocalPosts(posts);
        }
    }
};
