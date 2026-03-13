import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Sun, Moon, Globe, Loader2, BarChart3, Calendar, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useLanguage, LANGUAGE_OPTIONS } from '@/contexts/LanguageContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { signOut, user } = useAuthContext();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Theme state - stored in localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return !document.documentElement.classList.contains('light');
  });

  const handleThemeChange = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
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
        navigate('/auth');
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">{t('settings')}</h1>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-md mx-auto">
        {/* Theme Toggle */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDarkMode ? (
                <Moon className="h-5 w-5 text-primary" />
              ) : (
                <Sun className="h-5 w-5 text-warning" />
              )}
              <div>
                <Label className="text-base font-medium">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  {isDarkMode ? 'Dark theme enabled' : 'Light theme enabled'}
                </p>
              </div>
            </div>
            <Switch
              checked={isDarkMode}
              onCheckedChange={handleThemeChange}
            />
          </div>
        </div>

        {/* Reports Section */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <Label className="text-base font-medium">{t('reports')}</Label>
          </div>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={() => navigate('/reports/weekly')}
            >
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
              <span>{t('weeklyReport')}</span>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={() => navigate('/reports/monthly')}
            >
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span>{t('monthlyReport')}</span>
            </Button>
          </div>
        </div>

        {/* Language Selection */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-5 w-5 text-primary" />
            <Label className="text-base font-medium">{t('language')}</Label>
          </div>
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

        {/* Account Info */}
        {user && (
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="mb-4">
              <Label className="text-base font-medium">Account</Label>
              <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
            </div>
            <Button
              variant="destructive"
              className="w-full gap-2"
              onClick={handleSignOut}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing out...
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4" />
                  {t('signOut')}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
