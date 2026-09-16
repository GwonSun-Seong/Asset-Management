// TaxSettlement2026Modals.jsx - 2026년 기준 신용카드, 의료비, 기부금 공식 산출과정 모달 및 2026 귀속 공제항목 도움말
import React, { useState, useEffect, useMemo } from 'react';

function formatKRW(val) {
    const num = Math.round(Number(val) || 0);
    return num.toLocaleString('ko-KR') + ' 원';
}

// 1. 신용카드 등 사용금액 산출과정 컴포넌트 (Image 1 기반)
export function CardDeductionContent({ data }) {
    if (!data) return null;
    const {
        salaryWon = 0,
        numChildren = 0,
        creditCard = 0,
        debitCard = 0,
        cashReceipt = 0,
        cultureCredit = 0,
        cultureDebit = 0,
        cultureCash = 0,
        market = 0,
        transit = 0,
        calc = {}
    } = data;

    return (
        <div className="space-y-6">
                    {/* 테이블 1: 신용카드 등 사용금액 입력 현황 */}
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-xs flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                            신용카드 등 사용금액 입력 및 공제비율
                        </h3>
                        <div className="overflow-x-auto border border-slate-200 dark:border-slate-750 rounded-xl">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-750">
                                    <tr>
                                        <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-750">항목</th>
                                        <th className="py-2 px-3 text-right border-r border-slate-200 dark:border-slate-750">입력금액</th>
                                        <th className="py-2 px-3 text-center border-r border-slate-200 dark:border-slate-750">공제비율</th>
                                        <th className="py-2 px-3">비고</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    <tr>
                                        <td className="py-2 px-3 font-semibold border-r border-slate-200 dark:border-slate-750">총급여</td>
                                        <td className="py-2 px-3 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400 border-r border-slate-200 dark:border-slate-750">{formatKRW(salaryWon)}</td>
                                        <td className="py-2 px-3 text-center text-slate-400 border-r border-slate-200 dark:border-slate-750">-</td>
                                        <td className="py-2 px-3 text-slate-400">-</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-3 font-semibold border-r border-slate-200 dark:border-slate-750">기본공제 대상 직계비속 인원</td>
                                        <td className="py-2 px-3 text-right font-mono font-bold border-r border-slate-200 dark:border-slate-750">{numChildren} 명</td>
                                        <td className="py-2 px-3 text-center text-slate-400 border-r border-slate-200 dark:border-slate-750">-</td>
                                        <td className="py-2 px-3 text-[11px] text-indigo-600 dark:text-indigo-300">
                                            '26.1.1부터 기본공제 대상 자녀 1명당 한도 50만원(최대 100만) 상향 (총급여 7천만 초과 시 1명당 25만원, 최대 50만원 상향)
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-750">㉮ 신용카드사용금액 (전통시장·대중교통비 제외)</td>
                                        <td className="py-2 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">{formatKRW(creditCard)}</td>
                                        <td className="py-2 px-3 text-center font-bold text-amber-600 border-r border-slate-200 dark:border-slate-750">15%</td>
                                        <td className="py-2 px-3 text-slate-400">최저사용금액 우선 충당</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-750">㉯ 직불카드등 (전통시장·대중교통비 제외)</td>
                                        <td className="py-2 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">{formatKRW(debitCard)}</td>
                                        <td className="py-2 px-3 text-center font-bold text-indigo-600 border-r border-slate-200 dark:border-slate-750">30%</td>
                                        <td className="py-2 px-3 text-slate-400">-</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-750">㉰ 현금영수증 (전통시장·대중교통비 제외)</td>
                                        <td className="py-2 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">{formatKRW(cashReceipt)}</td>
                                        <td className="py-2 px-3 text-center font-bold text-indigo-600 border-r border-slate-200 dark:border-slate-750">30%</td>
                                        <td className="py-2 px-3 text-slate-400">-</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-750">㉱ 문화체육 - 신용카드사용분</td>
                                        <td className="py-2 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">{formatKRW(cultureCredit)}</td>
                                        <td className="py-2 px-3 text-center font-bold text-indigo-600 border-r border-slate-200 dark:border-slate-750">30%</td>
                                        <td className="py-2 px-3 text-slate-400">총급여 7천만원 이하 적용</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-750">㉲ 문화체육 - 직불카드사용분</td>
                                        <td className="py-2 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">{formatKRW(cultureDebit)}</td>
                                        <td className="py-2 px-3 text-center font-bold text-indigo-600 border-r border-slate-200 dark:border-slate-750">30%</td>
                                        <td className="py-2 px-3 text-slate-400">총급여 7천만원 이하 적용</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-750">㉳ 문화체육 - 현금영수증사용분</td>
                                        <td className="py-2 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">{formatKRW(cultureCash)}</td>
                                        <td className="py-2 px-3 text-center font-bold text-indigo-600 border-r border-slate-200 dark:border-slate-750">30%</td>
                                        <td className="py-2 px-3 text-slate-400">총급여 7천만원 이하 적용</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-750">㉴ 전통시장사용분</td>
                                        <td className="py-2 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">{formatKRW(market)}</td>
                                        <td className="py-2 px-3 text-center font-bold text-emerald-600 border-r border-slate-200 dark:border-slate-750">40%</td>
                                        <td className="py-2 px-3 text-slate-400">한도초과 시 추가공제 가능</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-750">㉵ 대중교통이용분</td>
                                        <td className="py-2 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">{formatKRW(transit)}</td>
                                        <td className="py-2 px-3 text-center font-bold text-emerald-600 border-r border-slate-200 dark:border-slate-750">40%</td>
                                        <td className="py-2 px-3 text-slate-400">한도초과 시 추가공제 가능</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 테이블 2: 신용카드 등 산출과정 공식 */}
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-xs flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            신용카드 등 산출과정
                        </h3>
                        <div className="overflow-x-auto border border-slate-200 dark:border-slate-750 rounded-xl">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-750">
                                    <tr>
                                        <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-750 w-32">구분</th>
                                        <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-750">산출식</th>
                                        <th className="py-2 px-3 text-right border-r border-slate-200 dark:border-slate-750 w-36">계산결과</th>
                                        <th className="py-2 px-3 w-48">비고</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    <tr>
                                        <td className="py-2.5 px-3 font-bold border-r border-slate-200 dark:border-slate-750">최저사용금액</td>
                                        <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-750 font-mono text-[11px]">총급여 × 25%</td>
                                        <td className="py-2.5 px-3 text-right font-mono font-bold border-r border-slate-200 dark:border-slate-750">{formatKRW(calc.minThreshold)}</td>
                                        <td className="py-2.5 px-3 text-slate-400">-</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2.5 px-3 font-bold border-r border-slate-200 dark:border-slate-750">공제제외금액</td>
                                        <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-750 text-[11px]">
                                            최저사용금액 충당 순서 (신용카드 15% → 직불/현금/문화 30% → 전통/대중 40%)
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600 border-r border-slate-200 dark:border-slate-750">-{formatKRW(calc.exemptAmount)}</td>
                                        <td className="py-2.5 px-3 text-[11px] text-slate-400">최저사용액 미만 사용분 감면 제외</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2.5 px-3 font-bold border-r border-slate-200 dark:border-slate-750">공제가능금액</td>
                                        <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-750 font-mono text-[11px]">
                                            ㉮×15% + (㉯+㉰+㉱+㉲+㉳)×30% + (㉴+㉵)×40% - 공제제외금액
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400 border-r border-slate-200 dark:border-slate-750">{formatKRW(calc.eligibleAmount)}</td>
                                        <td className="py-2.5 px-3 text-[11px] text-slate-400">공제제외금액과 동일한 절사기준 적용</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2.5 px-3 font-bold border-r border-slate-200 dark:border-slate-750">공제한도</td>
                                        <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-750 text-[11px]">
                                            기본공제한도(총급여 7천만원 이하 300만원 / 7천만원 초과 250만원) + 자녀 α
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-mono font-bold border-r border-slate-200 dark:border-slate-750">{formatKRW(calc.totalLimit)}</td>
                                        <td className="py-2.5 px-3 text-[11px] text-indigo-600 dark:text-indigo-300">
                                            자녀 추가한도: +{formatKRW(calc.childAlpha)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-2.5 px-3 font-bold border-r border-slate-200 dark:border-slate-750">일반공제금액</td>
                                        <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-750 font-mono text-[11px]">Min[공제가능금액, 공제한도]</td>
                                        <td className="py-2.5 px-3 text-right font-mono font-bold border-r border-slate-200 dark:border-slate-750">{formatKRW(calc.generalDeduction)}</td>
                                        <td className="py-2.5 px-3 text-slate-400">-</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-750">① 추가공제 - 전통시장</td>
                                        <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-750 font-mono text-[11px]">Min[Max(공제가능-한도, 0), ㉴×40%, 300만원]</td>
                                        <td className="py-2 px-3 text-right font-mono font-bold border-r border-slate-200 dark:border-slate-750">{formatKRW(calc.addMarket)}</td>
                                        <td className="py-2 px-3 text-slate-400">-</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-750">② 추가공제 - 대중교통</td>
                                        <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-750 font-mono text-[11px]">Min[Max(공제가능-한도-①, 0), ㉵×40%, 300만원-①]</td>
                                        <td className="py-2 px-3 text-right font-mono font-bold border-r border-slate-200 dark:border-slate-750">{formatKRW(calc.addTransit)}</td>
                                        <td className="py-2 px-3 text-slate-400">-</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-750">③ 추가공제 - 문화체육</td>
                                        <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-750 font-mono text-[11px]">Min[Max(공제가능-한도-①-②, 0), (㉱+㉲+㉳)×30%, 300만원-①-②]</td>
                                        <td className="py-2 px-3 text-right font-mono font-bold border-r border-slate-200 dark:border-slate-750">{formatKRW(calc.addCulture)}</td>
                                        <td className="py-2 px-3 text-[11px] text-slate-400">총급여 7천만 이하만 해당</td>
                                    </tr>
                                    <tr className="bg-emerald-50 dark:bg-emerald-950/40 font-bold">
                                        <td className="py-3 px-3 text-emerald-700 dark:text-emerald-300 border-r border-slate-200 dark:border-slate-750">최종 공제금액</td>
                                        <td className="py-3 px-3 font-mono text-[11px] text-emerald-700 dark:text-emerald-300 border-r border-slate-200 dark:border-slate-750">
                                            일반공제금액 + ①추가공제 + ②추가공제 + ③추가공제
                                        </td>
                                        <td className="py-3 px-3 text-right font-mono text-sm text-emerald-600 dark:text-emerald-400 font-black border-r border-slate-200 dark:border-slate-750">{formatKRW(calc.finalDeduction)}</td>
                                        <td className="py-3 px-3 text-emerald-700 dark:text-emerald-300">소득공제에 최종 반영</td>
                                    </tr>
                                </tbody>
                            </table>
                    </div>
                </div>
        </div>
    );
}

// 2. 의료비 산출과정 컴포넌트 (Image 2 기반)
export function MedicalDeductionContent({ data }) {
    if (!data) return null;
    const {
        salaryWon = 0,
        infertility = 0,
        prematureBaby = 0,
        seniorDisabled = 0,
        generalOther = 0,
        calc = {}
    } = data;

    return (
        <div className="space-y-6">
                    <div className="overflow-x-auto border border-slate-200 dark:border-slate-750 rounded-xl">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-750">
                                <tr>
                                    <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-750">구분</th>
                                    <th className="py-2.5 px-3 text-right border-r border-slate-200 dark:border-slate-750 w-36">금액</th>
                                    <th className="py-2.5 px-3">비고</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                <tr>
                                    <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-750">① 난임시술비 (공제율 30%)</td>
                                    <td className="py-2.5 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">{formatKRW(infertility)}</td>
                                    <td className="py-2.5 px-3 text-slate-400">한도 없음</td>
                                </tr>
                                <tr>
                                    <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-750">② 미숙아·선천성이상아 의료비 (공제율 20%)</td>
                                    <td className="py-2.5 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">{formatKRW(prematureBaby)}</td>
                                    <td className="py-2.5 px-3 text-slate-400">한도 없음</td>
                                </tr>
                                <tr>
                                    <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-750">
                                        ③ 본인, 65세 이상·6세 이하 부양가족, 장애인, 건강보험산정특례자를 위해 지출한 의료비
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-mono font-bold border-r border-slate-200 dark:border-slate-750">{formatKRW(seniorDisabled)}</td>
                                    <td className="py-2.5 px-3 text-slate-400">공제율 15%, 한도 없음</td>
                                </tr>
                                <tr>
                                    <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-750">④ 그밖의 공제대상자의 의료비</td>
                                    <td className="py-2.5 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">{formatKRW(generalOther)}</td>
                                    <td className="py-2.5 px-3 text-slate-400">공제율 15%, 한도 700만원</td>
                                </tr>
                                <tr className="bg-slate-50 dark:bg-slate-850/60 font-semibold">
                                    <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-750 text-indigo-600 dark:text-indigo-400">
                                        ⑤ 총급여액의 3% (의료비최저사용액)
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400 border-r border-slate-200 dark:border-slate-750">
                                        {formatKRW(calc.minThreshold)}
                                    </td>
                                    <td className="py-2.5 px-3 text-[11px] text-slate-500 dark:text-slate-400">
                                        의료비로 지출한 금액(①+②+③+④)이 의료비 최저사용액(⑤)보다 작은 경우 의료비 공제 대상이 아님 (⑥,⑦,⑧,⑨ 모두 0)
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-750">⑥ ① 난임시술비 공제대상금액</td>
                                    <td className="py-2.5 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">{formatKRW(calc.eligibleInfertility)}</td>
                                    <td className="py-2.5 px-3 text-[11px] text-slate-400">
                                        (②+③+④-⑤ &lt; 0) 이면 max((①+②+③+④-⑤), 0), (②+③+④-⑤ ≥ 0) 이면 ①
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-750">⑦ ② 미숙아·선천성이상아 공제대상금액</td>
                                    <td className="py-2.5 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">{formatKRW(calc.eligiblePremature)}</td>
                                    <td className="py-2.5 px-3 text-[11px] text-slate-400">
                                        (③+④-⑤ &lt; 0) 이면 max((②+③+④-⑤), 0), (③+④-⑤ ≥ 0) 이면 ②
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-750">
                                        ⑧ ③ 본인, 65세 이상·6세 이하 부양가족, 장애인, 건강보험산정특례자 공제대상금액
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">{formatKRW(calc.eligibleSenior)}</td>
                                    <td className="py-2.5 px-3 text-[11px] text-slate-400">
                                        (④-⑤ &lt; 0) 이면 max((③+④-⑤), 0), (④-⑤ ≥ 0) 이면 ③
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-750">⑨ ④ 그밖의 공제대상자 의료비 공제대상금액(④ - ⑤)</td>
                                    <td className="py-2.5 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">{formatKRW(calc.eligibleGeneral)}</td>
                                    <td className="py-2.5 px-3 text-[11px] text-slate-400">
                                        (④-⑤) &lt; 0인 경우 0, (④-⑤) ≥ 0인 경우 min[(④-⑤), 700만원]
                                    </td>
                                </tr>
                                <tr className="bg-emerald-50 dark:bg-emerald-950/40 font-bold">
                                    <td className="py-3 px-3 text-emerald-700 dark:text-emerald-300 border-r border-slate-200 dark:border-slate-750">
                                        의료비 공제세액 합계
                                    </td>
                                    <td className="py-3 px-3 text-right font-mono text-sm text-emerald-600 dark:text-emerald-400 font-black border-r border-slate-200 dark:border-slate-750">
                                        {formatKRW(calc.totalMedicalCredit)}
                                    </td>
                                    <td className="py-3 px-3 text-emerald-700 dark:text-emerald-300 font-mono text-[11px]">
                                        (⑥ × 30%) + (⑦ × 20%) + (⑧ × 15%) + (⑨ × 15%)
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
        </div>
    );
}

