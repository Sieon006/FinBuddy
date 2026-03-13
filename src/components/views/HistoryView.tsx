import { useState, useMemo } from 'react';
import { Search, Filter, Calendar, ArrowUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { Expense, Category, SavingTransaction, SavingGoal } from '@/types/expense';
import { formatINR } from '@/utils/currency';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface HistoryViewProps {
  expenses: Expense[];
  categories: Category[];
  savingTransactions: SavingTransaction[];
  savingGoals: SavingGoal[];
  onBack: () => void;
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';
type TransactionType = 'all' | 'expense' | 'saving';

interface UnifiedTransaction {
  id: string;
  type: 'expense' | 'saving';
  amount: number;
  date: string;
  category?: string;
  categoryEmoji?: string;
  categoryName?: string;
  goalName?: string;
  notes?: string;
  paymentMethod?: string;
  createdAt: string;
}

const HistoryView = ({
  expenses,
  categories,
  savingTransactions,
  savingGoals,
  onBack,
}: HistoryViewProps) => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Combine expenses and saving transactions into unified list
  const unifiedTransactions = useMemo((): UnifiedTransaction[] => {
    const expenseTransactions: UnifiedTransaction[] = expenses.map((e) => {
      const category = categories.find((c) => c.id === e.category);
      return {
        id: e.id,
        type: 'expense' as const,
        amount: e.amount,
        date: e.date,
        category: e.category,
        categoryEmoji: category?.emoji || '📦',
        categoryName: language === 'en' ? category?.name : category?.nameTamil,
        notes: e.notes,
        paymentMethod: e.paymentMethod,
        createdAt: e.createdAt,
      };
    });

    const savingTxns: UnifiedTransaction[] = savingTransactions.map((t) => {
      const goal = savingGoals.find((g) => g.id === t.goalId);
      return {
        id: t.id,
        type: 'saving' as const,
        amount: t.amount,
        date: t.date,
        categoryEmoji: '💰',
        categoryName: language === 'en' ? 'Savings' : 'சேமிப்பு',
        goalName: goal?.name,
        createdAt: t.createdAt,
      };
    });

    return [...expenseTransactions, ...savingTxns];
  }, [expenses, savingTransactions, categories, savingGoals, language]);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let result = [...unifiedTransactions];

    // Type filter
    if (transactionType !== 'all') {
      result = result.filter((t) => t.type === transactionType);
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter((t) => t.category === selectedCategory);
    }

    // Date range filter
    if (dateFrom) {
      result = result.filter((t) => t.date >= dateFrom);
    }
    if (dateTo) {
      result = result.filter((t) => t.date <= dateTo);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.categoryName?.toLowerCase().includes(query) ||
          t.notes?.toLowerCase().includes(query) ||
          t.goalName?.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'highest':
          return b.amount - a.amount;
        case 'lowest':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    return result;
  }, [unifiedTransactions, transactionType, selectedCategory, dateFrom, dateTo, searchQuery, sortBy]);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, UnifiedTransaction[]> = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    filteredTransactions.forEach((t) => {
      let groupKey: string;
      if (t.date === todayStr) {
        groupKey = language === 'en' ? 'Today' : 'இன்று';
      } else if (t.date === yesterdayStr) {
        groupKey = language === 'en' ? 'Yesterday' : 'நேற்று';
      } else {
        groupKey = new Date(t.date).toLocaleDateString(language === 'en' ? 'en-IN' : 'ta-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(t);
    });

    return groups;
  }, [filteredTransactions, language]);

  const clearFilters = () => {
    setTransactionType('all');
    setSelectedCategory('');
    setDateFrom('');
    setDateTo('');
    setSortBy('newest');
  };

  const hasActiveFilters = transactionType !== 'all' || selectedCategory || dateFrom || dateTo || sortBy !== 'newest';

  const getPaymentMethodLabel = (method?: string): string => {
    if (!method) return '';
    const labels: Record<string, { en: string; ta: string }> = {
      cash: { en: 'Cash', ta: 'ரொக்கம்' },
      upi: { en: 'UPI', ta: 'யுபிஐ' },
      card: { en: 'Card', ta: 'கார்டு' },
    };
    return labels[method]?.[language === 'en' ? 'en' : 'ta'] || method;
  };

  return (
    <div className="px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <X className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">
          {language === 'en' ? 'Transaction History' : 'பரிவர்த்தனை வரலாறு'}
        </h1>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={language === 'en' ? 'Search by note or category...' : 'குறிப்பு அல்லது வகையால் தேடு...'}
          className="pl-10 h-12"
        />
      </div>

      {/* Filter & Sort Bar */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={hasActiveFilters ? 'default' : 'outline'}
          size="sm"
          className="gap-2"
          onClick={() => setFilterSheetOpen(true)}
        >
          <Filter className="h-4 w-4" />
          {language === 'en' ? 'Filter' : 'வடிகட்டு'}
          {hasActiveFilters && (
            <span className="bg-primary-foreground text-primary text-xs px-1.5 rounded-full">!</span>
          )}
        </Button>

        {/* Quick type filter chips */}
        <div className="flex gap-1 overflow-x-auto flex-1">
          {(['all', 'expense', 'saving'] as TransactionType[]).map((type) => (
            <Button
              key={type}
              variant={transactionType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTransactionType(type)}
              className="shrink-0"
            >
              {type === 'all'
                ? language === 'en' ? 'All' : 'அனைத்தும்'
                : type === 'expense'
                ? language === 'en' ? 'Expenses' : 'செலவுகள்'
                : language === 'en' ? 'Savings' : 'சேமிப்புகள்'}
            </Button>
          ))}
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
        <span>
          {filteredTransactions.length} {language === 'en' ? 'transactions' : 'பரிவர்த்தனைகள்'}
        </span>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            {language === 'en' ? 'Clear filters' : 'வடிகட்டிகளை நீக்கு'}
          </Button>
        )}
      </div>

      {/* Transaction List */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {language === 'en' ? 'No transactions found' : 'பரிவர்த்தனைகள் இல்லை'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTransactions).map(([dateLabel, transactions]) => (
            <div key={dateLabel}>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 sticky top-0 bg-background py-1">
                {dateLabel}
              </h3>
              <div className="space-y-2">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl border',
                      transaction.type === 'saving'
                        ? 'bg-secondary/5 border-secondary/20'
                        : 'bg-card border-border'
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center text-lg',
                        transaction.type === 'saving' ? 'bg-secondary/20' : 'bg-muted'
                      )}
                    >
                      {transaction.categoryEmoji}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground truncate">
                          {transaction.goalName || transaction.categoryName}
                        </p>
                        {transaction.paymentMethod && (
                          <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                            {getPaymentMethodLabel(transaction.paymentMethod)}
                          </span>
                        )}
                      </div>
                      {transaction.notes && (
                        <p className="text-xs text-muted-foreground truncate">{transaction.notes}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString(language === 'en' ? 'en-IN' : 'ta-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                    </div>

                    {/* Amount */}
                    <p
                      className={cn(
                        'font-bold text-lg',
                        transaction.type === 'saving' ? 'text-secondary' : 'text-destructive'
                      )}
                    >
                      {transaction.type === 'saving' ? '+' : '-'}
                      {formatINR(transaction.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Sheet */}
      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>{language === 'en' ? 'Filters & Sort' : 'வடிகட்டுதல் & வரிசைப்படுத்துதல்'}</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-6 pb-6">
            {/* Sort */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                {language === 'en' ? 'Sort By' : 'வரிசைப்படுத்து'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'newest', label: language === 'en' ? 'Newest First' : 'புதியது முதலில்' },
                  { id: 'oldest', label: language === 'en' ? 'Oldest First' : 'பழையது முதலில்' },
                  { id: 'highest', label: language === 'en' ? 'Highest Amount' : 'அதிக தொகை' },
                  { id: 'lowest', label: language === 'en' ? 'Lowest Amount' : 'குறைந்த தொகை' },
                ].map((option) => (
                  <Button
                    key={option.id}
                    variant={sortBy === option.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy(option.id as SortOption)}
                    className="h-10"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                {language === 'en' ? 'Category' : 'வகை'}
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={!selectedCategory ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('')}
                >
                  {language === 'en' ? 'All' : 'அனைத்தும்'}
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.id)}
                    className="gap-1"
                  >
                    {cat.emoji} {language === 'en' ? cat.name : cat.nameTamil}
                  </Button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {language === 'en' ? 'Date Range' : 'தேதி வரம்பு'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">{language === 'en' ? 'From' : 'முதல்'}</label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">{language === 'en' ? 'To' : 'வரை'}</label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1 h-12" onClick={clearFilters}>
                {language === 'en' ? 'Clear All' : 'அனைத்தையும் நீக்கு'}
              </Button>
              <Button className="flex-1 h-12" onClick={() => setFilterSheetOpen(false)}>
                {language === 'en' ? 'Apply' : 'பயன்படுத்து'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default HistoryView;
