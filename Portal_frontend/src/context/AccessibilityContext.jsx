import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const [language, setLanguage] = useState('en'); 
  const [highContrast, setHighContrast] = useState(false);

  const toggleLanguage = () => setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  const toggleContrast = () => setHighContrast(prev => !prev);
  
  const t = translations[language];

  return (
    <AccessibilityContext.Provider value={{ language, toggleLanguage, highContrast, toggleContrast, t }}>
      <div className={highContrast ? "high-contrast-mode" : ""}>
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => useContext(AccessibilityContext);