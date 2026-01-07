import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/services/apiClient';

interface Settings {
  adminUserId: string;
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

  // UI Settings
  showNavBar: boolean;
  showChatBot: boolean;
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
  showNavBar: true,
  showChatBot: true,
};

const translations = {
  en: {
    // Navigation
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
    
    // Auth
    login: "Login",
    register: "Register",
    signIn: "Sign In",
    signUp: "Sign Up",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    firstName: "First Name",
    lastName: "Last Name",
    phone: "Phone Number",
    
    // Common
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    search: "Search",
    filter: "Filter",
    sort: "Sort",
    loading: "Loading...",
    success: "Success",
    error: "Error",
    
    // App Specific
    autofleetHub: "AutoFleet Hub",
    customer: "Customer",
    owner: "Vehicle Owner",
    admin: "Administrator",
    myBookings: "My Bookings",
    addVehicle: "Add Vehicle",
    rentVehicle: "Rent Vehicle",
    
    // Settings
    notifications: "Notifications",
    appearance: "Appearance",
    language: "Language",
    currency: "Currency",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
  },
  
  fr: {
    // Navigation
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
    
    // Auth
    login: "Connexion",
    register: "S'inscrire",
    signIn: "Se connecter",
    signUp: "S'inscrire",
    email: "Email",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    firstName: "Prénom",
    lastName: "Nom",
    phone: "Numéro de téléphone",
    
    // Common
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    add: "Ajouter",
    search: "Rechercher",
    filter: "Filtrer",
    sort: "Trier",
    loading: "Chargement...",
    success: "Succès",
    error: "Erreur",
    
    // App Specific
    autofleetHub: "AutoFleet Hub",
    customer: "Client",
    owner: "Propriétaire de véhicule",
    admin: "Administrateur",
    myBookings: "Mes réservations",
    addVehicle: "Ajouter un véhicule",
    rentVehicle: "Louer un véhicule",
    
    // Settings
    notifications: "Notifications",
    appearance: "Apparence",
    language: "Langue",
    currency: "Devise",
    darkMode: "Mode sombre",
    lightMode: "Mode clair",
  },
  
  rw: {
    // Navigation
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
    
    // Auth
    login: "Kwinjira",
    register: "Kwiyandikisha",
    signIn: "Kwinjira",
    signUp: "Kwiyandikisha",
    email: "Imeyili",
    password: "Ijambo ry'ibanga",
    confirmPassword: "Emeza ijambo ry'ibanga",
    firstName: "Izina ry'ibanza",
    lastName: "Izina ry'umuryango",
    phone: "Nimero ya telefoni",
    
    // Common
    save: "Kubika",
    cancel: "Kureka",
    delete: "Gusiba",
    edit: "Guhindura",
    add: "Kongeramo",
    search: "Gushakisha",
    filter: "Gutandukanya",
    sort: "Gutondekanya",
    loading: "Birategerwa...",
    success: "Byagenze neza",
    error: "Ikosa",
    
    // App Specific
    autofleetHub: "AutoFleet Hub",
    customer: "Umukiriya",
    owner: "Nyir'ikinyabiziga",
    admin: "Umuyobozi",
    myBookings: "Amatungo yanjye",
    addVehicle: "Kongeramo ikinyabiziga",
    rentVehicle: "Gukodesha ikinyabiziga",
    
    // Settings
    notifications: "Amakuru",
    appearance: "Isura",
    language: "Ururimi",
    currency: "Ifaranga",
    darkMode: "Ubwiza bw'ijoro",
    lightMode: "Ubwiza bw'umunsi",
  },
  
  sw: {
    // Navigation
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
    
    // Auth
    login: "Ingia",
    register: "Jisajili",
    signIn: "Ingia",
    signUp: "Jisajili",
    email: "Barua pepe",
    password: "Nenosiri",
    confirmPassword: "Thibitisha nenosiri",
    firstName: "Jina la kwanza",
    lastName: "Jina la mwisho",
    phone: "Nambari ya simu",
    
    // Common
    save: "Hifadhi",
    cancel: "Ghairi",
    delete: "Futa",
    edit: "Hariri",
    add: "Ongeza",
    search: "Tafuta",
    filter: "Chuja",
    sort: "Panga",
    loading: "Inapakia...",
    success: "Mafanikio",
    error: "Hitilafu",
    
    // App Specific
    autofleetHub: "AutoFleet Hub",
    customer: "Mteja",
    owner: "Mmiliki wa gari",
    admin: "Msimamizi",
    myBookings: "Mahifadhi yangu",
    addVehicle: "Ongeza gari",
    rentVehicle: "Kodi gari",
    
    // Settings
    notifications: "Arifa",
    appearance: "Mwonekano",
    language: "Lugha",
    currency: "Sarafu",
    darkMode: "Hali ya giza",
    lightMode: "Hali ya mwanga",
  }
};

