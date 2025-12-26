export interface MortgageInputs {
  propertyPrice: number;
  downPayment: number;
  monthlyIncome: number;
  dealType: 'first' | 'upgrade' | 'investment';
}

export interface MortgageResult {
  loanAmount: number;
  monthlyPayment: number;
  loanToValue: number;
  paymentToIncome: number;
  warnings: string[];
}

/**
 * חישוב החזר חודשי למשכנתא
 * נוסחה: M = P * [r(1+r)^n] / [(1+r)^n - 1]
 */
export function calculateMonthlyPayment(
  loanAmount: number,
  annualInterestRate: number = 4.5, // ריבית ממוצעת בישראל
  years: number = 25
): number {
  const monthlyRate = annualInterestRate / 100 / 12;
  const numberOfPayments = years * 12;
  
  if (monthlyRate === 0) {
    return loanAmount / numberOfPayments;
  }
  
  const payment = loanAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
  return Math.round(payment);
}

/**
 * חישוב תוצאות משכנתא ודגלים אדומים
 */
export function calculateMortgage(inputs: MortgageInputs): MortgageResult {
  const loanAmount = inputs.propertyPrice - inputs.downPayment;
  const monthlyPayment = calculateMonthlyPayment(loanAmount);
  const loanToValue = (loanAmount / inputs.propertyPrice) * 100;
  const paymentToIncome = (monthlyPayment / inputs.monthlyIncome) * 100;
  
  const warnings: string[] = [];
  
  // בדיקות לפי סוג העסקה
  const maxLTV = inputs.dealType === 'first' ? 75 : 
                 inputs.dealType === 'upgrade' ? 70 : 50; // השקעה
  
  // דגל 1: הון עצמי נמוך
  if (loanToValue > maxLTV) {
    warnings.push(
      `💰 הון עצמי לא מספיק - צריך ${maxLTV}% מימון עצמי לפחות (כרגע ${(100 - loanToValue).toFixed(1)}%). ` +
      `חסרים לך ${(inputs.propertyPrice * (maxLTV / 100) - inputs.downPayment).toLocaleString('he-IL')} ₪`
    );
  }
  
  // דגל 2: החזר גבוה מדי ביחס להכנסה
  const maxPaymentToIncome = 35;
  if (paymentToIncome > maxPaymentToIncome) {
    warnings.push(
      `📊 ההחזר החודשי גבוה מדי - ${paymentToIncome.toFixed(1)}% מההכנסה ` +
      `(הבנק בדרך כלל מאשר עד ${maxPaymentToIncome}%). ` +
      `כדאי לשקול הון עצמי נוסף או נכס זול יותר`
    );
  }
  
  // דגל 3: סכום משכנתא גבוה מאוד
  if (loanAmount > 2000000) {
    warnings.push(
      `🏠 משכנתא מעל 2 מיליון ₪ - ייתכן שתצטרך משכנתא משולבת ` +
      `(חלק בנקאי וחלק שאינו בנקאי) עם ריביות שונות`
    );
  }
  
  // דגל 4: הכנסה נמוכה לנכס
  const recommendedIncome = monthlyPayment / 0.35; // 35% מההכנסה
  if (inputs.monthlyIncome < recommendedIncome) {
    warnings.push(
      `💵 ההכנסה החודשית נמוכה יחסית למחיר הנכס. ` +
      `מומלץ הכנסה של ${recommendedIncome.toLocaleString('he-IL')} ₪ לפחות`
    );
  }
  
  // דגל 5: השקעה עם מימון גבוה
  if (inputs.dealType === 'investment' && loanToValue > 50) {
    warnings.push(
      `🏦 נכס השקעה דורש הון עצמי של 50% לפחות לפי תקנות בנק ישראל`
    );
  }
  
  return {
    loanAmount,
    monthlyPayment,
    loanToValue,
    paymentToIncome,
    warnings: warnings.length > 0 ? warnings.slice(0, 3) : [
      '✅ המצב נראה טוב! הנתונים מתאימים למתן משכנתא'
    ]
  };
}

/**
 * חישוב תמהיל משכנתא - 3 אופציות
 */
export interface MixOption {
  id: 'stable' | 'balanced' | 'saving';
  name: string;
  icon: string;
  monthlyPayment: number;
  totalCost: number;
  volatility: 'low' | 'medium' | 'high';
  volatilityText: string;
  description: string;
  recommended?: boolean;
}

export function calculateMixOptions(loanAmount: number, years: number = 25): MixOption[] {
  // אופציה 1: יציבות - 100% ריבית קבועה
  const stableRate = 5.2; // ריבית קבועה גבוהה יותר
  const stableMonthlyPayment = calculateMonthlyPayment(loanAmount, stableRate, years);
  const stableTotalCost = stableMonthlyPayment * years * 12;

  // אופציה 2: איזון - 60% קבועה, 40% משתנה/פריים
  const balancedAverageRate = 4.3; // ממוצע משוקלל
  const balancedMonthlyPayment = calculateMonthlyPayment(loanAmount, balancedAverageRate, years);
  const balancedTotalCost = balancedMonthlyPayment * years * 12;

  // אופציה 3: חיסכון - 30% קבועה, 70% משתנה/פריים
  const savingAverageRate = 3.8; // ריבית נמוכה יותר אבל עם סיכון
  const savingMonthlyPayment = calculateMonthlyPayment(loanAmount, savingAverageRate, years);
  const savingTotalCost = savingMonthlyPayment * years * 12;

  return [
    {
      id: 'stable',
      name: 'אופציה 1 – יציבות',
      icon: '🟦',
      monthlyPayment: stableMonthlyPayment,
      totalCost: Math.round(stableTotalCost),
      volatility: 'low',
      volatilityText: 'נמוכה',
      description: 'מתאימה למי שמעדיף שקט נפשי ויודע בדיוק כמה ישלם כל חודש.',
      recommended: false
    },
    {
      id: 'balanced',
      name: 'אופציה 2 – איזון',
      icon: '🟨',
      monthlyPayment: balancedMonthlyPayment,
      totalCost: Math.round(balancedTotalCost),
      volatility: 'medium',
      volatilityText: 'בינונית',
      description: 'שילוב חכם בין יציבות לחיסכון. המלצת המומחים לרוב המשפחות.',
      recommended: true
    },
    {
      id: 'saving',
      name: 'אופציה 3 – חיסכון',
      icon: '🟩',
      monthlyPayment: savingMonthlyPayment,
      totalCost: Math.round(savingTotalCost),
      volatility: 'high',
      volatilityText: 'גבוהה',
      description: 'מיועד למי שיכול להכיל שינויים בהחזר החודשי ומחפש חיסכון מקסימלי.',
      recommended: false
    }
  ];
}

/**
 * חישוב חיסכון פוטנציאלי בין אופציות
 */
export function calculatePotentialSaving(
  loanAmount: number,
  selectedOption: 'stable' | 'balanced' | 'saving',
  years: number = 25
): number {
  const options = calculateMixOptions(loanAmount, years);
  const stableOption = options.find(o => o.id === 'stable')!;
  const selectedOpt = options.find(o => o.id === selectedOption)!;
  
  // החיסכון הוא ההפרש בין האופציה היקרה ביותר (יציבות) לבין האופציה שנבחרה
  return Math.round(stableOption.totalCost - selectedOpt.totalCost);
}
