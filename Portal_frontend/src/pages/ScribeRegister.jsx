import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { User, Loader2, AlertCircle, Mail, Phone, Lock, MapPin, GraduationCap, CheckCircle, FileText, ArrowRight, ShieldCheck, Camera, UploadCloud, Briefcase, UserPlus } from 'lucide-react';
import api from '../api/axios';
import { uploadToCloudinary } from '../utils/uploadFile';
import { useAccessibility } from '../context/AccessibilityContext';

const ScribeRegister = () => {
  const navigate = useNavigate();
  const { t, highContrast } = useAccessibility();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState({ profile: false, aadhaar: false, qualification: false });

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone: '', password: '',
    state: '', district: '', city: '', pincode: '',
    highest_qualification: '',
    profile_image_url: '', aadhaar_card_url: '', qualification_doc_url: ''
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

    if (!emailRegex.test(formData.email)) { setError(t.validation.invalidEmail); return false; }
    if (!phoneRegex.test(formData.phone)) { setError(t.validation.invalidPhone); return false; }
    if (formData.password.length < 4) { setError(t.validation.passShort); return false; }
    if (!specialCharRegex.test(formData.password)) { setError(t.validation.passSpecial); return false; }
    if (!formData.profile_image_url || !formData.aadhaar_card_url || !formData.qualification_doc_url) {
      setError(t.errors.uploadFiles); return false;
    }
    return true;
  };

  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(prev => ({ ...prev, [type]: true }));
    try {
      const url = await uploadToCloudinary(file, type === 'profile' ? ['image/jpeg', 'image/png'] : ['application/pdf']);
      setFormData(prev => ({ ...prev, [type === 'profile' ? 'profile_image_url' : type === 'aadhaar' ? 'aadhaar_card_url' : 'qualification_doc_url']: url }));
    } catch (err) { setError(err.message); } 
    finally { setUploading(prev => ({ ...prev, [type]: false })); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/scribeRegister', formData);
      navigate('/login');
    } catch (err) {
      if (err.response?.status === 409) setError(t.errors.conflict);
      else setError(err.response?.data?.message || t.common.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen pb-20 ${highContrast ? 'bg-black' : 'bg-gray-50'}`}>
      
      <div className="h-48 md:h-64 bg-indigo-900 relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-indigo-900 to-primary-900"></div>
         <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-400/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-24 relative z-10">
        <div className={`rounded-[3rem] p-8 md:p-12 border transition-all duration-500 ${highContrast ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-2xl backdrop-blur-xl' : 'bg-white shadow-2xl border-white'}`}>
          
          <div className="text-center mb-12">
            <div className={`mx-auto h-20 w-20 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-xl ${highContrast ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white'}`}>
               <Briefcase size={40} />
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2">{t.scribeRegister.title}</h2>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">{t.scribeRegister.subtitle}</p>
          </div>

          {error && (
            <div className="mb-8 p-5 bg-red-50 rounded-[1.5rem] border border-red-100 text-red-600 flex items-center gap-4 animate-in slide-in-from-top-4">
              <AlertCircle size={24}/>
              <span className="font-black text-sm uppercase">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-12">
            
            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
               <div className={`relative h-32 w-32 rounded-[2rem] p-1 border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${formData.profile_image_url ? 'border-indigo-500' : 'border-gray-200'}`}>
                  {formData.profile_image_url ? (
                    <img src={formData.profile_image_url} className="h-full w-full object-cover rounded-[1.8rem]" alt="Scribe" />
                  ) : (
                    <Camera className="text-gray-200" size={48} />
                  )}
                  {uploading.profile && <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>}
               </div>
               <label className="cursor-pointer px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest">
                  {formData.profile_image_url ? t.register.changePhoto : t.register.uploadPhoto}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'profile')} />
               </label>
            </div>

            {/* Personal */}
            <section className="space-y-6">
              <SectionTitle icon={ShieldCheck} title={t.scribeRegister.personalInfo} />
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

            {/* Location */}
            <section className="space-y-6">
              <SectionTitle icon={MapPin} title={t.scribeRegister.location} />
              <div className="grid md:grid-cols-2 gap-6">
                <SelectBox name="state" label={t.register.state} value={formData.state} onChange={handleChange} options={metadata?.states} />
                <SelectBox name="district" label={t.register.district} value={formData.district} onChange={handleChange} options={allDistricts.filter(d => d.state === formData.state).map(d => d.district)} disabled={!formData.state} />
                <PremiumInput name="city" label={t.register.city} icon={MapPin} onChange={handleChange} required />
                <PremiumInput name="pincode" label={t.register.pincode} icon={MapPin} onChange={handleChange} required />
              </div>
            </section>

            {/* Academic */}
            <section className="space-y-6">
              <SectionTitle icon={GraduationCap} title={t.scribeRegister.academic} />
              <div className="w-full">
                 <SelectBox name="highest_qualification" label={t.register.qualification} value={formData.highest_qualification} onChange={handleChange} options={metadata?.qualifications} />
              </div>
            </section>

            {/* Documents */}
            <section className="space-y-6">
              <SectionTitle icon={FileText} title={t.scribeRegister.docs} />
              <div className="grid md:grid-cols-2 gap-6">
                 <UploadBox label={`${t.register.aadhaar} (PDF)`} isUploaded={!!formData.aadhaar_card_url} isUploading={uploading.aadhaar} onChange={(e) => handleFileChange(e, 'aadhaar')} />
                 <UploadBox label={`${t.register.qualification} (PDF)`} isUploaded={!!formData.qualification_doc_url} isUploading={uploading.qualification} onChange={(e) => handleFileChange(e, 'qualification')} />
              </div>
            </section>

            <button 
              type="submit" 
              disabled={loading || uploading.profile || uploading.aadhaar || uploading.qualification} 
              className={`w-full py-6 rounded-[2rem] font-black text-xl shadow-2xl transition-all active:scale-95 flex justify-center items-center gap-3 disabled:opacity-50 ${highContrast ? 'bg-indigo-600 text-white shadow-indigo-500/20 hover:bg-indigo-700' : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700'}`}
            >
              {loading ? <Loader2 className="animate-spin" /> : <>{t.scribeRegister.submit} <ArrowRight /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- Local Components ---
const SectionTitle = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
    <Icon className="text-indigo-600" size={20} strokeWidth={2.5} />
    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900">{title}</h3>
  </div>
);

const PremiumInput = ({ name, label, icon: Icon, type = "text", onChange, required }) => {
  const { t } = useAccessibility();
  return (
    <div className="space-y-2 group">
    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 group-focus-within:text-indigo-600 transition-colors">{label}</label>
    <div className="relative">
      <Icon className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-400 transition-colors" size={20} />
      <input 
        name={name} type={type} placeholder={`${t.validation.placeholderPrefix} ${label}`} required={required} onChange={onChange}
        className="w-full h-14 pl-14 pr-6 rounded-2xl bg-gray-50 border-none font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-600 transition-all placeholder:text-gray-300"
      />
    </div>
  </div>
  );
};

const SelectBox = ({ name, label, value, onChange, options, disabled }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">{label}</label>
    <select name={name} required value={value} onChange={onChange} disabled={disabled} className={`w-full h-14 px-6 rounded-2xl bg-gray-50 border-none font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-600 transition-all appearance-none uppercase ${disabled ? 'opacity-30' : ''}`}>
      <option value="">{label}</option>
      {options?.sort()?.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const UploadBox = ({ label, isUploaded, isUploading, onChange }) => {
  const { t } = useAccessibility();
  return (
    <div className={`p-8 rounded-[2rem] border-2 border-dashed flex flex-col items-center transition-all ${isUploaded ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100 hover:border-indigo-300'}`}>
     {isUploading ? (
       <Loader2 className="animate-spin text-indigo-600 mb-2" size={32} />
     ) : isUploaded ? (
       <div className="text-center">
          <CheckCircle className="text-green-500 mx-auto mb-2" size={32}/>
          <p className="text-[10px] font-black uppercase text-green-700">{t.register.uploaded}</p>
       </div>
     ) : (
       <div className="text-center">
          <UploadCloud className="mx-auto text-gray-300 mb-2" size={32} />
          <p className="text-[10px] font-black text-gray-500 mb-4 uppercase tracking-tighter">{label}</p>
          <label className="cursor-pointer px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-md transition-all">
            {t.register.uploadPhoto.split(' ')[0]}
            <input type="file" accept=".pdf" className="hidden" onChange={onChange} />
          </label>
       </div>
     )}
    </div>
  );
};

export default ScribeRegister;