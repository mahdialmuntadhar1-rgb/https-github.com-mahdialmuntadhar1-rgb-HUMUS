import React, { createContext, useState, useContext, useEffect, useCallback } from "react";

// Minimal translations for BELIVE - can be expanded as needed
type Language = "en" | "ar" | "ku";
type Direction = "ltr" | "rtl";

interface TranslationContextType {
  lang: Language;
  dir: Direction;
  t: (key: string) => string;
  setLang: (lang: Language) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("belive-lang") as Language;
    if (savedLang && ["en", "ar", "ku"].includes(savedLang)) {
      setLangState(savedLang);
    }
  }, []);

  const dir = lang === "ar" || lang === "ku" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("belive-lang", newLang);
  };

  const t = useCallback(
    (key: string): string => {
      // For now, just return the key as translation
      // In production, implement full translation lookup
      return key;
    },
    [lang]
  );

  return React.createElement(TranslationContext.Provider, { value: { lang, dir, t, setLang } }, children);
};

export const useTranslations = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslations must be used within a TranslationProvider");
  }
  return context;
};
