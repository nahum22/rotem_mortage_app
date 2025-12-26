import { useState } from 'react'
import './App.css'
import { MortgageCalculator } from './components/MortgageCalculator'
import { Results } from './components/Results'
import { PieComparison } from './components/PieComparison'
import type { MortgageInputs, MortgageResult } from './utils/calculations'
import { calculateMortgage } from './utils/calculations'

function App() {
  const [results, setResults] = useState<MortgageResult | null>(null)

  const handleCalculate = (inputs: MortgageInputs) => {
    const calculatedResults = calculateMortgage(inputs)
    setResults(calculatedResults)
    
    // Scroll to results
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }, 100)
  }

  const handleReset = () => {
    setResults(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app">
      <MortgageCalculator onCalculate={handleCalculate} />
      
      {results && (
        <div id="results">
          
          <PieComparison loanAmount={results.loanAmount} years={25} />
          
          <Results results={results} />
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
