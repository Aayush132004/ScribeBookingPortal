import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useQuery } from '@tanstack/react-query';
import { ListFilter, Calendar, MapPin, Clock, AlertCircle, Loader2, MessageSquare, Plus, Check, Star } from 'lucide-react';
import api from '../../api/axios';
import { useAccessibility } from '../../context/AccessibilityContext';

const StudentRequests = () => {
  const [statusFilter, setStatusFilter] = useState(''); 
  const [page, setPage] = useState(1);
  const navigate = useNavigate(); 
  const { t, highContrast, language } = useAccessibility(); // Get 'language' for date formatting

  // Fetch Data
  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['student-requests', statusFilter, page],
    queryFn: async () => {
      const res = await api.get('/student/get-requests', {
        params: { status: statusFilter, page }
      });
      return res.data;
    },
    keepPreviousData: true
  });

  // --- Styles ---
  const getStatusStyle = (status) => {
    if (highContrast) return 'border-2 border-yellow-400 text-yellow-400 bg-black';
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ACCEPTED': return 'bg-green-100 text-green-700 border-green-200';
      case 'COMPLETED': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'TIMED_OUT': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const cardClass = highContrast 
    ? "bg-black border-2 border-yellow-400 text-yellow-400 shadow-none" 
    : "bg-white border border-slate-100 shadow-sm";

  const btnPrimary = highContrast
    ? "bg-yellow-400 text-black border-2 border-black font-black hover:bg-yellow-300"
    : "bg-primary text-white hover:bg-primary-dark";

  // Helper to translate status codes
  const translateStatus = (status) => {
    const key = status?.toLowerCase();
    return t.status[key] || status; 
  };

  return (
    <div className={`max-w-5xl mx-auto py-6 px-4 transition-colors duration-300`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className={`text-2xl font-bold ${highContrast ? 'text-yellow-400' : 'text-slate-900'}`}>
            {t.studentRequests.title || "My Exam Requests"}
          </h2>
          <p className={highContrast ? 'text-yellow-200' : 'text-slate-500'}>
            {t.studentRequests.subtitle || "Track your bookings"}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => navigate('/student/create-request')}
            className={`${btnPrimary} px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 shadow-sm outline-none focus:ring-4 focus:ring-yellow-500`}
          >
            <Plus size={20} /> {t.studentRequests.newRequest || "New Request"}
          </button>

          <div className={`flex items-center gap-3 p-2 rounded-xl border shadow-sm ${highContrast ? 'bg-black border-yellow-400' : 'bg-white'}`}>
            <ListFilter size={18} className={highContrast ? "text-yellow-400" : "text-slate-400 ml-2"} />
            <select 
              value={statusFilter} 
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className={`bg-transparent border-none focus:ring-0 text-sm font-semibold pr-8 cursor-pointer outline-none ${highContrast ? 'text-yellow-400' : 'text-slate-900'}`}
            >
              <option value="">{t.studentRequests.filterAll || "All Requests"}</option>
              <option value="OPEN">{t.status.open}</option>
              <option value="ACCEPTED">{t.status.accepted}</option>
              <option value="COMPLETED">{t.status.completed}</option>
              <option value="TIMED_OUT">{t.status.timed_out}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className={`animate-spin ${highContrast ? 'text-yellow-400' : 'text-primary'}`} size={40} />
        </div>
      ) : isError ? (
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 flex items-center gap-3">
          <AlertCircle /> <span>{t.common.errorLoading || "Error loading requests"}</span>
        </div>
      ) : data?.requests.length === 0 ? (
        <div className={`text-center py-20 rounded-2xl border-2 border-dashed ${highContrast ? 'bg-black border-yellow-400 text-yellow-400' : 'bg-white border-slate-300'}`}>
          <Calendar size={48} className={`mx-auto mb-4 ${highContrast ? 'text-yellow-400' : 'text-slate-300'}`} />
          <h3 className="text-lg font-bold">{t.studentRequests.noRequests || "No requests found"}</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Card List */}
          {data.requests.map((req) => (
            <div key={req.id} className={`${cardClass} p-5 rounded-2xl transition-all hover:shadow-md relative`}>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                
                {/* Left Side: Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(req.status)}`}>
                      {translateStatus(req.status)}
                    </span>
                    <span className={`text-xs font-medium ${highContrast ? 'text-yellow-200' : 'text-slate-400'}`}>
                       {new Date(req.created_at).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className={highContrast ? "text-yellow-400" : "text-primary"} />
                      <span className="font-semibold">
                        {new Date(req.exam_date).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className={highContrast ? "text-yellow-400" : "text-primary"} />
                      <span className="font-semibold">{req.exam_time || 'TBD'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm md:col-span-2 opacity-80">
                      <MapPin size={16} />
                      <span className="capitalize">{req.city}, {req.district}, {req.state}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Actions */}
                <div className={`flex items-center justify-between md:flex-col md:justify-center md:items-end border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-8 gap-4 ${highContrast ? 'border-yellow-400' : 'border-slate-100'}`}>
                  
                  {/* --- ACCEPTED Logic --- */}
                  {req.status === 'ACCEPTED' && (
                    <div className="flex flex-col items-end gap-3 w-full">
                      <div className="text-right">
                        <p className={`text-[10px] uppercase font-bold tracking-wider opacity-60`}>
                          {t.studentRequests.assignedScribe || "Assigned Scribe"}
                        </p>
                        <p className="font-bold">{req.scribe_name}</p>
                      </div>
                      <button 
                        onClick={() => navigate(`/chat/${req.id}`)}
                        className={`w-full md:w-auto px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 ${btnPrimary}`}
                      >
                        <MessageSquare size={16} /> {t.studentRequests.startChat || "Chat"}
                      </button>
                    </div>
                  )}

                  {/* --- OPEN Logic --- */}
                  {req.status === 'OPEN' && (
                    <p className={`text-sm font-medium italic ${highContrast ? 'text-yellow-300' : 'text-blue-600'}`}>
                      {t.studentRequests.awaiting || "Awaiting acceptance..."}
                    </p>
                  )}

                  {/* --- COMPLETED Logic --- */}
                  {req.status === 'COMPLETED' && (
                     <>
                      {req.is_rated ? (
                        <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                          <Check size={16} /> {t.studentRequests.feedbackSent || "Feedback Sent"}
                        </div>
                      ) : (
                        <button 
                          onClick={() => navigate(`/student/feedback/${req.id}`)}
                          className={`flex items-center gap-2 text-sm font-bold border-2 px-4 py-2 rounded-lg transition-all ${highContrast ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-900' : 'border-primary text-primary hover:bg-blue-50'}`}
                        >
                          <Star size={16} /> {t.studentRequests.feedback || "Leave Feedback"}
                        </button>
                      )}
                     </>
                  )}
                  
                </div>
              </div>
            </div>
          ))}

          {/* 🟢 PAGINATION CONTROLS */}
          <div className="flex justify-center items-center gap-4 mt-8 pb-8">
            <button 
              disabled={page === 1 || isFetching}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className={`px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${highContrast ? 'bg-black text-yellow-400 border-2 border-yellow-400' : 'bg-white border text-slate-700 hover:bg-slate-50'}`}
            >
              {t.common.previous || "Previous"}
            </button>
            
            <span className={`font-mono font-bold ${highContrast ? 'text-yellow-400' : 'text-slate-500'}`}>
               {t.common.page || "Page"} {page}
            </span>

            <button 
              disabled={!data?.has_more || isFetching}
              onClick={() => setPage(p => p + 1)}
              className={`px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${highContrast ? 'bg-black text-yellow-400 border-2 border-yellow-400' : 'bg-white border text-slate-700 hover:bg-slate-50'}`}
            >
              {t.common.next || "Next"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentRequests;