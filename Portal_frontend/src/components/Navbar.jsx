import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { 
  BookOpen, 
  ChevronDown, 
  LogOut, 
  Menu, 
  X, 
  User, 
  Globe, 
  Contrast, 
  LayoutDashboard,
  ArrowLeft,
  Home,
  UserCircle,
  Users,
  Bell
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language, toggleLanguage, highContrast, toggleContrast } = useAccessibility();

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const profileDropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'STUDENT') return '/student/dashboard';
    if (user.role === 'SCRIBE') return '/scribe/dashboard';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    return '/';
  };

  const handleGoBack = (e) => {
    e.preventDefault();
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(getDashboardLink()); 
    }
  };

  const navBaseClass = scrolled 
    ? "bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm" 
    : "bg-transparent";
    
  const hcNavClass = "bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 shadow-2xl";
  
  const textClass = highContrast ? "text-slate-100" : "text-gray-700";
  const iconColor = highContrast ? "text-indigo-400" : "text-primary-600";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${highContrast ? hcNavClass : navBaseClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          
          {/* Left: Brand & Back */}
          <div className="flex items-center gap-4">
            {location.pathname !== '/' && location.pathname !== getDashboardLink() && (
              <button 
                onClick={handleGoBack}
                className={`p-2 rounded-xl transition-all ${highContrast ? 'hover:bg-yellow-400/10' : 'hover:bg-gray-100'} group`}
                aria-label="Go Back"
              >
                <ArrowLeft size={22} className={textClass} />
              </button>
            )}

            <Link to={getDashboardLink()} className="flex items-center space-x-3 group outline-none">
              <div className={`p-2 rounded-xl transition-all ${highContrast ? 'bg-yellow-400 text-black' : 'bg-primary-600 text-white shadow-lg shadow-primary-200 group-hover:scale-105 group-hover:rotate-3'}`}>
                <BookOpen size={24} />
              </div>
              <span className={`text-xl font-black tracking-tight hidden sm:block ${textClass}`}>ScribePool</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-2">

            {user && (
              <Link 
                to={getDashboardLink()} 
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${location.pathname.includes('dashboard') ? (highContrast ? 'bg-yellow-400 text-black' : 'bg-primary-50 text-primary-600') : (highContrast ? 'text-yellow-400' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50')}`}
              >
                {t.nav.dashboard}
              </Link>
            )}

            <div className="w-px h-6 bg-gray-200 mx-2"></div>

            {/* Language & Theme */}
            <div className="flex items-center gap-3">
              <div className={`flex items-center p-1 rounded-xl transition-all ${highContrast ? 'bg-slate-900 border border-slate-800' : 'bg-gray-100/80'}`}>
                <button 
                  onClick={() => language !== 'en' && toggleLanguage()}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${language === 'en' ? (highContrast ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-primary-600 shadow-sm') : 'text-gray-400 hover:text-gray-600'}`}
                >
                  EN
                </button>
                <button 
                  onClick={() => language !== 'hi' && toggleLanguage()}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${language === 'hi' ? (highContrast ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-primary-600 shadow-sm') : 'text-gray-400 hover:text-gray-600'}`}
                >
                  हिन्दी
                </button>
              </div>
              <button 
                onClick={toggleContrast}
                className={`p-2 rounded-xl transition-all ${highContrast ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-400 hover:text-primary-600 hover:bg-gray-100'}`}
                title={t.accessibility.toggleContrast}
              >
                <Contrast size={18} />
              </button>
            </div>

            {user ? (
              <div className="relative ml-4 flex items-center gap-4" ref={profileDropdownRef}>
                {/* Notification bell removed */}
                
                <button 
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className={`flex items-center gap-3 p-1.5 pr-3 rounded-2xl transition-all ${highContrast ? 'border border-yellow-400' : 'bg-white border border-gray-200 hover:shadow-md'}`}
                >
                  <div className={`h-8 w-8 rounded-xl font-black flex items-center justify-center ${highContrast ? 'bg-yellow-400 text-black' : 'bg-primary-600 text-white'}`}>
                    {user.first_name?.[0].toUpperCase()}
                  </div>
                  <div className="text-left leading-none hidden lg:block">
                    <p className={`text-sm font-black ${textClass}`}>{user.first_name}</p>
                    <p className="text-[9px] uppercase tracking-widest text-gray-400">{user.role}</p>
                  </div>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''} ${textClass}`} />
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 glass-card rounded-3xl py-2 overflow-hidden border border-gray-200 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="px-5 py-4 border-b border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t.nav.account}</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                    </div>
                    
                    <Link to="/profile" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-3 px-5 py-3.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                      <UserCircle size={18} className="text-primary-600" />
                      {t.profile.viewProfile}
                    </Link>

                    {user.role === 'ADMIN' && (
                      <Link to="/admin/users" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-3 px-5 py-3.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                        <Users size={18} className="text-primary-600" />
                        {t.nav.manageUsers}
                      </Link>
                    )}

                    <div className="p-2">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <div className="p-1.5 rounded-lg bg-red-100">
                          <LogOut size={16} />
                        </div>
                        {t.nav.logout}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 ml-4">
                <Link to="/login" className={`text-sm font-bold px-4 py-2 rounded-xl transition-all ${highContrast ? 'text-yellow-400 border border-yellow-400' : 'text-gray-600 hover:text-primary-600'}`}>
                  {t.nav.signIn}
                </Link>
                <Link 
                  to="/register-select" 
                  className={`px-6 py-2.5 rounded-2xl text-sm font-black transition-all ${highContrast ? 'bg-yellow-400 text-black' : 'bg-primary-600 text-white shadow-lg shadow-primary-200 hover:shadow-primary-300 hover:-translate-y-0.5'}`}
                >
                  {t.nav.register}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-xl ${highContrast ? 'text-yellow-400' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className={`md:hidden glass-card mx-4 rounded-3xl mt-2 overflow-hidden shadow-2xl animate-in slide-in-from-top-4 duration-300 ${highContrast ? 'bg-black border-2 border-yellow-400' : ''}`}>
          <div className="px-4 pt-2 pb-6 space-y-2">
            
            {user && (
              <Link to={getDashboardLink()} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 p-4 rounded-2xl font-bold ${textClass} hover:bg-gray-50`}>
                <LayoutDashboard size={20} /> {t.nav.dashboard}
              </Link>
            )}

            <div className="h-px bg-gray-100 mx-4"></div>

            <div className="grid grid-cols-2 gap-2 p-2">
              <button onClick={toggleLanguage} className={`flex items-center justify-center gap-2 p-3 rounded-2xl border ${highContrast ? 'border-slate-800 text-slate-100' : 'border-gray-200 text-gray-600'}`}>
                <Globe size={16} /> {language === 'en' ? 'हिन्दी' : 'English'}
              </button>
              <button onClick={toggleContrast} className={`flex items-center justify-center gap-2 p-3 rounded-2xl border ${highContrast ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600'}`}>
                <Contrast size={16} /> {t.nav.mode}
              </button>
            </div>

            {user ? (
              <div className="p-2 space-y-2">
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 p-4 rounded-2xl font-bold ${textClass} hover:bg-gray-50`}>
                  <UserCircle size={20} /> {t.nav.profile}
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-red-600 hover:bg-red-50"
                >
                  <LogOut size={20} /> {t.nav.logout}
                </button>
              </div>
            ) : (
              <div className="p-2 grid grid-cols-2 gap-4">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center justify-center p-4 rounded-2xl font-bold border ${highContrast ? 'border-yellow-400 text-yellow-400' : 'border-gray-200 text-gray-600'}`}>
                  {t.nav.signIn}
                </Link>
                <Link to="/register-select" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center justify-center p-4 rounded-2xl font-bold ${highContrast ? 'bg-yellow-400 text-black' : 'bg-primary-600 text-white'}`}>
                  {t.nav.join}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Spacer for Fixed Nav */}
      <div className="h-0 md:h-0"></div>
    </nav>
  );
};

export default Navbar;