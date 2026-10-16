import React from 'react';

/**
 * 날짜/시각 할루시네이션 라인 필터링 헬퍼
 * AI가 임의로 생성한 '작성일: 2024년...', '기준일: 2025-...' 등의 줄을 자동 제거
 */
export function stripHallucinatedDates(rawText = '') {
    if (!rawText) return '';
    return rawText
        .split('\n')
        .filter(line => {
            const trimmed = line.trim().replace(/^[*#\->\s]+/, '');
            // "작성일:", "발행일:", "보고서 일자:", "감사 기준일:", "판결 일자:" 등으로 시작하는 메타 라인 제거
            if (/^(작성일|발행일|보고일|보고서\s*일자|감사\s*일자|감사\s*기준일|판결\s*일자|선고\s*일자|기준\s*일자|일시|날짜|Date)\s*[:：]/i.test(trimmed)) {
                return false;
            }
            return true;
        })
        .join('\n');
}

/**
 * 인라인 마크다운 파서 (**볼드**, *이탤릭*, `코드`, ~~취소선~~)
 */
export function renderInlineMarkdown(text) {
    if (text === null || text === undefined) return null;
    const str = String(text);

    // 토큰 분리: **bold**, `code`, ~~strike~~, *italic*
    const tokenRegex = /(\*\*[\s\S]+?\*\*|`[^`]+`|~~[\s\S]+?~~|\*[^*\n]+\*)/g;
    const parts = str.split(tokenRegex);

    return parts.map((part, idx) => {
        if (!part) return null;
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
            return (
                <strong key={idx} className="font-black text-slate-900 dark:text-white">
                    {part.slice(2, -2)}
                </strong>
            );
        }
        if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
            return (
                <code
                    key={idx}
                    className="px-1.5 py-0.5 mx-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-[0.92em] font-bold border border-indigo-200/60 dark:border-indigo-800/50"
                >
                    {part.slice(1, -1)}
                </code>
            );
        }
        if (part.startsWith('~~') && part.endsWith('~~') && part.length > 4) {
            return (
                <del key={idx} className="text-slate-400 line-through">
                    {part.slice(2, -2)}
                </del>
            );
        }
        if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
            return (
                <em key={idx} className="italic text-slate-800 dark:text-slate-200 font-semibold">
                    {part.slice(1, -1)}
                </em>
            );
        }
        return part;
    });
}

/**
 * 마크다운 테이블 행(`| col1 | col2 |`) 셀 파싱 헬퍼
 */
function parseTableRow(line) {
    let trimmed = line.trim();
    if (trimmed.startsWith('|')) trimmed = trimmed.slice(1);
    if (trimmed.endsWith('|')) trimmed = trimmed.slice(0, -1);
    return trimmed.split('|').map(cell => cell.trim());
}

/**
 * 구분선 행(`| :--- | :---: | ---: |`) 여부 확인 및 정렬 방향 추출
 */
function isTableSeparatorLine(line) {
    const trimmed = line.trim();
    if (!trimmed.includes('|') || !trimmed.includes('-')) return false;
    const cells = parseTableRow(trimmed);
    if (cells.length === 0) return false;
    return cells.every(c => /^:?-{2,}:?$/.test(c.trim()));
}

function parseAlignments(separatorLine) {
    return parseTableRow(separatorLine).map(c => {
        const s = c.trim();
        if (s.startsWith(':') && s.endsWith(':')) return 'center';
        if (s.endsWith(':')) return 'right';
        return 'left';
    });
}

/**
 * Gemini 스타일 리치 마크다운 렌더러
 * - GFM 표(| --- | --- |) 자동 감지 및 반응형 테이블 변환
 * - # ~ #### 헤딩, **볼드**, 인용구(>), 불릿/번호 리스트, 구분선(---) 완벽 지원
 */
export default function MarkdownRenderer({ content = '', className = '', stripDates = true }) {
    if (!content) return null;

    const cleanedText = (stripDates ? stripHallucinatedDates(content) : content)
        .replace(/---JSON_START---[\s\S]*?---JSON_END---/g, '')
        .trim();

    const lines = cleanedText.split('\n');
    const blocks = [];
    let i = 0;

    while (i < lines.length) {
        const rawLine = lines[i];
        const line = rawLine.trim();

        // 1. 빈 줄 스킵
        if (!line) {
            i++;
            continue;
        }

        // 2. 코드 블록 (```)
        if (line.startsWith('```')) {
            const codeLines = [];
            i++;
            while (i < lines.length && !lines[i].trim().startsWith('```')) {
                codeLines.push(lines[i]);
                i++;
            }
            i++; // 닫는 ``` 스킵
            blocks.push({ type: 'code', content: codeLines.join('\n') });
            continue;
        }

        // 3. 마크다운 표 (현재 줄에 |가 있고 다음 줄이 | --- | 형태이거나 연속된 | 행인 경우)
        if (line.includes('|') && i + 1 < lines.length && isTableSeparatorLine(lines[i + 1])) {
            const headers = parseTableRow(line);
            const alignments = parseAlignments(lines[i + 1]);
            const rows = [];
            i += 2;
            while (i < lines.length) {
                const rowLine = lines[i].trim();
                if (!rowLine || !rowLine.includes('|')) break;
                if (isTableSeparatorLine(rowLine)) {
                    i++;
                    continue;
                }
                rows.push(parseTableRow(rowLine));
                i++;
            }
            blocks.push({ type: 'table', headers, alignments, rows });
            continue;
        }

        // 4. 수평 구분선 (---, ***, ___)
        if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
            blocks.push({ type: 'hr' });
            i++;
            continue;
        }

        // 5. 헤딩 (# ~ ####)
        const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
        if (headingMatch) {
            blocks.push({
                type: 'heading',
                level: headingMatch[1].length,
                text: headingMatch[2].replace(/\*\*/g, '')
            });
            i++;
            continue;
        }

        // 6. 인용구 (>)
        if (line.startsWith('>')) {
            const quoteLines = [];
            while (i < lines.length && lines[i].trim().startsWith('>')) {
                quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
                i++;
            }
            blocks.push({ type: 'blockquote', lines: quoteLines });
            continue;
        }

        // 7. 불릿 리스트 (-, *, •)
        if (/^([-*•])\s+/.test(line)) {
            const items = [];
            while (i < lines.length && /^(\s*[-*•])\s+/.test(lines[i])) {
                const indent = (lines[i].match(/^\s*/)?.[0]?.length || 0) >= 2;
                items.push({
                    indent,
                    text: lines[i].trim().replace(/^[-*•]\s+/, '')
                });
                i++;
            }
            blocks.push({ type: 'ul', items });
            continue;
        }

        // 8. 번호 매기기 리스트 (1. 2. 3.)
        if (/^\d+\.\s+/.test(line)) {
            const items = [];
            while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
                const match = lines[i].trim().match(/^(\d+)\.\s+(.+)$/);
                if (match) {
                    items.push({ num: match[1], text: match[2] });
                }
                i++;
            }
            blocks.push({ type: 'ol', items });
            continue;
        }

        // 9. 일반 문단
        blocks.push({ type: 'p', text: line });
        i++;
    }

    return (
        <div className={`space-y-3 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-200 ${className}`}>
            {blocks.map((block, idx) => {
                if (block.type === 'hr') {
                    return <hr key={idx} className="my-3 border-slate-200 dark:border-slate-700/80" />;
                }

                if (block.type === 'heading') {
                    if (block.level === 1) {
                        return (
                            <h2 key={idx} className="text-base sm:text-lg font-black text-slate-900 dark:text-white pt-2 pb-1 border-b border-slate-200 dark:border-slate-700">
                                {renderInlineMarkdown(block.text)}
                            </h2>
                        );
                    }
                    if (block.level === 2) {
                        return (
                            <h3 key={idx} className="text-sm sm:text-base font-black text-indigo-700 dark:text-indigo-300 pt-2 flex items-center gap-1.5">
                                {renderInlineMarkdown(block.text)}
                            </h3>
                        );
                    }
                    return (
                        <h4 key={idx} className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 pt-1.5">
                            {renderInlineMarkdown(block.text)}
                        </h4>
                    );
                }

                if (block.type === 'blockquote') {
                    return (
                        <blockquote
                            key={idx}
                            className="pl-3.5 py-2 pr-3 border-l-4 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-r-xl text-slate-700 dark:text-slate-300 space-y-1"
                        >
                            {block.lines.map((ql, qi) => (
                                <p key={qi}>{renderInlineMarkdown(ql)}</p>
                            ))}
                        </blockquote>
                    );
                }

                if (block.type === 'ul') {
                    return (
                        <ul key={idx} className="space-y-1.5 pl-1">
                            {block.items.map((it, liIdx) => (
                                <li
                                    key={liIdx}
                                    className={`flex items-start gap-2 ${it.indent ? 'pl-4 text-slate-600 dark:text-slate-300' : ''}`}
                                >
                                    <span className="text-indigo-500 dark:text-indigo-400 font-black mt-0.5 select-none">
                                        {it.indent ? '◦' : '•'}
                                    </span>
                                    <span className="flex-1">{renderInlineMarkdown(it.text)}</span>
                                </li>
                            ))}
                        </ul>
                    );
                }

                if (block.type === 'ol') {
                    return (
                        <ol key={idx} className="space-y-2 pl-1">
                            {block.items.map((it, olIdx) => (
                                <li key={olIdx} className="flex items-start gap-2">
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-[11px] font-black shrink-0 mt-0.5">
                                        {it.num}
                                    </span>
                                    <span className="flex-1">{renderInlineMarkdown(it.text)}</span>
                                </li>
                            ))}
                        </ol>
                    );
                }

                if (block.type === 'table') {
                    return (
                        <div key={idx} className="my-3 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-2xs">
                            <table className="w-full text-xs sm:text-sm border-collapse">
                                <thead>
                                    <tr className="bg-slate-100/90 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700">
                                        {block.headers.map((h, hIdx) => {
                                            const align = block.alignments[hIdx] || 'left';
                                            const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
                                            return (
                                                <th
                                                    key={hIdx}
                                                    className={`py-2.5 px-3 font-black text-slate-700 dark:text-slate-200 whitespace-nowrap ${alignClass}`}
                                                >
                                                    {renderInlineMarkdown(h)}
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800">
                                    {block.rows.map((row, rIdx) => (
                                        <tr
                                            key={rIdx}
                                            className={
                                                rIdx % 2 === 0
                                                    ? 'bg-white dark:bg-slate-900/60'
                                                    : 'bg-slate-50/60 dark:bg-slate-850/40'
                                            }
                                        >
                                            {block.headers.map((_, cIdx) => {
                                                const align = block.alignments[cIdx] || 'left';
                                                const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
                                                return (
                                                    <td
                                                        key={cIdx}
                                                        className={`py-2 px-3 text-slate-700 dark:text-slate-300 ${alignClass}`}
                                                    >
                                                        {renderInlineMarkdown(row[cIdx] ?? '')}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                }

                if (block.type === 'code') {
                    return (
                        <pre
                            key={idx}
                            className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-700"
                        >
                            <code>{block.content}</code>
                        </pre>
                    );
                }

                return (
                    <p key={idx} className="leading-relaxed">
                        {renderInlineMarkdown(block.text)}
                    </p>
                );
            })}
        </div>
    );
}

if (typeof window !== 'undefined') {
    window.MarkdownRenderer = MarkdownRenderer;
}
