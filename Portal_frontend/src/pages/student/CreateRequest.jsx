import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, MapPin, Languages, Loader2, CheckCircle, Send } from 'lucide-react';
import api from '../../api/axios';

const CreateRequest = () => {
  const [step, setStep] = useState(1); // 1: Form, 2: Scribe Selection
  const [loading, setLoading] = useState(false);
  const [examRequestId, setExamRequestId] = useState(null);
  const [availableScribes, setAvailableScribes] = useState([]);
  const [selectedScribes, setSelectedScribes] = useState([]);
  
  const [formData, setFormData] = useState({
    date: '', time: '', state: '', district: '', city: '', language: ''
  });

  // Fetch Metadata for Languages
  const { data: metadata } = useQuery({
    queryKey: ['metadata'],
    queryFn: async () => (await api.get('/locations/metadata')).data
  });

  const { data: states = [] } = useQuery({
    queryKey: ['states'],
    queryFn: async () => (await api.get('/locations/states')).data
  });

  const { data: districts = [] } = useQuery({
    queryKey: ['districts', formData.state],
    queryFn: async () => (await api.get(`/locations/districts/${formData.state}`)).data,
    enabled: !!formData.state
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Matches student.controller.js -> createExamRequest
      const res = await api.post('/student/createRequest', formData);
      setExamRequestId(res.data.exam_request_id);
      setAvailableScribes(res.data.scribes);
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create request");
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvites = async () => {
    if (selectedScribes.length === 0) return alert("Select at least one scribe");
    setLoading(true);
    try {
      // Matches student.controller.js -> sendRequestToScribes
      await api.post('/student/send-request', {
        examRequestId,
        scribeIds: selectedScribes
      });
      alert("Invites sent successfully!");
      setStep(3);
    } catch (err) {
      alert("Failed to send invites");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Stepper */}
      <div className="flex items-center justify-between mb-8 px-10">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex items-center ${s !== 3 ? 'flex-1' : ''}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= s ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>
              {s}
            </div>
            {s !== 3 && <div className={`h-1 flex-1 mx-2 ${step > s ? 'bg-primary' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Calendar className="text-primary" /> Exam Details</h2>
          <form onSubmit={handleCreateRequest} className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Exam Date</label>
              <input type="date" name="date" required onChange={handleInputChange} className="w-full p-3 border rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Exam Time</label>
              <input type="time" name="time" required onChange={handleInputChange} className="w-full p-3 border rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Language Required</label>
              <select name="language" required onChange={handleInputChange} className="w-full p-3 border rounded-xl uppercase">
                <option value="">Select Language</option>
                {metadata?.languages?.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">City</label>
              <input name="city" placeholder="Exam Center City" required onChange={handleInputChange} className="w-full p-3 border rounded-xl" />
            </div>
            <button type="submit" disabled={loading} className="md:col-span-2 bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary-dark transition-all flex justify-center items-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : 'Find Scribes'}
            </button>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border">
          <h2 className="text-2xl font-bold mb-2">Available Scribes</h2>
          <p className="text-slate-500 mb-6">We found these scribes in your district. Select those you want to invite.</p>
          
          <div className="space-y-4 mb-8">
            {availableScribes.map(scribe => (
              <div 
                key={scribe.scribe_id}
                onClick={() => setSelectedScribes(prev => prev.includes(scribe.scribe_id) ? prev.filter(id => id !== scribe.scribe_id) : [...prev, scribe.scribe_id])}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all flex items-center justify-between ${selectedScribes.includes(scribe.scribe_id) ? 'border-primary bg-blue-50' : 'border-slate-100 hover:border-primary'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600">
                    {scribe.first_name[0]}{scribe.last_name?.[0]}
                  </div>
                  <div>
                    <h4 className="font-bold">{scribe.first_name} {scribe.last_name}</h4>
                    <p className="text-xs text-slate-500 uppercase">Verified Volunteer</p>
                  </div>
                </div>
                {selectedScribes.includes(scribe.scribe_id) && <CheckCircle className="text-primary" />}
              </div>
            ))}
          </div>

          <button onClick={handleSendInvites} disabled={loading || selectedScribes.length === 0} className="w-full bg-primary text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Send Invitations</>}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="text-center bg-white p-12 rounded-2xl shadow-sm border">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-bold mb-4">Request Sent!</h2>
          <p className="text-slate-600 mb-8">Invitations have been sent to the selected scribes via email. You will be notified once someone accepts.</p>
          <button onClick={() => window.location.href='/student/dashboard'} className="text-primary font-bold underline">Go to My Requests</button>
        </div>
      )}
    </div>
  );
};

export default CreateRequest;