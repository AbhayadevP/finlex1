// src/pages/ManualExpenseEntry.tsx
import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Receipt, Save, ArrowLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { saveExpense, getExpenses, deleteExpense } from '../lib/localStorage';
import AIBudgetAdvisor from '../components/AIBudgetAdvisor'; // Import the new component

interface ExpenseFormData {
  amount: string;
  description: string;
  category: string;
  date: string;
}

const categories = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Travel',
  'Other'
];

const ManualExpenseEntry = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: '',
    description: '',
    category: categories[0],
    date: format(new Date(), 'yyyy-MM-dd')
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [showBudgetAdvisor, setShowBudgetAdvisor] = useState(true);

  useEffect(() => {
    // Load expenses when component mounts
    const loadedExpenses = getExpenses();
    setExpenses(loadedExpenses);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      deleteExpense(id);
      setExpenses(prevExpenses => prevExpenses.filter(expense => expense.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const newExpense = saveExpense({
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category,
        date: formData.date,
        type: 'manual'
      });

      setExpenses(prev => [newExpense, ...prev]);
      setSuccess(true);
      setFormData({
        amount: '',
        description: '',
        category: categories[0],
        date: format(new Date(), 'yyyy-MM-dd')
      });

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError('Failed to save expense. Please try again.');
      console.error('Error saving expense:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-700">
            <div className="flex items-center mb-8">
              <Receipt className="h-8 w-8 text-blue-500 mr-3" />
              <h1 className="text-2xl font-bold text-white">Manual Expense Entry</h1>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-900/50 border border-green-700 rounded-lg text-green-200">
                Expense saved successfully!
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="pl-8 w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter expense description"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg text-white text-sm font-medium ${
                  loading
                    ? 'bg-blue-600/50 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Expense
                  </>
                )}
              </button>
            </form>
          </div>

          <div>
            <div className="bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-6">Recent Expenses</h2>
              <div className="space-y-4">
                {expenses.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No expenses recorded yet</p>
                ) : (
                  expenses.slice(0, 5).map(expense => (
                    <div
                      key={expense.id}
                      className="bg-gray-700/50 rounded-lg p-4 flex justify-between items-start"
                    >
                      <div>
                        <div className="flex items-center mb-2">
                          <span className="text-white font-medium">₹{expense.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                          <span className="mx-2 text-gray-500">•</span>
                          <span className="text-gray-400">{format(parseISO(expense.date), 'dd MMM yyyy')}</span>
                        </div>
                        <p className="text-gray-300">{expense.description}</p>
                        <div className="mt-2 flex items-center">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-600 text-gray-300">
                            {expense.category}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete Expense"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
              {expenses.length > 5 && (
                <button 
                  onClick={() => navigate('/expenses')}
                  className="w-full mt-4 text-sm text-gray-400 hover:text-white flex items-center justify-center"
                >
                  View all expenses
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              )}
            </div>
            
            {/* Toggle for AI Budget Advisor */}
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={() => setShowBudgetAdvisor(!showBudgetAdvisor)}
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
              >
                {showBudgetAdvisor ? 'Hide AI Budget Advisor' : 'Show AI Budget Advisor'}
              </button>
            </div>
            
            {/* AI Budget Advisor Component */}
            {showBudgetAdvisor && (
              <AIBudgetAdvisor />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualExpenseEntry;