import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Key, UserCheck, UserPlus, Trash2,
  AlertCircle, CheckCircle2, Lock, Mail, User, Phone, ShieldAlert
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { api } from '../services/api';
import { AdminUser } from '../types';

export const SecurityPage: React.FC = () => {
  const { admin } = useAdminAuth();

  // Change Credentials Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newName, setNewName] = useState(admin?.name || '');
  const [newEmail, setNewEmail] = useState(admin?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingCreds, setIsUpdatingCreds] = useState(false);
  const [credSuccessMsg, setCredSuccessMsg] = useState('');
  const [credErrorMsg, setCredErrorMsg] = useState('');

  // Create Staff / Admin Form State
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffRole, setStaffRole] = useState<'admin' | 'staff'>('staff');
  const [isCreatingStaff, setIsCreatingStaff] = useState(false);
  const [staffSuccessMsg, setStaffSuccessMsg] = useState('');
  const [staffErrorMsg, setStaffErrorMsg] = useState('');

  // Admins List State
  const [adminList, setAdminList] = useState<AdminUser[]>([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAdminList = async () => {
    try {
      const data = await api.getAdmins();
      setAdminList(data || []);
    } catch (err: any) {
      console.error('Failed to load admin list', err);
    } finally {
      setIsLoadingAdmins(false);
    }
  };

  useEffect(() => {
    fetchAdminList();
    if (admin) {
      setNewName(admin.name);
      setNewEmail(admin.email);
    }
  }, [admin]);

  const handleChangeCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredSuccessMsg('');
    setCredErrorMsg('');

    if (!currentPassword) {
      setCredErrorMsg('Please enter your current password to authorize changes.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setCredErrorMsg('New password and confirm password do not match.');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setCredErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    setIsUpdatingCreds(true);
    try {
      const payload: any = {
        current_password: currentPassword,
        new_name: newName.trim() || undefined,
        new_email: newEmail.trim() || undefined,
        new_password: newPassword.trim() || undefined
      };

      const res = await api.changeCredentials(payload);

      // If token returned, update local storage
      if (res.access_token) {
        localStorage.setItem('bd_admin_token', res.access_token);
      }

      setCredSuccessMsg(res.message || 'Credentials updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      fetchAdminList();
    } catch (err: any) {
      setCredErrorMsg(err.message || 'Failed to update credentials. Please verify your current password.');
    } finally {
      setIsUpdatingCreds(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffSuccessMsg('');
    setStaffErrorMsg('');

    if (!staffName.trim() || !staffEmail.trim() || !staffPassword.trim()) {
      setStaffErrorMsg('Please fill in Name, Email and Password.');
      return;
    }

    if (staffPassword.length < 6) {
      setStaffErrorMsg('Staff password must be at least 6 characters.');
      return;
    }

    setIsCreatingStaff(true);
    try {
      await api.createAdmin({
        name: staffName.trim(),
        email: staffEmail.trim(),
        phone: staffPhone.trim() || '+91 98765 00000',
        password: staffPassword.trim(),
        role: staffRole
      });

      setStaffSuccessMsg(`New ${staffRole === 'admin' ? 'Administrator' : 'Kitchen Staff'} account created for ${staffEmail}!`);
      setStaffName('');
      setStaffEmail('');
      setStaffPhone('');
      setStaffPassword('');
      fetchAdminList();
    } catch (err: any) {
      setStaffErrorMsg(err.message || 'Failed to create account.');
    } finally {
      setIsCreatingStaff(false);
    }
  };

  const handleDeleteAdmin = async (id: string, email: string) => {
    if (!window.confirm(`Are you sure you want to revoke access for ${email}?`)) return;
    setDeletingId(id);
    try {
      await api.deleteAdmin(id);
      await fetchAdminList();
    } catch (err: any) {
      alert(err.message || 'Failed to delete account');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-5xl">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-brand-600" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Admin Security & Credentials
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Change your administrator username and password, manage kitchen staff credentials, and view active accounts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ================= SECTION 1: CHANGE CURRENT ADMIN CREDENTIALS ================= */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Key className="w-5 h-5 text-brand-600" />
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Change Your Login Credentials
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Update your login email, display username, and password
              </p>
            </div>
          </div>

          {credSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{credSuccessMsg}</span>
            </div>
          )}

          {credErrorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{credErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handleChangeCredentials} className="space-y-4 text-xs">
            {/* Current Password Verification */}
            <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-1.5">
              <label className="font-extrabold text-amber-900 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                Current Password (Required for Security Verification) *
              </label>
              <input
                type="password"
                required
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[10px] text-amber-700 block">
                Required before modifying any login details.
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Admin Display Name / Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Master Chef / Restaurant Owner"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Admin Login Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  placeholder="admin@basaveshwara.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-brand-500"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                You will use this new email to log into the Restaurant Dashboard.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  New Password (Optional)
                </label>
                <input
                  type="password"
                  placeholder="Leave blank to keep same"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdatingCreds}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-extrabold rounded-2xl shadow-lg shadow-brand-600/20 transition active:scale-98"
            >
              {isUpdatingCreds ? 'Updating Credentials...' : 'Save Updated Admin Credentials'}
            </button>
          </form>
        </div>

        {/* ================= SECTION 2: CREATE NEW ADMIN / STAFF ================= */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Create Staff / Admin Account
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Add login access for kitchen managers or cashiers
              </p>
            </div>
          </div>

          {staffSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{staffSuccessMsg}</span>
            </div>
          )}

          {staffErrorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{staffErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Staff Member Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar (Kitchen Lead)"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Login Email *</label>
                <input
                  type="email"
                  required
                  placeholder="staff@basaveshwara.com"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 11111"
                  value={staffPhone}
                  onChange={(e) => setStaffPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Initial Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Access Role *</label>
                <select
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-brand-500"
                >
                  <option value="staff">Kitchen Staff (Orders & Menu)</option>
                  <option value="admin">Full Administrator</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isCreatingStaff}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-600/20 transition active:scale-98"
            >
              {isCreatingStaff ? 'Creating Account...' : 'Create Staff Login Account'}
            </button>
          </form>
        </div>
      </div>

      {/* ================= SECTION 3: ACTIVE ADMIN & STAFF ACCOUNTS LIST ================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-brand-600" />
            <h3 className="font-extrabold text-base text-slate-900">
              Active Authorized Accounts ({adminList.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Authorized to log into /restaurant/login
          </span>
        </div>

        {isLoadingAdmins ? (
          <div className="py-8 text-center text-slate-400 text-xs font-semibold">
            Loading authorized accounts...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Name</th>
                  <th className="py-3 px-3">Email Address</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {adminList.map((usr) => {
                  const isCurrent = usr.email === admin?.email || usr.id === admin?.id;
                  return (
                    <tr key={usr.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{usr.name}</span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 text-[10px] font-black">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-600">{usr.email}</td>
                      <td className="py-3.5 px-3 text-slate-500">{usr.phone || '—'}</td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            usr.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {usr.role === 'admin' ? 'Administrator' : 'Kitchen Staff'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        {isCurrent ? (
                          <span className="text-[10px] text-slate-400 italic font-semibold">Active Session</span>
                        ) : (
                          <button
                            type="button"
                            disabled={deletingId === usr.id}
                            onClick={() => handleDeleteAdmin(usr.id, usr.email)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Revoke Access"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
