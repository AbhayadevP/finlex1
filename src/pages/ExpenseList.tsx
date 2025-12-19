import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, Plus, Trash2, Download, Edit, Receipt } from 'lucide-react';
import { getExpenses, deleteExpense } from '../lib/localStorage';

const ExpenseList = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    type: 'all',
    dateRange: 'all',
    minAmount: '',
    maxAmount: '',
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc'
  });
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    highest: 0,
    manual: 0,
    upload: 0
  });

  // Load expenses from localStorage
  useEffect(() => {
    const loadExpenses = () => {
      setLoading(true);
      try {
        const loadedExpenses = getExpenses();
        setExpenses(loadedExpenses);
        setFilteredExpenses(loadedExpenses);
        calculateStats(loadedExpenses);
      } catch (error) {
        console.error('Error loading expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExpenses();
    // Set up interval to refresh data every few seconds (helpful if other pages add expenses)
    const interval = setInterval(loadExpenses, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Calculate expense statistics
  const calculateStats = (expensesList) => {
    if (expensesList.length === 0) {
      setStats({
        total: 0,
        average: 0,
        highest: 0,
        manual: 0,
        upload: 0
      });
      return;
    }

    const total = expensesList.reduce((sum, expense) => sum + expense.amount, 0);
    const average = total / expensesList.length;
    const highest = Math.max(...expensesList.map(expense => expense.amount));
    const manual = expensesList.filter(expense => expense.type === 'manual').length;
    const upload = expensesList.filter(expense => expense.type === 'upload').length;

    setStats({
      total,
      average,
      highest,
      manual,
      upload
    });
  };

  // Apply filters to expenses
  useEffect(() => {
    let result = [...expenses];

    // Apply category filter
    if (filters.category !== 'all') {
      result = result.filter(expense => expense.category === filters.category);
    }

    // Apply type filter
    if (filters.type !== 'all') {
      result = result.filter(expense => expense.type === filters.type);
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(today.getDate() - 90);

      if (filters.dateRange === 'last30days') {
        result = result.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= thirtyDaysAgo;
        });
      } else if (filters.dateRange === 'last90days') {
        result = result.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= ninetyDaysAgo;
        });
      }
    }

    // Apply amount range filter
    if (filters.minAmount !== '') {
      result = result.filter(expense => expense.amount >= parseFloat(filters.minAmount));
    }

    if (filters.maxAmount !== '') {
      result = result.filter(expense => expense.amount <= parseFloat(filters.maxAmount));
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortConfig.key === 'date') {
        return sortConfig.direction === 'asc' 
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      } else if (sortConfig.key === 'amount') {
        return sortConfig.direction === 'asc'
          ? a.amount - b.amount
          : b.amount - a.amount;
      } else if (sortConfig.key === 'description') {
        return sortConfig.direction === 'asc'
          ? a.description.localeCompare(b.description)
          : b.description.localeCompare(a.description);
      }
      return 0;
    });

    setFilteredExpenses(result);
    calculateStats(result);
  }, [expenses, filters, sortConfig]);

  // Handle expense deletion
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      deleteExpense(id);
      setExpenses(prevExpenses => prevExpenses.filter(expense => expense.id !== id));
    }
  };

  // Handle editing an expense
  const handleEdit = (expense) => {
    // Navigate to edit page or you can implement an edit modal
    // For now, we'll just display an alert
    alert(`Editing expense: ${expense.description}`);
    // You could expand this functionality with:
    // navigate(`/expenses/edit/${expense.id}`, { state: { expense } });
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      category: 'all',
      type: 'all',
      dateRange: 'all',
      minAmount: '',
      maxAmount: '',
    });
  };

  // Export expenses to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Amount', 'Description', 'Category', 'Type'];
    const csvData = [
      headers.join(','),
      ...filteredExpenses.map(expense => [
        expense.date,
        expense.amount,
        `"${expense.description.replace(/"/g, '""')}"`,
        expense.category,
        expense.type
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get unique categories for filter dropdown
  const categories = ['all', ...new Set(expenses.map(expense => expense.category))];

  // Handle sort change
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-700">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <Receipt className="h-8 w-8 text-blue-500 mr-3" />
              <h1 className="text-2xl font-bold text-white">Your Expenses</h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                className="flex items-center py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-colors"
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-colors"
              >
                <Download className="h-5 w-5 mr-2" />
                Export
              </button>
              <button
                onClick={() => navigate('/expenses/manual')}
                className="flex items-center py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Expense
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
              <div className="text-gray-400 text-sm mb-1">Total Expenses</div>
              <div className="text-2xl font-bold text-white">₹{stats.total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
              <div className="text-gray-400 text-sm mb-1">Average Amount</div>
              <div className="text-2xl font-bold text-white">₹{stats.average.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
              <div className="text-gray-400 text-sm mb-1">Manual Entries</div>
              <div className="text-2xl font-bold text-white">{stats.manual}</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
              <div className="text-gray-400 text-sm mb-1">Bill Uploads</div>
              <div className="text-2xl font-bold text-white">{stats.upload}</div>
            </div>
          </div>

          {/* Filter Panel */}
          {filterMenuOpen && (
            <div className="bg-gray-700 rounded-lg p-6 mb-8 border border-gray-600">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">Filter Expenses</h3>
                <button 
                  onClick={resetFilters}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Reset Filters
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 px-3 text-white"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({...filters, type: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 px-3 text-white"
                  >
                    <option value="all">All Types</option>
                    <option value="manual">Manual Entry</option>
                    <option value="upload">Bill Upload</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date Range
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 px-3 text-white"
                  >
                    <option value="all">All Time</option>
                    <option value="last30days">Last 30 Days</option>
                    <option value="last90days">Last 90 Days</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Min Amount
                  </label>
                  <input
                    type="number"
                    value={filters.minAmount}
                    onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 px-3 text-white"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Amount
                  </label>
                  <input
                    type="number"
                    value={filters.maxAmount}
                    onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 px-3 text-white"
                    placeholder="No limit"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Expenses Table */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-16 bg-gray-700/30 rounded-lg border border-gray-600">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No expenses found</h3>
              <p className="text-gray-400 max-w-md mx-auto mb-6">
                You haven't recorded any expenses yet or there are no expenses matching your filters.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => navigate('/expenses/manual')}
                  className="inline-flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Manual Expense
                </button>
                <button
                  onClick={() => navigate('/expenses/upload')}
                  className="inline-flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Bill
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-700">
                    <th className="pb-3 cursor-pointer" onClick={() => requestSort('date')}>
                      <div className="flex items-center">
                        Date
                        {sortConfig.key === 'date' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="pb-3 cursor-pointer" onClick={() => requestSort('amount')}>
                      <div className="flex items-center">
                        Amount
                        {sortConfig.key === 'amount' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="pb-3 cursor-pointer" onClick={() => requestSort('description')}>
                      <div className="flex items-center">
                        Description
                        {sortConfig.key === 'description' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map(expense => (
                    <tr 
                      key={expense.id} 
                      className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="py-4 text-white">
                        {format(parseISO(expense.date), 'dd MMM yyyy')}
                      </td>
                      <td className="py-4 text-white">
                        ₹{expense.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 text-white max-w-xs truncate">{expense.description}</td>
                      <td className="py-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                          {expense.category}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          expense.type === 'manual' 
                            ? 'bg-blue-900/30 text-blue-300' 
                            : 'bg-indigo-900/30 text-indigo-300'
                        }`}>
                          {expense.type === 'manual' ? 'Manual' : 'Bill Upload'}
                        </span>
                      </td>
                      <td className="py-4 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="text-gray-400 hover:text-blue-400 transition-colors p-1"
                          title="Edit Expense"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="text-gray-400 hover:text-red-400 transition-colors p-1"
                          title="Delete Expense"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination could be added here if needed */}
          {filteredExpenses.length > 0 && (
            <div className="mt-6 flex justify-between items-center text-sm text-gray-400">
              <div>
                Showing {filteredExpenses.length} of {expenses.length} expenses
              </div>
              {/* Pagination controls could go here */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseList;