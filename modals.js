// 이 파일에 다른 모달이 이미 있다면, 이 코드를 파일의 맨 아래에 추가하거나 병합하세요.
(function() {
    // 기존 modals.js에 React가 이미 선언되어 있다면 이 줄은 생략 가능합니다.
    const { useState, useEffect, useRef } = React;


    // [이동 및 수정] PDF 미리보기 모달
    const PdfPreviewModal = ({ isOpen, onClose, imgData, onDownload }) => {
        if (!isOpen) return null;
        const dataUrl = imgData ? imgData.dataUrl : null; // [수정] 객체에서 dataUrl 추출
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex justify-between items-center">
                        <span className="flex items-center gap-2">📄 PDF 미리보기 <span className="text-xs font-normal text-gray-500 dark:text-gray-400">(저장될 이미지)</span></span>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
                    </h3>
                    <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-8 rounded-lg border dark:border-gray-700 flex justify-center items-start custom-scrollbar">
                        {dataUrl ? <img src={dataUrl} alt="Preview" className="max-w-full shadow-lg border border-gray-200 bg-white" /> : <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div><span>미리보기 생성 중...</span></div>}
                    </div>
                    <div className="mt-4 flex justify-end gap-3 pt-2 border-t dark:border-gray-700">
                        <button onClick={onClose} className="px-5 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors">취소</button>
                        <button onClick={onDownload} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>PDF 다운로드</button>
                    </div>
                </div>
            </div>
        );
    };

    // 전역 window 객체에 할당하여 index.html에서 사용할 수 있도록 합니다.
    window.PdfPreviewModal = PdfPreviewModal;
})();