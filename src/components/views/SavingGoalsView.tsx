import { useState, useMemo } from 'react';
import { Plus, Target, Trash2, TrendingUp, AlertTriangle, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import UndoRedoButtons from '@/components/UndoRedoButtons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { useLanguage } from '@/contexts/LanguageContext';
import { SavingGoal, SavingTransaction, Expense } from '@/types/expense';
import { formatINR, generateId, getTodayDate } from '@/utils/currency';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SavingGoalsViewProps {
  goals: SavingGoal[];
  savingTransactions: SavingTransaction[];
  expenses: Expense[];
  onAddGoal: (goal: SavingGoal) => void;
  onUpdateGoal: (id: string, amount: number) => void;
  onDeleteGoal: (id: string) => void;
  onAddSavingTransaction: (transaction: SavingTransaction) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

const SavingGoalsView = ({
  goals,
  savingTransactions,
  expenses,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onAddSavingTransaction,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}: SavingGoalsViewProps) => {
  const { t, language } = useLanguage();
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [addMoneyDialogOpen, setAddMoneyDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingGoal | null>(null);
  const [addAmount, setAddAmount] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Add goal form state
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [targetDate, setTargetDate] = useState('');
  const [startDate, setStartDate] = useState(getTodayDate());

  // Calculate monthly saving suggestion
  const calculateMonthlySuggestion = (goal: SavingGoal): number => {
    const remaining = goal.targetAmount - goal.currentAmount;
    if (remaining <= 0) return 0;
    
    const targetDateObj = new Date(goal.targetDate);
    const today = new Date();
    const monthsLeft = Math.max(
      0,
      (targetDateObj.getFullYear() - today.getFullYear()) * 12 +
        (targetDateObj.getMonth() - today.getMonth())
    );
    
    if (monthsLeft <= 0) return remaining; // All remaining if overdue
    return Math.ceil(remaining / monthsLeft);
  };

  // Check if target date is in past
  const isTargetDatePast = (goal: SavingGoal): boolean => {
    if (!goal.targetDate) return false;
    return new Date(goal.targetDate) < new Date();
  };

  // Get dates that have transactions (savings or expenses)
  const transactionDates = useMemo(() => {
    const dates = new Set<string>();
    savingTransactions.forEach(t => dates.add(t.date));
    expenses.forEach(e => dates.add(e.date));
    return dates;
  }, [savingTransactions, expenses]);

  // Get transactions for selected date
  const selectedDateTransactions = useMemo(() => {
    if (!selectedDate) return { savings: [], expenses: [] };
    const dateStr = selectedDate.toISOString().split('T')[0];
    return {
      savings: savingTransactions.filter(t => t.date === dateStr),
      expenses: expenses.filter(e => e.date === dateStr),
    };
  }, [selectedDate, savingTransactions, expenses]);

  const handleAddGoal = () => {
    if (!goalName || !targetAmount) {
      toast({
        title: language === 'en' ? 'Missing fields' : 'தேவையான புலங்கள் காணவில்லை',
        description: language === 'en' ? 'Please fill in goal name and target amount' : 'இலக்கு பெயர் மற்றும் இலக்கு தொகை நிரப்பவும்',
        variant: 'destructive',
      });
      return;
    }

    // Validate target date
    if (targetDate && new Date(targetDate) <= new Date()) {
      toast({
        title: language === 'en' ? 'Invalid Target Date' : 'தவறான இலக்கு தேதி',
        description: language === 'en' ? 'Target date must be in the future' : 'இலக்கு தேதி எதிர்காலத்தில் இருக்க வேண்டும்',
        variant: 'destructive',
      });
      return;
    }

    const goal: SavingGoal = {
      id: generateId(),
      name: goalName,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount) || 0,
      targetDate: targetDate || '',
      startDate: startDate || getTodayDate(),
      createdAt: new Date().toISOString(),
    };

    onAddGoal(goal);
    
    // If initial amount > 0, create a saving transaction
    if (goal.currentAmount > 0) {
      const transaction: SavingTransaction = {
        id: generateId(),
        goalId: goal.id,
        amount: goal.currentAmount,
        date: getTodayDate(),
        createdAt: new Date().toISOString(),
      };
      onAddSavingTransaction(transaction);
    }

    toast({
      title: language === 'en' ? 'Goal Added ✅' : 'இலக்கு சேர்க்கப்பட்டது ✅',
      description: goalName,
    });

    resetForm();
    setAddSheetOpen(false);
  };

  const handleAddMoney = () => {
    if (!selectedGoal || !addAmount) return;
    const amount = parseFloat(addAmount);
    if (amount <= 0) {
      toast({
        title: language === 'en' ? 'Invalid amount' : 'தவறான தொகை',
        variant: 'destructive',
      });
      return;
    }

    // Update goal
    onUpdateGoal(selectedGoal.id, selectedGoal.currentAmount + amount);
    
    // Create saving transaction
    const transaction: SavingTransaction = {
      id: generateId(),
      goalId: selectedGoal.id,
      amount,
      date: getTodayDate(),
      createdAt: new Date().toISOString(),
    };
    onAddSavingTransaction(transaction);

    toast({
      title: language === 'en' ? 'Savings Added ✅' : 'சேமிப்பு சேர்க்கப்பட்டது ✅',
      description: `${formatINR(amount)} → ${selectedGoal.name}`,
    });

    setAddMoneyDialogOpen(false);
    setAddAmount('');
    setSelectedGoal(null);
  };

  const resetForm = () => {
    setGoalName('');
    setTargetAmount('');
    setCurrentAmount('0');
    setTargetDate('');
    setStartDate(getTodayDate());
  };

  const getGoalForTransaction = (transaction: SavingTransaction): SavingGoal | undefined => {
    return goals.find(g => g.id === transaction.goalId);
  };

  return (
    <div className="px-4 pt-6 pb-24 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Target className="h-6 w-6 text-secondary" />
          {t('savingGoals')}
        </h1>
        <Button onClick={() => setAddSheetOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('addGoal')}
        </Button>
      </div>

      {/* Goals List */}
      {goals.length === 0 ? (
        <div className="bg-card p-8 rounded-xl border border-border text-center">
          <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">{t('noGoals')}</p>
          <Button onClick={() => setAddSheetOpen(true)} className="mt-4 gap-2">
            <Plus className="h-4 w-4" />
            {t('addGoal')}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const isComplete = goal.currentAmount >= goal.targetAmount;
            const monthlySuggestion = calculateMonthlySuggestion(goal);
            const isPastDue = isTargetDatePast(goal) && !isComplete;

            return (
              <div key={goal.id} className="bg-card p-4 rounded-xl border border-border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground text-lg">{goal.name}</h3>
                      {isComplete && <span className="text-xl">🎉</span>}
                      {isPastDue && <AlertTriangle className="h-4 w-4 text-destructive" />}
                    </div>
                    {goal.targetDate && (
                      <p className={cn(
                        "text-xs mt-1",
                        isPastDue ? "text-destructive" : "text-muted-foreground"
                      )}>
                        {language === 'en' ? 'Target' : 'இலக்கு'}: {new Date(goal.targetDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-foreground">{formatINR(goal.currentAmount)}</p>
                    <p className="text-xs text-muted-foreground">{language === 'en' ? 'of' : '/'} {formatINR(goal.targetAmount)}</p>
                  </div>
                </div>

                <Progress 
                  value={progress} 
                  className={cn(
                    "h-3 mb-3",
                    isComplete ? "[&>div]:bg-secondary" : isPastDue ? "[&>div]:bg-destructive" : ""
                  )} 
                />

                <div className="flex items-center justify-between text-sm mb-3">
                  <span className={cn(
                    "font-medium",
                    isComplete ? "text-secondary" : "text-muted-foreground"
                  )}>
                    {progress.toFixed(0)}% {language === 'en' ? 'complete' : 'முடிந்தது'}
                  </span>
                  {!isComplete && monthlySuggestion > 0 && (
                    <div className="flex items-center gap-1 text-primary">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-xs">
                        {language === 'en' ? 'Save' : 'சேமி'} {formatINR(monthlySuggestion)}/{language === 'en' ? 'mo' : 'மா'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1 gap-1"
                    onClick={() => {
                      setSelectedGoal(goal);
                      setAddMoneyDialogOpen(true);
                    }}
                    disabled={isComplete}
                  >
                    <Plus className="h-4 w-4" />
                    {isComplete ? (language === 'en' ? 'Complete' : 'முடிந்தது') : (language === 'en' ? 'Add to Savings' : 'சேமிப்பில் சேர்')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      onDeleteGoal(goal.id);
                      toast({
                        title: language === 'en' ? 'Goal Deleted' : 'இலக்கு நீக்கப்பட்டது',
                      });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Calendar Section */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">
            {language === 'en' ? 'Transaction Calendar' : 'பரிவர்த்தனை நாட்காட்டி'}
          </h2>
        </div>

        <div className="p-2">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={calendarMonth}
            onMonthChange={setCalendarMonth}
            modifiers={{
              hasTransaction: (date) => transactionDates.has(date.toISOString().split('T')[0]),
            }}
            modifiersClassNames={{
              hasTransaction: 'bg-primary/20 font-bold',
            }}
            className="w-full"
          />
        </div>

        {/* Selected Date Details */}
        {selectedDate && (
          <div className="p-4 border-t border-border">
            <h3 className="font-medium text-foreground mb-3">
              {selectedDate.toLocaleDateString(language === 'en' ? 'en-IN' : 'ta-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </h3>
            
            {selectedDateTransactions.savings.length === 0 && selectedDateTransactions.expenses.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                {language === 'en' ? 'No transactions on this day' : 'இந்த நாளில் பரிவர்த்தனைகள் இல்லை'}
              </p>
            ) : (
              <div className="space-y-2">
                {selectedDateTransactions.savings.map((t) => {
                  const goal = getGoalForTransaction(t);
                  return (
                    <div key={t.id} className="flex items-center justify-between p-2 bg-secondary/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💰</span>
                        <span className="text-sm text-foreground">{goal?.name || 'Savings'}</span>
                      </div>
                      <span className="text-secondary font-medium">+{formatINR(t.amount)}</span>
                    </div>
                  );
                })}
                {selectedDateTransactions.expenses.map((e) => (
                  <div key={e.id} className="flex items-center justify-between p-2 bg-destructive/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📉</span>
                      <span className="text-sm text-foreground">{e.notes || e.category}</span>
                    </div>
                    <span className="text-destructive font-medium">-{formatINR(e.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Goal Sheet */}
      <Sheet open={addSheetOpen} onOpenChange={setAddSheetOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-xl">{t('addGoal')}</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4 pb-6">
            <div className="space-y-2">
              <Label className="text-base">{t('goalName')} <span className="text-destructive">*</span></Label>
              <Input
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                placeholder={language === 'en' ? 'New Phone, Trip, Emergency Fund...' : 'புதிய போன், பயணம், அவசர நிதி...'}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base">{t('targetAmount')} <span className="text-destructive">*</span></Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">₹</span>
                <Input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="100000"
                  className="pl-8 h-12 text-lg"
                  inputMode="numeric"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base">{t('currentAmount')}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <Input
                  type="number"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  placeholder="0"
                  className="pl-8 h-12"
                  inputMode="numeric"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-base">
                  {language === 'en' ? 'Start Date' : 'தொடக்க தேதி'}
                </Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base">{t('targetDate')} <span className="text-destructive">*</span></Label>
                <Input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  min={getTodayDate()}
                  className="h-12"
                />
              </div>
            </div>

            {targetDate && new Date(targetDate) > new Date() && targetAmount && (
              <div className="bg-primary/10 p-3 rounded-lg">
                <p className="text-sm text-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  {language === 'en' ? 'Monthly saving suggestion:' : 'மாதாந்திர சேமிப்பு பரிந்துரை:'}{' '}
                  <strong className="text-primary">
                    {formatINR(
                      Math.ceil(
                        (parseFloat(targetAmount) - (parseFloat(currentAmount) || 0)) /
                          Math.max(
                            1,
                            (new Date(targetDate).getFullYear() - new Date().getFullYear()) * 12 +
                              (new Date(targetDate).getMonth() - new Date().getMonth())
                          )
                      )
                    )}
                  </strong>
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1 h-12" onClick={() => setAddSheetOpen(false)}>
                {t('cancel')}
              </Button>
              <Button 
                className="flex-1 h-12" 
                onClick={handleAddGoal} 
                disabled={!goalName || !targetAmount || !targetDate}
              >
                {t('save')}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Money Dialog */}
      <Dialog open={addMoneyDialogOpen} onOpenChange={setAddMoneyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-secondary" />
              {language === 'en' ? 'Add to Savings' : 'சேமிப்பில் சேர்'} - {selectedGoal?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {selectedGoal && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Current' : 'தற்போதைய'}: {formatINR(selectedGoal.currentAmount)} / {formatINR(selectedGoal.targetAmount)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Remaining' : 'மீதம்'}: {formatINR(selectedGoal.targetAmount - selectedGoal.currentAmount)}
                </p>
              </div>
            )}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">₹</span>
              <Input
                type="number"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                placeholder={language === 'en' ? 'Enter amount' : 'தொகையை உள்ளிடவும்'}
                className="pl-8 h-14 text-xl"
                inputMode="numeric"
                autoFocus
              />
            </div>
            <Button onClick={handleAddMoney} className="w-full h-12 gap-2" disabled={!addAmount}>
              <Plus className="h-4 w-4" />
              {language === 'en' ? 'Add to Savings' : 'சேமிப்பில் சேர்'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavingGoalsView;
