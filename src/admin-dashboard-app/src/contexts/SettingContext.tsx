import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Settings {
  darkMode: boolean;
  language: string;
  currency: string;
}

interface SettingContextType {
  settings: Settings;
  toggleDarkMode: () => void;
  setLanguage: (lang: string) => void;
  setCurrency: (currency: string) => void;
}

const SettingContext = createContext<SettingContextType | undefined>(undefined);

export const SettingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>({
    darkMode: false,
    language: 'en',
    currency: 'USD',
  });

  const toggleDarkMode = () => {
    setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const setLanguage = (lang: string) => {
    setSettings(prev => ({ ...prev, language: lang }));
  };

  const setCurrency = (currency: string) => {
    setSettings(prev => ({ ...prev, currency }));
  };

  return (
    <SettingContext.Provider value={{ settings, toggleDarkMode, setLanguage, setCurrency }}>
      {children}
    </SettingContext.Provider>
  );
};

export const useSettings = (): SettingContextType => {
  const context = useContext(SettingContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingProvider');
  }
  return context;
};