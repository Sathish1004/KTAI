import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Users, LogOut, Shield, Plus, Check, Pencil, Trash2, X, AlertTriangle, ArrowLeft, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import authService from '../services/authService';

export const EmployeeList = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State for Add Employee
  const [showAddForm, setShowAddForm] = useState(false);
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [registering, setRegistering] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editStatus, setEditStatus] = useState('Active');
  const [updating, setUpdating] = useState(false);

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState(null);
  const [deletingName, setDeletingName] = useState('');

  // Fetch employees from database
  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.getAllEmployees();
      if (res.status === 'success') {
        setEmployees(res.data.employees || []);
      } else {
        setError('Failed to fetch employees list.');
      }
    } catch (err) {
      console.error("fetchEmployees error:", err);
      const msg = err.response?.data?.message || 'Failed to load employees list from database.';
      setError(msg);
      toast.error('Failed to load employees list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Successfully logged out.');
  };

  // Add Employee Handler
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!empName || !empEmail || !empPassword) {
      toast.error('All fields are required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(empEmail)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (empPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }
    setRegistering(true);
    try {
      const res = await authService.registerEmployee(empName, empEmail, empPassword);
      if (res.status === 'success') {
        toast.success(`Employee account for "${empName}" created successfully!`);
        setEmpName('');
        setEmpEmail('');
        setEmpPassword('');
        setShowAddForm(false);
        fetchEmployees(); // Refresh list and count
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to register employee.';
      toast.error(msg);
    } finally {
      setRegistering(false);
    }
  };

  // Start Edit Handler
  const startEdit = (emp) => {
    setEditingId(emp.id);
    setEditName(emp.fullName || emp.name || '');
    setEditEmail(emp.email || '');
    setEditPassword('');
    setEditStatus(emp.status || 'Active');
  };

  // Cancel Edit Handler
  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditEmail('');
    setEditPassword('');
    setEditStatus('Active');
  };

  // Update Employee Handler
  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    if (!editName || !editEmail) {
      toast.error('Name and email are required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editEmail)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (editPassword && editPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }
    setUpdating(true);
    try {
      const res = await authService.updateEmployee(editingId, editName, editEmail, editPassword, editStatus);
      if (res.status === 'success') {
        toast.success('Employee details updated successfully!');
        cancelEdit();
        fetchEmployees(); // Refresh list and count
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update employee.';
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  };

  // Delete Employee Handler
  const handleDeleteEmployee = async (id) => {
    try {
      const res = await authService.deleteEmployee(id);
      if (res.status === 'success') {
        toast.success('Employee account deleted successfully.');
        setDeletingId(null);
        fetchEmployees(); // Refresh list and count
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete employee.';
      toast.error(msg);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center shadow-md cursor-pointer animate-[fadeIn_0.2s_ease-out]" onClick={() => navigate('/admin')}>
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path d="M12 3L2 8l10 5 10-5-10-5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17l10 5 10-5" stroke="#a3e635" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 2"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 leading-none cursor-pointer" onClick={() => navigate('/admin')}>KnowledgeFeed AI</h1>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Admin Workspace</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900">{user?.name || 'Admin KT'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3.5 py-1.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-all duration-150 text-xs font-bold cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6">
        
        {/* Navigation & Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button 
            onClick={() => navigate('/admin')}
            className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-600 hover:text-slate-950 transition cursor-pointer self-start"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchEmployees}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-slate-950 transition cursor-pointer"
              title="Refresh employee directory"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-[#a3e635] hover:bg-[#8ece24] text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm transition cursor-pointer inline-flex items-center gap-1.5 animate-[fadeIn_0.2s_ease-out]"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddForm ? 'Hide Form' : 'Add Employee'}</span>
            </button>
          </div>
        </div>

        {/* Page Title & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Header Description */}
          <div className="md:col-span-2 space-y-1">
            <h2 className="text-2xl font-black text-slate-950">Employee Directory</h2>
            <p className="text-xs text-slate-400">View, manage, edit and delete registered employee access credentials.</p>
          </div>

          {/* Stats Box */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-5.5 h-5.5" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{loading && employees.length === 0 ? '...' : employees.length}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Registered Employees</p>
            </div>
          </div>
        </div>

        {/* Collapsible Employee Registration Card */}
        {showAddForm && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-md space-y-6 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-950">Add New Employee Account</h3>
                <p className="text-xs text-slate-400">Register employee credentials below.</p>
              </div>
              <button onClick={() => setShowAddForm(false)} className="text-xs font-bold text-slate-500 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition cursor-pointer">Cancel</button>
            </div>
            <form onSubmit={handleAddEmployee} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Employee Full Name</label>
                <input type="text" placeholder="e.g. John Doe" value={empName} onChange={(e) => setEmpName(e.target.value)} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Email Address</label>
                <input type="email" placeholder="e.g. johndoe@gmail.com" value={empEmail} onChange={(e) => setEmpEmail(e.target.value)} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Assign Password</label>
                <input type="text" placeholder="e.g. employee123" value={empPassword} onChange={(e) => setEmpPassword(e.target.value)} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all font-medium" />
              </div>
              <div className="md:col-span-3 flex justify-end">
                <button type="submit" disabled={registering} className="px-6 py-3 bg-[#a3e635] hover:bg-[#8ece24] text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider shadow-md shadow-lime-300/10 cursor-pointer transition-colors disabled:opacity-50">{registering ? 'Creating...' : 'Register Employee'}</button>
              </div>
            </form>
          </div>
        )}

        {/* Main List Table */}
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-md overflow-hidden">
          {loading && employees.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center space-y-4">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-sm font-bold text-slate-500 font-mono">Loading registered employees...</p>
            </div>
          ) : error && employees.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <p className="text-sm font-bold text-red-500">{error}</p>
              <button onClick={fetchEmployees} className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-xs font-bold rounded-xl cursor-pointer">Try Again</button>
            </div>
          ) : employees.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="space-y-1">
                <p className="text-base font-bold text-slate-900">No employees registered yet</p>
                <p className="text-xs text-slate-400">Click "Add Employee" to create credentials for team members.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-slate-700 text-left border-collapse">
                <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-black border-b border-slate-200">
                  <tr>
                    <th className="p-4 sm:p-5">Employee Name</th>
                    <th className="p-4 sm:p-5">Email Address</th>
                    <th className="p-4 sm:p-5">Role</th>
                    <th className="p-4 sm:p-5 text-center">Status</th>
                    <th className="p-4 sm:p-5">Created Date</th>
                    <th className="p-4 sm:p-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((emp) => {
                    const isEditing = editingId === emp.id;
                    return (
                      <tr key={emp.id} className={`hover:bg-slate-50/50 transition-colors ${isEditing ? 'bg-slate-50/50' : ''}`}>
                        
                        {/* NAME */}
                        <td className="p-4 sm:p-5">
                          {isEditing ? (
                            <input 
                              type="text" 
                              value={editName} 
                              onChange={(e) => setEditName(e.target.value)} 
                              required 
                              className="px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none w-full max-w-[180px] bg-white font-medium focus:border-slate-950 focus:ring-4 focus:ring-slate-100" 
                            />
                          ) : (
                            <div className="font-bold text-slate-900">{emp.fullName || emp.name}</div>
                          )}
                        </td>

                        {/* EMAIL */}
                        <td className="p-4 sm:p-5 font-mono">
                          {isEditing ? (
                            <input 
                              type="email" 
                              value={editEmail} 
                              onChange={(e) => setEditEmail(e.target.value)} 
                              required 
                              className="px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none w-full max-w-[220px] bg-white font-medium focus:border-slate-950 focus:ring-4 focus:ring-slate-100" 
                            />
                          ) : (
                            emp.email
                          )}
                        </td>

                        {/* ROLE */}
                        <td className="p-4 sm:p-5">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/50 text-slate-800 text-[10px] font-extrabold uppercase tracking-wide">
                            {emp.role}
                          </span>
                        </td>

                        {/* STATUS */}
                        <td className="p-4 sm:p-5 text-center">
                          {isEditing ? (
                            <select 
                              value={editStatus} 
                              onChange={(e) => setEditStatus(e.target.value)}
                              className="px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none bg-white font-bold focus:border-slate-950"
                            >
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </select>
                          ) : (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                              (emp.status || 'Active').toLowerCase() === 'active' 
                                ? 'bg-lime-100 text-lime-800 border border-lime-200/50' 
                                : 'bg-red-100 text-red-800 border border-red-200/50'
                            }`}>
                              {emp.status || 'Active'}
                            </span>
                          )}
                        </td>

                        {/* CREATED DATE */}
                        <td className="p-4 sm:p-5 text-slate-400 font-medium">
                          {new Date(emp.createdAt || emp.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>

                        {/* ACTIONS */}
                        <td className="p-4 sm:p-5 text-right whitespace-nowrap">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-2">
                              {/* Password input during edit */}
                              <input 
                                type="text" 
                                placeholder="New password (optional)" 
                                value={editPassword} 
                                onChange={(e) => setEditPassword(e.target.value)} 
                                className="px-2.5 py-2 border border-slate-200 rounded-xl text-[11px] focus:outline-none bg-white max-w-[150px] font-medium focus:border-slate-950" 
                              />
                              <button 
                                onClick={handleUpdateEmployee}
                                disabled={updating}
                                className="px-3 py-2 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50 transition"
                              >
                                {updating ? 'Saving...' : 'Save'}
                              </button>
                              <button 
                                onClick={cancelEdit}
                                className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold cursor-pointer transition"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => startEdit(emp)}
                                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-slate-950 transition cursor-pointer"
                                title="Edit employee details"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => { setDeletingId(emp.id); setDeletingName(emp.fullName || emp.name); }}
                                className="p-1.5 border border-red-100 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 transition cursor-pointer"
                                title="Delete employee"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
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

        {/* Delete Confirmation Modal */}
        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 max-w-sm w-full shadow-xl space-y-6">
              <div className="space-y-3 text-center">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mx-auto border border-red-100">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-950">Delete Employee Account?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Are you sure you want to permanently delete the employee account for <strong className="text-slate-900 font-bold">"{deletingName}"</strong>? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => { setDeletingId(null); setDeletingName(''); }}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDeleteEmployee(deletingId)}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-red-200 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EmployeeList;
