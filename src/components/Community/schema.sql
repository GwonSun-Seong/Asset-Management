-- ==============================================================================
-- 🚀 Asset Planner Community Tables & Security Policies (Supabase SQL)
-- ==============================================================================

-- 1. community_posts 테이블 생성
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('free', 'finance')),
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    tags JSONB DEFAULT '[]'::jsonb,
    is_notice BOOLEAN DEFAULT false,
    is_anonymous BOOLEAN DEFAULT false,
    author_name VARCHAR(50) NOT NULL,
    author_email VARCHAR(100),
    asset_snapshot JSONB DEFAULT NULL,
    images JSONB DEFAULT '[]'::jsonb,  -- 추후 사진 업로드 확장용
    poll JSONB DEFAULT NULL,           -- 추후 투표 기능 확장용
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. community_post_likes 테이블 (1인 1좋아요)
CREATE TABLE IF NOT EXISTS public.community_post_likes (
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (post_id, user_id)
);

-- 3. community_comments 테이블 (댓글)
CREATE TABLE IF NOT EXISTS public.community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    author_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- ⚡ 인덱스 최적화
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_posts_notice_created ON public.community_posts (is_notice DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_like_count ON public.community_posts (like_count DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.community_posts (category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.community_comments (post_id, created_at ASC);

-- ==============================================================================
-- 🔄 좋아요 및 댓글 수 자동 집계 트리거 함수
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_community_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.community_posts
        SET like_count = like_count + 1
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.community_posts
        SET like_count = GREATEST(0, like_count - 1)
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_like_count ON public.community_post_likes;
CREATE TRIGGER trigger_update_like_count
AFTER INSERT OR DELETE ON public.community_post_likes
FOR EACH ROW EXECUTE FUNCTION public.handle_community_like_count();

CREATE OR REPLACE FUNCTION public.handle_community_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.community_posts
        SET comment_count = comment_count + 1
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.community_posts
        SET comment_count = GREATEST(0, comment_count - 1)
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_comment_count ON public.community_comments;
CREATE TRIGGER trigger_update_comment_count
AFTER INSERT OR DELETE ON public.community_comments
FOR EACH ROW EXECUTE FUNCTION public.handle_community_comment_count();

-- ==============================================================================
-- 🛡️ 보안 RLS (Row Level Security) 설정
-- ==============================================================================
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

-- 1. community_posts 정책
-- [조회]: 누구나 읽기 가능
DROP POLICY IF EXISTS "Anyone can view community posts" ON public.community_posts;
CREATE POLICY "Anyone can view community posts" ON public.community_posts
    FOR SELECT USING (true);

-- [작성]: 로그인된 사용자 본인 ID로만 작성 가능 (타인 사칭 원천 차단)
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.community_posts;
CREATE POLICY "Authenticated users can create posts" ON public.community_posts
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- [수정]: 작성자 본인만 수정 가능
DROP POLICY IF EXISTS "Users can update their own posts" ON public.community_posts;
CREATE POLICY "Users can update their own posts" ON public.community_posts
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);

-- [삭제]: 작성자 본인 또는 관리자(user_profiles.is_admin = true)만 삭제 가능
DROP POLICY IF EXISTS "Author or Admin can delete posts" ON public.community_posts;
CREATE POLICY "Author or Admin can delete posts" ON public.community_posts
    FOR DELETE TO authenticated
    USING (
        auth.uid() = user_id 
        OR EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 2. community_post_likes 정책
DROP POLICY IF EXISTS "Anyone can view likes" ON public.community_post_likes;
CREATE POLICY "Anyone can view likes" ON public.community_post_likes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can toggle like" ON public.community_post_likes;
CREATE POLICY "Authenticated users can toggle like" ON public.community_post_likes
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove their own like" ON public.community_post_likes;
CREATE POLICY "Users can remove their own like" ON public.community_post_likes
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- 3. community_comments 정책
DROP POLICY IF EXISTS "Anyone can view comments" ON public.community_comments;
CREATE POLICY "Anyone can view comments" ON public.community_comments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can add comments" ON public.community_comments;
CREATE POLICY "Authenticated users can add comments" ON public.community_comments
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Author or Admin can delete comments" ON public.community_comments;
CREATE POLICY "Author or Admin can delete comments" ON public.community_comments
    FOR DELETE TO authenticated
    USING (
        auth.uid() = user_id 
        OR EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 4. 조회수 증가 RPC 함수
CREATE OR REPLACE FUNCTION public.increment_post_views(target_post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.community_posts
    SET view_count = view_count + 1
    WHERE id = target_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 📷 커뮤니티 이미지 스토리지 버킷 및 보안 RLS 설정 (Supabase Storage)
-- ==============================================================================

-- 0. community_posts 테이블 images 컬럼 안전 추가 (기존 테이블 마이그레이션 대비)
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- 1. storage.buckets에 community-images 버킷 생성 (Public 버킷, 5MB 제한)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'community-images',
    'community-images',
    true,
    5242880, -- 파일당 최대 5MB (클라이언트에서 100~200KB로 압축 후 전송)
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 2. 스토리지 RLS 정책: 누구나 이미지 조회(다운로드) 가능
DROP POLICY IF EXISTS "Anyone can view community images" ON storage.objects;
CREATE POLICY "Anyone can view community images"
ON storage.objects FOR SELECT
USING (bucket_id = 'community-images');

-- 3. 스토리지 RLS 정책: 로그인된 인증 사용자는 본인 폴더(user_id/)에만 업로드 가능
DROP POLICY IF EXISTS "Authenticated users can upload community images" ON storage.objects;
CREATE POLICY "Authenticated users can upload community images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'community-images' 
    AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 4. 스토리지 RLS 정책: 본인이 올린 이미지만 삭제 가능
DROP POLICY IF EXISTS "Users can delete own community images" ON storage.objects;
CREATE POLICY "Users can delete own community images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'community-images' 
    AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- ==============================================================================
-- 👤 커뮤니티 사용자 닉네임 및 활동 뱃지 설정 (실시간 소급적용)
-- ==============================================================================

-- 1. user_profiles 테이블에 커뮤니티 전용 컬럼 추가
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS nickname VARCHAR(30),
ADD COLUMN IF NOT EXISTS nickname_updated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS selected_badge VARCHAR(30) DEFAULT 'tier',
ADD COLUMN IF NOT EXISTS hide_tier_badge BOOLEAN DEFAULT false;

-- 2. 커뮤니티 작성자 공개 프로필(닉네임, 뱃지) 조회 정책
-- 피드에서 모든 사용자의 게시글/댓글 작성자 닉네임 및 뱃지를 조회할 수 있어야 실시간 소급적용 가능
DROP POLICY IF EXISTS "Anyone can view user public profiles" ON public.user_profiles;
CREATE POLICY "Anyone can view user public profiles"
ON public.user_profiles FOR SELECT
USING (true);

-- 3. 본인 프로필 수정 정책 (본인 계정만 닉네임/뱃지 수정 가능)
DROP POLICY IF EXISTS "Users can update own community profile" ON public.user_profiles;
CREATE POLICY "Users can update own community profile"
ON public.user_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

