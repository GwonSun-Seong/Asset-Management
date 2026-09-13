import React, { useState, useEffect, useMemo, useRef } from 'react';

// 사전 정의된 프리셋 색상 팔레트
const PRESET_COLORS = [
    { label: '블루', color: '#3b82f6' },
    { label: '에메랄드', color: '#10b981' },
    { label: '앰버', color: '#f59e0b' },
    { label: '레드', color: '#ef4444' },
    { label: '퍼플', color: '#8b5cf6' },
    { label: '시안', color: '#06b6d4' },
    { label: '핑크', color: '#ec4899' },
    { label: '인디고', color: '#6366f1' },
];

// 자산 단위 포맷팅 헬퍼 (기본 단위: 만원)
export const formatMoney = (val, { showEok = true, showPlus = false } = {}) => {
    if (val === undefined || val === null || isNaN(val)) return '0원';
    const num = Math.round(Number(val));
    const sign = num > 0 && showPlus ? '+' : (num < 0 ? '-' : '');
    const absVal = Math.abs(num);

    if (absVal === 0) return '0원';
    
    if (showEok && absVal >= 10000) {
        const eok = Math.floor(absVal / 10000);
        const man = absVal % 10000;
        if (man === 0) return `${sign}${eok}억원`;
        return `${sign}${eok}억 ${man.toLocaleString()}만원`;
    }
    return `${sign}${absVal.toLocaleString()}만원`;
};

// 시나리오 요약 지표 계산 헬퍼 함수
const computeScenarioSummary = (scenario, calculateMonthlyProjection) => {
    if (!scenario || !scenario.data) {
        return { initialNet: 0, initialGross: 0, finalNet: 0, finalGross: 0, months: 12, growthRate: 0, monthlyNetChange: 0 };
    }
    const months = Number(scenario.data.projectionMonths) || 12;
    if (typeof calculateMonthlyProjection === 'function') {
        try {
            const result = calculateMonthlyProjection(scenario.data, months);
            const projections = result?.projections || [];
            if (projections.length > 0) {
                const pFirst = projections[0] || {};
                const pLast = projections[projections.length - 1] || {};
                const initialNet = pFirst.net || 0;
                const initialGross = pFirst.gross || 0;
                const finalNet = pLast.net || 0;
                const finalGross = pLast.gross || 0;
                const growthRate = initialNet > 0 ? ((finalNet - initialNet) / initialNet) * 100 : 0;
                const monthlyNetChange = months > 0 ? (finalNet - initialNet) / months : 0;
                return { initialNet, initialGross, finalNet, finalGross, months, growthRate, monthlyNetChange };
            }
        } catch (e) {
            console.error('Failed to calculate projection summary:', e);
        }
    }
    // Fallback if calculateMonthlyProjection is unavailable
    const assets = scenario.data.assets || {};
    let initialNet = 0;
    Object.keys(assets).forEach(sec => {
        (assets[sec] || []).forEach(item => {
            const amt = Number(item.amount) || 0;
            if (sec === 'loan') initialNet -= amt;
            else initialNet += amt;
        });
    });
    return { initialNet, initialGross: initialNet, finalNet: initialNet, finalGross: initialNet, months, growthRate: 0, monthlyNetChange: 0 };
};

