import { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { calculateEMI } from '@/types/expense';
import { formatINR } from '@/utils/currency';

interface EMICalculatorProps {
  onSaveAsEMI?: (data: { loanAmount: number; interestRate: number; tenure: number; monthlyEMI: number }) => void;
}

const EMICalculator = ({ onSaveAsEMI }: EMICalculatorProps) => {
  const { t } = useLanguage();
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [tenure, setTenure] = useState('');
  const [result, setResult] = useState({ monthlyEMI: 0, totalInterest: 0, totalPayable: 0 });

  useEffect(() => {
    const principal = parseFloat(loanAmount) || 0;
    const rate = parseFloat(interestRate) || 0;
    const months = parseInt(tenure) || 0;

    if (principal > 0 && months > 0) {
      setResult(calculateEMI(principal, rate, months));
    } else {
      setResult({ monthlyEMI: 0, totalInterest: 0, totalPayable: 0 });
    }
  }, [loanAmount, interestRate, tenure]);

  const handleSaveAsEMI = () => {
    if (result.monthlyEMI > 0 && onSaveAsEMI) {
      onSaveAsEMI({
        loanAmount: parseFloat(loanAmount),
        interestRate: parseFloat(interestRate) || 0,
        tenure: parseInt(tenure),
        monthlyEMI: result.monthlyEMI,
      });
    }
  };

  return (
    <div className="bg-card p-4 rounded-xl border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">{t('emiCalculator')}</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="calcLoanAmount">{t('loanAmount')}</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
            <Input
              id="calcLoanAmount"
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              placeholder="500000"
              className="pl-8"
              inputMode="numeric"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="calcInterestRate">{t('interestRate')}</Label>
            <Input
              id="calcInterestRate"
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="8.5"
              step="0.1"
              inputMode="decimal"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="calcTenure">{t('tenure')}</Label>
            <Input
              id="calcTenure"
              type="number"
              value={tenure}
              onChange={(e) => setTenure(e.target.value)}
              placeholder="36"
              inputMode="numeric"
            />
          </div>
        </div>

        {/* Results */}
        {result.monthlyEMI > 0 && (
          <div className="bg-primary/10 p-4 rounded-xl border border-primary/20 space-y-3 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t('monthlyEMI')}</span>
              <span className="font-bold text-primary text-xl">{formatINR(result.monthlyEMI)}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('totalInterest')}</span>
              <span className="font-medium text-accent">{formatINR(result.totalInterest)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('totalPayable')}</span>
              <span className="font-medium text-foreground">{formatINR(result.totalPayable)}</span>
            </div>
            
            {onSaveAsEMI && (
              <Button onClick={handleSaveAsEMI} className="w-full mt-2" variant="secondary">
                {t('saveAsEmi')}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EMICalculator;
