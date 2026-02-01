import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Calendar, Clock, MapPin, User, Loader2, 
  CheckCircle, XCircle, CalendarOff, Inbox, Star, Trophy 
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
      
      // Handle "Invites" (No pagination typically)
      if (activeTab === 'pending') {
          return { items: res.data.invites || [], has_more: false };
      }

      // Handle "Upcoming/History" (With Pagination)
      return { 
          items: res.data.requests || [], 
          has_more: res.data.has_more 
      }; 
    },
    keepPreviousData: true,
  });

  const requests = requestData?.items || [];
  const hasMore = requestData?.has_more || false;

  // --- MUTATIONS ---
  const acceptMutation = useMutation({
    mutationFn: async (token) => await api.post('/scribe/acceptRequest', { token }),
    onSuccess: () => {
      alert(t.scribeDashboard?.acceptSuccess || "Request Accepted!");
      queryClient.invalidateQueries(['scribe-requests']);
      queryClient.invalidateQueries(['scribe-profile']); // Update stats
      setActiveTab('upcoming');
    },
    onError: (err) => alert(err.response?.data?.message || t.common?.error || "Error accepting request")
  });

  const rejectMutation = useMutation({
    mutationFn: async (token) => await api.post('/scribe/reject-invite', { token }),
    onSuccess: () => queryClient.invalidateQueries(['scribe-requests'])
  });

  // --- THEME ---
  const theme = {
    pageBg: highContrast ? 'bg-black min-h-screen' : 'bg-slate-50 min-h-screen',
    textMain: highContrast ? 'text-yellow-400' : 'text-slate-900',
    textSub: highContrast ? 'text-yellow-200' : 'text-slate-500',
    card: highContrast ? 'bg-black border-2 border-yellow-400 text-yellow-400' : 'bg-white shadow-sm border border-slate-200',
    btnPrimary: highContrast ? 'bg-yellow-400 text-black font-black border-2 border-black hover:bg-yellow-300' : 'bg-slate-800 text-white hover:bg-slate-900',
    tabActive: highContrast ? 'bg-yellow-400 text-black font-black' : 'bg-white text-primary shadow-sm border-b-2 border-primary',
    tabInactive: highContrast ? 'text-yellow-400 hover:bg-gray-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100',
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-lg border border-yellow-200">
        <Star size={16} className="fill-yellow-500 text-yellow-500" />
        <span className="font-bold text-yellow-700">{parseFloat(rating || 0).toFixed(1)}</span>
      </div>
    );
  };

  if (loadProfile) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

  // 🟢 HELPER: URL Fixer
  const getProfileImage = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
  };

  return (
    <div className={`py-8 px-4 transition-colors duration-300 ${theme.pageBg}`}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* 🟢 SCRIBE PROFILE STATS HEADER */}
        <div className={`p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 ${theme.card}`}>
           <div className="flex items-center gap-4">
              
              {/* Avatar Logic */}
              <div className={`w-20 h-20 rounded-full overflow-hidden border-4 flex-shrink-0 ${highContrast ? 'border-yellow-400' : 'border-white shadow-lg'}`}>
                 {profileData?.profile?.profile_image_url ? (
                    <img 
                      src={getProfileImage(profileData.profile.profile_image_url)} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                 ) : (
                    <div className={`w-full h-full flex items-center justify-center font-bold text-3xl ${highContrast ? 'bg-yellow-400 text-black' : 'bg-slate-200 text-slate-500'}`}>
                      {profileData?.profile?.first_name?.[0]}
                    </div>
                 )}
              </div>

              <div>
                <h1 className={`text-2xl font-bold ${theme.textMain}`}>
                  {t.scribeDashboard?.hello || "Hello"}, {profileData?.profile?.first_name}!
                </h1>
                <p className={theme.textSub}>{t.scribeDashboard?.summary || "Here is your performance summary."}</p>
              </div>
           </div>

           <div className="flex gap-6 md:gap-12">
              <div className="text-center">
                 <p className={`text-xs font-bold uppercase tracking-wide ${theme.textSub}`}>{t.scribeDashboard?.rating || "Rating"}</p>
                 <div className="mt-1">{renderStars(profileData?.profile?.avg_rating)}</div>
                 <p className="text-xs opacity-60 mt-1">({profileData?.profile?.total_ratings} {t.scribeDashboard?.reviews || "reviews"})</p>
              </div>
              <div className="w-px bg-slate-200 dark:bg-slate-700"></div>
              <div className="text-center">
                 <p className={`text-xs font-bold uppercase tracking-wide ${theme.textSub}`}>{t.scribeDashboard?.exams || "Exams"}</p>
                 <div className={`text-xl font-black mt-1 flex justify-center items-center gap-2 ${theme.textMain}`}>
                    <Trophy size={18} className="text-orange-500" />
                    {profileData?.stats?.total_exams || 0}
                 </div>
                 <p className="text-xs opacity-60 mt-1">{t.scribeDashboard?.completed || "Completed"}</p>
              </div>
           </div>

           <button 
             onClick={() => navigate('/scribe/availability')}
             className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${theme.btnPrimary}`}
           >
             <CalendarOff size={18} /> {t.scribeDashboard?.manageAvailability || "Manage Availability"}
           </button>
        </div>

        {/* TABS */}
        <div className="flex border-b border-slate-200">
          {['upcoming', 'pending', 'history'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-bold text-sm transition-all flex items-center gap-2 relative top-[1px]
              ${activeTab === tab ? theme.tabActive : theme.tabInactive}`}
            >
              {t.scribeDashboard?.tabs?.[tab] || tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'pending' && (
                <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                  {t.scribeDashboard?.inviteBadge || "Invite"}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* REQUEST LIST */}
        <div className="min-h-[400px]">
          {loadRequests ? (
            <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>
          ) : requests.length === 0 ? (
            <div className="text-center py-20 opacity-60">
               <Inbox size={48} className="mx-auto mb-4" />
               <p>{t.scribeDashboard?.noRequests?.replace('{tab}', activeTab) || `No ${activeTab} requests found.`}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {requests.map((req) => (
                activeTab === 'pending' ? (
                  // INVITE CARD
                  <div key={req.token} className={`p-6 rounded-2xl border-l-4 border-orange-500 ${theme.card}`}>
                    <div className="flex justify-between mb-4">
                       <h3 className={`font-bold ${theme.textMain}`}>{req.student_name}</h3>
                       <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded">
                         {t.scribeDashboard?.inviteBadge || "INVITE"}
                       </span>
                    </div>
                    <RequestDetails req={req} highContrast={highContrast} />
                    <div className="flex gap-3 mt-6">
                      <button onClick={() => acceptMutation.mutate(req.token)} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700">
                        {t.scribeDashboard?.accept || "Accept"}
                      </button>
                      <button onClick={() => rejectMutation.mutate(req.token)} className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg font-bold hover:bg-red-100">
                        {t.scribeDashboard?.decline || "Decline"}
                      </button>
                    </div>
                  </div>
                ) : (
                  // STANDARD CARD (Upcoming/History)
                  <div key={req.id} className={`p-6 rounded-2xl ${theme.card} ${activeTab === 'history' ? 'opacity-75' : ''}`}>
                     <div className="flex justify-between items-start mb-4">
                        <div>
                           <h3 className={`font-bold text-lg ${theme.textMain}`}>{req.student_name}</h3>
                           <div className={`flex items-center gap-2 text-sm mt-1 ${theme.textSub}`}>
                              <User size={14} /> <span>{req.student_phone || 'No Phone'}</span>
                           </div>
                        </div>
                        {activeTab === 'upcoming' && (
                           <button onClick={() => navigate(`/chat/${req.id}`)} className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold hover:bg-blue-200">
                             {t.scribeDashboard?.chatBtn || "Chat"}
                           </button>
                        )}
                     </div>
                     <RequestDetails req={req} highContrast={highContrast} />
                  </div>
                )
              ))}
            </div>
          )}

          {/* 🟢 PAGINATION CONTROLS */}
          {activeTab !== 'pending' && (page > 1 || hasMore) && (
             <div className="flex justify-center items-center gap-4 mt-8 pb-8">
               <button 
                 disabled={page === 1 || isFetching}
                 onClick={() => setPage(p => Math.max(1, p - 1))}
                 className={`px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-30 ${highContrast ? 'border-2 border-yellow-400 text-yellow-400' : 'bg-white border text-slate-700 hover:bg-slate-50'}`}
               >
                 {t.common?.previous || "Previous"}
               </button>
               
               <span className={`font-mono font-bold ${theme.textMain}`}>
                 {t.common?.page || "Page"} {page}
               </span>

               <button 
                 disabled={!hasMore || isFetching}
                 onClick={() => setPage(p => p + 1)}
                 className={`px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-30 ${highContrast ? 'border-2 border-yellow-400 text-yellow-400' : 'bg-white border text-slate-700 hover:bg-slate-50'}`}
               >
                 {t.common?.next || "Next"}
               </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper for consistent details display
const RequestDetails = ({ req, highContrast }) => {
   const iconColor = highContrast ? "text-yellow-400" : "text-primary";
   const textColor = highContrast ? "text-yellow-200" : "text-slate-600";
   
   return (
     <div className="space-y-2 mt-4 pt-4 border-t border-dashed border-gray-200">
        <div className={`flex items-center gap-3 ${textColor}`}>
           <Calendar size={16} className={iconColor} />
           <span className="font-medium">{new Date(req.exam_date || req.date).toLocaleDateString()}</span>
        </div>
        <div className={`flex items-center gap-3 ${textColor}`}>
           <Clock size={16} className={iconColor} />
           <span className="font-medium">{req.exam_time || req.time || 'TBD'}</span>
        </div>
        <div className={`flex items-center gap-3 ${textColor}`}>
           <MapPin size={16} className={iconColor} />
           <span className="capitalize">{req.city}, {req.district}</span>
        </div>
     </div>
   );
};

export default ScribeDashboard;