import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { User, Loader2, AlertCircle } from 'lucide-react';
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

  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(prev => ({ ...prev, [type]: true }));
    try {
      // Use logic based on type
      const url = await uploadToCloudinary(file, type === 'profile' ? ['image/jpeg', 'image/png'] : ['application/pdf']);
      setFormData(prev => ({ ...prev, [type === 'profile' ? 'profile_image_url' : 'aadhaar_card_url']: url }));
    } catch (err) { setError(err.message); } 
    finally { setUploading(prev => ({ ...prev, [type]: false })); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.profile_image_url || !formData.aadhaar_card_url) {
      setError(t.errors.uploadFiles);
      return;
    }
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/studentRegister', formData); // Backend adds role automatically
      navigate('/login');
    } catch (err) {
      if (err.response?.status === 409) setError(t.errors.conflict);
      else setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Styles
  const bgClass = highContrast ? "bg-black text-yellow-400 border-yellow-400" : "bg-white text-slate-900 border-slate-100";
  const inputClass = highContrast ? "bg-black border-yellow-400 text-yellow-400 placeholder-yellow-700" : "bg-white border-slate-300";
  const btnClass = highContrast ? "bg-yellow-400 text-black hover:bg-yellow-500" : "bg-primary text-white hover:bg-primary-dark";

  return (
    <div className={`max-w-4xl mx-auto py-10 px-4 ${highContrast ? 'bg-black min-h-screen' : ''}`}>
      <div className={`shadow-xl rounded-2xl p-8 border ${bgClass}`}>
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <User size={32} /> {t.register.title}
        </h2>

        {error && <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-600 text-red-700 flex items-center gap-2"><AlertCircle size={20}/>{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="grid md:grid-cols-2 gap-4">
            <h3 className="col-span-2 text-lg font-semibold border-b pb-2">{t.register.personalInfo}</h3>
            <input name="first_name" placeholder={t.register.firstName} required onChange={handleChange} className={`p-3 border rounded-lg ${inputClass}`} />
            <input name="last_name" placeholder={t.register.lastName} onChange={handleChange} className={`p-3 border rounded-lg ${inputClass}`} />
            <input name="email" type="email" placeholder={t.register.email} required onChange={handleChange} className={`p-3 border rounded-lg ${inputClass}`} />
            <input name="phone" placeholder={t.register.phone} required onChange={handleChange} className={`p-3 border rounded-lg ${inputClass}`} />
            <input name="password" type="password" placeholder={t.register.password} required onChange={handleChange} className={`p-3 border rounded-lg md:col-span-2 ${inputClass}`} />
          </section>

          <section className="grid md:grid-cols-2 gap-4">
            <h3 className="col-span-2 text-lg font-semibold border-b pb-2">{t.register.location}</h3>
            <select name="state" required onChange={handleChange} className={`p-3 border rounded-lg uppercase ${inputClass}`}>
              <option value="">{t.register.state}</option>
              {states.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>
            <select name="district" required onChange={handleChange} disabled={!formData.state} className={`p-3 border rounded-lg uppercase ${inputClass}`}>
              <option value="">{loadingDistricts ? t.register.loading : t.register.district}</option>
              {districts.map(d => <option key={d} value={d}>{d.toUpperCase()}</option>)}
            </select>
            <input name="city" placeholder={t.register.city} required onChange={handleChange} className={`p-3 border rounded-lg ${inputClass}`} />
            <input name="pincode" placeholder={t.register.pincode} required onChange={handleChange} className={`p-3 border rounded-lg ${inputClass}`} />
          </section>

          <section className="grid md:grid-cols-2 gap-4">
            <h3 className="col-span-2 text-lg font-semibold border-b pb-2">{t.register.academic}</h3>
            {/* FIXED: Input instead of Select for Disability */}
            <input name="disability_type" placeholder={t.register.disabilityType} required onChange={handleChange} className={`p-3 border rounded-lg ${inputClass}`} />
            
            <select name="highest_qualification" required onChange={handleChange} className={`p-3 border rounded-lg ${inputClass}`}>
              <option value="">{t.register.qualification}</option>
              {metadata?.qualifications?.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
            <input name="current_class_year" placeholder={t.register.classYear} required onChange={handleChange} className={`p-3 border rounded-lg md:col-span-2 ${inputClass}`} />
          </section>

          <section className="grid md:grid-cols-2 gap-4">
            <h3 className="col-span-2 text-lg font-semibold border-b pb-2">{t.register.docs}</h3>
            <div>
              <label className="text-sm font-bold">{t.register.profilePhoto}</label>
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'profile')} className={`block w-full text-sm mt-1 ${inputClass}`} />
              {uploading.profile && <span className="text-xs">{t.register.uploading}</span>}
              {formData.profile_image_url && <span className="text-green-600 text-xs font-bold">✓ {t.register.uploaded}</span>}
            </div>
            <div>
              <label className="text-sm font-bold">{t.register.aadhaar}</label>
              <input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, 'aadhaar')} className={`block w-full text-sm mt-1 ${inputClass}`} />
              {uploading.aadhaar && <span className="text-xs">{t.register.uploading}</span>}
              {formData.aadhaar_card_url && <span className="text-green-600 text-xs font-bold">✓ {t.register.uploaded}</span>}
            </div>
          </section>

          <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl font-bold flex justify-center items-center gap-2 ${btnClass}`}>
            {loading ? <Loader2 className="animate-spin" /> : t.register.submit}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentRegister;