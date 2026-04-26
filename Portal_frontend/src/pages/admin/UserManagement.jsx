import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, UserMinus, UserCheck, Trash2, Loader2, AlertCircle, Search, Filter } from 'lucide-react';
import api from '../../api/axios';
import { useAccessibility } from '../../context/AccessibilityContext';

const UserManagement = () => {
  const { t } = useAccessibility();
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Fetch Users
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-users', roleFilter, page],
    queryFn: async () => {
      const res = await api.get('/admin/users', {
        params: { role: roleFilter, page }
      });
      return res.data;
    }
  });

  // Mutation to Toggle Active Status
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, is_active }) => {
      return await api.patch(`/admin/users/${id}/status`, { is_active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
    }
  });

  // Mutation to Delete User
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      if (!window.confirm(t.admin?.confirmDelete || "Are you sure you want to PERMANENTLY delete this user?")) return;
      return await api.delete(`/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
    }
  });

  const users = data?.users || [];
  const filteredUsers = users.filter(u => 
    u.first_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Users className="text-primary" size={32} /> {t.admin?.userManagement || "User Management"}
          </h2>
          <p className="text-slate-500 mt-1">{t.admin?.monitorDesc || "Monitor and manage all students and scribes."}</p>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={t.admin?.searchPlaceholder || "Search by name or email..."} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select 
              value={roleFilter} 
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="pl-10 pr-8 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none appearance-none bg-white font-semibold"
            >
              <option value="">{t.admin?.allRoles || "All Roles"}</option>
              <option value="STUDENT">{t.admin?.students || "Students"}</option>
              <option value="SCRIBE">{t.admin?.scribes || "Scribes"}</option>
            </select>
          </div>
        </div>
      </div>

      {isError && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3">
          <AlertCircle /> <span>{t.admin?.failedLoad || "Failed to load users."}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">{t.admin?.table?.user || "User"}</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">{t.admin?.table?.role || "Role"}</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">{t.admin?.table?.status || "Status"}</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">{t.admin?.table?.joined || "Joined"}</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">{t.admin?.table?.actions || "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-slate-400 font-medium">{t.admin?.noUsers || "No users found."}</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${user.role === 'STUDENT' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                          {user.first_name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{user.first_name} {user.last_name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${user.role === 'STUDENT' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm font-medium">{user.is_active ? (t.admin?.status?.active || 'Active') : (t.admin?.status?.disabled || 'Disabled')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => toggleStatusMutation.mutate({ id: user.id, is_active: !user.is_active })}
                          className={`p-2 rounded-lg border transition-all ${user.is_active ? 'text-orange-600 border-orange-100 hover:bg-orange-50' : 'text-green-600 border-green-100 hover:bg-green-50'}`}
                          title={user.is_active ? "Disable Account" : "Enable Account"}
                        >
                          {user.is_active ? <UserMinus size={18} /> : <UserCheck size={18} />}
                        </button>
                        <button 
                          onClick={() => deleteMutation.mutate(user.id)}
                          className="p-2 text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition-all"
                          title="Delete Permanently"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center items-center gap-4">
        <button 
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
          className="px-4 py-2 rounded-lg border border-slate-200 disabled:opacity-50 font-bold"
        >
          Previous
        </button>
        <span className="font-bold text-slate-500">Page {page}</span>
        <button 
          disabled={!data?.has_more}
          onClick={() => setPage(p => p + 1)}
          className="px-4 py-2 rounded-lg border border-slate-200 disabled:opacity-50 font-bold"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default UserManagement;
