import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import AssetSummaryCard from './components/AssetSummaryCard';
import { SavedScenariosCarousel, ScenarioCompare } from './components/ScenarioComponents';

        const CoreSettingsCard = ({
            monthlySalary, setMonthlySalary, baseDate, setBaseDate, // [변경] baseMonth -> baseDate
            onOpenDataManage,
            salaryDay, setSalaryDay,
            saveToPDF, saveCurrentAsset, saveScenario, displayMode,
                autoUpdateBaseDate, setAutoUpdateBaseDate,
                editingPhase, // [추가]
                enableLiveQuotes, setEnableLiveQuotes // [추가]
        }) => {
            const TEXTS = window.TEXTS || {};
            const isEditing = editingPhase !== null; // [추가] 편집 모드 여부 확인

            return (
                <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"> 
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">{TEXTS.settings?.coreSettings || "핵심 설정"}</h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">{TEXTS.settings?.monthlySalary || "월 고정 수입 (만원)"}</label>
                                <CalculatorInput 
                                    className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                    value={monthlySalary} 
                                    onChange={(e) => setMonthlySalary(Number(e.target.value))} 
                                    displayMode={displayMode}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">고정 수입일</label>
                                <select 
                                    className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={salaryDay || 25}
                                    onChange={(e) => setSalaryDay(Number(e.target.value))}
                                >
                                    {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                                        <option key={day} value={day}>{day}일</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        {!isEditing && (
                            <>
                                <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">계산 시작일 (기준일)</label>
                            <div className="flex items-center gap-2">
                                <input type="date" className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={baseDate} onChange={(e) => setBaseDate(e.target.value)} />
                                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap" title="활성화 시 앱을 열 때마다 기준일이 오늘 날짜로 자동 갱신됩니다.">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                        checked={autoUpdateBaseDate}
                                        onChange={(e) => setAutoUpdateBaseDate(e.target.checked)}
                                    />
                                    자동 갱신
                                </label>
                            </div>
                            <div className="mt-2">
                                <label className="flex items-center gap-1.5 cursor-not-allowed text-xs text-gray-400 dark:text-gray-500" title="현재 야후 API 연동이 비활성화되었습니다. (추후 토스 API 발급 시 제공 예정)">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 opacity-50 cursor-not-allowed"
                                        checked={false}
                                        disabled
                                    />
                                    실시간 시세 자동 연동 (API 준비 중)
                                </label>
                            </div>
                        </div>
                                <div className="pt-4 border-t dark:border-gray-700">
                            <h3 className="text-sm font-bold text-gray-700 dark:text-white mb-2">{TEXTS.settings?.dataManagement || "데이터 관리"}</h3>
                            <div className="flex flex-col gap-2">
                                <button onClick={onOpenDataManage} className="flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 shadow-sm transition-all">
                                    <span>💾</span> 데이터 내보내기 / 불러오기
                                </button>
                                <button onClick={saveCurrentAsset} className="flex items-center justify-center gap-2 px-3 py-2 text-white text-sm font-semibold rounded-lg shadow-sm transition-all mt-2 bg-indigo-500 hover:bg-indigo-600 hover:shadow-md">
                                    <span>💾</span> {TEXTS.settings?.saveHistory || "히스토리 저장"}
                                </button>
                                <button onClick={saveScenario} className="flex items-center justify-center gap-2 px-3 py-2 text-white text-sm font-semibold rounded-lg shadow-sm transition-all mt-2 bg-gray-600 hover:bg-gray-700 hover:shadow-md">
                                    <span>💾</span> 시나리오 저장
                                </button>
                            </div>
                        </div>
                            </>
                        )}
                    </div>
                </div>
            );
        };

        const GoalSettingsCard = ({
            goalMode, setGoalMode, setGoalSeekResult,
            projectionMonths, setProjectionMonths, targetAmount, setTargetAmount,
            calculateGoalSeek, goalSeekResult,
            inflationRate, setInflationRate,
            onOpenScreenshotModal
        }) => {
            const TEXTS = window.TEXTS || {};
            const [isPlaying, setIsPlaying] = useState(false);

            useEffect(() => {
                let interval;
                if (isPlaying) {
                    setProjectionMonths(prev => prev >= 120 ? 0 : prev);
                    interval = setInterval(() => {
                        setProjectionMonths(prev => {
                            if (prev >= 120) { setIsPlaying(false); return 120; }
                            return prev + 1;
                        });
                    }, 100);
                }
                return () => clearInterval(interval);
            }, [isPlaying, setProjectionMonths]);

            return (
                <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"> 
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">{TEXTS.settings?.goalSettings || "목표 설정"}</h2>
                    <div className="mb-4">
                        <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg p-1 bg-gray-100 dark:bg-gray-900">
                            <button onClick={() => { setGoalMode('period'); setGoalSeekResult(null); }} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${goalMode === 'period' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'}`}>
                                {TEXTS.settings?.periodBased || "기간 기준"}
                            </button>
                            <button onClick={() => setGoalMode('target')} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${goalMode === 'target' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'}`}>
                                {TEXTS.settings?.assetBased || "자산 기준"}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-4"> 
                        {goalMode === 'period' ? (
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-white">{TEXTS.settings?.expectedPeriod || "예상 기간"}</label>
                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{projectionMonths}개월 후</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className={`p-2 rounded-full transition-colors flex-shrink-0 ${isPlaying ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400'}`}
                                        title={isPlaying ? "정지" : "타임랩스 재생"}
                                    >
                                        {isPlaying ? <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}
                                    </button>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="120" 
                                        step="1" 
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
                                        value={projectionMonths} 
                                        onChange={(e) => { setProjectionMonths(Number(e.target.value)); setIsPlaying(false); }} 
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
                                    <span>현재</span>
                                    <span>5년</span>
                                    <span>10년</span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">{TEXTS.settings?.targetAsset || "목표 자산 (만원)"}</label>
                                    <input type="number" className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" value={targetAmount} onChange={(e) => setTargetAmount(Number(e.target.value))} />
                                </div>
                                <button onClick={calculateGoalSeek} className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 font-semibold shadow-sm hover:shadow-md transition-all">
                                    {TEXTS.settings?.calcGoal || "달성 기간 계산"}
                                </button>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">{TEXTS.settings?.inflationRate || "연간 인플레이션 증가율 (%)"}</label>
                            <input type="number" step="0.1" className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={inflationRate} onChange={(e) => setInflationRate(Number(e.target.value))} />
                        </div>
                        {goalMode === 'target' && goalSeekResult && (
                            <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                                <p className="text-green-800 dark:text-green-300 font-medium text-center">{goalSeekResult}</p>
                            </div>
                        )}
                    </div>
                </div>
            );
        };

        const SummaryPanel = (props) => {
            return (
                <div className={`grid grid-cols-1 ${props.editingPhase !== null ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6 transition-colors`}>
                    <AssetSummaryCard {...props} />
                    <CoreSettingsCard {...props} />
                    {props.editingPhase === null && <GoalSettingsCard {...props} />}
                </div>
            );
        };

        const useUndoRedo = (initialState) => {
            // [수정] 상태 관리를 하나의 객체로 통합하여 setState 내부 사이드 이펙트 제거
            const [history, setHistory] = useState({
                past: [],
                present: initialState,
                future: []
            });
            const { past, present, future } = history;
            
            // [추가] 상태 동기화를 위한 Ref (이벤트 핸들러 내 최신 상태 참조용)
            const historyRef = useRef(history);
            useEffect(() => { historyRef.current = history; }, [history]);
            
            const lastHistoryTime = useRef(0);

            const set = React.useCallback((newState) => {
                const curr = historyRef.current;
                const computedState = typeof newState === 'function' ? newState(curr.present) : newState;
                
                // 상태가 변경되지 않았으면 리턴
                if (JSON.stringify(curr.present) === JSON.stringify(computedState)) return;

                const now = Date.now();
                const shouldSave = now - lastHistoryTime.current > 500;

                if (shouldSave) {
                    lastHistoryTime.current = now;
                    setHistory(prev => ({
                        past: [...prev.past, prev.present].slice(-30),
                        present: computedState,
                        future: []
                    }));
                } else {
                    setHistory(prev => ({
                        ...prev,
                        present: computedState,
                        future: []
                    }));
                }
            }, []);

            const undo = React.useCallback(() => {
                setHistory(curr => {
                    if (curr.past.length === 0) return curr;
                    const previous = curr.past[curr.past.length - 1];
                    const newPast = curr.past.slice(0, curr.past.length - 1);
                    return {
                        past: newPast,
                        present: previous,
                        future: [curr.present, ...curr.future]
                    };
                });
                lastHistoryTime.current = Date.now();
            }, []);

            const redo = React.useCallback(() => {
                setHistory(curr => {
                    if (curr.future.length === 0) return curr;
                    const next = curr.future[0];
                    const newFuture = curr.future.slice(1);
                    return {
                        past: [...curr.past, curr.present],
                        present: next,
                        future: newFuture
                    };
                });
                lastHistoryTime.current = Date.now();
            }, []);

            const reset = React.useCallback((newState) => {
                setHistory({
                    past: [],
                    present: newState,
                    future: []
                });
            }, []);

            return { state: present, setState: set, undo, redo, canUndo: past.length > 0, canRedo: future.length > 0, reset };
        };

        // [Fix] 페이즈(미래 시점) 편집 데이터 병합 헬퍼 함수 (중복 로직 통합 및 스마트 오버라이드 추출)
        const getPhaseMergedAppData = (currentAppData, currentEditingPhase) => {
            if (!currentEditingPhase) return currentAppData;

            const original = currentEditingPhase.originalAppData;
            const pureProjectedAssets = currentEditingPhase.pureProjectedState;
            const currentAssets = currentAppData.assets;
            const modifiedAssetsToSave = {};

            Object.keys(currentAssets).forEach(sector => {
                const sectorAssets = currentAssets[sector] || [];
                const pureSectorAssets = pureProjectedAssets[sector] || [];
                const phaseSectorAssets = [];

                sectorAssets.forEach(asset => {
                    const pureAsset = pureSectorAssets.find(a => a.id === asset.id);
                    if (!pureAsset) {
                        // 미래 시점에 새롭게 추가된 자산은 통째로 저장
                        phaseSectorAssets.push({ ...asset });
                    } else {
                        // 기존에 있던 자산은 사용자가 "의도적으로 바꾼 속성"만 골라서 저장 (스마트 오버라이드)
                        const diff = {};
                        let hasChanges = false;
                        
                        const checkAndAdd = (key) => { if (asset[key] !== pureAsset[key]) { diff[key] = asset[key]; hasChanges = true; } };

                        if (Math.abs((asset.amount || 0) - (pureAsset.amount || 0)) > 0.001) {
                            diff.amount = asset.amount;
                            diff.isAmountOverridden = true;
                            hasChanges = true;
                        } else {
                            diff.isAmountOverridden = false;
                        }

                        ['name', 'icon', 'memo', 'rate', 'feeRate', 'monthlyContrib', 'monthlyContributionFrom', 'maturityMonth', 'repaymentMethod', 'repaymentAccount', 'loanStartDate'].forEach(checkAndAdd);

                        if (hasChanges) {
                            phaseSectorAssets.push({ id: asset.id, ...diff });
                        } else {
                            // [Fix] 분기 편집 시, 수정하지 않은 자산들이 덮어쓰기 과정에서 누락되어 시뮬레이션 통과 시 통째로 증발해 버리는 치명적 버그 해결
                            phaseSectorAssets.push({ id: asset.id });
                        }
                    }
                });
                // [Fix] 빈 섹터라도 사용자가 명시적으로 모든 항목을 지웠을 경우를 위해 덮어쓰기 객체에 항상 할당
                modifiedAssetsToSave[sector] = phaseSectorAssets;
            });

            const updatedPhaseData = {};
            if (currentAppData.monthlySalary !== original.monthlySalary) updatedPhaseData.monthlySalary = currentAppData.monthlySalary;
            if (JSON.stringify(currentAppData.monthlyExpenses) !== JSON.stringify(original.monthlyExpenses)) updatedPhaseData.monthlyExpenses = currentAppData.monthlyExpenses;
            if (currentAppData.salaryDay !== original.salaryDay) updatedPhaseData.salaryDay = currentAppData.salaryDay;
            if (currentAppData.mainCashFlowAccount !== original.mainCashFlowAccount) updatedPhaseData.mainCashFlowAccount = currentAppData.mainCashFlowAccount;
            if (currentAppData.residualAccount !== original.residualAccount) updatedPhaseData.residualAccount = currentAppData.residualAccount;
            if (Object.keys(modifiedAssetsToSave).length > 0) updatedPhaseData.assets = modifiedAssetsToSave;

            const newPhases = [...(original.futurePhases || [])];
            newPhases[currentEditingPhase.index] = { 
                ...newPhases[currentEditingPhase.index], 
                data: updatedPhaseData 
            };

            return { ...original, futurePhases: newPhases };
        };

        const PanelWrapper = ({ id, title, moveUp, moveDown, isFirst, isLast, isCollapsed, onToggle, children, className = "bg-white dark:bg-gray-900 rounded-lg shadow" }) => {
            return (
                <div id={id}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-white flex items-center gap-2 cursor-pointer group" onClick={onToggle}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-500 transform transition-transform duration-200 ${!isCollapsed ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{title}</span>
                        </h2>
                        <div className="flex items-center gap-1">
                            <button 
                                type="button"
                                onClick={moveUp} 
                                disabled={isFirst} 
                                className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 transition-transform"
                                title="위로 이동"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <button 
                                type="button"
                                onClick={moveDown} 
                                disabled={isLast} 
                                className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 transition-transform"
                                title="아래로 이동"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    {!isCollapsed && (
                        <div className={className}>
                            {children}
                        </div>
                    )}
                </div>
            );
        };

        const StackedBarDisplay = ({ targets, sectorInfo }) => {
            const validSectors = Object.keys(sectorInfo).filter(k => k !== 'loan');
            const defaultPct = Math.round(100 / validSectors.length);
            
            const total = validSectors.reduce((sum, key) => {
                return sum + (targets[key] ?? defaultPct);
            }, 0);

            // 100% 기준으로 비율 재계산 (정규화)
            const normalizedTargets = validSectors.map(key => {
                const value = targets[key] ?? defaultPct;
                return {
                    key: key,
                    name: sectorInfo[key].name,
                    color: sectorInfo[key].color,
                    percentage: total === 0 ? 0 : (value / total) * 100,
                    originalValue: value
                };
            });

            return (
                <div className="w-full mb-4">
                    <div className="flex h-6 w-full rounded-full overflow-hidden border border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-700">
                        {normalizedTargets.map(item => (
                            <div
                                key={item.key}
                                className={`flex items-center justify-center bg-${item.color}-500 transition-all duration-300`}
                                style={{ width: `${item.percentage}%` }}
                                title={`${item.name}: ${item.originalValue}%`}
                            >
                                <span className="text-xs font-medium text-white overflow-hidden whitespace-nowrap px-1">
                                    {item.percentage > 10 ? `${item.originalValue}%` : ''}
                                </span>
                            </div>
                        ))}
                    </div>
                    {total !== 100 && (
                        <div className="text-right text-xs text-red-600 dark:text-red-400 mt-1">
                            총합이 {total}%입니다. 100%로 조정해주세요.
                        </div>
                    )}
                </div>
            );
        };


        const SkeletonDashboard = () => {
            const [showReset, setShowReset] = useState(false);

            useEffect(() => {
                const timer = setTimeout(() => setShowReset(true), 8000); // 8초 이상 로딩 시 초기화 버튼 표시
                return () => clearTimeout(timer);
            }, []);

            return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 relative">
                <div>
                {/* Header Skeleton */}
                <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 h-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center">
                        <div className="h-8 w-48 shimmer rounded"></div>
                        <div className="hidden sm:flex gap-3">
                            <div className="h-9 w-24 shimmer rounded"></div>
                            <div className="h-9 w-24 shimmer rounded"></div>
                            <div className="h-9 w-24 shimmer rounded"></div>
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-6 max-w-[90rem] mx-auto flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Skeleton */}
                    <div className="hidden lg:block w-52 flex-shrink-0 space-y-6">
                        <div className="h-32 shimmer rounded-xl"></div>
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 shimmer rounded-lg"></div>)}
                        </div>
                    </div>

                    <div className="flex-1 space-y-8 min-w-0">
                        {/* Summary Section Skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-64 shimmer rounded-xl"></div>
                            ))}
                        </div>

                        {/* Charts Section Skeleton */}
                        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                            <div className="h-8 w-48 shimmer rounded mb-6"></div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="aspect-square rounded-full shimmer mx-auto w-3/4"></div>
                                <div className="aspect-square rounded-full shimmer mx-auto w-3/4"></div>
                                <div className="h-full w-full shimmer rounded-lg"></div>
                            </div>
                        </div>

                        {/* Asset List Skeleton */}
                        <div className="space-y-8">
                            {[1, 2].map((section) => (
                                <div key={section} className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                                    <div className="h-10 w-full shimmer rounded mb-6"></div>
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((row) => (
                                            <div key={row} className="flex flex-col sm:flex-row gap-3">
                                                <div className="h-12 w-full shimmer rounded"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                </div>
                {showReset && (
                    <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[9999]">
                        <button 
                            onClick={() => { if(confirm("로딩이 멈춘 것으로 보입니다. 브라우저에 저장된 데이터에 문제가 있을 수 있습니다.\n\n[확인]을 누르면 모든 로컬 데이터(자산, 히스토리, 시나리오 등)를 삭제하고 앱을 초기화합니다. 이 작업은 되돌릴 수 없습니다.\n\n[취소]를 누르면 현재 상태를 유지합니다. 새로고침을 먼저 시도해보세요.")) { localStorage.clear(); window.location.reload(); } }}
                            className="bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 text-red-500 px-5 py-2 rounded-full shadow-xl text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/30 transition-all animate-bounce"
                        >
                            ⚠️ 로딩에 문제가 있나요? (도움말)
                        </button>
                    </div>
                )}
            </div>
            );
        };

        const CalculatorInput = ({ value, onChange, className, placeholder, style, displayMode, ...props }) => {
            const [localValue, setLocalValue] = useState(value);
            const [isEditing, setIsEditing] = useState(false);

            useEffect(() => {
                if (!isEditing) {
                    setLocalValue(value);
                }
            }, [value, isEditing]);

            const safeEvaluate = (str) => {
                try {
                    if (/[^0-9+\-*/.()\s]/.test(str)) return null;
                    // eslint-disable-next-line no-new-func
                    const result = new Function('return ' + str)();
                    return isFinite(result) ? result : null;
                } catch (e) {
                    return null;
                }
            };

            const handleBlur = () => {
                const strVal = String(localValue).trim();
                if (/[\+\-\*\/]/.test(strVal)) {
                    const result = safeEvaluate(strVal);
                    if (result !== null) {
                        const finalVal = Math.round(result * 100) / 100;
                        setLocalValue(finalVal);
                        onChange({ target: { value: finalVal } });
                    } else { setLocalValue(value); }
                } else { 
                    // [수정] 090 -> 90 등 숫자 형식 자동 보정
                    const numVal = parseFloat(strVal);
                    if (!isNaN(numVal)) {
                        setLocalValue(numVal);
                        onChange({ target: { value: numVal } });
                    } else {
                        onChange({ target: { value: strVal } });
                    }
                }
                setIsEditing(false);
            };

            // [추가] 프라이빗 모드 마스킹 처리
            const isMasked = displayMode === 'percent' && !isEditing;
            
            // [수정] 연산자가 포함된 경우에만 text 타입으로 전환하여 number 타입의 네이티브 기능(스피너, 화살표) 유지
            const hasOperators = /[\+\-\*\/]/.test(String(localValue));
            const inputType = isMasked || (isEditing && hasOperators) ? "text" : "number";

            return (
                <input type={inputType} value={isMasked ? '***' : localValue} onChange={(e) => { if(!isMasked) setLocalValue(e.target.value); }} onBlur={handleBlur} className={className} placeholder={placeholder} style={style} step="any" {...props}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') e.target.blur();
                        if (['+', '-', '*', '/'].includes(e.key)) {
                            if (!hasOperators) {
                                e.preventDefault();
                                setIsEditing(true);
                                setLocalValue(prev => String(prev) + e.key);
                            }
                        }
                        // [추가] 화살표 키보드 동작 커스텀 (1단위 증감 보장 및 즉시 반영)
                        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                            if (!hasOperators) {
                                e.preventDefault();
                                const currentVal = parseFloat(localValue) || 0;
                                const step = Number(props.step) || 1;
                                const direction = e.key === 'ArrowUp' ? 1 : -1;
                                const newVal = Math.round((currentVal + step * direction) * 10000) / 10000;
                                setLocalValue(newVal);
                                onChange({ target: { value: newVal } });
                            }
                        }
                    }}
                    onFocus={(e) => { setIsEditing(true); e.target.select(); }}
                />
            );
        };

        const EventSection = React.memo(({ title, total, events, type, addFn, updateFn, removeFn, moveFn, sectorInfo, assets, formatNumber, displayMode }) => {
            const isIncome = type === 'income';
            const gradientClass = isIncome ? 'from-emerald-500 to-teal-600 dark:from-emerald-900 dark:to-teal-900' : 'from-orange-500 to-amber-600 dark:from-orange-900 dark:to-amber-900';
            const icon = isIncome ? '💰' : '🛒';
            const colorName = isIncome ? 'emerald' : 'orange';

            return (
                <div className="space-y-6">
                    {/* Summary Card */}
                    <div className={`bg-gradient-to-r ${gradientClass} rounded-2xl shadow-lg p-6 text-white flex flex-col sm:flex-row justify-between items-center gap-4`}>
                        <div>
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <span className="text-2xl">{icon}</span> {title}
                            </h3>
                            <p className="text-white/80 text-sm mt-1">비정기적인 {isIncome ? '수입' : '지출'} 이벤트를 관리하세요.</p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold">{formatNumber(total)}만원</div>
                            <div className="text-white/80 text-sm">총 {events.length}건 예정</div>
                        </div>
                    </div>

                    {/* List */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                            <span className="text-sm font-bold text-gray-500 dark:text-gray-400">목록</span>
                            <button onClick={addFn} className={`text-sm font-bold text-${colorName}-500 hover:text-${colorName}-600 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-${colorName}-50 dark:hover:bg-${colorName}-900/20 transition-colors`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                추가
                            </button>
                        </div>
                        
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {events.map((event, index) => (
                                <div key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                                        {/* Name */}
                                        <div className="flex-1 w-full lg:w-auto">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">이벤트명</label>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full bg-${colorName}-50 dark:bg-${colorName}-900/30 flex items-center justify-center text-${colorName}-500 dark:text-${colorName}-400 flex-shrink-0`}>
                                                    {isIncome ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                                                </div>
                                                <input 
                                                    type="text" 
                                                    value={event.name} 
                                                    onChange={(e) => updateFn(index, 'name', e.target.value)}
                                                    className="w-full bg-transparent border-b border-transparent focus:border-current text-gray-900 dark:text-white font-bold focus:outline-none py-1 transition-colors placeholder-gray-400"
                                                    placeholder="이벤트 이름"
                                                />
                                            </div>
                                        </div>

                                        {/* Amount */}
                                        <div className="w-full lg:w-32">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">금액 (만원)</label>
                                            <div className="relative">
                                                <CalculatorInput 
                                                    value={event.amount} 
                                                    onChange={(e) => updateFn(index, 'amount', e.target.value)}
                                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-right font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50 focus:outline-none"
                                                    style={{ borderColor: isIncome ? '#10b981' : '#f97316' }}
                                                    displayMode={displayMode}
                                                />
                                            </div>
                                        </div>

                                        {/* Day */}
                                        <div className="w-full lg:w-20">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">발생일</label>
                                            <select 
                                                value={event.day || 30} 
                                                onChange={(e) => updateFn(index, 'day', Number(e.target.value))}
                                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-center font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50 focus:outline-none"
                                            >
                                                {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                                                    <option key={day} value={day}>{day}일</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Date Range */}
                                        <div className="w-full lg:w-auto flex gap-2">
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">시작 월</label>
                                                <input type="month" value={event.startMonth} onChange={(e) => updateFn(index, 'startMonth', e.target.value)} className="w-32 text-xs border rounded px-2 py-1.5 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">종료 월</label>
                                                <input type="month" value={event.endMonth} onChange={(e) => updateFn(index, 'endMonth', e.target.value)} className="w-32 text-xs border rounded px-2 py-1.5 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600" />
                                            </div>
                                        </div>

                                        {/* Target */}
                                        <div className="w-full lg:w-auto">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">{isIncome ? '입금 계좌' : '출금 계좌'}</label>
                                            <div className="flex gap-1">
                                                <select 
                                                    value={event.targetSector} 
                                                    onChange={(e) => updateFn(index, 'targetSector', e.target.value)}
                                                    className="w-24 text-xs border rounded px-2 py-1.5 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600"
                                                >
                                                    {Object.keys(sectorInfo).map(key => <option key={key} value={key}>{sectorInfo[key].name}</option>)}
                                                </select>
                                                <select 
                                                    value={event.targetAsset} 
                                                    onChange={(e) => updateFn(index, 'targetAsset', e.target.value)}
                                                    className="w-24 text-xs border rounded px-2 py-1.5 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600"
                                                >
                                                    {assets[event.targetSector]?.map((asset, i) => <option key={i} value={i}>{asset.name}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-end h-full pb-1 gap-1">
                                            <div className="flex flex-col gap-0.5 mr-1">
                                                <button onClick={() => moveFn(index, -1)} disabled={index === 0} className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-30"><svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg></button>
                                                <button onClick={() => moveFn(index, 1)} disabled={index === events.length - 1} className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-30"><svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg></button>
                                            </div>
                                            <button onClick={() => removeFn(index)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors" title="삭제">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {events.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-10 text-gray-400 bg-gray-50/50 dark:bg-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={addFn}>
                                    <div className={`w-14 h-14 bg-${colorName}-50 dark:bg-${colorName}-900/20 rounded-full flex items-center justify-center mb-3`}>
                                        <span className="text-2xl">{icon}</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">등록된 이벤트가 없습니다</p>
                                    <p className={`text-xs text-${colorName}-500 mt-1 font-bold`}>+ 첫 번째 이벤트 추가하기</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        });

        // SavedScenariosCarousel component has been moved to src/components/ScenarioComponents.jsx

        const AssetDashboard = () => {
            // config.js에서 로드된 sectorInfo 사용
            const sectorInfo = window.sectorInfo || {};
            
            // [수정] utils.js의 유틸리티 함수들을 로컬 스코프로 가져오기 (ReferenceError 방지)
            const { 
                formatNumber, formatPercent, calculateGrossTotal, getSectorTotals, 
                calculateMonthlyProjection, withRetry, encryptData, decryptData, 
                getRGB, createGradient, calculateGoalReachMonth, normalizeTargets, getEncryptionKey
            } = window;

            // ===== 모든 상태를 먼저 선언 =====
            const { state: appData, setState: setAppData, undo, redo, canUndo, canRedo, reset: resetAppData } = useUndoRedo(null);
            const [darkMode, setDarkMode] = useState(() => localStorage.getItem('assetDashboardDarkMode') === 'true');
            const [inflationRate, setInflationRate] = useState(2.5);
            const [scenarios, setScenarios] = useState([]);
            const [originalUserData, setOriginalUserData] = useState(null); // [추가] 원본 데이터 캐시
            const [isDemoMode, setIsDemoMode] = useState(false); // [추가] 데모 모드 상태
            const [isPro, setIsPro] = useState(false); // [추가] 유료 이용자 여부
            const [isAdmin, setIsAdmin] = useState(false); // [추가] 관리자 여부
            const [adminSuggestions, setAdminSuggestions] = useState([]); // [추가] 관리자용 사용자 의견 목록
            const [verifiedEmail, setVerifiedEmail] = useState(null);
            const [userProfile, setUserProfile] = useState(null); // [추가] 사용자 프로필 정보
            const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'synced' | 'error'
            const [syncError, setSyncStatusError] = useState(''); // [추가] 구체적 에러 메시지
            const [dbStatus, setDbStatus] = useState('idle'); // [추가] DB 연결 상태
            const [isLoadingCloud, setIsLoadingCloud] = useState(false); // [추가] 클라우드 로딩 상태
            const [isLoading, setIsLoading] = useState(true); // [추가] 앱 초기 로딩 상태
            const [isInitialized, setIsInitialized] = useState(false); // [추가] 초기화 완료 상태
            const isFetchingRef = useRef(false); // [추가] 동기화 무한 루프 방지를 위한 Ref
            const isProcessing = useRef(false); // [추가] 상태 업데이트 락(Lock)
            const [isCloudLoaded, setIsCloudLoaded] = useState(false); // [추가] 클라우드 데이터 로드 완료 여부 (Race Condition 방지)
            const lastSavedDataRef = useRef(''); // [추가] 중복 저장 방지를 위한 데이터 스냅샷
            const isCheckingSubscriptionRef = useRef(false); // [추가] 구독 확인 중복 실행 방지 Ref
            const [lastSyncTime, setLastSyncTime] = useState(null); // [추가] 마지막 동기화 시간
            const [analysisMode, setAnalysisMode] = useState('growth'); // [추가] 상세 분석 모드 ('growth' | 'income')
            const [editingPhase, setEditingPhase] = useState(null); // [추가] 페이즈 편집 상태 추적
            const editingPhaseRef = useRef(null); // [보안] 단축키 강제 저장을 위한 실시간 상태 추적 Ref

            const [enableLiveQuotes, setEnableLiveQuotes] = useState(() => {
                return localStorage.getItem('asset_enable_live_quotes') !== 'false';
            });
            useEffect(() => {
                localStorage.setItem('asset_enable_live_quotes', enableLiveQuotes.toString());
            }, [enableLiveQuotes]);

            // [개편] 탭 상태 및 분류 재정의
            const [activeTab, setActiveTab] = useState('input'); // 기본값은 데이터 입력
            const TAB_MAPPING = {
                input: ['assets', 'expenses', 'events', 'memo', 'rebalance'], // 입력
                visualization: ['budget', 'charts', 'history', 'scenario'], // 시각화 (요약은 항상 표시되므로 메뉴에서 제외)
                analysis: ['detail-analysis', 'assumptions'] // 분석
            };
            


            // [추가] 의견 보내기 버튼 표시 여부 상태
            const [showSuggestionButton, setShowSuggestionButton] = useState(() => localStorage.getItem('assetShowSuggestionButton') !== 'false');
            useEffect(() => { localStorage.setItem('assetShowSuggestionButton', showSuggestionButton); }, [showSuggestionButton]);

            // [추가] 사이드바 섹터 순서 상태 관리 및 드래그 핸들러
            const [sidebarSectorOrder, setSidebarSectorOrder] = useState(() => {
                return [
                    { id: 'input', label: '📥 데이터 입력' },
                    { id: 'visualization', label: '📈 시각화' },
                    { id: 'analysis', label: '🔍 분석' }
                ];
            });
            useEffect(() => {
                localStorage.setItem('assetDashboardSidebarSectorOrder', JSON.stringify(sidebarSectorOrder));
            }, [sidebarSectorOrder]);


            const [assetHistory, setAssetHistory] = useState([]);
            const [showProjectionInHistory, setShowProjectionInHistory] = useState(false);
            const [referenceScenarios, setReferenceScenarios] = useState([]); // [수정] 다중 비교 기준 시나리오 {id, color}
            const [logoutBehavior, setLogoutBehavior] = useState(() => localStorage.getItem('assetLogoutBehavior') || 'keep');
            useEffect(() => { localStorage.setItem('assetLogoutBehavior', logoutBehavior); }, [logoutBehavior]);


            const { SUPABASE_URL, SUPABASE_KEY, SECURITY_KEY } = useMemo(() => window.validateSupabaseConfig ? window.validateSupabaseConfig() : {}, []);

            const supabase = useMemo(() => {
                // 플레이스홀더 체크: 빌드가 안 되었거나 환경변수가 없으면 클라이언트 생성 안 함
                if (!window.supabase || !SUPABASE_URL || !SUPABASE_KEY) {
                    if (window.supabase) console.warn("Supabase: Config missing or empty. URL:", SUPABASE_URL, "KEY:", !!SUPABASE_KEY);
                    return null;
                }
                
                try {
                    return window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
                } catch (e) {
                    console.error("Supabase client creation failed:", e);
                    return null;
                }
            }, [SUPABASE_URL, SUPABASE_KEY]);
            

            const [goalSeekResult, setGoalSeekResult] = useState(null);
            // 차트 ref들
            const currentPieRef = useRef(null);
            const projectedPieRef = useRef(null);
            const comparisonBarRef = useRef(null);
            const historyChartRef = useRef(null);
            // 섹터 접힘 상태는 항상 상단에서 선언하여 훅 순서 고정
            const [hiddenSectors, setHiddenSectors] = useState(() => {
                try {
                    const raw = localStorage.getItem('assetDashboardHiddenSectors');
                    return raw ? JSON.parse(raw) : {};
                } catch { return {}; }
            });
            useEffect(()=>{
                try {
                    localStorage.setItem('assetDashboardHiddenSectors', JSON.stringify(hiddenSectors));
                } catch {}
            }, [hiddenSectors]);

            const [isDataManageModalOpen, setIsDataManageModalOpen] = useState(false); // [통합] 데이터 관리 모달 상태
            const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false); // [추가] 개인정보처리방침 모달 상태
            const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false); // [추가] 기능 제안 모달 상태
            const [isProModalOpen, setIsProModalOpen] = useState(false); // [추가] PRO 기능 안내 모달 상태
            const [isQuickPanelOpen, setIsQuickPanelOpen] = useState(false); // [추가] 모바일 퀵 패널 상태
            const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false); // [추가] 통합 설정 모달 상태
            const [isGuideOpen, setIsGuideOpen] = useState(false); // [추가] 온보딩 가이드 상태
            const [showSaveToast, setShowSaveToast] = useState(false); // [추가] 저장 피드백 상태
            const [encryptionMode, setEncryptionMode] = useState(null); // [추가] 암호화 모드
            const [userSecretKey, setUserSecretKey] = useState(() => sessionStorage.getItem('assetDashboardSecretKey') || ''); // [수정] 세션 스토리지 연동
            const [isEncryptionModalOpen, setIsEncryptionModalOpen] = useState(false); // [추가] 암호화 선택 모달
            const [isPasswordPromptOpen, setIsPasswordPromptOpen] = useState(false); // [추가] 비밀번호 입력 모달
            const [currentDrillDown, setCurrentDrillDown] = useState(null); // [수정] 현재 차트 드릴다운 상태
            const [projectedDrillDown, setProjectedDrillDown] = useState(null); // [수정] 예상 차트 드릴다운 상태
            
            const [draggedSectorId, setDraggedSectorId] = useState(null); // [추가] 드래그 중인 섹터 ID

            const handleSectorDragStart = (e, id) => { setDraggedSectorId(id); e.dataTransfer.effectAllowed = "move"; };
            const handleSectorDrop = (e, targetId) => {
                e.preventDefault();
                if (!draggedSectorId || draggedSectorId === targetId) return;
                setSidebarSectorOrder(prev => {
                    const oldIdx = prev.findIndex(s => s.id === draggedSectorId);
                    const newIdx = prev.findIndex(s => s.id === targetId);
                    const newOrder = [...prev];
                    const [removed] = newOrder.splice(oldIdx, 1);
                    newOrder.splice(newIdx, 0, removed);
                    return newOrder;
                });
                setDraggedSectorId(null);
            };

            const [editingRebalanceSector, setEditingRebalanceSector] = useState(null); // [추가] 리밸런싱 상세 편집 섹터
            const [iconPickerState, setIconPickerState] = useState(null); // [추가] 아이콘 선택기 상태 { sector, index }
            const [isAIModalOpen, setIsAIModalOpen] = useState(false); // [추가] AI 분석 모달 상태
            const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false); // [추가] API 키 설정 모달 상태
            const [isHistoryActionModalOpen, setIsHistoryActionModalOpen] = useState(false); // [추가] 히스토리 액션 모달
            const [pendingHistoryData, setPendingHistoryData] = useState(null); // [추가] 로드 대기 중인 히스토리 데이터
            const [activePanel, setActivePanel] = useState('summary'); // [추가] 현재 화면에 보이는 패널 감지
            const [isAdminModalOpen, setIsAdminModalOpen] = useState(false); // [추가] 관리자 대시보드 모달 상태
            const [isConsentModalOpen, setIsConsentModalOpen] = useState(false); // [추가] 데이터 동의 모달 상태
            const [activeNotice, setActiveNotice] = useState(null); // [추가] 활성화된 공지사항
            const [activeReply, setActiveReply] = useState(null); // [추가] 관리자 답변 배너 상태
            const [historyPopover, setHistoryPopover] = useState(null); // [추가] 히스토리 팝오버 상태
            const [scenarioSortOrder, setScenarioSortOrder] = useState('default'); // [추가] 시나리오 정렬 순서
            const [historyViewMode, setHistoryViewMode] = useState('net'); // [추가] 히스토리 지표 토글
            const activeHistoryHoverRef = useRef(null); // [추가] 히스토리 차트 호버 상태 추적 (깜빡임 방지용)
            const [historyChartInfo, setHistoryChartInfo] = useState(null); // [추가] 히스토리 차트 상단 정보바 상태
            const lastHistoryInfoRef = useRef(null); // [추가] 정보바 업데이트 최적화용 Ref
            
            const [livePriceEnabled, setLivePriceEnabled] = useState(() => localStorage.getItem('toss_live_price_enabled') === 'true');
            const [livePriceInterval, setLivePriceInterval] = useState(() => Number(localStorage.getItem('toss_live_price_interval')) || 60);
            const [isDiffModalOpen, setIsDiffModalOpen] = useState(false); // [추가] Diff 모달 상태
            const [diffData, setDiffData] = useState(null); // [추가] Diff 데이터
            const [isGameModalOpen, setIsGameModalOpen] = useState(false); // [추가] 미니게임 모달 상태
            const [isScreenshotModalOpen, setIsScreenshotModalOpen] = useState(false); // [추가] 스크린샷 모달 상태
            const [activeBanner, setActiveBanner] = useState('ai'); // [추가] 사이드바 배너 탭 상태
            const [scenarioToExport, setScenarioToExport] = useState(null); // [추가] 내보낼 시나리오 상태
            const [activeAssetTab, setActiveAssetTab] = useState('cash'); // [추가] 자산 상세 탭 상태
            const [assetTouchStart, setAssetTouchStart] = useState({ x: null, y: null }); // [추가] 자산 탭 스와이프 상태
            const [assetTouchEnd, setAssetTouchEnd] = useState({ x: null, y: null }); // [추가] 자산 탭 스와이프 상태
            const [stockLinkState, setStockLinkState] = useState(null); // [추가] 종목 연동 모달 대상 자산 {sectorKey, index, asset}
            const [isExporting, setIsExporting] = useState(false); // [추가] PDF 내보내기 모드 상태

            const isLocal = useMemo(() => window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1', []);

            const [currentMemoIndex, setCurrentMemoIndex] = useState(0);
            const [isEditingMemoTitle, setIsEditingMemoTitle] = useState(false);
            const [tempMemoTitle, setTempMemoTitle] = useState('');
            const [isMemoGridView, setIsMemoGridView] = useState(false); // [STEP 1] 모아보기
            const [isMemoPreview, setIsMemoPreview] = useState(false); // [추가] 메모 미리보기 모드
            const [isMemoExpanded, setIsMemoExpanded] = useState(false); // [STEP 1] 펼쳐보기
            const [toasts, setToasts] = useState([]);
            const addToast = React.useCallback((message, type = 'info') => {
                const id = Date.now();
                setToasts(prev => {
                    // [수정] FIFO 로직: 최대 3개까지만 유지하고, 오래된(위쪽) 알림부터 자연스럽게 제거
                    const newToasts = [...prev, { id, message, type }];
                    return newToasts.slice(-3);
                });
            }, []);
            const removeToast = React.useCallback((id) => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, []);

            const chartInstancesRef = useRef({}); // [추가] 차트 인스턴스 관리용 Ref
            const pendingCiphertext = useRef(null);
            const pendingSave = useRef(false);

            const [layoutOrder, setLayoutOrder] = useState(() => {
                try {
                    const savedOrder = localStorage.getItem('assetDashboardLayoutOrder');
                    const defaultOrder = window.DEFAULT_LAYOUT_ORDER || ['summary', 'scenario', 'charts', 'history', 'budget', 'memo', 'rebalance', 'assets', 'expenses', 'events', 'detail-analysis', 'assumptions'];
                    if (savedOrder) {
                        const parsed = JSON.parse(savedOrder);
                        const missing = defaultOrder.filter(id => !parsed.includes(id));
                        return [...parsed, ...missing];
                    }
                    return defaultOrder;
                } catch {
                    return window.DEFAULT_LAYOUT_ORDER || ['summary', 'scenario', 'charts', 'history', 'budget', 'memo', 'rebalance', 'assets', 'expenses', 'events', 'detail-analysis', 'assumptions'];
                }
            });
            useEffect(() => {
                localStorage.setItem('assetDashboardLayoutOrder', JSON.stringify(layoutOrder));
            }, [layoutOrder]);

            const [panelCollapseState, setPanelCollapseState] = useState(() => {
                try {
                    const savedState = localStorage.getItem('assetDashboardPanelCollapse');
                    return savedState ? JSON.parse(savedState) : {};
                } catch {
                    return {};
                }
            });
            useEffect(() => {
                localStorage.setItem('assetDashboardPanelCollapse', JSON.stringify(panelCollapseState));
            }, [panelCollapseState]);

            const [assetSectorOrder, setAssetSectorOrder] = useState(() => {
                try {
                    const savedOrder = localStorage.getItem('assetDashboardAssetSectorOrder');
                    const defaultOrder = window.DEFAULT_SECTOR_ORDER || ['deposit', 'savings', 'investment', 'pension', 'realestate', 'car', 'loan', 'misc'];
                    return savedOrder ? JSON.parse(savedOrder) : defaultOrder;
                } catch {
                    return window.DEFAULT_SECTOR_ORDER || ['deposit', 'savings', 'investment', 'pension', 'realestate', 'car', 'loan', 'misc'];
                }
            });
            useEffect(() => {
                localStorage.setItem('assetDashboardAssetSectorOrder', JSON.stringify(assetSectorOrder));
            }, [assetSectorOrder]);

            // [추가] 토스 실시간 시세 연동 타이머 & AI 분석 모달 오픈 핸들러
            const runTossLivePriceSync = async () => {
                const enabled = localStorage.getItem('toss_live_price_enabled') === 'true';
                if (!enabled) return;
                
                const clientId = localStorage.getItem('toss_client_id');
                const clientSecret = localStorage.getItem('toss_client_secret');
                if (!clientId || !clientSecret) return;

                // 백그라운드 탭 지연 방지 (비활성 시 스킵)
                if (document.hidden) return;

                const appDataCur = appDataRef.current;
                if (!appDataCur || !appDataCur.assets) return;

                const symbolsToFetch = new Set();
                let hasUnresolvedTickers = false;
                Object.keys(appDataCur.assets).forEach(sector => {
                    const list = appDataCur.assets[sector] || [];
                    list.forEach(asset => {
                        if (asset.linkedItems && Array.isArray(asset.linkedItems)) {
                            asset.linkedItems.forEach(item => {
                                if (item.autoUpdate !== false && item.ticker) {
                                    if (item.ticker === '사용자 입력 필요') {
                                        hasUnresolvedTickers = true;
                                    } else {
                                        symbolsToFetch.add(item.ticker);
                                    }
                                }
                            });
                        }
                    });
                });

                if (symbolsToFetch.size === 0 && !hasUnresolvedTickers) return;

                try {
                    const quotes = symbolsToFetch.size > 0 ? await window.fetchTossQuotes(Array.from(symbolsToFetch)) : {};
                    
                    setAppData(prevData => {
                        if (!prevData || !prevData.assets) return prevData;
                        const newAssets = { ...prevData.assets };
                        let hasChanges = false;

                        Object.keys(newAssets).forEach(sector => {
                            newAssets[sector] = newAssets[sector].map(asset => {
                                if (asset.linkedItems && Array.isArray(asset.linkedItems)) {
                                    let assetChanged = false;
                                    const newLinkedItems = asset.linkedItems.map(item => {
                                        if (item.autoUpdate !== false && item.ticker) {
                                            if (item.ticker === '사용자 입력 필요') {
                                                const targetStatus = 'error';
                                                const targetPrice = item.currentPrice;
                                                const targetCurrency = 'KRW';
                                                const targetError = '티커 번호(6자리 코드 등)를 수정하여 올바른 시세를 연동해 주세요.';
                                                
                                                if (item.currentPrice !== targetPrice || item.syncStatus !== targetStatus || item.syncErrorReason !== targetError || item.currency !== targetCurrency) {
                                                    assetChanged = true;
                                                    hasChanges = true;
                                                    return { ...item, currentPrice: targetPrice, currency: targetCurrency, syncStatus: targetStatus, syncErrorReason: targetError };
                                                }
                                                return item;
                                            }
                                            const q = quotes[item.ticker];
                                            const targetStatus = (q && q.price) ? 'online' : 'error';
                                            
                                            let targetPrice = item.currentPrice;
                                            if (q && q.price) {
                                                const isUsStock = /^[A-Za-z]/.test(item.ticker);
                                                const safeFxRate = Number(localStorage.getItem('asset_last_usd_krw')) || 1420;
                                                targetPrice = isUsStock ? Math.round(q.price * safeFxRate) : q.price;
                                            }
                                            const targetCurrency = 'KRW'; // Always store and sync in KRW
                                            const targetError = (q && q.price) ? null : '종목 코드를 찾을 수 없거나 데이터가 비어 있습니다.';
                                            
                                            if (item.currentPrice !== targetPrice || item.syncStatus !== targetStatus || item.syncErrorReason !== targetError || item.currency !== targetCurrency) {
                                                assetChanged = true;
                                                hasChanges = true;
                                                return { ...item, currentPrice: targetPrice, currency: targetCurrency, syncStatus: targetStatus, syncErrorReason: targetError };
                                            }
                                        }
                                        return item;
                                    });

                                    if (assetChanged) {
                                        let linkedTotal = 0;
                                        newLinkedItems.forEach(item => {
                                            const curPrice = parseFloat(item.currentPrice) || 0;
                                            const shares = parseFloat(item.shares) || 0;
                                            linkedTotal += (curPrice * shares) / 10000;
                                        });
                                        const newAmount = (Number(asset.baseAmount) || 0) + linkedTotal;

                                        return {
                                            ...asset,
                                            amount: Math.round(newAmount * 100) / 100,
                                            linkedItems: newLinkedItems
                                        };
                                    }
                                }
                                return asset;
                            });
                        });

                        if (hasChanges) {
                            return { ...prevData, assets: newAssets };
                        }
                        return prevData;
                    });
                } catch (e) {
                    console.error("Toss sync failed, fallback to error status:", e);
                    const errorMsg = e.message || '알 수 없는 API 에러';
                    
                    // 에러 상태로 뱃지를 전환하기 위한 상태 갱신
                    setAppData(prevData => {
                        if (!prevData || !prevData.assets) return prevData;
                        const newAssets = { ...prevData.assets };
                        let hasChanges = false;

                        Object.keys(newAssets).forEach(sector => {
                            newAssets[sector] = newAssets[sector].map(asset => {
                                if (asset.linkedItems && Array.isArray(asset.linkedItems)) {
                                    let assetChanged = false;
                                    const newLinkedItems = asset.linkedItems.map(item => {
                                        if (item.autoUpdate !== false && item.ticker) {
                                            if (item.syncStatus !== 'error' || item.syncErrorReason !== errorMsg) {
                                                assetChanged = true;
                                                hasChanges = true;
                                                return { ...item, syncStatus: 'error', syncErrorReason: errorMsg };
                                            }
                                        }
                                        return item;
                                    });

                                    if (assetChanged) {
                                        return {
                                            ...asset,
                                            linkedItems: newLinkedItems
                                        };
                                    }
                                }
                                return asset;
                            });
                        });

                        if (hasChanges) {
                            return { ...prevData, assets: newAssets };
                        }
                        return prevData;
                    });
                }
            };

            useEffect(() => {
                if (!livePriceEnabled) return;
                
                const intervalMs = Math.max(2, livePriceInterval) * 1000;
                const intervalId = setInterval(runTossLivePriceSync, intervalMs);
                
                const handleVisibilityChange = () => {
                    if (!document.hidden) {
                        runTossLivePriceSync();
                    }
                };
                
                document.addEventListener('visibilitychange', handleVisibilityChange);
                runTossLivePriceSync();

                return () => {
                    clearInterval(intervalId);
                    document.removeEventListener('visibilitychange', handleVisibilityChange);
                };
            }, [livePriceEnabled, livePriceInterval]);

            useEffect(() => {
                // 모달 등에서 원격으로 API 설정 창을 띄울 수 있도록 전역 바인딩
                window.showApiKeyModal = () => setIsApiKeyModalOpen(true);
                return () => {
                    window.showApiKeyModal = null;
                };
            }, []);

            const handleOpenAIAnalysis = () => {
                const key = localStorage.getItem('asset_gemini_api_key');
                if (!key || !key.trim()) {
                    setIsApiKeyModalOpen(true);
                    addToast('AI 분석을 위해 Gemini API 키를 등록해주세요.', 'warning');
                } else {
                    setIsAIModalOpen(true);
                }
            };

            // [추가] 스크롤 스파이 로직: 현재 화면에 보이는 섹션을 감지하여 사이드바에 반영
            useEffect(() => {
                if (isLoading) return;

                const observerOptions = {
                    root: null,
                    rootMargin: '-15% 0px -75% 0px', // 화면 상단 지점을 지날 때 활성 상태로 간주
                    threshold: 0
                };

                const observerCallback = (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            setActivePanel(entry.target.id);
                        }
                    });
                };

                const observer = new IntersectionObserver(observerCallback, observerOptions);
                layoutOrder.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) observer.observe(el);
                });

                // [추가] 하단 도달 감지 리스너 (마지막 섹션 볼드 처리용)
                const handleScrollCheck = () => {
                    const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 20;
                    if (isAtBottom) {
                        const currentVisiblePanels = layoutOrder.filter(id => 
                            id === 'summary' || (TAB_MAPPING[activeTab] && TAB_MAPPING[activeTab].includes(id))
                        );
                        if (currentVisiblePanels.length > 0) {
                            setActivePanel(currentVisiblePanels[currentVisiblePanels.length - 1]);
                        }
                    }
                };

                window.addEventListener('scroll', handleScrollCheck);
                return () => {
                    observer.disconnect();
                    window.removeEventListener('scroll', handleScrollCheck);
                };
            }, [layoutOrder, activeTab, isLoading]);

            const scrollToPanel = (id) => {
                const element = document.getElementById(id);
                if (element) {
                    const headerOffset = 100;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                }
            };

            // ===== 초기 데이터 로드 =====
            useEffect(() => {
                const loadInitialData = async () => {
                    try {

                    const baseData = window.publicDefaultData || {};
                    let mergedData = baseData;
                    
                    // 1. 로컬 데이터 로드 시도
                    try {
                        const savedData = localStorage.getItem('assetDashboardDataV3');
                        const savedScenarios = localStorage.getItem('assetDashboardScenarios');
                        const savedHistory = localStorage.getItem('assetDashboardHistory');
                        const savedReferences = localStorage.getItem('assetDashboardReferenceScenarios');

                        const initialScenarios = savedScenarios ? JSON.parse(savedScenarios) : (baseData.scenarios || []);
                        const initialHistory = savedHistory ? JSON.parse(savedHistory) : (baseData.history || []);
                        const initialReferences = savedReferences ? JSON.parse(savedReferences) : [];
                        
                        setScenarios(initialScenarios);
                        setAssetHistory(initialHistory);
                        setReferenceScenarios(initialReferences);

                if (savedData) {
                            const parsedData = JSON.parse(savedData);
                            mergedData = {
                                ...baseData,
                                ...parsedData,
                                assets: { ...baseData.assets, ...parsedData.assets }, 
                                rebalancingAlerts: { ...baseData.rebalancingAlerts, ...parsedData.rebalancingAlerts },
                            };
                            if (mergedData.memo === undefined) mergedData.memo = baseData.memo;

                            // 마이그레이션: ID, 대출 시작일, 다크모드 필드 보강
                            Object.keys(parsedData.assets||{}).forEach(sector=>{
                                (parsedData.assets[sector]||[]).forEach(a=>{ 
                                    if (!a.id) a.id = Date.now() + Math.random();
                                    if (sector === 'loan' && !a.loanStartDate) a.loanStartDate = parsedData.baseMonth || baseData.baseMonth;
                                });
                            });

                            // 마이그레이션: 자산별 수수료/세금 필드 기본값(0)
                            Object.keys(parsedData.assets||{}).forEach(sector=>{
                                (parsedData.assets[sector]||[]).forEach(a=>{ if (a.feeRate === undefined) a.feeRate = 0; });
                            });
                            setAppData(mergedData); // [수정] parsedData 대신 mergedData 사용
                            setOriginalUserData(parsedData); // [추가]
                            lastSavedDataRef.current = JSON.stringify({ appData: mergedData, scenarios: initialScenarios, assetHistory: initialHistory, referenceScenarios: initialReferences });
                        } else {
                            setAppData(baseData);
                            setOriginalUserData(baseData); // [추가]
                            lastSavedDataRef.current = JSON.stringify({ appData: baseData, scenarios: initialScenarios, assetHistory: initialHistory, referenceScenarios: initialReferences });
                        }
                    } catch (error) {
                        console.error("로컬 데이터 로드 오류 (초기화 진행):", error);
                        // [수정] 데이터 손상 시 로컬스토리지 초기화하여 무한 로딩/에러 방지
                        localStorage.removeItem('assetDashboardDataV3');
                        setAppData(baseData);
                        lastSavedDataRef.current = JSON.stringify(baseData);
                    }

                    if (supabase) {
                        setDbStatus('connected');
                        const { data: { session } } = await withRetry(() => supabase.auth.getSession(), 3, 2000)
                            .catch(err => ({ data: { session: null }, error: err }));
                        
                        if (session) {
                            await checkSubscription(session, false, mergedData);
                        }
                    } else {
                        console.log('Mode: Local Storage');
                        setDbStatus('local');
                    }
                    } catch (error) {
                        console.error("Initialization error:", error);
                        setDbStatus('error');
                    } finally {
                        setIsLoading(false);
                        setIsInitialized(true);
                    }
                };
                
                loadInitialData();
            }, [supabase]);

            useEffect(() => {
                const guideCompleted = localStorage.getItem('asset_planner_guide_completed');
                if (!isLoading && !guideCompleted) {
                    setIsGuideOpen(true);
                }
            }, [isLoading]);

            const appDataRef = useRef(appData);
            useEffect(() => { appDataRef.current = appData; }, [appData]);
        const scenariosRef = useRef(scenarios);
        const assetHistoryRef = useRef(assetHistory);

        const saveToCloud = React.useCallback(async (unifiedData, force = false, emailOverride = null, proOverride = null, keyOverride = null, modeOverride = null) => {
            if (!supabase) {
                if (force) console.warn("Cloud save skipped: Supabase not initialized.");
                return;
            }

            const targetEmail = emailOverride || verifiedEmail;
            const targetPro = proOverride !== null ? proOverride : isPro;
            // [수정] FREE 유저도 기본적으로 'normal' 암호화 적용 (데이터 보호 및 로직 통일)
            const targetMode = targetPro ? (modeOverride || encryptionMode) : 'normal';

            // [수정] force가 true일 경우(비밀번호 복구 등) isCloudLoaded 상태와 무관하게 저장 허용
            if (!targetEmail || isDemoMode || !unifiedData || !isInitialized) return;
            if (!force && !isCloudLoaded) return;
            if (!force && isFetchingRef.current) return;

            const currentDataStr = JSON.stringify(unifiedData);
            if (!force && currentDataStr === lastSavedDataRef.current) return;

            let payloadData = unifiedData;
            // [수정] targetMode가 있으면 암호화 시도 (PRO 여부 무관)
            if (targetMode) {
                let key = keyOverride;
                
                if (!key) {
                    let secret = null;
                    if (targetMode === 'secure') {
                        secret = userSecretKey || sessionStorage.getItem('assetDashboardSecretKey');
                        if (!secret) {
                            pendingSave.current = true;
                            setIsPasswordPromptOpen(true);
                            return;
                        }
                    }
                    key = getEncryptionKey(targetMode, secret, targetEmail, SECURITY_KEY);
                }

                if (!key) {
                    if (targetMode === 'normal') {
                        addToast('Cloud sync disabled: System Security Key missing.', 'error');
                    } else {
                        addToast('보안 키 설정 오류로 저장이 중단되었습니다.', 'error');
                    }
                    setSyncStatus('error');
                    return;
                }
                try {
                    payloadData = await encryptData(unifiedData, key);
                } catch (e) {
                    console.error("Encryption error:", e);
                    addToast('데이터 암호화 중 오류가 발생했습니다.', 'error');
                    setSyncStatus('error');
                    return; // Early return on encryption failure
                }
            }

            setSyncStatus('syncing');
            try {
                    // [수정] 클라우드 저장 시에도 로컬 날짜 기준 사용 (히스토리와 일관성 유지)
                    const now = new Date();
                    // [수정] 1900년 고정 해제: FREE/PRO 모두 실제 저장 날짜 기록
                    const recordDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

                await withRetry(() => supabase.auth.refreshSession());

                // [추가] FREE 유저는 단일 레코드 유지를 위해 오늘 날짜가 아닌 과거 데이터 삭제
                if (!targetPro) {
                    await withRetry(() => supabase.from('user_assets').delete().eq('email', targetEmail).neq('record_date', recordDate));
                }

                const { data, error } = await withRetry(() => 
                    supabase.from('user_assets').upsert({ 
                        email: targetEmail, data: payloadData,
                        encryption_type: targetMode,
                        updated_at: new Date().toISOString(),
                            record_date: recordDate
                    }, { onConflict: 'email,record_date' }).select('updated_at').single()
                );
                if (error) {
                    console.error('Supabase Upsert Error:', error.code, error.message);
                    throw error;
                }
                if (data) {
                    setSyncStatus('synced');
                    setLastSyncTime(new Date().toLocaleTimeString('ko-KR', { hour12: false }));
                    localStorage.setItem('assetDashboardLastUpdate', data.updated_at);
                    lastSavedDataRef.current = currentDataStr;
                }
            } catch (error) {
                console.error('Sync error:', error);
                setSyncStatus('error');
                setSyncStatusError(error.message || '저장 실패');
                setLastSyncTime(null);
            } // This finally block was removed as it was empty and unnecessary
        }, [verifiedEmail, isPro, encryptionMode, userSecretKey, userProfile, isDemoMode, supabase, isInitialized, isCloudLoaded, withRetry, getEncryptionKey]);

        // 클라우드 데이터 불러오기
        const fetchFromCloud = React.useCallback(async (email = verifiedEmail, pro = isPro, isInitialLoad = false, isManual = false, localDataOverride = null) => {
            if (!supabase || isProcessing.current || isFetchingRef.current) return;
            isFetchingRef.current = true; // Lock fetching
            setSyncStatus('syncing');
            setIsLoadingCloud(true);
            try {
                const { data, error } = await withRetry(() => 
                    supabase.from('user_assets')
                        .select('data, updated_at, encryption_type')
                        .eq('email', email)
                        .order('updated_at', { ascending: false })
                        .limit(1)
                        .maybeSingle()
                );
                if (error) throw error;

                if (data && data.data) {
                    const encType = data.encryption_type;
                    const isLegacy = !encType || encType === 'none';
                    if (pro && isLegacy) setIsEncryptionModalOpen(true);
                    else if (pro) setEncryptionMode(encType);

                    let decryptedData = data.data;
                    // [수정] PRO 여부와 관계없이 암호화된 데이터면 복호화 시도
                    if (!isLegacy) {
                        let secret = null;
                        if (encType === 'secure') {
                            secret = userSecretKey || sessionStorage.getItem('assetDashboardSecretKey');
                            if (!secret) {
                                pendingCiphertext.current = data.data;
                                setIsPasswordPromptOpen(true);
                                return; // finally block will handle state reset
                            }
                        }
                        
                        // [Fix] Consistent Encryption Identity: Always use email via global helper
                        const key = getEncryptionKey(encType, secret, email, SECURITY_KEY);

                        // [수정] 일반 모드에서 보안 키(SECURITY_KEY)가 없는 경우 예외 처리
                        if (!key && encType === 'normal') {
                            addToast('시스템 보안 키가 설정되지 않아 데이터를 불러올 수 없습니다. (환경변수 확인 필요)', 'error');
                            setSyncStatus('error');
                            return; // finally block will handle state reset
                        }

                        try {
                            decryptedData = await decryptData(data.data, key);
                        } catch (err) {
                            let recovered = false;
                            // [추가] 이전 버전 데이터(이메일 솔트 없음) 복구 시도 (Fallback)
                            if (encType === 'normal' && SECURITY_KEY && key !== SECURITY_KEY) {
                                try {
                                    decryptedData = await decryptData(data.data, SECURITY_KEY);
                                    recovered = true;
                                    addToast('이전 보안 형식의 데이터를 변환하여 불러왔습니다.', 'success');
                                } catch (e) { /* Fallback failed */ }
                            }

                            if (!recovered) {
                                if (encType === 'normal') {
                                    // [수정] 덮어쓰기 전 유효한 보안 키가 있는지 먼저 확인 (무한 루프 방지)
                                    const newKey = getEncryptionKey('normal', null, email, SECURITY_KEY);
                                    if (!newKey) {
                                        addToast("시스템 보안 키(SECURITY_KEY)가 설정되지 않아 데이터를 덮어쓸 수 없습니다. 환경변수를 확인하거나 설정에서 '보안 모드'로 전환하세요.", 'error');
                                        setSyncStatus('error');
                                        return;
                                    }

                                    // [Fix] Safe Recovery: Block overwrite if local data is default
                                    const isLocalDataDefault = JSON.stringify(appDataRef.current) === JSON.stringify(window.publicDefaultData);
                                    if (isLocalDataDefault) {
                                        addToast("복호화 실패: 보안 키가 일치하지 않습니다. 로컬 데이터가 초기 상태라 덮어쓰기가 차단되었습니다. 환경변수를 확인해주세요.", 'error');
                                    } else if (confirm("보안 키 불일치: 클라우드 데이터에 접근할 수 없습니다. 현재 로컬 데이터로 클라우드를 덮어쓰고 문제를 해결하시겠습니까?")) {
                                        const localData = localDataOverride || { appData: appDataRef.current, scenarios: scenariosRef.current, assetHistory: assetHistoryRef.current };
                                        await saveToCloud(localData, true, email, pro);
                                        // [추가] 덮어쓰기 성공 시 즉시 상태 업데이트하여 재진입 방지
                                        setIsCloudLoaded(true);
                                        setSyncStatus('synced');
                                        addToast('클라우드 데이터가 현재 로컬 데이터로 갱신되었습니다.', 'success');
                                    }
                                    return;
                                } else {
                                    addToast('데이터 복호화 실패: 비밀번호가 다르거나 데이터가 손상되었습니다.', 'error');
                                    console.error("Decryption failed:", err);
                                    setSyncStatus('error');
                                    return; // Stop further processing
                                }
                            }
                        }

                        // [Migration] V1 데이터(v2: 접두사 없음) 복호화 성공 시 V2로 즉시 업그레이드 저장 (Silent)
                        if (typeof data.data === 'string' && !data.data.startsWith('v2:')) {
                            console.log("Migrating V1 data to V2 security...");
                            // 키를 명시하지 않아 saveToCloud 내부에서 getEncryptionKey를 통해 새 V2 키를 생성하도록 함
                            await saveToCloud(decryptedData, true, email, pro, null, encType);
                        }
                    }
                    const cloudTime = new Date(data.updated_at).getTime();
                    const localTime = new Date(localStorage.getItem('assetDashboardLastUpdate') || 0).getTime();

                    let shouldUpdateFromCloud = isManual || !localTime || cloudTime >= localTime;

                    if (!shouldUpdateFromCloud && isInitialLoad && localTime > cloudTime) {
                        if (confirm("기기의 데이터가 더 최신입니다. 클라우드 데이터를 불러오시겠습니까?\n(취소 시 로컬 데이터가 유지되며, 데이터 보호를 위해 자동 저장이 중단됩니다.)")) {
                            shouldUpdateFromCloud = true;
                        } else {
                            // [수정] 취소 시 클라우드 덮어쓰기 방지 및 자동 저장 비활성화 (Safe Mode)
                            // setIsCloudLoaded(true)를 호출하지 않음으로써 useEffect 자동 저장을 원천 차단함
                            addToast("로컬 데이터를 유지합니다. 클라우드 보호를 위해 자동 저장이 비활성화되었습니다.", "warning");
                            setSyncStatus('idle');
                            return;
                        }
                    }

                    if (shouldUpdateFromCloud) {
                        const actualAppData = decryptedData.appData || decryptedData;
                        const fullCloudData = decryptedData.appData ? decryptedData : { appData: actualAppData, scenarios: [], assetHistory: [] };
                        
                        lastSavedDataRef.current = JSON.stringify(fullCloudData);
                        resetAppData(actualAppData);
                        if (fullCloudData.scenarios) setScenarios(fullCloudData.scenarios);
                        if (fullCloudData.assetHistory) setAssetHistory(fullCloudData.assetHistory);

                        localStorage.setItem('assetDashboardDataV3', JSON.stringify(actualAppData));
                        if (fullCloudData.scenarios) localStorage.setItem('assetDashboardScenarios', JSON.stringify(fullCloudData.scenarios));
                        if (fullCloudData.assetHistory) localStorage.setItem('assetDashboardHistory', JSON.stringify(fullCloudData.assetHistory));
                        localStorage.setItem('assetDashboardLastUpdate', data.updated_at);
                    } else {
                        const currentLocal = localDataOverride || { appData: appDataRef.current, scenarios: scenariosRef.current, assetHistory: assetHistoryRef.current };
                        lastSavedDataRef.current = JSON.stringify(currentLocal);
                    }
                    setSyncStatus('synced');
                    setIsCloudLoaded(true);
                } else {
                    setIsCloudLoaded(true);
                    setSyncStatus('synced');
                }
            } catch (err) {
                setSyncStatus('error');
                addToast(`데이터 로드 실패: ${err.message}`, 'error');
            } finally {
                setIsLoadingCloud(false);
                isFetchingRef.current = false; // Always unlock fetching regardless of return path
            }
        }, [supabase, withRetry, resetAppData, saveToCloud, addToast, encryptionMode, userSecretKey, userProfile, verifiedEmail, isPro, SECURITY_KEY]);

        const handleLogout = React.useCallback(async (skipSignOut = false) => {
            if (isProcessing.current) return;
            isProcessing.current = true;
            try {
                if (supabase && !skipSignOut) {
                    await withRetry(() => supabase.auth.signOut(), 2, 500);
                }
            } catch (error) {
                console.error('Logout error:', error);
            } finally {
                if (!skipSignOut && logoutBehavior === 'reset') {
                    resetAppData(window.publicDefaultData || {});
                    localStorage.removeItem('assetDashboardDataV3');
                }
                setVerifiedEmail(null); 
                setUserProfile(null);
                setIsPro(false);
                setIsAdmin(false); // [추가] 관리자 상태 초기화
                setAdminSuggestions([]); // [추가] 제안 목록 초기화
                setSyncStatus('idle');
                setSyncStatusError('');
                setIsCloudLoaded(false);
                // [보안] 로그아웃 시 저장된 API 키도 삭제
                localStorage.removeItem('asset_gemini_api_key');
                // [추가] 로그아웃 시 보안 키 세션 및 상태 초기화 (보안 강화)
                setUserSecretKey('');
                sessionStorage.removeItem('assetDashboardSecretKey');
                setTimeout(() => { isProcessing.current = false; }, 100);
            }
        }, [supabase, logoutBehavior, resetAppData]);

        const loadHistorySnapshot = React.useCallback(async (targetDate) => {
            if (!supabase || !verifiedEmail) return addToast('로그인이 필요한 기능입니다.', 'error');
            if (!isPro) return setIsProModalOpen(true);

            setIsLoadingCloud(true);
            try {
                let query = supabase.from('user_assets')
                    .select('data, updated_at, encryption_type')
                    .eq('email', verifiedEmail);

                // 날짜 검색 조건 (월별 or 일별)
                if (targetDate.length === 7) { // YYYY-MM 형식인 경우 (월별 그룹화된 점 클릭 시)
                    const start = `${targetDate}-01`;
                    const end = `${targetDate}-31`; 
                    // 해당 월의 가장 마지막(최신) 데이터를 가져옴
                    query = query.gte('record_date', start).lte('record_date', end).order('record_date', { ascending: false });
                } else {
                    // YYYY-MM-DD 형식인 경우 (정확한 날짜 클릭 시)
                    query = query.eq('record_date', targetDate);
                }
                
                const { data, error } = await query.limit(1).maybeSingle();

                if (error) throw error;
                if (!data) {
                    addToast('해당 날짜의 백업 데이터가 서버에 없습니다.', 'error');
                    return;
                }

                // 데이터 복호화 및 적용 (fetchFromCloud 로직 재사용)
                let decryptedData = data.data;
                const encType = data.encryption_type;
                if (encType && encType !== 'none') {
                    const secret = (encType === 'secure') ? (userSecretKey || sessionStorage.getItem('assetDashboardSecretKey')) : null;
                    const key = getEncryptionKey(encType, secret, verifiedEmail, SECURITY_KEY);
                    if (!key) throw new Error('암호화 키를 생성할 수 없습니다. (비밀번호 확인 필요)');
                    decryptedData = await window.decryptData(data.data, key);
                }

                const actualAppData = decryptedData.appData || decryptedData;
                const fullCloudData = decryptedData.appData ? decryptedData : { appData: actualAppData, scenarios: [], assetHistory: [] };

                // [수정] 즉시 적용하지 않고 모달을 통해 사용자 확인 (데이터 임시 저장)
                setPendingHistoryData({
                    date: targetDate,
                    appData: actualAppData,
                    // scenarios와 assetHistory는 덮어쓰지 않으므로 저장하지 않거나 참조만 함
                });
                setIsHistoryActionModalOpen(true);

            } catch (err) {
                console.error(err);
                addToast(`불러오기 실패: ${err.message}`, 'error');
            } finally {
                setIsLoadingCloud(false);
            }
        }, [supabase, verifiedEmail, isPro, userSecretKey, SECURITY_KEY, addToast]);

        const confirmHistoryAction = (action) => {
            if (!pendingHistoryData) return;
            const { appData: pastAppData, date } = pendingHistoryData;

            // 1. 과거 데이터로 앱 상태 변경 (히스토리/시나리오는 유지)
            resetAppData(pastAppData);
            
            if (action === 'view') {
                // 조회 모드: 클라우드 동기화 차단
                setIsCloudLoaded(false); 
                setSyncStatus('idle'); // 시각적 피드백
                addToast("현재 조회 모드입니다. 수정을 해도 서버에 저장되지 않습니다. 최신으로 돌아가려면 새로고침하세요.", 'warning');
            } else if (action === 'restore') {
                // 복구 모드: 현재 상태를 오늘 날짜로 즉시 저장
                setIsCloudLoaded(true);
                // 현재 로컬의 히스토리와 시나리오를 유지한 채로 저장
                const unifiedData = { 
                    appData: pastAppData, 
                    scenarios: scenariosRef.current, 
                    assetHistory: assetHistoryRef.current 
                };
                saveToCloud(unifiedData, true); // Force save
                addToast(`${date} 데이터를 오늘 시점으로 복구했습니다.`, 'success');
            }
            setIsHistoryActionModalOpen(false);
            setPendingHistoryData(null);
        };

        const deleteHistoryPoint = React.useCallback((targetDate) => {
            if (!confirm(`${targetDate} 기록을 삭제하시겠습니까?\n(서버 데이터는 유지되며, 로컬 히스토리 목록에서만 제외됩니다)`)) return;
            
            setAssetHistory(prev => {
                const newHistory = prev.filter(item => item.date !== targetDate);
                // 변경 사항 즉시 저장 (자동 저장 트리거)
                return newHistory;
            });
            addToast(`${targetDate} 기록이 삭제되었습니다.`, 'info');
        }, [addToast]);

            const updateHistoryMemo = React.useCallback((index, memo) => {
                setAssetHistory(prev => {
                    const newHistory = [...prev];
                    newHistory[index] = { ...newHistory[index], memo };
                    return newHistory;
                });
            }, []);

        const handleHistoryContextMenu = React.useCallback((e) => {
            e.preventDefault(); // 기본 브라우저 메뉴 차단
            const chart = chartInstancesRef.current['historyChart'];
            if (!chart) return;

            // React 합성 이벤트의 nativeEvent를 사용해야 Chart.js가 좌표를 정확히 인식함
            const points = chart.getElementsAtEventForMode(e.nativeEvent, 'nearest', { intersect: true }, true);
            
            if (points.length > 0) {
                const index = points[0].index;
                // 데이터 그룹화 여부 판단 (MAX_HISTORY_POINTS = 24 기준)
                const useMonthlyAverage = false; // [수정] 줌 기능을 위해 항상 개별 데이터 유지
                
                if (!useMonthlyAverage && index < assetHistory.length) {
                    const targetDate = assetHistory[index].date;
                    deleteHistoryPoint(targetDate);
                } else if (useMonthlyAverage) {
                    addToast('월별 평균 보기 모드에서는 개별 삭제가 불가능합니다.', 'warning');
                }
            }
        }, [assetHistory, deleteHistoryPoint]);

            const fetchAdminSuggestions = React.useCallback(async () => {
                if (!supabase) return;
                try {
                    const { data, error } = await supabase
                        .from('user_profiles')
                        .select('email, suggestions')
                        .not('suggestions', 'is', null);
                    
                    if (error) throw error;
                    if (data) setAdminSuggestions(data);
                } catch (error) {
                    console.error('Failed to fetch suggestions:', error);
                }
            }, [supabase]);

            const checkSubscription = React.useCallback(async (session, isManualCheck = false, localDataOverride = null) => {
                if (!session?.user || (isCheckingSubscriptionRef.current && !isManualCheck)) return;
                if (isManualCheck) setIsLoadingCloud(true);
                isCheckingSubscriptionRef.current = true;
                setSyncStatus('syncing');
                setVerifiedEmail(session.user.email);
                // [수정] userProfile에 id 포함 (암호화 키 생성 시 UUID 사용 보장)
                setUserProfile({ ...session.user.user_metadata, id: session.user.id });

                if (!navigator.onLine) {
                    isCheckingSubscriptionRef.current = false;
                    if (isManualCheck) setIsLoadingCloud(false);
                    return;
                }

                try {
                    const { data: profile, error: fetchError } = await withRetry(
                        // [수정] 관리자 답변(suggestions_reply) 및 읽음 여부(suggestions_reply_isread) 추가 조회
                        () => supabase.from('user_profiles').select('is_paid, is_admin, data_consent, suggestions_reply, suggestions_reply_isread').eq('id', session.user.id).maybeSingle()
                    );
                    if (!fetchError) {
                        // [수정] 유료 결제자(is_paid)이거나 관리자(is_admin)이면 PRO 기능 활성화
                        const isAdminUser = profile?.is_admin || false;
                        const proStatus = profile ? (profile.is_paid || isAdminUser) : false;
                        setIsPro(proStatus);
                        setIsAdmin(isAdminUser);

                        // [추가] 데이터 활용 동의가 없으면 모달 띄우기 (null인 경우)
                        if (profile && profile.data_consent === null) {
                            setIsConsentModalOpen(true);
                        }

                        // [추가] 읽지 않은 관리자 답변이 있으면 배너 표시
                        if (profile && profile.suggestions_reply && !profile.suggestions_reply_isread) {
                            setActiveReply(profile.suggestions_reply);
                        }

                        // [수정] 무료 유저도 자동 동기화 활성화 (UX 개선: 수동 저장 제거)
                        await fetchFromCloud(session.user.email, proStatus, true, false, localDataOverride);
                        
                        // [추가] 관리자라면 제안 목록 가져오기
                        if (isAdminUser) fetchAdminSuggestions();

                        if (profile) setUserProfile(prev => ({ ...prev, ...profile }));
                    } else {
                        console.warn('Profile fetch error after retries:', fetchError);
                        setSyncStatus('error');
                        if (isManualCheck) addToast('서버 연결 상태가 좋지 않아 구독 정보를 확인하지 못했습니다.', 'error');
                    }
                } catch (err) {
                    console.error('Subscription check error:', err);
                    setSyncStatus('error');
                    if (isManualCheck) addToast('구독 상태 확인 중 오류가 발생했습니다.', 'error');
                } finally {
                    isCheckingSubscriptionRef.current = false;
                    if (isManualCheck) setIsLoadingCloud(false);
                }
            }, [supabase, withRetry, fetchFromCloud, addToast, fetchAdminSuggestions]);

            const handleConsent = async () => {
                if (!supabase || !userProfile?.id) return;
                try {
                    const { error } = await supabase.from('user_profiles').update({ 
                        data_consent: true,
                        consent_date: new Date().toISOString()
                    }).eq('id', userProfile.id);
                    
                    if (error) throw error;
                    
                    setIsConsentModalOpen(false);
                    addToast('데이터 활용에 동의해주셔서 감사합니다.', 'success');
                    setUserProfile(prev => ({ ...prev, data_consent: true }));
                } catch (e) {
                    console.error('Consent update error:', e);
                    addToast('동의 처리 중 오류가 발생했습니다.', 'error');
                }
            };

            const toggleDataConsent = async (newValue) => {
                if (!supabase || !userProfile?.id) return addToast('로그인이 필요합니다.', 'error');
                try {
                    const { error } = await supabase.from('user_profiles').update({ 
                        data_consent: newValue,
                        consent_date: newValue ? new Date().toISOString() : null
                    }).eq('id', userProfile.id);
                    if (error) throw error;
                    setUserProfile(prev => ({ ...prev, data_consent: newValue }));
                    addToast(`데이터 활용 동의가 ${newValue ? '설정' : '해제'}되었습니다.`, 'success');
                } catch (e) {
                    console.error('Consent update error:', e);
                    addToast('동의 처리 중 오류가 발생했습니다.', 'error');
                }
            };

            const handleDismissReply = async () => {
                if (!confirm('답변을 확인하셨나요? 확인을 누르면 메시지가 영구히 사라집니다.\n(취소하면 다음에 다시 표시됩니다)')) return;
                
                setActiveReply(null); // UI에서 즉시 제거
                if (!supabase || !userProfile?.id) return;

                try {
                    await supabase.from('user_profiles').update({ suggestions_reply_isread: true }).eq('id', userProfile.id);
                } catch (e) {
                    console.error('Reply dismiss error:', e);
                    // 에러 발생 시 사용자에게 알리지 않고 조용히 실패 (다음 로드 시 다시 뜸)
                }
            };

            const handleLocalTestToggle = () => {
                if (!isLocal) return;

                if (!verifiedEmail) {
                    setVerifiedEmail('test@local.dev');
                    setUserProfile({ id: 'local-test-id', email: 'test@local.dev', full_name: '테스트 유저' });
                    setIsPro(false);
                    setIsAdmin(false);
                    addToast('🛠️ 로컬 테스트: FREE 모드 (가상 로그인)', 'info');
                } else if (!isPro) {
                    setIsPro(true);
                    setIsAdmin(false);
                    addToast('🛠️ 로컬 테스트: PRO 모드', 'success');
                } else {
                    setIsPro(false);
                    setIsAdmin(false);
                    addToast('🛠️ 로컬 테스트: FREE 모드', 'info');
                }
            };

            useEffect(() => {
                if (!supabase) return;
                
                const updateNotice = async () => {
                    const { data } = await supabase.from('notices')
                        .select('content').eq('is_active', true)
                        .order('created_at', { ascending: false }).limit(1).maybeSingle();
                    // 활성 공지가 있으면 내용을 설정, 없으면 null (배너 사라짐)
                    setActiveNotice(data ? data.content : null);
                };

                updateNotice(); // 초기 로드

                // DB 변경사항 실시간 구독
                const channel = supabase.channel('public:notices')
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'notices' }, updateNotice)
                    .subscribe();

                return () => supabase.removeChannel(channel);
            }, [supabase]);

            // [추가] 앱 로드 시 및 일정 주기별 연동 주식 데이터 자동 갱신 (시뮬레이션 로직 보존)
            useEffect(() => {
                if (!appData || !isInitialized || !isCloudLoaded) return;

                const refreshLinkedStocks = async () => {
                    if (enableLiveQuotes === false) return; // [추가] 실시간 시세 연동 비활성화 시 즉시 중단
                    const symbolsToFetch = new Set();
                    let hasLinked = false;
                    Object.keys(appData.assets).forEach(sector => {
                        (appData.assets[sector] || []).forEach(a => {
                            if (a.linkedItems && a.linkedItems.length > 0) {
                                hasLinked = true;
                                a.linkedItems.forEach(item => {
                                    if (item.autoUpdate !== false && item.ticker) symbolsToFetch.add(item.ticker);
                                });
                            }
                        });
                    });
                    if (!hasLinked) return;
                    symbolsToFetch.add('KRW=X'); // 환율 데이터

                    // [Fail-safe] 캐시된 환율 로드
                    const cachedFx = Number(localStorage.getItem('asset_last_usd_krw')) || 1420;
                    
                    /* [임시 주석 처리 - 추후 토스 API 연동 시 정식 복구 예정]
                    const quotes = await window.fetchYahooQuotes(Array.from(symbolsToFetch));
                    if (Object.keys(quotes).length === 0) return;
                    const fxRate = quotes['KRW=X']?.price || cachedFx;
                    if (quotes['KRW=X']?.price) localStorage.setItem('asset_last_usd_krw', fxRate.toString());

                    setAppData(prev => {
                        const newData = { ...prev, assets: { ...prev.assets } };
                        let isChanged = false;
                        Object.keys(newData.assets).forEach(sector => {
                            newData.assets[sector] = newData.assets[sector].map(a => {
                                if (a.linkedItems && a.linkedItems.length > 0) {
                                    let newLinkedVal = 0;
                                    const newLinkedItems = a.linkedItems.map(item => {
                                        const quote = (item.autoUpdate !== false) ? quotes[item.ticker] : null;
                                        const currentPrice = quote ? quote.price : (item.currentPrice || 0);
                                        let valKRW = currentPrice * item.shares;
                                        if ((quote ? quote.currency : item.currency) === 'USD') valKRW *= fxRate;
                                        newLinkedVal += (valKRW / 10000);
                                        return { ...item, currentPrice };
                                    });
                                    const newAmount = Math.round(((a.baseAmount || 0) + newLinkedVal) * 100) / 100;
                                    if (Math.abs(newAmount - (a.amount || 0)) > 0.01) {
                                        isChanged = true;
                                        return { ...a, amount: newAmount, linkedItems: newLinkedItems };
                                    }
                                }
                                return a;
                            });
                        });
                        if (isChanged) addToast('🔄 종목 연동 계좌의 실시간 자산 평가액이 자동 갱신되었습니다.', 'info');
                        return isChanged ? newData : prev;
                    });
                    */
                    return; // 일단은 fixed 상태만 지원하므로 갱신 로직 실행 없이 리턴
                };

                // 너무 잦은 API 호출 방지를 위해 세션당 1회 또는 10분마다 갱신
                const lastRefresh = sessionStorage.getItem('lastStockRefreshTimer');
                if (!lastRefresh || Date.now() - Number(lastRefresh) > 10 * 60 * 1000) {
                    refreshLinkedStocks();
                    sessionStorage.setItem('lastStockRefreshTimer', Date.now().toString());
                }
            }, [isInitialized, isCloudLoaded, enableLiveQuotes]);

        useEffect(() => { 
            appDataRef.current = appData; 
            scenariosRef.current = scenarios;
            assetHistoryRef.current = assetHistory;
            editingPhaseRef.current = editingPhase; // [보안] 렌더링마다 최신 편집 상태 동기화
        }, [appData, scenarios, assetHistory]);

            useEffect(() => {
                if (userSecretKey) {
                    sessionStorage.setItem('assetDashboardSecretKey', userSecretKey);
                }
            }, [userSecretKey]);

        useEffect(() => {
            // This effect runs only once after the initial data (local or cloud) has been loaded and set.
            if (isInitialized && appData?.autoUpdateBaseDate) {
                const now = new Date();
                const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                if (appData.baseDate !== todayStr) {
                    setBaseDate(todayStr);
                    addToast('기준일이 오늘 날짜로 자동 갱신되었습니다.', 'info');
                }
            }
        }, [isInitialized, appData?.autoUpdateBaseDate, verifiedEmail]);

        useEffect(() => {
            const handleKeyDown = (e) => {
                const isSave = ((e.ctrlKey || e.metaKey) && e.key === 's') || (e.altKey && e.key === 's');
                if (isSave) {
                    e.preventDefault();
                    const currentData = appDataRef.current;
                    const currentEditingPhase = editingPhaseRef.current; // [보안] 최신 상태 참조
                    if (currentData) {
                        const trueAppData = getPhaseMergedAppData(currentData, currentEditingPhase);

                        localStorage.setItem('assetDashboardDataV3', JSON.stringify(trueAppData));
                        saveToCloud({ appData: trueAppData, scenarios: scenariosRef.current, assetHistory: assetHistoryRef.current, referenceScenarios: referenceScenarios }, true);
                        setShowSaveToast(true);
                        setTimeout(() => setShowSaveToast(false), 2000);
                    }
                }
                if (e.key === 'Escape') {
                    setIsDataManageModalOpen(false);
                    setIsPrivacyModalOpen(false); setIsSuggestionModalOpen(false);
                    setIsProModalOpen(false); setIsEncryptionModalOpen(false);
                    setIsPasswordPromptOpen(false); setIsQuickPanelOpen(false);
                    setIsGuideOpen(false);
                }
                
                const isUndo = (e.ctrlKey || e.metaKey) && (e.code === 'KeyZ' || e.key.toLowerCase() === 'z') && !e.shiftKey;
                const isRedo = (e.ctrlKey || e.metaKey) && (e.code === 'KeyY' || e.key.toLowerCase() === 'y' || ((e.code === 'KeyZ' || e.key.toLowerCase() === 'z') && e.shiftKey));

                if (isUndo && canUndo) { 
                    e.preventDefault(); 
                    undo(); 
                    addToast('실행 취소되었습니다.', 'info');
                }
                if (isRedo && canRedo) { 
                    e.preventDefault(); 
                    redo(); 
                    addToast('다시 실행되었습니다.', 'info');
                }
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        
        }, [canUndo, canRedo, undo, redo, saveToCloud, scenarios, assetHistory]);


            useEffect(() => {
                if (!isInitialized) return;

                try {
                    // [수정] 미래 시점 편집 중일 때도 저장을 차단하지 않고, 
                    // 현재 편집 중인 페이즈 데이터를 원본 배열에 알맞게 조립하여 저장하도록 구성
                    const trueAppData = getPhaseMergedAppData(appData, editingPhase);

                    const fullState = { appData: trueAppData, scenarios, assetHistory, referenceScenarios };
                    const fullStateStr = JSON.stringify(fullState);

                    // 1. 각 항목별 로컬 스토리지 저장
                    if (trueAppData) localStorage.setItem('assetDashboardDataV3', JSON.stringify(trueAppData));
                    localStorage.setItem('assetDashboardScenarios', JSON.stringify(scenarios));
                    localStorage.setItem('assetDashboardHistory', JSON.stringify(assetHistory));
                    localStorage.setItem('assetDashboardReferenceScenarios', JSON.stringify(referenceScenarios));

                    // 2. 로컬 수정 여부 판단 (마지막 동기화 시점과 비교)
                    // lastSavedDataRef는 클라우드에서 불러오거나 클라우드에 저장 성공했을 때만 갱신됨
                    if (fullStateStr !== lastSavedDataRef.current) {
                        // 데이터가 변경되었다면 로컬 타임스탬프를 현재 시간으로 갱신
                        // 이렇게 해야 로그인 시 "기기의 데이터가 더 최신입니다" 팝업이 정상적으로 뜸
                        const now = new Date().toISOString();
                        localStorage.setItem('assetDashboardLastUpdate', now);
                    }
                } catch (e) {
                    console.error("Local Storage Save Failed:", e);
                    // 저장 실패 시 앱이 멈추지 않도록 예외 처리 (필요 시 토스트 메시지 추가 가능)
                }
            }, [appData, scenarios, assetHistory, referenceScenarios, isInitialized, editingPhase]);

            const saveCurrentAsset = () => {
                try {
                    const now = new Date();
                    // [수정] UTC 대신 로컬 시간 기준으로 날짜 생성 (새벽 시간대 날짜 불일치 해결)
                    const year = now.getFullYear();
                    const month = String(now.getMonth() + 1).padStart(2, '0');
                    const day = String(now.getDate()).padStart(2, '0');
                    const currentDate = `${year}-${month}-${day}`;
                    const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS
                    const netWorth = calculation?.currentNet || 0;
                    const grossWorth = calculation?.currentGross || 0;
                    
                    setAssetHistory(prev => {
                        const newHistory = [...prev];
                        const existingIndex = newHistory.findIndex(item => item.date === currentDate);
                        
                        if (existingIndex >= 0) {
                            // 같은 날짜가 있으면 시간 정보와 함께 업데이트 (마지막 시간대만 유지)
                            newHistory[existingIndex] = { 
                                date: currentDate, 
                                time: currentTime,
                                netWorth,
                                grossWorth,
                                timestamp: now.getTime()
                            };
                        } else {
                            // 새로운 날짜면 추가
                            newHistory.push({ 
                                date: currentDate, 
                                time: currentTime,
                                netWorth,
                                grossWorth,
                                timestamp: now.getTime()
                            });
                        }
                        
                        // 타임스탬프순으로 정렬 (최신이 마지막)
                        return newHistory.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
                    });
                    
                    addToast(`현재 순자산 ${formatNumber(netWorth, displayMode)}만원이 히스토리에 저장되었습니다.`, 'success');
                } catch (error) {
                    console.error('자산 저장 오류:', error);
                    addToast('자산 저장 중 오류가 발생했습니다.', 'error');
                }
            };

            const now = new Date();
            const localDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            const localMonthStr = localDateStr.slice(0, 7);

            // ===== 기본값 설정 (appData가 없을 때도 안전하게) =====
            const {
                projectionMonths = 12, monthlySalary = 280, assets = {}, monthlyExpenses = [],
                targetAmount = 10000, 
                goalMode = 'period', displayMode = 'amount',
                rebalancingAlerts = {}, baseMonth = localMonthStr, // [수정] UTC 대신 로컬 시간 사용
                rebalanceMonths = 12, // [추가] 리밸런싱 목표 기간
                mainCashFlowAccount = '생활비통장',
                residualAccount = '생활비통장', // [추가] 잔여액 저축 계좌
                rebalancingTargets = {},
                memo = '', // [추가]
                itemTargets = {}, // [추가] 항목별 목표 비중
                // [Refactor] Safe defaults during destructuring
                incomeEvents = [],
                expenseEvents = [],
                salaryDay = 25,
                baseDate = localDateStr, // [수정] UTC 대신 로컬 시간 사용
                autoUpdateBaseDate = false
            } = appData || {};

            // ===== Setter 함수들 =====
            const setProjectionMonths = React.useCallback((value) => setAppData(prev => ({ ...prev, projectionMonths: Math.max(0, typeof value === 'function' ? value(prev.projectionMonths) : value) })), [setAppData]);
            const setMonthlySalary = React.useCallback((value) => setAppData(prev => ({ ...prev, monthlySalary: value })), [setAppData]);
            const setAssets = React.useCallback((value) => setAppData(prev => ({ ...prev, assets: typeof value === 'function' ? value(prev.assets) : value })), [setAppData]);
            const setMonthlyExpenses = React.useCallback((value) => setAppData(prev => ({ 
                ...prev, 
                monthlyExpenses: typeof value === 'function' ? value(Array.isArray(prev.monthlyExpenses) ? prev.monthlyExpenses : []) : value 
            })), [setAppData]);

            const setMainCashFlowAccount = React.useCallback((value) => setAppData(prev => ({ ...prev, mainCashFlowAccount: value })), [setAppData]);
            const setResidualAccount = React.useCallback((value) => setAppData(prev => ({ ...prev, residualAccount: value })), [setAppData]);
            const setIncomeEvents = React.useCallback((value) => setAppData(prev => ({ 
                ...prev, 
                incomeEvents: typeof value === 'function' ? value(Array.isArray(prev.incomeEvents) ? prev.incomeEvents : []) : value 
            })), [setAppData]);
            const setExpenseEvents = React.useCallback((value) => setAppData(prev => ({ 
                ...prev, 
                expenseEvents: typeof value === 'function' ? value(Array.isArray(prev.expenseEvents) ? prev.expenseEvents : []) : value 
            })), [setAppData]);
            
            const setTargetAmount = React.useCallback((value) => setAppData(prev => ({ ...prev, targetAmount: value })), [setAppData]);
            const setGoalMode = React.useCallback((value) => setAppData(prev => ({ ...prev, goalMode: value })), [setAppData]);
            const setDisplayMode = React.useCallback((value) => setAppData(prev => ({ ...prev, displayMode: value })), [setAppData]); 
            const setRebalanceMonths = React.useCallback((value) => setAppData(prev => ({ ...prev, rebalanceMonths: Math.max(1, value) })), [setAppData]);
            const setRebalancingAlerts = React.useCallback((value) => setAppData(prev => ({ ...prev, rebalancingAlerts: typeof value === 'function' ? value(prev.rebalancingAlerts) : value })), [setAppData]);
            const setBaseMonth = React.useCallback((value) => setAppData(prev => ({ ...prev, baseMonth: value })), [setAppData]);
            const setRebalancingTargets = React.useCallback((value) => setAppData(prev => ({ ...prev, rebalancingTargets: typeof value === 'function' ? value(prev.rebalancingTargets) : value })), [setAppData]);
            const setItemTargets = React.useCallback((value) => setAppData(prev => ({ ...prev, itemTargets: typeof value === 'function' ? value(prev.itemTargets) : value })), [setAppData]);
            const setRebalancingGlobal = React.useCallback((value) => setAppData(prev => ({ ...prev, rebalancingGlobal: typeof value === 'function' ? value(prev.rebalancingGlobal) : value })), [setAppData]);
            const setMemo = React.useCallback((value) => setAppData(prev => ({ ...prev, memo: value })), [setAppData]);
            const setSalaryDay = React.useCallback((value) => setAppData(prev => ({ ...prev, salaryDay: Math.min(31, Math.max(1, Number(value))) })), [setAppData]);
            const setBaseDate = React.useCallback((value) => setAppData(prev => ({ ...prev, baseDate: value })), [setAppData]); // [변경] setBaseMonth -> setBaseDate
            const setAutoUpdateBaseDate = React.useCallback((value) => setAppData(prev => ({ ...prev, autoUpdateBaseDate: value })), [setAppData]);

            const handleDarkModeToggle = () => {
                if (!isPro) {
                    if (!verifiedEmail) {
                        if (confirm('PRO 기능(다크모드 등)을 확인하거나 후원하려면 로그인이 필요합니다.\n로그인하시겠습니까?')) {
                            handleLogin();
                        }
                        return;
                    }
                    setIsSettingsModalOpen(false); // [수정] 설정 모달 닫기
                    return setIsProModalOpen(true);
                }
                setDarkMode(!darkMode);
            };

            useEffect(() => {
                if (darkMode) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                }
                localStorage.setItem('assetDashboardDarkMode', darkMode);
            }, [darkMode]);

            useEffect(() => {
                if (!isPro && showProjectionInHistory) {
                    setShowProjectionInHistory(false);
                }
            }, [isPro, showProjectionInHistory]);

            const handleSuggestionSubmit = async (content) => {
                if (!supabase) return;
                try {
                    const { data: { user } } = await withRetry(() => supabase.auth.getUser());
                    if (!user) return addToast('로그인이 필요합니다.', 'error');
                    const { data: currentProfile, error: fetchError } = await withRetry(() => 
                        supabase.from('user_profiles').select('suggestions').eq('id', user.id).maybeSingle()
                    );
                    if (fetchError) throw fetchError;
                    const timestamp = new Date().toLocaleString();
                    const newEntry = `[${timestamp}] ${content}`;
                    const updatedSuggestions = currentProfile?.suggestions ? currentProfile.suggestions + '\n\n' + newEntry : newEntry;
                    const { error } = await withRetry(() => 
                        supabase.from('user_profiles').update({ 
                            suggestions: updatedSuggestions,
                            suggestions_reply: null, // [수정] 새 문의 등록 시 기존 답변 초기화 (미답변 상태로 전환)
                            suggestions_reply_isread: false
                        }).eq('id', user.id)
                    );
                    if (error) throw error;
                    addToast('소중한 의견 감사합니다!', 'success');
                } catch (error) {
                    console.error('Suggestion error:', error);
                    addToast('의견 전송 중 오류가 발생했습니다.', 'error');
                }
            };

            const handleLogin = async () => {
                if (!supabase) {
                    let msg = '로그인 불가: ';
                    if (!window.supabase) {
                        msg += 'Supabase 라이브러리 로드 실패';
                    } else if (!SUPABASE_URL || !SUPABASE_KEY) {
                        msg += '설정값이 없습니다. (Cloudflare 환경변수 미설정)';
                    } else {
                        msg += 'Supabase 클라이언트 초기화 실패 (설정값을 확인해주세요)';
                    }
                    addToast(msg, 'error');
                    return;
                }
                try {
                    const { error } = await withRetry(() => supabase.auth.signInWithOAuth({
                        provider: 'google',
                        options: { redirectTo: window.location.origin }
                    }));
                    if (error) addToast('로그인 오류: ' + error.message, 'error');
                } catch (err) {
                    addToast('로그인 요청 시간 초과: ' + err.message, 'error');
                }
            };

            // 실시간 클라우드 동기화 (Debounced)
            useEffect(() => {
                if (!appData || !isInitialized || isFetchingRef.current || !isCloudLoaded) return;
                const AUTO_SYNC_DELAY = 2000;
                const timer = setTimeout(() => {
                    const trueAppData = getPhaseMergedAppData(appData, editingPhase);

                    saveToCloud({ appData: trueAppData, scenarios, assetHistory, referenceScenarios });
                }, AUTO_SYNC_DELAY);
                return () => clearTimeout(timer);
            }, [appData, scenarios, assetHistory, referenceScenarios, isInitialized, isCloudLoaded, saveToCloud, editingPhase]);

            const handleEncryptionSelect = (mode) => {
                setEncryptionMode(mode);
                setIsEncryptionModalOpen(false);
                if (mode === 'secure') setIsPasswordPromptOpen(true);
                else saveToCloud({ appData: appDataRef.current, scenarios: scenariosRef.current, assetHistory: assetHistoryRef.current, referenceScenarios: referenceScenarios }, true);
            };

            const handlePasswordConfirm = async (password) => {
                setUserSecretKey(password);
                setIsPasswordPromptOpen(false);
                const unifiedData = { appData: appDataRef.current, scenarios: scenariosRef.current, assetHistory: assetHistoryRef.current, referenceScenarios: referenceScenarios };
                if (pendingCiphertext.current) { // 비밀번호 입력 후 데이터 복호화 시도
                    try {
                        const key = getEncryptionKey('secure', password, verifiedEmail, SECURITY_KEY);
                        const decrypted = await decryptData(pendingCiphertext.current, key);
                        resetAppData(decrypted.appData || decrypted);
                        if (decrypted.scenarios) setScenarios(decrypted.scenarios);
                        if (decrypted.assetHistory) setAssetHistory(decrypted.assetHistory);
                        if (decrypted.referenceScenarios) setReferenceScenarios(decrypted.referenceScenarios);
                        pendingCiphertext.current = null;
                        setSyncStatus('synced');
                        setIsCloudLoaded(true);
                    } catch (err) {
                        addToast('복호화 실패. 비밀번호를 다시 확인해주세요.', 'error');
                        setIsPasswordPromptOpen(true);
                    }
                } else if (pendingSave.current) { // 새 비밀번호 설정 후 저장 시도
                    pendingSave.current = false; 
                    setEncryptionMode('secure');
                    const key = getEncryptionKey('secure', password, verifiedEmail, SECURITY_KEY);
                    await saveToCloud(unifiedData, true, null, null, key, 'secure');
                }
            };

            const handlePasswordReset = async () => {
                if (!confirm("⚠️ 경고: 비밀번호를 분실하면 서버에 저장된 기존 암호화 데이터는 영구적으로 복구할 수 없습니다.\n\n정말로 현재 기기의 '로컬 데이터'로 서버 데이터를 덮어쓰고 계정을 복구하시겠습니까?\n(복구 후에는 일반 모드로 전환됩니다)")) return;

                setIsPasswordPromptOpen(false);
                pendingCiphertext.current = null;
                
                // 일반 모드로 전환 및 강제 저장
                setEncryptionMode('normal');
                setUserSecretKey('');
                sessionStorage.removeItem('assetDashboardSecretKey');
                
                const key = getEncryptionKey('normal', '', verifiedEmail, SECURITY_KEY);
                if (!key) return addToast('시스템 보안 키 오류로 복구할 수 없습니다.', 'error');

                await saveToCloud({ 
                    appData: appDataRef.current, 
                    scenarios: scenariosRef.current, 
                    assetHistory: assetHistoryRef.current, 
                    referenceScenarios: referenceScenarios 
                }, true, null, null, key, 'normal');

                // [추가] 복구 완료 후 상태 정상화 (재진입 방지 및 동기화 재개)
                setIsCloudLoaded(true);
                setSyncStatus('synced');

                addToast('계정이 복구되었습니다. (일반 모드 전환됨)', 'success');
            };

            const handleModeChange = async (newMode) => {
                if (!isPro) {
                    setIsSettingsModalOpen(false); // [수정] 설정 모달 닫기
                    return setIsProModalOpen(true);
                }
                if (newMode === encryptionMode) return;
                if (newMode === 'secure') {
                    pendingSave.current = true;
                    setIsPasswordPromptOpen(true);
                } else if (confirm('일반 보안 모드로 전환하시겠습니까?')) {
                    setEncryptionMode('normal');
                    setUserSecretKey('');
                    sessionStorage.removeItem('assetDashboardSecretKey');
                    const key = getEncryptionKey('normal', '', verifiedEmail, SECURITY_KEY);
                    await saveToCloud({ appData: appDataRef.current, scenarios: scenariosRef.current, assetHistory: assetHistoryRef.current, referenceScenarios: referenceScenarios }, true, null, null, key, 'normal');
                }
            };

            useEffect(() => {
                if (!supabase || !verifiedEmail) return;
                const channel = supabase.channel('realtime_assets').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'user_assets', filter: `email=eq.${verifiedEmail}` }, (payload) => {
                    const cloudTime = new Date(payload.new.updated_at).getTime();
                    const localTime = new Date(localStorage.getItem('assetDashboardLastUpdate') || 0).getTime();
                    if (cloudTime > localTime) fetchFromCloud(verifiedEmail, isPro, false, false);
                }).subscribe();
                return () => supabase.removeChannel(channel);
            }, [supabase, verifiedEmail, isPro, fetchFromCloud]);

            const saveAsDefault = () => {
                if (confirm('현재 설정을 기본값으로 저장하시겠습니까?')) {
                    localStorage.setItem('assetDashboardCustomDefault', JSON.stringify(appData));
                    addToast('현재 설정이 기본값으로 저장되었습니다.', 'success');
                }
            };

            const loadCustomDefault = () => {
                try {
                    const customDefault = localStorage.getItem('assetDashboardCustomDefault');
                    if (customDefault && confirm('저장된 기본값으로 초기화하시겠습니까?')) {
                        resetAppData(JSON.parse(customDefault));
                        setIsDemoMode(false);
                        addToast('기본값을 불러왔습니다.', 'success');
                    } else if (!customDefault && confirm('저장된 기본값이 없습니다. 사이트 기본값으로 초기화하시겠습니까?')) {
                        resetAppData(window.publicDefaultData || {});
                        setIsDemoMode(false);
                        addToast('사이트 기본값을 불러왔습니다.', 'info');
                    }
                } catch (error) {
                    addToast('기본값 로드 중 오류가 발생했습니다.', 'error');
                }
            };

    // ===== 타임라인 페이즈 관리 함수 =====
    const startEditingPhase = (index) => {
        const phase = appData.futurePhases[index];
        // 절대 연/월 기준일 대비 개월 수 계산
        const baseMonthYYYYMM = appData.baseDate ? appData.baseDate.slice(0, 7) : new Date().toISOString().slice(0, 7);
        let targetMonth = window.getMonthDiff(baseMonthYYYYMM, phase.startDate);
        if (targetMonth < 0) targetMonth = 0;

        // 해당 시점의 시뮬레이션 결과값 추출
        // [Fix] 현재 편집하려는 분기점 자신의 과거 데이터가 시뮬레이션에 개입하여 오버라이드 판단 기준(pureProjectedState)이 오염되는 현상(저장 시 잔액 증발 버그) 방지
        const pureAppData = {
            ...appData,
            futurePhases: (appData.futurePhases || []).map((p, i) => i === index ? { ...p, data: {} } : p)
        };
        const result = calculateMonthlyProjection(pureAppData, targetMonth);
        const projectedState = result.projections[targetMonth]?.assets || pureAppData.assets;

        // [Fix] 현재 편집하려는 분기점 이전의 페이즈들로부터 설정(급여, 소비 등)을 상속받음
        const prevPhases = (appData.futurePhases || [])
            .filter(p => p.startDate < phase.startDate)
            .sort((a, b) => a.startDate.localeCompare(b.startDate));

        let inheritedSalary = appData.monthlySalary;
        let inheritedExpenses = appData.monthlyExpenses;
        let inheritedSalaryDay = appData.salaryDay;
        let inheritedMainAccount = appData.mainCashFlowAccount;
        let inheritedResidualAccount = appData.residualAccount;

        prevPhases.forEach(p => {
            if (p.data.monthlySalary !== undefined) inheritedSalary = p.data.monthlySalary;
            if (p.data.monthlyExpenses !== undefined) inheritedExpenses = p.data.monthlyExpenses;
            if (p.data.salaryDay !== undefined) inheritedSalaryDay = p.data.salaryDay;
            if (p.data.mainCashFlowAccount !== undefined) inheritedMainAccount = p.data.mainCashFlowAccount;
            if (p.data.residualAccount !== undefined) inheritedResidualAccount = p.data.residualAccount;
        });

        // 편집용 임시 상태로 덮어쓰기
        const editingData = {
            ...appData,
            monthlySalary: phase.data.monthlySalary ?? inheritedSalary,
            monthlyExpenses: phase.data.monthlyExpenses ?? inheritedExpenses,
            salaryDay: phase.data.salaryDay ?? inheritedSalaryDay,
            mainCashFlowAccount: phase.data.mainCashFlowAccount ?? inheritedMainAccount,
            residualAccount: phase.data.residualAccount ?? inheritedResidualAccount,
            assets: JSON.parse(JSON.stringify(projectedState)) // Deep copy
        };

                    // [수정] 분기 시점의 예상 금액을 소수점 둘째 자리에서 반올림
                    Object.keys(editingData.assets).forEach(sector => {
                        editingData.assets[sector].forEach(asset => {
                            if (asset.amount !== undefined) {
                                asset.amount = Math.round(asset.amount * 100) / 100;
                            }
                        });
                    });

        if (phase.data.assets) {
            Object.keys(phase.data.assets).forEach(sector => {
                if (!editingData.assets[sector]) editingData.assets[sector] = [];
                phase.data.assets[sector].forEach(pAsset => {
                    const ex = editingData.assets[sector].find(a => a.id === pAsset.id);
                    if (ex) {
                        if (pAsset.name !== undefined) ex.name = pAsset.name;
                        if (pAsset.icon !== undefined) ex.icon = pAsset.icon;
                        if (pAsset.memo !== undefined) ex.memo = pAsset.memo;
                        if (pAsset.rate !== undefined) ex.rate = pAsset.rate;
                        if (pAsset.feeRate !== undefined) ex.feeRate = pAsset.feeRate;
                        if (pAsset.monthlyContrib !== undefined) ex.monthlyContrib = pAsset.monthlyContrib;
                        if (pAsset.monthlyContributionFrom !== undefined) ex.monthlyContributionFrom = pAsset.monthlyContributionFrom;
                        if (pAsset.maturityMonth !== undefined) ex.maturityMonth = pAsset.maturityMonth;
                        if (pAsset.repaymentMethod !== undefined) ex.repaymentMethod = pAsset.repaymentMethod;
                        if (pAsset.repaymentAccount !== undefined) ex.repaymentAccount = pAsset.repaymentAccount;
                        if (pAsset.loanStartDate !== undefined) ex.loanStartDate = pAsset.loanStartDate;
                    } else {
                        editingData.assets[sector].push(pAsset);
                    }
                });
            });
        }
        setEditingPhase({ index, originalAppData: appData, startMonth: targetMonth, pureProjectedState: projectedState, displayLabel: phase.startDate });
        
        // 다시 열 때 오버라이드 된 잔액이 있다면 복구
        if (phase.data.assets) {
            Object.keys(phase.data.assets).forEach(sector => {
                phase.data.assets[sector].forEach(pAsset => {
                    const ex = editingData.assets[sector].find(a => a.id === pAsset.id);
                    if (ex && pAsset.isAmountOverridden && pAsset.amount !== undefined) {
                        ex.amount = pAsset.amount;
                        ex.isAmountOverridden = true;
                    }
                });
            });
        }
        setAppData(editingData); // 앱 전체가 페이즈 데이터 바라보게 됨
    };

    const saveAndExitPhase = () => {
        if (!editingPhase) return;
        
        const trueAppData = getPhaseMergedAppData(appData, editingPhase);
        setAppData(trueAppData);
        setEditingPhase(null);
        addToast(`분기점(${editingPhase.displayLabel}) 설정이 저장되었습니다.`, 'success');
    };

    const cancelEditingPhase = () => {
        if (!editingPhase) return;
        setAppData(editingPhase.originalAppData); // 임시 편집 상태를 버리고 원본으로 복구
        setEditingPhase(null);
        addToast('미래 시점 편집이 취소되었습니다.', 'info');
    };

    const addPhase = () => {
        const defaultDate = new Date();
        defaultDate.setMonth(defaultDate.getMonth() + 12); // 기본 1년 뒤 추천
        const defaultDateStr = `${defaultDate.getFullYear()}-${String(defaultDate.getMonth() + 1).padStart(2, '0')}`;
        
        const dateStr = prompt('분기점이 시작될 연/월을 입력하세요.\n(형식: YYYY-MM)', defaultDateStr);
        if (!dateStr) return;
        
        if (!/^\d{4}-\d{2}$/.test(dateStr)) {
            return addToast('YYYY-MM 형식으로 정확히 입력해주세요. (예: 2026-05)', 'error');
        }

        setAppData(prev => {
            const currentPhases = prev.futurePhases || [];
            if (currentPhases.find(p => p.startDate === dateStr)) {
                addToast('이미 해당 월에 분기점이 존재합니다.', 'error');
                return prev;
            }
            return { ...prev, futurePhases: [...currentPhases, { startDate: dateStr, data: {} }] };
        });
    };

        const updatePhaseName = (index, newName) => {
            setAppData(prev => {
                const newPhases = [...(prev.futurePhases || [])];
                newPhases[index] = { ...newPhases[index], name: newName };
                return { ...prev, futurePhases: newPhases };
            });
        };

    const removePhase = (index) => {
        if (confirm('이 분기점 설정을 삭제하시겠습니까?')) {
            setAppData(prev => {
                const newPhases = [...(prev.futurePhases || [])];
                newPhases.splice(index, 1);
                return { ...prev, futurePhases: newPhases };
            });
        }
    };

            // [추가] AI 제안 적용 핸들러
            const handleApplyAIProposal = (proposal) => {
                setDiffData({
                    currentData: appData,
                    proposalData: proposal
                });
                setIsDiffModalOpen(true);
                setIsAIModalOpen(false); // AI 모달 닫기
            };

            // [추가] Diff 확인 및 적용 핸들러
            const handleConfirmDiff = (action) => {
                if (!diffData) return;
                const { proposalData } = diffData;
                const { rebalancingTargets, monthlyContrib } = proposalData;

                // 새로운 데이터 생성
                const newData = { ...appData };
                
                // 1. 리밸런싱 타겟 적용
                if (rebalancingTargets) {
                    newData.rebalancingTargets = { ...newData.rebalancingTargets, ...rebalancingTargets };
                }

                // 2. 월 납입금 적용
                if (monthlyContrib) {
                    const newAssets = { ...newData.assets };
                    Object.keys(newAssets).forEach(sector => {
                        newAssets[sector] = newAssets[sector].map(asset => {
                            if (monthlyContrib[asset.name] !== undefined) {
                                return { ...asset, monthlyContrib: monthlyContrib[asset.name] };
                            }
                            return asset;
                        });
                    });
                    newData.assets = newAssets;
                }

                if (action === 'apply') {
                    setAppData(newData);
                    addToast('AI 제안이 현재 설정에 적용되었습니다.', 'success');
                } else if (action === 'scenario') {
                    const name = prompt('새 시나리오 이름을 입력하세요:', 'AI 추천 시나리오');
                    if (name) {
                        const newScenario = { id: Date.now(), name, data: newData, createdAt: new Date().toISOString() };
                        setScenarios(prev => [...prev, newScenario]);
                        addToast('AI 제안이 새 시나리오로 저장되었습니다.', 'success');
                    }
                }
                setIsDiffModalOpen(false);
                setDiffData(null);
            };

            const cycleDisplayMode = () => {
                if (!isDemoMode && appData?.displayMode === 'amount') setAppData(prev => ({ ...prev, displayMode: 'percent' }));
                else if (!isDemoMode && appData?.displayMode === 'percent') { resetAppData(window.publicDefaultData || {}); setIsDemoMode(true); }
                else { resetAppData({...originalUserData, displayMode: 'amount'}); setIsDemoMode(false); }
            };

            const titleText = isDemoMode
                ? <span className="text-sm text-red-500">(데모 모드)</span>
                : appData?.displayMode === 'percent'
                    ? <span className="text-sm text-blue-500">(프라이빗 모드)</span> : null;

            // ===== 개선된 PDF 저장 함수 (html2canvas + jsPDF) =====
            const saveToPDF = async () => {
                const dateStr = new Date().toISOString().slice(0, 10);
                const defaultName = `자산분석 보고서_${dateStr}`;
                const fileName = prompt('PDF 파일명을 입력하세요:', defaultName);

                // 사용자가 취소하거나 빈 파일명을 입력한 경우 중단
                if (!fileName) {
                    addToast('PDF 저장이 취소되었습니다.', 'info');
                    return;
                }

                setIsExporting(true);
                
                // React가 모든 패널을 렌더링하고 차트가 초기화될 시간을 벌기 위해 약간의 지연(800ms)을 둡니다.
                setTimeout(async () => {
                    if (window.exportDashboardToPDF) {
                        const finalName = fileName.endsWith('.pdf') ? fileName.slice(0, -4) : fileName;
                        await window.exportDashboardToPDF(addToast, darkMode, finalName);
                    } else {
                        addToast('PDF 내보내기 기능을 사용할 수 없습니다.', 'error');
                    }
                    setIsExporting(false);
                }, 800);
            };

            // ===== 시나리오 관리 함수들 =====
            const saveScenario = () => {
                // [수정] 시나리오 저장 시 깔끔한 기본 이름 제공 (지저분한 자동완성 방지)
                const now = new Date();
                const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                const name = prompt('시나리오 이름을 입력하세요:', `시나리오 ${dateStr}`);
                if (name && name.trim()) {
                    const newScenario = {
                        id: Date.now(),
                        name: name.trim(),
                        data: { ...appData },
                        createdAt: new Date().toISOString()
                    };
                    setScenarios(prev => [...prev, newScenario]);
                    addToast('시나리오가 저장되었습니다.', 'success');
                }
            };

            const loadScenario = (scenario) => {
                if (confirm(`"${scenario.name}" 시나리오를 불러오시겠습니까?`)) {
                    // [추가] 불러오기 전 현재 데이터 백업 확인
                    if (confirm('현재 데이터를 기본값으로 백업하시겠습니까?\n(백업하지 않으면 현재 작업 내용이 덮어쓰여집니다)')) {
                        localStorage.setItem('assetDashboardCustomDefault', JSON.stringify(appData));
                        addToast('현재 데이터가 기본값으로 백업되었습니다.', 'success');
                    }

                    // [수정] 시나리오 데이터 병합 로직 개선 (누락된 필드 보완)
                    const base = JSON.parse(JSON.stringify(window.publicDefaultData || {}));
                    const loaded = scenario.data || {};
                    
                    const mergedData = {
                        ...base,
                        ...loaded,
                        assets: { ...base.assets, ...(loaded.assets || {}) },
                        monthlyExpenses: Array.isArray(loaded.monthlyExpenses) ? loaded.monthlyExpenses : base.monthlyExpenses,
                        incomeEvents: Array.isArray(loaded.incomeEvents) ? loaded.incomeEvents : base.incomeEvents,
                        expenseEvents: Array.isArray(loaded.expenseEvents) ? loaded.expenseEvents : base.expenseEvents,
                    };
                    resetAppData(mergedData);
                }
            };

            const deleteScenario = (id) => {
                if (confirm('시나리오를 삭제하시겠습니까?')) {
                    setScenarios(prev => prev.filter(s => s.id !== id));
                }
            };

            const toggleReference = (scenario) => {
                setReferenceScenarios(prev => {
                    const exists = prev.find(r => r.id === scenario.id);
                    if (exists) {
                        return prev.filter(r => r.id !== scenario.id);
                    } else {
                        const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];
                        const usedColors = prev.map(r => r.color);
                        const nextColor = colors.find(c => !usedColors.includes(c)) || '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
                        return [...prev, { id: scenario.id, color: nextColor }];
                    }
                });
            };

            const updateReferenceColor = (id, color) => {
                setReferenceScenarios(prev => prev.map(r => r.id === id ? { ...r, color } : r));
            };

            // ===== 예산 계산 =====
            const totalMonthlyExpense = useMemo(() => {
                if (!monthlyExpenses || !Array.isArray(monthlyExpenses)) return 0;
                return monthlyExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
            }, [monthlyExpenses]);
            
            const totalSectorMonthlyContrib = useMemo(() => {
                if (!assets || typeof assets !== 'object') return 0;
                let sum = 0;
                // [개선] 실제 현재 날짜가 아닌 '시뮬레이션 기준일(baseDate) + 미래 페이즈 개월 수'를 기준으로 판단
                const [bY, bM] = (baseDate || new Date().toISOString().slice(0, 10)).split('-').map(Number);
                let effectiveYear = bY;
                let effectiveMonth = bM;
                if (editingPhase !== null) {
                    const d = new Date(bY, bM - 1 + editingPhase.startMonth, 1);
                    effectiveYear = d.getFullYear();
                    effectiveMonth = d.getMonth() + 1;
                }
                const effectiveTotalMonths = effectiveYear * 12 + effectiveMonth;

                Object.entries(assets).forEach(([sector, arr]) => {
                    if (Array.isArray(arr)) {
                        arr.forEach(asset => { 
                            // [수정] 대출의 경우 조건부 합산
                            if (sector === 'loan') {
                                // 1. 상환 계좌가 '월급(salary)'이 아니면 월납입 예산에서 제외 (자산에서 차감되므로)
                                if (asset.repaymentAccount !== 'salary') return;
                                
                                // 2. 대출 시작일이 미래인 경우 현재 예산에서 제외 (시작월 다음 달부터 상환)
                                if (asset.loanStartDate) {
                                    const [y, m] = asset.loanStartDate.split('-').map(Number);
                                    const loanStartTotalMonths = y * 12 + m;
                                    // [Fix] 예산의 한 달 오차 수정: 대출 시작월(loanStartTotalMonths) 이전 달까지만 예산에서 제외하고, 해당 월부터는 즉시 상환 예산으로 잡히도록 수정 (< 적용)
                                    if (effectiveTotalMonths < loanStartTotalMonths) return;
                                }
                            } else {
                                // [수정] 일반 자산: 납입 출처가 '월 고정수입'이 아니면 예산 합산 제외
                                const source = asset.monthlyContributionFrom || window.MONTHLY_INCOME_SOURCE;
                                if (source !== window.MONTHLY_INCOME_SOURCE) return;
                            }
                            sum += Number(asset.monthlyContrib || 0); 
                        });
                    }
                });
                return sum;
            }, [assets, baseDate, editingPhase]);
            
            const maxSectorMonthlyContrib = useMemo(() => Math.max(0, monthlySalary - totalMonthlyExpense), [monthlySalary, totalMonthlyExpense]);
            const autoDepositAmount = Math.max(0, maxSectorMonthlyContrib - totalSectorMonthlyContrib);

            const calculateGoalSeek = () => {
                if (!targetAmount || targetAmount <= 0) {
                    addToast('유효한 목표 금액을 입력해주세요.', 'error');
                    return;
                }

                // [수정] utils.js의 calculateGoalReachMonth 사용
                const result = calculateGoalReachMonth(appData, targetAmount);

                if (result.success) {
                    setGoalSeekResult(`목표 달성까지 약 ${result.month}개월 소요됩니다.`);
                    setProjectionMonths(result.month);
                } else if (result.error) {
                    setGoalSeekResult(result.message);
                } else {
                    setGoalSeekResult('계산 결과를 찾을 수 없습니다.');
                }
            };

            const movePanel = (id, direction) => {
                setLayoutOrder(prev => {
                    const index = prev.indexOf(id);
                    if (index === -1) return prev;
                    const newIndex = index + direction;
                    if (newIndex < 0 || newIndex >= prev.length) return prev;
                    const newOrder = [...prev];
                    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
                    return newOrder;
                });
            };

            const togglePanelCollapse = (panelId) => {
                setPanelCollapseState(prev => ({
                    ...prev,
                    [panelId]: !prev[panelId]
                }));
            };

            const moveAssetSector = (sectorKey, direction) => {
                setAssetSectorOrder(prev => {
                    const index = prev.indexOf(sectorKey);
                    if (index === -1) return prev;
                    const newIndex = index + direction;
                    if (newIndex < 0 || newIndex >= prev.length) return prev;
                    const newOrder = [...prev];
                    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
                    return newOrder;
                });
            };

            const [draggedPanelId, setDraggedPanelId] = useState(null);

            const [draggedAssetIndex, setDraggedAssetIndex] = useState(null);
            const [draggedAssetSector, setDraggedAssetSector] = useState(null);

            const handleAssetDragStart = React.useCallback((e, sector, index) => {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'BUTTON' || e.target.closest('.no-drag')) {
                    e.preventDefault();
                    return;
                }
                setDraggedAssetIndex(index);
                setDraggedAssetSector(sector);
                e.dataTransfer.effectAllowed = "move";
            }, []);

            const handleAssetDragOver = React.useCallback((e) => {
                e.preventDefault();
            }, []);

            const handleAssetDrop = React.useCallback((e, sector, targetIndex) => {
                e.preventDefault();
                if (draggedAssetIndex === null || draggedAssetSector !== sector || draggedAssetIndex === targetIndex) {
                    setDraggedAssetIndex(null);
                    setDraggedAssetSector(null);
                    return;
                }

                setAppData(prevData => {
                    const prevAssets = prevData.assets;
                    const sectorAssets = [...(prevAssets[sector] || [])];
                    const [movedItem] = sectorAssets.splice(draggedAssetIndex, 1);
                    sectorAssets.splice(targetIndex, 0, movedItem);

                    return {
                        ...prevData,
                        assets: {
                            ...prevAssets,
                            [sector]: sectorAssets
                        }
                    };
                });

                setDraggedAssetIndex(null);
                setDraggedAssetSector(null);
            }, [draggedAssetIndex, draggedAssetSector, setAppData]);

            const handlePanelDragStart = React.useCallback((e, id) => {
                setDraggedPanelId(id);
                e.dataTransfer.effectAllowed = "move";
            }, []);

            const handlePanelDragOver = React.useCallback((e) => e.preventDefault(), []);

            const handlePanelDrop = React.useCallback((e, targetId) => {
                e.preventDefault();
                if (!draggedPanelId || draggedPanelId === targetId) return;

                setLayoutOrder(prev => {
                    const oldIndex = prev.indexOf(draggedPanelId);
                    const newIndex = prev.indexOf(targetId);
                    if (oldIndex === -1 || newIndex === -1) return prev;
                    const newOrder = [...prev];
                    newOrder.splice(oldIndex, 1);
                    newOrder.splice(newIndex, 0, draggedPanelId);
                    return newOrder;
                });
                setDraggedPanelId(null);
            }, [draggedPanelId]);

            // [추가] Web Worker 기반 비동기 시뮬레이션 상태
            const [calculation, setCalculation] = useState(() => {
                const initialAssets = appData?.assets || {};
                return {
                    initial: initialAssets,
                    projected: initialAssets,
                    currentTotal: 0,
                    currentNet: 0,
                    currentGross: 0,
                    projectedTotal: 0,
                    projectedNet: 0,
                    projectedGross: 0,
                    realValue: 0,
                    growth: 0,
                    grand: 0,
                    monthlyProjections: [],
                    warnings: [],
                    fireMetrics: {
                        runwayMonths: 0,
                        debtFreeMonth: -1,
                        swr4PercentCapital: 0
                    },
                    totalMonthlyExpense: 0,
                    rebalanceInfo: {
                        recs: {},
                        budgetLimited: false,
                        targetMonths: 12,
                        itemRecs: {}
                    }
                };
            });
            const [isCalculating, setIsCalculating] = useState(false);

            useEffect(() => {
                if (!appData || !appData.assets || typeof appData.assets !== 'object') return;

                setIsCalculating(true);
                const worker = new Worker(new URL('./projection.worker.js', import.meta.url), { type: 'module' });

                worker.postMessage({
                    appData,
                    projectionMonths: appData.projectionMonths || 120,
                    inflationRate,
                    baseDate: appData.baseDate || appData.baseMonth || '',
                    editingPhase,
                    sectorInfo
                });

                worker.onmessage = (e) => {
                    const { success, result, error } = e.data;
                    setIsCalculating(false);
                    if (success) {
                        setCalculation(result);
                    } else {
                        console.error('Simulation error:', error);
                    }
                    worker.terminate();
                };

                return () => {
                    worker.terminate();
                };
            }, [appData, inflationRate, editingPhase]);


            const { currentGrossTotal, projectedGrossTotal, currentSectorTotals, projectedSectorTotals } = useMemo(() => {
                const cGross = calculateGrossTotal(calculation.initial);
                const pGross = calculateGrossTotal(calculation.projected);
                return {
                    currentGrossTotal: cGross,
                    projectedGrossTotal: pGross,
                    currentSectorTotals: getSectorTotals(calculation.initial, cGross),
                    projectedSectorTotals: getSectorTotals(calculation.projected, pGross)
                };
            }, [calculation]);

            const filteredKeys = useMemo(() => Object.keys(currentSectorTotals).filter(k => k !== 'loan'), [currentSectorTotals]);
            const projectedKeys = useMemo(() => Object.keys(projectedSectorTotals).filter(k => k !== 'loan'), [projectedSectorTotals]);

            // ===== 리밸런싱 경고 함수 (목표 비중 기준 편차) =====
            const getRebalanceStatus = (key, percentage, isItem = false, itemId = null, sectorKey = null) => {
                const globalSettings = appData.rebalancingGlobal || { sector: { warning: 5, danger: 10 }, item: { warning: 5, danger: 10 } };
                const thresholds = isItem ? globalSettings.item : globalSettings.sector;
                
                let target;
                if (isItem && sectorKey) {
                    const assetsInSector = assets[sectorKey] || [];
                    const totalWeight = assetsInSector.reduce((sum, a) => sum + (appData.itemTargets?.[a.id] ?? Math.round(100/assetsInSector.length)), 0);
                    const rawTarget = appData.itemTargets?.[itemId] ?? Math.round(100/assetsInSector.length);
                    target = totalWeight === 0 ? 0 : (rawTarget / totalWeight) * 100;
                } else {
                    target = rebalancingTargets[key] ?? (100 / Object.keys(sectorInfo).length);
                }

                const deviation = Math.abs(percentage - target);
                if (isItem) {
                    if (deviation >= thresholds.danger) return 'text-red-600 dark:text-red-400 font-bold';
                    if (deviation >= thresholds.warning) return 'text-yellow-600 dark:text-yellow-400 font-bold';
                } else {
                    if (deviation >= thresholds.danger) return 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-100';
                    if (deviation >= thresholds.warning) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-100';
                }
                return '';
            };

            const getAutoDepositBreakdown = () => {
                const breakdown = [];
                // [개선] 실제 현재 날짜가 아닌 '시뮬레이션 기준일(baseDate) + 미래 페이즈 개월 수'를 기준으로 판단
                const [bY, bM] = (baseDate || new Date().toISOString().slice(0, 10)).split('-').map(Number);
                let effectiveYear = bY;
                let effectiveMonth = bM;
                if (editingPhase !== null) {
                    const d = new Date(bY, bM - 1 + editingPhase.startMonth, 1);
                    effectiveYear = d.getFullYear();
                    effectiveMonth = d.getMonth() + 1;
                }
                const effectiveTotalMonths = effectiveYear * 12 + effectiveMonth;

                Object.keys(assets).forEach(sectorKey => {
                    if (Array.isArray(assets[sectorKey])) {
                        assets[sectorKey].forEach(asset => {
                            if (asset.monthlyContrib > 0) {
                                // [수정] 예산 포함 여부 체크 (totalSectorMonthlyContrib와 동일 로직)
                                let isBudget = true;
                                if (sectorKey === 'loan') {
                                    if (asset.repaymentAccount !== 'salary') isBudget = false;
                                    if (asset.loanStartDate) {
                                        const [y, m] = asset.loanStartDate.split('-').map(Number);
                                        const loanStartTotalMonths = y * 12 + m;
                                        // [Fix] 예산 오차 수정 (< 적용)
                                        if (effectiveTotalMonths < loanStartTotalMonths) isBudget = false;
                                    }
                                } else {
                                    const source = asset.monthlyContributionFrom || window.MONTHLY_INCOME_SOURCE;
                                    if (source !== window.MONTHLY_INCOME_SOURCE) isBudget = false;
                                }

                                if (isBudget) {
                                    breakdown.push({
                                        sector: sectorKey,
                                        name: asset.name,
                                        amount: asset.monthlyContrib
                                    });
                                }
                            }
                        });
                    }
                });
                return breakdown;
            };

            const autoDepositBreakdown = getAutoDepositBreakdown();

            // ===== 차트 헬퍼 및 설정 =====

            const initChart = (id, ref, config) => {
                if (ref.current) {
                    const ctx = ref.current.getContext('2d');
                    if (ctx) {
                        chartInstancesRef.current[id] = new Chart(ctx, config);
                    }
                }
            };


            const commonChartOptions = useMemo(() => {
                const textColor = darkMode ? '#e5e7eb' : '#111827';
                const gridColor = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
                return {
                    maintainAspectRatio: false,
                    responsive: true,
                    animation: { animateScale: true, animateRotate: true, duration: 1000 },
                    plugins: {
                        legend: { position: 'bottom', labels: { color: textColor, padding: 15, font: { family: 'Pretendard' } } },
                        datalabels: {
                            color: darkMode ? '#ffffff' : '#111827',
                            anchor: 'center', // [수정] 중앙 배치
                            align: 'center',  // [수정] 중앙 배치
                            font: { weight: 'bold', size: 11 },
                            formatter: (value, ctx) => {
                                const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0) || 1;
                                const pct = (value / total) * 100;
                                return pct > 4 ? `${pct.toFixed(1)}%` : '';
                            }
                        },
                        tooltip: {
                            backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                            titleColor: darkMode ? '#f8fafc' : '#1e293b',
                            bodyColor: darkMode ? '#cbd5e1' : '#475569',
                            borderColor: gridColor,
                            borderWidth: 1,
                            padding: 10,
                            cornerRadius: 8,
                            callbacks: {
                                label: (ctx) => {
                                    const label = ctx.label || '';
                                    const val = ctx.parsed || 0;
                                    const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                    const pct = ((val / total) * 100).toFixed(1);
                                    return ` ${label}: ${Math.round(val).toLocaleString()}만원 (${pct}%)`;
                                }
                            }
                        }
                    }
                };
            }, [darkMode]);

            const chartBorderColor = darkMode ? '#1e293b' : '#ffffff';

            useEffect(() => {
                if (isLoading || panelCollapseState['charts'] || typeof Chart === 'undefined') return;

                const renderCurrentPie = () => {
                    if (!currentPieRef.current) return;
                    let labels, data, colors;
                    if (currentDrillDown) {
                        const sectorAssets = assets[currentDrillDown] || [];
                        labels = sectorAssets.map(a => a.name);
                        data = sectorAssets.map(a => a.amount);
                        // [수정] 전역 getRGB 함수를 사용하여 드릴다운 색상 일관성 유지
                        const baseRGB = window.getRGB(sectorInfo[currentDrillDown].color);
                        // [수정] 다크모드일 때 드릴다운 색상 투명도 조정 (톤 다운)
                        const startAlpha = darkMode ? 0.8 : 0.9;
                        colors = sectorAssets.map((_, i) => `rgba(${baseRGB}, ${Math.max(0.1, startAlpha - (i * 0.1))})`);
                    } else {
                        labels = filteredKeys.map(key => sectorInfo[key]?.name || key);
                        data = filteredKeys.map(key => currentSectorTotals[key]?.amount || 0);
                    }

                    const ctx = currentPieRef.current.getContext('2d');
                    const bgColors = currentDrillDown ? colors : filteredKeys.map(key => {
                        const c = tailwind?.config?.theme?.extend?.colors?.[key] || { start: '#3b82f6', end: '#1d4ed8' };
                        // [수정] 다크모드일 경우 더 어두운 그라데이션 색상 사용
                        const colorSet = (darkMode && c.darkStart && c.darkEnd) ? { start: c.darkStart, end: c.darkEnd } : c;
                        return createGradient(ctx, colorSet);
                    });

                    const chartConfig = {
                            type: 'doughnut',
                            data: {
                                labels: labels,
                                datasets: [{
                                    data: data,
                                    backgroundColor: bgColors,
                                    borderWidth: 2,
                                    borderColor: chartBorderColor,
                                    hoverOffset: 15
                                }]
                            },
                            options: {
                                ...commonChartOptions,
                                onClick: (evt, elements) => {
                                    if (currentDrillDown) {
                                        setCurrentDrillDown(null);
                                    } else if (elements && elements.length > 0) {
                                        const index = elements[0].index;
                                        setCurrentDrillDown(filteredKeys[index]);
                                    }
                                },
                                plugins: {
                                    ...commonChartOptions.plugins,
                                    title: { display: true, text: currentDrillDown ? `${sectorInfo[currentDrillDown]?.name || currentDrillDown} 상세` : '현재 포트폴리오', color: darkMode ? '#e5e7eb' : '#111827', font: { size: 16, weight: 'bold' } }
                                }
                            },
                            plugins: [ChartDataLabels]
                    };

                    if (chartInstancesRef.current['currentPie']) {
                        const chart = chartInstancesRef.current['currentPie'];
                        if (chart.canvas !== currentPieRef.current) {
                            chart.destroy();
                            chartInstancesRef.current['currentPie'] = new Chart(ctx, chartConfig);
                        } else {
                            chart.data = chartConfig.data;
                            chart.options = chartConfig.options;
                            chart.update('none');
                        }
                    } else {
                        chartInstancesRef.current['currentPie'] = new Chart(ctx, chartConfig);
                    }
                };
                    const timerId = setTimeout(renderCurrentPie, 150);
                return () => clearTimeout(timerId);
                }, [currentDrillDown, currentSectorTotals, filteredKeys, assets, darkMode, isLoading, panelCollapseState['charts'], activeTab, isExporting]);

            useEffect(() => {
                if (isLoading || panelCollapseState['charts'] || typeof Chart === 'undefined') return;

                const renderProjectedPie = () => {
                    if (!projectedPieRef.current) return;
                    let labels, data, colors;
                    if (projectedDrillDown) {
                        const projAssets = calculation.projected[projectedDrillDown] || [];
                        labels = projAssets.map(a => a.name);
                        data = projAssets.map(a => a.amount);
                        // [수정] 전역 getRGB 함수를 사용하여 드릴다운 색상 일관성 유지
                        const baseRGB = window.getRGB(sectorInfo[projectedDrillDown].color);
                        // [수정] 다크모드일 때 드릴다운 색상 투명도 조정 (톤 다운)
                        const startAlpha = darkMode ? 0.8 : 0.9;
                        colors = projAssets.map((_, i) => `rgba(${baseRGB}, ${Math.max(0.1, startAlpha - (i * 0.1))})`);
                    } else {
                        labels = projectedKeys.map(key => sectorInfo[key]?.name || key);
                        data = projectedKeys.map(key => projectedSectorTotals[key]?.amount || 0);
                    }

                    const ctx = projectedPieRef.current.getContext('2d');
                    const bgColors = projectedDrillDown ? colors : projectedKeys.map(key => {
                        const c = tailwind?.config?.theme?.extend?.colors?.[key] || { start: '#10b981', end: '#059669' };
                        // [수정] 다크모드일 경우 더 어두운 그라데이션 색상 사용
                        const colorSet = (darkMode && c.darkStart && c.darkEnd) ? { start: c.darkStart, end: c.darkEnd } : c;
                        return createGradient(ctx, colorSet);
                    });

                    const chartConfig = {
                            type: 'doughnut',
                            data: {
                                labels: labels,
                                datasets: [{
                                    data: data,
                                    backgroundColor: bgColors,
                                    borderWidth: 2,
                                    borderColor: chartBorderColor,
                                    hoverOffset: 15
                                }]
                            },
                            options: {
                                ...commonChartOptions,
                                onClick: (evt, elements) => {
                                    if (projectedDrillDown) {
                                        setProjectedDrillDown(null);
                                    } else if (elements && elements.length > 0) {
                                        const index = elements[0].index;
                                        setProjectedDrillDown(projectedKeys[index]);
                                    }
                                },
                                plugins: {
                                    ...commonChartOptions.plugins,
                                    title: { 
                                        display: true, 
                                        text: projectedDrillDown ? `${sectorInfo[projectedDrillDown]?.name || projectedDrillDown} 예상` : `${projectionMonths}개월 후 예상`, 
                                        color: darkMode ? '#e5e7eb' : '#111827', 
                                        font: { size: 16, weight: 'bold' } 
                                    }
                                }
                            },
                            plugins: [ChartDataLabels]
                    };

                    if (chartInstancesRef.current['projectedPie']) {
                        const chart = chartInstancesRef.current['projectedPie'];
                        if (chart.canvas !== projectedPieRef.current) {
                            chart.destroy();
                            chartInstancesRef.current['projectedPie'] = new Chart(ctx, chartConfig);
                        } else {
                            chart.data = chartConfig.data;
                            chart.options = chartConfig.options;
                            chart.update('none');
                        }
                    } else {
                        chartInstancesRef.current['projectedPie'] = new Chart(ctx, chartConfig);
                    }
                };
                    const timerId = setTimeout(renderProjectedPie, 150);
                return () => clearTimeout(timerId);
                }, [projectedDrillDown, projectedSectorTotals, projectedKeys, calculation.projected, darkMode, isLoading, panelCollapseState['charts'], activeTab, isExporting]);

            useEffect(() => {
                if (isLoading || panelCollapseState['charts'] || typeof Chart === 'undefined') return;

                const renderComparisonBar = () => {
                    if (!comparisonBarRef.current) return;
                    const comparisonLabels = projectedKeys.map(key => sectorInfo[key]?.name || key);
                    const comparisonCurrentData = projectedKeys.map(key => currentSectorTotals[key]?.amount || 0);
                    const comparisonProjectedData = projectedKeys.map(key => projectedSectorTotals[key]?.amount || 0);

                    const chartConfig = {
                            type: 'bar',
                            data: {
                                labels: comparisonLabels,
                                datasets: [
                                    { label: '현재', data: comparisonCurrentData, backgroundColor: 'rgba(59, 130, 246, 0.7)', borderRadius: 4 },
                                    { label: '예상', data: comparisonProjectedData, backgroundColor: 'rgba(34, 197, 94, 0.7)', borderRadius: 4 }
                                ]
                            },
                            options: {
                                maintainAspectRatio: false,
                                responsive: true,
                                scales: {
                                    x: { ticks: { color: darkMode ? '#e5e7eb' : '#111827' }, grid: { display: false } },
                                    y: { beginAtZero: true, ticks: { color: darkMode ? '#e5e7eb' : '#111827' }, grid: { color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' } }
                                },
                                plugins: {
                                    legend: { labels: { color: darkMode ? '#e5e7eb' : '#111827' } },
                                    datalabels: { display: false },
                                    title: { display: true, text: '현재 vs 예상 자산 비교', color: darkMode ? '#e5e7eb' : '#111827', font: { size: 16, weight: 'bold' } }
                                }
                            }
                    };

                    const ctx = comparisonBarRef.current.getContext('2d');
                    if (chartInstancesRef.current['comparisonBar']) {
                        const chart = chartInstancesRef.current['comparisonBar'];
                        if (chart.canvas !== comparisonBarRef.current) {
                            chart.destroy();
                            chartInstancesRef.current['comparisonBar'] = new Chart(ctx, chartConfig);
                        } else {
                            chart.data = chartConfig.data;
                            chart.options = chartConfig.options;
                            chart.update('none');
                        }
                    } else {
                        chartInstancesRef.current['comparisonBar'] = new Chart(ctx, chartConfig);
                    }
                };
                    const timerId = setTimeout(renderComparisonBar, 150);
                return () => clearTimeout(timerId);
                }, [currentSectorTotals, projectedSectorTotals, projectedKeys, darkMode, isLoading, panelCollapseState['charts'], activeTab, isExporting]);

            useEffect(() => {
                return () => {
                    Object.values(chartInstancesRef.current).forEach(instance => {
                        if (instance) instance.destroy();
                    });
                };
            }, []);

            const historyProjectionData = useMemo(() => {
                if (!showProjectionInHistory) return null;
                return {
                    projections: calculation.monthlyProjections,
                    baseDate: baseDate
                };
            }, [showProjectionInHistory, calculation.monthlyProjections, baseDate]);

            const historyTargetData = useMemo(() => {
                return goalMode === 'target' ? targetAmount : null;
            }, [goalMode, targetAmount]);

            useEffect(() => {
                if (panelCollapseState['history'] || assetHistory.length === 0) return;
                
                const renderHistoryChart = () => {
                    if (!historyChartRef.current) return; // [수정] 렌더링 시점에 ref 확인 (비동기 처리)

                    const textColor = darkMode ? '#e5e7eb' : '#111827';
                    const gridColor = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

                    // [수정] 줌 레벨에 따른 동적 디테일 구현 (항상 일별 데이터 사용)
                    const useMonthlyAverage = false;

                    let finalLabels = [];
                    let finalHistoryData = [];
                    let optimisticData = []; // [추가] 낙관적 시나리오 데이터
                    let pessimisticData = []; // [추가] 비관적 시나리오 데이터
                    let sortedMonthKeys = []; // [추가] 클릭 이벤트 핸들링을 위해 키 저장
                    let refDatasetsData = []; // [추가] 평균 계산을 위한 참조 데이터 수집

                    // 항상 원본 날짜 그대로 사용
                    finalLabels = assetHistory.map(item => {
                        const [y, m, d] = item.date.split('-');
                        return `${Number(m)}/${Number(d)}`;
                    });
                    finalHistoryData = assetHistory.map(item => historyViewMode === 'gross' ? Number(item.grossWorth || item.netWorth) : Number(item.netWorth));
                
                    let projectionData = new Array(finalHistoryData.length).fill(null);
                    // [추가] 범위 데이터 초기화 (히스토리 구간은 null)
                    optimisticData = new Array(finalHistoryData.length).fill(null);
                    pessimisticData = new Array(finalHistoryData.length).fill(null);

                if (historyProjectionData && historyProjectionData.projections && historyProjectionData.projections.length > 0) {
                    // 마지막 히스토리 지점과 연결하여 연속성 확보
                    if (finalHistoryData.length > 0) {
                        const lastVal = finalHistoryData[finalHistoryData.length - 1];
                        projectionData[finalHistoryData.length - 1] = lastVal;
                        optimisticData[finalHistoryData.length - 1] = lastVal;
                        pessimisticData[finalHistoryData.length - 1] = lastVal;
                    }
                    
                    historyProjectionData.projections.forEach((p, idx) => {
                        if (idx === 0) return;
                        
                        // 미래 날짜 라벨 생성
                        const [y, m] = (historyProjectionData.baseDate || new Date().toISOString().slice(0, 10)).split('-').map(Number);
                        const d = new Date(y, m - 1 + idx);
                        const label = `${String(d.getFullYear()).slice(2)}년 ${String(d.getMonth() + 1).padStart(2, '0')}월`; // 미래는 항상 월 단위
                        
                        // 라벨 중복 체크 (히스토리와 겹치지 않게)
                        if (!finalLabels.includes(label)) {
                            finalLabels.push(label);
                            
                            // [추가] 불확실성 범위 계산 (매월 0.5%씩 변동성 누적 가정)
                            const volatility = 0.005 * idx; 
                            
                            const val = historyViewMode === 'gross' ? p.gross : p.net;
                            projectionData.push(Math.floor(val));
                            optimisticData.push(Math.floor(val * (1 + volatility)));
                            pessimisticData.push(Math.floor(val * (1 - volatility)));
                            
                            finalHistoryData.push(null);
                        }
                    });
                }

                // [수정] 월말 데이터 판별 함수 (날짜 문자열 기준)
                const isMonthEnd = (index) => {
                    if (index >= assetHistory.length) return false; // [Fix] 히스토리 범위를 벗어난 경우(예상 데이터) 처리
                    if (index === assetHistory.length - 1) return true; // 마지막 데이터는 항상 표시
                    const currDate = assetHistory[index].date;
                    const nextDate = assetHistory[index + 1].date;
                    // 다음 데이터의 월이 다르면 현재 데이터가 해당 월의 마지막 데이터임
                    return currDate.substring(0, 7) !== nextDate.substring(0, 7);
                };

                // [수정] 줌 레벨 및 월말 여부에 따른 동적 포인트 설정
                const getDynamicPointRadius = (context) => {
                    const chart = context.chart;
                    if (!chart.scales.x) return 3; // 초기 로딩 시 기본값
                    
                    // 현재 뷰포트에 보이는 데이터 개수 계산
                    const min = chart.scales.x.min;
                    const max = chart.scales.x.max;
                    const visibleCount = max - min;
                    
                    // 기준: 25개
                    if (visibleCount > 25) {
                        // 25개보다 많이 보일 때는 '월말 데이터'만 표시 (나머지는 숨김)
                        return isMonthEnd(context.dataIndex) ? 4 : 0;
                    } else {
                        // 25개 이하로 확대되었을 때는 '모든 일자별 데이터' 표시
                        return 4;
                    }
                };

                // [추가] 숨겨진 포인트는 클릭/호버도 안 되게 처리
                const getDynamicInteractionRadius = (context) => {
                    return getDynamicPointRadius(context) > 0 ? 6 : 0;
                };

                const datasets = [
                    {
                        label: historyViewMode === 'gross' ? '총자산 (만원)' : '순자산 (만원)',
                        data: finalHistoryData,
                        borderColor: 'rgb(79, 70, 229)',
                        _originalBorder: 'rgb(79, 70, 229)', // [추가] 원본 색상 보존
                        backgroundColor: (context) => {
                            const ctx = context.chart.ctx;
                            const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                            gradient.addColorStop(0, 'rgba(79, 70, 229, 0.3)');
                            gradient.addColorStop(1, 'rgba(79, 70, 229, 0)');
                            return gradient;
                        },
                        tension: 0.3,
                        fill: true,
                        pointBackgroundColor: 'rgb(79, 70, 229)',
                        pointHoverRadius: getDynamicInteractionRadius, // [적용] 동적 호버 크기
                        pointHoverBackgroundColor: 'rgb(255, 255, 255)',
                        pointHoverBorderWidth: 2,
                        pointHoverBorderColor: 'rgb(79, 70, 229)', // [수정] 콤마 추가
                        pointRadius: getDynamicPointRadius // [적용] 동적 포인트 크기
                        ,order: 1 // [추가] 순서 명시 (맨 위)
                        ,pointHitRadius: getDynamicInteractionRadius // [추가] 숨겨진 점 클릭 방지
                    }
                ];

                if (showProjectionInHistory) {
                    // [추가] 낙관적 시나리오 (범위 상단)
                    datasets.push({
                        label: '낙관적 예상 (+)',
                        data: optimisticData,
                        borderColor: 'transparent',
                        backgroundColor: darkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                        fill: '+1', // 다음 데이터셋(예상 자산)까지 채움 (순서 중요)
                        pointRadius: 0,
                        tension: 0.4,
                        order: 10
                    });

                    datasets.push({
                        label: '예상 자산 (만원)',
                        data: projectionData,
                        borderColor: 'rgba(79, 70, 229, 0.5)',
                        borderDash: [5, 5], // 점선 표시
                        tension: 0.3,
                        fill: '-1', // 이전 데이터셋(낙관적)까지 채움 -> 실제로는 아래 비관적과 샌드위치 효과를 위해 조정 필요하나 Chart.js fill 로직상 단색 처리
                        pointRadius: 2,
                        pointBackgroundColor: 'rgba(79, 70, 229, 0.5)',
                        order: 10
                    });

                    // [추가] 비관적 시나리오 (범위 하단)
                    datasets.push({
                        label: '비관적 예상 (-)',
                        data: pessimisticData,
                        borderColor: 'transparent',
                        backgroundColor: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        fill: '-1', // 바로 위 데이터셋(예상 자산)까지 채움
                        pointRadius: 0,
                        tension: 0.4,
                        order: 10
                    });
                }

                // [수정] 기준 시나리오 오버레이 (다중 지원)
                referenceScenarios.forEach(refConfig => {
                    const scenario = scenarios.find(s => s.id === refConfig.id);
                    if (!scenario) return;

                    const refData = scenario.data;
                    const refBaseDate = refData.baseDate || (refData.baseMonth ? `${refData.baseMonth}-01` : null);
                    
                    if (refBaseDate) {
                        const { projections: refProjections } = calculateMonthlyProjection(refData, 120);
                        const refDatasetData = finalLabels.map(label => {
                            let targetDate;
                            if (label.includes('년')) {
                                const parts = label.match(/(\d+)년 (\d+)월/);
                                if (parts) targetDate = new Date(Number('20' + parts[1]), Number(parts[2]) - 1, 1);
                            } else {
                                const historyItem = assetHistory.find(h => {
                                    const [y, m, d] = h.date.split('-');
                                    return `${Number(m)}/${Number(d)}` === label;
                                });
                                if (historyItem) targetDate = new Date(historyItem.date);
                            }

                            if (!targetDate) return null;

                            const [bY, bM, bD] = refBaseDate.split('-').map(Number);
                            const base = new Date(bY, bM - 1, bD);
                            
                            // 월 차이 계산 (소수점 포함하여 보간)
                            const diffTime = targetDate - base;
                            const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30.44); // 평균 월 일수
                            
                            if (diffMonths >= 0 && diffMonths < refProjections.length - 1) {
                                const idx = Math.floor(diffMonths);
                                const fraction = diffMonths - idx;
                                const val1 = historyViewMode === 'gross' ? (refProjections[idx]?.gross || 0) : (refProjections[idx]?.net || 0);
                                const val2 = historyViewMode === 'gross' ? (refProjections[idx + 1]?.gross || val1) : (refProjections[idx + 1]?.net || val1);
                                return Math.floor(val1 + (val2 - val1) * fraction);
                            }
                            return null;
                        });
                        refDatasetsData.push(refDatasetData);

                        datasets.push({
                            label: `기준: ${scenario.name}`,
                            data: refDatasetData,
                            borderColor: refConfig.color, // 사용자 지정 색상 사용
                            _originalBorder: refConfig.color, // [추가] 원본 색상 보존
                            borderDash: [2, 2],
                            pointRadius: 0,
                            borderWidth: 2,
                            fill: false,
                            tension: 0.4,
                            order: 5,
                            createdAt: scenario.createdAt // [추가] 정렬을 위한 메타데이터
                        });
                    }
                });

                // [추가] 시나리오 평균선 (2개 이상일 때만 표시)
                if (refDatasetsData.length >= 2) {
                    const averageData = finalLabels.map((_, idx) => {
                        let sum = 0;
                        let count = 0;
                        refDatasetsData.forEach(data => {
                            if (data[idx] !== null && data[idx] !== undefined) {
                                sum += data[idx];
                                count++;
                            }
                        });
                        return count > 0 ? Math.floor(sum / count) : null;
                    });

                    datasets.push({
                        label: '시나리오 평균',
                        data: averageData,
                        borderColor: '#8b5cf6', // Purple (Solid Line)
                        _originalBorder: '#8b5cf6', // [추가] 원본 색상 보존
                        borderWidth: 2,
                        pointRadius: 0,
                        fill: false,
                        tension: 0.4,
                        order: 2 // 순자산 다음으로 중요
                    });
                }

                if (historyTargetData && historyTargetData > 0) {
                    datasets.push({
                        label: `목표 자산 (${formatNumber(historyTargetData, displayMode)}만원)`,
                        data: new Array(finalLabels.length).fill(historyTargetData),
                        borderColor: 'rgba(239, 68, 68, 0.8)',
                        borderDash: [5, 5],
                        pointRadius: 0,
                        fill: false,
                        borderWidth: 2,
                        order: 20
                    });
                }

                const handleChartClick = (evt, elements, chart) => {
                    if (!elements || elements.length === 0) {
                        setHistoryPopover(null);
                        return;
                    }
                    const element = elements[0];
                    const index = element.index;
                    const datasetIndex = element.datasetIndex;

                    // 히스토리 데이터셋(0번)인 경우에만 팝오버 표시
                    if (datasetIndex === 0) {
                        const point = assetHistory[index];
                        if (point) {
                            const rect = chart.canvas.getBoundingClientRect();
                            // 캔버스 내부 좌표 계산
                            const x = evt.native.clientX - rect.left;
                            const y = evt.native.clientY - rect.top;
                            
                            setHistoryPopover({
                                x, y,
                                date: point.date,
                                netWorth: point.netWorth,
                                grossWorth: point.grossWorth,
                                index: index,
                                memo: point.memo
                            });
                        }
                    } else {
                        setHistoryPopover(null);
                    }
                };

                const handleChartHover = (e, elements, chart) => {
                    // [수정] 마우스가 선 위에 정확히 없어도 가장 가까운 요소를 찾도록 강제 (intersect: false)
                    const activeElements = chart.getElementsAtEventForMode(e, 'nearest', { intersect: false }, true);
                    
                    if (activeElements.length > 0) {
                        const activeIdx = activeElements[0].datasetIndex;

                        // [최적화] 이미 활성화된 상태라면 불필요한 업데이트 방지 (깜빡임 해결)
                        if (activeHistoryHoverRef.current === activeIdx) return;
                        activeHistoryHoverRef.current = activeIdx;

                        e.native.target.style.cursor = 'pointer';
                        const datasets = chart.data.datasets;

                        datasets.forEach((ds, i) => {
                            // 원본 속성 저장
                            if (ds._originalBorder === undefined) ds._originalBorder = ds.borderColor;
                            if (ds._originalBg === undefined) ds._originalBg = ds.backgroundColor;
                            if (ds._originalFill === undefined) ds._originalFill = ds.fill;
                            if (ds._originalOrder === undefined) ds._originalOrder = ds.order || 0;
                            
                            if (i === activeIdx) {
                                // 선택된 시나리오 강조
                                ds.borderColor = ds._originalBorder;
                                ds.backgroundColor = ds._originalBg;
                                ds.order = 100; // 시각적으로 맨 위에 그리기 (높은 숫자가 나중에 그려짐)

                                // Gap 시각화 적용
                                if (ds.label && ds.label.startsWith('기준:') && datasets[0]) {
                                    ds.fill = {
                                        target: 0,
                                        above: 'rgba(239, 68, 68, 0.2)',
                                        below: 'rgba(34, 197, 94, 0.2)'
                                    };
                                } else {
                                    ds.fill = ds._originalFill;
                                }
                            } else if (i === 0 || ds.label === '시나리오 평균') {
                                // 히스토리(비교 대상)와 평균선은 항상 선명하게 유지
                                ds.borderColor = ds._originalBorder;
                                ds.backgroundColor = ds._originalBg;
                                ds.fill = ds._originalFill;
                                ds.order = (i === 0) ? 0 : 2;
                            } else {
                                // 나머지 흐리게 처리
                                ds.borderColor = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
                                ds.backgroundColor = 'transparent';
                                ds.fill = false;
                                ds.order = 10;
                            }
                        });
                        chart.update();
                    } else {
                        // 마우스가 차트 밖으로 나갔거나 감지된 요소가 없을 때만 초기화
                        if (activeHistoryHoverRef.current !== null) {
                            activeHistoryHoverRef.current = null;
                            e.native.target.style.cursor = 'default';
                            
                            const datasets = chart.data.datasets;
                        datasets.forEach(ds => {
                                if (ds._originalBorder !== undefined) ds.borderColor = ds._originalBorder;
                                if (ds._originalBg !== undefined) ds.backgroundColor = ds._originalBg;
                            if (ds._originalFill !== undefined) ds.fill = ds._originalFill;
                            if (ds._originalOrder !== undefined) ds.order = ds._originalOrder;
                        });
                            chart.update();
                        }
                    }
                };

                const crosshairPlugin = {
                    id: 'crosshair',
                    defaults: {
                        width: 1,
                        color: darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                        dash: [3, 3]
                    },
                    afterInit: (chart) => { chart.crosshair = { x: 0, y: 0 }; },
                    afterEvent: (chart, args) => {
                        const {inChartArea} = args;
                        const {x, y} = args.event;
                        chart.crosshair = {x, y, draw: inChartArea};
                        chart.draw();
                    },
                    afterDraw: (chart, args, options) => {
                        if (chart.tooltip?._active?.length) {
                            const activePoint = chart.tooltip._active[0];
                            const ctx = chart.ctx;
                            const x = activePoint.element.x;
                            const topY = chart.scales.y.top;
                            const bottomY = chart.scales.y.bottom;
                            ctx.save();
                            ctx.beginPath();
                            ctx.moveTo(x, topY);
                            ctx.lineTo(x, bottomY);
                            ctx.lineWidth = options.width;
                            ctx.strokeStyle = options.color;
                            ctx.setLineDash(options.dash);
                            ctx.stroke();
                            ctx.restore();
                        }
                    }
                };

                const chartConfig = {
                    type: 'line',
                    data: {
                        labels: finalLabels,
                        datasets: datasets
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        onClick: handleChartClick, // [추가] 클릭 이벤트 연결
                        onHover: handleChartHover, // [수정] 호버 핸들러 교체
                        hover: { mode: 'nearest', intersect: false }, // [추가] 근접 감지 모드 활성화 (필수)
                        plugins: {
                            legend: { position: 'bottom', labels: { color: textColor } },
                            title: { display: false },
                            // [수정] 툴팁 비활성화 및 외부 상태 업데이트 (상단 정보바 연동)
                            tooltip: { 
                                enabled: false, // 기본 툴팁 끄기
                                mode: 'index', 
                                intersect: false,
                                external: (context) => {
                                    const tooltipModel = context.tooltip;
                                    if (tooltipModel.opacity === 0) {
                                        if (lastHistoryInfoRef.current !== null) {
                                            lastHistoryInfoRef.current = null;
                                            setHistoryChartInfo(null);
                                        }
                                        return;
                                    }
                                    
                                    const title = tooltipModel.title[0] || '';
                                    const items = tooltipModel.body.map((item, i) => {
                                        const dataPoint = tooltipModel.dataPoints[i];
                                        const dataset = dataPoint.dataset;
                                        return {
                                            label: dataset.label,
                                            value: formatNumber(dataPoint.raw, displayMode) + '만원',
                                            rawValue: dataPoint.raw,
                                            // [수정] 호버 시 색상 변경(투명화)되어도 원본 색상 유지
                                            color: dataset._originalBorder || dataset.borderColor,
                                            createdAt: dataset.createdAt,
                                            isNetWorth: dataPoint.datasetIndex === 0,
                                            isAverage: dataset.label === '시나리오 평균'
                                        };
                                    });

                                    // [추가] 툴팁 항목 정렬 로직
                                    items.sort((a, b) => {
                                        if (scenarioSortOrder === 'default') {
                                            // 1. 순자산 최상단
                                            if (a.isNetWorth) return -1;
                                            if (b.isNetWorth) return 1;
                                            // 2. 시나리오 평균 두 번째
                                            if (a.isAverage) return -1;
                                            if (b.isAverage) return 1;
                                            
                                            // 3. 나머지(시나리오 등) 최신순 정렬
                                            if (!a.createdAt) return 1;
                                            if (!b.createdAt) return -1;
                                            return new Date(b.createdAt) - new Date(a.createdAt);
                                        } else if (scenarioSortOrder === 'high') {
                                            return b.rawValue - a.rawValue;
                                        } else if (scenarioSortOrder === 'low') {
                                            return a.rawValue - b.rawValue;
                                        }
                                        return 0;
                                    });

                                    const newInfoStr = JSON.stringify({ title, items });
                                    if (lastHistoryInfoRef.current !== newInfoStr) {
                                        lastHistoryInfoRef.current = newInfoStr;
                                        setHistoryChartInfo({ title, items });
                                    }
                                }
                            },
                            // [추가] 줌 플러그인 설정
                            zoom: {
                                zoom: {
                                    wheel: { enabled: true },
                                    pinch: { enabled: true },
                                    mode: 'x',
                                },
                                pan: {
                                    enabled: true,
                                    mode: 'x',
                                }
                            }
                        },
                        scales: { 
                            y: { 
                                beginAtZero: true,
                                ticks: { color: textColor },
                                grid: { color: gridColor }
                            },
                            x: {
                                ticks: { color: textColor },
                                grid: { color: gridColor }
                            }
                        }
                    },
                    plugins: [crosshairPlugin] // [추가] 플러그인 등록
                };

                    if (chartInstancesRef.current['historyChart']) {
                        const chart = chartInstancesRef.current['historyChart'];
                        if (chart.canvas !== historyChartRef.current) {
                            chart.destroy(); // 캔버스 변경 시 파괴 후 재생성
                            // 재생성은 아래 else 블록에서 처리되지 않으므로 여기서 생성하거나, 로직 흐름상 아래로 빠지게 해야 함.
                            // 여기서는 간단히 재생성
                            chartInstancesRef.current['historyChart'] = new Chart(historyChartRef.current, chartConfig);
                        } else {
                            chart.data = chartConfig.data;
                            chart.options = chartConfig.options;
                            chart.update(); // [Fix] 데이터 구조 변경 시 확실한 갱신을 위해 기본 모드 사용
                        }
                    } else {
                        chartInstancesRef.current['historyChart'] = new Chart(historyChartRef.current, chartConfig);
                    }
                };

                    const timerId = setTimeout(renderHistoryChart, 150);
                return () => clearTimeout(timerId); 
                }, [assetHistory, panelCollapseState['history'], historyTargetData, displayMode, historyProjectionData, darkMode, loadHistorySnapshot, deleteHistoryPoint, referenceScenarios, updateHistoryMemo, scenarioSortOrder, historyViewMode, activeTab, isExporting]);

            const addAsset = (sector) => {
                // [보안/개선] 미래 시점 편집 중일 경우, 새 대출의 시작일을 해당 페이즈 시작월로 똑똑하게 자동 맞춤
                let defaultLoanStart = baseDate ? baseDate.slice(0, 7) : getLocalToday().slice(0, 7);
                if (editingPhase !== null) {
                    const d = new Date(baseDate);
                    d.setMonth(d.getMonth() + editingPhase.startMonth);
                    defaultLoanStart = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                }

                setAssets(prev => ({
                ...prev,
                [sector]: [...(prev[sector] || []), {
                    id: Date.now() + Math.random(), // 고유 ID 추가
                    name: '새 항목',
                    amount: 0,
                    rate: sector === 'loan' ? 3.0 : (sector === 'car' ? -2.0 : 10.0),
                    feeRate: 0,
                    monthlyContrib: 0, // 대출의 경우 '월 상환액'으로 사용
                    monthlyContributionFrom: window.MONTHLY_INCOME_SOURCE, // [수정] 납입 출처 기본값 명시
                    // [수정] 대출 전용 필드 추가
                    repaymentMethod: '원리금균등', // 상환방식
                    repaymentAccount: (Object.values(prev).flat().find(a => a.name === '생활비통장')?.name) || (Object.values(prev).flat()[0]?.name) || '',
                    maturityMonth: 36,
                    loanStartDate: defaultLoanStart // [적용] 보정된 날짜 적용
                }]
                }));
                setPanelCollapseState(prev => ({ ...prev, assets: false })); // [추가] 패널 자동 펼치기
                setHiddenSectors(prev => ({ ...prev, [sector]: false })); // [Fix] 섹터 자동 펼침
            };

            const updateAsset = React.useCallback((sector, index, field, value) => {
                const numberFields = ['amount', 'rate', 'feeRate', 'monthlyContrib', 'extraContrib', 'maturityMonth']; 

                let newValue = numberFields.includes(field) ? Number(value) : value; 

                if (numberFields.includes(field) && isNaN(newValue)) {
                    newValue = 0; // 숫자가 아닌 값이 들어오면 0으로 처리
                }

                // [수정] 유효성 검사 강화: 음수 입력 방지 (수익률 제외)
                if (numberFields.includes(field) && newValue < 0 && field !== 'rate') return;
                
                // [수정] 자산 이름 변경 시 참조(상환계좌, 이체출처 등)도 함께 업데이트하여 시뮬레이션 오류 방지
                setAppData(prevData => {
                    const prevAssets = prevData.assets;
                    const targetAsset = prevAssets[sector][index];
                    const oldName = targetAsset.name;
                    
                    // 1. 자산 정보 업데이트
                    const newSectorAssets = prevAssets[sector].map((a, i) => 
                        i === index ? { ...a, [field]: newValue } : a
                    );
                    const newAssets = { ...prevAssets, [sector]: newSectorAssets };
                    let newData = { ...prevData, assets: newAssets };

                    // 2. 이름이 변경된 경우, 해당 이름을 참조하는 다른 설정들도 업데이트
                    if (field === 'name' && oldName !== newValue) {
                        // 주 현금흐름 계좌 이름 업데이트
                        if (prevData.mainCashFlowAccount === oldName) {
                            newData.mainCashFlowAccount = newValue;
                        }
                        // [추가] 잔여액 입금 계좌 이름 업데이트
                        if (prevData.residualAccount === oldName) {
                            newData.residualAccount = newValue;
                        }
                        // 다른 자산에서의 참조 업데이트 (대출 상환계좌, 추가납입 출처)
                        Object.keys(newAssets).forEach(s => {
                            newAssets[s] = newAssets[s].map(a => {
                                let changed = false;
                                let newA = { ...a };
                                if (newA.extraFrom === oldName) { newA.extraFrom = newValue; changed = true; }
                                // [추가] 월납입 출처 참조 업데이트
                                if (newA.monthlyContributionFrom === oldName) { newA.monthlyContributionFrom = newValue; changed = true; }
                                if (s === 'loan' && newA.repaymentAccount === oldName) { newA.repaymentAccount = newValue; changed = true; }
                                return changed ? newA : a;
                            });
                        });
                    }
                    return newData;
                });
            }, [setAppData]);

            // [추가] 종목 연동 데이터를 저장하는 다중 필드 업데이트
            const updateAssetWithLinked = (sector, index, updatedFields) => {
                setAppData(prevData => {
                    const prevAssets = prevData.assets;
                    const newSectorAssets = prevAssets[sector].map((a, i) => 
                        i === index ? { ...a, ...updatedFields } : a
                    );
                    return { ...prevData, assets: { ...prevAssets, [sector]: newSectorAssets } };
                });
                setStockLinkState(null); // 저장 후 모달 닫기
                addToast('종목 연동이 적용되었습니다.', 'success');
            };

            const moveAsset = React.useCallback((sector, index, direction) => {
                setAppData(prevData => {
                    const prevAssets = prevData.assets;
                    const sectorAssets = [...(prevAssets[sector] || [])];
                    const targetIndex = direction === 'up' ? index - 1 : index + 1;
                    
                    if (targetIndex < 0 || targetIndex >= sectorAssets.length) {
                        return prevData;
                    }
                    
                    // Swap
                    const temp = sectorAssets[index];
                    sectorAssets[index] = sectorAssets[targetIndex];
                    sectorAssets[targetIndex] = temp;
                    
                    return {
                        ...prevData,
                        assets: {
                            ...prevAssets,
                            [sector]: sectorAssets
                        }
                    };
                });
            }, [setAppData]);

            const removeAsset = React.useCallback((sector, index) => {
                const currentData = appDataRef.current;
                if (!currentData) return;
                const currentAssets = currentData.assets;
                const currentMainAccount = currentData.mainCashFlowAccount;

                const assetToRemove = currentAssets[sector][index];
                const assetName = assetToRemove.name; // [추가] 삭제 대상 이름 저장
                const assetId = assetToRemove.id; // [추가] 글로벌 삭제 동기화를 위한 ID 추출
                
                if (assetName === currentMainAccount) {
                    const allAccounts = Object.values(currentAssets).flat();
                    const nextAccount = allAccounts.find(a => a.id !== assetToRemove.id);
                    
                    if (nextAccount) {
                        setMainCashFlowAccount(nextAccount.name);
                    } else {
                        addToast('최소 한 개의 계좌는 유지되어야 하며, 주 현금흐름 계좌로 설정되어야 합니다.', 'error');
                        return;
                    }
                }
                
                // [수정] 자산 삭제 시 해당 자산을 참조하는 다른 설정(납입출처, 상환계좌 등)도 함께 초기화하여 오류 방지
                setAppData(prevData => {
                    const prevAssets = prevData.assets;
                    const newSectorAssets = prevAssets[sector].filter((_, i) => i !== index);
                    const newAssets = { ...prevAssets, [sector]: newSectorAssets };
                    
                    // 삭제된 자산을 참조하는 다른 자산들의 설정 업데이트
                    Object.keys(newAssets).forEach(s => {
                        newAssets[s] = newAssets[s].map(a => {
                            let changed = false;
                            let newA = { ...a };
                            // 납입 출처가 삭제된 자산이면 기본값으로 복구
                            if (newA.monthlyContributionFrom === assetName) { 
                                newA.monthlyContributionFrom = window.MONTHLY_INCOME_SOURCE; 
                                changed = true; 
                            }
                            // 대출 상환 계좌가 삭제된 자산이면 초기화
                            if (s === 'loan' && newA.repaymentAccount === assetName) { 
                                newA.repaymentAccount = ''; 
                                changed = true; 
                            }
                            return changed ? newA : a;
                        });
                    });

                    // 잔여액 입금 계좌가 삭제된 경우 처리
                    let newResidualAccount = prevData.residualAccount;
                    if (prevData.residualAccount === assetName) {
                        const firstAvailable = Object.values(newAssets).flat().find(a => a.name !== assetName && a.name !== '새 항목');
                        newResidualAccount = firstAvailable ? firstAvailable.name : (prevData.mainCashFlowAccount !== assetName ? prevData.mainCashFlowAccount : '');
                    }

                    let newData = { ...prevData, assets: newAssets, residualAccount: newResidualAccount };
                    
                    // [Fix] Global Deletion Sync 적용: 현재 시점에서 자산 삭제 시 미래 분기점(Phase)에서도 해당 자산 찌꺼기를 일괄 삭제하여 유령 자산 버그 방지
                    if (window.syncPhaseAssetDeletions) {
                        newData = window.syncPhaseAssetDeletions(newData, assetId);
                    }
                    return newData;
                });
            }, [setAppData, setMainCashFlowAccount, addToast]);

            const accountOptions = useMemo(() => {
                return Object.values(assets).flat().map(a => a.name);
            }, [JSON.stringify(Object.values(assets).flat().map(a => a.name))]);

            // ===== 지출 관리 함수들 =====
            const addExpense = () => setMonthlyExpenses(prev => [...prev, { name: '새 지출', amount: 0 }]);
            const updateExpense = (index, field, value) => setMonthlyExpenses(prev => prev.map((expense, i) => {
                if (i !== index) return expense;
                if (field === 'amount' && Number(value) < 0) return expense; // [추가] 음수 방지
                return { ...expense, [field]: field === 'name' ? value : Number(value) };
            }));
            const removeExpense = (index) => setMonthlyExpenses(prev => prev.filter((_, i) => i !== index));
            const moveExpense = React.useCallback((index, direction) => {
                setMonthlyExpenses(prev => {
                    const newArr = [...prev];
                    if (index + direction < 0 || index + direction >= newArr.length) return prev;
                    [newArr[index], newArr[index + direction]] = [newArr[index + direction], newArr[index]];
                    return newArr;
                });
            }, [setMonthlyExpenses]);

            // ===== 이벤트 관리 함수들 =====
            const addIncomeEvent = () => {
                setIncomeEvents(prev => {
                    // prev가 배열이 아닐 경우를 대비하여 안전하게 처리
                    const currentEvents = Array.isArray(prev) ? prev : [];
                    return [...currentEvents, { 
                        name: '새 수입 이벤트', amount: 0, startMonth: baseMonth, endMonth: baseMonth, targetSector: 'deposit', targetAsset: 0 
                    }];
                });
                setPanelCollapseState(prev => ({ ...prev, events: false })); // [추가] 패널 자동 펼치기
            };
            
            const updateIncomeEvent = (index, field, value) => {
                try {
                    // incomeEvents가 배열인지 확인
                    if (!Array.isArray(incomeEvents)) {
                        console.warn('incomeEvents is not an array:', incomeEvents);
                        return;
                    }
                    
                    // 입력값 검증
                    if (index < 0 || index >= incomeEvents.length) {
                        console.warn('Invalid income event index:', index);
                        return;
                    }
                    
                    let newValue = value;
                    
                    // 숫자 필드 검증
                    if (field === 'amount' || field === 'targetAsset') {
                        const numValue = Number(value);
                        if (isNaN(numValue)) {
                            console.warn('Invalid number value:', value);
                            return;
                        }
                        newValue = Math.max(0, numValue); // 음수 방지
                    }
                    
                    // 섹터 필드 검증
                    if (field === 'targetSector' && !Object.keys(sectorInfo).includes(value)) {
                        console.warn('Invalid target sector:', value);
                        return;
                    }
                    
                    setIncomeEvents(prev => {
                        if (!Array.isArray(prev)) {
                            console.warn('Previous incomeEvents is not an array:', prev);
                            return prev;
                        }
                        return prev.map((event, i) => {
                            if (i !== index) return event;
                            const updated = { ...event, [field]: newValue };
                            // [수정] 섹터 변경 시 계좌 인덱스 초기화 (오류 방지)
                            if (field === 'targetSector') updated.targetAsset = 0;
                            return updated;
                        });
                    });
                } catch (error) {
                    console.error('Error updating income event:', error);
                }
            };
            
            const removeIncomeEvent = (index) => {
                try {
                    // incomeEvents가 배열인지 확인
                    if (!Array.isArray(incomeEvents)) {
                        console.warn('incomeEvents is not an array:', incomeEvents);
                        return;
                    }
                    
                    // 인덱스 검증
                    if (index < 0 || index >= incomeEvents.length) {
                        console.warn('Invalid income event index for removal:', index);
                        return;
                    }
                    
                    setIncomeEvents(prev => {
                        if (!Array.isArray(prev)) {
                            console.warn('Previous incomeEvents is not an array:', prev);
                            return prev;
                        }
                        return prev.filter((_, i) => i !== index);
                    });
                } catch (error) {
                    console.error('Error removing income event:', error);
                }
            };
            const moveIncomeEvent = React.useCallback((index, direction) => {
                setIncomeEvents(prev => {
                    if (!Array.isArray(prev)) return prev;
                    const newArr = [...prev];
                    if (index + direction < 0 || index + direction >= newArr.length) return prev;
                    [newArr[index], newArr[index + direction]] = [newArr[index + direction], newArr[index]];
                    return newArr;
                });
            }, [setIncomeEvents]);
            const moveExpenseEvent = React.useCallback((index, direction) => {
                setExpenseEvents(prev => {
                    if (!Array.isArray(prev)) return prev;
                    const newArr = [...prev];
                    if (index + direction < 0 || index + direction >= newArr.length) return prev;
                    [newArr[index], newArr[index + direction]] = [newArr[index + direction], newArr[index]];
                    return newArr;
                });
            }, [setExpenseEvents]);

            const addExpenseEvent = () => {
                setExpenseEvents(prev => {
                // prev가 배열이 아닐 경우를 대비하여 안전하게 처리
                const currentEvents = Array.isArray(prev) ? prev : [];
                return [...currentEvents, { 
                    name: '새 지출 이벤트', amount: 0, startMonth: baseDate.slice(0,7), endMonth: baseDate.slice(0,7), targetSector: 'deposit', targetAsset: 0 
                }];
                });
                setPanelCollapseState(prev => ({ ...prev, events: false })); // [추가] 패널 자동 펼치기
            };
            const updateExpenseEvent = (index, field, value) => {
                let newValue = value;
                const numberFields = ['amount', 'targetAsset'];

                if (numberFields.includes(field)) {
                    const numValue = Number(value);
                    if (!isNaN(numValue)) {
                        newValue = Math.max(0, numValue); // 음수 방지
                    }
                }

                setExpenseEvents(prev => {
                    // prev가 배열이 아닐 경우를 대비하여 안전하게 처리
                    const currentEvents = Array.isArray(prev) ? prev : [];
                    return currentEvents.map((event, i) => {
                        if (i !== index) return event;
                        const updated = { ...event, [field]: newValue };
                        // [수정] 섹터 변경 시 계좌 인덱스 초기화 (오류 방지)
                        if (field === 'targetSector') updated.targetAsset = 0;
                        return updated;
                    });
                });
            };
            const removeExpenseEvent = (index) => setExpenseEvents(prev => {
                // prev가 배열이 아닐 경우를 대비하여 안전하게 처리
                const currentEvents = Array.isArray(prev) ? prev : [];
                return currentEvents.filter((_, i) => i !== index);
            });


            const renderScenarioPanel = () => ( 
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    <div className="lg:w-full lg:max-w-md">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">저장된 시나리오</h3>
                        <SavedScenariosCarousel 
                            scenarios={scenarios} 
                            onLoad={loadScenario} 
                            onDelete={deleteScenario} 
                            onExport={(scenario) => setScenarioToExport(scenario)}
                            referenceScenarios={referenceScenarios}
                            onToggleReference={toggleReference}
                            onUpdateReferenceColor={updateReferenceColor}
                            isPro={isPro}
                            onOpenProModal={() => setIsProModalOpen(true)}
                        />
                    </div>
                    <div className="flex-grow border-l border-gray-200 dark:border-gray-700 pl-6">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">시나리오 비교 (최대 3개)</h3>
                        <ScenarioCompare scenarios={scenarios} sectorInfo={sectorInfo} calculateMonthlyProjection={calculateMonthlyProjection} formatNumber={formatNumber} className="bg-gray-50 dark:bg-gray-900" />
                    </div>
                </div>
            );

            const renderChartsPanel = () => ( 
                <div className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 h-[350px] w-full relative"><canvas ref={currentPieRef}></canvas></div>
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 h-[350px] w-full relative"><canvas ref={projectedPieRef}></canvas></div>
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 h-[350px] w-full relative"><canvas ref={comparisonBarRef}></canvas></div>
                    </div>
                </div>
            );

            const renderHistoryPanel = () => (
                <>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 px-4 pt-2 gap-4">
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            총 {assetHistory.length}개의 기록 <span className="hidden sm:inline">| 최근: {assetHistory[assetHistory.length - 1]?.date} ({formatNumber(assetHistory[assetHistory.length - 1]?.netWorth, displayMode)}만원)</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <label className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-full border transition-colors ${!isPro ? 'bg-gray-100 border-gray-200' : 'bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-800 hover:bg-blue-100'}`}>
                            <input 
                                type="checkbox" 
                                checked={showProjectionInHistory} 
                                onChange={(e) => {
                                    if (!isPro) {
                                        if (!verifiedEmail) {
                                            if (confirm('PRO 기능(미래 예상 자산 표시)을 확인하거나 후원하려면 로그인이 필요합니다.\n로그인하시겠습니까?')) {
                                                handleLogin();
                                            }
                                            return;
                                        }
                                        setIsProModalOpen(true); // PRO 기능 안내 모달 띄우기
                                        return;
                                    }
                                    setShowProjectionInHistory(e.target.checked);
                                }}
                                className={`w-4 h-4 rounded focus:ring-blue-500 ${!isPro ? 'text-gray-400' : 'text-blue-600'}`}
                            />
                                <span className={`text-[11px] sm:text-xs font-bold flex items-center gap-1 select-none whitespace-nowrap ${!isPro ? 'text-gray-500' : 'text-blue-700'}`}>
                                {!isPro && <span>🔒</span>}
                                    <span className="hidden sm:inline">미래 예상 자산 표시</span>
                                    <span className="sm:hidden">미래 예상</span>
                            </span>
                        </label>
                            <div className="flex items-center gap-1.5">
                                <span className="hidden sm:inline text-xs text-gray-500 dark:text-gray-400">지표:</span>
                            <select 
                                value={historyViewMode} 
                                onChange={(e) => setHistoryViewMode(e.target.value)}
                                    className="text-[11px] sm:text-xs font-bold border rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                            >
                                <option value="net">순자산</option>
                                <option value="gross">총자산</option>
                            </select>
                        </div>
                            <div className="flex items-center gap-1.5">
                                <span className="hidden sm:inline text-xs text-gray-500 dark:text-gray-400">정렬:</span>
                            <select 
                                value={scenarioSortOrder} 
                                onChange={(e) => setScenarioSortOrder(e.target.value)}
                                    className="text-[11px] sm:text-xs font-bold border rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                            >
                                <option value="default">기본</option>
                                <option value="high">높은순</option>
                                <option value="low">낮은순</option>
                            </select>
                        </div>
                        </div>
                    </div>
                    
                    {/* 설정 패널과 그래프 영역 사이의 구분선 (캡처 간섭 및 레이아웃 깨짐 방지) */}
                    <div className="border-t border-slate-200/80 dark:border-slate-800 my-4"></div>
                    
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 h-[600px] relative">
                        <canvas ref={historyChartRef} onContextMenu={handleHistoryContextMenu}></canvas>
                        {/* [추가] 우클릭 이벤트 리스너를 위한 투명 오버레이 또는 캔버스 직접 제어 */}
                        {/* Chart.js는 캔버스에 이벤트를 바인딩하므로, ref에 직접 리스너를 추가하는 것이 가장 확실함 */}
                        {/* React ref callback을 사용하여 이벤트 리스너 부착 */}
                        <div className="absolute top-2 right-2 text-[10px] text-gray-400 pointer-events-none">Tip: 점을 클릭하여 메뉴 열기, 시나리오 호버 시 강조</div>
                        
                        {/* [추가] 고정 위치 툴팁 (Option 4) - 차트 내부 좌측 상단 고정 */}
                        {historyChartInfo && (
                            <div className="fixed bottom-0 left-0 w-full p-5 rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md z-[100] pointer-events-none animate-in slide-in-from-bottom-2 sm:absolute sm:bottom-auto sm:top-4 sm:left-16 sm:w-auto sm:min-w-[180px] sm:rounded-xl sm:shadow-lg sm:border sm:border-t-gray-200 sm:z-10 sm:p-3 sm:animate-none">
                                <div className="text-sm sm:text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 sm:mb-2 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2 sm:pb-1">
                                    <span>📅</span> {historyChartInfo.title}
                                </div>
                                <div className="space-y-2 sm:space-y-1.5 max-h-[30vh] sm:max-h-none overflow-y-auto custom-scrollbar">
                                    {historyChartInfo.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-sm sm:text-xs">
                                            <div className="flex items-center gap-2 sm:gap-1.5">
                                                <span className="w-2.5 h-2.5 sm:w-2 sm:h-2 flex-shrink-0 rounded-full" style={{ backgroundColor: item.color }}></span>
                                                <span className="text-gray-700 dark:text-gray-300 font-medium truncate sm:max-w-[100px]">{item.label}</span>
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white tabular-nums pl-4">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* [추가] 히스토리 포인트 팝오버 */}
                        {historyPopover && (
                            <>
                                {/* PC용 플로팅 팝오버 */}
                                <div 
                                    className="hidden sm:block absolute z-20 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 w-56 animate-in zoom-in-95 duration-200"
                                    style={{ left: historyPopover.x, top: historyPopover.y + 10, transform: historyPopover.x > 300 ? 'translateX(-100%)' : 'none' }}
                                >
                                    <div className="flex justify-between items-start mb-3 pb-2 border-b dark:border-gray-700">
                                        <div>
                                            <div className="text-xs font-bold text-gray-500 dark:text-gray-400">{historyPopover.date}</div>
                                            <div className="text-gray-900 dark:text-white font-bold text-lg">{formatNumber(historyViewMode === 'gross' ? (historyPopover.grossWorth || historyPopover.netWorth) : historyPopover.netWorth, displayMode)}만원</div>
                                        </div>
                                        <button onClick={() => setHistoryPopover(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
                                    </div>
                                    <div className="space-y-1">
                                        <button onClick={() => { loadHistorySnapshot(historyPopover.date); setHistoryPopover(null); }} className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors">
                                            <span>📂</span> 데이터 불러오기
                                        </button>
                                        <button onClick={() => { 
                                            const memo = prompt('메모를 입력하세요:', historyPopover.memo || '');
                                            if (memo !== null) { updateHistoryMemo(historyPopover.index, memo); setHistoryPopover(null); }
                                        }} className="w-full text-left px-3 py-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors">
                                            <span>📝</span> {historyPopover.memo ? '메모 수정' : '메모 남기기'}
                                        </button>
                                        <button onClick={() => { deleteHistoryPoint(historyPopover.date); setHistoryPopover(null); }} className="w-full text-left px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors">
                                            <span>🗑️</span> 기록 삭제
                                        </button>
                                    </div>
                                    {historyPopover.memo && (
                                        <div className="mt-3 pt-2 border-t dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300 italic bg-gray-50 dark:bg-gray-900/50 p-2 rounded">
                                            "{historyPopover.memo}"
                                        </div>
                                    )}
                                </div>

                                {/* 모바일용 하단 시트 (Portal 사용) */}
                                {ReactDOM.createPortal(
                                    <div className="sm:hidden fixed inset-0 z-[120] bg-black/40 backdrop-blur-sm flex items-end justify-center" onClick={() => setHistoryPopover(null)}>
                                        <div className="bg-white dark:bg-gray-800 w-full rounded-t-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-4 duration-300" onClick={e => e.stopPropagation()}>
                                            <div className="flex justify-between items-start mb-5 pb-4 border-b dark:border-gray-700">
                                                <div>
                                                    <div className="text-sm font-bold text-gray-500 dark:text-gray-400">{historyPopover.date}</div>
                                                    <div className="text-gray-900 dark:text-white font-extrabold text-2xl mt-1">{formatNumber(historyViewMode === 'gross' ? (historyPopover.grossWorth || historyPopover.netWorth) : historyPopover.netWorth, displayMode)}만원</div>
                                                </div>
                                                <button onClick={() => setHistoryPopover(null)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500">✕</button>
                                            </div>
                                            <div className="space-y-3">
                                                <button onClick={() => { loadHistorySnapshot(historyPopover.date); setHistoryPopover(null); }} className="w-full text-left p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-bold rounded-xl flex items-center gap-3 transition-colors">
                                                    <span className="text-xl">📂</span> 데이터 불러오기
                                                </button>
                                                <button onClick={() => { 
                                                    const memo = prompt('메모를 입력하세요:', historyPopover.memo || '');
                                                    if (memo !== null) { updateHistoryMemo(historyPopover.index, memo); setHistoryPopover(null); }
                                                }} className="w-full text-left p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-sm font-bold rounded-xl flex items-center gap-3 transition-colors">
                                                    <span className="text-xl">📝</span> {historyPopover.memo ? '메모 수정' : '메모 남기기'}
                                                </button>
                                                <button onClick={() => { deleteHistoryPoint(historyPopover.date); setHistoryPopover(null); }} className="w-full text-left p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold rounded-xl flex items-center gap-3 transition-colors">
                                                    <span className="text-xl">🗑️</span> 기록 삭제
                                                </button>
                                            </div>
                                            {historyPopover.memo && (
                                                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-sm text-gray-700 dark:text-gray-300 italic border border-gray-100 dark:border-gray-600">
                                                    "{historyPopover.memo}"
                                                </div>
                                            )}
                                        </div>
                                    </div>,
                                    document.body
                                )}
                            </>
                        )}
                    </div>
                </>
            );

            const renderBudgetPanel = () => {
                const totalMonthly = monthlyExpenses.reduce((sum, e) => sum + Number(e.amount||0), 0);
                const usagePercent = maxSectorMonthlyContrib > 0 ? (totalSectorMonthlyContrib / maxSectorMonthlyContrib) * 100 : 0;
                const isOverBudget = totalSectorMonthlyContrib > maxSectorMonthlyContrib;

                return (
                    <div className="space-y-6">
                        {/* 1. 수입/지출 카드 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden transition-transform hover:scale-[1.01]">
                                <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">💰</div>
                                <div className="relative z-10">
                                    <div className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">월 고정 수입</div>
                                    <div className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                        {formatNumber(monthlySalary, displayMode, 1)}
                                        <span className="text-lg font-medium text-gray-400 ml-1">만원</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden transition-transform hover:scale-[1.01]">
                                <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">💸</div>
                                <div className="relative z-10">
                                    <div className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">월 고정 지출</div>
                                    <div className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                        {formatNumber(totalMonthly, displayMode, 1)}
                                        <span className="text-lg font-medium text-gray-400 ml-1">만원</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. 예산 운용 게이지 */}
                        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700">
                            <div className="flex flex-col sm:flex-row sm:itㄴems-end justify-between gap-4 mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex flex-wrap items-center gap-2">
                                        투자/저축 가능 예산
                                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-800 mt-1 sm:mt-0">
                                            수입 대비 총 저축률 {monthlySalary > 0 ? ((totalSectorMonthlyContrib + autoDepositAmount) / monthlySalary * 100).toFixed(1) : 0}%
                                        </span>
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                        고정 지출을 제외하고 자유롭게 운용할 수 있는 금액입니다.
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
                                        {formatNumber(maxSectorMonthlyContrib, displayMode, 1)}
                                        <span className="text-xl text-gray-400 ml-1">만원</span>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar Container */}
                            <div className="relative h-8 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                                <div 
                                    className={`absolute top-0 left-0 h-full transition-all duration-700 ease-out flex items-center justify-end pr-3 ${isOverBudget ? 'bg-gradient-to-r from-red-400 to-red-500' : 'bg-gradient-to-r from-blue-400 to-indigo-500'}`}
                                    style={{ width: `${Math.min(Math.max(usagePercent, 5), 100)}%` }}
                                >
                                    {usagePercent > 10 && <span className="text-xs font-bold text-white shadow-sm">{usagePercent.toFixed(0)}%</span>}
                                </div>
                            </div>

                            <div className="flex justify-between items-start text-sm font-medium">
                                <div className="flex flex-col">
                                    <span className="text-gray-500 dark:text-gray-400 mb-1">현재 배정됨</span>
                                    <span className="text-gray-900 dark:text-white font-bold">{formatNumber(totalSectorMonthlyContrib, displayMode, 1)}만원</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={isOverBudget ? "text-red-500 mb-1" : "text-gray-500 dark:text-gray-400 mb-1"}>
                                        {isOverBudget ? "초과 금액" : "남은 금액"}
                                    </span>
                                    <span className={`font-bold ${isOverBudget ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                                        {isOverBudget ? `+${formatNumber(totalSectorMonthlyContrib - maxSectorMonthlyContrib, displayMode, 1)}` : formatNumber(maxSectorMonthlyContrib - totalSectorMonthlyContrib, displayMode, 1)}만원
                                    </span>
                                </div>
                            </div>

                            {isOverBudget && (
                                <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-2xl flex items-start gap-3 animate-pulse">
                                    <span className="text-xl">⚠️</span>
                                    <div>
                                        <p className="font-bold text-red-700 dark:text-red-300 text-sm">예산이 초과되었습니다!</p>
                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">월납입액을 줄이거나, 수입 외 다른 출처(상여금 등)를 활용하세요.</p>
                                    </div>
                                </div>
                            )}

                            {/* Settings Grid */}
                            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                        월급(수입) 입금 계좌
                                    </label>
                                    <div className="relative group">
                                        <select 
                                            className="w-full appearance-none bg-gray-50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-bold transition-all cursor-pointer"
                                            value={mainCashFlowAccount} 
                                            onChange={e => setMainCashFlowAccount(e.target.value)}
                                        >
                                            {Object.values(assets).flat().filter(item => item.name !== '새 항목').map((asset, idx) => (<option key={idx} value={asset.name}>{asset.name}</option>))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500 group-hover:text-indigo-500 transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                        잔여액 자동저축 계좌
                                    </label>
                                    <div className="relative group">
                                        <select 
                                            className="w-full appearance-none bg-gray-50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 pr-10 focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-bold transition-all cursor-pointer"
                                            value={residualAccount} 
                                            onChange={e => setResidualAccount(e.target.value)}
                                        >
                                            {Object.values(assets).flat().filter(item => item.name !== '새 항목').map((asset, idx) => (<option key={idx} value={asset.name}>{asset.name}</option>))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500 group-hover:text-emerald-500 transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. 현금 흐름 상세 (영수증 스타일) */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 opacity-50"></div>
                            
                            <h4 className="text-base font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <span>🧾</span> 월간 자금 흐름 리포트
                            </h4>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">월 고정 수입</span>
                                    <span className="font-bold text-blue-600 dark:text-blue-400">
                                        +{formatNumber(monthlySalary, displayMode, 1)}만원
                                        <span className="text-xs font-normal text-gray-400 ml-1">(100%)</span>
                                    </span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">월 고정 지출</span>
                                        <span className="font-bold text-red-500">
                                            -{formatNumber(totalMonthly, displayMode, 1)}만원
                                            <span className="text-xs font-normal text-gray-400 ml-1">({monthlySalary > 0 ? (totalMonthly / monthlySalary * 100).toFixed(1) : 0}%)</span>
                                        </span>
                                    </div>
                                    {/* 개별 소비 내역 표시 */}
                                    {monthlyExpenses.length > 0 && (
                                        <div className="space-y-1.5 pl-3 border-l-2 border-red-100 dark:border-red-900/30">
                                            {monthlyExpenses.map((exp, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-xs">
                                                    <span className="text-gray-500 dark:text-gray-400">{exp.name}</span>
                                                    <span className="text-red-400">
                                                        -{formatNumber(exp.amount, displayMode, 1)}만원
                                                        <span className="text-[10px] text-gray-400 ml-1">({monthlySalary > 0 ? (exp.amount / monthlySalary * 100).toFixed(1) : 0}%)</span>
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="border-b border-dashed border-gray-300 dark:border-gray-600 my-4"></div>

                                <div className="space-y-2">
                                    {autoDepositBreakdown.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                                <span className="text-xs w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">{sectorInfo[item.sector]?.icon}</span>
                                                {item.name}
                                            </span>
                                            <span className="font-medium text-gray-900 dark:text-gray-200">
                                                -{formatNumber(item.amount, displayMode, 1)}만원
                                                <span className="text-[10px] font-normal text-gray-400 ml-1">({monthlySalary > 0 ? (item.amount / monthlySalary * 100).toFixed(1) : 0}%)</span>
                                            </span>
                                        </div>
                                    ))}
                                    {autoDepositBreakdown.length === 0 && (
                                        <div className="text-center text-xs text-gray-400 py-2 italic">설정된 월납입 내역이 없습니다.</div>
                                    )}
                                </div>

                                <div className="border-b border-gray-300 dark:border-gray-600 my-4"></div>

                                <div className="flex justify-between items-center">
                                    <span className="text-base font-bold text-gray-900 dark:text-white">최종 잔여액</span>
                                    <div className="text-right">
                                        <span className={`text-xl font-extrabold ${autoDepositAmount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'}`}>
                                            {autoDepositAmount > 0 ? '+' : ''}{formatNumber(autoDepositAmount, displayMode, 1)}만원
                                            <span className="text-xs font-normal text-gray-400 ml-1">({monthlySalary > 0 ? (autoDepositAmount / monthlySalary * 100).toFixed(1) : 0}%)</span>
                                        </span>
                                        <div className="text-[10px] text-gray-400 mt-1">
                                            ➜ {residualAccount}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            };

            const renderMemoPanel = () => {
                // 하위 호환성: 문자열이면 배열로 변환하여 처리
                const rawMemo = memo;
                const memos = Array.isArray(rawMemo) 
                    ? rawMemo 
                    : [{ id: 'default', title: '기본 메모', content: typeof rawMemo === 'string' ? rawMemo : '' }];
                
                // 인덱스 안전 장치
                const activeIndex = Math.min(currentMemoIndex, memos.length - 1);
                const currentMemo = memos[activeIndex] || { title: '', content: '' };

                const handleUpdateMemo = (field, value) => {
                    const newMemos = [...memos];
                    newMemos[activeIndex] = { ...newMemos[activeIndex], [field]: value };
                    setMemo(newMemos);
                };

                const handleAddMemo = () => {
                    const newMemos = [...memos, { id: Date.now(), title: `메모 ${memos.length + 1}`, content: '' }];
                    setMemo(newMemos);
                    setCurrentMemoIndex(newMemos.length - 1);
                };

                const handleDeleteMemo = () => {
                    if (confirm('이 메모를 삭제하시겠습니까?')) {
                        if (memos.length <= 1) {
                            setMemo([{ id: Date.now(), title: '기본 메모', content: '' }]);
                        } else {
                            const newMemos = memos.filter((_, i) => i !== activeIndex);
                            setMemo(newMemos);
                            setCurrentMemoIndex(Math.max(0, activeIndex - 1));
                        }
                    }
                };

                const startEditingTitle = () => {
                    setTempMemoTitle(currentMemo.title);
                    setIsEditingMemoTitle(true);
                };

                const saveTitle = () => {
                    handleUpdateMemo('title', tempMemoTitle);
                    setIsEditingMemoTitle(false);
                };

                // [추가] 마크다운 스타일 렌더러 (Bold, Underline 지원)
                const renderFormattedMemo = (text) => {
                    if (!text) return <span className="text-gray-400 italic">내용이 없습니다.</span>;
                    
                    return text.split('\n').map((line, i) => {
                        // 1. 볼드 (**text**) 및 밑줄 (__text__) 처리
                        // split에 캡처 그룹을 사용하여 구분자도 결과 배열에 포함시킴
                        const parts = line.split(/(\*\*.*?\*\*|__.*?__)/g);
                        return (
                            <p key={i} className="min-h-[1.2em]">
                                {parts.map((part, j) => {
                                    if (part.startsWith('**') && part.endsWith('**')) {
                                        return <strong key={j} className="font-bold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
                                    }
                                    if (part.startsWith('__') && part.endsWith('__')) {
                                        return <u key={j} className="decoration-blue-500/50">{part.slice(2, -2)}</u>;
                                    }
                                    return part;
                                })}
                            </p>
                        );
                    });
                };

                const applyFormat = (prefix, suffix) => {
                    const el = document.getElementById('memo-textarea');
                    if (!el) return;
                    const start = el.selectionStart;
                    const end = el.selectionEnd;
                    const text = currentMemo.content;
                    const selected = text.substring(start, end);
                    const before = text.substring(0, start);
                    const after = text.substring(end);
                    handleUpdateMemo('content', `${before}${prefix}${selected}${suffix}${after}`);
                    el.focus();
                };

                const MemoContent = ({ isExpanded }) => (
                    <div className="flex flex-col h-full w-full">
                        <div className={`flex flex-wrap sm:flex-nowrap items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 ${isExpanded ? 'rounded-t-xl' : 'rounded-t-lg mb-0'} border-b dark:border-gray-700 gap-y-2`}>
                            {!isMemoGridView ? (
                                <div className="flex items-center gap-1 order-2 sm:order-none">
                                    <button onClick={() => setCurrentMemoIndex(Math.max(0, activeIndex - 1))} disabled={activeIndex === 0} className="p-0.5 sm:p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{activeIndex + 1} / {memos.length}</span>
                                    <button onClick={() => setCurrentMemoIndex(Math.min(memos.length - 1, activeIndex + 1))} disabled={activeIndex === memos.length - 1} className="p-0.5 sm:p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="px-2 text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 order-2 sm:order-none">
                                    모아보기 ({memos.length})
                                </div>
                            )}

                            <div className="w-full sm:w-auto sm:flex-1 order-1 sm:order-none flex items-center justify-center px-2">
                                {!isMemoGridView && (
                                    isEditingMemoTitle ? (
                                        <div className="flex items-center gap-2 w-full max-w-[200px]">
                                            <input type="text" value={tempMemoTitle} onChange={(e) => setTempMemoTitle(e.target.value)} className="w-full px-2 py-0.5 sm:py-1 text-sm text-gray-900 bg-white border border-blue-500 rounded focus:outline-none" autoFocus onKeyDown={(e) => e.key === 'Enter' && saveTitle()} onBlur={saveTitle} />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 group cursor-pointer" onClick={startEditingTitle}>
                                            <span className="font-bold text-gray-700 dark:text-gray-200 text-sm truncate max-w-[120px] sm:max-w-[200px]">{currentMemo.title}</span>
                                            <svg className="w-3 h-3 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        </div>
                                    )
                                )}
                            </div>

                            <div className="flex items-center gap-1 order-3 sm:order-none">
                                {!isMemoGridView && (
                                    <div className="flex items-center bg-white dark:bg-gray-700 rounded-lg border dark:border-gray-600 sm:mr-2 px-1 scale-90 sm:scale-100 origin-right">
                                        <button onClick={() => applyFormat('**', '**')} className="p-1 sm:p-1.5 text-xs font-black hover:text-blue-500 transition-colors" title="볼드 (B)">B</button>
                                        <button onClick={() => applyFormat('__', '__')} className="p-1 sm:p-1.5 text-xs font-bold underline hover:text-blue-500 transition-colors" title="밑줄 (U)">U</button>
                                        <div className="w-px h-3 bg-gray-300 dark:bg-gray-500 mx-0.5 sm:mx-1"></div>
                                        <button 
                                            onClick={() => setIsMemoPreview(!isMemoPreview)} 
                                            className={`px-1.5 sm:px-2 py-1 text-[9px] sm:text-[10px] font-bold rounded transition-all ${isMemoPreview ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                                        >
                                            {isMemoPreview ? '편집' : '미리보기'}
                                        </button>
                                    </div>
                                )}

                                <button onClick={() => setIsMemoGridView(!isMemoGridView)} className={`p-0.5 sm:p-1 rounded ${isMemoGridView ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/50' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`} title="모아보기">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                </button>
                                
                                {!isMemoGridView && (
                                    <button onClick={handleAddMemo} className="p-0.5 sm:p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded" title="새 메모 추가">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                    </button>
                                )}
                                {!isMemoGridView && (
                                    <button onClick={handleDeleteMemo} className="p-0.5 sm:p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded" title="현재 메모 삭제">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                )}
                                
                                <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-0.5 sm:mx-1"></div>
                                
                                <button onClick={() => setIsMemoExpanded(!isMemoExpanded)} className={`p-0.5 sm:p-1 rounded hidden sm:block ${isMemoExpanded ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/50' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`} title={isMemoExpanded ? "원래 크기로" : "크게 보기"}>
                                    {isMemoExpanded ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 14h6m0 0v6m0-6l-7 7m17-11h-6m0 0V4m0 6l7-7" /></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {isMemoGridView ? (
                            <div className={`flex-1 p-3 grid grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto ${isExpanded ? 'bg-gray-50 dark:bg-gray-900/50 rounded-b-xl' : 'bg-white dark:bg-gray-900 max-h-60 rounded-b-lg border-x border-b dark:border-gray-600'} custom-scrollbar`}>
                                {memos.map((m, i) => (
                                    <div key={m.id} onClick={() => { setCurrentMemoIndex(i); setIsMemoGridView(false); }} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 cursor-pointer hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all flex flex-col h-32 relative group">
                                        <div className="font-bold text-gray-800 dark:text-gray-200 text-sm truncate mb-1">{m.title}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 overflow-hidden leading-relaxed">
                                            {m.content?.replace(/\*\*|__/g, '') || '내용 없음'}
                                        </div>
                                    </div>
                                ))}
                                <div onClick={() => { handleAddMemo(); setIsMemoGridView(false); }} className="bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-300 h-32">
                                    <span className="text-2xl mb-1">+</span>
                                    <span className="text-xs font-bold">새 메모</span>
                                </div>
                            </div>
                        ) : isMemoPreview ? (
                            <div className={`w-full p-4 dark:bg-gray-900 dark:text-gray-200 overflow-y-auto custom-scrollbar leading-relaxed text-sm ${isExpanded ? 'flex-1 rounded-b-xl' : 'h-40 border-x border-b dark:border-gray-600 rounded-b-lg'}`}>
                                {renderFormattedMemo(currentMemo.content)}
                            </div>
                        ) : (
                            <textarea 
                                id="memo-textarea"
                                onKeyDown={(e) => {
                                    if (e.ctrlKey || e.metaKey) {
                                        if (e.key.toLowerCase() === 'b') {
                                            e.preventDefault();
                                            applyFormat('**', '**');
                                        } else if (e.key.toLowerCase() === 'u') {
                                            e.preventDefault();
                                            applyFormat('__', '__');
                                        }
                                    }
                                }}
                                className={`w-full p-4 focus:outline-none dark:bg-gray-900 dark:text-white ${isExpanded ? 'flex-1 rounded-b-xl' : 'h-40 border-x border-b dark:border-gray-600 rounded-b-lg focus:ring-2 focus:ring-blue-500'} resize-none`} 
                                placeholder="여기에 자유롭게 메모를 남겨보세요." 
                                value={currentMemo.content} 
                                onChange={(e) => handleUpdateMemo('content', e.target.value)} 
                            />
                        )}
                    </div>
                );

                if (isMemoExpanded) {
                    return (
                        <>
                            <div className="h-40 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700">
                                <svg className="w-8 h-8 mb-2 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                                <span className="text-sm font-medium">메모 확장 모드 사용 중</span>
                                <button onClick={() => setIsMemoExpanded(false)} className="mt-2 text-xs text-blue-500 hover:underline">원래 크기로 돌아가기</button>
                            </div>
                            {ReactDOM.createPortal(
                                <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-10">
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full h-full max-w-5xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                                        {MemoContent({ isExpanded: true })}
                                    </div>
                                </div>,
                                document.body
                            )}
                        </>
                    );
                }

                return MemoContent({ isExpanded: false });
            };

            const renderRebalancePanel = () => {
                const validSectors = Object.keys(sectorInfo).filter(k=>k!=='loan');
                const defaultPct = Math.round(100 / validSectors.length);
                const rebalancingGlobal = appData.rebalancingGlobal || { sector: { warning: 5, danger: 10 }, item: { warning: 5, danger: 10 } };
                const currentItemTargets = appData.itemTargets || {};
                
                const totalTarget = validSectors.reduce((sum, key) => { 
                    const value = rebalancingTargets[key];
                    const numericValue = (value === undefined || value === null) ? defaultPct : Number(value);
                    return sum + numericValue;
                }, 0);

                const handleNormalize = () => {
                    if (totalTarget === 0) return;
                    // [수정] utils.js의 normalizeTargets 사용
                    const newTargets = normalizeTargets(rebalancingTargets, validSectors);
                    setRebalancingTargets(newTargets);
                };

                const updateGlobalSetting = (type, field, value) => {
                    setRebalancingGlobal(prev => ({
                        ...prev,
                        [type]: { ...(prev?.[type] || {}), [field]: Number(value) }
                    }));
                };

                return (
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-4 border-amber-100/50 dark:border-amber-900/20 p-6"> 
                        {/* 공통 임계값 설정 패널 */}
                        <div className="mb-8 bg-white dark:bg-slate-800 p-5 rounded-xl border-4 border-amber-200 dark:border-amber-900/40 shadow-sm">
                            <h4 className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">⚙️ 리밸런싱 실행 임계값 설정</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">섹터 단위</div>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">경고 임계값 ±%</label>
                                            <input type="number" className="w-full border rounded px-2 py-1 text-sm bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" value={rebalancingGlobal.sector?.warning ?? 5} onChange={(e) => updateGlobalSetting('sector', 'warning', e.target.value)} />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">위험 임계값 ±%</label>
                                            <input type="number" className="w-full border rounded px-2 py-1 text-sm bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" value={rebalancingGlobal.sector?.danger ?? 10} onChange={(e) => updateGlobalSetting('sector', 'danger', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">항목 단위</div>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">경고 임계값 ±%</label>
                                            <input type="number" className="w-full border rounded px-2 py-1 text-sm bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" value={rebalancingGlobal.item?.warning ?? 5} onChange={(e) => updateGlobalSetting('item', 'warning', e.target.value)} />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">위험 임계값 ±%</label>
                                            <input type="number" className="w-full border rounded px-2 py-1 text-sm bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" value={rebalancingGlobal.item?.danger ?? 10} onChange={(e) => updateGlobalSetting('item', 'danger', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <StackedBarDisplay targets={rebalancingTargets} sectorInfo={sectorInfo} />
                        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-amber-50/50 dark:bg-amber-900/10 p-4 rounded-xl border-4 border-amber-200 dark:border-amber-900/40">                                        
                            <div className="flex items-center gap-4">
                                <div>
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-0.5">목표 비중 총합</span>
                                    <span className={`text-xl font-black ${totalTarget !== 100 ? 'text-red-500' : 'text-amber-600 dark:text-amber-400'}`}>
                                        {totalTarget}%
                                    </span>
                                </div>
                                <button 
                                    onClick={handleNormalize} 
                                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-lg transition-all shadow-md active:scale-95 disabled:bg-slate-300 dark:disabled:bg-slate-700"
                                    disabled={totalTarget === 100}
                                >
                                    비중 100% 맞춤
                                </button>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">목표 달성 기간 설정</span>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        className="w-20 border-2 rounded-lg px-3 py-1.5 text-sm font-black bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-amber-600 focus:border-amber-500 outline-none transition-all" 
                                        value={rebalanceMonths} 
                                        onChange={(e) => setRebalanceMonths(Number(e.target.value))} 
                                    />
                                    <span className="text-sm font-bold text-slate-400">개월</span>
                                </div>
                            </div>
                        </div>
                        {calculation.rebalanceInfo && (
                            <div className={`mb-4 p-3 rounded-lg border text-xs font-medium ${calculation.rebalanceInfo.budgetLimited ? 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300' : 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'}`}>
                                {calculation.rebalanceInfo.budgetLimited 
                                    ? `⚠️ 예산 부족으로 ${calculation.rebalanceInfo.targetMonths}개월 내 달성이 어렵습니다. 현재 자산 비중 결손율에 따라 비례 배분된 수치를 제안합니다.` 
                                    : `✅ 현재 예산으로 ${calculation.rebalanceInfo.targetMonths}개월 내 목표 비중 달성이 가능합니다.`}
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {validSectors.map(sectorKey => {
                                const currentValue = rebalancingTargets[sectorKey] ?? defaultPct;
                                const actualValue = currentSectorTotals[sectorKey]?.percentage || 0;
                                const isEditing = editingRebalanceSector === sectorKey;
                                const sectorAssets = assets[sectorKey] || [];
                                const totalItemWeight = sectorAssets.reduce((sum, a) => sum + (currentItemTargets[a.id] ?? Math.round(100/sectorAssets.length)), 0);
                                
                                // Gap 계산
                                const gap = currentValue - actualValue;

                                return (
                                    <div key={sectorKey} className={`rounded-2xl p-5 transition-all duration-300 relative border-4 ${isEditing ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 shadow-xl scale-105 z-10' : 'bg-white dark:bg-slate-800 border-amber-100 dark:border-amber-900/20 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md cursor-pointer'}`} onClick={() => !isEditing && setEditingRebalanceSector(sectorKey)}>
                                        {!isEditing ? (
                                            // [Front Side] 섹터 비중 설정
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xl">{sectorInfo[sectorKey].icon}</span>
                                                        <h4 className="font-black text-slate-800 dark:text-slate-100">{sectorInfo[sectorKey].name}</h4>
                                                    </div>
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </div>
                                                
                                                {/* Gap Meter Visualization */}
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                                                        <span className="text-slate-400">현재 비중: {actualValue.toFixed(1)}%</span>
                                                        <span className={Math.abs(gap) < 1 ? "text-emerald-500" : "text-amber-500"}>
                                                            차이: {gap > 0 ? '+' : ''}{gap.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex relative">
                                                        {/* Actual Progress */}
                                                        <div className={`h-full transition-all duration-500 ${isEditing ? 'bg-indigo-400' : 'bg-slate-300 dark:bg-slate-600'}`} style={{ width: `${actualValue}%` }}></div>
                                                        {/* Target Marker */}
                                                        <div className="absolute top-0 h-full w-1 bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)] transition-all duration-500" style={{ left: `${currentValue}%` }}></div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between gap-3 pt-2" onClick={(e) => e.stopPropagation()}>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase">목표 비중 설정</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <input 
                                                            type="number" 
                                                            min="0" 
                                                            max="100" 
                                                            className="w-16 border-2 border-slate-100 dark:border-slate-700 rounded-lg px-2 py-1 text-sm bg-slate-50 dark:bg-slate-900 text-gray-900 dark:text-white font-black text-right focus:border-amber-500 outline-none transition-all" 
                                                            value={currentValue} 
                                                            onChange={(e)=> setRebalancingTargets(prev=> ({ ...prev, [sectorKey]: Number(e.target.value) }))} 
                                                        />
                                                        <span className="text-xs font-bold text-slate-400">%</span>
                                                    </div>
                                                </div>

                                                <div className="text-[10px] text-slate-400 font-bold text-center pt-2 border-t border-slate-50 dark:border-slate-700">
                                                    클릭하여 항목별 설정
                                                </div>
                                            </div>
                                        ) : (
                                            // [Back Side] 항목별 비중 설정 (Flip Effect Content)
                                            <div className="animate-flip h-full flex flex-col">
                                                <div className="flex justify-between items-center mb-3 border-b dark:border-blue-800/50 pb-2">
                                                    <h4 className="text-sm font-bold text-blue-800 dark:text-blue-200">{sectorInfo[sectorKey].name} 항목</h4>
                                                    <button onClick={(e) => { e.stopPropagation(); setEditingRebalanceSector(null); }} className="text-xs bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-100 px-2 py-1 rounded hover:bg-blue-300">완료</button>
                                                </div>
                                                <div className="flex-1 overflow-y-auto max-h-[200px] custom-scrollbar space-y-2 pr-1">
                                                    {sectorAssets.length > 0 ? sectorAssets.map(asset => (
                                                        <div key={asset.id} className="flex items-center justify-between text-xs">
                                                            <span className="truncate mr-2 text-gray-700 dark:text-gray-300 flex-1" title={asset.name}>{asset.name}</span>
                                                            <div className="flex items-center gap-1 w-16">
                                                                <input 
                                                                    type="number" 
                                                                    className="w-full border rounded px-1 py-0.5 text-right bg-white dark:bg-gray-700 border-blue-200 dark:border-blue-800"
                                                                    value={currentItemTargets[asset.id] ?? Math.round(100/sectorAssets.length)}
                                                                    onChange={(e) => setItemTargets(prev => ({ ...prev, [asset.id]: Number(e.target.value) }))}
                                                                />
                                                            </div>
                                                        </div>
                                                    )) : <div className="text-xs text-gray-400 text-center py-4">항목 없음</div>}
                                                </div>
                                                <div className="mt-3 pt-2 border-t dark:border-blue-800/50 flex justify-between items-center text-xs">
                                                    <span className="text-gray-500 dark:text-gray-400">합계</span>
                                                    <span className={`font-bold ${totalItemWeight !== 100 ? 'text-red-500' : 'text-green-600'}`}>{totalItemWeight}%</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                );
            };

            const renderAssetsPanel = () => {
                const ASSET_TABS = [
                    { id: 'cash', label: '💵 현금/저축', sectors: ['deposit', 'savings'] },
                    { id: 'invest', label: '📈 투자/연금', sectors: ['investment', 'pension'] },
                    { id: 'real', label: '🏠 실물자산', sectors: ['realestate', 'car'] },
                    { id: 'debt', label: '💳 부채/기타', sectors: ['loan', 'misc'] }
                ];
                const currentTabIndex = ASSET_TABS.findIndex(t => t.id === activeAssetTab) !== -1 ? ASSET_TABS.findIndex(t => t.id === activeAssetTab) : 0;
                const currentTab = ASSET_TABS[currentTabIndex];
                const visibleSectors = currentTab.sectors;

                // [추가] 좌우 탭 전환 로직
                const handlePrevTab = () => { if (currentTabIndex > 0) setActiveAssetTab(ASSET_TABS[currentTabIndex - 1].id); };
                const handleNextTab = () => { if (currentTabIndex < ASSET_TABS.length - 1) setActiveAssetTab(ASSET_TABS[currentTabIndex + 1].id); };

                // [추가] 모바일 스와이프 제스처 핸들러
                const onTouchStart = (e) => {
                    // [Fix] 입력창이나 버튼 등 상호작용 요소에서 스와이프 시 탭 전환 방지
                    const tagName = e.target.tagName.toLowerCase();
                    if (tagName === 'input' || tagName === 'select' || tagName === 'button') {
                        return setAssetTouchStart({ x: null, y: null });
                    }
                    setAssetTouchEnd({ x: null, y: null });
                    setAssetTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
                };
                const onTouchMove = (e) => {
                    setAssetTouchEnd({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
                };
                const onTouchEnd = () => {
                    if (!assetTouchStart.x || !assetTouchEnd.x) return;
                    const dx = assetTouchStart.x - assetTouchEnd.x;
                    const dy = assetTouchStart.y - assetTouchEnd.y;
                    // 가로 스와이프 감지 (상하 스크롤과 구분하기 위해 X이동이 Y이동보다 크고 최소 50px 이상 이동)
                    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
                        if (dx > 0) handleNextTab(); // 왼쪽 스와이프 (다음 탭)
                        else handlePrevTab(); // 오른쪽 스와이프 (이전 탭)
                    }
                };

                return (
                <div className="space-y-6"> 
                    {/* 탭 내비게이션 */}
                    {!isExporting && (
                        <div className="flex items-center gap-2">
                            <button onClick={handlePrevTab} disabled={currentTabIndex <= 0} className="hidden sm:flex p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors shadow-sm" title="이전 탭">
                                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            
                            <div className="flex overflow-x-auto custom-scrollbar gap-2 p-1.5 bg-gray-100 dark:bg-gray-800/80 rounded-xl flex-1">
                                {ASSET_TABS.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveAssetTab(tab.id)}
                                        className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-lg transition-all whitespace-nowrap ${
                                            activeAssetTab === tab.id
                                                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md border border-gray-200 dark:border-gray-600 text-base font-extrabold'
                                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 text-sm font-bold'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <button onClick={handleNextTab} disabled={currentTabIndex >= ASSET_TABS.length - 1} className="hidden sm:flex p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors shadow-sm" title="다음 탭">
                                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    )}
                    
                    <div 
                        className="space-y-8 animate-in fade-in duration-300"
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                    {assetSectorOrder.map((sectorKey, index) => {
                        if (!sectorInfo[sectorKey]) return null;
                        if (!isExporting && !visibleSectors.includes(sectorKey)) return null;

                        const isLoan = sectorKey === 'loan';
                        
                        // [수정] Tailwind JIT가 동적 클래스를 감지하지 못하는 문제 해결을 위해 인라인 스타일로 변경
                        const sectorColor = sectorInfo[sectorKey].color;
                        const themeColors = window.tailwind?.config?.theme?.extend?.colors || {};
                        const colorObj = themeColors[sectorColor] || {};
                        
                        // [수정] config.js에 정의된 색상값 사용 (다크모드 지원)
                        let startColor = colorObj.start || '#6366f1'; 
                        let endColor = colorObj.end || '#a855f7';

                        if (darkMode && colorObj.darkStart && colorObj.darkEnd) {
                            startColor = colorObj.darkStart;
                            endColor = colorObj.darkEnd;
                        }

                        const gradientStyle = { background: `linear-gradient(to right, ${startColor}, ${endColor})` };

                            return (
                                <div key={sectorKey} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-xl">
                                    {/* Header */}
                                    <div className="p-5 sm:p-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" style={gradientStyle}>
                                        <div className="flex items-center gap-4 cursor-pointer w-full sm:w-auto" onClick={()=> setHiddenSectors(prev=> ({...prev, [sectorKey]: !prev[sectorKey]}))}>
                                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-inner">
                                                <span className="text-2xl">{sectorInfo[sectorKey].icon}</span>
                                            </div>
                                            <div>
                                                <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                                                    {sectorInfo[sectorKey].name}
                                                    <span className="text-xs font-normal bg-white/20 px-2 py-0.5 rounded-full border border-white/10">
                                                        {assets[sectorKey]?.length || 0}개
                                                    </span>
                                                </h3>
                                                <p className="text-xs sm:text-sm text-white/90 font-medium mt-0.5">
                                                    총 {formatNumber(currentSectorTotals[sectorKey]?.amount || 0)}만원 ({formatPercent(currentSectorTotals[sectorKey]?.percentage || 0)}%)
                                                </p>
                                                {!isLoan && calculation.rebalanceInfo?.recs[sectorKey] > 0 && (
                                                    <div className="mt-1 inline-block bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold border border-white/10">
                                                        권장 납입: {formatNumber(calculation.rebalanceInfo.recs[sectorKey])}만원
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 self-end sm:self-auto">
                                            <button onClick={() => addAsset(sectorKey)} className={`bg-white text-${sectorColor}-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-${sectorColor}-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-1.5 active:scale-95`}>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                                                추가
                                            </button>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    {!hiddenSectors[sectorKey] && (
                                        <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 space-y-4">
                                            {assets[sectorKey]?.map((asset, idx) => {
                                                const itemRec = calculation.rebalanceInfo?.itemRecs?.[asset.id] || 0;
                                                return (
                                                <div 
                                                    key={asset.id || idx} 
                                                    draggable={true}
                                                    onDragStart={(e) => handleAssetDragStart(e, sectorKey, idx)}
                                                    onDragOver={handleAssetDragOver}
                                                    onDrop={(e) => handleAssetDrop(e, sectorKey, idx)}
                                                    className={'group relative bg-white dark:bg-gray-800 rounded-xl p-5 pl-11 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition-all duration-200 ' + (draggedAssetSector === sectorKey && draggedAssetIndex === idx ? 'opacity-40 border-dashed border-indigo-400' : '')}
                                                >
                                                    {/* Drag handle */}
                                                    <div 
                                                        className="absolute left-2.5 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-600 hover:text-indigo-500 dark:hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center w-6 h-12 select-none"
                                                        title="드래그하여 순서 변경"
                                                    >
                                                        <svg className="w-4 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                            <circle cx="9" cy="5" r="1.5" fill="currentColor"/>
                                                            <circle cx="15" cy="5" r="1.5" fill="currentColor"/>
                                                            <circle cx="9" cy="12" r="1.5" fill="currentColor"/>
                                                            <circle cx="15" cy="12" r="1.5" fill="currentColor"/>
                                                            <circle cx="9" cy="19" r="1.5" fill="currentColor"/>
                                                            <circle cx="15" cy="19" r="1.5" fill="currentColor"/>
                                                        </svg>
                                                    </div>

                                                    {/* Card Header (Icon, Name Input, Actions) */}
                                                    <div className="flex items-center justify-between gap-4 mb-4">
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <div
                                                                onClick={() => setIconPickerState({ sector: sectorKey, index: idx })}
                                                                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity relative group/icon"
                                                                style={{
                                                                    backgroundColor: darkMode ? (colorObj[600] ? colorObj[600] + '33' : '#4f46e533') : (colorObj[50] || '#eef2ff'),
                                                                    color: darkMode ? (colorObj.start || '#a5b4fc') : (colorObj[500] || '#6366f1')
                                                                }}
                                                            >
                                                                {asset.icon ? <span className="text-lg leading-none select-none">{asset.icon}</span> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
                                                                <div className="absolute -bottom-1 -right-1 bg-gray-100 dark:bg-gray-700 rounded-full p-0.5 border border-gray-200 dark:border-gray-600 opacity-0 group-hover/icon:opacity-100 transition-opacity">
                                                                    <svg className="w-2.5 h-2.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                                </div>
                                                            </div>
                                                            <input 
                                                                type="text" 
                                                                value={asset.name} 
                                                                onChange={(e) => updateAsset(sectorKey, idx, 'name', e.target.value)}
                                                                className="w-full bg-transparent border-b border-transparent focus:border-indigo-500 text-base font-bold text-gray-800 dark:text-white focus:outline-none px-1 py-0.5 transition-colors placeholder-gray-400"
                                                                placeholder={isLoan ? '대출 이름' : '계좌 이름'}
                                                            />
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            {sectorKey !== 'loan' && (
                                                                <button 
                                                                    onClick={() => setStockLinkState({ sectorKey, index: idx, asset })} 
                                                                    className={'px-2.5 py-1 rounded-full text-xs font-semibold border transition-all flex items-center gap-1 ' + (
                                                                        asset.linkedItems?.length > 0 
                                                                            ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-400' 
                                                                            : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-indigo-950/40'
                                                                    )}
                                                                >
                                                                    🔗 {asset.linkedItems?.length > 0 ? '연동 완료 (' + asset.linkedItems.length + ')' : '종목 연동'}
                                                                </button>
                                                            )}
                                                            <button 
                                                                onClick={() => removeAsset(sectorKey, idx)} 
                                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors" 
                                                                title="삭제"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Grid of Inputs */}
                                                    <div className={isLoan ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4'}>
                                                        {/* Balance Input (Common) */}
                                                        <div>
                                                            <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 block">
                                                                {isLoan ? '대출 잔액 (만원)' : '현재 잔액 (만원)'}
                                                            </label>
                                                            <div className="relative">
                                                                <CalculatorInput 
                                                                    value={asset.amount} 
                                                                    readOnly={asset.linkedItems?.length > 0}
                                                                    onChange={(e) => updateAsset(sectorKey, idx, 'amount', e.target.value)}
                                                                    className={'w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg pl-7 pr-3 py-1.5 text-right font-bold text-gray-900 dark:text-white focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition-all tabular-nums ' + (asset.linkedItems?.length > 0 ? 'opacity-80' : '')}
                                                                    displayMode={displayMode}
                                                                />
                                                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">₩</span>
                                                                {asset.linkedItems?.length > 0 && (
                                                                    <div className="absolute -top-4 right-0 text-[8px] text-indigo-500 font-bold">🔗 연동됨</div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {isLoan ? (
                                                            <>
                                                                <div>
                                                                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 block">이자율</label>
                                                                    <div className="relative">
                                                                        <input 
                                                                            type="number" 
                                                                            step="0.1" 
                                                                            value={asset.rate} 
                                                                            onChange={(e) => updateAsset(sectorKey, idx, 'rate', e.target.value)} 
                                                                            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md pl-3 pr-6 py-1.5 text-sm text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-indigo-500 text-right tabular-nums" 
                                                                        />
                                                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 block">월 상환액 (원금+이자)</label>
                                                                    <CalculatorInput 
                                                                        value={asset.monthlyContrib} 
                                                                        onChange={(e) => updateAsset(sectorKey, idx, 'monthlyContrib', e.target.value)} 
                                                                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-indigo-500 text-right tabular-nums" 
                                                                        displayMode={displayMode} 
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 block">만기 (개월)</label>
                                                                    <input 
                                                                        type="number" 
                                                                        value={asset.maturityMonth ?? 12} 
                                                                        onChange={(e) => updateAsset(sectorKey, idx, 'maturityMonth', e.target.value)} 
                                                                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-indigo-500 text-right tabular-nums" 
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 block">대출 시작월</label>
                                                                    <input 
                                                                        type="month" 
                                                                        value={asset.loanStartDate ? asset.loanStartDate.slice(0, 7) : ''} 
                                                                        onChange={(e) => updateAsset(sectorKey, idx, 'loanStartDate', e.target.value)} 
                                                                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-indigo-500" 
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 block">상환 방식</label>
                                                                    <select 
                                                                        value={asset.repaymentMethod || '원리금균등'} 
                                                                        onChange={(e) => updateAsset(sectorKey, idx, 'repaymentMethod', e.target.value)} 
                                                                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-indigo-500"
                                                                    >
                                                                        <option value="원리금균등">원리금균등</option>
                                                                        <option value="원금균등">원금균등</option>
                                                                        <option value="만기일시">만기일시</option>
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 block">상환 계좌</label>
                                                                    <select 
                                                                        value={asset.repaymentAccount} 
                                                                        onChange={(e) => updateAsset(sectorKey, idx, 'repaymentAccount', e.target.value)} 
                                                                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-indigo-500"
                                                                    >
                                                                        <option value="salary">월급(고정수입)</option>
                                                                        {accountOptions.filter(name => name !== asset.name).map((name, i) => (
                                                                            <option key={i} value={name}>{name}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 block">메모</label>
                                                                    <input 
                                                                        type="text" 
                                                                        placeholder="메모" 
                                                                        value={asset.memo || ''} 
                                                                        onChange={(e) => updateAsset(sectorKey, idx, 'memo', e.target.value)} 
                                                                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-indigo-500" 
                                                                    />
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div>
                                                                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 block">월 납입액</label>
                                                                    <div className="relative">
                                                                        <CalculatorInput 
                                                                            value={asset.monthlyContrib} 
                                                                            onChange={(e) => updateAsset(sectorKey, idx, 'monthlyContrib', e.target.value)} 
                                                                            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-indigo-500 text-right tabular-nums" 
                                                                            displayMode={displayMode} 
                                                                        />
                                                                        {itemRec > 0 && (
                                                                            <span className="absolute -top-4 right-0 text-[8px] text-blue-500 font-bold bg-blue-50 dark:bg-blue-900/40 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-800">
                                                                                권장: {Math.round(itemRec).toLocaleString()}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 block">연 수익률</label>
                                                                    <div className="relative">
                                                                        <input 
                                                                            type="number" 
                                                                            step="0.1" 
                                                                            value={asset.rate} 
                                                                            onChange={(e) => updateAsset(sectorKey, idx, 'rate', e.target.value)} 
                                                                            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md pl-3 pr-6 py-1.5 text-sm text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-indigo-500 text-right tabular-nums" 
                                                                        />
                                                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 block">수수료/세금</label>
                                                                    <div className="relative">
                                                                        <input 
                                                                            type="number" 
                                                                            step="0.01" 
                                                                            value={asset.feeRate ?? 0} 
                                                                            onChange={(e) => updateAsset(sectorKey, idx, 'feeRate', e.target.value)} 
                                                                            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md pl-3 pr-6 py-1.5 text-sm text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-indigo-500 text-right tabular-nums" 
                                                                        />
                                                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 block">납입 출처</label>
                                                                    <select 
                                                                        value={asset.monthlyContributionFrom || window.MONTHLY_INCOME_SOURCE} 
                                                                        onChange={(e) => updateAsset(sectorKey, idx, 'monthlyContributionFrom', e.target.value)} 
                                                                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-indigo-500"
                                                                    >
                                                                        <option value={window.MONTHLY_INCOME_SOURCE}>{window.MONTHLY_INCOME_SOURCE}</option>
                                                                        {accountOptions.filter(name => name !== asset.name).map((name, i) => (
                                                                            <option key={i} value={name}>{name}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 block">메모</label>
                                                                    <input 
                                                                        type="text" 
                                                                        placeholder="메모 입력" 
                                                                        value={asset.memo || ''} 
                                                                        onChange={(e) => updateAsset(sectorKey, idx, 'memo', e.target.value)} 
                                                                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-indigo-500" 
                                                                    />
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                );
                                            })}


                                            {(!assets[sectorKey] || assets[sectorKey].length === 0) && (
                                                <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all cursor-pointer group" onClick={() => addAsset(sectorKey)}>
                                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 bg-${sectorColor}-50 dark:bg-${sectorColor}-900/20 text-${sectorColor}-500`}>
                                                        <span className="text-3xl">{sectorInfo[sectorKey].icon}</span>
                                                    </div>
                                                    <p className="text-lg font-bold text-gray-600 dark:text-gray-300">항목이 비어있습니다</p>
                                                    <p className="text-sm text-gray-400 mt-1">클릭하여 <span className={`text-${sectorColor}-500 font-bold`}>{sectorInfo[sectorKey].name}</span> 자산을 추가하세요</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                    })}
                    </div>
                </div>
            );
            };

            const renderExpensesPanel = () => {
                const totalMonthly = monthlyExpenses.reduce((sum, e) => sum + Number(e.amount||0), 0);
                const totalAnnual = totalMonthly * 12;

                return (
                    <div className="space-y-6">
                        {/* Summary Card */}
                        <div className="bg-gradient-to-r from-rose-500 to-pink-600 dark:from-rose-900 dark:to-pink-900 rounded-2xl shadow-lg p-6 text-white flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div>
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <span className="text-2xl">💸</span> 월 고정 지출
                                </h3>
                                <p className="text-rose-100 text-sm mt-1">매달 나가는 고정비용을 관리하세요.</p>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold">{formatNumber(totalMonthly)}만원</div>
                                <div className="text-rose-100 text-sm">연간 약 {formatNumber(totalAnnual)}만원</div>
                            </div>
                        </div>

                        {/* Expense List */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                                <span className="text-sm font-bold text-gray-500 dark:text-gray-400">총 {monthlyExpenses.length}건</span>
                                <button onClick={addExpense} className="text-sm font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                    지출 추가
                                </button>
                            </div>
                            
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {monthlyExpenses.map((expense, index) => (
                                    <div key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                                        <div className="flex flex-col sm:flex-row items-center gap-4">
                                            <div className="flex-1 w-full sm:w-auto flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-500 dark:text-rose-400 flex-shrink-0">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                                </div>
                                                <input 
                                                    type="text" 
                                                    placeholder="지출 항목명 (예: 월세, 통신비)" 
                                                    className="w-full bg-transparent border-b border-transparent focus:border-rose-500 text-gray-900 dark:text-white font-medium focus:outline-none py-1 transition-colors placeholder-gray-400"
                                                    value={expense.name} 
                                                    onChange={(e) => updateExpense(index, 'name', e.target.value)} 
                                                />
                                            </div>
                                    
                                            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                                <div className="w-20">
                                                    <select 
                                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg px-1 py-2 text-xs font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                                                        value={expense.day || 30}
                                                        onChange={(e) => updateExpense(index, 'day', Number(e.target.value))}
                                                    >
                                                        {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                                                            <option key={day} value={day}>{day}일</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="relative w-32">
                                                    {/* [수정] CalculatorInput으로 교체하여 계산 기능 지원 및 마이너스 입력 버그 해결 */}
                                                    <CalculatorInput 
                                                        placeholder="0" 
                                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg pl-3 pr-8 py-2 text-right font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                                                        value={expense.amount} 
                                                        onChange={(e) => updateExpense(index, 'amount', e.target.value)} 
                                                        displayMode={displayMode}
                                                    />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">만원</span>
                                                </div>
                                                
                                                <div className="flex items-center gap-1">
                                                    <div className="flex flex-col gap-0.5">
                                                        <button onClick={() => moveExpense(index, -1)} disabled={index === 0} className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-30"><svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg></button>
                                                        <button onClick={() => moveExpense(index, 1)} disabled={index === monthlyExpenses.length - 1} className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-30"><svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg></button>
                                                    </div>
                                                    <button onClick={() => removeExpense(index)} className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full transition-colors" title="삭제">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                                {monthlyExpenses.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-12 cursor-pointer hover:bg-rose-50/30 transition-colors group" onClick={addExpense}>
                                        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <span className="text-3xl">💸</span>
                                        </div>
                                        <p className="text-lg font-bold text-gray-600 dark:text-gray-300">고정 지출이 없습니다</p>
                                        <p className="text-sm text-rose-500 mt-1 font-bold">+ 고정 지출 추가하기</p>
                    </div>
                                )}
                            </div>
                </div>
                    </div>
                );
            };

            const renderEventsPanel = () => {
                const totalIncome = incomeEvents.reduce((sum, e) => sum + Number(e.amount||0), 0);
                const totalExpense = expenseEvents.reduce((sum, e) => sum + Number(e.amount||0), 0);
                const phases = appData.futurePhases || [];
                const sortedPhases = [...phases].filter(p => p.startDate).sort((a, b) => 
                    a.startDate > b.startDate ? 1 : (a.startDate < b.startDate ? -1 : 0)
                );

                return (
                    <div className="space-y-8">
                        {/* 페이즈 관리 섹션 - 리뉴얼 */}
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-900 dark:to-purple-900 rounded-2xl shadow-lg p-6 text-white flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div>
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <span className="text-2xl">⏳</span> 타임라인 분기점 설계
                                    </h3>
                                    <p className="text-white/80 text-sm mt-1">미래의 특정 시점부터 변경될 자산/수입/지출 계획을 설계하세요.</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold">{phases.length}개</div>
                                    <div className="text-white/80 text-sm">미래 분기점 설정됨</div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400">분기 목록</span>
                                    <button onClick={addPhase} className="text-sm font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                        새 분기 추가
                                    </button>
                                </div>
                                <div className="p-4">
                                    <div className="flex flex-col gap-3 relative">
                                        {/* 현재 상태 */}
                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-600">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">0</div>
                                                <div>
                                                    <div className="font-bold text-gray-900 dark:text-white">기본 계획 (현재 상태)</div>
                                                    <div className="text-xs text-gray-500 mt-0.5">현재 ~ {sortedPhases.length > 0 ? `${sortedPhases[0].startDate} 직전` : '계속'}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {sortedPhases.map((phase, i) => {
                                            const originalIndex = phases.findIndex(p => p.startDate === phase.startDate);
                                            const nextPhase = sortedPhases[i+1];
                                            const displayLabel = phase.startDate;
                                            const nextDisplayLabel = nextPhase ? nextPhase.startDate : null;
                                            return (
                                                <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm relative group gap-4">
                                                    <div className="absolute -top-3 left-6 w-0.5 h-3 bg-gray-200 dark:bg-gray-600 hidden sm:block"></div>
                                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">{i+1}</div>
                                                        <div className="flex-1 w-full">
                                                            <input 
                                                                type="text" 
                                                                value={phase.name || ''} 
                                                                onChange={(e) => updatePhaseName(originalIndex, e.target.value)}
                                                                placeholder={`분기점 (${displayLabel})`}
                                                                className="w-full bg-transparent border-b border-transparent focus:border-indigo-500 text-gray-900 dark:text-white font-bold focus:outline-none transition-colors placeholder-gray-400"
                                                            />
                                                            <div className="text-xs text-gray-500 mt-1">적용: {displayLabel} ~ {nextDisplayLabel ? `${nextDisplayLabel} 직전` : '계속'}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
                                                        <button onClick={() => startEditingPhase(originalIndex)} disabled={editingPhase !== null} className="flex-1 sm:flex-none px-3 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors disabled:opacity-50">상세 편집</button>
                                                        <button onClick={() => removePhase(originalIndex)} disabled={editingPhase !== null} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50" title="삭제">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <EventSection 
                            title="수입 이벤트" 
                            total={totalIncome} 
                            events={incomeEvents} 
                            type="income" 
                            addFn={addIncomeEvent} 
                            updateFn={updateIncomeEvent} 
                            removeFn={removeIncomeEvent} 
                            sectorInfo={sectorInfo}
                            assets={assets}
                            formatNumber={formatNumber}
                            moveFn={moveIncomeEvent}
                            displayMode={displayMode}
                        />
                        <EventSection 
                            title="지출 이벤트" 
                            total={totalExpense} 
                            events={expenseEvents} 
                            type="expense" 
                            addFn={addExpenseEvent} 
                            updateFn={updateExpenseEvent} 
                            removeFn={removeExpenseEvent} 
                            sectorInfo={sectorInfo}
                            assets={assets}
                            formatNumber={formatNumber}
                            moveFn={moveExpenseEvent}
                            displayMode={displayMode}
                        />
                    </div>
                );
            };

            const renderDetailAnalysisPanel = () => {
                let totalCapitalNetIncome = 0;
                let totalCapitalGrossIncome = 0;
                let totalCapitalTax = 0;
                
                const capitalIncomeData = {};
                
                Object.keys(sectorInfo).forEach(sectorKey => {
                    if (sectorKey === 'loan') return; // 대출은 자본소득 분석에서 제외
                    const items = assets[sectorKey] || [];
                    const sectorItems = items.map(asset => {
                        const amount = Number(asset.amount || 0);
                        const rate = Number(asset.rate || 0);
                        const feeRate = Number(asset.feeRate || 0);
                        
                        // 월 이자율/수익률
                        const monthlyRate = rate / 100 / 12;
                        
                        // 세전 수익
                        let monthlyGross = amount * monthlyRate;
                        let monthlyFee = monthlyGross * (feeRate / 100);
                        let monthlyNet = monthlyGross - monthlyFee;
                        
                        totalCapitalGrossIncome += monthlyGross;
                        totalCapitalTax += monthlyFee;
                        totalCapitalNetIncome += monthlyNet;
                        
                        return { ...asset, monthlyGross, monthlyFee, monthlyNet };
                    });
                    capitalIncomeData[sectorKey] = sectorItems;
                });

                // [수정] 월 수익률이 아닌 '가중평균 연 수익률(세후)'로 계산 (월 수익 / 총자산 * 12개월 * 100)
                const weightedAnnualYield = (currentGrossTotal > 0) ? (totalCapitalNetIncome / currentGrossTotal) * 12 * 100 : 0;

                const monthlyIncomeWon = totalCapitalNetIncome * 10000;
                const isPositive = monthlyIncomeWon >= 0;
                const absMonthlyIncome = Math.abs(monthlyIncomeWon);
                const perSecondIncome = absMonthlyIncome / (30 * 24 * 3600);
                const sleepIncome = (monthlyIncomeWon / 30 / 24) * 7; // 7시간 수면 기준
                const hourlyIncome = monthlyIncomeWon / 30 / 24;
                
                const getFunItems = (income) => {
                    if (income < 100000) return [ // 월 10만원 미만
                        { name: '츄파춥스', price: 500, icon: '🍭', color: 'pink' },
                        { name: '뜨끈한 국밥', price: 10000, icon: '🍲', color: 'orange' }
                    ];
                    if (income < 1000000) return [ // 월 100만원 미만
                        { name: '아메리카노', price: 4000, icon: '☕', color: 'amber' },
                        { name: '치킨 세트', price: 25000, icon: '🍗', color: 'orange' }
                    ];
                    if (income < 5000000) return [ // 월 500만원 미만
                        { name: '치킨 세트', price: 25000, icon: '🍗', color: 'orange' },
                        { name: '오마카세', price: 150000, icon: '🍣', color: 'rose' }
                    ];
                    if (income < 20000000) return [ // 월 2,000만원 미만
                        { name: '최신 아이폰', price: 1600000, icon: '📱', color: 'zinc' },
                        { name: '명품 가방', price: 5000000, icon: '👜', color: 'purple' }
                    ];
                    if (income < 100000000) return [ // 월 1억원 미만
                        { name: '유럽 여행', price: 8000000, icon: '✈️', color: 'sky' },
                        { name: '자동차', price: 40000000, icon: '🚗', color: 'indigo' }
                    ];
                    return [ // 월 1억원 이상 (초고소득)
                        { name: '스포츠카', price: 200000000, icon: '🏎️', color: 'red' },
                        { name: '강남 아파트', price: 3000000000, icon: '🏢', color: 'emerald' }
                    ];
                };
                const funItems = getFunItems(absMonthlyIncome);

                const formatDuration = (seconds) => {
                    if (!isFinite(seconds) || seconds <= 0) return "달성 불가";
                    if (seconds < 1) return `1초에 ${(1/seconds).toFixed(1)}개`; // [추가] 초고속 달성 시
                    const d = Math.floor(seconds / (3600 * 24));
                    const h = Math.floor((seconds % (3600 * 24)) / 3600);
                    const m = Math.floor((seconds % 3600) / 60);
                    const s = Math.floor(seconds % 60);
                    if (d > 365) return "1년 이상";
                    if (d > 0) return `${d}일 ${h}시간`;
                    if (h > 0) return `${h}시간 ${m}분`;
                    if (m > 0) return `${m}분 ${s}초`;
                    return `${s}초`;
                };

                return (
                <div className="space-y-4">
                    {!isExporting && (
                        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit mb-4">
                            <button onClick={() => setAnalysisMode('growth')} className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${analysisMode === 'growth' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>📊 자산 증감 분석</button>
                            <button onClick={() => setAnalysisMode('income')} className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${analysisMode === 'income' ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>💰 자본 소득 분석</button>
                        </div>
                    )}

                    {(analysisMode === 'growth' || isExporting) && (
                    <div className={isExporting ? "mb-10" : ""}>
                        {isExporting && <h4 className="text-lg font-bold mb-4 flex items-center gap-2"><span className="text-xl">📊</span> 자산 증감 분석</h4>}
                    <div className="sm:hidden space-y-4">
                        {Object.keys(sectorInfo).map(sectorKey => {
                            const current = currentSectorTotals[sectorKey] || { amount: 0, percentage: 0 };
                            const projected = projectedSectorTotals[sectorKey] || { amount: 0, percentage: 0 };
                            const growthRate = current.amount > 0 ? ((projected.amount - current.amount) / current.amount * 100) : 0;
                            const isPositiveGood = sectorKey === 'loan' ? growthRate <= 0 : growthRate >= 0;
                            const targetPct = (rebalancingTargets[sectorKey] ?? Math.round(100 / Object.keys(sectorInfo).length));

                            return (
                                <div key={sectorKey} className={`p-4 rounded-lg shadow-sm ${sectorInfo[sectorKey].bgClass} border dark:border-gray-700`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            {sectorInfo[sectorKey].icon} {sectorInfo[sectorKey].name}
                                        </h4>
                                        {growthRate !== 0 && (
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${isPositiveGood ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                                증감율: {formatPercent(growthRate)}%
                                            </span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                        <div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 block">현재 금액</span>
                                            <span className="font-semibold tabular-nums">{formatNumber(current.amount, displayMode)}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 block">예상 금액</span>
                                            <span className="font-semibold tabular-nums">{formatNumber(projected.amount, displayMode)}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 block">현재 비중</span>
                                            <span className="tabular-nums">{formatPercent(current.percentage)}%</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 block">예상 비중</span>
                                            <span className="tabular-nums">{formatPercent(projected.percentage)}%</span>
                                        </div>
                                    </div>
                                    
                                    {assets[sectorKey]?.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                                            {assets[sectorKey].map((asset, idx) => {
                                                const projectedAmount = calculation.projected[sectorKey]?.[idx]?.amount || 0;
                                                const assetGrowth = projectedAmount - asset.amount;
                                                const assetGrowthRate = asset.amount > 0 ? (assetGrowth / asset.amount * 100) : 0;
                                                const isAssetPositiveGood = sectorKey === 'loan' ? assetGrowthRate <= 0 : assetGrowthRate >= 0;
                                                
                                                return (
                                                    <div key={`${sectorKey}-${idx}`} className="flex justify-between items-center text-xs bg-white/50 dark:bg-black/20 p-2 rounded">
                                                        <span className="font-medium truncate flex-1">{asset.name}</span>
                                                        <div className="text-right">
                                                            <div>{formatNumber(asset.amount, displayMode)} → {formatNumber(projectedAmount, displayMode)}</div>
                                                            <div className={`${isAssetPositiveGood ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                                {formatPercent(assetGrowthRate)}%
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                            <div className="p-4 rounded-lg shadow-sm bg-gray-100 dark:bg-gray-800 border dark:border-gray-700 mt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-bold text-gray-900 dark:text-white">총자산 (부채 포함)</h4>
                                    <span className="text-xs font-bold px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                        증감율: {formatPercent(calculation.growth / Math.max(1, calculation.currentGross) * 100)}%
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                    <div><span className="text-xs text-gray-500 dark:text-gray-400 block">현재</span><span className="font-bold tabular-nums">{formatNumber(calculation.currentGross, displayMode)}</span></div>
                                    <div><span className="text-xs text-gray-500 dark:text-gray-400 block">예상</span><span className="font-bold tabular-nums">{formatNumber(calculation.projectedGross, displayMode)}</span></div>
                                </div>
                                <div className="flex justify-between items-center mb-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                                    <h4 className="font-bold text-indigo-700 dark:text-indigo-400">순자산</h4>
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${(calculation.projectedNet - calculation.currentNet) >= 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                        증감율: {formatPercent((calculation.projectedNet - calculation.currentNet) / Math.max(1, calculation.currentNet) * 100)}%
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div><span className="text-xs text-gray-500 dark:text-gray-400 block">현재</span><span className="font-bold text-indigo-700 dark:text-indigo-400 tabular-nums">{formatNumber(calculation.currentNet, displayMode)}</span></div>
                                    <div><span className="text-xs text-gray-500 dark:text-gray-400 block">예상</span><span className="font-bold text-indigo-700 dark:text-indigo-400 tabular-nums">{formatNumber(calculation.projectedNet, displayMode)}</span></div>
                                </div>
                            </div>
                    </div>

                    {/* 데스크탑 테이블 뷰 */}
                    <div className="hidden sm:block overflow-x-auto -mx-6 px-6">
                    <table className="w-full text-sm dark:text-gray-300 min-w-[950px] border-separate border-spacing-0">
                        <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-20">
                            <tr>
                                <th className="p-4 text-left font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b dark:border-gray-700 w-1/4">섹터 / 자산 항목</th>
                                <th className="p-4 text-right font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b dark:border-gray-700">금액 변화 (현재 → 예상)</th>
                                <th className="p-4 text-right font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b dark:border-gray-700">순증감 (율)</th>
                                <th className="p-4 text-center font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b dark:border-gray-700">현재 비중</th>
                                <th className="p-4 text-center font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b dark:border-gray-700">예상 비중</th>
                                <th className="p-4 text-right font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b dark:border-gray-700">목표</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(sectorInfo).map(sectorKey => {
                                const current = currentSectorTotals[sectorKey] || { amount: 0, percentage: 0 };
                                const projected = projectedSectorTotals[sectorKey] || { amount: 0, percentage: 0 };
                                const growthRate = current.amount > 0 ? ((projected.amount - current.amount) / current.amount * 100) : 0;
                                const isPositiveGood = sectorKey === 'loan' ? growthRate <= 0 : growthRate >= 0;
                                const rebalanceStatus = getRebalanceStatus(sectorKey, projected.percentage, false);
                                const targetPct = (rebalancingTargets[sectorKey] ?? Math.round(100 / Object.keys(sectorInfo).length));

                                return (
                                    <React.Fragment key={sectorKey}>
                                        <tr className={`group ${sectorInfo[sectorKey].bgClass} border-l-4 border-l-transparent hover:border-l-current transition-all`}>
                                            <td className="p-4 font-bold border-b dark:border-gray-700">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl">{sectorInfo[sectorKey].icon}</span>
                                                    <span className="text-base">{sectorInfo[sectorKey].name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right border-b dark:border-gray-700 tabular-nums">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="text-xs text-gray-400 opacity-70">{formatNumber(current.amount, displayMode)}</span>
                                                    <span className="text-gray-300">→</span>
                                                    <span className="text-base font-black">{formatNumber(projected.amount, displayMode)}</span>
                                                </div>
                                            </td>
                                            <td className={`p-4 text-right border-b dark:border-gray-700 tabular-nums ${isPositiveGood ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                <div className="font-black text-base">{growthRate > 0 ? '▲' : growthRate < 0 ? '▼' : ''} {formatNumber(Math.abs(projected.amount - current.amount), displayMode)}</div>
                                                <div className="text-xs opacity-80">({formatPercent(growthRate)}%)</div>
                                            </td>
                                            <td className="p-4 border-b dark:border-gray-700">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="font-medium tabular-nums">{formatPercent(current.percentage)}%</span>
                                                    <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-gray-400" style={{ width: `${current.percentage}%` }}></div></div>
                                                </div>
                                            </td>
                                            <td className="p-4 border-b dark:border-gray-700">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="font-medium tabular-nums">{formatPercent(projected.percentage)}%</span>
                                                    <div className="w-16 h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                                        <div className="h-full bg-green-500" style={{ width: `${projected.percentage}%` }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right border-b dark:border-gray-700 tabular-nums font-bold text-gray-400">{formatPercent(targetPct)}%</td>
                                        </tr>
                                        {assets[sectorKey]?.map((asset, idx) => {
                                            const projectedAmount = calculation.projected[sectorKey]?.[idx]?.amount || 0;
                                            const assetGrowth = projectedAmount - asset.amount;
                                            const assetGrowthRate = asset.amount > 0 ? (assetGrowth / asset.amount * 100) : 0;
                                            const isAssetPositiveGood = sectorKey === 'loan' ? assetGrowthRate <= 0 : assetGrowthRate >= 0;
                                            const sectorTotal = projected.amount || 1;
                                            const currentAssetPercentageInPortfolio = (currentGrossTotal > 0) ? (asset.amount / currentGrossTotal * 100) : 0;
                                            const assetPercentageInPortfolio = (projectedAmount / projectedGrossTotal * 100);
                                            const currentAssetPercentageInSector = (current.amount > 0) ? (asset.amount / current.amount * 100) : 0;
                                            const projectedAssetPercentageInSector = (projected.amount > 0) ? (projectedAmount / projected.amount * 100) : 0;
                                            const itemTarget = appData.itemTargets?.[asset.id] ?? Math.round(100/(assets[sectorKey]?.length||1));
                                            const itemRebalanceStatus = getRebalanceStatus(asset.id, projectedAssetPercentageInSector, true, asset.id, sectorKey);
                                            
                                            return (
                                                <tr key={`${sectorKey}-${idx}`} className="border-b dark:border-gray-700/30 bg-white/10 dark:bg-gray-900/10 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                    <td className="p-3 pl-12 text-[13px] text-gray-500 dark:text-gray-400">
                                                        <span className="opacity-20 mr-2">└</span>{asset.name}
                                                    </td>
                                                    <td className="p-3 text-right text-[12px] tabular-nums font-medium text-gray-500">
                                                        {formatNumber(asset.amount, displayMode)} <span className="mx-1 opacity-30">→</span> {formatNumber(projectedAmount, displayMode)}
                                                    </td>
                                                    <td className={`p-3 text-right text-[12px] tabular-nums font-bold ${isAssetPositiveGood ? 'text-green-600/80' : 'text-red-500/80'}`}>
                                                        {assetGrowth > 0 ? '+' : ''}{formatNumber(assetGrowth, displayMode)}
                                                        <span className="ml-1 font-normal opacity-70">({formatPercent(assetGrowthRate)}%)</span>
                                                    </td>
                                                    <td className="p-3 text-center text-[12px] tabular-nums text-gray-500">
                                                        {sectorKey !== 'loan' ? `${formatPercent(currentAssetPercentageInPortfolio)}%` : '-'}
                                                    </td>
                                                    <td className="p-3 text-center text-[12px] tabular-nums text-gray-500">
                                                        {sectorKey !== 'loan' ? `${formatPercent(assetPercentageInPortfolio)}% (${formatPercent(projectedAssetPercentageInSector)}%)` : '-'}
                                                    </td>
                                                    <td className={`p-3 text-right text-[11px] tabular-nums opacity-60 ${itemRebalanceStatus}`}>({formatPercent(itemTarget)}%)</td>
                                                </tr>
                                            );
                                        })}
                                    </React.Fragment>
                                );
                            })}
                            <tr className="bg-gray-100 dark:bg-gray-700 border-t-2 border-gray-300 dark:border-gray-600">
                                <td className="p-4 font-black">총계</td>
                                <td className="p-4 text-right font-black tabular-nums">
                                    {formatNumber(calculation.currentGross, displayMode)} → {formatNumber(calculation.projectedGross, displayMode)}
                                </td>
                                <td className={`p-4 text-right font-black tabular-nums ${calculation.growth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    +{formatNumber(calculation.growth, displayMode)}
                                    <div className="text-xs font-bold">({formatPercent(calculation.growth / Math.max(1, calculation.currentGross) * 100)}%)</div>
                                </td>
                                <td className="p-3 text-center font-bold tabular-nums">100.0%</td>
                                <td className="p-3 text-center font-bold tabular-nums">100.0%</td>
                                <td className="p-3 text-right font-bold tabular-nums">100.0%</td>
                            </tr>
                            <tr className="border-t border-gray-300 dark:border-gray-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300">
                                <td className="p-3 font-bold">순자산</td>
                                <td className="p-3 text-right font-bold tabular-nums">
                                    {formatNumber(calculation.currentNet, displayMode)} → {formatNumber(calculation.projectedNet, displayMode)}
                                </td>
                                <td className={`p-3 text-right font-bold tabular-nums ${(calculation.projectedNet - calculation.currentNet) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                                    {(calculation.projectedNet - calculation.currentNet) >= 0 ? '+' : ''}{formatNumber(calculation.projectedNet - calculation.currentNet, displayMode)}
                                    <div className="text-xs font-bold">({formatPercent((calculation.projectedNet - calculation.currentNet) / Math.max(1, calculation.currentNet) * 100)}%)</div>
                                </td>
                                <td className="p-3 text-center font-bold tabular-nums">-</td>
                                <td className="p-3 text-center font-bold tabular-nums">-</td>
                                <td className="p-3 text-right font-bold tabular-nums">-</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                    </div>
                    )}

                    {(analysisMode === 'income' || isExporting) && (
                    <div className={isExporting ? "mt-10" : ""}>
                        {isExporting && <h4 className="text-lg font-bold mb-4 flex items-center gap-2 border-t pt-10"><span className="text-xl">💰</span> 자본 소득 분석</h4>}
                        {/* 자본 소득 요약 카드 */}
                        <div className="mb-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                                    {/* 메인 총액 카드: 크기 축소 및 장식 제거 */}
                                    <div className="xl:col-span-4 bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 relative">
                                        <div className="relative">
                                            <h4 className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">예상 월 자본 소득 (세후)</h4>
                                            <div className="flex items-baseline gap-1 mb-4">
                                                <span className={`text-3xl font-black tracking-tight ${totalCapitalNetIncome >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600'}`}>
                                                    {totalCapitalNetIncome > 0 ? '+' : ''}{formatNumber(totalCapitalNetIncome, displayMode, 1)}
                                                    <span className="text-sm ml-1.5 opacity-60 font-bold" title="세후 가중평균 연 수익률">({formatNumber(weightedAnnualYield, displayMode, 2)}%)</span>
                                                </span>
                                                <span className="text-lg font-bold text-slate-400">만원</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[11px] font-bold bg-gray-50 dark:bg-slate-900/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                                                <div className="flex flex-col">
                                                    <span className="text-slate-500 mb-0.5">세전 수익</span>
                                                    <span className="text-slate-700 dark:text-slate-200">{formatNumber(totalCapitalGrossIncome, displayMode, 0)}만</span>
                                                </div>
                                                <div className="w-px h-5 bg-slate-200 dark:bg-slate-700"></div>
                                                <div className="flex flex-col text-right">
                                                    <span className="text-slate-500 mb-0.5">세금 및 비용</span>
                                                    <span className="text-rose-400">-{formatNumber(totalCapitalTax, displayMode, 0)}만</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* 상세 지표 카드: 패딩 및 아이콘 크기 축소 */}
                                    <div className="xl:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between hover:border-indigo-400 transition-all">
                                            <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-lg mb-2">😴</div>
                                            <div>
                                                <div className="text-[10px] font-bold text-slate-400 mb-0.5">수면 중 소득 (7h)</div>
                                                <div className={`text-lg font-black ${sleepIncome >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-500'}`}>{Math.round(sleepIncome).toLocaleString()}원</div>
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between hover:border-blue-400 transition-all">
                                            <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-lg mb-2">💼</div>
                                            <div>
                                                <div className="text-[10px] font-bold text-slate-400 mb-0.5">내 자산의 시급</div>
                                                <div className={`text-lg font-black ${hourlyIncome >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-500'}`}>{Math.round(hourlyIncome).toLocaleString()}원</div>
                                            </div>
                                        </div>
                                        {funItems.map((item, idx) => (
                                            <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between hover:border-amber-400 transition-all">
                                                <div className={`w-8 h-8 bg-${item.color}-50 dark:bg-${item.color}-900/30 rounded-lg flex items-center justify-center text-lg mb-2`}>{item.icon}</div>
                                                <div>
                                                    <div className="text-[10px] font-bold text-slate-400 mb-0.5">{item.name} 획득 시간</div>
                                                    <div className="text-lg font-black text-slate-800 dark:text-slate-100">
                                                        {perSecondIncome > 0 ? formatDuration(item.price / perSecondIncome) : '-'}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 시간당 소득 시각화: 흐름을 보여주는 가로형 리스트 */}
                                <div className="bg-slate-50 dark:bg-slate-900/40 p-2 rounded-2xl flex flex-wrap md:flex-nowrap gap-2">
                                    {(() => {
                                        const absMonthlyWon = Math.abs(totalCapitalNetIncome * 10000);
                                        const timeMetrics = [
                                            { label: '하루', val: absMonthlyWon / 30, icon: '📅' },
                                            { label: '시간당', val: absMonthlyWon / 30 / 24, icon: '⏰' },
                                            { label: '분당', val: absMonthlyWon / 30 / 24 / 60, icon: '🕒' },
                                            { label: '초당', val: absMonthlyWon / 30 / 24 / 3600, icon: '⚡' }
                                        ];
                                        return timeMetrics.map(m => (
                                            <div key={m.label} className="flex-1 min-w-[120px] bg-white dark:bg-slate-800 py-3 px-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs">{m.icon}</span>
                                                    <span className="text-[11px] font-bold text-slate-500">{m.label}</span>
                                                </div>
                                                <span className="text-sm font-black text-slate-800 dark:text-slate-200 tabular-nums">{m.val.toLocaleString(undefined, {maximumFractionDigits: m.label === '초당' ? 2 : 0})}원</span>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* 자본 소득 상세 테이블 */}
                        <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
                            <table className="w-full text-sm dark:text-gray-300 min-w-[900px] border-separate border-spacing-0">
                                <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-20">
                                    <tr>
                                        <th className="p-4 text-left font-black text-slate-400 uppercase tracking-widest text-[10px] border-b dark:border-gray-700">섹터 / 항목</th>
                                        <th className="p-4 text-right font-black text-slate-400 uppercase tracking-widest text-[10px] border-b dark:border-gray-700">현재 잔액</th>
                                        <th className="p-4 text-right font-black text-slate-400 uppercase tracking-widest text-[10px] border-b dark:border-gray-700">수익률</th>
                                        <th className="p-4 text-right font-black text-slate-400 uppercase tracking-widest text-[10px] border-b dark:border-gray-700">월 수익 (세전)</th>
                                        <th className="p-4 text-right font-black text-slate-400 uppercase tracking-widest text-[10px] border-b dark:border-gray-700">비용 (세금/수수료)</th>
                                        <th className="p-4 text-right font-black text-slate-400 uppercase tracking-widest text-[10px] border-b dark:border-gray-700">월 순수익 (세후)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.keys(sectorInfo).map(sectorKey => {
                                        const items = capitalIncomeData[sectorKey];
                                        if (!items || items.length === 0) return null;
                                        
                                        const sectorGross = items.reduce((s, i) => s + i.monthlyGross, 0);
                                        const sectorFee = items.reduce((s, i) => s + i.monthlyFee, 0);
                                        const sectorNet = items.reduce((s, i) => s + i.monthlyNet, 0);

                                        return (
                                            <React.Fragment key={sectorKey}>
                                                <tr className={`${sectorInfo[sectorKey].bgClass} font-black text-gray-800 dark:text-gray-100`}>
                                                    <td className="p-4 border-b dark:border-gray-700">{sectorInfo[sectorKey].icon} {sectorInfo[sectorKey].name} 합계</td>
                                                    <td className="p-4 text-right border-b dark:border-gray-700 tabular-nums">{formatNumber(items.reduce((s,i)=>s+(i.amount||0),0), displayMode)}</td>
                                                    <td className="p-4 text-right border-b dark:border-gray-700">-</td>
                                                    <td className={`p-4 text-right border-b dark:border-gray-700 tabular-nums ${sectorGross >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{formatNumber(sectorGross, displayMode, 0)}</td>
                                                    <td className="p-4 text-right border-b dark:border-gray-700 tabular-nums text-red-500">-{formatNumber(sectorFee, displayMode, 0)}</td>
                                                    <td className={`p-4 text-right border-b dark:border-gray-700 tabular-nums ${sectorNet >= 0 ? 'text-emerald-600 font-black' : 'text-red-600'}`}>{formatNumber(sectorNet, displayMode, 0)}</td>
                                                </tr>
                                                {items.map((asset, idx) => (
                                                    <tr key={`${sectorKey}-${idx}`} className="border-b dark:border-gray-700/30 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors">
                                                        <td className="p-3 pl-12 text-[13px] text-gray-500 dark:text-gray-400 italic">
                                                            <span className="opacity-20 mr-2">└</span>{asset.name}
                                                        </td>
                                                        <td className="p-3 text-right text-[12px] tabular-nums text-gray-400">{formatNumber(asset.amount, displayMode)}</td>
                                                        <td className="p-3 text-right text-[12px] tabular-nums font-bold text-indigo-500 dark:text-indigo-400">{asset.rate}%</td>
                                                        <td className={`p-3 text-right text-[13px] tabular-nums ${asset.monthlyGross >= 0 ? 'text-gray-900 dark:text-gray-200' : 'text-red-500'}`}>
                                                            {formatNumber(asset.monthlyGross, displayMode, 0)}
                                                        </td>
                                                        <td className="p-3 text-right text-[12px] tabular-nums text-red-400">
                                                            <div className="opacity-70">-{formatNumber(asset.monthlyFee, displayMode, 0)}</div>
                                                        </td>
                                                        <td className={`p-3 text-right text-[14px] tabular-nums font-bold ${asset.monthlyNet >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600'}`}>
                                                            {asset.monthlyNet > 0 ? '+' : ''}{formatNumber(asset.monthlyNet, displayMode, 0)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        );
                                    })}
                                    <tr className="border-t-2 border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 font-bold">
                                        <td className="p-4">총계</td>
                                        <td className="p-4 text-right">-</td>
                                        <td className="p-4 text-right">-</td>
                                        <td className={`p-4 text-right tabular-nums ${totalCapitalGrossIncome >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600'}`}>{formatNumber(totalCapitalGrossIncome, displayMode, 0)}</td>
                                        <td className="p-4 text-right tabular-nums text-red-600 dark:text-red-400">-{formatNumber(totalCapitalTax, displayMode, 0)}</td>
                                        <td className={`p-4 text-right tabular-nums ${totalCapitalNetIncome >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600'}`}>
                                            {totalCapitalNetIncome > 0 ? '+' : ''}{formatNumber(totalCapitalNetIncome, displayMode, 2)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    )}
                </div>
            )};

            const renderAssumptionsPanel = () => {
                const assumptions = window.getAssumptionsContent ? window.getAssumptionsContent(inflationRate) : [];

                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {assumptions.map((item, idx) => (
                            <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-2 mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">
                                    <span className="text-xl">{item.icon}</span>
                                    <h4 className="font-bold text-gray-800 dark:text-white">{item.title}</h4>
                                </div>
                                <ul className="space-y-2">
                                    {item.content.map((text, i) => (
                                        <li key={i} className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-1.5 leading-relaxed">
                                            <span className="text-blue-500 mt-0.5">•</span>
                                            <span>{text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                        <div className="md:col-span-2 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                            <h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm mb-2">💡 참고사항</h4>
                            <p className="text-xs text-blue-700 dark:text-blue-200 leading-relaxed">
                                본 시뮬레이션 결과는 사용자가 입력한 가정(수익률, 물가상승률 등)에 기반한 단순 예측치이며, 
                                실제 미래의 자산 가치를 보장하지 않습니다. 세금, 수수료, 시장 변동성 등 다양한 변수에 따라 실제 결과는 달라질 수 있습니다.
                            </p>
                        </div>
                    </div>
                );
            };

            if (isLoading) {
                return <SkeletonDashboard />;
            }

            const navLabels = window.navLabels || {};

            return (
                (calculation.error || layoutOrder.length === 0) ? 
                <div className="flex items-center justify-center min-h-screen bg-gray-50">
                    { layoutOrder.length === 0 ? '레이아웃 로딩 중...' : '계산 오류 발생. 설정을 확인해주세요.' }
                    <button onClick={() => { if(confirm('모든 로컬 데이터를 삭제하고 초기화하시겠습니까?')) { localStorage.clear(); window.location.reload(); } }} className="mt-4 text-sm text-gray-500 underline hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer">
                        데이터 초기화 (복구)
                    </button>
                </div>
                :
                <div className={`relative min-h-screen transition-colors duration-700 pb-20 sm:pb-0 ${editingPhase !== null ? 'bg-indigo-50 dark:bg-indigo-950/30' : 'bg-gray-50 dark:bg-gray-900'}`}>
                    {/* 부드러운 시뮬레이션 모드 배경 효과 */}
                    {editingPhase !== null && (
                        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-400/10 dark:bg-indigo-600/20 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-[pulse_4s_ease-in-out_infinite]"></div>
                        </div>
                    )}
                    <div className="relative z-10">
                    {/* [추가] 타임라인 페이즈 편집 배너 */}
                    {editingPhase !== null && (
                        <div className="fixed top-0 left-0 w-full z-[9999] bg-indigo-600 text-white px-4 py-3 flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-6 shadow-xl animate-in slide-in-from-top">
                            <div className="flex items-center gap-2">
                                <span className="text-xl animate-pulse">⏳</span>
                                <span className="font-bold">미래 시점 편집 중 (기준: {editingPhase.displayLabel} - {appData.futurePhases[editingPhase.index]?.name || '새 분기'})</span>
                            </div>
                            <span className="text-xs text-indigo-200 hidden sm:inline">이 모드에서 수정한 설정은 해당 시점부터 적용됩니다. (다른 기능은 숨김 처리됨)</span>
                            <div className="flex gap-2">
                                <button onClick={cancelEditingPhase} className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white border border-indigo-400 rounded-full text-sm font-bold shadow-md transition-all">
                                    취소
                                </button>
                                <button onClick={saveAndExitPhase} className="px-5 py-1.5 bg-white text-indigo-600 rounded-full text-sm font-bold shadow-md hover:bg-indigo-50 hover:scale-105 transition-all">
                                    💾 저장 후 닫기
                                </button>
                            </div>
                        </div>
                    )}
                    {activeNotice && (
                        <div className="bg-indigo-600 text-white px-4 py-2 text-sm font-medium text-center relative animate-in slide-in-from-top duration-500">
                            <span className="mr-2">📢</span> {activeNotice}
                            <button onClick={() => setActiveNotice(null)} className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-200 hover:text-white">✕</button>
                        </div>
                    )}
                    {activeReply && (
                        <div className="bg-green-600 text-white px-4 py-2 text-sm font-medium text-center relative animate-in slide-in-from-top duration-500 border-t border-green-500">
                            <span className="mr-2">📬</span> <b>관리자 답변:</b> {activeReply}
                            <button onClick={handleDismissReply} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-200 hover:text-white" title="확인 및 닫기">✕</button>
                        </div>
                    )}
                    <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
                        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                            <div className="flex justify-between items-center h-16 gap-4">
                                <div className="flex items-center flex-shrink-0">
                                    <h1 id="app-title" className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white cursor-pointer whitespace-nowrap" onClick={cycleDisplayMode}>
                                        자산 플래너 {titleText}
                                    </h1>
                                </div>

                                {/* [개편] 헤더 통합 카테고리 탭: 수직 공간을 절약하고 주요 섹션 이동을 직관적으로 개선 */}
                                <div className="hidden lg:flex items-center gap-10 h-full px-8">
                                    {[
                                        { id: 'input', label: '데이터 입력' },
                                        { id: 'visualization', label: '시각화' },
                                        { id: 'analysis', label: '분석' }
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => { setActiveTab(tab.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                                                activeTab === tab.id 
                                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* [통합] 모바일 단일 행 네비게이션: 제목 옆에 바로 탭 노출 */}
                                <div className="lg:hidden flex overflow-x-auto no-scrollbar gap-2 flex-1 py-1 ml-6">
                                    {[
                                        { id: 'input', label: '입력' },
                                        { id: 'visualization', label: '시각화' },
                                        { id: 'analysis', label: '분석' }
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => { setActiveTab(tab.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-black transition-all border ${
                                                activeTab === tab.id 
                                                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400' 
                                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500'
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                <div id="header-actions" className="hidden sm:flex items-center gap-2 sm:gap-3"> 
                                    {/* [수정] 글로벌 액션 버튼들을 더 콤팩트하게 변경 */}
                                    <div className="flex items-center gap-1 mr-2 px-3 py-1 bg-gray-50 dark:bg-gray-900/50 rounded-full border dark:border-gray-700">
                                        <button onClick={() => setIsScreenshotModalOpen(true)} className="p-1.5 text-gray-500 hover:text-emerald-600 transition-colors" title="스크린샷으로 자산 업데이트"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg></button>
                                        <button onClick={saveToPDF} disabled={editingPhase !== null} className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors" title="PDF 저장"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></button>
                                        <button onClick={saveAsDefault} className="p-1.5 text-gray-500 hover:text-amber-500 transition-colors" title="기본값 저장"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5h14l-2 14H7L5 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v4M9 5v2M15 5v2" /></svg></button>
                                        <button onClick={loadCustomDefault} className="p-1.5 text-gray-500 hover:text-indigo-500 transition-colors" title="기본값 불러오기"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button>
                                    </div>

                                    {/* [이동] 실행 취소/다시 실행 버튼 (우측으로 이동) */}
                                    <div className="flex items-center bg-white dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600">
                                        <button onClick={() => { undo(); addToast('실행 취소되었습니다.', 'info'); }} disabled={!canUndo} className="px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed border-r border-gray-300 dark:border-gray-600" title="실행 취소 (Ctrl+Z)">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                                        </button>
                                        <button onClick={() => { redo(); addToast('다시 실행되었습니다.', 'info'); }} disabled={!canRedo} className="px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed" title="다시 실행 (Ctrl+Y)">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" /></svg>
                                        </button>
                                    </div>

                                    <button onClick={() => setIsApiKeyModalOpen(true)} className="p-2 text-gray-500 hover:text-indigo-500 transition-colors active:scale-95 flex items-center justify-center" title="API 키 및 연동 설정">
                                         <span className="text-xl leading-none">🔑</span>
                                    </button>
                                    <button onClick={() => setIsSettingsModalOpen(true)} className="p-2 text-gray-500 hover:text-blue-500 transition-colors" title="설정">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </button>
                                </div>
                                <div className="sm:hidden relative">
                                    <details className="relative">
                                        <summary id="mobile-menu-trigger" className="list-none inline-flex items-center px-3 py-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200">☰ 메뉴</summary>
                                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-md z-50 p-2 space-y-2">
                                            {!verifiedEmail ? (
                                                <button onClick={handleLogin} className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400">
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                                                    Google 로그인
                                                </button>
                                            ) : (
                                                <>
                                                    <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-b dark:border-gray-700 mb-1 truncate">
                                                        {userProfile?.full_name || verifiedEmail}
                                                        <span className={`ml-2 text-[9px] px-1 rounded font-bold ${isPro ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                                                            {isAdmin ? 'ADMIN' : (isPro ? 'PRO' : 'FREE')}
                                                        </span>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <button onClick={() => { undo(); addToast('실행 취소되었습니다.', 'info'); }} disabled={!canUndo} className="flex-1 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded disabled:opacity-30">↩ 실행 취소</button>
                                                    <button onClick={() => { redo(); addToast('다시 실행되었습니다.', 'info'); }} disabled={!canRedo} className="flex-1 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded disabled:opacity-30">↪ 다시 실행</button>
                                                </div>
                                                        {verifiedEmail && (
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <span className={`text-[9px] flex items-center gap-1 ${syncStatus === 'synced' ? 'text-green-600' : syncStatus === 'syncing' ? 'text-yellow-600' : syncStatus === 'error' ? 'text-red-600' : 'text-gray-400'}`}>
                                                                    <span className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'synced' ? 'bg-green-500' : syncStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' : syncStatus === 'error' ? 'bg-red-500' : 'bg-gray-300'}`}></span>
                                                                    {syncStatus === 'synced' ? '동기화됨' : syncStatus === 'syncing' ? '동기화 중' : syncStatus === 'error' ? '동기화 실패' : '대기'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                <button onClick={() => setIsSettingsModalOpen(true)} className="w-full text-left px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">⚙️ 앱 설정</button>
                                                 <button onClick={() => setIsApiKeyModalOpen(true)} className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 text-sm flex items-center gap-1.5"><span className="text-gray-500">🔑</span> API 키 및 연동 설정</button>
                                                    <button onClick={() => setIsSuggestionModalOpen(true)} className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 text-sm">💡 기능 제안</button>
                                                    {isAdmin && (
                                                        <button onClick={() => setIsAdminModalOpen(true)} className="w-full text-left px-3 py-2 rounded hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-bold text-sm">🛡️ 관리자 대시보드</button>
                                                    )}
                                                </>
                                            )}
                                            <div className="border-t dark:border-gray-700 my-1"></div>
                                            <button onClick={saveToPDF} disabled={editingPhase !== null} className={`w-full text-left px-3 py-2 rounded transition-colors ${editingPhase !== null ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200'}`}>📄 PDF 저장</button>
                                            <button onClick={handleOpenAIAnalysis} className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 text-indigo-600 font-bold">🤖 AI 자산 분석</button>
                                            <button onClick={() => setIsScreenshotModalOpen(true)} className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 text-emerald-600 font-bold">📷 스크린샷 자산 업데이트</button>
                                            <button onClick={saveAsDefault} className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200">⭐ 기본값 저장</button>
                                            <button onClick={loadCustomDefault} className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200">↩️ 기본값 불러오기</button>
                                        </div>
                                    </details>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== 메인 콘텐츠 ===== */}
                    <div id="dashboard-content" className="p-4 sm:p-6 max-w-[90rem] mx-auto flex flex-col lg:flex-row gap-8">
                        {/* [추가] 사이드바 내비게이션 */}
                        <aside className="hidden lg:block w-52 flex-shrink-0">
                            <div className="sticky top-24 space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar">
                            {/* 클라우드 동기화 카드 */}
                            <div className="mb-4 p-3 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/40 dark:to-blue-900/40 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span onClick={handleLocalTestToggle} className={`text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1 ${isLocal ? 'cursor-pointer hover:text-indigo-800 dark:hover:text-indigo-200' : ''}`} title={isLocal ? "클릭하여 로컬 테스트 모드 전환" : ""}>
                                        내 정보
                                        {syncStatus === 'error' && <span title={syncError} className="cursor-help text-red-500">⚠️</span>}
                                    </span>
                                    {verifiedEmail && (
                                        <div className="flex items-center gap-1.5">
                                            <span className={`text-[9px] font-medium ${syncStatus === 'synced' ? 'text-green-600' : syncStatus === 'syncing' ? 'text-yellow-600' : syncStatus === 'error' ? 'text-red-600' : 'text-gray-400'}`}>
                                                {syncStatus === 'synced' ? (lastSyncTime ? `동기화됨 (${lastSyncTime})` : '동기화됨') : syncStatus === 'syncing' ? '동기화 중' : syncStatus === 'error' ? '동기화 실패' : '대기'}
                                            </span>
                                            <div className={`w-2 h-2 rounded-full ${syncStatus === 'synced' ? 'bg-green-500' : syncStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' : syncStatus === 'error' ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                                        </div>
                                    )}
                                </div>
                                
                                {isLoadingCloud ? (
                                    <div className="py-2 text-center">
                                        <div className="inline-block w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-1"></div>
                                        <div className="text-[10px] text-indigo-600 font-medium">데이터 불러오는 중...</div>
                                    </div>
                                ) : !verifiedEmail ? (
                                    <button 
                                        onClick={handleLogin} 
                                        className="w-full py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-[11px] font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
                                    >
                                        <svg className="w-3 h-3" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                        </svg>
                                        Google로 로그인
                                    </button>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="text-[11px] font-bold text-gray-800 dark:text-gray-200 truncate mb-1">
                                            {userProfile?.full_name || verifiedEmail}
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            <button 
                                                onClick={() => setIsSettingsModalOpen(true)}
                                                className="w-full py-2.5 rounded-lg text-[11px] font-bold transition-all shadow-sm flex items-center justify-center gap-2 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-900/30 dark:text-sky-300 dark:hover:bg-sky-900/50 border border-sky-100 dark:border-sky-800"
                                            >
                                                ⚙️ 앱 설정 및 보안
                                            </button>
                                            {!isPro && (
                                                <button 
                                                    onClick={async () => {
                                                        const code = prompt('발급받은 후원 코드를 입력하세요:');
                                                        if (code) {
                                                            setIsLoadingCloud(true);
                                                            try {
                                                                const { data, error } = await withRetry(() => 
                                                                    supabase.rpc('redeem_code', { input_code: code.trim() })
                                                                );
                                                                if (error) throw error;
                                                                if (data) {
                                                                    addToast('🎉 후원 코드가 확인되었습니다! PRO 모드가 활성화됩니다.', 'success');
                                                                    const { data: { session } } = await withRetry(() => supabase.auth.getSession());
                                                                    if (session) checkSubscription(session, true);
                                                                } else {
                                                                    addToast('❌ 유효하지 않거나 이미 사용된 코드입니다.', 'error');
                                                                }
                                                            } catch (err) {
                                                                console.error('Redeem error:', err);
                                                                addToast('오류가 발생했습니다: ' + err.message, 'error');
                                                            } finally {
                                                                setIsLoadingCloud(false);
                                                            }
                                                        }
                                                    }}
                                                    className="w-full py-2.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-[11px] font-bold hover:bg-green-100 dark:hover:bg-green-900/50 transition-all shadow-sm border border-green-100 dark:border-green-800"
                                                >
                                                    🎫 후원 코드 등록
                                                </button>
                                            )}
                                            {isAdmin && (
                                                <button onClick={() => setIsAdminModalOpen(true)} className="w-full py-2.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-[11px] font-bold hover:bg-green-100 dark:hover:bg-green-900/50 transition-all shadow-sm border border-green-100 dark:border-green-800">
                                                    🛡️ 관리자 대시보드
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => setIsSuggestionModalOpen(true)} 
                                                className="w-full py-2.5 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg text-[11px] font-bold hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition-all shadow-sm border border-yellow-100 dark:border-yellow-800"
                                            >
                                                💡 기능 제안 / 버그 신고
                                            </button>
                                            <button onClick={() => handleLogout()} className="w-full py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 rounded-lg text-[11px] font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all shadow-sm">
                                                🚪 로그아웃
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white dark:bg-gray-900 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-1">
                                {sidebarSectorOrder.map((sector, sIdx) => (
                                    <div 
                                        key={sector.id} 
                                        draggable="true"
                                        onDragStart={(e) => handleSectorDragStart(e, sector.id)}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => handleSectorDrop(e, sector.id)}
                                        className={`p-1 rounded-xl transition-all ${sIdx !== 0 ? "mt-1 pt-2 border-t dark:border-gray-800" : ""} ${draggedSectorId === sector.id ? 'opacity-50 scale-95' : ''}`}
                                    >
                                        <div className={`px-2 mb-1.5 text-[10px] uppercase tracking-widest flex items-center justify-between group/hdr cursor-grab active:cursor-grabbing ${
                                            activeTab === sector.id ? 'font-black text-blue-600 dark:text-blue-400' : 'font-bold text-gray-600 dark:text-gray-400'
                                        }`}>
                                            {sector.label}
                                            <span className="opacity-0 group-hover/hdr:opacity-100 text-[8px] transition-opacity">⋮⋮</span>
                                        </div>
                                        <div className="space-y-0.5">
                                            {layoutOrder.filter(id => {
                                                if (!TAB_MAPPING[sector.id] || !TAB_MAPPING[sector.id].includes(id)) return false;
                                                if (id === 'scenario') return scenarios.length > 0;
                                                if (id === 'history') return assetHistory.length > 0;
                                                return true;
                                            }).map(id => {
                                                const isCurrentPanel = activePanel === id;
                                                const isSameTab = activeTab === sector.id;
                                                
                                                return (
                                                <button
                                                    key={id} 
                                                    draggable="true"
                                                    onDragStart={(e) => handlePanelDragStart(e, id)}
                                                    onDragOver={handlePanelDragOver}
                                                    onDrop={(e) => handlePanelDrop(e, id)}
                                                    onClick={() => {
                                                        setActiveTab(sector.id);
                                                        setTimeout(() => scrollToPanel(id), 50);
                                                    }} 
                                                    className={`w-full text-left px-2 py-1.5 text-xs rounded-lg transition-all flex items-center gap-2 group ${
                                                        draggedPanelId === id 
                                                        ? 'bg-blue-50 dark:bg-blue-900/40 opacity-50 border border-dashed border-blue-300' 
                                                        : (isCurrentPanel 
                                                            ? 'font-black text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 translate-x-1' 
                                                            : (isSameTab 
                                                                ? 'font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 opacity-100'
                                                            : 'font-normal text-gray-500 dark:text-gray-500 hover:text-blue-500'
                                                              )
                                                          )
                                                    }`}
                                                >
                                                    <span className={`w-1 h-3 rounded-full transition-all ${isCurrentPanel ? 'bg-blue-500 scale-y-110' : 'bg-transparent'}`}></span>
                                                    <span className={`transition-transform ${isCurrentPanel ? 'scale-110' : 'opacity-70'}`}>{navLabels[id]?.icon}</span>
                                                    <span className="truncate">{navLabels[id]?.title}</span>
                                                </button>
                                            );})}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* [추가] 배너 스와이프 영역 (AI 분석 / 가챠 게임) */}
                            <div className="mt-4 relative group">
                                {activeBanner === 'ai' ? (
                                    <div className="p-4 bg-gradient-to-br from-indigo-600 to-violet-600 dark:from-indigo-900 dark:to-violet-950 rounded-xl shadow-lg text-white relative overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]" onClick={handleOpenAIAnalysis}>
                                        <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-white opacity-10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                                        <div className="relative z-10 pb-2">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-2xl">🤖</span>
                                                <h3 className="font-bold text-lg">AI 자산 분석</h3>
                                            </div>
                                            <p className="text-indigo-100 text-xs leading-relaxed mb-3">
                                                현재 포트폴리오를 분석하고<br/>맞춤형 조언을 받아보세요.
                                            </p>
                                            <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors border border-white/10">
                                                분석 시작하기 →
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-gradient-to-br from-fuchsia-500 to-purple-600 dark:from-fuchsia-900 dark:to-purple-950 rounded-xl shadow-lg text-white relative overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]" onClick={() => setIsGameModalOpen(true)}>
                                        <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-white opacity-10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                                        <div className="relative z-10 pb-2">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-2xl">🎰</span>
                                                <h3 className="font-bold text-lg">내 노후 뽑기</h3>
                                            </div>
                                            <p className="text-fuchsia-100 text-xs leading-relaxed mb-3">
                                                내 저축률로 돌려보는<br/>노후 인생 가챠
                                            </p>
                                            <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors border border-white/10">
                                                가챠 돌리기 →
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* 하단 인디케이터 (점) */}
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 pointer-events-none">
                                    <div className={`w-1.5 h-1.5 rounded-full transition-colors ${activeBanner === 'ai' ? 'bg-white' : 'bg-white/40'}`}></div>
                                    <div className={`w-1.5 h-1.5 rounded-full transition-colors ${activeBanner === 'game' ? 'bg-white' : 'bg-white/40'}`}></div>
                                </div>

                                {/* 좌우 컨트롤 화살표 */}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setActiveBanner(prev => prev === 'ai' ? 'game' : 'ai'); }}
                                    className="absolute top-1/2 -left-3 -translate-y-1/2 p-1.5 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full shadow-md border border-gray-200 dark:border-gray-700 hover:text-blue-600 dark:hover:text-blue-400 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setActiveBanner(prev => prev === 'ai' ? 'game' : 'ai'); }}
                                    className="absolute top-1/2 -right-3 -translate-y-1/2 p-1.5 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full shadow-md border border-gray-200 dark:border-gray-700 hover:text-blue-600 dark:hover:text-blue-400 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                            </div>
                        </aside>

                        <div id="main-dashboard-panel" className={`flex-1 space-y-8 min-w-0 transition-all duration-700 relative z-10 ${editingPhase !== null ? 'p-4 sm:p-6 rounded-2xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-md ring-4 ring-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.15)]' : ''}`}>
                            {/* [개선] PDF 내보내기 시에는 사용자의 커스텀 순서가 아닌 표준 보고서 순서(입력->시각화->분석)로 출력 */}
                            {(isExporting ? [
                                'summary', 
                                ...TAB_MAPPING.input, 
                                ...TAB_MAPPING.visualization, 
                                ...TAB_MAPPING.analysis
                            ] : layoutOrder).map((panelId, index) => {
                                // [추가] 편집 모드 중에는 집중을 위해 무관한 패널 숨김 처리
                                if (editingPhase !== null) {
                                    if (!['summary', 'budget', 'assets', 'expenses'].includes(panelId)) return null;
                                } else {
                                    // [수정] PDF 내보내기 중이거나 '온보딩 가이드'가 실행 중일 때는 모든 패널을 렌더링함
                                    if (!isExporting && !isGuideOpen) {
                                        if (panelId === 'summary') { /* 항상 표시 */ }
                                        else if (activeTab && TAB_MAPPING[activeTab]) {
                                            if (!TAB_MAPPING[activeTab].includes(panelId)) return null;
                                        }
                                    }
                                }

                                const panelProps = { 
                                    key: panelId,
                                    id: panelId,
                                    moveUp: () => movePanel(panelId, -1),
                                    moveDown: () => movePanel(panelId, 1),
                                    isFirst: layoutOrder.indexOf(panelId) === 0,
                                    isLast: layoutOrder.indexOf(panelId) === layoutOrder.length - 1,
                                    isCollapsed: !!panelCollapseState[panelId],
                                    onToggle: () => togglePanelCollapse(panelId),
                                };

                                switch (panelId) {
                                    case 'summary':
                                        return <PanelWrapper {...panelProps} title="📊 요약 및 설정" className="bg-white dark:bg-gray-900 rounded-lg shadow">
    <SummaryPanel 
        calculation={calculation}
        isCalculating={isCalculating}
        projectionMonths={projectionMonths}
        baseMonth={baseMonth}
        displayMode={displayMode}
        monthlySalary={monthlySalary}
        setMonthlySalary={setMonthlySalary}
        baseDate={baseDate} setBaseDate={setBaseDate}
        salaryDay={salaryDay} setSalaryDay={setSalaryDay}
        onOpenDataManage={() => setIsDataManageModalOpen(true)}
        saveToPDF={saveToPDF}
        saveCurrentAsset={saveCurrentAsset}
        goalMode={goalMode}
        setGoalMode={setGoalMode}
        setGoalSeekResult={setGoalSeekResult}
        setProjectionMonths={setProjectionMonths}
        targetAmount={targetAmount}
        setTargetAmount={setTargetAmount}
        calculateGoalSeek={calculateGoalSeek}
        goalSeekResult={goalSeekResult}
        autoUpdateBaseDate={autoUpdateBaseDate}
        setAutoUpdateBaseDate={setAutoUpdateBaseDate}
        inflationRate={inflationRate}
        setInflationRate={setInflationRate}
        saveScenario={saveScenario}
        onOpenAI={handleOpenAIAnalysis}
        editingPhase={editingPhase}
        onOpenScreenshotModal={() => setIsScreenshotModalOpen(true)}
        enableLiveQuotes={enableLiveQuotes}
        setEnableLiveQuotes={setEnableLiveQuotes}
    />
    
    {calculation.warnings && calculation.warnings.length > 0 && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded shadow-sm">
            <h3 className="text-sm font-bold text-red-800 dark:text-red-400 mb-2 flex items-center gap-2">⚠️ 시뮬레이션 경고 ({calculation.warnings.length}건)</h3>
            <ul className="text-xs text-red-700 dark:text-red-300 list-disc list-inside space-y-1 max-h-40 overflow-y-auto">
                {calculation.warnings.map((w, i) => (
                    <li key={i}>[{w.month === '설정' ? '설정' : `${String(w.year).slice(2)}년 ${w.monthNum}월(${w.month}개월 뒤)`}] {w.message}</li>
                ))}
            </ul>
        </div>
    )}
</PanelWrapper>;
                                    case 'scenario': 
                                        return scenarios.length > 0 && (
                                            <PanelWrapper key={panelId} {...panelProps} title="🔀 시나리오 비교" className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow p-6">
                                                {renderScenarioPanel()}
                                            </PanelWrapper>
                                        );
                                    case 'charts':
                                        return (
                                            <PanelWrapper key={panelId} {...panelProps} title="🍩 포트폴리오 차트">
                                                {renderChartsPanel()}
                                            </PanelWrapper>
                                        );
                                    case 'history':
                                        return assetHistory.length > 0 && (
                                            <PanelWrapper key={panelId} {...panelProps} title="📈 자산 히스토리">
                                                {renderHistoryPanel()}
                                            </PanelWrapper>
                                        );
                                    case 'budget':
                                        return (
                                            <PanelWrapper key={panelId} {...panelProps} title="💰 월납입 예산 관리">
                                                {renderBudgetPanel()}
                                            </PanelWrapper>
                                        );
                                    case 'memo':
                                        return (
                                            <PanelWrapper key={panelId} {...panelProps} title="📝 메모">
                                                {renderMemoPanel()}
                                            </PanelWrapper>
                                        );
                                    case 'rebalance':
                                        return (
                                            <PanelWrapper key={panelId} {...panelProps} title="⚠️ 리밸런싱 설정">
                                                {renderRebalancePanel()}
                                            </PanelWrapper>
                                        );
                                    case 'assets':
                                        return (
                                            <PanelWrapper key={panelId} {...panelProps} title="🏦 자산 상세 입력">
                                                {renderAssetsPanel()}
                                            </PanelWrapper>
                                        );
                                    case 'expenses':
                                        return (
                                            <PanelWrapper key={panelId} {...panelProps} title="💸 월별 지출 관리">
                                                {renderExpensesPanel()}
                                            </PanelWrapper>
                                        );
                                    case 'events':
                                        return (
                                            <PanelWrapper key={panelId} {...panelProps} title="🎉 이벤트 관리">
                                                {renderEventsPanel()}
                                            </PanelWrapper>
                                        );
                                    case 'detail-analysis':
                                        return (
                                            <PanelWrapper key={panelId} {...panelProps} title="🔍 상세 분석">
                                                {renderDetailAnalysisPanel()}
                                            </PanelWrapper>
                                        );
                                    case 'assumptions':
                                        return (
                                            <PanelWrapper key={panelId} {...panelProps} title="💡 계산 가정사항" className="bg-sky-50 dark:bg-gray-900 rounded-lg shadow">
                                                {renderAssumptionsPanel()}
                                            </PanelWrapper>
                                        );
                                    default: return null;
                                }
                            })}
                            <div className="mt-12 pt-6 border-t dark:border-gray-800 text-center">
                                <button 
                                    onClick={() => setIsPrivacyModalOpen(true)} 
                                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:underline transition-colors"
                                >
                                    개인정보처리방침
                                </button>
                                <span className="mx-2 text-gray-300 dark:text-gray-700">|</span>
                                <span className="text-xs text-gray-400 dark:text-gray-600">© 2024 Asset Planner</span>
                            </div>
                        </div>

                        {/* ===== 모바일 버튼 ===== */}
                        <div className="sm:hidden flex flex-col gap-2">
                            <button onClick={saveToPDF} disabled={editingPhase !== null} className={`w-full py-3 rounded-lg font-medium transition-colors ${editingPhase !== null ? 'bg-blue-300 text-white/70 cursor-not-allowed' : 'bg-blue-600 text-white'}`}>
                                📄 PDF로 저장
                            </button>
                            <button onClick={saveScenario} disabled={editingPhase !== null} className={`w-full py-3 rounded-lg font-medium transition-colors ${editingPhase !== null ? 'bg-gray-400 text-white/70 cursor-not-allowed' : 'bg-gray-600 text-white'}`}>
                                💾 시나리오 저장
                            </button>
                        </div>
                    </div>
                    </div> {/* End of relative z-10 */}
                    {/* ===== 블로그 배너 ===== */}
                    {!isPro && (
                        <a href="https://blog.naver.com/zocdoc" target="_blank" rel="noopener noreferrer" title="블로그 방문하기" className="hidden sm:block fixed bottom-5 right-5 z-50 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110">
                            <img src="https://blogpfthumb-phinf.pstatic.net/MjAyMzExMDlfMTY2/MDAxNjk5NTM1OTEzNTY2.eBsibH7tHEJ5FeB3gSWJ3hGqz6mbgqM2TsSKS7c2QRog.CNgc4PQL7zumVLSD72sVI_EB6tsPO_Cwd_LKNj0MiyAg.JPEG.whrekrdl/161.jpg/161.jpg?type=w161" alt="네이버 블로그" className="w-10 h-10"/>
                        </a>
                    )}
                    {window.DataExportImportModal && (
                        <window.DataExportImportModal 
                            isOpen={isDataManageModalOpen} 
                            onClose={() => setIsDataManageModalOpen(false)} 
                            currentData={{ appData, scenarios, assetHistory, referenceScenarios }}
                            onImport={(data, type) => {
                                if (confirm(type === 'csv' ? 'CSV 데이터를 불러오시겠습니까? 현재 설정과 자산 목록이 CSV 내용으로 대체됩니다.' : '전체 데이터를 복구하시겠습니까? 현재 데이터가 모두 덮어씌워집니다.')) {
                                    if (type === 'csv') {
                                        // CSV는 appData의 일부 필드만 갱신
                                        if (data.appData) {
                                            setAppData(prev => ({ ...prev, ...data.appData }));
                                        }
                                    } else {
                                        // JSON 전체 복구
                                        if (data.appData) setAppData(data.appData);
                                        if (data.scenarios) setScenarios(data.scenarios);
                                        if (data.assetHistory) setAssetHistory(data.assetHistory);
                                        if (data.referenceScenarios) setReferenceScenarios(data.referenceScenarios);
                                    }
                                    addToast(type === 'csv' ? 'CSV 데이터가 적용되었습니다.' : '전체 데이터가 성공적으로 복구되었습니다!', 'success');
                                }
                            }}
                        />
                    )}
                    {window.PrivacyPolicyModal && <window.PrivacyPolicyModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} />}
                    {window.SuggestionModal && <window.SuggestionModal isOpen={isSuggestionModalOpen} onClose={() => setIsSuggestionModalOpen(false)} onSubmit={handleSuggestionSubmit} user={verifiedEmail} />}
                    {window.ProFeaturesModal && <window.ProFeaturesModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />}
                    
                    <button 
                        onClick={() => setIsQuickPanelOpen(true)}
                        className="sm:hidden fixed bottom-8 right-6 z-50 w-14 h-14 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 dark:border-gray-700 flex items-center justify-center transition-all active:scale-90"
                        aria-label="Quick Menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </button>

                    <div className="fixed bottom-6 left-6 z-[90] flex flex-col sm:flex-row items-start sm:items-end gap-3 pointer-events-none">
                        {calculation.warnings?.length > 0 && (
                            <div className="group relative pointer-events-auto">
                                <div className="absolute bottom-full left-0 pb-3 w-72 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto transform translate-y-2 group-hover:translate-y-0 duration-200">
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-red-100 dark:border-red-900/50 p-4 text-xs text-gray-700 dark:text-gray-300">
                                        <div className="font-bold text-red-600 dark:text-red-400 mb-2 border-b border-red-100 dark:border-red-900/50 pb-2 flex justify-between items-center">
                                            <span>⚠️ 발견된 문제점</span>
                                            <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[10px]">{calculation.warnings.length}건</span>
                                        </div>
                                        <ul className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                            {calculation.warnings.slice(0, 5).map((w, i) => (
                                                <li key={i} className="flex gap-2 items-start">
                                                    <span className="text-red-500 mt-0.5">•</span>
                                                    <span className="leading-relaxed"><span className="font-bold text-gray-900 dark:text-gray-100">[{w.month === '설정' ? '설정' : `${String(w.year).slice(2)}년 ${w.monthNum}월(${w.month}개월 뒤)`}]</span> {w.message}</span>
                                                </li>
                                            ))}
                                            {calculation.warnings.length > 5 && <li className="text-center text-gray-400 pt-1 italic">...외 {calculation.warnings.length - 5}건 더보기</li>}
                                        </ul>
                                    </div>
                                </div>
                                <button
                                    onClick={() => scrollToPanel('summary')}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 h-12 rounded-full shadow-lg flex items-center gap-2 transition-all hover:scale-105 animate-in slide-in-from-bottom-2"
                                >
                                    <svg className="w-5 h-5 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    <span className="text-sm font-bold">설정 주의 ({calculation.warnings.length})</span>
                                </button>
                            </div>
                        )}

                        {isAdmin && adminSuggestions.length > 0 && showSuggestionButton && (
                            <div className="group relative pointer-events-auto">
                                <div className="absolute bottom-full left-0 pb-3 w-80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto transform translate-y-2 group-hover:translate-y-0 duration-200">
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-purple-100 dark:border-purple-900/50 p-4 text-xs text-gray-700 dark:text-gray-300">
                                        <div className="font-bold text-purple-600 dark:text-purple-400 mb-2 border-b border-purple-100 dark:border-purple-900/50 pb-2 flex justify-between items-center">
                                            <span>📬 사용자 의견함</span>
                                            <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-[10px]">{adminSuggestions.length}건</span>
                                        </div>
                                        <ul className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                                            {adminSuggestions.map((s, i) => (
                                                <li key={i} className="flex flex-col gap-1 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                                                    <span className="font-bold text-gray-900 dark:text-gray-100 text-[10px]">{s.email}</span>
                                                    <span className="leading-relaxed whitespace-pre-wrap text-gray-600 dark:text-gray-300">{s.suggestions}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 h-12 rounded-full shadow-lg flex items-center gap-2 transition-all hover:scale-105 animate-in slide-in-from-bottom-2">
                                    <span className="text-lg">📬</span>
                                    <span className="text-sm font-bold">의견함 ({adminSuggestions.length})</span>
                                </button>
                            </div>
                        )}

                        {!isAdmin && showSuggestionButton && (
                            <button onClick={() => setIsSuggestionModalOpen(true)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 h-12 rounded-full shadow-lg flex items-center gap-2 transition-all hover:scale-105 animate-in slide-in-from-bottom-2 pointer-events-auto">
                                <span className="text-lg">💡</span>
                                <span className="text-sm font-bold hidden sm:inline">의견 보내기</span>
                            </button>
                        )}
                    </div>

                    {window.MobileQuickMenu && <window.MobileQuickMenu 
                        isOpen={isQuickPanelOpen}
                        onClose={() => setIsQuickPanelOpen(false)}
                        layoutOrder={layoutOrder.filter(id => {
                            // [일관성] 모바일 퀵 메뉴에서도 현재 탭의 항목만 노출
                            if (activeTab && TAB_MAPPING[activeTab]) return TAB_MAPPING[activeTab].includes(id);
                            return true;
                        })}
                        scenarios={scenarios}
                        assetHistory={assetHistory}
                        onNavigate={scrollToPanel}
                    />}

                    {window.OnboardingGuide && <window.OnboardingGuide 
                        isOpen={isGuideOpen} 
                        onClose={() => {
                            setIsGuideOpen(false);
                            localStorage.setItem('asset_planner_guide_completed', 'true');
                        }} 
                        scrollToPanel={scrollToPanel}
                        isPro={isPro}
                    />
                    }
                    {window.EncryptionModal && <window.EncryptionModal 
                        isOpen={isEncryptionModalOpen} 
                        onSelect={handleEncryptionSelect} 
                    />}
                    {window.PasswordPromptModal && <window.PasswordPromptModal 
                        isOpen={isPasswordPromptOpen} 
                        onConfirm={handlePasswordConfirm}
                        onCancel={() => { setIsPasswordPromptOpen(false); pendingCiphertext.current = null; setSyncStatus('error'); addToast('비밀번호 입력이 취소되었습니다. 로컬 데이터 모드로 동작합니다.', 'warning'); }}
                        onReset={handlePasswordReset}
                    />}
                    {window.SettingsModal && <window.SettingsModal 
                        isOpen={isSettingsModalOpen} 
                        onClose={() => setIsSettingsModalOpen(false)}
                        encryptionMode={encryptionMode}
                        onModeChange={handleModeChange}
                        darkMode={darkMode}
                        onThemeToggle={handleDarkModeToggle}
                        logoutBehavior={logoutBehavior}
                        onLogoutBehaviorChange={setLogoutBehavior}
                        onSyncNow={() => fetchFromCloud(verifiedEmail, isPro, false, true)}
                        onLogout={handleLogout}
                        dataConsent={userProfile?.data_consent}
                        onToggleConsent={toggleDataConsent}
                        isPro={isPro}
                        liveEnabled={livePriceEnabled}
                        onLiveEnabledChange={(val) => {
                            setLivePriceEnabled(val);
                            localStorage.setItem('toss_live_price_enabled', val ? 'true' : 'false');
                        }}
                        liveInterval={livePriceInterval}
                        onLiveIntervalChange={(val) => {
                            setLivePriceInterval(val);
                            localStorage.setItem('toss_live_price_interval', String(val));
                        }}
                        supabase={supabase}
                        userId={userProfile?.id}
                    />}
                    {showSaveToast && (
                        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[99999] bg-gray-900/90 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <span className="text-green-400 text-xl">✓</span>
                            <span className="text-sm font-bold tracking-tight">데이터가 안전하게 저장되었습니다!</span>
                        </div>
                    )}
                    <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 z-[99999] flex flex-col gap-2 pointer-events-none">
                        {window.Toast && toasts.map(toast => (
                            <window.Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
                        ))}
                    </div>
                    {window.IconPickerModal && <window.IconPickerModal 
                        isOpen={!!iconPickerState} 
                        onClose={() => setIconPickerState(null)} 
                        onSelect={(icon) => { updateAsset(iconPickerState.sector, iconPickerState.index, 'icon', icon); setIconPickerState(null); }}
                        currentIcon={iconPickerState ? assets[iconPickerState.sector][iconPickerState.index].icon : null}
                    />}
                    {window.ApiKeyModal && <window.ApiKeyModal 
                        isOpen={isApiKeyModalOpen} 
                        onClose={() => setIsApiKeyModalOpen(false)} 
                    />}
                    {window.AIAnalysisModal && <window.AIAnalysisModal 
                        isOpen={isAIModalOpen} 
                        onClose={() => setIsAIModalOpen(false)} 
                        appData={appData} 
                        calculation={calculation} 
                        assetHistory={assetHistory}
                        onApplyProposal={handleApplyAIProposal}
                    />}
                    {window.ScreenshotImportModal && <window.ScreenshotImportModal 
                        isOpen={isScreenshotModalOpen} 
                        onClose={() => setIsScreenshotModalOpen(false)} 
                        appData={appData} 
                        setAppData={setAppData} 
                        addToast={addToast} 
                    />}
                    {window.HistoryActionModal && <window.HistoryActionModal 
                        isOpen={isHistoryActionModalOpen}
                        onClose={() => { setIsHistoryActionModalOpen(false); setPendingHistoryData(null); }}
                        date={pendingHistoryData?.date}
                        onAction={confirmHistoryAction}
                    />}
                    {window.AdminDashboardModal && <window.AdminDashboardModal 
                        isOpen={isAdminModalOpen}
                        onClose={() => setIsAdminModalOpen(false)}
                        supabase={supabase}
                        showSuggestionButton={showSuggestionButton}
                        onToggleSuggestionButton={setShowSuggestionButton}
                    />}
                    {window.DataConsentModal && <window.DataConsentModal
                        isOpen={isConsentModalOpen}
                        onClose={() => setIsConsentModalOpen(false)}
                        onConfirm={handleConsent}
                    />}
                    {window.DiffModal && <window.DiffModal 
                        isOpen={isDiffModalOpen}
                        onClose={() => setIsDiffModalOpen(false)}
                        currentData={diffData?.currentData}
                        proposalData={diffData?.proposalData}
                        onConfirm={handleConfirmDiff}
                    />}
                    {window.RetirementGachaModal && <window.RetirementGachaModal 
                        isOpen={isGameModalOpen}
                        onClose={() => setIsGameModalOpen(false)}
                        savingsRate={monthlySalary > 0 ? ((totalSectorMonthlyContrib + autoDepositAmount) / monthlySalary * 100) : 0}
                    />}
                    {window.StockLinkModal && stockLinkState && (
                        <window.StockLinkModal
                            isOpen={!!stockLinkState}
                            onClose={() => setStockLinkState(null)}
                            asset={stockLinkState.asset}
                            onSave={(updatedData) => updateAssetWithLinked(stockLinkState.sectorKey, stockLinkState.index, updatedData)}
                        />
                    )}
                    {scenarioToExport && window.DataExportImportModal && (
                        <window.DataExportImportModal 
                            isOpen={!!scenarioToExport} 
                            onClose={() => setScenarioToExport(null)} 
                            currentData={{ appData: { assets: scenarioToExport.data.assets } }}
                            initialMode="export"
                            isExportOnly={true}
                            customTitle={`💾 '${scenarioToExport.name}' 자산 내보내기`}
                            customDescription={(format) => format === 'json'
                                ? "해당 시나리오의 자산 상세 입력 데이터만 포함된 압축 코드입니다."
                                : "해당 시나리오의 자산 상세 입력 데이터를 엑셀에서 열 수 있는 CSV 형식으로 변환했습니다."}
                        />
                    )}
                    </div>
            );
        };
        // ScenarioCompare component has been moved to src/components/ScenarioComponents.jsx
        
        const AssetRow = React.memo(({ 
            sectorKey, 
            index, 
            asset, 
            updateAsset, 
            removeAsset, 
            accountOptions, 
            sectorInfo,
            sectorTotal,
            rgb,
            itemRec,
            displayMode
        }) => {
            const assetPercentage = (Number(asset.amount || 0) / sectorTotal) * 100;
            const amountBgStyle = { backgroundImage: `linear-gradient(to right, rgba(${rgb}, 0.15) ${assetPercentage}%, transparent ${assetPercentage}%)` };

            return (
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-3" role="group" aria-label={`${asset.name} 입력 행`}>
                    <div className="flex-1">
                    {sectorKey !== 'loan' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_1.8fr_0.5fr_0.5fr_1.2fr_min-content] gap-3 items-center">
                            <input type="text" placeholder="항목명" aria-label="항목명" className="border rounded px-2 py-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" value={asset.name} onChange={(e) => updateAsset(sectorKey, index, 'name', e.target.value)} />
                            <div>
                                <div className="flex justify-between items-center sm:hidden mb-1">
                                    <label className="text-xs text-gray-500 dark:text-gray-200">현재금액</label>
                                </div>
                                <div className="flex items-center gap-1">
                                    <CalculatorInput aria-label="현재금액" readOnly={asset.linkedItems?.length > 0} style={amountBgStyle} className={`w-full border rounded px-2 py-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white ${asset.linkedItems?.length > 0 ? 'opacity-80' : ''}`} value={asset.amount} onChange={(e) => updateAsset(sectorKey, index, 'amount', e.target.value)} displayMode={displayMode} />
                                    <button onClick={() => setStockLinkState({ sectorKey, index, asset })} className={`p-1.5 rounded flex-shrink-0 ${asset.linkedItems?.length > 0 ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300' : 'bg-gray-100 text-gray-400 hover:bg-indigo-50 hover:text-indigo-500'}`} title="실시간 주식/코인 연동">🔗</button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-200 sm:hidden">월납입 / 출처</label>
                                <div className="flex gap-0 shadow-sm rounded-md">
                                    <div className="relative flex-1">
                                        <CalculatorInput 
                                            aria-label="월납입액" 
                                            className="w-full border rounded-l px-2 py-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:z-10" 
                                            value={asset.monthlyContrib} 
                                            onChange={(e) => updateAsset(sectorKey, index, 'monthlyContrib', e.target.value)} 
                                            displayMode={displayMode} 
                                        />
                                        {itemRec > 0 && (
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-blue-500 dark:text-blue-400 pointer-events-none font-medium z-20">
                                                권장: {Math.round(itemRec).toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                    <select 
                                        aria-label="납입 출처 계좌" 
                                        className="w-24 border-y border-r rounded-r border-l-0 px-1 py-1 text-xs bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white truncate focus:z-10" 
                                        value={asset.monthlyContributionFrom || window.MONTHLY_INCOME_SOURCE} 
                                        onChange={(e) => updateAsset(sectorKey, index, 'monthlyContributionFrom', e.target.value)}
                                        title="납입 출처"
                                    >
                                        <option value={window.MONTHLY_INCOME_SOURCE}>{window.MONTHLY_INCOME_SOURCE}</option>
                                        {accountOptions.filter(name => name !== asset.name).map((name, i) => (
                                            <option key={i} value={name}>{name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-200 sm:hidden">수익률(%)</label>
                                <input type="number" step="0.1" aria-label="수익률" className="w-full border rounded px-2 py-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" value={asset.rate} onChange={(e) => updateAsset(sectorKey, index, 'rate', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-200 sm:hidden">수수료/세금(%)</label>
                                <input type="number" step="0.001" aria-label="수수료 및 세금" className="w-full border rounded px-2 py-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" value={asset.feeRate ?? 0} onChange={(e) => updateAsset(sectorKey, index, 'feeRate', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-200 sm:hidden">메모</label>
                                <input type="text" placeholder="메모" aria-label="메모" className="w-full border rounded px-2 py-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-xs" value={asset.memo || ''} onChange={(e) => updateAsset(sectorKey, index, 'memo', e.target.value)} />
                            </div>
                            <button onClick={() => removeAsset(sectorKey, index)} aria-label={`${asset.name} 삭제`} className="text-red-500 hover:text-red-700 whitespace-nowrap">삭제</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_1.8fr_0.5fr_0.5fr_0.7fr_0.8fr_1.2fr_min-content] gap-2 items-center">
                            <input type="text" placeholder="항목명" aria-label="대출명" className="w-full border rounded px-1 py-1 text-xs bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" value={asset.name} onChange={(e) => updateAsset(sectorKey, index, 'name', e.target.value)} />
                            <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-200 sm:hidden">현재잔액</label>
                                <CalculatorInput aria-label="대출 잔액" style={amountBgStyle} className="w-full border rounded px-1 py-1 text-xs bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" value={asset.amount} onChange={(e) => updateAsset(sectorKey, index, 'amount', e.target.value)} displayMode={displayMode} />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-200 sm:hidden">월 상환액 / 계좌</label>
                                <div className="flex gap-0 shadow-sm rounded-md">
                                    <CalculatorInput aria-label="월 상환액" placeholder="0=자동" className="flex-1 border rounded-l px-2 py-1 text-xs bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-right focus:z-10" value={asset.monthlyContrib} onChange={(e) => updateAsset(sectorKey, index, 'monthlyContrib', e.target.value)} displayMode={displayMode} />
                                    <select aria-label="상환 출금 계좌" className="w-24 border-y border-r rounded-r border-l-0 px-1 py-1 text-xs bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white truncate focus:z-10" value={asset.repaymentAccount} onChange={(e) => updateAsset(sectorKey, index, 'repaymentAccount', e.target.value)} title="상환 계좌">
                                        <option value="salary">월급</option>
                                        {accountOptions.filter(name => name !== asset.name).map((name, i) => (
                                            <option key={i} value={name}>{name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-200 sm:hidden">이자율(%)</label>
                                <input type="number" step="0.1" aria-label="대출 이자율" className="w-full border rounded px-1 py-1 text-xs bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-right" value={asset.rate} onChange={(e) => updateAsset(sectorKey, index, 'rate', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-200 sm:hidden">만기(개월)</label>
                                <input type="number" aria-label="대출 만기 개월 수" className="w-full border rounded px-1 py-1 text-xs bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-right" value={asset.maturityMonth ?? 12} onChange={(e) => updateAsset(sectorKey, index, 'maturityMonth', e.target.value)} />
                            </div>
                            <input type="month" aria-label="대출 시작월" className="w-full border rounded px-1 py-1 text-xs bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" value={asset.loanStartDate ? asset.loanStartDate.slice(0, 7) : ''} onChange={(e) => updateAsset(sectorKey, index, 'loanStartDate', e.target.value)} />
                            <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-200 sm:hidden">상환 방식</label>
                                <select aria-label="상환 방식" className="w-full border rounded px-1 py-1 text-xs bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white p-0" value={asset.repaymentMethod || '원리금균등'} onChange={(e) => updateAsset(sectorKey, index, 'repaymentMethod', e.target.value)}>
                                    <option value="원리금균등">원리금균등</option>
                                    <option value="원금균등">원금균등</option>
                                    <option value="만기일시">만기일시</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-200 sm:hidden">메모</label>
                                <input type="text" placeholder="메모" aria-label="메모" className="w-full border rounded px-1 py-1 text-xs bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" value={asset.memo || ''} onChange={(e) => updateAsset(sectorKey, index, 'memo', e.target.value)} />
                            </div>
                            <button onClick={() => removeAsset(sectorKey, index)} aria-label={`${asset.name} 삭제`} className="text-red-500 hover:text-red-700 whitespace-nowrap">삭제</button>
                        </div>
                    )}
                    </div>
                </div>
            );
        });

        const ErrorBoundary = window.ErrorBoundary || React.Fragment;


export default AssetDashboard;