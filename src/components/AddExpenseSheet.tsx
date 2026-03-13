import { useState, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { Category, Expense } from '@/types/expense';
import { generateId, getTodayDate } from '@/utils/currency';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Loader2, Banknote, Smartphone, CreditCard } from 'lucide-react';

type PaymentMethod = 'cash' | 'upi' | 'card';

interface AddExpenseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onAddExpense: (expense: Expense) => void;
}

const PAYMENT_METHODS: { id: PaymentMethod; label: string; labelTamil: string; icon: React.ReactNode }[] = [
  { id: 'cash', label: 'Cash', labelTamil: 'ரொக்கம்', icon: <Banknote className="h-4 w-4" /> },
  { id: 'upi', label: 'UPI', labelTamil: 'யுபிஐ', icon: <Smartphone className="h-4 w-4" /> },
  { id: 'card', label: 'Card', labelTamil: 'கார்டு', icon: <CreditCard className="h-4 w-4" /> },
];

const AddExpenseSheet = ({ open, onOpenChange, categories, onAddExpense }: AddExpenseSheetProps) => {
  const { t, language } = useLanguage();
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [date, setDate] = useState(getTodayDate());
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ amount?: string; category?: string; date?: string }>({});
  const [touched, setTouched] = useState<{ amount?: boolean; category?: boolean; date?: boolean }>({});

  const validateForm = useCallback(() => {
    const newErrors: { amount?: string; category?: string; date?: string } = {};
    
    // Amount validation
    const parsedAmount = parseFloat(amount);
    if (!amount || amount.trim() === '') {
      newErrors.amount = language === 'en' ? 'Amount is required' : 'தொகை தேவை';
    } else if (isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = language === 'en' ? 'Amount must be greater than 0' : 'தொகை 0 ஐ விட அதிகமாக இருக்க வேண்டும்';
    }

    // Category validation
    if (!selectedCategory) {
      newErrors.category = language === 'en' ? 'Category is required' : 'வகை தேவை';
    }

    // Date validation
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
    // Prevent double submission
    if (isSaving) {
      console.log('[AddExpense] Already saving, preventing duplicate submission');
      return;
    }

    // Mark all fields as touched
    setTouched({ amount: true, category: true, date: true });

    // Validate form
    if (!validateForm()) {
      console.log('[AddExpense] Validation failed:', errors);
      return;
    }

    setIsSaving(true);
    console.log('[AddExpense] Starting save...');

    try {
      // Parse amount as number (ensure it's a valid number)
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount)) {
        throw new Error('Invalid amount');
      }

      const expense: Expense = {
        id: generateId(),
        amount: parsedAmount, // Stored as NUMBER
        category: selectedCategory,
        date,
        notes: notes.trim() || undefined,
        paymentMethod,
        createdAt: new Date().toISOString(),
      };

      console.log('[AddExpense] Payload being saved:', JSON.stringify(expense, null, 2));

      // Call the add expense handler
      onAddExpense(expense);
      
      console.log('[AddExpense] Expense added successfully:', expense.id);

      // Show success toast
      toast({
        title: language === 'en' ? 'Expense Added ✅' : 'செலவு சேர்க்கப்பட்டது ✅',
        description: language === 'en' 
          ? `₹${parsedAmount.toLocaleString('en-IN')} added to ${categories.find(c => c.id === selectedCategory)?.name || selectedCategory}`
          : `₹${parsedAmount.toLocaleString('en-IN')} ${categories.find(c => c.id === selectedCategory)?.nameTamil || selectedCategory} க்கு சேர்க்கப்பட்டது`,
      });

      // Reset form and close
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('[AddExpense] Error saving expense:', error);
      toast({
        title: language === 'en' ? 'Failed to add expense ❌' : 'செலவு சேர்க்க முடியவில்லை ❌',
        description: language === 'en' ? 'Please try again' : 'மீண்டும் முயற்சிக்கவும்',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setSelectedCategory('');
    setDate(getTodayDate());
    setNotes('');
    setPaymentMethod('cash');
    setErrors({});
    setTouched({});
  };

  const handleAmountChange = (value: string) => {
    // Only allow valid number input
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

  return (
    <Sheet open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">{t('addExpense')}</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-5 pb-6">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-base">
              {t('amount')} <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">₹</span>
              <Input
                id="amount"
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
            <Label htmlFor="date" className="text-base">
              {t('date')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="date"
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
            <Label htmlFor="notes" className="text-base">{t('notes')}</Label>
            <Textarea
              id="notes"
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
                t('save')
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddExpenseSheet;
