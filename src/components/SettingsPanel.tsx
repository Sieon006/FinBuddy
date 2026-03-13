import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage, LANGUAGE_OPTIONS } from '@/contexts/LanguageContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SettingsPanelProps {
  monthlyBudget: number;
  monthlyIncome: number;
  onUpdateBudget: (budget: number) => void;
  onUpdateIncome: (income: number) => void;
}

const SettingsPanel = ({
  monthlyBudget,
  monthlyIncome,
  onUpdateBudget,
  onUpdateIncome,
}: SettingsPanelProps) => {
  const { t, language, setLanguage } = useLanguage();
  const { signOut, user, profile } = useAuthContext();
  const { toast } = useToast();
  const [budget, setBudget] = useState(monthlyBudget.toString());
  const [income, setIncome] = useState(monthlyIncome.toString());

  const handleBudgetBlur = () => {
    const value = parseFloat(budget) || 0;
    onUpdateBudget(value);
  };

  const handleIncomeBlur = () => {
    const value = parseFloat(income) || 0;
    onUpdateIncome(value);
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully',
      });
    }
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Language Selector */}
      <div className="bg-muted/50 p-4 rounded-xl">
        <p className="font-medium text-foreground mb-4">{t('language')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {LANGUAGE_OPTIONS.map((lang) => (
            <Button
              key={lang.code}
              variant={language === lang.code ? 'default' : 'outline'}
              className={`
                w-full h-12 px-4 py-3
                flex items-center justify-center gap-2
                rounded-lg
                overflow-hidden
                ${language === lang.code 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background border-border hover:bg-muted'
                }
              `}
              onClick={() => setLanguage(lang.code)}
            >
              <span className="font-medium truncate">{lang.nativeName}</span>
              {lang.code !== 'en' && (
                <span className={`text-xs truncate ${language === lang.code ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  ({lang.name})
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Budget & Income */}
      <div className="space-y-4">
        <div className="bg-muted/50 p-4 rounded-xl">
          <Label htmlFor="budget" className="text-base font-medium">{t('monthlyBudget')}</Label>
          <div className="relative mt-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
            <Input
              id="budget"
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              onBlur={handleBudgetBlur}
              className="pl-8 h-12 bg-background"
              inputMode="numeric"
            />
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-xl">
          <Label htmlFor="income" className="text-base font-medium">{t('monthlyIncome')}</Label>
          <div className="relative mt-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
            <Input
              id="income"
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              onBlur={handleIncomeBlur}
              className="pl-8 h-12 bg-background"
              inputMode="numeric"
            />
          </div>
        </div>
      </div>

      {/* User Account Section */}
      {user && (
        <div className="bg-muted/50 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium text-foreground">Account</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {profile?.display_name && (
                <p className="text-xs text-muted-foreground">{profile.display_name}</p>
              )}
            </div>
          </div>
          <Button
            variant="destructive"
            className="w-full gap-2"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;
