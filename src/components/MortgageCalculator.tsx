import React, { useState } from 'react';
import type { MortgageInputs } from '../utils/calculations';
import './MortgageCalculator.css';

interface MortgageCalculatorProps {
  onCalculate: (inputs: MortgageInputs) => void;
}

export const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({ onCalculate }) => {
  const [propertyPrice, setPropertyPrice] = useState<string>('');
  const [downPayment, setDownPayment] = useState<string>('');
  const [monthlyIncome, setMonthlyIncome] = useState<string>('');
  const [dealType, setDealType] = useState<'first' | 'upgrade' | 'investment'>('first');
  const [propertyType, setPropertyType] = useState<'apartment' | 'landAndHouse' | 'land'>('apartment');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const inputs: MortgageInputs = {
      propertyPrice: parseFloat(propertyPrice),
      downPayment: parseFloat(downPayment),
      monthlyIncome: parseFloat(monthlyIncome),
      dealType,
      propertyType
    };
    
    onCalculate(inputs);
  };

  const formatNumber = (value: string) => {
    const number = value.replace(/[^\d]/g, '');
    return number ? parseInt(number).toLocaleString('he-IL') : '';
  };

  const handleNumberInput = (value: string, setter: (val: string) => void) => {
    const cleanValue = value.replace(/[^\d]/g, '');
    setter(cleanValue);
  };

  const downPaymentPercent = propertyPrice && downPayment 
    ? ((parseFloat(downPayment) / parseFloat(propertyPrice)) * 100).toFixed(1)
    : '0';

  return (
    <div className="calculator-container">
      <div className="calculator-header">
        <h1>בדיקת התאמה למשכנתא בפחות משלוש דקות</h1>
        <p className="subtitle">קבל/י תמונת מצב מפורטת + שיחת יעוץ אישית</p>
      </div>

      <form onSubmit={handleSubmit} className="calculator-form">
        <div className="form-group">
          <label htmlFor="propertyType">
            <span className="label-icon">🏘️</span>
            סוג הנכס
          </label>
          <div className="input-wrapper">
            <select
              id="propertyType"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value as 'apartment' | 'landAndHouse' | 'land')}
              className="form-select"
              required
            >
              <option value="apartment">דירה / דירה בבניין</option>
              <option value="landAndHouse">מגרש + בית פרטי</option>
              <option value="land">מגרש בלבד</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="propertyPrice">
            <span className="label-icon">💰</span>
            {propertyType === 'land' ? 'שווי המגרש' : 
             propertyType === 'landAndHouse' ? 'שווי המגרש + הבית' : 
             'שווי הנכס'}
          </label>
          <div className="input-wrapper">
            <input
              type="text"
              id="propertyPrice"
              value={formatNumber(propertyPrice)}
              onChange={(e) => handleNumberInput(e.target.value, setPropertyPrice)}
              placeholder="לדוגמה: 1,500,000"
              required
            />
            <span className="input-suffix">₪</span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="downPayment">
            <span className="label-icon">💵</span>
            מקדמה (הון עצמי)
            {downPaymentPercent !== '0' && (
              <span className="percent-badge">{downPaymentPercent}%</span>
            )}
          </label>
          <div className="input-wrapper">
            <input
              type="text"
              id="downPayment"
              value={formatNumber(downPayment)}
              onChange={(e) => handleNumberInput(e.target.value, setDownPayment)}
              placeholder="לדוגמה: 400,000"
              required
            />
            <span className="input-suffix">₪</span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="monthlyIncome">
            <span className="label-icon">💼</span>
            הכנסה משפחתית חודשית
          </label>
          <div className="input-wrapper">
            <input
              type="text"
              id="monthlyIncome"
              value={formatNumber(monthlyIncome)}
              onChange={(e) => handleNumberInput(e.target.value, setMonthlyIncome)}
              placeholder="לדוגמה: 25,000"
              required
            />
            <span className="input-suffix">₪</span>
          </div>
        </div>

        <div className="form-group">
          <label>
            <span className="label-icon">📋</span>
            סוג העסקה
          </label>
          <div className="deal-type-options">
            <label className={`deal-option ${dealType === 'first' ? 'active' : ''}`}>
              <input
                type="radio"
                name="dealType"
                value="first"
                checked={dealType === 'first'}
                onChange={(e) => setDealType(e.target.value as 'first')}
              />
              <span className="option-content">
                <span className="option-icon">🎯</span>
                <span className="option-text">דירה ראשונה</span>
              </span>
            </label>

            <label className={`deal-option ${dealType === 'upgrade' ? 'active' : ''}`}>
              <input
                type="radio"
                name="dealType"
                value="upgrade"
                checked={dealType === 'upgrade'}
                onChange={(e) => setDealType(e.target.value as 'upgrade')}
              />
              <span className="option-content">
                <span className="option-icon">⬆️</span>
                <span className="option-text">שדרוג דיור</span>
              </span>
            </label>

            <label className={`deal-option ${dealType === 'investment' ? 'active' : ''}`}>
              <input
                type="radio"
                name="dealType"
                value="investment"
                checked={dealType === 'investment'}
                onChange={(e) => setDealType(e.target.value as 'investment')}
              />
              <span className="option-content">
                <span className="option-icon">💼</span>
                <span className="option-text">דירת השקעה</span>
              </span>
            </label>
          </div>
        </div>

        <button type="submit" className="calculate-button">
          <span>חשב אפשרויות משכנתא</span>
          <span className="button-icon">→</span>
        </button>
      </form>

      <div className="disclaimer">
        <p>⚠️ תוצאות אלו הן הערכה ראשונית בלבד ואינן מהוות התחייבות או אישור למשכנתא</p>
      </div>
    </div>
  );
};
