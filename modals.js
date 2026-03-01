// modals.js - 모달 및 가이드 컴포넌트 모음
const { useState, useMemo, useEffect, useRef } = React;

// [이동] 스마트 툴팁 가이드 컴포넌트 (index.html -> modals.js)
window.TooltipGuide = ({ tip }) => (
    <span className="group relative inline-block ml-1 align-middle">
        <svg className="w-4 h-4 text-gray-400 cursor-help hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-56 p-2.5 bg-gray-800/95 backdrop-blur text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center leading-relaxed border border-gray-700 font-normal block">
            {tip}
            <span className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800/95"></span>
        </span>
    </span>
);

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

// [추가] 히스토리 데이터 로드 액션 선택 모달
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
                                <td className="px-4 py-3 text-center font-semibold dark:text-white">일반 + 강화 (E2EE)</td>
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

// [추가] 통합 설정 모달 (PRO 전용)
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

// [추가] 모바일 퀵 메뉴 (Bottom Sheet)
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

// [추가] 에러 바운더리 컴포넌트
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

// [수정] 데이터 내보내기/불러오기 모달 (기존 로직 복구 및 버튼 액션 수정)
window.DataExportImportModal = ({ isOpen, onClose, onImport, currentData, initialMode = 'export' }) => {
    const [mode, setMode] = useState(initialMode);
    const [inputValue, setInputValue] = useState('');
    const [exportString, setExportString] = useState('');
    const [copyStatus, setCopyStatus] = useState('idle');

    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            setInputValue('');
            setCopyStatus('idle');
            try {
                // [복구] 무조건 압축(인코딩)된 데이터 생성
                if (window.compressData) {
                    const data = window.compressData(currentData);
                    setExportString(data);
                } else {
                    setExportString('오류: 압축 라이브러리가 로드되지 않았습니다.');
                }
            } catch (e) {
                console.error(e);
                setExportString('데이터 생성 실패');
            }
        }
    }, [isOpen, currentData, initialMode]);

    const handleCopy = async () => {
        try {
            // [수정] 클립보드 API 실패 시 폴백(Fallback) 처리 추가 (버튼 먹통 해결)
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(exportString);
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = exportString;
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

    const handleImport = () => {
        if (!inputValue.trim()) return alert('데이터 코드를 입력해주세요.');
        try {
            // [복구] 무조건 압축 해제 시도
            if (window.decompressData) {
                const data = window.decompressData(inputValue.trim());
                onImport(data);
                onClose();
            } else {
                alert('오류: 압축 해제 라이브러리가 로드되지 않았습니다.');
            }
        } catch (e) {
            console.error(e);
            alert('데이터 형식이 올바르지 않습니다. 코드를 확인해주세요.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">💾 데이터 백업 및 복구</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
                </div>
                <div className="p-6">
                    <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl mb-6">
                        <button onClick={() => setMode('export')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'export' ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>내보내기</button>
                        <button onClick={() => setMode('import')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'import' ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>불러오기</button>
                    </div>

                    {mode === 'export' ? (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-300">현재 데이터를 압축된 문자열로 변환했습니다.<br/>아래 코드를 복사하여 안전한 곳에 보관하세요.</p>
                            <div className="relative">
                                <textarea readOnly value={exportString} className="w-full h-32 p-4 text-xs font-mono bg-gray-50 dark:bg-gray-900 border dark:border-gray-600 rounded-xl resize-none focus:outline-none dark:text-gray-300" />
                            </div>
                            <button onClick={handleCopy} className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${copyStatus === 'copied' ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                                {copyStatus === 'copied' ? '✅ 복사되었습니다' : '📋 클립보드에 복사'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-300">보관해둔 데이터 코드를 아래에 붙여넣으세요.<br/><span className="text-red-500 text-xs">* 현재 데이터가 덮어씌워집니다.</span></p>
                            <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="w-full h-32 p-4 text-xs font-mono bg-white dark:bg-gray-900 border dark:border-gray-600 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" placeholder="여기에 데이터 코드 붙여넣기..." />
                            <button onClick={handleImport} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">📥 데이터 불러오기</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// [이동] AI 자산 분석 모달 (Gemini API 활용) - 커스텀 입력 제거됨
window.AIAnalysisModal = ({ isOpen, onClose, appData, calculation }) => {
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('asset_gemini_api_key') || '');
    const [model, setModel] = useState('gemini-3-flash-preview'); // [수정] 안정적인 모델명으로 기본값 변경
    const [persona, setPersona] = useState(() => localStorage.getItem('asset_ai_persona') || '냉철한 전문 자산 관리사');

    // [추가] 페르소나 변경 시 로컬 스토리지 자동 저장
    useEffect(() => {
        localStorage.setItem('asset_ai_persona', persona);
    }, [persona]);

    const [additionalRequest, setAdditionalRequest] = useState('');
    const [showSettings, setShowSettings] = useState(true);
    
    // [수정] 멀티턴 대화를 위한 상태 관리
    const [messages, setMessages] = useState([]); // { role: 'user' | 'model', text: string }
    const [chatInput, setChatInput] = useState('');
    const [contextPrompt, setContextPrompt] = useState(''); // 초기 컨텍스트 저장용
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(() => { if (isOpen) scrollToBottom(); }, [messages, showSettings, isOpen]);

    const handleAnalyze = async () => {
        const trimmedKey = apiKey.trim();
        if (!trimmedKey) { setError('API 키를 입력해주세요.'); return; }
        localStorage.setItem('asset_gemini_api_key', trimmedKey);
        setLoading(true);
        setError('');
        setMessages([]);
        
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
                }
            };

            // [수정] 시스템 프롬프트 구성 (초기 컨텍스트)
            const prompt = `
                당신은 ${persona}입니다. 아래 재무 데이터를 분석해주세요.
                데이터: ${JSON.stringify(summary)}
                
                다음 형식으로 마크다운을 사용하여 답변해주세요:
                1. 🧐 **포트폴리오 진단**: 현재 자산 배분의 장단점 (위험도, 수익성 등)
                2. ⚖️ **리밸런싱 제안**: 목표 달성을 위해 비중을 조절해야 할 섹터
                3. 💡 **액션 플랜**: 구체적으로 실행해야 할 3가지 조언
                ${additionalRequest ? `4. 🗣️ **추가 답변**: 사용자의 요청("${additionalRequest}")에 대한 답변` : ''}
                
                너무 길지 않게 핵심만 요약해서 답변해주세요.
                이후 사용자의 질문에 대해서도 위 데이터를 바탕으로 답변해주세요.
            `;

            setContextPrompt(prompt); // 컨텍스트 저장

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${trimmedKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                const errMsg = errData.error?.message || response.statusText;
                if (response.status === 400) throw new Error(`잘못된 요청입니다 (400). API 키가 올바른지 확인해주세요.\n(상세: ${errMsg})`);
                if (response.status === 403) throw new Error(`권한 오류 (403). API 키가 활성화되었는지 확인해주세요.\n(상세: ${errMsg})`);
                if (response.status === 429) throw new Error(`요청 한도 초과 (429). 잠시 후 다시 시도해주세요.\n(상세: ${errMsg})`);
                throw new Error(`API 호출 실패 (${response.status}): ${errMsg}`);
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '분석 결과를 가져오지 못했습니다.';
            
            // [수정] 첫 번째 응답을 메시지 목록에 추가
            setMessages([{ role: 'model', text: text }]);
            setShowSettings(false);
        } catch (err) {
            setError(err.message);
        } finally {
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

        try {
            // 대화 히스토리 구성: [Context(User), Analysis(Model), ...History, Current(User)]
            const contents = [
                { role: 'user', parts: [{ text: contextPrompt }] },
                ...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
                { role: 'user', parts: [{ text: userMsg.text }] }
            ];

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents })
            });

            if (!response.ok) throw new Error('API 호출 실패');

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '답변을 가져오지 못했습니다.';
            
            setMessages(prev => [...prev, { role: 'model', text: text }]);
        } catch (err) {
            setError('대화 중 오류가 발생했습니다: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl m-4 h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200 overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center mb-4 border-b dark:border-gray-700 pb-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">🤖 AI 자산 분석 <span className="text-xs font-normal text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">Powered by Gemini</span></h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-0 space-y-4">
                    {showSettings && (
                        <>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-blue-800 dark:text-blue-200 mb-4">
                            <p className="font-bold mb-1">💡 API 키 발급 안내</p>
                            Google AI Studio에서 API 키를 발급받아 입력해주세요. (개인용 무료 티어 이용 가능)<br/>
                            <span className="text-xs opacity-80">* Gemini 웹사이트 유료 구독(Advanced)과는 별개의 서비스입니다.</span>
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline font-bold ml-1 hover:text-blue-600 block mt-2">키 발급받으러 가기 ↗</a>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-sm text-yellow-800 dark:text-yellow-200 mb-4 border border-yellow-200 dark:border-yellow-800">
                            <p className="font-bold mb-1">⚠️ 데이터 보안 주의</p>
                            분석을 위해 자산 요약 정보(금액, 포트폴리오 등)가 암호화되지 않은 JSON 형태로 Google 서버로 전송됩니다.
                            개인 식별 정보는 포함되지 않으나, 실제 금융 데이터가 전송되므로 주의가 필요합니다.
                        </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex flex-col gap-1 w-full sm:w-auto">
                            <select 
                                value={model} 
                                onChange={(e) => setModel(e.target.value)}
                                className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value="gemini-3-flash-preview">Gemini 3 Flash Preview</option>
                                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                            </select>
                        </div>
                        <div className="flex-1 flex flex-col sm:flex-row gap-2">
                            <input 
                                type="password" 
                                placeholder="Gemini API Key 입력" 
                                className="flex-1 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                            />
                            <button 
                                onClick={handleAnalyze} 
                                disabled={loading || !apiKey}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                                {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> 분석 중...</> : '분석 시작'}
                            </button>
                        </div>
                    </div>
                    
                    <div className="space-y-3 pt-2 border-t dark:border-gray-700">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">AI 페르소나 (자산 관리사 성격)</label>
                            <input 
                                type="text" 
                                className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                value={persona}
                                onChange={(e) => setPersona(e.target.value)}
                                placeholder="예: 100년 경력의 워렌 버핏, 냉철한 분석가, 친절한 이웃집 은행원"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">추가 요청사항 (선택)</label>
                            <textarea 
                                className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 resize-none h-20"
                                value={additionalRequest}
                                onChange={(e) => setAdditionalRequest(e.target.value)}
                                placeholder="예: 은퇴 자금 마련을 위해 공격적인 투자가 필요할까요? 아니면 안전 자산을 늘려야 할까요?"
                            />
                        </div>
                    </div>
                    </>
                    )}

                    {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

                    {/* [수정] 채팅 인터페이스 구현 */}
                    {!showSettings && (
                        <>
                        <div className="flex justify-end mb-2">
                            <button onClick={() => { setShowSettings(true); setMessages([]); }} className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1">
                                🔄 처음부터 다시 시작
                            </button>
                        </div>
                        
                        <div className="space-y-4 pb-4">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[90%] rounded-2xl p-4 ${
                                        msg.role === 'user' 
                                            ? 'bg-blue-600 text-white rounded-tr-none' 
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none border dark:border-gray-600'
                                    }`}>
                                        {msg.role === 'user' ? (
                                            <div className="whitespace-pre-wrap">{msg.text}</div>
                                        ) : (
                                            <div className="prose dark:prose-invert prose-sm max-w-none">
                                                <div className="whitespace-pre-wrap leading-relaxed">
                                                    {msg.text.split('\n').map((line, i) => {
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

// [추가] 자본소득(Cash Flow) 분석 모달
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

// [추가] 관리자 대시보드 모달 (통계, 유저관리, 공지사항)
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
                    let validCount = 0;

                    uniqueAssets.forEach(record => {
                        try {
                            let appData = record.data;
                            
                            // [수정] 암호화 타입에 따른 데이터 처리 (Switch Case)
                            switch (record.encryption_type) {
                                case 'secure':
                                    return; // 개인 키가 필요한 강화 모드는 관리자가 해독 불가하므로 통계 제외
                                case 'normal':
                                    // 일반 모드: 시스템 키로 복호화 시도
                                    const securityKey = window.SUPABASE_CONFIG?.SECURITY_KEY;
                                    if (securityKey && typeof appData === 'string') {
                                        const key = window.getEncryptionKey('normal', null, record.email, securityKey);
                                        if (key) appData = window.decryptData(record.data, key);
                                    }
                                    break;
                                default:
                                    // null 또는 'none': 암호화되지 않은 데이터이므로 그대로 사용
                                    // [추가] 문자열인 경우 파싱 시도 (DB 컬럼이 text일 경우 대비)
                                    if (typeof appData === 'string') {
                                        try {
                                            appData = JSON.parse(appData);
                                        } catch (e) {
                                            // 파싱 실패 시 무시
                                            return;
                                        }
                                    }
                                    break;
                            }

                            const assets = appData.appData?.assets || appData.assets;
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
                                validCount++;
                            }
                        } catch (e) { /* Decryption failed */ }
                    });

                    if (validCount > 0) {
                        // [추가] 중위값 계산 함수
                        const calculateMedian = (arr) => {
                            if (arr.length === 0) return 0;
                            const sorted = [...arr].sort((a, b) => a - b);
                            const mid = Math.floor(sorted.length / 2);
                            return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
                        };

                        const sumTotal = totals.reduce((a, b) => a + b, 0);
                        const sumDebt = debts.reduce((a, b) => a + b, 0);
                        const sumNet = nets.reduce((a, b) => a + b, 0);

                        insights = {
                            avgTotal: Math.round(sumTotal / validCount),
                            medianTotal: Math.round(calculateMedian(totals)),
                            avgDebt: Math.round(sumDebt / validCount),
                            medianDebt: Math.round(calculateMedian(debts)),
                            avgNet: Math.round(sumNet / validCount),
                            medianNet: Math.round(calculateMedian(nets)),
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
            // [수정] index.html과 로직 통일 (updated_at 제거 및 단순화)
            const { data, error } = await supabase.from('user_profiles').select('email, suggestions').not('suggestions', 'is', null);
            if (error) throw error;
            setSuggestions(data || []);
        } catch (err) {
            console.error('Suggestions Fetch Error:', err);
        } finally {
            setIsLoading(false);
        }
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
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-gray-900 dark:text-white">{item.email}</span>
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">{item.suggestions}</div>
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

// [추가] 데이터 활용 동의 모달
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
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-bold transition-colors text-sm">나중에 하기</button>
                    <button onClick={onConfirm} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-colors text-sm">동의하고 시작하기</button>
                </div>
            </div>
        </div>
    );
};