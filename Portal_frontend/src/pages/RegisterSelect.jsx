import React from 'react';
import { Link } from 'react-router-dom';
import { User, Pencil } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

const RegisterSelect = () => {
  const { t, highContrast } = useAccessibility();

  // Dynamic Styles
  const bgClass = highContrast 
    ? "bg-slate-900/80 border border-slate-800 text-slate-100 backdrop-blur-xl shadow-2xl" 
    : "bg-white border-2 border-slate-200 hover:border-primary shadow-sm";
  
  const textClass = highContrast ? "text-slate-100" : "text-slate-800";
  const subTextClass = highContrast ? "text-slate-400" : "text-slate-600";
  const iconBoxClass = highContrast ? "bg-indigo-600 text-white" : "";

  return (
    <div className={`min-h-[80vh] flex flex-col items-center justify-center px-4 transition-colors ${highContrast ? 'bg-slate-950' : ''}`}>
      <h2 className={`text-3xl font-black mb-8 ${highContrast ? 'text-white' : 'text-slate-900'}`}>
        {t.registerSelect?.title || "Join the Portal"}
      </h2>
      
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
        
        {/* Student Option */}
        <Link 
          to="/register/student" 
          className={`group p-8 rounded-2xl transition-all text-center ${bgClass}`}
          aria-label={t.registerSelect?.studentTitle}
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform 
            ${iconBoxClass || 'bg-blue-50 text-primary'}`}>
            <User size={32} />
          </div>
          <h3 className={`text-xl font-bold ${textClass}`}>
            {t.registerSelect?.studentTitle || "I am a Student"}
          </h3>
          <p className={`mt-2 ${subTextClass}`}>
            {t.registerSelect?.studentDesc || "I need a scribe for my upcoming examinations."}
          </p>
        </Link>

        {/* Scribe Option */}
        <Link 
          to="/register/scribe" 
          className={`group p-8 rounded-2xl transition-all text-center ${bgClass}`}
          aria-label={t.registerSelect?.scribeTitle}
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform 
            ${iconBoxClass || 'bg-green-50 text-green-600'}`}>
            <Pencil size={32} />
          </div>
          <h3 className={`text-xl font-bold ${textClass}`}>
            {t.registerSelect?.scribeTitle || "I am a Scribe"}
          </h3>
          <p className={`mt-2 ${subTextClass}`}>
            {t.registerSelect?.scribeDesc || "I want to volunteer my help for students."}
          </p>
        </Link>
      </div>
    </div>
  );
};

export default RegisterSelect;