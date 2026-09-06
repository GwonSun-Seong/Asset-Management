// PostWriteModal.jsx - 커뮤니티 글쓰기 모달 (실자산 인증 스냅샷 포함)
import React, { useState } from 'react';
import AssetFlexCard from './AssetFlexCard';

export default function PostWriteModal({ 
    isOpen, 
    onClose, 
    onSubmit, 
    currentUser, 
    isAdmin = false,
    currentAppData = null,
    currentCalculation = null
}) {
    if (!isOpen) return null;

    const [category, setCategory] = useState('free'); // 'free' | 'finance'
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState([]);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isNotice, setIsNotice] = useState(false);

    // 실자산 포트폴리오 인증 스냅샷 첨부 상태
    const [attachAssetSnapshot, setAttachAssetSnapshot] = useState(false);
    const [flexDisplayMode, setFlexDisplayMode] = useState('amount'); // 'amount' | 'percent'
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 현재 사용자의 실제 데이터 기반으로 생성되는 자산 스냅샷 계산
    const generateSnapshotFromUserData = () => {
        if (!currentAppData || !currentCalculation) return null;

        const netWorth = currentCalculation.currentNet || 0; // 만원 단위
        let tierLabel = '시드 자산가';
        let tierBadge = '🌱';

        if (netWorth >= 100000) { // 10억 이상
            tierLabel = '10억 클럽 (초고자산가)';
            tierBadge = '👑';
        } else if (netWorth >= 50000) { // 5억~10억
            tierLabel = '다이아몬드 (5억 이상)';
            tierBadge = '💎';
        } else if (netWorth >= 30000) { // 3억~5억
            tierLabel = '골드 (3억 이상)';
            tierBadge = '🥇';
        } else if (netWorth >= 10000) { // 1억~3억
            tierLabel = '실버 (1억 이상)';
            tierBadge = '🥈';
        } else if (netWorth >= 5000) { // 5천만~1억
            tierLabel = '브론즈 (5천만 이상)';
            tierBadge = '🥉';
        }

        // 섹터별 비중 산출
        const assets = currentAppData.assets || {};
        const sectorLabels = {
            stock: '주식',
            deposit: '현금/예적금',
            crypto: '가상자산',
            realEstate: '부동산',
            pension: '연금/퇴직',
            other: '기타'
        };
        const sectorColors = {
            stock: '#3B82F6',
            deposit: '#10B981',
            crypto: '#F59E0B',
            realEstate: '#8B5CF6',
            pension: '#EC4899',
            other: '#6B7280'
        };

        let grossTotal = 0;
        const sectorTotals = {};
        Object.keys(assets).forEach(sec => {
            if (sec === 'loan') return;
            const sum = (assets[sec] || []).reduce((acc, a) => acc + Number(a.amount || 0), 0);
            sectorTotals[sec] = sum;
            grossTotal += sum;
        });

        const portfolioShares = Object.keys(sectorTotals)
            .filter(sec => sectorTotals[sec] > 0)
            .map(sec => ({
                sector: sec,
                label: sectorLabels[sec] || sec,
                ratio: grossTotal > 0 ? Math.round((sectorTotals[sec] / grossTotal) * 100) : 0,
                color: sectorColors[sec] || '#3B82F6'
            }))
            .sort((a, b) => b.ratio - a.ratio);

        // 상위 보유 종목 추출
        const allItems = [];
        Object.keys(assets).forEach(sec => {
            if (sec === 'loan') return;
            (assets[sec] || []).forEach(a => {
                if (Number(a.amount || 0) > 0) {
                    allItems.push({
                        name: a.name,
                        amount: Number(a.amount || 0),
                        rate: typeof a.rate === 'number' ? a.rate : 0
                    });
                }
            });
        });
        allItems.sort((a, b) => b.amount - a.amount);
        const topHoldings = allItems.slice(0, 4).map(item => ({
            name: item.name,
            ratio: grossTotal > 0 ? Math.round((item.amount / grossTotal) * 100) : 0,
            rate: item.rate
        }));

        const now = new Date();
        const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

        return {
            verified: true,
            snapshot_date: dateStr,
            tier_label: tierLabel,
            tier_badge: tierBadge,
            display_mode: flexDisplayMode,
            total_net_worth: flexDisplayMode === 'amount' ? netWorth : null,
            portfolio_shares: portfolioShares,
            top_holdings: topHoldings,
            capital_yield: currentCalculation.growthRate ? parseFloat(currentCalculation.growthRate.toFixed(1)) : null
        };
    };

    const currentSnapshot = attachAssetSnapshot ? generateSnapshotFromUserData() : null;

    // 태그 입력 핸들러
    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
            e.preventDefault();
            const trimmed = tagInput.trim().replace(/^#/, '');
            if (trimmed && !tags.includes(trimmed) && tags.length < 3) {
                setTags([...tags, trimmed]);
                setTagInput('');
            }
        }
    };

    const removeTag = (index) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    // 서식 툴바 마크다운 삽입 헬퍼
    const insertFormat = (prefix, suffix = prefix) => {
        const textarea = document.getElementById('post-content-textarea');
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = content.substring(start, end);
        const replacement = prefix + (selected || '텍스트') + suffix;
        const nextContent = content.substring(0, start) + replacement + content.substring(end);
        setContent(nextContent);
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected ? selected.length : 3));
        }, 10);
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            alert('제목을 입력해주세요.');
            return;
        }
        if (!content.trim()) {
            alert('내용을 입력해주세요.');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                category,
                title: title.trim(),
                content: content.trim(),
                tags,
                is_notice: isAdmin ? isNotice : false,
                is_anonymous: isAnonymous,
                asset_snapshot: attachAssetSnapshot ? currentSnapshot : null
            });
            onClose();
        } catch (err) {
            alert(err.message || '게시글 등록에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 dark:border-slate-800 my-auto flex flex-col max-h-[92vh]">
                
                {/* 헤더 */}
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                        글쓰기
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg p-1"
                    >
                        ✕
                    </button>
                </div>

                {/* 바디 폼 (스크롤 영역) */}
                <div className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
                    {/* 1. 주제 선택 */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                            주제 선택
                        </label>
                        <div className="flex gap-2">
                            {[
                                { id: 'free', label: '자유주제' },
                                { id: 'finance', label: '재테크' }
                            ].map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setCategory(cat.id)}
                                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-black transition-all ${
                                        category === cat.id
                                            ? 'bg-teal-700 text-white shadow-sm ring-2 ring-teal-500/20'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 2. 제목 입력 */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400">제목</label>
                            <span className="text-[10px] text-slate-400 font-mono">{title.length}/100</span>
                        </div>
                        <input 
                            type="text"
                            maxLength={100}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="제목을 입력하세요"
                            className="w-full px-4 py-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm sm:text-base font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition-all"
                        />
                    </div>

                    {/* 3. 본문 에디터 (서식 툴바 + 텍스트에어리어) */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400">내용</label>
                            <span className="text-[10px] text-slate-400 font-mono">{content.length}/5,000</span>
                        </div>
                        <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-teal-600/30 focus-within:border-teal-600 transition-all">
                            {/* 서식 툴바 (B, I, U, S, T, H, quote, link, code) */}
                            <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs">
                                <button type="button" onClick={() => insertFormat('**')} className="w-7 h-7 rounded hover:bg-slate-200 dark:hover:bg-slate-700 font-black" title="굵게">B</button>
                                <button type="button" onClick={() => insertFormat('*')} className="w-7 h-7 rounded hover:bg-slate-200 dark:hover:bg-slate-700 italic font-serif" title="기울임">I</button>
                                <button type="button" onClick={() => insertFormat('<u>', '</u>')} className="w-7 h-7 rounded hover:bg-slate-200 dark:hover:bg-slate-700 underline" title="밑줄">U</button>
                                <button type="button" onClick={() => insertFormat('~~')} className="w-7 h-7 rounded hover:bg-slate-200 dark:hover:bg-slate-700 line-through" title="취소선">S</button>
                                <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></span>
                                <button type="button" onClick={() => insertFormat('### ')} className="px-1.5 h-7 rounded hover:bg-slate-200 dark:hover:bg-slate-700 font-bold" title="제목 (소제목)">H</button>
                                <button type="button" onClick={() => insertFormat('> ')} className="w-7 h-7 rounded hover:bg-slate-200 dark:hover:bg-slate-700 font-serif" title="인용문">“</button>
                                <button type="button" onClick={() => insertFormat('[링크텍스트](', ')')} className="w-7 h-7 rounded hover:bg-slate-200 dark:hover:bg-slate-700" title="링크">🔗</button>
                                <button type="button" onClick={() => insertFormat('`')} className="px-1.5 h-7 rounded hover:bg-slate-200 dark:hover:bg-slate-700 font-mono" title="코드">&lt;/&gt;</button>
                            </div>

                            <textarea
                                id="post-content-textarea"
                                rows={8}
                                maxLength={5000}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="내용을 입력하세요"
                                className="w-full p-4 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed"
                            />
                        </div>
                    </div>

                    {/* 4. 태그 입력 */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                태그 <span className="font-normal text-[11px] text-slate-400">· 최대 3개 · Enter 또는 스페이스로 추가</span>
                            </label>
                            <span className="text-[10px] text-slate-400 font-mono">{tags.length}/3</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl min-h-[46px]">
                            {tags.map((tag, idx) => (
                                <span key={idx} className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs px-2.5 py-1 rounded-xl flex items-center gap-1 font-bold">
                                    #{tag}
                                    <button type="button" onClick={() => removeTag(idx)} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
                                </span>
                            ))}
                            {tags.length < 3 && (
                                <input 
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                    placeholder={tags.length === 0 ? "예: SCHD, 069500" : "태그 입력"}
                                    className="flex-1 min-w-[120px] bg-transparent border-none text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none px-1"
                                />
                            )}
                        </div>
                    </div>

                    {/* 5. 💎 실자산 포트폴리오 인증 첨부 섹션 */}
                    <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input 
                                    type="checkbox"
                                    checked={attachAssetSnapshot}
                                    onChange={(e) => setAttachAssetSnapshot(e.target.checked)}
                                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-xs sm:text-sm font-black text-indigo-900 dark:text-indigo-200 flex items-center gap-1">
                                    <span>💎</span> 내 자산 포트폴리오 인증 첨부 (공식 데이터)
                                </span>
                            </label>
                            {attachAssetSnapshot && (
                                <div className="flex bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold">
                                    <button 
                                        type="button" 
                                        onClick={() => setFlexDisplayMode('amount')} 
                                        className={`px-2 py-1 rounded transition-all ${flexDisplayMode === 'amount' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500'}`}
                                    >
                                        금액 공개
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setFlexDisplayMode('percent')} 
                                        className={`px-2 py-1 rounded transition-all ${flexDisplayMode === 'percent' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500'}`}
                                    >
                                        금액 비공개(비중만)
                                    </button>
                                </div>
                            )}
                        </div>

                        {attachAssetSnapshot && (
                            <div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                                    현재 대시보드에 입력된 순자산 및 포트폴리오 배분 구조가 위조 없는 불변 스냅샷으로 글에 함께 첨부됩니다.
                                </p>
                                {currentSnapshot && (
                                    <AssetFlexCard snapshot={currentSnapshot} compact={true} />
                                )}
                            </div>
                        )}
                    </div>

                    {/* 6. 옵션 (익명 작성, 관리자 공지) */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                                <input 
                                    type="checkbox"
                                    checked={isAnonymous}
                                    onChange={(e) => setIsAnonymous(e.target.checked)}
                                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                                />
                                <span>익명으로 작성 (닉네임 비공개)</span>
                            </label>

                            {isAdmin && (
                                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-black text-amber-600 dark:text-amber-400">
                                    <input 
                                        type="checkbox"
                                        checked={isNotice}
                                        onChange={(e) => setIsNotice(e.target.checked)}
                                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                                    />
                                    <span>📌 전체 공지사항으로 등록</span>
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                {/* 풋터 버튼 (시안 2 하단 매핑) */}
                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex items-center justify-between">
                    {/* 확장성 준비용 비활성 버튼 (사진/투표) */}
                    <div className="flex items-center gap-2">
                        <button 
                            type="button" 
                            disabled 
                            title="사진 첨부 기능은 추후 지원 예정입니다."
                            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 text-xs font-medium flex items-center gap-1.5 opacity-60 cursor-not-allowed"
                        >
                            <span>📷</span> 사진 추가 (0/3)
                        </button>
                        <button 
                            type="button" 
                            disabled 
                            title="투표 기능은 추후 지원 예정입니다."
                            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 text-xs font-medium flex items-center gap-1.5 opacity-60 cursor-not-allowed"
                        >
                            <span>🗳️</span> 투표 추가
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-bold transition-all"
                        >
                            취소
                        </button>
                        <button 
                            type="button"
                            disabled={isSubmitting}
                            onClick={handleSubmit}
                            className="px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs sm:text-sm font-black shadow-sm transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? '등록 중...' : '등록'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
