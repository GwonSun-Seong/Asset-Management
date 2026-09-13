// badgeConstants.js - 커뮤니티 뱃지 및 세분화된 자산 티어 마일스톤 정의

// 1. 자산 티어 마일스톤 테이블 (1,000만원 미만 새싹부터 50억+ 초고액 자산가까지 10단계 세분화)
export const ASSET_TIER_TABLE = [
    { key: '50eok', label: '50억 클럽', icon: '👑', minNet: 500000, criteria: '순자산 50억원 이상' },
    { key: '30eok', label: '30억 클럽', icon: '🏆', minNet: 300000, criteria: '순자산 30억원 ~ 50억원' },
    { key: '10eok', label: '10억 클럽', icon: '🎖️', minNet: 100000, criteria: '순자산 10억원 ~ 30억원' },
    { key: '5eok', label: '5억 클럽', icon: '💎', minNet: 50000, criteria: '순자산 5억원 ~ 10억원' },
    { key: '3eok', label: '3억 클럽', icon: '🥇', minNet: 30000, criteria: '순자산 3억원 ~ 5억원' },
    { key: '1eok', label: '1억 클럽', icon: '🥈', minNet: 10000, criteria: '순자산 1억원 ~ 3억원' },
    { key: '5000man', label: '5천만 돌파', icon: '🥉', minNet: 5000, criteria: '순자산 5,000만원 ~ 1억원' },
    { key: '3000man', label: '3천만 달성', icon: '🌿', minNet: 3000, criteria: '순자산 3,000만원 ~ 5,000만원' },
    { key: '1000man', label: '1천만 도약', icon: '☘️', minNet: 1000, criteria: '순자산 1,000만원 ~ 3,000만원' },
    { key: 'seed', label: '새싹', icon: '🌱', minNet: 0, criteria: '순자산 1,000만원 미만' }
];

// 과거 레거시 티어 라벨 하위 호환 매핑
export const LEGACY_TIER_MAP = {
    '시드': '새싹',
    '브론즈': '5천만 돌파',
    '실버': '1억 클럽',
    '골드': '3억 클럽',
    '다이아몬드': '5억 클럽',
    '10억 클럽': '10억 클럽'
};

// 순자산(만원 단위) 기준 자산 티어 산출 함수
export function getTierByNetWorth(netWorthInManwon) {
    const net = Number(netWorthInManwon) || 0;
    for (const tier of ASSET_TIER_TABLE) {
        if (net >= tier.minNet) return tier;
    }
    return ASSET_TIER_TABLE[ASSET_TIER_TABLE.length - 1];
}

// 전체 티어 기준 호버 툴팁 텍스트
export const TIER_HOVER_TOOLTIP = [
    '📊 [자산 티어 마일스톤 기준]',
    ...ASSET_TIER_TABLE.map(t => `${t.icon} ${t.label}: ${t.criteria}`)
].join('\n');

// 커스텀 투자 페르소나 뱃지 정의 (실제 국내 투자자 성향 반영)
export const CUSTOM_BADGES = [
    { key: 'yolo', label: '욜로', icon: '🎉', desc: '현재의 라이프스타일과 행복 중시' },
    { key: 'beast', label: '야수의 심장', icon: '🦁', desc: '고수익 고위험! 과감하고 공격적인 투자' },
    { key: 'fire', label: '파이어족', icon: '🏃‍♂️', desc: '경제적 자유 및 조기은퇴 준비 집중' },
    { key: 'dividend', label: '배당 러버', icon: '💸', desc: '현금흐름 및 안정적인 배당주 투자 선호' },
    { key: 'investor', label: '가치 투자자', icon: '📈', desc: '장기적 기업 가치와 스노우볼 복리 추구' },
    { key: 'realestate', label: '부동산 헌터', icon: '🏠', desc: '실거주 및 부동산 입지 투자 집중' },
    { key: 'crypto', label: '크립토 야수', icon: '🪙', desc: '가상자산 및 웹3 미래 투자' },
    { key: 'ant', label: '슈퍼 개미', icon: '🐜', desc: '지치지 않는 끈기로 시장을 이기는 개미' },
    { key: 'saver', label: '짠테크 달인', icon: '💰', desc: '철저한 지출 통제와 저축으로 시드 형성' },
    { key: 'allweather', label: '올웨더 배분', icon: '🛡️', desc: '자산배분과 리스크 헷지로 안정적 우상향' },
    { key: 'beginner', label: '초보 투자자', icon: '🌱', desc: '성실히 자산을 불려가는 단계' },
    { key: 'none', label: '뱃지 미표시', icon: '🚫', desc: '게시글과 댓글에서 뱃지를 노출하지 않음' }
];

// 뱃지 메타 매핑 헬퍼
export const BADGE_META_MAP = CUSTOM_BADGES.reduce((acc, b) => {
    acc[b.key] = { label: b.label, icon: b.icon, desc: b.desc };
    return acc;
}, {});

// 뱃지 표시 정보 계산 헬퍼 함수 (게시글, 댓글, 답글 공통 적용)
export function renderBadgeInfo(selectedBadge, authorProfile = null, snapshot = null) {
    // 뱃지 키 결정 (명시된 selectedBadge -> 프로필 selected_badge -> 기본값 'tier')
    const activeBadgeKey = selectedBadge || authorProfile?.selected_badge || 'tier';
    if (activeBadgeKey === 'none') return null;

    if (activeBadgeKey === 'tier') {
        // 🛡️ 금액 비공개(ratio) 모드이거나 hide_tier_badge인 경우 자산 티어 뱃지 노출 원천 차단
        if (snapshot?.hide_tier_badge || snapshot?.display_mode === 'ratio' || authorProfile?.hide_tier_badge) {
            return null;
        }

        let rawLabel = snapshot?.tier_label?.replace(/\s*\(.*?\)/g, '') || authorProfile?.tier_label;
        let tierIcon = snapshot?.tier_badge || authorProfile?.tier_badge;

        // 과거 레거시 라벨 변환 (예: '시드' -> '새싹', '실버' -> '1억 클럽')
        if (rawLabel && LEGACY_TIER_MAP[rawLabel]) {
            rawLabel = LEGACY_TIER_MAP[rawLabel];
        }

        // 라벨이 없지만 스냅샷에 순자산 금액이 있는 경우 실시간 계산
        if (!rawLabel && snapshot?.total_net_worth !== undefined && snapshot?.total_net_worth !== null) {
            const calculated = getTierByNetWorth(snapshot.total_net_worth);
            rawLabel = calculated.label;
            tierIcon = tierIcon || calculated.icon;
        }

        // 프로필에도 없으면 기본 새싹 처리
        if (!rawLabel) {
            rawLabel = '새싹';
            tierIcon = tierIcon || '🌱';
        }

        const matchedTier = ASSET_TIER_TABLE.find(t => t.label === rawLabel || t.key === rawLabel) || {
            label: rawLabel,
            icon: tierIcon || '🌱',
            criteria: '자산 마일스톤 구간'
        };

        return {
            label: matchedTier.label,
            icon: matchedTier.icon || tierIcon || '🌱',
            tooltip: `${matchedTier.label} (${matchedTier.criteria})\n\n${TIER_HOVER_TOOLTIP}`
        };
    }

    const custom = BADGE_META_MAP[activeBadgeKey];
    if (custom) {
        return {
            label: custom.label,
            icon: custom.icon,
            tooltip: `${custom.icon} ${custom.label}: ${custom.desc}`
        };
    }

    return null;
}
