// src/components/AIBudgetAdvisor.tsx
import React, { useState, useEffect } from 'react';
import { TrendingUp, PieChart, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, subMonths } from 'date-fns';
import { getExpenses } from '../lib/localStorage';

interface BudgetAdvice {
  type: 'warning' | 'success' | 'tip';
  message: string;
  detail?: string;
}

interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  previousAmount: number;
}

const AIBudgetAdvisor = () => {
  const [loading, setLoading] = useState(true);
  const [advice, setAdvice] = useState<BudgetAdvice[]>([]);
  const [spending, setSpending] = useState<CategorySpending[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [previousTotal, setPreviousTotal] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    analyzeExpenses();
  }, []);

  const analyzeExpenses = () => {
    setLoading(true);

    const allExpenses = getExpenses();
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const previousMonthStart = startOfMonth(subMonths(now, 1));
    const previousMonthEnd = endOfMonth(subMonths(now, 1));

    const currentMonthExpenses = allExpenses.filter(expense => 
      isWithinInterval(parseISO(expense.date), { start: currentMonthStart, end: currentMonthEnd })
    );

    const previousMonthExpenses = allExpenses.filter(expense => 
      isWithinInterval(parseISO(expense.date), { start: previousMonthStart, end: previousMonthEnd })
    );

    const currentTotal = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const prevTotal = previousMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    setTotalSpent(currentTotal);
    setPreviousTotal(prevTotal);

    const categoryMap = new Map();
    currentMonthExpenses.forEach(expense => {
      const current = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, current + expense.amount);
    });

    const prevCategoryMap = new Map();
    previousMonthExpenses.forEach(expense => {
      const current = prevCategoryMap.get(expense.category) || 0;
      prevCategoryMap.set(expense.category, current + expense.amount);
    });

    const spendingAnalysis: CategorySpending[] = Array.from(categoryMap.entries()).map(([category, amount]) => {
      const percentage = currentTotal > 0 ? (amount as number / currentTotal) * 100 : 0;
      const previousAmount = prevCategoryMap.get(category) || 0;
      let trend: 'up' | 'down' | 'stable' = 'stable';

      if (previousAmount > 0) {
        const change = ((amount as number) - previousAmount) / previousAmount;
        if (change > 0.1) trend = 'up';
        else if (change < -0.1) trend = 'down';
      }

      return {
        category,
        amount: amount as number,
        percentage,
        trend,
        previousAmount
      };
    }).sort((a, b) => b.amount - a.amount);

    setSpending(spendingAnalysis);

    const adviceList: BudgetAdvice[] = [];

    if (currentTotal > prevTotal * 1.2 && prevTotal > 0) {
      adviceList.push({
        type: 'warning',
        message: 'Your spending has increased significantly',
        detail: `Your spending is up ${Math.round((currentTotal / prevTotal - 1) * 100)}% compared to last month.`
      });
    } else if (currentTotal < prevTotal * 0.8 && prevTotal > 0) {
      adviceList.push({
        type: 'success',
        message: 'Great job reducing your spending!',
        detail: `Your spending is down ${Math.round((1 - currentTotal / prevTotal) * 100)}% compared to last month.`
      });
    }

    spendingAnalysis.forEach(category => {
      if (category.percentage > 40) {
        adviceList.push({
          type: 'warning',
          message: `High spending in ${category.category}`,
          detail: `${category.category} makes up ${Math.round(category.percentage)}% of your spending. Consider setting a budget for this category.`
        });
      }

      if (category.trend === 'up' && category.previousAmount > 0) {
        const increase = ((category.amount - category.previousAmount) / category.previousAmount) * 100;
        if (increase > 30) {
          adviceList.push({
            type: 'warning',
            message: `Increased spending in ${category.category}`,
            detail: `Your spending in ${category.category} increased by ${Math.round(increase)}% compared to last month.`
          });
        }
      }
    });

    if (spendingAnalysis.length > 0) {
      if (spendingAnalysis.length < 3) {
        adviceList.push({
          type: 'tip',
          message: 'Try categorizing your expenses more specifically',
          detail: 'More detailed categories can help identify areas to save money.'
        });
      }

      const foodCategory = spendingAnalysis.find(c => c.category === 'Food & Dining');
      if (foodCategory && foodCategory.percentage > 25) {
        adviceList.push({
          type: 'tip',
          message: 'Consider meal planning to reduce food costs',
          detail: 'Planning meals in advance can reduce restaurant spending and food waste.'
        });
      }
    }

    if (currentMonthExpenses.length < 5) {
      adviceList.push({
        type: 'tip',
        message: 'Add more expenses for better insights',
        detail: 'The more expenses you track, the better budgeting advice we can provide.'
      });
    }

    setAdvice(adviceList);
    setLoading(false);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-700 mt-8">
      <div className="flex items-center mb-8">
        <TrendingUp className="h-8 w-8 text-blue-500 mr-3" />
        <h2 className="text-2xl font-bold text-white">AI Budget Advisor</h2>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">This Month's Spending</h3>
              {previousTotal > 0 && (
                <div className={`flex items-center text-sm ${totalSpent > previousTotal ? 'text-red-400' : 'text-green-400'}`}>
                  {totalSpent > previousTotal ? 
                    <>Up {Math.round((totalSpent / previousTotal - 1) * 100)}% from last month</> : 
                    <>Down {Math.round((1 - totalSpent / previousTotal) * 100)}% from last month</>
                  }
                </div>
              )}
            </div>

            <div className="bg-gray-700/50 rounded-lg p-6">
              <div className="text-3xl font-bold text-white mb-4">₹{totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>

              <div className="space-y-3">
                {spending.slice(0, 3).map(category => (
                  <div key={category.category} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span className="text-gray-300">{category.category}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-white font-medium mr-2">
                        ₹{category.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                      <span className="text-gray-400 text-sm">
                        ({Math.round(category.percentage)}%)
                      </span>
                      {category.trend === 'up' && (
                        <TrendingUp className="w-4 h-4 ml-2 text-red-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {spending.length > 3 && (
                <button 
                  onClick={() => setShowDetails(!showDetails)}
                  className="mt-4 text-blue-400 hover:text-blue-300 text-sm flex items-center"
                >
                  {showDetails ? 'Hide details' : 'Show all categories'}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </button>
              )}

              {showDetails && (
                <div className="mt-4 pt-4 border-t border-gray-600 space-y-3">
                  {spending.slice(3).map(category => (
                    <div key={category.category} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
                        <span className="text-gray-300">{category.category}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-white font-medium mr-2">
                          ₹{category.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-gray-400 text-sm">
                          ({Math.round(category.percentage)}%)
                        </span>
                        {category.trend === 'up' && (
                          <TrendingUp className="w-4 h-4 ml-2 text-red-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-4">Personalized Budget Advice</h3>

            {advice.length === 0 ? (
              <div className="bg-gray-700/50 rounded-lg p-6 text-center text-gray-400">
                <PieChart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Add more expenses to receive personalized budget advice.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {advice.map((item, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border ${
                      item.type === 'warning' 
                        ? 'bg-red-900/20 border-red-800/50 text-red-200' 
                        : item.type === 'success' 
                          ? 'bg-green-900/20 border-green-800/50 text-green-200'
                          : 'bg-blue-900/20 border-blue-800/50 text-blue-200'
                    }`}
                  >
                    <div className="flex items-start">
                      {item.type === 'warning' ? (
                        <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                      ) : item.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                      ) : (
                        <PieChart className="w-5 h-5 mr-2 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">{item.message}</p>
                        {item.detail && <p className="text-sm mt-1 opacity-90">{item.detail}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AIBudgetAdvisor;
