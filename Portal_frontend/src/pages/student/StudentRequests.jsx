import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useQuery } from '@tanstack/react-query';
import { ListFilter, Calendar, MapPin, Clock, AlertCircle, Loader2, MessageSquare, Plus, Check, Star, ArrowRight, XCircle, Search } from 'lucide-react';
import api from '../../api/axios';
import { useAccessibility } from '../../context/AccessibilityContext';

const StudentRequests = () => {
  const [statusFilter, setStatusFilter] = useState(''); 
  const [page, setPage] = useState(1);
  const navigate = useNavigate(); 
  const { t, highContrast, language } = useAccessibility();

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

  const translateStatus = (status) => {
    const key = status?.toLowerCase();
    return t.status[key] || status; 
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to cancel this request?")) return;
    try {
      await api.post('/student/cancel-request', { requestId });
      window.location.reload();
    } catch (err) {
      alert("Failed to cancel request");
    }
  };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary-600" size={48} /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-10">
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
            {t.studentRequests.title || "My Exam Requests"}
          </h2>
          <p className="text-gray-500 text-lg font-medium">
            {t.studentRequests.subtitle || "Manage your upcoming scribe bookings and history."}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select 
              value={statusFilter} 
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full pl-12 pr-10 py-4 rounded-[1.5rem] bg-gray-100/80 border-none font-bold text-gray-700 appearance-none focus:ring-2 focus:ring-primary-600 outline-none transition-all cursor-pointer"
            >
              <option value="">{t.studentRequests.filterAll || "All Statuses"}</option>
              <option value="OPEN">{t.status.open}</option>
              <option value="ACCEPTED">{t.status.accepted}</option>
              <option value="COMPLETED">{t.status.completed}</option>
              <option value="TIMED_OUT">{t.status.timed_out}</option>
            </select>
          </div>

          <button 
            onClick={() => navigate('/student/create-request')}
            className="px-8 py-4 bg-primary-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-primary-200 hover:shadow-primary-300 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3"
          >
            <Plus size={22} strokeWidth={3} /> {t.studentRequests.newRequest || "New Request"}
          </button>
        </div>
      </div>

      {/* Requests Content */}
      <div className="min-h-[500px]">
        {isError ? (
          <div className="bg-red-50 text-red-700 p-8 rounded-[2rem] border border-red-100 flex items-center gap-4 shadow-sm">
            <AlertCircle size={32} /> 
            <div>
               <p className="font-black text-lg">Failed to load data</p>
               <p className="opacity-80">{t.common.errorLoading || "Please check your connection and try again."}</p>
            </div>
          </div>
        ) : data?.requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-30 border-4 border-dashed border-gray-200 rounded-[3rem]">
            <Calendar size={80} strokeWidth={1} className="mb-6" />
            <h3 className="text-2xl font-black">{t.studentRequests.noRequests || "No bookings found"}</h3>
            <p className="mt-2 font-bold">Try changing the filters or create a new request.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {data.requests.map((req) => (
              <div key={req.id} className="group glass-card p-2 rounded-[2.5rem] transition-all duration-500 hover:shadow-premium-hover hover:-translate-y-1">
                <div className="bg-white rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-8">
                  
                  {/* Left: Status & Timing */}
                  <div className="flex flex-col md:flex-row items-center gap-8 w-full md:w-auto">
                    <div className={`h-24 w-24 rounded-3xl flex flex-col items-center justify-center border-2 transition-colors ${
                      req.status === 'ACCEPTED' ? 'bg-green-50 border-green-100 text-green-600' :
                      req.status === 'OPEN' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                      'bg-gray-50 border-gray-100 text-gray-500'
                    }`}>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{new Date(req.exam_date).toLocaleDateString('en-IN', { month: 'short' })}</span>
                      <span className="text-3xl font-black leading-none">{new Date(req.exam_date).getDate()}</span>
                    </div>

                    <div className="text-center md:text-left space-y-2">
                       <div className="flex items-center justify-center md:justify-start gap-3">
                          <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                             req.status === 'ACCEPTED' ? 'bg-green-100 text-green-700 border-green-200' :
                             req.status === 'OPEN' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                             'bg-gray-100 text-gray-700'
                          }`}>
                            {translateStatus(req.status)}
                          </span>
                          <span className="text-xs font-bold text-gray-400 tabular-nums">
                             ID: #{req.id.toString().slice(-4)}
                          </span>
                       </div>
                       <h3 className="text-2xl font-black text-gray-900 group-hover:text-primary-600 transition-colors">
                          {req.status === 'ACCEPTED' ? req.scribe_name : `Scribe for ${req.exam_language || 'Exam'}`}
                       </h3>
                       <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-6 gap-y-2 text-gray-500 font-bold text-sm">
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-primary-400" /> {req.exam_time || 'TBD'}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-primary-400" /> {req.city}, {req.district}
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Right: Context Actions */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-center md:items-end gap-4 w-full md:w-64">
                    
                    {req.status === 'ACCEPTED' && (
                      <div className="w-full space-y-3">
                        <div className="text-center md:text-right bg-gray-50 p-3 rounded-2xl border border-gray-100">
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{t.studentRequests.assignedScribe || "Assigned Scribe"}</p>
                          <p className="font-black text-gray-800">{req.scribe_name}</p>
                        </div>
                        <button 
                          onClick={() => navigate(`/chat/${req.id}`)}
                          className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all flex items-center justify-center gap-2 group/chat"
                        >
                          <MessageSquare size={18} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform" /> 
                          {t.studentRequests.startChat || "Open Chat"}
                        </button>
                      </div>
                    )}

                    {req.status === 'OPEN' && (
                      <div className="w-full flex flex-col items-center md:items-end gap-3">
                        <div className="flex items-center gap-2 text-primary-600 font-black text-sm animate-pulse">
                          <Loader2 size={16} className="animate-spin" /> {t.studentRequests.awaiting || "Awaiting Scribe..."}
                        </div>
                        <button 
                          onClick={() => handleCancelRequest(req.id)}
                          className="w-full md:w-auto px-6 py-3 rounded-xl border-2 border-red-100 text-red-600 font-black text-xs hover:bg-red-50 hover:border-red-200 transition-all"
                        >
                          Cancel Request
                        </button>
                      </div>
                    )}

                    {req.status === 'COMPLETED' && (
                       <div className="w-full">
                        {req.is_rated ? (
                          <div className="flex items-center justify-center gap-2 text-green-600 font-black bg-green-50 px-6 py-4 rounded-2xl border border-green-100">
                            <Check size={18} strokeWidth={3} /> {t.studentRequests.feedbackSent || "Rated"}
                          </div>
                        ) : (
                          <button 
                            onClick={() => navigate(`/student/feedback/${req.id}`)}
                            className="w-full py-4 bg-white border-2 border-primary-600 text-primary-600 rounded-2xl font-black hover:bg-primary-50 transition-all flex items-center justify-center gap-2 group/star"
                          >
                            <Star size={18} strokeWidth={2.5} className="group-hover:fill-primary-600 group-hover:scale-110 transition-all" /> 
                            {t.studentRequests.feedback || "Rate Experience"}
                          </button>
                        )}
                       </div>
                    )}
                    
                    {req.status === 'TIMED_OUT' && (
                      <div className="flex items-center gap-2 text-red-400 font-black text-sm italic">
                        <XCircle size={18} /> Request Expired
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {(page > 1 || data?.has_more) && (
           <div className="flex justify-center items-center gap-8 mt-16 pb-12">
             <button 
               disabled={page === 1 || isFetching}
               onClick={() => setPage(p => Math.max(1, p - 1))}
               className="h-14 w-14 rounded-[1.5rem] bg-white border border-gray-200 flex items-center justify-center font-black shadow-premium hover:shadow-premium-hover transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed group"
             >
                <ArrowRight size={20} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
             </button>
             
             <div className="flex flex-col items-center">
                <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{t.common?.page || "Page"}</span>
                <span className="text-2xl font-black text-primary-600 tabular-nums">{page}</span>
             </div>

             <button 
               disabled={!data?.has_more || isFetching}
               onClick={() => setPage(p => p + 1)}
               className="h-14 w-14 rounded-[1.5rem] bg-primary-600 text-white flex items-center justify-center font-black shadow-lg shadow-primary-100 hover:shadow-primary-200 transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed group"
             >
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
             </button>
           </div>
        )}
      </div>
    </div>
  );
};

export default StudentRequests;