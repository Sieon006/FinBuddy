import { Menu, Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import SettingsPanel from '@/components/SettingsPanel';

interface HeaderProps {
  monthlyBudget: number;
  monthlyIncome: number;
  onUpdateBudget: (budget: number) => void;
  onUpdateIncome: (income: number) => void;
}

const Header = ({
  monthlyBudget,
  monthlyIncome,
  onUpdateBudget,
  onUpdateIncome,
}: HeaderProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { profile, user } = useAuthContext();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return user?.email?.charAt(0).toUpperCase() || 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="flex items-center justify-between px-4 h-14">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-foreground">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[320px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-xl">{t('settings')}</SheetTitle>
            </SheetHeader>
            <SettingsPanel
              monthlyBudget={monthlyBudget}
              monthlyIncome={monthlyIncome}
              onUpdateBudget={onUpdateBudget}
              onUpdateIncome={onUpdateIncome}
            />
          </SheetContent>
        </Sheet>

        <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
          💰 {t('appName')}
        </h1>

        {/* Profile Avatar with Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full p-0">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || ''} alt={profile?.display_name || 'User'} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {getInitials(profile?.display_name)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate('/profile')} className="gap-2 cursor-pointer">
              <User className="h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')} className="gap-2 cursor-pointer">
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
