import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Calendar, Clock, MapPin, User, Loader2, 
  CheckCircle, XCircle, CalendarOff, Inbox, Star, Trophy, MessageCircle, Phone, ArrowRight, Check, X
} from 'lucide-react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '../../context/AccessibilityContext';

const ScribeDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, highContrast } = useAccessibility(); 

  const [activeTab, setActiveTab] = useState('upcoming'); 
  const [page, setPage] = useState(1); 

  // Reset page when switching tabs
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  // --- 1. FETCH PROFILE (For Rating & Stats) ---
  const { data: profileData, isLoading: loadProfile } = useQuery({
    queryKey: ['scribe-profile'],
    queryFn: async () => (await api.get('/scribe/profile')).data
  });

  // --- 2. FETCH REQUESTS (With Pagination) ---
  const { data: requestData, isLoading: loadRequests, isFetching } = useQuery({
    queryKey: ['scribe-requests', activeTab, page],
    queryFn: async () => {
      let endpoint = '';
      if (activeTab === 'upcoming') endpoint = `/scribe/get-request?status=ACCEPTED&page=${page}`;
      else if (activeTab === 'history') endpoint = `/scribe/get-request?status=COMPLETED&page=${page}`;
      else if (activeTab === 'pending') endpoint = `/scribe/invites`; 
      
      const res = await api.get(endpoint);
      
      if (activeTab === 'pending') {
          return { items: res.data.invites || [], has_more: false };
      }

      return { 
          items: res.data.requests || [], 
          has_more: res.data.has_more 
      }; 
    },
    keepPreviousData: true,
  });

  // --- 3. FETCH PENDING COUNT (For Notification Dot) ---
  const { data: inviteCount = 0 } = useQuery({
    queryKey: ['scribe-invite-count'],
    queryFn: async () => {
      const res = await api.get('/scribe/invites');
      return res.data.invites?.length || 0;
    },
    refetchInterval: 30000, // Sync every 30s
  });

  const requests = requestData?.items || [];
  const hasMore = requestData?.has_more || false;

  // --- MUTATIONS ---
  const acceptMutation = useMutation({
    mutationFn: async (token) => await api.post('/scribe/acceptRequest', { token }),
    onSuccess: () => {
      queryClient.invalidateQueries(['scribe-requests']);
      queryClient.invalidateQueries(['scribe-profile']);
      setActiveTab('upcoming');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (token) => await api.post('/scribe/reject-invite', { token }),
    onSuccess: () => queryClient.invalidateQueries(['scribe-requests'])
  });

  const getProfileImage = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
  };

  if (loadProfile) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary-600" size={48} /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-10">
      
      {/* Premium Profile Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-primary-900 p-8 md:p-12 text-white shadow-2xl">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-400/20 blur-[100px] rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full -ml-10 -mb-10"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex flex-col md:flex-row items-center gap-6">
              <div className={`w-28 h-28 rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl flex-shrink-0 group transition-transform hover:scale-105`}>
                 {profileData?.profile?.profile_image_url ? (
                    <img 
                      src={getProfileImage(profileData.profile.profile_image_url)} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center font-black text-4xl bg-primary-800 text-white">
                      {profileData?.profile?.first_name?.[0]}
                    </div>
                 )}
              </div>

              <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
                  {t.scribeDashboard?.hello || "Hello"}, {profileData?.profile?.first_name}!
                </h1>
                <p className="text-primary-100 text-lg opacity-80">{t.scribeDashboard?.summary || "Your impact summary this month."}</p>
              </div>
           </div>

           <div className="flex gap-8 items-center bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10">
              <div className="text-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-primary-300 mb-1">{t.scribeDashboard?.rating || "Rating"}</p>
                 <div className="flex items-center gap-2">
                   <Star size={20} className="fill-yellow-400 text-yellow-400" />
                   <span className="text-2xl font-black">{parseFloat(profileData?.profile?.avg_rating || 0).toFixed(1)}</span>
                 </div>
                 <p className="text-[10px] opacity-60 mt-1 uppercase tracking-tighter">({profileData?.profile?.total_ratings} {t.scribeDashboard?.reviews || "reviews"})</p>
              </div>
              <div className="w-px h-12 bg-white/10"></div>
              <div className="text-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-primary-300 mb-1">{t.scribeDashboard?.exams || "Exams"}</p>
                 <div className="flex items-center gap-2">
                    <Trophy size={20} className="text-primary-400" />
                    <span className="text-2xl font-black">{profileData?.stats?.total_exams || 0}</span>
                 </div>
                 <p className="text-[10px] opacity-60 mt-1 uppercase tracking-tighter">{t.scribeDashboard?.completed || "Completed"}</p>
              </div>
           </div>

           <button 
             onClick={() => navigate('/scribe/availability')}
             className="px-8 py-4 bg-white text-primary-900 rounded-[1.5rem] font-black shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-2"
           >
             <CalendarOff size={20} /> {t.scribeDashboard?.manageAvailability || "Status"}
           </button>
        </div>
      </div>

      {/* Tabs Control */}
      <div className="flex flex-wrap gap-2 p-2 bg-gray-100/80 backdrop-blur rounded-[2rem] w-fit border border-gray-200">
        {['upcoming', 'pending', 'history'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-3 rounded-[1.5rem] font-black text-sm transition-all flex items-center gap-2
            ${activeTab === tab ? 'bg-white text-primary-600 shadow-premium border border-gray-100' : 'text-gray-500 hover:text-gray-800'}`}
          >
            {t.scribeDashboard?.tabs?.[tab] || tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'pending' && inviteCount > 0 && (
              <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            )}
          </button>
        ))}
      </div>

      {/* Request Grid */}
      <div className="min-h-[500px]">
        {loadRequests ? (
          <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary-600" size={48} /></div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-40">
             <Inbox size={64} strokeWidth={1} className="mb-4" />
             <p className="text-xl font-bold">{t.scribeDashboard?.noRequests?.replace('{tab}', activeTab) || `No ${activeTab} requests.`}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {requests.map((req) => (
              <div key={req.id || req.token} className={`group relative p-8 rounded-[2.5rem] transition-all duration-500 hover:shadow-premium-hover border border-gray-100 ${activeTab === 'history' ? 'bg-gray-50/50' : 'bg-white shadow-premium'}`}>
                
                {/* Header: Name & Action */}
                <div className="flex justify-between items-start mb-6">
                   <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center font-black">
                        {req.student_name?.[0]}
                      </div>
                      <div>
                        <h3 className="font-black text-lg text-gray-900 group-hover:text-primary-600 transition-colors">{req.student_name}</h3>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Student</p>
                      </div>
                   </div>
                   {activeTab === 'upcoming' && (
                     <button 
                       onClick={() => navigate(`/chat/${req.id}`)} 
                       className="p-3 rounded-2xl bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                       title="Open Chat"
                     >
                       <MessageCircle size={22} strokeWidth={2.5} />
                     </button>
                   )}
                </div>

                {/* Details Section */}
                <div className="space-y-4 mb-8 bg-gray-50/80 p-5 rounded-3xl border border-gray-100">
                  <div className="flex items-center gap-3 text-gray-600 font-bold text-sm">
                    <Calendar size={18} className="text-primary-400" />
                    <span>{new Date(req.exam_date || req.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 font-bold text-sm">
                    <Clock size={18} className="text-primary-400" />
                    <span>{req.exam_time || req.time || 'TBD'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-500 text-sm">
                    <MapPin size={18} className="text-primary-400" />
                    <span className="truncate">{req.city}, {req.district}</span>
                  </div>
                </div>

                {/* Footer Buttons */}
                {activeTab === 'pending' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => acceptMutation.mutate(req.token)} 
                      disabled={acceptMutation.isLoading}
                      className="flex items-center justify-center gap-2 bg-primary-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {acceptMutation.isLoading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} strokeWidth={3} />}
                      {t.scribeDashboard?.accept || "Accept"}
                    </button>
                    <button 
                      onClick={() => rejectMutation.mutate(req.token)} 
                      className="flex items-center justify-center gap-2 bg-red-50 text-red-600 py-4 rounded-2xl font-black hover:bg-red-100 transition-all active:scale-95"
                    >
                      <X size={18} strokeWidth={3} />
                      {t.scribeDashboard?.decline || "Decline"}
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center px-2">
                    <div className="flex items-center gap-2">
                       <span className={`h-2 w-2 rounded-full ${activeTab === 'upcoming' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                       <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          {activeTab === 'upcoming' ? 'Confirmed' : 'Completed'}
                       </span>
                    </div>
                    <button onClick={() => navigate(activeTab === 'upcoming' ? `/chat/${req.id}` : `/profile`)} className="text-primary-600 font-black text-sm flex items-center gap-1 hover:gap-2 transition-all group/btn">
                      {activeTab === 'upcoming' ? 'Go to Chat' : 'View Details'} <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Premium Pagination */}
        {activeTab !== 'pending' && (page > 1 || hasMore) && (
           <div className="flex justify-center items-center gap-8 mt-16 pb-12">
             <button 
               disabled={page === 1 || isFetching}
               onClick={() => setPage(p => Math.max(1, p - 1))}
               className="h-14 w-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center font-black shadow-premium hover:shadow-premium-hover transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed group"
             >
                <ArrowRight size={20} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
             </button>
             
             <div className="flex flex-col items-center">
                <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{t.common?.page || "Page"}</span>
                <span className="text-2xl font-black text-primary-600 tabular-nums">{page}</span>
             </div>

             <button 
               disabled={!hasMore || isFetching}
               onClick={() => setPage(p => p + 1)}
               className="h-14 w-14 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-black shadow-lg shadow-primary-100 hover:shadow-primary-200 transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed group"
             >
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
             </button>
           </div>
        )}
      </div>
    </div>
  );
};

export default ScribeDashboard;