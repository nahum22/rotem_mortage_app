import React from 'react';
import './FinalSummary.css';

interface FinalSummaryProps {
  selectedOption: 'stable' | 'balanced' | 'saving';
  estimatedSaving: number;
  onConsultation: () => void;
}

export const FinalSummary: React.FC<FinalSummaryProps> = ({
  selectedOption,
  estimatedSaving,
  onConsultation
}) => {
  const getOptionName = () => {
    switch (selectedOption) {
      case 'stable': return 'יציבות';
      case 'balanced': return 'איזון';
      case 'saving': return 'חיסכון';
    }
  };

  return (
    <div className="final-summary-container">
      <div className="summary-header">
        <h2>✨ מה המשמעות בפועל?</h2>
        <p className="selected-option-text">
          בחרת באופציית: <strong>{getOptionName()}</strong>
        </p>
      </div>

      <div className="saving-highlight">
        <div className="saving-label">חיסכון פוטנציאלי משוער</div>
        <div className="saving-amount">
          ₪{estimatedSaving.toLocaleString('he-IL')}
        </div>
        <div className="saving-subtitle">לאורך כל תקופת המשכנתא</div>
      </div>

      <div className="explanation-section">
        <h3> הפער הזה נוצר לא בגלל "ריבית סודית"</h3>
        <div className="explanation-points">
          <div className="point">
            <span className="point-icon">📊</span>
            <div className="point-content">
              <strong>תכנון נכון של תמהיל</strong>
              <p>שילוב חכם של מסלולי ריבית שונים (קבועה, משתנה, פריים)</p>
            </div>
          </div>

          <div className="point">
            <span className="point-icon">🏦</span>
            <div className="point-content">
              <strong>עבודה מול כמה בנקים</strong>
              <p>השוואה ומשא ומתן מקצועי למציאת התנאים הטובים ביותר</p>
            </div>
          </div>

          <div className="point">
            <span className="point-icon">⚖️</span>
            <div className="point-content">
              <strong>הבנה של סיכונים והזדמנויות</strong>
              <p>איזון בין חיסכון פוטנציאלי לבין רמת הסיכון המתאימה לך</p>
            </div>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <button className="cta-button" onClick={onConsultation}>
          ⬇️ להמשך תהליך
        </button>
        <p className="disclaimer-text">
          * הבדיקה הראשונית אינה מחייבת
        </p>
      </div>

      <div className="contact-section">
        <div className="contact-card">
          <h4>📞 צור קשר עכשיו</h4>
          <p className="contact-name"> רותם נחום - יועצת משכנתאות </p>
          <div className="contact-methods">
            <a href="tel:0504453366" className="contact-link phone">
              📱 050-4453366
            </a>
            <a href="mailto:rotem@example.com" className="contact-link email">
              ✉️ rotem1.shalem@gmail.com
            </a>
            <a href="https://wa.me/9720501234567" className="contact-link whatsapp" target="_blank" rel="noopener noreferrer">
              💬 שלח הודעת WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="trust-section">
        <h4>למה לבחור בי?</h4>
        <div className="trust-points">
          <div className="trust-point">
            <span>✓</span>
            <span>ניסיון של למעלה מ-10 שנים</span>
          </div>
          <div className="trust-point">
            <span>✓</span>
            <span>מאות משפחות מרוצות</span>
          </div>
          <div className="trust-point">
            <span>✓</span>
            <span>ייעוץ ראשוני ללא התחייבות</span>
          </div>
          <div className="trust-point">
            <span>✓</span>
            <span>שקיפות מלאה ללא עלויות נסתרות</span>
          </div>
        </div>
      </div>
    </div>
  );
};
