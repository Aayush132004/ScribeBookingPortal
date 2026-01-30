import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader2, BookOpen } from 'lucide-react';
import api from '../../api/axios';

const AcceptRequest = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    const processAcceptance = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid or missing acceptance token.');
        return;
      }

      try {
        // Matches scribe.controller.js -> acceptExamRequest
        const response = await api.post('/scribe/acceptRequest', { token });
        setStatus('success');
        setMessage(response.data.message || 'Exam accepted successfully!');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Failed to accept the request. It may have expired or been taken by another scribe.');
      }
    };

    processAcceptance();
  }, [token]);

  return (
    <>
     <Navbar/>
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center">
            <BookOpen size={32} />
          </div>
        </div>

        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="animate-spin mx-auto text-primary" size={40} />
            <h2 className="text-xl font-bold text-slate-900">Processing Acceptance...</h2>
            <p className="text-slate-500 text-sm">Please wait while we confirm your booking and update your schedule.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={28} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Confirmed!</h2>
            <p className="text-slate-600">{message}</p>
            <div className="pt-6">
              <button 
                onClick={() => navigate('/scribe/dashboard')}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-all"
              >
                View My Dashboard
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={28} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Acceptance Failed</h2>
            <p className="text-slate-600 text-sm">{message}</p>
            <div className="pt-6 space-y-3">
              <button 
                onClick={() => navigate('/scribe/dashboard')}
                className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default AcceptRequest;