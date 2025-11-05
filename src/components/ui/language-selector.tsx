import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useLanguage, languages, Language } from '@/contexts/language-context';
import { cn } from '@/lib/utils';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage =
    languages.find((lang) => lang.code === language) || languages[0];

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
      >
        <span className="text-xl leading-none">{currentLanguage.flag}</span>
        <span className="text-sm leading-none">{currentLanguage.name}</span>
        <ChevronDown
          className={cn(
            'w-4 h-4 transition-transform leading-none flex-shrink-0',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 min-w-[150px]">
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageChange(lang.code)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors text-left',
                  language === lang.code && 'bg-blue-50',
                )}
              >
                <span className="text-xl leading-none flex-shrink-0">
                  {lang.flag}
                </span>
                <span className="flex-1 leading-none">{lang.name}</span>
                {language === lang.code && (
                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
