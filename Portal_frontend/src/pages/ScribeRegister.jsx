import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { User, Loader2, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import api from '../api/axios';
import { uploadToCloudinary } from '../utils/uploadFile';
import { useAccessibility } from '../context/AccessibilityContext';

const ScribeRegister = () => {
  const navigate = useNavigate();
  const { t, highContrast } = useAccessibility();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Track upload status for 3 files
  const [uploading, setUploading] = useState({ 
    profile: false, 
    aadhaar: false, 
    qualification: false 
  });

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone: '', password: '',
    state: '', district: '', city: '', pincode: '',
    highest_qualification: '',
    languages_known: [], // Must be an array
    profile_image_url: '', 
    aadhaar_card_url: '',
    qualification_doc_url: '' // Backend requirement
  });

  // Fetch Data
  const { data: states = [] } = useQuery({ queryKey: ['states'], queryFn: async () => (await api.get('/locations/states')).data });
  const { data: districts = [] } = useQuery({ queryKey: ['districts', formData.state], queryFn: async () => (await api.get(`/locations/districts/${formData.state}`)).data, enabled: !!formData.state });
  const { data: metadata } = useQuery({ queryKey: ['metadata'], queryFn: async () => (await api.get('/locations/metadata')).data });

  // Handle Text Inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'state') setFormData(prev => ({ ...prev, district: '' }));
  };

  // Handle Language Multi-Select
  const handleLanguageChange = (e) => {
    const options = [...e.target.selectedOptions];
    const values = options.map(option => option.value);
    setFormData(prev => ({ ...prev, languages_known: values }));
  };

  // Handle File Uploads
  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, [type]: true }));
    try {
      // Determine format: Profile = Image, Others = PDF
      const allowedTypes = type === 'profile' ? ['image/jpeg', 'image/png'] : ['application/pdf'];
      const url = await uploadToCloudinary(file, allowedTypes);
      
      // Map type to backend field name
      const fieldMap = {
        profile: 'profile_image_url',
        aadhaar: 'aadhaar_card_url',
        qualification: 'qualification_doc_url'
      };

      setFormData(prev => ({ ...prev, [fieldMap[type]]: url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.profile_image_url || !formData.aadhaar_card_url || !formData.qualification_doc_url) {
      setError("Please upload all 3 required documents.");
      return;
    }
    if (formData.languages_known.length === 0) {
      setError("Please select at least one language.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/scribeRegister', formData);
      navigate('/login');
    } catch (err) {
        if (err.response?.status === 409) setError("Email or Phone already registered.");
        else setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Styles
  const bgClass = highContrast ? "bg-black text-yellow-400 border border-yellow-400" : "bg-white text-slate-900 border border-slate-100 shadow-xl";
  const inputClass = highContrast ? "bg-black border border-yellow-400 text-yellow-400" : "bg-white border border-slate-300";
  const btnClass = highContrast ? "bg-yellow-400 text-black font-bold hover:bg-yellow-500" : "bg-primary text-white hover:bg-primary-dark";

  return (
    <div className={`max-w-4xl mx-auto py-10 px-4 ${highContrast ? 'bg-black min-h-screen' : ''}`}>
      <div className={`rounded-2xl p-8 ${bgClass}`}>
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <User size={32} /> {t.nav.scribeReg}
        </h2>

        {error && <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-600 text-red-700 flex items-center gap-2"><AlertCircle size={20}/>{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Personal Info */}
          <section className="grid md:grid-cols-2 gap-4">
            <h3 className="col-span-2 text-lg font-semibold border-b pb-2">{t.register.personalInfo}</h3>
            <input name="first_name" placeholder={t.register.firstName} required onChange={handleChange} className={`p-3 rounded-lg ${inputClass}`} />
            <input name="last_name" placeholder={t.register.lastName} onChange={handleChange} className={`p-3 rounded-lg ${inputClass}`} />
            <input name="email" type="email" placeholder={t.register.email} required onChange={handleChange} className={`p-3 rounded-lg ${inputClass}`} />
            <input name="phone" placeholder={t.register.phone} required onChange={handleChange} className={`p-3 rounded-lg ${inputClass}`} />
            <input name="password" type="password" placeholder={t.register.password} required onChange={handleChange} className={`p-3 rounded-lg md:col-span-2 ${inputClass}`} />
          </section>

          {/* 2. Location */}
          <section className="grid md:grid-cols-2 gap-4">
            <h3 className="col-span-2 text-lg font-semibold border-b pb-2">{t.register.location}</h3>
            <select name="state" required onChange={handleChange} className={`p-3 rounded-lg uppercase ${inputClass}`}>
              <option value="">{t.register.state}</option>
              {states.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>
            <select name="district" required onChange={handleChange} disabled={!formData.state} className={`p-3 rounded-lg uppercase ${inputClass}`}>
              <option value="">{t.register.district}</option>
              {districts.map(d => <option key={d} value={d}>{d.toUpperCase()}</option>)}
            </select>
            <input name="city" placeholder={t.register.city} required onChange={handleChange} className={`p-3 rounded-lg ${inputClass}`} />
            <input name="pincode" placeholder={t.register.pincode} required onChange={handleChange} className={`p-3 rounded-lg ${inputClass}`} />
          </section>

          {/* 3. Qualifications & Languages */}
          <section className="grid md:grid-cols-2 gap-4">
            <h3 className="col-span-2 text-lg font-semibold border-b pb-2">Qualification & Skills</h3>
            
            <select name="highest_qualification" required onChange={handleChange} className={`p-3 rounded-lg ${inputClass}`}>
              <option value="">Highest Qualification</option>
              {metadata?.qualifications?.map(q => <option key={q} value={q}>{q}</option>)}
            </select>

            <div className="md:col-span-2">
                <label className="text-sm font-bold mb-2 block">Languages Known (Hold Ctrl to select multiple)</label>
                <select 
                    multiple 
                    name="languages_known" 
                    required 
                    onChange={handleLanguageChange} 
                    className={`p-3 rounded-lg w-full h-32 ${inputClass}`}
                >
                    {metadata?.languages?.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
                </select>
                <p className="text-xs mt-1 opacity-70">Selected: {formData.languages_known.join(', ').toUpperCase()}</p>
            </div>
          </section>

          {/* 4. Documents */}
          <section className="grid md:grid-cols-3 gap-4">
            <h3 className="col-span-3 text-lg font-semibold border-b pb-2">{t.register.docs}</h3>
            
            {/* Profile Photo */}
            <div>
              <label className="text-sm font-bold block mb-1">Profile Photo</label>
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'profile')} className={`block w-full text-xs ${inputClass}`} />
              {uploading.profile && <span className="text-xs">{t.register.uploading}</span>}
              {formData.profile_image_url && <span className="text-green-600 text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> {t.register.uploaded}</span>}
            </div>

            {/* Aadhaar */}
            <div>
              <label className="text-sm font-bold block mb-1">Aadhaar (PDF)</label>
              <input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, 'aadhaar')} className={`block w-full text-xs ${inputClass}`} />
              {uploading.aadhaar && <span className="text-xs">{t.register.uploading}</span>}
              {formData.aadhaar_card_url && <span className="text-green-600 text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> {t.register.uploaded}</span>}
            </div>

            {/* Qualification Doc */}
            <div>
              <label className="text-sm font-bold block mb-1">Degree/Cert (PDF)</label>
              <input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, 'qualification')} className={`block w-full text-xs ${inputClass}`} />
              {uploading.qualification && <span className="text-xs">{t.register.uploading}</span>}
              {formData.qualification_doc_url && <span className="text-green-600 text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> {t.register.uploaded}</span>}
            </div>
          </section>

          <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl font-bold flex justify-center items-center gap-2 ${btnClass}`}>
            {loading ? <Loader2 className="animate-spin" /> : "Register as Volunteer Scribe"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ScribeRegister;