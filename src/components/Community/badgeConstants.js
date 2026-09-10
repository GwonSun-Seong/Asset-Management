// badgeConstants.js - 커뮤니티 뱃지 및 자산 티어 구간 정의

export const ASSET_TIER_TABLE = [
    { key: '10eok', label: '10억 클럽', icon: '👑', minNet: 100000, criteria: '순자산 10억원 이상' },
    { key: 'diamond', label: '다이아몬드', icon: '💎', minNet: 50000, criteria: '순자산 5억원 ~ 10억원' },
    { key: 'gold', label: '골드', icon: '🥇', minNet: 30000, criteria: '순자산 3억원 ~ 5억원' },
    { key: 'silver', label: '실버', icon: '🥈', minNet: 10000, criteria: '순자산 1억원 ~ 3억원' },
    { key: 'bronze', label: '브론즈', icon: '🥉', minNet: 5000, criteria: '순자산 5,000만원 ~ 1억원' },
    { key: 'seed', label: '시드', icon: '🌱', minNet: 0, criteria: '순자산 5,000만원 미만' }
];

export function getTierByNetWorth(netWorthInManwon) {
    const net = Number(netWorthInManwon) || 0;
    for (const tier of ASSET_TIER_TABLE) {
        if (net >= tier.minNet) return tier;
    }
    return ASSET_TIER_TABLE[ASSET_TIER_TABLE.length - 1];
}

// 전체 티어 기준 호버 툴팁 텍스트
export const TIER_HOVER_TOOLTIP = [
    '📊 [자산 티어 등급 기준]',
    ...ASSET_TIER_TABLE.map(t => `${t.icon} ${t.label}: ${t.criteria}`)
].join('\n');

// 커스텀 뱃지 정의
export const CUSTOM_BADGES = [
    { key: 'yolo', label: '욜로', icon: '🎉', desc: '현재의 라이프스타일과 행복 중시' },
    { key: 'beast', label: '야수의 심장', icon: '🦁', desc: '고수익 고위험! 과감하고 공격적인 투자' },
    { key: 'fire', label: '파이어족', icon: '🏃‍♂️', desc: '경제적 자유 및 조기은퇴 준비 집중' },
    { key: 'dividend', label: '배당 러버', icon: '💸', desc: '현금흐름 및 안정적인 배당주 투자 선호' },
    { key: 'investor', label: '가치 투자자', icon: '📈', desc: '장기적 기업 가치와 스노우볼 복리 추구' },
    { key: 'beginner', label: '초보 투자자', icon: '🌱', desc: '성실히 자산을 불려가는 단계' },
    { key: 'none', label: '뱃지 미표시', icon: '🚫', desc: '게시글과 댓글에서 뱃지를 노출하지 않음' }
];

// 뱃지 키 매핑 헬퍼
export const BADGE_META_MAP = {
    yolo: { label: '욜로', icon: '🎉', desc: '현재의 라이프스타일과 행복 중시' },
    beast: { label: '야수의 심장', icon: '🦁', desc: '고수익 고위험! 과감하고 공격적인 투자' },
    fire: { label: '파이어족', icon: '🏃‍♂️', desc: '경제적 자유 및 조기은퇴 준비 집중' },
    dividend: { label: '배당 러버', icon: '💸', desc: '현금흐름 및 안정적인 배당주 투자 선호' },
    investor: { label: '가치 투자', icon: '📈', desc: '장기적 기업 가치와 복리 추구' },
    beginner: { label: '초보 투자', icon: '🌱', desc: '성실히 자산을 불려가는 단계' }
};

// 뱃지 표시 헬퍼 함수
export function renderBadgeInfo(selectedBadge, authorProfile = null, snapshot = null) {
    if (!selectedBadge || selectedBadge === 'none') return null;

    if (selectedBadge === 'tier') {
        const tierLabel = snapshot?.tier_label?.replace(/\s*\(.*?\)/g, '') || authorProfile?.tier_label;
        const tierIcon = snapshot?.tier_badge || authorProfile?.tier_badge || '🥇';
        const matchedTier = ASSET_TIER_TABLE.find(t => t.label === tierLabel) || { criteria: '자산 구간 티어' };
        
        return {
            label: tierLabel || '티어 뱃지',
            icon: tierIcon,
            tooltip: `${tierLabel || '자산 티어'} (${matchedTier.criteria})\n\n${TIER_HOVER_TOOLTIP}`
        };
    }

    const custom = BADGE_META_MAP[selectedBadge];
    if (custom) {
        return {
            label: custom.label,
            icon: custom.icon,
            tooltip: `${custom.icon} ${custom.label}: ${custom.desc}`
        };
    }

    return null;
}
