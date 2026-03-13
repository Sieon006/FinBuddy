import { Home, Receipt, CreditCard, Bot, Target } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const { t } = useLanguage();

  const navItems = [
    { id: 'home', icon: Home, label: t('home') },
    { id: 'expenses', icon: Receipt, label: t('expenses') },
    { id: 'savings', icon: Target, label: t('savingGoals') },
    { id: 'emi', icon: CreditCard, label: t('emi') },
    { id: 'ai', icon: Bot, label: t('aiAssistant') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-bottom z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full transition-all duration-200',
                isActive 
                  ? 'text-primary scale-105' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn("h-5 w-5 mb-1", isActive && "drop-shadow-[0_0_8px_hsl(var(--primary))]")} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
