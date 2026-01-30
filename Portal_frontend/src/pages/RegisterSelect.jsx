import React from 'react';
import { Link } from 'react-router-dom';
import { User, Pencil } from 'lucide-react';

const RegisterSelect = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <h2 className="text-3xl font-bold text-slate-900 mb-8">Join the Portal</h2>
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
        
        {/* Student Option */}
        <Link 
          to="/register/student" 
          className="group p-8 bg-white border-2 border-slate-200 rounded-2xl hover:border-primary transition-all text-center shadow-sm"
        >
          <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <User size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">I am a Student</h3>
          <p className="text-slate-600 mt-2">I need a scribe for my upcoming examinations.</p>
        </Link>

        {/* Scribe Option */}
        <Link 
          to="/register/scribe" 
          className="group p-8 bg-white border-2 border-slate-200 rounded-2xl hover:border-primary transition-all text-center shadow-sm"
        >
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Pencil size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">I am a Scribe</h3>
          <p className="text-slate-600 mt-2">I want to volunteer my help for students.</p>
        </Link>
      </div>
    </div>
  );
};

export default RegisterSelect;