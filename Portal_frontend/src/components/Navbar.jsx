import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { Sun, Moon, Languages } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, language, toggleLanguage, highContrast, toggleContrast } = useAccessibility();

  const handleLogout = () => { logout(); navigate('/login'); };

  // High Contrast Styles
  const navClass = highContrast ? "bg-black border-b border-yellow-400 text-yellow-400" : "bg-white border-b border-slate-200 text-slate-900";
  const btnClass = highContrast ? "bg-yellow-400 text-black border border-yellow-400 font-bold" : "bg-primary text-white";

  return (
    <nav className={`px-6 py-4 sticky top-0 z-50 ${navClass}`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">ScribePortal</Link>

        <div className="flex items-center gap-4">
          <button onClick={toggleLanguage} className="flex items-center gap-1 font-bold uppercase border px-2 py-1 rounded">
            <Languages size={18} /> {language === 'en' ? 'HI' : 'EN'}
          </button>
          <button onClick={toggleContrast} className="p-1 border rounded">
             {highContrast ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user ? (
            <div className="flex gap-4 items-center">
              <span className="hidden md:inline">{t.nav.welcome} {user.first_name}</span>
              <button onClick={handleLogout} className="font-bold hover:underline">{t.nav.logout}</button>
            </div>
          ) : (
             <div className="flex gap-3">
               <Link to="/login" className="py-2 hover:underline">{t.nav.login}</Link>
               <Link to="/register-select" className={`px-4 py-2 rounded-lg ${btnClass}`}>
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