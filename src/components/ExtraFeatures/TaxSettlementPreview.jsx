// TaxSettlementPreview.jsx - 2026년 기준 개정 세법 반영 연말정산 정밀 모의계산기
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
    UnifiedCalculationModal,
    TaxDataTransferModal,
    CardDeductionModal, 
    MedicalDeductionModal, 
    DonationDeductionModal, 
    TaxGuideHelpModal 
} from './TaxSettlement2026Modals';

// 포맷팅 헬퍼
function formatKRW(val) {
    const num = Math.round(Number(val) || 0);
    return num.toLocaleString('ko-KR') + '원';
}

function formatManwon(val) {
    const num = Math.round(Number(val) || 0);
    if (Math.abs(num) >= 10000) {
        const eok = Math.floor(Math.abs(num) / 10000);
        const man = Math.abs(num) % 10000;
        const sign = num < 0 ? '-' : '';
        return `${sign}${eok}억 ${man > 0 ? man.toLocaleString() + '만' : ''}원`.trim();
    }
    return `${num.toLocaleString('ko-KR')}만원`;
}

// 1. 근로소득공제 계산 (소득세법 제47조)
function calcEarnedIncomeDeduction(salaryWon) {
    if (salaryWon <= 5000000) {
        return salaryWon * 0.7;
    } else if (salaryWon <= 15000000) {
        return 3500000 + (salaryWon - 5000000) * 0.4;
    } else if (salaryWon <= 45000000) {
        return 7500000 + (salaryWon - 15000000) * 0.15;
    } else if (salaryWon <= 100000000) {
        return 12000000 + (salaryWon - 45000000) * 0.05;
    } else {
        const deduction = 14750000 + (salaryWon - 100000000) * 0.02;
        return Math.min(deduction, 20000000); // 한도 2,000만원
    }
}

// 2. 기본세율 누진 계산 (2026년 기준 8단계 누진세율 및 속산표)
function calcBaseTax(taxableIncomeWon) {
    if (taxableIncomeWon <= 0) return 0;
    if (taxableIncomeWon <= 14000000) {
        return Math.round(taxableIncomeWon * 0.06);
    } else if (taxableIncomeWon <= 50000000) {
        // 84만원 + 1,400만원 초과금액의 15% = (과표 * 15%) - 126만원
        return Math.round(taxableIncomeWon * 0.15 - 1260000);
    } else if (taxableIncomeWon <= 88000000) {
        // 624만원 + 5,000만원 초과금액의 24% = (과표 * 24%) - 576만원
        return Math.round(taxableIncomeWon * 0.24 - 5760000);
    } else if (taxableIncomeWon <= 150000000) {
        // 1,536만원 + 8,800만원 초과금액의 35% = (과표 * 35%) - 1,544만원
        return Math.round(taxableIncomeWon * 0.35 - 15440000);
    } else if (taxableIncomeWon <= 300000000) {
        // 3,706만원 + 1억5천만원 초과금액의 38% = (과표 * 38%) - 1,994만원
        return Math.round(taxableIncomeWon * 0.38 - 19940000);
    } else if (taxableIncomeWon <= 500000000) {
        // 9,406만원 + 3억원 초과금액의 40% = (과표 * 40%) - 2,594만원
        return Math.round(taxableIncomeWon * 0.40 - 25940000);
    } else if (taxableIncomeWon <= 1000000000) {
        // 1억 7,406만원 + 5억원 초과금액의 42% = (과표 * 42%) - 3,594만원
        return Math.round(taxableIncomeWon * 0.42 - 35940000);
    } else {
        // 3억 8,406만원 + 10억원 초과금액의 45% = (과표 * 45%) - 6,594만원
        return Math.round(taxableIncomeWon * 0.45 - 65940000);
    }
}

// 3. 근로소득 세액공제 계산 (소득세법 제59조 4단계 총급여 한도 및 중소기업 감면 비례조정)
function calcEarnedIncomeTaxCredit(calculatedTaxWon, salaryWon, smeReductionWon = 0) {
    if (calculatedTaxWon <= 0) return 0;
    let rawCredit = 0;
    if (calculatedTaxWon <= 1300000) {
        rawCredit = calculatedTaxWon * 0.55;
    } else {
        rawCredit = 715000 + (calculatedTaxWon - 1300000) * 0.30;
    }

    let maxLimit = 740000;
    if (salaryWon <= 33000000) {
        maxLimit = 740000;
    } else if (salaryWon <= 70000000) {
        maxLimit = Math.max(740000 - (salaryWon - 33000000) * 0.008, 660000);
    } else if (salaryWon <= 120000000) {
        maxLimit = Math.max(660000 - (salaryWon - 70000000) * 0.5, 500000);
    } else {
        maxLimit = Math.max(500000 - (salaryWon - 120000000) * 0.5, 200000);
    }

    const baseCredit = Math.min(rawCredit, maxLimit);
    if (smeReductionWon > 0 && calculatedTaxWon > 0) {
        // 중소기업 취업자 소득세 감면 시: 근로소득세액공제액 × (1 - 소득세감면액 ÷ 산출세액)
        const ratio = Math.max(0, 1 - (smeReductionWon / calculatedTaxWon));
        return Math.max(0, Math.round(baseCredit * ratio));
    }
    return Math.round(baseCredit);
}

// 소기업·소상공인 공제부금(노란우산) 한도 계산
function getYellowUmbrellaLimit(earnedIncomeAmountWon, salaryWon) {
    if (salaryWon > 80000000) return 0; // 법인대표자 총급여 8천만원 이하 요건
    if (earnedIncomeAmountWon <= 40000000) return 6000000;
    if (earnedIncomeAmountWon <= 60000000) return 5000000;
    if (earnedIncomeAmountWon <= 100000000) return 4000000;
    return 2000000;
}

// 벤처기업 투자조합출자 등 소득공제 계산 (3천만 이하 100%, 3~5천만 70%, 5천만 초과 30%)
function calcVentureInvestmentDeduction(amountWon, earnedIncomeAmountWon) {
    if (amountWon <= 0) return 0;
    let deduction = 0;
    const under30m = Math.min(amountWon, 30000000);
    deduction += under30m * 1.0;

    if (amountWon > 30000000) {
        const between30and50m = Math.min(amountWon - 30000000, 20000000);
        deduction += between30and50m * 0.70;
    }
    if (amountWon > 50000000) {
        const over50m = amountWon - 50000000;
        deduction += over50m * 0.30;
    }
    const limit50 = Math.round(earnedIncomeAmountWon * 0.50);
    return Math.min(Math.round(deduction), limit50);
}

// 국민성장집합투자증권저축 공제 계산 ('26.5.12 신설)
function calcNationalGrowthFundDeduction(amountWon) {
    const validAmount = Math.min(amountWon, 200000000); // 한도: 투자금액 2억원
    if (validAmount <= 0) return 0;
    if (validAmount <= 30000000) {
        return Math.round(validAmount * 0.40);
    } else if (validAmount <= 50000000) {
        return Math.round(12000000 + (validAmount - 30000000) * 0.20);
    } else if (validAmount <= 70000000) {
        return Math.round(16000000 + (validAmount - 50000000) * 0.10);
    } else {
        return 18000000;
    }
}

// 4. 2026년 기준 신용카드 등 소득공제 공식
function calcCardDeduction2026({
    salaryWon,
    numChildren = 0,
    creditCard = 0,
    debitCard = 0,
    cashReceipt = 0,
    cultureCredit = 0,
    cultureDebit = 0,
    cultureCash = 0,
    market = 0,
    transit = 0
}) {
    const minThreshold = salaryWon * 0.25;
    const sumTotal = creditCard + debitCard + cashReceipt + cultureCredit + cultureDebit + cultureCash + market + transit;

    if (sumTotal <= minThreshold) {
        const isOver70m = salaryWon > 70000000;
        const baseLimit = isOver70m ? 2500000 : 3000000;
        const childAlpha = isOver70m 
            ? Math.min(numChildren * 250000, 500000)
            : Math.min(numChildren * 500000, 1000000);
        return {
            minThreshold: Math.round(minThreshold),
            exemptAmount: 0,
            eligibleAmount: 0,
            baseLimit,
            childAlpha,
            totalLimit: baseLimit + childAlpha,
            generalDeduction: 0,
            addMarket: 0,
            addTransit: 0,
            addCulture: 0,
            finalDeduction: 0
        };
    }

    let remaining = minThreshold;
    let exemptAmount = 0;

    const exemptCredit = Math.min(remaining, creditCard);
    exemptAmount += exemptCredit * 0.15;
    remaining -= exemptCredit;

    const pool30 = debitCard + cashReceipt + cultureCredit + cultureDebit + cultureCash;
    const exempt30 = Math.min(remaining, pool30);
    exemptAmount += exempt30 * 0.30;
    remaining -= exempt30;

    const pool40 = market + transit;
    const exempt40 = Math.min(remaining, pool40);
    exemptAmount += exempt40 * 0.40;
    remaining -= exempt40;

    const rawTotalDeduction = (creditCard * 0.15) + (pool30 * 0.30) + (pool40 * 0.40);
    const eligibleAmount = Math.max(0, Math.round(rawTotalDeduction - exemptAmount));

    const isOver70m = salaryWon > 70000000;
    const baseLimit = isOver70m ? 2500000 : 3000000;
    const childAlpha = isOver70m 
        ? Math.min(numChildren * 250000, 500000)
        : Math.min(numChildren * 500000, 1000000);
    const totalLimit = baseLimit + childAlpha;

    const generalDeduction = Math.min(eligibleAmount, totalLimit);
    const excessEligible = Math.max(0, eligibleAmount - totalLimit);

    const maxMarketCredit = Math.round(market * 0.40);
    const addMarket = Math.min(excessEligible, maxMarketCredit, 3000000);

    const excessAfterMarket = Math.max(0, excessEligible - addMarket);
    const maxTransitCredit = Math.round(transit * 0.40);
    const addTransit = Math.min(excessAfterMarket, maxTransitCredit, Math.max(0, 3000000 - addMarket));

    let addCulture = 0;
    if (!isOver70m) {
        const excessAfterTransit = Math.max(0, excessAfterMarket - addTransit);
        const cultureTotal = cultureCredit + cultureDebit + cultureCash;
        const maxCultureCredit = Math.round(cultureTotal * 0.30);
        addCulture = Math.min(excessAfterTransit, maxCultureCredit, Math.max(0, 3000000 - addMarket - addTransit));
    }

    const finalDeduction = generalDeduction + addMarket + addTransit + addCulture;

    return {
        minThreshold: Math.round(minThreshold),
        exemptAmount: Math.round(exemptAmount),
        eligibleAmount: Math.round(eligibleAmount),
        baseLimit,
        childAlpha,
        totalLimit,
        generalDeduction: Math.round(generalDeduction),
        addMarket: Math.round(addMarket),
        addTransit: Math.round(addTransit),
        addCulture: Math.round(addCulture),
        finalDeduction: Math.round(finalDeduction)
    };
}

// 5. 2026년 기준 의료비 세액공제 공식
function calcMedicalDeduction2026({
    salaryWon,
    infertility = 0,
    prematureBaby = 0,
    seniorDisabled = 0,
    generalOther = 0
}) {
    const minThreshold = salaryWon * 0.03;
    const totalSpent = infertility + prematureBaby + seniorDisabled + generalOther;

    if (totalSpent <= minThreshold) {
        return {
            minThreshold: Math.round(minThreshold),
            eligibleGeneral: 0,
            eligibleSenior: 0,
            eligiblePremature: 0,
            eligibleInfertility: 0,
            creditGeneral: 0,
            creditSenior: 0,
            creditPremature: 0,
            creditInfertility: 0,
            totalMedicalCredit: 0
        };
    }

    let eligibleGeneral = 0;
    if (generalOther - minThreshold >= 0) {
        eligibleGeneral = Math.min(generalOther - minThreshold, 7000000);
    }

    let eligibleSenior = 0;
    if (generalOther - minThreshold < 0) {
        eligibleSenior = Math.max(seniorDisabled + generalOther - minThreshold, 0);
    } else {
        eligibleSenior = seniorDisabled;
    }

    let eligiblePremature = 0;
    if (seniorDisabled + generalOther - minThreshold < 0) {
        eligiblePremature = Math.max(prematureBaby + seniorDisabled + generalOther - minThreshold, 0);
    } else {
        eligiblePremature = prematureBaby;
    }

    let eligibleInfertility = 0;
    if (prematureBaby + seniorDisabled + generalOther - minThreshold < 0) {
        eligibleInfertility = Math.max(infertility + prematureBaby + seniorDisabled + generalOther - minThreshold, 0);
    } else {
        eligibleInfertility = infertility;
    }

    const creditGeneral = Math.round(eligibleGeneral * 0.15);
    const creditSenior = Math.round(eligibleSenior * 0.15);
    const creditPremature = Math.round(eligiblePremature * 0.20);
    const creditInfertility = Math.round(eligibleInfertility * 0.30);
    const totalMedicalCredit = creditGeneral + creditSenior + creditPremature + creditInfertility;

    return {
        minThreshold: Math.round(minThreshold),
        eligibleGeneral: Math.round(eligibleGeneral),
        eligibleSenior: Math.round(eligibleSenior),
        eligiblePremature: Math.round(eligiblePremature),
        eligibleInfertility: Math.round(eligibleInfertility),
        creditGeneral,
        creditSenior,
        creditPremature,
        creditInfertility,
        totalMedicalCredit
    };
}

