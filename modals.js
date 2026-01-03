// modals.js - 모달 및 가이드 컴포넌트 모음
const { useState, useMemo, useEffect, useRef } = React;

// [추가] 토스트 알림 컴포넌트
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

window.DataTransferModal = ({ isOpen, onClose, onConfirm, type, initialSelection }) => {
    const [selectedItems, setSelectedItems] = useState(initialSelection || { appData: true, scenarios: true, assetHistory: true });
    const handleCheckboxChange = (e) => {
        setSelectedItems(prev => ({ ...prev, [e.target.name]: e.target.checked }));
    };
    const handleConfirm = () => {
        onConfirm(selectedItems);
        onClose();
    };
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-96">
                <h3 className="text-lg font-semibold mb-4">{type === 'export' ? '데이터 내보내기' : '데이터 불러오기'}</h3>
                <p className="text-sm text-gray-600 mb-4">
                    {type === 'export' ? '내보낼 데이터 항목을 선택하세요.' : '불러올 데이터 항목을 선택하세요. (기존 데이터는 덮어쓰여집니다.)'}
                </p>
                <div className="space-y-2 mb-6">
                    <label className="flex items-center">
                        <input type="checkbox" name="appData" checked={selectedItems.appData} onChange={handleCheckboxChange} className="mr-2" /> 
                        <span className="text-gray-800">기본 자산 데이터 (계좌, 지출, 이벤트, 메모 등)</span>
                    </label>
                    <label className="flex items-center">
                        <input type="checkbox" name="scenarios" checked={selectedItems.scenarios} onChange={handleCheckboxChange} className="mr-2" />
                        <span className="text-gray-800">저장된 시나리오</span>
                    </label>
                    <label className="flex items-center">
                        <input type="checkbox" name="assetHistory" checked={selectedItems.assetHistory} onChange={handleCheckboxChange} className="mr-2" />
                        <span className="text-gray-800">자산 히스토리</span>
                    </label>
                </div>
                <div className="flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">취소</button>
                    <button onClick={handleConfirm} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">확인</button>
                </div>
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
                    - 서비스 제공 및 콘텐츠 이용: 자산 시뮬레이션 데이터 저장 및 동기화 (선택 사항)</p>

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
                </div>
                <div className="p-6 border-t dark:border-gray-700 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">닫기</button>
                </div>
            </div>
        </div>
    );
};

window.SuggestionModal = ({ isOpen, onClose, onSubmit }) => {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    if (!isOpen) return null;
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

window.PasswordPromptModal = ({ isOpen, onConfirm, onCancel }) => {
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
            </div>
        </div>
    );
};

window.ProFeaturesModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
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
                                <td className="px-4 py-3 text-center text-gray-500">로컬 저장</td>
                                <td className="px-4 py-3 text-center font-semibold dark:text-white">클라우드 동기화</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 dark:text-gray-300">테마 설정</td>
                                <td className="px-4 py-3 text-center text-gray-500">-</td>
                                <td className="px-4 py-3 text-center font-semibold dark:text-white">다크모드 완벽 지원</td>
                            </tr>
                        </tbody>
                    </table>
                    <button onClick={() => window.open('https://blog.naver.com/zocdoc', '_blank')} className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors">개발자 후원하고 PRO 활성화하기</button>
                </div>
            </div>
        </div>
    );
};

