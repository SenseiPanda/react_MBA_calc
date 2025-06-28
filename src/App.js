import React, { useState, useEffect, useCallback } from 'react';
import './App.css';



const SliderComponent = React.memo(({ label, field, min, max, step, value, onChange, isPercentage = false }) => {

  const formatNumber = (value, isPercentage = false) => {
    if (isPercentage) {
      return value + '%';
    }
    return Math.round(value / 1000) + 'K';
  };

  return (
    <div className="slider-container">
      <label className="slider-label">
        {label}: 
        <span className="slider-value">
          {formatNumber(value, isPercentage)}
        </span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(field, parseFloat(e.target.value))}
        className="slider"
      />
    </div>
  );
});
const App = () => {
  // State for all input values
  const [values, setValues] = useState({
    expenses: 0,
    amountBorrowed: 0,
    interestRate: 5,
    currentSalary: 0,
    expectedSalary: 0,
    expectedSigningBonus: 0,
    compInSchool: 0
  });

  // State for calculated results
  const [results, setResults] = useState({
    totalInterest: 0,
    totalMBAInvestment: 0,
    netForgoneIncome: 0,
    totalReturn: 0
  });

  // Constants
  const INFLATION_RATE = 0.025;
  const LOAN_TERM = 120; // 10 years in months
  const TIME_OFF = 2; // time off in years
  const WAGE_GROWTH_MBA = 0.08; // 8% wage growth for elite MBA graduates
  const WAGE_GROWTH_NO_MBA = 0.05; // 5% wage growth for non-MBA graduates

  // Calculate loan interest
  const calculateLoanInterest = (amountBorrowed, interestRate) => {
    if (!amountBorrowed || !interestRate) return 0;
    
    const realRate = (interestRate / 100) - INFLATION_RATE;
    const monthlyRate = realRate / 12;
    
    if (monthlyRate <= 0) return 0;
    
    const onePlusR = 1 + monthlyRate;
    const onePlusRtoN = Math.pow(onePlusR, LOAN_TERM);
    
    const monthlyPayment = amountBorrowed * (monthlyRate * onePlusRtoN) / (onePlusRtoN - 1);
    const totalPayments = monthlyPayment * LOAN_TERM;
    const totalInterest = totalPayments - amountBorrowed;
    
    return totalInterest;
  };

  // Calculate total MBA investment
  const calculateTotalMBAInvestment = (currentSalary, expenses, interest, compInSchool) => {
    return (currentSalary * TIME_OFF) + interest + expenses - compInSchool;
  };

  // Calculate net forgone income
  const calculateNetForgoneIncome = (currentSalary) => {
    return currentSalary * TIME_OFF;
  };

  // Calculate total return
  const calculateTotalReturn = (currentSalary, expectedSalary, expectedSigningBonus, compInSchool) => {
    if (!currentSalary || !expectedSalary) return 0;

    let mbaTotal = 0;
    let nonMbaTotal = 0;
    let mbaSalary = expectedSalary;
    let nonMbaSalary = currentSalary;

    for (let year = 1; year <= 10; year++) {
      if (year === 1) {
        mbaTotal += mbaSalary + expectedSigningBonus + compInSchool;
      } else {
        mbaTotal += mbaSalary;
      }
      nonMbaTotal += nonMbaSalary;
      mbaSalary *= (1 + WAGE_GROWTH_MBA);
      nonMbaSalary *= (1 + WAGE_GROWTH_NO_MBA);
    }

    return mbaTotal - nonMbaTotal;
  };

  // Format number for display


  // Format currency for results
  const formatCurrency = (value) => {
    return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

const handleInputChange = useCallback((field, value) => {
  setValues(prev => ({
    ...prev,
    [field]: value
  }));
}, []);

  // Calculate results whenever values change
  useEffect(() => {
    const totalInterest = calculateLoanInterest(values.amountBorrowed, values.interestRate);
    const totalMBAInvestment = calculateTotalMBAInvestment(
      values.currentSalary, 
      values.expenses, 
      totalInterest, 
      values.compInSchool
    );
    const netForgoneIncome = calculateNetForgoneIncome(values.currentSalary);
    const totalReturn = calculateTotalReturn(
      values.currentSalary,
      values.expectedSalary,
      values.expectedSigningBonus,
      values.compInSchool
    );

    setResults({
      totalInterest,
      totalMBAInvestment,
      netForgoneIncome,
      totalReturn
    });
  }, [values]);

  

  return (
    <div className="app-container">
      <div className="calculator-container">
        <h1 className="main-title">Daniel's MBA ROI Calculator</h1>
        
        <div className="content-grid">
          {/* Input Section */}
          <div className="inputs-section">
            <h2 className="section-title">Investment Inputs</h2>
             <SliderComponent
              label="Out of pocket expenses ($)"
              field="expenses"
              min={0}
              max={200000}
              step={1000}
              value={values.expenses}
              onChange={handleInputChange}
            />
            
            <SliderComponent
              label="Amount Borrowed ($)"
              field="amountBorrowed"
              min={0}
              max={200000}
              step={1000}
              value={values.amountBorrowed}
              onChange={handleInputChange}
            />
            
            <SliderComponent
              label="Interest Rate (%)"
              field="interestRate"
              min={0}
              max={15}
              step={0.1}
              value={values.interestRate}
              onChange={handleInputChange}
              isPercentage={true}
            />
            
            <SliderComponent
              label="Current Salary ($)"
              field="currentSalary"
              min={0}
              max={300000}
              step={1000}
              value={values.currentSalary}
              onChange={handleInputChange}
            />
            
            <SliderComponent
              label="Expected Starting Salary ($)"
              field="expectedSalary"
              min={0}
              max={500000}
              step={1000}
              value={values.expectedSalary}
              onChange={handleInputChange}
            />
            
            <SliderComponent
              label="Expected Signing Bonus ($)"
              field="expectedSigningBonus"
              min={0}
              max={100000}
              step={500}
              value={values.expectedSigningBonus}
              onChange={handleInputChange}
            />
            
            <SliderComponent
              label="Compensation While in School ($)"
              field="compInSchool"
              min={0}
              max={100000}
              step={500}
              value={values.compInSchool}
              onChange={handleInputChange}
            />
          </div>


          {/* Results Section */}
          <div className="results-section">
            <h2 className="section-title results-title">Calculated Results</h2>
            
            <div className="result-card">
              <div className="result-label">Total Interest</div>
              <div className="result-value interest">
                ${formatCurrency(results.totalInterest)}
              </div>
            </div>
            
            <div className="result-card">
              <div className="result-label">Total MBA Investment</div>
              <div className="result-subtitle">
                (tuition + living cost + interest + forgone income)
              </div>
              <div className="result-value investment">
                ${formatCurrency(results.totalMBAInvestment)}
              </div>
            </div>
            
            <div className="result-card">
              <div className="result-label">Net Forgone Income</div>
              <div className="result-value forgone">
                ${formatCurrency(results.netForgoneIncome)}
              </div>
            </div>
            
            <div className="result-card">
              <div className="result-label">Total Return (10 years)</div>
              <div className="result-value return">
                ${formatCurrency(results.totalReturn)}
              </div>
            </div>
            
            {/* ROI Summary */}
            <div className="roi-summary">
              <div className="roi-label">Return on Investment</div>
              <div className="roi-value">
                ${formatCurrency(results.totalReturn)}
              </div>
              <div className="roi-status">
                {results.totalReturn > 0 ? 'Positive ROI' : 'Negative ROI'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Assumptions Footer */}
        <div className="assumptions">
          <h3 className="assumptions-title">Key Assumptions:</h3>
          <div className="assumptions-grid">
            <div>• MBA wage growth: 8% annually</div>
            <div>• Non-MBA wage growth: 5% annually</div>
            <div>• Time off for MBA: 2 years</div>
            <div>• Loan term: 10 years</div>
            <div>• Inflation rate: 2.5%</div>
            <div>• Analysis period: 10 years post-MBA</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

