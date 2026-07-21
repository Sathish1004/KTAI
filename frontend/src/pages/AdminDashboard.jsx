import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, LogOut, Users, FileText, Settings, Shield, 
  FolderPlus, Layers, Calendar, Link, Check, Plus, Trash2, 
  Upload, Sparkles, Folder, File, ExternalLink, MoreVertical, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import authService from '../services/authService';
import projectService from '../services/projectService';
import onboardingImg from '../assets/ai_developer_onboarding.png';

export const AdminDashboard = () => {
  const { user, logout } = useAuth();

  // Employee Form State
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [registering, setRegistering] = useState(false);

  // Project Wizard State
  const [showProjectWizard, setShowProjectWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [employeesOptions, setEmployeesOptions] = useState([]);
  const [existingProjects, setExistingProjects] = useState([]);

  // Project Info States
  const [projName, setProjName] = useState('');
  const [projClient, setProjClient] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projDomain, setProjDomain] = useState('');
  const [projTech, setProjTech] = useState('');
  const [projGit, setProjGit] = useState('');
  const [projApi, setProjApi] = useState('');
  const [projDb, setProjDb] = useState('');
  const [projStatus, setProjStatus] = useState('Planning');
  const [projStart, setProjStart] = useState('');
  const [projEnd, setProjEnd] = useState('');

  // Senior Dev Info States
  const [devName, setDevName] = useState('');
  const [devEmail, setDevEmail] = useState('');
  const [devPhone, setDevPhone] = useState('');
  const [devRole, setDevRole] = useState('');
  const [devFrom, setDevFrom] = useState('');
  const [devTo, setDevTo] = useState('');
  const [devResp, setDevResp] = useState('');
  const [devKt, setDevKt] = useState('');

  // Assignments States
  const [assignedEmployees, setAssignedEmployees] = useState({});

  // Resources/Feed States
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceLink, setResourceLink] = useState('');
  const [addedResources, setAddedResources] = useState([]);
  const [projectNotes, setProjectNotes] = useState('');
  const [accessEnabled, setAccessEnabled] = useState(true);

  // Upload States
  const [createdProjectId, setCreatedProjectId] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');

  // Edit & Delete States
  const [isEditing, setIsEditing] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');

  // 2-Step Employee Disabling verification states
  const [disablingEmployee, setDisablingEmployee] = useState(null);
  const [disableEmpStep, setDisableEmpStep] = useState(1);
  const [disableEmpInput, setDisableEmpInput] = useState('');

  // Fetch initial option lists on load
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const empRes = await projectService.getEmployeesList();
      if (empRes.status === 'success') {
        setEmployeesOptions(empRes.data.employees);
      }
      const projRes = await projectService.getProjects();
      if (projRes.status === 'success') {
        setExistingProjects(projRes.data.projects);
      }
    } catch (error) {
      console.error("Error loading options list:", error);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Successfully logged out.');
  };

  // Register a new employee (original feature)
  const handleRegisterEmployee = async (e) => {
    e.preventDefault();
    if (!empName || !empEmail || !empPassword) {
      toast.error('All fields are required.');
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
        setShowEmployeeForm(false);
        // Refresh employees list
        loadDashboardData();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to register employee.';
      toast.error(msg);
    } finally {
      setRegistering(false);
    }
  };

  // Employee Selection Helper
  const handleEmployeeCheck = (empId, checked) => {
    setAssignedEmployees((prev) => ({
      ...prev,
      [empId]: {
        ...prev[empId],
        checked,
        uid: prev[empId]?.uid || '',
        dept: prev[empId]?.dept || '',
        desig: prev[empId]?.desig || '',
        is_enabled: prev[empId]?.is_enabled !== undefined ? prev[empId].is_enabled : true
      }
    }));
  };

  const handleAssignmentMeta = (empId, field, val) => {
    setAssignedEmployees((prev) => ({
      ...prev,
      [empId]: {
        ...prev[empId],
        [field]: val
      }
    }));
  };

  // Resources List helpers
  const handleAddLinkResource = () => {
    if (!resourceTitle || !resourceLink) {
      toast.error('Please enter both resource title and URL link.');
      return;
    }
    setAddedResources((prev) => [
      ...prev,
      { resource_type: 'link', title: resourceTitle, url: resourceLink }
    ]);
    setResourceTitle('');
    setResourceLink('');
    toast.success('Link resource added!');
  };

  const handleRemoveResource = (index) => {
    setAddedResources((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Create Project Form Submit
  const handleCreateProject = async () => {
    const assignmentsList = Object.keys(assignedEmployees)
      .filter((id) => assignedEmployees[id].checked)
      .map((id) => {
        const empOpt = employeesOptions.find((e) => e.id === parseInt(id));
        return {
          employee_id: parseInt(id),
          employee_name: empOpt?.name || 'Employee',
          employee_email: empOpt?.email || '',
          emp_uid: assignedEmployees[id].uid,
          department: assignedEmployees[id].dept,
          designation: assignedEmployees[id].desig,
          is_enabled: assignedEmployees[id].is_enabled ? 1 : 0,
          assigned_date: new Date().toISOString().split('T')[0]
        };
      });

    const resourcesList = [...addedResources];
    if (projectNotes) {
      resourcesList.push({
        resource_type: 'note',
        title: 'Project Notes',
        notes: projectNotes
      });
    }

    const payload = {
      name: projName,
      client: projClient,
      description: projDesc,
      domain: projDomain,
      tech_stack: projTech,
      github_url: projGit,
      api_url: projApi,
      db_name: projDb,
      status: projStatus,
      start_date: projStart,
      end_date: projEnd,
      senior_dev_name: devName,
      senior_dev_email: devEmail,
      senior_dev_phone: devPhone,
      senior_dev_role: devRole,
      senior_dev_working_from: devFrom,
      senior_dev_working_to: devTo,
      senior_dev_responsibilities: devResp,
      senior_dev_kt_notes: devKt,
      is_access_enabled: accessEnabled ? 1 : 0,
      assignments: assignmentsList,
      resources: resourcesList
    };

    setRegistering(true);
    try {
      if (isEditing) {
        const res = await projectService.updateProject(editingProjectId, payload);
        if (res.status === 'success') {
          toast.success(`Project "${projName}" updated successfully!`);
          loadDashboardData();
          resetProjectWizard();
        }
      } else {
        const res = await projectService.createProject(payload);
        if (res.status === 'success') {
          toast.success(`Project "${projName}" created successfully!`);
          setCreatedProjectId(res.data.projectId);
          loadDashboardData();
          setWizardStep(5); // Proceed to RAG File upload
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to save project.');
    } finally {
      setRegistering(false);
    }
  };

  // Multer Document Upload Submit (and auto-indexing RAG)
  const handleResourceUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !createdProjectId) {
      toast.error('Please choose a document to upload.');
      return;
    }

    setUploadingFile(true);
    try {
      const res = await projectService.uploadResource(createdProjectId, selectedFile, uploadTitle);
      if (res.status === 'success') {
        toast.success('Document uploaded and AI RAG indexed successfully!');
        setSelectedFile(null);
        setUploadTitle('');
      }
    } catch (error) {
      console.error(error);
      toast.error('Resource upload failed.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleEditClick = async (projectId) => {
    setActiveDropdownId(null);
    try {
      const res = await projectService.getProject(projectId);
      if (res.status === 'success') {
        const { project, assignments, resources } = res.data;
        
        // Populate Step 1
        setProjName(project.name || '');
        setProjClient(project.client || '');
        setProjDesc(project.description || '');
        setProjDomain(project.domain || '');
        setProjTech(project.tech_stack || '');
        setProjGit(project.github_url || '');
        setProjApi(project.api_url || '');
        setProjDb(project.db_name || '');
        setProjStatus(project.status || 'Planning');
        setProjStart(project.start_date || '');
        setProjEnd(project.end_date || '');

        // Populate Step 2
        setDevName(project.senior_dev_name || '');
        setDevEmail(project.senior_dev_email || '');
        setDevPhone(project.senior_dev_phone || '');
        setDevRole(project.senior_dev_role || '');
        setDevFrom(project.senior_dev_working_from || '');
        setDevTo(project.senior_dev_working_to || '');
        setDevResp(project.senior_dev_responsibilities || '');
        setDevKt(project.senior_dev_kt_notes || '');

        // Populate Step 3
        const assignState = {};
        assignments.forEach((asg) => {
          assignState[asg.employee_id] = {
            checked: true,
            uid: asg.emp_uid || '',
            dept: asg.department || '',
            desig: asg.designation || '',
            is_enabled: asg.is_enabled === 1
          };
        });
        setAssignedEmployees(assignState);

        // Populate Step 4
        const links = resources.filter((r) => r.resource_type === 'link');
        const notes = resources.find((r) => r.resource_type === 'note');
        setAddedResources(links);
        setProjectNotes(notes ? notes.notes : '');
        setAccessEnabled(project.is_access_enabled === 1);

        setIsEditing(true);
        setEditingProjectId(projectId);
        setShowProjectWizard(true);
        setWizardStep(1);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load project details for editing.');
    }
  };

  const handleDeleteClick = (project) => {
    setActiveDropdownId(null);
    setDeletingProject(project);
    setDeleteConfirmInput('');
  };

  const handleDeleteSubmit = async () => {
    if (!deletingProject || deleteConfirmInput !== deletingProject.name) {
      toast.error('Confirmation input does not match project name.');
      return;
    }

    try {
      const res = await projectService.deleteProject(deletingProject.id);
      if (res.status === 'success') {
        toast.success(`Project "${deletingProject.name}" deleted successfully.`);
        setDeletingProject(null);
        setDeleteConfirmInput('');
        loadDashboardData();
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete project.');
    }
  };

  const resetProjectWizard = () => {
    setShowProjectWizard(false);
    setWizardStep(1);
    setIsEditing(false);
    setEditingProjectId(null);
    setProjName(''); setProjClient(''); setProjDesc(''); setProjDomain(''); setProjTech(''); setProjGit(''); setProjApi(''); setProjDb(''); setProjStatus('Planning'); setProjStart(''); setProjEnd('');
    setDevName(''); setDevEmail(''); setDevPhone(''); setDevRole(''); setDevFrom(''); setDevTo(''); setDevResp(''); setDevKt('');
    setAssignedEmployees({});
    setAddedResources([]); setProjectNotes(''); setAccessEnabled(true);
    setCreatedProjectId(null); setSelectedFile(null); setUploadTitle('');
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col font-sans text-slate-900 text-left">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center shadow-md">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path d="M12 3L2 8l10 5 10-5-10-5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17l10 5 10-5" stroke="#a3e635" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 2"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 leading-none">KnowledgeFeed AI</h1>
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
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-100/20 to-violet-50 border border-blue-100/50 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden text-left min-h-[280px]">
          <div className="space-y-4 max-w-xl relative z-10 md:py-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 text-blue-700" />
              <span>Administrative Portal</span>
            </div>
            <h2 className="text-2xl md:text-3.5xl font-black text-slate-950 leading-tight">
              Welcome Back, <span className="text-blue-600">{user?.name || 'Admin KT'}</span>!
            </h2>
            <p className="text-slate-500 text-xs md:text-sm leading-relaxed max-w-md">
              From this portal, you can register employee accounts, upload project documents to the vector DB, and manage general access.
            </p>
          </div>

          <div className="hidden md:block absolute right-0 bottom-0 h-full w-[45%] pointer-events-none select-none">
            <img 
              src={onboardingImg} 
              alt="AI Onboarding illustration" 
              className="w-full h-full object-contain object-bottom scale-105 origin-bottom"
            />
          </div>
        </div>

        {/* Action Blocks Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Employee Management Trigger */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex items-start gap-4 hover:border-slate-300 transition-colors">
            <div className="p-3 bg-slate-100 text-slate-900 rounded-xl">
              <Users className="w-5.5 h-5.5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-950 text-sm">Employee Management</h3>
              <p className="text-xs text-slate-400 leading-normal">Create access credentials for new team members.</p>
              <div className="pt-2">
                <button 
                  onClick={() => { setShowEmployeeForm(!showEmployeeForm); setShowProjectWizard(false); }}
                  className="text-xs font-bold text-slate-950 hover:underline transition inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{showEmployeeForm ? 'Hide Form' : 'Manage Employees'}</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>

          {/* Project Directories Trigger */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex items-start gap-4 hover:border-slate-300 transition-colors">
            <div className="p-3 bg-slate-100 text-slate-900 rounded-xl">
              <Plus className="w-5.5 h-5.5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-950 text-sm">Project Directories</h3>
              <p className="text-xs text-slate-400 leading-normal">Add directories, set repo links, assign employees.</p>
              <div className="pt-2">
                <button 
                  onClick={() => { setShowProjectWizard(!showProjectWizard); setShowEmployeeForm(false); }}
                  className="text-xs font-bold text-slate-950 hover:underline transition inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{showProjectWizard ? 'Hide Creator' : 'Manage Projects'}</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>

          {/* AI Indexer info */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex items-start gap-4 hover:border-slate-300 transition-colors">
            <div className="p-3 bg-lime-50 text-slate-900 rounded-xl border border-lime-100/50">
              <FileText className="w-5.5 h-5.5 text-slate-950" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-950 text-sm">AI RAG Indexer status</h3>
              <p className="text-xs text-slate-400 leading-normal">Create a project and upload resources to trigger embeddings.</p>
              <div className="pt-2 text-xs text-lime-600 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>RAG Pipeline Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Employee Registration Card */}
        {showEmployeeForm && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-md space-y-6 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-950">Add New Employee Account</h3>
                <p className="text-xs text-slate-400">Register employee credentials below.</p>
              </div>
              <button onClick={() => setShowEmployeeForm(false)} className="text-xs font-bold text-slate-500 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition cursor-pointer">Cancel</button>
            </div>
            <form onSubmit={handleRegisterEmployee} className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        {/* Collapsible Project Knowledge Management Wizard */}
        {showProjectWizard && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-lg space-y-8 animate-[fadeIn_0.2s_ease-out]">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-950 flex items-center gap-2">
                  <FolderPlus className="w-6 h-6 text-[#a3e635] fill-slate-950" />
                  <span>{isEditing ? 'Edit Project Knowledge Profile' : 'Project Knowledge Management Creator'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Multi-step setup for project specifications, team assignments, and AI indexable resource logs.</p>
              </div>
              <button onClick={resetProjectWizard} className="text-xs font-bold text-slate-500 hover:text-slate-900 border border-slate-200 px-3.5 py-2 rounded-xl hover:bg-slate-50 cursor-pointer">
                Cancel
              </button>
            </div>

            {/* Steps Nav indicator */}
            <div className="flex items-center justify-between border border-slate-100 bg-slate-50/50 p-2.5 rounded-2xl max-w-4xl w-full mx-auto gap-1">
              {[
                { step: 1, label: 'Project Info' },
                { step: 2, label: 'Senior Team' },
                { step: 3, label: 'Employee Assignments' },
                { step: 4, label: 'Resource Settings' },
                { step: 5, label: 'AI Indexing Files' }
              ].map((s) => (
                <button 
                  key={s.step} 
                  onClick={() => {
                    if (s.step === 5 && !isEditing && !createdProjectId) {
                      toast.error('Please complete Step 4 and save the project first before uploading files.');
                      return;
                    }
                    setWizardStep(s.step);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition cursor-pointer select-none focus:outline-none ${
                    wizardStep === s.step ? 'bg-white shadow-sm border border-slate-100' : 'hover:bg-slate-200/30'
                  }`}
                >
                  <span className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-black border ${
                    wizardStep >= s.step 
                      ? 'bg-slate-950 text-white border-slate-950' 
                      : 'bg-white text-slate-400 border-slate-200'
                  }`}>
                    {wizardStep > s.step ? <Check className="w-3 h-3 text-[#a3e635]" /> : s.step}
                  </span>
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider hidden lg:inline ${
                    wizardStep === s.step ? 'text-slate-950 font-black' : 'text-slate-400'
                  }`}>
                    {s.label}
                  </span>
                </button>
              ))}
            </div>

            {/* STEP CONTROLLER CONTAINER */}
            
            {/* STEP 1: Project Information */}
            {wizardStep === 1 && (
              <div className="space-y-6 max-w-4xl mx-auto animate-[fadeIn_0.15s_ease-out]">
                <h4 className="text-sm font-black text-slate-950 border-b border-slate-100 pb-2">Step 1: Project Base Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Project Name *</label><input type="text" placeholder="e.g. AI Resume Analyzer" value={projName} onChange={(e) => setProjName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950 focus:bg-white" /></div>
                  <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Client Name *</label><input type="text" placeholder="e.g. Prolync Inc." value={projClient} onChange={(e) => setProjClient(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950 focus:bg-white" /></div>
                  <div className="md:col-span-2 space-y-1.5"><label className="text-xs font-bold text-slate-700">Project Description</label><textarea rows="3" placeholder="Brief details about project objectives..." value={projDesc} onChange={(e) => setProjDesc(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950 focus:bg-white resize-none"></textarea></div>
                  <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Business Domain</label><input type="text" placeholder="e.g. EdTech, FinTech" value={projDomain} onChange={(e) => setProjDomain(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950" /></div>
                  <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Technology Stack</label><input type="text" placeholder="e.g. React, Express, MySQL" value={projTech} onChange={(e) => setProjTech(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950" /></div>
                  <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">GitHub Repository URL</label><input type="url" placeholder="https://github.com/..." value={projGit} onChange={(e) => setProjGit(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950" /></div>
                  <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">API Base URL</label><input type="url" placeholder="https://api.project.com" value={projApi} onChange={(e) => setProjApi(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950" /></div>
                  <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Database Name</label><input type="text" placeholder="e.g. resume_db" value={projDb} onChange={(e) => setProjDb(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950" /></div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Project Status</label>
                    <select value={projStatus} onChange={(e) => setProjStatus(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950 focus:bg-white">
                      <option>Planning</option><option>Development</option><option>Testing</option><option>Live</option><option>Maintenance</option>
                    </select>
                  </div>
                  <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Start Date</label><input type="date" value={projStart} onChange={(e) => setProjStart(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none" /></div>
                  <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">End Date</label><input type="date" value={projEnd} onChange={(e) => setProjEnd(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none" /></div>
                </div>
                <div className="flex justify-end pt-4">
                  <button onClick={() => {
                    if (!projName || !projClient) { toast.error('Project and Client Name are required.'); return; }
                    setWizardStep(2);
                  }} className="px-6 py-2.5 bg-slate-950 text-white font-bold rounded-xl text-xs tracking-wider uppercase hover:bg-slate-900 cursor-pointer">Next: Senior Team →</button>
                </div>
              </div>
            )}

            {/* STEP 2: Senior Team Information */}
            {wizardStep === 2 && (
              <div className="space-y-6 max-w-4xl mx-auto animate-[fadeIn_0.15s_ease-out]">
                <h4 className="text-sm font-black text-slate-950 border-b border-slate-100 pb-2">Step 2: Senior Team Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Senior Developer Name</label><input type="text" placeholder="e.g. Sathish Sharma" value={devName} onChange={(e) => setDevName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none" /></div>
                  <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Senior Developer Email</label><input type="email" placeholder="e.g. sathish@company.com" value={devEmail} onChange={(e) => setDevEmail(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none" /></div>
                  <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Phone Number</label><input type="tel" placeholder="+91..." value={devPhone} onChange={(e) => setDevPhone(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none" /></div>
                  <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Role</label><input type="text" placeholder="e.g. Lead Technical Architect" value={devRole} onChange={(e) => setDevRole(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none" /></div>
                  <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Working From Date</label><input type="date" value={devFrom} onChange={(e) => setDevFrom(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none" /></div>
                  <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Working To Date</label><input type="date" value={devTo} onChange={(e) => setDevTo(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none" /></div>
                  <div className="md:col-span-2 space-y-1.5"><label className="text-xs font-bold text-slate-700">Core Responsibilities</label><textarea rows="2" placeholder="Responsibilities handled by developer..." value={devResp} onChange={(e) => setDevResp(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none resize-none"></textarea></div>
                  <div className="md:col-span-2 space-y-1.5"><label className="text-xs font-bold text-slate-700">Knowledge Transfer Notes</label><textarea rows="2" placeholder="KT notes, folder locations, credential details..." value={devKt} onChange={(e) => setDevKt(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none resize-none"></textarea></div>
                </div>
                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <button onClick={() => setWizardStep(1)} className="px-6 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">← Back</button>
                  <button onClick={() => setWizardStep(3)} className="px-6 py-2.5 bg-slate-950 text-white font-bold rounded-xl text-xs tracking-wider uppercase hover:bg-slate-900 cursor-pointer">Next: Employee Assignment →</button>
                </div>
              </div>
            )}

            {/* STEP 3: Employee Assignment */}
            {wizardStep === 3 && (
              <div className="space-y-6 max-w-4xl mx-auto animate-[fadeIn_0.15s_ease-out]">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-black text-slate-950">Step 3: Assign Employee Access</h4>
                  <span className="text-xs text-slate-400">Assign one or more employee accounts below.</span>
                </div>
                
                {employeesOptions.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No employee accounts registered. Go to "Employee Management" to register employees first.</p>
                ) : (
                  <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-inner max-h-[350px] overflow-y-auto">
                    <table className="w-full text-xs text-slate-700">
                      <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-black text-left border-b border-slate-200">
                        <tr>
                          <th className="p-3 w-12 text-center">Select</th>
                          <th className="p-3">Employee Name</th>
                          <th className="p-3">Employee ID</th>
                          <th className="p-3">Department</th>
                          <th className="p-3">Designation</th>
                          <th className="p-3 text-center">Access Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {employeesOptions.map((emp) => {
                          const state = assignedEmployees[emp.id] || { checked: false, uid: '', dept: '', desig: '', is_enabled: true };
                          return (
                            <tr key={emp.id} className={`hover:bg-slate-50/50 transition-colors ${state.checked ? 'bg-lime-50/10' : ''}`}>
                              <td className="p-3 text-center">
                                <input 
                                  type="checkbox" 
                                  checked={state.checked} 
                                  onChange={(e) => handleEmployeeCheck(emp.id, e.target.checked)}
                                  className="w-4 h-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950 cursor-pointer"
                                />
                              </td>
                              <td className="p-3">
                                <p className="font-bold text-slate-900">{emp.name}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{emp.email}</p>
                              </td>
                              <td className="p-3">
                                <input 
                                  type="text" 
                                  placeholder="EMP-101" 
                                  value={state.uid} 
                                  disabled={!state.checked}
                                  onChange={(e) => handleAssignmentMeta(emp.id, 'uid', e.target.value)}
                                  className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-[11px] disabled:opacity-50"
                                />
                              </td>
                              <td className="p-3">
                                <input 
                                  type="text" 
                                  placeholder="Engineering" 
                                  value={state.dept} 
                                  disabled={!state.checked}
                                  onChange={(e) => handleAssignmentMeta(emp.id, 'dept', e.target.value)}
                                  className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-[11px] disabled:opacity-50"
                                />
                              </td>
                              <td className="p-3">
                                <input 
                                  type="text" 
                                  placeholder="Frontend Dev" 
                                  value={state.desig} 
                                  disabled={!state.checked}
                                  onChange={(e) => handleAssignmentMeta(emp.id, 'desig', e.target.value)}
                                  className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-[11px] disabled:opacity-50"
                                />
                              </td>
                              <td className="p-3 text-center">
                                <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                                  <input 
                                    type="checkbox" 
                                    checked={state.checked ? state.is_enabled : false}
                                    disabled={!state.checked}
                                    onChange={(e) => {
                                      const wantsCheck = e.target.checked;
                                      if (!wantsCheck) {
                                        setDisablingEmployee({ id: emp.id, name: emp.name });
                                        setDisableEmpStep(1);
                                        setDisableEmpInput('');
                                      } else {
                                        handleAssignmentMeta(emp.id, 'is_enabled', true);
                                      }
                                    }}
                                    className="w-4 h-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950 cursor-pointer disabled:opacity-50"
                                  />
                                  <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
                                    !state.checked ? 'text-slate-300' :
                                    state.is_enabled ? 'text-emerald-600' : 'text-rose-500'
                                  }`}>
                                    {state.is_enabled && state.checked ? 'Enabled' : 'Disabled'}
                                  </span>
                                </label>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <button onClick={() => setWizardStep(2)} className="px-6 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">← Back</button>
                  <button onClick={() => setWizardStep(4)} className="px-6 py-2.5 bg-slate-950 text-white font-bold rounded-xl text-xs tracking-wider uppercase hover:bg-slate-900 cursor-pointer">Next: Resources →</button>
                </div>
              </div>
            )}

            {/* STEP 4: Resource Configuration & Save */}
            {wizardStep === 4 && (
              <div className="space-y-6 max-w-4xl mx-auto animate-[fadeIn_0.15s_ease-out]">
                <h4 className="text-sm font-black text-slate-950 border-b border-slate-100 pb-2">Step 4: Project Resources & Access Feed</h4>
                
                {/* Links Configuration */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Add Repository / API Links</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input type="text" placeholder="e.g. GitHub Repository, API Docs" value={resourceTitle} onChange={(e) => setResourceTitle(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none" />
                    <input type="url" placeholder="https://..." value={resourceLink} onChange={(e) => setResourceLink(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none" />
                    <button type="button" onClick={handleAddLinkResource} className="px-4 py-2 border border-slate-900 rounded-xl text-xs font-bold text-slate-900 hover:bg-slate-50 flex items-center justify-center gap-1 cursor-pointer">
                      <Plus className="w-3.5 h-3.5" />
                      Add Link
                    </button>
                  </div>

                  {/* Render added list */}
                  {addedResources.length > 0 && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Added Resources:</span>
                      <div className="space-y-1">
                        {addedResources.map((res, i) => (
                          <div key={i} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200/50">
                            <span className="font-semibold">{res.title} - <a href={res.url} target="_blank" className="text-slate-400 hover:underline">{res.url}</a></span>
                            <button type="button" onClick={() => handleRemoveResource(i)} className="text-rose-600 hover:text-rose-800 cursor-pointer">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Project Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Onboarding Project Notes</label>
                  <textarea rows="3" placeholder="General instructions, business rules, or RAG guidance guidelines..." value={projectNotes} onChange={(e) => setProjectNotes(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none resize-none"></textarea>
                </div>

                {/* Access feed configuration */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50 flex items-center justify-between">
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-slate-950">Enable Knowledge Feed to Employees</h5>
                    <p className="text-[10px] text-slate-400">If disabled, assigned employees will temporarily lose access to view this directory.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={accessEnabled} 
                    onChange={(e) => setAccessEnabled(e.target.checked)}
                    className="w-10 h-5 rounded-full bg-slate-300 text-slate-950 focus:ring-0 checked:bg-[#a3e635] cursor-pointer"
                  />
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <button onClick={() => setWizardStep(3)} className="px-6 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">← Back</button>
                  <button onClick={handleCreateProject} disabled={registering} className="px-6 py-3 bg-[#a3e635] hover:bg-[#8ece24] text-slate-950 font-bold rounded-xl text-xs tracking-wider uppercase shadow-md shadow-lime-300/10 cursor-pointer disabled:opacity-50 transition-colors">
                    {registering ? 'Saving Data...' : 'Save & Proceed to Upload Files'}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: AI Integration & Document Upload (File RAG Indexing) */}
            {wizardStep === 5 && (
              <div className="space-y-6 max-w-4xl mx-auto animate-[fadeIn_0.15s_ease-out]">
                
                <div className="p-5 bg-lime-50 border border-lime-200 rounded-2xl space-y-2 text-left">
                  <div className="flex items-center gap-2 text-slate-950 font-extrabold text-sm">
                    <Sparkles className="w-5 h-5 text-slate-950" />
                    <span>Project Saved Successfully!</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-normal">
                    The project has been registered. You can now upload PDF documentation, API specs, database schemas, or technical files to the project directory. The AI system will **automatically parse and index** this content using RAG so that the assigned employees can query it.
                  </p>
                </div>

                <h4 className="text-sm font-black text-slate-950 border-b border-slate-100 pb-2">Step 5: Upload Files for AI Indexing</h4>
                
                <form onSubmit={handleResourceUpload} className="space-y-4 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Document Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Architecture Schema, API v1 Manual" 
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Select File (PDF, DOCX, Images, MD)</label>
                      <input 
                        type="file" 
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        required
                        className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button 
                      type="submit" 
                      disabled={uploadingFile}
                      className="px-6 py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-xl text-xs tracking-wider uppercase flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingFile ? 'Uploading & Indexing RAG...' : 'Upload & Train AI'}</span>
                    </button>
                  </div>
                </form>

                <div className="flex justify-end pt-6 border-t border-slate-100">
                  <button onClick={resetProjectWizard} className="px-6 py-3 bg-[#a3e635] hover:bg-[#8ece24] text-slate-950 font-bold rounded-xl text-xs tracking-wider uppercase shadow-md shadow-lime-300/10 cursor-pointer">
                    Finish & Close
                  </button>
                </div>

              </div>
            )}

          </div>
        )}

        {/* Danger Zone: GitHub-style deletion verification */}
        {deletingProject && (
          <div className="mb-6 p-6 border-2 border-rose-200 bg-rose-50/30 rounded-3xl space-y-4 text-left animate-[fadeIn_0.2s_ease-out] max-w-4xl">
            <div className="flex items-center gap-2 text-rose-700 font-extrabold text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>Danger Zone: Delete Project "{deletingProject.name}"</span>
            </div>
            <div className="text-xs text-slate-600 space-y-2">
              <p>This action <strong>cannot</strong> be undone. This will permanently delete the project record, unassign all employees, and delete all technical resources from the AI RAG database.</p>
              <p className="font-bold">To confirm, please type <span className="font-mono text-rose-700 font-black px-1.5 py-0.5 bg-rose-100 rounded">{deletingProject.name}</span> in the box below:</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input 
                type="text" 
                placeholder="Enter project name to confirm" 
                value={deleteConfirmInput}
                onChange={(e) => setDeleteConfirmInput(e.target.value)}
                className="flex-1 max-w-md px-4 py-2 bg-white border border-rose-200 rounded-xl text-xs focus:outline-none focus:border-rose-600 font-medium"
              />
              <div className="flex gap-2">
                <button 
                  onClick={handleDeleteSubmit}
                  disabled={deleteConfirmInput !== deletingProject.name}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Permanently Delete
                </button>
                <button 
                  onClick={() => { setDeletingProject(null); setDeleteConfirmInput(''); }}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Existing Projects Directory List (Standard table) */}
        {!showProjectWizard && !showEmployeeForm && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-md space-y-6 text-left animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-950">Project Knowledge Directory</h3>
                <p className="text-xs text-slate-400">Total active registered directories in the database.</p>
              </div>
              <button 
                onClick={() => setShowProjectWizard(true)}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Create Project</span>
              </button>
            </div>

            {existingProjects.length === 0 ? (
              <p className="text-xs text-slate-400 py-10 text-center">No project directories registered yet. Click "Create Project" to setup your first project folder.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-black border-b border-slate-200">
                    <tr>
                      <th className="p-3 text-left">Project Name</th>
                      <th className="p-3 text-left">Client</th>
                      <th className="p-3 text-left">Tech Stack</th>
                      <th className="p-3 text-left">Senior Developer</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-center">Access Feed</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {existingProjects.map((proj) => (
                      <tr key={proj.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 font-bold text-slate-950">{proj.name}</td>
                        <td className="p-3 text-slate-500">{proj.client}</td>
                        <td className="p-3 font-mono text-slate-400">{proj.tech_stack || 'N/A'}</td>
                        <td className="p-3 font-semibold text-slate-800">
                          <p>{proj.senior_dev_name || 'Not assigned'}</p>
                          <span className="text-[10px] text-slate-400 font-normal">{proj.senior_dev_email}</span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                            proj.status === 'Live' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            proj.status === 'Development' ? 'bg-sky-50 text-sky-700 border-sky-100' :
                            proj.status === 'Testing' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-slate-50 text-slate-500 border-slate-200'
                          }`}>
                            {proj.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            proj.is_access_enabled === 1 ? 'text-emerald-700 bg-emerald-50' : 'text-slate-400 bg-slate-50'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${proj.is_access_enabled === 1 ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                            {proj.is_access_enabled === 1 ? 'Enabled' : 'Disabled'}
                          </span>
                        </td>
                        <td className="p-3 text-center relative">
                          <button 
                            onClick={() => setActiveDropdownId(activeDropdownId === proj.id ? null : proj.id)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
                          >
                            <MoreVertical className="w-4.5 h-4.5" />
                          </button>
                          
                          {activeDropdownId === proj.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownId(null)}></div>
                              
                              <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-20 text-left">
                                <button 
                                  onClick={() => handleEditClick(proj.id)}
                                  className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer font-bold"
                                >
                                  ✏️ Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteClick(proj)}
                                  className="w-full text-left px-3.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 cursor-pointer font-bold border-t border-slate-100"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Status info card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 text-left">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-3">
            <Settings className="w-4.5 h-4.5 text-[#a3e635] fill-slate-950" />
            <span>Development Status</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
            The login routing framework is active. Database initializes cleanly, and default admin credentials can be checked using the login form. The remaining dashboard management modules will be built dynamically as we integrate features.
          </p>
        </div>
      {/* 2-Step Employee Access Disable Verification Modal (GitHub style) */}
      {disablingEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 text-left animate-[fadeIn_0.15s_ease-out]">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 border border-slate-100 shadow-2xl space-y-5 animate-[scaleIn_0.2s_ease-out]">
            
            <div className="flex items-center gap-2.5 text-rose-700 font-extrabold text-sm border-b border-slate-100 pb-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 animate-pulse" />
              <span>Access Disabling Verification (Step {disableEmpStep} of 2)</span>
            </div>

            {disableEmpStep === 1 && (
              <div className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Are you sure you want to disable project access for employee <span className="font-bold text-slate-900">"{disablingEmployee.name}"</span>? 
                  They will immediately lose access to view the code repository, files, database schemas, and AI RAG chatbot.
                </p>
                <div className="flex gap-2 justify-end pt-2">
                  <button 
                    onClick={() => setDisableEmpStep(2)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Confirm Step 1: Proceed
                  </button>
                  <button 
                    onClick={() => setDisablingEmployee(null)}
                    className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {disableEmpStep === 2 && (
              <div className="space-y-4">
                <div className="text-xs text-slate-600 space-y-1.5">
                  <p>To finalize disabling access, please type the employee's name <span className="font-mono text-rose-700 font-black px-1.5 py-0.5 bg-rose-100 rounded">{disablingEmployee.name}</span> below to confirm:</p>
                </div>
                <input 
                  type="text" 
                  placeholder="Enter employee name" 
                  value={disableEmpInput}
                  onChange={(e) => setDisableEmpInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-rose-600 font-semibold"
                />
                <div className="flex gap-2 justify-end pt-2">
                  <button 
                    onClick={() => {
                      if (disableEmpInput === disablingEmployee.name) {
                        handleAssignmentMeta(disablingEmployee.id, 'is_enabled', false);
                        toast.success(`Access disabled for ${disablingEmployee.name}. Remember to click "Save" to apply changes.`);
                        setDisablingEmployee(null);
                      }
                    }}
                    disabled={disableEmpInput !== disablingEmployee.name}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Confirm Step 2: Disable Access
                  </button>
                  <button 
                    onClick={() => setDisablingEmployee(null)}
                    className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      </main>
    </div>
  );
};

export default AdminDashboard;