export const SavedScenariosCarousel = ({ 
    scenarios = [], 
    onLoad, 
    onDelete, 
    onExport, 
    referenceScenarios = [], 
    onToggleReference, 
    onUpdateReferenceColor, 
    isPro, 
    onOpenProModal,
    onSaveCurrent,
    onRename,
    calculateMonthlyProjection
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [viewMode, setViewMode] = useState('carousel'); // 'carousel' | 'list'
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [colorPickerOpenId, setColorPickerOpenId] = useState(null);
    const colorPickerRef = useRef(null);

    useEffect(() => {
        if (currentIndex >= scenarios.length && scenarios.length > 0) {
            setCurrentIndex(scenarios.length - 1);
        }
    }, [scenarios.length, currentIndex]);

    // 외부 클릭 시 색상 피커 닫기
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (colorPickerRef.current && !colorPickerRef.current.contains(e.target)) {
                setColorPickerOpenId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 시나리오가 없을 때의 Empty State
    if (!scenarios || scenarios.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center shadow-xs">
                <div className="w-10 h-10 mx-auto mb-2.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-xl text-indigo-600 dark:text-indigo-400">
                    📁
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">저장된 시나리오가 없습니다</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-3">
                    현재 자산과 저축/투자 계획을 시나리오로 저장해 두면 다양한 상황을 손쉽게 비교할 수 있습니다.
                </p>
                {onSaveCurrent && (
                    <button
                        onClick={onSaveCurrent}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all active:scale-95"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                        현재 계획 시나리오로 저장
                    </button>
                )}
            </div>
        );
    }

    const safeIndex = currentIndex >= scenarios.length ? Math.max(0, scenarios.length - 1) : currentIndex;
    const current = scenarios[safeIndex];

    const prev = () => setCurrentIndex(p => (p === 0 ? scenarios.length - 1 : p - 1));
    const next = () => setCurrentIndex(p => (p === scenarios.length - 1 ? 0 : p + 1));

    const startEditing = (scenario) => {
        setEditingId(scenario.id);
        setEditingName(scenario.name);
    };

    const handleSaveRename = (id) => {
        if (onRename && editingName.trim()) {
            onRename(id, editingName.trim());
        }
        setEditingId(null);
    };

    const currentSummary = current ? computeScenarioSummary(current, calculateMonthlyProjection) : null;
    const currentRef = current ? referenceScenarios.find(r => r.id === current.id) : null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs overflow-hidden">
            {/* Header: Title, Count, View Mode Switcher */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 dark:border-gray-700/60 bg-gray-50/70 dark:bg-gray-800/80">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                        <span>📁</span> 저장된 시나리오 보관함
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.2 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                        {scenarios.length}개
                    </span>
                </div>
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700/60 p-0.5 rounded-lg text-xs">
                    <button
                        onClick={() => setViewMode('carousel')}
                        className={`px-2.5 py-0.8 rounded-md font-semibold text-xs transition-all ${
                            viewMode === 'carousel'
                                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-xs'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                        title="단일 카드 슬라이더"
                    >
                        슬라이더
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-2.5 py-0.8 rounded-md font-semibold text-xs transition-all ${
                            viewMode === 'list'
                                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-xs'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                        title="전체 카드 그리드 목록"
                    >
                        전체 목록 ({scenarios.length})
                    </button>
                </div>
            </div>

            {/* View Mode 1: Compact Horizontal Carousel */}
            {viewMode === 'carousel' && current && (
                <div className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Left: Scenario Selector & Name */}
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <button 
                                onClick={prev} 
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors shrink-0"
                                title="이전 시나리오"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                            </button>

                            <div className="min-w-0 flex-1">
                                {editingId === current.id ? (
                                    <div className="flex items-center gap-1.5">
                                        <input
                                            type="text"
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSaveRename(current.id);
                                                if (e.key === 'Escape') setEditingId(null);
                                            }}
                                            autoFocus
                                            className="text-sm font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-indigo-400 dark:border-indigo-500 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full"
                                        />
                                        <button 
                                            onClick={() => handleSaveRename(current.id)}
                                            className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded shrink-0"
                                            title="저장"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                        </button>
                                        <button 
                                            onClick={() => setEditingId(null)}
                                            className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded shrink-0"
                                            title="취소"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="group/title flex items-center gap-2">
                                        <h4 className="font-bold text-gray-900 dark:text-white text-base truncate" title={current.name}>
                                            {current.name}
                                        </h4>
                                        {onRename && (
                                            <button
                                                onClick={() => startEditing(current)}
                                                className="opacity-0 group-hover/title:opacity-100 p-0.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-opacity shrink-0"
                                                title="이름 수정"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            </button>
                                        )}
                                    </div>
                                )}
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[11px] text-gray-400 dark:text-gray-500">
                                        {new Date(current.createdAt).toLocaleDateString()} 저장 · {currentSummary?.months || 12}개월
                                    </span>
                                    {currentRef && (
                                        <span 
                                            className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold"
                                            style={{ backgroundColor: currentRef.color + '1A', color: currentRef.color, border: `1px solid ${currentRef.color}4D` }}
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentRef.color }}></span>
                                            차트 기준선 적용 중
                                        </span>
                                    )}
                                </div>
                            </div>

                            <button 
                                onClick={next} 
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors shrink-0"
                                title="다음 시나리오"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>

                        {/* Middle: Metric Summary Strip */}
                        {currentSummary && (
                            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/60 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-800 shrink-0">
                                <div className="text-center">
                                    <div className="text-[10px] font-medium text-gray-400 dark:text-gray-500">시작 순자산</div>
                                    <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                        {formatMoney(currentSummary.initialNet)}
                                    </div>
                                </div>
                                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700"></div>
                                <div className="text-center">
                                    <div className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                                        {currentSummary.months}개월 후 예상
                                    </div>
                                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                        {formatMoney(currentSummary.finalNet)}
                                    </div>
                                </div>
                                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700"></div>
                                <div className="text-center">
                                    <div className="text-[10px] font-medium text-gray-400 dark:text-gray-500">예상 증감률</div>
                                    <div className={`text-xs font-bold ${currentSummary.growthRate >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                                        {currentSummary.growthRate >= 0 ? '+' : ''}{currentSummary.growthRate.toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Right: Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                            <button 
                                onClick={() => onLoad(current)} 
                                className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                                title="현재 작업 화면으로 이 시나리오를 불러옵니다"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                                불러오기
                            </button>

                            {/* Reference Scenario Toggle & Color Picker */}
                            <div className="relative" ref={colorPickerRef}>
                                <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <button 
                                        onClick={() => isPro ? onToggleReference(current) : onOpenProModal()} 
                                        className={`py-1.5 px-2.5 text-xs font-bold transition-colors flex items-center gap-1 ${
                                            currentRef 
                                            ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' 
                                            : isPro 
                                                ? 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700' 
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500'
                                        }`}
                                        title={currentRef ? '메인 차트 기준선에서 제외' : '메인 차트 비교 기준선으로 설정'}
                                    >
                                        {currentRef && (
                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentRef.color }}></span>
                                        )}
                                        <span>{currentRef ? '기준선 해제' : (isPro ? '차트 기준선' : '🔒 기준선')}</span>
                                    </button>
                                    {currentRef && (
                                        <button
                                            onClick={() => setColorPickerOpenId(colorPickerOpenId === current.id ? null : current.id)}
                                            className="py-1.5 px-2 border-l border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            title="기준선 색상 선택"
                                        >
                                            <span className="block w-3 h-3 rounded-full border border-black/10 dark:border-white/20 shadow-xs" style={{ backgroundColor: currentRef.color }}></span>
                                        </button>
                                    )}
                                </div>

                                {/* Color Palette Popover */}
                                {colorPickerOpenId === current.id && currentRef && (
                                    <div className="absolute top-full right-0 mt-2 p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-30 w-44">
                                        <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-1.5">기준선 색상 선택</div>
                                        <div className="grid grid-cols-4 gap-1.5 mb-2">
                                            {PRESET_COLORS.map(p => (
                                                <button
                                                    key={p.color}
                                                    onClick={() => {
                                                        onUpdateReferenceColor(current.id, p.color);
                                                        setColorPickerOpenId(null);
                                                    }}
                                                    className={`w-7 h-7 rounded-full transition-transform hover:scale-110 flex items-center justify-center ${
                                                        currentRef.color.toLowerCase() === p.color.toLowerCase() ? 'ring-2 ring-offset-2 ring-indigo-500' : ''
                                                    }`}
                                                    style={{ backgroundColor: p.color }}
                                                    title={p.label}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-1.5 pt-1.5 border-t border-gray-100 dark:border-gray-700">
                                            <input
                                                type="color"
                                                value={currentRef.color}
                                                onChange={(e) => onUpdateReferenceColor(current.id, e.target.value)}
                                                className="w-6 h-6 p-0 border border-gray-200 dark:border-gray-600 rounded cursor-pointer"
                                                title="사용자 정의 색상"
                                            />
                                            <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400 uppercase">{currentRef.color}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {onExport && (
                                <button 
                                    onClick={() => onExport(current)} 
                                    className="p-1.5 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-xs transition-colors"
                                    title="시나리오 내보내기"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                </button>
                            )}

                            <button 
                                onClick={() => onDelete(current.id)} 
                                className="p-1.5 text-red-500 hover:text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-xs transition-colors"
                                title="시나리오 삭제"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Pagination Dots */}
                    <div className="mt-3 flex items-center justify-center gap-1.5">
                        {scenarios.length > 10 ? (
                            <div className="text-[10px] text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 rounded-full">
                                {safeIndex + 1} / {scenarios.length}
                            </div>
                        ) : (
                            scenarios.map((s, i) => (
                                <button
                                    key={s.id}
                                    onClick={() => setCurrentIndex(i)}
                                    className={`h-1.5 rounded-full transition-all ${
                                        i === safeIndex 
                                            ? 'w-5 bg-indigo-600 dark:bg-indigo-400' 
                                            : 'w-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                    title={s.name}
                                />
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* View Mode 2: Responsive Grid of Cards */}
            {viewMode === 'list' && (
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[420px] overflow-y-auto">
                    {scenarios.map((s, idx) => {
                        const sSummary = computeScenarioSummary(s, calculateMonthlyProjection);
                        const sRef = referenceScenarios.find(r => r.id === s.id);
                        const isCurrent = idx === safeIndex;

                        return (
                            <div 
                                key={s.id} 
                                className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                                    isCurrent 
                                        ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-700 ring-1 ring-indigo-500/20' 
                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/80 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-1.5 mb-1.5">
                                        <h5 className="text-xs font-bold text-gray-900 dark:text-white truncate flex-1" title={s.name}>
                                            {s.name}
                                        </h5>
                                        {sRef && (
                                            <span 
                                                className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold shrink-0"
                                                style={{ backgroundColor: sRef.color + '1A', color: sRef.color }}
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sRef.color }}></span>
                                                기준선
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-[10px] text-gray-400 dark:text-gray-500 mb-2">
                                        {new Date(s.createdAt).toLocaleDateString()} 저장 · {sSummary.months}개월
                                    </div>
                                    <div className="flex items-center justify-between text-xs py-1.5 px-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg mb-2">
                                        <span className="text-[11px] text-gray-500">예상 순자산:</span>
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                            {formatMoney(sSummary.finalNet)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-1 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                                    <button
                                        onClick={() => onLoad(s)}
                                        className="px-2 py-1 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
                                    >
                                        불러오기
                                    </button>
                                    <button
                                        onClick={() => isPro ? onToggleReference(s) : onOpenProModal()}
                                        className={`px-2 py-1 text-[10px] font-bold border rounded-md transition-colors ${
                                            sRef 
                                                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' 
                                                : 'text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        {sRef ? '해제' : '기준선'}
                                    </button>
                                    <button
                                        onClick={() => onDelete(s.id)}
                                        className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 rounded"
                                        title="삭제"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export const ScenarioCompare = ({ 
    scenarios = [], 
    sectorInfo = {}, 
    calculateMonthlyProjection
}) => {
    // 기본으로 상위 2개 시나리오를 선택
    const [selectedIds, setSelectedIds] = useState(() => {
        if (scenarios && scenarios.length >= 2) return [scenarios[0].id, scenarios[1].id];
        if (scenarios && scenarios.length === 1) return [scenarios[0].id];
        return [];
    });

    const [compareMode, setCompareMode] = useState('net'); // 'net' | 'gross'
    const [compareTab, setCompareTab] = useState('sector'); // 'sector' | 'monthly'
    const [monthlyInterval, setMonthlyInterval] = useState(3); // 1, 3, 6, 12개월 간격
    const [expandedSectors, setExpandedSectors] = useState({}); // 섹터 하위 항목 아코디언 토글 상태

    // 시나리오 목록 변경 시 유효한 ID만 필터링
    useEffect(() => {
        const validIds = selectedIds.filter(id => scenarios.some(s => s.id === id));
        if (validIds.length === 0 && scenarios.length >= 2) {
            setSelectedIds([scenarios[0].id, scenarios[1].id]);
        } else if (validIds.length === 0 && scenarios.length === 1) {
            setSelectedIds([scenarios[0].id]);
        } else if (validIds.length !== selectedIds.length) {
            setSelectedIds(validIds);
        }
    }, [scenarios]);

    const toggleScenario = (id) => {
        setSelectedIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(x => x !== id);
            } else {
                return prev.length < 3 ? [...prev, id] : prev;
            }
        });
    };

    const toggleSectorExpand = (sectorKey) => {
        setExpandedSectors(prev => ({
            ...prev,
            [sectorKey]: !prev[sectorKey]
        }));
    };

    const selected = scenarios.filter(s => selectedIds.includes(s.id)).slice(0, 3);

    const computeScenarioProjections = (scenarioData) => {
        if (!calculateMonthlyProjection || !scenarioData) return [];
        try {
            const tempAppData = { ...scenarioData };
            const result = calculateMonthlyProjection(tempAppData, scenarioData.projectionMonths || 12);
            return result?.projections || [];
        } catch (e) {
            console.error('Projection computation error:', e);
            return [];
        }
    };

    const results = useMemo(() => {
        return selected.map(s => ({
            id: s.id,
            name: s.name,
            data: s.data,
            projections: computeScenarioProjections(s.data)
        }));
    }, [selected, calculateMonthlyProjection]);

    // 월별 비교용 공통 월차 계산
    const allMonths = results.flatMap(r => r.projections.map(p => p.month));
    const uniqueMonths = [...new Set(allMonths)].sort((a, b) => a - b);
    const displayMonths = uniqueMonths.filter(m => m === 0 || m % monthlyInterval === 0 || m === uniqueMonths[uniqueMonths.length - 1]);

    const getMonthLabel = (monthIndex, baseMonthStr) => {
        try {
            const [y, m] = (baseMonthStr || new Date().toISOString().slice(0, 7)).split('-').map(Number);
            const d = new Date(y, m - 1 + monthIndex);
            return `${String(d.getFullYear()).slice(2)}년 ${String(d.getMonth() + 1).padStart(2, '0')}월`;
        } catch {
            return `${monthIndex}개월차`;
        }
    };

    // 2개 시나리오 선택 시 핵심 KPI 차이 계산
    const diffKpi = useMemo(() => {
        if (results.length !== 2) return null;
        const [a, b] = results;
        const finalA = a.projections[a.projections.length - 1] || {};
        const finalB = b.projections[b.projections.length - 1] || {};

        const netA = finalA.net || 0;
        const netB = finalB.net || 0;
        const diffNet = netB - netA;
        const diffNetRate = netA > 0 ? (diffNet / netA) * 100 : 0;

        const grossA = finalA.gross || 0;
        const grossB = finalB.gross || 0;
        const diffGross = grossB - grossA;

        const loanA = finalA.sectorTotals?.loan?.amount || 0;
        const loanB = finalB.sectorTotals?.loan?.amount || 0;
        const diffLoan = loanB - loanA;

        const monthsA = a.data?.projectionMonths || 12;
        const monthsB = b.data?.projectionMonths || 12;
        const maxMonths = Math.max(monthsA, monthsB);
        const monthlyPaceDiff = maxMonths > 0 ? diffNet / maxMonths : 0;

        return {
            nameA: a.name,
            nameB: b.name,
            netA, netB, diffNet, diffNetRate,
            grossA, grossB, diffGross,
            loanA, loanB, diffLoan,
            monthlyPaceDiff,
            months: maxMonths
        };
    }, [results]);

    // 시나리오 선택 뱃지 색상 매핑
    const SCENARIO_TAG_COLORS = [
        { label: '기준 (A)', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-400 dark:border-blue-800' },
        { label: '비교 (B)', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-400 dark:border-emerald-800' },
        { label: '비교 (C)', badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-400 dark:border-purple-800' },
    ];

    return (
        <div className="space-y-4">
            {/* Top Control Bar: Dedicated Two-Zone Layout */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-xs">
                {/* Row 1: Section Title & Mode Switchers */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-gray-100 dark:border-gray-700/60">
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                            <span>⚖️</span> 시나리오 차이 분석
                            <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">
                                (비교할 시나리오를 아래에서 2~3개 선택하세요)
                            </span>
                        </h4>
                    </div>

                    {/* Dedicated Switchers on Top-Right */}
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Net vs Gross Switch */}
                        <div className="flex items-center bg-gray-100 dark:bg-gray-700/60 p-0.5 rounded-lg text-xs font-bold">
                            <button
                                onClick={() => setCompareMode('net')}
                                className={`px-2.5 py-1 rounded-md transition-all ${
                                    compareMode === 'net' 
                                        ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow-xs' 
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                순자산 기준
                            </button>
                            <button
                                onClick={() => setCompareMode('gross')}
                                className={`px-2.5 py-1 rounded-md transition-all ${
                                    compareMode === 'gross' 
                                        ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow-xs' 
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                총자산 기준
                            </button>
                        </div>

                        {/* Sector vs Monthly View Switch */}
                        <div className="flex items-center bg-gray-100 dark:bg-gray-700/60 p-0.5 rounded-lg text-xs font-bold">
                            <button
                                onClick={() => setCompareTab('sector')}
                                className={`px-2.5 py-1 rounded-md transition-all ${
                                    compareTab === 'sector' 
                                        ? 'bg-indigo-600 text-white shadow-xs' 
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                📊 섹터별 상세
                            </button>
                            <button
                                onClick={() => setCompareTab('monthly')}
                                className={`px-2.5 py-1 rounded-md transition-all ${
                                    compareTab === 'monthly' 
                                        ? 'bg-indigo-600 text-white shadow-xs' 
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                📅 월별 추이
                            </button>
                        </div>
                    </div>
                </div>

                {/* Row 2: Uniform Single-Line Scenario Selection Chips */}
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 shrink-0">선택 ({selectedIds.length}/3):</span>
                    {scenarios.map(s => {
                        const selectedIdx = selectedIds.indexOf(s.id);
                        const isSelected = selectedIdx !== -1;
                        const tagInfo = isSelected ? SCENARIO_TAG_COLORS[selectedIdx] : null;

                        return (
                            <button
                                key={s.id}
                                onClick={() => toggleScenario(s.id)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border max-w-[200px] sm:max-w-[260px] ${
                                    isSelected 
                                        ? tagInfo.badge + ' shadow-xs ring-1 ring-indigo-500/20' 
                                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                                title={s.name}
                            >
                                {isSelected && (
                                    <span className="text-[10px] font-black shrink-0">{tagInfo.label}</span>
                                )}
                                <span className="truncate">{s.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 2개 시나리오 선택 시 핵심 차이 요약 KPI 카드 대시보드 */}
            {diffKpi && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* KPI 1: 최종 순자산 격차 */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3.5 shadow-xs">
                        <div className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 mb-1">
                            최종 순자산 격차 (B - A)
                        </div>
                        <div className={`text-base sm:text-lg font-black truncate ${diffKpi.diffNet >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            {formatMoney(diffKpi.diffNet, { showPlus: true })}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                            <span className={`inline-block text-[10px] font-black px-1.5 py-0.2 rounded ${
                                diffKpi.diffNet >= 0 
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' 
                                    : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                            }`}>
                                {diffKpi.diffNetRate >= 0 ? '+' : ''}{diffKpi.diffNetRate.toFixed(1)}%
                            </span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                                {diffKpi.diffNet >= 0 ? '시나리오 B 우세' : '시나리오 A 우세'}
                            </span>
                        </div>
                    </div>

                    {/* KPI 2: 총자산 격차 */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3.5 shadow-xs">
                        <div className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 mb-1">
                            최종 총자산 격차
                        </div>
                        <div className={`text-base sm:text-lg font-black truncate ${diffKpi.diffGross >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}>
                            {formatMoney(diffKpi.diffGross, { showPlus: true })}
                        </div>
                        <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 truncate" title={`A: ${formatMoney(diffKpi.grossA)} → B: ${formatMoney(diffKpi.grossB)}`}>
                            A: {formatMoney(diffKpi.grossA)} → B: {formatMoney(diffKpi.grossB)}
                        </div>
                    </div>

                    {/* KPI 3: 부채(대출) 격차 */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3.5 shadow-xs">
                        <div className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 mb-1">
                            부채(대출) 격차
                        </div>
                        <div className={`text-base sm:text-lg font-black truncate ${diffKpi.diffLoan <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            {formatMoney(diffKpi.diffLoan, { showPlus: true })}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                            <span className={`inline-block text-[10px] font-black px-1.5 py-0.2 rounded ${
                                diffKpi.diffLoan <= 0 
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' 
                                    : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                            }`}>
                                {diffKpi.diffLoan < 0 ? '부채 절감 효과' : (diffKpi.diffLoan === 0 ? '부채 변동 없음' : '부채 증가')}
                            </span>
                        </div>
                    </div>

                    {/* KPI 4: 월평균 자산 증식 속도 차이 */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3.5 shadow-xs">
                        <div className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 mb-1">
                            월평균 추가 증식 속도
                        </div>
                        <div className={`text-base sm:text-lg font-black truncate ${diffKpi.monthlyPaceDiff >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                            {formatMoney(diffKpi.monthlyPaceDiff, { showPlus: true })}/월
                        </div>
                        <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5">
                            {diffKpi.months}개월 동안 누적 반영 기준
                        </div>
                    </div>
                </div>
            )}

            {/* Detailed Content (Full-Width Tables) */}
            {results.length > 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xs">
                    {/* Tab 1: Sector Breakdown Comparison */}
                    {compareTab === 'sector' && (
                        <div className="w-full">
                            <table className="w-full text-xs text-left table-fixed">
                                <thead>
                                    <tr className="bg-gray-50/80 dark:bg-gray-900/60 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                        <th className="py-3 px-4 font-bold w-[28%]">섹터 및 세부 항목</th>
                                        {results.map((r, idx) => (
                                            <th key={r.id} className="py-3 px-4 text-right font-bold w-[24%]">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${SCENARIO_TAG_COLORS[idx]?.badge}`}>
                                                        {SCENARIO_TAG_COLORS[idx]?.label}
                                                    </span>
                                                    <span className="text-gray-900 dark:text-white truncate" title={r.name}>{r.name}</span>
                                                </div>
                                            </th>
                                        ))}
                                        {results.length === 2 && (
                                            <th className="py-3 px-4 text-right font-bold text-indigo-700 dark:text-indigo-400 w-[24%]">
                                                격차 (B - A)
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {Object.keys(sectorInfo).map(sectorKey => {
                                        const isExpanded = !!expandedSectors[sectorKey];
                                        return (
                                            <React.Fragment key={sectorKey}>
                                                {/* Sector Parent Row */}
                                                <tr className="hover:bg-gray-50/60 dark:hover:bg-gray-700/30 transition-colors">
                                                    <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                                                        <button 
                                                            onClick={() => toggleSectorExpand(sectorKey)} 
                                                            className="inline-flex items-center gap-1.5 text-left group w-full"
                                                            title="세부 항목 펼치기/접기"
                                                        >
                                                            <span className="text-xs text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 w-3 shrink-0">
                                                                {isExpanded ? '▼' : '▶'}
                                                            </span>
                                                            <span className="mr-0.5 shrink-0">{sectorInfo[sectorKey]?.icon}</span>
                                                            <span className="truncate">{sectorInfo[sectorKey]?.name || sectorKey}</span>
                                                        </button>
                                                    </td>
                                                    {results.map(r => {
                                                        const finalProjection = r.projections[r.projections.length - 1];
                                                        const sectorTotal = finalProjection?.sectorTotals?.[sectorKey] || { amount: 0, percentage: 0 };
                                                        return (
                                                            <td key={r.id} className="py-3 px-4 text-right font-semibold text-gray-800 dark:text-gray-200">
                                                                <div>{formatMoney(sectorTotal.amount)}</div>
                                                                <div className="text-[10px] text-gray-400 font-normal">
                                                                    {(sectorTotal.percentage || 0).toFixed(1)}%
                                                                </div>
                                                            </td>
                                                        );
                                                    })}
                                                    {results.length === 2 && (
                                                        <td className="py-3 px-4 text-right">
                                                            {(() => {
                                                                const finalA = results[0].projections[results[0].projections.length - 1];
                                                                const finalB = results[1].projections[results[1].projections.length - 1];
                                                                const amountA = finalA?.sectorTotals?.[sectorKey]?.amount || 0;
                                                                const amountB = finalB?.sectorTotals?.[sectorKey]?.amount || 0;
                                                                const percentA = finalA?.sectorTotals?.[sectorKey]?.percentage || 0;
                                                                const percentB = finalB?.sectorTotals?.[sectorKey]?.percentage || 0;
                                                                const diffAmount = amountB - amountA;
                                                                const diffPercent = percentB - percentA;
                                                                const signPercent = diffPercent >= 0 ? '+' : '';
                                                                const isGood = sectorKey === 'loan' ? diffAmount <= 0 : diffAmount >= 0;
                                                                const textColor = isGood ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';

                                                                return (
                                                                    <div className={textColor}>
                                                                        <div className="font-bold">{formatMoney(diffAmount, { showPlus: true })}</div>
                                                                        <div className="text-[10px] font-medium opacity-80">
                                                                            ({signPercent}{diffPercent.toFixed(1)}%p)
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </td>
                                                    )}
                                                </tr>

                                                {/* Sub-items (when expanded) */}
                                                {isExpanded && (() => {
                                                    const allItems = new Map();
                                                    results.forEach(r => {
                                                        const finalProjection = r.projections[r.projections.length - 1];
                                                        finalProjection?.itemTotals?.[sectorKey]?.forEach(item => {
                                                            const key = item.id || item.name;
                                                            if (!allItems.has(key)) {
                                                                allItems.set(key, { name: item.name });
                                                            }
                                                        });
                                                    });
                                                    const itemsList = Array.from(allItems.entries());
                                                    if (itemsList.length === 0) {
                                                        return (
                                                            <tr key={`${sectorKey}-empty`} className="bg-gray-50/40 dark:bg-gray-900/30">
                                                                <td colSpan={results.length + (results.length === 2 ? 2 : 1)} className="py-2 px-8 text-gray-400 italic">
                                                                    등록된 세부 항목이 없습니다.
                                                                </td>
                                                            </tr>
                                                        );
                                                    }
                                                    return itemsList.map(([key, { name }]) => (
                                                        <tr key={`${sectorKey}-${key}`} className="bg-gray-50/40 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-800">
                                                            <td className="py-2 px-8 text-gray-600 dark:text-gray-400 font-medium truncate" title={name}>
                                                                └ {name}
                                                            </td>
                                                            {results.map(r => {
                                                                const finalProjection = r.projections[r.projections.length - 1];
                                                                const items = finalProjection?.itemTotals?.[sectorKey] || [];
                                                                const itemData = items.find(item => (item.id || item.name) === key) || { amount: 0, percentage: 0 };
                                                                return (
                                                                    <td key={r.id} className="py-2 px-4 text-right text-gray-700 dark:text-gray-300">
                                                                        {formatMoney(itemData.amount)}
                                                                    </td>
                                                                );
                                                            })}
                                                            {results.length === 2 && (
                                                                <td className="py-2 px-4 text-right">
                                                                    {(() => {
                                                                        const finalA = results[0].projections[results[0].projections.length - 1];
                                                                        const finalB = results[1].projections[results[1].projections.length - 1];
                                                                        const itemsA = finalA?.itemTotals?.[sectorKey] || [];
                                                                        const itemsB = finalB?.itemTotals?.[sectorKey] || [];
                                                                        const itemA = itemsA.find(item => (item.id || item.name) === key) || { amount: 0, percentage: 0 };
                                                                        const itemB = itemsB.find(item => (item.id || item.name) === key) || { amount: 0, percentage: 0 };
                                                                        const diffAmount = itemB.amount - itemA.amount;
                                                                        const isGood = sectorKey === 'loan' ? diffAmount <= 0 : diffAmount >= 0;
                                                                        const textColor = isGood ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';

                                                                        return (
                                                                            <span className={`font-semibold ${textColor}`}>
                                                                                {formatMoney(diffAmount, { showPlus: true })}
                                                                            </span>
                                                                        );
                                                                    })()}
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ));
                                                })()}
                                            </React.Fragment>
                                        );
                                    })}

                                    {/* Grand Total Row */}
                                    <tr className="bg-gray-100/80 dark:bg-gray-700/60 font-bold border-t-2 border-gray-300 dark:border-gray-600">
                                        <td className="py-3 px-4 text-gray-900 dark:text-white">
                                            총계 ({compareMode === 'gross' ? '총자산' : '순자산'})
                                        </td>
                                        {results.map(r => {
                                            const finalProjection = r.projections[r.projections.length - 1];
                                            const val = compareMode === 'gross' ? finalProjection?.gross : finalProjection?.net;
                                            return (
                                                <td key={r.id} className="py-3 px-4 text-right text-gray-900 dark:text-white font-extrabold">
                                                    {formatMoney(val || 0)}
                                                </td>
                                            );
                                        })}
                                        {results.length === 2 && (
                                            <td className="py-3 px-4 text-right font-extrabold">
                                                {(() => {
                                                    const finalA = results[0].projections[results[0].projections.length - 1];
                                                    const finalB = results[1].projections[results[1].projections.length - 1];
                                                    const valA = compareMode === 'gross' ? finalA?.gross : finalA?.net;
                                                    const valB = compareMode === 'gross' ? finalB?.gross : finalB?.net;
                                                    const diff = (valB || 0) - (valA || 0);
                                                    const color = diff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';
                                                    return (
                                                        <span className={color}>{formatMoney(diff, { showPlus: true })}</span>
                                                    );
                                                })()}
                                            </td>
                                        )}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Tab 2: Monthly Timeline Comparison */}
                    {compareTab === 'monthly' && (
                        <div className="w-full">
                            {/* Monthly Interval Selector */}
                            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50/60 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                                    월별 추이 비교 ({compareMode === 'gross' ? '총자산' : '순자산'})
                                </span>
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-gray-400 dark:text-gray-500 mr-1">표시 간격:</span>
                                    {[1, 3, 6, 12].map(intv => (
                                        <button
                                            key={intv}
                                            onClick={() => setMonthlyInterval(intv)}
                                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                                                monthlyInterval === intv
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            {intv}개월
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <table className="w-full text-xs text-left table-fixed">
                                <thead>
                                    <tr className="bg-gray-50/80 dark:bg-gray-900/40 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                        <th className="py-2.5 px-4 font-bold w-[28%]">월차 / 시점</th>
                                        {results.map((r, idx) => (
                                            <th key={r.id} className="py-2.5 px-4 text-right font-bold w-[24%]">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${SCENARIO_TAG_COLORS[idx]?.badge}`}>
                                                        {SCENARIO_TAG_COLORS[idx]?.label}
                                                    </span>
                                                    <span className="truncate" title={r.name}>{r.name}</span>
                                                </div>
                                            </th>
                                        ))}
                                        {results.length === 2 && (
                                            <th className="py-2.5 px-4 text-right font-bold text-indigo-700 dark:text-indigo-400 w-[24%]">
                                                차이 (B - A)
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {displayMonths.map(monthIndex => {
                                        const monthLabel = getMonthLabel(monthIndex, results[0]?.data?.baseMonth);
                                        return (
                                            <tr key={monthIndex} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/30">
                                                <td className="py-2.5 px-4 font-semibold text-gray-800 dark:text-gray-200">
                                                    <span>{monthLabel}</span>
                                                    <span className="text-[10px] text-gray-400 font-normal ml-1.5">
                                                        ({monthIndex}개월차)
                                                    </span>
                                                </td>
                                                {results.map(r => {
                                                    const projection = r.projections.find(p => p.month === monthIndex);
                                                    const val = compareMode === 'gross' ? projection?.gross : projection?.net;
                                                    return (
                                                        <td key={r.id} className="py-2.5 px-4 text-right font-medium text-gray-800 dark:text-gray-200">
                                                            {projection ? formatMoney(val) : '-'}
                                                        </td>
                                                    );
                                                })}
                                                {results.length === 2 && (
                                                    <td className="py-2.5 px-4 text-right">
                                                        {(() => {
                                                            const projA = results[0].projections.find(p => p.month === monthIndex);
                                                            const projB = results[1].projections.find(p => p.month === monthIndex);
                                                            if (projA && projB) {
                                                                const valA = compareMode === 'gross' ? projA.gross : projA.net;
                                                                const valB = compareMode === 'gross' ? projB.gross : projB.net;
                                                                const diff = (valB || 0) - (valA || 0);
                                                                const color = diff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';
                                                                return (
                                                                    <span className={`font-bold ${color}`}>
                                                                        {formatMoney(diff, { showPlus: true })}
                                                                    </span>
                                                                );
                                                            }
                                                            return '-';
                                                        })()}
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center text-sm text-gray-500 dark:text-gray-400 shadow-xs">
                    비교할 시나리오를 위 버튼에서 1~3개 선택해 주세요.
                </div>
            )}
        </div>
    );
};
