// ExtraFeaturesView.jsx - 추가 기능 및 금융 실험실 허브 패널
import React, { useState } from 'react';
import TaxSettlementPreview from './TaxSettlementPreview';

// 추가 기능 카탈로그 정의 (버튼 형태로 나열)
const FEATURE_CATALOG = [
    {
        id: 'tax-preview',
        name: '연말정산 미리보기',
        icon: '🧾',
        category: '세무/절세',
        tag: '2026년 기준',
        isAvailable: true,
        summary: '13월의 월급 환급액 정밀 계산 및 2026년 개정 세법 산출과정',
        detail: '총급여, 신용/체크카드 사용액, 의료비, 기부금 등 2026년 세법 산출과정에 맞춘 정밀 모의계산.'
    },
    {
        id: 'loan-calculator',
        name: '[개발 중] 대출 상환 & 중도상환',
        icon: '🏦',
        category: '부채관리',
        tag: '개발 중',
        isAvailable: false,
        summary: '현재 개발 준비 중인 기능입니다',
        detail: '현재 개발 준비 중인 기능입니다.'
    },
    {
        id: 'savings-calculator',
        name: '[개발 중] 예·적금 만기 수령액',
        icon: '💰',
        category: '수익계산',
        tag: '개발 중',
        isAvailable: false,
        summary: '현재 개발 준비 중인 기능입니다',
        detail: '현재 개발 준비 중인 기능입니다.'
    },
    {
        id: 'pension-optimizer',
        name: '[개발 중] 연금저축/IRP 최적화',
        icon: '🪙',
        category: '노후은퇴',
        tag: '개발 중',
        isAvailable: false,
        summary: '현재 개발 준비 중인 기능입니다',
        detail: '현재 개발 준비 중인 기능입니다.'
    },
    {
        id: 'fx-calculator',
        name: '[개발 중] 환율 우대 & 분할 환전',
        icon: '💱',
        category: '외환투자',
        tag: '개발 중',
        isAvailable: false,
        summary: '현재 개발 준비 중인 기능입니다',
        detail: '현재 개발 준비 중인 기능입니다.'
    },
    {
        id: 'housing-diagnostic',
        name: '[개발 중] 청약 가점 & 특공 진단',
        icon: '🎯',
        category: '부동산',
        tag: '개발 중',
        isAvailable: false,
        summary: '현재 개발 준비 중인 기능입니다',
        detail: '현재 개발 준비 중인 기능입니다.'
    }
];

export default function ExtraFeaturesView({
    monthlySalary = 0,
    currentAppData = null,
    currentCalculation = null,
    currentUser = null,
    supabase = null,
    verifiedEmail = null,
    addToast = null
}) {
    // 현재 선택된 기능 (기본값: 'tax-preview' 연말정산 미리보기)
    const [selectedFeatureId, setSelectedFeatureId] = useState('tax-preview');
    const [voteList, setVoteList] = useState({});

    const activeFeature = FEATURE_CATALOG.find(f => f.id === selectedFeatureId) || FEATURE_CATALOG[0];

    const handleVoteUpcoming = (featureId, featureName) => {
        setVoteList(prev => ({
            ...prev,
            [featureId]: (prev[featureId] || 0) + 1
        }));
        alert(`'${featureName}' 기능에 우선 개발 투표가 등록되었습니다! 빠른 시일 내에 준비하겠습니다.`);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* 상단 헤더 배너 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xl">✨</span>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            추가 기능 & 금융 도구 모음
                        </h1>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
                            Beta
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        더 스마트한 자산 관리를 돕는 맞춤형 계산기 및 금융 시뮬레이터를 원클릭으로 이용해보세요.
                    </p>
                </div>
            </div>

            {/* 기능 선택 버튼 바 (메인 패널쪽에 쪼르르 나열) */}
            <div>
                <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <span>🛠️</span> 기능 바로가기 선택
                    </span>
                    <span className="text-[11px] text-slate-400">
                        {FEATURE_CATALOG.filter(f => f.isAvailable).length}개 활성 / {FEATURE_CATALOG.length}개 툴
                    </span>
                </div>

                {/* 가로 스크롤 및 반응형 그리드 버튼 바 */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                    {FEATURE_CATALOG.map((feature) => {
                        const isSelected = selectedFeatureId === feature.id;
                        return (
                            <button
                                key={feature.id}
                                onClick={() => setSelectedFeatureId(feature.id)}
                                className={`p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between relative group cursor-pointer ${
                                    isSelected
                                        ? 'bg-white dark:bg-slate-800 border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/20 shadow-md translate-y-[-2px]'
                                        : 'bg-white/70 dark:bg-slate-850/70 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                                }`}
                            >
                                <div className="flex items-start justify-between w-full mb-2">
                                    <span className={`text-2xl p-1.5 rounded-xl transition-transform group-hover:scale-110 ${
                                        isSelected 
                                            ? 'bg-indigo-50 dark:bg-indigo-950/60' 
                                            : 'bg-slate-100 dark:bg-slate-800'
                                    }`}>
                                        {feature.icon}
                                    </span>
                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                                        feature.isAvailable
                                            ? 'bg-emerald-500 text-white shadow-xs'
                                            : 'bg-slate-200 dark:bg-slate-750 text-slate-600 dark:text-slate-400'
                                    }`}>
                                        {feature.tag}
                                    </span>
                                </div>

                                <div>
                                    <h4 className={`text-xs font-bold truncate transition-colors ${
                                        isSelected 
                                            ? 'text-indigo-600 dark:text-indigo-400' 
                                            : 'text-slate-800 dark:text-slate-200'
                                    }`}>
                                        {feature.name}
                                    </h4>
                                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                                        {feature.summary}
                                    </p>
                                </div>

                                {isSelected && (
                                    <div className="w-full h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full mt-2.5 animate-in fade-in duration-200"></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 선택된 기능 콘텐츠 영역 */}
            <div className="pt-2">
                {activeFeature.id === 'tax-preview' ? (
                    <TaxSettlementPreview
                        monthlySalary={monthlySalary}
                        currentAppData={currentAppData}
                        currentCalculation={currentCalculation}
                        currentUser={currentUser}
                        supabase={supabase}
                        verifiedEmail={verifiedEmail}
                        addToast={addToast}
                    />
                ) : (
                    /* 준비 중인 기능 안내 카드 */
                    <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center text-2xl mx-auto">
                            {activeFeature.icon}
                        </div>
                        <div>
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                {activeFeature.tag}
                            </span>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                                {activeFeature.name}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                                {activeFeature.detail}
                            </p>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={() => setSelectedFeatureId('tax-preview')}
                                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all cursor-pointer"
                            >
                                🧾 연말정산 미리보기로 이동
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
