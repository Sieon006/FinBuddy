// Report Calculation Utilities
import { Expense, Category } from '@/types/expense';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, addWeeks, subWeeks, addMonths, subMonths, eachDayOfInterval, isWithinInterval, parseISO } from 'date-fns';

export interface WeeklyReportData {
  weekStart: Date;
  weekEnd: Date;
  totalSpent: number;
  totalIncome: number;
  netBalance: number;
  topCategories: { category: string; amount: number; emoji: string }[];
  dayWiseSpending: { day: string; date: string; amount: number }[];
  transactions: Expense[];
}

export interface MonthlyReportData {
  month: Date;
  totalSpent: number;
  totalIncome: number;
  savings: number;
  categoryBreakdown: { category: string; amount: number; emoji: string; percentage: number }[];
  topTransactions: Expense[];
  transactions: Expense[];
}

export const getWeekRange = (date: Date): { start: Date; end: Date } => {
  // Week starts on Monday
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return { start, end };
};

export const getMonthRange = (date: Date): { start: Date; end: Date } => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return { start, end };
};

export const getPreviousWeek = (date: Date): Date => subWeeks(date, 1);
export const getNextWeek = (date: Date): Date => addWeeks(date, 1);
export const getPreviousMonth = (date: Date): Date => subMonths(date, 1);
export const getNextMonth = (date: Date): Date => addMonths(date, 1);

export const calculateWeeklyReport = (
  expenses: Expense[],
  categories: Category[],
  monthlyIncome: number,
  weekDate: Date
): WeeklyReportData => {
  const { start, end } = getWeekRange(weekDate);
  
  // Filter expenses for the week
  const weekExpenses = expenses.filter(e => {
    const expenseDate = parseISO(e.date);
    return isWithinInterval(expenseDate, { start, end });
  });
  
  const totalSpent = weekExpenses.reduce((sum, e) => sum + e.amount, 0);
  const weeklyIncome = monthlyIncome / 4; // Approximate weekly income
  const netBalance = weeklyIncome - totalSpent;
  
  // Category breakdown
  const categorySpending: Record<string, number> = {};
  weekExpenses.forEach(e => {
    categorySpending[e.category] = (categorySpending[e.category] || 0) + e.amount;
  });
  
  const topCategories = Object.entries(categorySpending)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([catId, amount]) => {
      const cat = categories.find(c => c.id === catId);
      return {
        category: cat?.name || catId,
        amount,
        emoji: cat?.emoji || '📦',
      };
    });
  
  // Day-wise spending (Mon-Sun)
  const days = eachDayOfInterval({ start, end });
  const dayWiseSpending = days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayExpenses = weekExpenses.filter(e => e.date === dayStr);
    const amount = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
    return {
      day: format(day, 'EEE'),
      date: dayStr,
      amount,
    };
  });
  
  return {
    weekStart: start,
    weekEnd: end,
    totalSpent,
    totalIncome: weeklyIncome,
    netBalance,
    topCategories,
    dayWiseSpending,
    transactions: weekExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  };
};

export const calculateMonthlyReport = (
  expenses: Expense[],
  categories: Category[],
  monthlyIncome: number,
  monthDate: Date
): MonthlyReportData => {
  const { start, end } = getMonthRange(monthDate);
  
  // Filter expenses for the month
  const monthExpenses = expenses.filter(e => {
    const expenseDate = parseISO(e.date);
    return isWithinInterval(expenseDate, { start, end });
  });
  
  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const savings = monthlyIncome - totalSpent;
  
  // Category breakdown
  const categorySpending: Record<string, number> = {};
  monthExpenses.forEach(e => {
    categorySpending[e.category] = (categorySpending[e.category] || 0) + e.amount;
  });
  
  const categoryBreakdown = Object.entries(categorySpending)
    .sort((a, b) => b[1] - a[1])
    .map(([catId, amount]) => {
      const cat = categories.find(c => c.id === catId);
      return {
        category: cat?.name || catId,
        amount,
        emoji: cat?.emoji || '📦',
        percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
      };
    });
  
  // Top 5 transactions
  const topTransactions = [...monthExpenses]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
  
  return {
    month: start,
    totalSpent,
    totalIncome: monthlyIncome,
    savings,
    categoryBreakdown,
    topTransactions,
    transactions: monthExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  };
};
