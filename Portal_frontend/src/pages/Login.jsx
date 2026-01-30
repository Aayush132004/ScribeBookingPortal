import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Phone, AlertCircle, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [identifier, setIdentifier] = useState(''); // Email or Phone
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Matches the logic in your auth.controller.js
      const response = await api.post('/auth/login', { identifier, password });
      
      // FIX 1: Save the FULL user object (id, name, role) so Navbar works
      const userData = response.data.user; 
      console.log("response is",response)
      login(userData);

      // FIX 2: Add specific redirect for ADMIN role
      if (userData.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (userData.role === 'STUDENT') {
        navigate('/student/dashboard');
      } else if (userData.role === 'SCRIBE') {
        navigate('/scribe/dashboard');
      } else {
        navigate('/');
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-slate-200">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-slate-600 mt-2">Sign in to manage your scribe bookings</p>
        </div>

        {error && (
          <div 
            className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 text-red-700 flex items-center gap-3"
            role="alert"
          >
            <AlertCircle size={20} />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="identifier" className="block text-sm font-semibold text-slate-700 mb-1">
              Email or Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input
                id="identifier"
                type="text"
                required
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Enter your email or phone"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                id="password"
                type="password"
                required
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 transition-colors"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600">
            Don't have an account? <br className="sm:hidden" />
            <Link to="/register-select" className="font-bold text-primary hover:text-primary-dark underline underline-offset-4">
              Register as Student or Scribe
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;