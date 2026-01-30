import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Pencil, Globe, GraduationCap, AlertCircle, Loader2, X, Upload } from 'lucide-react';
import api from '../api/axios';
import { uploadToCloudinary } from '../utils/uploadFile';

const ScribeRegister = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [uploading, setUploading] = useState({ profile: false, aadhaar: false, doc: false });

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone: '', password: '',
    state: '', district: '', city: '', pincode: '',
    highest_qualification: '', profile_image_url: '',
    aadhaar_card_url: '', qualification_doc_url: ''
  });

  // Queries (Shared with Student page for caching)
  const { data: states = [] } = useQuery({ queryKey: ['states'], queryFn: async () => (await api.get('/locations/states')).data });
  const { data: districts = [], isFetching: loadingDistricts } = useQuery({
    queryKey: ['districts', formData.state],
    queryFn: async () => (await api.get(`/locations/districts/${formData.state}`)).data,
    enabled: !!formData.state
  });
  const { data: metadata } = useQuery({ queryKey: ['metadata'], queryFn: async () => (await api.get('/locations/metadata')).data });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'state') setFormData(prev => ({ ...prev, district: '' }));
  };

  const handleLanguageToggle = (lang) => {
    setSelectedLanguages(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]);
  };

  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, [type]: true }));
    try {
      let url = "";
      if (type === 'profile') {
        url = await uploadToCloudinary(file, ['image/jpeg', 'image/png']);
        setFormData(prev => ({ ...prev, profile_image_url: url }));
      } else {
        url = await uploadToCloudinary(file, ['application/pdf']);
        setFormData(prev => ({ ...prev, [type === 'aadhaar' ? 'aadhaar_card_url' : 'qualification_doc_url']: url }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedLanguages.length === 0 || !formData.profile_image_url || !formData.aadhaar_card_url || !formData.qualification_doc_url) {
      setError("Please complete all fields and uploads.");
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/scribeRegister', { ...formData, languages_known: selectedLanguages });
      alert("Registration successful. Admin will verify your profile.");
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 border border-slate-100">
        <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
          <Pencil className="text-green-600" size={32} /> Scribe Volunteer Registration
        </h2>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 flex items-center gap-3 rounded-lg border-l-4 border-red-600"><AlertCircle size={20} />{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="grid md:grid-cols-2 gap-4">
            <h3 className="col-span-2 text-lg font-semibold border-b pb-2">Personal Details</h3>
            <input name="first_name" placeholder="First Name" required onChange={handleChange} className="p-3 border rounded-lg" />
            <input name="last_name" placeholder="Last Name" onChange={handleChange} className="p-3 border rounded-lg" />
            <input name="email" type="email" placeholder="Email" required onChange={handleChange} className="p-3 border rounded-lg" />
            <input name="phone" placeholder="Phone" required onChange={handleChange} className="p-3 border rounded-lg" />
            <input name="password" type="password" placeholder="Password" required onChange={handleChange} className="p-3 border rounded-lg md:col-span-2" />
          </section>

          <section className="grid md:grid-cols-2 gap-4">
            <h3 className="col-span-2 text-lg font-semibold border-b pb-2">Location</h3>
            <select name="state" required onChange={handleChange} className="p-3 border rounded-lg uppercase">
              <option value="">Select State</option>
              {states.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>
            <select name="district" required onChange={handleChange} disabled={!formData.state || loadingDistricts} className="p-3 border rounded-lg uppercase">
              <option value="">{loadingDistricts ? 'Loading...' : 'Select District'}</option>
              {districts.map(d => <option key={d} value={d}>{d.toUpperCase()}</option>)}
            </select>
          </section>

          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center gap-2"><Globe size={18}/> Languages</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 h-40 overflow-y-auto p-3 border rounded-lg bg-slate-50">
              {metadata?.languages?.map(lang => (
                <button key={lang} type="button" onClick={() => handleLanguageToggle(lang)} className={`p-2 text-xs font-bold rounded uppercase ${selectedLanguages.includes(lang) ? 'bg-primary text-white' : 'bg-white border text-slate-600'}`}>
                  {lang}
                </button>
              ))}
            </div>
          </section>

          <section className="grid md:grid-cols-3 gap-6">
            <h3 className="col-span-3 text-lg font-semibold border-b pb-2">Required Uploads</h3>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase">Profile (JPG/PNG)</label>
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'profile')} className="block w-full text-xs file:bg-blue-50 file:text-primary file:border-0 file:rounded file:py-1 file:px-2" />
              {formData.profile_image_url && <span className="text-green-600 text-[10px] font-bold">Uploaded ✓</span>}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase">Aadhaar (PDF)</label>
              <input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, 'aadhaar')} className="block w-full text-xs file:bg-blue-50 file:text-primary file:border-0 file:rounded file:py-1 file:px-2" />
              {formData.aadhaar_card_url && <span className="text-green-600 text-[10px] font-bold">Uploaded ✓</span>}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase">Qual. Doc (PDF)</label>
              <input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, 'doc')} className="block w-full text-xs file:bg-blue-50 file:text-primary file:border-0 file:rounded file:py-1 file:px-2" />
              {formData.qualification_doc_url && <span className="text-green-600 text-[10px] font-bold">Uploaded ✓</span>}
            </div>
          </section>

          <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-all flex justify-center items-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : 'Register as Volunteer Scribe'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ScribeRegister;