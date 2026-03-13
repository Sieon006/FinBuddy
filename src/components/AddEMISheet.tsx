import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { EMI, calculateEMI } from '@/types/expense';
import { generateId, formatINR } from '@/utils/currency';

interface AddEMISheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddEMI: (emi: EMI) => void;
}

const AddEMISheet = ({ open, onOpenChange, onAddEMI }: AddEMISheetProps) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [tenure, setTenure] = useState('');
  const [dueDate, setDueDate] = useState('1');
  const [paidMonths, setPaidMonths] = useState('0');
  
  const [calculatedEMI, setCalculatedEMI] = useState({ monthlyEMI: 0, totalInterest: 0, totalPayable: 0 });

  useEffect(() => {
    const principal = parseFloat(loanAmount) || 0;
    const rate = parseFloat(interestRate) || 0;
    const months = parseInt(tenure) || 0;
    
    if (principal > 0 && months > 0) {
      setCalculatedEMI(calculateEMI(principal, rate, months));
    } else {
      setCalculatedEMI({ monthlyEMI: 0, totalInterest: 0, totalPayable: 0 });
    }
  }, [loanAmount, interestRate, tenure]);

  const handleSubmit = () => {
    if (!name || !loanAmount || !tenure) return;

    const emi: EMI = {
      id: generateId(),
      name,
      loanAmount: parseFloat(loanAmount),
      interestRate: parseFloat(interestRate) || 0,
      tenure: parseInt(tenure),
      monthlyEMI: calculatedEMI.monthlyEMI,
      dueDate: parseInt(dueDate),
      totalMonths: parseInt(tenure),
      paidMonths: parseInt(paidMonths),
      createdAt: new Date().toISOString(),
    };

    onAddEMI(emi);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setName('');
    setLoanAmount('');
    setInterestRate('');
    setTenure('');
    setDueDate('1');
    setPaidMonths('0');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">{t('addEmi')}</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emiName" className="text-base">{t('emiName')}</Label>
            <Input
              id="emiName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Car Loan, Phone EMI..."
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="loanAmount" className="text-base">{t('loanAmount')}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">₹</span>
              <Input
                id="loanAmount"
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                placeholder="500000"
                className="pl-8 text-lg font-bold h-12"
                inputMode="numeric"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interestRate" className="text-base">{t('interestRate')}</Label>
              <Input
                id="interestRate"
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="8.5"
                step="0.1"
                className="h-12"
                inputMode="decimal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenure" className="text-base">{t('tenure')}</Label>
              <Input
                id="tenure"
                type="number"
                value={tenure}
                onChange={(e) => setTenure(e.target.value)}
                placeholder="36"
                className="h-12"
                inputMode="numeric"
              />
            </div>
          </div>

          {/* Calculated EMI Preview */}
          {calculatedEMI.monthlyEMI > 0 && (
            <div className="bg-primary/10 p-4 rounded-xl border border-primary/20 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('monthlyEMI')}</span>
                <span className="font-bold text-primary text-lg">{formatINR(calculatedEMI.monthlyEMI)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('totalInterest')}</span>
                <span className="font-medium text-accent">{formatINR(calculatedEMI.totalInterest)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('totalPayable')}</span>
                <span className="font-medium">{formatINR(calculatedEMI.totalPayable)}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-base">{t('dueDate')}</Label>
              <Input
                id="dueDate"
                type="number"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min="1"
                max="31"
                className="h-12"
                inputMode="numeric"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paidMonths" className="text-base">{t('paidMonths')}</Label>
              <Input
                id="paidMonths"
                type="number"
                value={paidMonths}
                onChange={(e) => setPaidMonths(e.target.value)}
                min="0"
                max={tenure || undefined}
                className="h-12"
                inputMode="numeric"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 h-12"
              onClick={() => onOpenChange(false)}
            >
              {t('cancel')}
            </Button>
            <Button
              className="flex-1 h-12"
              onClick={handleSubmit}
              disabled={!name || !loanAmount || !tenure}
            >
              {t('save')}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddEMISheet;
