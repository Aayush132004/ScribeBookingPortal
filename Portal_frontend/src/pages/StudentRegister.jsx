import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { User, Loader2, AlertCircle, Mail, Phone, Lock, MapPin, GraduationCap, CheckCircle, FileText, ArrowRight, ShieldCheck, Camera, UploadCloud, UserPlus, Clock } from 'lucide-react';
import api from '../api/axios';
import { uploadToCloudinary } from '../utils/uploadFile';
import { useAccessibility } from '../context/AccessibilityContext';

const StudentRegister = () => {
  const navigate = useNavigate();
  const { t, highContrast } = useAccessibility();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState({ profile: false, aadhaar: false });

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone: '', password: '',
    state: '', district: '', city: '', pincode: '',
    disability_type: '', highest_qualification: '', current_class_year: '',
    profile_image_url: '', aadhaar_card_url: ''
  });

  const { data: allDistricts = [] } = useQuery({ queryKey: ['allDistricts'], queryFn: async () => (await api.get('/locations/all-districts')).data });
  const { data: metadata } = useQuery({ queryKey: ['metadata'], queryFn: async () => (await api.get('/locations/metadata')).data });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'state') {
      setFormData(prev => ({ ...prev, state: value, district: '' }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;

    if (!emailRegex.test(formData.email)) { setError("Please enter a valid email address."); return false; }
    if (!phoneRegex.test(formData.phone)) { setError("Phone number must be exactly 10 digits."); return false; }
    if (formData.password.length < 4) { setError("Password must be at least 4 characters."); return false; }
    if (!specialCharRegex.test(formData.password)) { setError("Password must contain at least one special character."); return false; }
    if (!formData.profile_image_url || !formData.aadhaar_card_url) { setError("Please upload both required documents."); return false; }
    return true;
  };

  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(prev => ({ ...prev, [type]: true }));
    try {
      const url = await uploadToCloudinary(file, type === 'profile' ? ['image/jpeg', 'image/png'] : ['application/pdf']);
      setFormData(prev => ({ ...prev, [type === 'profile' ? 'profile_image_url' : 'aadhaar_card_url']: url }));
    } catch (err) { setError(err.message); } 
    finally { setUploading(prev => ({ ...prev, [type]: false })); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/studentRegister', formData);
      navigate('/login');
    } catch (err) {
      if (err.response?.status === 409) setError("Email or Phone already registered.");
      else setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen pb-20 ${highContrast ? 'bg-black' : 'bg-gray-50'}`}>
      
      {/* Premium Banner */}
      <div className="h-48 md:h-64 bg-primary-900 relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-900"></div>
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary-400/20 blur-[100px] rounded-full"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-24 relative z-10">
        <div className={`rounded-[3rem] p-8 md:p-12 border ${highContrast ? 'bg-black border-yellow-400 text-yellow-400' : 'bg-white shadow-2xl border-white'}`}>
          
          <div className="text-center mb-12">
            <div className={`mx-auto h-20 w-20 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-xl ${highContrast ? 'bg-yellow-400 text-black' : 'bg-primary-600 text-white'}`}>
               <UserPlus size={40} />
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2">{t.register.title}</h2>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Create your secure student account</p>
          </div>

          {error && (
            <div className="mb-8 p-5 bg-red-50 rounded-[1.5rem] border border-red-100 text-red-600 flex items-center gap-4 animate-in slide-in-from-top-4 duration-300">
              <div className="p-2 bg-white rounded-xl shadow-sm"><AlertCircle size={24}/></div>
              <span className="font-black text-sm uppercase tracking-tight">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-12">
            
            {/* 1. Profile Photo */}
            <div className="flex flex-col items-center gap-4">
               <div className={`relative h-32 w-32 rounded-[2rem] p-1 border-2 border-dashed flex items-center justify-center transition-all overflow-hidden ${formData.profile_image_url ? 'border-green-500' : 'border-gray-200'}`}>
                  {formData.profile_image_url ? (
                    <img src={formData.profile_image_url} className="h-full w-full object-cover rounded-[1.8rem]" alt="Profile" />
                  ) : (
                    <Camera className="text-gray-200" size={48} />
                  )}
                  {uploading.profile && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                       <Loader2 className="animate-spin text-primary-600" />
                    </div>
                  )}
               </div>
               <label className="cursor-pointer px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                  {formData.profile_image_url ? 'Change Photo' : 'Upload Photo'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'profile')} />
               </label>
            </div>

            {/* Section: Personal */}
            <section className="space-y-6">
              <SectionTitle icon={ShieldCheck} title={t.register.personalInfo} />
              <div className="grid md:grid-cols-2 gap-6">
                <PremiumInput name="first_name" label={t.register.firstName} icon={User} onChange={handleChange} required />
                <PremiumInput name="last_name" label={t.register.lastName} icon={User} onChange={handleChange} />
                <PremiumInput name="email" label={t.register.email} icon={Mail} type="email" onChange={handleChange} required />
                <PremiumInput name="phone" label={t.register.phone} icon={Phone} onChange={handleChange} required />
                <div className="md:col-span-2">
                  <PremiumInput name="password" label={t.register.password} icon={Lock} type="password" onChange={handleChange} required />
                </div>
              </div>
            </section>

            {/* Section: Location */}
            <section className="space-y-6">
              <SectionTitle icon={MapPin} title={t.register.location} />
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">{t.register.state}</label>
                  <select name="state" required onChange={handleChange} value={formData.state} className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-none font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary-600 transition-all appearance-none uppercase">
                    <option value="">{t.register.state}</option>
                    {metadata?.states?.sort().map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">{t.register.district}</label>
                  <select name="district" required onChange={handleChange} value={formData.district} disabled={!formData.state} className={`w-full h-14 px-6 rounded-2xl bg-gray-50 border-none font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary-600 transition-all appearance-none uppercase ${!formData.state ? 'opacity-30' : ''}`}>
                    <option value="">{t.register.district}</option>
                    {allDistricts.filter(d => d.state === formData.state).sort((a, b) => a.district.localeCompare(b.district)).map(d => <option key={d.district} value={d.district}>{d.district}</option>)}
                  </select>
                </div>
                <PremiumInput name="city" label={t.register.city} icon={MapPin} onChange={handleChange} required />
                <PremiumInput name="pincode" label={t.register.pincode} icon={MapPin} onChange={handleChange} required />
              </div>
            </section>

            {/* Section: Academic */}
            <section className="space-y-6">
              <SectionTitle icon={GraduationCap} title={t.register.academic} />
              <div className="grid md:grid-cols-2 gap-6">
                <PremiumInput name="disability_type" label={t.register.disabilityType} icon={AlertCircle} onChange={handleChange} required />
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">{t.register.qualification}</label>
                  <select name="highest_qualification" required onChange={handleChange} className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-none font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary-600 transition-all appearance-none">
                    <option value="">{t.register.qualification}</option>
                    {metadata?.qualifications?.map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                   <PremiumInput name="current_class_year" label={t.register.classYear} icon={Clock} onChange={handleChange} required />
                </div>
              </div>
            </section>

            {/* Section: Aadhaar Upload */}
            <section className="space-y-6">
              <SectionTitle icon={FileText} title={t.register.docs} />
              <div className={`p-8 rounded-[2rem] border-2 border-dashed flex flex-col items-center transition-all ${formData.aadhaar_card_url ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100 hover:border-primary-300'}`}>
                 {uploading.aadhaar ? (
                   <Loader2 className="animate-spin text-primary-600 mb-2" size={32} />
                 ) : formData.aadhaar_card_url ? (
                   <div className="flex flex-col items-center">
                      <div className="p-3 bg-green-500 text-white rounded-2xl shadow-lg mb-4 animate-in zoom-in-50"><CheckCircle size={32}/></div>
                      <p className="text-sm font-black text-green-700 uppercase tracking-widest">{t.register.uploaded}!</p>
                   </div>
                 ) : (
                   <div className="text-center">
                      <UploadCloud className="mx-auto text-gray-300 mb-4" size={48} />
                      <p className="text-sm font-bold text-gray-500 mb-4">{t.register.aadhaar}</p>
                      <label className="cursor-pointer px-8 py-3 bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-100 hover:bg-primary-700 transition-all">
                        Choose PDF File
                        <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleFileChange(e, 'aadhaar')} />
                      </label>
                   </div>
                 )}
              </div>
            </section>

            <button 
              type="submit" 
              disabled={loading || uploading.profile || uploading.aadhaar} 
              className={`w-full py-6 rounded-[2rem] font-black text-xl shadow-2xl transition-all active:scale-95 flex justify-center items-center gap-3 disabled:opacity-50 ${highContrast ? 'bg-yellow-400 text-black' : 'bg-primary-600 text-white shadow-primary-200 hover:bg-primary-700 hover:shadow-primary-300'}`}
            >
              {loading ? <Loader2 className="animate-spin" /> : <>{t.register.submit} <ArrowRight /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const SectionTitle = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
    <Icon className="text-primary-600" size={20} strokeWidth={2.5} />
    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900">{title}</h3>
  </div>
);

const PremiumInput = ({ name, label, icon: Icon, type = "text", onChange, required }) => (
  <div className="space-y-2 group">
    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 group-focus-within:text-primary-600 transition-colors">{label}</label>
    <div className="relative">
      <Icon className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-400 transition-colors" size={20} />
      <input 
        name={name}
        type={type}
        placeholder={`Your ${label}`}
        required={required}
        onChange={onChange}
        className="w-full h-14 pl-14 pr-6 rounded-2xl bg-gray-50 border-none font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary-600 transition-all placeholder:text-gray-300 placeholder:font-medium"
      />
    </div>
  </div>
);

export default StudentRegister;