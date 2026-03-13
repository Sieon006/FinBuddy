// Budget Warning Templates for Multi-Language Support
import { Expense, Category } from '@/types/expense';
import { isCurrentMonth } from '@/utils/currency';

type Language = 'en' | 'ta' | 'ml' | 'hi' | 'te';

export interface BudgetWarning {
  level: 'safe' | 'warning' | 'danger' | 'exceeded';
  percentage: number;
  remaining: number;
  daysLeft: number;
  topCategory: string;
  topCategoryAmount: number;
  dailyLimit: number;
  overSpent: number;
}

export interface WarningMessage {
  title: string;
  message: string;
  tips: string[];
}

export const calculateBudgetStatus = (
  expenses: Expense[],
  categories: Category[],
  monthlyBudget: number
): BudgetWarning => {
  const thisMonthExpenses = expenses.filter(e => isCurrentMonth(e.date));
  const totalSpent = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const percentage = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;
  const remaining = monthlyBudget - totalSpent;
  
  // Calculate days left in month
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysLeft = lastDay - today.getDate();
  
  // Find top spending category
  const categorySpending: Record<string, number> = {};
  thisMonthExpenses.forEach(e => {
    categorySpending[e.category] = (categorySpending[e.category] || 0) + e.amount;
  });
  
  let topCategory = '';
  let topCategoryAmount = 0;
  Object.entries(categorySpending).forEach(([cat, amount]) => {
    if (amount > topCategoryAmount) {
      topCategory = cat;
      topCategoryAmount = amount;
    }
  });
  
  // Get category name
  const categoryInfo = categories.find(c => c.id === topCategory);
  const topCategoryName = categoryInfo?.name || topCategory;
  
  // Calculate daily limit for remaining days
  const dailyLimit = daysLeft > 0 && remaining > 0 ? Math.floor(remaining / daysLeft) : 0;
  
  // Determine warning level
  let level: 'safe' | 'warning' | 'danger' | 'exceeded';
  if (percentage >= 100) {
    level = 'exceeded';
  } else if (percentage >= 90) {
    level = 'danger';
  } else if (percentage >= 80) {
    level = 'warning';
  } else {
    level = 'safe';
  }
  
  return {
    level,
    percentage,
    remaining,
    daysLeft,
    topCategory: topCategoryName,
    topCategoryAmount,
    dailyLimit,
    overSpent: remaining < 0 ? Math.abs(remaining) : 0,
  };
};

