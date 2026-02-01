import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { User, Loader2, AlertCircle, Mail, Phone, Lock, MapPin, GraduationCap, CheckCircle, FileText } from 'lucide-react';
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

  const { data: states = [] } = useQuery({ queryKey: ['states'], queryFn: async () => (await api.get('/locations/states')).data });
  const { data: districts = [], isFetching: loadingDistricts } = useQuery({ queryKey: ['districts', formData.state], queryFn: async () => (await api.get(`/locations/districts/${formData.state}`)).data, enabled: !!formData.state });
  const { data: metadata } = useQuery({ queryKey: ['metadata'], queryFn: async () => (await api.get('/locations/metadata')).data });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'state') setFormData(prev => ({ ...prev, district: '' }));
  };

  // 🟢 FRONTEND VALIDATION (Matches Scribe & Backend)
  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;

    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address."); return false;
    }
    if (!phoneRegex.test(formData.phone)) {
      setError("Phone number must be exactly 10 digits."); return false;
    }
    if (formData.password.length < 4) {
      setError("Password must be at least 4 characters."); return false;
    }
    if (!specialCharRegex.test(formData.password)) {
      setError("Password must contain at least one special character."); return false;
    }
    if (!formData.profile_image_url || !formData.aadhaar_card_url) {
      setError("Please upload both required documents."); return false;
    }
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

  // 🟢 ACCESSIBILITY STYLES
  const bgClass = highContrast ? "bg-black text-yellow-400 border-2 border-yellow-400" : "bg-white text-slate-900 border-slate-100 shadow-xl";
  const containerClass = highContrast ? "border-2 border-yellow-400 bg-black" : "border-2 border-slate-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary";
  const inputClass = "w-full p-3 bg-transparent outline-none";
  const btnClass = highContrast ? "bg-yellow-400 text-black font-black hover:bg-yellow-300" : "bg-primary text-white hover:bg-primary-dark";
  const iconColor = highContrast ? "text-yellow-400" : "text-slate-400";

  return (
    <div className={`max-w-4xl mx-auto py-10 px-4 transition-colors ${highContrast ? 'bg-black min-h-screen' : ''}`}>
      <div className={`rounded-3xl p-8 border ${bgClass}`}>
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <User size={32} /> {t.register.title}
        </h2>

        {error && (
          <div className="mb-6 p-4 bg-red-900/10 border-l-4 border-red-600 text-red-600 flex items-center gap-2" role="alert">
            <AlertCircle size={20}/> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Personal Info */}
          <section className="grid md:grid-cols-2 gap-6">
            <h3 className="col-span-2 text-lg font-bold border-b pb-2 uppercase tracking-widest opacity-70">{t.register.personalInfo}</h3>
            
            <div className={`rounded-xl flex items-center px-3 ${containerClass}`}>
              <User size={18} className={iconColor} />
              <input name="first_name" placeholder={t.register.firstName} required onChange={handleChange} className={inputClass} />
            </div>

            <div className={`rounded-xl flex items-center px-3 ${containerClass}`}>
              <User size={18} className={iconColor} />
              <input name="last_name" placeholder={t.register.lastName} onChange={handleChange} className={inputClass} />
            </div>

            <div className={`rounded-xl flex items-center px-3 ${containerClass}`}>
              <Mail size={18} className={iconColor} />
              <input name="email" type="email" placeholder={t.register.email} required onChange={handleChange} className={inputClass} />
            </div>

            <div className={`rounded-xl flex items-center px-3 ${containerClass}`}>
              <Phone size={18} className={iconColor} />
              <input name="phone" placeholder={t.register.phone} required onChange={handleChange} className={inputClass} />
            </div>

            <div className={`rounded-xl flex items-center px-3 md:col-span-2 ${containerClass}`}>
              <Lock size={18} className={iconColor} />
              <input name="password" type="password" placeholder={t.register.password} required onChange={handleChange} className={inputClass} />
            </div>
          </section>

          {/* 2. Location */}
          <section className="grid md:grid-cols-2 gap-6">
            <h3 className="col-span-2 text-lg font-bold border-b pb-2 uppercase tracking-widest opacity-70">{t.register.location}</h3>
            
            <div className={`rounded-xl flex items-center px-3 ${containerClass}`}>
              <MapPin size={18} className={iconColor} />
              <select name="state" required onChange={handleChange} className={`${inputClass} uppercase`}>
                <option value="">{t.register.state}</option>
                {states.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
              </select>
            </div>

            <div className={`rounded-xl flex items-center px-3 ${containerClass}`}>
              <MapPin size={18} className={iconColor} />
              <select name="district" required onChange={handleChange} disabled={!formData.state} className={`${inputClass} uppercase`}>
                <option value="">{loadingDistricts ? t.register.loading : t.register.district}</option>
                {districts.map(d => <option key={d} value={d}>{d.toUpperCase()}</option>)}
              </select>
            </div>

            <div className={`rounded-xl flex items-center px-3 ${containerClass}`}>
               <input name="city" placeholder={t.register.city} required onChange={handleChange} className={inputClass} />
            </div>

            <div className={`rounded-xl flex items-center px-3 ${containerClass}`}>
               <input name="pincode" placeholder={t.register.pincode} required onChange={handleChange} className={inputClass} />
            </div>
          </section>

          {/* 3. Academic */}
          <section className="grid md:grid-cols-2 gap-6">
            <h3 className="col-span-2 text-lg font-bold border-b pb-2 uppercase tracking-widest opacity-70">{t.register.academic}</h3>
            
            <div className={`rounded-xl flex items-center px-3 ${containerClass}`}>
              <AlertCircle size={18} className={iconColor} />
              <input name="disability_type" placeholder={t.register.disabilityType} required onChange={handleChange} className={inputClass} />
            </div>
            
            <div className={`rounded-xl flex items-center px-3 ${containerClass}`}>
              <GraduationCap size={18} className={iconColor} />
              <select name="highest_qualification" required onChange={handleChange} className={inputClass}>
                <option value="">{t.register.qualification}</option>
                {metadata?.qualifications?.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>

            <div className={`rounded-xl flex items-center px-3 md:col-span-2 ${containerClass}`}>
              <input name="current_class_year" placeholder={t.register.classYear} required onChange={handleChange} className={inputClass} />
            </div>
          </section>

          {/* 4. Documents */}
          <section className="grid md:grid-cols-2 gap-6">
            <h3 className="col-span-2 text-lg font-bold border-b pb-2 uppercase tracking-widest opacity-70">{t.register.docs}</h3>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase opacity-60 flex items-center gap-2">
                <FileText size={14}/> {t.register.profilePhoto}
              </label>
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'profile')} className={`block w-full text-xs ${highContrast ? 'text-yellow-400' : ''}`} />
              {uploading.profile && <Loader2 className="animate-spin text-primary" size={16}/>}
              {formData.profile_image_url && <span className="text-green-600 text-xs font-bold flex items-center gap-1"><CheckCircle size={14}/> {t.register.uploaded}</span>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase opacity-60 flex items-center gap-2">
                <FileText size={14}/> {t.register.aadhaar}
              </label>
              <input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, 'aadhaar')} className={`block w-full text-xs ${highContrast ? 'text-yellow-400' : ''}`} />
              {uploading.aadhaar && <Loader2 className="animate-spin text-primary" size={16}/>}
              {formData.aadhaar_card_url && <span className="text-green-600 text-xs font-bold flex items-center gap-1"><CheckCircle size={14}/> {t.register.uploaded}</span>}
            </div>
          </section>

          <button type="submit" disabled={loading} className={`w-full py-5 rounded-2xl font-black text-lg shadow-lg transition-transform active:scale-95 flex justify-center items-center gap-3 ${btnClass}`}>
            {loading ? <Loader2 className="animate-spin" /> : t.register.submit}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentRegister;