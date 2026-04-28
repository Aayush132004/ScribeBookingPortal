import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('lang') || 'en'); 
  const [highContrast, setHighContrast] = useState(localStorage.getItem('contrast') === 'true');

  useEffect(() => {
    localStorage.setItem('lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('contrast', highContrast);
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast]);

  const toggleLanguage = () => setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  const toggleContrast = () => setHighContrast(prev => !prev);
  
  const t = translations[language] || translations['en'];

  return (
    <AccessibilityContext.Provider value={{ language, toggleLanguage, highContrast, toggleContrast, t }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => useContext(AccessibilityContext);