import React from 'react';
import type { MortgageResult } from '../utils/calculations';
import './Results.css';

interface ResultsProps {
  results: MortgageResult;
}

export const Results: React.FC<ResultsProps> = ({ results }) => {
  return (
    <div className="results-container">
      <h2>תוצאות האבחון</h2>
      
      <div className="results-grid">
        <div className="result-card">
          <div className="result-icon">🏦</div>
          <div className="result-label">סכום המשכנתא</div>
          <div className="result-value">
            {results.loanAmount.toLocaleString('he-IL')} ₪
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-icon">💳</div>
          <div className="result-label">החזר חודשי משוער</div>
          <div className="result-value">
            {results.monthlyPayment.toLocaleString('he-IL')} ₪
          </div>
          <div className="result-note">ל-25 שנים בריבית 4.5%</div>
        </div>
        
        <div className="result-card">
          <div className="result-icon">📊</div>
          <div className="result-label">אחוז מימון</div>
          <div className="result-value">
            {results.loanToValue.toFixed(1)}%
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-icon">💰</div>
          <div className="result-label">החזר מההכנסה</div>
          <div className="result-value">
            {results.paymentToIncome.toFixed(1)}%
          </div>
        </div>
      </div>
      
      <div className="warnings-section">
        <h3>
          {results.warnings[0].startsWith('✅') ? 'סטטוס' : 'נקודות לתשומת לב'}
        </h3>
        <div className="warnings-list">
          {results.warnings.map((warning, index) => (
            <div 
              key={index} 
              className={`warning-item ${warning.startsWith('✅') ? 'success' : 'warning'}`}
            >
              <p>{warning}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="next-steps">
        <h3>השלבים הבאים</h3>
        <ul>
          <li>📞 שיחת ייעוץ ראשונית (ללא עלות)</li>
          <li>📄 הכנת מסמכים ואישורים</li>
          <li>🏦 בדיקת תנאים בבנקים השונים</li>
          <li>✍️ הגשת בקשה למשכנתא</li>
        </ul>
      </div>
    </div>
  );
};
