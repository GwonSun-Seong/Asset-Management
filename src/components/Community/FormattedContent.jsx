import React from 'react';

/**
 * 안전한 인라인 마크다운 파서 (dangerouslySetInnerHTML 미사용 -> 100% XSS 면역)
 * 지원 문법:
 * - **볼드** / __볼드__
 * - *기울임*
 * - <u>밑줄</u>
 * - ~~취소선~~
 * - `인라인 코드`
 * - [링크 텍스트](https://...)
 */
export function parseInlineMarkdown(text) {
    if (!text || typeof text !== 'string') return text;

    // 토큰 분리 정규식: 볼드, 취소선, 밑줄, 코드, 링크, 기울임
    const tokenRegex = /(\*\*[\s\S]+?\*\*|__[\s\S]+?__|~~[\s\S]+?~~|<u>[\s\S]+?<\/u>|`[^`\n]+`|\[[^\]]+\]\(https?:\/\/[^\s)]+\)|\*[^*\n]+?\*)/g;

    const parts = text.split(tokenRegex);

    return parts.map((part, index) => {
        if (!part) return null;

        // 1. **볼드** 또는 __볼드__
        if ((part.startsWith('**') && part.endsWith('**') && part.length >= 4) ||
            (part.startsWith('__') && part.endsWith('__') && part.length >= 4)) {
            const inner = part.slice(2, -2);
            return (
                <strong key={index} className="font-black text-slate-900 dark:text-white">
                    {parseInlineMarkdown(inner)}
                </strong>
            );
        }

        // 2. ~~취소선~~
        if (part.startsWith('~~') && part.endsWith('~~') && part.length >= 4) {
            const inner = part.slice(2, -2);
            return (
                <del key={index} className="line-through text-slate-400 dark:text-slate-500">
                    {parseInlineMarkdown(inner)}
                </del>
            );
        }

        // 3. <u>밑줄</u>
        if (part.toLowerCase().startsWith('<u>') && part.toLowerCase().endsWith('</u>') && part.length >= 7) {
            const inner = part.slice(3, -4);
            return (
                <span key={index} className="underline underline-offset-3 decoration-teal-500/80">
                    {parseInlineMarkdown(inner)}
                </span>
            );
        }

        // 4. `코드`
        if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
            const inner = part.slice(1, -1);
            return (
                <code key={index} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-teal-300 font-mono text-[0.88em] border border-slate-200/80 dark:border-slate-700/80 mx-0.5">
                    {inner}
                </code>
            );
        }

        // 5. [링크 텍스트](url)
        const linkMatch = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
        if (linkMatch) {
            const [, linkText, linkUrl] = linkMatch;
            return (
                <a
                    key={index}
                    href={linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-teal-600 dark:text-teal-400 underline underline-offset-2 hover:text-teal-700 dark:hover:text-teal-300 transition-colors font-medium break-all"
                >
                    {linkText}
                </a>
            );
        }

        // 6. *기울임*
        if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
            const inner = part.slice(1, -1);
            return (
                <em key={index} className="italic text-slate-700 dark:text-slate-300">
                    {parseInlineMarkdown(inner)}
                </em>
            );
        }

        // 일반 텍스트
        return part;
    });
}

/**
 * 커뮤니티 본문 마크다운 렌더러
 * - 블록 문법: #/##/### 제목, > 인용구, - /* 불릿 리스트, 일반 문단
 * - inline = true 시 블록 요소 없이 인라인 포맷팅만 유지 (카드 요약, 댓글 등)
 */
export default function FormattedContent({ content, inline = false, className = '' }) {
    if (!content) return null;

    if (inline) {
        return (
            <span className={className}>
                {parseInlineMarkdown(content)}
            </span>
        );
    }

    const lines = content.split(/\r?\n/);

    return (
        <div className={`space-y-1.5 ${className}`}>
            {lines.map((line, idx) => {
                const trimmed = line.trim();

                // 빈 줄 (문단 간격)
                if (!trimmed) {
                    return <div key={idx} className="h-2" />;
                }

                // ### 소제목
                if (line.startsWith('### ')) {
                    return (
                        <h4 key={idx} className="text-base font-black text-slate-900 dark:text-white pt-2 pb-0.5">
                            {parseInlineMarkdown(line.slice(4))}
                        </h4>
                    );
                }

                // ## 중제목
                if (line.startsWith('## ')) {
                    return (
                        <h3 key={idx} className="text-lg font-black text-slate-900 dark:text-white pt-3 pb-1">
                            {parseInlineMarkdown(line.slice(3))}
                        </h3>
                    );
                }

                // # 대제목
                if (line.startsWith('# ')) {
                    return (
                        <h2 key={idx} className="text-xl font-black text-slate-900 dark:text-white pt-3 pb-1 border-b border-slate-200/60 dark:border-slate-700/60">
                            {parseInlineMarkdown(line.slice(2))}
                        </h2>
                    );
                }

                // > 인용문
                if (line.startsWith('> ') || line.startsWith('>')) {
                    const quoteText = line.startsWith('> ') ? line.slice(2) : line.slice(1);
                    return (
                        <blockquote key={idx} className="border-l-4 border-teal-500/80 pl-3.5 py-1 my-1.5 bg-slate-50 dark:bg-slate-800/40 rounded-r-xl text-slate-600 dark:text-slate-300 italic">
                            {parseInlineMarkdown(quoteText)}
                        </blockquote>
                    );
                }

                // - 또는 * 목록 불릿
                if (line.startsWith('- ') || line.startsWith('* ')) {
                    return (
                        <div key={idx} className="flex items-start gap-2 pl-1 my-0.5">
                            <span className="text-teal-600 dark:text-teal-400 font-black text-xs mt-1">•</span>
                            <span className="flex-1 leading-relaxed">
                                {parseInlineMarkdown(line.slice(2))}
                            </span>
                        </div>
                    );
                }

                // 일반 문단
                return (
                    <p key={idx} className="leading-relaxed min-h-[1.25rem] break-words">
                        {parseInlineMarkdown(line)}
                    </p>
                );
            })}
        </div>
    );
}
