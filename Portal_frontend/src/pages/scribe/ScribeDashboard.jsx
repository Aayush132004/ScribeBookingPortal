import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  CheckCircle, 
  Calendar, 
  Star, 
  Users, 
  Clock, 
  MapPin, 
  Loader2, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import api from '../../api/axios';

const ScribeDashboard = () => {
  // Fetch Scribe Profile & Stats
  const { data: scribeData, isLoading: loadingProfile } = useQuery({
    queryKey: ['scribe-profile'],
    queryFn: async () => (await api.get('/scribe/profile')).data
  });

  // Fetch Assigned Students/Exams
  const { data: requestData, isLoading: loadingRequests } = useQuery({
    queryKey: ['scribe-assigned-requests'],
    queryFn: async () => (await api.get('/scribe/get-request')).data
  });

  if (loadingProfile || loadingRequests) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  const { profile, stats } = scribeData;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header & Stats Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Welcome, {profile.first_name}!</h2>
          <p className="text-slate-500">Manage your volunteer commitments and availability.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 px-6">
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
              <Star size={24} fill="currentColor" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Rating</p>
              <p className="text-xl font-bold">{Number(profile.avg_rating).toFixed(1)} / 5</p>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Calendar size={24} />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Next 30 Days</span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Upcoming Exams</h3>
          <p className="text-3xl font-bold text-slate-900">{stats.upcoming_exams}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <CheckCircle size={24} />
            </div>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Completed Assignments</h3>
          <p className="text-3xl font-bold text-slate-900">{stats.total_exams}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Users size={24} />
            </div>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Students Helped</h3>
          <p className="text-3xl font-bold text-slate-900">{stats.total_exams}</p>
        </div>
      </div>

      {/* Assigned Bookings List */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900">Assigned Students</h3>
          <button 
            onClick={() => window.location.href='/scribe/availability'}
            className="text-sm font-bold text-primary hover:underline"
          >
            Update Availability
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {requestData?.requests.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="mx-auto text-slate-300 mb-4" size={48} />
              <p className="text-slate-500 font-medium">No assigned students yet.</p>
              <p className="text-xs text-slate-400">Keep an eye on your email for incoming invites.</p>
            </div>
          ) : (
            requestData.requests.map((req) => (
              <div key={req.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center font-bold text-xl shrink-0">
                      {req.student_name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-slate-900">{req.student_name}</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} className="text-primary" /> 
                          {new Date(req.exam_date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} className="text-primary" /> 
                          {req.exam_time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={14} className="text-primary" /> 
                          {req.city}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <a 
                      href={`tel:${req.student_phone}`}
                      className="flex-1 md:flex-none text-center bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Call Student
                    </a>
                    // Example for ScribeDashboard.jsx
<button 
  onClick={() => navigate(`/chat/${req.id}`)}
  className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
>
  Start Chat
</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default ScribeDashboard;