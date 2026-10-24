import React, { useState, Suspense, lazy } from 'react';

const TaxSettlementPreview = lazy(() => import('./TaxSettlementPreview'));
const ParkingGame = lazy(() => import('./ParkingGame'));
const KoreaLifeSimulator = lazy(() => import('./KoreaLifeSimulator'));
const RetirementGachaGame = lazy(() => import('./RetirementGachaGame'));
const ImpulseBuyJudge = lazy(() => import('./ImpulseBuyJudge'));
const MonthlyCfoAuditReport = lazy(() => import('./MonthlyCfoAuditReport'));
const LadderExitSimulator = lazy(() => import('./LadderExitSimulator'));
const FxSensitivityDashboard = lazy(() => import('./FxSensitivityDashboard'));
const ReverseGoalSolver = lazy(() => import('./ReverseGoalSolver'));

// 추가 기능 카탈로그 정의 (버튼 형태로 나열)
const FEATURE_CATALOG = [
    {
        id: 'tax-preview',
        name: '연말정산 미리보기',
        icon: '🧾',
        category: '세무/절세',
        tag: '2026세법',
        isAvailable: true,
        summary: '13월의 월급 환급액 정밀 계산 및 2026년 개정 세법 산출과정',
        detail: '총급여, 신용/체크카드 사용액, 의료비, 기부금 등 2026년 세법 산출과정에 맞춘 정밀 모의계산.'
    },
    {
        id: 'retirement-gacha',
        name: '노후 인생 가챠',
        icon: '🎰',
        category: '노후은퇴',
        tag: 'HOT',
        isAvailable: true,
        summary: '내 순자산·저축률 스탯으로 돌려보는 65세 은퇴 5대 라이프스타일 슬롯',
        detail: '주거(한강뷰 vs 텐트), 이동(포르쉐 vs 뚜벅이), 식사(오마카세 vs 단식) 등 내 종합 재무 점수로 확률이 달라지는 대화형 노후 운명 셔플 게임.'
    },
    {
        id: 'parking-game',
        name: '정밀 주차 게임',
        icon: '🚗',
        category: '미니게임',
        tag: '미니게임',
        isAvailable: true,
        summary: '30초 정밀 주차! 평행주차, T자 직각, 사선주차 완벽 도전',
        detail: '방향키(또는 WASD)로 조작하여 30초 내에 주차 구역에 정확히 주차하고 P(파킹)를 누르세요. 정중앙 100점 만점, 충돌 시 게임오버!'
    },
    {
        id: 'korea-life-simulator',
        name: '5천만 분의 1',
        icon: '🇰🇷',
        category: '인생시뮬',
        tag: '인기',
        isAvailable: true,
        summary: '내 자산·소득으로 살아보는 대한민국 상위 % 인생 시뮬레이터',
        detail: '통계청 가계금융복지조사 실데이터와 나의 실제 자산 포트폴리오를 결합하여, 5초에 1년씩 85세까지의 한국 인생 여정을 살아보는 시뮬레이션입니다.'
    },
    {
        id: 'impulse-buy-judge',
        name: 'AI 기회비용 판독기',
        icon: '🛒',
        category: '소비통제',
        tag: 'AI판사',
        isAvailable: true,
        summary: '"이거 사도 될까?" 내 자본 체급·시급·복리 기반 은퇴 지연 판결',
        detail: '사고 싶은 물건의 가격과 할부 조건을 넣으면 내 순자산 체급과 일일 주가 변동폭에 비례하여 합리적 승인 또는 팩폭 판결을 내립니다.'
    },
    {
        id: 'cfo-audit-report',
        name: '월간 CFO 감사보고서',
        icon: '📊',
        category: '재무감사',
        tag: 'AICFO',
        isAvailable: true,
        summary: '순자산 증감을 [근로저축·투자수익·부채상환]으로 요인분해하는 결산 리포트',
        detail: '지난 기간 동안 내 순자산이 왜 늘었는지 근로저축 기여분, 주식/환율 평가 변동, 부채 원금 축소분으로 분해하여 감사 보고서를 발행합니다.'
    },
    {
        id: 'ladder-exit',
        name: '분할 익절 계산기',
        icon: '🪜',
        category: '매매타점',
        tag: 'NEW',
        isAvailable: true,
        summary: '사다리 분할 매도 시 단계별 실현수익 및 잔여물량 본전 방어선 계산',
        detail: '보유 종목을 목표 수익률 구간별로 분할 익절할 때 확보되는 확정 수익금과 남은 물량의 본전 방어 주가를 계산합니다.'
    },
    {
        id: 'fx-sensitivity',
        name: '환율 민감도 분석',
        icon: '💱',
        category: '환노출',
        tag: 'NEW',
        isAvailable: true,
        summary: '직투 + 국내상장 미국 ETF 환노출 합산 원/달러 변동 스트레스 테스트',
        detail: '미국 직투뿐만 아니라 국내 상장 미국 ETF(환노출/환헤지)까지 자동 판별하여 환율 및 증시 복합 시나리오별 순자산 변동을 분석합니다.'
    },
    {
        id: 'reverse-goal-solver',
        name: '목표 달성 계산기',
        icon: '🎯',
        category: '목표설계',
        tag: 'NEW',
        isAvailable: true,
        summary: '"N년 뒤 M억 모으려면?" 필요한 월 추가저축 vs 목표 수익률 계산',
        detail: '원하는 목표 기간과 목표 순자산을 설정했을 때, 오늘 당장 늘려야 할 월 저축액과 필요 수익률 조합을 자동으로 계산합니다.'
    }
];

