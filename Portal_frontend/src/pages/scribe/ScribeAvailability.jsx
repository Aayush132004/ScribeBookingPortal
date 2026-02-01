import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar as CalendarIcon, X, Plus, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../api/axios';
import { useAccessibility } from '../../context/AccessibilityContext';

const ScribeAvailability = () => {
  const queryClient = useQueryClient();
  const { t, highContrast } = useAccessibility();
  const [selectedDate, setSelectedDate] = useState('');
  const [reason, setReason] = useState('PERSONAL'); // Matches ENUM

  const { data, isLoading } = useQuery({
    queryKey: ['scribe-unavailability'],
    queryFn: async () => (await api.get('/scribe/get-unavailability')).data
  });

  const mutation = useMutation({
    mutationFn: async (newData) => await api.post('/scribe/set-unavailability', newData),
    onSuccess: () => {
      queryClient.invalidateQueries(['scribe-unavailability']);
      setSelectedDate('');
    },
    onError: (err) => alert(err.response?.data?.message || "Failed to save")
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!selectedDate) return;
    mutation.mutate({ date: selectedDate, reason }); // Sends valid ENUM string
  };

  // Contrast Styles
  const theme = {
    pageBg: highContrast ? 'bg-black min-h-screen' : 'bg-transparent',
    textMain: highContrast ? 'text-yellow-400' : 'text-slate-900',
    textSub: highContrast ? 'text-yellow-200' : 'text-slate-500',
    card: highContrast ? 'bg-black border-2 border-yellow-400 shadow-none' : 'bg-white border border-slate-100 shadow-sm',
    input: highContrast ? 'bg-black border-2 border-yellow-400 text-yellow-400 [color-scheme:dark]' : 'bg-white border-slate-200 text-slate-900',
    btnPrimary: highContrast ? 'bg-yellow-400 text-black font-black border-2 border-black hover:bg-yellow-300' : 'bg-primary text-white hover:bg-primary-dark',
  };

  return (
    <div className={`max-w-4xl mx-auto py-8 px-4 transition-colors duration-300 ${theme.pageBg}`}>
      <h2 className={`text-3xl font-bold mb-2 ${theme.textMain}`}>{t.availability?.title}</h2>
      <p className={`mb-8 ${theme.textSub}`}>{t.availability?.subtitle}</p>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className={`p-6 rounded-2xl ${theme.card}`}>
            <h3 className={`font-bold mb-6 flex items-center gap-2 ${theme.textMain}`}>
              <Plus size={18} className={highContrast ? "text-yellow-400" : "text-primary"} /> 
              {t.availability?.markBusy}
            </h3>
            <form onSubmit={handleAdd} className="space-y-6">
              <div>
                <label className={`text-xs font-bold uppercase mb-1 block ${theme.textSub}`}>{t.availability?.selectDate}</label>
                <input 
                  type="date" 
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={`w-full p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-yellow-500 ${theme.input}`}
                />
              </div>
              <div>
                <label className={`text-xs font-bold uppercase mb-1 block ${theme.textSub}`}>{t.availability?.reason}</label>
                <select 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className={`w-full p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-yellow-500 ${theme.input}`}
                >
                  {/* Values mapped exactly to your SQL ENUM */}
                  <option value="PERSONAL">{t.availability?.personalReason || "Personal / Busy"}</option>
                  <option value="EXAM_BOOKED">{t.availability?.examBooked || "Exam Booked"}</option>
                </select>
              </div>
              <button 
                type="submit" 
                disabled={mutation.isLoading}
                className={`w-full py-4 rounded-xl font-bold text-sm flex justify-center items-center gap-2 ${theme.btnPrimary}`}
              >
                {mutation.isLoading ? <Loader2 className="animate-spin" size={16} /> : t.availability?.saveBtn}
              </button>
            </form>
          </div>
        </div>

        {/* List Section */}
        <div className="md:col-span-2">
          <div className={`rounded-2xl overflow-hidden ${theme.card}`}>
            <div className={`p-4 ${highContrast ? 'bg-gray-900' : 'bg-slate-50'} border-b ${highContrast ? 'border-yellow-400' : 'border-slate-100'}`}>
              <h3 className={`font-bold text-sm ${theme.textMain}`}>{t.availability?.listTitle}</h3>
            </div>
            
            {isLoading ? (
              <div className="p-20 flex justify-center"><Loader2 className={`animate-spin ${theme.textMain}`} /></div>
            ) : data?.unavailability.length === 0 ? (
              <div className="p-20 text-center">
                <CalendarIcon className={`mx-auto mb-4 opacity-20 ${theme.textMain}`} size={48} />
                <p className={`text-sm font-medium ${theme.textSub}`}>{t.availability?.noDates}</p>
              </div>
            ) : (
              <div className={`divide-y ${highContrast ? 'divide-yellow-900' : 'divide-slate-50'}`}>
                {data.unavailability.map((item, index) => (
                  <div key={index} className="p-5 flex justify-between items-center group transition-colors hover:bg-white/5">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xs flex-col border-2 
                        ${highContrast ? 'bg-black border-yellow-400 text-yellow-400' : 'bg-red-50 text-red-600 border-red-100'}`}>
                        <span className="text-lg">{new Date(item.date).getDate()}</span>
                        <span className="text-[10px] uppercase font-black">{new Date(item.date).toLocaleString('default', { month: 'short' })}</span>
                      </div>
                      <div>
                        <p className={`font-bold text-base ${theme.textMain}`}>{new Date(item.date).toLocaleDateString()}</p>
                        <p className={`text-xs uppercase tracking-widest font-bold ${highContrast ? 'text-yellow-500' : 'text-slate-400'}`}>
                          {item.reason}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScribeAvailability;