import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { Sun, Moon, Languages, BookOpen, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, language, toggleLanguage, highContrast, toggleContrast } = useAccessibility();

  const handleLogout = () => { 
    logout(); 
    navigate('/login'); 
  };

  const getHomeLink = () => {
    if (!user) return '/';
    if (user.role === 'STUDENT') return '/student/dashboard';
    if (user.role === 'SCRIBE') return '/scribe/dashboard';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    return '/';
  };

  // High Contrast Styles
  const navClass = highContrast 
    ? "bg-black border-b-2 border-yellow-400 text-yellow-400" 
    : "bg-white border-b border-slate-200 text-slate-900 shadow-sm";
    
  const btnClass = highContrast 
    ? "bg-yellow-400 text-black border-2 border-black font-black focus:ring-yellow-500" 
    : "bg-primary text-white hover:bg-primary-dark focus:ring-primary";

  // Fixed Accessibility Controls Group Background
  const controlsBg = highContrast ? "bg-yellow-900/40" : "bg-slate-100";

  return (
    <nav 
      className={`px-4 md:px-6 py-3 sticky top-0 z-50 transition-colors duration-300 ${navClass}`}
      aria-label="Main Navigation"
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* --- 1. Smart Logo Redirect --- */}
        <Link 
          to={getHomeLink()} 
          className="flex items-center gap-2 group focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
          aria-label="ScribePortal Home"
        >
          <div className={`p-2 rounded-xl transition-colors ${highContrast ? 'bg-yellow-400 text-black' : 'bg-primary/10 text-primary group-hover:bg-primary/20'}`}>
            <BookOpen size={24} aria-hidden="true" />
          </div>
          <span className={`text-lg md:text-xl font-bold tracking-tight ${highContrast ? 'text-yellow-400' : 'text-slate-900'}`}>
            ScribePool
          </span>
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Accessibility Controls Group */}
          <div 
            className={`flex items-center gap-1 p-1 rounded-lg ${controlsBg}`}
            role="group" 
            aria-label="Site Accessibility Settings"
          >
            <button 
                onClick={toggleLanguage} 
                className={`flex items-center gap-1 font-bold text-[10px] md:text-xs uppercase px-2 py-1 rounded transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 ${highContrast ? 'bg-black text-yellow-400 hover:bg-yellow-400 hover:text-black' : 'bg-white hover:bg-slate-50'}`}
                title="Switch Language"
                aria-label={language === 'en' ? "Switch to Hindi" : "Switch to English"}
            >
                <Languages size={14} aria-hidden="true" /> 
                <span>{language === 'en' ? 'HI' : 'EN'}</span>
            </button>
            <button 
                onClick={toggleContrast} 
                className={`p-1 rounded transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 ${highContrast ? 'bg-yellow-400 text-black' : 'bg-white hover:bg-slate-50'}`}
                title="Toggle High Contrast"
                aria-pressed={highContrast}
                aria-label={highContrast ? "Disable High Contrast Mode" : "Enable High Contrast Mode"}
            >
                {highContrast ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
            </button>
          </div>

          {/* User Section */}
          {user ? (
            <div className="flex items-center gap-2 md:gap-4 pl-2 md:pl-4 border-l border-slate-200">
              <div className="hidden sm:flex flex-col items-end">
                <span className="font-bold text-xs md:text-sm leading-tight">
                  {t.nav.welcome} {user.first_name}
                </span>
                <span 
                  className={`text-[9px] md:text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${highContrast ? 'bg-yellow-400 text-black' : 'bg-slate-200 text-slate-600'}`}
                >
                  {user.role}
                </span>
              </div>
              
              <button 
                onClick={handleLogout} 
                className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 ${highContrast ? 'hover:bg-yellow-900 text-yellow-400' : 'text-slate-500 hover:bg-slate-100 hover:text-red-600'}`}
                title={t.nav.logout}
                aria-label="Log Out"
              >
                <LogOut size={20} aria-hidden="true" />
              </button>
            </div>
          ) : (
             <div className="flex gap-2">
               <Link 
                 to="/login" 
                 className={`px-3 md:px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 ${highContrast ? 'text-yellow-400 hover:underline' : 'text-slate-600 hover:bg-slate-50'}`}
               >
                 {t.nav.login}
               </Link>
               <Link 
                 to="/register-select" 
                 className={`px-3 md:px-4 py-2 text-xs md:text-sm rounded-lg shadow-md transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 ${btnClass}`}
               >
                 {language === 'en' ? 'Register' : 'रजिस्टर'}
               </Link>
             </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;