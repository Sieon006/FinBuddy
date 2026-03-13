import { Plus, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { EMI } from '@/types/expense';
import { formatINR } from '@/utils/currency';
import EMICard from '@/components/EMICard';
import EMICalculator from '@/components/EMICalculator';

interface EMIViewProps {
  emis: EMI[];
  onAddEMI: () => void;
  onDeleteEMI: (id: string) => void;
  onMarkPaid: (id: string) => void;
  onSaveCalculatedEMI: (data: { loanAmount: number; interestRate: number; tenure: number; monthlyEMI: number }) => void;
}

const EMIView = ({ emis, onAddEMI, onDeleteEMI, onMarkPaid, onSaveCalculatedEMI }: EMIViewProps) => {
  const { t } = useLanguage();

  const totalMonthlyEMI = emis.reduce((sum, e) => sum + e.monthlyEMI, 0);
  const activeEMIs = emis.filter((e) => e.paidMonths < e.totalMonths);
  
  // Calculate overdue and upcoming
  const today = new Date();
  const currentDay = today.getDate();
  const overdueEMIs = activeEMIs.filter(e => currentDay > e.dueDate);
  const upcomingEMIs = activeEMIs.filter(e => currentDay <= e.dueDate && e.dueDate - currentDay <= 5);

  return (
    <div className="px-4 pt-4 pb-24">
      <h1 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
        <CreditCard className="h-6 w-6 text-primary" />
        {t('emiTracker')}
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-card p-4 rounded-xl border border-border">
          <p className="text-sm text-muted-foreground">{t('totalEmi')}</p>
          <p className="text-xl font-bold text-primary">{formatINR(totalMonthlyEMI)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {activeEMIs.length} active
          </p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border">
          <p className="text-sm text-muted-foreground">Status</p>
          <div className="flex flex-col gap-1 mt-1">
            {overdueEMIs.length > 0 && (
              <p className="text-sm font-medium text-destructive">⚠️ {overdueEMIs.length} overdue</p>
            )}
            {upcomingEMIs.length > 0 && (
              <p className="text-sm font-medium text-accent">⏰ {upcomingEMIs.length} upcoming</p>
            )}
            {overdueEMIs.length === 0 && upcomingEMIs.length === 0 && (
              <p className="text-sm font-medium text-secondary">✓ All good</p>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="emis" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="emis">My EMIs</TabsTrigger>
          <TabsTrigger value="calculator">{t('emiCalculator')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="emis" className="space-y-4">
          {/* Add Button */}
          <Button onClick={onAddEMI} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            {t('addEmi')}
          </Button>

          {/* EMI List */}
          {emis.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">{t('noEmi')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {emis.map((emi) => (
                <EMICard
                  key={emi.id}
                  emi={emi}
                  onDelete={onDeleteEMI}
                  onMarkPaid={onMarkPaid}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="calculator">
          <EMICalculator onSaveAsEMI={onSaveCalculatedEMI} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EMIView;
