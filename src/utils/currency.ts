// Format number to Indian currency format (₹1,00,000)
export const formatINR = (amount: number): string => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(amount);
};

// Format number to Indian number format without currency symbol
export const formatIndianNumber = (amount: number): string => {
  const formatter = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(amount);
};

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Get today's date in YYYY-MM-DD format
export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Format date for display
export const formatDate = (dateString: string, language: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayLabels: Record<string, string> = { en: 'Today', ta: 'இன்று', ml: 'ഇന്ന്', hi: 'आज', te: 'ఈరోజు' };
  const yesterdayLabels: Record<string, string> = { en: 'Yesterday', ta: 'நேற்று', ml: 'ഇന്നലെ', hi: 'कल', te: 'నిన్న' };
  const locales: Record<string, string> = { en: 'en-IN', ta: 'ta-IN', ml: 'ml-IN', hi: 'hi-IN', te: 'te-IN' };

  if (dateString === today.toISOString().split('T')[0]) {
    return todayLabels[language] || 'Today';
  }
  if (dateString === yesterday.toISOString().split('T')[0]) {
    return yesterdayLabels[language] || 'Yesterday';
  }

  return date.toLocaleDateString(locales[language] || 'en-IN', {
    day: 'numeric',
    month: 'short',
  });
};

// Get current month and year
export const getCurrentMonthYear = (): { month: number; year: number } => {
  const now = new Date();
  return { month: now.getMonth(), year: now.getFullYear() };
};

// Check if date is in current month
export const isCurrentMonth = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
};
