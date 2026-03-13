import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Expense, Category, DEFAULT_CATEGORIES } from '@/types/expense';
import { calculateWeeklyReport, getPreviousWeek, getNextWeek } from '@/utils/reportUtils';
import { formatINR } from '@/utils/currency';
import { format, isAfter, startOfWeek } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

const WeeklyReportPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  
  const [expenses] = useLocalStorage<Expense[]>('expense-tracker-expenses', []);
  const [monthlyIncome] = useLocalStorage<number>('expense-tracker-income', 0);
  const [customCategories] = useLocalStorage<Category[]>('expense-tracker-categories', []);
  
  const categories = useMemo(() => [...DEFAULT_CATEGORIES, ...customCategories], [customCategories]);
  
  const report = useMemo(() => 
    calculateWeeklyReport(expenses, categories, monthlyIncome, currentWeek),
    [expenses, categories, monthlyIncome, currentWeek]
  );
  
  const canGoNext = !isAfter(startOfWeek(currentWeek, { weekStartsOn: 1 }), startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  const chartData = report.dayWiseSpending.map(d => ({
    name: d.day,
    amount: d.amount,
  }));
  
  const maxAmount = Math.max(...chartData.map(d => d.amount), 1);
  
  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">{t('weeklyReport')}</h1>
        </div>
      </div>
      
      {/* Week Navigator */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => setCurrentWeek(getPreviousWeek(currentWeek))}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <p className="font-medium text-foreground">
            {format(report.weekStart, 'MMM d')} - {format(report.weekEnd, 'MMM d, yyyy')}
          </p>
          <p className="text-xs text-muted-foreground">
            {format(report.weekStart, 'yyyy') === format(new Date(), 'yyyy') && 
             format(report.weekStart, 'ww') === format(new Date(), 'ww') ? 'This Week' : ''}
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCurrentWeek(getNextWeek(currentWeek))}
          disabled={!canGoNext}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-card">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                <span className="text-xs text-muted-foreground">Spent</span>
              </div>
              <p className="font-bold text-foreground">{formatINR(report.totalSpent)}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="h-3.5 w-3.5 text-secondary" />
                <span className="text-xs text-muted-foreground">Income</span>
              </div>
              <p className="font-bold text-foreground">{formatINR(report.totalIncome)}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Wallet className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs text-muted-foreground">Balance</span>
              </div>
              <p className={`font-bold ${report.netBalance >= 0 ? 'text-secondary' : 'text-destructive'}`}>
                {formatINR(report.netBalance)}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Day-wise Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Day-wise Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis hide domain={[0, maxAmount * 1.1]} />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.amount > 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted))'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Top Categories */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {report.topCategories.length > 0 ? (
              report.topCategories.map((cat, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{cat.emoji}</span>
                    <span className="text-sm text-foreground">{cat.category}</span>
                  </div>
                  <span className="font-medium text-foreground">{formatINR(cat.amount)}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No expenses this week</p>
            )}
          </CardContent>
        </Card>
        
        {/* Transactions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {report.transactions.length > 0 ? (
              report.transactions.slice(0, 10).map((expense) => {
                const cat = categories.find(c => c.id === expense.category);
                return (
                  <div key={expense.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat?.emoji || '📦'}</span>
                      <div>
                        <p className="text-sm text-foreground">{cat?.name || expense.category}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(expense.date), 'EEE, MMM d')}</p>
                      </div>
                    </div>
                    <span className="font-medium text-foreground">{formatINR(expense.amount)}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No transactions this week</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WeeklyReportPage;
