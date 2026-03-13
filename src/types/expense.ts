export type PaymentMethod = 'cash' | 'upi' | 'card';

export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
  paymentMethod?: PaymentMethod;
  createdAt: string;
}

export interface EMI {
  id: string;
  name: string;
  loanAmount: number;
  interestRate: number;
  tenure: number; // in months
  monthlyEMI: number;
  dueDate: number; // Day of month (1-31)
  totalMonths: number;
  paidMonths: number;
  createdAt: string;
}

export interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  startDate: string;
  createdAt: string;
}

export interface SavingTransaction {
  id: string;
  goalId: string;
  amount: number;
  date: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameTamil: string;
  emoji: string;
  isCustom: boolean;
}

export interface UserSettings {
  language: 'en' | 'ta';
  monthlyBudget: number;
  monthlyIncome: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export type UPIPaymentStatus = 'success' | 'failed' | 'pending';

export interface UPIPayment {
  id: string;
  amount: number;
  status: UPIPaymentStatus;
  utr?: string;
  txnId?: string;
  upiApp?: string;
  note?: string;
  createdAt: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food', nameTamil: 'உணவு', emoji: '🍲', isCustom: false },
  { id: 'petrol', name: 'Petrol/Diesel', nameTamil: 'பெட்ரோல்/டீசல்', emoji: '🚗', isCustom: false },
  { id: 'shopping', name: 'Shopping', nameTamil: 'ஷாப்பிங்', emoji: '🛒', isCustom: false },
  { id: 'mobile', name: 'Mobile Recharge', nameTamil: 'மொபைல் ரீசார்ஜ்', emoji: '📱', isCustom: false },
  { id: 'lpg', name: 'LPG Gas', nameTamil: 'எல்பிஜி', emoji: '⛽', isCustom: false },
  { id: 'bills', name: 'Bills', nameTamil: 'பில்கள்', emoji: '💡', isCustom: false },
  { id: 'health', name: 'Health', nameTamil: 'மருத்துவம்', emoji: '🏥', isCustom: false },
  { id: 'education', name: 'Education', nameTamil: 'கல்வி', emoji: '🎓', isCustom: false },
  { id: 'entertainment', name: 'Entertainment', nameTamil: 'பொழுதுபோக்கு', emoji: '🎬', isCustom: false },
  { id: 'transport', name: 'Transport', nameTamil: 'போக்குவரத்து', emoji: '🚌', isCustom: false },
  { id: 'gold', name: 'Gold/Jewellery', nameTamil: 'நகை/தங்கம்', emoji: '💎', isCustom: false },
  { id: 'temple', name: 'Temple/Donations', nameTamil: 'கோவில்/தர்மம்', emoji: '🛕', isCustom: false },
  { id: 'others', name: 'Others', nameTamil: 'மற்றவை', emoji: '📦', isCustom: false },
];

// EMI Calculator utility
export const calculateEMI = (
  principal: number,
  annualRate: number,
  tenureMonths: number
): { monthlyEMI: number; totalInterest: number; totalPayable: number } => {
  if (principal <= 0 || annualRate < 0 || tenureMonths <= 0) {
    return { monthlyEMI: 0, totalInterest: 0, totalPayable: 0 };
  }
  
  const monthlyRate = annualRate / 12 / 100;
  
  if (monthlyRate === 0) {
    const monthlyEMI = principal / tenureMonths;
    return { monthlyEMI, totalInterest: 0, totalPayable: principal };
  }
  
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
              (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  
  const totalPayable = emi * tenureMonths;
  const totalInterest = totalPayable - principal;
  
  return {
    monthlyEMI: Math.round(emi),
    totalInterest: Math.round(totalInterest),
    totalPayable: Math.round(totalPayable),
  };
};
