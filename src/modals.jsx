import React from 'react';
// modals.js - 모달 및 가이드 컴포넌트 모음
const { useState, useMemo, useEffect, useRef } = React;

// 중위값 계산 헬퍼 함수
const calculateMedian = (arr) => {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

window.TooltipGuide = ({ tip }) => (
    <span className="group relative inline-block ml-1 align-middle">
        <svg className="w-4 h-4 text-gray-400 cursor-help hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-56 p-2.5 bg-gray-800/95 backdrop-blur text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center leading-relaxed border border-gray-700 font-normal block">
            {tip}
            <span className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800/95"></span>
        </span>
    </span>
);

window.Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-gray-800'
    };

    return (
        <div className={`${colors[type] || colors.info} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] animate-toast pointer-events-auto mb-2`}>
            <span>{type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️'}</span>
            <span className="flex-1 text-sm font-medium">{message}</span>
            <button onClick={onClose} className="opacity-70 hover:opacity-100">✕</button>
        </div>
    );
};

window.HistoryActionModal = ({ isOpen, onClose, date, onAction }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[120] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in duration-300">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">📅 {date} 데이터 불러오기</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    과거 데이터를 어떻게 불러오시겠습니까?<br/>
                    <span className="text-xs text-red-500">* 현재의 자산 히스토리와 시나리오 목록은 유지됩니다.</span>
                </p>
                <div className="space-y-3">
                    <button onClick={() => onAction('view')} className="w-full p-4 text-left border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
                        <div className="font-bold text-blue-600 dark:text-blue-400 mb-1">1. 단순 조회 (View Only)</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">자동 저장이 차단됩니다. 데이터를 확인만 하고 싶을 때 선택하세요.</div>
                    </button>
                    <button onClick={() => onAction('restore')} className="w-full p-4 text-left border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
                        <div className="font-bold text-green-600 dark:text-green-400 mb-1">2. 오늘 데이터로 복구</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">이 시점의 자산 상태를 오늘 날짜의 데이터로 덮어씁니다.</div>
                    </button>
                </div>
                <button onClick={onClose} className="w-full mt-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 text-sm">취소</button>
            </div>
        </div>
    );
};

window.PrivacyPolicyModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">개인정보처리방침</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6 overflow-y-auto text-sm text-gray-700 dark:text-gray-300 space-y-4">
                    <p><strong>1. 개인정보의 처리 목적</strong><br/>
                    '자산 플래너'(이하 '서비스')는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.<br/>
                    - 서비스 제공 및 콘텐츠 이용: 자산 시뮬레이션 데이터 저장 및 동기화 (선택 사항)<br/>
                    - 통계 작성 및 서비스 개선: 접속 빈도 파악, 서비스 이용 통계, 익명화된 자산 데이터 분석</p>

                    <p><strong>2. 처리하는 개인정보의 항목</strong><br/>
                    서비스는 기본적인 기능 이용 시 별도의 개인정보를 수집하지 않으며, 모든 데이터는 사용자의 브라우저(Local Storage)에 저장됩니다.<br/>
                    단, '클라우드 동기화(PRO)' 기능을 사용하는 경우에 한하여 다음의 정보가 수집될 수 있습니다.<br/>
                    - 필수항목: 이메일 주소, 프로필 이미지, 이름 (Google 로그인 시 제공되는 정보)<br/>
                    - 수집방법: Google OAuth 2.0 연동</p>

                    <p><strong>3. 개인정보의 처리 및 보유 기간</strong><br/>
                    서비스는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.<br/>
                    - 회원 탈퇴 시 즉시 파기</p>

                    <p><strong>4. 쿠키(Cookie)의 운용 및 거부</strong><br/>
                    서비스는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 이용정보를 저장하고 수시로 불러오는 '쿠키(cookie)'를 사용합니다.</p>

                    <p><strong>5. 가명/익명 정보의 처리</strong><br/>
                    서비스는 통계 작성, 과학적 연구, 공익적 기록 보존 등을 위하여 수집한 개인정보를 특정 개인을 알아볼 수 없도록 가명/익명 처리하여 활용할 수 있습니다.<br/>
                    - 가명/익명 정보는 개인정보와 분리하여 별도로 저장·관리합니다.</p>
                </div>
                <div className="p-6 border-t dark:border-gray-700 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">닫기</button>
                </div>
            </div>
        </div>
    );
};

window.SuggestionModal = ({ isOpen, onClose, onSubmit, user }) => {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    if (!isOpen) return null;

    // [추가] 로그인 상태 체크: 로그인이 안 되어 있으면 입력 폼 대신 안내 메시지 표시
    if (!user) {
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 animate-in zoom-in duration-200 text-center">
                    <div className="text-5xl mb-4">🔒</div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">로그인이 필요합니다</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">소중한 의견을 보내주시려면 로그인이 필요합니다.<br/>설정(⚙️) 메뉴에서 로그인 후 이용해주세요.</p>
                    <button onClick={onClose} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">확인</button>
                </div>
            </div>
        );
    }

    const handleSubmit = async () => {
        if (!content.trim()) return alert('내용을 입력해주세요.');
        setIsSubmitting(true);
        await onSubmit(content);
        setIsSubmitting(false);
        setContent('');
        onClose();
    };
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">💡 기능 제안 및 의견 보내기</h3>
                <textarea className="w-full h-32 p-3 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md mb-4 resize-none focus:ring-2 focus:ring-blue-500 outline-none" placeholder="어떤 기능이 필요하신가요? 자유롭게 의견을 남겨주세요." value={content} onChange={(e) => setContent(e.target.value)} />
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 rounded">취소</button>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">{isSubmitting ? '전송 중...' : '보내기'}</button>
                </div>
            </div>
        </div>
    );
};

window.EncryptionModal = ({ isOpen, onSelect }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
                <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">🔐 데이터 보안 방식 선택</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">PRO 사용자를 위한 클라우드 데이터 암호화 방식을 선택해주세요.</p>
                    <div className="space-y-4">
                        <button onClick={() => onSelect('secure')} className="w-full text-left p-5 border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:border-blue-600 transition-all group">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-blue-700 dark:text-blue-400">보안 모드 (종단간 암호화)</span>
                                <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">Secure</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">사용자가 입력한 비밀번호로 직접 암호화 키를 생성합니다. 서버에는 비밀번호가 저장되지 않아 개발자도 절대 데이터를 열어볼 수 없지만, 분실 시 복구가 불가능합니다.</p>
                        </button>
                        <button onClick={() => onSelect('normal')} className="w-full text-left p-5 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-gray-300 dark:hover:border-gray-600 transition-all">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-gray-800 dark:text-gray-200">일반 모드</span>
                                <span className="text-xs bg-gray-500 text-white px-2 py-0.5 rounded-full">Normal</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">기기/계정 ID를 기반으로 자동 암호화합니다. 편리하지만 이론적으로 개발자가 접근할 수 있습니다.</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

window.PasswordPromptModal = ({ isOpen, onConfirm, onCancel, onReset }) => {
    const [password, setPassword] = useState('');
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in duration-300">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🔑 보안 비밀번호 입력</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">입력하신 비밀번호는 브라우저 내에서 암호화 키 생성에만 사용되며 서버에 전송되거나 저장되지 않습니다.</p>
                <input type="password" className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3 mb-6 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="비밀번호 입력" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onConfirm(password)} autoFocus />
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-3 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">취소</button>
                    <button onClick={() => onConfirm(password)} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">확인</button>
                </div>
                {onReset && (
                    <div className="mt-4 text-center border-t dark:border-gray-700 pt-3">
                        <button onClick={onReset} className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 underline transition-colors">비밀번호를 잊으셨나요? (로컬 데이터로 복구)</button>
                    </div>
                )}
            </div>
        </div>
    );
};

window.ProFeaturesModal = ({ isOpen, onClose }) => {
    const [showQR, setShowQR] = useState(false);

    // 모달이 열릴 때마다 QR 상태 초기화
    useEffect(() => {
        if (isOpen) setShowQR(false);
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSponsor = () => {
        const url = 'https://qr.kakaopay.com/FGJxu28x73b600069';
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) window.location.href = url;
        else setShowQR(true);
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">PRO 기능 안내</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-4 py-2">기능</th>
                                <th className="px-4 py-2 text-center">FREE</th>
                                <th className="px-4 py-2 text-center text-blue-600 dark:text-blue-400">PRO</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-700">
                            <tr>
                                <td className="px-4 py-3 dark:text-gray-300">데이터 저장</td>
                                <td className="px-4 py-3 text-center text-gray-900 dark:text-gray-300">1개 (최신)</td>
                                <td className="px-4 py-3 text-center font-semibold dark:text-white">무제한 (날짜별)</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 dark:text-gray-300">시나리오 저장</td>
                                <td className="px-4 py-3 text-center text-gray-900 dark:text-gray-300">무제한</td>
                                <td className="px-4 py-3 text-center font-semibold dark:text-white">무제한</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 dark:text-gray-300">차트 및 분석</td>
                                <td className="px-4 py-3 text-center text-gray-500">기본</td>
                                <td className="px-4 py-3 text-center font-semibold dark:text-white">심화 (비교 및 불러오기)</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 dark:text-gray-300">보안 기능</td>
                                <td className="px-4 py-3 text-center text-gray-500">일반</td>
                                <td className="px-4 py-3 text-center font-semibold dark:text-white">강화 모드 지원</td>
                            </tr>
                        </tbody>
                    </table>
                    {showQR ? (
                        <div className="mt-6 text-center animate-in zoom-in duration-300 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 font-bold">휴대폰으로 QR을 스캔해주세요</p>
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent('https://qr.kakaopay.com/FGJxu28x73b600069')}`} alt="카카오페이 후원 QR" className="mx-auto rounded-lg shadow-md mb-3" />
                            <button onClick={() => setShowQR(false)} className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 underline">돌아가기</button>
                        </div>
                    ) : (
                        <button onClick={handleSponsor} className="w-full mt-6 py-3 bg-yellow-400 text-black rounded-lg font-bold hover:bg-yellow-500 transition-colors shadow-md flex items-center justify-center gap-2">
                            <span>🎁</span> 개발자 후원하고 PRO 활성화하기
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

window.OnboardingGuide = ({ isOpen, onClose }) => {
    const { useEffect } = React;

    useEffect(() => {
        if (isOpen) {
            // 이미 드라이버가 실행 중인지 확인 (중복 실행 방지)
            if (document.querySelector('.driver-active')) return;

            const isMobile = window.innerWidth < 640;
            const steps = (window.ONBOARDING_STEPS || []).map(step => {
                let targetId = step.id;
                // 모바일 대응: 헤더 액션이 햄버거 메뉴로 숨겨져 있을 경우 타겟 변경
                if (isMobile && step.id === 'header-actions') {
                    targetId = 'mobile-menu-trigger';
                }
                
                // 요소가 화면에 실제로 존재하는지 확인 (사용자가 패널 순서를 바꿨거나 숨겼을 수 있음)
                const el = document.getElementById(targetId);
                if (!el) return null;

                return {
                    element: `#${targetId}`,
                    popover: {
                        title: step.title,
                        description: step.content,
                        side: "bottom",
                        align: 'start'
                    }
                };
            }).filter(Boolean); // 존재하지 않는 요소의 단계는 제외

            const driverObj = window.driver.js.driver({
                steps: steps, // [수정] setSteps 대신 설정 객체에 직접 주입
                showProgress: true,
                animate: true,
                allowClose: true,
                doneBtnText: '시작하기',
                nextBtnText: '다음',
                prevBtnText: '이전',
                progressText: '{{current}} / {{total}}',
                onDestroyed: () => {
                    onClose(); // 투어가 끝나거나 닫힐 때 상태 업데이트
                }
            });

            driverObj.drive();
        }
    }, [isOpen, onClose]);

    return null; // Driver.js가 DOM을 직접 제어하므로 React 렌더링은 불필요
};

