import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { 
  BookOpen, 
  UserPlus, 
  LogIn, 
  CheckCircle, 
  Shield, 
  Users, 
  ArrowRight, 
  Zap, 
  Globe, 
  Heart, 
  Award,
  Clock,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';

const Home = () => {
  const { user } = useAuth();
  const { highContrast, t } = useAccessibility();

  if (user) {
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
    return <Navigate to="/scribe/dashboard" replace />;
  }

  const bgImage = "/scribe_portal_hero_1777227573461.png";

  return (
    <div className={`min-h-screen transition-colors duration-500 ${highContrast ? 'bg-slate-950 text-slate-200' : 'bg-white'}`}>
      
      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Animated Background Overlay */}
        {!highContrast && (
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-200/30 blur-[120px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/30 blur-[120px] rounded-full animate-pulse delay-1000"></div>
            <img 
              src={bgImage} 
              alt="Hero BG" 
              className="w-full h-full object-cover opacity-10 scale-105 animate-float" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white"></div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary-50 text-primary-600 font-black text-[12px] uppercase tracking-[0.25em] mb-10 animate-in fade-in slide-in-from-top-4 duration-1000 shadow-sm border border-primary-100/50">
            <Zap size={16} fill="currentColor" /> {t.home.heroTag}
          </div>
          
          <h1 className={`text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.85] animate-in fade-in slide-in-from-bottom-8 duration-1000 ${highContrast ? 'text-white' : 'text-gray-900'}`}>
            {t.home.heroTitlePart1} <span className="text-primary-600 italic">{t.home.heroTitleEveryone}</span><br />
            <span className={highContrast ? 'text-slate-500' : 'text-gray-400 font-light'}>{t.home.heroTitlePart2}</span> <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-600 bg-[length:200%_auto] animate-gradient">ScribePool.</span>
          </h1>

          <p className={`max-w-3xl mx-auto text-lg md:text-2xl font-medium mb-14 leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 ${highContrast ? 'text-slate-400' : 'text-gray-500'}`}>
            {t.home.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000">
            <Link
              to="/register-select"
              className="group h-18 px-12 bg-primary-600 text-white rounded-[1.5rem] font-black text-xl shadow-2xl shadow-primary-200 hover:shadow-primary-300 hover:-translate-y-1.5 active:scale-95 transition-all flex items-center gap-3"
            >
              {t.home.getStarted} <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="h-18 px-12 bg-white border-2 border-gray-100 text-gray-900 rounded-[1.5rem] font-black text-xl hover:bg-gray-50 hover:border-gray-200 hover:-translate-y-1.5 active:scale-95 transition-all flex items-center gap-3 shadow-xl shadow-gray-100"
            >
              <LogIn size={24} /> {t.home.signIn}
            </Link>
          </div>

          {/* Trust Indicators */}
          {!highContrast && (
            <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 opacity-60 max-w-4xl mx-auto">
              <TrustBadge icon={ShieldCheck} label={t.home.verified} />
              <TrustBadge icon={Globe} label={t.home.panIndia} />
              <TrustBadge icon={Heart} label={t.home.altruistic} />
              <TrustBadge icon={Award} label={t.home.professional} />
            </div>
          )}
        </div>
      </section>

      {/* --- HOW IT WORKS SECTION --- */}
      <section className="py-32 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">{t.home.howItWorksTitle}</h2>
            <p className="text-gray-500 font-bold text-xl max-w-2xl mx-auto italic">{t.home.howItWorksSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-1/3 left-1/4 right-1/4 h-0.5 bg-dashed-gradient z-0"></div>
            
            <StepCard 
              number="01"
              title={t.home.step1Title}
              desc={t.home.step1Desc}
              icon={UserPlus}
              highContrast={highContrast}
            />
            <StepCard 
              number="02"
              title={t.home.step2Title}
              desc={t.home.step2Desc}
              icon={Clock}
              highContrast={highContrast}
            />
            <StepCard 
              number="03"
              title={t.home.step3Title}
              desc={t.home.step3Desc}
              icon={Zap}
              highContrast={highContrast}
            />
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
            <div className="text-left max-w-2xl">
              <h2 className={`text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight ${highContrast ? 'text-white' : 'text-gray-900'}`}>
                {t.home.featuresTitle}
              </h2>
              <p className={`font-bold text-xl leading-relaxed ${highContrast ? 'text-slate-400' : 'text-gray-500'}`}>
                {t.home.featuresSubtitle}
              </p>
            </div>
            <div className="hidden md:block">
              <div className={`p-6 rounded-[2rem] text-white shadow-2xl rotate-3 ${highContrast ? 'bg-indigo-600' : 'bg-primary-600'}`}>
                <Smartphone size={40} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <FeatureCard 
              icon={Shield} 
              title={t.home.feature1Title} 
              desc={t.home.feature1Desc} 
              color="bg-blue-600"
              highContrast={highContrast}
            />
            <FeatureCard 
              icon={Zap} 
              title={t.home.feature2Title} 
              desc={t.home.feature2Desc} 
              color="bg-orange-500"
              highContrast={highContrast}
            />
            <FeatureCard 
              icon={Users} 
              title={t.home.feature3Title} 
              desc={t.home.feature3Desc} 
              color="bg-indigo-600"
              highContrast={highContrast}
            />
          </div>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className={`py-24 border-y ${highContrast ? 'border-slate-900' : 'border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <StatCard value="10k+" label={t.home.stat1Label} highContrast={highContrast} />
            <StatCard value="25k+" label={t.home.stat2Label} highContrast={highContrast} />
            <StatCard value="98%" label={t.home.stat3Label} highContrast={highContrast} />
            <StatCard value="500+" label={t.home.stat4Label} highContrast={highContrast} />
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-40 px-4">
         <div className="max-w-6xl mx-auto rounded-[4rem] bg-zinc-900 p-12 md:p-32 text-center relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/30 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/20 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10">
               <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter">
                 {t.home.ctaTitle}
               </h2>
               <p className="text-zinc-400 text-xl md:text-2xl font-medium mb-16 max-w-3xl mx-auto leading-relaxed">
                 {t.home.ctaSubtitle}
               </p>
               <Link 
                 to="/register-select"
                 className="inline-flex h-20 px-16 bg-white text-gray-900 rounded-[2rem] font-black text-2xl hover:scale-105 hover:-translate-y-1 active:scale-95 transition-all shadow-2xl shadow-white/10"
               >
                 {t.home.ctaButton}
               </Link>
            </div>
         </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className={`py-20 border-t ${highContrast ? 'border-slate-900' : 'border-gray-100'}`}>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="flex flex-col items-center md:items-start gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl text-white ${highContrast ? 'bg-indigo-600' : 'bg-primary-600'}`}>
                    <BookOpen size={28} strokeWidth={2.5} />
                  </div>
                  <span className={`text-3xl font-black tracking-tighter ${highContrast ? 'text-white' : 'text-gray-900'}`}>ScribePool</span>
                </div>
                <p className="text-gray-500 font-medium max-w-xs text-center md:text-left">
                  {t.home.footerTagline}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
                <div>
                  <h4 className={`font-black uppercase tracking-widest text-xs mb-6 ${highContrast ? 'text-slate-300' : 'text-gray-900'}`}>{t.home.footerPlatform}</h4>
                  <ul className="space-y-4 text-gray-500 font-bold">
                    <li><Link to="/login" className="hover:text-primary-600 transition-colors">{t.home.footerLogin}</Link></li>
                    <li><Link to="/register-select" className="hover:text-primary-600 transition-colors">{t.home.footerRegister}</Link></li>
                    <li><Link to="/" className="hover:text-primary-600 transition-colors">{t.home.footerAbout}</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className={`font-black uppercase tracking-widest text-xs mb-6 ${highContrast ? 'text-slate-300' : 'text-gray-900'}`}>{t.home.footerSupport}</h4>
                  <ul className="space-y-4 text-gray-500 font-bold">
                    <li><a href="#" className="hover:text-primary-600 transition-colors">{t.home.footerHelp}</a></li>
                    <li><a href="#" className="hover:text-primary-600 transition-colors">{t.home.footerContact}</a></li>
                    <li><a href="#" className="hover:text-primary-600 transition-colors">{t.home.footerPrivacy}</a></li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className={`mt-20 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 ${highContrast ? 'border-slate-900' : 'border-gray-100'}`}>
              <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">&copy; 2026 {t.home.rights}</p>
              <div className="flex gap-8 opacity-40">
                <Globe size={20} />
                <ShieldCheck size={20} />
                <Smartphone size={20} />
              </div>
            </div>
         </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1.05); }
          50% { transform: translateY(-30px) scale(1.1); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-float {
          animation: float 25s ease-in-out infinite;
        }
        .animate-gradient {
          animation: gradient 8s linear infinite;
        }
        .bg-dashed-gradient {
          background-image: linear-gradient(to right, ${highContrast ? '#1e293b' : '#e5e7eb'} 50%, transparent 50%);
          background-size: 20px 100%;
        }
      `}</style>
    </div>
  );
};

const TrustBadge = ({ icon: Icon, label, highContrast }) => (
  <div className="flex flex-col items-center gap-3 group transition-all duration-500 hover:scale-110">
    <div className={`p-4 rounded-[1.5rem] transition-colors ${highContrast ? 'bg-slate-900 text-slate-500 group-hover:text-indigo-400' : 'bg-gray-50 text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-600'}`}>
      <Icon size={28} strokeWidth={1.5} />
    </div>
    <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${highContrast ? 'text-slate-400' : 'text-gray-400'}`}>{label}</span>
  </div>
);

const StepCard = ({ number, title, desc, icon: Icon, highContrast }) => (
  <div className={`relative z-10 flex flex-col items-center text-center p-10 rounded-[3rem] border transition-all duration-500 group ${highContrast ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50 hover:-translate-y-3'}`}>
    <div className={`absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl transition-transform group-hover:rotate-12 ${highContrast ? 'bg-indigo-600 text-white shadow-indigo-500/20' : 'bg-primary-600 text-white shadow-primary-200'}`}>
      {number}
    </div>
    <div className={`mb-8 mt-4 transition-colors ${highContrast ? 'text-slate-700 group-hover:text-indigo-400' : 'text-primary-100 group-hover:text-primary-600'}`}>
      <Icon size={64} strokeWidth={1} />
    </div>
    <h3 className={`text-2xl font-black mb-4 ${highContrast ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
    <p className={`font-bold leading-relaxed ${highContrast ? 'text-slate-400' : 'text-gray-500'}`}>{desc}</p>
  </div>
);

const FeatureCard = ({ icon: Icon, title, desc, color, highContrast }) => (
  <div className={`glass-card p-12 rounded-[3rem] border hover:-translate-y-4 transition-all duration-700 group relative overflow-hidden ${highContrast ? 'bg-slate-900/50 border-slate-800 hover:shadow-indigo-500/10' : 'bg-white border-gray-100 hover:shadow-premium-hover'}`}>
    <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-[0.03] rounded-bl-full`}></div>
    <div className={`h-20 w-20 rounded-[1.75rem] ${color} text-white flex items-center justify-center mb-10 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
      <Icon size={36} strokeWidth={1.5} />
    </div>
    <h3 className={`text-3xl font-black mb-6 tracking-tight ${highContrast ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
    <p className={`font-bold text-lg leading-relaxed ${highContrast ? 'text-slate-400' : 'text-gray-500'}`}>{desc}</p>
  </div>
);

const StatCard = ({ value, label, highContrast }) => (
  <div className="flex flex-col gap-2">
    <div className={`text-4xl md:text-6xl font-black tracking-tighter ${highContrast ? 'text-indigo-400' : 'text-primary-600'}`}>{value}</div>
    <div className="text-xs font-black uppercase tracking-widest text-gray-400">{label}</div>
  </div>
);

export default Home;