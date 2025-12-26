import React from 'react';
import './MixOptions.css';

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

interface MixOptionsProps {
  options: MixOption[];
  onSelect: (optionId: 'stable' | 'balanced' | 'saving') => void;
}

export const MixOptions: React.FC<MixOptionsProps> = ({ options, onSelect }) => {
  const getVolatilityColor = (volatility: string) => {
    switch (volatility) {
      case 'low': return '#4a90e2';
      case 'medium': return '#f5a623';
      case 'high': return '#7ed321';
      default: return '#999';
    }
  };

  return (
    <div className="mix-options-container">
      <div className="mix-options-header">
        <h2>🎯 שלוש אפשרויות – שלוש רמות גמישות</h2>
        <p className="mix-subtitle">בחר את התמהיל המתאים לך ביותר</p>
      </div>

      <div className="options-grid">
        {options.map((option) => (
          <div
            key={option.id}
            className={`option-card ${option.id} ${option.recommended ? 'recommended' : ''}`}
            style={{ borderColor: getVolatilityColor(option.volatility) }}
          >
            {option.recommended && (
              <div className="recommended-badge">
                ⭐ מומלץ
              </div>
            )}

            <div className="option-header" style={{ color: getVolatilityColor(option.volatility) }}>
              <span className="option-icon">{option.icon}</span>
              <h3>{option.name}</h3>
            </div>

            <div className="option-details">
              <div className="detail-row">
                <span className="detail-label">החזר חודשי:</span>
                <span className="detail-value">
                  ₪{option.monthlyPayment.toLocaleString('he-IL')}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">עלות כוללת:</span>
                <span className="detail-value">
                  ₪{option.totalCost.toLocaleString('he-IL')}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">תנודתיות:</span>
                <span 
                  className="detail-value volatility"
                  style={{ color: getVolatilityColor(option.volatility) }}
                >
                  {option.volatilityText}
                </span>
              </div>
            </div>

            <p className="option-description">{option.description}</p>

            <button
              className="select-button"
              style={{ 
                backgroundColor: getVolatilityColor(option.volatility),
                borderColor: getVolatilityColor(option.volatility)
              }}
              onClick={() => onSelect(option.id)}
            >
              בחר אופציה זו
            </button>
          </div>
        ))}
      </div>

      <div className="mix-info-section">
        <p className="info-text">
          💡 <strong>טיפ:</strong> אופציית האיזון משלבת יציבות עם חיסכון פוטנציאלי,
          ומתאימה לרוב המשפחות בישראל.
        </p>
      </div>
    </div>
  );
};
