import { Trash2 } from 'lucide-react';
import { Expense, Category } from '@/types/expense';
import { formatINR, formatDate } from '@/utils/currency';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ExpenseCardProps {
  expense: Expense;
  category: Category | undefined;
  onDelete?: (id: string) => void;
  onEdit?: (expense: Expense) => void;
}

const ExpenseCard = ({ expense, category, onDelete, onEdit }: ExpenseCardProps) => {
  const { language } = useLanguage();

  const handleCardClick = () => {
    if (onEdit) {
      onEdit(expense);
    }
  };

  return (
    <div 
      className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={handleCardClick}
    >
      {/* Left: Category Icon */}
      <div className="w-10 h-10 flex-shrink-0 rounded-full bg-secondary flex items-center justify-center text-lg">
        {category?.emoji || '💰'}
      </div>

      {/* Middle: Title + Notes + Date */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">
          {language === 'en' ? category?.name : category?.nameTamil || category?.name}
        </p>
        {expense.notes && (
          <p className="text-xs text-muted-foreground truncate">
            {expense.notes}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {formatDate(expense.date, language)}
        </p>
      </div>

      {/* Right: Amount + Delete Button */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <p className="font-semibold text-destructive whitespace-nowrap">
          -{formatINR(expense.amount)}
        </p>
        {onDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {language === 'en' ? 'Delete this expense?' : 'இந்த செலவை நீக்கவா?'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {language === 'en' 
                    ? 'This action cannot be undone. This will permanently delete this expense.'
                    : 'இந்த செயலை மீட்டெடுக்க முடியாது. இது இந்த செலவை நிரந்தரமாக நீக்கும்.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  {language === 'en' ? 'Cancel' : 'ரத்து செய்'}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(expense.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {language === 'en' ? 'Yes, Delete' : 'ஆம், நீக்கு'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
};

export default ExpenseCard;