const currencyConfig = {
  USD: { symbol: '$', code: 'USD', name: 'US Dollar' },
  RWF: { symbol: '₣', code: 'RWF', name: 'Rwandan Franc' },
  EUR: { symbol: '€', code: 'EUR', name: 'Euro' },
  KES: { symbol: 'KSh', code: 'KES', name: 'Kenyan Shilling' },
  TZS: { symbol: 'TSh', code: 'TZS', name: 'Tanzanian Shilling' },
  UGX: { symbol: 'USh', code: 'UGX', name: 'Ugandan Shilling' },
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
      // Load from localStorage first for immediate application
      const savedSettings = localStorage.getItem("appSettings");
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings((prevSettings) => ({
          ...prevSettings,
          ...parsedSettings,
        }));
      }

      // Try to load from API and sync
      const res = await apiClient.get<any>("/users/settings");
      if (res.success && res.data) {
        const apiSettings = {
          ...defaultSettings,
          ...res.data,
        };
        setSettings(apiSettings);
        localStorage.setItem("appSettings", JSON.stringify(apiSettings));
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const applySettings = () => {
    // Apply dark mode to entire app
    const root = document.documentElement;
    const body = document.body;
    
    if (settings.darkMode) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
      body.classList.add('dark');
      
      // Apply dark mode CSS variables
      root.style.setProperty('--bg-primary', '#0f172a');
      root.style.setProperty('--bg-secondary', '#1e293b');
      root.style.setProperty('--bg-tertiary', '#334155');
      root.style.setProperty('--text-primary', '#f8fafc');
      root.style.setProperty('--text-secondary', '#cbd5e1');
      root.style.setProperty('--text-muted', '#64748b');
      root.style.setProperty('--border-color', '#475569');
      
      // Set meta theme color for mobile browsers
      let themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (!themeColorMeta) {
        themeColorMeta = document.createElement('meta');
        themeColorMeta.setAttribute('name', 'theme-color');
        document.head.appendChild(themeColorMeta);
      }
      themeColorMeta.setAttribute('content', '#0f172a');
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
      body.classList.remove('dark');
      
      // Apply light mode CSS variables
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f8fafc');
      root.style.setProperty('--bg-tertiary', '#e2e8f0');
      root.style.setProperty('--text-primary', '#0f172a');
      root.style.setProperty('--text-secondary', '#334155');
      root.style.setProperty('--text-muted', '#64748b');
      root.style.setProperty('--border-color', '#e2e8f0');
      
      // Set meta theme color for mobile browsers
      let themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (!themeColorMeta) {
        themeColorMeta = document.createElement('meta');
        themeColorMeta.setAttribute('name', 'theme-color');
        document.head.appendChild(themeColorMeta);
      }
      themeColorMeta.setAttribute('content', '#ffffff');
    }

    // Apply language
    root.setAttribute('lang', settings.language);
    
    // Set document direction (for RTL languages if needed)
    const rtlLanguages = ['ar', 'he', 'fa'];
    if (rtlLanguages.includes(settings.language)) {
      root.setAttribute('dir', 'rtl');
    } else {
      root.setAttribute('dir', 'ltr');
    }

    // Dispatch custom events for components to react to changes
    window.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { darkMode: settings.darkMode } 
    }));
    
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language: settings.language, translations: t } 
    }));
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
    
    if (key === 'darkMode') {
      window.dispatchEvent(new CustomEvent('themeChanged', { 
        detail: { darkMode: value } 
      }));
    }
    
    if (key === 'language') {
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: value, translations: translations[value as keyof typeof translations] || translations.en } 
      }));
    }

    try {
      await apiClient.put("/users/settings", { [key]: value });
      console.log(`✅ Setting ${key} updated successfully`);
    } catch (error) {
      console.error("Error updating setting:", error);
      // Optionally revert the setting if API call fails
      // setSettings(settings);
      // localStorage.setItem("appSettings", JSON.stringify(settings));
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

// Hook for theme-aware components
export const useTheme = () => {
  const { settings } = useSettings();
  return {
    isDark: settings.darkMode,
    theme: settings.darkMode ? 'dark' : 'light',
  };
};

// Hook for translations
export const useTranslation = () => {
  const { t, settings } = useSettings();
  return {
    t,
    language: settings.language,
  };
};