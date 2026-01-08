export interface MortgageInputs {
  propertyPrice: number;
  downPayment: number;
  monthlyIncome: number;
  dealType: 'first' | 'upgrade' | 'investment';
  propertyType: 'apartment' | 'landAndHouse' | 'land';
}

export interface InterestRates {
  prime: number;
  fixed5Years: number;
  variable: number;
  lastUpdated: string;
}

export interface MortgageResult {
  loanAmount: number;
  monthlyPayment: number;
  loanToValue: number;
  paymentToIncome: number;
  warnings: string[];
  interestRates?: InterestRates;
}

/**
 * שליפת שיעורי ריבית עדכניים מבנק ישראל
 */
export async function fetchInterestRates(): Promise<InterestRates> {
  try {
    // בפרודקשן - Netlify Function, בפיתוח - Vite proxy
    const apiUrl = import.meta.env.PROD 
      ? '/.netlify/functions/interest-rates'
      : '/api/interest-rates';
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch interest rates');
    }
    
    const data = await response.json();
    
    console.log('📊 Full API Response:', data);
    console.log('📊 Type:', typeof data);
    console.log('📊 Is Array:', Array.isArray(data));
    
    // אם זה אובייקט פשוט עם currentInterest
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return {
        prime: data.currentInterest + 1.5  || 6,
        fixed5Years: data.currentInterest + 1.2 || 5.7,
        variable: data.currentInterest - 0.3 || 4.2,
        lastUpdated: new Date().toISOString()
      };
    }
    
    // אם זה מערך
    const dataArray = Array.isArray(data) ? data : [];
    const boiRate = dataArray.find((item: any) => item.InterestRateName === 'ריבית  פריים בנק ישראל');
    const fixed5YearsRate = dataArray.find((item: any) => item.InterestRateName?.includes('קבועה 5 שנים'));
    const variableRate = dataArray.find((item: any) => item.InterestRateName?.includes('משתנה'));
    
    return {
      prime: boiRate?.currentInterest +1.5 || 6,
      fixed5Years: fixed5YearsRate?.currentInterest + 1.2  || 5.7,
      variable: variableRate?.currentInterest -0.3 || 4.2,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('⚠️ Error fetching interest rates:', error);
    // ערכי ברירת מחדל במקרה של שגיאה
    return {
      prime: 4.5,
      fixed5Years: 5.2,
      variable: 3.8,
      lastUpdated: new Date().toISOString()
    };
  }
}

/**
 * חישוב החזר חודשי למשכנתא
 * נוסחה: M = P * [r(1+r)^n] / [(1+r)^n - 1]
 */
export function calculateMonthlyPayment(
  loanAmount: number,
  annualInterestRate: number,
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
export async function calculateMortgage(inputs: MortgageInputs): Promise<MortgageResult> {
  // שליפת ריביות עדכניות
  const interestRates = await fetchInterestRates();
  
  const loanAmount = inputs.propertyPrice - inputs.downPayment;
  // שימוש בריבית ממוצעת משוקללת
  const averageRate = (interestRates.fixed5Years * 0.6 + interestRates.variable * 0.4);
  const monthlyPayment = calculateMonthlyPayment(loanAmount, averageRate);
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
    ],
    interestRates
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
  composition: {
    fixed: number;      // אחוז ריבית קבועה
    variable: number;   // אחוז ריבית משתנה
    prime: number;      // אחוז פריים
  };
  vsBank: string;      // הסבר ההבדל מהתמהיל הגנרי של הבנק
}

