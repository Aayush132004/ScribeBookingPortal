import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, BookOpen, Calendar } from 'lucide-react';
import api from '../api/axios';

const Navbar = ({ userRole }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/logout'); // Matches your auth.controller.js logout
      navigate('/login');
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <nav className="bg-white border-b border-slate-200 px-4 py-3" aria-label="Main Navigation">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-primary flex items-center gap-2">
          <BookOpen aria-hidden="true" />
          <span>ScribePortal</span>
        </Link>

        <div className="flex items-center gap-6">
          {userRole === 'STUDENT' && (
            <Link to="/student/requests" className="flex items-center gap-1 text-slate-600 hover:text-primary font-medium">
              <Calendar size={18} /> Requests
            </Link>
          )}
          
          {userRole === 'SCRIBE' && (
            <Link to="/scribe/bookings" className="flex items-center gap-1 text-slate-600 hover:text-primary font-medium">
              <User size={18} /> My Bookings
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-red-600 hover:bg-red-50 px-3 py-2 rounded-md transition-colors font-medium"
            aria-label="Logout from system"
          >
            <LogOut size={18} /> <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;