// Multi-language warning messages
export const getWarningMessage = (warning: BudgetWarning, language: Language): WarningMessage | null => {
  const { level, remaining, daysLeft, topCategory, topCategoryAmount, dailyLimit, overSpent } = warning;
  
  if (level === 'safe') return null;
  
  const formatAmount = (amt: number) => amt.toLocaleString('en-IN');
  
  const messages: Record<Language, Record<'warning' | 'danger' | 'exceeded', WarningMessage>> = {
    en: {
      warning: {
        title: '⚠️ Budget Alert',
        message: `You used 80% of your monthly budget.\nRemaining: ₹${formatAmount(remaining)} | Days left: ${daysLeft}\nTop spending: ${topCategory} ₹${formatAmount(topCategoryAmount)}`,
        tips: [
          'Cut non-essential spends for 3-5 days',
          `Keep daily limit ₹${formatAmount(dailyLimit)}`,
          'Avoid outside food this week',
        ],
      },
      danger: {
        title: '🚨 Budget Warning',
        message: `You used 90% of your budget.\nRemaining: ₹${formatAmount(remaining)} | Days left: ${daysLeft}\nTop spending: ${topCategory} ₹${formatAmount(topCategoryAmount)}`,
        tips: [
          'Avoid outside food this week',
          `Keep daily limit ₹${formatAmount(dailyLimit)}`,
          'Cancel unused subscriptions',
        ],
      },
      exceeded: {
        title: '❌ Budget Exceeded!',
        message: `You crossed your monthly budget.\nOverspent: ₹${formatAmount(overSpent)} | Days left: ${daysLeft}\nHighest spend: ${topCategory}`,
        tips: [
          'Stop extra spending now',
          `Review "${topCategory}" expenses`,
          'Use cash for small purchases',
        ],
      },
    },
    ta: {
      warning: {
        title: '⚠️ பட்ஜெட் எச்சரிக்கை',
        message: `உங்கள் மாத பட்ஜெட்டின் 80% செலவாகிவிட்டது.\nமீதம்: ₹${formatAmount(remaining)} | மீதமுள்ள நாட்கள்: ${daysLeft}\nஅதிக செலவு: ${topCategory} ₹${formatAmount(topCategoryAmount)}`,
        tips: [
          '3-5 நாட்களுக்கு தேவையில்லாத செலவுகளை குறைக்கவும்',
          `தினசரி செலவு வரம்பு ₹${formatAmount(dailyLimit)} வைத்துக்கொள்ளவும்`,
          'இந்த வாரம் வெளியே சாப்பிடுவதை குறைக்கவும்',
        ],
      },
      danger: {
        title: '🚨 கவனம்',
        message: `உங்கள் பட்ஜெட்டின் 90% பயன்படுத்திவிட்டீர்கள்.\nமீதம்: ₹${formatAmount(remaining)} | மீதமுள்ள நாட்கள்: ${daysLeft}\nஅதிக செலவு: ${topCategory} ₹${formatAmount(topCategoryAmount)}`,
        tips: [
          'இந்த வாரம் வெளியே சாப்பிடுவதை குறைக்கவும்',
          `தினசரி செலவு வரம்பு ₹${formatAmount(dailyLimit)} வைத்துக்கொள்ளவும்`,
          'தேவையில்லாத subscription-களை நிறுத்தவும்',
        ],
      },
      exceeded: {
        title: '❌ பட்ஜெட் மீறியது!',
        message: `உங்கள் மாத பட்ஜெட்டை கடந்துவிட்டீர்கள்.\nஅதிகம் செலவு: ₹${formatAmount(overSpent)} | மீதமுள்ள நாட்கள்: ${daysLeft}\nஅதிக செலவு செய்தது: ${topCategory}`,
        tips: [
          'இப்போ கூடுதல் செலவை நிறுத்தவும்',
          `"${topCategory}" செலவுகளை மீண்டும் பார்க்கவும்`,
          'சிறிய செலவுகளுக்கு cash பயன்படுத்தவும்',
        ],
      },
    },
    ml: {
      warning: {
        title: '⚠️ ബജറ്റ് അലർട്ട്',
        message: `നിങ്ങളുടെ മാസ ബജറ്റിന്റെ 80% ചെലവായി.\nബാക്കി: ₹${formatAmount(remaining)} | ബാക്കിയുള്ള ദിവസം: ${daysLeft}\nകൂടുതൽ ചെലവ്: ${topCategory} ₹${formatAmount(topCategoryAmount)}`,
        tips: [
          '3-5 ദിവസം അനാവശ്യ ചെലവ് കുറയ്ക്കൂ',
          `ദിവസ ചെലവ് പരിധി ₹${formatAmount(dailyLimit)} വെക്കൂ`,
          'ഈ ആഴ്ച പുറത്തുനിന്ന് ഭക്ഷണം കുറയ്ക്കൂ',
        ],
      },
      danger: {
        title: '🚨 മുന്നറിയിപ്പ്',
        message: `നിങ്ങളുടെ ബജറ്റിന്റെ 90% ഉപയോഗിച്ചു കഴിഞ്ഞു.\nബാക്കി: ₹${formatAmount(remaining)} | ബാക്കിയുള്ള ദിവസം: ${daysLeft}\nകൂടുതൽ ചെലവ്: ${topCategory} ₹${formatAmount(topCategoryAmount)}`,
        tips: [
          'ഈ ആഴ്ച പുറത്തുനിന്ന് ഭക്ഷണം കുറയ്ക്കൂ',
          `ദിവസ ചെലവ് പരിധി ₹${formatAmount(dailyLimit)} വെക്കൂ`,
          'ഉപയോഗിക്കാത്ത subscriptions റദ്ദാക്കൂ',
        ],
      },
      exceeded: {
        title: '❌ ബജറ്റ് കവിഞ്ഞു!',
        message: `നിങ്ങളുടെ മാസ ബജറ്റ് മറികടന്നു.\nകൂടുതൽ ചെലവ്: ₹${formatAmount(overSpent)} | ബാക്കിയുള്ള ദിവസം: ${daysLeft}\nകൂടുതൽ ചെലവായത്: ${topCategory}`,
        tips: [
          'ഇപ്പോൾ അനാവശ്യ ചെലവ് നിർത്തൂ',
          `"${topCategory}" ചെലവുകൾ പരിശോധിക്കൂ`,
          'ചെറിയ ചെലവുകൾക്ക് cash ഉപയോഗിക്കൂ',
        ],
      },
    },
    hi: {
      warning: {
        title: '⚠️ बजट अलर्ट',
        message: `आपका 80% बजट खर्च हो गया है।\nबाकी: ₹${formatAmount(remaining)} | बचे दिन: ${daysLeft}\nसबसे ज्यादा खर्च: ${topCategory} ₹${formatAmount(topCategoryAmount)}`,
        tips: [
          '3-5 दिन अनावश्यक खर्च रोकें',
          `रोज़ का लिमिट ₹${formatAmount(dailyLimit)} रखें`,
          'बाहर का खाना कम करें',
        ],
      },
      danger: {
        title: '🚨 चेतावनी',
        message: `आपका 90% बजट खर्च हो चुका है।\nबाकी: ₹${formatAmount(remaining)} | बचे दिन: ${daysLeft}\nसबसे ज्यादा खर्च: ${topCategory} ₹${formatAmount(topCategoryAmount)}`,
        tips: [
          'बाहर का खाना कम करें',
          `रोज़ का लिमिट ₹${formatAmount(dailyLimit)} रखें`,
          'अनावश्यक subscriptions बंद करें',
        ],
      },
      exceeded: {
        title: '❌ बजट खत्म हो गया!',
        message: `आप बजट से ऊपर चले गए।\nओवरस्पेंड: ₹${formatAmount(overSpent)} | बचे दिन: ${daysLeft}\nसबसे ज्यादा खर्च: ${topCategory}`,
        tips: [
          'अभी extra खर्च बंद करें',
          `"${topCategory}" पर कंट्रोल करें`,
          'छोटे खर्चों के लिए cash इस्तेमाल करें',
        ],
      },
    },
    te: {
      warning: {
        title: '⚠️ బడ్జెట్ అలర్ట్',
        message: `మీ నెల బడ్జెట్‌లో 80% ఖర్చయింది.\nమిగిలింది: ₹${formatAmount(remaining)} | మిగిలిన రోజులు: ${daysLeft}\nఎక్కువ ఖర్చు: ${topCategory} ₹${formatAmount(topCategoryAmount)}`,
        tips: [
          '3-5 రోజులు అవసరం లేని ఖర్చులు తగ్గించండి',
          `రోజుకు ₹${formatAmount(dailyLimit)} పరిమితి పెట్టండి`,
          'బయట తినడం తగ్గించండి',
        ],
      },
      danger: {
        title: '🚨 హెచ్చరిక',
        message: `మీ బడ్జెట్‌లో 90% పూర్తయింది.\nమిగిలింది: ₹${formatAmount(remaining)} | మిగిలిన రోజులు: ${daysLeft}\nఎక్కువ ఖర్చు: ${topCategory} ₹${formatAmount(topCategoryAmount)}`,
        tips: [
          'బయట తినడం తగ్గించండి',
          `రోజుకు ₹${formatAmount(dailyLimit)} పరిమితి పెట్టండి`,
          'అనవసర subscriptions ఆపండి',
        ],
      },
      exceeded: {
        title: '❌ బడ్జెట్ మించింది!',
        message: `మీ నెల బడ్జెట్ దాటిపోయింది.\nఅధిక ఖర్చు: ₹${formatAmount(overSpent)} | మిగిలిన రోజులు: ${daysLeft}\nఎక్కువ ఖర్చు: ${topCategory}`,
        tips: [
          'ఇప్పుడే అనవసర ఖర్చు ఆపండి',
          `"${topCategory}" పై కంట్రోల్ పెట్టండి`,
          'చిన్న ఖర్చులకు cash వాడండి',
        ],
      },
    },
  };
  
  return messages[language][level];
};