export default function ExtraFeaturesView({
    monthlySalary = 0,
    currentAppData = null,
    currentCalculation = null,
    assetHistory = [],
    currentUser = null,
    supabase = null,
    verifiedEmail = null,
    addToast = null,
    savingsRate = 0,
    onNavigateToVisualization = null
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
        if (addToast) {
            addToast(`'${featureName}' 슬롯에 아이디어 투표가 등록되었습니다!`, 'info');
        } else {
            alert(`'${featureName}' 기능에 우선 개발 투표가 등록되었습니다! 빠른 시일 내에 준비하겠습니다.`);
        }
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

            {/* 기능 선택 버튼 바 (9개 항목에 맞춰 컴팩트 사이즈로 조절) */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <span>🛠️</span> 기능 바로가기 선택
                    </span>
                    <span className="text-[11px] text-slate-400">
                        {FEATURE_CATALOG.filter(f => f.isAvailable).length}개 활성 / {FEATURE_CATALOG.length}개 툴
                    </span>
                </div>

                {/* 9개 카드 컴팩트 그리드 (모바일 3열 / 태블릿 5열 / 데스크톱 9열) */}
                <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5 sm:gap-2">
                    {FEATURE_CATALOG.map((feature) => {
                        const isSelected = selectedFeatureId === feature.id;
                        return (
                            <button
                                key={feature.id}
                                onClick={() => setSelectedFeatureId(feature.id)}
                                className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between relative group cursor-pointer ${
                                    isSelected
                                        ? 'bg-white dark:bg-slate-800 border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/20 shadow-md translate-y-[-2px]'
                                        : 'bg-white/70 dark:bg-slate-850/70 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                                }`}
                            >
                                <div className="flex items-start justify-between w-full mb-1.5">
                                    <span className={`text-base sm:text-lg p-1 rounded-lg transition-transform group-hover:scale-110 ${
                                        isSelected 
                                            ? 'bg-indigo-50 dark:bg-indigo-950/60' 
                                            : 'bg-slate-100 dark:bg-slate-800'
                                    }`}>
                                        {feature.icon}
                                    </span>
                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                                        feature.tag === 'NEW'
                                            ? 'bg-indigo-600 text-white shadow-xs'
                                            : feature.isAvailable
                                                ? 'bg-emerald-500 text-white shadow-xs'
                                                : 'bg-slate-200 dark:bg-slate-750 text-slate-600 dark:text-slate-400'
                                    }`}>
                                        {feature.tag}
                                    </span>
                                </div>

                                <div>
                                    <h4 className={`text-[11px] font-black truncate transition-colors ${
                                        isSelected 
                                            ? 'text-indigo-600 dark:text-indigo-400' 
                                            : 'text-slate-800 dark:text-slate-200'
                                    }`}>
                                        {feature.name}
                                    </h4>
                                    <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">
                                        {feature.summary}
                                    </p>
                                </div>

                                {isSelected && (
                                    <div className="w-full h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full mt-1.5 animate-in fade-in duration-200"></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 선택된 기능 콘텐츠 영역 (Suspense 지연 로딩 적용) */}
            <div className="pt-2">
                <Suspense
                    fallback={
                        <div className="p-12 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-400">
                            <div className="w-7 h-7 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs font-bold">도구 모듈을 불러오는 중입니다...</span>
                        </div>
                    }
                >
                    {activeFeature.id === 'tax-preview' && (
                        <TaxSettlementPreview
                            monthlySalary={monthlySalary}
                            currentAppData={currentAppData}
                            currentCalculation={currentCalculation}
                            currentUser={currentUser}
                            supabase={supabase}
                            verifiedEmail={verifiedEmail}
                            addToast={addToast}
                        />
                    )}
                    {activeFeature.id === 'retirement-gacha' && (
                        <RetirementGachaGame
                            monthlySalary={monthlySalary}
                            currentAppData={currentAppData}
                            currentCalculation={currentCalculation}
                            addToast={addToast}
                            savingsRate={savingsRate}
                        />
                    )}
                    {activeFeature.id === 'parking-game' && (
                        <ParkingGame addToast={addToast} />
                    )}
                    {activeFeature.id === 'korea-life-simulator' && (
                        <KoreaLifeSimulator
                            monthlySalary={monthlySalary}
                            currentAppData={currentAppData}
                            currentCalculation={currentCalculation}
                            addToast={addToast}
                        />
                    )}
                    {activeFeature.id === 'impulse-buy-judge' && (
                        <ImpulseBuyJudge
                            monthlySalary={monthlySalary}
                            currentAppData={currentAppData}
                            currentCalculation={currentCalculation}
                            assetHistory={assetHistory}
                            addToast={addToast}
                        />
                    )}
                    {activeFeature.id === 'cfo-audit-report' && (
                        <MonthlyCfoAuditReport
                            monthlySalary={monthlySalary}
                            currentAppData={currentAppData}
                            currentCalculation={currentCalculation}
                            assetHistory={assetHistory}
                            addToast={addToast}
                        />
                    )}
                    {activeFeature.id === 'ladder-exit' && (
                        <LadderExitSimulator
                            currentAppData={currentAppData}
                            addToast={addToast}
                        />
                    )}
                    {activeFeature.id === 'fx-sensitivity' && (
                        <FxSensitivityDashboard
                            currentAppData={currentAppData}
                            currentCalculation={currentCalculation}
                            addToast={addToast}
                        />
                    )}
                    {activeFeature.id === 'reverse-goal-solver' && (
                        <ReverseGoalSolver
                            monthlySalary={monthlySalary}
                            currentAppData={currentAppData}
                            currentCalculation={currentCalculation}
                            addToast={addToast}
                        />
                    )}
                    {!activeFeature.isAvailable && (
                        <div className="p-10 rounded-3xl bg-white dark:bg-slate-850 border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-4">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-3xl mx-auto">
                                {activeFeature.icon}
                            </div>
                            <div className="space-y-1.5 max-w-xl mx-auto">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                    차기 실험실 슬롯 준비중
                                </span>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                                    {activeFeature.name}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    {activeFeature.detail}
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                                {onNavigateToVisualization && (
                                    <button
                                        type="button"
                                        onClick={onNavigateToVisualization}
                                        className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-sm transition-all cursor-pointer"
                                    >
                                        📈 [시각화] 탭으로 이동하여 승격된 도구 보기
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => handleVoteUpcoming(activeFeature.id, activeFeature.name)}
                                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                                >
                                    👍 신규 실험실 기능 기대 투표 ({voteList[activeFeature.id] || 0})
                                </button>
                            </div>
                        </div>
                    )}
                </Suspense>
            </div>
        </div>
    );
}

