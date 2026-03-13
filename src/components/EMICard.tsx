import { EMI } from '@/types/expense';
import { formatINR } from '@/utils/currency';
import { useLanguage } from '@/contexts/LanguageContext';
import { Progress } from '@/components/ui/progress';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EMICardProps {
  emi: EMI;
  onDelete: (id: string) => void;
  onMarkPaid: (id: string) => void;
}

const EMICard = ({ emi, onDelete, onMarkPaid }: EMICardProps) => {
  const { t } = useLanguage();
  const progress = (emi.paidMonths / emi.totalMonths) * 100;
  const remainingMonths = emi.totalMonths - emi.paidMonths;
  
  // Check if EMI is overdue (due date passed this month and not paid)
  const today = new Date();
  const currentDay = today.getDate();
  const isOverdue = currentDay > emi.dueDate && emi.paidMonths < emi.totalMonths;
  const isUpcoming = currentDay <= emi.dueDate && emi.dueDate - currentDay <= 5 && emi.paidMonths < emi.totalMonths;

  return (
    <div className={cn(
      "p-4 bg-card rounded-xl border border-border",
      isOverdue && "overdue-emi",
      isUpcoming && !isOverdue && "upcoming-emi"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-foreground">{emi.name}</h3>
          <p className="text-sm text-muted-foreground">
            {t('dueDate')}: {emi.dueDate}
            {isOverdue && <span className="ml-2 text-destructive font-medium">⚠️ Overdue</span>}
            {isUpcoming && !isOverdue && <span className="ml-2 text-accent font-medium">⏰ Upcoming</span>}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg text-foreground">{formatINR(emi.monthlyEMI)}</p>
          <p className="text-xs text-muted-foreground">{t('monthlyEMI')}</p>
        </div>
      </div>

      {/* Loan Details */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
        <div className="bg-muted/50 p-2 rounded-lg">
          <p className="text-muted-foreground">Loan</p>
          <p className="font-semibold text-foreground">{formatINR(emi.loanAmount)}</p>
        </div>
        <div className="bg-muted/50 p-2 rounded-lg">
          <p className="text-muted-foreground">Rate</p>
          <p className="font-semibold text-foreground">{emi.interestRate}%</p>
        </div>
        <div className="bg-muted/50 p-2 rounded-lg">
          <p className="text-muted-foreground">Tenure</p>
          <p className="font-semibold text-foreground">{emi.tenure} mo</p>
        </div>
      </div>

      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {emi.paidMonths} {t('of')} {emi.totalMonths} {t('months')}
          </span>
          <span className="text-primary font-medium">
            {remainingMonths} {t('remaining')}
          </span>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={() => onMarkPaid(emi.id)}
          disabled={emi.paidMonths >= emi.totalMonths}
        >
          +1 {t('paidMonths')}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(emi.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default EMICard;
