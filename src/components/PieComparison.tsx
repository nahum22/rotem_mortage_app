import React from 'react';
import './PieComparison.css';

interface PieComparisonProps {
  loanAmount: number;
  years?: number;
}

interface LoanBreakdown {
  principal: number;
  interest: number;
  total: number;
  monthlyPayment: number;
}

const calculateLoanBreakdown = (
  loanAmount: number,
  annualRate: number,
  years: number
): LoanBreakdown => {
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;
  
  const monthlyPayment = loanAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  
  const totalPayment = monthlyPayment * numberOfPayments;
  const totalInterest = totalPayment - loanAmount;
  
  return {
    principal: loanAmount,
    interest: totalInterest,
    total: totalPayment,
    monthlyPayment: Math.round(monthlyPayment)
  };
};

interface PieChartProps {
  principal: number;
  interest: number;
  title: string;
  subtitle: string;
}

const PieChart: React.FC<PieChartProps> = ({ principal, interest, title, subtitle }) => {
  const total = principal + interest;
  const principalPercent = (principal / total) * 100;
  const interestPercent = (interest / total) * 100;
  
  // Calculate pie chart angles
  const principalAngle = (principalPercent / 100) * 360;
  
  // Create SVG path for pie slices
  const createPieSlice = (startAngle: number, endAngle: number) => {
    const radius = 80;
    const cx = 100;
    const cy = 100;
    
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;
    
    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };
  
  return (
    <div className="pie-chart-container">
      <div className="pie-title">{title}</div>
      <div className="pie-subtitle">{subtitle}</div>
      
      <svg viewBox="0 0 200 200" className="pie-svg">
        {/* Principal slice */}
        <path
          d={createPieSlice(0, principalAngle)}
          fill="#4CAF50"
          className="pie-slice"
        />
        {/* Interest slice */}
        <path
          d={createPieSlice(principalAngle, 360)}
          fill="#FF6B6B"
          className="pie-slice"
        />
      </svg>
      
      <div className="pie-legend">
        <div className="legend-item">
          <div className="legend-color principal"></div>
          <div className="legend-text">
            <div className="legend-label">קרן</div>
            <div className="legend-value">{principal.toLocaleString('he-IL')} ₪</div>
            <div className="legend-percent">{principalPercent.toFixed(1)}%</div>
          </div>
        </div>
        <div className="legend-item">
          <div className="legend-color interest"></div>
          <div className="legend-text">
            <div className="legend-label">ריבית</div>
            <div className="legend-value">{interest.toLocaleString('he-IL')} ₪</div>
            <div className="legend-percent">{interestPercent.toFixed(1)}%</div>
          </div>
        </div>
      </div>
      
      <div className="total-cost">
        <div className="total-label">עלות כוללת</div>
        <div className="total-value">{total.toLocaleString('he-IL')} ₪</div>
      </div>
    </div>
  );
};

export const PieComparison: React.FC<PieComparisonProps> = ({ 
  loanAmount, 
  years = 25 
}) => {
  // הצעת בנק ממוצעת - ריבית גבוהה יותר
  const bankOffer = calculateLoanBreakdown(loanAmount, 5.2, years);
  
  // תמהיל מתוכנן - שילוב של מסלולים בריבית ממוצעת נמוכה יותר
  const plannedMix = calculateLoanBreakdown(loanAmount, 3.8, years);
  
  const savings = bankOffer.total - plannedMix.total;
  const savingsPercent = (savings / bankOffer.total) * 100;
  
  return (
    <div className="pie-comparison-container">
      <div className="comparison-header">
        <h2>איך נראית משכנתא "רגילה" לעומת תמהיל מתוכנן</h2>
        <p className="comparison-subtitle">
          השוואת העלות הכוללת על פני {years} שנים
        </p>
      </div>
      
      <div className="pies-grid">
        <div className="pie-wrapper left">
          <div className="pie-icon">👈</div>
          <PieChart
            principal={bankOffer.principal}
            interest={bankOffer.interest}
            title="הצעת בנק ממוצעת"
            subtitle="ריבית 5.2% ממוצעת"
          />
          <div className="monthly-note">
            החזר חודשי: {bankOffer.monthlyPayment.toLocaleString('he-IL')} ₪
          </div>
        </div>
        
        <div className="vs-divider">
          <div className="vs-circle">VS</div>
          <div className="savings-badge">
            <div className="savings-amount">חיסכון של {savings.toLocaleString('he-IL')} ₪</div>
            <div className="savings-percent">{savingsPercent.toFixed(1)}% פחות!</div>
          </div>
        </div>
        
        <div className="pie-wrapper right">
          <div className="pie-icon">👉</div>
          <PieChart
            principal={plannedMix.principal}
            interest={plannedMix.interest}
            title="תמהיל מתוכנן"
            subtitle="ריבית 3.8% ממוצעת"
          />
          <div className="monthly-note">
            החזר חודשי: {plannedMix.monthlyPayment.toLocaleString('he-IL')} ₪
          </div>
        </div>
      </div>
      
      <div className="explanation-box">
        <div className="explanation-icon">💡</div>
        <div className="explanation-content">
          <h3>למה זה משנה?</h3>
          <p>
            <strong>רוב הבנקים מתמקדים בהחזר החודשי.</strong><br />
            אנחנו מסתכלים על העלות הכוללת לאורך השנים.
          </p>
          <p>
            תמהיל מתוכנן משלב מסלולים שונים (קבועה, משתנה, פריים) 
            בצורה חכמה שמפחיתה את העלות הכוללת שלך ב-<strong>{savingsPercent.toFixed(0)}%</strong>
          </p>
        </div>
      </div>
      
      <div className="key-insights">
        <h3>נקודות מפתח</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">📊</div>
            <div className="insight-title">עלות כוללת</div>
            <div className="insight-value">
              {(bankOffer.total - plannedMix.total).toLocaleString('he-IL')} ₪
            </div>
            <div className="insight-label">חיסכון פוטנציאלי</div>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon">💰</div>
            <div className="insight-title">הפרש חודשי</div>
            <div className="insight-value">
              {(bankOffer.monthlyPayment - plannedMix.monthlyPayment).toLocaleString('he-IL')} ₪
            </div>
            <div className="insight-label">פחות בכל חודש</div>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon">⏱️</div>
            <div className="insight-title">זמן החזר</div>
            <div className="insight-value">{years} שנים</div>
            <div className="insight-label">תקופת המשכנתא</div>
          </div>
        </div>
      </div>
    </div>
  );
};
