import { useState } from 'react'
import './App.css'
import { MortgageCalculator } from './components/MortgageCalculator'
import { Results } from './components/Results'
import { PieComparison } from './components/PieComparison'
import { MixOptions } from './components/MixOptions'
import { FinalSummary } from './components/FinalSummary'
import type { MortgageInputs, MortgageResult } from './utils/calculations'
import { calculateMortgage, calculateMixOptions, calculatePotentialSaving } from './utils/calculations'

function App() {
  const [results, setResults] = useState<MortgageResult | null>(null)
  const [selectedOption, setSelectedOption] = useState<'stable' | 'balanced' | 'saving' | null>(null)

  const handleCalculate = (inputs: MortgageInputs) => {
    const calculatedResults = calculateMortgage(inputs)
    setResults(calculatedResults)
    setSelectedOption(null) // איפוס הבחירה בעת חישוב חדש
    
    // Scroll to results
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }, 100)
  }

  const handleOptionSelect = (optionId: 'stable' | 'balanced' | 'saving') => {
    setSelectedOption(optionId)
    
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
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // חישוב אופציות תמהיל אם יש תוצאות
  const mixOptions = results ? calculateMixOptions(results.loanAmount) : []
  
  // חישוב חיסכון פוטנציאלי
  const estimatedSaving = results && selectedOption 
    ? calculatePotentialSaving(results.loanAmount, selectedOption)
    : 0

  return (
    <div className="app">
      <MortgageCalculator onCalculate={handleCalculate} />
      
      {results && (
        <div id="results">
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
        <p>💼 יועץ משכנתאות מקצועי | רוטם</p>
        <p className="footer-note">לייעוץ אישי חייגו: 050-1234567</p>
      </footer>
    </div>
  )
}

export default App
