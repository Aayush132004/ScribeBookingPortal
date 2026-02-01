import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
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

    // 1. Determine if input is likely an email or phone based on characters
    const hasLetters = /[a-zA-Z]/.test(identifier);
    const hasAt = identifier.includes('@');

    if (hasAt || hasLetters) {
      // Treat as Email
      if (!emailRegex.test(identifier)) {
        setError("Please enter a valid email address.");
        return false;
      }
    } else {
      // Treat as Phone
      if (!phoneRegex.test(identifier)) {
        setError("Phone number must be exactly 10 digits.");
        return false;
      }
    }

    // 2. Simplified Password Check for Login
    if (!password) {
      setError("Password is required.");
      return false;
    }

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
      
      // Redirect based on role
      if (role === 'ADMIN') navigate('/admin/dashboard');
      else if (role === 'STUDENT') navigate('/student/dashboard');
      else if (role === 'SCRIBE') navigate('/scribe/dashboard');
      else navigate('/');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally { 
      setLoading(false); 
    }
  };

  // Accessibility Styles
  const bgClass = highContrast ? "bg-black border-2 border-yellow-400 shadow-none" : "bg-white border-slate-200 shadow-lg";
  const textClass = highContrast ? "text-yellow-400" : "text-slate-900";
  const inputContainerClass = highContrast 
    ? "border-2 border-yellow-400 bg-black" 
    : "border-2 border-slate-200 focus-within:border-primary bg-white";
  const iconClass = highContrast ? "text-yellow-400" : "text-slate-400";

  return (
    <div className={`min-h-[80vh] flex items-center justify-center px-4 ${highContrast ? 'bg-black' : ''}`}>
      <div className={`max-w-md w-full rounded-xl p-8 border ${bgClass}`}>
        <div className="text-center mb-8">
          <h2 className={`text-3xl font-bold ${textClass}`}>{t.nav.login}</h2>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border-l-4 border-red-600 text-red-500 flex items-center gap-3" role="alert">
            <AlertCircle size={20} /> <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`block text-sm font-bold mb-1 ${textClass}`}>Email / Phone</label>
            <div className={`relative flex items-center rounded-lg overflow-hidden transition-colors ${inputContainerClass}`}>
              <Mail className={`absolute left-3 ${iconClass}`} size={18} />
              <input
                type="text"
                required
                placeholder="Enter email or phone"
                className={`block w-full pl-10 pr-3 py-3 bg-transparent outline-none ${highContrast ? 'text-yellow-400 placeholder:text-yellow-700' : 'text-slate-900'}`}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-bold mb-1 ${textClass}`}>Password</label>
            <div className={`relative flex items-center rounded-lg overflow-hidden transition-colors ${inputContainerClass}`}>
              <Lock className={`absolute left-3 ${iconClass}`} size={18} />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className={`block w-full pl-10 pr-12 py-3 bg-transparent outline-none ${highContrast ? 'text-yellow-400 placeholder:text-yellow-700' : 'text-slate-900'}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 focus:outline-none ${highContrast ? 'text-yellow-400' : 'text-slate-400 hover:text-primary'}`}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-black uppercase tracking-widest transition-transform active:scale-95 
              ${highContrast ? 'bg-yellow-400 text-black hover:bg-yellow-300' : 'bg-primary text-white hover:bg-primary-dark'}`}
          >
            {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : t.nav.login}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;