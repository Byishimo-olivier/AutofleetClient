import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/services/apiClient';

interface Settings {
  // Notification Settings
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  bookingReminders: boolean;
  paymentAlerts: boolean;
  promotionalEmails: boolean;
  weeklyReports: boolean;

  // App Preferences
  darkMode: boolean;
  language: string;
  currency: string;
  timezone: string;
  units: string;

  // Privacy Settings
  profileVisibility: string;
  dataSharing: boolean;
  locationTracking: boolean;
  analyticsOptOut: boolean;

  // Security Settings
  twoFactorAuth: boolean;
  loginAlerts: boolean;
  sessionTimeout: number;

  // Sound Settings
  soundEnabled: boolean;
  notificationSound: string;
}

interface SettingsContextType {
  settings: Settings;
  updateSetting: (key: string, value: any) => Promise<void>;
  formatPrice: (amount: number) => string;
  t: any; // translations
}

const defaultSettings: Settings = {
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  bookingReminders: true,
  paymentAlerts: true,
  promotionalEmails: false,
  weeklyReports: true,
  darkMode: false,
  language: "en",
  currency: "USD",
  timezone: "UTC",
  units: "metric",
  profileVisibility: "private",
  dataSharing: false,
  locationTracking: true,
  analyticsOptOut: false,
  twoFactorAuth: false,
  loginAlerts: true,
  sessionTimeout: 30,
  soundEnabled: true,
  notificationSound: "default",
};

const translations = {
  en: {
    profile: "Profile",
    settings: "App Settings",
    security: "Security",
    privacy: "Privacy",
    dashboard: "Dashboard",
    vehicles: "Vehicles",
    bookings: "Bookings",
    feedback: "Feedback",
    analytics: "Analytics",
    support: "Support",
    logout: "Logout",
    // Add more translations as needed
  },
  fr: {
    profile: "Profil",
    settings: "Paramètres de l'app",
    security: "Sécurité",
    privacy: "Confidentialité",
    dashboard: "Tableau de bord",
    vehicles: "Véhicules",
    bookings: "Réservations",
    feedback: "Commentaires",
    analytics: "Analyses",
    support: "Support",
    logout: "Déconnexion",
  },
  rw: {
    profile: "Umuntu",
    settings: "Amategeko ya App",
    security: "Umutekano",
    privacy: "Ibanga",
    dashboard: "Ikibaho",
    vehicles: "Ibinyabiziga",
    bookings: "Amatungo",
    feedback: "Igitekerezo",
    analytics: "Isesengura",
    support: "Ubufasha",
    logout: "Gusohoka",
  },
  sw: {
    profile: "Wasifu",
    settings: "Mipangilio ya Programu",
    security: "Usalama",
    privacy: "Faragha",
    dashboard: "Dashibodi",
    vehicles: "Magari",
    bookings: "Uhifadhi",
    feedback: "Maoni",
    analytics: "Uchambuzi",
    support: "Msaada",
    logout: "Toka",
  }
};

const currencyConfig = {
  USD: { symbol: '$', code: 'USD', name: 'US Dollar' },
  RWF: { symbol: '₣', code: 'RWF', name: 'Rwandan Franc' },
  EUR: { symbol: '€', code: 'EUR', name: 'Euro' },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  // Get current translation
  const t = translations[settings.language as keyof typeof translations] || translations.en;

  // Format price based on selected currency
  const formatPrice = (amount: number) => {
    const config = currencyConfig[settings.currency as keyof typeof currencyConfig] || currencyConfig.USD;
    return `${config.symbol}${amount.toLocaleString()}`;
  };

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Apply settings to document when they change
  useEffect(() => {
    applySettings();
  }, [settings.darkMode, settings.language]);

  const loadSettings = async () => {
    try {
      // Try to load from API first
      const res = await apiClient.get<any>("/users/settings");
      if (res.success && res.data) {
        setSettings((prevSettings) => ({
          ...prevSettings,
          ...res.data,
        }));
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
    
    // Load from localStorage as fallback
    const savedSettings = localStorage.getItem("appSettings");
    if (savedSettings) {
      setSettings((prevSettings) => ({
        ...prevSettings,
        ...JSON.parse(savedSettings),
      }));
    }
  };

  const applySettings = () => {
    // Apply dark mode
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#1f2937';
      document.body.style.color = '#f9fafb';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f9fafb';
      document.body.style.color = '#1f2937';
    }

    // Apply language
    document.documentElement.lang = settings.language;
  };

  const updateSetting = async (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    // Save to localStorage immediately for better UX
    localStorage.setItem("appSettings", JSON.stringify(newSettings));

    // Dispatch custom events for specific settings
    if (key === 'currency') {
      window.dispatchEvent(new CustomEvent('currencyChanged', { detail: value }));
    }

    try {
      await apiClient.put("/users/settings", { [key]: value });
    } catch (error) {
      console.error("Error updating setting:", error);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, formatPrice, t }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};