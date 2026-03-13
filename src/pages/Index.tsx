import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { Expense, EMI, SavingGoal, SavingTransaction, DEFAULT_CATEGORIES } from '@/types/expense';
import { generateId } from '@/utils/currency';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import HomeView from '@/components/views/HomeView';
import ExpensesView from '@/components/views/ExpensesView';
import EMIView from '@/components/views/EMIView';
import AIAssistantView from '@/components/views/AIAssistantView';
import SavingGoalsView from '@/components/views/SavingGoalsView';
import HistoryView from '@/components/views/HistoryView';
import AddExpenseSheet from '@/components/AddExpenseSheet';
import AddEMISheet from '@/components/AddEMISheet';
import TutorialBot from '@/components/TutorialBot';

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [addEMIOpen, setAddEMIOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Local Storage State
  const [storedExpenses, setStoredExpenses] = useLocalStorage<Expense[]>('expense-tracker-expenses', []);
  const [emis, setEmis] = useLocalStorage<EMI[]>('expense-tracker-emis', []);
  const [storedGoals, setStoredGoals] = useLocalStorage<SavingGoal[]>('expense-tracker-goals', []);
  const [storedTransactions, setStoredTransactions] = useLocalStorage<SavingTransaction[]>('expense-tracker-saving-txns', []);
  const [monthlyBudget, setMonthlyBudget] = useLocalStorage<number>('expense-tracker-budget', 50000);
  const [monthlyIncome, setMonthlyIncome] = useLocalStorage<number>('expense-tracker-income', 75000);

  // Undo/Redo for expenses
  const {
    state: expenses,
    set: setExpenses,
    undo: undoExpense,
    redo: redoExpense,
    canUndo: canUndoExpense,
    canRedo: canRedoExpense,
    initialize: initializeExpenses,
  } = useUndoRedo<Expense[]>([]);

  // Undo/Redo for saving goals
  const {
    state: savingGoals,
    set: setSavingGoals,
    undo: undoGoal,
    redo: redoGoal,
    canUndo: canUndoGoal,
    canRedo: canRedoGoal,
    initialize: initializeGoals,
  } = useUndoRedo<SavingGoal[]>([]);

  // Undo/Redo for saving transactions
  const {
    state: savingTransactions,
    set: setSavingTransactions,
    undo: undoTransaction,
    redo: redoTransaction,
    canUndo: canUndoTransaction,
    canRedo: canRedoTransaction,
    initialize: initializeTransactions,
  } = useUndoRedo<SavingTransaction[]>([]);

  // Initialize from localStorage
  useEffect(() => {
    initializeExpenses(storedExpenses);
    initializeGoals(storedGoals);
    initializeTransactions(storedTransactions);
  }, []);

  // Sync to localStorage when state changes
  useEffect(() => {
    if (expenses.length > 0 || storedExpenses.length > 0) {
      setStoredExpenses(expenses);
    }
  }, [expenses]);

  useEffect(() => {
    if (savingGoals.length > 0 || storedGoals.length > 0) {
      setStoredGoals(savingGoals);
    }
  }, [savingGoals]);

  useEffect(() => {
    if (savingTransactions.length > 0 || storedTransactions.length > 0) {
      setStoredTransactions(savingTransactions);
    }
  }, [savingTransactions]);

  const allCategories = DEFAULT_CATEGORIES;

  // Expense handlers
  const handleAddExpense = (expense: Expense) => {
    console.log('[Index] Adding expense:', JSON.stringify(expense, null, 2));
    const validExpense: Expense = {
      ...expense,
      amount: typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount,
    };
    setExpenses((prev) => [...prev, validExpense]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const handleUpdateExpense = (updatedExpense: Expense) => {
    setExpenses((prev) => prev.map((e) => e.id === updatedExpense.id ? updatedExpense : e));
  };

  // EMI handlers
  const handleAddEMI = (emi: EMI) => setEmis((prev) => [...prev, emi]);
  const handleDeleteEMI = (id: string) => setEmis((prev) => prev.filter((e) => e.id !== id));
  const handleMarkEMIPaid = (id: string) => {
    setEmis((prev) =>
      prev.map((e) => (e.id === id && e.paidMonths < e.totalMonths ? { ...e, paidMonths: e.paidMonths + 1 } : e))
    );
  };

  const handleSaveCalculatedEMI = (data: { loanAmount: number; interestRate: number; tenure: number; monthlyEMI: number }) => {
    const emi: EMI = {
      id: generateId(),
      name: 'Calculated EMI',
      loanAmount: data.loanAmount,
      interestRate: data.interestRate,
      tenure: data.tenure,
      monthlyEMI: data.monthlyEMI,
      dueDate: 1,
      totalMonths: data.tenure,
      paidMonths: 0,
      createdAt: new Date().toISOString(),
    };
    setEmis((prev) => [...prev, emi]);
    setAddEMIOpen(true);
  };

  // Saving Goals handlers
  const handleAddGoal = (goal: SavingGoal) => setSavingGoals((prev) => [...prev, goal]);
  const handleUpdateGoal = (id: string, amount: number) => {
    setSavingGoals((prev) => prev.map((g) => (g.id === id ? { ...g, currentAmount: amount } : g)));
  };
  const handleDeleteGoal = (id: string) => setSavingGoals((prev) => prev.filter((g) => g.id !== id));
  const handleAddSavingTransaction = (transaction: SavingTransaction) => {
    setSavingTransactions((prev) => [...prev, transaction]);
  };

  // Combined undo/redo for savings view
  const handleUndoSaving = () => {
    if (canUndoTransaction) undoTransaction();
    else if (canUndoGoal) undoGoal();
  };
  
  const handleRedoSaving = () => {
    if (canRedoTransaction) redoTransaction();
    else if (canRedoGoal) redoGoal();
  };

  // History view
  if (showHistory) {
    return (
      <HistoryView
        expenses={expenses}
        categories={allCategories}
        savingTransactions={savingTransactions}
        savingGoals={savingGoals}
        onBack={() => setShowHistory(false)}
      />
    );
  }

  const renderView = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeView
            expenses={expenses}
            categories={allCategories}
            monthlyBudget={monthlyBudget}
            monthlyIncome={monthlyIncome}
            emis={emis}
            savingGoals={savingGoals}
            onOpenHistory={() => setShowHistory(true)}
          />
        );
      case 'expenses':
        return (
          <ExpensesView
            expenses={expenses}
            categories={allCategories}
            onAddExpense={() => setAddExpenseOpen(true)}
            onDeleteExpense={handleDeleteExpense}
            onUpdateExpense={handleUpdateExpense}
            canUndo={canUndoExpense}
            canRedo={canRedoExpense}
            onUndo={undoExpense}
            onRedo={redoExpense}
          />
        );
      case 'emi':
        return (
          <EMIView
            emis={emis}
            onAddEMI={() => setAddEMIOpen(true)}
            onDeleteEMI={handleDeleteEMI}
            onMarkPaid={handleMarkEMIPaid}
            onSaveCalculatedEMI={handleSaveCalculatedEMI}
          />
        );
      case 'savings':
        return (
          <SavingGoalsView
            goals={savingGoals}
            savingTransactions={savingTransactions}
            expenses={expenses}
            onAddGoal={handleAddGoal}
            onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal}
            onAddSavingTransaction={handleAddSavingTransaction}
            canUndo={canUndoGoal || canUndoTransaction}
            canRedo={canRedoGoal || canRedoTransaction}
            onUndo={handleUndoSaving}
            onRedo={handleRedoSaving}
          />
        );
      case 'ai':
        return (
          <AIAssistantView
            expenses={expenses}
            emis={emis}
            savingGoals={savingGoals}
            categories={allCategories}
            monthlyBudget={monthlyBudget}
            monthlyIncome={monthlyIncome}
            onAddExpense={handleAddExpense}
            onSetBudget={setMonthlyBudget}
            onAddGoal={handleAddGoal}
            onAddEMI={handleAddEMI}
            onNavigate={(tab) => {
              if (tab === 'weekly-report') {
                window.location.href = '/weekly-report';
              } else if (tab === 'monthly-report') {
                window.location.href = '/monthly-report';
              } else {
                setActiveTab(tab);
              }
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-safe">
      <Header
        monthlyBudget={monthlyBudget}
        monthlyIncome={monthlyIncome}
        onUpdateBudget={setMonthlyBudget}
        onUpdateIncome={setMonthlyIncome}
      />
      {renderView()}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <AddExpenseSheet
        open={addExpenseOpen}
        onOpenChange={setAddExpenseOpen}
        categories={allCategories}
        onAddExpense={handleAddExpense}
      />
      <AddEMISheet open={addEMIOpen} onOpenChange={setAddEMIOpen} onAddEMI={handleAddEMI} />
      <TutorialBot onNavigate={setActiveTab} />
    </div>
  );
};

export default Index;
