import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Bot, Volume2, VolumeX, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage, SPEECH_LANG_CODES } from '@/contexts/LanguageContext';
import { Expense, EMI, SavingGoal, Category, ChatMessage } from '@/types/expense';
import { formatINR, isCurrentMonth } from '@/utils/currency';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

// AI Reply language options
const AI_LANGUAGE_OPTIONS = [
  { code: 'EN', label: 'EN' },
  { code: 'TA', label: 'தமிழ்' },
  { code: 'MIX', label: 'Mix' },
  { code: 'HI', label: 'हिंदी' },
  { code: 'TE', label: 'తెలుగు' },
  { code: 'ML', label: 'മലയാളം' },
];

interface AIAssistantViewProps {
  expenses: Expense[];
  emis: EMI[];
  savingGoals: SavingGoal[];
  categories: Category[];
  monthlyBudget: number;
  monthlyIncome: number;
  onAddExpense: (expense: Expense) => void;
  onSetBudget: (budget: number) => void;
  onAddGoal: (goal: SavingGoal) => void;
  onAddEMI: (emi: EMI) => void;
  onNavigate: (tab: string) => void;
}

const AIAssistantView = ({ 
  expenses, emis, savingGoals, categories, monthlyBudget, monthlyIncome,
  onAddExpense, onSetBudget, onAddGoal, onAddEMI, onNavigate 
}: AIAssistantViewProps) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();

  // Map AI language selector to speech lang codes
  const getVoiceLangCode = (code: string): string => {
    switch (code?.toUpperCase()) {
      case 'TA': case 'MIX': return 'ta';
      case 'HI': return 'hi';
      case 'TE': return 'te';
      case 'ML': return 'ml';
      default: return 'en';
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('EN');
  const [voiceMode, setVoiceMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const speechLang = getVoiceLangCode(selectedLanguage);
  const { speak, stop, isSpeaking, isSupported: ttsSupported } = useSpeechSynthesis(speechLang);

  // Handle AI actions from voice commands
  const handleAIAction = (action: string, data: Record<string, unknown>) => {
    const today = new Date().toISOString().split('T')[0];
    
    switch (action) {
      case 'ADD_EXPENSE': {
        const expense: Expense = {
          id: Date.now().toString(),
          amount: Number(data.amount) || 0,
          category: String(data.category || 'others'),
          date: data.date === 'today' ? today : String(data.date || today),
          notes: String(data.note || ''),
          paymentMethod: 'cash',
          createdAt: new Date().toISOString(),
        };
        onAddExpense(expense);
        toast({ title: t('expenseAdded'), description: `₹${expense.amount} - ${expense.category}` });
        break;
      }
      case 'SET_BUDGET': {
        const amount = Number(data.amount);
        if (amount > 0) {
          onSetBudget(amount);
          toast({ title: 'Budget Updated', description: `Monthly budget set to ₹${amount.toLocaleString()}` });
        }
        break;
      }
      case 'CREATE_GOAL': {
        const goal: SavingGoal = {
          id: Date.now().toString(),
          name: String(data.name || 'New Goal'),
          targetAmount: Number(data.targetAmount) || 0,
          currentAmount: 0,
          targetDate: String(data.deadline || ''),
          startDate: today,
          createdAt: new Date().toISOString(),
        };
        onAddGoal(goal);
        toast({ title: 'Goal Created', description: `${goal.name} - ₹${goal.targetAmount.toLocaleString()}` });
        break;
      }
      case 'ADD_EMI': {
        const emi: EMI = {
          id: Date.now().toString(),
          name: String(data.name || 'New EMI'),
          loanAmount: Number(data.loanAmount) || 0,
          interestRate: Number(data.interestRate) || 0,
          tenure: Number(data.tenure) || 12,
          monthlyEMI: 0, // Will be calculated
          dueDate: Number(data.dueDate) || 1,
          totalMonths: Number(data.tenure) || 12,
          paidMonths: 0,
          createdAt: new Date().toISOString(),
        };
        // Calculate EMI
        const r = emi.interestRate / 12 / 100;
        const n = emi.tenure;
        emi.monthlyEMI = r > 0 
          ? Math.round((emi.loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1))
          : Math.round(emi.loanAmount / n);
        onAddEMI(emi);
        toast({ title: 'EMI Added', description: `${emi.name} - ₹${emi.monthlyEMI}/month` });
        break;
      }
      case 'VIEW_WEEKLY_REPORT':
        onNavigate('weekly-report');
        break;
      case 'VIEW_MONTHLY_REPORT':
        onNavigate('monthly-report');
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Build financial context for AI including EMI details
  const buildFinancialContext = () => {
    const thisMonthExpenses = expenses.filter(e => isCurrentMonth(e.date));
    const totalSpent = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const activeEMIs = emis.filter(e => e.paidMonths < e.totalMonths);
    const totalEMI = activeEMIs.reduce((sum, e) => sum + e.monthlyEMI, 0);
    const totalEMIRemaining = activeEMIs.reduce((sum, e) => sum + (e.monthlyEMI * (e.totalMonths - e.paidMonths)), 0);
    
    const categoryBreakdown = categories.map(cat => {
      const spent = thisMonthExpenses.filter(e => e.category === cat.id).reduce((sum, e) => sum + e.amount, 0);
      return spent > 0 ? `${cat.name}: ₹${spent}` : null;
    }).filter(Boolean).join(', ');

    // Detailed EMI information
    const emiDetails = activeEMIs.map(e => {
      const remainingMonths = e.totalMonths - e.paidMonths;
      const remainingAmount = e.monthlyEMI * remainingMonths;
      return `${e.name}: ₹${e.monthlyEMI}/month, ${remainingMonths} months left (₹${remainingAmount} remaining), loan: ₹${e.loanAmount} at ${e.interestRate}%, due on ${e.dueDate}th`;
    }).join('; ');

    return `
User's Financial Data:
- Monthly Income: ₹${monthlyIncome}
- Monthly Budget: ₹${monthlyBudget}
- This Month's Spending: ₹${totalSpent}
- Remaining Budget: ₹${monthlyBudget - totalSpent}
- Active EMIs: ${activeEMIs.length} (Total: ₹${totalEMI}/month, Total remaining to pay: ₹${totalEMIRemaining})
- EMI Details: ${emiDetails || 'No active EMIs'}
- Category-wise Spending: ${categoryBreakdown || 'No expenses yet'}
- Saving Goals: ${savingGoals.map(g => `${g.name}: ₹${g.currentAmount}/₹${g.targetAmount}`).join(', ') || 'None set'}
`;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history for context (exclude system messages, keep last 10)
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Use user-selected AI reply language

      const response = await supabase.functions.invoke('finance-ai-chat', {
        body: {
          message: input.trim(),
          financialContext: buildFinancialContext(),
          selectedLanguage,
          conversationHistory,
          voiceMode,
        },
      });

      if (response.error) throw response.error;

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.reply || 'Sorry, I could not process that request.',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Handle AI action if present
      if (response.data.action && response.data.actionData) {
        handleAIAction(response.data.action, response.data.actionData);
      }
      
      // Auto-speak the response if enabled
      if (autoSpeak && ttsSupported) {
        speak(response.data.reply);
      }
    } catch (error: any) {
      console.error('AI Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to get AI response',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({ title: 'Voice input not supported', variant: 'destructive' });
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    // Use selectedLanguage (AI reply language) for voice input recognition
    const speechRecogLangMap: Record<string, string> = {
      'EN': 'en-IN', 'TA': 'ta-IN', 'MIX': 'ta-IN', 'HI': 'hi-IN', 'TE': 'te-IN', 'ML': 'ml-IN',
    };
    recognition.lang = speechRecogLangMap[selectedLanguage] || 'en-IN';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceMode(true); // Enable voice mode when using voice input
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.start();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              {t('aiAssistant')}
            </h1>
            {voiceMode && (
              <Badge variant="default" className="animate-pulse flex items-center gap-1 bg-destructive text-destructive-foreground">
                <Radio className="h-3 w-3" />
                Voice
              </Badge>
            )}
          </div>
          {/* Language Selector */}
          <div className="flex gap-1">
            {AI_LANGUAGE_OPTIONS.map((lang) => (
              <Button
                key={lang.code}
                variant={selectedLanguage === lang.code ? 'default' : 'outline'}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setSelectedLanguage(lang.code)}
              >
                {lang.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot className="h-16 w-16 mx-auto text-primary/50 mb-4" />
            <p className="text-muted-foreground text-sm">{t('aiWelcome')}</p>
            <div className="mt-4 space-y-2">
              <p className="text-xs text-muted-foreground">Try asking:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['How much EMI do I pay?', 'Can I afford ₹5000 more EMI?', 'Which expenses to reduce?'].map((q) => (
                  <Button key={q} variant="outline" size="sm" onClick={() => setInput(q)} className="text-xs">
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
              <p className="text-sm text-foreground whitespace-pre-wrap">{msg.content}</p>
              {msg.role === 'assistant' && ttsSupported && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 h-6 px-2 text-xs text-muted-foreground hover:text-primary"
                  onClick={() => isSpeaking ? stop() : speak(msg.content)}
                >
                  {isSpeaking ? <VolumeX className="h-3 w-3 mr-1" /> : <Volume2 className="h-3 w-3 mr-1" />}
                  {isSpeaking ? t('stop') : t('listen')}
                </Button>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="chat-bubble-ai p-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setVoiceMode(!voiceMode)}
            className={voiceMode ? 'text-destructive bg-destructive/10' : ''}
            title={voiceMode ? 'Voice mode ON' : 'Voice mode OFF'}
          >
            <Radio className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={toggleVoiceInput} className={isListening ? 'text-destructive' : ''}>
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          {ttsSupported && (
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setAutoSpeak(!autoSpeak)}
              className={autoSpeak ? 'text-primary bg-primary/10' : ''}
              title={autoSpeak ? 'Auto-speak ON' : 'Auto-speak OFF'}
            >
              {autoSpeak ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
          )}
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('typeMessage')}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1"
            disabled={isLoading}
          />
          <Button onClick={sendMessage} disabled={!input.trim() || isLoading}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantView;