window.OnboardingGuide = ({ isOpen, onClose, scrollToPanel, isPro }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [spotlightStyle, setSpotlightStyle] = useState(null);
    const tooltipRef = useRef(null);
    const ONBOARDING_STEPS = window.ONBOARDING_STEPS || [];

    useEffect(() => {
        if (isOpen) {
            const step = ONBOARDING_STEPS[currentStep];
            const isMobile = window.innerWidth < 640;
            const targetId = (isMobile && step.id === 'header-actions') ? 'mobile-menu-trigger' : step.id;
            const el = document.getElementById(targetId);
            if (el) {
                // 1. 타겟 요소로 스크롤
                el.scrollIntoView({ behavior: 'auto', block: 'center' });
                
                const updatedRect = el.getBoundingClientRect();
                const padding = 10;
                const tooltipHeight = tooltipRef.current ? tooltipRef.current.offsetHeight : 220;
                const tooltipWidth = tooltipRef.current ? tooltipRef.current.offsetWidth : 320;
                
                let tooltipTop, tooltipLeft;
                if (isMobile) {
                    tooltipTop = window.scrollY + (window.innerHeight - tooltipHeight) / 2;
                    tooltipLeft = (window.innerWidth - tooltipWidth) / 2;
                } else {
                    if (updatedRect.top < window.innerHeight / 2) {
                        tooltipTop = updatedRect.bottom + window.scrollY + 15;
                    } else {
                        tooltipTop = updatedRect.top + window.scrollY - tooltipHeight - 15;
                    }
                    tooltipLeft = Math.min(window.innerWidth - 340, Math.max(20, updatedRect.left + window.scrollX + (updatedRect.width / 2) - 160));
                }

                setSpotlightStyle({
                    top: updatedRect.top + window.scrollY - padding,
                    left: updatedRect.left + window.scrollX - padding,
                    width: updatedRect.width + (padding * 2),
                    height: updatedRect.height + (padding * 2),
                    tooltipTop: tooltipTop,
                    tooltipLeft: tooltipLeft
                });

                // 2. 부드러운 슬라이드 애니메이션 (1초 대기 후 시작)
                const timer = setTimeout(() => {
                    const tHeight = tooltipRef.current ? tooltipRef.current.offsetHeight : 220;
                    const targetY = tooltipTop - (window.innerHeight / 2) + (tHeight / 2);
                    const startY = window.scrollY;
                    const distance = targetY - startY;
                    const duration = 1500;
                    let startTime = null;
                    const smoothStep = (currentTime) => {
                        if (!startTime) startTime = currentTime;
                        const timeElapsed = currentTime - startTime;
                        const progress = Math.min(timeElapsed / duration, 1);
                        const easing = progress < 0.5 ? 4 * progress * progress * progress : (progress - 1) * (2 * progress - 2) * (2 * progress - 2) + 1;
                        window.scrollTo(0, startY + distance * easing);
                        if (timeElapsed < duration) requestAnimationFrame(smoothStep);
                    };
                    requestAnimationFrame(smoothStep);
                }, 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [currentStep, isOpen]);

    if (!isOpen || !spotlightStyle) return null;
    const current = ONBOARDING_STEPS[currentStep];

    return (
        <div className="absolute inset-0 z-[9999] pointer-events-none overflow-hidden transition-colors duration-500" style={{ height: document.documentElement.scrollHeight }}>
            <div className="absolute rounded-lg transition-all duration-500 ease-in-out pointer-events-auto" style={{ top: spotlightStyle.top, left: spotlightStyle.left, width: spotlightStyle.width, height: spotlightStyle.height, boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)' }} />
            <div ref={tooltipRef} className="absolute pointer-events-auto w-72 sm:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 transition-all duration-500" style={{ top: spotlightStyle.tooltipTop, left: spotlightStyle.tooltipLeft }}>
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Step {currentStep + 1} of {ONBOARDING_STEPS.length}</span>
                </div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{current.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{current.content}</p>
                <div className="flex justify-between items-center">
                    <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 underline">Skip</button>
                    <button onClick={() => currentStep < ONBOARDING_STEPS.length - 1 ? setCurrentStep(s => s + 1) : onClose()} className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md">
                        {currentStep === ONBOARDING_STEPS.length - 1 ? '시작하기' : '다음'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// [추가] 통합 설정 모달 (PRO 전용)
window.SettingsModal = ({ 
    isOpen, onClose, encryptionMode, onModeChange, 
    darkMode, onThemeToggle, logoutBehavior, onLogoutBehaviorChange,
    onSyncNow, onLogout 
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
                        <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-3">🔐 데이터 보안 (종단간 암호화)</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => onModeChange('normal')} className={`p-3 rounded-xl border-2 transition-all text-left ${encryptionMode === 'normal' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-100 dark:border-gray-700'}`}>
                                <div className="text-sm font-bold dark:text-white">일반 모드</div>
                                <div className="text-[10px] text-gray-500">일반 암호화</div>
                            </button>
                            <button onClick={() => onModeChange('secure')} className={`p-3 rounded-xl border-2 transition-all text-left ${encryptionMode === 'secure' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-100 dark:border-gray-700'}`}>
                                <div className="text-sm font-bold dark:text-white">강화 모드</div>
                                <div className="text-[10px] text-gray-500">비밀번호 기반 암호화</div>
                            </button>
                        </div>
                    </section>
                    {/* 테마 설정 */}
                    <section>
                        <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-3">🎨 화면 테마</h4>
                        <button onClick={onThemeToggle} className="w-full p-3 rounded-xl border-2 border-gray-100 dark:border-gray-700 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <span className="text-sm font-medium dark:text-white">{darkMode ? '🌙 다크 모드 사용 중' : '☀️ 라이트 모드 사용 중'}</span>
                            <span className="text-xs text-indigo-600 font-bold">변경하기</span>
                        </button>
                    </section>
                    {/* 로그아웃 정책 */}
                    <section>
                        <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-3">🚪 로그아웃 시 데이터 처리</h4>
                        <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
                            <button onClick={() => onLogoutBehaviorChange('keep')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${logoutBehavior === 'keep' ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm' : 'text-gray-500'}`}>로컬 데이터 유지</button>
                            <button onClick={() => onLogoutBehaviorChange('reset')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${logoutBehavior === 'reset' ? 'bg-white dark:bg-gray-700 text-red-600 shadow-sm' : 'text-gray-500'}`}>데이터 즉시 삭제</button>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2 px-1">
                            {logoutBehavior === 'keep' ? '로그아웃 후에도 이 브라우저에 자산 데이터가 남습니다.' : '로그아웃 시 보안을 위해 브라우저의 모든 데이터를 초기화합니다.'}
                        </p>
                    </section>
                    {/* 동기화 및 로그아웃 */}
                    <div className="pt-4 border-t dark:border-gray-700 space-y-2">
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