export async function calculateMixOptions(loanAmount: number, years: number = 25): Promise<MixOption[]> {
  // שליפת ריביות עדכניות
  const interestRates = await fetchInterestRates();
  
  // אופציה 1: סולידי - 50% קבועה, 30% משתנה, 20% פריים
  const stableAverageRate = (interestRates.fixed5Years * 0.5) + (interestRates.variable * 0.3) + (interestRates.prime * 0.2);
  const stableMonthlyPayment = calculateMonthlyPayment(loanAmount, stableAverageRate, years);
  const stableTotalCost = stableMonthlyPayment * years * 12;

  // אופציה 2: מאוזן - 40% קבועה, 40% פריים, 20% משתנה
  const balancedAverageRate = (interestRates.fixed5Years * 0.4) + (interestRates.prime * 0.4) + (interestRates.variable * 0.2);
  const balancedMonthlyPayment = calculateMonthlyPayment(loanAmount, balancedAverageRate, years);
  const balancedTotalCost = balancedMonthlyPayment * years * 12;

  // אופציה 3: גמישות - 30% קבועה, 50% פריים, 20% משתנה
  const savingAverageRate = (interestRates.fixed5Years * 0.3) + (interestRates.prime * 0.5) + (interestRates.variable * 0.2);
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
      description: 'למי ששונא הפתעות ומשפחות עם תקציב צמוד. יציבות מקסימלית עם מינימום תנודות.',
      recommended: false,
      composition: {
        fixed: 50,
        variable: 30,
        prime: 20
      },
      vsBank: 'תמהיל זה מעניק יציבות רבה יותר מהתמהיל הסטנדרטי של הבנק - 50% קבועה (לעומת 30-40% בבנק) מבטיחה שקט נפשי'
    },
    {
      id: 'balanced',
      name: 'אופציה 2 – איזון',
      icon: '🟨',
      monthlyPayment: balancedMonthlyPayment,
      totalCost: Math.round(balancedTotalCost),
      volatility: 'medium',
      volatilityText: 'בינונית',
      description: 'איזון מושלם בין גמישות ליציבות. התמהיל הנפוץ והפשוט להבנה, מתאים לרוב המשפחות.',
      recommended: true,
      composition: {
        fixed: 40,
        prime: 40,
        variable: 20
      },
      vsBank: 'תמהיל מאוזן עם חשיפה גבוהה יותר לפריים (40%) המאפשר גמישות וחיסכון פוטנציאלי כאשר הריבית יורדת'
    },
    {
      id: 'saving',
      name: 'אופציה 3 – חיסכון',
      icon: '🟩',
      monthlyPayment: savingMonthlyPayment,
      totalCost: Math.round(savingTotalCost),
      volatility: 'high',
      volatilityText: 'גבוהה',
      description: 'למי שמצפה להכנסות לעלות, מתכנן פירעונות עתידיים, או יכול לספוג שינויים בהחזר החודשי.',
      recommended: false,
      composition: {
        fixed: 30,
        prime: 50,
        variable: 20
      },
      vsBank: 'חשיפה מקסימלית לפריים (50%) - תמהיל אגרסיבי המאפשר חיסכון משמעותי בתקופות ירידת ריבית והתאמה מהירה לשוק'
    }
  ];
}

/**
 * חישוב חיסכון פוטנציאלי לעומת הצעת בנק טיפוסית (80% קבועה + 20% פריים)
 */
export async function calculatePotentialSaving(
  loanAmount: number,
  selectedOption: 'stable' | 'balanced' | 'saving',
  years: number = 25
): Promise<number> {
  const interestRates = await fetchInterestRates();
  const options = await calculateMixOptions(loanAmount, years);
  const selectedOpt = options.find(o => o.id === selectedOption)!;
  
  // חישוב תמהיל בנק טיפוסי: 80% קבועה + 20% פריים
  const typicalBankRate = (interestRates.fixed5Years * 0.8) + (interestRates.prime * 0.2);
  const typicalBankMonthlyPayment = calculateMonthlyPayment(loanAmount, typicalBankRate, years);
  const typicalBankTotalCost = typicalBankMonthlyPayment * years * 12;
  
  // החיסכון הוא ההפרש בין הצעת הבנק הטיפוסית לבין האופציה שנבחרה
  return Math.round(typicalBankTotalCost - selectedOpt.totalCost);
}
