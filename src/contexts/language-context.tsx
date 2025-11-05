import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'hi' | 'zh' | 'ja' | 'ar';

export interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
}

export const languages: LanguageOption[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Translations
const translations: Record<Language, Record<string, string>> = {
  en: {
    'login.title': 'Sign In',
    'login.subtitle': 'Welcome back to your account',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.remember': 'Remember me',
    'login.button': 'Sign In',
    'login.signing': 'Signing in...',
    'login.noAccount': "Don't have an account?",
    'login.signUp': 'Sign up',
    'login.emailPlaceholder': 'Enter your email',
    'login.passwordPlaceholder': 'Enter your password',
    'login.emailRequired': 'Email address is required',
    'login.emailInvalid': 'Please enter a valid email address',
    'login.passwordRequired': 'Password is required',
    'login.passwordMinLength': 'Password must be at least 6 characters',
    'login.success': 'Login successful!',
    'login.failed': 'Login failed. Please check your credentials.',
    'marketing.title': 'Fast, Efficient and Productive',
    'marketing.description':
      'Where AI meets recruitment — shaping the future of talent acquisition.',
    'marketing.subtitle':
      'Empowering organizations to hire smarter, faster, and with precision.',
    'marketing.tagline': 'Because every great hire begins with great insight.',
  },
  es: {
    'login.title': 'Iniciar Sesión',
    'login.subtitle': 'Bienvenido de nuevo a tu cuenta',
    'login.email': 'Correo electrónico',
    'login.password': 'Contraseña',
    'login.remember': 'Recordarme',
    'login.button': 'Iniciar Sesión',
    'login.signing': 'Iniciando sesión...',
    'login.noAccount': '¿No tienes una cuenta?',
    'login.signUp': 'Regístrate',
    'login.emailPlaceholder': 'Ingresa tu correo electrónico',
    'login.passwordPlaceholder': 'Ingresa tu contraseña',
    'login.emailRequired': 'El correo electrónico es requerido',
    'login.emailInvalid': 'Por favor ingresa un correo electrónico válido',
    'login.passwordRequired': 'La contraseña es requerida',
    'login.passwordMinLength': 'La contraseña debe tener al menos 6 caracteres',
    'login.success': '¡Inicio de sesión exitoso!',
    'login.failed':
      'Error al iniciar sesión. Por favor verifica tus credenciales.',
    'marketing.title': 'Rápido, Eficiente y Productivo',
    'marketing.description':
      'Donde la IA se encuentra con la contratación: moldeando el futuro de la adquisición de talento.',
    'marketing.subtitle':
      'Empoderando a las organizaciones para contratar de manera más inteligente, rápida y precisa.',
    'marketing.tagline':
      'Porque cada gran contratación comienza con una gran visión.',
  },
  fr: {
    'login.title': 'Se Connecter',
    'login.subtitle': 'Bon retour sur votre compte',
    'login.email': 'E-mail',
    'login.password': 'Mot de passe',
    'login.remember': 'Se souvenir de moi',
    'login.button': 'Se Connecter',
    'login.signing': 'Connexion en cours...',
    'login.noAccount': "Vous n'avez pas de compte?",
    'login.signUp': "S'inscrire",
    'login.emailPlaceholder': 'Entrez votre e-mail',
    'login.passwordPlaceholder': 'Entrez votre mot de passe',
    'login.emailRequired': "L'adresse e-mail est requise",
    'login.emailInvalid': 'Veuillez entrer une adresse e-mail valide',
    'login.passwordRequired': 'Le mot de passe est requis',
    'login.passwordMinLength':
      'Le mot de passe doit contenir au moins 6 caractères',
    'login.success': 'Connexion réussie!',
    'login.failed':
      'Échec de la connexion. Veuillez vérifier vos identifiants.',
    'marketing.title': 'Rapide, Efficace et Productif',
    'marketing.description':
      "Où l'IA rencontre le recrutement — façonnant l'avenir de l'acquisition de talents.",
    'marketing.subtitle':
      "Permettre aux organisations d'embaucher plus intelligemment, plus rapidement et avec précision.",
    'marketing.tagline':
      'Parce que chaque grand recrutement commence par une grande perspicacité.',
  },
  de: {
    'login.title': 'Anmelden',
    'login.subtitle': 'Willkommen zurück in Ihrem Konto',
    'login.email': 'E-Mail',
    'login.password': 'Passwort',
    'login.remember': 'Angemeldet bleiben',
    'login.button': 'Anmelden',
    'login.signing': 'Anmeldung läuft...',
    'login.noAccount': 'Haben Sie kein Konto?',
    'login.signUp': 'Registrieren',
    'login.emailPlaceholder': 'Geben Sie Ihre E-Mail ein',
    'login.passwordPlaceholder': 'Geben Sie Ihr Passwort ein',
    'login.emailRequired': 'E-Mail-Adresse ist erforderlich',
    'login.emailInvalid': 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
    'login.passwordRequired': 'Passwort ist erforderlich',
    'login.passwordMinLength':
      'Das Passwort muss mindestens 6 Zeichen lang sein',
    'login.success': 'Anmeldung erfolgreich!',
    'login.failed':
      'Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.',
    'marketing.title': 'Schnell, Effizient und Produktiv',
    'marketing.description':
      'Wo KI auf Rekrutierung trifft — die Zukunft der Talentakquise gestalten.',
    'marketing.subtitle':
      'Organisationen befähigen, intelligenter, schneller und präziser einzustellen.',
    'marketing.tagline':
      'Denn jede große Einstellung beginnt mit großartiger Einsicht.',
  },
  hi: {
    'login.title': 'साइन इन करें',
    'login.subtitle': 'अपने खाते में वापस स्वागत है',
    'login.email': 'ईमेल',
    'login.password': 'पासवर्ड',
    'login.remember': 'मुझे याद रखें',
    'login.button': 'साइन इन करें',
    'login.signing': 'साइन इन हो रहा है...',
    'login.noAccount': 'खाता नहीं है?',
    'login.signUp': 'साइन अप करें',
    'login.emailPlaceholder': 'अपना ईमेल दर्ज करें',
    'login.passwordPlaceholder': 'अपना पासवर्ड दर्ज करें',
    'login.emailRequired': 'ईमेल पता आवश्यक है',
    'login.emailInvalid': 'कृपया एक वैध ईमेल पता दर्ज करें',
    'login.passwordRequired': 'पासवर्ड आवश्यक है',
    'login.passwordMinLength': 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए',
    'login.success': 'लॉगिन सफल!',
    'login.failed': 'लॉगिन विफल। कृपया अपनी साख जांचें।',
    'marketing.title': 'तेज, कुशल और उत्पादक',
    'marketing.description':
      'जहां AI भर्ती से मिलता है — प्रतिभा अधिग्रहण के भविष्य को आकार देना।',
    'marketing.subtitle':
      'संगठनों को स्मार्ट, तेज और सटीक रूप से भर्ती करने के लिए सशक्त बनाना।',
    'marketing.tagline':
      'क्योंकि हर बड़ी भर्ती एक महान अंतर्दृष्टि से शुरू होती है।',
  },
  zh: {
    'login.title': '登录',
    'login.subtitle': '欢迎回到您的账户',
    'login.email': '电子邮件',
    'login.password': '密码',
    'login.remember': '记住我',
    'login.button': '登录',
    'login.signing': '正在登录...',
    'login.noAccount': '没有账户?',
    'login.signUp': '注册',
    'login.emailPlaceholder': '输入您的电子邮件',
    'login.passwordPlaceholder': '输入您的密码',
    'login.emailRequired': '电子邮件地址是必需的',
    'login.emailInvalid': '请输入有效的电子邮件地址',
    'login.passwordRequired': '密码是必需的',
    'login.passwordMinLength': '密码必须至少6个字符',
    'login.success': '登录成功！',
    'login.failed': '登录失败。请检查您的凭据。',
    'marketing.title': '快速、高效和富有成效',
    'marketing.description': 'AI与招聘相遇——塑造人才招聘的未来。',
    'marketing.subtitle': '赋能组织更智能、更快速、更精准地招聘。',
    'marketing.tagline': '因为每一次伟大的招聘都始于伟大的洞察。',
  },
  ja: {
    'login.title': 'ログイン',
    'login.subtitle': 'アカウントへようこそ',
    'login.email': 'メール',
    'login.password': 'パスワード',
    'login.remember': 'ログイン状態を保持',
    'login.button': 'ログイン',
    'login.signing': 'ログイン中...',
    'login.noAccount': 'アカウントをお持ちでないですか?',
    'login.signUp': 'サインアップ',
    'login.emailPlaceholder': 'メールアドレスを入力',
    'login.passwordPlaceholder': 'パスワードを入力',
    'login.emailRequired': 'メールアドレスが必要です',
    'login.emailInvalid': '有効なメールアドレスを入力してください',
    'login.passwordRequired': 'パスワードが必要です',
    'login.passwordMinLength':
      'パスワードは少なくとも6文字である必要があります',
    'login.success': 'ログイン成功！',
    'login.failed': 'ログインに失敗しました。資格情報を確認してください。',
    'marketing.title': '高速、効率的、生産的',
    'marketing.description': 'AIが採用と出会う場所 — 人材獲得の未来を形作る。',
    'marketing.subtitle':
      '組織がより賢く、より速く、より正確に採用できるようにする。',
    'marketing.tagline': 'すべての偉大な採用は、偉大な洞察から始まるから。',
  },
  ar: {
    'login.title': 'تسجيل الدخول',
    'login.subtitle': 'مرحباً بعودتك إلى حسابك',
    'login.email': 'البريد الإلكتروني',
    'login.password': 'كلمة المرور',
    'login.remember': 'تذكرني',
    'login.button': 'تسجيل الدخول',
    'login.signing': 'جارٍ تسجيل الدخول...',
    'login.noAccount': 'ليس لديك حساب؟',
    'login.signUp': 'التسجيل',
    'login.emailPlaceholder': 'أدخل بريدك الإلكتروني',
    'login.passwordPlaceholder': 'أدخل كلمة المرور',
    'login.emailRequired': 'البريد الإلكتروني مطلوب',
    'login.emailInvalid': 'يرجى إدخال عنوان بريد إلكتروني صحيح',
    'login.passwordRequired': 'كلمة المرور مطلوبة',
    'login.passwordMinLength': 'يجب أن تكون كلمة المرور 6 أحرف على الأقل',
    'login.success': 'تم تسجيل الدخول بنجاح!',
    'login.failed': 'فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد.',
    'marketing.title': 'سريع وفعال ومنتج',
    'marketing.description':
      'حيث يلتقي الذكاء الاصطناعي بالتوظيف — تشكيل مستقبل اكتساب المواهب.',
    'marketing.subtitle': 'تمكين المنظمات من التوظيف بذكاء وسرعة ودقة أكبر.',
    'marketing.tagline': 'لأن كل توظيف عظيم يبدأ ببصيرة عظيمة.',
  },
};
