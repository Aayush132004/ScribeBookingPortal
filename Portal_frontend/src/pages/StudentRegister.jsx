import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { User, MapPin, GraduationCap, AlertCircle, Loader2, Upload, FileText } from 'lucide-react';
import api from '../api/axios';
import { uploadToCloudinary } from '../utils/uploadFile.js';

const StudentRegister = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState({ profile: false, aadhaar: false });

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone: '', password: '',
    state: '', district: '', city: '', pincode: '',
    disability_type: '', highest_qualification: '', current_class_year: '',
    profile_image_url: '',
    aadhaar_card_url: ''
  });

  // Dynamic Data Fetching
  const { data: states = [] } = useQuery({
    queryKey: ['states'],
    queryFn: async () => (await api.get('/locations/states')).data
  });

  const { data: districts = [], isFetching: loadingDistricts } = useQuery({
    queryKey: ['districts', formData.state],
    queryFn: async () => (await api.get(`/locations/districts/${formData.state}`)).data,
    enabled: !!formData.state
  });

  const { data: metadata } = useQuery({
    queryKey: ['metadata'],
    queryFn: async () => (await api.get('/locations/metadata')).data
  });

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
      let url = "";
      if (type === 'profile') {
        url = await uploadToCloudinary(file, ['image/jpeg', 'image/png']);
        setFormData(prev => ({ ...prev, profile_image_url: url }));
      } else {
        url = await uploadToCloudinary(file, ['application/pdf']);
        setFormData(prev => ({ ...prev, aadhaar_card_url: url }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.profile_image_url || !formData.aadhaar_card_url) {
      setError("Please upload all required files.");
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.post('/auth/studentRegister', formData);
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
          <User className="text-primary" size={32} /> Student Registration
        </h2>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 text-red-700 flex items-center gap-3" role="alert">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="grid md:grid-cols-2 gap-4">
            <h3 className="col-span-2 text-lg font-semibold border-b pb-2">Personal & Security</h3>
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
            <input name="city" placeholder="City" required onChange={handleChange} className="p-3 border rounded-lg" />
            <input name="pincode" placeholder="Pincode" required onChange={handleChange} className="p-3 border rounded-lg" />
          </section>

          <section className="grid md:grid-cols-2 gap-4">
            <h3 className="col-span-2 text-lg font-semibold border-b pb-2">Documents (Required)</h3>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">Profile Photo (JPG/PNG)</label>
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'profile')} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100" />
              {uploading.profile && <Loader2 className="animate-spin text-primary" size={16} />}
              {formData.profile_image_url && <span className="text-green-600 text-xs font-bold">✓ Uploaded</span>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">Aadhaar Card (PDF)</label>
              <input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, 'aadhaar')} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100" />
              {uploading.aadhaar && <Loader2 className="animate-spin text-primary" size={16} />}
              {formData.aadhaar_card_url && <span className="text-green-600 text-xs font-bold">✓ Uploaded</span>}
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-4">
            <h3 className="col-span-2 text-lg font-semibold border-b pb-2">Academic</h3>
            <select name="disability_type" required onChange={handleChange} className="p-3 border rounded-lg">
              <option value="">Disability Type</option>
              <option value="Visual Impairment">Visual Impairment</option>
              <option value="Locomotor Disability">Locomotor Disability</option>
              <option value="Other">Other</option>
            </select>
            <select name="highest_qualification" required onChange={handleChange} className="p-3 border rounded-lg">
              <option value="">Qualification</option>
              {metadata?.qualifications?.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
            <input name="current_class_year" placeholder="Class/Year (e.g., 2nd Year)" required onChange={handleChange} className="p-3 border rounded-lg md:col-span-2" />
          </section>

          <button type="submit" disabled={loading} className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary-dark transition-all flex justify-center items-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : 'Register as Student'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentRegister;