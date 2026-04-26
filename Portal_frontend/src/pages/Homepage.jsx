import { Link, Navigate } from 'react-router-dom';
import { BookOpen, UserPlus, LogIn, CheckCircle, Shield, Users, ArrowRight, Zap, Globe, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';

const Home = () => {
  const { user } = useAuth();
  const { highContrast } = useAccessibility();

  if (user) {
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
    return <Navigate to="/scribe/dashboard" replace />;
  }

  const bgImage = "/scribe_portal_hero_1777227573461.png";

  return (
    <div className={`min-h-screen ${highContrast ? 'bg-black text-yellow-400' : 'bg-white'}`}>
      
      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated Background Overlay */}
        {!highContrast && (
          <div className="absolute inset-0 z-0">
            <img 
              src={bgImage} 
              alt="Hero BG" 
              className="w-full h-full object-cover opacity-60 scale-105 animate-float" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white"></div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-600 font-black text-[10px] uppercase tracking-[0.2em] mb-8 animate-in fade-in slide-in-from-top-4 duration-1000 shadow-sm border border-primary-200/50">
            <Zap size={14} fill="currentColor" /> Empowering Accessibility
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-gray-900 mb-8 leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Exams for <span className="text-primary-600">Everyone.</span><br />
            Powered by <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600">ScribePool.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl font-medium text-gray-500 mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000">
            The world's most advanced platform connecting students with professional scribes. Seamless, secure, and built for real impact.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000">
            <Link
              to="/register-select"
              className="group h-16 px-10 bg-primary-600 text-white rounded-2xl font-black text-lg shadow-2xl shadow-primary-200 hover:shadow-primary-300 hover:-translate-y-1 transition-all flex items-center gap-3"
            >
              Get Started <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="h-16 px-10 bg-white border-2 border-gray-100 text-gray-900 rounded-2xl font-black text-lg hover:bg-gray-50 hover:border-gray-200 transition-all flex items-center gap-3 shadow-sm"
            >
              <LogIn size={20} /> Sign In
            </Link>
          </div>
        </div>

        {/* Floating Decorative Elements */}
        {!highContrast && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-12 opacity-40 grayscale group hover:grayscale-0 transition-all duration-1000">
            <div className="flex flex-col items-center gap-2">
               <Shield size={32} strokeWidth={1} />
               <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
            </div>
            <div className="flex flex-col items-center gap-2">
               <Globe size={32} strokeWidth={1} />
               <span className="text-[10px] font-black uppercase tracking-widest">Pan India</span>
            </div>
            <div className="flex flex-col items-center gap-2">
               <Heart size={32} strokeWidth={1} />
               <span className="text-[10px] font-black uppercase tracking-widest">Altruistic</span>
            </div>
          </div>
        )}
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">Production-Ready Features</h2>
            <p className="text-gray-500 font-bold max-w-xl mx-auto">Built with the latest technologies to ensure 100% reliability during critical examinations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <FeatureCard 
              icon={Shield} 
              title="Verified Scribes" 
              desc="Every partner undergoes strict background checks and document verification before they can help you." 
              color="bg-blue-600"
            />
            <FeatureCard 
              icon={Zap} 
              title="Real-time Sync" 
              desc="Instant notifications for bookings, messages, and calls via WebSockets and high-speed signaling." 
              color="bg-orange-500"
            />
            <FeatureCard 
              icon={Users} 
              title="Global Network" 
              desc="Access a nationwide pool of scribes regardless of your city or exam center location." 
              color="bg-indigo-600"
            />
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="pb-32 px-4">
         <div className="max-w-5xl mx-auto rounded-[3rem] bg-zinc-900 p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/20 blur-[100px]"></div>
            <div className="relative z-10">
               <h2 className="text-4xl md:text-6xl font-black text-white mb-6">Ready to make a difference?</h2>
               <p className="text-zinc-400 text-lg md:text-xl font-medium mb-12 max-w-2xl mx-auto">
                 Whether you're a student seeking support or a volunteer ready to help, our platform is ready for you.
               </p>
               <Link 
                 to="/register-select"
                 className="inline-flex h-16 px-12 bg-white text-gray-900 rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-xl"
               >
                 Join ScribePool Today
               </Link>
            </div>
         </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t border-gray-100 text-center">
         <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="text-primary-600" size={24} strokeWidth={3} />
            <span className="text-xl font-black tracking-tight text-gray-900">ScribePool</span>
         </div>
         <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">&copy; 2026 ScribePool Technologies. All Rights Reserved.</p>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1.05); }
          50% { transform: translateY(-20px) scale(1.1); }
        }
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc, color }) => (
  <div className="glass-card p-10 rounded-[2.5rem] border border-gray-100 hover:shadow-premium-hover hover:-translate-y-2 transition-all duration-500 group">
    <div className={`h-16 w-16 rounded-2xl ${color} text-white flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform`}>
      <Icon size={32} strokeWidth={1.5} />
    </div>
    <h3 className="text-2xl font-black text-gray-900 mb-4">{title}</h3>
    <p className="text-gray-500 font-bold leading-relaxed">{desc}</p>
  </div>
);

export default Home;