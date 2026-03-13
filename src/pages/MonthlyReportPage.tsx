import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Expense, Category, DEFAULT_CATEGORIES } from '@/types/expense';
import { calculateMonthlyReport, getPreviousMonth, getNextMonth } from '@/utils/reportUtils';
import { formatINR } from '@/utils/currency';
import { format, isAfter, startOfMonth } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c'];

const MonthlyReportPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [expenses] = useLocalStorage<Expense[]>('expense-tracker-expenses', []);
  const [monthlyIncome] = useLocalStorage<number>('expense-tracker-income', 0);
  const [customCategories] = useLocalStorage<Category[]>('expense-tracker-categories', []);
  
  const categories = useMemo(() => [...DEFAULT_CATEGORIES, ...customCategories], [customCategories]);
  
  const report = useMemo(() => 
    calculateMonthlyReport(expenses, categories, monthlyIncome, currentMonth),
    [expenses, categories, monthlyIncome, currentMonth]
  );
  
  const canGoNext = !isAfter(startOfMonth(currentMonth), startOfMonth(new Date()));
  
  const pieData = report.categoryBreakdown.slice(0, 6).map(cat => ({
    name: cat.category,
    value: cat.amount,
    emoji: cat.emoji,
  }));
  
  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">{t('monthlyReport')}</h1>
        </div>
      </div>
      
      {/* Month Navigator */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(getPreviousMonth(currentMonth))}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <p className="font-medium text-foreground">
            {format(report.month, 'MMMM yyyy')}
          </p>
          <p className="text-xs text-muted-foreground">
            {format(report.month, 'yyyy-MM') === format(new Date(), 'yyyy-MM') ? 'This Month' : ''}
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCurrentMonth(getNextMonth(currentMonth))}
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
                <PiggyBank className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs text-muted-foreground">Savings</span>
              </div>
              <p className={`font-bold ${report.savings >= 0 ? 'text-secondary' : 'text-destructive'}`}>
                {formatINR(report.savings)}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Category Pie Chart */}
        {pieData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend 
                      formatter={(value, entry: any) => (
                        <span className="text-xs text-foreground">{entry.payload.emoji} {value}</span>
                      )}
                      wrapperStyle={{ fontSize: '10px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Category List */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">All Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {report.categoryBreakdown.length > 0 ? (
              report.categoryBreakdown.map((cat, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{cat.emoji}</span>
                    <div>
                      <span className="text-sm text-foreground">{cat.category}</span>
                      <p className="text-xs text-muted-foreground">{cat.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <span className="font-medium text-foreground">{formatINR(cat.amount)}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No expenses this month</p>
            )}
          </CardContent>
        </Card>
        
        {/* Top Transactions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top 5 Transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {report.topTransactions.length > 0 ? (
              report.topTransactions.map((expense) => {
                const cat = categories.find(c => c.id === expense.category);
                return (
                  <div key={expense.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat?.emoji || '📦'}</span>
                      <div>
                        <p className="text-sm text-foreground">{cat?.name || expense.category}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(expense.date), 'MMM d')}</p>
                      </div>
                    </div>
                    <span className="font-medium text-foreground">{formatINR(expense.amount)}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No transactions this month</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonthlyReportPage;
