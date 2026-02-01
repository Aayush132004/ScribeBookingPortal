import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { User, Loader2, AlertCircle, FileText, CheckCircle, Mail, Phone, Lock, MapPin, BookOpen, Languages } from 'lucide-react';
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
    languages_known: [],
    profile_image_url: '', 
    aadhaar_card_url: '',
    qualification_doc_url: ''
  });

  const { data: states = [] } = useQuery({ queryKey: ['states'], queryFn: async () => (await api.get('/locations/states')).data });
  const { data: districts = [] } = useQuery({ queryKey: ['districts', formData.state], queryFn: async () => (await api.get(`/locations/districts/${formData.state}`)).data, enabled: !!formData.state });
  const { data: metadata } = useQuery({ queryKey: ['metadata'], queryFn: async () => (await api.get('/locations/metadata')).data });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'state') setFormData(prev => ({ ...prev, district: '' }));
  };

  const handleLanguageChange = (e) => {
    const values = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, languages_known: values }));
  };

  // 🟢 FRONTEND VALIDATION (Matches Backend)
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
      setError("Password must be at least 4 characters long."); return false;
    }
    if (!specialCharRegex.test(formData.password)) {
      setError("Password must contain at least one special character (!@#$%^&*)."); return false;
    }
    if (!formData.profile_image_url || !formData.aadhaar_card_url || !formData.qualification_doc_url) {
      setError("Please upload all 3 required documents."); return false;
    }
    if (formData.languages_known.length === 0) {
      setError("Please select at least one language."); return false;
    }
    return true;
  };

  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(prev => ({ ...prev, [type]: true }));
    try {
      const allowedTypes = type === 'profile' ? ['image/jpeg', 'image/png'] : ['application/pdf'];
      const url = await uploadToCloudinary(file, allowedTypes);
      const fieldMap = { profile: 'profile_image_url', aadhaar: 'aadhaar_card_url', qualification: 'qualification_doc_url' };
      setFormData(prev => ({ ...prev, [fieldMap[type]]: url }));
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
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  // 🟢 ACCESSIBILITY STYLES (Border focus logic)
  const bgClass = highContrast ? "bg-black text-yellow-400 border-2 border-yellow-400" : "bg-white text-slate-900 border border-slate-100 shadow-xl";
  const containerClass = highContrast ? "border-2 border-yellow-400 bg-black" : "border border-slate-300 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary";
  const inputClass = "w-full p-3 bg-transparent outline-none";
  const btnClass = highContrast ? "bg-yellow-400 text-black font-black hover:bg-yellow-300" : "bg-primary text-white hover:bg-primary-dark";

  return (
    <div className={`max-w-4xl mx-auto py-10 px-4 transition-colors ${highContrast ? 'bg-black min-h-screen' : ''}`}>
      <div className={`rounded-3xl p-8 ${bgClass}`}>
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <User size={32} /> {t.nav.scribeReg}
        </h2>

        {error && <div className="mb-6 p-4 bg-red-900/10 border-l-4 border-red-600 text-red-600 flex items-center gap-2" role="alert"><AlertCircle size={20}/>{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Personal Info */}
          <section className="grid md:grid-cols-2 gap-6">
            <h3 className="col-span-2 text-lg font-bold border-b pb-2 uppercase tracking-wider opacity-70">{t.register.personalInfo}</h3>
            
            <div className={`rounded-xl flex items-center px-3 ${containerClass}`}>
              <User size={18} className="opacity-50" />
              <input name="first_name" placeholder={t.register.firstName} required onChange={handleChange} className={inputClass} />
            </div>
            
            <div className={`rounded-xl flex items-center px-3 ${containerClass}`}>
              <User size={18} className="opacity-50" />
              <input name="last_name" placeholder={t.register.lastName} onChange={handleChange} className={inputClass} />
            </div>

            <div className={`rounded-xl flex items-center px-3 ${containerClass}`}>
              <Mail size={18} className="opacity-50" />
              <input name="email" type="email" placeholder={t.register.email} required onChange={handleChange} className={inputClass} />
            </div>

            <div className={`rounded-xl flex items-center px-3 ${containerClass}`}>
              <Phone size={18} className="opacity-50" />
              <input name="phone" placeholder={t.register.phone} required onChange={handleChange} className={inputClass} />
            </div>

            <div className={`rounded-xl flex items-center px-3 md:col-span-2 ${containerClass}`}>
              <Lock size={18} className="opacity-50" />
              <input name="password" type="password" placeholder={t.register.password} required onChange={handleChange} className={inputClass} />
            </div>
          </section>

          {/* 2. Location */}
          <section className="grid md:grid-cols-2 gap-6">
            <h3 className="col-span-2 text-lg font-bold border-b pb-2 uppercase tracking-wider opacity-70">{t.register.location}</h3>
            
            <div className={`rounded-xl flex items-center px-3 ${containerClass}`}>
              <MapPin size={18} className="opacity-50" />
              <select name="state" required onChange={handleChange} className={`${inputClass} uppercase`}>
                <option value="">{t.register.state}</option>
                {states.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
              </select>
            </div>

            <div className={`rounded-xl flex items-center px-3 ${containerClass}`}>
              <MapPin size={18} className="opacity-50" />
              <select name="district" required onChange={handleChange} disabled={!formData.state} className={`${inputClass} uppercase`}>
                <option value="">{t.register.district}</option>
                {districts.map(d => <option key={d} value={d}>{d.toUpperCase()}</option>)}
              </select>
            </div>

            <input name="city" placeholder={t.register.city} required onChange={handleChange} className={`p-3 rounded-xl ${containerClass} outline-none`} />
            <input name="pincode" placeholder={t.register.pincode} required onChange={handleChange} className={`p-3 rounded-xl ${containerClass} outline-none`} />
          </section>

          {/* 3. Qualifications */}
          <section className="grid md:grid-cols-2 gap-6">
            <h3 className="col-span-2 text-lg font-bold border-b pb-2 uppercase tracking-wider opacity-70">Qualification & Skills</h3>
            
            <div className={`rounded-xl flex items-center px-3 md:col-span-2 ${containerClass}`}>
              <BookOpen size={18} className="opacity-50" />
              <select name="highest_qualification" required onChange={handleChange} className={inputClass}>
                <option value="">Highest Qualification</option>
                {metadata?.qualifications?.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>

            <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold flex items-center gap-2"><Languages size={16}/> Languages Known (Ctrl+Click)</label>
                <select multiple name="languages_known" required onChange={handleLanguageChange} className={`w-full h-32 p-3 rounded-xl ${containerClass} outline-none`}>
                    {metadata?.languages?.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
                </select>
                <p className={`text-xs font-medium ${highContrast ? 'text-yellow-200' : 'text-primary'}`}>Selected: {formData.languages_known.join(', ').toUpperCase()}</p>
            </div>
          </section>

          {/* 4. Documents */}
          <section className="grid md:grid-cols-3 gap-6">
            <h3 className="col-span-3 text-lg font-bold border-b pb-2 uppercase tracking-wider opacity-70">{t.register.docs}</h3>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase opacity-60">Profile Photo</label>
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'profile')} className={`block w-full text-xs cursor-pointer ${highContrast ? 'text-yellow-400' : ''}`} />
              {uploading.profile && <Loader2 className="animate-spin text-primary" size={16}/>}
              {formData.profile_image_url && <span className="text-green-600 text-xs font-bold flex items-center gap-1"><CheckCircle size={14}/> {t.register.uploaded}</span>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase opacity-60">Aadhaar (PDF)</label>
              <input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, 'aadhaar')} className={`block w-full text-xs cursor-pointer ${highContrast ? 'text-yellow-400' : ''}`} />
              {uploading.aadhaar && <Loader2 className="animate-spin text-primary" size={16}/>}
              {formData.aadhaar_card_url && <span className="text-green-600 text-xs font-bold flex items-center gap-1"><CheckCircle size={14}/> {t.register.uploaded}</span>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase opacity-60">Degree/Cert (PDF)</label>
              <input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, 'qualification')} className={`block w-full text-xs cursor-pointer ${highContrast ? 'text-yellow-400' : ''}`} />
              {uploading.qualification && <Loader2 className="animate-spin text-primary" size={16}/>}
              {formData.qualification_doc_url && <span className="text-green-600 text-xs font-bold flex items-center gap-1"><CheckCircle size={14}/> {t.register.uploaded}</span>}
            </div>
          </section>

          <button type="submit" disabled={loading} className={`w-full py-5 rounded-2xl font-black text-lg transition-transform active:scale-95 shadow-lg flex justify-center items-center gap-3 ${btnClass}`}>
            {loading ? <Loader2 className="animate-spin" /> : "Register as Volunteer Scribe"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ScribeRegister;