// 6. 2026년 기준 기부금 세액공제 공식 (Image 1 종교단체 기부금 완성본 반영)
function calcDonationCredit2026({
    earnedIncomeAmountWon,
    politicalDonation = 0,
    hometownUnder10 = 0,
    hometown10to20 = 0,
    hometownSpecialOver20 = 0,
    hometownGeneralOver20 = 0,
    specialDonation = 0,
    employeeStockDonation = 0,
    religiousDonation = 0,
    nonReligiousDonation = 0
}) {
    // 1. 정치자금
    const polUnder10 = Math.min(politicalDonation, 100000);
    const polCreditUnder10 = Math.round(polUnder10 * (100 / 110));

    const polOver10To30m = Math.max(0, Math.min(politicalDonation, 30000000) - 100000);
    const polCreditOver10To30m = Math.round(polOver10To30m * 0.15);

    const polOver30m = Math.max(0, politicalDonation - 30000000);
    const polCreditOver30m = Math.round(polOver30m * 0.25);

    const polTotalEligible = polUnder10 + polOver10To30m + polOver30m;
    const polTotalCredit = polCreditUnder10 + polCreditOver10To30m + polCreditOver30m;

    // 2. 고향사랑
    const htLimit = Math.min(20000000, earnedIncomeAmountWon);
    const htUnder10 = Math.min(hometownUnder10, htLimit, 100000);
    const htCreditUnder10 = Math.round(htUnder10 * (100 / 110));

    const remAfterHt1 = Math.max(0, htLimit - htUnder10);
    const ht10to20Eligible = Math.min(hometown10to20, remAfterHt1, 100000);
    const htCredit10to20 = Math.round(ht10to20Eligible * 0.40);

    const remAfterHt2 = Math.max(0, remAfterHt1 - ht10to20Eligible);
    const htSpecialEligible = Math.min(hometownSpecialOver20, remAfterHt2);
    const htCreditSpecial = Math.round(htSpecialEligible * 0.30);

    const remAfterHt3 = Math.max(0, remAfterHt2 - htSpecialEligible);
    const htGeneralEligible = Math.min(hometownGeneralOver20, remAfterHt3);
    const htCreditGeneral = Math.round(htGeneralEligible * 0.15);

    const htTotalEligible = htUnder10 + ht10to20Eligible + htSpecialEligible + htGeneralEligible;
    const htTotalCredit = htCreditUnder10 + htCredit10to20 + htCreditSpecial + htCreditGeneral;

    // 3. 특례 기부금
    const specialLimit = Math.max(0, earnedIncomeAmountWon - polTotalEligible - htTotalEligible);
    const specialEligible = Math.min(specialDonation, specialLimit);
    const specialUnder10m = Math.min(specialEligible, 10000000);
    const specialOver10m = Math.max(0, specialEligible - 10000000);
    const specialCredit = Math.round((specialUnder10m * 0.15) + (specialOver10m * 0.30));

    // 4. 우리사주조합
    const remForStock = Math.max(0, earnedIncomeAmountWon - polTotalEligible - htTotalEligible - specialEligible);
    const stockLimit = Math.round(remForStock * 0.30);
    const stockEligible = Math.min(employeeStockDonation, stockLimit);
    const stockCredit = Math.round(stockEligible * 0.15);

    // 5. 일반기부금 (종교단체 외 및 종교단체) - Image 1 공식 100% 반영
    const remForDonation = Math.max(0, remForStock - stockEligible);
    const nonRelLimit = Math.round(remForDonation * 0.30);
    const nonRelEligible = Math.min(nonReligiousDonation, nonRelLimit);

    // 종교단체 기부금 한도:
    // 종교단체 기부금이 있는 경우: (remForDonation * 10%) + Min(remForDonation * 20%, nonReligiousDonation)
    // 종교단체 기부금이 없는 경우: remForDonation * 30%
    let relLimit = 0;
    if (religiousDonation > 0) {
        relLimit = Math.round(remForDonation * 0.10) + Math.min(Math.round(remForDonation * 0.20), nonRelEligible);
    } else {
        relLimit = Math.round(remForDonation * 0.30);
    }
    const relEligible = Math.min(religiousDonation, relLimit);

    // 일반기부금 공제액 (종교외 + 종교 합산 대상금액에 대해 1천만 이하 15%, 1천만 초과 30%)
    const totalGenDonation = nonRelEligible + relEligible;
    const genUnder10m = Math.min(totalGenDonation, 10000000);
    const genOver10m = Math.max(0, totalGenDonation - 10000000);
    const totalGenCredit = Math.round((genUnder10m * 0.15) + (genOver10m * 0.30));

    const nonRelCredit = totalGenDonation > 0 ? Math.round(totalGenCredit * (nonRelEligible / totalGenDonation)) : 0;
    const relCredit = totalGenCredit - nonRelCredit;

    const totalDonationCredit = polTotalCredit + htTotalCredit + specialCredit + stockCredit + totalGenCredit;

    return {
        polTotalCredit,
        htTotalCredit,
        specialLimit,
        specialCredit,
        stockLimit,
        stockCredit,
        nonRelLimit,
        nonRelEligible,
        nonRelCredit,
        relLimit,
        relEligible,
        relCredit,
        totalDonationCredit
    };
}

// 2026 기본 프리셋
const PRESETS = [
    {
        name: '📋 2026 홈택스 모의 표본 (5,850만)',
        salary: 5850,
        dependents: 1,
        numChildren: 0,
        seniorCount: 0,
        disabledCount: 0,
        isFemaleHead: false,
        isSingleParent: false,
        creditCard: 1050,
        debitCard: 400,
        cashReceipt: 250,
        cultureCredit: 0,
        cultureDebit: 0,
        cultureCash: 0,
        market: 0,
        transit: 0,
        medicalSenior: 140,
        medicalGeneral: 0,
        hometownUnder10: 10,
        pensionSavings: 0,
        irp: 0,
        housingSavings: 0,
        insuranceExpenses: 0,
        rentExpenses: 0
    },
    {
        name: '🌱 사회초년생 (3,500만)',
        salary: 3500,
        dependents: 1,
        numChildren: 0,
        seniorCount: 0,
        disabledCount: 0,
        isFemaleHead: false,
        isSingleParent: false,
        creditCard: 800,
        debitCard: 500,
        cashReceipt: 100,
        cultureCredit: 20,
        cultureDebit: 0,
        cultureCash: 0,
        market: 30,
        transit: 50,
        medicalSenior: 30,
        medicalGeneral: 0,
        hometownUnder10: 10,
        pensionSavings: 100,
        irp: 100,
        housingSavings: 120,
        insuranceExpenses: 60,
        rentExpenses: 480
    },
    {
        name: '👨‍👩‍👧 4인 가족 과장 (7,500만 / 자녀 2명)',
        salary: 7500,
        dependents: 4,
        numChildren: 2,
        seniorCount: 0,
        disabledCount: 0,
        isFemaleHead: false,
        isSingleParent: false,
        creditCard: 2200,
        debitCard: 1000,
        cashReceipt: 300,
        cultureCredit: 0,
        cultureDebit: 0,
        cultureCash: 0,
        market: 100,
        transit: 80,
        medicalSenior: 200,
        medicalGeneral: 150,
        hometownUnder10: 10,
        pensionSavings: 400,
        irp: 200,
        housingSavings: 240,
        insuranceExpenses: 120,
        rentExpenses: 0
    }
];

