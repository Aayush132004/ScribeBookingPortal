import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { uploadToCloudinary } from '../utils/uploadFile';
import { 
  User, Mail, MapPin, Calendar, BookOpen, 
  FileText, Star, CheckCircle, Clock, 
  Shield, Award, Phone, X, ExternalLink, GraduationCap,
  Pencil, Trash2, Camera, ShieldCheck, Globe,
  Loader2, AlertTriangle
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

import { useToast } from '../context/ToastContext';

const Profile = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const { t, highContrast } = useAccessibility();
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({ total_exams: 0, upcoming_exams: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isImageOpen, setIsImageOpen] = useState(false);

  const [allDistricts, setAllDistricts] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        setLoading(true);
        setError('');
        
        // Admin Profile Logic
        if (user.role === 'ADMIN') {
          setProfileData({
            first_name: user.first_name || 'Admin',
            last_name: user.last_name || '',
            email: user.email,
            phone: 'N/A',
            role: 'ADMIN',
            city: 'Main',
            state: 'Portal',
            joined_at: new Date()
          });
          setLoading(false);
          return;
        }

        const endpoint = user.role === 'STUDENT' ? '/student/profile' : '/scribe/profile';
        const response = await api.get(endpoint);
        if (response.data) {
          setProfileData(response.data.profile);
          setStats(response.data.stats || { total_exams: 0, upcoming_exams: 0 });
          setEditFormData(response.data.profile);
        }
        
        try {
          const distRes = await api.get('/locations/all-districts');
          setAllDistricts(distRes.data);
        } catch (lErr) { console.warn("Locations failed", lErr); }
        
      } catch (err) {
        console.error("Profile load error:", err);
        setError('Unable to load profile information.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setLoading(true);
      const url = await uploadToCloudinary(file, ['image/jpeg', 'image/png']);
      
      // Update backend
      const endpoint = user.role === 'STUDENT' ? '/student/profile' : '/scribe/profile';
      await api.put(endpoint, { ...profileData, profile_image_url: url });
      
      // Update local state
      setProfileData(prev => ({ ...prev, profile_image_url: url }));
      addToast("Profile image updated!", 'success');
    } catch (err) {
      console.error(err);
      addToast("Failed to upload image", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const endpoint = user.role === 'STUDENT' ? '/student/profile' : '/scribe/profile';
      await api.put(endpoint, editFormData);
      window.location.reload();
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm(t.profile.confirmDelete)) return;
    try {
      const endpoint = user.role === 'STUDENT' ? '/student/profile' : '/scribe/profile';
      await api.delete(endpoint);
      logout();
      window.location.href = '/';
    } catch (err) {
      alert("Failed to delete account");
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!profileData) return null;

  const isScribe = user.role === 'SCRIBE';

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-8 animate-in fade-in duration-700">
      <div className="relative px-4 md:px-12 pb-12 pt-8">
        <div className="glass-card rounded-[3rem] p-8 md:p-12 border border-white/20">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            
            <div className="relative group">
              <div className="relative h-32 w-32 md:h-44 md:w-44 rounded-[2.5rem] p-1.5 bg-white shadow-2xl group border border-gray-100 overflow-hidden">
                {profileData.profile_image_url ? (
                  <img 
                    src={profileData.profile_image_url} 
                    alt="Profile" 
                    className="h-full w-full object-cover rounded-[2.2rem] transition-transform duration-500 group-hover:scale-110 cursor-zoom-in" 
                    onClick={() => setIsImageOpen(true)}
                  />
                ) : (
                  <div className="h-full w-full bg-primary-600 flex items-center justify-center text-white text-5xl font-black rounded-[2.2rem]">
                    {profileData.first_name?.[0]}
                  </div>
                )}
                <label className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer">
                  <Camera size={32} className="text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-3">
               <div className="flex flex-col md:flex-row items-center gap-4">
                  <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 capitalize">
                    {profileData.first_name} {profileData.last_name}
                  </h1>
                  {isScribe && profileData.is_verified === 1 && (
                    <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-4 py-1.5 rounded-full border border-green-100 text-xs font-black uppercase tracking-widest">
                       <ShieldCheck size={16} strokeWidth={3} /> {t.profile.verifiedBadge}
                    </div>
                  )}
               </div>
               
               <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm font-bold text-gray-500 uppercase tracking-widest">
                  <div className="flex items-center gap-2"><Mail size={16} className="text-primary-400" /> {profileData.email}</div>
                  <div className="flex items-center gap-2"><Phone size={16} className="text-primary-400" /> {profileData.phone}</div>
                  <div className="flex items-center gap-2"><Globe size={16} className="text-primary-400" /> {profileData.city}, {profileData.state}</div>
               </div>
            </div>

            {/* Desktop Stats */}
            <div className="hidden xl:flex items-center gap-12 bg-gray-50/80 p-8 rounded-[2.5rem] border border-gray-100">
               <div className="text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{isScribe ? 'Impact' : 'Success'}</p>
                  <p className="text-3xl font-black text-gray-900 tabular-nums">{stats.total_exams}</p>
               </div>
               <div className="w-px h-10 bg-gray-200"></div>
               {isScribe && (
                 <div className="text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Rating</p>
                    <div className="flex items-center gap-2 text-3xl font-black text-yellow-500">
                       {parseFloat(profileData.avg_rating || 0).toFixed(1)} <Star size={24} fill="currentColor" />
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
           
           <div className="lg:col-span-2 space-y-10">
              {/* Personal Details */}
              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-premium border border-gray-100">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-2xl font-black flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-primary-50 text-primary-600"><User size={24} /></div>
                    {t.profile.personal}
                  </h2>
                  <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center gap-2 text-primary-600 font-black text-sm hover:underline"
                  >
                    <Pencil size={16} /> {t.profile.edit}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  <DetailItem label={t.profile.fullIdentity} value={`${profileData.first_name} ${profileData.last_name}`} />
                  <DetailItem 
                     label={t.profile.memberSince} 
                     value={profileData.joined_at || profileData.created_at ? new Date(profileData.joined_at || profileData.created_at).toLocaleDateString(user.language === 'hi' ? 'hi-IN' : 'en-IN', { month: 'long', year: 'numeric' }) : 'N/A'} 
                   />
                  <DetailItem label={t.profile.region} value={`${profileData.city}, ${profileData.district}`} />
                  <DetailItem label={t.profile.fullAddress} value={`${profileData.state}, India - ${profileData.pincode}`} />
                </div>

                <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
                   <div className="text-xs font-bold text-gray-400 max-w-xs">
                     {t.profile.securityDesc}
                   </div>
                   <button 
                    onClick={handleDeleteAccount}
                    className="px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-black text-sm hover:bg-red-100 transition-all flex items-center gap-2"
                   >
                     <Trash2 size={18} /> {t.profile.delete}
                   </button>
                </div>
              </div>

              {/* Academic Details */}
              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-premium border border-gray-100">
                <h2 className="text-2xl font-black flex items-center gap-4 mb-10">
                  <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600"><GraduationCap size={24} /></div>
                  {t.profile.academic}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <DetailItem label="Qualification" value={profileData.highest_qualification} />
                   {!isScribe ? (
                      <>
                        <DetailItem label="Academic Year" value={profileData.current_class_year} />
                        <DetailItem label="Disability Profile" value={profileData.disability_type} isSpecial />
                      </>
                   ) : (
                      <DetailItem 
                        label={t.profile.verification} 
                        value={profileData.is_verified ? t.profile.verified : t.profile.pending} 
                        isSpecial={!!profileData.is_verified}
                      />
                   )}
                </div>
              </div>
           </div>

           {/* Documents Column */}
           <div className="space-y-10">
              <div className="bg-white rounded-[2.5rem] p-8 shadow-premium border border-gray-100">
                <h2 className="text-xl font-black flex items-center gap-3 mb-8">
                  <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600"><FileText size={20} /></div>
                  {t.profile.documents}
                </h2>
                
                <div className="space-y-4">
                  <DocBox 
                    title={t.profile.aadhaarCard} 
                    url={profileData.aadhaar_card_url} 
                    icon={Shield} 
                    color="text-red-600" 
                    bg="bg-red-50" 
                  />
                  {isScribe && (
                    <DocBox 
                      title={t.profile.qualificationCert} 
                      url={profileData.qualification_doc_url} 
                      icon={Award} 
                      color="text-blue-600" 
                      bg="bg-blue-50" 
                    />
                  )}
                  {!profileData.aadhaar_card_url && (!isScribe || !profileData.qualification_doc_url) && (
                    <div className="py-10 text-center opacity-40 italic text-sm">{t.profile.noDocs}</div>
                  )}
                </div>
              </div>

              {/* Secure Profile Card */}
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/20 blur-3xl"></div>
                 <ShieldCheck className="text-primary-400 mb-6" size={48} strokeWidth={1} />
                 <h3 className="text-xl font-black mb-2">{t.profile.secAccount}</h3>
                 <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                   {t.profile.secDesc}
                 </p>
              </div>
           </div>

        </div>
      </div>

      {/* Edit Modal (Overhaul) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-full animate-in zoom-in-95 duration-300">
             <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-3xl font-black">{t.profile.edit}</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="h-12 w-12 rounded-2xl hover:bg-gray-100 flex items-center justify-center transition-all"><X size={24} /></button>
             </div>
             
             <form onSubmit={handleUpdateProfile} className="flex-1 overflow-y-auto p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <InputBox label="First Name" value={editFormData.first_name} onChange={(v) => setEditFormData({...editFormData, first_name: v})} />
                   <InputBox label="Last Name" value={editFormData.last_name} onChange={(v) => setEditFormData({...editFormData, last_name: v})} />
                   <InputBox label="Phone Number" value={editFormData.phone} onChange={(v) => setEditFormData({...editFormData, phone: v})} />
                   <InputBox label="City" value={editFormData.city} onChange={(v) => setEditFormData({...editFormData, city: v})} />
                   
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">State</label>
                     <select 
                       className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-none font-bold outline-none focus:ring-2 focus:ring-primary-600 transition-all appearance-none"
                       value={editFormData.state || ''}
                       onChange={(e) => setEditFormData({...editFormData, state: e.target.value, district: ''})}
                     >
                       <option value="">Select State</option>
                       {allDistricts.map(d => d.state).filter((v, i, a) => a.indexOf(v) === i).sort().map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                   </div>

                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">District</label>
                     <select 
                       className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-none font-bold outline-none focus:ring-2 focus:ring-primary-600 transition-all appearance-none"
                       value={editFormData.district || ''}
                       disabled={!editFormData.state}
                       onChange={(e) => setEditFormData({...editFormData, district: e.target.value})}
                     >
                       <option value="">Select District</option>
                       {allDistricts.filter(d => d.state === editFormData.state).sort((a,b) => a.district.localeCompare(b.district)).map(d => <option key={d.district} value={d.district}>{d.district}</option>)}
                     </select>
                   </div>
                </div>

                <div className="flex gap-4 pt-6">
                   <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 h-14 rounded-2xl font-black text-gray-500 hover:bg-gray-50 transition-all">{t.profile.cancel}</button>
                   <button type="submit" className="flex-1 h-14 bg-primary-600 text-white rounded-2xl font-black shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all">{t.profile.save}</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Full Image Modal Overlay */}
      {isImageOpen && (
        <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8" onClick={() => setIsImageOpen(false)}>
           <img src={profileData.profile_image_url} className="max-w-full max-h-full rounded-3xl shadow-2xl animate-in zoom-in-95 duration-500" alt="Full" />
           <button className="absolute top-8 right-8 text-white h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"><X size={32}/></button>
        </div>
      )}
    </div>
  );
};

const DetailItem = ({ label, value, isSpecial }) => (
  <div className="group">
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-hover:text-primary-600 transition-colors">{label}</p>
    <p className={`text-lg font-black ${isSpecial ? 'text-primary-600' : 'text-gray-900'}`}>
      {value || <span className="opacity-20">N/A</span>}
    </p>
  </div>
);

const DocBox = ({ title, url, icon: Icon, color, bg }) => (
  <div className="flex items-center justify-between p-5 rounded-3xl bg-gray-50 border border-gray-100 group hover:border-primary-100 hover:shadow-sm transition-all">
    <div className="flex items-center gap-4">
       <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${bg} ${color}`}><Icon size={22} /></div>
       <div>
         <p className="font-black text-gray-900 text-sm">{title}</p>
         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{url ? 'Verified' : 'Missing'}</p>
       </div>
    </div>
    {url && (
      <a href={url} target="_blank" rel="noreferrer" className="h-10 w-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-primary-600 transition-colors">
        <ExternalLink size={18} />
      </a>
    )}
  </div>
);

const InputBox = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">{label}</label>
    <input 
      className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-none font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary-600 transition-all placeholder:text-gray-300"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`Enter ${label}`}
    />
  </div>
);

const LoadingState = () => {
  const { t } = useAccessibility();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-6">
      <Loader2 className="animate-spin text-primary-600" size={64} strokeWidth={3} />
      <p className="font-black text-gray-400 uppercase tracking-widest text-sm animate-pulse">{t.profile.buildingProfile}</p>
    </div>
  );
};

const ErrorState = ({ message }) => {
  const { t } = useAccessibility();
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center p-12 glass-card rounded-[3rem] border border-red-100">
         <AlertTriangle size={64} className="mx-auto text-red-500 mb-6" />
         <h3 className="text-2xl font-black mb-2">{t.profile.somethingWrong}</h3>
         <p className="text-gray-500 font-medium mb-8">{message}</p>
         <button onClick={() => window.location.reload()} className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-black">{t.profile.tryAgain}</button>
      </div>
    </div>
  );
};

export default Profile;