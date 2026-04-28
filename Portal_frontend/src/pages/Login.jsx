import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, AlertCircle, Loader2, Eye, EyeOff, ShieldCheck, ArrowRight, BookOpen } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const { t, highContrast } = useAccessibility();
  const navigate = useNavigate();

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;
    const hasLetters = /[a-zA-Z]/.test(identifier);
    const hasAt = identifier.includes('@');

    if (hasAt || hasLetters) {
      if (!emailRegex.test(identifier)) { setError(t.validation.invalidEmail); return false; }
    } else {
      if (!phoneRegex.test(identifier)) { setError(t.validation.invalidPhone); return false; }
    }
    if (!password) { setError(t.validation.passRequired); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { identifier, password });
      login(response.data.user);
      const role = response.data.user.role;
      if (role === 'ADMIN') navigate('/admin/dashboard');
      else if (role === 'STUDENT') navigate('/student/dashboard');
      else if (role === 'SCRIBE') navigate('/scribe/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || t.validation.loginFailed);
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className={`min-h-[90vh] flex items-center justify-center px-4 relative overflow-hidden transition-colors duration-500 ${highContrast ? 'bg-slate-950' : 'bg-gray-50'}`}>
      
      {/* Decorative Background Shapes */}
      {!highContrast && (
        <>
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-400/10 blur-[120px] rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-400/10 blur-[100px] rounded-full -ml-32 -mb-32"></div>
        </>
      )}

      <div className={`max-w-md w-full relative z-10 transition-all duration-700 ${loading ? 'scale-95 opacity-50' : 'scale-100'}`}>
        
        <div className="text-center mb-10">
          <div className={`mx-auto h-16 w-16 rounded-2xl flex items-center justify-center mb-6 shadow-xl ${highContrast ? 'bg-indigo-600 text-white' : 'bg-primary-600 text-white shadow-primary-200 animate-float'}`}>
             <BookOpen size={32} />
          </div>
          <h2 className={`text-4xl font-black tracking-tight mb-2 ${highContrast ? 'text-white' : 'text-gray-900'}`}>
            {t.login?.title || "Welcome Back"}
          </h2>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">{t.login.gatewayAccess}</p>
        </div>

        <div className={`rounded-[2.5rem] p-10 border transition-all ${highContrast ? 'bg-slate-900/80 border-slate-800 backdrop-blur-xl' : 'bg-white shadow-2xl border-white'}`}>
          
          {error && (
            <div className="mb-8 p-4 bg-red-50 rounded-2xl border border-red-100 text-red-600 flex items-center gap-3 animate-in fade-in slide-in-from-top-4" role="alert">
              <AlertCircle size={20} strokeWidth={3} /> 
              <span className="text-xs font-black uppercase tracking-tight">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2 group">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 group-focus-within:text-primary-600 transition-colors">{t.login.credentialLabel}</label>
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-400 transition-colors" size={20} />
                <input
                  type="text"
                  required
                  placeholder={t.login.identifierLabel}
                  className={`w-full h-14 pl-14 pr-6 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-primary-600 transition-all ${highContrast ? 'bg-slate-800/50 text-slate-100 placeholder:text-slate-500' : 'bg-gray-50 text-gray-900'}`}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 group-focus-within:text-primary-600 transition-colors">{t.login.securityKeyLabel}</label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-400 transition-colors" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className={`w-full h-14 pl-14 pr-14 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-primary-600 transition-all ${highContrast ? 'bg-slate-800/50 text-slate-100 placeholder:text-slate-500' : 'bg-gray-50 text-gray-900'}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-primary-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full h-16 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl transition-all active:scale-95 flex justify-center items-center gap-3 disabled:opacity-50
                ${highContrast ? 'bg-indigo-600 text-white shadow-indigo-500/20 hover:bg-indigo-700' : 'bg-primary-600 text-white shadow-primary-200 hover:bg-primary-700 hover:shadow-primary-300'}`}
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : <>{t.nav.login} <ArrowRight /></>}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-100 text-center">
             <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4">{t.login.newToPlatform}</p>
             <Link to="/register-select" className="inline-flex items-center gap-2 text-primary-600 font-black text-sm hover:underline">
                {t.login.createAccount} <ArrowRight size={16} />
             </Link>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
           <ShieldCheck size={14} className="text-green-500" /> {t.login.encryptedSession}
        </div>
      </div>
    </div>
  );
};

export default Login;