export default function TaxSettlementPreview({
    currentAppData = null,
    currentCalculation = null,
    currentUser = null,
    supabase = null,
    verifiedEmail = null,
    addToast = null
}) {
    // 1. 소득 및 부양가족
    const [salaryManwon, setSalaryManwon] = useState(5850);
    const [dependents, setDependents] = useState(1); // 본인 포함 인적공제 대상 인원
    const [numChildren, setNumChildren] = useState(0); // 2026 기본공제 대상 직계비속(자녀) 인원 수

    // 추가공제 상태 (인적공제)
    const [seniorCount, setSeniorCount] = useState(0); // 만 70세 이상 (1인당 100만)
    const [disabledCount, setDisabledCount] = useState(0); // 장애인 (1인당 200만)
    const [isFemaleHead, setIsFemaleHead] = useState(false); // 부녀자공제 50만 (근로소득금액 3천만원 이하)
    const [isSingleParent, setIsSingleParent] = useState(false); // 한부모공제 100만

    // 공적연금 (국민연금 등 본인 부담금 전액공제)
    const [customNationalPension, setCustomNationalPension] = useState('');

    // 상여금 및 비과세 계산기 드롭다운 토글
    const [isBonusHelperOpen, setIsBonusHelperOpen] = useState(false);
    const [monthlyBaseWon, setMonthlyBaseWon] = useState('');
    const [bonusAnnualWon, setBonusAnnualWon] = useState('');
    const [nonTaxableAnnualWon, setNonTaxableAnnualWon] = useState('2400000'); // 식대 등 기본 240만

    // 기납부세액 원천징수율
    const [withholdingRatio, setWithholdingRatio] = useState(100);
    const [customPrepaidTax, setCustomPrepaidTax] = useState('');

    // 2. 신용카드 등 사용금액 (만원)
    const [creditCard, setCreditCard] = useState(1050);
    const [debitCard, setDebitCard] = useState(400);
    const [cashReceipt, setCashReceipt] = useState(250);
    const [cultureCredit, setCultureCredit] = useState(0);
    const [cultureDebit, setCultureDebit] = useState(0);
    const [cultureCash, setCultureCash] = useState(0);
    const [market, setMarket] = useState(0);
    const [transit, setTransit] = useState(0);
    const [housingSavings, setHousingSavings] = useState(0);

    // 3. 의료비 세액공제 (만원)
    const [medicalInfertility, setMedicalInfertility] = useState(0); // 난임 30%
    const [medicalPremature, setMedicalPremature] = useState(0); // 미숙아 20%
    const [medicalSenior, setMedicalSenior] = useState(140); // 본인/65세이상/장애인/산정특례 15%
    const [medicalGeneral, setMedicalGeneral] = useState(0); // 그밖의 공제대상자 15% (한도 700만)

    // 4. 기부금 세액공제 (만원)
    const [politicalDonation, setPoliticalDonation] = useState(0);
    const [hometownUnder10, setHometownUnder10] = useState(10); // 10만원
    const [hometown10to20, setHometown10to20] = useState(0);
    const [hometownSpecialOver20, setHometownSpecialOver20] = useState(0);
    const [hometownGeneralOver20, setHometownGeneralOver20] = useState(0);
    const [specialDonation, setSpecialDonation] = useState(0);
    const [employeeStockDonation, setEmployeeStockDonation] = useState(0);
    const [nonReligiousDonation, setNonReligiousDonation] = useState(0);
    const [religiousDonation, setReligiousDonation] = useState(0);

    // 5. 기타 세액공제
    const [pensionSavings, setPensionSavings] = useState(0);
    const [irp, setIrp] = useState(0);
    const [isaPensionTransfer, setIsaPensionTransfer] = useState(0); // ISA 만기 연금계좌 전환금액 (조특법 제86조의4, 10% 최대 300만 추가한도)
    const [insuranceExpenses, setInsuranceExpenses] = useState(0);
    const [educationExpenses, setEducationExpenses] = useState(0);
    const [rentExpenses, setRentExpenses] = useState(0);

    // 6. 주택자금 특별소득공제 (만원)
    const [housingLeaseRepay, setHousingLeaseRepay] = useState(0); // 전세대출 원리금상환액
    const [mortgageInterest, setMortgageInterest] = useState(0); // 주택담보대출 이자상환액
    const [mortgageType, setMortgageType] = useState('none'); // 주담대 상환방식

    // 7. 그 밖의 소득공제 (만원)
    const [yellowUmbrella, setYellowUmbrella] = useState(0); // 노란우산공제부금
    const [oldPersonalPension, setOldPersonalPension] = useState(0); // 구 개인연금저축
    const [ventureInvestment, setVentureInvestment] = useState(0); // 벤처/투자조합 출자
    const [youthFund, setYouthFund] = useState(0); // 청년형 장기집합투자증권저축
    const [nationalGrowthFund, setNationalGrowthFund] = useState(0); // 국민성장집합투자증권저축 ('26.5.12 신설)
    const [employeeStockContribution, setEmployeeStockContribution] = useState(0); // 우리사주조합 출연금
    const [jobRetentionWageLoss, setJobRetentionWageLoss] = useState(0); // 고용유지 중소기업 임금삭감액

    // 8. 2026 세액감면 (조특법 제30조 중소기업 취업자 감면 등)
    const [smeReductionType, setSmeReductionType] = useState('none'); // 'none' | 'youth_90' | 'general_70' | 'custom'
    const [customSmeReduction, setCustomSmeReduction] = useState(''); // 직접 입력 감면세액 (만원)

    // 9. 2026 자녀세액공제 상세 ('26년 기준 9세 이상 및 당해 출생/입양)
    const [child9PlusCount, setChild9PlusCount] = useState(0); // 2026년 기준 9세 이상 기본공제대상 자녀 수
    const [birthFirstCount, setBirthFirstCount] = useState(0); // 당해 첫째 출생/입양 (30만)
    const [birthSecondCount, setBirthSecondCount] = useState(0); // 당해 둘째 출생/입양 (50만)
    const [birthThirdPlusCount, setBirthThirdPlusCount] = useState(0); // 당해 셋째 이상 출생/입양 (70만)

    // 10. 혼인세액공제 ('24~'26년 혼인신고 거주자 50만원 공제)
    const [isNewlywed2024to2026, setIsNewlywed2024to2026] = useState(false);

    // 11. 장애인전용 보장성보험료 (15%, 연 100만 한도)
    const [disabledInsuranceExpenses, setDisabledInsuranceExpenses] = useState(0);

    // 12. 배우자 유무 및 소득 상태 ('none' | 'single_earner' | 'dual_earner')
    const [spouseType, setSpouseType] = useState('none');
    // 혼인세액공제 방식 ('individual' [50만] | 'couple' [100만])
    const [marriageCreditOption, setMarriageCreditOption] = useState('individual');

    // 13. 체육시설 세분화 (만원)
    const [cultureBooks, setCultureBooks] = useState(0); // 도서·공연·미술관·영화 관람료
    const [gymGeneral, setGymGeneral] = useState(0); // 헬스장·수영장 시설이용료 (100% 인정)
    const [gymPtLesson, setGymPtLesson] = useState(0); // PT·수영 강습료 등 복합결제 (50% 자동인정)

    // 모달 상태
    const [isCalculationModalOpen, setIsCalculationModalOpen] = useState(false);
    const [calculationModalTab, setCalculationModalTab] = useState('card'); // 'card' | 'medical' | 'donation'
    const [isDataTransferModalOpen, setIsDataTransferModalOpen] = useState(false);
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
    const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [isBreakdownExpanded, setIsBreakdownExpanded] = useState(true); // 환급패널 내 6단계 세부계산서 상세표 토글

    // 저장 및 동기화 상태
    const [saveStatus, setSaveStatus] = useState('idle');
    const [lastSavedTime, setLastSavedTime] = useState(null);
    const isInitialLoadedRef = useRef(false);

    // 데이터 복원 헬퍼
    const applySavedState = (d) => {
        if (!d || typeof d !== 'object') return;
        if (d.salaryManwon !== undefined) setSalaryManwon(Number(d.salaryManwon));
        if (d.dependents !== undefined) setDependents(Number(d.dependents));
        if (d.spouseType !== undefined) setSpouseType(d.spouseType);
        if (d.marriageCreditOption !== undefined) setMarriageCreditOption(d.marriageCreditOption);
        if (d.cultureBooks !== undefined) setCultureBooks(Number(d.cultureBooks));
        else if (d.cultureCredit !== undefined) setCultureBooks(Number(d.cultureCredit));
        if (d.gymGeneral !== undefined) setGymGeneral(Number(d.gymGeneral));
        if (d.gymPtLesson !== undefined) setGymPtLesson(Number(d.gymPtLesson));
        if (d.numChildren !== undefined) setNumChildren(Number(d.numChildren));
        if (d.seniorCount !== undefined) setSeniorCount(Number(d.seniorCount));
        if (d.disabledCount !== undefined) setDisabledCount(Number(d.disabledCount));
        if (d.isFemaleHead !== undefined) setIsFemaleHead(Boolean(d.isFemaleHead));
        if (d.isSingleParent !== undefined) setIsSingleParent(Boolean(d.isSingleParent));
        if (d.customNationalPension !== undefined) setCustomNationalPension(d.customNationalPension);
        if (d.withholdingRatio !== undefined) setWithholdingRatio(Number(d.withholdingRatio));
        if (d.customPrepaidTax !== undefined) setCustomPrepaidTax(d.customPrepaidTax);
        if (d.creditCard !== undefined) setCreditCard(Number(d.creditCard));
        if (d.debitCard !== undefined) setDebitCard(Number(d.debitCard));
        if (d.cashReceipt !== undefined) setCashReceipt(Number(d.cashReceipt));
        if (d.cultureCredit !== undefined) setCultureCredit(Number(d.cultureCredit));
        if (d.cultureDebit !== undefined) setCultureDebit(Number(d.cultureDebit));
        if (d.cultureCash !== undefined) setCultureCash(Number(d.cultureCash));
        if (d.market !== undefined) setMarket(Number(d.market));
        if (d.transit !== undefined) setTransit(Number(d.transit));
        if (d.housingSavings !== undefined) setHousingSavings(Number(d.housingSavings));
        if (d.medicalInfertility !== undefined) setMedicalInfertility(Number(d.medicalInfertility));
        if (d.medicalPremature !== undefined) setMedicalPremature(Number(d.medicalPremature));
        if (d.medicalSenior !== undefined) setMedicalSenior(Number(d.medicalSenior));
        if (d.medicalGeneral !== undefined) setMedicalGeneral(Number(d.medicalGeneral));
        if (d.politicalDonation !== undefined) setPoliticalDonation(Number(d.politicalDonation));
        if (d.hometownUnder10 !== undefined) setHometownUnder10(Number(d.hometownUnder10));
        if (d.hometown10to20 !== undefined) setHometown10to20(Number(d.hometown10to20));
        if (d.hometownSpecialOver20 !== undefined) setHometownSpecialOver20(Number(d.hometownSpecialOver20));
        if (d.hometownGeneralOver20 !== undefined) setHometownGeneralOver20(Number(d.hometownGeneralOver20));
        if (d.specialDonation !== undefined) setSpecialDonation(Number(d.specialDonation));
        if (d.employeeStockDonation !== undefined) setEmployeeStockDonation(Number(d.employeeStockDonation));
        if (d.nonReligiousDonation !== undefined) setNonReligiousDonation(Number(d.nonReligiousDonation));
        if (d.religiousDonation !== undefined) setReligiousDonation(Number(d.religiousDonation));
        if (d.pensionSavings !== undefined) setPensionSavings(Number(d.pensionSavings));
        if (d.irp !== undefined) setIrp(Number(d.irp));
        if (d.isaPensionTransfer !== undefined) setIsaPensionTransfer(Number(d.isaPensionTransfer));
        if (d.insuranceExpenses !== undefined) setInsuranceExpenses(Number(d.insuranceExpenses));
        if (d.disabledInsuranceExpenses !== undefined) setDisabledInsuranceExpenses(Number(d.disabledInsuranceExpenses));
        if (d.educationExpenses !== undefined) setEducationExpenses(Number(d.educationExpenses));
        if (d.rentExpenses !== undefined) setRentExpenses(Number(d.rentExpenses));
        if (d.housingLeaseRepay !== undefined) setHousingLeaseRepay(Number(d.housingLeaseRepay));
        if (d.mortgageInterest !== undefined) setMortgageInterest(Number(d.mortgageInterest));
        if (d.mortgageType !== undefined) setMortgageType(d.mortgageType);
        if (d.yellowUmbrella !== undefined) setYellowUmbrella(Number(d.yellowUmbrella));
        if (d.oldPersonalPension !== undefined) setOldPersonalPension(Number(d.oldPersonalPension));
        if (d.ventureInvestment !== undefined) setVentureInvestment(Number(d.ventureInvestment));
        if (d.youthFund !== undefined) setYouthFund(Number(d.youthFund));
        if (d.nationalGrowthFund !== undefined) setNationalGrowthFund(Number(d.nationalGrowthFund));
        if (d.employeeStockContribution !== undefined) setEmployeeStockContribution(Number(d.employeeStockContribution));
        if (d.jobRetentionWageLoss !== undefined) setJobRetentionWageLoss(Number(d.jobRetentionWageLoss));
        if (d.smeReductionType !== undefined) setSmeReductionType(d.smeReductionType);
        if (d.customSmeReduction !== undefined) setCustomSmeReduction(d.customSmeReduction);
        if (d.child9PlusCount !== undefined) setChild9PlusCount(Number(d.child9PlusCount));
        if (d.birthFirstCount !== undefined) setBirthFirstCount(Number(d.birthFirstCount));
        if (d.birthSecondCount !== undefined) setBirthSecondCount(Number(d.birthSecondCount));
        if (d.birthThirdPlusCount !== undefined) setBirthThirdPlusCount(Number(d.birthThirdPlusCount));
        if (d.isNewlywed2024to2026 !== undefined) setIsNewlywed2024to2026(Boolean(d.isNewlywed2024to2026));
    };

    // 로컬 및 Supabase 로드
    useEffect(() => {
        if (isInitialLoadedRef.current) return;
        isInitialLoadedRef.current = true;

        try {
            const localRaw = localStorage.getItem('asset_additional_tax_settlement');
            if (localRaw) {
                const parsed = JSON.parse(localRaw);
                applySavedState(parsed);
                const localTime = localStorage.getItem('asset_additional_tax_settlement_time');
                if (localTime) setLastSavedTime(localTime);
            }
        } catch (err) {
            console.warn('Local tax settlement load warning:', err);
        }

        if (supabase && verifiedEmail) {
            (async () => {
                try {
                    const { data, error } = await supabase
                        .from('user_additional_data')
                        .select('data, updated_at')
                        .eq('email', verifiedEmail)
                        .eq('feature_type', 'tax_settlement')
                        .maybeSingle();

                    if (!error && data && data.data) {
                        const parsed = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
                        applySavedState(parsed);
                        if (data.updated_at) {
                            const timeStr = new Date(data.updated_at).toLocaleTimeString('ko-KR', { hour12: false });
                            setLastSavedTime(timeStr);
                            setSaveStatus('saved');
                        }
                    }
                } catch (cloudErr) {
                    console.info('user_additional_data load notice:', cloudErr?.message);
                }
            })();
        }
    }, [supabase, verifiedEmail]);

    // 현재 입력 상태 페이로드 생성 헬퍼
    const getCurrentSettingsPayload = () => ({
        salaryManwon,
        dependents,
        spouseType,
        marriageCreditOption,
        cultureBooks,
        gymGeneral,
        gymPtLesson,
        numChildren,
        seniorCount,
        disabledCount,
        isFemaleHead,
        isSingleParent,
        customNationalPension,
        withholdingRatio,
        customPrepaidTax,
        creditCard,
        debitCard,
        cashReceipt,
        cultureCredit,
        cultureDebit,
        cultureCash,
        market,
        transit,
        housingSavings,
        medicalInfertility,
        medicalPremature,
        medicalSenior,
        medicalGeneral,
        politicalDonation,
        hometownUnder10,
        hometown10to20,
        hometownSpecialOver20,
        hometownGeneralOver20,
        specialDonation,
        employeeStockDonation,
        nonReligiousDonation,
        religiousDonation,
        pensionSavings,
        irp,
        isaPensionTransfer,
        insuranceExpenses,
        disabledInsuranceExpenses,
        educationExpenses,
        rentExpenses,
        housingLeaseRepay,
        mortgageInterest,
        mortgageType,
        yellowUmbrella,
        oldPersonalPension,
        ventureInvestment,
        youthFund,
        nationalGrowthFund,
        employeeStockContribution,
        jobRetentionWageLoss,
        smeReductionType,
        customSmeReduction,
        child9PlusCount,
        birthFirstCount,
        birthSecondCount,
        birthThirdPlusCount,
        isNewlywed2024to2026
    });

    // 데이터 불러오기 핸들러
    const handleImportSettings = (importedData) => {
        applySavedState(importedData);
        if (addToast) {
            addToast('연말정산 데이터 불러오기 완료! 상단 [설정 저장] 버튼으로 영구 저장할 수 있습니다.', 'success');
        }
    };

    // 설정 저장 핸들러
    const handleSaveSettings = async () => {
        const payload = getCurrentSettingsPayload();

        setSaveStatus('saving');
        const now = new Date();
        const timeStr = now.toLocaleTimeString('ko-KR', { hour12: false });

        try {
            localStorage.setItem('asset_additional_tax_settlement', JSON.stringify(payload));
            localStorage.setItem('asset_additional_tax_settlement_time', timeStr);
        } catch (e) {
            console.warn('LocalStorage save error:', e);
        }

        if (supabase && verifiedEmail) {
            try {
                const recordDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                const { error } = await supabase
                    .from('user_additional_data')
                    .upsert({
                        email: verifiedEmail,
                        user_id: currentUser?.id || undefined,
                        data: JSON.stringify(payload),
                        feature_type: 'tax_settlement',
                        encryption_type: 'normal',
                        updated_at: now.toISOString(),
                        record_date: recordDate
                    }, { onConflict: 'email,feature_type' });

                if (error) {
                    setSaveStatus('error');
                    if (addToast) addToast('로컬 저장 완료 (Supabase 테이블 확인 필요)', 'warning');
                    else alert('로컬에 저장되었습니다.');
                    return;
                }

                setSaveStatus('saved');
                setLastSavedTime(timeStr);
                if (addToast) addToast(`연말정산 설정이 클라우드에 안전하게 저장되었습니다. (${timeStr})`, 'success');
                else alert(`클라우드에 안전하게 저장되었습니다! (${timeStr})`);
            } catch (err) {
                setSaveStatus('error');
                if (addToast) addToast('클라우드 저장 중 오류가 발생했습니다.', 'error');
            }
        } else {
            setSaveStatus('saved');
            setLastSavedTime(timeStr);
            if (addToast) addToast(`브라우저에 설정이 저장되었습니다. (${timeStr})`, 'info');
            else alert(`브라우저에 저장되었습니다! (${timeStr})`);
        }
    };

    // 프리셋 적용
    const handleApplyPreset = (p) => {
        setSalaryManwon(p.salary || 5850);
        setDependents(p.dependents || 1);
        setNumChildren(p.numChildren || 0);
        setChild9PlusCount(p.numChildren || 0);
        setBirthFirstCount(0);
        setBirthSecondCount(0);
        setBirthThirdPlusCount(0);
        setIsNewlywed2024to2026(false);
        setSeniorCount(p.seniorCount || 0);
        setDisabledCount(p.disabledCount || 0);
        setIsFemaleHead(Boolean(p.isFemaleHead));
        setIsSingleParent(Boolean(p.isSingleParent));
        setSpouseType(p.spouseType || 'none');
        setMarriageCreditOption(p.marriageCreditOption || 'individual');
        setIsaPensionTransfer(p.isaPensionTransfer || 0);
        setCustomNationalPension('');
        setCustomPrepaidTax('');
        setWithholdingRatio(100);
        setCreditCard(p.creditCard || 0);
        setDebitCard(p.debitCard || 0);
        setCashReceipt(p.cashReceipt || 0);
        setCultureCredit(p.cultureCredit || 0);
        setCultureBooks(p.cultureBooks || p.cultureCredit || 0);
        setGymGeneral(p.gymGeneral || 0);
        setGymPtLesson(p.gymPtLesson || 0);
        setMarket(p.market || 0);
        setTransit(p.transit || 0);
        setMedicalInfertility(0);
        setMedicalPremature(0);
        setMedicalSenior(p.medicalSenior || 0);
        setMedicalGeneral(p.medicalGeneral || 0);
        setHometownUnder10(p.hometownUnder10 || 0);
        setHometown10to20(0);
        setHometownSpecialOver20(0);
        setHometownGeneralOver20(0);
        setPoliticalDonation(0);
        setSpecialDonation(0);
        setEmployeeStockDonation(0);
        setNonReligiousDonation(0);
        setReligiousDonation(0);
        setPensionSavings(p.pensionSavings || 0);
        setIrp(p.irp || 0);
        setHousingSavings(p.housingSavings || 0);
        setInsuranceExpenses(p.insuranceExpenses || 0);
        setDisabledInsuranceExpenses(0);
        setRentExpenses(p.rentExpenses || 0);
        setHousingLeaseRepay(p.housingLeaseRepay || 0);
        setMortgageInterest(p.mortgageInterest || 0);
        setMortgageType(p.mortgageType || 'none');
        setYellowUmbrella(p.yellowUmbrella || 0);
        setOldPersonalPension(p.oldPersonalPension || 0);
        setVentureInvestment(p.ventureInvestment || 0);
        setYouthFund(p.youthFund || 0);
        setNationalGrowthFund(p.nationalGrowthFund || 0);
        setEmployeeStockContribution(p.employeeStockContribution || 0);
        setJobRetentionWageLoss(p.jobRetentionWageLoss || 0);
        setSmeReductionType('none');
        setCustomSmeReduction('');
    };

    // 상여금 및 비과세 계산기 적용
    const handleApplySalaryCalculation = () => {
        const base = Number(monthlyBaseWon) || 0;
        const bonus = Number(bonusAnnualWon) || 0;
        const nonTax = Number(nonTaxableAnnualWon) || 0;
        const totalGross = (base * 12) + bonus;
        const taxableTotalWon = Math.max(0, totalGross - nonTax);
        const calculatedManwon = Math.round(taxableTotalWon / 10000);
        if (calculatedManwon > 0) {
            setSalaryManwon(calculatedManwon);
            setIsBonusHelperOpen(false);
            if (addToast) addToast(`계산된 비과세 제외 총급여(${formatManwon(calculatedManwon)})를 적용했습니다.`, 'success');
        }
    };

    // =========================================================================
    // 🧮 2026 연말정산 통합 계산 엔진 (원 단위 정밀 연산)
    // =========================================================================
    const taxCalculation = useMemo(() => {
        const salaryWon = salaryManwon * 10000;

        // 1. 근로소득공제
        const earnedIncomeDeduction = calcEarnedIncomeDeduction(salaryWon);
        // 근로소득금액
        const earnedIncomeAmount = Math.max(0, salaryWon - earnedIncomeDeduction);

        // 2. 인적공제 (기본공제 150만원 + 외벌이 배우자 150만원 + 추가공제)
        const spouseDeduction = spouseType === 'single_earner' ? 1500000 : 0;
        const basePersonalDeduction = (Math.max(1, dependents) * 1500000) + spouseDeduction;
        const seniorDeduction = seniorCount * 1000000;
        const disabledDeduction = disabledCount * 2000000;
        let femaleOrSingleParentDeduction = 0;
        if (isSingleParent) {
            femaleOrSingleParentDeduction = 1000000;
        } else if (isFemaleHead && earnedIncomeAmount <= 30000000) {
            femaleOrSingleParentDeduction = 500000;
        }
        const additionalPersonalDeduction = seniorDeduction + disabledDeduction + femaleOrSingleParentDeduction;
        const personalDeduction = basePersonalDeduction + additionalPersonalDeduction;

        // 3. 연금보험료 공제 (공적연금 본인 부담금 전액) + 건강/고용보험
        let pensionInsuranceDeduction = 0;
        if (customNationalPension !== null && customNationalPension !== undefined && customNationalPension !== '') {
            pensionInsuranceDeduction = Math.round(Number(customNationalPension) * 10000);
        } else {
            pensionInsuranceDeduction = Math.min(salaryWon * 0.045, 3331800);
        }
        const healthEmploymentDeduction = salaryWon * (0.03545 + 0.0045 + 0.009);
        const socialInsuranceDeduction = Math.round(pensionInsuranceDeduction + healthEmploymentDeduction);

        // 4. 주택자금 특별소득공제 (전세대출, 청약저축, 주택담보대출)
        let housingSavingsDeduction = 0;
        if (salaryWon <= 70000000) {
            const validHousingSavings = Math.min(housingSavings * 10000, 3000000);
            housingSavingsDeduction = Math.round(validHousingSavings * 0.40);
        }

        // 주택임차차입금(전세대출) 원리금상환액 공제 (상환액의 40%)
        const housingLeaseDeduction = Math.round((housingLeaseRepay * 10000) * 0.40);

        // 주택마련저축 + 전세대출 합산 한도 연 400만원
        const leasePlusSavingsDeduction = Math.min(housingSavingsDeduction + housingLeaseDeduction, 4000000);

        // 장기주택저당차입금(주담대) 이자상환액 공제
        let mortgageLimit = 0;
        if (mortgageType === 'fixed_non_deferred_15') mortgageLimit = 20000000;
        else if (mortgageType === 'fixed_or_non_deferred_15') mortgageLimit = 15000000;
        else if (mortgageType === 'other_15') mortgageLimit = 10000000;
        else if (mortgageType === 'fixed_or_non_deferred_10') mortgageLimit = 6000000;

        const mortgageEligible = Math.min(mortgageInterest * 10000, mortgageLimit);
        const totalHousingLimit = Math.max(mortgageLimit, 4000000);
        const totalHousingDeduction = Math.min(leasePlusSavingsDeduction + mortgageEligible, totalHousingLimit);

        // 5. 2026 신용카드 등 소득공제 (도서공연 + 헬스/수영장 100% + PT 50% 자동인정)
        const gymPtRecognized = Math.round((Number(gymPtLesson) || 0) * 0.5);
        const totalCultureRecognizedManwon = (Number(cultureBooks) || 0) + (Number(gymGeneral) || 0) + gymPtRecognized;
        const totalCultureCreditWon = (totalCultureRecognizedManwon > 0 ? totalCultureRecognizedManwon : (Number(cultureCredit) || 0)) * 10000;

        const cardCalc = calcCardDeduction2026({
            salaryWon,
            numChildren,
            creditCard: creditCard * 10000,
            debitCard: debitCard * 10000,
            cashReceipt: cashReceipt * 10000,
            cultureCredit: totalCultureCreditWon,
            cultureDebit: cultureDebit * 10000,
            cultureCash: cultureCash * 10000,
            market: market * 10000,
            transit: transit * 10000
        });
        const cardDeduction = cardCalc.finalDeduction;

        // 6. 그 밖의 소득공제
        // 6-1. 소기업·소상공인 공제부금(노란우산)
        const yellowLimit = getYellowUmbrellaLimit(earnedIncomeAmount, salaryWon);
        const yellowUmbrellaDeduction = Math.min(yellowUmbrella * 10000, yellowLimit);

        // 6-2. 구 개인연금저축 (2000년 이전, 납입액 40%, 72만원 한도)
        const oldPersonalPensionDeduction = Math.min(Math.round((oldPersonalPension * 10000) * 0.40), 720000);

        // 6-3. 벤처기업 투자조합출자 등
        const ventureInvestmentDeduction = calcVentureInvestmentDeduction(ventureInvestment * 10000, earnedIncomeAmount);

        // 6-4. 청년형 장기집합투자증권저축 (총급여 5천만 이하, 240만 한도)
        let youthFundDeduction = 0;
        if (salaryWon <= 50000000) {
            youthFundDeduction = Math.min(Math.round(Math.min(youthFund * 10000, 6000000) * 0.40), 2400000);
        }

        // 6-5. 국민성장집합투자증권저축 ('26.5.12 신설)
        const nationalGrowthFundDeduction = calcNationalGrowthFundDeduction(nationalGrowthFund * 10000);

        // 6-6. 우리사주조합 출연금 (연 400만원 한도)
        const employeeStockContributionDeduction = Math.min(employeeStockContribution * 10000, 4000000);

        // 6-7. 고용유지 중소기업 근로자 (임금삭감액의 50%, 연 1,000만원 한도)
        const jobRetentionWageLossDeduction = Math.min(Math.round((jobRetentionWageLoss * 10000) * 0.50), 10000000);

        const otherIncomeDeductions = yellowUmbrellaDeduction + oldPersonalPensionDeduction + ventureInvestmentDeduction + youthFundDeduction + nationalGrowthFundDeduction + employeeStockContributionDeduction + jobRetentionWageLossDeduction;

        // 7. 소득공제 종합한도 (조세특례제한법 제132조의2)
        // 특별소득공제(주택자금) + 그 밖의 소득공제(신용카드, 노란우산, 우리사주, 국민성장저축 등) 대상 합계 2,500만원 한도 적용
        const cappedTargetDeductions = totalHousingDeduction + cardDeduction + yellowUmbrellaDeduction + employeeStockContributionDeduction + nationalGrowthFundDeduction;
        const excessOf25m = Math.max(0, cappedTargetDeductions - 25000000); // 2,500만원 초과액

        const rawTotalIncomeDeductions = personalDeduction + socialInsuranceDeduction + totalHousingDeduction + cardDeduction + otherIncomeDeductions;
        const totalIncomeDeductions = Math.max(0, rawTotalIncomeDeductions - excessOf25m);

        // 종합소득 과세표준 = 근로소득금액 - 인적공제 - 연금보험료공제 - 특별소득공제 - 그 밖의 소득공제 + 소득공제 종합한도 초과액
        const taxableIncome = Math.max(0, earnedIncomeAmount - rawTotalIncomeDeductions + excessOf25m);

        // 산출세액
        const calculatedTax = Math.round(calcBaseTax(taxableIncome));

        // 6. 세액감면 (조특법 제30조 중소기업 취업자 감면 등)
        let smeReductionWon = 0;
        if (smeReductionType === 'youth_90') {
            smeReductionWon = Math.min(Math.round(calculatedTax * 0.90), 2000000);
        } else if (smeReductionType === 'general_70') {
            smeReductionWon = Math.min(Math.round(calculatedTax * 0.70), 2000000);
        } else if (smeReductionType === 'custom') {
            smeReductionWon = Math.min(Math.round(Number(customSmeReduction || 0) * 10000), calculatedTax);
        }

        // 세액감면 차감 후 잔여 산출세액
        const taxAfterReduction = Math.max(0, calculatedTax - smeReductionWon);

        // 7. 세액공제
        // 7-1. 근로소득 세액공제 (중소기업 감면 시 비례 차감 공식 적용)
        const earnedIncomeCredit = Math.round(calcEarnedIncomeTaxCredit(calculatedTax, salaryWon, smeReductionWon));

        // 7-2. 자녀세액공제 ('26년 기준 9세 이상 기본공제 대상 자녀 + 출생/입양)
        let childCredit9Plus = 0;
        if (child9PlusCount === 1) {
            childCredit9Plus = 250000;
        } else if (child9PlusCount === 2) {
            childCredit9Plus = 550000;
        } else if (child9PlusCount >= 3) {
            childCredit9Plus = 550000 + (child9PlusCount - 2) * 400000;
        }
        const birthCredit = (birthFirstCount * 300000) + (birthSecondCount * 500000) + (birthThirdPlusCount * 700000);
        const totalChildCredit = childCredit9Plus + birthCredit;

        // 7-3. 혼인세액공제 ('24~'26년 혼인신고 거주자 50만원 / 맞벌이 부부합산 100만원)
        let marriageCredit = 0;
        if (isNewlywed2024to2026) {
            marriageCredit = (spouseType === 'dual_earner' && marriageCreditOption === 'couple') ? 1000000 : 500000;
        }

        // 7-4. 연금계좌 세액공제 (연금저축/IRP) 및 ISA 만기 연금계좌 전환 세액공제 (조특법 제86조의4)
        const validPension = Math.min(pensionSavings * 10000, 6000000);
        const validTotalPension = Math.min((pensionSavings + irp) * 10000, 9000000);
        const validIrp = Math.max(0, validTotalPension - validPension);
        const pensionRate = salaryWon <= 55000000 ? 0.15 : 0.12;
        const pensionSavingsCredit = Math.round(validPension * pensionRate);
        const irpCredit = Math.round(validIrp * pensionRate);

        // ISA 만기 자금 연금 전환 세액공제: 전환금액의 10% (최대 300만원 한도 추가 세액공제)
        const isaTransferWon = (Number(isaPensionTransfer) || 0) * 10000;
        const isaCreditEligible = Math.min(Math.round(isaTransferWon * 0.10), 3000000);
        const isaPensionCredit = Math.round(isaCreditEligible * pensionRate);

        const totalPensionCredit = pensionSavingsCredit + irpCredit + isaPensionCredit;

        // 7-5. 보장성 보험료 세액공제 (일반 12% 100만 한도 + 장애인전용 15% 100만 한도)
        const generalInsuranceCredit = Math.round(Math.min(insuranceExpenses * 10000, 1000000) * 0.12);
        const disabledInsuranceCredit = Math.round(Math.min(disabledInsuranceExpenses * 10000, 1000000) * 0.15);
        const insuranceCredit = generalInsuranceCredit + disabledInsuranceCredit;

        // 7-6. 2026 의료비 세액공제
        const medicalCalc = calcMedicalDeduction2026({
            salaryWon,
            infertility: medicalInfertility * 10000,
            prematureBaby: medicalPremature * 10000,
            seniorDisabled: medicalSenior * 10000,
            generalOther: medicalGeneral * 10000
        });
        const medicalCredit = medicalCalc.totalMedicalCredit;

        // 7-7. 교육비 세액공제 (15%)
        const educationCredit = Math.round((educationExpenses * 10000) * 0.15);

        // 7-8. 2026 기부금 세액공제 (종교단체 완성본 반영)
        const donationCalc = calcDonationCredit2026({
            earnedIncomeAmountWon: earnedIncomeAmount,
            politicalDonation: politicalDonation * 10000,
            hometownUnder10: hometownUnder10 * 10000,
            hometown10to20: hometown10to20 * 10000,
            hometownSpecialOver20: hometownSpecialOver20 * 10000,
            hometownGeneralOver20: hometownGeneralOver20 * 10000,
            specialDonation: specialDonation * 10000,
            employeeStockDonation: employeeStockDonation * 10000,
            nonReligiousDonation: nonReligiousDonation * 10000,
            religiousDonation: religiousDonation * 10000
        });
        const donationCredit = donationCalc.totalDonationCredit;

        // 7-9. 월세액 세액공제 (총급여 8,000만원 이하, 1,000만원 한도)
        let rentCredit = 0;
        if (salaryWon <= 80000000) {
            const validRent = Math.min(rentExpenses * 10000, 10000000);
            const rentRate = salaryWon <= 55000000 ? 0.17 : 0.15;
            rentCredit = Math.round(validRent * rentRate);
        }

        // 표준세액공제 (13만원) 비교 분석
        const itemizedBenefitTotal = insuranceCredit + medicalCredit + educationCredit + donationCredit + rentCredit;
        const standardCreditWon = 130000;
        const isStandardCreditAdvantageous = itemizedBenefitTotal < standardCreditWon;

        // 총 세액공제 (감면 후 잔여 산출세액 한도 내)
        const rawTotalTaxCredit = earnedIncomeCredit + totalChildCredit + marriageCredit + totalPensionCredit + insuranceCredit + medicalCredit + educationCredit + donationCredit + rentCredit;
        const totalTaxCredit = Math.min(taxAfterReduction, rawTotalTaxCredit);

        // 8. 최종 결정세액
        const finalIncomeTax = Math.max(0, taxAfterReduction - totalTaxCredit);
        const finalLocalTax = Math.round(finalIncomeTax * 0.10);
        const finalTotalTax = finalIncomeTax + finalLocalTax;

        // 9. 기납부세액
        const baseEstimatedTax = calcBaseTax(Math.max(0, salaryWon - calcEarnedIncomeDeduction(salaryWon) - 1500000));
        const basePrepaid100 = Math.round(baseEstimatedTax * 0.82);
        const basePrepaidTotal100 = Math.round(basePrepaid100 * 1.10);

        let prepaidIncomeTax = 0;
        let prepaidLocalTax = 0;
        let prepaidTotalTax = 0;
        let effectiveWithholdingRatio = withholdingRatio;
        const isCustomPrepaid = customPrepaidTax !== null && customPrepaidTax !== undefined && customPrepaidTax !== '' && !isNaN(Number(customPrepaidTax)) && Number(customPrepaidTax) > 0;

        if (isCustomPrepaid) {
            // 사용자가 만원 단위(소수점 지원)로 입력한 기납부세액 총액 (소득세 + 지방소득세 합산)
            prepaidTotalTax = Math.round(Number(customPrepaidTax) * 10000);
            prepaidIncomeTax = Math.round(prepaidTotalTax / 1.10);
            prepaidLocalTax = prepaidTotalTax - prepaidIncomeTax;
            if (basePrepaidTotal100 > 0) {
                effectiveWithholdingRatio = Number(((prepaidTotalTax / basePrepaidTotal100) * 100).toFixed(1));
            }
        } else {
            prepaidIncomeTax = Math.round(basePrepaid100 * (withholdingRatio / 100));
            prepaidLocalTax = Math.round(prepaidIncomeTax * 0.10);
            prepaidTotalTax = prepaidIncomeTax + prepaidLocalTax;
            effectiveWithholdingRatio = withholdingRatio;
        }

        // 10. 최종 환급/추가납부 차액
        const refundDifference = prepaidTotalTax - finalTotalTax;
        const isRefund = refundDifference >= 0;

        return {
            salaryWon,
            earnedIncomeDeduction,
            earnedIncomeAmount,
            basePersonalDeduction,
            additionalPersonalDeduction,
            personalDeduction,
            pensionInsuranceDeduction,
            socialInsuranceDeduction,
            housingDeduction: totalHousingDeduction,
            housingSavingsDeduction,
            housingLeaseDeduction,
            leasePlusSavingsDeduction,
            mortgageEligible,
            totalHousingLimit,
            totalHousingDeduction,
            cardDeduction,
            cardCalc,
            yellowUmbrellaDeduction,
            yellowLimit,
            oldPersonalPensionDeduction,
            ventureInvestmentDeduction,
            youthFundDeduction,
            nationalGrowthFundDeduction,
            employeeStockContributionDeduction,
            jobRetentionWageLossDeduction,
            otherIncomeDeductions,
            cappedTargetDeductions,
            excessOf25m,
            rawTotalIncomeDeductions,
            totalIncomeDeductions,
            taxableIncome,
            calculatedTax,
            smeReductionWon,
            taxAfterReduction,
            earnedIncomeCredit,
            childCredit9Plus,
            birthCredit,
            totalChildCredit,
            marriageCredit,
            pensionSavingsCredit,
            irpCredit,
            isaTransferWon,
            isaCreditEligible,
            isaPensionCredit,
            totalPensionCredit,
            generalInsuranceCredit,
            disabledInsuranceCredit,
            insuranceCredit,
            medicalCredit,
            medicalCalc,
            educationCredit,
            donationCredit,
            donationCalc,
            rentCredit,
            standardCreditWon,
            isStandardCreditAdvantageous,
            itemizedBenefitTotal,
            totalTaxCredit,
            finalIncomeTax,
            finalLocalTax,
            finalTotalTax,
            prepaidIncomeTax,
            prepaidLocalTax,
            prepaidTotalTax,
            effectiveWithholdingRatio,
            isCustomPrepaid,
            basePrepaidTotal100,
            refundDifference,
            isRefund,
            spouseDeduction,
            gymPtRecognized,
            totalCultureRecognizedManwon,
            effectiveTaxRate: salaryWon > 0 ? ((finalTotalTax / salaryWon) * 100).toFixed(2) : '0.00'
        };
    }, [
        salaryManwon, dependents, spouseType, marriageCreditOption, cultureBooks, gymGeneral, gymPtLesson,
        numChildren, seniorCount, disabledCount, isFemaleHead, isSingleParent,
        customNationalPension, withholdingRatio, customPrepaidTax,
        creditCard, debitCard, cashReceipt, cultureCredit, cultureDebit, cultureCash, market, transit,
        housingSavings, medicalInfertility, medicalPremature, medicalSenior, medicalGeneral,
        politicalDonation, hometownUnder10, hometown10to20, hometownSpecialOver20, hometownGeneralOver20,
        specialDonation, employeeStockDonation, nonReligiousDonation, religiousDonation,
        pensionSavings, irp, isaPensionTransfer, insuranceExpenses, disabledInsuranceExpenses, educationExpenses, rentExpenses,
        housingLeaseRepay, mortgageInterest, mortgageType,
        yellowUmbrella, oldPersonalPension, ventureInvestment, youthFund, nationalGrowthFund,
        employeeStockContribution, jobRetentionWageLoss,
        smeReductionType, customSmeReduction, child9PlusCount, birthFirstCount, birthSecondCount, birthThirdPlusCount,
        isNewlywed2024to2026
    ]);

    return (
        <div className="space-y-6">
            {/* 상단 컨트롤 배너 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-500/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500 text-white tracking-wider">
                                2026년 개정 세법 산출과정 적용
                            </span>
                            <span className="text-xs text-indigo-200">연말정산 모의 시뮬레이터</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black mt-1 flex items-center gap-2">
                            <span>🧾</span> 13월의 월급 정밀 미리보기 & 절세 진단
                        </h2>
                        <p className="text-xs text-slate-300 mt-1">
                            2026년 홈택스 기준(신용카드 자녀 추가한도 α, 인적공제 추가공제, 의료비 순차충당, 종교/고향사랑 기부금)을 반영한 정밀 세액 계산기입니다.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* 2026 공제항목 도움말 버튼 */}
                        <button
                            onClick={() => setIsHelpModalOpen(true)}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md flex items-center gap-1.5 cursor-pointer border border-indigo-400/40"
                            title="2026년 귀속 공제항목별 국세청 기준 도움말 및 팁을 확인합니다."
                        >
                            <span>📖</span>
                            <span>2026 공제항목 도움말</span>
                        </button>

                        {lastSavedTime && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-300">
                                <span className={saveStatus === 'saved' ? 'text-emerald-400' : 'text-amber-400'}>●</span>
                                <span className="text-slate-400">저장됨:</span>
                                <span className="font-mono font-bold text-white">{lastSavedTime}</span>
                            </div>
                        )}
                        <button
                            onClick={handleSaveSettings}
                            disabled={saveStatus === 'saving'}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition-all shadow-md flex items-center gap-1.5 cursor-pointer border border-emerald-400/40"
                            title="현재 입력한 시뮬레이션 설정을 클라우드(user_additional_data) 및 로컬에 저장합니다."
                        >
                            <span>{saveStatus === 'saving' ? '⏳' : '💾'}</span>
                            <span>{saveStatus === 'saving' ? '저장 중...' : '설정 저장'}</span>
                        </button>
                    </div>
                </div>

                {/* 간편 프리셋 버튼 바 */}
                <div className="mt-4 pt-4 border-t border-slate-700/60 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-bold mr-1">간편 프리셋:</span>
                    {PRESETS.map((p, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleApplyPreset(p)}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-indigo-900/60 text-slate-200 hover:text-white border border-slate-700 transition-all cursor-pointer"
                        >
                            {p.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* 환급예상액 & 2026 연말정산 6단계 세부계산서 통합 대시보드 */}
            <div className={`p-5 sm:p-6 rounded-2xl border transition-all duration-300 space-y-4 ${
                taxCalculation.isRefund
                    ? 'bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-rose-500/10 dark:bg-rose-950/20 border-rose-500/30'
            }`}>
                {/* 상단 메인 환급 요약 헤더 */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl">{taxCalculation.isRefund ? '🎉' : '⚠️'}</span>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                2026 연말정산 최종 예상 결과
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                                실효세율 {taxCalculation.effectiveTaxRate}%
                            </span>
                        </div>
                        <div className="text-2xl sm:text-4xl font-black mt-1.5 flex items-baseline gap-2 font-mono">
                            <span className={taxCalculation.isRefund ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                                {taxCalculation.isRefund ? '환급 예상액: +' : '추가 납부액: -'}{formatKRW(Math.abs(taxCalculation.refundDifference))}
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                            {taxCalculation.isRefund 
                                ? `기납부세액(${formatKRW(taxCalculation.prepaidTotalTax)})이 결정세액(${formatKRW(taxCalculation.finalTotalTax)})보다 많아 ${formatKRW(Math.abs(taxCalculation.refundDifference))}을 통장으로 돌려받습니다!`
                                : `기납부세액(${formatKRW(taxCalculation.prepaidTotalTax)})보다 결정세액(${formatKRW(taxCalculation.finalTotalTax)})이 커 ${formatKRW(Math.abs(taxCalculation.refundDifference))}을 추가 납부해야 합니다.`}
                        </p>
                        {!taxCalculation.isRefund && Math.abs(taxCalculation.refundDifference) > 100000 && (
                            <div className="mt-2 p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
                                <span className="text-sm">💡</span>
                                <div>
                                    <span className="font-bold">3개월 분납 가능:</span> 추가 납부세액이 10만원을 초과하여 2월~4월(3개월) 급여 분할 납부(월 약 {formatKRW(Math.round(Math.abs(taxCalculation.refundDifference) / 3))})가 가능합니다.
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 주요 4대 지표 요약 박스 & 모달 바로가기 */}
                    <div className="flex flex-col gap-2">
                        <div className="grid grid-cols-4 gap-2 bg-white/85 dark:bg-slate-850/90 backdrop-blur-md p-3 rounded-2xl border border-slate-200 dark:border-slate-750 text-center">
                            <div>
                                <div className="text-[10px] font-bold text-slate-400">과세표준</div>
                                <div className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 mt-0.5">
                                    {formatKRW(taxCalculation.taxableIncome)}
                                </div>
                            </div>
                            <div className="border-l border-slate-200 dark:border-slate-700 pl-2">
                                <div className="text-[10px] font-bold text-slate-400">산출세액</div>
                                <div className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 mt-0.5">
                                    {formatKRW(taxCalculation.calculatedTax)}
                                </div>
                            </div>
                            <div className="border-l border-slate-200 dark:border-slate-700 pl-2">
                                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">세액공제</div>
                                <div className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                                    -{formatKRW(taxCalculation.totalTaxCredit)}
                                </div>
                            </div>
                            <div className="border-l border-slate-200 dark:border-slate-700 pl-2">
                                <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">최종 결정세액</div>
                                <div className="text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                                    {formatKRW(taxCalculation.finalTotalTax)}
                                </div>
                            </div>
                        </div>

                        {/* 산출과정 통합 모달 & 데이터 옮기기 버튼 바 */}
                        <div className="flex flex-wrap items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setCalculationModalTab('card');
                                    setIsCalculationModalOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-white/90 dark:bg-slate-800/90 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/70 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                            >
                                <span>🔍</span> 산출과정 상세 (카드·의료·기부)
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsDataTransferModalOpen(true)}
                                className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                            >
                                <span>💾</span> 데이터 옮기기
                            </button>
                        </div>
                    </div>
                </div>

                {/* 환급 패널 내부에 녹아든 6단계 세부 계산서 표 */}
                <div className="pt-3 border-t border-slate-200/70 dark:border-slate-700/60 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                <span>📊</span> 2026 연말정산 6단계 실시간 세부 계산서
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50">
                                실효세율 {taxCalculation.effectiveTaxRate}%
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                종합한도(2,500만) {Math.min(100, Math.round((taxCalculation.cappedTargetDeductions / 25000000) * 100))}%
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {taxCalculation.isStandardCreditAdvantageous ? '표준세액공제(13만) 유리' : '항목별 공제 유리'}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsBreakdownExpanded(!isBreakdownExpanded)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 transition-all cursor-pointer shadow-xs"
                        >
                            {isBreakdownExpanded ? '▲ 계산서 접기' : '▼ 6단계 세부 계산서 펼치기'}
                        </button>
                    </div>

                    {isBreakdownExpanded && (
                        <div className="overflow-x-auto border border-slate-200/80 dark:border-slate-700/80 rounded-xl bg-white/90 dark:bg-slate-850/90 backdrop-blur-sm shadow-xs animate-in fade-in duration-200">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-100/90 dark:bg-slate-800/90 font-bold text-slate-700 dark:text-slate-300">
                                    <tr>
                                        <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-750 w-28 sm:w-36">계산 단계</th>
                                        <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-750 text-right w-32 sm:w-40">금액</th>
                                        <th className="py-2 px-3">세법 산출 공식 및 세부 내역</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                    <tr>
                                        <td className="py-1.5 px-3 font-bold border-r border-slate-200 dark:border-slate-750">① 총급여액</td>
                                        <td className="py-1.5 px-3 font-mono font-bold text-right border-r border-slate-200 dark:border-slate-750">{formatKRW(taxCalculation.salaryWon)}</td>
                                        <td className="py-1.5 px-3 text-[11px] text-slate-500">비과세 근로소득 제외 (연간 급여 총액)</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1.5 px-3 font-bold border-r border-slate-200 dark:border-slate-750">② 근로소득금액</td>
                                        <td className="py-1.5 px-3 font-mono text-right border-r border-slate-200 dark:border-slate-750">{formatKRW(taxCalculation.earnedIncomeAmount)}</td>
                                        <td className="py-1.5 px-3 text-[11px] text-slate-500">총급여액 − 근로소득공제({formatKRW(taxCalculation.earnedIncomeDeduction)})</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1.5 px-3 font-bold border-r border-slate-200 dark:border-slate-750">③ 종합소득공제</td>
                                        <td className="py-1.5 px-3 font-mono font-bold text-right border-r border-slate-200 dark:border-slate-750 text-indigo-600 dark:text-indigo-400">-{formatKRW(taxCalculation.totalIncomeDeductions)}</td>
                                        <td className="py-1.5 px-3 text-[11px] text-slate-500">
                                            인적({formatKRW(taxCalculation.personalDeduction)}) + 사회보험({formatKRW(taxCalculation.socialInsuranceDeduction)}) + 주택({formatKRW(taxCalculation.totalHousingDeduction)}) + 카드({formatKRW(taxCalculation.cardDeduction)}) + 기타({formatKRW(taxCalculation.otherIncomeDeductions)})
                                            {taxCalculation.excessOf25m > 0 && (
                                                <span className="text-rose-600 font-bold ml-1">
                                                    (조특법 2,500만원 종합한도 초과분 {formatKRW(taxCalculation.excessOf25m)} 배제)
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                    <tr className="bg-indigo-50/40 dark:bg-indigo-950/20 font-semibold">
                                        <td className="py-1.5 px-3 font-bold border-r border-slate-200 dark:border-slate-750">④ 과세표준</td>
                                        <td className="py-1.5 px-3 font-mono font-bold text-right border-r border-slate-200 dark:border-slate-750 text-indigo-700 dark:text-indigo-300">{formatKRW(taxCalculation.taxableIncome)}</td>
                                        <td className="py-1.5 px-3 text-[11px] text-slate-600 dark:text-slate-400">
                                            근로소득금액 − 종합소득공제 {taxCalculation.excessOf25m > 0 ? '+ 종합한도 초과액' : ''}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-1.5 px-3 font-bold border-r border-slate-200 dark:border-slate-750">⑤ 산출세액</td>
                                        <td className="py-1.5 px-3 font-mono font-bold text-right border-r border-slate-200 dark:border-slate-750">{formatKRW(taxCalculation.calculatedTax)}</td>
                                        <td className="py-1.5 px-3 text-[11px] text-slate-500">2026 8단계 기본 누진세율 적용</td>
                                    </tr>
                                    {taxCalculation.smeReductionWon > 0 && (
                                        <tr className="bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300">
                                            <td className="py-1.5 px-3 font-bold border-r border-slate-200 dark:border-slate-750">
                                                ⑤-1 세액감면
                                            </td>
                                            <td className="py-1.5 px-3 font-mono font-bold text-right border-r border-slate-200 dark:border-slate-750">
                                                -{formatKRW(taxCalculation.smeReductionWon)}
                                            </td>
                                            <td className="py-1.5 px-3 text-[10px]">
                                                중소기업 취업자 감면(한도 200만) 등 (잔여세액: {formatKRW(taxCalculation.taxAfterReduction)})
                                            </td>
                                        </tr>
                                    )}
                                    <tr>
                                        <td className="py-1.5 px-3 font-bold border-r border-slate-200 dark:border-slate-750">⑥ 세액공제 합계</td>
                                        <td className="py-1.5 px-3 font-mono font-bold text-right border-r border-slate-200 dark:border-slate-750 text-emerald-600 dark:text-emerald-400">-{formatKRW(taxCalculation.totalTaxCredit)}</td>
                                        <td className="py-1.5 px-3 text-[11px] text-slate-500">
                                            근로({formatKRW(taxCalculation.earnedIncomeCredit)}) + 자녀({formatKRW(taxCalculation.totalChildCredit)}){taxCalculation.marriageCredit > 0 ? ` + 혼인(${formatKRW(taxCalculation.marriageCredit)})` : ''} + 연금/ISA({formatKRW(taxCalculation.totalPensionCredit)}) + 보험({formatKRW(taxCalculation.insuranceCredit)}) + 의료({formatKRW(taxCalculation.medicalCredit)}) + 교육({formatKRW(taxCalculation.educationCredit)}) + 기부({formatKRW(taxCalculation.donationCredit)}){taxCalculation.rentCredit > 0 ? ` + 월세(${formatKRW(taxCalculation.rentCredit)})` : ''}
                                        </td>
                                    </tr>
                                    <tr className="bg-slate-100/70 dark:bg-slate-800/60 font-black">
                                        <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-750">⑦ 최종 결정세액</td>
                                        <td className="py-2 px-3 font-mono text-right text-xs text-indigo-600 dark:text-indigo-400 border-r border-slate-200 dark:border-slate-750">{formatKRW(taxCalculation.finalTotalTax)}</td>
                                        <td className="py-2 px-3 text-[10px] text-slate-500">소득세 {formatKRW(taxCalculation.finalIncomeTax)} + 지방소득세 10% {formatKRW(taxCalculation.finalLocalTax)}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1.5 px-3 font-bold border-r border-slate-200 dark:border-slate-750">⑧ 기납부세액</td>
                                        <td className="py-1.5 px-3 font-mono text-right border-r border-slate-200 dark:border-slate-750">{formatKRW(taxCalculation.prepaidTotalTax)}</td>
                                        <td className="py-1.5 px-3 text-[10px] text-slate-500">매월 원천징수한 세금 합계</td>
                                    </tr>
                                    <tr className={`font-black text-sm ${
                                        taxCalculation.isRefund
                                            ? 'bg-emerald-500/15 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                                            : 'bg-rose-500/15 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                                    }`}>
                                        <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-750">
                                            {taxCalculation.isRefund ? '⑨ 예상 환급액 (+)' : '⑨ 추가 납부세액 (-)'}
                                        </td>
                                        <td className="py-2 px-3 font-mono text-right border-r border-slate-200 dark:border-slate-750 font-black">
                                            {taxCalculation.isRefund ? '+' : '-'}{formatKRW(Math.abs(taxCalculation.refundDifference))}
                                        </td>
                                        <td className="py-2 px-3 text-xs font-semibold">
                                            {taxCalculation.isRefund ? '통장으로 환급 입금' : '2월 급여에서 차감 납부'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* 메인 3열 소득·공제 입력 대시보드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                {/* 1열: 총급여/인적공제 + 신용카드/체육시설 */}
                <div className="space-y-6">
                    {/* 카드 1: 근로소득 및 급여 세액감면 */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">💼</span>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">총급여 및 급여 세액감면</h3>
                                    <p className="text-[10px] text-slate-400">총급여·공적연금·원천징수세액·중소기업감면</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsBonusHelperOpen(!isBonusHelperOpen)}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 hover:bg-indigo-100 transition-all cursor-pointer"
                            >
                                {isBonusHelperOpen ? '▲ 접기' : '➕ 상여금 계산기'}
                            </button>
                        </div>

                        {/* 상여금 계산 도우미 드롭다운 */}
                        {isBonusHelperOpen && (
                            <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-2.5 animate-in fade-in duration-200 text-xs">
                                <span className="font-bold text-indigo-950 dark:text-indigo-200 block">
                                    🧮 상여금·비과세 합산 총급여 계산기
                                </span>
                                <div className="space-y-1.5">
                                    <div>
                                        <label className="text-[11px] text-slate-600 dark:text-slate-300">월 세전 기본급 (원)</label>
                                        <input
                                            type="number"
                                            placeholder="예: 4000000"
                                            value={monthlyBaseWon}
                                            onChange={(e) => setMonthlyBaseWon(e.target.value)}
                                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] text-slate-600 dark:text-slate-300">연간 상여금·성과급 (원)</label>
                                        <input
                                            type="number"
                                            placeholder="예: 10500000"
                                            value={bonusAnnualWon}
                                            onChange={(e) => setBonusAnnualWon(e.target.value)}
                                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] text-slate-600 dark:text-slate-300">연간 비과세 수당 (식대 등 연 240만 기본)</label>
                                        <input
                                            type="number"
                                            value={nonTaxableAnnualWon}
                                            onChange={(e) => setNonTaxableAnnualWon(e.target.value)}
                                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleApplySalaryCalculation}
                                    className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all cursor-pointer"
                                >
                                    합산 총급여 적용하기
                                </button>
                            </div>
                        )}

                        {/* 연간 총급여 */}
                        <div>
                            <div className="flex justify-between items-center mb-1 text-xs">
                                <span
                                    className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-help"
                                    title="식대(월 20만원 한도 등) 및 자녀보육수당 등 비과세 소득을 제외한 세전 과세대상 급여 총액을 입력해야 합니다. (근로소득원천징수영수증 21번 총급여액 기준)"
                                >
                                    연간 총급여 <span className="text-indigo-600 dark:text-indigo-400 font-bold">ⓘ</span>
                                </span>
                                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{formatManwon(salaryManwon)}</span>
                            </div>
                            <div className="flex items-center gap-1.5" title="식비 등 비과세 제외 세전금액을 입력하세요">
                                <input
                                    type="number"
                                    min={0}
                                    value={salaryManwon}
                                    onChange={(e) => setSalaryManwon(Number(e.target.value))}
                                    placeholder="비과세 제외 세전금액 (만원)"
                                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold font-mono"
                                />
                                <span className="text-xs text-slate-400 flex-shrink-0">만원</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                                💡 식비 등 비과세 수당을 차감한 <strong>세전 과세대상 급여 총액</strong>을 입력하세요.
                            </p>
                        </div>

                        {/* 공적연금보험료 소득공제 */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-center mb-1 text-xs">
                                <span
                                    className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-help"
                                    title="국민연금, 공무원연금 등 법정 공적연금 본인부담금은 납입액 전액이 소득공제됩니다."
                                >
                                    공적연금(국민연금 등) 본인부담금 <span className="text-slate-400 text-[10px]">ⓘ</span>
                                </span>
                                <span className="text-[10px] text-slate-400">전액 소득공제</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <input
                                    type="number"
                                    placeholder={`자동 추정치: ${Math.round(taxCalculation.pensionInsuranceDeduction / 10000)}`}
                                    value={customNationalPension}
                                    onChange={(e) => setCustomNationalPension(e.target.value)}
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                                />
                                <span className="text-xs text-slate-400 flex-shrink-0">만원</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">공란 시 총급여 4.5%를 국민연금 본인부담금으로 자동 추정 반영</p>
                        </div>

                        {/* 원천징수율 및 기납부세액 직접 입력 */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-center mb-1 text-xs">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">매월 원천징수율</span>
                                <span className="font-mono font-bold text-slate-900 dark:text-white">
                                    {taxCalculation.effectiveWithholdingRatio}% {taxCalculation.isCustomPrepaid ? '(직접입력 환산)' : ''}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5">
                                {[80, 100, 120].map(r => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => { setWithholdingRatio(r); setCustomPrepaidTax(''); }}
                                        className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                            withholdingRatio === r && !taxCalculation.isCustomPrepaid
                                                ? 'bg-indigo-600 text-white shadow-xs'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                        }`}
                                    >
                                        {r}% {r === 100 ? '(표준)' : ''}
                                    </button>
                                ))}
                            </div>

                            {/* 기납부세액 직접 입력란 */}
                            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                                        기납부세액 직접 입력 (소수점 지원)
                                    </span>
                                    {taxCalculation.isCustomPrepaid && (
                                        <button
                                            type="button"
                                            onClick={() => setCustomPrepaidTax('')}
                                            className="text-[10px] text-slate-400 hover:text-rose-500 underline cursor-pointer"
                                        >
                                            비율 선택으로 복귀
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <input
                                        type="number"
                                        step="any"
                                        min={0}
                                        placeholder="직접 입력 (만원 단위, 소수점 가능)"
                                        value={customPrepaidTax || ''}
                                        onChange={(e) => setCustomPrepaidTax(e.target.value)}
                                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                                    />
                                    <span className="text-xs text-slate-400 flex-shrink-0">만원</span>
                                </div>
                                <p className="text-[10px] text-slate-400 leading-tight">
                                    급여명세서/원천징수영수증의 연간 납부세액(소득세+지방소득세) 입력 시 간이세액 100% 기준 대비 실 원천징수율(%)이 우상단에 자동 계산됩니다.
                                </p>
                            </div>
                        </div>

                        {/* 중소기업 취업자 소득세 감면 */}
                        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label
                                    className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-help"
                                    title="조세특례제한법 제30조: 중소기업 취업 청년(90%, 연 200만 한도), 60세이상/장애인/경력단절(70%, 연 200만 한도) 소득세 감면"
                                >
                                    <span>🏢</span> 중소기업 취업자 소득세 감면 <span className="text-slate-400 text-[10px]">ⓘ</span>
                                </label>
                                <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                                    {formatKRW(taxCalculation.smeReductionWon)}
                                </span>
                            </div>
                            <select
                                value={smeReductionType}
                                onChange={(e) => setSmeReductionType(e.target.value)}
                                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
                            >
                                <option value="none">감면 없음 (일반)</option>
                                <option value="youth_90">청년 (만15~34세, 5년간 90% 감면, 한도 200만)</option>
                                <option value="general_70">60세이상/장애인/경력단절 (3년간 70% 감면, 한도 200만)</option>
                                <option value="custom">기타 감면세액 직접 입력 (성과공유/외국인 등)</option>
                            </select>
                            {smeReductionType === 'custom' && (
                                <div className="flex items-center gap-1.5 pt-1">
                                    <input
                                        type="number"
                                        min={0}
                                        value={customSmeReduction}
                                        onChange={(e) => setCustomSmeReduction(e.target.value)}
                                        placeholder="직접 입력 (만원)"
                                        className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                                    />
                                    <span className="text-[11px] text-slate-400 flex-shrink-0">만원</span>
                                </div>
                            )}
                            <p className="text-[9px] text-slate-400 leading-tight">
                                조특법 제30조: 감면 적용 시 근로소득세액공제는 (1 - 감면세액 ÷ 산출세액) 비율로 비례 축소됩니다.
                            </p>
                        </div>
                    </div>

                    {/* 카드 2: 인적공제 및 가족공제 */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">👨‍👩‍👧‍👦</span>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">인적공제 및 가족공제</h3>
                                    <p className="text-[10px] text-slate-400">기본공제(1인 150만)·배우자·자녀·추가공제·혼인</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50">
                                인적공제 {formatManwon(taxCalculation.personalDeduction / 10000)}
                            </span>
                        </div>

                        {/* 전체 부양가족 수 (기본공제 대상 인원) */}
                        <div>
                            <div className="flex justify-between items-center mb-1 text-xs">
                                <span
                                    className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-help"
                                    title="본인 및 연간 소득금액 100만원 이하인 배우자·부양가족(직계존속 만60세 이상, 직계비속 만20세 이하) 1인당 연 150만원 소득공제"
                                >
                                    기본공제 대상 인원 (본인 포함) <span className="text-slate-400 text-[10px]">ⓘ</span>
                                </span>
                                <span className="font-mono font-bold text-slate-900 dark:text-white">{dependents}명</span>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5">
                                {[1, 2, 3, 4].map(n => (
                                    <button
                                        key={n}
                                        type="button"
                                        onClick={() => setDependents(n)}
                                        className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                            dependents === n
                                                ? 'bg-indigo-600 text-white shadow-xs'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                        }`}
                                    >
                                        {n}인 {n === 1 ? '(단독)' : ''}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">1인당 연 150만원 기본 소득공제</p>
                        </div>

                        {/* 배우자 유무 및 맞벌이/외벌이 상태 선택 */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">배우자 상태</span>
                                {spouseType === 'single_earner' && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                        기본공제 +150만원 자동합산
                                    </span>
                                )}
                                {spouseType === 'dual_earner' && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                        맞벌이 (각자 정산)
                                    </span>
                                )}
                            </div>
                            <div className="grid grid-cols-3 gap-1.5 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setSpouseType('none')}
                                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        spouseType === 'none'
                                            ? 'bg-indigo-600 text-white shadow-xs'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                    }`}
                                >
                                    미혼/없음
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSpouseType('single_earner')}
                                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        spouseType === 'single_earner'
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                    }`}
                                >
                                    외벌이(+150만)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSpouseType('dual_earner')}
                                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        spouseType === 'dual_earner'
                                            ? 'bg-indigo-600 text-white shadow-xs'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                    }`}
                                >
                                    맞벌이(근로자)
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-tight">
                                {spouseType === 'single_earner'
                                    ? '연간 소득금액 100만원 이하인 배우자는 인적 기본공제(+150만원)가 자동 합산됩니다.'
                                    : spouseType === 'dual_earner'
                                        ? '맞벌이는 각자 연말정산을 하며, 아래 혼인세액공제 시 부부 합산(100만) 모의계산이 가능합니다.'
                                        : '배우자 기본공제가 적용되지 않습니다.'}
                            </p>
                        </div>

                        {/* 기본공제 대상 직계비속(자녀) 수 */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-center mb-1 text-xs">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">기본공제 직계비속(자녀) 수</span>
                                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{numChildren}명</span>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5">
                                {[0, 1, 2, 3].map(n => (
                                    <button
                                        key={n}
                                        type="button"
                                        onClick={() => {
                                            setNumChildren(n);
                                            if (child9PlusCount > n) setChild9PlusCount(n);
                                        }}
                                        className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                            numChildren === n
                                                ? 'bg-indigo-600 text-white shadow-xs'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                        }`}
                                    >
                                        {n}명 {n === 0 ? '(없음)' : ''}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-1">
                                '26.1.1부터 신용카드 한도 자녀 1인당 50만원(최대 100만) 추가 상향
                            </p>
                        </div>

                        {/* 2026 자녀세액공제 (만 9세 이상 및 당해 출생·입양) */}
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-750 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-indigo-950 dark:text-indigo-300 flex items-center gap-1">
                                    <span>👶</span> 자녀세액공제
                                </span>
                                <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                    {formatKRW(taxCalculation.totalChildCredit)}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <label
                                        className="text-[10px] text-slate-500 flex items-center gap-1 cursor-help"
                                        title="2026년 기준 9세 이상 자녀 세액공제: 1명 25만원, 2명 55만원, 3명 이상은 55만원 + 2명 초과 1인당 40만원(3명 95만, 4명 135만...)"
                                    >
                                        9세 이상 자녀 <span className="text-indigo-500">ⓘ</span>
                                    </label>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <input
                                            type="number"
                                            min={0}
                                            max={numChildren}
                                            disabled={numChildren === 0}
                                            value={child9PlusCount}
                                            onChange={(e) => {
                                                const val = Math.max(0, Math.min(Number(e.target.value), numChildren));
                                                setChild9PlusCount(val);
                                            }}
                                            className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 font-mono text-xs disabled:opacity-40"
                                        />
                                        <span className="text-[11px] text-slate-400">명</span>
                                    </div>
                                    {numChildren === 0 && (
                                        <span className="text-[9px] text-slate-400">자녀 수 설정 필요</span>
                                    )}
                                </div>
                                <div>
                                    <label
                                        className="text-[10px] text-slate-500 flex items-center gap-1 cursor-help"
                                        title="해당 과세연도 첫째 출생·입양 시 30만원 세액공제"
                                    >
                                        당해 첫째 출생·입양 <span className="text-indigo-500">ⓘ</span>
                                    </label>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <input
                                            type="number"
                                            min={0}
                                            max={1}
                                            value={birthFirstCount}
                                            onChange={(e) => setBirthFirstCount(Math.max(0, Math.min(Number(e.target.value), 1)))}
                                            className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 font-mono text-xs"
                                        />
                                        <span className="text-[11px] text-slate-400">명</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <label
                                        className="text-[10px] text-slate-500 flex items-center gap-1 cursor-help"
                                        title="해당 과세연도 둘째 출생·입양 시 50만원 세액공제"
                                    >
                                        당해 둘째 출생·입양 <span className="text-indigo-500">ⓘ</span>
                                    </label>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <input
                                            type="number"
                                            min={0}
                                            max={1}
                                            value={birthSecondCount}
                                            onChange={(e) => setBirthSecondCount(Math.max(0, Math.min(Number(e.target.value), 1)))}
                                            className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 font-mono text-xs"
                                        />
                                        <span className="text-[11px] text-slate-400">명</span>
                                    </div>
                                </div>
                                <div>
                                    <label
                                        className="text-[10px] text-slate-500 flex items-center gap-1 cursor-help"
                                        title="해당 과세연도 셋째 이상 출생·입양 시 1인당 70만원 세액공제"
                                    >
                                        셋째 이상 출생·입양 <span className="text-indigo-500">ⓘ</span>
                                    </label>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <input
                                            type="number"
                                            min={0}
                                            max={10}
                                            value={birthThirdPlusCount}
                                            onChange={(e) => setBirthThirdPlusCount(Math.max(0, Math.min(Number(e.target.value), 10)))}
                                            className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 font-mono text-xs"
                                        />
                                        <span className="text-[11px] text-slate-400">명</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 인적공제 추가공제 상세 옵션 */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                                ➕ 인적공제 추가공제 항목
                            </span>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <label
                                        className="text-[10px] text-slate-500 flex items-center gap-1 cursor-help"
                                        title="만 70세 이상 기본공제대상자 1인당 연 100만원 추가 소득공제 (1956.12.31 이전 출생자)"
                                    >
                                        경로우대 <span className="text-indigo-500">ⓘ</span>
                                    </label>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <input
                                            type="number"
                                            min={0}
                                            value={seniorCount}
                                            onChange={(e) => setSeniorCount(Number(e.target.value))}
                                            className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                                        />
                                        <span className="text-[11px] text-slate-400">명</span>
                                    </div>
                                </div>
                                <div>
                                    <label
                                        className="text-[10px] text-slate-500 flex items-center gap-1 cursor-help"
                                        title="기본공제대상자 중 장애인 1인당 연 200만원 추가 소득공제 (나이제한 없음, 암/중증환자 포함)"
                                    >
                                        장애인 <span className="text-indigo-500">ⓘ</span>
                                    </label>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <input
                                            type="number"
                                            min={0}
                                            value={disabledCount}
                                            onChange={(e) => setDisabledCount(Number(e.target.value))}
                                            className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                                        />
                                        <span className="text-[11px] text-slate-400">명</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs pt-1">
                                <label
                                    className="flex items-center gap-1.5 cursor-pointer"
                                    title="배우자가 없는 자로서 기본공제대상 직계비속·입양자가 있는 경우 연 100만원 추가공제 (부녀자공제와 중복 불가)"
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSingleParent}
                                        onChange={(e) => {
                                            setIsSingleParent(e.target.checked);
                                            if (e.target.checked) setIsFemaleHead(false);
                                        }}
                                        className="rounded accent-indigo-600 cursor-pointer"
                                    />
                                    <span className="text-[11px] text-slate-700 dark:text-slate-300">한부모</span>
                                </label>
                                <label
                                    className="flex items-center gap-1.5 cursor-pointer"
                                    title="근로소득금액 3,000만원 이하 여성 근로자로서 배우자가 있거나 부양가족이 있는 세대주인 경우 연 50만원 추가공제"
                                >
                                    <input
                                        type="checkbox"
                                        checked={isFemaleHead}
                                        disabled={isSingleParent}
                                        onChange={(e) => setIsFemaleHead(e.target.checked)}
                                        className="rounded accent-indigo-600 cursor-pointer disabled:opacity-40"
                                    />
                                    <span className="text-[11px] text-slate-700 dark:text-slate-300">부녀자</span>
                                </label>
                            </div>
                        </div>

                        {/* 혼인세액공제 */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                            <label className="flex items-center justify-between p-2.5 rounded-xl bg-pink-50/70 dark:bg-pink-950/30 border border-pink-200/50 dark:border-pink-900/40 cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={isNewlywed2024to2026}
                                        onChange={(e) => setIsNewlywed2024to2026(e.target.checked)}
                                        className="rounded accent-pink-600 cursor-pointer"
                                    />
                                    <div>
                                        <span className="text-xs font-bold text-pink-950 dark:text-pink-200 block">
                                            💍 혼인세액공제
                                        </span>
                                        <span className="text-[10px] text-pink-700 dark:text-pink-300">
                                            '24~'26년 혼인신고 거주자 생애 1회 (1인 50만원 / 맞벌이 100만)
                                        </span>
                                    </div>
                                </div>
                                <span className="font-mono font-bold text-xs text-pink-600 dark:text-pink-400">
                                    {isNewlywed2024to2026
                                        ? (spouseType === 'dual_earner' && marriageCreditOption === 'couple' ? '100만원' : '50만원')
                                        : '0원'}
                                </span>
                            </label>

                            {/* 맞벌이인 경우 부부 합산 선택 옵션 */}
                            {isNewlywed2024to2026 && spouseType === 'dual_earner' && (
                                <div className="p-2.5 rounded-xl bg-pink-50/40 dark:bg-pink-950/20 border border-pink-200/40 space-y-1.5 text-xs">
                                    <span className="text-[11px] font-bold text-pink-900 dark:text-pink-200 block">
                                        맞벌이 혼인세액공제 신청 방식 선택
                                    </span>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setMarriageCreditOption('individual')}
                                            className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                                                marriageCreditOption === 'individual'
                                                    ? 'bg-pink-100 dark:bg-pink-900/50 border-pink-400 font-bold text-pink-950 dark:text-pink-100'
                                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-400'
                                            }`}
                                        >
                                            <span className="block text-[11px]">개인 1인 (50만)</span>
                                            <span className="text-[9px] opacity-75">본인 기본 신청분</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setMarriageCreditOption('couple')}
                                            className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                                                marriageCreditOption === 'couple'
                                                    ? 'bg-pink-100 dark:bg-pink-900/50 border-pink-400 font-bold text-pink-950 dark:text-pink-100'
                                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-400'
                                            }`}
                                        >
                                            <span className="block text-[11px]">부부 합산 (100만)</span>
                                            <span className="text-[9px] opacity-75">본인 50만 + 배우자 50만</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2열: 신용카드 등 소득공제 + 의료비 & 기부금 세액공제 */}
                <div className="space-y-6">
                    {/* 카드 3: 신용카드 등 소득공제 */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">💳</span>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">신용카드 등 소득공제</h3>
                                    <p className="text-[10px] text-slate-400">2026년 정밀 산출과정 반영</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setCalculationModalTab('card');
                                    setIsCalculationModalOpen(true);
                                }}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 hover:bg-indigo-100 transition-all cursor-pointer flex items-center gap-1"
                            >
                                <span>🔍</span> 산출과정 표
                            </button>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
                            <span>최저사용 문턱 (25%):</span>
                            <span className="font-bold text-slate-900 dark:text-white font-mono">{formatManwon(taxCalculation.cardCalc.minThreshold / 10000)}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 text-xs">
                            <div>
                                <label
                                    className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1 cursor-help"
                                    title="신용카드 결제액 (소득공제율 15%)"
                                >
                                    신용카드 <span className="text-slate-400 text-[10px]">ⓘ</span>
                                </label>
                                <div className="flex items-center gap-1 mt-1">
                                    <input
                                        type="number"
                                        min={0}
                                        value={creditCard}
                                        onChange={(e) => setCreditCard(Number(e.target.value))}
                                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                                    />
                                    <span className="text-[11px] text-slate-400">만</span>
                                </div>
                            </div>

                            <div>
                                <label
                                    className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1 cursor-help"
                                    title="직불·체크카드 결제액 (소득공제율 30%)"
                                >
                                    체크카드 <span className="text-slate-400 text-[10px]">ⓘ</span>
                                </label>
                                <div className="flex items-center gap-1 mt-1">
                                    <input
                                        type="number"
                                        min={0}
                                        value={debitCard}
                                        onChange={(e) => setDebitCard(Number(e.target.value))}
                                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                                    />
                                    <span className="text-[11px] text-slate-400">만</span>
                                </div>
                            </div>

                            <div>
                                <label
                                    className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1 cursor-help"
                                    title="현금영수증 발급액 (소득공제율 30%)"
                                >
                                    현금영수증 <span className="text-slate-400 text-[10px]">ⓘ</span>
                                </label>
                                <div className="flex items-center gap-1 mt-1">
                                    <input
                                        type="number"
                                        min={0}
                                        value={cashReceipt}
                                        onChange={(e) => setCashReceipt(Number(e.target.value))}
                                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                                    />
                                    <span className="text-[11px] text-slate-400">만</span>
                                </div>
                            </div>

                            {/* 문화·체육시설 이용료 세분화 (도서공연 + 헬스/수영장 시설이용료 100% + PT/강습료 50% 자동인정) */}
                            <div className="col-span-2 p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span
                                        className="text-[11px] font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1 cursor-help"
                                        title="총급여 7,000만원 이하 대상: 도서·공연·영화 및 체육시설 이용료 소득공제율 30%"
                                    >
                                        <span>🏋️</span> 도서·공연·체육시설 <span className="text-indigo-500 text-[10px]">ⓘ</span>
                                    </span>
                                    <div className="flex items-center gap-1 text-[11px]">
                                        <span className="text-slate-500 text-[10px]">인정 합계:</span>
                                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800 text-xs">
                                            {formatManwon(taxCalculation.totalCultureRecognizedManwon || 0)}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                    <div>
                                        <label
                                            className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 block cursor-help"
                                            title="도서·공연·박물관·미술관·영화 관람료 결제액 전액(100%) 인정"
                                        >
                                            도서·공연·영화
                                        </label>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <input
                                                type="number"
                                                min={0}
                                                value={cultureBooks}
                                                onChange={(e) => setCultureBooks(Number(e.target.value))}
                                                className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 font-mono text-xs"
                                                placeholder="0"
                                            />
                                            <span className="text-[10px] text-slate-400">만</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 block cursor-help"
                                            title="체육시설(헬스장·수영장) 순수 시설이용료 전액(100%) 인정"
                                        >
                                            헬스장·수영장 이용료
                                        </label>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <input
                                                type="number"
                                                min={0}
                                                value={gymGeneral}
                                                onChange={(e) => setGymGeneral(Number(e.target.value))}
                                                className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 font-mono text-xs"
                                                placeholder="0"
                                            />
                                            <span className="text-[10px] text-slate-400">만</span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center">
                                            <label
                                                className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 block cursor-help"
                                                title="PT·수영 강습료 등 복합결제는 세법 규정상 50%만 인정"
                                            >
                                                PT·강습료
                                            </label>
                                            {taxCalculation.gymPtRecognized > 0 && (
                                                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                                                    +{taxCalculation.gymPtRecognized}만 인정
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <input
                                                type="number"
                                                min={0}
                                                value={gymPtLesson}
                                                onChange={(e) => setGymPtLesson(Number(e.target.value))}
                                                className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 font-mono text-xs"
                                                placeholder="0"
                                            />
                                            <span className="text-[10px] text-slate-400">만</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[9px] text-slate-400 leading-tight">
                                    💡 세법 규정: 강습비·PT 등 복합결제는 50%만 인정되므로, 입력하신 PT비의 50%가 자동 산출되어 공제 대상에 산입됩니다.
                                </p>
                            </div>

                            <div>
                                <label
                                    className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1 cursor-help"
                                    title="전통시장 사용분 (소득공제율 40%)"
                                >
                                    전통시장 <span className="text-slate-400 text-[10px]">ⓘ</span>
                                </label>
                                <div className="flex items-center gap-1 mt-1">
                                    <input
                                        type="number"
                                        min={0}
                                        value={market}
                                        onChange={(e) => setMarket(Number(e.target.value))}
                                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                                    />
                                    <span className="text-[11px] text-slate-400">만</span>
                                </div>
                            </div>

                            <div>
                                <label
                                    className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1 cursor-help"
                                    title="대중교통 이용분 (소득공제율 40%)"
                                >
                                    대중교통 <span className="text-slate-400 text-[10px]">ⓘ</span>
                                </label>
                                <div className="flex items-center gap-1 mt-1">
                                    <input
                                        type="number"
                                        min={0}
                                        value={transit}
                                        onChange={(e) => setTransit(Number(e.target.value))}
                                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                                    />
                                    <span className="text-[11px] text-slate-400">만</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-700 dark:text-slate-300">최종 카드 소득공제액:</span>
                            <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">
                                {formatKRW(taxCalculation.cardDeduction)}
                            </span>
                        </div>
                    </div>

                    {/* 카드 4: 2026 의료비 & 기부금 세액공제 항목 */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 shadow-xs space-y-4">
                        {/* 의료비 헤더 */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">🏥</span>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">의료비 세액공제</h3>
                                    <p className="text-[10px] text-slate-400">총급여 3% 초과분 15~30%</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setCalculationModalTab('medical');
                                    setIsCalculationModalOpen(true);
                                }}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 hover:bg-indigo-100 transition-all cursor-pointer flex items-center gap-1"
                            >
                                <span>🔍</span> 산출과정 표
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <label
                                    className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1 cursor-help"
                                    title="본인, 만 65세 이상, 장애인, 건강보험 산정특례자(중증질환·희귀난치성질환 등) 의료비: 한도 없이 전액 대상, 15% 공제"
                                >
                                    본인·65세·장애인·중증환자 <span className="text-slate-400 text-[10px]">ⓘ</span>
                                </label>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <input
                                        type="number"
                                        min={0}
                                        value={medicalSenior}
                                        onChange={(e) => setMedicalSenior(Number(e.target.value))}
                                        className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                                    />
                                    <span className="text-[11px] text-slate-400">만</span>
                                </div>
                            </div>
                            <div>
                                <label
                                    className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1 cursor-help"
                                    title="그 밖의 기본공제대상자(배우자, 직계존비속 등) 의료비: 연간 700만원 한도, 15% 공제"
                                >
                                    그 밖의 부양가족 <span className="text-slate-400 text-[10px]">ⓘ</span>
                                </label>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <input
                                        type="number"
                                        min={0}
                                        value={medicalGeneral}
                                        onChange={(e) => setMedicalGeneral(Number(e.target.value))}
                                        className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                                    />
                                    <span className="text-[11px] text-slate-400">만</span>
                                </div>
                            </div>
                        </div>

                        {/* 기부금 헤더 */}
                        <div className="flex items-center justify-between pt-3 pb-2 border-t border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">🎁</span>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">기부금 세액공제</h3>
                                    <p className="text-[10px] text-slate-400">정치·고향사랑·특례·종교</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setCalculationModalTab('donation');
                                    setIsCalculationModalOpen(true);
                                }}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 hover:bg-indigo-100 transition-all cursor-pointer flex items-center gap-1"
                            >
                                <span>🔍</span> 산출과정 표
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">고향사랑 (10만 이하)</label>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <input
                                        type="number"
                                        min={0}
                                        value={hometownUnder10}
                                        onChange={(e) => setHometownUnder10(Number(e.target.value))}
                                        className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                                    />
                                    <span className="text-[11px] text-slate-400">만</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">정치자금 기부금</label>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <input
                                        type="number"
                                        min={0}
                                        value={politicalDonation}
                                        onChange={(e) => setPoliticalDonation(Number(e.target.value))}
                                        className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                                    />
                                    <span className="text-[11px] text-slate-400">만</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">종교단체 외 일반기부</label>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <input
                                        type="number"
                                        min={0}
                                        value={nonReligiousDonation}
                                        onChange={(e) => setNonReligiousDonation(Number(e.target.value))}
                                        className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                                    />
                                    <span className="text-[11px] text-slate-400">만</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">종교단체 기부금</label>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <input
                                        type="number"
                                        min={0}
                                        value={religiousDonation}
                                        onChange={(e) => setReligiousDonation(Number(e.target.value))}
                                        className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                                    />
                                    <span className="text-[11px] text-slate-400">만</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-700 dark:text-slate-300">의료비+기부금 공제액:</span>
                            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                                {formatKRW(taxCalculation.medicalCredit + taxCalculation.donationCredit)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3열: 주택자금 + 그 밖의 소득공제 + 연금계좌/월세/보험/교육 세액공제 */}
                <div className="space-y-6">
                    {/* 카드 5: 주택자금 특별소득공제 (전세·청약·주담대) */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">🏠</span>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">주택자금 소득공제</h3>
                                    <p className="text-[10px] text-slate-400">전세대출·청약저축·주택담보대출</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/50">
                                특별소득공제
                            </span>
                        </div>

                        <div className="space-y-2.5 text-xs">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">주택청약종합저축 납입액</label>
                                    <span className="text-[10px] text-slate-400">연 300만 한도의 40%</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <input
                                        type="number"
                                        min={0}
                                        value={housingSavings}
                                        onChange={(e) => setHousingSavings(Number(e.target.value))}
                                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                                        placeholder="예: 240"
                                    />
                                    <span className="text-xs text-slate-400 flex-shrink-0">만원</span>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-0.5">총급여 7천만원 이하 무주택 세대주 대상</p>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">주택임차차입금(전세대출) 원리금 상환액</label>
                                    <span className="text-[10px] text-slate-400">상환액 40% (합산 400만)</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <input
                                        type="number"
                                        min={0}
                                        value={housingLeaseRepay}
                                        onChange={(e) => setHousingLeaseRepay(Number(e.target.value))}
                                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                                        placeholder="예: 500"
                                    />
                                    <span className="text-xs text-slate-400 flex-shrink-0">만원</span>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-0.5">무주택 세대주/세대원, 국민주택규모 또는 주거용 오피스텔</p>
                            </div>

                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">장기주택저당차입금(주담대) 이자상환액</label>
                                    <span className="text-[10px] text-slate-400">기준시가 6억 이하</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <input
                                        type="number"
                                        min={0}
                                        value={mortgageInterest}
                                        onChange={(e) => setMortgageInterest(Number(e.target.value))}
                                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                                        placeholder="예: 600"
                                    />
                                    <span className="text-xs text-slate-400 flex-shrink-0">만원</span>
                                </div>

                                <div>
                                    <label className="text-[10px] text-slate-500 block mb-1">대출 상환방식 유형 (법정 공제한도 결정)</label>
                                    <select
                                        value={mortgageType}
                                        onChange={(e) => setMortgageType(e.target.value)}
                                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
                                    >
                                        <option value="none">선택 안함 (주담대 공제 미적용)</option>
                                        <option value="fixed_non_deferred_15">15년 이상 고정금리 &amp; 비거치식 분할상환 (한도 2,000만원)</option>
                                        <option value="fixed_or_non_deferred_15">15년 이상 고정금리 또는 비거치식 분할상환 (한도 1,500만원)</option>
                                        <option value="other_15">15년 이상 기타 상환방식 (한도 1,000만원)</option>
                                        <option value="fixed_or_non_deferred_10">10년 이상 고정금리 또는 비거치식 분할상환 (한도 600만원)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-700 dark:text-slate-300">최종 주택자금 소득공제:</span>
                            <span className="font-mono font-black text-blue-600 dark:text-blue-400">
                                {formatKRW(taxCalculation.totalHousingDeduction)}
                            </span>
                        </div>
                    </div>

                    {/* 카드 6: 그 밖의 소득공제 (노란우산·펀드·투자조합) */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">📑</span>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">그 밖의 소득공제</h3>
                                    <p className="text-[10px] text-slate-400">노란우산·투자조합·청년/국민성장펀드</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/50">
                                기타 소득공제
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 text-xs">
                            <div>
                                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">소기업·노란우산공제</label>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <input
                                        type="number"
                                        min={0}
                                        value={yellowUmbrella}
                                        onChange={(e) => setYellowUmbrella(Number(e.target.value))}
                                        className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                                        placeholder="0"
                                    />
                                    <span className="text-[11px] text-slate-400">만</span>
                                </div>
                                <span className="text-[9px] text-slate-400">총급여 8천이하 (200~600만)</span>
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">구 개인연금저축 (2000년전)</label>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <input
                                        type="number"
                                        min={0}
                                        value={oldPersonalPension}
                                        onChange={(e) => setOldPersonalPension(Number(e.target.value))}
                                        className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                                        placeholder="0"
                                    />
                                    <span className="text-[11px] text-slate-400">만</span>
                                </div>
                                <span className="text-[9px] text-slate-400">납입 40% (연 72만 한도)</span>
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">투자조합출자(벤처)</label>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <input
                                        type="number"
                                        min={0}
                                        value={ventureInvestment}
                                        onChange={(e) => setVentureInvestment(Number(e.target.value))}
                                        className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                                        placeholder="0"
                                    />
                                    <span className="text-[11px] text-slate-400">만</span>
                                </div>
                                <span className="text-[9px] text-slate-400">3천만 100%, 소득 50%</span>
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">청년형 장기집합투자펀드</label>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <input
                                        type="number"
                                        min={0}
                                        value={youthFund}
                                        onChange={(e) => setYouthFund(Number(e.target.value))}
                                        className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                                        placeholder="0"
                                    />
                                    <span className="text-[11px] text-slate-400">만</span>
                                </div>
                                <span className="text-[9px] text-slate-400">총급여 5천이하 (연 240만)</span>
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">국민성장집합저축 ('26.5.12)</label>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <input
                                        type="number"
                                        min={0}
                                        value={nationalGrowthFund}
                                        onChange={(e) => setNationalGrowthFund(Number(e.target.value))}
                                        className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                                        placeholder="0"
                                    />
                                    <span className="text-[11px] text-slate-400">만</span>
                                </div>
                                <span className="text-[9px] text-slate-400">2억 한도 40~10% (최대1,800)</span>
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">우리사주 출연금</label>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <input
                                        type="number"
                                        min={0}
                                        value={employeeStockContribution}
                                        onChange={(e) => setEmployeeStockContribution(Number(e.target.value))}
                                        className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                                        placeholder="0"
                                    />
                                    <span className="text-[11px] text-slate-400">만</span>
                                </div>
                                <span className="text-[9px] text-slate-400">연간 400만원 한도</span>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-700 dark:text-slate-300">기타 소득공제 합계:</span>
                            <span className="font-mono font-black text-purple-600 dark:text-purple-400">
                                {formatKRW(taxCalculation.otherIncomeDeductions)}
                            </span>
                        </div>
                    </div>

                    {/* 카드 6: 연금계좌 & 월세액 & 교육·보장성 세액공제 */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">🏦</span>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">연금·월세·교육·보험</h3>
                                    <p className="text-[10px] text-slate-400">연금계좌 및 생활밀착 세액공제</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50">
                                세액공제
                            </span>
                        </div>

                        <div className="space-y-2.5 text-xs">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">연금저축 (한도 600만)</label>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <input
                                            type="number"
                                            min={0}
                                            value={pensionSavings}
                                            onChange={(e) => setPensionSavings(Number(e.target.value))}
                                            className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                                        />
                                        <span className="text-[11px] text-slate-400">만</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">IRP 퇴직연금 (합산 900)</label>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <input
                                            type="number"
                                            min={0}
                                            value={irp}
                                            onChange={(e) => setIrp(Number(e.target.value))}
                                            className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                                        />
                                        <span className="text-[11px] text-slate-400">만</span>
                                    </div>
                                </div>
                            </div>

                            {/* ISA 만기 연금계좌 전환 추가 세액공제 (조특법 제86조의4) */}
                            <div className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/50 space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="text-[11px] font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1">
                                        <span>✨</span> ISA 만기 연금계좌 전환액
                                    </label>
                                    {taxCalculation.isaCreditEligible > 0 && (
                                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                            +{formatKRW(taxCalculation.isaCreditEligible)} 추가한도 인정
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <input
                                        type="number"
                                        min={0}
                                        value={isaPensionTransfer}
                                        onChange={(e) => setIsaPensionTransfer(Number(e.target.value))}
                                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs"
                                        placeholder="예: 3000 (3,000만원 전환 시 300만 한도)"
                                    />
                                    <span className="text-xs text-slate-400 flex-shrink-0">만원</span>
                                </div>
                                <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-tight">
                                    조특법 제86조의4: ISA 만기 후 60일 내 연금계좌 전환 시, <span className="font-bold text-indigo-600 dark:text-indigo-400">전환액의 10%(최대 300만원 한도)</span>를 기존 한도(900만) 외에 추가 공제(합산 최대 1,200만)합니다.
                                </p>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-0.5">
                                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">월세액 (총급여 8,000만 이하 / 무주택)</label>
                                    <span className="text-[10px] text-slate-400">한도 1,000만, 15~17%</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <input
                                        type="number"
                                        min={0}
                                        value={rentExpenses}
                                        onChange={(e) => setRentExpenses(Number(e.target.value))}
                                        className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                                        placeholder="0"
                                    />
                                    <span className="text-[11px] text-slate-400">만</span>
                                </div>
                                <span className="text-[9px] text-slate-400 block mt-0.5 leading-tight">
                                    85㎡(3자녀 이상 100㎡) 또는 시가 4억 이하 / 부부 별도주소 합산 1천만 한도
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">일반 보장성보험 (12%)</label>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <input
                                            type="number"
                                            min={0}
                                            value={insuranceExpenses}
                                            onChange={(e) => setInsuranceExpenses(Number(e.target.value))}
                                            className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                                        />
                                        <span className="text-[11px] text-slate-400">만</span>
                                    </div>
                                    <span className="text-[9px] text-slate-400">연 100만 한도</span>
                                </div>
                                <div>
                                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">장애인전용 보험 (15%)</label>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <input
                                            type="number"
                                            min={0}
                                            value={disabledInsuranceExpenses}
                                            onChange={(e) => setDisabledInsuranceExpenses(Number(e.target.value))}
                                            className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                                        />
                                        <span className="text-[11px] text-slate-400">만</span>
                                    </div>
                                    <span className="text-[9px] text-slate-400">연 100만 별도 한도</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">교육비 세액공제 (15%)</label>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <input
                                        type="number"
                                        min={0}
                                        value={educationExpenses}
                                        onChange={(e) => setEducationExpenses(Number(e.target.value))}
                                        className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                                        placeholder="0"
                                    />
                                    <span className="text-[11px] text-slate-400">만</span>
                                </div>
                                <span className="text-[9px] text-slate-400">본인 전액, 취학전·초중고 300만, 대학생 900만</span>
                            </div>



                            {/* 표준세액공제 진단 안내 */}
                            <div className="p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-[10px] flex items-start gap-1.5">
                                <span className="text-xs">⚖️</span>
                                <div>
                                    <span className="font-bold text-indigo-950 dark:text-indigo-300 block">
                                        표준세액공제 (13만원) 진단
                                    </span>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        {taxCalculation.isStandardCreditAdvantageous 
                                            ? '특별소득/세액공제 지출이 적어 일괄 표준세액공제(13만원)를 받는 것이 더 유리합니다.'
                                            : `현재 특별소득/세액공제 혜택(${formatKRW(taxCalculation.itemizedBenefitTotal)})이 표준세액공제(13만원)보다 유리합니다.`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-700 dark:text-slate-300">연금·월세·보험·교육 공제합계:</span>
                            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                                {formatKRW(taxCalculation.totalPensionCredit + taxCalculation.rentCredit + taxCalculation.insuranceCredit + taxCalculation.educationCredit)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2026 산출과정 통합 모달 (카드·의료비·기부금 탭 일원화) */}
            <UnifiedCalculationModal
                isOpen={isCalculationModalOpen}
                onClose={() => setIsCalculationModalOpen(false)}
                activeTab={calculationModalTab}
                setActiveTab={setCalculationModalTab}
                cardData={{
                    salaryWon: taxCalculation.salaryWon,
                    numChildren,
                    creditCard: creditCard * 10000,
                    debitCard: debitCard * 10000,
                    cashReceipt: cashReceipt * 10000,
                    cultureCredit: (taxCalculation.totalCultureRecognizedManwon > 0 ? taxCalculation.totalCultureRecognizedManwon : cultureCredit) * 10000,
                    cultureDebit: cultureDebit * 10000,
                    cultureCash: cultureCash * 10000,
                    market: market * 10000,
                    transit: transit * 10000,
                    calc: taxCalculation.cardCalc
                }}
                medicalData={{
                    salaryWon: taxCalculation.salaryWon,
                    infertility: medicalInfertility * 10000,
                    prematureBaby: medicalPremature * 10000,
                    seniorDisabled: medicalSenior * 10000,
                    generalOther: medicalGeneral * 10000,
                    calc: taxCalculation.medicalCalc
                }}
                donationData={{
                    earnedIncomeAmountWon: taxCalculation.earnedIncomeAmount,
                    politicalDonation: politicalDonation * 10000,
                    hometownUnder10: hometownUnder10 * 10000,
                    hometown10to20: hometown10to20 * 10000,
                    hometownSpecialOver20: hometownSpecialOver20 * 10000,
                    hometownGeneralOver20: hometownGeneralOver20 * 10000,
                    specialDonation: specialDonation * 10000,
                    employeeStockDonation: employeeStockDonation * 10000,
                    nonReligiousDonation: nonReligiousDonation * 10000,
                    religiousDonation: religiousDonation * 10000,
                    calc: taxCalculation.donationCalc
                }}
            />

            {/* 연말정산 데이터 옮기기 (JSON 내보내기/불러오기) 모달 */}
            <TaxDataTransferModal
                isOpen={isDataTransferModalOpen}
                onClose={() => setIsDataTransferModalOpen(false)}
                currentData={getCurrentSettingsPayload()}
                onImport={handleImportSettings}
            />

            {/* 2026 산출과정 개별 모달 (호환성 유지) */}
            <CardDeductionModal
                isOpen={isCardModalOpen}
                onClose={() => setIsCardModalOpen(false)}
                data={{
                    salaryWon: taxCalculation.salaryWon,
                    numChildren,
                    creditCard: creditCard * 10000,
                    debitCard: debitCard * 10000,
                    cashReceipt: cashReceipt * 10000,
                    cultureCredit: (taxCalculation.totalCultureRecognizedManwon > 0 ? taxCalculation.totalCultureRecognizedManwon : cultureCredit) * 10000,
                    cultureDebit: cultureDebit * 10000,
                    cultureCash: cultureCash * 10000,
                    market: market * 10000,
                    transit: transit * 10000,
                    calc: taxCalculation.cardCalc
                }}
            />

            <MedicalDeductionModal
                isOpen={isMedicalModalOpen}
                onClose={() => setIsMedicalModalOpen(false)}
                data={{
                    salaryWon: taxCalculation.salaryWon,
                    infertility: medicalInfertility * 10000,
                    prematureBaby: medicalPremature * 10000,
                    seniorDisabled: medicalSenior * 10000,
                    generalOther: medicalGeneral * 10000,
                    calc: taxCalculation.medicalCalc
                }}
            />

            <DonationDeductionModal
                isOpen={isDonationModalOpen}
                onClose={() => setIsDonationModalOpen(false)}
                data={{
                    earnedIncomeAmountWon: taxCalculation.earnedIncomeAmount,
                    politicalDonation: politicalDonation * 10000,
                    hometownUnder10: hometownUnder10 * 10000,
                    hometown10to20: hometown10to20 * 10000,
                    hometownSpecialOver20: hometownSpecialOver20 * 10000,
                    hometownGeneralOver20: hometownGeneralOver20 * 10000,
                    specialDonation: specialDonation * 10000,
                    employeeStockDonation: employeeStockDonation * 10000,
                    nonReligiousDonation: nonReligiousDonation * 10000,
                    religiousDonation: religiousDonation * 10000,
                    calc: taxCalculation.donationCalc
                }}
            />

            <TaxGuideHelpModal
                isOpen={isHelpModalOpen}
                onClose={() => setIsHelpModalOpen(false)}
            />
        </div>
    );
}
