import { useState, useCallback, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { Category, Expense, PaymentMethod } from '@/types/expense';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Loader2, Banknote, Smartphone, CreditCard } from 'lucide-react';

interface EditExpenseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  expense: Expense | null;
  onUpdateExpense: (expense: Expense) => void;
}

const PAYMENT_METHODS: { id: PaymentMethod; label: string; labelTamil: string; icon: React.ReactNode }[] = [
  { id: 'cash', label: 'Cash', labelTamil: 'ரொக்கம்', icon: <Banknote className="h-4 w-4" /> },
  { id: 'upi', label: 'UPI', labelTamil: 'யுபிஐ', icon: <Smartphone className="h-4 w-4" /> },
  { id: 'card', label: 'Card', labelTamil: 'கார்டு', icon: <CreditCard className="h-4 w-4" /> },
];

const EditExpenseSheet = ({ open, onOpenChange, categories, expense, onUpdateExpense }: EditExpenseSheetProps) => {
  const { t, language } = useLanguage();
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ amount?: string; category?: string; date?: string }>({});
  const [touched, setTouched] = useState<{ amount?: boolean; category?: boolean; date?: boolean }>({});

  // Populate form when expense changes
  useEffect(() => {
    if (expense) {
      setAmount(expense.amount.toString());
      setSelectedCategory(expense.category);
      setDate(expense.date);
      setNotes(expense.notes || '');
      setPaymentMethod(expense.paymentMethod || 'cash');
      setErrors({});
      setTouched({});
    }
  }, [expense]);

  const validateForm = useCallback(() => {
    const newErrors: { amount?: string; category?: string; date?: string } = {};
    
    const parsedAmount = parseFloat(amount);
    if (!amount || amount.trim() === '') {
      newErrors.amount = language === 'en' ? 'Amount is required' : 'தொகை தேவை';
    } else if (isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = language === 'en' ? 'Amount must be greater than 0' : 'தொகை 0 ஐ விட அதிகமாக இருக்க வேண்டும்';
    }

    if (!selectedCategory) {
      newErrors.category = language === 'en' ? 'Category is required' : 'வகை தேவை';
    }

    if (!date) {
      newErrors.date = language === 'en' ? 'Date is required' : 'தேதி தேவை';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [amount, selectedCategory, date, language]);

  const isFormValid = useCallback(() => {
    const parsedAmount = parseFloat(amount);
    return (
      amount.trim() !== '' &&
      !isNaN(parsedAmount) &&
      parsedAmount > 0 &&
      selectedCategory !== '' &&
      date !== ''
    );
  }, [amount, selectedCategory, date]);

  const handleSubmit = async () => {
    if (isSaving || !expense) return;

    setTouched({ amount: true, category: true, date: true });

    if (!validateForm()) return;

    setIsSaving(true);

    try {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount)) {
        throw new Error('Invalid amount');
      }

      const updatedExpense: Expense = {
        ...expense,
        amount: parsedAmount,
        category: selectedCategory,
        date,
        notes: notes.trim() || undefined,
        paymentMethod,
      };

      onUpdateExpense(updatedExpense);
      
      toast({
        title: language === 'en' ? 'Expense Updated ✅' : 'செலவு புதுப்பிக்கப்பட்டது ✅',
        description: language === 'en' 
          ? `₹${parsedAmount.toLocaleString('en-IN')} updated`
          : `₹${parsedAmount.toLocaleString('en-IN')} புதுப்பிக்கப்பட்டது`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('[EditExpense] Error updating expense:', error);
      toast({
        title: language === 'en' ? 'Failed to update expense ❌' : 'செலவு புதுப்பிக்க முடியவில்லை ❌',
        description: language === 'en' ? 'Please try again' : 'மீண்டும் முயற்சிக்கவும்',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAmountChange = (value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      if (touched.amount) {
        const parsed = parseFloat(value);
        if (!value || isNaN(parsed) || parsed <= 0) {
          setErrors(prev => ({ ...prev, amount: language === 'en' ? 'Amount must be greater than 0' : 'தொகை 0 ஐ விட அதிகமாக இருக்க வேண்டும்' }));
        } else {
          setErrors(prev => ({ ...prev, amount: undefined }));
        }
      }
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">
            {language === 'en' ? 'Edit Expense' : 'செலவை திருத்து'}
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-5 pb-6">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="edit-amount" className="text-base">
              {t('amount')} <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">₹</span>
              <Input
                id="edit-amount"
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, amount: true }))}
                placeholder="0"
                className={cn(
                  "pl-8 text-2xl font-bold h-14",
                  touched.amount && errors.amount && "border-destructive focus-visible:ring-destructive"
                )}
              />
            </div>
            {touched.amount && errors.amount && (
              <p className="text-sm text-destructive">{errors.amount}</p>
            )}
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label className="text-base">
              {t('category')} <span className="text-destructive">*</span>
            </Label>
            <div className={cn(
              "grid grid-cols-4 gap-2 max-h-[180px] overflow-y-auto p-1 rounded-lg",
              touched.category && errors.category && "ring-1 ring-destructive"
            )}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setTouched(prev => ({ ...prev, category: true }));
                    setErrors(prev => ({ ...prev, category: undefined }));
                  }}
                  className={cn(
                    'flex flex-col items-center p-2 rounded-lg border transition-all',
                    selectedCategory === cat.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-secondary/50 hover:bg-secondary'
                  )}
                >
                  <span className="text-2xl mb-1">{cat.emoji}</span>
                  <span className="text-xs text-center line-clamp-1">
                    {language === 'en' ? cat.name : cat.nameTamil}
                  </span>
                </button>
              ))}
            </div>
            {touched.category && errors.category && (
              <p className="text-sm text-destructive">{errors.category}</p>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label className="text-base">
              {language === 'en' ? 'Payment Method' : 'கட்டண முறை'}
            </Label>
            <div className="flex gap-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all',
                    paymentMethod === method.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-secondary/50 hover:bg-secondary'
                  )}
                >
                  {method.icon}
                  <span className="text-sm font-medium">
                    {language === 'en' ? method.label : method.labelTamil}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Input */}
          <div className="space-y-2">
            <Label htmlFor="edit-date" className="text-base">
              {t('date')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setTouched(prev => ({ ...prev, date: true }));
                if (e.target.value) {
                  setErrors(prev => ({ ...prev, date: undefined }));
                }
              }}
              max={getTodayDate()}
              className={cn(
                "h-12",
                touched.date && errors.date && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {touched.date && errors.date && (
              <p className="text-sm text-destructive">{errors.date}</p>
            )}
          </div>

          {/* Notes Input */}
          <div className="space-y-2">
            <Label htmlFor="edit-notes" className="text-base">{t('notes')}</Label>
            <Textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={language === 'en' ? 'Add a note (optional)...' : 'குறிப்பு சேர்க்க (விருப்பமானது)...'}
              className="resize-none"
              rows={2}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-12"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              {t('cancel')}
            </Button>
            <Button
              type="button"
              className="flex-1 h-12"
              onClick={handleSubmit}
              disabled={!isFormValid() || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {language === 'en' ? 'Saving...' : 'சேமிக்கிறது...'}
                </>
              ) : (
                language === 'en' ? 'Update' : 'புதுப்பி'
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EditExpenseSheet;
