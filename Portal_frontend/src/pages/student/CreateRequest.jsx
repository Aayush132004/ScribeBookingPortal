import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Loader2, CheckCircle, Send, XCircle, Clock, Star, MapPin, Award, Check, PlusCircle } from 'lucide-react';
import api from '../../api/axios';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useNavigate } from 'react-router-dom';

const CreateRequest = () => {
  const { t, highContrast } = useAccessibility();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(false); 
  
  const [examRequestId, setExamRequestId] = useState(null);
  const [availableScribes, setAvailableScribes] = useState([]);
  const [selectedScribes, setSelectedScribes] = useState([]);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [formData, setFormData] = useState({ 
    date: '', time: '', state: '', district: '', city: '', language: '' 
  });

  // --- Data Fetching ---
  const { data: metadata } = useQuery({ queryKey: ['metadata'], queryFn: async () => (await api.get('/locations/metadata')).data });
  const { data: allDistricts = [] } = useQuery({ queryKey: ['allDistricts'], queryFn: async () => (await api.get('/locations/all-districts')).data });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'state') {
      setFormData(prev => ({ ...prev, state: value, district: '' }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Helper to fetch scribes
  const fetchScribes = async (requestId, pageNum) => {
    const res = await api.get(`/student/load-scribes?examRequestId=${requestId}&page=${pageNum}`);
    return res.data;
  };

  // 1. Create Request & Get Page 1
  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create Draft
      const createRes = await api.post('/student/createRequest', formData);
      const newRequestId = createRes.data.exam_request_id;
      setExamRequestId(newRequestId);

      // Fetch Page 1
      const data = await fetchScribes(newRequestId, 1);
      
      setAvailableScribes(data.scribes);
      setHasMore(data.has_more);
      setPage(1);
      setStep(2);
    } catch (err) { 
      alert(err.response?.data?.message || t.common?.error || "Error creating request"); 
    } finally { 
      setLoading(false); 
    }
  };

  // 2. Change Page (Pagination)
  const changePage = async (newPage) => {
    setLoadingPage(true);
    try {
      const data = await fetchScribes(examRequestId, newPage);
      setAvailableScribes(data.scribes);
      setHasMore(data.has_more);
      setPage(newPage);
    } catch (err) {
      console.error("Pagination error", err);
    } finally {
      setLoadingPage(false);
    }
  };

  // 3. Send Invites
  const handleSendInvites = async () => {
    setLoading(true);
    try {
      await api.post('/student/send-request', { examRequestId, scribeIds: selectedScribes });
      setStep(3);
    } catch (err) { 
      alert(t.common?.error || "Failed to send invitations"); 
    } finally { 
      setLoading(false); 
    }
  };

  // --- Styles ---
  const bgClass = highContrast ? "bg-black text-yellow-400 border-2 border-yellow-400" : "bg-white border border-slate-100 shadow-sm";
  const inputClass = highContrast ? "bg-black border-2 border-yellow-400 text-yellow-400 [color-scheme:dark]" : "bg-white border-slate-300";
  const btnClass = highContrast ? "bg-yellow-400 text-black font-black hover:bg-yellow-300" : "bg-primary text-white hover:bg-primary-dark";
  const cardActive = highContrast ? "border-yellow-400 bg-yellow-900/40" : "border-primary bg-blue-50";

  const renderStars = (rating) => {
    const r = parseFloat(rating) || 0;
    return (
      <div className="flex items-center gap-1">
        <Star size={14} className="fill-yellow-400 text-yellow-400" />
        <span className="font-bold text-sm">{r.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className={`max-w-4xl mx-auto py-10 px-4 transition-all ${highContrast ? 'bg-black min-h-screen' : ''}`}>
      
      {/* Stepper Header */}
      <div className="flex items-center justify-between mb-12 px-2 md:px-10">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex items-center ${s !== 3 ? 'flex-1' : ''}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold border-2 ${step >= s ? btnClass : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
              {s}
            </div>
            {s !== 3 && (
              <div className={`h-1 flex-1 mx-2 ${step > s ? (highContrast ? 'bg-yellow-400' : 'bg-primary') : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Form */}
      {step === 1 && (
        <div className={`p-6 md:p-10 rounded-3xl ${bgClass}`}>
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Calendar aria-hidden="true" /> {t.request?.title || "Request a Scribe"}
          </h2>
          <form onSubmit={handleCreateRequest} className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wide">{t.request?.date || "Exam Date"}</label>
              <input type="date" name="date" required onChange={handleInputChange} className={`w-full p-4 rounded-xl outline-none focus:ring-4 focus:ring-yellow-500 ${inputClass}`} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wide">{t.request?.time || "Exam Time"}</label>
              <input type="time" name="time" required onChange={handleInputChange} className={`w-full p-4 rounded-xl outline-none focus:ring-4 focus:ring-yellow-500 ${inputClass}`} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wide">{t.request?.language || "Language"}</label>
              <select name="language" required onChange={handleInputChange} className={`w-full p-2.5 rounded-xl outline-none text-sm ${inputClass}`}>
                <option value="">Select Language</option>
                {metadata?.languages?.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wide">{t.request?.city || "City"}</label>
              <input name="city" placeholder="City" required onChange={handleInputChange} className={`w-full p-2.5 rounded-xl outline-none text-sm ${inputClass}`} />
            </div>
            
            <div className="grid grid-cols-2 gap-4 col-span-2">
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wide">{t.register?.state || "State"}</label>
                  <select name="state" required onChange={handleInputChange} value={formData.state} className={`w-full p-2.5 rounded-xl outline-none text-sm ${inputClass}`}>
                    <option value="">Select State</option>
                    {metadata?.states?.sort().map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wide">{t.register?.district || "District"}</label>
                  <select name="district" required onChange={handleInputChange} value={formData.district} className={`w-full p-2.5 rounded-xl outline-none text-sm ${inputClass} ${!formData.state ? 'opacity-50 pointer-events-none' : ''}`}>
                    <option value="">Select District</option>
                    {allDistricts
                      .filter(d => d.state === formData.state)
                      .sort((a, b) => a.district.localeCompare(b.district))
                      .map(d => (
                        <option key={`${d.state}-${d.district}`} value={d.district}>
                          {d.district.toUpperCase()}
                        </option>
                      ))}
                  </select>
                </div>
            </div>

            <button type="submit" disabled={loading} className={`md:col-span-2 py-5 rounded-2xl font-black text-lg flex justify-center items-center gap-3 shadow-lg transform transition active:scale-95 ${btnClass}`}>
              {loading ? <Loader2 className="animate-spin" /> : (t.request?.submit || "Find Scribes")}
            </button>
          </form>
        </div>
      )}
      
      {/* Step 2: Scribe Selection */}
      {step === 2 && (
         <div className={`p-6 md:p-10 rounded-3xl ${bgClass}`}>
            <h2 className="text-3xl font-bold mb-6">{t.request?.available || "Available Scribes Near You"}</h2>
            
            {availableScribes.length === 0 && !loading && !loadingPage ? (
               <div className="text-center py-10">
                   <XCircle size={64} className="mx-auto text-red-500 mb-4" />
                   <h3 className="text-xl font-bold mb-2">{t.request?.noScribesTitle || "No Request matches found for Scribe searching"}</h3>
                   <p className="opacity-70 mb-8">{t.request?.noScribesDesc || "We couldn't find any verified scribes matching your criteria in this area. Please try a different location or language."}</p>
                   <button onClick={() => setStep(1)} className={`px-6 py-3 rounded-xl font-bold ${btnClass}`}>
                     {t.common?.previous || "Back"}
                   </button>
               </div>
            ) : (
               <>
               <div className="grid gap-3">
                   {loadingPage ? (
                      <div className="flex justify-center items-center h-full min-h-[200px]">
                        <Loader2 className="animate-spin text-slate-400" size={40} />
                      </div>
                   ) : (
                      availableScribes.map(scribe => {
                        const isSelected = selectedScribes.includes(scribe.scribe_id);
                        return (
                          <div 
                            key={scribe.scribe_id} 
                            onClick={() => setSelectedScribes(prev => prev.includes(scribe.scribe_id) ? prev.filter(id => id !== scribe.scribe_id) : [...prev, scribe.scribe_id])} 
                            className={`group relative p-4 border-2 rounded-2xl transition-all duration-300 cursor-pointer flex justify-between items-center overflow-hidden
                              ${isSelected 
                                ? (highContrast ? 'border-yellow-400 bg-yellow-400/10' : 'border-blue-600 bg-blue-50 shadow-md ring-1 ring-blue-600/20') 
                                : (highContrast ? 'border-slate-800 hover:border-yellow-400/50' : 'border-slate-100 hover:border-blue-200 bg-white')
                              }`}
                          >
                              {isSelected && !highContrast && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                              )}

                              <div className="flex items-center gap-4">
                                  <div className="relative">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg uppercase transition-transform group-hover:scale-105
                                      ${isSelected 
                                        ? (highContrast ? 'bg-yellow-400 text-black' : 'bg-blue-600 text-white shadow-lg') 
                                        : (highContrast ? 'bg-slate-50 text-slate-400' : 'bg-slate-100 text-slate-600')
                                      }`}
                                    >
                                      {scribe.first_name[0]}
                                    </div>
                                    {isSelected && (
                                      <div className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white rounded-full p-0.5 shadow-lg ring-2 ring-white">
                                        <Check size={10} strokeWidth={4} />
                                      </div>
                                    )}
                                  </div>

                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className={`font-black text-lg ${isSelected ? (highContrast ? 'text-yellow-400' : 'text-blue-900') : (highContrast ? 'text-white' : 'text-slate-800')}`}>
                                        {scribe.first_name} {scribe.last_name}
                                      </span>
                                      {scribe.priority === 1 && (
                                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider flex items-center gap-1
                                          ${highContrast ? 'bg-yellow-400 text-black' : 'bg-green-100 text-green-700 border border-green-200'}`}
                                        >
                                          <MapPin size={8} /> Nearby
                                        </span>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center gap-3 mt-1">
                                       <div className="flex items-center gap-1">
                                          {renderStars(scribe.avg_rating)}
                                          <span className="text-[10px] font-bold text-slate-400 ml-1">
                                            ({scribe.total_ratings})
                                          </span>
                                       </div>
                                       <div className="h-3 w-px bg-slate-200" />
                                       <div className="flex items-center gap-1 text-slate-500 font-medium text-[10px]">
                                          <MapPin size={10} />
                                          {scribe.city}
                                       </div>
                                    </div>
                                  </div>
                              </div>

                              <div className={`flex flex-col items-center gap-1 transition-all duration-300 ${isSelected ? 'scale-100' : 'opacity-60'}`}>
                                {isSelected ? (
                                  <>
                                    <div className={`p-1.5 rounded-lg ${highContrast ? 'bg-yellow-400 text-black' : 'bg-blue-600 text-white shadow-blue-200 shadow-md'}`}>
                                      <CheckCircle size={20} />
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${highContrast ? 'text-yellow-400' : 'text-blue-600'}`}>Selected</span>
                                  </>
                                ) : (
                                  <>
                                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                      <PlusCircle size={20} />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-600 transition-colors">Select</span>
                                  </>
                                )}
                              </div>
                          </div>
                        );
                      })
                    )}
                </div>

                {/* 🟢 PAGINATION BUTTONS */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-dashed border-slate-300">
                   <button 
                     onClick={() => changePage(page - 1)}
                     disabled={page === 1 || loadingPage}
                     className={`px-4 py-2 rounded-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed ${highContrast ? 'text-yellow-400 border border-yellow-400' : 'text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                   >
                     {t.common?.previous || "Previous"}
                   </button>
                   
                   <span className="font-bold opacity-50">{t.common?.page || "Page"} {page}</span>

                   <button 
                     onClick={() => changePage(page + 1)}
                     disabled={!hasMore || loadingPage}
                     className={`px-4 py-2 rounded-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed ${highContrast ? 'text-yellow-400 border border-yellow-400' : 'text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                   >
                     {t.common?.next || "Next"}
                   </button>
                </div>

                {selectedScribes.length > 0 && (
                    <button onClick={handleSendInvites} className={`w-full mt-8 py-5 rounded-2xl font-black text-lg flex justify-center items-center gap-3 shadow-lg ${btnClass}`}>
                        {loading ? <Loader2 className="animate-spin" /> : <><Send size={20} /> {t.request?.send || "Send Invites"} ({selectedScribes.length})</>}
                    </button>
                )}
                </>
             )}
          </div>
       )}

      {/* Step 3: Success */}
      {step === 3 && (
        <div className={`p-12 rounded-3xl text-center shadow-xl ${bgClass}`}>
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 ${highContrast ? 'bg-yellow-400 text-black' : 'bg-green-100 text-green-600'}`}>
            <CheckCircle size={56} />
          </div>
          <h2 className="text-4xl font-black mb-4">{t.request?.successTitle || "Request Sent!"}</h2>
          <p className="opacity-70 mb-10 text-xl max-w-md mx-auto">{t.request?.successDesc || "Invitations have been sent. If a scribe is found, we will notify you soon."}</p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <button onClick={() => navigate('/student/dashboard')} className={`px-10 py-4 rounded-2xl font-bold border-2 ${highContrast ? 'border-yellow-400 hover:bg-yellow-900' : 'border-slate-200 hover:bg-slate-50'}`}>
              {t.nav?.dashboard || "Go to Dashboard"}
            </button>
            <button onClick={() => window.location.reload()} className={`px-10 py-4 rounded-2xl font-black shadow-lg ${btnClass}`}>
              {t.studentRequests?.newRequest || "New Request"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateRequest;