// ProfileSettingsModal.jsx - 커뮤니티 닉네임 및 대표 뱃지 설정 모달 (실시간 소급적용)
import React, { useState, useEffect, useMemo } from 'react';
import { communityService } from './communityService';
import { 
    getTierByNetWorth, 
    ASSET_TIER_TABLE, 
    TIER_HOVER_TOOLTIP, 
    CUSTOM_BADGES 
} from './badgeConstants';

export default function ProfileSettingsModal({
    isOpen,
    onClose,
    currentUser,
    userProfile,
    supabase,
    currentCalculation,
    currentAppData,
    onProfileUpdated,
    showToast
}) {
    const [nickname, setNickname] = useState('');
    const [selectedBadge, setSelectedBadge] = useState('tier');
    const [hideTierBadge, setHideTierBadge] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    // 사용자의 현재 순자산 기준 실제 티어 계산
    const userTier = useMemo(() => {
        const netWorth = currentCalculation?.currentNet || 0;
        return getTierByNetWorth(netWorth);
    }, [currentCalculation]);

    // 동적 뱃지 옵션 목록 (자산 티어는 사용자 자산에 맞는 티어 1개로 표시)
    const badgeOptions = useMemo(() => {
        return [
            {
                key: 'tier',
                label: userTier.label,
                desc: `내 자산 구간 (${userTier.criteria})`,
                icon: userTier.icon,
                isTier: true
            },
            ...CUSTOM_BADGES
        ];
    }, [userTier]);

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

    const currentNickname = userProfile?.nickname || currentUser?.full_name || currentUser?.email?.split('@')[0] || '';
    const isNicknameModified = nickname.trim() !== currentNickname;

    const handleSave = async (e) => {
        e.preventDefault();
        setErrorMsg(null);

        const trimmed = nickname.trim();
        if (isNicknameModified) {
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
                hide_tier_badge: hideTierBadge,
                tier_label: userTier.label,
                tier_badge: userTier.icon
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
                        </div>
                        <div className="relative">
                            <input 
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                maxLength={12}
                                placeholder="사용할 닉네임을 입력하세요 (2~12자)"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                            한글, 영문, 숫자, _, - 조합으로 2~12자까지 자유롭게 설정할 수 있습니다.
                        </p>
                    </div>

                    {/* 2. 대표 활동 뱃지 선택 (이전 게시글 실시간 소급적용) */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                <span>🏷️</span> 대표 활동 뱃지 선택
                            </label>
                            <span className="text-[10px] text-slate-400">
                                💡 티어에 마우스를 올리면 금액 기준 확인 가능
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {badgeOptions.map((opt) => {
                                const isSelected = selectedBadge === opt.key;
                                return (
                                    <div key={opt.key} className="relative group/badge">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedBadge(opt.key)}
                                            title={opt.isTier ? TIER_HOVER_TOOLTIP : `${opt.icon} ${opt.label}: ${opt.desc}`}
                                            className={`w-full p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                                                isSelected 
                                                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 ring-1 ring-indigo-600 shadow-xs' 
                                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                                            }`}
                                        >
                                            <span className="text-xl flex-shrink-0 mt-0.5">{opt.icon}</span>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                                                    <span className="flex items-center gap-1.5">
                                                        {opt.label}
                                                        {opt.isTier && (
                                                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60">
                                                                내 자산
                                                            </span>
                                                        )}
                                                    </span>
                                                    {isSelected && <span className="text-indigo-600 dark:text-indigo-400 font-black text-xs">✓</span>}
                                                </div>
                                                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                                                    {opt.desc}
                                                </div>
                                            </div>
                                        </button>

                                        {/* 자산 티어 뱃지인 경우 마우스 호버 시 전체 티어 구간 기준 팝업 노출 */}
                                        {opt.isTier && (
                                            <div className="absolute left-0 right-0 sm:left-auto sm:right-0 top-full mt-1 sm:w-72 p-3 bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white rounded-2xl shadow-2xl z-50 border border-slate-700 text-xs pointer-events-none opacity-0 group-hover/badge:opacity-100 transition-all duration-200">
                                                <div className="font-bold text-amber-300 mb-1.5 flex items-center justify-between text-[11px]">
                                                    <span className="flex items-center gap-1">📊 자산 티어 구간 기준</span>
                                                    <span className="text-[10px] text-slate-400 font-normal">순자산 기준</span>
                                                </div>
                                                <div className="space-y-1">
                                                    {ASSET_TIER_TABLE.map((t) => {
                                                        const isMyTier = t.key === userTier.key;
                                                        return (
                                                            <div key={t.key} className={`flex items-center justify-between px-2 py-1 rounded-lg text-[10px] ${
                                                                isMyTier 
                                                                    ? 'bg-indigo-600 text-white font-bold shadow-xs' 
                                                                    : 'text-slate-300 bg-slate-800/60'
                                                            }`}>
                                                                <span className="flex items-center gap-1.5">
                                                                    <span>{t.icon}</span>
                                                                    <span>{t.label}</span>
                                                                    {isMyTier && <span className="text-[9px] bg-amber-400 text-slate-900 font-black px-1 rounded-xs">내 등급</span>}
                                                                </span>
                                                                <span className="font-mono text-[10px] text-slate-200">{t.criteria.replace('순자산 ', '')}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div className="text-[10px] text-indigo-300 mt-2 border-t border-slate-700/80 pt-1.5 flex justify-between items-center">
                                                    <span>현재 내 티어:</span>
                                                    <span className="font-bold text-amber-300">{userTier.icon} {userTier.label}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
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
