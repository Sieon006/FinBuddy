import { useState } from 'react';
import { Plus, Target, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { SavingGoal } from '@/types/expense';
import { formatINR, generateId } from '@/utils/currency';
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

interface SavingGoalsProps {
  goals: SavingGoal[];
  onAddGoal: (goal: SavingGoal) => void;
  onUpdateGoal: (id: string, amount: number) => void;
  onDeleteGoal: (id: string) => void;
}

const SavingGoals = ({ goals, onAddGoal, onUpdateGoal, onDeleteGoal }: SavingGoalsProps) => {
  const { t } = useLanguage();
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [addMoneyDialogOpen, setAddMoneyDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingGoal | null>(null);
  const [addAmount, setAddAmount] = useState('');

  // Add goal form state
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [targetDate, setTargetDate] = useState('');

  const handleAddGoal = () => {
    if (!goalName || !targetAmount) return;

    const goal: SavingGoal = {
      id: generateId(),
      name: goalName,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount) || 0,
      targetDate: targetDate || '',
      startDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    onAddGoal(goal);
    resetForm();
    setAddSheetOpen(false);
  };

  const handleAddMoney = () => {
    if (!selectedGoal || !addAmount) return;
    const amount = parseFloat(addAmount);
    if (amount > 0) {
      onUpdateGoal(selectedGoal.id, selectedGoal.currentAmount + amount);
    }
    setAddMoneyDialogOpen(false);
    setAddAmount('');
    setSelectedGoal(null);
  };

  const resetForm = () => {
    setGoalName('');
    setTargetAmount('');
    setCurrentAmount('0');
    setTargetDate('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Target className="h-5 w-5 text-secondary" />
          {t('savingGoals')}
        </h2>
        <Button size="sm" onClick={() => setAddSheetOpen(true)} className="gap-1">
          <Plus className="h-4 w-4" />
          {t('addGoal')}
        </Button>
      </div>

      {goals.length === 0 ? (
        <div className="bg-card p-6 rounded-xl border border-border text-center">
          <Target className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">{t('noGoals')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const isComplete = goal.currentAmount >= goal.targetAmount;
            
            return (
              <div key={goal.id} className="bg-card p-4 rounded-xl border border-border">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{goal.name}</h3>
                    {goal.targetDate && (
                      <p className="text-xs text-muted-foreground">
                        Target: {new Date(goal.targetDate).toLocaleDateString('en-IN')}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{formatINR(goal.currentAmount)}</p>
                    <p className="text-xs text-muted-foreground">of {formatINR(goal.targetAmount)}</p>
                  </div>
                </div>

                <Progress value={Math.min(progress, 100)} className="h-2 mb-2" />
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setSelectedGoal(goal);
                      setAddMoneyDialogOpen(true);
                    }}
                    disabled={isComplete}
                  >
                    {isComplete ? '✓ Complete' : t('addMoney')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => onDeleteGoal(goal.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Goal Sheet */}
      <Sheet open={addSheetOpen} onOpenChange={setAddSheetOpen}>
        <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>{t('addGoal')}</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>{t('goalName')}</Label>
              <Input
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                placeholder="Gold, Travel, Emergency Fund..."
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('targetAmount')}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <Input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="100000"
                  className="pl-8 h-12"
                  inputMode="numeric"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('currentAmount')}</Label>
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
            <div className="space-y-2">
              <Label>{t('targetDate')}</Label>
              <Input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1 h-12" onClick={() => setAddSheetOpen(false)}>
                {t('cancel')}
              </Button>
              <Button className="flex-1 h-12" onClick={handleAddGoal} disabled={!goalName || !targetAmount}>
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
            <DialogTitle>{t('addMoney')} - {selectedGoal?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
              <Input
                type="number"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                placeholder="Enter amount"
                className="pl-8 h-12"
                inputMode="numeric"
                autoFocus
              />
            </div>
            <Button onClick={handleAddMoney} className="w-full h-12" disabled={!addAmount}>
              {t('addMoney')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavingGoals;
