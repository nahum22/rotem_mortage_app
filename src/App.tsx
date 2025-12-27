import { useState } from 'react'
import './App.css'
import { MortgageCalculator } from './components/MortgageCalculator'
import { Results } from './components/Results'
import { PieComparison } from './components/PieComparison'
import { MixOptions } from './components/MixOptions'
import { FinalSummary } from './components/FinalSummary'
import type { MortgageInputs, MortgageResult, MixOption } from './utils/calculations'
import { calculateMortgage, calculateMixOptions, calculatePotentialSaving } from './utils/calculations'

function App() {
  const [results, setResults] = useState<MortgageResult | null>(null)
  const [selectedOption, setSelectedOption] = useState<'stable' | 'balanced' | 'saving' | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mixOptions, setMixOptions] = useState<MixOption[]>([])
  const [estimatedSaving, setEstimatedSaving] = useState<number>(0)

  const handleCalculate = async (inputs: MortgageInputs) => {
    setIsLoading(true)
    setResults(null)
    setMixOptions([])
    try {
      const calculatedResults = await calculateMortgage(inputs)
      setResults(calculatedResults)
      setSelectedOption(null)
      
      // חישוב אופציות תמהיל
      const options = await calculateMixOptions(calculatedResults.loanAmount)
      setMixOptions(options)
      
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        })
      }, 100)
    } catch (error) {
      console.error('Calculation error:', error)
      alert('אירעה שגיאה בחישוב. אנא נסה שוב.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOptionSelect = async (optionId: 'stable' | 'balanced' | 'saving') => {
    setSelectedOption(optionId)
    
    // חישוב חיסכון פוטנציאלי
    if (results) {
      const saving = await calculatePotentialSaving(results.loanAmount, optionId)
      setEstimatedSaving(saving)
    }
    
    // Scroll to final summary
    setTimeout(() => {
      document.getElementById('final-summary')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }, 100)
  }

  const handleConsultation = () => {
    // כאן ניתן להוסיף פעולה כמו פתיחת חלון צ'אט, שליחת טופס, וכו'
    window.open('tel:0501234567', '_self')
  }

  const handleReset = () => {
    setResults(null)
    setSelectedOption(null)
    setMixOptions([])
    setEstimatedSaving(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app">
      <MortgageCalculator onCalculate={handleCalculate} />
      
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '40px', fontSize: '1.2rem' }}>
          ⏳ מחשב את המשכנתא שלך...
        </div>
      )}
      
      {results && !isLoading && (
        <div id="results">
          {/* הצגת שיעורי ריבית עדכניים */}
          {results.interestRates && (
            <div className="interest-rates-display">
              <div className="rates-header">
                <div className="boi-logo">🏛️</div>
                <div className="rates-title">
                  <h4>שיעורי ריבית עדכניים</h4>
                  <p className="rates-source">
                    מקור: בנק ישראל | עדכון: {new Date(results.interestRates.lastUpdated).toLocaleDateString('he-IL', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              
              <div className="rates-grid">
                <div className="rate-item">
                  <span className="rate-label">ריבית בנק ישראל</span>
                  <span className="rate-value">{results.interestRates.prime?.toFixed(2) ?? '0.00'}%</span>
                </div>
                
                <div className="rate-item">
                  <span className="rate-label">קבועה 5 שנים</span>
                  <span className="rate-value">{results.interestRates.fixed5Years?.toFixed(2) ?? '0.00'}%</span>
                </div>
                
                <div className="rate-item">
                  <span className="rate-label">משתנה</span>
                  <span className="rate-value">{results.interestRates.variable?.toFixed(2) ?? '0.00'}%</span>
                </div>
              </div>
              
              <p className="rates-note">
                * שיעורי הריבית עשויים להשתנות בהתאם לסוג הנכס ומדיניות הבנק
              </p>
            </div>
          )}
          
          <PieComparison loanAmount={results.loanAmount} years={25} />
          
          <Results results={results} />
          
          {/* מסך 3: אופציות תמהיל */}
          <MixOptions 
            options={mixOptions} 
            onSelect={handleOptionSelect}
          />
          
          {/* מסך 4: סיכום סופי - מוצג רק אחרי בחירת אופציה */}
          {selectedOption && (
            <div id="final-summary">
              <FinalSummary
                selectedOption={selectedOption}
                estimatedSaving={estimatedSaving}
                onConsultation={handleConsultation}
              />
            </div>
          )}
          
          <div className="reset-section">
            <button onClick={handleReset} className="reset-button">
              חשב שוב עם נתונים אחרים
            </button>
          </div>
        </div>
      )}
      
      <footer className="app-footer">
        <p>💼 יועצת משכנתאות  | רותם נחום</p>
        <p className="footer-note">לייעוץ אישי חייגו: 050-4453366</p>
      </footer>
    </div>
  )
}

export default App
