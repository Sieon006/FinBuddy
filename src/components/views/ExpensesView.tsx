import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Expense, Category } from '@/types/expense';
import { formatINR } from '@/utils/currency';
import ExpenseCard from '@/components/ExpenseCard';
import UndoRedoButtons from '@/components/UndoRedoButtons';
import EditExpenseSheet from '@/components/EditExpenseSheet';

interface ExpensesViewProps {
  expenses: Expense[];
  categories: Category[];
  onAddExpense: () => void;
  onDeleteExpense: (id: string) => void;
  onUpdateExpense: (expense: Expense) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

const ExpensesView = ({ 
  expenses, 
  categories, 
  onAddExpense, 
  onDeleteExpense,
  onUpdateExpense,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}: ExpensesViewProps) => {
  const { t, language } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  const handleEditExpense = (expense: Expense) => {
    setEditExpense(expense);
    setEditSheetOpen(true);
  };

  const monthExpenses = expenses.filter((e) => {
    const date = new Date(e.date);
    return date.getMonth() === currentMonth.getMonth() && 
           date.getFullYear() === currentMonth.getFullYear();
  });

  const sortedExpenses = [...monthExpenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const getCategoryById = (id: string) => categories.find((c) => c.id === id);

  const prevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const nextMonth = () => {
    const now = new Date();
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    if (next <= now) {
      setCurrentMonth(next);
    }
  };

  const monthLabel = currentMonth.toLocaleDateString(language === 'en' ? 'en-IN' : 'ta-IN', {
    month: 'long',
    year: 'numeric',
  });

  // Group expenses by date
  const groupedExpenses = sortedExpenses.reduce((groups, expense) => {
    const date = expense.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(expense);
    return groups;
  }, {} as Record<string, Expense[]>);

  return (
    <div className="px-4 pt-6 pb-24">
      {/* Header with Month Selector and Undo/Redo */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-foreground">{monthLabel}</h1>
          {onUndo && onRedo && (
            <UndoRedoButtons
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={onUndo}
              onRedo={onRedo}
            />
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Total */}
      <div className="bg-card p-4 rounded-xl border border-border mb-4">
        <p className="text-sm text-muted-foreground">{t('totalSpent')}</p>
        <p className="text-2xl font-bold text-destructive">{formatINR(totalSpent)}</p>
      </div>

      {/* Add Button */}
      <Button onClick={onAddExpense} className="w-full mb-4 gap-2">
        <Plus className="h-4 w-4" />
        {t('addExpense')}
      </Button>

      {/* Expenses List */}
      {sortedExpenses.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">{t('noExpenses')}</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedExpenses).map(([date, dateExpenses]) => (
            <div key={date}>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                {new Date(date).toLocaleDateString(language === 'en' ? 'en-IN' : 'ta-IN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
              <div className="space-y-2">
                {dateExpenses.map((expense) => (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    category={getCategoryById(expense.category)}
                    onDelete={onDeleteExpense}
                    onEdit={handleEditExpense}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <EditExpenseSheet
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        categories={categories}
        expense={editExpense}
        onUpdateExpense={onUpdateExpense}
      />
    </div>
  );
};

export default ExpensesView;