// General saving tips for AI
export const getSavingTips = (language: Language): string[] => {
  const tips: Record<Language, string[]> = {
    en: [
      'Set a daily limit of ₹200',
      'Avoid outside food for 3 days',
      'Use cash for small purchases',
      'Cancel unused subscriptions',
      'Track top 3 categories daily',
      'Plan a "No-Spend Day" weekly',
      'Wait 24 hours before big purchases',
      'Use UPI for tracking all spends',
    ],
    ta: [
      'தினசரி வரம்பு ₹200 வைக்கவும்',
      '3 நாட்கள் வெளியே சாப்பிடுவதை தவிர்க்கவும்',
      'சிறிய செலவுகளுக்கு cash பயன்படுத்தவும்',
      'பயன்படுத்தாத subscription-களை நிறுத்தவும்',
      'Top 3 category-களை தினமும் track பண்ணவும்',
      'வாரத்தில் ஒரு "No-Spend Day" follow பண்ணவும்',
      'பெரிய செலவுக்கு முன் 24 மணி நேரம் காத்திருக்கவும்',
      'எல்லா செலவுகளையும் UPI-ல் track பண்ணவும்',
    ],
    ml: [
      'ദിവസ പരിധി ₹200 വെക്കൂ',
      '3 ദിവസം പുറത്തുനിന്ന് ഭക്ഷണം ഒഴിവാക്കൂ',
      'ചെറിയ ചെലവുകള്‍ക്ക് cash ഉപയോഗിക്കൂ',
      'ഉപയോഗിക്കാത്ത subscriptions റദ്ദാക്കൂ',
      'Top 3 categories ദിവസവും track ചെയ്യൂ',
      'ആഴ്ചയില്‍ ഒരു "No-Spend Day" follow ചെയ്യൂ',
      'വലിയ ചെലവിന് മുമ്പ് 24 മണിക്കൂര്‍ കാത്തിരിക്കൂ',
      'എല്ലാ ചെലവുകളും UPI-ല്‍ track ചെയ്യൂ',
    ],
    hi: [
      'रोज़ का लिमिट ₹200 रखें',
      '3 दिन बाहर का खाना avoid करें',
      'छोटे खर्चों के लिए cash इस्तेमाल करें',
      'बेकार subscriptions बंद करें',
      'Top 3 categories रोज़ track करें',
      'हफ्ते में एक "No-Spend Day" follow करें',
      'बड़े खर्च से पहले 24 घंटे wait करें',
      'सब खर्चे UPI से track करें',
    ],
    te: [
      'రోజుకు ₹200 లిమిట్ పెట్టండి',
      '3 రోజులు బయట తినడం ఆపండి',
      'చిన్న ఖర్చులకు cash వాడండి',
      'అనవసర subscriptions ఆపండి',
      'Top 3 categories రోజూ track చేయండి',
      'వారంలో ఒక "No-Spend Day" follow చేయండి',
      'పెద్ద ఖర్చు ముందు 24 గంటలు ఆగండి',
      'అన్ని ఖర్చులు UPI లో track చేయండి',
    ],
  };
  
  return tips[language];
};