window.SettingsModal = ({ 
    isOpen, onClose, encryptionMode, onModeChange, 
    darkMode, onThemeToggle, logoutBehavior, onLogoutBehaviorChange,
    onSyncNow, onLogout,
    dataConsent, onToggleConsent,
    isPro
}) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">⚙️ 앱 설정</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">✕</button>
                </div>
                <div className="p-6 space-y-6">
                    {/* 보안 설정 */}
                    <section>
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider">🔐 데이터 보안 (종단간 암호화)</h4>
                            {!isPro && <span className="text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-500 px-1.5 py-0.5 rounded">PRO 전용</span>}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => onModeChange('normal')} className={`p-3 rounded-xl border-2 transition-all text-left ${encryptionMode === 'normal' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-100 dark:border-gray-700'}`}>
                                <div className="text-sm font-bold dark:text-white">일반 모드</div>
                                <div className="text-[10px] text-gray-500">일반 암호화</div>
                            </button>
                            <button onClick={() => onModeChange('secure')} className={`p-3 rounded-xl border-2 transition-all text-left ${encryptionMode === 'secure' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-100 dark:border-gray-700'}`}>
                                <div className="text-sm font-bold dark:text-white">강화 모드</div>
                                <div className="text-[10px] text-gray-500">{!isPro ? '🔒 잠김' : '비밀번호 기반 암호화'}</div>
                            </button>
                        </div>
                    </section>
                    {/* 테마 설정 */}
                    <section>
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider">🎨 화면 테마</h4>
                            {!isPro && <span className="text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-500 px-1.5 py-0.5 rounded">PRO 전용</span>}
                        </div>
                        <button onClick={onThemeToggle} className="w-full p-3 rounded-xl border-2 border-gray-100 dark:border-gray-700 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <span className="text-sm font-medium dark:text-white">{darkMode ? '🌙 다크 모드 사용 중 (데모)' : '☀️ 라이트 모드 사용 중'}</span>
                            <span className="text-xs text-indigo-600 font-bold">{!isPro ? '🔒 잠김' : '변경하기'}</span>
                        </button>
                    </section>
                    {/* 개인정보 설정 */}
                    <section>
                        <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-3">👤 개인정보 설정</h4>
                        <div className="flex justify-between items-center p-3 rounded-xl border-2 border-gray-100 dark:border-gray-700">
                            <div>
                                <span className="text-sm font-medium dark:text-white block">데이터 익명 활용 동의</span>
                                <span className="text-[10px] text-gray-500">통계 서비스 제공을 위해 익명화된 자산 데이터를 활용합니다.</span>
                            </div>
                            <input type="checkbox" checked={!!dataConsent} onChange={(e) => onToggleConsent(e.target.checked)} className="w-5 h-5 accent-indigo-600 cursor-pointer" />
                        </div>
                    </section>
                    {/* 로그아웃 정책 */}
                    <section>
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider">🚪 로그아웃 시 데이터 처리</h4>
                            {!isPro && <span className="text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-500 px-1.5 py-0.5 rounded">PRO 전용</span>}
                        </div>
                        <div className={`flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl ${!isPro ? 'opacity-50 pointer-events-none' : ''}`}>
                            <button onClick={() => isPro && onLogoutBehaviorChange('keep')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${logoutBehavior === 'keep' ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm' : 'text-gray-500'}`}>로컬 데이터 유지</button>
                            <button onClick={() => isPro && onLogoutBehaviorChange('reset')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${logoutBehavior === 'reset' ? 'bg-white dark:bg-gray-700 text-red-600 shadow-sm' : 'text-gray-500'}`}>데이터 즉시 삭제</button>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2 px-1">
                            {logoutBehavior === 'keep' ? '로그아웃 후에도 이 브라우저에 자산 데이터가 남습니다.' : '로그아웃 시 보안을 위해 브라우저의 모든 데이터를 초기화합니다.'}
                        </p>
                    </section>
                    {/* 동기화 및 로그아웃 */}
                    <div className="pt-4 border-t dark:border-gray-700 space-y-2">
                        <button 
                            onClick={() => {
                                onClose();
                                if (window.showApiKeyModal) window.showApiKeyModal();
                            }}
                            className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-md transition-all flex items-center justify-center gap-1.5"
                        >
                            🔑 API 키 및 연동 설정
                        </button>
                        <button 
                            onClick={() => { onSyncNow(); onClose(); }}
                            className="w-full py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors"
                        >
                            🔄 지금 클라우드와 동기화
                        </button>
                        <button 
                            onClick={() => { onLogout(); onClose(); }}
                            className="w-full py-3 text-red-500 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                        >
                            🚪 로그아웃
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

window.MobileQuickMenu = ({ isOpen, onClose, layoutOrder, scenarios, assetHistory, onNavigate }) => {
    if (!isOpen) return null;
    const navLabels = window.navLabels || {};
    
    return (
        <div className="sm:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 w-full rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">메뉴 바로가기</h3>
                    <button onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {layoutOrder.filter(id => {
                        if (!navLabels[id]) return false;
                        if (id === 'scenario') return scenarios.length > 0;
                        if (id === 'history') return assetHistory.length > 0;
                        return true;
                    }).map(id => (
                        <button 
                            key={id} 
                            onClick={() => { onNavigate(id); onClose(); }}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <span className="text-2xl">{navLabels[id]?.icon}</span>
                            <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 text-center">{navLabels[id]?.title}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

window.StockLinkModal = ({ isOpen, onClose, asset, onSave }) => {
    const [baseAmount, setBaseAmount] = useState(0);
    const [linkedItems, setLinkedItems] = useState([]);
    const [fxRate, setFxRate] = useState(() => Number(localStorage.getItem('asset_last_usd_krw')) || 1420); // 캐시 우선
    const [isInitialSyncing, setIsInitialSyncing] = useState(false); // [추가] 초기 동기화와 버튼 로딩 분리
    const [isLoading, setIsLoading] = useState(false);
    const [editingCell, setEditingCell] = useState(null); // [추가] { index, field } 인라인 편집 셀 추적
    const [sortField, setSortField] = useState('name'); 
    const [sortDirection, setSortDirection] = useState('asc');
    const [ocrPendingData, setOcrPendingData] = useState(null);
    const [duplicateActions, setDuplicateActions] = useState({});
    
    const [draftTicker, setDraftTicker] = useState('');
    const [draftShares, setDraftShares] = useState('');
    const [draftAvgPrice, setDraftAvgPrice] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // 스크린샷 자산 연동 관련 상태 추가
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('asset_gemini_api_key') || '');
    const [showKeyInput, setShowKeyInput] = useState(() => !localStorage.getItem('asset_gemini_api_key'));
    const [ocrImage, setOcrImage] = useState(null);
    const [ocrImagePreview, setOcrImagePreview] = useState(null);
    const [ocrLoading, setOcrLoading] = useState(false);
    const [ocrError, setOcrError] = useState('');

    useEffect(() => {
        if (!isOpen || !asset) return;
        setApiKey(localStorage.getItem('asset_gemini_api_key') || '');
        // 데이터 초기화
        setBaseAmount(asset.baseAmount !== undefined ? asset.baseAmount : (asset.amount || 0));
        setLinkedItems(Array.isArray(asset.linkedItems) ? asset.linkedItems : []);
        
        const initFetch = async () => {
            setIsInitialSyncing(true); // [수정] 입력창을 막지 않는 초기 동기화 상태 사용
            try {
                /*
                const symbolsToFetch = new Set(['KRW=X', 'USD/KRW']);
                const currentItems = Array.isArray(asset.linkedItems) ? asset.linkedItems : [];
                
                currentItems.forEach(item => {
                    if (item.autoUpdate !== false && item.ticker) {
                        const t = item.ticker.toUpperCase().trim();
                        if (/^\d{6}$/.test(t)) {
                            symbolsToFetch.add(`${t}.KS`);
                            symbolsToFetch.add(`${t}.KQ`);
                        } else {
                            symbolsToFetch.add(t);
                        }
                    }
                });

                let quotes = await window.fetchYahooQuotes(Array.from(symbolsToFetch));
                const fxRateData = quotes['KRW=X'] || quotes['USD/KRW'] || quotes['USDKRW=X'];

                if (fxRateData?.price) {
                    const newRate = fxRateData.price;
                    setFxRate(newRate);
                    localStorage.setItem('asset_last_usd_krw', newRate.toString());
                }

                if (currentItems.length > 0) {
                    setLinkedItems(prev => prev.map(item => {
                        if (item.autoUpdate !== false) {
                            const t = item.ticker.toUpperCase().trim();
                            // 정확한 매칭 또는 접미사가 붙은 매칭 확인
                            const q = quotes[t] || quotes[`${t}.KS`] || quotes[`${t}.KQ`];
                            if (q?.price) {
                                return { 
                                    ...item, 
                                    currentPrice: q.price, 
                                    currency: q.currency || item.currency, 
                                    name: (q.name && q.name !== q.symbol && !q.name.endsWith('.KS') && !q.name.endsWith('.KQ')) ? q.name : item.name,
                                    ticker: q.symbol || item.ticker // 실제 조회된 티커로 업데이트(.KS 등)
                                };
                            }
                        }
                        return item;
                    }));
                }
                */
            } catch (err) { 
                console.error("StockLink Init Fetch Error:", err);
                // 에러 발생 시 사용자 알림 (선택 사항)
            } finally { setIsInitialSyncing(false); }
        };
        initFetch();
    }, [isOpen, asset]);

    // 글로벌 paste 붙여넣기 이벤트 바인딩
    useEffect(() => {
        if (!isOpen) return;
        const handleGlobalPaste = (e) => {
            if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
                return;
            }
            handleOcrPaste(e);
        };
        window.addEventListener('paste', handleGlobalPaste);
        return () => window.removeEventListener('paste', handleGlobalPaste);
    }, [isOpen, linkedItems]);

    const handleOcrFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setOcrImage(file);
            const reader = new FileReader();
            reader.onload = (event) => setOcrImagePreview(event.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleOcrPaste = (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                setOcrImage(file);
                const reader = new FileReader();
                reader.onload = (event) => setOcrImagePreview(event.target.result);
                reader.readAsDataURL(file);
                break;
            }
        }
    };

    const handleOcrDragOver = (e) => {
        e.preventDefault();
    };

    const handleOcrDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer?.files[0];
        if (file && file.type.startsWith('image/')) {
            setOcrImage(file);
            const reader = new FileReader();
            reader.onload = (event) => setOcrImagePreview(event.target.result);
            reader.readAsDataURL(file);
        }
    };

    const checkOcrDuplicates = (ocrStocks) => {
        const duplicates = [];
        ocrStocks.forEach(incoming => {
            const existing = linkedItems.find(existing => {
                const incomingTicker = String(incoming.ticker || '').trim().toUpperCase().replace(/\.K[SQ]$/i, '');
                const existingTicker = String(existing.ticker || '').trim().toUpperCase().replace(/\.K[SQ]$/i, '');
                const tickerMatch = incomingTicker && existingTicker && (incomingTicker === existingTicker);
                
                const incomingName = String(incoming.name || '').trim();
                const existingName = String(existing.name || '').trim();
                const nameMatch = incomingName && existingName && (incomingName === existingName);
                
                return tickerMatch || nameMatch;
            });
            if (existing) {
                duplicates.push({
                    incoming,
                    existing
                });
            }
        });
        return duplicates;
    };

    const finalizeOcrMerge = async (ocrStocks, actions, totalAmount) => {
        const finalLinkedItems = [...linkedItems];

        ocrStocks.forEach(incoming => {
            const key = incoming.ticker || incoming.name;
            const action = actions[key]; // 'update' | 'ignore' | 'add'

            if (action) {
                if (action === 'ignore') {
                    return; // 무시
                } else if (action === 'add') {
                    finalLinkedItems.push(incoming); // 중복 추가
                } else {
                    // 최신화
                    const existingIndex = finalLinkedItems.findIndex(existing => {
                        const incomingTicker = String(incoming.ticker || '').trim().toUpperCase().replace(/\.K[SQ]$/i, '');
                        const existingTicker = String(existing.ticker || '').trim().toUpperCase().replace(/\.K[SQ]$/i, '');
                        const tickerMatch = incomingTicker && existingTicker && (incomingTicker === existingTicker);
                        
                        const incomingName = String(incoming.name || '').trim();
                        const existingName = String(existing.name || '').trim();
                        const nameMatch = incomingName && existingName && (incomingName === existingName);
                        
                        return tickerMatch || nameMatch;
                    });
                    if (existingIndex !== -1) {
                        const existing = finalLinkedItems[existingIndex];
                        finalLinkedItems[existingIndex] = {
                            ...existing,
                            shares: incoming.shares,
                            avgPrice: incoming.avgPrice,
                            currentPrice: incoming.currentPrice,
                            currency: incoming.currency || existing.currency,
                            autoUpdate: true
                        };
                    } else {
                        finalLinkedItems.push(incoming);
                    }
                }
            } else {
                finalLinkedItems.push(incoming);
            }
        });

        setLinkedItems(finalLinkedItems);

        let stockTotalManwon = 0;
        finalLinkedItems.forEach(s => {
            let price = parseFloat(s.currentPrice) || 0;
            let shares = parseFloat(s.shares) || 0;
            let val = price * shares;
            stockTotalManwon += (val / 10000);
        });

        let extractedTotal = totalAmount;
        if (extractedTotal > 50000) {
            extractedTotal = Math.round(extractedTotal / 10000);
        }

        if (extractedTotal && extractedTotal > 0) {
            const calculatedBase = Math.max(0, Math.round((extractedTotal - stockTotalManwon) * 100) / 100);
            setBaseAmount(calculatedBase);
        }

        // OCR 병합 즉시 최신 시세 갱신
        const tickersToFetch = finalLinkedItems
            .filter(item => item.autoUpdate !== false && item.ticker)
            .map(item => item.ticker);

        if (tickersToFetch.length > 0) {
            try {
                const fetchFn = window.fetchTossQuotes || window.fetchYahooQuotes;
                if (fetchFn) {
                    const quotes = await fetchFn(tickersToFetch);
                    setLinkedItems(prev => prev.map(item => {
                        if (item.autoUpdate !== false && item.ticker) {
                            const q = quotes[item.ticker];
                            if (q && q.price) {
                                return { ...item, currentPrice: q.price, syncStatus: 'online', syncErrorReason: null };
                            } else {
                                return { ...item, syncStatus: 'error', syncErrorReason: '시세를 불러오지 못했습니다.' };
                            }
                        }
                        return item;
                    }));
                }
            } catch (e) {
                console.error("Immediate post-OCR fetch failed:", e);
                const errorMsg = e.message || '알 수 없는 API 에러';
                setLinkedItems(prev => prev.map(item => {
                    if (item.autoUpdate !== false && item.ticker) {
                        return { ...item, syncStatus: 'error', syncErrorReason: errorMsg };
                    }
                    return item;
                }));
            }
        }

        if (window.addToast) {
            window.addToast('📷 스크린샷에서 종목 정보가 성공적으로 추출되어 병합되었습니다!', 'success');
        } else {
            alert('📷 스크린샷에서 종목 정보가 성공적으로 추출되어 병합되었습니다!');
        }

        setOcrPendingData(null);
        setDuplicateActions({});
    };

    const applyOcrResult = (data) => {
        let ocrStocks = Array.isArray(data.stockItems) ? data.stockItems : [];
        ocrStocks = ocrStocks.map((s, idx) => {
            let avg = parseFloat(s.avgPrice) || 0;
            let cur = parseFloat(s.currentPrice) || 0;
            const shares = parseFloat(s.shares) || 0;
            const tickerStr = String(s.ticker || '');
            const isKorean = s.currency === 'KRW' || /^\d{6}/.test(tickerStr) || tickerStr.endsWith('.KS') || tickerStr.endsWith('.KQ');
            
            if (isKorean) {
                if (avg > 0 && avg < 1000) avg *= 10000;
                if (cur > 0 && cur < 1000) cur *= 10000;
                
                if (avg > 0 && cur > 0 && (avg / cur >= 3.0)) {
                    if (shares > 0) {
                        const tempAvg = (avg * 100) / shares;
                        if (tempAvg / cur >= 0.5 && tempAvg / cur <= 2.0) {
                            avg = Math.round(tempAvg);
                        } else {
                            avg = cur;
                        }
                    } else {
                        avg = cur;
                    }
                }
            }
            return {
                id: 'stock_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).substring(2, 5),
                ticker: s.ticker || '',
                name: s.name || s.ticker || '미확인 종목',
                shares: shares,
                avgPrice: avg,
                currentPrice: cur,
                currency: s.currency || 'KRW',
                autoUpdate: true
            };
        });

        const duplicates = checkOcrDuplicates(ocrStocks);

        if (duplicates.length > 0) {
            setOcrPendingData({ totalAmount: data.totalAmount, ocrStocks, duplicates });
            
            const initialActions = {};
            duplicates.forEach(d => {
                const key = d.incoming.ticker || d.incoming.name;
                initialActions[key] = 'update'; // 디폴트는 최신화
            });
            setDuplicateActions(initialActions);
        } else {
            finalizeOcrMerge(ocrStocks, {}, data.totalAmount);
        }
    };

    const handleAnalyzeImageOcr = async () => {
        const trimmedKey = apiKey.trim();
        if (!trimmedKey) { setOcrError('API 키를 입력해주세요.'); return; }
        if (!ocrImage) { setOcrError('분석할 이미지를 업로드하거나 붙여넣어주세요.'); return; }
        localStorage.setItem('asset_gemini_api_key', trimmedKey);
        setShowKeyInput(false);

        setOcrLoading(true);
        setOcrError('');

        try {
            const base64Data = ocrImagePreview.split(',')[1];
            const mimeType = ocrImage.type || 'image/png';

            const prompt = `당신은 금융 분석 및 자산 매칭 전문가입니다.
이 이미지(금융 스크린샷)는 특정 투자 계좌(예: 직접투자계좌, ISA 등)의 상세 화면 또는 잔고/종목 목록 화면입니다.
이 이미지에서 다음 두 가지 정보를 추출해 주세요.

1. 이 계좌의 '총 평가 금액' 또는 '총 자산 금액': 원화 기준이며 반드시 만원 단위로 변환해 주세요 (예: 50,000,000원은 5000, 2,500,000원은 250).
2. 이 계좌에 포함된 주식/펀드/ETF 종목 목록 (수량, 평가금액, 매입단가/평단가, 현재가 등):
   각 주식 종목은 "stockItems" 배열에 포함되어야 하며, 다음 필드를 가집니다:
   - ticker: 해당 주식의 티커/코드 (예: 국장은 '005930', 미장은 'AAPL', 'TSLA' 등)
   - name: 종목명 (예: '삼성전자', '테슬라' 등)
   - shares: 잔고 수량 (숫자)
   - avgPrice: 매입단가 (숫자, 평단가)
   - currentPrice: 현재단가 (숫자)
   - currency: 화폐 단위 ('KRW' 또는 'USD')

⚠️주의: 절대 '매입금액(총투자액)'이나 '평가손익'의 숫자와 '매입단가(1주당 가격, 평단가)'를 혼동하여 추출하지 마세요. 매입단가(avgPrice)는 현재가(currentPrice)와 자릿수(액수 범위)가 비슷해야 합니다.
⚠️금액은 해외 주식이어도 원화(KRW)로 변환하거나 표시된 값을 그대로 숫자로 추출하되, 통화 표기는 currency 필드로 명시하세요.

결과는 오직 다음 형식의 JSON 객체로만 답해 주세요. 다른 설명 텍스트나 코드 블록 기호는 절대 적지 마세요:

{
  "totalAmount": 5500,
  "stockItems": [
    { "ticker": "005930", "name": "삼성전자", "shares": 10, "avgPrice": 75000, "currentPrice": 82000, "currency": "KRW" }
  ]
}`;

            const body = {
                contents: [
                    {
                        parts: [
                            { text: prompt },
                            {
                                inlineData: {
                                    mimeType: mimeType,
                                    data: base64Data
                                }
                            }
                        ]
                    }
                ]
            };

            const models = ['gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-2.5-flash-lite'];
            
            const tryModel = (index) => {
                if (index >= models.length) {
                    setOcrError('모든 AI 모델 이미지 분석에 실패했습니다. API 키나 크기 제한을 확인해 주세요.');
                    setOcrLoading(false);
                    return;
                }
                
                const currentModel = models[index];
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:streamGenerateContent?alt=sse&key=${trimmedKey}`;
                
                let accumulatedText = '';
                streamGeminiResponse(
                    url,
                    body,
                    (text) => { accumulatedText = text; },
                    (finalText) => {
                        try {
                            let cleanJson = finalText.trim();
                            if (cleanJson.includes('```json')) {
                                cleanJson = cleanJson.split('```json')[1].split('```')[0].trim();
                            } else if (cleanJson.includes('```')) {
                                cleanJson = cleanJson.split('```')[1].split('```')[0].trim();
                            }
                            
                            const parsed = JSON.parse(cleanJson);
                            
                            if (parsed) {
                                applyOcrResult(parsed);
                                setOcrLoading(false);
                                setOcrImage(null);
                                setOcrImagePreview(null);
                            } else {
                                throw new Error("Invalid format");
                            }
                        } catch (e) {
                            console.warn(`Model ${currentModel} failed parsing, trying next...`, e);
                            tryModel(index + 1);
                        }
                    },
                    (err) => {
                        console.warn(`Model ${currentModel} stream failed, trying next...`, err);
                        tryModel(index + 1);
                    }
                );
            };

            tryModel(0);

        } catch (e) {
            setOcrError('분석 중 오류 발생: ' + e.message);
            setOcrLoading(false);
        }
    };

    // [추가] 티커 검색 로직 (Debounced)
    useEffect(() => {
        if (!draftTicker || draftTicker.length < 2) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const results = await window.fetchYahooSearch(draftTicker);
                setSearchResults(results || []);
            } catch (e) { console.error(e); }
            finally { setIsSearching(false); }
        }, 500);
        return () => clearTimeout(timer);
    }, [draftTicker]);

    // 실시간 총합, 수익률 및 비중 계산 로직
    const { totalValueKRW, totalPurchaseKRW, itemsWithMeta } = useMemo(() => {
        let linkedTotal = 0;
        let linkedPurchaseTotal = 0;
        const safeFxRate = fxRate > 0 ? fxRate : (Number(localStorage.getItem('asset_last_usd_krw')) || 1420);

        const mapped = linkedItems.map((item, idx) => {
            const curPrice = parseFloat(item.currentPrice) || 0;
            const avgPrice = parseFloat(item.avgPrice) || curPrice; 
            const shares = parseFloat(item.shares) || 0;
            const id = item.id || `stock_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 5)}`;
            
            let evalVal = curPrice * shares;
            let purVal = avgPrice * shares;
            /* [임시 주석 처리 - 해외 주식 달러 무시 및 100% 원화로 직통 처리]
            if (item.currency === 'USD') { 
                evalVal *= safeFxRate; 
                purVal *= safeFxRate; 
            }
            */

            const evalManwon = evalVal / 10000;
            const purManwon = purVal / 10000;
            
            linkedTotal += evalManwon;
            linkedPurchaseTotal += purManwon;
            return { ...item, id, currentPrice: curPrice, avgPrice, shares, valueManwon: evalManwon, purchaseManwon: purManwon };
        });

        const grandTotal = (Number(baseAmount) || 0) + linkedTotal;
        const grandPurchase = (Number(baseAmount) || 0) + linkedPurchaseTotal;
        return {
            totalValueKRW: grandTotal,
            totalPurchaseKRW: grandPurchase,
            itemsWithMeta: mapped.map(item => ({
                ...item,
                weight: grandTotal > 0 ? (item.valueManwon / grandTotal) * 100 : 0,
                profitManwon: item.valueManwon - item.purchaseManwon,
                profitRate: item.purchaseManwon > 0 ? ((item.valueManwon - item.purchaseManwon) / item.purchaseManwon) * 100 : 0
            }))
        };
    }, [baseAmount, linkedItems, fxRate]);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortedItemsWithMeta = useMemo(() => {
        if (!itemsWithMeta) return [];
        const sorted = [...itemsWithMeta];
        sorted.sort((a, b) => {
            let valA, valB;
            if (sortField === 'name') {
                valA = String(a.name || '').trim();
                valB = String(b.name || '').trim();
                return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            } else if (sortField === 'shares') {
                valA = a.shares || 0;
                valB = b.shares || 0;
            } else if (sortField === 'avgPrice') {
                valA = a.avgPrice || 0;
                valB = b.avgPrice || 0;
            } else if (sortField === 'currentPrice') {
                valA = a.currentPrice || 0;
                valB = b.currentPrice || 0;
            } else if (sortField === 'profitManwon') {
                valA = a.profitManwon || 0;
                valB = b.profitManwon || 0;
            } else if (sortField === 'valueManwon') {
                valA = a.valueManwon || 0;
                valB = b.valueManwon || 0;
            } else {
                return 0;
            }
            return sortDirection === 'asc' ? valA - valB : valB - valA;
        });
        return sorted;
    }, [itemsWithMeta, sortField, sortDirection]);

    const handleAddStock = () => {
        if (!draftTicker.trim()) return alert('티커를 입력하거나 종목을 선택해주세요.');
        if (!draftShares) return alert('주식 수를 입력해주세요.');
        const shares = parseFloat(String(draftShares).replace(/,/g, ''));
        if (isNaN(shares) || shares <= 0) return alert('올바른 수량을 입력해주세요.');

        // 1. 즉시 반영을 위한 데이터 구성 (Optimistic Update)
        const tempId = Date.now() + Math.random();
        const ticker = draftTicker.trim().toUpperCase();
        
        // [자동 판별] 숫자 6자리면 국장(KRW), 그 외 미장(USD)
        const isKorean = /^\d{6}$/.test(ticker) || ticker.endsWith('.KS') || ticker.endsWith('.KQ');
        const detectedCurrency = isKorean ? 'KRW' : 'USD';

        const finalAvgPrice = parseFloat(String(draftAvgPrice).replace(/,/g, '')) || 0;
        const finalPrice = finalAvgPrice; // 시세 동기화 전까지 임시 현재가

        // 2. 리스트에 즉시 추가 (Non-blocking)
        const newItem = { 
            id: tempId,
            ticker: ticker, 
            name: ticker, // 우선 티커를 이름으로 사용
            shares, 
            currentPrice: finalPrice, 
            avgPrice: finalAvgPrice,
            currency: detectedCurrency, 
            autoUpdate: true 
        };
        setLinkedItems(prev => [...prev, newItem]);

        // 3. 입력 필드 즉시 초기화
        setDraftTicker(''); setDraftShares(''); setDraftAvgPrice('');
        setSearchResults([]);

        // 4. 백그라운드 시세 동기화 (즉시 토스 API 호출)
        (async () => {
            try {
                const fetchFn = window.fetchTossQuotes || window.fetchYahooQuotes;
                if (!fetchFn) return;
                const quotes = await fetchFn([ticker]);
                const q = quotes[ticker];
                
                if (q && q.price) {
                    setLinkedItems(prev => prev.map(item => 
                        item.id === tempId 
                        ? { ...item, currentPrice: q.price, syncStatus: 'online', syncErrorReason: null }
                        : item
                    ));
                } else {
                    setLinkedItems(prev => prev.map(item => 
                        item.id === tempId 
                        ? { ...item, syncStatus: 'error', syncErrorReason: '종목 코드를 찾을 수 없습니다.' }
                        : item
                    ));
                }
            } catch (e) { 
                console.warn("Immediate registration fetch failed:", e); 
                const errorMsg = e.message || 'API 연동 에러';
                setLinkedItems(prev => prev.map(item => 
                    item.id === tempId 
                    ? { ...item, syncStatus: 'error', syncErrorReason: errorMsg }
                    : item
                ));
            }
        })();
    };

    const handleSave = () => {
        // 소수점 2자리 정밀도 유지하며 저장
        onSave({ 
            amount: Math.round(totalValueKRW * 100) / 100, 
            baseAmount: Number(baseAmount) || 0, 
            linkedItems: linkedItems 
        });
    };

    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleManualRefresh = async () => {
        const clientId = localStorage.getItem('toss_client_id');
        const clientSecret = localStorage.getItem('toss_client_secret');
        
        if (!clientId || !clientSecret) {
            if (window.addToast) {
                window.addToast('토스 API 키를 먼저 등록해주세요.', 'warning');
            }
            return;
        }

        const tickersToFetch = linkedItems
            .filter(item => item.autoUpdate !== false && item.ticker)
            .map(item => item.ticker);

        if (tickersToFetch.length === 0) {
            if (window.addToast) {
                window.addToast('실시간 연동이 활성화된 종목이 없습니다.', 'info');
            }
            return;
        }

        setIsRefreshing(true);
        try {
            const fetchFn = window.fetchTossQuotes || window.fetchYahooQuotes;
            if (!fetchFn) throw new Error("Fetch function not found");
            const quotes = await fetchFn(tickersToFetch);
            
            let hasChanges = false;
            const newLinkedItems = linkedItems.map(item => {
                if (item.autoUpdate !== false && item.ticker) {
                    const q = quotes[item.ticker];
                    const targetStatus = (q && q.price) ? 'online' : 'error';
                    const targetPrice = (q && q.price) ? q.price : item.currentPrice;
                    const targetError = (q && q.price) ? null : '종목 코드를 찾을 수 없거나 데이터가 비어 있습니다.';
                    
                    if (item.currentPrice !== targetPrice || item.syncStatus !== targetStatus || item.syncErrorReason !== targetError) {
                        hasChanges = true;
                        return { ...item, currentPrice: targetPrice, syncStatus: targetStatus, syncErrorReason: targetError };
                    }
                }
                return item;
            });

            if (hasChanges) {
                setLinkedItems(newLinkedItems);
                if (window.addToast) {
                    window.addToast('실시간 주식 시세가 업데이트되었습니다.', 'success');
                }
            } else {
                // 상태만 online으로 업데이트 해야 할 수 있으므로 체크
                const statusOnlyChanged = linkedItems.some(item => 
                    item.autoUpdate !== false && item.ticker && (item.syncStatus !== 'online' || item.syncErrorReason !== null)
                );
                if (statusOnlyChanged) {
                    setLinkedItems(prev => prev.map(item => 
                        (item.autoUpdate !== false && item.ticker) ? { ...item, syncStatus: 'online', syncErrorReason: null } : item
                    ));
                    if (window.addToast) {
                        window.addToast('실시간 주식 시세가 업데이트되었습니다.', 'success');
                    }
                } else if (window.addToast) {
                    window.addToast('이미 최신 시세입니다.', 'info');
                }
            }
        } catch (e) {
            console.error("Manual refresh failed:", e);
            const errorMsg = e.message || '알 수 없는 API 에러';
            // 에러 상태로 뱃지를 전환하기 위한 로컬 상태 갱신
            setLinkedItems(prev => prev.map(item => 
                (item.autoUpdate !== false && item.ticker) ? { ...item, syncStatus: 'error', syncErrorReason: errorMsg } : item
            ));
            if (window.addToast) {
                window.addToast(`토스 API 연동 실패: ${errorMsg}`, 'error');
            }
        } finally {
            setIsRefreshing(false);
        }
    };

    if (!isOpen || !asset) return null;

    return (
        <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-6xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in duration-200 border dark:border-slate-700">
                {/* 1. Header */}
                <div className="px-6 py-5 border-b dark:border-slate-700 flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/20">
                    <div>
                        <h3 className="text-xl font-black text-indigo-900 dark:text-indigo-100 flex items-center gap-2">🔗 실시간 종목 연동</h3>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-1">대상 자산: {asset.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-indigo-100 dark:hover:bg-indigo-800 rounded-full text-indigo-400 transition-colors">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                    {/* 📷 스크린샷 종목 캡처 연동 드롭존 */}
                    <section className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-slate-700 transition-all hover:border-indigo-400">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                📷 스크린샷으로 종목 및 평가액 일괄 등록
                            </h4>
                            <button 
                                onClick={() => {
                                    if (window.showApiKeyModal) window.showApiKeyModal();
                                }}
                                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-800 flex items-center gap-1 hover:bg-indigo-100 dark:hover:bg-indigo-800 transition-colors"
                            >
                                🔑 연동 및 키 설정
                            </button>
                        </div>

                        {!apiKey && (
                            <div className="mb-4 bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div className="text-xs font-bold text-amber-800 dark:text-amber-300">
                                    ⚠️ Google Gemini API 키가 설정되지 않았습니다. 스크린샷 분석 기능을 사용하시려면 먼저 API 키를 등록해주세요.
                                </div>
                                <button 
                                    onClick={() => {
                                        if (window.showApiKeyModal) window.showApiKeyModal();
                                    }}
                                    className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                                >
                                    🔑 API 키 설정 바로가기
                                </button>
                            </div>
                        )}

                        <div 
                            onDragOver={handleOcrDragOver}
                            onDrop={handleOcrDrop}
                            className="bg-white dark:bg-slate-800/40 rounded-xl p-6 border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center relative min-h-[140px] transition-all"
                        >
                            {ocrLoading ? (
                                <div className="flex flex-col items-center justify-center gap-3">
                                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                    <div className="text-xs font-black text-indigo-600 dark:text-indigo-400 animate-pulse">Gemini Vision AI가 이미지 분석 및 종목 추출 중...</div>
                                    <div className="text-[10px] text-slate-400">잠시만 기다려 주세요 (약 3~5초 소요)</div>
                                </div>
                            ) : ocrImagePreview ? (
                                <div className="w-full flex flex-col sm:flex-row items-center gap-4">
                                    <img src={ocrImagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg border dark:border-slate-700 shadow-sm" />
                                    <div className="flex-1 text-left space-y-2">
                                        <div className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[280px]">파일: {ocrImage.name || '클립보드 이미지'}</div>
                                        <div className="text-[10px] text-slate-400">분석 준비 완료. 이 이미지를 사용해 주식 종목과 잔액을 분석합니다.</div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={handleAnalyzeImageOcr}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow transition-colors"
                                            >
                                                ⚡ 분석 시작
                                            </button>
                                            <button 
                                                onClick={() => { setOcrImage(null); setOcrImagePreview(null); }}
                                                className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs font-bold py-1.5 px-3 rounded-lg transition-colors"
                                            >
                                                취소
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <label className="cursor-pointer flex flex-col items-center justify-center gap-2.5 w-full h-full py-4">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleOcrFileChange} 
                                        className="hidden" 
                                    />
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-500 hover:scale-110 transition-transform">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs font-black text-indigo-900 dark:text-indigo-200">여기에 스크린샷 이미지를 놓거나, 클릭하여 선택</div>
                                        <div className="text-[10px] text-slate-400 font-medium font-sans">또는 이 화면에서 <kbd className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded border text-[9px] font-mono">Ctrl</kbd>+<kbd className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded border text-[9px] font-mono">V</kbd>로 캡처 이미지 붙여넣기</div>
                                    </div>
                                </label>
                            )}
                        </div>
                        {ocrError && (
                            <div className="mt-3 p-2.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg text-[10px] font-bold border border-red-100 dark:border-red-900/30">
                                ⚠️ {ocrError}
                            </div>
                        )}
                    </section>

                    {ocrPendingData && (
                        <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/50 dark:border-amber-900/40 pb-3">
                                <div>
                                    <h5 className="text-xs font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                        ⚠️ 중복 연동 종목 발견 ({ocrPendingData.duplicates.length}개)
                                    </h5>
                                    <p className="text-[10px] font-bold text-amber-700/80 dark:text-amber-500/80 mt-0.5">동일한 종목이 감지되었습니다. 처리 방식을 결정해 주세요.</p>
                                </div>
                                <span className="text-[9px] font-black bg-amber-100 dark:bg-amber-900 text-amber-850 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-850 select-none">기본값: 최신화(덮어쓰기)</span>
                            </div>
                            <div className="space-y-3">
                                {ocrPendingData.duplicates.map((d, index) => {
                                    const itemKey = d.incoming.ticker || d.incoming.name;
                                    const currentAction = duplicateActions[itemKey] || 'update';
                                    const isPriceChanged = Number(d.existing.avgPrice) !== Number(d.incoming.avgPrice);
                                    
                                    return (
                                        <div key={index} className="flex flex-col md:flex-row md:items-center justify-between p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 gap-3 shadow-sm hover:shadow-md transition-shadow">
                                            {/* 왼쪽: 종목 정보 및 대비 */}
                                            <div className="space-y-1">
                                                <div className="text-sm font-extrabold text-slate-850 dark:text-slate-100">{d.incoming.name}</div>
                                                <div className="text-[10px] text-slate-400 font-medium flex items-center gap-2 flex-wrap">
                                                    <span className="bg-slate-50 dark:bg-slate-850 px-1.5 py-0.5 rounded">기존: {d.existing.shares}주 (평단 ₩{Number(d.existing.avgPrice).toLocaleString()})</span>
                                                    <span className="text-slate-350 dark:text-slate-650 font-bold">→</span>
                                                    <span className="bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 font-bold px-1.5 py-0.5 rounded border border-indigo-100/50 dark:border-indigo-950">
                                                        새 스크린샷: {d.incoming.shares}주 (평단 <span className={isPriceChanged ? "text-red-500 dark:text-red-400 font-extrabold" : ""}>₩{Number(d.incoming.avgPrice).toLocaleString()}</span>)
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {/* 오른쪽: 결정 버튼 그룹 (순서: 최신화 -> 추가하기 -> 반영 제외) */}
                                            <div className="flex flex-wrap gap-1">
                                                <button
                                                    onClick={() => setDuplicateActions(prev => ({ ...prev, [itemKey]: 'update' }))}
                                                    className={`text-[9px] font-black px-3 py-2 rounded-xl border transition-all ${
                                                        currentAction === 'update'
                                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10'
                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-450 border-transparent hover:bg-slate-200'
                                                    }`}
                                                >
                                                    ⚡ 최신화(덮어쓰기)
                                                </button>
                                                <button
                                                    onClick={() => setDuplicateActions(prev => ({ ...prev, [itemKey]: 'add' }))}
                                                    className={`text-[9px] font-black px-3 py-2 rounded-xl border transition-all ${
                                                        currentAction === 'add'
                                                            ? 'bg-teal-650 text-white border-teal-650 shadow-md shadow-teal-600/10'
                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-450 border-transparent hover:bg-slate-200'
                                                    }`}
                                                >
                                                    ➕ 추가하기
                                                </button>
                                                <button
                                                    onClick={() => setDuplicateActions(prev => ({ ...prev, [itemKey]: 'ignore' }))}
                                                    className={`text-[9px] font-black px-3 py-2 rounded-xl border transition-all ${
                                                        currentAction === 'ignore'
                                                            ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/10'
                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-450 border-transparent hover:bg-slate-200'
                                                    }`}
                                                >
                                                    🔇 반영 제외
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {/* 결정 반영 버튼 */}
                            <div className="flex gap-2 justify-end pt-2">
                                <button 
                                    onClick={() => {
                                        setOcrPendingData(null);
                                        setDuplicateActions({});
                                        if (window.addToast) window.addToast('🚫 업로드 반영이 취소되었습니다.', 'info');
                                    }}
                                    className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black rounded-xl transition-all"
                                >
                                    가져오기 취소
                                </button>
                                <button 
                                    onClick={() => finalizeOcrMerge(ocrPendingData.ocrStocks, duplicateActions, ocrPendingData.totalAmount)}
                                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black rounded-xl shadow-lg shadow-amber-600/20 transition-all flex items-center gap-1.5"
                                >
                                    ✔️ 설정 반영 및 데이터 병합 완료
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 2. Deposit Section */}
                    <section className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border dark:border-slate-700 flex items-center justify-between group transition-all hover:border-indigo-300">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">미연동 잔액 (예수금 / 현금)</label>
                            <p className="text-xs text-slate-500">주식 평가액에 합산되지 않는 순수 현금 자산</p>
                        </div>
                        <div className="flex items-center gap-3 relative">
                            <input type="number" step="any" value={baseAmount} onChange={(e) => setBaseAmount(parseFloat(e.target.value) || 0)} className="bg-transparent text-right text-3xl font-black text-indigo-600 dark:text-indigo-400 focus:outline-none w-32" />
                            <span className="text-lg font-bold text-slate-400">만원</span>
                        </div>
                    </section>

                    {/* 3. Input Form (임시 주석 처리 - 스크린샷 연동만 허용)
                    <section className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                ➕ 종목 퀵 등록
                                {isInitialSyncing && <div className="w-2 h-2 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-mono bg-indigo-50 dark:bg-indigo-900/40 px-2 py-0.5 rounded-full border dark:border-indigo-800">환율: ₩{Math.round(fxRate).toLocaleString()}</span>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 shadow-sm relative">
                            <div className="flex flex-wrap items-end gap-3">
                                <div className="flex-[2] min-w-[140px] relative">
                                    <label className="text-[10px] font-black text-slate-400 mb-1 block ml-1 uppercase">Search Ticker</label>
                                    <input 
                                        type="text" 
                                        placeholder="삼성전자, TSLA, AAPL..." 
                                        value={draftTicker} 
                                        onChange={(e) => setDraftTicker(e.target.value)} 
                                        className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-600 rounded-xl px-3 py-2 text-sm font-bold focus:border-indigo-500 outline-none transition-all shadow-sm" 
                                    />
                                    {(isSearching || searchResults.length > 0) && (
                                        <div className="absolute top-[105%] left-0 w-full bg-white dark:bg-slate-800 border-2 border-indigo-100 dark:border-slate-700 rounded-xl shadow-2xl z-[160] max-h-60 overflow-y-auto">
                                            {isSearching ? (
                                                <div className="p-4 text-xs text-slate-400 flex items-center gap-2 font-bold"><div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div> 야후에서 찾는 중...</div>
                                            ) : (
                                                searchResults.map(res => (
                                                    <button 
                                                        key={res.symbol}
                                                        onClick={() => { setDraftTicker(res.symbol); setSearchResults([]); }}
                                                        className="w-full text-left px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 border-b last:border-0 dark:border-slate-700 transition-colors"
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <span className="text-sm font-black text-slate-800 dark:text-slate-100">{res.name}</span>
                                                            <span className="text-[10px] bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded font-mono font-bold">{res.symbol}</span>
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 mt-0.5 font-medium">{res.exch} · {res.symbol.endsWith('.KS') ? '코스피' : res.symbol.endsWith('.KQ') ? '코스닥' : '해외시장'}</div>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="w-24">
                                    <label className="text-[10px] font-black text-slate-400 mb-1 block ml-1 uppercase">주식 수</label>
                                    <input type="number" placeholder="0" value={draftShares} onChange={(e) => setDraftShares(e.target.value)} className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-600 rounded-xl px-3 py-2 text-sm font-bold focus:border-indigo-500 outline-none transition-all shadow-sm" />
                                </div>

                                <div className="w-32">
                                    <label className="text-[10px] font-black text-slate-400 mb-1 block ml-1 uppercase">매입가</label>
                                    <input type="number" placeholder="단가" value={draftAvgPrice} onChange={(e) => setDraftAvgPrice(e.target.value)} className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-600 rounded-xl px-3 py-2 text-sm font-bold focus:border-indigo-500 outline-none transition-all shadow-sm" />
                                </div>

                                <button 
                                    onClick={handleAddStock} 
                                    className="bg-indigo-600 text-white font-black rounded-xl px-5 py-2.5 text-sm hover:bg-indigo-700 transition-all shadow-md active:scale-95 flex items-center gap-2"
                                >
                                    추가
                                </button>
                            </div>
                        </div>
                    </section>
                    */}

                    {/* 4. Stock List Table */}
                    <section className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <h4 className="text-xs font-black text-slate-500 dark:text-slate-400">📋 연동 종목 리스트</h4>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        if (confirm("정말로 모든 연동 종목을 삭제하시겠습니까?")) {
                                            setLinkedItems([]);
                                            if (window.addToast) window.addToast("🗑️ 모든 연동 종목이 일괄 삭제되었습니다.", "info");
                                        }
                                    }}
                                    className="text-[10px] font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2.5 py-1 rounded-lg border border-red-100 dark:border-red-900/40 flex items-center gap-1 hover:bg-red-100 dark:hover:bg-red-950/40 transition-all active:scale-95"
                                >
                                    <span>🗑️</span>
                                    <span>종목 일괄삭제</span>
                                </button>
                                <button
                                    onClick={handleManualRefresh}
                                    disabled={isRefreshing}
                                    className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-800 flex items-center gap-1 hover:bg-indigo-100 dark:hover:bg-indigo-850 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isRefreshing ? (
                                        <span className="w-2.5 h-2.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
                                    ) : (
                                        <span>🔄</span>
                                    )}
                                    <span>실시간 시세 새로고침</span>
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-separate border-spacing-y-2 min-w-[600px]">
                                <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                                    <tr>
                                        <th className="pb-2 pl-4 cursor-pointer select-none hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors" onClick={() => handleSort('name')}>
                                            종목 정보 {sortField === 'name' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                                        </th>
                                        <th className="pb-2 select-none">
                                            <span className="cursor-pointer hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors" onClick={() => handleSort('shares')}>
                                                수량 {sortField === 'shares' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                                            </span>
                                            <span className="mx-1 text-slate-350">/</span>
                                            <span className="cursor-pointer hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors" onClick={() => handleSort('avgPrice')}>
                                                매입가 {sortField === 'avgPrice' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                                            </span>
                                        </th>
                                        <th className="pb-2 cursor-pointer select-none hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors" onClick={() => handleSort('currentPrice')}>
                                            현재가 {sortField === 'currentPrice' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                                        </th>
                                        <th className="pb-2 text-right cursor-pointer select-none hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors" onClick={() => handleSort('profitManwon')}>
                                            평가손익 {sortField === 'profitManwon' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                                        </th>
                                        <th className="pb-2 text-right cursor-pointer select-none hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors" onClick={() => handleSort('valueManwon')}>
                                            평가금액 (비중) {sortField === 'valueManwon' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                                        </th>
                                        <th className="pb-2 pr-4"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedItemsWithMeta.map((item) => {
                                        const isProfit = item.profitManwon >= 0;
                                        const isTossConfigured = !!localStorage.getItem('toss_client_id') && !!localStorage.getItem('toss_client_secret');
                                        const profitColor = isProfit ? 'text-red-500 dark:text-red-400' : 'text-blue-500 dark:text-blue-400';
                                        
                                        return (
                                        <tr key={item.id} className="bg-slate-50 dark:bg-slate-900/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors group">
                                            <td className="py-3 pl-4 rounded-l-2xl">
                                                <div className="flex flex-col">
                                                    <div className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate max-w-[120px]" title={item.name}>{item.name}</div>
                                                    <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5" title="종목 티커">{item.ticker || '티커 없음'}</div>
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <div className="flex flex-col gap-1">
                                                    {/* 수량 편집 */}
                                                    {editingCell && editingCell.id === item.id && editingCell.field === 'shares' ? (
                                                        <input 
                                                            type="number" 
                                                            className="w-20 bg-white dark:bg-slate-800 border border-indigo-400 rounded px-1.5 py-0.5 text-xs font-bold focus:outline-none"
                                                            defaultValue={item.shares}
                                                            autoFocus
                                                            onBlur={(e) => {
                                                                const val = parseFloat(e.target.value) || 0;
                                                                setLinkedItems(prev => prev.map(li => li.id === item.id ? { ...li, shares: val } : li));
                                                                setEditingCell(null);
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    const val = parseFloat(e.target.value) || 0;
                                                                    setLinkedItems(prev => prev.map(li => li.id === item.id ? { ...li, shares: val } : li));
                                                                    setEditingCell(null);
                                                                }
                                                            }}
                                                        />
                                                    ) : (
                                                        <span 
                                                            onClick={() => setEditingCell({ id: item.id, field: 'shares' })} 
                                                            className="font-bold text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded px-1 w-fit block"
                                                            title="클릭하여 수량 수정"
                                                        >
                                                            {item.shares}주 ✏️
                                                        </span>
                                                    )}
                                                    
                                                    {/* 매입가 편집 */}
                                                    {editingCell && editingCell.id === item.id && editingCell.field === 'avgPrice' ? (
                                                        <input 
                                                            type="number" 
                                                            className="w-24 bg-white dark:bg-slate-800 border border-indigo-400 rounded px-1.5 py-0.5 text-[10px] font-bold focus:outline-none"
                                                            defaultValue={item.avgPrice}
                                                            autoFocus
                                                            onBlur={(e) => {
                                                                const val = parseFloat(e.target.value) || 0;
                                                                setLinkedItems(prev => prev.map(li => li.id === item.id ? { ...li, avgPrice: val } : li));
                                                                setEditingCell(null);
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    const val = parseFloat(e.target.value) || 0;
                                                                    setLinkedItems(prev => prev.map(li => li.id === item.id ? { ...li, avgPrice: val } : li));
                                                                    setEditingCell(null);
                                                                }
                                                            }}
                                                        />
                                                    ) : (
                                                        <span 
                                                            onClick={() => setEditingCell({ id: item.id, field: 'avgPrice' })} 
                                                            className="text-[10px] text-slate-400 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded px-1 w-fit block"
                                                            title="클릭하여 매입단가 수정"
                                                        >
                                                            {item.currency==='USD'?'$':'₩'}{Number(item.avgPrice).toLocaleString()} ✏️
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex flex-col gap-1">
                                                        {/* 현재가 편집 */}
                                                        {editingCell && editingCell.id === item.id && editingCell.field === 'currentPrice' ? (
                                                            <input 
                                                                type="number" 
                                                                className="w-24 bg-white dark:bg-slate-800 border border-indigo-400 rounded px-1.5 py-0.5 text-xs font-bold focus:outline-none"
                                                                defaultValue={item.currentPrice}
                                                                autoFocus
                                                                onBlur={(e) => {
                                                                    const val = parseFloat(e.target.value) || 0;
                                                                    setLinkedItems(prev => prev.map(li => li.id === item.id ? { ...li, currentPrice: val } : li));
                                                                    setEditingCell(null);
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        const val = parseFloat(e.target.value) || 0;
                                                                        setLinkedItems(prev => prev.map(li => li.id === item.id ? { ...li, currentPrice: val } : li));
                                                                        setEditingCell(null);
                                                                    }
                                                                }}
                                                            />
                                                        ) : (
                                                            <span 
                                                                onClick={() => setEditingCell({ id: item.id, field: 'currentPrice' })} 
                                                                className="text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded px-1 w-fit block"
                                                                title="클릭하여 현재단가 수정"
                                                            >
                                                                {item.currency==='USD'?'$':'₩'}{Number(item.currentPrice).toLocaleString()} ✏️
                                                            </span>
                                                        )}
                                                        
                                                        {/* 상태 뱃지 */}
                                                        {(() => {
                                                            if (item.autoUpdate === false || !isTossConfigured) {
                                                                return (
                                                                    <span className="w-fit text-[8px] font-black px-1.5 py-0.5 rounded bg-slate-200 text-slate-500 dark:bg-slate-700" title="실시간 시세 연동 비활성화 (오프라인)">
                                                                        OFFLINE
                                                                    </span>
                                                                );
                                                            }
                                                            if (item.syncStatus === 'error') {
                                                                return (
                                                                    <span 
                                                                        className="w-fit text-[8px] font-black px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 cursor-help" 
                                                                        title={`토스 API 연동 실패: ${item.syncErrorReason || '알 수 없는 오류 (키 설정 또는 네트워크 확인)'}`}
                                                                    >
                                                                        ERROR
                                                                    </span>
                                                                );
                                                            }
                                                            return (
                                                                <span className="w-fit text-[8px] font-black px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400" title="토스 Open API 실시간 시세 연동 정상 작동 중 (온라인)">
                                                                    ONLINE
                                                                </span>
                                                            );
                                                        })()}
                                                    </div>
 
                                                    {/* API 연동 개별 스위치 */}
                                                    <div className="flex items-center" title={isTossConfigured ? "실시간 시세 연동 토글" : "토스 API 키를 먼저 등록해주세요"}>
                                                        <button 
                                                            type="button"
                                                            onClick={() => {
                                                                if (isTossConfigured) {
                                                                    setLinkedItems(prev => prev.map(li => 
                                                                        li.id === item.id ? { 
                                                                            ...li, 
                                                                            autoUpdate: li.autoUpdate === false ? true : false,
                                                                            syncStatus: li.autoUpdate === false ? 'online' : 'offline'
                                                                        } : li
                                                                    ));
                                                                }
                                                            }}
                                                            disabled={!isTossConfigured}
                                                            className={`relative inline-flex h-4 w-7 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${!isTossConfigured ? 'cursor-not-allowed bg-slate-200 dark:bg-slate-700 opacity-50' : (item.autoUpdate !== false ? 'bg-indigo-600' : 'bg-slate-350 dark:bg-slate-600')}`}
                                                        >
                                                            <span className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${item.autoUpdate !== false && isTossConfigured ? 'translate-x-3' : 'translate-x-0'}`} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 text-right">
                                                <div className={`text-xs font-black ${profitColor}`}>
                                                    {isProfit ? '+' : ''}{Math.round(item.profitManwon).toLocaleString()}만
                                                </div>
                                                <div className={`text-[10px] font-bold opacity-80 ${profitColor}`}>
                                                    {isProfit ? '▲' : '▼'} {Math.abs(item.profitRate).toFixed(2)}%
                                                </div>
                                            </td>
                                            <td className="py-3 text-right">
                                                <div className="font-black text-indigo-600 dark:text-indigo-400 text-sm">{Math.round(item.valueManwon).toLocaleString()}<span className="text-[10px] font-bold ml-0.5">만</span></div>
                                                <div className="text-[10px] font-bold text-slate-400">{(item.weight || 0).toFixed(1)}%</div>
                                            </td>
                                            <td className="py-3 pr-4 text-right rounded-r-2xl">
                                                <button onClick={() => setLinkedItems(prev => prev.filter(li => li.id !== item.id))} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    );})}
                                </tbody>
                            </table>
                            {linkedItems.length === 0 && (
                                <div className="text-center py-10 bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border-2 border-dashed dark:border-slate-700 text-slate-400 text-xs font-bold italic">연동된 종목이 없습니다.</div>
                            )}
                        </div>
                    </section>
                </div>

                {/* 5. Total Summary Footer */}
                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t dark:border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">총 자산 요약</span>
                            <div className="flex flex-col gap-1">
                                <p className="text-[10px] text-slate-500 font-bold">
                                    투자 원금: <span className="dark:text-slate-300">{Math.round(totalPurchaseKRW).toLocaleString()}만원</span>
                                </p>
                                <p className="text-[10px] font-black">
                                    총 수익금: <span className={totalValueKRW >= totalPurchaseKRW ? 'text-red-500' : 'text-blue-500'}>{totalValueKRW >= totalPurchaseKRW ? '+' : ''}{Math.round(totalValueKRW - totalPurchaseKRW).toLocaleString()}만원 ({(((totalValueKRW - totalPurchaseKRW) / (totalPurchaseKRW || 1)) * 100).toFixed(2)}%)</span>
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1 italic font-medium">현금 비중 {(totalValueKRW > 0 ? (Number(baseAmount)/totalValueKRW*100) : 0).toFixed(1)}%</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">{Math.round(totalValueKRW).toLocaleString()}</span>
                            <span className="text-xl font-bold text-slate-400 ml-1">만원</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="flex-1 py-4 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-sm hover:bg-slate-300 transition-all">취소</button>
                        <button onClick={handleSave} disabled={isLoading || isInitialSyncing} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-600/30 transition-all flex justify-center items-center gap-2 disabled:opacity-50">
                            {isLoading || isInitialSyncing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : '✅ 연동 저장 및 잔액 갱신'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

window.ErrorBoundary = class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center gap-4 p-4 text-red-800">
                    <div className="text-center max-w-md bg-white p-8 rounded-lg shadow-lg border border-red-200">
                        <h2 className="text-2xl font-bold mb-2">앗, 문제가 발생했습니다!</h2>
                        <p className="text-sm mb-4 text-gray-600">컴포넌트를 렌더링하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
                        <button 
                            onClick={() => this.setState({ hasError: false, error: null })}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                            다시 시도
                        </button>
                    </div>
                    {this.state.error && (
                        <details className="text-gray-600 text-xs max-w-md">
                            <summary className="cursor-pointer">Error details</summary>
                            <pre className="mt-2 p-2 bg-red-900/20 rounded overflow-auto">
                                {this.state.error.message}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
};

window.IconPickerModal = ({ isOpen, onClose, onSelect, currentIcon }) => {
    if (!isOpen) return null;

    const categories = [
        { title: "금융 자산", icons: ['🏦', '💰', '💳', '💵', '💴', '💶', '💷', '🪙'] },
        { title: "투자 및 원자재", icons: ['📈', '📉', '📊', '💎', '🟡', '⚪', '🛢️', '⛏️', '🧱', '🪵', '🌾'] },
        { title: "부동산", icons: ['🏠', '🏢', '🏗️', '🏘️'] },
        { title: "소비 및 지출", icons: ['🚗', '🚌', '✈️', '🍔', '☕', '🛒', '🎁', '🎓', '🏥', '💊', '📱', '💻', '🐶', '🐱', '📦'] },
        { title: "기타", icons: ['⭐', '❤️', '⚠️'] }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md m-4 max-h-[80vh] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 sticky top-0 bg-white dark:bg-gray-800 z-10 pb-2 border-b dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">아이콘 선택</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div className="space-y-6">
                    <button onClick={() => onSelect(null)} className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        <span className="text-sm font-medium">기본 아이콘으로 초기화</span>
                    </button>

                    {categories.map((cat, idx) => (
                        <div key={idx}>
                            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">{cat.title}</h4>
                            <div className="grid grid-cols-6 gap-2">
                                {cat.icons.map(icon => (
                                    <button 
                                        key={icon} 
                                        onClick={() => onSelect(icon)} 
                                        className={`aspect-square flex items-center justify-center text-2xl rounded-lg transition-colors ${currentIcon === icon ? 'bg-blue-100 dark:bg-blue-900/50 ring-2 ring-blue-500' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                    >
                                        {icon}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

window.DataExportImportModal = ({ isOpen, onClose, onImport, currentData, initialMode = 'export', isExportOnly = false, customTitle = "💾 데이터 관리", customDescription }) => {
    const [mode, setMode] = useState(initialMode);
    const [format, setFormat] = useState('json'); // 'json' | 'csv'
    const [inputValue, setInputValue] = useState('');
    const [previewText, setPreviewText] = useState('');
    const [copyStatus, setCopyStatus] = useState('idle');

    const updatePreview = () => {
        if (mode === 'export') {
            try {
                if (format === 'json') {
                    if (window.compressData) {
                        const data = window.compressData(currentData);
                        setPreviewText(data);
                    } else {
                        setPreviewText('오류: 압축 라이브러리가 로드되지 않았습니다.');
                    }
                } else if (format === 'csv') {
                    // CSV 생성 (시뮬레이션 데이터 결과)
                    const appData = currentData.appData || {};
                    const csv = window.generateCSV ? window.generateCSV(appData) : 'CSV 생성 함수를 찾을 수 없습니다.';
                    setPreviewText(csv);
                }
            } catch (e) {
                console.error(e);
                setPreviewText('데이터 생성 실패');
            }
        } else {
            setPreviewText('');
        }
    };

    // 모달 열릴 때 초기화
    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            setFormat('json'); // 기본값 JSON
            setInputValue('');
            setCopyStatus('idle');
        }
    }, [isOpen, initialMode]);

    // 포맷이나 모드 변경 시 미리보기 업데이트
    useEffect(() => {
        if (isOpen) updatePreview();
    }, [isOpen, currentData, mode, format]);
    
    // 불러오기 모드일 경우 CSV(export 전용) 선택 해제
    useEffect(() => {
        if (mode === 'import' && format === 'csv') setFormat('json');
    }, [mode, format]);

    const handleCopy = async () => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(previewText);
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = previewText;
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }
            setCopyStatus('copied');
            setTimeout(() => setCopyStatus('idle'), 2000);
        } catch (err) {
            console.error(err);
            setCopyStatus('error');
        }
    };

    const handleDownload = () => {
        try {
            const mimeType = format === 'csv' ? 'text/csv;charset=utf-8;' : 'text/plain;charset=utf-8;';
            const blob = new Blob([format !== 'json' ? '\ufeff' + previewText : previewText], { type: mimeType });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            const dateStr = new Date().toISOString().slice(0, 10);
            link.download = format === 'csv' ? `asset_projection_${dateStr}.csv` : `asset_backup_${dateStr}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error(err);
            alert('파일 다운로드 중 오류가 발생했습니다.');
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setInputValue(event.target.result);
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset input
    };

    const handleImport = () => {
        const trimmedInput = inputValue.trim();
        if (!trimmedInput) return alert('데이터 코드를 입력해주세요.');
        try {
            if (format === 'json') {
                if (/[^\x00-\xff]/.test(trimmedInput)) {
                    throw new Error('JSON 백업 코드에는 한글이 포함될 수 없습니다. CSV 탭을 이용하세요.');
                }
                if (window.decompressData) {
                    const data = window.decompressData(trimmedInput);
                    onImport(data, 'json');
                    onClose();
                } else {
                    alert('오류: 압축 해제 라이브러리가 로드되지 않았습니다.');
                }
            } else {
                if (window.parseCSV) {
                    const data = window.parseCSV(trimmedInput);
                    onImport({ appData: data }, 'csv');
                    onClose();
                } else {
                    alert('오류: CSV 파싱 라이브러리가 로드되지 않았습니다.');
                }
            }
        } catch (e) {
            console.error(e);
            alert(`데이터 형식이 올바르지 않습니다. 코드를 확인해주세요.\n(상세 오류: ${e.message})`);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{customTitle}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
                </div>
                <div className="p-6">
                    {/* 모드 선택 탭 */}
                    {!isExportOnly && (
                        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl mb-6">
                            <button onClick={() => setMode('export')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'export' ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>내보내기</button>
                            <button onClick={() => setMode('import')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'import' ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>불러오기</button>
                        </div>
                    )}

                    {/* 포맷 선택 버튼 그룹 */}
                    <div className="flex gap-2 mb-4">
                        <button 
                            onClick={() => setFormat('json')}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold border transition-all flex items-center justify-center gap-2 ${format === 'json' ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-400 dark:text-blue-300' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'}`}
                        >
                            <span>📦</span>JSON
                        </button>
                        {mode === 'export' && (
                            <button 
                                onClick={() => setFormat('csv')}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold border transition-all flex items-center justify-center gap-2 ${format === 'csv' ? 'bg-green-50 border-green-500 text-green-700 dark:bg-green-900/30 dark:border-green-400 dark:text-green-300' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'}`}
                            >
                                <span>📊</span>CSV (시뮬레이션 표)
                            </button>
                        )}
                    </div>

                    {mode === 'export' ? (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                {customDescription ? (typeof customDescription === 'function' ? customDescription(format) : customDescription) : (
                                    format === 'json' 
                                        ? '모든 데이터(설정, 시나리오, 히스토리 포함)를 압축된 코드로 변환했습니다.' 
                                        : '현재부터 목표 개월까지의 자산 시뮬레이션 결과를 엑셀에서 열 수 있는 CSV 표 형태로 내보냅니다.'
                                )}
                                <br/>아래 내용을 복사하거나 파일로 저장하세요.
                            </p>
                            <div className="relative">
                                <textarea readOnly value={previewText} className="w-full h-32 p-4 text-xs font-mono bg-gray-50 dark:bg-gray-900 border dark:border-gray-600 rounded-xl resize-none focus:outline-none dark:text-gray-300" />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleCopy} className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${copyStatus === 'copied' ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                                    {copyStatus === 'copied' ? '✅ 복사됨' : '📋 복사하기'}
                                </button>
                                <button onClick={handleDownload} className="flex-1 py-3 bg-gray-600 text-white rounded-xl font-bold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                                    💾 파일 저장
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                {format === 'json' ? 'JSON 내용을 텍스트 파일을 선택하세요.' : 'CSV 내용을 붙여넣거나 파일을 선택하세요.'}
                                <br/><span className="text-red-500 text-xs font-bold">* 주의: 현재 데이터가 덮어씌워집니다.</span>
                            </p>
                            <div className="relative">
                                <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="w-full h-32 p-4 text-xs font-mono bg-white dark:bg-gray-900 border dark:border-gray-600 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" placeholder={format === 'json' ? "백업 코드를 입력하세요 (한글 불가)" : "CSV 원문을 입력하세요"} />
                                <label className="absolute bottom-3 right-3 cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-gray-300 dark:border-gray-600">
                                    📂 파일 선택
                                    <input type="file" accept={format === 'json' ? ".txt" : ".csv"} onChange={handleFileSelect} className="hidden" />
                                </label>
                            </div>
                            <button onClick={handleImport} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
                                📥 {format === 'json' ? 'JSON 데이터 복구하기' : 'CSV 데이터 복구하기'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const streamGeminiResponse = async (url, body, onUpdate, onComplete, onError) => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const errMsg = errData.error?.message || response.statusText;
            if (response.status === 400) throw new Error(`잘못된 요청입니다 (400). API 키가 올바른지 확인해주세요.\n(상세: ${errMsg})`);
            if (response.status === 403) throw new Error(`권한 오류 (403). API 키가 활성화되었는지 확인해주세요.\n(상세: ${errMsg})`);
            if (response.status === 429) throw new Error(`요청 한도 초과 (429). 잠시 후 다시 시도해주세요.\n(상세: ${errMsg})`);
            throw new Error(`API 호출 실패 (${response.status}): ${errMsg}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            // SSE 포맷 파싱 (data: {...})
            const lines = chunk.split('\n');
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const jsonStr = line.slice(6);
                    if (jsonStr.trim() === '[DONE]') continue;
                    try {
                        const data = JSON.parse(jsonStr);
                        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (text) {
                            accumulatedText += text;
                            onUpdate(accumulatedText);
                        }
                    } catch (e) { /* Ignore parse error */ }
                }
            }
        }
        onComplete(accumulatedText);
    } catch (err) {
        onError(err);
    }
};

window.AIAnalysisModal = ({ isOpen, onClose, appData, calculation, assetHistory, onApplyProposal }) => {
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('asset_gemini_api_key') || '');
    const [persona, setPersona] = useState(() => localStorage.getItem('asset_ai_persona') || '냉철한 전문 자산 관리사');
    const [requestProposal, setRequestProposal] = useState(() => localStorage.getItem('asset_ai_request_proposal') !== 'false'); // [추가] 제안 요청 여부 (기본값 true)

    // [추가] 페르소나 변경 시 로컬 스토리지 자동 저장
    useEffect(() => {
        localStorage.setItem('asset_ai_persona', persona);
    }, [persona]);

    // [추가] 제안 요청 설정 저장
    useEffect(() => {
        localStorage.setItem('asset_ai_request_proposal', requestProposal);
    }, [requestProposal]);

    const [additionalRequest, setAdditionalRequest] = useState('');
    const [showSettings, setShowSettings] = useState(true);
    
    // [수정] 멀티턴 대화를 위한 상태 관리
    const [messages, setMessages] = useState([]); // { role: 'user' | 'model', text: string }
    const [chatInput, setChatInput] = useState('');
    const [contextPrompt, setContextPrompt] = useState(''); // 초기 컨텍스트 저장용
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [proposal, setProposal] = useState(null); // [추가] AI 제안 데이터
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(() => { if (isOpen) scrollToBottom(); }, [messages, showSettings, isOpen]);

    // [추가] JSON 추출 헬퍼
    const extractJSON = (text) => {
        const start = text.indexOf('---JSON_START---');
        const end = text.indexOf('---JSON_END---');
        if (start !== -1 && end !== -1) {
            try {
                const jsonStr = text.substring(start + 16, end);
                return JSON.parse(jsonStr);
            } catch (e) { return null; }
        }
        return null;
    };

    // [추가] 3.1 -> 3.5 -> 2.5 순서대로 폴백 호출하는 스트리밍 헬퍼
    const streamGeminiWithFallback = async (urlGenerator, body, onUpdate, onComplete, onError) => {
        const models = ['gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-2.5-flash-lite'];
        
        const tryModel = (index) => {
            if (index >= models.length) {
                onError(new Error('모든 AI 모델(3.1, 3.5, 2.5) 호출에 실패했습니다. API 키나 할당량을 확인해주세요.'));
                return;
            }
            
            const currentModel = models[index];
            const url = urlGenerator(currentModel);
            
            streamGeminiResponse(
                url,
                body,
                onUpdate,
                (finalText) => {
                    onComplete(finalText);
                },
                (err) => {
                    console.warn(`⚠️ Model ${currentModel} failed. Trying next fallback... Error: ${err.message}`);
                    tryModel(index + 1);
                }
            );
        };

        tryModel(0);
    };

    const handleAnalyze = async () => {
        const localKey = localStorage.getItem('asset_gemini_api_key') || '';
        const trimmedKey = localKey.trim();
        if (!trimmedKey) { setError('API 키가 없습니다. 앱 설정 및 보안에서 Gemini API 키를 등록해주세요.'); return; }
        setApiKey(trimmedKey);
        setLoading(true);
        setError('');
        setMessages([]);
        setProposal(null);
        
        try {
            const sectorTotals = window.getSectorTotals(appData.assets, calculation.currentTotal);
            const summary = {
                totalAsset: Math.round(calculation.currentTotal) + '만원',
                netWorth: Math.round(calculation.currentNet) + '만원',
                monthlyIncome: appData.monthlySalary + '만원',
                monthlyExpense: Math.round(calculation.totalMonthlyExpense) + '만원',
                targetAsset: appData.targetAmount + '만원',
                portfolio: Object.keys(appData.assets).map(k => {
                    if (!sectorTotals[k] || sectorTotals[k].percentage < 1) return null;
                    return `${window.sectorInfo[k].name}: ${Math.round(sectorTotals[k].percentage)}%`;
                }).filter(Boolean).join(', '),
                // [추가] AI가 구체적인 조언을 할 수 있도록 개별 자산 항목 정보 추가
                details: Object.keys(appData.assets).reduce((acc, k) => {
                    const assets = appData.assets[k] || [];
                    if (assets.length > 0 && window.sectorInfo[k]) {
                        const isLoan = k === 'loan';
                        if (isLoan) {
                            // [수정] 대출일 경우 상환 방식과 만기 정보를 포함하여 더 구체적으로 전송
                            acc[window.sectorInfo[k].name] = assets.map(a => `${a.name}(현재 ${Math.round(a.amount)}만원, 이자율 ${a.rate || 0}%, 월납입 ${a.monthlyContrib || 0}만원, ${a.repaymentMethod || '원리금균등'}, 만기 ${a.maturityMonth || 0}개월 남음)`).join(', ');
                        } else {
                            acc[window.sectorInfo[k].name] = assets.map(a => `${a.name}(현재 ${Math.round(a.amount)}만원, 수익률 ${a.rate || 0}%, 월납입 ${a.monthlyContrib || 0}만원)`).join(', ');
                        }
                    }
                    return acc;
                }, {}),
                // [추가] 사용자가 설정한 리밸런싱 목표 비중 전송 (AI가 목표 대비 현재 상태를 분석하도록 함)
                targetRatios: appData.rebalancingTargets,
                memo: appData.memo || '내용 없음',
                fixedExpenses: (appData.monthlyExpenses || []).map(e => `${e.name}(${e.amount}만원)`).join(', '),
                futureEvents: {
                    income: (appData.incomeEvents || []).map(e => `${e.name}(${e.amount}만원, ${e.startMonth}~${e.endMonth})`).join(', '),
                    expense: (appData.expenseEvents || []).map(e => `${e.name}(${e.amount}만원, ${e.startMonth}~${e.endMonth})`).join(', ')
                },
                // [추가] 자산 히스토리 전체 데이터 (날짜, 자산, 메모)
                history: (assetHistory || []).map(h => ({
                    date: h.date,
                    asset: h.netWorth,
                    memo: h.memo
                })),
                // [추가] 미래 타임라인 분기점 데이터
                futurePhases: (appData.futurePhases || []).filter(p => p.startDate).map(p => {
                    const changes = [];
                    if (p.data) {
                        if (p.data.monthlySalary !== undefined) changes.push(`월급 ${p.data.monthlySalary}만원으로 변경`);
                        if (p.data.monthlyExpenses !== undefined) {
                            const expTotal = p.data.monthlyExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
                            changes.push(`월 고정지출 총액 ${expTotal}만원으로 변경`);
                        }
                        if (p.data.assets) {
                            Object.keys(p.data.assets).forEach(s => {
                                p.data.assets[s].forEach(a => {
                                    if (a.amount !== undefined) changes.push(`[${a.name}] 잔액 ${a.amount}만원으로 설정(강제변경)`);
                                    if (a.monthlyContrib !== undefined) changes.push(`[${a.name}] 월 납입액 ${a.monthlyContrib}만원으로 변경`);
                                });
                            });
                        }
                    }
                    const changesText = changes.length > 0 ? changes.join(', ') : '자산/수입 변경 없음';
                    return `- ${p.startDate} 분기점 [${p.name}]: ${changesText}`;
                }).join('\n')
            };

            // [수정] 시스템 프롬프트 구성 (초기 컨텍스트)
            let prompt = `
                당신은 ${persona}입니다. 아래 재무 데이터를 분석해주세요.
                데이터: ${JSON.stringify(summary)}
                
                다음 형식으로 마크다운을 사용하여 답변해주세요:
                1. 🧐 **포트폴리오 진단**: 현재 자산 배분의 장단점 (위험도, 수익성 등)
                2. ⚖️ **리밸런싱 제안**: 목표 달성을 위해 비중을 조절해야 할 섹터
                3. 💡 **액션 플랜**: 구체적으로 실행해야 할 3가지 조언
                ${additionalRequest ? `4. 🗣️ **추가 답변**: 사용자의 요청("${additionalRequest}")에 대한 답변` : ''}
            `;

            if (requestProposal) {
                prompt += `
                마지막에 반드시 아래 JSON 형식으로 구체적인 변경 제안을 포함해주세요(코드 블록 안에 넣지 말고 텍스트로). 제안할 변경사항이 없으면 빈 객체 {}를 주세요:
                ---JSON_START---
                {
                    "rebalancingTargets": { "deposit": 10, "savings": 20, ... },
                    "monthlyContrib": { "자산이름": 50, ... }
                }
                ---JSON_END---
                `;
            }
            
            prompt += `
                너무 길지 않게 핵심만 요약해서 답변해주세요.
                이후 사용자의 질문에 대해서도 위 데이터를 바탕으로 답변해주세요.
            `;

            setContextPrompt(prompt); // 컨텍스트 저장

            // [수정] 스트리밍 적용 (빈 메시지 추가 후 업데이트)
            setMessages([{ role: 'model', text: '' }]);
            setShowSettings(false);

            await streamGeminiWithFallback(
                (m) => `https://generativelanguage.googleapis.com/v1beta/models/${m}:streamGenerateContent?alt=sse&key=${trimmedKey}`,
                { contents: [{ parts: [{ text: prompt }] }] },
                (text) => {
                    setMessages([{ role: 'model', text }]);
                    const extracted = extractJSON(text);
                    if (extracted) setProposal(extracted);
                }, 
                (finalText) => {
                    setLoading(false);
                    const extracted = extractJSON(finalText);
                    if (extracted) setProposal(extracted);
                }, 
                (err) => { setError(err.message); setLoading(false); }
            );
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    // [추가] 추가 질문 전송 핸들러 (멀티턴)
    const handleSendMessage = async () => {
        if (!chatInput.trim() || loading) return;
        const userMsg = { role: 'user', text: chatInput };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setChatInput('');
        setLoading(true);

        // [추가] 모델 응답을 위한 빈 메시지 미리 추가
        setMessages(prev => [...prev, { role: 'model', text: '' }]);

        try {
            // 대화 히스토리 구성: [Context(User), Analysis(Model), ...History, Current(User)]
            const contents = [
                { role: 'user', parts: [{ text: contextPrompt }] },
                ...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
                { role: 'user', parts: [{ text: userMsg.text }] }
            ];

            await streamGeminiWithFallback(
                (m) => `https://generativelanguage.googleapis.com/v1beta/models/${m}:streamGenerateContent?alt=sse&key=${apiKey}`,
                { contents },
                (text) => setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { role: 'model', text };
                    return updated;
                }),
                () => setLoading(false),
                (err) => { setError('대화 중 오류가 발생했습니다: ' + err.message); setLoading(false); }
            );
        } catch (err) {
            setError('대화 중 오류가 발생했습니다: ' + err.message);
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            {/* [수정] 모바일: 전체화면(h-[100dvh]) 및 마진 제거 / 데스크탑: 기존 스타일 유지 */}
            <div className="bg-white dark:bg-gray-800 sm:rounded-xl shadow-2xl w-full max-w-2xl h-[100dvh] sm:h-[80vh] sm:m-4 flex flex-col animate-in fade-in zoom-in duration-200 overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center mb-4 border-b dark:border-gray-700 pb-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">🤖 AI 자산 분석 <span className="text-xs font-normal text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">Powered by Gemini</span></h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-0 space-y-4">
                    {showSettings && (
                        <>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">AI 페르소나 (자산 관리사 성격)</label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input 
                                        type="text" 
                                        className="flex-1 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                        value={persona}
                                        onChange={(e) => setPersona(e.target.value)}
                                        placeholder="예: 100년 경력의 워렌 버핏, 냉철한 분석가, 친절한 이웃집 은행원"
                                    />
                                    <label className="flex items-center gap-2 px-3 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="체크 시 AI가 구체적인 리밸런싱/월납입금 변경 제안을 JSON 데이터로 함께 제공합니다.">
                                        <input 
                                            type="checkbox" 
                                            checked={requestProposal} 
                                            onChange={(e) => setRequestProposal(e.target.checked)}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">자산배분 설정 제안 받기</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">추가 요청사항 (선택)</label>
                                <textarea 
                                    className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 resize-none h-24"
                                    value={additionalRequest}
                                    onChange={(e) => setAdditionalRequest(e.target.value)}
                                    placeholder="예: 은퇴 자금 마련을 위해 공격적인 투자가 필요할까요? 아니면 안전 자산을 늘려야 할까요?"
                                />
                            </div>

                            <button 
                                onClick={handleAnalyze} 
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        AI 분석 중...
                                    </>
                                ) : (
                                    '⚡ AI 자산 분석 시작'
                                )}
                            </button>
                        </div>
                        </>
                    )}

                    {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

                    {/* [수정] 채팅 인터페이스 구현 */}
                    {!showSettings && (
                        <>
                        <div className="flex justify-end mb-2">
                            <button onClick={() => { setShowSettings(true); setMessages([]); setProposal(null); }} className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1">
                                🔄 처음부터 다시 시작
                            </button>
                        </div>
                        
                        <div className="space-y-4 pb-4">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[90%] rounded-2xl p-4 ${
                                        msg.role === 'user' 
                                            ? 'bg-blue-600 text-white rounded-tr-none' 
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none border dark:border-gray-600'
                                    }`}>
                                        {msg.role === 'user' ? (
                                            <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                                        ) : (
                                            <div className="prose dark:prose-invert prose-sm max-w-none">
                                                <div className="whitespace-pre-wrap leading-relaxed break-words">
                                                    {msg.text.replace(/---JSON_START---[\s\S]*?---JSON_END---/g, '').split('\n').map((line, i) => {
                                                        if (line.startsWith('#')) return <h4 key={i} className="text-base font-bold mt-2 mb-1 text-indigo-600 dark:text-indigo-400">{line.replace(/^#+\s/, '')}</h4>;
                                                        const parts = line.split(/(\*\*.*?\*\*)/g);
                                                        return (
                                                            <p key={i} className="mb-1">
                                                                {parts.map((part, j) => (
                                                                    part.startsWith('**') && part.endsWith('**') 
                                                                        ? <strong key={j}>{part.slice(2, -2)}</strong> 
                                                                        : part
                                                                ))}
                                                            </p>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                                    </div>
                                </div>
                            )}
                            {/* [추가] 제안 적용 버튼 */}
                            {proposal && !loading && (
                                <div className="flex justify-center mt-4 animate-in fade-in slide-in-from-bottom-4">
                                    <button 
                                        onClick={() => onApplyProposal(proposal)}
                                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all font-bold flex items-center gap-2"
                                    >
                                        <span>✨</span> AI 제안 검토 및 적용하기
                                    </button>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        </>
                    )}
                </div>

                {/* [추가] 채팅 입력창 */}
                {!showSettings && (
                    <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                                placeholder="추가로 궁금한 점을 물어보세요..."
                                className="flex-1 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                disabled={loading}
                            />
                            <button 
                                onClick={handleSendMessage}
                                disabled={loading || !chatInput.trim()}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

window.DiffModal = ({ isOpen, onClose, currentData, proposalData, onConfirm }) => {
    if (!isOpen || !proposalData) return null;

    const { rebalancingTargets: currentTargets, assets } = currentData;
    const { rebalancingTargets: newTargets, monthlyContrib: newContribs } = proposalData;

    // 리밸런싱 비교 데이터 생성
    const targetDiffs = [];
    if (newTargets) {
        Object.keys(newTargets).forEach(sector => {
            const oldVal = currentTargets[sector] || 0;
            const newVal = newTargets[sector];
            if (oldVal !== newVal) {
                targetDiffs.push({ sector, oldVal, newVal, diff: newVal - oldVal });
            }
        });
    }

    // 월납입금 비교 데이터 생성
    const contribDiffs = [];
    if (newContribs) {
        Object.keys(newContribs).forEach(assetName => {
            // 자산 이름으로 찾기
            let found = false;
            Object.keys(assets).forEach(sector => {
                assets[sector].forEach(asset => {
                    if (asset.name === assetName) {
                        const oldVal = asset.monthlyContrib || 0;
                        const newVal = newContribs[assetName];
                        if (oldVal !== newVal) {
                            contribDiffs.push({ name: assetName, oldVal, newVal, diff: newVal - oldVal });
                        }
                        found = true;
                    }
                });
            });
        });
    }

    const hasChanges = targetDiffs.length > 0 || contribDiffs.length > 0;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in zoom-in duration-300">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    ⚖️ 변경 사항 미리보기
                </h3>
                
                {!hasChanges ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        변경할 내용이 없습니다.
                    </div>
                ) : (
                    <div className="space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                        {targetDiffs.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 border-b dark:border-gray-700 pb-1">🎯 리밸런싱 목표 비중</h4>
                                <div className="space-y-2">
                                    {targetDiffs.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center text-sm bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{window.sectorInfo[item.sector]?.name || item.sector}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-500 line-through">{item.oldVal}%</span>
                                                <span>→</span>
                                                <span className="font-bold text-blue-600 dark:text-blue-400">{item.newVal}%</span>
                                                <span className={`text-xs ${item.diff > 0 ? 'text-green-500' : 'text-red-500'}`}>({item.diff > 0 ? '+' : ''}{item.diff}%)</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {contribDiffs.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 border-b dark:border-gray-700 pb-1">💰 월 납입금 설정</h4>
                                <div className="space-y-2">
                                    {contribDiffs.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center text-sm bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{item.name}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-500 line-through">{item.oldVal}만</span>
                                                <span>→</span>
                                                <span className="font-bold text-blue-600 dark:text-blue-400">{item.newVal}만</span>
                                                <span className={`text-xs ${item.diff > 0 ? 'text-green-500' : 'text-red-500'}`}>({item.diff > 0 ? '+' : ''}{item.diff}만)</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-6 flex flex-col gap-2">
                    <button 
                        onClick={() => onConfirm('apply')} 
                        disabled={!hasChanges}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        ✅ 현재 설정에 덮어쓰기
                    </button>
                    <button 
                        onClick={() => onConfirm('scenario')} 
                        disabled={!hasChanges}
                        className="w-full py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                        💾 새 시나리오로 저장
                    </button>
                    <button onClick={onClose} className="w-full py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 text-sm">취소</button>
                </div>
            </div>
        </div>
    );
};

window.CapitalIncomeAnalysisModal = ({ isOpen, onClose, appData, projections }) => {
    const monthlyExpenseTotal = useMemo(() => 
        isOpen ? (appData.monthlyExpenses || []).reduce((sum, e) => sum + (e.amount || 0), 0) : 0, 
    [appData.monthlyExpenses, isOpen]);

    const { flows, goldenCross } = useMemo(() => 
        isOpen ? window.calculateCapitalIncomeFlow(projections, appData.assets, monthlyExpenseTotal) : { flows: [], goldenCross: null },
    [projections, appData.assets, monthlyExpenseTotal, isOpen]);

    if (!isOpen) return null;

    // 차트 렌더링 계산
    const maxVal = Math.max(...flows.map(f => f.capitalIncome), monthlyExpenseTotal * 1.5);
    const height = 200;
    
    const getPath = () => {
        if (flows.length < 2) return '';
        const stepX = 100 / (flows.length - 1);
        let path = `M 0 ${height}`; 
        flows.forEach((f, i) => {
            const x = i * stepX;
            const y = height - (f.capitalIncome / maxVal * height);
            path += ` L ${x} ${y}`;
        });
        path += ` L 100 ${height} Z`;
        return path;
    };

    const getLinePath = (val) => {
        const y = height - (val / maxVal * height);
        return `M 0 ${y} L 100 ${y}`;
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300">
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        💸 자본소득(Cash Flow) 흐름
                        <span className="text-xs font-normal bg-green-100 text-green-800 px-2 py-0.5 rounded-full">J-Curve</span>
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
                </div>
                
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl border border-blue-100 dark:border-blue-800">
                            <div className="text-sm text-blue-600 dark:text-blue-400 font-bold mb-1">현재 월 자본소득</div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(flows[0]?.capitalIncome || 0).toLocaleString()} <span className="text-sm font-normal">만원</span></div>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-5 rounded-xl border border-purple-100 dark:border-purple-800">
                            <div className="text-sm text-purple-600 dark:text-purple-400 font-bold mb-1">예상 월 자본소득 (최종)</div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(flows[flows.length-1]?.capitalIncome || 0).toLocaleString()} <span className="text-sm font-normal">만원</span></div>
                            <div className="text-xs text-gray-500 mt-1">{flows.length}개월 후 예상</div>
                        </div>
                        <div className={`p-5 rounded-xl border ${goldenCross ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                            <div className={`text-sm font-bold mb-1 ${goldenCross ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>경제적 자유 (Golden Cross)</div>
                            {goldenCross ? (
                                <><div className="text-2xl font-bold text-gray-900 dark:text-white">{goldenCross.yearMonth} <span className="text-sm font-normal">달성!</span></div><div className="text-xs text-gray-500 mt-1">자본소득 &gt; 월 지출({monthlyExpenseTotal}만원)</div></>
                            ) : (
                                <div className="text-sm text-gray-500 mt-2">시뮬레이션 기간 내 달성 실패</div>
                            )}
                        </div>
                    </div>

                    <div className="mb-8">
                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">📈 월 자본소득 성장 추이</h4>
                        <div className="relative h-64 w-full bg-gray-50 dark:bg-gray-900/50 rounded-xl border dark:border-gray-700 overflow-hidden">
                            <svg className="w-full h-full" preserveAspectRatio="none" viewBox={`0 0 100 ${height}`}>
                                <defs><linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" /></linearGradient></defs>
                                <path d={getLinePath(monthlyExpenseTotal)} stroke="#ef4444" strokeWidth="1" strokeDasharray="4" vectorEffect="non-scaling-stroke" />
                                <path d={getPath()} fill="url(#incomeGradient)" stroke="#2563eb" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                            </svg>
                            <div className="absolute top-2 right-2 text-xs font-bold text-blue-600 bg-white/80 px-2 py-1 rounded">Max: {Math.round(maxVal).toLocaleString()}만원</div>
                            <div className="absolute left-2 text-xs font-bold text-red-500 bg-white/80 px-2 py-1 rounded" style={{ bottom: `${Math.min(90, Math.max(10, monthlyExpenseTotal / maxVal * 100))}%` }}>지출: {monthlyExpenseTotal}만원</div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2 px-1"><span>{flows[0]?.yearMonth}</span><span>{flows[Math.floor(flows.length/2)]?.yearMonth}</span><span>{flows[flows.length-1]?.yearMonth}</span></div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr><th className="px-4 py-3">시기</th><th className="px-4 py-3 text-right">총 자산</th><th className="px-4 py-3 text-right text-blue-600 dark:text-blue-400">월 자본소득</th><th className="px-4 py-3 text-right">소득 대체율</th></tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                                {flows.filter((_, i) => i % Math.max(1, Math.floor(flows.length / 10)) === 0 || i === flows.length - 1).map((f, i) => (
                                    <tr key={i} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{f.yearMonth} ({f.month}개월 후)</td>
                                        <td className="px-4 py-3 text-right">{Math.round(f.totalAsset || 0).toLocaleString()}만원</td>
                                        <td className="px-4 py-3 text-right font-bold text-blue-600 dark:text-blue-400">+{Math.round(f.capitalIncome).toLocaleString()}만원</td>
                                        <td className="px-4 py-3 text-right">{monthlyExpenseTotal > 0 ? ((f.capitalIncome / monthlyExpenseTotal) * 100).toFixed(1) : 0}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

window.AdminDashboardModal = ({ isOpen, onClose, supabase, showSuggestionButton, onToggleSuggestionButton }) => {
    const [activeTab, setActiveTab] = useState('stats');
    const [stats, setStats] = useState({ insights: null });
    const [users, setUsers] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [noticeContent, setNoticeContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 데이터 로드
    useEffect(() => {
        if (!isOpen || !supabase) return;
        
        // [수정] 세션 강제 갱신 및 데이터 로드 (권한 문제 해결)
        const loadData = async () => {
            const { error: sessionError } = await supabase.auth.refreshSession();
            if (sessionError) console.warn('Session refresh warning:', sessionError);

            if (activeTab === 'stats') fetchStats();
            if (activeTab === 'users') fetchUsers();
            if (activeTab === 'notice') fetchNotice();
            if (activeTab === 'suggestions') fetchSuggestions();
        };
        loadData();
    }, [isOpen, activeTab, supabase]);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            // [추가] 총 가입자 수 조회
            const { count: totalUsersCount, error: countError } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true });
            if (countError) console.error('Total users count error:', countError);

            // 1. 동의한 유저 이메일 가져오기
            const { data: profiles, error: profileError } = await supabase
                .from('user_profiles')
                .select('email')
                .eq('data_consent', true);
            
            if (profileError) throw profileError;

            let insights = null;

            if (profiles && profiles.length > 0) {
                const emails = profiles.map(p => p.email);
                
                // 2. 해당 유저들의 자산 데이터 가져오기 (암호화된 것과 안 된 것 모두 조회)
                const { data: assetsData, error: assetsError } = await supabase
                    .from('user_assets')
                    .select('email, data, updated_at, encryption_type')
                    .in('email', emails)
                    .order('updated_at', { ascending: false });

                if (assetsError) throw assetsError;

                if (assetsData) {
                    // 3. 이메일별 최신 데이터 하나만 추출 (중복 제거)
                    const uniqueAssets = [];
                    const seenEmails = new Set();
                    
                    for (const record of assetsData) {
                        if (!seenEmails.has(record.email)) {
                            seenEmails.add(record.email);
                            uniqueAssets.push(record);
                        }
                    }

                    // [수정] 통계 계산을 위한 배열 초기화
                    const totals = [];
                    const debts = [];
                    const nets = [];
                    const incomes = []; // [추가] 월 고정 소득
                    const expenses = []; // [추가] 월 고정 소비
                    const capitalIncomes = []; // [추가] 월 자본 소득
                    let validCount = 0;

                    for (const record of uniqueAssets) {
                        try {
                            let appData = record.data;
                            
                            // [수정] secure 모드는 제외하고, normal 모드 데이터 복호화 처리 (FREE/PRO 공통)
                            if (record.encryption_type === 'secure') continue;

                            const securityKey = window.getVaultConfig ? window.getVaultConfig('SECURITY_KEY') : null;
                            // normal 모드이거나 암호화 타입이 명시되지 않았지만 암호화된 데이터일 경우 복호화 시도
                            if (record.encryption_type === 'normal' && securityKey && typeof appData === 'string') {
                                const key = window.getEncryptionKey('normal', null, record.email, securityKey);
                                if (key) appData = await window.decryptData(record.data, key);
                            }

                            // [수정] 데이터 구조 정규화 (래퍼 객체 처리)
                            const actualAppData = appData.appData || appData;
                            const assets = actualAppData.assets;

                            if (assets) {
                                const total = window.calculateGrossTotal(assets); // 총 자산 (부채 제외)
                                
                                // 부채 계산
                                let debt = 0;
                                if (assets.loan) {
                                    debt = assets.loan.reduce((sum, a) => sum + (a.amount || 0), 0);
                                }
                                const net = total - debt;

                                totals.push(total);
                                debts.push(debt);
                                nets.push(net);

                                // [추가] 소득/소비/자본소득 데이터 수집
                                const salary = Number(actualAppData.monthlySalary || 0);
                                incomes.push(isNaN(salary) ? 0 : salary); // [안전장치] 숫자가 아닌 경우 0 처리

                                const mExpenses = actualAppData.monthlyExpenses;
                                const expenseList = Array.isArray(mExpenses) ? mExpenses : []; // [안전장치] 배열이 아닌 경우 빈 배열 처리
                                const expenseTotal = expenseList.reduce((sum, e) => sum + Number(e.amount || 0), 0);
                                expenses.push(expenseTotal);

                                let capIncome = 0;
                                Object.keys(assets).forEach(k => {
                                    if (k !== 'loan') {
                                        // 자산 수익은 자본소득 (세전 기준)
                                        (assets[k] || []).forEach(a => capIncome += (Number(a.amount||0) * (Number(a.rate||0)/100/12)));
                                    }
                                });
                                capitalIncomes.push(capIncome);

                                validCount++;
                            }
                        } catch (e) { /* Decryption failed */ }
                    }

                    if (validCount > 0) {
                        const sumTotal = totals.reduce((a, b) => a + b, 0);
                        const sumDebt = debts.reduce((a, b) => a + b, 0);
                        const sumNet = nets.reduce((a, b) => a + b, 0);
                        const sumIncome = incomes.reduce((a, b) => a + b, 0);
                        const sumExpense = expenses.reduce((a, b) => a + b, 0);
                        const sumCapIncome = capitalIncomes.reduce((a, b) => a + b, 0);

                        insights = {
                            avgTotal: Math.round(sumTotal / validCount),
                            medianTotal: Math.round(calculateMedian(totals)),
                            avgDebt: Math.round(sumDebt / validCount),
                            medianDebt: Math.round(calculateMedian(debts)),
                            avgNet: Math.round(sumNet / validCount),
                            medianNet: Math.round(calculateMedian(nets)),
                            avgIncome: Math.round(sumIncome / validCount),
                            medianIncome: Math.round(calculateMedian(incomes)),
                            avgExpense: Math.round(sumExpense / validCount),
                            medianExpense: Math.round(calculateMedian(expenses)),
                            avgCapIncome: Math.round(sumCapIncome / validCount),
                            medianCapIncome: Math.round(calculateMedian(capitalIncomes)),
                            sampleSize: validCount,
                            totalUsers: totalUsersCount || 0
                        };
                    }
                }
            }
            setStats({ insights });
        } catch (err) {
            console.error('Stats Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            let query = supabase.from('user_profiles').select('*').limit(50);
            if (searchQuery) query = query.ilike('email', `%${searchQuery}%`);
            
            // [수정] 에러 핸들링 및 사용자 알림 추가
            const { data, error } = await query;
            if (error) throw error;
            
            setUsers(data || []);
        } catch (err) {
            console.error('Users Fetch Error:', err);
            alert('유저 목록을 불러오는 중 오류가 발생했습니다: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSuggestions = async () => {
        setIsLoading(true);
        try {
            // [수정] 답변 기능을 위해 id와 suggestions_reply 컬럼 추가 조회
            const { data, error } = await supabase.from('user_profiles').select('id, email, suggestions, suggestions_reply').not('suggestions', 'is', null);
            if (error) throw error;
            setSuggestions(data || []);
        } catch (err) {
            console.error('Suggestions Fetch Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // [추가] 관리자 답변 전송 함수
    const sendReply = async (userId, replyText) => {
        if (!confirm('답변을 전송하시겠습니까? 사용자의 상단 배너에 표시됩니다.')) return;
        const { error } = await supabase.from('user_profiles')
            .update({ suggestions_reply: replyText, suggestions_reply_isread: false })
            .eq('id', userId);
        
        if (error) alert('전송 실패: ' + error.message);
        else { alert('답변이 전송되었습니다.'); fetchSuggestions(); }
    };

    const toggleUserPro = async (userId, currentStatus) => {
        if (!confirm(`이 사용자의 PRO 권한을 ${currentStatus ? '해제' : '부여'}하시겠습니까?`)) return;
        const { error } = await supabase.from('user_profiles').update({ is_paid: !currentStatus }).eq('id', userId);
        if (error) alert('수정 실패: ' + error.message);
        else {
            setUsers(users.map(u => u.id === userId ? { ...u, is_paid: !currentStatus } : u));
            fetchStats(); // 통계 갱신
        }
    };

    const fetchNotice = async () => {
        const { data } = await supabase.from('notices').select('content').eq('is_active', true).order('created_at', { ascending: false }).limit(1).maybeSingle();
        if (data) setNoticeContent(data.content);
    };

    const saveNotice = async () => {
        if (!confirm('전체 사용자에게 공지사항을 띄우시겠습니까?')) return;
        // 기존 공지 비활성화 후 새 공지 등록
        await supabase.from('notices').update({ is_active: false }).eq('is_active', true);
        if (noticeContent.trim()) {
            await supabase.from('notices').insert({ content: noticeContent, is_active: true });
        }
        alert('공지사항이 업데이트되었습니다.');
    };

    // [추가] 공지 내리기 함수
    const withdrawNotice = async () => {
        if (!confirm('현재 게시 중인 공지사항을 내리시겠습니까?')) return;
        await supabase.from('notices').update({ is_active: false }).eq('is_active', true);
        setNoticeContent('');
        alert('공지사항이 내려갔습니다.');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[130] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col animate-in zoom-in duration-300 overflow-hidden">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-purple-50 dark:bg-purple-900/20">
                    <h3 className="text-lg font-bold text-purple-800 dark:text-purple-300 flex items-center gap-2">🛡️ 관리자 대시보드</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">✕</button>
                </div>
                
                <div className="flex border-b dark:border-gray-700">
                    {['stats', 'users', 'suggestions', 'notice'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === tab ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/10' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                            {tab === 'stats' ? '📊 통계' : tab === 'users' ? '👥 유저 관리' : tab === 'suggestions' ? '📬 의견함' : '📢 공지사항'}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
                    {activeTab === 'stats' && (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden border dark:border-gray-700">
                                <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                    <h4 className="font-bold text-gray-900 dark:text-white">📊 익명 자산 통계 요약</h4>
                                    <p className="text-xs text-gray-500 mt-1">데이터 활용에 동의한 사용자의 최신 데이터를 기반으로 산출된 통계입니다.</p>
                                </div>
                                {isLoading ? (
                                    <div className="p-10 text-center text-gray-500">데이터 분석 중...</div>
                                ) : stats.insights ? (
                                    <div className="p-4">
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                                                <div className="text-xs text-gray-500 dark:text-gray-400">총 가입자</div>
                                                <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.insights.totalUsers.toLocaleString()}명</div>
                                            </div>
                                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                                                <div className="text-xs text-blue-600 dark:text-blue-400">분석 대상 (동의)</div>
                                                <div className="text-xl font-bold text-blue-700 dark:text-blue-300">{stats.insights.sampleSize.toLocaleString()}명</div>
                                            </div>
                                        </div>
                                        
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                                <tr>
                                                    <th className="p-4">구분</th>
                                                    <th className="p-4 text-right">평균값</th>
                                                    <th className="p-4 text-right">중위값</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y dark:divide-gray-700">
                                                <tr>
                                                    <td className="p-4 font-medium dark:text-gray-300">총자산 (부채 제외)</td>
                                                    <td className="p-4 text-right font-bold text-blue-600 dark:text-blue-400">{stats.insights.avgTotal.toLocaleString()}만원</td>
                                                    <td className="p-4 text-right">{stats.insights.medianTotal.toLocaleString()}만원</td>
                                                </tr>
                                                <tr>
                                                    <td className="p-4 font-medium dark:text-gray-300">부채</td>
                                                    <td className="p-4 text-right font-bold text-red-500">{stats.insights.avgDebt.toLocaleString()}만원</td>
                                                    <td className="p-4 text-right">{stats.insights.medianDebt.toLocaleString()}만원</td>
                                                </tr>
                                                <tr>
                                                    <td className="p-4 font-medium dark:text-gray-300">순자산</td>
                                                    <td className="p-4 text-right font-bold text-green-600 dark:text-green-400">{stats.insights.avgNet.toLocaleString()}만원</td>
                                                    <td className="p-4 text-right">{stats.insights.medianNet.toLocaleString()}만원</td>
                                                </tr>
                                                <tr>
                                                    <td className="p-4 font-medium dark:text-gray-300">월 고정 소득</td>
                                                    <td className="p-4 text-right font-bold text-blue-600 dark:text-blue-400">{stats.insights.avgIncome.toLocaleString()}만원</td>
                                                    <td className="p-4 text-right">{stats.insights.medianIncome.toLocaleString()}만원</td>
                                                </tr>
                                                <tr>
                                                    <td className="p-4 font-medium dark:text-gray-300">월 고정 소비</td>
                                                    <td className="p-4 text-right font-bold text-red-500">{stats.insights.avgExpense.toLocaleString()}만원</td>
                                                    <td className="p-4 text-right">{stats.insights.medianExpense.toLocaleString()}만원</td>
                                                </tr>
                                                <tr>
                                                    <td className="p-4 font-medium dark:text-gray-300">월 자본 소득 (순수익)</td>
                                                    <td className="p-4 text-right font-bold text-emerald-600 dark:text-emerald-400">{stats.insights.avgCapIncome.toLocaleString()}만원</td>
                                                    <td className="p-4 text-right">{stats.insights.medianCapIncome.toLocaleString()}만원</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-10 text-center text-gray-500">통계를 낼 충분한 데이터가 없습니다.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input type="text" placeholder="이메일 검색..." className="flex-1 border rounded-lg px-4 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchUsers()} />
                                <button onClick={fetchUsers} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">검색</button>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                        <tr><th className="p-3">이메일</th><th className="p-3">상태</th><th className="p-3">관리</th></tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-gray-700">
                                        {users.map(u => (
                                            <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="p-3 dark:text-gray-300">{u.email}</td>
                                                <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs font-bold ${u.is_paid ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>{u.is_paid ? 'PRO' : 'FREE'}</span></td>
                                                <td className="p-3"><button onClick={() => toggleUserPro(u.id, u.is_paid)} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">권한변경</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {isLoading && <div className="p-4 text-center text-gray-500">로딩 중...</div>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'suggestions' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                <span className="text-sm font-bold text-gray-900 dark:text-white">플로팅 버튼(의견함) 활성화</span>
                                <input type="checkbox" checked={showSuggestionButton} onChange={(e) => onToggleSuggestionButton(e.target.checked)} className="w-5 h-5 accent-purple-600 cursor-pointer" />
                            </div>
                            {suggestions.length === 0 ? (
                                <div className="text-center text-gray-500 py-10">접수된 의견이 없습니다.</div>
                            ) : (
                                suggestions.map((item, idx) => (
                                    <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-gray-900 dark:text-white">{item.email}</span>
                                            {item.suggestions_reply && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">답변 완료</span>}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-3 rounded-lg mb-3">{item.suggestions}</div>
                                        
                                        {/* [추가] 답변 입력 폼 */}
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                placeholder="답변 입력 (사용자에게 배너로 표시됨)" 
                                                className="flex-1 border rounded px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                defaultValue={item.suggestions_reply || ''}
                                                id={`reply-${item.id}`}
                                            />
                                            <button onClick={() => sendReply(item.id, document.getElementById(`reply-${item.id}`).value)} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">전송</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'notice' && (
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                            <h4 className="font-bold mb-4 dark:text-white">전체 공지사항 발송</h4>
                            <textarea className="w-full h-32 border rounded-lg p-3 mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="공지 내용을 입력하세요. (비워두고 저장하면 공지가 내려갑니다)" value={noticeContent} onChange={e => setNoticeContent(e.target.value)}></textarea>
                            <div className="flex gap-2">
                                <button onClick={withdrawNotice} className="flex-1 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 py-3 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600">공지 내리기</button>
                                <button onClick={saveNotice} className="flex-[2] bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700">공지사항 게시 (즉시 전송)</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

window.DataConsentModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in zoom-in duration-300">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📊 데이터 익명 활용 동의</h3>
                <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300 max-h-[60vh] overflow-y-auto custom-scrollbar p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl mb-6 border border-gray-100 dark:border-gray-700">
                    <p className="font-medium">더 나은 서비스를 제공하기 위해 귀하의 자산 데이터를 <span className="text-blue-600 dark:text-blue-400 font-bold">익명화</span>하여 통계 자료로 활용하고자 합니다.</p>
                    
                    <h4 className="font-bold text-gray-800 dark:text-white mt-4 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs">1</span> 수집 및 활용 목적
                    </h4>
                    <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
                        <li>사용자 평균 자산, 연령대별 자산 분포 등 통계 지표 산출</li>
                        <li>AI 자산 분석 모델의 정확도 향상 및 학습 데이터 활용</li>
                        <li>서비스 기능 개선 및 신규 기능(예: 또래 비교) 기획</li>
                    </ul>

                    <h4 className="font-bold text-gray-800 dark:text-white mt-4 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs">2</span> 익명성 보장
                    </h4>
                    <p className="text-xs ml-2">수집된 데이터는 개인을 식별할 수 없는 형태로 가공되며, 이메일이나 이름 등 개인정보와는 <span className="font-bold">엄격히 분리되어 저장</span>됩니다.</p>

                    <h4 className="font-bold text-gray-800 dark:text-white mt-4 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs">3</span> 혜택
                    </h4>
                    <p className="text-xs ml-2">동의 시, 추후 제공될 '내 자산 순위 비교' 및 '연령대별 평균 비교' 기능을 무료로 이용하실 수 있습니다.</p>
                    <p className="text-[10px] text-gray-400 mt-4 text-center">* 동의는 [설정] 메뉴에서 언제든지 철회할 수 있습니다.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-bold transition-colors text-sm">나중에 하기</button>
                    <button onClick={onConfirm} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-colors text-sm">동의하고 시작하기</button>
                </div>
            </div>
        </div>
    );
};

window.ScreenshotImportModal = ({ isOpen, onClose, appData, setAppData, addToast }) => {
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('asset_gemini_api_key') || '');
    const [showKeyInput, setShowKeyInput] = useState(() => !localStorage.getItem('asset_gemini_api_key'));
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);

    useEffect(() => {
        if (!isOpen) {
            setImage(null);
            setImagePreview('');
            setAnalysisResult(null);
            setError('');
        }
    }, [isOpen]);

    // 클립보드 붙여넣기 (Ctrl + V) 이벤트 감지
    useEffect(() => {
        if (!isOpen) return;
        const handlePaste = (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const blob = items[i].getAsFile();
                    setImage(blob);
                    const reader = new FileReader();
                    reader.onload = (event) => setImagePreview(event.target.result);
                    reader.readAsDataURL(blob);
                    addToast('📋 클립보드에서 이미지가 붙여넣어졌습니다.', 'success');
                    break;
                }
            }
        };
        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [isOpen, addToast]);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onload = (event) => setImagePreview(event.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setImage(file);
            const reader = new FileReader();
            reader.onload = (event) => setImagePreview(event.target.result);
            reader.readAsDataURL(file);
        }
    };

    const runMatchingAlgorithm = (extractedList) => {
        const currentAssets = appData.assets || {};
        const matched = [];
        
        extractedList.forEach(item => {
            // [Fail-safe] 금액이 만원 단위가 아닌 원화(e.g., 5,000,000)로 오추출된 경우 보정
            let safeAmount = item.amount;
            if (safeAmount > 50000) {
                safeAmount = Math.round(safeAmount / 10000);
            }

            // [Fail-safe] 개별 주식의 가격이 만원 단위(e.g., 7.5)로 오추출된 경우 원화(75,000)로 복원
            let safeStockItems = item.stockItems;
            if (Array.isArray(safeStockItems)) {
                safeStockItems = safeStockItems.map(s => {
                    let avg = parseFloat(s.avgPrice) || 0;
                    let cur = parseFloat(s.currentPrice) || 0;
                    const shares = parseFloat(s.shares) || 0;
                    const tickerStr = String(s.ticker || '');
                    const isKorean = s.currency === 'KRW' || /^\d{6}/.test(tickerStr) || tickerStr.endsWith('.KS') || tickerStr.endsWith('.KQ');
                    
                    if (isKorean) {
                        if (avg > 0 && avg < 1000) avg *= 10000;
                        if (cur > 0 && cur < 1000) cur *= 10000;
                        
                        // [추가 Fail-safe] AI가 총매입금액이나 평가손익을 매입단가(평단가)로 혼동하여 극단적으로 큰 값을 추출했을 때 보정
                        if (avg > 0 && cur > 0 && (avg / cur >= 3.0)) {
                            if (shares > 0) {
                                // 총액을 수량으로 나눠 단가를 복원하되 자릿수(100배율 등)를 고려한 보정치 검증
                                const tempAvg = (avg * 100) / shares;
                                if (tempAvg / cur >= 0.5 && tempAvg / cur <= 2.0) {
                                    avg = Math.round(tempAvg);
                                } else {
                                    // 자릿수 보정마저 안 되는 완전한 노이즈라면 안전하게 현재가로 대체
                                    avg = cur;
                                }
                            } else {
                                avg = cur;
                            }
                        }
                    }
                    return { ...s, avgPrice: avg, currentPrice: cur };
                });
            }

            if (item.matchedId) {
                let existingAsset = null;
                let existingSector = null;

                // Find the existing asset by matchedId provided by Gemini
                Object.keys(currentAssets).forEach(sector => {
                    const list = currentAssets[sector] || [];
                    const found = list.find(a => a.id === item.matchedId);
                    if (found) {
                        existingAsset = found;
                        existingSector = sector;
                    }
                });

                if (existingAsset) {
                    matched.push({
                        id: Math.random().toString(36).substring(2, 9),
                        selected: true,
                        isNew: false,
                        extractedName: item.name,
                        amount: safeAmount,
                        existingAsset: existingAsset,
                        existingSector: existingSector,
                        sector: existingSector,
                        stockItems: safeStockItems,
                        selectedTargetId: existingAsset.id || existingAsset.name
                    });
                    return;
                }
            }

            // If not matched or no matchedId, treat as new asset
            matched.push({
                id: Math.random().toString(36).substring(2, 9),
                selected: true,
                isNew: true,
                extractedName: item.name,
                amount: safeAmount,
                sector: item.sector || 'deposit',
                stockItems: safeStockItems,
                selectedTargetId: 'new_' + (item.sector || 'deposit')
            });
        });

        setAnalysisResult(matched);
    };

    const handleAnalyzeImage = async () => {
        const trimmedKey = apiKey.trim();
        if (!trimmedKey) { setError('API 키를 입력해주세요.'); return; }
        if (!image) { setError('분석할 이미지를 업로드하거나 붙여넣어주세요.'); return; }
        localStorage.setItem('asset_gemini_api_key', trimmedKey);
        setShowKeyInput(false);

        setLoading(true);
        setError('');
        setAnalysisResult(null);

        try {
            const base64Data = imagePreview.split(',')[1];
            const mimeType = image.type || 'image/png';

            // Gather list of existing assets to pass to the Gemini prompt
            const currentAssets = appData.assets || {};
            const currentAssetsList = [];
            Object.keys(currentAssets).forEach(sector => {
                (currentAssets[sector] || []).forEach(asset => {
                    currentAssetsList.push({
                        id: asset.id,
                        name: asset.name,
                        amount: asset.amount,
                        sector: sector
                    });
                });
            });

            const prompt = `당신은 금융 분석 및 자산 매칭 전문가입니다. 
이 이미지(금융 스크샷)에서 계좌명, 자산명, 주식이름, 대출명 등 식별 가능한 모든 자산의 명칭과 해당 잔액(금액)을 추출해 주세요. 
금액은 한국 원화 기준이며 반드시 만원 단위로 변환해 주세요 (예: 50,000원은 5, 1,200,000원은 120, 20,000,000원은 2000). 만약 주식 수량과 단가가 적혀 있다면 총 평가 금액을 계산해서 만원 단위 정수로 추출해 주세요.

또한, 다음은 현재 사용자의 대시보드에 등록되어 있는 기존 자산 목록입니다:
${JSON.stringify(currentAssetsList, null, 2)}

추출한 각 자산 항목에 대해, 기존 자산 목록의 이름, 금액(금액은 최근 변동했을 가능성 고려), 섹터(맥락)를 종합적으로 판단하여 동일한 자산으로 매칭되는 항목이 있는지 파악해 주세요.
- 매칭되는 기존 자산이 있다면: 해당 기존 자산의 'id'를 'matchedId' 필드에 매핑해 주세요.
- 매칭되는 기존 자산이 없다면(새로운 자산인 경우): 'matchedId'를 null로 지정하고, 이 자산이 속할 가장 적절한 카테고리('sector': 'deposit' | 'savings' | 'investment' | 'loan' 중 하나)를 추론해 지정해 주세요.

⚠️주의: 절대 '매입금액(총투자액)'이나 '평가손익'의 숫자와 '매입단가(1주당 가격, 평단가)'를 혼동하여 추출하지 마세요. 매입단가(avgPrice)는 현재가(currentPrice)와 자릿수(액수 범위)가 비슷해야 합니다. (예: 현재가가 13420원인데 매입단가를 매입금액인 5743714원이나 57437원으로 잘못 추출하면 안 됩니다. 이 경우 매입단가는 11000원 대여야 합니다).

★만약 이미지에서 주식/ETF 종목 목록(잔고 수량, 평가금액, 매입단가/평단가, 현재가 등)이 식별된다면, 이를 하나의 통합 주식 계좌("OO증권 주식계좌" 등)에 포함된 종목 리스트 또는 개별 주식 항목으로 추출해 주세요.
주식 항목들은 "stockItems" 배열에 포함시켜야 하며, 각 주식 정보는 다음 필드를 가집니다:
- ticker: 해당 주식의 티커/코드 (예: 국장은 '005930', 미장은 'AAPL', 'TSLA' 등)
- name: 종목명 (예: '삼성전자', '테슬라' 등)
- shares: 잔고 수량 (숫자)
- avgPrice: 매입단가 (숫자, 평단가)
- currentPrice: 현재단가 (숫자)
- currency: 화폐 단위 ('KRW' 또는 'USD')

결과는 오직 다음 형식의 JSON 객체로만 답해 주세요. 다른 설명 텍스트나 코드 블록 기호는 절대 적지 마세요:

{
  "assets": [
    { 
      "name": "자산명", 
      "amount": 120, 
      "matchedId": "기존 자산의 id 또는 null", 
      "sector": "추론한 sector 또는 null",
      "stockItems": [
        { "ticker": "005930", "name": "삼성전자", "shares": 10, "avgPrice": 75000, "currentPrice": 82000, "currency": "KRW" }
      ]
    }
  ]
}`;

            const body = {
                contents: [
                    {
                        parts: [
                            { text: prompt },
                            {
                                inlineData: {
                                    mimeType: mimeType,
                                    data: base64Data
                                }
                            }
                        ]
                    }
                ]
            };

            const models = ['gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-2.5-flash-lite'];
            
            const tryModel = (index) => {
                if (index >= models.length) {
                    setError('모든 AI 모델(3.1, 3.5, 2.5) 이미지 분석에 실패했습니다. API 키나 크기 제한을 확인해 주세요.');
                    setLoading(false);
                    return;
                }
                
                const currentModel = models[index];
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:streamGenerateContent?alt=sse&key=${trimmedKey}`;
                
                let accumulatedText = '';
                streamGeminiResponse(
                    url,
                    body,
                    (text) => { accumulatedText = text; },
                    (finalText) => {
                        try {
                            let jsonStr = finalText.trim();
                            if (jsonStr.startsWith('```')) {
                                jsonStr = jsonStr.replace(/^```(json)?/, '').replace(/```$/, '').trim();
                            }
                            const parsed = JSON.parse(jsonStr);
                            if (parsed && Array.isArray(parsed.assets)) {
                                runMatchingAlgorithm(parsed.assets);
                                setLoading(false);
                            } else {
                                throw new Error('올바른 assets 배열 형식이 아닙니다.');
                            }
                        } catch (e) {
                            console.warn(`⚠️ JSON parse failed for ${currentModel}:`, e);
                            tryModel(index + 1);
                        }
                    },
                    (err) => {
                        console.warn(`⚠️ Vision Model ${currentModel} failed:`, err);
                        tryModel(index + 1);
                    }
                );
            };

            tryModel(0);
        } catch (err) {
            setError(err.message || '분석 중 알 수 없는 에러가 발생했습니다.');
            setLoading(false);
        }
    };

    const handleApply = () => {
        if (!analysisResult) return;
        
        const updatedAssets = JSON.parse(JSON.stringify(appData.assets || {}));

        analysisResult.forEach(item => {
            if (!item.selected) return;

            if (item.isNew) {
                if (!updatedAssets[item.sector]) {
                    updatedAssets[item.sector] = [];
                }
                const newAsset = {
                    id: 'asset_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
                    name: item.extractedName,
                    amount: item.amount,
                    rate: item.sector === 'loan' ? 4.5 : 2.0,
                    monthlyContrib: 0,
                    memo: '스크린샷 OCR 자동등록'
                };
                if (item.sector === 'loan') {
                    newAsset.repaymentMethod = '원리금균등';
                    newAsset.repaymentAccount = 'salary';
                    newAsset.maturityMonth = 12;
                    newAsset.loanStartDate = new Date().toISOString().slice(0, 7);
                } else {
                    newAsset.feeRate = 0;
                    newAsset.monthlyContributionFrom = window.MONTHLY_INCOME_SOURCE || '월급';
                }
                // 주식 개별종목 연동 데이터 생성
                if (item.stockItems && item.stockItems.length > 0) {
                    newAsset.linkedItems = item.stockItems.map((s, idx) => ({
                        id: 'stock_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).substring(2, 5),
                        ticker: s.ticker,
                        name: s.name,
                        shares: s.shares,
                        avgPrice: s.avgPrice,
                        currentPrice: s.currentPrice,
                        currency: 'KRW', // 무조건 KRW 강제
                        autoUpdate: true
                    }));
                    
                    // 예수금 계산 (자산총액 - 주식 총 평가액)
                    let stockTotalManwon = 0;
                    item.stockItems.forEach(s => {
                        let price = parseFloat(s.currentPrice) || 0;
                        let shares = parseFloat(s.shares) || 0;
                        let val = price * shares; // 달러 환율 무시
                        stockTotalManwon += (val / 10000);
                    });
                    newAsset.baseAmount = Math.max(0, Math.round((item.amount - stockTotalManwon) * 100) / 100); // 예수금 보존
                }
                updatedAssets[item.sector].push(newAsset);
            } else {
                const list = updatedAssets[item.existingSector] || [];
                const target = list.find(a => {
                    const targetId = item.selectedTargetId || (item.existingAsset && (item.existingAsset.id || item.existingAsset.name));
                    return (a.id && a.id === targetId) || (a.name && a.name === targetId);
                });
                if (target) {
                    // 기존 자산 평가액(amount)을 보존 (없다면 새로 추출된 item.amount 사용)
                    const baseTargetAmount = target.amount || item.amount || 0;
                    target.amount = baseTargetAmount;

                    if (item.stockItems && item.stockItems.length > 0) {
                        const currentLinked = Array.isArray(target.linkedItems) ? target.linkedItems : [];
                        
                        // 신규 수신 주식 매핑 (무조건 KRW 강제)
                        const incomingItems = item.stockItems.map((s, idx) => ({
                            id: 'stock_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).substring(2, 5),
                            ticker: s.ticker,
                            name: s.name,
                            shares: s.shares,
                            avgPrice: s.avgPrice,
                            currentPrice: s.currentPrice,
                            currency: 'KRW',
                            autoUpdate: true
                        }));

                        // 티커, 고유 ID, 또는 이름을 기준으로 안전하게 누적 병합 (Merge)
                        const mergedMap = new Map();
                        currentLinked.forEach(existing => {
                            const key = existing.ticker || existing.id || existing.name;
                            if (key) mergedMap.set(key, existing);
                        });
                        incomingItems.forEach(incoming => {
                            const key = incoming.ticker || incoming.id || incoming.name;
                            if (key) mergedMap.set(key, incoming);
                        });
                        target.linkedItems = Array.from(mergedMap.values());
                        
                        // 예수금 계산 (기존 보존액 - 병합된 주식 총 평가액)
                        let stockTotalManwon = 0;
                        target.linkedItems.forEach(s => {
                            let price = parseFloat(s.currentPrice) || 0;
                            let shares = parseFloat(s.shares) || 0;
                            let val = price * shares; // 달러 환율 무시
                            stockTotalManwon += (val / 10000);
                        });
                        
                        // 주식 총액이 기존 계좌 잔액보다 커진 경우, 계좌 총액도 그에 맞춰 상향
                        target.amount = Math.max(baseTargetAmount, Math.round(stockTotalManwon * 100) / 100);
                        target.baseAmount = Math.max(0, Math.round((baseTargetAmount - stockTotalManwon) * 100) / 100);
                    }
                }
            }
        });

        setAppData(prev => ({
            ...prev,
            assets: updatedAssets
        }));

        addToast('🎉 스크린샷 분석 결과가 자산 데이터에 정상 반영되었습니다!', 'success');
        onClose();
    };

    const toggleSelectItem = (id) => {
        setAnalysisResult(prev => prev.map(item => item.id === id ? { ...item, selected: !item.selected } : item));
    };

    const changeNewSector = (id, newSector) => {
        setAnalysisResult(prev => prev.map(item => item.id === id ? { ...item, sector: newSector } : item));
    };

    const allExistingAssets = [];
    Object.keys(appData.assets || {}).forEach(sector => {
        (appData.assets[sector] || []).forEach(asset => {
            allExistingAssets.push({
                id: asset.id || asset.name, // [방어] id가 누락된 경우 자산명을 고유 키로 활용
                name: asset.name,
                amount: asset.amount,
                sector: sector
            });
        });
    });

    if (!isOpen) return null;

    const darkMode = document.documentElement.classList.contains('dark');

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col animate-in zoom-in duration-300 overflow-hidden">
                {/* Header */}
                <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        📷 스크린샷 자산 정보 업데이트
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-5">
                    {error && (
                        <div className="p-3.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl text-sm font-semibold border border-red-100 dark:border-red-900/50">
                            ⚠️ {error}
                        </div>
                    )}

                    {!analysisResult ? (
                        <div className="space-y-4">
                            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-xl text-xs text-blue-800 dark:text-blue-200 border border-blue-100 dark:border-blue-900/50 leading-relaxed">
                                <p className="font-bold mb-1">💡 사용 방법</p>
                                1. 증권사 계좌 목록, 은행 계좌 조회화면, 토스 등의 자산 스크린샷을 찍거나 캡처합니다.<br/>
                                2. 이 모달창을 클릭한 뒤 키보드로 <strong>Ctrl + V</strong>를 눌러 직접 붙여넣거나 아래 박스에 업로드하세요.<br/>
                                3. API 키 입력 후 '분석 시작'을 누르면 AI가 금액과 이름을 추출해 매칭 제안을 드립니다.
                            </div>

                            {/* Drop/Paste area */}
                            <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900/80 transition-all cursor-pointer relative min-h-[160px]"
                                onClick={() => document.getElementById('screenshot-file-input').click()}
                            >
                                <input
                                    id="screenshot-file-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                {imagePreview ? (
                                    <div className="relative max-h-[150px] overflow-hidden rounded-lg">
                                        <img src={imagePreview} alt="Screenshot Preview" className="max-h-[150px] object-contain" />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setImage(null); setImagePreview(''); }}
                                            className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white p-1 rounded-full text-xs"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <span className="text-4xl">📸</span>
                                        <p className="text-sm font-bold text-gray-600 dark:text-gray-300">
                                            스크린샷 이미지 드래그 또는 붙여넣기 (Ctrl + V)
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            클릭하여 탐색기로 파일 선택 가능
                                        </p>
                                    </div>
                                )}
                            </div>

                            {(!showKeyInput && apiKey) ? (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-700/50">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <span>🔑</span>
                                        <span>API 키가 등록되어 있습니다.</span>
                                        <button 
                                            onClick={() => setShowKeyInput(true)} 
                                            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline font-bold ml-1"
                                        >
                                            변경
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleAnalyzeImage}
                                        disabled={loading || !image}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap w-full sm:w-auto"
                                    >
                                        {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> 분석 중...</> : '분석 시작'}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="password"
                                        placeholder="Gemini API Key 입력"
                                        className="flex-1 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                    />
                                    <button
                                        onClick={handleAnalyzeImage}
                                        disabled={loading || !image || !apiKey}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
                                    >
                                        {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> 분석 중...</> : '분석 시작'}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h4 className="font-bold text-sm text-gray-700 dark:text-gray-200">🔍 AI 자산 매칭 분석 결과</h4>
                            <div className="space-y-2 max-h-[450px] overflow-y-auto custom-scrollbar pr-1">
                                {analysisResult.map((item) => (
                                    <div 
                                        key={item.id}
                                        className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                                            !item.selected 
                                                ? 'bg-gray-50/50 dark:bg-gray-900/30 border-gray-100 dark:border-gray-800 opacity-60' 
                                                : item.isNew 
                                                    ? 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200/60 dark:border-emerald-900/40' 
                                                    : 'bg-indigo-50/40 dark:bg-indigo-950/10 border-indigo-200/60 dark:border-indigo-900/40'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="checkbox" 
                                                checked={item.selected} 
                                                onChange={() => toggleSelectItem(item.id)}
                                                className="w-4.5 h-4.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{item.extractedName}</span>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-black ${
                                                        item.isNew 
                                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' 
                                                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300'
                                                    }`}>
                                                        {item.isNew ? '신규 감지' : '기존 매칭'}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex flex-wrap items-center gap-2">
                                                    <span>대상 지정:</span>
                                                    <select
                                                        value={item.selectedTargetId || ''}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val.startsWith('new_')) {
                                                                const sector = val.replace('new_', '');
                                                                setAnalysisResult(prev => prev.map(a => a.id === item.id ? { 
                                                                    ...a, 
                                                                    isNew: true, 
                                                                    sector: sector,
                                                                    existingAsset: null,
                                                                    existingSector: null,
                                                                    selectedTargetId: val
                                                                } : a));
                                                            } else {
                                                                const matchedAsset = allExistingAssets.find(a => a.id === val);
                                                                if (matchedAsset) {
                                                                    // appData.assets에서 진짜 원본 자산 매핑을 추출하여 상태 유지
                                                                    let realAsset = null;
                                                                    Object.keys(appData.assets || {}).forEach(sec => {
                                                                        const found = (appData.assets[sec] || []).find(x => (x.id || x.name) === val);
                                                                        if (found) realAsset = found;
                                                                    });
                                                                    
                                                                    setAnalysisResult(prev => prev.map(a => a.id === item.id ? { 
                                                                        ...a, 
                                                                        isNew: false, 
                                                                        sector: matchedAsset.sector,
                                                                        existingSector: matchedAsset.sector,
                                                                        existingAsset: realAsset || matchedAsset,
                                                                        selectedTargetId: val
                                                                    } : a));
                                                                }
                                                            }
                                                        }}
                                                        className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 dark:text-gray-200 cursor-pointer max-w-[180px] sm:max-w-[220px] truncate"
                                                    >
                                                        <optgroup label="신규 자산 등록">
                                                            <option value="new_deposit">📥 입출금(현금)으로 신규 등록</option>
                                                            <option value="new_savings">📥 예적금/청약으로 신규 등록</option>
                                                            <option value="new_investment">📥 투자(주식/펀드)로 신규 등록</option>
                                                            <option value="new_loan">📥 대출/부채로 신규 등록</option>
                                                        </optgroup>
                                                        {allExistingAssets.length > 0 && (
                                                            <optgroup label="기존 자산 업데이트">
                                                                {allExistingAssets.map(a => (
                                                                    <option key={a.id} value={a.id}>
                                                                        🔄 {a.name} ({Math.round(a.amount).toLocaleString()}만원)
                                                                    </option>
                                                                ))}
                                                            </optgroup>
                                                        )}
                                                    </select>
                                                </div>
                                                {/* 개별 종목 추출 결과 표시 */}
                                                {item.stockItems && item.stockItems.length > 0 && (
                                                    <div className="mt-2.5 pl-3 border-l-2 border-indigo-200 dark:border-indigo-800 space-y-1.5">
                                                        {item.stockItems.map((stock, sidx) => (
                                                            <div key={sidx} className="text-[11px] text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-1.5 font-sans">
                                                                <span className="font-bold text-gray-800 dark:text-gray-200">{stock.name}</span>
                                                                <span className="text-[10px] text-gray-400 font-mono">({stock.ticker})</span>
                                                                <span className="text-gray-300 dark:text-gray-700">|</span>
                                                                <span>{stock.shares.toLocaleString()}주</span>
                                                                <span className="text-gray-300 dark:text-gray-700">|</span>
                                                                <span>평단 {stock.avgPrice.toLocaleString()}원</span>
                                                                <span className="text-gray-400 dark:text-gray-500">→</span>
                                                                <span className={stock.currentPrice > stock.avgPrice ? "text-rose-500 font-bold" : stock.currentPrice < stock.avgPrice ? "text-blue-500 font-bold" : "text-gray-500 font-bold"}>
                                                                    {stock.currentPrice.toLocaleString()}원
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="font-bold text-sm text-gray-900 dark:text-white">{item.amount.toLocaleString()}만원</div>
                                            {!item.isNew && (
                                                <div className="text-[10px] text-gray-400 mt-0.5">
                                                    기존: {Math.round(item.existingAsset.amount).toLocaleString()}만원 
                                                    <span className={`ml-1 font-bold ${item.amount > item.existingAsset.amount ? 'text-rose-500' : item.amount < item.existingAsset.amount ? 'text-blue-500' : 'text-gray-400'}`}>
                                                        {item.amount > item.existingAsset.amount ? `(+${Math.round(item.amount - item.existingAsset.amount)})` : item.amount < item.existingAsset.amount ? `(-${Math.round(item.existingAsset.amount - item.amount)})` : '(동일)'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <button onClick={() => setAnalysisResult(null)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white rounded-xl font-bold text-sm transition-colors">
                                    ↩ 다시 분석
                                </button>
                                <button onClick={handleApply} className="flex-[2] py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/35 transition-all">
                                    💾 자산 데이터 반영하기
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// [추가] API 키 및 실시간 시세 연동 설정 모달
window.ApiKeyModal = ({ isOpen, onClose }) => {
    const [geminiKey, setGeminiKey] = React.useState(() => localStorage.getItem('asset_gemini_api_key') || '');
    const [tossId, setTossId] = React.useState(() => localStorage.getItem('toss_client_id') || '');
    const [tossSecret, setTossSecret] = React.useState(() => localStorage.getItem('toss_client_secret') || '');
    const [liveEnabled, setLiveEnabled] = React.useState(() => localStorage.getItem('toss_live_price_enabled') === 'true');

    if (!isOpen) return null;

    const handleSave = () => {
        localStorage.setItem('asset_gemini_api_key', geminiKey.trim());
        localStorage.setItem('toss_client_id', tossId.trim());
        localStorage.setItem('toss_client_secret', tossSecret.trim());
        localStorage.setItem('toss_live_price_enabled', liveEnabled ? 'true' : 'false');
        
        // 토스 인증 캐시 강제 만료
        localStorage.removeItem('toss_access_token');
        localStorage.removeItem('toss_token_expiry');
        
        onClose();
        if (window.dispatchEvent) {
            window.dispatchEvent(new Event('storage'));
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[160] p-4 font-sans">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200 border dark:border-slate-700">
                {/* Header */}
                <div className="px-6 py-5 border-b dark:border-slate-700 flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/20">
                    <div>
                        <h3 className="text-lg font-black text-indigo-950 dark:text-indigo-100 flex items-center gap-2">🔑 API 키 및 연동 설정</h3>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-1">AI 기능 및 증권 계좌 실시간 연동을 설정합니다.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-indigo-100 dark:hover:bg-indigo-800 rounded-full text-indigo-400 transition-colors">✕</button>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Google Gemini AI Key */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-700 dark:text-slate-200 flex justify-between items-center">
                            <span>🤖 Google Gemini API Key</span>
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold">
                                API 키 발급받기 ↗
                            </a>
                        </label>
                        <input
                            type="password"
                            placeholder="AI 자산 분석 및 OCR을 위한 키 입력"
                            value={geminiKey}
                            onChange={(e) => setGeminiKey(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 transition-all shadow-sm"
                        />
                        <p className="text-[10px] text-slate-400">자산 분석 조언 기능 및 스크린샷 이미지 종목 일괄 추출에 사용됩니다.</p>
                    </div>

                    <div className="border-t dark:border-slate-700 my-4"></div>

                    {/* Toss Securities API */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-black text-slate-700 dark:text-slate-200">
                                📈 토스증권 Open API 연동
                            </label>
                            <span className="text-[9px] font-bold text-slate-400">{"토스 WTS > 설정 > Open API 발급"}</span>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Client ID</label>
                            <input
                                type="text"
                                placeholder="Toss API Client ID 입력"
                                value={tossId}
                                onChange={(e) => setTossId(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 transition-all shadow-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Client Secret</label>
                            <input
                                type="password"
                                placeholder="Toss API Client Secret 입력"
                                value={tossSecret}
                                onChange={(e) => setTossSecret(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 transition-all shadow-sm"
                            />
                        </div>

                        {/* Realtime ON/OFF radio style buttons */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border dark:border-slate-700 flex justify-between items-center">
                            <div>
                                <span className="text-xs font-black text-slate-700 dark:text-slate-200 block">⚡ 실시간 시세 연동</span>
                                <span className="text-[10px] text-slate-400 block mt-0.5">ON 설정 시 1분 간격으로 현재가를 자동 조회합니다.</span>
                            </div>
                            <div className="flex bg-slate-200 dark:bg-slate-950 p-1 rounded-xl border dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setLiveEnabled(true)}
                                    className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${liveEnabled ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    ON
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLiveEnabled(false)}
                                    className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${!liveEnabled ? 'bg-slate-400 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    OFF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer buttons */}
                <div className="px-6 py-4 border-t dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow transition-colors"
                    >
                        설정 저장
                    </button>
                </div>
            </div>
        </div>
    );
};