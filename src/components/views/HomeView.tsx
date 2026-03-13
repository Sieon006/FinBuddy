import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Expense, EMI, Category, SavingGoal } from '@/types/expense';
import { formatINR, getTodayDate, isCurrentMonth } from '@/utils/currency';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, CreditCard, Target, PiggyBank, AlertTriangle, History } from 'lucide-react';
import BudgetWarningBanner from '@/components/BudgetWarningBanner';
import { calculateBudgetStatus } from '@/utils/budgetWarnings';

interface HomeViewProps {
  expenses: Expense[];
  categories: Category[];
  monthlyBudget: number;
  monthlyIncome: number;
  emis: EMI[];
  savingGoals: SavingGoal[];
  onOpenHistory: () => void;
}

const HomeView = ({ expenses, categories, monthlyBudget, monthlyIncome, emis, savingGoals, onOpenHistory }: HomeViewProps) => {
  const { t } = useLanguage();

  const todaySpent = expenses
    .filter((e) => e.date === getTodayDate())
    .reduce((sum, e) => sum + e.amount, 0);

  const thisMonthSpent = expenses
    .filter((e) => isCurrentMonth(e.date))
    .reduce((sum, e) => sum + e.amount, 0);

  const remainingBudget = monthlyBudget - thisMonthSpent;
  const budgetProgress = Math.min((thisMonthSpent / monthlyBudget) * 100, 100);
  
  const activeEMIs = emis.filter((e) => e.paidMonths < e.totalMonths);
  const totalMonthlyEMI = activeEMIs.reduce((sum, e) => sum + e.monthlyEMI, 0);
  
  // Get primary saving goal (most recent or first incomplete)
  const primaryGoal = savingGoals.find(g => g.currentAmount < g.targetAmount) || savingGoals[0];
  const goalProgress = primaryGoal ? (primaryGoal.currentAmount / primaryGoal.targetAmount) * 100 : 0;

  // Calculate budget warning status
  const budgetWarning = useMemo(() => 
    calculateBudgetStatus(expenses, categories, monthlyBudget),
    [expenses, categories, monthlyBudget]
  );

  // Check for overdue EMIs
  const today = new Date();
  const currentDay = today.getDate();
  const overdueCount = activeEMIs.filter(e => currentDay > e.dueDate).length;

  return (
    <div className="px-4 pt-4 pb-24">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t('financialOverview')}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-4">
        <Button 
          variant="outline" 
          className="gap-2 h-12 w-full justify-start"
          onClick={onOpenHistory}
        >
          <History className="h-5 w-5 text-primary" />
          <span className="font-medium">{t('transactionHistory')}</span>
        </Button>
      </div>

      {/* Budget Warning Banner */}
      {budgetWarning.level !== 'safe' && (
        <BudgetWarningBanner warning={budgetWarning} />
      )}

      {/* Overdue Alert */}
      {overdueCount > 0 && (
        <div className="bg-destructive/20 border border-destructive/30 p-3 rounded-xl mb-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-foreground">
            {overdueCount} EMI payment{overdueCount > 1 ? 's' : ''} overdue!
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Today's Spending */}
        <div className="bg-card p-4 rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-4 w-4 text-primary" />
            <p className="text-xs text-muted-foreground">{t('todaySpending')}</p>
          </div>
          <p className="text-xl font-bold text-foreground">{formatINR(todaySpent)}</p>
        </div>

        {/* Monthly Spending */}
        <div className="bg-card p-4 rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            <p className="text-xs text-muted-foreground">{t('monthlySpending')}</p>
          </div>
          <p className="text-xl font-bold text-foreground">{formatINR(thisMonthSpent)}</p>
        </div>

        {/* Monthly Budget */}
        <div className="bg-card p-4 rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-2">
            <PiggyBank className="h-4 w-4 text-secondary" />
            <p className="text-xs text-muted-foreground">{t('monthlyBudget')}</p>
          </div>
          <p className="text-xl font-bold text-foreground">{formatINR(monthlyBudget)}</p>
        </div>

        {/* Remaining Budget */}
        <div className="bg-card p-4 rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-primary" />
            <p className="text-xs text-muted-foreground">{t('remainingBudget')}</p>
          </div>
          <p className={`text-xl font-bold ${remainingBudget < 0 ? 'text-destructive' : 'text-secondary'}`}>
            {formatINR(remainingBudget)}
          </p>
        </div>
      </div>

      {/* Budget Progress */}
      <div className="bg-card p-4 rounded-xl border border-border mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">Budget Used</span>
          <span className="text-sm font-medium text-foreground">{budgetProgress.toFixed(0)}%</span>
        </div>
        <Progress 
          value={budgetProgress} 
          className={`h-3 ${budgetProgress > 90 ? '[&>div]:bg-destructive' : budgetProgress > 70 ? '[&>div]:bg-accent' : ''}`}
        />
      </div>

      {/* Active EMIs */}
      <div className="bg-card p-4 rounded-xl border border-border mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <span className="font-medium text-foreground">{t('activeEmis')}</span>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg text-foreground">{activeEMIs.length}</p>
            <p className="text-xs text-muted-foreground">{formatINR(totalMonthlyEMI)}/mo</p>
          </div>
        </div>
      </div>

      {/* Saving Goal Progress */}
      <div className="bg-card p-4 rounded-xl border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-5 w-5 text-secondary" />
          <span className="font-medium text-foreground">{t('savingGoalProgress')}</span>
        </div>
        
        {primaryGoal ? (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-foreground">{primaryGoal.name}</span>
              <span className="text-sm font-medium text-foreground">
                {formatINR(primaryGoal.currentAmount)} / {formatINR(primaryGoal.targetAmount)}
              </span>
            </div>
            <Progress value={Math.min(goalProgress, 100)} className="h-3 [&>div]:bg-secondary" />
            <p className="text-xs text-muted-foreground mt-2">
              {goalProgress >= 100 ? '🎉 Goal achieved!' : `${goalProgress.toFixed(0)}% complete`}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">{t('noSavingGoal')}</p>
        )}
      </div>
    </div>
  );
};

export default HomeView;
