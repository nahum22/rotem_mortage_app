# Rotem Mortgage App - AI Agent Instructions

## Project Overview
This is a Hebrew-language mortgage calculator web app built with React 19 + TypeScript + Vite. The app guides Israeli homebuyers through a multi-step mortgage analysis workflow with real-time interest rate data from Bank of Israel.

## Architecture & Data Flow

### State Management Pattern
The app uses **lifted state** in [App.tsx](../src/App.tsx) (no Redux/Context). Main state includes:
- `results: MortgageResult | null` - core calculation output
- `selectedOption: 'stable' | 'balanced' | 'saving' | null` - tracks user's chosen mortgage mix
- `mixOptions: MixOption[]` - three pre-calculated mortgage mix scenarios
- `estimatedSaving: number` - savings compared to baseline

### Component Flow (4-Step Funnel)
1. **MortgageCalculator** → User inputs → `handleCalculate()` → async API call
2. **Results** → Displays warnings/validation + scrolls to results section
3. **MixOptions** → Shows 3 mortgage mix options → `handleOptionSelect()`
4. **FinalSummary** → Shows selected option + potential savings → CTA for consultation

Key behavior: Each calculation triggers smooth scrolling to relevant section using `document.getElementById().scrollIntoView()`.

## Critical Calculation Logic ([calculations.ts](../src/utils/calculations.ts))

### External API Integration
- **Bank of Israel Interest Rates**: `fetchInterestRates()` calls `https://www.boi.org.il/PublicApi/GetInterest`
- Returns `InterestRates` with: `prime`, `fixed5Years`, `variable`, `lastUpdated`
- **Fallback strategy**: Default rates (4.5%, 5.2%, 3.8%) if API fails - never block the UI

### Mortgage Math
- Formula: `M = P * [r(1+r)^n] / [(1+r)^n - 1]` in `calculateMonthlyPayment()`
- Default term: 25 years (300 payments)
- **Weighted average rate**: 60% fixed + 40% variable for balanced calculations

### Validation Rules (Israeli Banking Standards)
| Deal Type | Max LTV | Payment/Income |
|-----------|---------|----------------|
| First-time buyer | 75% | 35% |
| Upgrade | 70% | 35% |
| Investment | 50% | 35% |

Warnings trigger when:
- LTV exceeds limits (shows exact shortfall in ₪)
- Payment-to-income > 35%
- Loan > 2M ₪ (requires "mashkanta meshulevet" - mixed bank/non-bank loan)
- Investment property with > 50% financing

### Mix Options Strategy
Three pre-built scenarios (calculated in `calculateMixOptions()`):
1. **Stable** (🟦): 100% fixed rate - lowest volatility, highest cost
2. **Balanced** (🟨): 60% fixed / 40% variable - **recommended by default**
3. **Saving** (🟩): 30% fixed / 70% variable - highest volatility, lowest cost

## Hebrew/RTL Conventions
- All user-facing text is in Hebrew (component content, labels, warnings)
- Use `toLocaleString('he-IL')` for all number formatting (₪ symbol, comma separators)
- CSS has RTL support via `direction: rtl` in layout components
- Comments in code are also Hebrew for domain logic

## Development Workflows

### Run & Build
```bash
npm run dev      # Start dev server (default: http://localhost:5173)
npm run build    # TypeScript check + production build
npm run preview  # Preview production build locally
npm run lint     # ESLint check
```

### State Debugging Pattern
When debugging calculations, check the async flow:
1. `handleCalculate()` → sets `isLoading`
2. `calculateMortgage()` → fetches interest rates → calculates
3. `calculateMixOptions()` → generates 3 scenarios
4. State update triggers Results render → scroll to results

Common issue: If interest rates seem stale, check `results.interestRates.lastUpdated` timestamp.

## Styling Architecture
- Component-scoped CSS files ([ComponentName.css](../src/components/MortgageCalculator.css))
- No CSS-in-JS or utility frameworks
- Color-coded volatility indicators:
  - Low (🟦): `#4a90e2`
  - Medium (🟨): `#f5a623`
  - High (🟩): `#7ed321`

## Key Files Reference
- [calculations.ts](../src/utils/calculations.ts) - All financial logic, API integration
- [App.tsx](../src/App.tsx) - State orchestration, event handlers, scroll behavior
- [MortgageCalculator.tsx](../src/components/MortgageCalculator.tsx) - Form input with live down payment % calculation
- [Results.tsx](../src/components/Results.tsx) - Result cards + warnings display
- [MixOptions.tsx](../src/components/MixOptions.tsx) - 3-option selector with volatility badges

## Future Enhancements (Not Yet Implemented)
- Backend service (`src/services/` exists but empty)
- Persistent storage (localStorage/database)
- User authentication
- CRM integration for consultation booking

## When Adding Features
1. Keep all financial calculations in `calculations.ts` - never inline complex math in components
2. Maintain async/await pattern for calculations (enables future API expansion)
3. Add new warnings to the `warnings` array in `calculateMortgage()` result
4. For new mix strategies, extend `MixOption` type and update `calculateMixOptions()`
5. Test with realistic Israeli mortgage scenarios (e.g., 1.5M ₪ property, 25% down, 20K ₪/mo income)
