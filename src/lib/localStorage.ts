export interface Expense {
    id: string;
    amount: number;
    description: string;
    category: string;
    date: string;
    type: 'manual' | 'upload';
    createdAt: string;
  }
  
  const STORAGE_KEY = 'expenses';
  
  export const saveExpense = (expense: Omit<Expense, 'id' | 'createdAt'>): Expense => {
    const expenses = getExpenses();
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    
    expenses.push(newExpense);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    return newExpense;
  };
  
  export const getExpenses = (): Expense[] => {
    const expenses = localStorage.getItem(STORAGE_KEY);
    return expenses ? JSON.parse(expenses) : [];
  };
  
  export const deleteExpense = (id: string): void => {
    const expenses = getExpenses();
    const filteredExpenses = expenses.filter(expense => expense.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredExpenses));
  };
  
  export const updateExpense = (id: string, updatedExpense: Partial<Expense>): Expense => {
    const expenses = getExpenses();
    const expenseIndex = expenses.findIndex(expense => expense.id === id);
    
    if (expenseIndex === -1) {
      throw new Error('Expense not found');
    }
    
    const updatedExpenses = [...expenses];
    updatedExpenses[expenseIndex] = {
      ...updatedExpenses[expenseIndex],
      ...updatedExpense
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedExpenses));
    return updatedExpenses[expenseIndex];
  };