// 3. 기부금 산출과정 컴포넌트 (Image 3, 4, 5, 6 완성본 기반)
export function DonationDeductionContent({ data }) {
    if (!data) return null;
    const {
        earnedIncomeAmountWon = 0,
        politicalDonation = 0,
        hometownUnder10 = 0,
        hometown10to20 = 0,
        hometownSpecialOver20 = 0,
        hometownGeneralOver20 = 0,
        specialDonation = 0,
        employeeStockDonation = 0,
        religiousDonation = 0,
        nonReligiousDonation = 0,
        calc = {}
    } = data;

    return (
        <div className="space-y-6">
                    <div className="overflow-x-auto border border-slate-200 dark:border-slate-750 rounded-xl">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-750">
                                <tr>
                                    <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-750 w-28">입력 항목</th>
                                    <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-750 w-36">구분</th>
                                    <th className="py-2.5 px-3 text-right border-r border-slate-200 dark:border-slate-750 w-28">입력 금액</th>
                                    <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-750 w-36">세액공제 대상 한도</th>
                                    <th className="py-2.5 px-3 text-right border-r border-slate-200 dark:border-slate-750 w-28">세액공제 대상금액</th>
                                    <th className="py-2.5 px-3 text-right w-28">세액공제액</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {/* 1. 정치자금 기부금 */}
                                <tr>
                                    <td rowSpan={3} className="py-2.5 px-3 font-bold bg-slate-50/50 dark:bg-slate-850/50 border-r border-slate-200 dark:border-slate-750 align-top">
                                        ① 정치자금<br />기부금
                                    </td>
                                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-750">10만원 이하</td>
                                    <td className="py-2 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">{formatKRW(Math.min(politicalDonation, 100000))}</td>
                                    <td className="py-2 px-3 font-mono text-[11px] border-r border-slate-200 dark:border-slate-750">10만원</td>
                                    <td className="py-2 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">{formatKRW(Math.min(politicalDonation, 100000))}</td>
                                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                        {formatKRW(Math.round(Math.min(politicalDonation, 100000) * (100 / 110)))}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-750">10만 ~ 3천만원</td>
                                    <td className="py-2 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">
                                        {formatKRW(Math.max(0, Math.min(politicalDonation, 30000000) - 100000))}
                                    </td>
                                    <td className="py-2 px-3 font-mono text-[11px] border-r border-slate-200 dark:border-slate-750">3천만원</td>
                                    <td className="py-2 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">
                                        {formatKRW(Math.max(0, Math.min(politicalDonation, 30000000) - 100000))}
                                    </td>
                                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                        {formatKRW(Math.round(Math.max(0, Math.min(politicalDonation, 30000000) - 100000) * 0.15))}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-750">3천만원 초과</td>
                                    <td className="py-2 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">
                                        {formatKRW(Math.max(0, politicalDonation - 30000000))}
                                    </td>
                                    <td className="py-2 px-3 font-mono text-[11px] border-r border-slate-200 dark:border-slate-750">근로소득금액 내</td>
                                    <td className="py-2 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">
                                        {formatKRW(Math.max(0, politicalDonation - 30000000))}
                                    </td>
                                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                        {formatKRW(Math.round(Math.max(0, politicalDonation - 30000000) * 0.25))}
                                    </td>
                                </tr>

                                {/* 2. 고향사랑 기부금 */}
                                <tr>
                                    <td rowSpan={4} className="py-2.5 px-3 font-bold bg-slate-50/50 dark:bg-slate-850/50 border-r border-slate-200 dark:border-slate-750 align-top">
                                        ② 고향사랑<br />기부금
                                    </td>
                                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-750">10만원 이하 (100/110)</td>
                                    <td className="py-2 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">{formatKRW(hometownUnder10)}</td>
                                    <td className="py-2 px-3 font-mono text-[11px] border-r border-slate-200 dark:border-slate-750">10만원</td>
                                    <td className="py-2 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">{formatKRW(hometownUnder10)}</td>
                                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                        {formatKRW(Math.round(hometownUnder10 * (100 / 110)))}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-750">10만~20만원 이하 (40%)</td>
                                    <td className="py-2 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">{formatKRW(hometown10to20)}</td>
                                    <td className="py-2 px-3 font-mono text-[11px] border-r border-slate-200 dark:border-slate-750">10만원</td>
                                    <td className="py-2 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">{formatKRW(hometown10to20)}</td>
                                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                        {formatKRW(Math.round(hometown10to20 * 0.40))}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-750">특별재난 20만 초과 (30%)</td>
                                    <td className="py-2 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">{formatKRW(hometownSpecialOver20)}</td>
                                    <td className="py-2 px-3 font-mono text-[11px] border-r border-slate-200 dark:border-slate-750">잔여한도 내</td>
                                    <td className="py-2 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">{formatKRW(hometownSpecialOver20)}</td>
                                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                        {formatKRW(Math.round(hometownSpecialOver20 * 0.30))}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-750">일반 20만 초과 (15%)</td>
                                    <td className="py-2 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">{formatKRW(hometownGeneralOver20)}</td>
                                    <td className="py-2 px-3 font-mono text-[11px] border-r border-slate-200 dark:border-slate-750">잔여한도 내</td>
                                    <td className="py-2 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">{formatKRW(hometownGeneralOver20)}</td>
                                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                        {formatKRW(Math.round(hometownGeneralOver20 * 0.15))}
                                    </td>
                                </tr>

                                {/* 3. 특례 기부금 */}
                                <tr>
                                    <td className="py-2.5 px-3 font-bold bg-slate-50/50 dark:bg-slate-850/50 border-r border-slate-200 dark:border-slate-750">
                                        ③ 특례 기부금<br /><span className="text-[10px] text-slate-400">(당해년도 '26년)</span>
                                    </td>
                                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-750">1천만 이하 15% / 초과 30%</td>
                                    <td className="py-2 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">{formatKRW(specialDonation)}</td>
                                    <td className="py-2 px-3 font-mono text-[11px] border-r border-slate-200 dark:border-slate-750">{formatKRW(calc.specialLimit)}</td>
                                    <td className="py-2 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">{formatKRW(Math.min(specialDonation, calc.specialLimit || 0))}</td>
                                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatKRW(calc.specialCredit)}</td>
                                </tr>

                                {/* 4. 우리사주조합 기부금 */}
                                <tr>
                                    <td className="py-2.5 px-3 font-bold bg-slate-50/50 dark:bg-slate-850/50 border-r border-slate-200 dark:border-slate-750">
                                        ④ 우리사주조합<br />기부금
                                    </td>
                                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-750">한도 30%, 공제율 15%</td>
                                    <td className="py-2 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">{formatKRW(employeeStockDonation)}</td>
                                    <td className="py-2 px-3 font-mono text-[11px] border-r border-slate-200 dark:border-slate-750">{formatKRW(calc.stockLimit)}</td>
                                    <td className="py-2 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">{formatKRW(Math.min(employeeStockDonation, calc.stockLimit || 0))}</td>
                                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatKRW(calc.stockCredit)}</td>
                                </tr>

                                {/* 5. 일반/종교 기부금 (Image 1 및 전달 수식 완벽 반영) */}
                                <tr>
                                    <td className="py-2.5 px-3 font-bold bg-slate-50/50 dark:bg-slate-850/50 border-r border-slate-200 dark:border-slate-750">
                                        ⑤ 종교단체 외<br />일반기부금
                                    </td>
                                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-750">한도 30%, 1천만 이하 15%</td>
                                    <td className="py-2 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">{formatKRW(nonReligiousDonation)}</td>
                                    <td className="py-2 px-3 font-mono text-[11px] border-r border-slate-200 dark:border-slate-750">{formatKRW(calc.nonRelLimit)}</td>
                                    <td className="py-2 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">{formatKRW(calc.nonRelEligible)}</td>
                                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatKRW(calc.nonRelCredit)}</td>
                                </tr>

                                <tr>
                                    <td className="py-2.5 px-3 font-bold bg-slate-50/50 dark:bg-slate-850/50 border-r border-slate-200 dark:border-slate-750 text-indigo-900 dark:text-indigo-300">
                                        ⑥ 종교단체<br />기부금 (반영 완료)
                                    </td>
                                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-300">
                                        잔여 10% + Min(잔여 20%, 종교외)
                                    </td>
                                    <td className="py-2 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">{formatKRW(religiousDonation)}</td>
                                    <td className="py-2 px-3 font-mono text-[11px] border-r border-slate-200 dark:border-slate-750">{formatKRW(calc.relLimit)}</td>
                                    <td className="py-2 px-3 text-right font-mono border-r border-slate-200 dark:border-slate-750">{formatKRW(calc.relEligible)}</td>
                                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatKRW(calc.relCredit)}</td>
                                </tr>

                                <tr className="bg-emerald-50 dark:bg-emerald-950/40 font-bold">
                                    <td colSpan={2} className="py-3 px-3 text-emerald-700 dark:text-emerald-300 border-r border-slate-200 dark:border-slate-750">
                                        기부금 세액공제 합계
                                    </td>
                                    <td colSpan={3} className="py-3 px-3 text-right text-xs text-emerald-700 dark:text-emerald-300 border-r border-slate-200 dark:border-slate-750">
                                        (정치자금 + 고향사랑 + 특례 + 우리사주 + 종교외 + 종교)
                                    </td>
                                    <td className="py-3 px-3 text-right font-mono text-sm text-emerald-600 dark:text-emerald-400 font-black">
                                        {formatKRW(calc.totalDonationCredit)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
        </div>
    );
}

// 4. 산출과정 통합 모달 (탭 구분: 신용카드 / 의료비 / 기부금)
export function UnifiedCalculationModal({ 
    isOpen, 
    onClose, 
    initialTab = 'card',
    cardData, 
    medicalData, 
    donationData 
}) {
    if (!isOpen) return null;
    const [activeTab, setActiveTab] = useState(initialTab || 'card');

    useEffect(() => {
        if (initialTab) setActiveTab(initialTab);
    }, [initialTab]);

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 text-xs">
                {/* 헤더 */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🔍</span>
                        <div>
                            <h2 className="text-base font-black text-slate-900 dark:text-white">
                                2026 연말정산 정밀 산출과정 검증
                            </h2>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                국세청 공식 서식 기준의 세법 계산 공식을 탭별로 확인할 수 있습니다.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all text-lg font-bold w-7 h-7 flex items-center justify-center cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* 탭 바 */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 px-5 pt-2 gap-2 overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => setActiveTab('card')}
                        className={`pb-2.5 px-3 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                            activeTab === 'card'
                                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                    >
                        <span>💳</span> 신용카드 등 산출과정
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('medical')}
                        className={`pb-2.5 px-3 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                            activeTab === 'medical'
                                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                    >
                        <span>🏥</span> 의료비 순차충당
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('donation')}
                        className={`pb-2.5 px-3 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                            activeTab === 'donation'
                                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                    >
                        <span>🎁</span> 기부금 배부한도
                    </button>
                </div>

                {/* 본문 스크롤 영역 */}
                <div className="p-5 overflow-y-auto space-y-6 flex-1">
                    {activeTab === 'card' && <CardDeductionContent data={cardData} />}
                    {activeTab === 'medical' && <MedicalDeductionContent data={medicalData} />}
                    {activeTab === 'donation' && <DonationDeductionContent data={donationData} />}
                </div>

                {/* 하단 닫기 */}
                <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-between items-center">
                    <span className="text-[11px] text-slate-400">
                        {activeTab === 'card' && '2026 자녀 기본공제 추가한도(α) 및 도서·공연·체육시설 30% 반영'}
                        {activeTab === 'medical' && '총급여 3% 초과분 난임(30%)·미숙아(20%)·본인/경로/장애인(15%) 순차 충당 반영'}
                        {activeTab === 'donation' && '정치자금·고향사랑·특례·우리사주·종교단체 법정 한도 순차 공제 반영'}
                    </span>
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all cursor-pointer"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}

// 하위 호환성을 위한 래퍼 모달들
export function CardDeductionModal({ isOpen, onClose, data }) {
    return (
        <UnifiedCalculationModal 
            isOpen={isOpen} 
            onClose={onClose} 
            initialTab="card" 
            cardData={data} 
        />
    );
}

export function MedicalDeductionModal({ isOpen, onClose, data }) {
    return (
        <UnifiedCalculationModal 
            isOpen={isOpen} 
            onClose={onClose} 
            initialTab="medical" 
            medicalData={data} 
        />
    );
}

export function DonationDeductionModal({ isOpen, onClose, data }) {
    return (
        <UnifiedCalculationModal 
            isOpen={isOpen} 
            onClose={onClose} 
            initialTab="donation" 
            donationData={data} 
        />
    );
}

// 5. 연말정산 데이터 옮기기 (내보내기 / 불러오기) 모달
export function TaxDataTransferModal({ isOpen, onClose, currentData, onImport, addToast }) {
    if (!isOpen) return null;
    const [mode, setMode] = useState('export'); // 'export' | 'import'
    const [importText, setImportText] = useState('');
    const [copied, setCopied] = useState(false);

    const jsonString = useMemo(() => {
        try {
            return JSON.stringify(currentData, null, 2);
        } catch {
            return '';
        }
    }, [currentData]);

    const handleDownload = () => {
        try {
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const now = new Date();
            const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
            const a = document.createElement('a');
            a.href = url;
            a.download = `2026_연말정산_설정_${dateStr}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            if (addToast) addToast('JSON 파일이 성공적으로 다운로드되었습니다.', 'success');
        } catch (e) {
            console.error(e);
            if (addToast) addToast('파일 다운로드 중 오류가 발생했습니다.', 'error');
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(jsonString);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            if (addToast) addToast('클립보드에 연말정산 데이터가 복사되었습니다.', 'success');
        } catch {
            if (addToast) addToast('클립보드 복사에 실패했습니다.', 'error');
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result;
            if (typeof content === 'string') {
                setImportText(content);
            }
        };
        reader.readAsText(file);
    };

    const handleApplyImport = () => {
        if (!importText.trim()) {
            if (addToast) addToast('불러올 JSON 데이터를 입력하거나 파일을 업로드하세요.', 'warning');
            return;
        }
        try {
            const parsed = JSON.parse(importText);
            if (!parsed || typeof parsed !== 'object') {
                throw new Error('유효한 객체 형태가 아닙니다.');
            }
            if (onImport) {
                onImport(parsed);
                if (addToast) addToast('연말정산 데이터가 성공적으로 반영되었습니다.', 'success');
                onClose();
            }
        } catch (err) {
            if (addToast) addToast(`데이터 형식 오류: ${err.message}`, 'error');
            else alert(`데이터 형식 오류: ${err.message}`);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 text-xs">
                {/* 헤더 */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">💾</span>
                        <div>
                            <h2 className="text-base font-black text-slate-900 dark:text-white">
                                연말정산 데이터 옮기기
                            </h2>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                설정 데이터를 JSON 파일로 내보내거나 기존 파일을 불러와 복원합니다.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all text-lg font-bold w-7 h-7 flex items-center justify-center cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* 탭 바 */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 px-5 pt-2 gap-2">
                    <button
                        type="button"
                        onClick={() => setMode('export')}
                        className={`pb-2 px-3 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                            mode === 'export'
                                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                    >
                        <span>📤</span> 데이터 내보내기 (저장)
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('import')}
                        className={`pb-2 px-3 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                            mode === 'import'
                                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                    >
                        <span>📥</span> 데이터 불러오기 (복원)
                    </button>
                </div>

                {/* 본문 */}
                <div className="p-5 overflow-y-auto space-y-4 flex-1">
                    {mode === 'export' ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                    현재 입력된 연말정산 설정 (JSON)
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleCopy}
                                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                                    >
                                        <span>📋</span> {copied ? '복사됨!' : '클립보드 복사'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDownload}
                                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                                    >
                                        <span>⬇️</span> JSON 다운로드
                                    </button>
                                </div>
                            </div>
                            <textarea
                                readOnly
                                value={jsonString}
                                rows={10}
                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-950 font-mono text-[11px] text-slate-700 dark:text-slate-300 focus:outline-hidden resize-none select-all"
                            />
                            <p className="text-[11px] text-slate-400">
                                💡 다운로드한 파일은 다른 기기나 브라우저에서 '불러오기' 탭을 통해 언제든 그대로 복원할 수 있습니다.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div>
                                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    1. 백업 JSON 파일 업로드
                                </label>
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleFileUpload}
                                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-950 dark:file:text-indigo-300 hover:file:bg-indigo-100 cursor-pointer border border-slate-200 dark:border-slate-750 rounded-xl p-2 bg-slate-50 dark:bg-slate-800"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    2. 또는 JSON 데이터 직접 붙여넣기
                                </label>
                                <textarea
                                    value={importText}
                                    onChange={(e) => setImportText(e.target.value)}
                                    placeholder="내보내기한 JSON 텍스트를 여기에 붙여넣으세요..."
                                    rows={8}
                                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 font-mono text-[11px] focus:outline-hidden"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleApplyImport}
                                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                            >
                                <span>📥</span> 연말정산 데이터 적용하기
                            </button>
                        </div>
                    )}
                </div>

                {/* 하단 닫기 */}
                <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}

// 4. 2026년 귀속 공제항목 종합 도움말 모달 (국세청 공식 기준 완벽 수록)
export function TaxGuideHelpModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    const [activeSection, setActiveSection] = useState('gross_salary');
    const [tipTab, setTipTab] = useState('tax_saving'); // 'tax_saving' | 'caution'

    const CATEGORIES = [
        {
            category: '기본 개념',
            items: [
                { id: 'gross_salary', title: '총급여' },
                { id: 'earned_deduction', title: '근로소득공제' },
                { id: 'earned_income', title: '근로소득금액' },
                { id: 'personal_deduction', title: '인적공제 (기본/추가)' },
                { id: 'pension_insurance', title: '연금보험료공제 (공적)' }
            ]
        },
        {
            category: '특별소득공제',
            items: [
                { id: 'special_insurance', title: '건강·고용·장기요양보험' },
                { id: 'housing_lease_loan', title: '주택임차차입금 원리금' },
                { id: 'mortgage_interest', title: '장기주택저당차입금 이자' }
            ]
        },
        {
            category: '그 밖의 소득공제',
            items: [
                { id: 'personal_pension_savings', title: '개인연금저축 (구)' },
                { id: 'small_business_yellow', title: '노란우산공제부금' },
                { id: 'housing_savings', title: '주택마련저축 (청약)' },
                { id: 'venture_investment', title: '투자조합출자 등' },
                { id: 'credit_card_deduction', title: '신용카드 등 사용금액' },
                { id: 'employee_stock', title: '우리사주조합 출연금' },
                { id: 'job_retention', title: '고용유지 중소기업' },
                { id: 'youth_longterm_fund', title: '청년형 장기펀드' },
                { id: 'national_growth_fund', title: '국민성장집합저축 (신설)' }
            ]
        },
        {
            category: '세액감면',
            items: [
                { id: 'sme_reduction', title: '중소기업 취업자 감면' },
                { id: 'shared_growth_reduction', title: '경영성과급·내일채움' },
                { id: 'foreigner_tech_reduction', title: '외국인기술자·우수인력' }
            ]
        },
        {
            category: '세액공제',
            items: [
                { id: 'earned_tax_credit', title: '근로소득 세액공제' },
                { id: 'child_tax_credit', title: '자녀세액공제 (9세/출생)' },
                { id: 'marriage_tax_credit', title: '혼인세액공제 (신설 50만)' },
                { id: 'pension_account_credit', title: '연금계좌 (연금저축/IRP)' },
                { id: 'special_insurance_credit', title: '보장성 보험료' },
                { id: 'special_medical_credit', title: '의료비 세액공제' },
                { id: 'special_education_credit', title: '교육비 세액공제' },
                { id: 'special_donation_credit', title: '기부금 세액공제' },
                { id: 'monthly_rent_credit', title: '월세액 세액공제' },
                { id: 'other_tax_credits', title: '그 밖의 세액공제 (납세조합/미분양/외국)' },
                { id: 'standard_tax_credit', title: '표준세액공제 (13만원)' }
            ]
        },
        {
            category: '세율 및 정산',
            items: [
                { id: 'income_deduction_cap', title: '소득공제 종합한도 (2,500만)' },
                { id: 'tax_base_rate', title: '과세표준 & 기본세율' },
                { id: 'refund_settle', title: '결정세액 & 국세청 계산사례' },
                { id: 'prepaid_tax', title: '기납부세액 & 3개월 분납' }
            ]
        }
    ];

    const SECTION_DATA = {
        gross_salary: {
            title: '총급여 (근로소득금액 계산의 출발점)',
            tag: '기본 개념',
            formula: '총급여액 = 연간근로소득 − 비과세소득',
            desc: (
                <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-750 space-y-1.5 text-[11px]">
                        <div className="font-bold text-slate-800 dark:text-slate-200">📌 연간 근로소득</div>
                        <p className="text-slate-600 dark:text-slate-400">
                            고용관계 등에 의해 근로를 제공하고 받는 모든 대가 (연봉과 비슷한 개념)
                        </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-750">
                        <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-2">📌 주요 비과세소득</h5>
                        <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                            <li>일직비, 숙직비, 여비 등</li>
                            <li>월 20만원 이내의 취재·벽지수당과 연구보조비</li>
                            <li>월 20만원 이내의 식비</li>
                            <li>월 20만원 이내의 자녀보육수당</li>
                            <li>자녀 출생일 이후 2년 이내에 2회에 한하여 지급받는 출산지원금</li>
                            <li>일정요건의 본인학자금, 근로장학금</li>
                            <li>생산직 근로자의 야간근로수당 등</li>
                            <li>월 100만원(500만원) 이내의 국외근로소득</li>
                            <li>육아휴직 급여 및 출산전후 휴가급여 등</li>
                            <li>연 700만원 이하의 직무발명보상금</li>
                            <li>임직원이 자사나 계열사의 재화나 용역을 시가보다 할인구매한 경우 시가의 20% 또는 연 240만원 중 큰 금액</li>
                        </ul>
                    </div>
                </div>
            ),
            tax_saving: [
                'Tip 01 (총급여액에 포함되지 않는 소득): 출퇴근 교통비, 체력단련비, 종업원의 자녀가 사용자로부터 받는 학자금·장학금, 종업원이 주택의 구입·임차 자금을 저리 또는 무상으로 대여받아 얻는 이익(조특법상 중소기업 종업원 제외), 종업원이 부담할 소득세 등을 사용자가 부담한 금액, 채용 확정 전에 신입사원 연수기간 동안 지급받는 연수수당, 근로 관계 없는 대학생 등에게 지급하는 조건부 대여 장학금',
                'Tip 02: 생산직 및 관련직 근로자로서 월정액급여 210만원 이하, 직전 과세기간 총급여액 3000만원 이하인 근로자의 연장·야간·휴일 근로수당 중 연 240만원 이내(광산·일용근로자는 전액)의 금액은 비과세',
                'Tip 03: 국외(북한지역 포함)에서 근로를 제공하고 받는 보수 중 월 100만원(원양어업선박, 국외 등을 항행하는 선박, 국외건설현장 근로자는 500만원) 이내의 금액은 비과세'
            ],
            caution: [
                'Tip 01 (총급여액에 포함되는 소득): 출퇴근 교통비, 체력단련비, 학자금·장학금, 주택 저리 대여 이익, 사용자 대납 소득세 등 과세요건을 갖춘 항목은 반드시 총급여액에 합산하여 신고해야 합니다.',
                'Tip 02: 비과세 요건(실제 본인 차량 업무 사용, 만 6세 이하 자녀 등)을 갖추지 못한 수당은 과세대상 근로소득으로 추징될 수 있습니다.',
                'Tip 03: 법인세 세무조정 등으로 발생한 인정상여 처분 급여도 총급여액에 반드시 포함하여 정산해야 합니다.'
            ]
        },

        earned_deduction: {
            title: '근로소득공제 (근로자 필수 비용 공제)',
            tag: '기본 개념',
            formula: '근로소득공제 한도 = 최대 2,000만원',
            desc: (
                <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        근로소득자가 직무를 수행하는 데 필수적으로 들어가는 비용을 감안하여 총급여액에서 법정 누진 비율에 따라 일괄 공제합니다. 별도의 신청이나 영수증 증빙이 필요 없습니다.
                    </p>
                    <div className="border border-slate-200 dark:border-slate-750 rounded-xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-100 dark:bg-slate-800 font-bold">
                                <tr>
                                    <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-750">총급여액 구간</th>
                                    <th className="py-2 px-3">공제금액 산출식 (공제한도 2,000만원)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                                <tr>
                                    <td className="py-1.5 px-3 border-r">500만원 이하</td>
                                    <td className="py-1.5 px-3 font-bold text-indigo-600">총급여액의 70%</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 border-r">500만 초과 ~ 1,500만원 이하</td>
                                    <td className="py-1.5 px-3">350만원 + (총급여액 − 500만원) × 40%</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 border-r">1,500만 초과 ~ 4,500만원 이하</td>
                                    <td className="py-1.5 px-3">750만원 + (총급여액 − 1,500만원) × 15%</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 border-r">4,500만 초과 ~ 1억원 이하</td>
                                    <td className="py-1.5 px-3">1,200만원 + (총급여액 − 4,500만원) × 5%</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 border-r">1억원 초과</td>
                                    <td className="py-1.5 px-3">1,475만원 + (총급여액 − 1억원) × 2% (최대 2,000만원)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            ),
            tax_saving: [
                'Tip 01: 근무기간이 1년 미만(중도 입사 또는 퇴사)인 경우에도 월할 계산하지 않고 공제금액 전액을 공제받습니다.',
                'Tip 02: 인정상여 처분된 급여도 총급여액에 포함하여 공제금액을 계산하므로 공제액이 함께 증가합니다.',
                'Tip 03: 2개 이상의 직장에서 급여를 받는 경우 각 직장의 총급여를 합산한 금액을 기준으로 근로소득공제를 1회만 적용합니다.'
            ],
            caution: [
                '총급여액이 근로소득공제 계산금액에 미달하는 경우에는 총급여액을 한도로 전액 공제합니다 (소득이 음수가 되지 않음).',
                '일용근로자의 경우 누진공제표가 아닌 1일 15만원 정액 근로소득공제가 적용되므로 상용근로자 계산과 구분해야 합니다.'
            ]
        },

        earned_income: {
            title: '근로소득금액 (종합소득 및 공제 한도의 기준)',
            tag: '기본 개념',
            formula: '근로소득금액 = 총급여액 − 근로소득공제',
            desc: (
                <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        근로소득공제를 차감하고 남은 순수한 소득 금액입니다. 이 근로소득금액은 기부금 한도, 부녀자공제(3천만원 이하), 청약저축 소득공제(총급여 7천만 이하), 노란우산공제 한도 판정의 기준이 됩니다.
                    </p>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-750 font-mono text-[11px] space-y-1">
                        <div><strong>예시: 총급여 5,000만원인 경우</strong></div>
                        <div>근로소득공제 = 1,200만원 + (5,000만 − 4,500만) × 5% = 1,225만원</div>
                        <div className="text-indigo-600 dark:text-indigo-400 font-bold">근로소득금액 = 5,000만원 − 1,225만원 = 3,775만원</div>
                    </div>
                </div>
            ),
            tax_saving: [
                '근로소득금액이 낮아질수록 세율 적용 전 과세표준이 낮아지므로 비과세 급여 항목 증빙을 빠짐없이 챙기는 것이 유리합니다.'
            ],
            caution: [
                '부양가족의 연간 소득금액 합계가 100만원(근로소득만 있는 경우 총급여 500만원)을 초과하면 기본공제 대상에서 제외됩니다.'
            ]
        },

        personal_deduction: {
            title: '인적공제 (기본공제 및 추가공제)',
            tag: '기본 개념',
            formula: '기본공제 1인당 150만원 + 추가공제(50만~200만원)',
            desc: (
                <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        근로자 본인과 생계를 같이하는 부양가족에 대해 소득공제를 제공하여 가족 구성원의 생계비를 보장하는 가장 강력한 기초 소득공제 항목입니다.
                    </p>
                    <div className="border border-slate-200 dark:border-slate-750 rounded-xl overflow-hidden">
                        <table className="w-full text-left border-collapse text-[11px]">
                            <thead className="bg-slate-100 dark:bg-slate-800 font-bold">
                                <tr>
                                    <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-750">구분</th>
                                    <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-750">대상 요건 (연간 소득금액 100만원 이하)</th>
                                    <th className="py-2 px-3">공제금액</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                <tr>
                                    <td className="py-1.5 px-3 font-bold border-r">본인 / 배우자</td>
                                    <td className="py-1.5 px-3 border-r">배우자는 연령 제한 없음</td>
                                    <td className="py-1.5 px-3 font-mono font-bold text-indigo-600">1인당 150만원</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 font-bold border-r">직계존속</td>
                                    <td className="py-1.5 px-3 border-r">부모, 조부모 (만 60세 이상)</td>
                                    <td className="py-1.5 px-3 font-mono font-bold text-indigo-600">1인당 150만원</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 font-bold border-r">직계비속·입양자</td>
                                    <td className="py-1.5 px-3 border-r">자녀, 손자녀 (만 20세 이하)</td>
                                    <td className="py-1.5 px-3 font-mono font-bold text-indigo-600">1인당 150만원</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 font-bold border-r">형제자매</td>
                                    <td className="py-1.5 px-3 border-r">만 20세 이하 또는 만 60세 이상</td>
                                    <td className="py-1.5 px-3 font-mono font-bold text-indigo-600">1인당 150만원</td>
                                </tr>
                                <tr className="bg-slate-50 dark:bg-slate-850">
                                    <td className="py-1.5 px-3 font-bold border-r text-purple-600">경로우대</td>
                                    <td className="py-1.5 px-3 border-r">기본공제대상자 중 만 70세 이상</td>
                                    <td className="py-1.5 px-3 font-mono font-bold text-purple-600">+100만원</td>
                                </tr>
                                <tr className="bg-slate-50 dark:bg-slate-850">
                                    <td className="py-1.5 px-3 font-bold border-r text-purple-600">장애인</td>
                                    <td className="py-1.5 px-3 border-r">기본공제대상자 (나이 제한 없음)</td>
                                    <td className="py-1.5 px-3 font-mono font-bold text-purple-600">+200만원</td>
                                </tr>
                                <tr className="bg-slate-50 dark:bg-slate-850">
                                    <td className="py-1.5 px-3 font-bold border-r text-purple-600">한부모</td>
                                    <td className="py-1.5 px-3 border-r">배우자 없이 기본공제 자녀를 둔 가장</td>
                                    <td className="py-1.5 px-3 font-mono font-bold text-purple-600">+100만원</td>
                                </tr>
                                <tr className="bg-slate-50 dark:bg-slate-850">
                                    <td className="py-1.5 px-3 font-bold border-r text-purple-600">부녀자</td>
                                    <td className="py-1.5 px-3 border-r">근로소득금액 3천만원 이하 여성 세대주 등</td>
                                    <td className="py-1.5 px-3 font-mono font-bold text-purple-600">+50만원</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            ),
            tax_saving: [
                'Tip 01: 취업이나 주거 형편으로 부모님과 따로 살고 있는 경우에도 실제로 생활비를 보조하는 경우 기본공제(150만)를 받을 수 있습니다.',
                'Tip 02: 배우자의 형제자매(처남, 처제, 시동생 등)도 본인이 주민등록상 함께 거주하며 실제로 부양하는 경우 기본공제 대상에 포함됩니다.',
                'Tip 03: 장애인은 연령 제한이 없으므로, 20세를 초과한 성인 자녀나 60세 미만의 부모님도 소득요건(100만원 이하)만 충족하면 기본공제(150만) 및 장애인 추가공제(200만)를 모두 받습니다.'
            ],
            caution: [
                '맞벌이 부부가 동일한 자녀를 부모 양쪽에서 이중으로 기본공제 신청하면 부당공제로 가산세가 부과됩니다.',
                '한부모공제(100만원)와 부녀자공제(50만원)가 중복되는 경우 한부모공제가 우선 적용됩니다 (중복 배제).',
                '이혼한 배우자, 사실혼 배우자, 며느리, 사위, 삼촌, 외삼촌, 조카 등은 원칙적으로 기본공제 대상이 아닙니다.'
            ]
        },

        pension_insurance: {
            title: '연금보험료공제 (공적연금 본인 부담분)',
            tag: '기본 개념',
            formula: '공적연금 본인 납입액 = 전액 소득공제 (한도 없음)',
            desc: (
                <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        국민연금, 공무원연금, 군인연금, 사립학교교직원연금, 별정우체국연금 등 법률에 따라 근로자 본인이 과세기간 중 납입한 기여금 또는 부담금 전액을 근로소득금액에서 공제합니다.
                    </p>
                </div>
            ),
            tax_saving: [
                '실직이나 휴직 기간 중 납부 예외로 미납되었던 국민연금 보험료를 당해 연도에 소급하여 추가 납부(추납)한 경우 납부한 당해 과세연도에 전액 소득공제됩니다.'
            ],
            caution: [
                '배우자나 부양가족 명의로 불입된 공적연금 보험료는 근로자 본인이 대신 납부했더라도 대리 공제받을 수 없습니다.',
                '개인연금저축이나 IRP 등 사적연금은 소득공제가 아니며, 세액공제(12~15%) 항목으로 정산됩니다.'
            ]
        },

        special_insurance: {
            title: '특별소득공제 - 건강보험·고용보험·노인장기요양보험',
            tag: '특별소득공제',
            formula: '근로자 본인부담액 = 전액 소득공제 (한도 없음)',
            desc: (
                <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        근로자(일용근로자 제외)가 법률에 따라 부담하는 국민건강보험료, 고용보험료, 노인장기요양보험료는 급여에서 지급한 날이 속하는 과세기간의 근로소득금액에서 전액 공제합니다. 회사 급여대장에서 자동 집계되므로 별도 증빙서류 제출이 불필요합니다.
                    </p>
                </div>
            ),
            tax_saving: [
                'Tip 01: 국민건강보험료 등을 사용자가 대신 지급하는 경우, 보험료 상당액을 총급여액에 가산한 후 전액 보험료 소득공제를 받을 수 있습니다.',
                'Tip 02: 전년도 급여를 근무월수로 나눈 보수액 기준으로 건강보험료를 부과한 후 익년 3월에 정산하는 경우, 당해 연도에 납부한 금액을 공제하고 정산 차액은 실제 정산한 연도에 공제합니다.'
            ],
            caution: [
                '사용자가 12월분 급여에서 공제한 국민건강보험료를 다음 연도 1월에 납부하더라도 급여 지급일이 속한 당해 과세기간에 공제합니다.',
                '근로자 본인 부담분만 공제되며, 지역가입자로서 가족 명의로 납부된 건강보험료는 본인 연말정산에 반영할 수 없습니다.'
            ]
        },

        housing_lease_loan: {
            title: '특별소득공제 - 주택임차차입금 원리금상환액 (전세대출)',
            tag: '특별소득공제',
            formula: '원리금 상환액 × 40% (주택마련저축과 합산 연간 400만원 한도)',
            desc: (
                <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        과세기간 종료일(12.31) 현재 무주택 세대의 세대주(세대원)가 국민주택규모(85㎡ 이하, 읍·면 100㎡ 이하) 또는 주거용 오피스텔을 임차하기 위해 빌린 대출 원리금을 상환하는 경우 상환액의 40%를 소득공제합니다.
                    </p>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-[11px] space-y-1.5">
                        <div><strong>1. 대출기관 차입:</strong> 입주 전후 3개월 이내 차입, 대출금이 임대인 계좌로 직접 입금 (소득 제한 없음)</div>
                        <div><strong>2. 거주자(개인) 차입:</strong> 총급여 5,000만원 이하 근로자, 입주 전후 1개월 이내 차입, 연이율 2.9% 이상 요건 충족</div>
                    </div>
                </div>
            ),
            tax_saving: [
                'Tip 01: 세대주가 주택자금공제를 받지 않은 경우 세대원인 근로자도 본인 명의 계약 및 차입금에 대해 공제받을 수 있습니다.',
                'Tip 02: 연도 중 다른 주택으로 이사한 경우에도 종전 주택과 신규 주택의 요건이 유지되면 원리금 상환액을 합산하여 연간 400만원 한도 내에서 계속 공제받습니다.'
            ],
            caution: [
                'Tip 01: 일반 법인이나 각종 공제회(사내대출 등 금융기관이 아닌 기관)에서 차입한 주택임차차입금은 소득공제 적용이 불가합니다.',
                'Tip 02: 과세기간 종료일(12.31) 현재 유주택 세대인 경우 당해 연도 상환액 전체에 대해 공제를 받을 수 없습니다.',
                'Tip 03: 개인에게 차입한 경우 총급여 5,000만원을 초과하면 공제 대상에서 원천 제외됩니다.'
            ]
        },

        mortgage_interest: {
            title: '특별소득공제 - 장기주택저당차입금 이자상환액 (주택담보대출)',
            tag: '특별소득공제',
            formula: '조건별 연 600만 ~ 최대 2,000만원 한도 (종합한도 적용)',
            desc: (
                <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        무주택 또는 1주택을 보유한 세대의 세대주(세대원)가 취득 당시 기준시가 6억원 이하(’24년 이전 5억원) 주택을 취득하기 위해 금융기관 등으로부터 차입한 장기 담보대출의 이자 상환액을 소득공제합니다.
                    </p>
                    <div className="border border-slate-200 dark:border-slate-750 rounded-xl overflow-hidden">
                        <table className="w-full text-left border-collapse text-[11px]">
                            <thead className="bg-slate-100 dark:bg-slate-800 font-bold">
                                <tr>
                                    <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-750">상환 방식 구분</th>
                                    <th className="py-2 px-3 text-right font-mono">공제 한도</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                <tr>
                                    <td className="py-1.5 px-3 border-r">15년 이상 고정금리 AND 비거치식 분할상환</td>
                                    <td className="py-1.5 px-3 text-right font-mono font-bold text-indigo-600">연 2,000만원</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 border-r">15년 이상 고정금리 OR 비거치식 분할상환</td>
                                    <td className="py-1.5 px-3 text-right font-mono font-bold text-indigo-600">연 1,500만원</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 border-r">15년 이상 기타 상환 방식 (변동/거치 등)</td>
                                    <td className="py-1.5 px-3 text-right font-mono font-bold text-indigo-600">연 1,000만원 (이전 800만)</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 border-r">10년 이상 고정금리 OR 비거치식 분할상환</td>
                                    <td className="py-1.5 px-3 text-right font-mono font-bold text-indigo-600">연 600만원</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="text-[11px] text-slate-500">
                        ※ 주택임차차입금 원리금 + 주택마련저축 + 장기주택저당차입금 이자를 합산하여 장기주택저당차입금 해당 한도 이내로 종합 적용됩니다.
                    </p>
                </div>
            ),
            tax_saving: [
                'Tip 01: 연도 중에 일시적으로 2주택을 보유했더라도 과세기간 종료일(12.31) 현재 세대 구성원 전체의 보유 주택이 1주택이면 당해 연도 이자 전액 공제가 가능합니다.',
                'Tip 02: 금융기관 간 대환대출(차환)을 통해 금리를 낮추거나 고정금리로 전환하는 경우에도 기존 대출 요건을 유지하면 공제가 계속 승계됩니다.',
                'Tip 03: 부부 공동명의 주택의 경우 본인 명의로 채무를 부담한 이자 상환액에 대해 공제를 적용받을 수 있습니다.'
            ],
            caution: [
                'Tip 01: 주택 분양권(조합원 입주권 포함)의 경우 분양가격이 기준시가 요건(6억원 이하)을 충족해야 차입금 이자 공제가 가능합니다.',
                'Tip 02: 과세기간 종료일(12.31) 현재 세대 구성원이 보유한 주택이 2주택 이상인 경우 해당 과세연도 이자상환액 전체에 대해 소득공제를 받을 수 없습니다.'
            ]
        },

        personal_pension_savings: {
            title: '그 밖의 소득공제 - 개인연금저축 (구 개인연금)',
            tag: '그 밖의 소득공제',
            formula: '납입액의 40% (연간 최대 72만원 한도)',
            desc: (
                <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        거주자가 본인 명의로 <strong>2000년 12월 31일 이전</strong>에 가입한 구 개인연금저축에 납입한 금액의 40%를 소득공제합니다. 연간 최대 공제 한도는 72만원(연 납입액 180만원 시 최대)입니다.
                    </p>
                </div>
            ),
            tax_saving: [
                'Tip 01: 개인연금저축신탁뿐만 아니라 개인연금저축보험도 납입액 중 저축성 불입액에 대해 연 72만원 한도로 소득공제를 적용합니다.',
                'Tip 02: 분기별 불입한도 범위 내에서 자유롭게 납입하여 공제 한도를 채울 수 있습니다.'
            ],
            caution: [
                'Tip 01: 개인연금저축을 중도해지한 경우 당해 연도 저축불입액은 전액 소득공제 대상에서 제외되며 해지가산세가 부과될 수 있습니다.',
                'Tip 02: 2001년 1월 1일 이후 가입한 연금저축(신탁/펀드/보험)은 소득공제가 아닌 연금계좌 세액공제(12~15%)로 적용되므로 혼동하지 않아야 합니다.'
            ]
        },

        small_business_yellow: {
            title: '그 밖의 소득공제 - 소기업·소상공인 공제부금 (노란우산)',
            tag: '그 밖의 소득공제',
            formula: '근로/사업소득 구간별 연 200만 ~ 최대 600만원 한도',
            desc: (
                <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        소상공인 및 소기업 법인대표자(총급여 8,000만원 이하)가 중소기업중앙회의 공제부금에 납입한 금액을 소득공제합니다.
                    </p>
                    <div className="border border-slate-200 dark:border-slate-750 rounded-xl overflow-hidden">
                        <table className="w-full text-left border-collapse text-[11px]">
                            <thead className="bg-slate-100 dark:bg-slate-800 font-bold">
                                <tr>
                                    <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-750">사업(근로)소득금액 구간</th>
                                    <th className="py-2 px-3 text-right font-mono">공제 한도</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                                <tr>
                                    <td className="py-1.5 px-3 border-r">4,000만원 이하</td>
                                    <td className="py-1.5 px-3 text-right font-bold text-indigo-600">600만원</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 border-r">4,000만원 초과 ~ 6,000만원 이하</td>
                                    <td className="py-1.5 px-3 text-right font-bold text-indigo-600">500만원</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 border-r">6,000만원 초과 ~ 1억원 이하</td>
                                    <td className="py-1.5 px-3 text-right font-bold text-indigo-600">400만원</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 border-r">1억원 초과</td>
                                    <td className="py-1.5 px-3 text-right font-bold text-slate-500">200만원</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="text-[11px] text-slate-500">
                        ※ ’26.1.1~’26.6.30 납입분은 분기별 300만원 납입 한도, ’26.7.1 이후 납입분은 연 1,800만원 납입 한도가 적용됩니다.
                    </p>
                </div>
            ),
            tax_saving: [
                'Tip 01: 소기업·소상공인 공제부금에 가입한 법인대표자가 총급여액 8천만원 이하이면 근로소득 연말정산에서도 소득공제가 허용됩니다.',
                'Tip 02: 납입 부금은 법령에 의해 압류가 금지되며 복리 이자가 적용되어 소기업 대표자의 대표적인 안전자산 절세처로 활용됩니다.'
            ],
            caution: [
                '법인대표자의 총급여액이 8,000만원을 초과하는 연도에는 해당 과세기간 근로소득에 대해 공제가 불가능합니다.',
                '폐업 등 정당한 사유 없이 임의 해약할 경우 기타소득세(16.5%)가 원천징수되어 손실이 발생할 수 있습니다.'
            ]
        },

        housing_savings: {
            title: '그 밖의 소득공제 - 주택마련저축 (청약저축, 주택청약종합저축)',
            tag: '그 밖의 소득공제',
            formula: '연 300만원 납입액의 40% (연간 120만원 한도)',
            desc: (
                <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        총급여 7,000만원 이하인 무주택 세대주 근로자가 청약저축 또는 주택청약종합저축에 납입한 금액의 40%를 소득공제합니다. 2024년부터 연간 납입한도가 240만원에서 <strong>300만원(공제한도 120만원)</strong>으로 확대 적용되고 있습니다.
                    </p>
                    <p className="text-[11px] text-slate-500">
                        ※ 주택임차차입금 원리금상환액 공제금액과 주택마련저축 공제금액을 합하여 연간 400만원 한도를 적용합니다.
                    </p>
                </div>
            ),
            tax_saving: [
                'Tip 01: 월 납입 인정액이 상향되어 매월 25만원씩 불입 시 연간 300만원 한도를 채워 최대 120만원 소득공제를 모두 챙길 수 있습니다.',
                'Tip 02: 주택 당첨이나 만기 등 당초 가입 목적 달성으로 중도 해지하는 경우 당해 연도 불입액도 정상적으로 소득공제 가능합니다.'
            ],
            caution: [
                'Tip 01: 주택청약종합저축 가입 후 5년 이내에 중도 해지 시 실제 감면받은 세액을 한도로 납입액의 6%가 해지가산세로 부과됩니다.',
                'Tip 02: 배우자 명의의 청약저축 통장은 근로자 본인이 대신 납입했더라도 소득공제 대상이 아니며, 근로자 본인이 주민등록상 세대주여야만 공제 가능합니다.'
            ]
        },

        venture_investment: {
            title: '그 밖의 소득공제 - 투자조합출자 등 (벤처기업 투자)',
            tag: '그 밖의 소득공제',
            formula: '3천만 이하 100%, 3천~5천만 70%, 5천만 초과 30% (소득금액 50% 한도)',
            desc: (
                <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        중소기업창업투자조합, 벤처투자조합, 벤처기업 직접투자에 출자 또는 투자한 금액에 대해 파격적인 소득공제 혜택을 부여합니다 (공제한도: 종합소득금액의 50%).
                    </p>
                    <div className="border border-slate-200 dark:border-slate-750 rounded-xl overflow-hidden">
                        <table className="w-full text-left border-collapse text-[11px]">
                            <thead className="bg-slate-100 dark:bg-slate-800 font-bold">
                                <tr>
                                    <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-750">출자·투자 금액 구간</th>
                                    <th className="py-2 px-3 text-center font-bold text-indigo-600">공제율</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                                <tr>
                                    <td className="py-1.5 px-3 border-r">3,000만원 이하분</td>
                                    <td className="py-1.5 px-3 text-center font-bold text-indigo-600">100% 전액 소득공제</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 border-r">3,000만원 초과 ~ 5,000만원 이하분</td>
                                    <td className="py-1.5 px-3 text-center font-bold text-indigo-600">70%</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 border-r">5,000만원 초과분</td>
                                    <td className="py-1.5 px-3 text-center font-bold text-slate-500">30%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            ),
            tax_saving: [
                'Tip 01: 출자 또는 투자일이 속하는 과세연도부터 2년이 되는 날이 속하는 과세연도까지 1과세연도를 선택하여 공제 신청이 가능합니다 (소득이 높은 해에 몰아서 공제 가능).',
                'Tip 02: 벤처기업 투자신탁(펀드)에 투자하는 경우 소득금액의 50% 범위 내에서 연간 2천만원을 한도로 투자금액의 10% 소득공제가 가능합니다.'
            ],
            caution: [
                '투자일로부터 3년이 지나기 전에 지분을 양도하거나 투자금을 회수하는 경우 이미 공제받았던 세액이 전액 추징됩니다.'
            ]
        },

        credit_card_deduction: {
            title: '그 밖의 소득공제 - 신용카드 등 사용금액 (2026 자녀한도 상향)',
            tag: '그 밖의 소득공제',
            formula: '총급여 25% 초과분 공제 (기본한도 250만~300만원 + 자녀 1인당 50만/25만 추가)',
            desc: (
                <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        총급여액의 25%를 초과하여 사용한 금액에 대해 신용카드(15%), 체크카드·현금영수증(30%), 도서공연(30%), 전통시장·대중교통(40%) 차등 공제합니다.
                    </p>
                    <div className="border border-slate-200 dark:border-slate-750 rounded-xl overflow-hidden">
                        <table className="w-full text-left border-collapse text-[11px]">
                            <thead className="bg-slate-100 dark:bg-slate-800 font-bold">
                                <tr>
                                    <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-750">구분</th>
                                    <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-750 text-center">7천만원 이하</th>
                                    <th className="py-2 px-3 text-center">7천만원 초과</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                                <tr>
                                    <td className="py-1.5 px-3 font-bold border-r">기본공제 한도</td>
                                    <td className="py-1.5 px-3 text-center font-bold text-indigo-600 border-r">300만원</td>
                                    <td className="py-1.5 px-3 text-center font-bold text-indigo-600">250만원</td>
                                </tr>
                                <tr className="bg-indigo-50/50 dark:bg-indigo-950/40">
                                    <td className="py-1.5 px-3 font-bold border-r text-indigo-700 dark:text-indigo-300">26.1.1 자녀추가한도</td>
                                    <td className="py-1.5 px-3 text-center font-bold text-indigo-700 border-r">1인당 50만원 (최대 100만)</td>
                                    <td className="py-1.5 px-3 text-center font-bold text-indigo-700">1인당 25만원 (최대 50만)</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 font-bold border-r">전통시장/교통 추가</td>
                                    <td className="py-1.5 px-3 text-center border-r">최대 300만원 추가</td>
                                    <td className="py-1.5 px-3 text-center">최대 300만원 추가</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            ),
            tax_saving: [
                'Tip 01: 총급여 25%까지는 포인트나 할인 혜택이 많은 신용카드로 채우고, 25% 초과분부터는 공제율이 2배 높은 체크카드·현금영수증(30%)이나 전통시장·대중교통(40%)으로 결제하는 황금 비율을 지키세요.',
                'Tip 02: 맞벌이 부부는 총급여가 더 낮은 배우자의 카드를 우선 사용하면 25% 최저 문턱을 훨씬 빠르게 넘겨 공제 혜택을 크게 받을 수 있습니다.'
            ],
            caution: [
                'Tip 01: 신용카드(가족카드 포함)는 대금 결제자가 아닌 실제 카드 명의자를 기준으로 소득공제 대상자를 적용합니다.',
                'Tip 02: 보험료, 기부금, 국세, 지방세, 아파트 관리비, 고속도로 통행료, 상품권 구입비, 자동차 구입비, 해외 사용액은 신용카드 공제 대상에서 원천 제외됩니다.'
            ]
        },

        employee_stock: {
            title: '그 밖의 소득공제 - 우리사주조합 출연금',
            tag: '그 밖의 소득공제',
            formula: '연 400만원 한도 (벤처기업은 1,500만원 한도)',
            desc: (
                <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        우리사주조합원이 우리사주를 취득하기 위해 조합에 출자하는 경우 연간 400만원(벤처기업 1,500만원) 한도로 전액 소득공제합니다.
                    </p>
                </div>
            ),
            tax_saving: [
                'Tip 01: 출연 시 전액 소득공제 혜택을 받고, 증권금융회사에 3년 이상 예탁 후 인출할 때 근로소득세 비과세 혜택(3~5년 50%, 5년 이상 75% 비과세)을 누릴 수 있습니다.'
            ],
            caution: [
                '연말정산 시 소득공제를 받지 않은 초과 출연금은 인출 시 과세대상에서 제외되도록 우리사주조합이 증권금융회사에 제외 통보를 해야 합니다.'
            ]
        },

        job_retention: {
            title: '그 밖의 소득공제 - 고용유지 중소기업 근로자',
            tag: '그 밖의 소득공제',
            formula: '직전 연도 대비 임금 삭감액의 50% (연 1,000만원 한도)',
            desc: (
                <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        경영 위기에도 불구하고 고용 유지를 위해 노사 합의로 임금을 삭감한 중소기업 근로자에 대해 임금 삭감액의 절반(50%)을 연 1,000만원 한도로 소득공제합니다.
                    </p>
                </div>
            ),
            tax_saving: [
                '회사가 고용유지 요건을 갖추어 관할 세무서에 고용유지중소기업 소득공제 신청서를 제출하면 근로자 소득공제가 일괄 적용됩니다.'
            ],
            caution: [
                '근로자 개인이 임의로 급여를 삭감한 경우는 해당되지 않으며 법정 요건을 갖춘 중소기업 합의서가 필수입니다.'
            ]
        },

        youth_longterm_fund: {
            title: '그 밖의 소득공제 - 청년형 장기집합투자증권저축',
            tag: '그 밖의 소득공제',
            formula: '연 납입액(최대 600만)의 40% (연간 최대 240만원 한도)',
            desc: (
                <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        만 19~34세 청년(총급여 5,000만원 이하 또는 종합소득 3,800만원 이하)이 청년형 장기펀드에 납입한 금액(연 600만원 한도)의 40%를 연간 최대 240만원까지 소득공제합니다.
                    </p>
                </div>
            ),
            tax_saving: [
                'Tip 01: 연 600만원 납입 시 240만원의 소득공제를 받아 과세표준 구간에 따라 최대 수십만원의 세금을 환급받습니다.'
            ],
            caution: [
                '가입 후 3년 이내에 해지하는 경우 실제 감면받은 세액을 한도로 납입액의 6%가 추징세액으로 과세됩니다 (단, 사망·해외이주 등 부득이한 사유 제외).'
            ]
        },

        national_growth_fund: {
            title: '그 밖의 소득공제 - 국민성장집합투자증권저축 (’26.5.12 신설)',
            tag: '그 밖의 소득공제',
            formula: '투자금액 2억원 한도, 구간별 40%~10% 공제 (최대 1,800만원)',
            desc: (
                <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        <strong>2026년 5월 12일 신설 시행</strong>되는 제도로, 국가 신성장 동력 및 자본시장 육성을 위해 국민성장펀드에 투자한 금액에 대해 파격적인 소득공제를 제공합니다.
                    </p>
                    <div className="border border-slate-200 dark:border-slate-750 rounded-xl overflow-hidden">
                        <table className="w-full text-left border-collapse text-[11px]">
                            <thead className="bg-slate-100 dark:bg-slate-800 font-bold">
                                <tr>
                                    <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-750">투자금액 구간</th>
                                    <th className="py-2 px-3 text-right font-mono">공제금액 산출식 (한도 1,800만원)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                                <tr>
                                    <td className="py-1.5 px-3 border-r">3,000만원 이하</td>
                                    <td className="py-1.5 px-3 text-right font-bold text-indigo-600">투자금액의 40%</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 border-r">3,000만 초과 ~ 5,000만원 이하</td>
                                    <td className="py-1.5 px-3 text-right">1,200만원 + (3,000만원 초과분 × 20%)</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 border-r">5,000만 초과 ~ 7,000만원 이하</td>
                                    <td className="py-1.5 px-3 text-right">1,600만원 + (5,000만원 초과분 × 10%)</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 border-r">7,000만원 초과</td>
                                    <td className="py-1.5 px-3 text-right font-bold text-indigo-600">1,800만원 한도 정액</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            ),
            tax_saving: [
                '신설 시행일(’26.5.12) 이후 고소득 근로자가 최대 1,800만원 한도로 소득공제를 받으면 최고세율(38~45%) 구간에서 수백만원 이상의 절세가 가능합니다.'
            ],
            caution: [
                '시행일 이전 가입분은 소급 적용되지 않으며, 법정 의무보유 기간 요건을 충족해야 공제 혜택이 유지됩니다.'
            ]
        },

        income_deduction_cap: {
            title: '소득공제 종합한도 (조세특례제한법 제132조의2)',
            tag: '종합한도',
            formula: '특별공제(주택자금) + 그 밖의 소득공제 대상 합계 ≤ 2,500만원',
            desc: (
                <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        소득세를 계산할 때 특별소득공제(보험료 제외)와 그 밖의 소득공제 중 종합한도 대상 공제금액의 합계액이 <strong>2,500만원을 초과하는 경우 그 초과금액은 없는 것</strong>으로 합니다.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                        <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 space-y-1.5">
                            <span className="font-bold text-rose-700 dark:text-rose-300 block">
                                🔴 종합한도 적용대상 항목 (합산 2,500만 한도)
                            </span>
                            <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                                <li>특별소득공제 중 <strong>주택자금공제</strong> (전세대출 원리금 + 주담대 이자)</li>
                                <li><strong>소기업·소상공인 공제부금</strong> (노란우산공제)</li>
                                <li><strong>주택마련저축 소득공제</strong> (청약저축)</li>
                                <li><strong>우리사주조합 출연금</strong> 소득공제</li>
                                <li><strong>신용카드 등 사용금액</strong> 소득공제</li>
                                <li><strong>국민참여형 국민성장집합투자증권저축</strong> 소득공제</li>
                                <li>벤처투자조합 출자 등에 대한 소득공제 (단, 벤처기업 직접투자분 제외)</li>
                            </ul>
                        </div>

                        <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-1.5">
                            <span className="font-bold text-emerald-700 dark:text-emerald-300 block">
                                🟢 종합한도가 적용되지 않는 항목 (무제한 / 개별한도)
                            </span>
                            <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                                <li><strong>인적공제</strong> (기본공제, 추가공제)</li>
                                <li><strong>연금보험료 공제</strong> (국민연금 등 공적연금 전액)</li>
                                <li><strong>건강보험료, 고용보험료, 노인장기요양보험료</strong></li>
                                <li><strong>개인연금저축 소득공제</strong> (구 2000년 이전 가입분)</li>
                                <li><strong>벤처기업 직접 출자·투자분</strong> (조특법 제16조 제1항 제3,4,6호)</li>
                                <li><strong>고용유지 중소기업 근로자</strong> 소득공제</li>
                                <li>주택담보노후연금 이자비용 공제 (기준시가 9억원 이하)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            ),
            tax_saving: [
                '종합한도(2,500만원)에 걸리는 경우 추가적인 카드 사용이나 노란우산 부금은 공제 혜택이 사라지므로, 한도 제한이 없는 연금계좌(연금저축/IRP 세액공제), 벤처기업 직접투자, 의료비·기부금 세액공제 쪽으로 지출을 전환하는 것이 현명합니다.'
            ],
            caution: [
                'Tip 01: 종합한도 대상 공제액이 2,500만원을 초과하는 경우, 과세표준 계산 공식에서 "(+) 소득공제 종합한도 초과액"으로 가산되어 초과된 공제액이 전액 배제됩니다.',
                'Tip 02: 연금소득자가 기준시가 9억원 이하인 주택담보노후연금의 이자비용 공제를 받는 경우 해당 공제금액은 소득공제 종합한도를 적용받지 않습니다.'
            ]
        },

        tax_base_rate: {
            title: '종합소득 과세표준 & 기본세율 (누진세율 속산표)',
            tag: '세율 및 정산',
            formula: '종합소득 과세표준 = 근로소득금액 − 인적공제 − 연금보험료 − 특별공제 − 그 밖의 공제 + 소득공제 종합한도 초과액',
            desc: (
                <div className="space-y-4">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        근로소득금액에서 각종 소득공제를 차감하고 소득공제 종합한도(2,500만원) 초과액을 환원 가산하여 과세표준을 확정한 뒤, 8단계 기본 누진세율(속산표)을 적용하여 산출세액을 계산합니다.
                    </p>

                    {/* 국세청 공식 과세표준 계산 사례 */}
                    <div className="border border-slate-200 dark:border-slate-750 rounded-xl overflow-hidden">
                        <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 font-bold text-slate-800 dark:text-slate-200">
                            💡 국세청 종합소득 과세표준 공식 계산 사례
                        </div>
                        <table className="w-full text-left border-collapse text-[11px]">
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                                <tr>
                                    <td className="py-1.5 px-3 font-bold border-r">근로소득금액</td>
                                    <td className="py-1.5 px-3 text-right font-bold text-slate-900 dark:text-white">54,660,000 원</td>
                                    <td className="py-1.5 px-3 text-slate-400">총급여액 − 근로소득공제</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 text-slate-600 dark:text-slate-400 border-r">(-) 인적공제</td>
                                    <td className="py-1.5 px-3 text-right text-rose-600 dark:text-rose-400">-6,000,000 원</td>
                                    <td className="py-1.5 px-3 text-slate-400">기본공제 및 추가공제</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 text-slate-600 dark:text-slate-400 border-r">(-) 연금보험료공제</td>
                                    <td className="py-1.5 px-3 text-right text-rose-600 dark:text-rose-400">-2,500,000 원</td>
                                    <td className="py-1.5 px-3 text-slate-400">국민연금 등 공적연금</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 text-slate-600 dark:text-slate-400 border-r">(-) 특별소득공제</td>
                                    <td className="py-1.5 px-3 text-right text-rose-600 dark:text-rose-400">-4,500,000 원</td>
                                    <td className="py-1.5 px-3 text-slate-400">건강/고용보험, 주택자금 등</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 text-slate-600 dark:text-slate-400 border-r">(-) 그 밖의 소득공제</td>
                                    <td className="py-1.5 px-3 text-right text-rose-600 dark:text-rose-400">-23,000,000 원</td>
                                    <td className="py-1.5 px-3 text-slate-400">신용카드, 노란우산 등</td>
                                </tr>
                                <tr className="bg-amber-50/60 dark:bg-amber-950/30 font-bold">
                                    <td className="py-1.5 px-3 text-amber-700 dark:text-amber-300 border-r">(+) 소득공제 종합한도 초과액</td>
                                    <td className="py-1.5 px-3 text-right text-amber-700 dark:text-amber-300">+500,000 원</td>
                                    <td className="py-1.5 px-3 text-amber-600 dark:text-amber-400">2,500만원 한도 초과분 가산 배제</td>
                                </tr>
                                <tr className="bg-indigo-50/60 dark:bg-indigo-950/30 font-bold">
                                    <td className="py-2 px-3 text-indigo-700 dark:text-indigo-300 border-r">종합소득 과세표준</td>
                                    <td className="py-2 px-3 text-right text-indigo-700 dark:text-indigo-300 text-xs">19,160,000 원</td>
                                    <td className="py-2 px-3 text-indigo-600 dark:text-indigo-400">기본세율 적용 기준 금액</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* 소득세 기본세율 및 속산표 */}
                    <div>
                        <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                            2026 기본 소득세율 및 산출세액 속산표 (소득세법 제55조)
                        </h5>
                        <div className="border border-slate-200 dark:border-slate-750 rounded-xl overflow-hidden">
                            <table className="w-full text-left border-collapse text-[11px]">
                                <thead className="bg-slate-100 dark:bg-slate-800 font-bold">
                                    <tr>
                                        <th className="py-1.5 px-3 border-r border-slate-200 dark:border-slate-750">과세표준 구간</th>
                                        <th className="py-1.5 px-3 border-r border-slate-200 dark:border-slate-750">법정 기본세율</th>
                                        <th className="py-1.5 px-3 font-mono">산출세액 속산표 산식</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                                    <tr>
                                        <td className="py-1.5 px-3 border-r">1,400만원 이하</td>
                                        <td className="py-1.5 px-3 border-r text-center font-bold">과세표준의 6%</td>
                                        <td className="py-1.5 px-3 text-indigo-600 font-bold">과세표준 × 6%</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1.5 px-3 border-r">1,400만 초과 ~ 5,000만원 이하</td>
                                        <td className="py-1.5 px-3 border-r">84만원 + (과표 − 1,400만) × 15%</td>
                                        <td className="py-1.5 px-3 text-indigo-600 font-bold">(과세표준 × 15%) − 126만원</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1.5 px-3 border-r">5,000만 초과 ~ 8,800만원 이하</td>
                                        <td className="py-1.5 px-3 border-r">624만원 + (과표 − 5,000만) × 24%</td>
                                        <td className="py-1.5 px-3 text-indigo-600 font-bold">(과세표준 × 24%) − 576만원</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1.5 px-3 border-r">8,800만 초과 ~ 1억5천만원 이하</td>
                                        <td className="py-1.5 px-3 border-r">1,536만원 + (과표 − 8,800만) × 35%</td>
                                        <td className="py-1.5 px-3 text-indigo-600 font-bold">(과세표준 × 35%) − 1,544만원</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1.5 px-3 border-r">1억5천만 초과 ~ 3억원 이하</td>
                                        <td className="py-1.5 px-3 border-r">3,706만원 + (과표 − 1억5천만) × 38%</td>
                                        <td className="py-1.5 px-3 text-indigo-600 font-bold">(과세표준 × 38%) − 1,994만원</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1.5 px-3 border-r">3억 초과 ~ 5억원 이하</td>
                                        <td className="py-1.5 px-3 border-r">9,406만원 + (과표 − 3억) × 40%</td>
                                        <td className="py-1.5 px-3 text-indigo-600 font-bold">(과세표준 × 40%) − 2,594만원</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1.5 px-3 border-r">5억 초과 ~ 10억원 이하</td>
                                        <td className="py-1.5 px-3 border-r">1억 7,406만원 + (과표 − 5억) × 42%</td>
                                        <td className="py-1.5 px-3 text-indigo-600 font-bold">(과세표준 × 42%) − 3,594만원</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1.5 px-3 border-r">10억원 초과</td>
                                        <td className="py-1.5 px-3 border-r">3억 8,406만원 + (과표 − 10억) × 45%</td>
                                        <td className="py-1.5 px-3 text-indigo-600 font-bold">(과세표준 × 45%) − 6,594만원</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">※ 일용근로자 소득세율: 일용근로소득금액 × 6%</p>
                    </div>

                    {/* 산출세액 간편 계산 예시 */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
                        <span className="font-bold text-slate-900 dark:text-white">🧮 산출세액 계산사례 (간편 속산법):</span>
                        <p className="text-slate-600 dark:text-slate-300">
                            종합소득 과세표준이 <strong>1,916만원</strong>인 경우 산출세액은?<br />
                            👉 <strong>1,614,000원</strong> = (1,916만원 × 15%) − 126만원
                        </p>
                    </div>
                </div>
            ),
            tax_saving: [
                'Tip 01: 맞벌이 부부의 경우 부양가족 공제 등을 과세표준이 많은 쪽(한계세율이 높은 쪽)이 몰아서 받는 것이 일반적으로 절세에 훨씬 유리합니다.',
                'Tip 02: 맞벌이 부부의 과세표준이 비슷하거나 한계세율 경계에 있는 경우, 각종 공제를 적절히 배분하여 양쪽 모두 낮은 세율 구간을 적용받을 수 있는지 검토하세요.',
                'Tip 03: 신용카드(총급여 25% 초과)와 의료비(총급여 3% 초과)처럼 최저사용 문턱이 있는 공제는 급여가 적은 배우자가 지출하고 공제받으면 공제대상 금액이 커져 절세에 유리합니다.',
                'Tip 04: 소득이 있는 배우자를 위해 지출한 의료비는 실제로 지출한 근로자가 세액공제를 받을 수 있습니다.'
            ],
            caution: [
                'Tip 01: 외국인 근로자가 19% 단일세율 과세특례를 선택하여 분리과세를 적용받는 경우, 소득세와 관련된 일체의 비과세·공제·감면 및 세액공제 규정을 적용받을 수 없습니다.',
                'Tip 02: 법원 판결에 의해 근로소득을 추가 지급하는 경우, 판결일의 다음 달 말일까지 소득세를 원천징수·납부하면 가산세를 적용하지 않습니다.'
            ]
        },
        // =========================================================================
        // 4. 세액감면 (조특법)
        // =========================================================================
        sme_reduction: {
            title: '중소기업 취업자에 대한 소득세 감면 (조특법 제30조)',
            tag: '세액감면',
            formula: '청년: 산출세액 × 90% (연 200만원 한도, 5년) / 일반: 산출세액 × 70% (연 200만원 한도, 3년)',
            desc: (
                <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        중소기업의 인력난 해소와 청년, 고령자, 장애인, 경력단절 근로자의 경제활동 촉진을 위해 일정 기간 동안 소득세를 70~90% 직접 감면해 주는 제도입니다.
                    </p>
                    <div className="border border-slate-200 dark:border-slate-750 rounded-xl overflow-hidden text-[11px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-100 dark:bg-slate-800 font-bold">
                                <tr>
                                    <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-750">구분</th>
                                    <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-750">감면율 및 감면 기간</th>
                                    <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-750">연간 감면한도</th>
                                    <th className="py-2 px-3">대상 요건</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                <tr>
                                    <td className="py-2 px-3 font-bold border-r text-indigo-600 dark:text-indigo-400">청년 근로자</td>
                                    <td className="py-2 px-3 font-bold border-r">90% 감면 (취업일부터 5년)</td>
                                    <td className="py-2 px-3 font-mono font-bold border-r">200만원</td>
                                    <td className="py-2 px-3">근로계약 체결일 현재 만 15세 이상 34세 이하 (군복무 최대 6년 차감시 만 40세)</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-3 font-bold border-r">60세 이상 근로자</td>
                                    <td className="py-2 px-3 border-r">70% 감면 (취업일부터 3년)</td>
                                    <td className="py-2 px-3 font-mono font-bold border-r">200만원</td>
                                    <td className="py-2 px-3">취업일 현재 만 60세 이상인 사람</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-3 font-bold border-r">장애인 근로자</td>
                                    <td className="py-2 px-3 border-r">70% 감면 (취업일부터 3년)</td>
                                    <td className="py-2 px-3 font-mono font-bold border-r">200만원</td>
                                    <td className="py-2 px-3">장애인복지법상 등록 장애인 및 국가유공자 상이자</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-3 font-bold border-r">경력단절 근로자</td>
                                    <td className="py-2 px-3 border-r">70% 감면 (취업일부터 3년)</td>
                                    <td className="py-2 px-3 font-mono font-bold border-r">200만원</td>
                                    <td className="py-2 px-3">해당 중소기업 등에서 1년 이상 근무 후 퇴직, 2~15년 이내 동종업종 재취업 (남성 포함)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            ),
            tax_saving: [
                'Tip 01: 병역의무를 이행한 경우 병역 복무기간(최대 6년)을 현재 연령에서 차감하여 계산합니다. 예를 들어 2년 복무한 군필자는 만 36세까지 청년 감면(90%) 적용이 가능합니다.',
                'Tip 02: 다른 중소기업으로 이직하는 경우에도 최초 취업일로부터 5년(일반 3년)의 잔여 기간 동안 계속 감면을 받을 수 있으므로 전 직장의 감면신청서를 현 직장에 제출하세요.',
                'Tip 03: 감면 요건을 충족했으나 연말정산 시 신청하지 못했더라도 5년 이내에 관할 세무서에 경정청구를 접수하면 이미 납부한 소득세를 전액 소급 환급받을 수 있습니다.'
            ],
            caution: [
                'Tip 01: 법인의 임원, 최대주주·최대출자자 및 그 배우자와 직계존비속, 친족 등은 세법상 감면 대상에서 제외됩니다.',
                'Tip 02: 전문서비스업(변호사, 회계사, 세무사, 병의원), 금융·보험업, 주점업, 사행성 업종 등은 중소기업이라도 감면 제외 업종입니다.',
                'Tip 03: 중소기업 감면을 받으면 소득세법 제59조 근로소득세액공제액은 [근로세액공제 × (1 - 감면세액 ÷ 산출세액)] 공식에 의해 비례 차감 조정됩니다.'
            ]
        },

        shared_growth_reduction: {
            title: '경영성과급 & 핵심인력 성과보상기금(내일채움공제) 감면',
            tag: '세액감면',
            formula: '성과공유 경영성과급: 소득세 50% 감면 / 내일채움공제: 30~90% 감면',
            desc: (
                <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        중소벤처기업부 인증 성과공유기업의 근로자와 내일채움공제 가입 근로자의 장기재직 및 소득증대를 위한 세제지원 감면입니다.
                    </p>
                    <div className="border border-slate-200 dark:border-slate-750 rounded-xl overflow-hidden text-[11px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-100 dark:bg-slate-800 font-bold">
                                <tr>
                                    <th className="py-2 px-3 border-r">감면 항목</th>
                                    <th className="py-2 px-3 border-r">감면율</th>
                                    <th className="py-2 px-3">적용 요건 및 비고</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                <tr>
                                    <td className="py-2 px-3 font-bold border-r">성과공유기업 경영성과급</td>
                                    <td className="py-2 px-3 font-bold border-r text-indigo-600">소득세 50% 감면</td>
                                    <td className="py-2 px-3">성과공유 중소기업 종사자 (단, 임원 및 총급여 7천만원 초과자 제외)</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-3 font-bold border-r">청년연계형 내일채움공제</td>
                                    <td className="py-2 px-3 font-bold border-r text-emerald-600">중소 90% / 중견 50%</td>
                                    <td className="py-2 px-3">핵심인력 성과보상기금 수령액 소득세 감면</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-3 font-bold border-r">일반 내일채움공제</td>
                                    <td className="py-2 px-3 font-bold border-r">중소 50% / 중견 30%</td>
                                    <td className="py-2 px-3">만기 공제금 수령 시 발생하는 근로소득세 감면</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            ),
            tax_saving: [
                '중소기업 취업자 소득세 감면(조특법 제30조)과 경영성과급 세액감면(조특법 제19조)은 대상 요건이 충족되면 상호 연계하여 절세 혜택을 극대화할 수 있습니다.'
            ],
            caution: [
                '당해 과세기간의 총급여액이 7,000만원을 초과하는 근로자는 경영성과급 세액감면 대상에서 제외됩니다.'
            ]
        },

        foreigner_tech_reduction: {
            title: '외국인 기술자 및 우수 인력 국내복귀 소득세 감면',
            tag: '세액감면',
            formula: '10년간 산출세액의 50% 감면 (소재·부품·장비 기술자는 3년간 70% + 2년간 50%)',
            desc: (
                <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        국내 산업경쟁력 강화 및 첨단기술 유치를 위해 일정 요건을 갖춘 외국인 기술자 및 해외 우수 연구인력의 국내 복귀 시 소득세를 감면합니다.
                    </p>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-750 text-[11px] space-y-1">
                        <div>• <strong>외국인 기술자:</strong> 국내 최초 근로제공일로부터 10년간 소득세 50% 감면 (소부장 분야는 최초 3년간 70%, 이후 2년간 50%)</div>
                        <div>• <strong>내국인 우수인력 복귀:</strong> 해외 연구기관 등에서 5년 이상 근무한 이공계 박사 등이 국내 연구소 취업 시 10년간 50% 감면</div>
                        <div>• <strong>조세조약 교직자:</strong> 체약국 인가 교육기관 강의·연구 목적 입국 시 2년간 면세</div>
                    </div>
                </div>
            ),
            tax_saving: [
                '외국인 근로자는 종합소득세 감면 방식과 19% 단일세율 분리과세 방식 중 연간 소득 수준에 따라 세부담이 더 적은 쪽을 비교 선택할 수 있습니다.'
            ],
            caution: [
                '19% 단일세율을 선택한 경우에는 소득세 감면 및 기타 일체의 세액공제 규정을 중복 적용받을 수 없습니다.'
            ]
        },

        // =========================================================================
        // 5. 세액공제 (소득세법 & 조특법)
        // =========================================================================
        earned_tax_credit: {
            title: '근로소득 세액공제 (소득세법 제59조)',
            tag: '세액공제',
            formula: '산출세액 130만원 이하: 55% / 130만원 초과: 71.5만원 + 초과분의 30%',
            desc: (
                <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        근로소득이 있는 거주자의 산출세액에서 법정 누진 기준에 따라 일괄 차감하는 공제로, 총급여액에 따라 4단계 한도가 적용됩니다.
                    </p>
                    <div className="border border-slate-200 dark:border-slate-750 rounded-xl overflow-hidden text-[11px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-100 dark:bg-slate-800 font-bold">
                                <tr>
                                    <th className="py-2 px-3 border-r">총급여액 구간</th>
                                    <th className="py-2 px-3">근로소득세액공제 한도 산식</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                                <tr>
                                    <td className="py-2 px-3 border-r font-bold">3,300만원 이하</td>
                                    <td className="py-2 px-3 text-indigo-600 font-bold">740,000원</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-3 border-r font-bold">3,300만 초과 ~ 7,000만원 이하</td>
                                    <td className="py-2 px-3">740,000원 − [(총급여액 − 3,300만원) × 0.008] (단, 최하 66만원)</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-3 border-r font-bold">7,000만 초과 ~ 1억 2,000만원 이하</td>
                                    <td className="py-2 px-3">660,000원 − [(총급여액 − 7,000만원) × 1/2] (단, 최하 50만원)</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-3 border-r font-bold">1억 2,000만원 초과</td>
                                    <td className="py-2 px-3">500,000원 − [(총급여액 − 1억 2,000만원) × 1/2] (단, 최하 20만원)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-750 text-[11px] space-y-1">
                        <span className="font-bold text-slate-900 dark:text-white">🧮 계산사례:</span>
                        <p className="text-slate-600 dark:text-slate-300">
                            총급여 5,000만원, 산출세액 1,500,000원인 경우:<br />
                            • 기본 공제액 = 715,000 + (1,500,000 − 1,300,000) × 30% = <strong>775,000원</strong><br />
                            • 한도액 = 740,000 − (50,000,000 − 33,000,000) × 0.008 = 604,000원이나 <strong>최저한도 660,000원</strong> 보장<br />
                            👉 따라서 최종 공제액은 <strong>660,000원</strong> 적용!
                        </p>
                    </div>
                </div>
            ),
            tax_saving: [
                '별도의 신청이나 서류 제출 없이 국세청 홈택스 시스템에서 자동으로 계산되어 최저한도까지 100% 반영됩니다.'
            ],
            caution: [
                '중소기업 취업자 감면을 받는 근로자는 감면세액 비율만큼 세액공제 금액이 축소 조정됩니다: 근로세액공제액 × (1 − 감면세액 ÷ 산출세액)'
            ]
        },

        child_tax_credit: {
            title: '자녀세액공제 & 출생·입양 세액공제 (소득세법 제59조의2)',
            tag: '세액공제',
            formula: '1명 25만원, 2명 55만원, 3명 이상 55만원 + (2명 초과 1명당 40만원)',
            desc: (
                <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        자녀 양육 부담을 덜어주기 위한 세액공제로, 2026년 기준 9세 이상 기본공제 대상 자녀 및 당해 연도 출생·입양 자녀에 대해 세액공제를 제공합니다.
                    </p>
                    <div className="border border-slate-200 dark:border-slate-750 rounded-xl overflow-hidden text-[11px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-100 dark:bg-slate-800 font-bold">
                                <tr>
                                    <th className="py-2 px-3 border-r">공제 항목</th>
                                    <th className="py-2 px-3 border-r text-right">공제 금액</th>
                                    <th className="py-2 px-3">대상 요건 및 비고</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                <tr>
                                    <td className="py-1.5 px-3 font-bold border-r">기본공제 자녀 1명</td>
                                    <td className="py-1.5 px-3 text-right font-mono font-bold border-r text-indigo-600">250,000원</td>
                                    <td className="py-1.5 px-3">만 9세 이상 (2017년 이전 출생자, 아동수당 수령자 제외)</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 font-bold border-r">기본공제 자녀 2명</td>
                                    <td className="py-1.5 px-3 text-right font-mono font-bold border-r text-indigo-600">550,000원</td>
                                    <td className="py-1.5 px-3">1명당 25만 + 2명째 30만 = 합산 55만원</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 font-bold border-r">기본공제 자녀 3명 이상</td>
                                    <td className="py-1.5 px-3 text-right font-mono font-bold border-r text-indigo-600">55만 + 초과 1인당 40만</td>
                                    <td className="py-1.5 px-3">3명 95만원, 4명 135만원 등 다자녀 지원 대폭 확대</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 font-bold border-r bg-slate-50 dark:bg-slate-800/50">출생·입양 첫째</td>
                                    <td className="py-1.5 px-3 text-right font-mono font-bold border-r text-emerald-600">300,000원</td>
                                    <td className="py-1.5 px-3">해당 과세기간 중 출생·입양 신고한 첫째 자녀</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 font-bold border-r bg-slate-50 dark:bg-slate-800/50">출생·입양 둘째</td>
                                    <td className="py-1.5 px-3 text-right font-mono font-bold border-r text-emerald-600">500,000원</td>
                                    <td className="py-1.5 px-3">해당 과세기간 중 출생·입양 신고한 둘째 자녀</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 font-bold border-r bg-slate-50 dark:bg-slate-800/50">출생·입양 셋째 이상</td>
                                    <td className="py-1.5 px-3 text-right font-mono font-bold border-r text-emerald-600">700,000원</td>
                                    <td className="py-1.5 px-3">해당 과세기간 중 출생·입양 신고한 셋째 이상 자녀 (1인당)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            ),
            tax_saving: [
                'Tip 01: 당해 연도에 자녀가 태어난 경우 기존 자녀 수에 따라 첫째(30만), 둘째(50만), 셋째 이상(70만) 출생공제가 즉시 추가됩니다.',
                'Tip 02: 맞벌이 부부의 경우 자녀의 기본공제(150만원)를 받는 부모가 자녀세액공제도 함께 받아야 합니다.'
            ],
            caution: [
                'Tip 01: 손자·손녀는 기본공제 대상 부양가족에는 포함될 수 있으나 자녀세액공제 대상에는 해당되지 않습니다 (자녀만 가능).',
                'Tip 02: 만 8세 이하 자녀는 아동수당 수령으로 인해 기본 자녀세액공제 대상에서 제외됩니다.'
            ]
        },

        marriage_tax_credit: {
            title: '혼인세액공제 (조세특례제한법 제92조 신설)',
            tag: '세액공제',
            formula: '혼인신고 시 산출세액에서 50만원 공제 (부부 합산 최대 100만원, 생애 1회)',
            desc: (
                <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        신혼부부의 결혼 초기 경제적 부담을 완화하기 위해 2024년부터 2026년까지 혼인신고를 한 거주자에게 50만원의 세액공제를 제공합니다.
                    </p>
                    <div className="p-3.5 rounded-xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800 text-[11px] space-y-1.5">
                        <div className="font-bold text-pink-900 dark:text-pink-200">💍 혼인세액공제 핵심 적용 요건:</div>
                        <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                            <li><strong>적용 대상 기간:</strong> 2024년 1월 1일 ~ 2026년 12월 31일 사이에 혼인신고를 한 거주자</li>
                            <li><strong>부부 쌍방 공제:</strong> 맞벌이 부부 모두 근로자인 경우 각각 50만원씩 총 100만원 공제 가능</li>
                            <li><strong>재혼 포함:</strong> 해당 기간 중 혼인신고한 경우 초혼 및 재혼 여부를 불문하고 생애 1회 적용</li>
                        </ul>
                    </div>
                </div>
            ),
            tax_saving: [
                '2024년이나 2025년에 혼인신고를 하였으나 공제를 누락한 경우, 경정청구를 통해 50만원(부부 100만원)을 소급하여 돌려받을 수 있습니다.'
            ],
            caution: [
                '생애 1회에 한하여 적용되므로 과거에 이미 혼인세액공제를 적용받은 사실이 있는 경우에는 재차 적용받을 수 없습니다.'
            ]
        },

        pension_account_credit: {
            title: '연금계좌 세액공제 (소득세법 제59조의3)',
            tag: '세액공제',
            formula: '연금저축 600만, IRP 합산 900만원 한도 / 12% (총급여 5,500만 이하 15%)',
            desc: (
                <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        노후 자산 형성을 지원하는 대표 세액공제 상품으로, 연금저축과 IRP(퇴직연금)를 합산하여 연 최대 900만원까지 납입액의 12~15%를 공제합니다.
                    </p>
                    <div className="border border-slate-200 dark:border-slate-750 rounded-xl overflow-hidden text-[11px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-100 dark:bg-slate-800 font-bold">
                                <tr>
                                    <th className="py-2 px-3 border-r">소득 구간</th>
                                    <th className="py-2 px-3 border-r text-center">공제율 (지방세 포함)</th>
                                    <th className="py-2 px-3 text-right">최대 공제 환급액</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                <tr>
                                    <td className="py-2 px-3 font-bold border-r">총급여 5,500만원 이하</td>
                                    <td className="py-2 px-3 text-center font-bold text-emerald-600 border-r">15% (16.5%)</td>
                                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600">1,485,000원</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-3 font-bold border-r">총급여 5,500만원 초과</td>
                                    <td className="py-2 px-3 text-center font-bold text-indigo-600 border-r">12% (13.2%)</td>
                                    <td className="py-2 px-3 text-right font-mono font-bold text-indigo-600">1,188,000원</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            ),
            tax_saving: [
                'ISA 만기 계좌 잔액을 연금계좌로 전환 납입하면 전환금액의 10%(최대 300만원)까지 연금계좌 납입 한도가 추가로 확대되어 최대 1,200만원까지 공제받을 수 있습니다.'
            ],
            caution: [
                '세액공제 혜택을 받은 납입액을 연금 외 형태로 중도 인출하거나 해지하는 경우 16.5%(지방소득세 포함)의 기타소득세가 추징됩니다.'
            ]
        },

        special_insurance_credit: {
            title: '보장성 보험료 세액공제 (소득세법 제59조의4 제1항)',
            tag: '세액공제',
            formula: '일반 보장성보험 100만원 한도 12% / 장애인전용 100만원 한도 15%',
            desc: (
                <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        기본공제대상자를 피보험자로 지출한 보장성보험료에 대해 연간 100만원 한도로 12%(장애인전용은 별도 100만원 한도 15%)를 공제합니다.
                    </p>
                </div>
            ),
            tax_saving: [
                '가족을 위해 가입한 실손보험, 암보험, 자동차보험, 종신보험 등의 보험료를 합산하여 100만원을 채우면 최대 12만원(장애인전용 포함 시 최대 27만원)의 세금을 아낄 수 있습니다.'
            ],
            caution: [
                '만기 시 환급금이 납입보험료를 초과하는 저축성 보험이나 연금보험은 보장성보험료 공제 대상이 아닙니다.'
            ]
        },

        special_medical_credit: {
            title: '의료비 세액공제 (소득세법 제59조의4 제2항)',
            tag: '세액공제',
            formula: '총급여액 3% 초과 지출분 공제 (난임 30%, 미숙아 20%, 본인등 15% 무제한, 그외 700만 한도)',
            desc: (
                <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        근로자가 기본공제대상자를 위해 지출한 의료비 중 총급여액의 3%를 초과하는 금액에 대해 공제율을 적용하여 차감합니다.
                    </p>
                    <div className="border border-slate-200 dark:border-slate-750 rounded-xl overflow-hidden text-[11px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-100 dark:bg-slate-800 font-bold">
                                <tr>
                                    <th className="py-2 px-3 border-r">대상자 구분</th>
                                    <th className="py-2 px-3 border-r text-center">공제율</th>
                                    <th className="py-2 px-3">한도 및 비고</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                <tr>
                                    <td className="py-1.5 px-3 font-bold border-r">난임시술비</td>
                                    <td className="py-1.5 px-3 text-center font-bold text-rose-600 border-r">30%</td>
                                    <td className="py-1.5 px-3">한도 없음 (전액 공제)</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 font-bold border-r">미숙아·선천성이상아 의료비</td>
                                    <td className="py-1.5 px-3 text-center font-bold text-amber-600 border-r">20%</td>
                                    <td className="py-1.5 px-3">한도 없음 (전액 공제)</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 font-bold border-r">본인, 65세 이상자, 장애인, 산정특례자</td>
                                    <td className="py-1.5 px-3 text-center font-bold text-indigo-600 border-r">15%</td>
                                    <td className="py-1.5 px-3">한도 없음 (전액 공제)</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 font-bold border-r">그 밖의 기본공제대상 부양가족</td>
                                    <td className="py-1.5 px-3 text-center font-bold border-r">15%</td>
                                    <td className="py-1.5 px-3 font-mono">연간 700만원 한도</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            ),
            tax_saving: [
                'Tip 01: 의료비는 나이 요건과 소득 요건의 제한이 없으므로, 소득이 있는 배우자나 부모님을 위해 지출한 의료비도 결제한 근로자가 공제받을 수 있습니다.',
                'Tip 02: 맞벌이 부부의 경우 총급여가 적은 배우자의 카드로 의료비를 지출하면 3% 문턱을 쉽게 넘어 공제액이 커집니다.',
                'Tip 03: 산후조리원 비용(출산 1회당 200만원) 및 시력보정용 안경·콘택트렌즈 구입비(1인당 연 50만원)도 의료비 세액공제 대상입니다.'
            ],
            caution: [
                'Tip 01: 보험회사 등으로부터 수령한 실손의료보험금은 반드시 공제대상 의료비에서 차감하여 신고해야 합니다.',
                'Tip 02: 미용·성형수술 비용 및 건강증진을 위한 영양제·한약 구입비용은 공제 대상에서 제외됩니다.'
            ]
        },

        special_education_credit: {
            title: '교육비 세액공제 (소득세법 제59조의4 제3항)',
            tag: '세액공제',
            formula: '본인 전액 15% / 취학전·초중고 300만 15% / 대학생 900만 15%',
            desc: (
                <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        근로자 본인 및 부양가족의 교육비 지출액의 15%를 세액공제합니다.
                    </p>
                    <div className="border border-slate-200 dark:border-slate-750 rounded-xl overflow-hidden text-[11px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-100 dark:bg-slate-800 font-bold">
                                <tr>
                                    <th className="py-2 px-3 border-r">대상자 구분</th>
                                    <th className="py-2 px-3 border-r text-right">공제 한도</th>
                                    <th className="py-2 px-3">포함 항목</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                <tr>
                                    <td className="py-1.5 px-3 font-bold border-r">근로자 본인</td>
                                    <td className="py-1.5 px-3 text-right font-bold border-r text-indigo-600">전액 (한도 없음)</td>
                                    <td className="py-1.5 px-3">대학원, 대학교, 직업능력개발훈련비</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 font-bold border-r">취학 전 아동</td>
                                    <td className="py-1.5 px-3 text-right font-mono border-r">1인당 연 300만원</td>
                                    <td className="py-1.5 px-3">유치원, 어린이집, 사설 학원비, 체육시설</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 font-bold border-r">초·중·고등학생</td>
                                    <td className="py-1.5 px-3 text-right font-mono border-r">1인당 연 300만원</td>
                                    <td className="py-1.5 px-3">수업료, 급식비, 교과서, 교복(50만), 체험학습(30만)</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 font-bold border-r">대학생 자녀·형제</td>
                                    <td className="py-1.5 px-3 text-right font-mono border-r">1인당 연 900만원</td>
                                    <td className="py-1.5 px-3">대학교 등록금 납입액</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 font-bold border-r">장애인 특수교육비</td>
                                    <td className="py-1.5 px-3 text-right font-bold border-r text-emerald-600">전액 (한도 없음)</td>
                                    <td className="py-1.5 px-3">직계존속 포함 재활 및 특수교육비</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            ),
            tax_saving: [
                '취학 전 아동에 한해서는 태권도장, 피아노학원 등 사설 학원비도 전액 교육비 공제 대상에 포함됩니다.',
                '중·고등학생의 교복 구입비(연 50만원)와 현장체험학습비(연 30만원)는 영수증을 챙겨 별도로 제출하면 추가 공제됩니다.'
            ],
            caution: [
                '직계존속(부모님, 조부모님)을 위해 지출한 교육비는 세법상 공제 대상이 아닙니다 (장애인 특수교육비 제외).',
                '초·중·고등학생이나 대학생의 일반 사설 학원비나 어학연수비는 교육비 공제 대상이 아닙니다.'
            ]
        },

        special_donation_credit: {
            title: '기부금 세액공제 (소득세법 제59조의4 제4항)',
            tag: '세액공제',
            formula: '정치·고향사랑 100/110 전액 환급 + 15~40% / 특례·종교외·종교 15~30%',
            desc: (
                <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        사회적 기부 활성화를 위해 정치자금, 고향사랑, 특례, 종교단체 외 및 종교단체 기부금에 대해 세액공제를 제공합니다.
                    </p>
                    <div className="border border-slate-200 dark:border-slate-750 rounded-xl overflow-hidden text-[11px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-100 dark:bg-slate-800 font-bold">
                                <tr>
                                    <th className="py-2 px-3 border-r">기부금 유형</th>
                                    <th className="py-2 px-3 border-r">공제 비율</th>
                                    <th className="py-2 px-3">공제 한도</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                <tr>
                                    <td className="py-1.5 px-3 font-bold border-r">정치자금 기부금</td>
                                    <td className="py-1.5 px-3 border-r">10만 이하 100/110, 초과 15~25%</td>
                                    <td className="py-1.5 px-3">근로소득금액의 100%</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 font-bold border-r">고향사랑 기부금</td>
                                    <td className="py-1.5 px-3 border-r">10만 이하 100/110, 10~20만 40%, 초과 15~30%</td>
                                    <td className="py-1.5 px-3 font-mono">연간 2,000만원 한도</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 font-bold border-r">특례 기부금(법정)</td>
                                    <td className="py-1.5 px-3 border-r">1천만 이하 15%, 초과 30%</td>
                                    <td className="py-1.5 px-3">정치·고향사랑 차감 잔여소득의 100%</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 font-bold border-r">일반기부금(종교단체 외)</td>
                                    <td className="py-1.5 px-3 border-r">1천만 이하 15%, 초과 30%</td>
                                    <td className="py-1.5 px-3">잔여소득의 30%</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 px-3 font-bold border-r">일반기부금(종교단체)</td>
                                    <td className="py-1.5 px-3 border-r">1천만 이하 15%, 초과 30%</td>
                                    <td className="py-1.5 px-3">잔여소득의 10% + Min(잔여의 20%, 종교외)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            ),
            tax_saving: [
                '정치자금 및 고향사랑기부금은 10만원까지 전액 세액공제(지방세 포함 10만원 전액 환급)되므로 실질 지출 없이 지역 특산품 답례품을 받을 수 있습니다.',
                '한도를 초과하여 당해 연도에 공제받지 못한 기부금은 10년간 이월하여 다음 연말정산 시 공제받을 수 있습니다.'
            ],
            caution: [
                '기부금 영수증은 국세청 홈택스 연말정산 간소화 서비스에 등록되어 있는지 반드시 확인하고 누락 시 기부처에서 발급받아 제출해야 합니다.'
            ]
        },

        monthly_rent_credit: {
            title: '월세액 세액공제 (조특법 제95조의2)',
            tag: '세액공제',
            formula: '월세액(연 1,000만원 한도) × 15% (총급여 5,500만 이하는 17%)',
            desc: (
                <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        과세기간 종료일 현재 무주택 세대의 세대주(또는 배우자, 일정요건 세대원, 외국인)가 국민주택규모(85㎡) 또는 기준시가 4억원 이하 주택에 거주하며 지급한 월세액에 대해 공제합니다.
                    </p>
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-750 space-y-2 text-[11px]">
                        <div className="font-bold text-slate-800 dark:text-slate-200">📌 공제 대상 요건 및 공제율</div>
                        <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                            <li><strong>총급여 5,500만원 이하 (종합소득 4,500만 이하):</strong> 지급 월세액의 <strong>17%</strong> 세액공제 (최대 170만원)</li>
                            <li><strong>총급여 5,500만 초과 ~ 8,000만원 이하 (종합소득 7,000만 이하):</strong> 지급 월세액의 <strong>15%</strong> 세액공제 (최대 150만원)</li>
                            <li><strong>배우자 분리 주거:</strong> 무주택 세대주의 배우자가 다른 시군구에 주소지를 두고 월세를 지출하는 경우에도 부부 합산 연 1,000만원까지 공제 가능</li>
                            <li><strong>대상 주택:</strong> 국민주택규모(85㎡ 이하) 또는 기준시가 4억원 이하 (주거용 오피스텔, 고시원 등 다중생활시설 포함)</li>
                            <li><strong>다자녀 완화 특례:</strong> 기본공제대상 자녀가 3명 이상인 경우 주택면적 기준 완화 ⇒ <strong>주택면적 100㎡ 이하</strong> 또는 기준시가 4억원 이하</li>
                        </ul>
                    </div>
                </div>
            ),
            tax_saving: [
                'Tip 01: 임대인의 동의가 전혀 필요 없으며, 확정일자를 받지 않아도 임대차계약서 사본과 계좌이체 영수증(무통장 입금증)만 제출하면 공제 가능합니다.',
                'Tip 02: 세대주가 주택자금 관련 공제를 받지 않은 경우 세대원인 근로자도 본인 명의 계약 및 지출 시 공제받을 수 있습니다.',
                'Tip 03: 현금영수증을 발급받은 월세액은 신용카드 소득공제(30%)와 월세액 세액공제(15~17%) 중 중복 적용이 불가하므로, 공제율과 절세효과가 훨씬 큰 월세액 세액공제를 적용받는 것이 유리합니다.'
            ],
            caution: [
                'Tip 01: 임대차계약서 상의 주소지와 주민등록표 등본 상의 주소지가 반드시 일치(전입신고)해야 하며, 전입신고일 이후 지출한 월세액에 한해서만 공제됩니다.',
                'Tip 02: 과세기간 중 주택을 취득한 경우, 해당 주택을 보유하고 있던 기간 동안 지출한 월세액은 공제대상에서 제외됩니다.',
                'Tip 03: 임대차계약기간이 과세기간에 걸쳐 있는 경우 해당 과세기간에 속하는 일수만큼 안분하여 계산합니다.'
            ]
        },

        other_tax_credits: {
            title: '그 밖의 세액공제 (납세조합 / 주택차입금 / 외국납부)',
            tag: '세액공제',
            formula: '납세조합 3%(연 100만 한도) / 미분양주택 30% / 외국납부(10년 이월)',
            desc: (
                <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        소득세법 및 조세특례제한법에 따른 특수 목적의 세액공제 항목입니다.
                    </p>
                    <div className="border border-slate-200 dark:border-slate-750 rounded-xl overflow-hidden text-[11px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-100 dark:bg-slate-800 font-bold">
                                <tr>
                                    <th className="py-2 px-3 border-r">항목</th>
                                    <th className="py-2 px-3 border-r">공제 요건 및 내용</th>
                                    <th className="py-2 px-3">공제율 및 한도</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                <tr>
                                    <td className="py-2 px-3 font-bold border-r">납세조합공제<br/><span className="text-[10px] text-slate-400">(소득세법 제150조)</span></td>
                                    <td className="py-2 px-3 border-r">납세조합에 가입한 근로자가 매월 원천징수 납부하는 경우</td>
                                    <td className="py-2 px-3 font-bold text-indigo-600">산출세액의 3% (연 100만원 한도)</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-3 font-bold border-r">주택자금차입금 이자<br/><span className="text-[10px] text-slate-400">(조특법 제99조)</span></td>
                                    <td className="py-2 px-3 border-r">1995.11.1 ~ 1997.12.31 취득한 미분양주택 대출금 이자상환액</td>
                                    <td className="py-2 px-3 font-bold text-indigo-600">이자상환액의 30%<br/><span className="text-[10px] text-rose-500 font-normal">※ 공제세액의 20% 농어촌특별세 납부</span></td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-3 font-bold border-r">외국납부세액공제<br/><span className="text-[10px] text-slate-400">(소득세법 제57조)</span></td>
                                    <td className="py-2 px-3 border-r">국외원천소득이 종합소득에 합산되어 외국 정부에 납부한 소득세가 있는 경우</td>
                                    <td className="py-2 px-3 font-bold text-indigo-600">산출세액 한도 내 전액<br/><span className="text-[10px] text-emerald-600 font-normal">※ 한도 초과액 10년간 이월공제</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            ),
            tax_saving: [
                '외국 정부에 납부한 세금이 공제한도를 초과하는 경우 해당 초과금액은 10개 과세기간 동안 이월하여 다음 연말정산 시 순차적으로 공제받을 수 있습니다.'
            ],
            caution: [
                '미분양주택 취득 대출이자 세액공제를 받는 경우 공제받은 세액의 20%를 농어촌특별세로 별도 납부해야 하므로 실질 공제 효과는 24%입니다.'
            ]
        },

        standard_tax_credit: {
            title: '표준세액공제 (소득세법 제59조의4 제9항)',
            tag: '세액공제',
            formula: '특별소득·특별세액·월세액 미신청 시 연 13만원 일괄 공제',
            desc: (
                <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        근로자가 특별소득공제(주택자금), 특별세액공제(보험료, 의료비, 교육비, 기부금), 월세액 세액공제를 신청하지 않는 경우, 복잡한 증빙 제출 없이 연 13만원을 일괄적으로 산출세액에서 차감합니다.
                    </p>
                </div>
            ),
            tax_saving: [
                '특별공제 및 세액공제(보험료/의료비/교육비/기부금/월세) 혜택의 총합이 13만원 미만인 1인 가구나 지출이 적은 근로자는 영수증을 제출하지 않고 표준세액공제(13만원)를 선택하는 것이 더 많은 환급을 받는 현명한 절세법입니다.'
            ],
            caution: [
                '표준세액공제를 선택하면 특별소득공제(주택자금), 특별세액공제, 월세액공제는 적용받을 수 없습니다 (단, 연금계좌 세액공제 및 신용카드 소득공제는 중복 적용 가능).'
            ]
        },

        refund_settle: {
            title: '결정세액 산출 공식 & 국세청 계산 사례',
            tag: '세율 및 정산',
            formula: '결정세액 = 산출세액 − 세액감면 − 세액공제',
            desc: (
                <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        종합소득 과세표준에 기본세율을 적용하여 계산된 <strong>산출세액</strong>에서 법정 <strong>세액감면</strong>과 <strong>세액공제</strong>를 차감하여 근로자가 1년간 최종 부담해야 할 순수 소득세를 확정합니다.
                    </p>
                    <div className="border border-slate-200 dark:border-slate-750 rounded-xl overflow-hidden text-[11px]">
                        <div className="bg-indigo-50 dark:bg-indigo-950/60 px-3 py-2 font-bold text-indigo-900 dark:text-indigo-200 border-b border-indigo-100 dark:border-indigo-900 flex justify-between items-center">
                            <span>국세청 공식 연말정산 산출 사례 (총급여 3,600만원 1인가구 예시)</span>
                            <span className="text-[10px] text-indigo-500 font-mono">단위: 원</span>
                        </div>
                        <table className="w-full text-left border-collapse">
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-mono">
                                <tr>
                                    <td className="py-2 px-3 bg-slate-50 dark:bg-slate-800/50 font-bold w-1/3 border-r">총급여액</td>
                                    <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">36,000,000</td>
                                    <td className="py-2 px-3 text-slate-400 text-[10px]">연간 과세대상 총급여</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-3 bg-slate-50 dark:bg-slate-800/50 font-bold border-r">근로소득공제</td>
                                    <td className="py-2 px-3 text-rose-600 dark:text-rose-400">-10,650,000</td>
                                    <td className="py-2 px-3 text-slate-400 text-[10px]">750만 + (3,600만 - 1,500만) × 15%</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-3 bg-slate-50 dark:bg-slate-800/50 font-bold border-r">근로소득금액</td>
                                    <td className="py-2 px-3 font-bold text-indigo-600 dark:text-indigo-400">25,350,000</td>
                                    <td className="py-2 px-3 text-slate-400 text-[10px]">총급여 - 근로소득공제</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-3 bg-slate-50 dark:bg-slate-800/50 font-bold border-r">소득공제 합계</td>
                                    <td className="py-2 px-3 text-rose-600 dark:text-rose-400">-15,350,000</td>
                                    <td className="py-2 px-3 text-slate-400 text-[10px]">인적 + 4대보험 + 신용카드 등</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-3 bg-slate-50 dark:bg-slate-800/50 font-bold border-r">과세표준</td>
                                    <td className="py-2 px-3 font-bold text-indigo-600 dark:text-indigo-400">10,000,000</td>
                                    <td className="py-2 px-3 text-slate-400 text-[10px]">근로소득금액 - 소득공제 합계</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-3 bg-slate-50 dark:bg-slate-800/50 font-bold border-r">산출세액 (세율 6%)</td>
                                    <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">600,000</td>
                                    <td className="py-2 px-3 text-slate-400 text-[10px]">1,400만원 이하 6% 적용</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-3 bg-slate-50 dark:bg-slate-800/50 font-bold border-r">세액공제·감면</td>
                                    <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400">-450,000</td>
                                    <td className="py-2 px-3 text-slate-400 text-[10px]">근로소득세액공제 등 세액공제</td>
                                </tr>
                                <tr className="bg-indigo-50/50 dark:bg-indigo-950/30">
                                    <td className="py-2 px-3 font-bold border-r text-indigo-900 dark:text-indigo-200">최종 결정세액</td>
                                    <td className="py-2 px-3 font-black text-indigo-600 dark:text-indigo-400">150,000</td>
                                    <td className="py-2 px-3 text-slate-400 text-[10px]">산출세액 - 세액공제</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-3 bg-slate-50 dark:bg-slate-800/50 font-bold border-r">기납부세액 (원천징수)</td>
                                    <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">240,000</td>
                                    <td className="py-2 px-3 text-slate-400 text-[10px]">매월 월급에서 뗀 세금 합계</td>
                                </tr>
                                <tr className="bg-emerald-50/70 dark:bg-emerald-950/50">
                                    <td className="py-2 px-3 font-bold border-r text-emerald-900 dark:text-emerald-200">차감납부(환급)세액</td>
                                    <td className="py-2 px-3 font-black text-emerald-600 dark:text-emerald-400">△90,000 (환급)</td>
                                    <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">결정세액(15만) - 기납부세액(24만)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-750 text-[11px] space-y-1">
                        <div className="font-bold text-slate-800 dark:text-slate-200">🌐 외국인근로자 단일세율(19%) 선택 특례</div>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            외국인 근로자가 19% 단일세율을 선택한 경우: <strong>결정세액 = (총급여 + 비과세소득) × 19%</strong><br/>
                            단, 이 경우 소득세와 관련된 비과세, 소득공제, 세액감면 및 세액공제 규정은 일체 적용하지 않습니다.
                        </p>
                    </div>
                </div>
            ),
            tax_saving: [
                '결정세액이 0원이 되면 매월 냈던 기납부세액 전액을 100% 환급받게 됩니다 (일명 "원천징수 세금 전액 환급").'
            ],
            caution: [
                '세액공제 합계액이 산출세액을 초과하더라도 결정세액은 0원까지만 내려가며 마이너스 세액이 되지 않습니다.'
            ]
        },

        prepaid_tax: {
            title: '기납부세액 & 징수부족액 3개월 분납 제도',
            tag: '세율 및 정산',
            formula: '기납부세액 = 주(현) 근무지 원천징수세액 + 종(전) 근무지의 결정세액',
            desc: (
                <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        1년간 매월 급여에서 근로소득 간이세액표에 따라 미리 원천징수된 소득세액의 합계입니다. 연말정산 결과 추가 납부해야 할 세액이 큰 경우 부담을 줄이기 위해 분할 납부 제도가 지원됩니다.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                        <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-1">
                            <div className="font-bold text-indigo-900 dark:text-indigo-200">🎯 간이세액표 원천징수비율 선택제</div>
                            <div className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                근로자는 회사를 통해 원천징수 세액의 비율을 <strong>80%, 100%, 120%</strong> 중 선택할 수 있습니다. 120%를 선택하면 평소 월급은 약간 줄어들지만 연말정산 환급액이 늘어나거나 추가납부 위험이 줄어듭니다.
                            </div>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1">
                            <div className="font-bold text-amber-900 dark:text-amber-200">💳 추가납부 10만원 초과 시 3개월 분납</div>
                            <div className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                추가로 낼 세금(차감납부세액)이 <strong>10만원을 초과</strong>하는 경우, 2월분 급여부터 4월분 급여를 지급받을 때까지 <strong>3개월간 분할 납부</strong>할 수 있습니다.
                            </div>
                        </div>
                    </div>
                </div>
            ),
            tax_saving: [
                'Tip 01: 당해 연도 중 이직한 근로자는 전 직장의 원천징수영수증 상 "기납부세액"이 아니라 반드시 「결정세액」을 주(현) 근무지의 종(전) 근무지 정산 내역에 입력해야 이중과세나 가산세 없이 정확한 환급을 받을 수 있습니다.',
                'Tip 02: 전 직장의 원천징수영수증을 제때 제출하지 못해 현 직장에서 종전근무지를 합산하지 못한 경우, 5월 종합소득세 정기확정신고 기간에 홈택스를 통해 직접 합산 신고하면 환급을 챙길 수 있습니다.'
            ],
            caution: [
                'Tip 01: 징수부족액(추가납부세액)이 10만원 이하인 경우에는 분할 납부가 불가능하며 2월 급여에서 전액 일시 공제됩니다.',
                'Tip 02: 소득세를 분할 납부하는 경우, 연동되는 지방소득세(10%) 및 농어촌특별세도 소득세 분납 비율과 동일하게 3개월에 걸쳐 나누어 납부됩니다.'
            ]
        }
    };

    const currentSec = SECTION_DATA[activeSection] || SECTION_DATA.gross_salary;

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 text-xs">
                {/* 상단 헤더 */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">📖</span>
                        <div>
                            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                2026년 귀속 연말정산 종합 공제항목 가이드
                            </h2>
                            <p className="text-[10px] text-slate-500">국세청 귀속 2026 공식 세법 개정안 및 절세·유의 팁 수록</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all text-lg font-bold w-7 h-7 flex items-center justify-center cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* 좌우 분할 본문 */}
                <div className="flex-1 flex overflow-hidden">
                    {/* 좌측 카테고리 네비게이션 */}
                    <div className="w-52 sm:w-60 border-r border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/70 p-2.5 overflow-y-auto space-y-3 flex-shrink-0">
                        {CATEGORIES.map((cat, idx) => (
                            <div key={idx} className="space-y-1">
                                <div className="px-2.5 py-1 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                    {cat.category}
                                </div>
                                {cat.items.map((sec) => (
                                    <button
                                        key={sec.id}
                                        onClick={() => setActiveSection(sec.id)}
                                        className={`w-full text-left px-2.5 py-2 rounded-xl font-bold transition-all text-xs flex items-center justify-between cursor-pointer ${
                                            activeSection === sec.id
                                                ? 'bg-indigo-600 text-white shadow-xs'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        <span className="truncate">{sec.title}</span>
                                        {activeSection === sec.id && <span className="text-xs">›</span>}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* 우측 내용 패널 */}
                    <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-white dark:bg-slate-900">
                        {/* 섹션 헤더 */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                    {currentSec.tag}
                                </span>
                                <h3 className="text-base font-black text-slate-900 dark:text-white mt-1.5">
                                    {currentSec.title}
                                </h3>
                            </div>
                        </div>

                        {/* 산출 공식 배너 */}
                        {currentSec.formula && (
                            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/90 font-mono font-bold text-center text-xs text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-750">
                                {currentSec.formula}
                            </div>
                        )}

                        {/* 섹션 본문 */}
                        <div className="text-xs">
                            {currentSec.desc}
                        </div>

                        {/* 하단 Tip 영역 (절세 Tip / 유의 Tip 탭) */}
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setTipTab('tax_saving')}
                                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                                            tipTab === 'tax_saving'
                                                ? 'bg-indigo-600 text-white shadow-xs'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                        }`}
                                    >
                                        <span>💡</span> 절세 Tip ({currentSec.tax_saving?.length || 0})
                                    </button>
                                    <button
                                        onClick={() => setTipTab('caution')}
                                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                                            tipTab === 'caution'
                                                ? 'bg-rose-600 text-white shadow-xs'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                        }`}
                                    >
                                        <span>⚠️</span> 유의 Tip ({currentSec.caution?.length || 0})
                                    </button>
                                </div>
                                <span className="text-[10px] text-slate-400">국세청 2026 공제항목 가이드라인 발췌</span>
                            </div>

                            {tipTab === 'tax_saving' ? (
                                <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-slate-700 dark:text-slate-300 space-y-2">
                                    {currentSec.tax_saving && currentSec.tax_saving.length > 0 ? (
                                        currentSec.tax_saving.map((t, i) => (
                                            <div key={i} className="flex items-start gap-2">
                                                <span className="font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0">•</span>
                                                <p className="leading-relaxed">{t}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-slate-400">해당 항목의 절세 팁 정보가 준비 중입니다.</p>
                                    )}
                                </div>
                            ) : (
                                <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-[11px] text-slate-700 dark:text-slate-300 space-y-2">
                                    {currentSec.caution && currentSec.caution.length > 0 ? (
                                        currentSec.caution.map((c, i) => (
                                            <div key={i} className="flex items-start gap-2">
                                                <span className="font-bold text-rose-600 dark:text-rose-400 flex-shrink-0">•</span>
                                                <p className="leading-relaxed">{c}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-slate-400">해당 항목의 유의사항 정보가 준비 중입니다.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 하단 닫기 */}
                <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all cursor-pointer"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}
