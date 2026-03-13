import { AlertTriangle, X, TrendingDown, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BudgetWarning, getWarningMessage } from '@/utils/budgetWarnings';
import { useLanguage } from '@/contexts/LanguageContext';

interface BudgetWarningBannerProps {
  warning: BudgetWarning;
}

const BudgetWarningBanner = ({ warning }: BudgetWarningBannerProps) => {
  const { language } = useLanguage();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showTips, setShowTips] = useState(false);
  
  const message = getWarningMessage(warning, language as 'en' | 'ta' | 'ml' | 'hi' | 'te');
  
  if (!message || isDismissed) return null;
  
  const getBgColor = () => {
    switch (warning.level) {
      case 'exceeded':
        return 'bg-destructive/20 border-destructive/30';
      case 'danger':
        return 'bg-orange-500/20 border-orange-500/30';
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/30';
      default:
        return 'bg-muted';
    }
  };
  
  const getIcon = () => {
    switch (warning.level) {
      case 'exceeded':
        return <TrendingDown className="h-5 w-5 text-destructive" />;
      case 'danger':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };
  
  return (
    <div className={`rounded-xl border p-4 mb-4 ${getBgColor()}`}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground text-sm">{message.title}</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mr-2 -mt-1"
              onClick={() => setIsDismissed(true)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line">
            {message.message}
          </p>
          
          {/* Tips Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 h-7 px-2 text-xs gap-1"
            onClick={() => setShowTips(!showTips)}
          >
            <Lightbulb className="h-3 w-3" />
            {showTips ? 'Hide Tips' : 'Show Tips'}
          </Button>
          
          {showTips && (
            <div className="mt-2 space-y-1">
              {message.tips.map((tip, index) => (
                <p key={index} className="text-xs text-foreground flex items-start gap-1.5">
                  <span className="text-primary">✓</span>
                  {tip}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetWarningBanner;
