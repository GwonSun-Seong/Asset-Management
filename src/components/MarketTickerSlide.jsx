import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * 토스 Open API 연동 실시간 시장 정보 & 환율 슬라이더 위젯 및 상세 모달
 */

export const MarketDetailModal = ({ isOpen, onClose, fxData, krData, usData, onRefresh, isLoading }) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const formatKstTime = (isoString) => {
        if (!isoString) return '-';
        try {
            const d = new Date(isoString);
            return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
        } catch {
            return '-';
        }
    };

    // 전일 대비 변동 계산 (Toss basisPoint: 1 bp = 0.1원 또는 0.01원 단위)
    const formatFxChange = () => {
        if (!fxData) return '-';
        const bp = Math.abs(Number(fxData.basisPoint) || 0);
        const changeWon = (bp / 10).toFixed(1); // 40bp -> 4.0원
        if (fxData.rateChangeType === 'UP') return `▲ +${changeWon}원`;
        if (fxData.rateChangeType === 'DOWN') return `▼ -${changeWon}원`;
        return '― 0.0원';
    };

    const modalContent = (
        <div 
            className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn select-text"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-scaleUp z-10"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-2.5">
                        <span className="text-2xl">🌐</span>
                        <div>
                            <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                글로벌 증시 장 운영 & 실시간 환율
                                <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 font-semibold px-2 py-0.5 rounded-full">
                                    토스 OpenAPI 실시간
                                </span>
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                                국내 및 미국 증시 세션별 운영 시간과 실시간 원/달러 고시 환율입니다.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onRefresh}
                            disabled={isLoading}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-600 dark:text-gray-300 transition-colors disabled:opacity-50"
                            title="새로고침"
                        >
                            <span className={`inline-block ${isLoading ? 'animate-spin' : ''}`}>🔄</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-500 dark:text-gray-400 transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar text-sm">
                    {/* Section 1: 실시간 환율 */}
                    <div className="bg-slate-50 dark:bg-gray-800/60 p-4 rounded-xl border border-slate-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <span>💵</span> USD / KRW 실시간 환율
                            </h3>
                            {fxData?.updatedAt && (
                                <span className="text-[11px] text-slate-500 dark:text-gray-400">
                                    조회: {fxData.updatedAt}
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-slate-200/70 dark:border-gray-700/70 shadow-sm">
                                <span className="text-[11px] font-semibold text-slate-400 block mb-1">실시간 환율</span>
                                <span className="text-base font-black text-slate-800 dark:text-white">
                                    ₩{Number(fxData?.rate || 0).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-slate-200/70 dark:border-gray-700/70 shadow-sm">
                                <span className="text-[11px] font-semibold text-slate-400 block mb-1">기준 환율</span>
                                <span className="text-sm font-bold text-slate-700 dark:text-gray-200">
                                    {fxData?.midRate ? `₩${Number(fxData.midRate).toLocaleString()}` : '-'}
                                </span>
                            </div>
                            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-slate-200/70 dark:border-gray-700/70 shadow-sm">
                                <span className="text-[11px] font-semibold text-slate-400 block mb-1">전일 대비</span>
                                <span className={`text-sm font-bold flex items-center gap-1 ${
                                    fxData?.rateChangeType === 'UP' ? 'text-red-500 dark:text-red-400' :
                                    fxData?.rateChangeType === 'DOWN' ? 'text-blue-500 dark:text-blue-400' : 'text-slate-600 dark:text-gray-300'
                                }`}>
                                    {formatFxChange()}
                                </span>
                            </div>
                            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-slate-200/70 dark:border-gray-700/70 shadow-sm">
                                <span className="text-[11px] font-semibold text-slate-400 block mb-1">고시 시간</span>
                                <span className="text-xs font-mono font-bold text-slate-600 dark:text-gray-300">
                                    {fxData?.validFrom ? `${formatKstTime(fxData.validFrom)} ~ ${formatKstTime(fxData.validUntil)}` : '1분 실시간'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: 국내 증시 장 운영 */}
                    <div className="bg-slate-50 dark:bg-gray-800/60 p-4 rounded-xl border border-slate-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <span>🇰🇷</span> 국내 증시 운영 일정
                            </h3>
                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                krData?.currentSession === 'REGULAR' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                                krData?.currentSession === 'PRE' || krData?.currentSession === 'AFTER' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                                'bg-slate-200 text-slate-600 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                                {krData?.sessionLabel || '조회 중...'}
                            </span>
                        </div>

                        {/* 세션 타임라인 */}
                        <div className="space-y-2">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <div className="bg-white dark:bg-gray-900 p-2.5 rounded-lg border border-slate-200/70 dark:border-gray-700/70">
                                    <div className="text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">
                                        장전 시간외
                                    </div>
                                    <div className="text-sm font-bold text-slate-800 dark:text-gray-100 font-mono">
                                        {krData?.preTime || '08:00 ~ 09:00'}
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-gray-900 p-2.5 rounded-lg border-2 border-emerald-200 dark:border-emerald-800/60 shadow-sm">
                                    <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                                        정규장
                                    </div>
                                    <div className="text-sm font-black text-emerald-700 dark:text-emerald-300 font-mono">
                                        {krData?.regularTime || '09:00 ~ 15:30'}
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-gray-900 p-2.5 rounded-lg border border-slate-200/70 dark:border-gray-700/70">
                                    <div className="text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">
                                        장후 시간외
                                    </div>
                                    <div className="text-sm font-bold text-slate-800 dark:text-gray-100 font-mono">
                                        {krData?.afterTime || '15:30 ~ 20:00'}
                                    </div>
                                </div>
                            </div>

                            {/* 3영업일 캘린더 */}
                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-gray-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-gray-400">
                                <span>전일: <strong className="text-slate-700 dark:text-gray-200">{krData?.previousBusinessDay?.date || '-'}</strong></span>
                                <span>당일: <strong className="text-blue-600 dark:text-blue-400">{krData?.today?.date || '오늘'}</strong></span>
                                <span>익일: <strong className="text-slate-700 dark:text-gray-200">{krData?.nextBusinessDay?.date || '-'}</strong></span>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: 미국 증시 장 운영 */}
                    <div className="bg-slate-50 dark:bg-gray-800/60 p-4 rounded-xl border border-slate-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <span>🇺🇸</span> 미국 증시 운영 일정
                            </h3>
                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                usData?.currentSession === 'REGULAR' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                                usData?.currentSession === 'PRE' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                                usData?.currentSession === 'DAY' ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' :
                                usData?.currentSession === 'AFTER' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' :
                                'bg-slate-200 text-slate-600 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                                {usData?.sessionLabel || '조회 중...'}
                            </span>
                        </div>

                        {/* 세션 타임라인 */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div className="bg-white dark:bg-gray-900 p-2.5 rounded-lg border border-slate-200/70 dark:border-gray-700/70">
                                <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 block mb-1">데이마켓</span>
                                <span className="text-xs font-bold text-slate-800 dark:text-gray-100 font-mono">
                                    {usData?.dayTime || '09:00 ~ 16:50'}
                                </span>
                            </div>
                            <div className="bg-white dark:bg-gray-900 p-2.5 rounded-lg border border-slate-200/70 dark:border-gray-700/70">
                                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 block mb-1">프리마켓</span>
                                <span className="text-xs font-bold text-slate-800 dark:text-gray-100 font-mono">
                                    {usData?.preTime || '17:00 ~ 22:30'}
                                </span>
                            </div>
                            <div className="bg-white dark:bg-gray-900 p-2.5 rounded-lg border-2 border-emerald-200 dark:border-emerald-800/60 shadow-sm">
                                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">정규장</span>
                                <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 font-mono">
                                    {usData?.regularTime || '22:30 ~ 05:00'}
                                </span>
                            </div>
                            <div className="bg-white dark:bg-gray-900 p-2.5 rounded-lg border border-slate-200/70 dark:border-gray-700/70">
                                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 block mb-1">애프터마켓</span>
                                <span className="text-xs font-bold text-slate-800 dark:text-gray-100 font-mono">
                                    {usData?.afterTime || '05:00 ~ 07:00'}
                                </span>
                            </div>
                        </div>

                        {/* 3영업일 캘린더 */}
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-gray-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-gray-400">
                            <span>전일: <strong className="text-slate-700 dark:text-gray-200">{usData?.previousBusinessDay?.date || '-'}</strong></span>
                            <span>당일: <strong className="text-blue-600 dark:text-blue-400">{usData?.today?.date || '오늘'}</strong></span>
                            <span>익일: <strong className="text-slate-700 dark:text-gray-200">{usData?.nextBusinessDay?.date || '-'}</strong></span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white text-xs font-bold rounded-xl transition-all"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export const MarketTickerSlide = () => {
    const [isConfigured, setIsConfigured] = useState(() => {
        const id = localStorage.getItem('toss_client_id');
        const secret = localStorage.getItem('toss_client_secret');
        return !!(id && id.trim() && secret && secret.trim());
    });

    const [currentSlide, setCurrentSlide] = useState(0);
    const [fxData, setFxData] = useState(null);
    const [krData, setKrData] = useState(null);
    const [usData, setUsData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const touchStartX = useRef(0);

    const totalSlides = 3;

    // Toss API 키 등록 여부 감지 (로컬 스토리지 변경 대응)
    useEffect(() => {
        const checkConfig = () => {
            const id = localStorage.getItem('toss_client_id');
            const secret = localStorage.getItem('toss_client_secret');
            setIsConfigured(!!(id && id.trim() && secret && secret.trim()));
        };

        window.addEventListener('storage', checkConfig);
        return () => window.removeEventListener('storage', checkConfig);
    }, []);

    const loadAllMarketData = async () => {
        const id = localStorage.getItem('toss_client_id');
        const secret = localStorage.getItem('toss_client_secret');
        if (!id || !secret || !id.trim() || !secret.trim()) {
            return;
        }

        setIsLoading(true);
        try {
            if (window.fetchTossExchangeRateDetails) {
                const fx = await window.fetchTossExchangeRateDetails();
                if (fx) setFxData(fx);
            }
            if (window.fetchTossMarketCalendar) {
                const kr = await window.fetchTossMarketCalendar('KR');
                if (kr) setKrData(kr);
                const us = await window.fetchTossMarketCalendar('US');
                if (us) setUsData(us);
            }
        } catch (err) {
            console.warn("MarketTickerSlide load error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isConfigured) return;
        loadAllMarketData();
        const timer = setInterval(() => {
            loadAllMarketData();
        }, 60000);
        return () => clearInterval(timer);
    }, [isConfigured]);

    // 토스 API 미등록 사용자는 배너 자체를 렌더링하지 않음
    if (!isConfigured) {
        return null;
    }

    useEffect(() => {
        if (isPaused) return;
        const slideTimer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % totalSlides);
        }, 5000);
        return () => clearInterval(slideTimer);
    }, [isPaused, totalSlides]);

    const nextSlide = (e) => {
        e?.stopPropagation();
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
    };

    const prevSlide = (e) => {
        e?.stopPropagation();
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    };

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (diff > 40) nextSlide();
        else if (diff < -40) prevSlide();
    };

    const formatFxChange = () => {
        if (!fxData) return null;
        const bp = Math.abs(Number(fxData.basisPoint) || 0);
        const changeWon = (bp / 10).toFixed(1);
        if (fxData.rateChangeType === 'UP') return <span className="text-red-500 font-bold text-[9px]">▲ +{changeWon}원</span>;
        if (fxData.rateChangeType === 'DOWN') return <span className="text-blue-500 font-bold text-[9px]">▼ -{changeWon}원</span>;
        return <span className="text-slate-400 font-bold text-[9px]">― 0.0원</span>;
    };

    return (
        <>
            <div 
                className="mt-3 bg-white dark:bg-gray-800/90 border border-slate-200/80 dark:border-gray-700/80 rounded-xl p-3 shadow-sm hover:shadow-md transition-all relative overflow-hidden group select-none cursor-pointer"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onClick={() => setIsModalOpen(true)}
                title="클릭하여 상세 장 운영 & 환율 정보 보기"
            >
                {/* 상단 헤더 및 넘김 버튼 */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs">🌐</span>
                        <span className="text-[11px] font-bold text-slate-700 dark:text-gray-200">
                            {currentSlide === 0 ? '실시간 환율' : currentSlide === 1 ? '국내 증시' : '미국 증시'}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="실시간 연동 중"></span>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={prevSlide}
                            className="w-5 h-5 rounded flex items-center justify-center text-[10px] text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            ‹
                        </button>
                        <span className="text-[10px] font-mono text-slate-400">
                            {currentSlide + 1}/{totalSlides}
                        </span>
                        <button
                            type="button"
                            onClick={nextSlide}
                            className="w-5 h-5 rounded flex items-center justify-center text-[10px] text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            ›
                        </button>
                    </div>
                </div>

                {/* 슬라이드 뷰 컨테이너 */}
                <div className="min-h-[58px] flex items-center">
                    {/* Slide 0: 실시간 환율 */}
                    {currentSlide === 0 && (
                        <div className="w-full flex items-center justify-between">
                            <div>
                                <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                    <span>USD / KRW</span>
                                    {formatFxChange()}
                                </div>
                                <div className="text-base font-black text-slate-800 dark:text-white tracking-tight">
                                    ₩{Number(fxData?.rate || localStorage.getItem('asset_last_usd_krw') || 1350).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[9px] bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-bold px-1.5 py-0.5 rounded block mb-1">
                                    1분 갱신
                                </span>
                                <span className="text-[9px] text-slate-400 group-hover:text-blue-500 transition-colors">상세보기 →</span>
                            </div>
                        </div>
                    )}

                    {/* Slide 1: 국내 증시 */}
                    {currentSlide === 1 && (
                        <div className="w-full flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="text-xs">🇰🇷</span>
                                    <span className="text-[11px] font-bold text-slate-800 dark:text-white">
                                        {krData?.sessionLabel || '국내 증시'}
                                    </span>
                                </div>
                                <div className="text-[10px] font-mono text-slate-500 dark:text-gray-300">
                                    정규장 {krData?.regularTime || '09:00 ~ 15:30'}
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded block mb-1 ${
                                    krData?.currentSession === 'REGULAR' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                                    'bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                    {krData?.currentSession === 'REGULAR' ? '정규장' : '마감'}
                                </span>
                                <span className="text-[9px] text-slate-400 group-hover:text-blue-500 transition-colors">상세보기 →</span>
                            </div>
                        </div>
                    )}

                    {/* Slide 2: 미국 증시 */}
                    {currentSlide === 2 && (
                        <div className="w-full flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="text-xs">🇺🇸</span>
                                    <span className="text-[11px] font-bold text-slate-800 dark:text-white">
                                        {usData?.sessionLabel || '미국 증시'}
                                    </span>
                                </div>
                                <div className="text-[10px] font-mono text-slate-500 dark:text-gray-300">
                                    정규장 {usData?.regularTime || '22:30 ~ 05:00'}
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded block mb-1 ${
                                    usData?.currentSession === 'REGULAR' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                                    usData?.currentSession === 'PRE' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                                    usData?.currentSession === 'DAY' ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' :
                                    'bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                    {usData?.currentSession === 'REGULAR' ? '정규장' : usData?.currentSession === 'PRE' ? '프리마켓' : usData?.currentSession === 'DAY' ? '데이마켓' : '마감'}
                                </span>
                                <span className="text-[9px] text-slate-400 group-hover:text-blue-500 transition-colors">상세보기 →</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* 하단 점(인디케이터) */}
                <div className="flex items-center justify-center gap-1.5 mt-2">
                    {[0, 1, 2].map((idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentSlide(idx);
                            }}
                            className={`h-1.5 rounded-full transition-all ${
                                currentSlide === idx ? 'w-4 bg-blue-500' : 'w-1.5 bg-slate-200 dark:bg-gray-600'
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* 상세 팝업 모달 */}
            <MarketDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                fxData={fxData}
                krData={krData}
                usData={usData}
                onRefresh={loadAllMarketData}
                isLoading={isLoading}
            />
        </>
    );
};

export default MarketTickerSlide;
