// ProfileSettingsModal.jsx - 커뮤니티 닉네임(7일 쿨다운) 및 대표 뱃지 설정 모달 (실시간 소급적용)
import React, { useState, useEffect } from 'react';
import { communityService } from './communityService';

const BADGE_OPTIONS = [
    { key: 'tier', label: '자산 구간 티어', desc: '자산 규모에 따라 브론즈/실버/골드 등 자동 표시', icon: '🥇' },
    { key: 'fire', label: '파이어족', desc: '경제적 자유 및 조기은퇴 준비 집중', icon: '🏃‍♂️' },
    { key: 'dividend', label: '배당 러버', desc: '현금흐름 및 안정적인 배당주 투자 선호', icon: '💸' },
    { key: 'investor', label: '가치 투자자', desc: '장기적 기업 가치와 스노우볼 복리 추구', icon: '📈' },
    { key: 'beginner', label: '초보 투자자', desc: '성실히 자산을 불려가는 단계', icon: '🌱' },
    { key: 'none', label: '뱃지 미표시', desc: '게시글과 댓글에서 뱃지를 노출하지 않음', icon: '🚫' }
];

export default function ProfileSettingsModal({
    isOpen,
    onClose,
    currentUser,
    userProfile,
    supabase,
    onProfileUpdated,
    showToast
}) {
    const [nickname, setNickname] = useState('');
    const [selectedBadge, setSelectedBadge] = useState('tier');
    const [hideTierBadge, setHideTierBadge] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    // 초기값 세팅
    useEffect(() => {
        if (isOpen && currentUser) {
            setNickname(userProfile?.nickname || currentUser.full_name || currentUser.email?.split('@')[0] || '');
            setSelectedBadge(userProfile?.selected_badge || 'tier');
            setHideTierBadge(!!userProfile?.hide_tier_badge);
            setErrorMsg(null);
        }
    }, [isOpen, currentUser, userProfile]);

    if (!isOpen) return null;

    // 닉네임 변경 쿨다운 계산 (7일 = 604,800,000 ms)
    const lastUpdatedTime = userProfile?.nickname_updated_at ? new Date(userProfile.nickname_updated_at).getTime() : null;
    const diffDays = lastUpdatedTime ? (Date.now() - lastUpdatedTime) / (1000 * 60 * 60 * 24) : 999;
    const isCooldownActive = diffDays < 7;
    const remainDays = isCooldownActive ? Math.ceil(7 - diffDays) : 0;
    const currentNickname = userProfile?.nickname || currentUser?.full_name || currentUser?.email?.split('@')[0] || '';
    const isNicknameModified = nickname.trim() !== currentNickname;

    const handleSave = async (e) => {
        e.preventDefault();
        setErrorMsg(null);

        const trimmed = nickname.trim();
        if (isNicknameModified) {
            if (isCooldownActive) {
                setErrorMsg(`닉네임은 7일에 1회만 변경할 수 있습니다. (${remainDays}일 후 변경 가능)`);
                return;
            }
            if (trimmed.length < 2 || trimmed.length > 12) {
                setErrorMsg('닉네임은 2자 이상 12자 이하로 입력해주세요.');
                return;
            }
            if (!/^[a-zA-Z0-9가-힣_-]+$/.test(trimmed)) {
                setErrorMsg('닉네임에는 한글, 영문, 숫자, 언더바(_), 하이픈(-)만 사용할 수 있습니다.');
                return;
            }
        }

        setIsSaving(true);
        try {
            const updated = await communityService.updateUserProfile(supabase, currentUser.id, {
                nickname: isNicknameModified ? trimmed : undefined,
                selected_badge: selectedBadge,
                hide_tier_badge: hideTierBadge
            });

            if (onProfileUpdated) onProfileUpdated(updated);
            if (showToast) showToast('커뮤니티 프로필이 저장되었습니다. (이전 게시글 실시간 반영 완료)');
            onClose();
        } catch (err) {
            setErrorMsg(err.message || '프로필 저장에 실패했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[110] p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800 my-auto flex flex-col">
                
                {/* 헤더 */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/70 dark:bg-slate-850">
                    <div>
                        <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <span>⚙️</span> 프로필 & 활동 뱃지 설정
                        </h2>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            변경한 닉네임과 뱃지는 작성하신 모든 이전 글과 댓글에 즉시 반영됩니다.
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold transition-all"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-5">
                    {/* 에러 메시지 알림 */}
                    {errorMsg && (
                        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                            <span>⚠️</span> {errorMsg}
                        </div>
                    )}

                    {/* 1. 커뮤니티 활동 닉네임 설정 */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                <span>✏️</span> 커뮤니티 닉네임
                            </label>
                            {isCooldownActive && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                    ⏳ 변경 대기 중 ({remainDays}일 남음)
                                </span>
                            )}
                        </div>
                        <div className="relative">
                            <input 
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                disabled={isCooldownActive}
                                maxLength={12}
                                placeholder="사용할 닉네임을 입력하세요 (2~12자)"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-850"
                            />
                            {isCooldownActive && (
                                <span className="absolute right-3 top-2.5 text-xs text-slate-400" title="쿨다운 활성">
                                    🔒
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                            {isCooldownActive 
                                ? `최근 닉네임을 변경하셨습니다. 7일에 1회만 변경 가능합니다. (다음 변경 가능: ${remainDays}일 후)`
                                : '한글, 영문, 숫자, _, - 2~12자 입력 가능하며 변경 후 7일간 유지됩니다.'}
                        </p>
                    </div>

                    {/* 2. 대표 활동 뱃지 선택 (이전 게시글 실시간 소급적용) */}
                    <div>
                        <label className="block text-xs font-black text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                            <span>🏷️</span> 대표 활동 뱃지 선택
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {BADGE_OPTIONS.map((opt) => {
                                const isSelected = selectedBadge === opt.key;
                                return (
                                    <button
                                        key={opt.key}
                                        type="button"
                                        onClick={() => setSelectedBadge(opt.key)}
                                        className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                                            isSelected 
                                                ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 ring-1 ring-indigo-600' 
                                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                                        }`}
                                    >
                                        <span className="text-xl flex-shrink-0 mt-0.5">{opt.icon}</span>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                                                <span>{opt.label}</span>
                                                {isSelected && <span className="text-indigo-600 text-xs">✓</span>}
                                            </div>
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                                                {opt.desc}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 3. 자산 비공개 시 금액 유출 방지 옵션 */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                        <label className="flex items-start gap-2.5 cursor-pointer select-none">
                            <input 
                                type="checkbox"
                                checked={hideTierBadge}
                                onChange={(e) => setHideTierBadge(e.target.checked)}
                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 mt-0.5"
                            />
                            <div>
                                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                    금액 비공개(비율 모드) 시 자산 등급 뱃지 완전히 가리기
                                </span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug block mt-0.5">
                                    비율만 공개할 때 '실버', '골드' 등 자산 구간 뱃지까지 완전히 숨겨 자산 규모 유추를 원천 차단합니다.
                                </span>
                            </div>
                        </label>
                    </div>

                    {/* 버튼 영역 */}
                    <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 shadow-xs cursor-pointer"
                        >
                            {isSaving ? '저장 중...' : '설정 저장 (소급적용)'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
