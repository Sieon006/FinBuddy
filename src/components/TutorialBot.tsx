import { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { X, MessageCircle, Volume2, VolumeX, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TutorialStep {
  id: string;
  title: Record<string, string>;
  message: Record<string, string>;
  action?: string;
  highlight?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: {
      en: 'Welcome to Finance AI! 🎉',
      ta: 'Finance AI க்கு வரவேற்கிறோம்! 🎉',
      ml: 'Finance AI-ലേക്ക് സ്വാഗതം! 🎉',
      hi: 'Finance AI में आपका स्वागत है! 🎉',
      te: 'Finance AI కి స్వాగతం! 🎉',
    },
    message: {
      en: "Hi! I'm your finance buddy. Let me show you around the app!",
      ta: "வணக்கம்! நான் உங்கள் நிதி உதவியாளன். ஆப்பை சுற்றிக் காட்டுகிறேன்!",
      ml: "ഹായ്! ഞാൻ നിങ്ങളുടെ ഫിനാൻസ് ബഡ്ഡി. ആപ്പ് കാണിക്കട്ടെ!",
      hi: "नमस्ते! मैं आपका फाइनेंस बडी हूं। आइए ऐप देखें!",
      te: "హాయ్! నేను మీ ఫైనాన్స్ బడ్డీ. యాప్ చూపిస్తాను!",
    },
  },
  {
    id: 'add-expense',
    title: {
      en: 'Add Expenses 💰',
      ta: 'செலவுகளைச் சேர்க்கவும் 💰',
      ml: 'ചെലവുകൾ ചേർക്കുക 💰',
      hi: 'खर्चे जोड़ें 💰',
      te: 'ఖర్చులు జోడించండి 💰',
    },
    message: {
      en: 'Tap the Expenses tab to add your daily spending. Track every rupee!',
      ta: 'தினசரி செலவுகளைச் சேர்க்க Expenses டேப்பை தட்டவும்!',
      ml: 'ദൈനംദിന ചെലവുകൾ ചേർക്കാൻ Expenses ടാബ് ടാപ്പ് ചെയ്യൂ!',
      hi: 'दैनिक खर्च जोड़ने के लिए Expenses टैब टैप करें!',
      te: 'రోజువారీ ఖర్చులు జోడించడానికి Expenses ట్యాబ్ ట్యాప్ చేయండి!',
    },
    action: 'expenses',
  },
  {
    id: 'saving-goals',
    title: {
      en: 'Set Saving Goals 🎯',
      ta: 'சேமிப்பு இலக்குகளை அமைக்கவும் 🎯',
      ml: 'സേവിംഗ് ലക്ഷ്യങ്ങൾ സജ്ജമാക്കുക 🎯',
      hi: 'बचत लक्ष्य सेट करें 🎯',
      te: 'సేవింగ్ లక్ష్యాలు సెట్ చేయండి 🎯',
    },
    message: {
      en: 'Dream of a new phone or trip? Set a saving goal and track your progress!',
      ta: 'புதிய போன் அல்லது பயணம் கனவு? சேமிப்பு இலக்கை அமைத்து முன்னேற்றத்தை கண்காணியுங்கள்!',
      ml: 'പുതിയ ഫോൺ അല്ലെങ്കിൽ യാത്ര സ്വപ്നം കാണുന്നുണ്ടോ? സേവിംഗ് ലക്ഷ്യം സെറ്റ് ചെയ്യൂ!',
      hi: 'नए फोन या यात्रा का सपना? बचत लक्ष्य सेट करें और प्रगति ट्रैक करें!',
      te: 'కొత్త ఫోన్ లేదా ట్రిప్ కల? సేవింగ్ లక్ష్యం సెట్ చేసి ట్రాక్ చేయండి!',
    },
    action: 'savings',
  },
  {
    id: 'emi-tracker',
    title: {
      en: 'EMI Manager 📊',
      ta: 'EMI மேலாளர் 📊',
      ml: 'EMI മാനേജർ 📊',
      hi: 'EMI मैनेजर 📊',
      te: 'EMI మేనేజర్ 📊',
    },
    message: {
      en: 'Have loans? Track all your EMIs and never miss a payment!',
      ta: 'கடன்கள் உள்ளதா? EMI-களை கண்காணித்து எந்த பேமெண்டையும் தவறவிடாதீர்கள்!',
      ml: 'ലോണുകൾ ഉണ്ടോ? എല്ലാ EMI-കളും ട്രാക്ക് ചെയ്ത് പേയ്മെന്റ് മിസ് ചെയ്യാതിരിക്കൂ!',
      hi: 'लोन हैं? सभी EMI ट्रैक करें और कोई पेमेंट मिस न करें!',
      te: 'లోన్లు ఉన్నాయా? అన్ని EMIలను ట్రాక్ చేసి పేమెంట్ మిస్ కాకుండా చూసుకోండి!',
    },
    action: 'emi',
  },
  {
    id: 'ai-assistant',
    title: {
      en: 'AI Assistant 🤖',
      ta: 'AI உதவியாளர் 🤖',
      ml: 'AI സഹായി 🤖',
      hi: 'AI सहायक 🤖',
      te: 'AI సహాయకుడు 🤖',
    },
    message: {
      en: 'Ask me anything about your finances! I can analyze spending, suggest savings, and more.',
      ta: 'உங்கள் நிதி பற்றி என்னிடம் எதையும் கேளுங்கள்! செலவு பகுப்பாய்வு, சேமிப்பு ஆலோசனை தருவேன்.',
      ml: 'നിങ്ങളുടെ ഫിനാൻസിനെക്കുറിച്ച് എന്തും ചോദിക്കൂ! ചെലവ് വിശകലനം, സേവിംഗ് നിർദ്ദേശങ്ങൾ തരാം.',
      hi: 'अपने फाइनेंस के बारे में कुछ भी पूछें! खर्च विश्लेषण, बचत सुझाव दूंगा।',
      te: 'మీ ఫైనాన్స్ గురించి ఏమైనా అడగండి! ఖర్చు విశ్లేషణ, సేవింగ్ సూచనలు ఇస్తాను.',
    },
    action: 'ai',
  },
  {
    id: 'settings',
    title: {
      en: 'Personalize Settings ⚙️',
      ta: 'அமைப்புகளை தனிப்பயனாக்கு ⚙️',
      ml: 'സെറ്റിംഗ്സ് ക്രമീകരിക്കുക ⚙️',
      hi: 'सेटिंग्स कस्टमाइज़ करें ⚙️',
      te: 'సెట్టింగ్స్ కస్టమైజ్ చేయండి ⚙️',
    },
    message: {
      en: 'Change language, set budget, add custom categories - make the app yours!',
      ta: 'மொழி மாற்றம், பட்ஜெட் அமைப்பு, தனிப்பயன் வகைகள் - ஆப்பை உங்களுக்கானதாக்குங்கள்!',
      ml: 'ഭാഷ മാറ്റുക, ബജറ്റ് സെറ്റ് ചെയ്യുക, ഇഷ്ടാനുസൃത വിഭാഗങ്ങൾ - ആപ്പ് നിങ്ങളുടേതാക്കൂ!',
      hi: 'भाषा बदलें, बजट सेट करें, कस्टम श्रेणियां - ऐप को अपना बनाएं!',
      te: 'భాష మార్చండి, బడ్జెట్ సెట్ చేయండి, కస్టమ్ వర్గాలు - యాప్ మీదిగా చేసుకోండి!',
    },
  },
  {
    id: 'done',
    title: {
      en: "You're All Set! 🚀",
      ta: 'நீங்கள் தயார்! 🚀',
      ml: 'നിങ്ങൾ റെഡി! 🚀',
      hi: 'आप तैयार हैं! 🚀',
      te: 'మీరు రెడీ! 🚀',
    },
    message: {
      en: "Start tracking your expenses and saving smarter. I'm always here to help! Tap my icon anytime.",
      ta: 'செலவுகளை கண்காணிக்கத் தொடங்குங்கள். நான் எப்போதும் உதவ இருக்கிறேன்!',
      ml: 'ചെലവുകൾ ട്രാക്ക് ചെയ്യാൻ തുടങ്ങൂ. ഞാൻ എപ്പോഴും സഹായിക്കാൻ ഇവിടെയുണ്ട്!',
      hi: 'खर्चे ट्रैक करना शुरू करें। मैं हमेशा मदद के लिए यहां हूं!',
      te: 'ఖర్చులు ట్రాక్ చేయడం మొదలుపెట్టండి. నేను ఎప్పుడూ సహాయం చేయడానికి ఉన్నాను!',
    },
  },
];

interface TutorialBotProps {
  onNavigate?: (tab: string) => void;
}

interface BtnPosition {
  x: number | null;
  y: number | null;
}

const STORAGE_KEY = 'ai_btn_pos';

const TutorialBot = ({ onNavigate }: TutorialBotProps) => {
  const { profile, updateProfile } = useAuthContext();
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Draggable button state
  const btnRef = useRef<HTMLButtonElement>(null);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const [btnPos, setBtnPos] = useState<BtnPosition>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { x: null, y: null };
  });

  // Persist position to localStorage
  useEffect(() => {
    if (btnPos.x !== null && btnPos.y !== null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(btnPos));
    }
  }, [btnPos]);

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

  const startDrag = (clientX: number, clientY: number) => {
    const el = btnRef.current;
    if (!el) return;

    draggingRef.current = true;
    movedRef.current = false;

    const rect = el.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const offsetY = clientY - rect.top;

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!draggingRef.current) return;

      const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const y = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const maxX = window.innerWidth - rect.width - 8;
      const maxY = window.innerHeight - rect.height - 8;

      const newX = clamp(x - offsetX, 8, maxX);
      const newY = clamp(y - offsetY, 8, maxY);

      movedRef.current = true;
      setBtnPos({ x: newX, y: newY });
    };

    const onUp = () => {
      draggingRef.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
      window.removeEventListener('touchcancel', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    window.addEventListener('touchcancel', onUp);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    startDrag(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleBtnClick = () => {
    if (movedRef.current) return;
    setIsOpen(true);
  };

  // Get button style based on position
  const getButtonStyle = (): React.CSSProperties => {
    if (btnPos.x === null || btnPos.y === null) {
      return {
        position: 'fixed',
        right: 'max(16px, env(safe-area-inset-right))',
        bottom: 'calc(90px + env(safe-area-inset-bottom, 0px))',
        zIndex: 9999,
      };
    }
    return {
      position: 'fixed',
      left: `${btnPos.x}px`,
      top: `${btnPos.y}px`,
      zIndex: 9999,
    };
  };

  useEffect(() => {
    // Show tutorial for first-time users
    if (profile && !profile.has_completed_tutorial) {
      setTimeout(() => {
        setShowTutorial(true);
        setIsOpen(true);
      }, 1000);
    }
  }, [profile]);

  const currentStepData = TUTORIAL_STEPS[currentStep];

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      const langCodes: Record<string, string> = {
        en: 'en-IN',
        ta: 'ta-IN',
        ml: 'ml-IN',
        hi: 'hi-IN',
        te: 'te-IN',
      };
      
      utterance.lang = langCodes[language] || 'en-IN';
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleNext = () => {
    stopSpeaking();
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      completeTutorial();
    }
  };

  const handleAction = () => {
    if (currentStepData.action && onNavigate) {
      onNavigate(currentStepData.action);
    }
    handleNext();
  };

  const completeTutorial = async () => {
    setShowTutorial(false);
    setIsOpen(false);
    setCurrentStep(0);
    if (profile && !profile.has_completed_tutorial) {
      await updateProfile({ has_completed_tutorial: true });
    }
  };

  const handleClose = () => {
    stopSpeaking();
    setIsOpen(false);
    if (showTutorial) {
      completeTutorial();
    }
  };

  return (
    <>
      {/* Draggable Floating Bot Button */}
      <button
        ref={btnRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleBtnClick}
        className={cn(
          'w-14 h-14 rounded-full bg-primary text-primary-foreground',
          'flex items-center justify-center transition-transform duration-150 ease-out',
          'hover:scale-105 active:scale-95',
          'shadow-lg shadow-primary/30',
          'cursor-grab select-none touch-none',
          isOpen && 'scale-0 opacity-0 pointer-events-none'
        )}
        style={getButtonStyle()}
        aria-label="AI Assistant"
        title="AI Assistant - Drag to reposition"
      >
        <span className="text-2xl">🤖</span>
      </button>

      {/* Bot Panel - fixed position with safe area support */}
      {isOpen && (
        <div 
          className="fixed w-80 max-h-96 animate-scale-in"
          style={{
            right: 'max(16px, env(safe-area-inset-right))',
            bottom: 'calc(90px + env(safe-area-inset-bottom, 0px))',
            zIndex: 9999,
          }}
        >
          <div className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
            {/* Header */}
            <div className="bg-primary p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <span className="text-xl">🤖</span>
                </div>
                <div>
                  <h3 className="font-semibold text-primary-foreground text-sm">Finance Buddy</h3>
                  <p className="text-xs text-primary-foreground/70">Your AI Guide</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1 rounded-full hover:bg-primary-foreground/20 transition-colors"
              >
                <X className="h-5 w-5 text-primary-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {showTutorial ? (
                <>
                  <div className="mb-4">
                    <h4 className="font-semibold text-foreground mb-2">
                      {currentStepData.title[language] || currentStepData.title.en}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {currentStepData.message[language] || currentStepData.message.en}
                    </p>
                  </div>

                  {/* Progress Dots */}
                  <div className="flex justify-center gap-1 mb-4">
                    {TUTORIAL_STEPS.map((_, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          'w-2 h-2 rounded-full transition-all',
                          idx === currentStep ? 'bg-primary w-6' : 'bg-muted'
                        )}
                      />
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => speak(currentStepData.message[language] || currentStepData.message.en)}
                      className="flex-shrink-0"
                    >
                      {isSpeaking ? (
                        <VolumeX className="h-4 w-4" onClick={(e) => { e.stopPropagation(); stopSpeaking(); }} />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                    
                    {currentStepData.action ? (
                      <Button onClick={handleAction} className="flex-1 gap-2">
                        Go to {currentStepData.action}
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button onClick={handleNext} className="flex-1 gap-2">
                        {currentStep === TUTORIAL_STEPS.length - 1 ? "Let's Go!" : 'Next'}
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    {language === 'en' && "Need help? I'm here for you!"}
                    {language === 'ta' && 'உதவி வேண்டுமா? நான் இங்கே இருக்கிறேன்!'}
                    {language === 'ml' && 'സഹായം വേണോ? ഞാൻ ഇവിടെയുണ്ട്!'}
                    {language === 'hi' && 'मदद चाहिए? मैं यहां हूं!'}
                    {language === 'te' && 'సహాయం కావాలా? నేను ఇక్కడ ఉన్నాను!'}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button size="sm" variant="outline" onClick={() => onNavigate?.('expenses')}>
                      Add Expense
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onNavigate?.('savings')}>
                      Saving Goals
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onNavigate?.('ai')}>
                      AI Assistant
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default TutorialBot;
