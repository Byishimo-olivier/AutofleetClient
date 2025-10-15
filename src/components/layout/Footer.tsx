import React from 'react';
import { useSettings } from '@/contexts/SettingContxt';

const Footer: React.FC = () => {
  const { settings } = useSettings();

  return (
    <footer className={`${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border-t mt-auto`}>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className={`text-lg font-semibold ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
              AutoFleet Hub
            </h3>
            <p className={`mt-2 text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Your trusted partner for vehicle rental and fleet management solutions.
            </p>
          </div>
          
          <div>
            <h4 className={`text-sm font-semibold ${settings.darkMode ? 'text-white' : 'text-gray-900'} uppercase tracking-wider`}>
              Quick Links
            </h4>
            <ul className="mt-4 space-y-2">
              {['About', 'Services', 'Contact', 'Support'].map((item) => (
                <li key={item}>
                  <a href="#" className={`text-sm ${settings.darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition`}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={`text-sm font-semibold ${settings.darkMode ? 'text-white' : 'text-gray-900'} uppercase tracking-wider`}>
              Settings
            </h4>
            <div className="mt-4 space-y-2">
              <div className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Language: {settings.language.toUpperCase()}
              </div>
              <div className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Currency: {settings.currency}
              </div>
              <div className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Mode: {settings.darkMode ? 'Dark' : 'Light'}
              </div>
            </div>
          </div>
        </div>
        
        <div className={`mt-8 pt-8 border-t ${settings.darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <p className={`text-center text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            © {new Date().getFullYear()} AutoFleet Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

