import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ta' | 'ml' | 'hi' | 'te';

interface Translations {
  [key: string]: {
    en: string;
    ta: string;
    ml: string;
    hi: string;
    te: string;
  };
}

// Language display names for settings
export const LANGUAGE_OPTIONS: { code: Language; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
];

// Speech recognition language codes
export const SPEECH_LANG_CODES: Record<Language, string> = {
  en: 'en-IN',
  ta: 'ta-IN',
  ml: 'ml-IN',
  hi: 'hi-IN',
  te: 'te-IN',
};

const translations: Translations = {
  // Navigation
  home: { en: 'Home', ta: 'முகப்பு', ml: 'ഹോം', hi: 'होम', te: 'హోమ్' },
  expenses: { en: 'Expenses', ta: 'செலவுகள்', ml: 'ചെലവുകൾ', hi: 'खर्चे', te: 'ఖర్చులు' },
  emi: { en: 'EMI', ta: 'EMI', ml: 'EMI', hi: 'EMI', te: 'EMI' },
  aiAssistant: { en: 'AI Assistant', ta: 'AI உதவி', ml: 'AI സഹായി', hi: 'AI सहायक', te: 'AI సహాయకుడు' },
  settings: { en: 'Settings', ta: 'அமைப்புகள்', ml: 'ക്രമീകരണം', hi: 'सेटिंग्स', te: 'సెట్టింగ్స్' },
  
  // Home Dashboard
  todaySpending: { en: "Today's Spending", ta: 'இன்றைய செலவு', ml: 'ഇന്നത്തെ ചെലവ്', hi: 'आज का खर्च', te: 'నేటి ఖర్చు' },
  monthlySpending: { en: 'Monthly Spending', ta: 'மாதாந்திர செலவு', ml: 'മാസ ചെലവ്', hi: 'मासिक खर्च', te: 'నెలవారీ ఖర్చు' },
  monthlyBudget: { en: 'Monthly Budget', ta: 'மாதாந்திர பட்ஜெட்', ml: 'മാസ ബജറ്റ്', hi: 'मासिक बजट', te: 'నెలవారీ బడ్జెట్' },
  remainingBudget: { en: 'Remaining Budget', ta: 'மீதமுள்ள பட்ஜெட்', ml: 'ബാക്കി ബജറ്റ്', hi: 'शेष बजट', te: 'మిగిలిన బడ్జెట్' },
  activeEmis: { en: 'Active EMIs', ta: 'செயலில் உள்ள EMI', ml: 'സജീവ EMI', hi: 'सक्रिय EMI', te: 'యాక్టివ్ EMI' },
  savingGoalProgress: { en: 'Saving Goal', ta: 'சேமிப்பு இலக்கு', ml: 'സേവിംഗ് ലക്ഷ്യം', hi: 'बचत लक्ष्य', te: 'సేవింగ్ లక్ష్యం' },
  noSavingGoal: { en: 'No saving goal set', ta: 'சேமிப்பு இலக்கு இல்லை', ml: 'സേവിംഗ് ലക്ഷ്യം സജ്ജമാക്കിയിട്ടില്ല', hi: 'कोई बचत लक्ष्य नहीं', te: 'సేవింగ్ లక్ష్యం లేదు' },
  
  // Expenses
  addExpense: { en: 'Add Expense', ta: 'செலவு சேர்', ml: 'ചെലവ് ചേർക്കുക', hi: 'खर्च जोड़ें', te: 'ఖర్చు జోడించు' },
  recentExpenses: { en: 'Recent Expenses', ta: 'சமீபத்திய செலவுகள்', ml: 'സമീപകാല ചെലവുകൾ', hi: 'हालिया खर्चे', te: 'ఇటీవలి ఖర్చులు' },
  noExpenses: { en: 'No expenses yet', ta: 'இன்னும் செலவுகள் இல்லை', ml: 'ഇതുവരെ ചെലവുകളില്ല', hi: 'अभी तक कोई खर्च नहीं', te: 'ఇంకా ఖర్చులు లేవు' },
  amount: { en: 'Amount', ta: 'தொகை', ml: 'തുക', hi: 'राशि', te: 'మొత్తం' },
  category: { en: 'Category', ta: 'வகை', ml: 'വിഭാഗം', hi: 'श्रेणी', te: 'వర్గం' },
  date: { en: 'Date', ta: 'தேதி', ml: 'തീയതി', hi: 'तारीख', te: 'తేదీ' },
  notes: { en: 'Notes (Optional)', ta: 'குறிப்புகள் (விருப்பம்)', ml: 'കുറിപ്പുകൾ (ഓപ്ഷണൽ)', hi: 'नोट्स (वैकल्पिक)', te: 'నోట్స్ (ఐచ్ఛికం)' },
  save: { en: 'Save', ta: 'சேமி', ml: 'സേവ് ചെയ്യുക', hi: 'सहेजें', te: 'సేవ్' },
  cancel: { en: 'Cancel', ta: 'ரத்து', ml: 'റദ്ദാക്കുക', hi: 'रद्द करें', te: 'రద్దు' },
  selectCategory: { en: 'Select Category', ta: 'வகையைத் தேர்ந்தெடுக்கவும்', ml: 'വിഭാഗം തിരഞ്ഞെടുക്കുക', hi: 'श्रेणी चुनें', te: 'వర్గం ఎంచుకోండి' },
  daily: { en: 'Daily', ta: 'தினசரி', ml: 'ദിവസേന', hi: 'दैनिक', te: 'రోజువారీ' },
  monthly: { en: 'Monthly', ta: 'மாதாந்திர', ml: 'പ്രതിമാസം', hi: 'मासिक', te: 'నెలవారీ' },
  
  // EMI
  emiTracker: { en: 'EMI Manager', ta: 'EMI மேலாளர்', ml: 'EMI മാനേജർ', hi: 'EMI मैनेजर', te: 'EMI మేనేజర్' },
  addEmi: { en: 'Add EMI', ta: 'EMI சேர்', ml: 'EMI ചേർക്കുക', hi: 'EMI जोड़ें', te: 'EMI జోడించు' },
  emiName: { en: 'EMI Name', ta: 'EMI பெயர்', ml: 'EMI പേര്', hi: 'EMI नाम', te: 'EMI పేరు' },
  loanAmount: { en: 'Loan Amount', ta: 'கடன் தொகை', ml: 'ലോൺ തുക', hi: 'ऋण राशि', te: 'లోన్ మొత్తం' },
  interestRate: { en: 'Interest Rate (%)', ta: 'வட்டி விகிதம் (%)', ml: 'പലിശ നിരക്ക് (%)', hi: 'ब्याज दर (%)', te: 'వడ్డీ రేటు (%)' },
  tenure: { en: 'Tenure (Months)', ta: 'காலம் (மாதங்கள்)', ml: 'കാലാവധി (മാസങ്ങൾ)', hi: 'अवधि (महीने)', te: 'కాలం (నెలలు)' },
  monthlyEMI: { en: 'Monthly EMI', ta: 'மாதாந்திர EMI', ml: 'പ്രതിമാസ EMI', hi: 'मासिक EMI', te: 'నెలవారీ EMI' },
  dueDate: { en: 'Due Date (Day)', ta: 'காலக்கெடு (நாள்)', ml: 'അവസാന തീയതി (ദിവസം)', hi: 'देय तिथि (दिन)', te: 'గడువు తేదీ (రోజు)' },
  totalMonths: { en: 'Total Months', ta: 'மொத்த மாதங்கள்', ml: 'ആകെ മാസങ്ങൾ', hi: 'कुल महीने', te: 'మొత్తం నెలలు' },
  paidMonths: { en: 'Paid Months', ta: 'செலுத்திய மாதங்கள்', ml: 'അടച്ച മാസങ്ങൾ', hi: 'भुगतान किए गए महीने', te: 'చెల్లించిన నెలలు' },
  remaining: { en: 'Remaining', ta: 'மீதம்', ml: 'ബാക്കി', hi: 'शेष', te: 'మిగిలిన' },
  totalEmi: { en: 'Total Monthly EMI', ta: 'மொத்த மாதாந்திர EMI', ml: 'ആകെ പ്രതിമാസ EMI', hi: 'कुल मासिक EMI', te: 'మొత్తం నెలవారీ EMI' },
  noEmi: { en: 'No EMIs added yet', ta: 'இன்னும் EMI சேர்க்கப்படவில்லை', ml: 'ഇതുവരെ EMI ചേർത്തിട്ടില്ല', hi: 'अभी तक कोई EMI नहीं जोड़ा', te: 'ఇంకా EMI జోడించలేదు' },
  upcomingEmis: { en: 'Upcoming EMIs', ta: 'வரவிருக்கும் EMI', ml: 'വരാനിരിക്കുന്ന EMI', hi: 'आगामी EMI', te: 'రాబోయే EMI' },
  overdueEmis: { en: 'Overdue EMIs', ta: 'காலாவதியான EMI', ml: 'കാലാവധി കഴിഞ്ഞ EMI', hi: 'बकाया EMI', te: 'గడువు తీరిన EMI' },
  
  // EMI Calculator
  emiCalculator: { en: 'EMI Calculator', ta: 'EMI கணிப்பான்', ml: 'EMI കാൽക്കുലേറ്റർ', hi: 'EMI कैलकुलेटर', te: 'EMI కాలిక్యులేటర్' },
  calculate: { en: 'Calculate', ta: 'கணக்கிடு', ml: 'കണക്കാക്കുക', hi: 'गणना करें', te: 'లెక్కించు' },
  totalInterest: { en: 'Total Interest', ta: 'மொத்த வட்டி', ml: 'ആകെ പലിശ', hi: 'कुल ब्याज', te: 'మొత్తం వడ్డీ' },
  totalPayable: { en: 'Total Payable', ta: 'மொத்த செலுத்த வேண்டிய தொகை', ml: 'ആകെ അടയ്‌ക്കേണ്ട തുക', hi: 'कुल देय राशि', te: 'మొత్తం చెల్లించవలసిన మొత్తం' },
  saveAsEmi: { en: 'Save as EMI', ta: 'EMI ஆக சேமி', ml: 'EMI ആയി സേവ് ചെയ്യുക', hi: 'EMI के रूप में सहेजें', te: 'EMI గా సేవ్ చేయి' },
  
  // AI Assistant
  askAI: { en: 'Ask AI Assistant', ta: 'AI உதவியிடம் கேளுங்கள்', ml: 'AI സഹായിയോട് ചോദിക്കൂ', hi: 'AI सहायक से पूछें', te: 'AI సహాయకుడిని అడగండి' },
  typeMessage: { en: 'Type your message...', ta: 'உங்கள் செய்தியை தட்டச்சு செய்யவும்...', ml: 'നിങ്ങളുടെ സന്ദേശം ടൈപ്പ് ചെയ്യൂ...', hi: 'अपना संदेश टाइप करें...', te: 'మీ సందేశాన్ని టైప్ చేయండి...' },
  aiWelcome: { 
    en: 'Hi! I\'m your AI finance assistant. Ask me about your expenses, EMIs, savings, or government schemes!', 
    ta: 'வணக்கம்! நான் உங்கள் AI நிதி உதவியாளர். செலவுகள், EMI, சேமிப்பு அல்லது அரசு திட்டங்கள் பற்றி கேளுங்கள்!', 
    ml: 'ഹായ്! ഞാൻ നിങ്ങളുടെ AI ഫിനാൻസ് സഹായിയാണ്. ചെലവുകൾ, EMI, സേവിംഗ്സ് അല്ലെങ്കിൽ സർക്കാർ പദ്ധതികൾ എന്നിവയെക്കുറിച്ച് ചോദിക്കൂ!',
    hi: 'नमस्ते! मैं आपका AI वित्त सहायक हूं। खर्चे, EMI, बचत या सरकारी योजनाओं के बारे में पूछें!',
    te: 'హాయ్! నేను మీ AI ఫైనాన్స్ అసిస్టెంట్. ఖర్చులు, EMI, సేవింగ్స్ లేదా ప్రభుత్వ పథకాల గురించి అడగండి!'
  },
  voiceInput: { en: 'Voice Input', ta: 'குரல் உள்ளீடு', ml: 'വോയ്സ് ഇൻപുട്ട്', hi: 'आवाज इनपुट', te: 'వాయిస్ ఇన్‌పుట్' },
  listening: { en: 'Listening...', ta: 'கேட்கிறேன்...', ml: 'കേൾക്കുന്നു...', hi: 'सुन रहा हूं...', te: 'వింటున్నాను...' },
  listen: { en: 'Listen', ta: 'கேள்', ml: 'കേൾക്കുക', hi: 'सुनें', te: 'వినండి' },
  stop: { en: 'Stop', ta: 'நிறுத்து', ml: 'നിർത്തുക', hi: 'रोकें', te: 'ఆపు' },

  // Saving Goals
  savingGoals: { en: 'Saving Goals', ta: 'சேமிப்பு இலக்குகள்', ml: 'സേവിംഗ് ലക്ഷ്യങ്ങൾ', hi: 'बचत लक्ष्य', te: 'సేవింగ్ లక్ష్యాలు' },
  addGoal: { en: 'Add Goal', ta: 'இலக்கு சேர்', ml: 'ലക്ഷ്യം ചേർക്കുക', hi: 'लक्ष्य जोड़ें', te: 'లక్ష్యం జోడించు' },
  goalName: { en: 'Goal Name', ta: 'இலக்கு பெயர்', ml: 'ലക്ഷ്യത്തിന്റെ പേര്', hi: 'लक्ष्य का नाम', te: 'లక్ష్యం పేరు' },
  targetAmount: { en: 'Target Amount', ta: 'இலக்கு தொகை', ml: 'ലക്ഷ്യ തുക', hi: 'लक्ष्य राशि', te: 'లక్ష్య మొత్తం' },
  currentAmount: { en: 'Current Amount', ta: 'தற்போதைய தொகை', ml: 'നിലവിലെ തുക', hi: 'वर्तमान राशि', te: 'ప్రస్తుత మొత్తం' },
  targetDate: { en: 'Target Date', ta: 'இலக்கு தேதி', ml: 'ലക്ഷ്യ തീയതി', hi: 'लक्ष्य तिथि', te: 'లక్ష్య తేదీ' },
  addMoney: { en: 'Add Money', ta: 'பணம் சேர்', ml: 'പണം ചേർക്കുക', hi: 'पैसे जोड़ें', te: 'డబ్బు జోడించు' },
  noGoals: { en: 'No saving goals yet', ta: 'இன்னும் சேமிப்பு இலக்குகள் இல்லை', ml: 'ഇതുവരെ സേവിംഗ് ലക്ഷ്യങ്ങളില്ല', hi: 'अभी तक कोई बचत लक्ष्य नहीं', te: 'ఇంకా సేవింగ్ లక్ష్యాలు లేవు' },
  
  // Settings
  language: { en: 'Language', ta: 'மொழி', ml: 'ഭാഷ', hi: 'भाषा', te: 'భాష' },
  monthlyIncome: { en: 'Monthly Income', ta: 'மாதாந்திர வருமானம்', ml: 'മാസ വരുമാനം', hi: 'मासिक आय', te: 'నెలవారీ ఆదాయం' },
  customCategories: { en: 'Custom Categories', ta: 'தனிப்பயன் வகைகள்', ml: 'ഇഷ്‌ടാനുസൃത വിഭാഗങ്ങൾ', hi: 'कस्टम श्रेणियां', te: 'కస్టమ్ వర్గాలు' },
  addCategory: { en: 'Add Category', ta: 'வகை சேர்', ml: 'വിഭാഗം ചേർക്കുക', hi: 'श्रेणी जोड़ें', te: 'వర్గం జోడించు' },
  categoryName: { en: 'Category Name', ta: 'வகை பெயர்', ml: 'വിഭാഗത്തിന്റെ പേര്', hi: 'श्रेणी का नाम', te: 'వర్గం పేరు' },
  categoryNameTamil: { en: 'Tamil Name', ta: 'தமிழ் பெயர்', ml: 'തമിഴ് പേര്', hi: 'तमिल नाम', te: 'తమిళ పేరు' },
  emoji: { en: 'Emoji', ta: 'எமோஜி', ml: 'ഇമോജി', hi: 'इमोजी', te: 'ఎమోజీ' },
  delete: { en: 'Delete', ta: 'நீக்கு', ml: 'ഇല്ലാതാക്കുക', hi: 'हटाएं', te: 'తొలగించు' },
  edit: { en: 'Edit', ta: 'திருத்து', ml: 'എഡിറ്റ് ചെയ്യുക', hi: 'संपादित करें', te: 'సవరించు' },
  
  // Common
  today: { en: 'Today', ta: 'இன்று', ml: 'ഇന്ന്', hi: 'आज', te: 'ఈరోజు' },
  yesterday: { en: 'Yesterday', ta: 'நேற்று', ml: 'ഇന്നലെ', hi: 'कल', te: 'నిన్న' },
  months: { en: 'months', ta: 'மாதங்கள்', ml: 'മാസങ്ങൾ', hi: 'महीने', te: 'నెలలు' },
  of: { en: 'of', ta: '/', ml: '/', hi: 'का', te: '/' },
  
  // App
  appName: { en: 'Finance AI', ta: 'நிதி AI', ml: 'ഫിനാൻസ് AI', hi: 'फाइनेंस AI', te: 'ఫైనాన్స్ AI' },
  financialOverview: { en: 'Financial Overview', ta: 'நிதி கண்ணோட்டம்', ml: 'സാമ്പത്തിക അവലോകനം', hi: 'वित्तीय अवलोकन', te: 'ఆర్థిక అవలోకనం' },
  transactionHistory: { en: 'Transaction History', ta: 'பரிவர்த்தனை வரலாறு', ml: 'ഇടപാട് ചരിത്രം', hi: 'लेन-देन इतिहास', te: 'లావాదేవీల చరిత్ర' },
  history: { en: 'History', ta: 'வரலாறு', ml: 'ചരിത്രം', hi: 'इतिहास', te: 'చరిత్ర' },
  upiPaymentHistory: { en: 'UPI Payment History', ta: 'UPI பரிவர்த்தனை வரலாறு', ml: 'UPI പേയ്മെന്റ് ചരിത്രം', hi: 'UPI भुगतान इतिहास', te: 'UPI చెల్లింపు చరిత్ర' },
  noUpiPayments: { en: 'No UPI payments yet', ta: 'இன்னும் UPI பரிவர்த்தனைகள் இல்லை', ml: 'ഇതുവരെ UPI പേയ്മെന്റുകളില്ല', hi: 'अभी तक कोई UPI भुगतान नहीं', te: 'ఇంకా UPI చెల్లింపులు లేవు' },
  success: { en: 'Success', ta: 'வெற்றி', ml: 'വിജയം', hi: 'सफल', te: 'విజయవంతం' },
  failed: { en: 'Failed', ta: 'தோல்வி', ml: 'പരാജയം', hi: 'विफल', te: 'విఫలమైంది' },
  pending: { en: 'Pending', ta: 'நிலுவையில்', ml: 'തീർപ്പാക്കാത്ത', hi: 'लंबित', te: 'పెండింగ్' },
  all: { en: 'All', ta: 'அனைத்தும்', ml: 'എല്ലാം', hi: 'सभी', te: 'అన్నీ' },
  searchByUtrOrNote: { en: 'Search by UTR or note...', ta: 'UTR அல்லது குறிப்பு மூலம் தேடு...', ml: 'UTR അല്ലെങ്കിൽ കുറിപ്പ് വഴി തിരയുക...', hi: 'UTR या नोट से खोजें...', te: 'UTR లేదా నోట్ ద్వారా శోధించండి...' },
  thisWeek: { en: 'This Week', ta: 'இந்த வாரம்', ml: 'ഈ ആഴ്ച', hi: 'इस सप्ताह', te: 'ఈ వారం' },
  thisMonth: { en: 'This Month', ta: 'இந்த மாதம்', ml: 'ഈ മാസം', hi: 'इस महीने', te: 'ఈ నెల' },
  older: { en: 'Older', ta: 'பழையவை', ml: 'പഴയത്', hi: 'पुराना', te: 'పాతవి' },
  
  // Reports
  reports: { en: 'Reports', ta: 'அறிக்கைகள்', ml: 'റിപ്പോർട്ടുകൾ', hi: 'रिपोर्ट्स', te: 'రిపోర్టులు' },
  weeklyReport: { en: 'Weekly Report', ta: 'வார அறிக்கை', ml: 'വാരാന്ത്യ റിപ്പോർട്ട്', hi: 'साप्ताहिक रिपोर्ट', te: 'వారపు రిపోర్ట్' },
  monthlyReport: { en: 'Monthly Report', ta: 'மாத அறிக்கை', ml: 'മാസ റിപ്പോർട്ട്', hi: 'मासिक रिपोर्ट', te: 'నెలవారీ రిపోర్ట్' },
  signOut: { en: 'Sign Out', ta: 'வெளியேறு', ml: 'സൈൻ ഔട്ട്', hi: 'साइन आउट', te: 'సైన్ అవుట్' },
  
  // Undo/Redo
  undo: { en: 'Undo', ta: 'செயல்தவிர்', ml: 'പഴയപടിയാക്കുക', hi: 'पूर्ववत करें', te: 'రద్దు చేయి' },
  redo: { en: 'Redo', ta: 'மீண்டும் செய்', ml: 'വീണ്ടും ചെയ്യുക', hi: 'फिर से करें', te: 'మళ్ళీ చేయి' },
  
  // Language change prompt
  changeLanguagePrompt: { 
    en: 'Go to Settings → Language → Choose your language.', 
    ta: 'அமைப்புகள் → மொழி → உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்.', 
    ml: 'ക്രമീകരണം → ഭാഷ → നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക.',
    hi: 'सेटिंग्स → भाषा → अपनी भाषा चुनें।',
    te: 'సెట్టింగ్స్ → భాష → మీ భాషను ఎంచుకోండి.'
  },
  didNotUnderstand: { 
    en: "I didn't understand. Please repeat in one line.", 
    ta: 'புரியவில்லை. ஒரு வரியில் மீண்டும் சொல்லுங்கள்.', 
    ml: 'മനസ്സിലായില്ല. ഒരു വരിയിൽ ആവർത്തിക്കുക.',
    hi: 'मुझे समझ नहीं आया। कृपया एक पंक्ति में दोहराएं।',
    te: 'నాకు అర్థం కాలేదు. ఒక వరుసలో మళ్ళీ చెప్పండి.'
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('expense-tracker-language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('expense-tracker-language', language);
  }, [language]);

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
