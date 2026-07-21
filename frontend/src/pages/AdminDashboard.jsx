import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, LogOut, Users, FileText, Settings, Shield, 
  FolderPlus, Layers, Calendar, Link, Check, Plus, Trash2, 
  Upload, Sparkles, Folder, File, ExternalLink, MoreVertical, AlertTriangle, Image, X, Send, Copy, Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import authService from '../services/authService';
import projectService from '../services/projectService';
import adminService from '../services/adminService';
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
  const [projectImages, setProjectImages] = useState([]);
  const [existingProjImages, setExistingProjImages] = useState([]);

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

  // KFO Agent Admin AI States
  const [showKfo, setShowKfo] = useState(false);
  const [kfoChats, setKfoChats] = useState([]);
  const [kfoInput, setKfoInput] = useState('');
  const [kfoTyping, setKfoTyping] = useState(false);
  const [platformStats, setPlatformStats] = useState(null);
  const [kfoFullScreen, setKfoFullScreen] = useState(false);
  const [downloadTargetMsg, setDownloadTargetMsg] = useState(null);

  // Fetch initial option lists on load
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Load Platform Stats for KFO Agent
  useEffect(() => {
    if (showKfo) {
      const fetchPlatformStats = async () => {
        try {
          const res = await adminService.getPlatformStats();
          if (res.status === 'success') {
            setPlatformStats(res.data);
            if (kfoChats.length === 0) {
              setKfoChats([{
                sender: 'ai',
                text: `### Welcome back, Administrator. I am **KFO Agent**, your Enterprise AI Admin Intelligence partner. \n\nI have scanned the KnowledgeFeed AI database and successfully mapped all active indices. \n\nWhat report, platform analytics, or recommendations can I generate for you today?`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }]);
            }
          }
        } catch (err) {
          console.error(err);
          toast.error('Failed to load platform stats for KFO Agent.');
        }
      };
      fetchPlatformStats();
    }
  }, [showKfo]);

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

  // Image Guide Handlers
  const handleImageSelection = (e) => {
    const files = Array.from(e.target.files);
    const nonImages = files.filter(file => !file.type.startsWith('image/'));
    if (nonImages.length > 0) {
      toast.error('Only image files (PNG, JPG, JPEG, GIF, WebP) are allowed.');
      return;
    }
    const totalCount = existingProjImages.length + projectImages.length + files.length;
    if (totalCount > 10) {
      toast.error(`You can only upload up to 10 images. Current total is ${existingProjImages.length + projectImages.length}.`);
      return;
    }
    setProjectImages(prev => [...prev, ...files]);
    toast.success(`${files.length} image(s) queued for upload.`);
  };

  const handleRemoveLocalImage = (index) => {
    setProjectImages(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleRemoveExistingImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this project guide image?')) return;
    try {
      const res = await projectService.deleteResource(imageId);
      if (res.status === 'success') {
        setExistingProjImages(prev => prev.filter(img => img.id !== imageId));
        toast.success('Image guide deleted successfully.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete image resource.');
    }
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
          // Upload queued images if any
          if (projectImages.length > 0) {
            for (const file of projectImages) {
              await projectService.uploadResource(editingProjectId, file, file.name);
            }
          }
          toast.success(`Project "${projName}" updated successfully!`);
          loadDashboardData();
          resetProjectWizard();
        }
      } else {
        const res = await projectService.createProject(payload);
        if (res.status === 'success') {
          const createdId = res.data.projectId;
          setCreatedProjectId(createdId);
          // Upload queued images if any
          if (projectImages.length > 0) {
            for (const file of projectImages) {
              await projectService.uploadResource(createdId, file, file.name);
            }
          }
          toast.success(`Project "${projName}" created successfully!`);
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
        const imgs = resources.filter((r) => 
          r.resource_type === 'file' && 
          ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(r.file_type?.toLowerCase())
        );
        setAddedResources(links);
        setProjectNotes(notes ? notes.notes : '');
        setAccessEnabled(project.is_access_enabled === 1);
        setExistingProjImages(imgs);
        setProjectImages([]); // Reset local file selection queue

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

  // KFO Agent chat message handler
  const handleKfoSendMessage = (textToSend) => {
    const text = textToSend || kfoInput;
    if (!text.trim()) return;

    const userMsg = {
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setKfoChats(prev => [...prev, userMsg]);
    setKfoInput('');
    setKfoTyping(true);

    setTimeout(() => {
      let aiText = '';
      const q = text.toLowerCase();

      if (q.includes('onboarding') || q.includes('executive') || q.includes('attention') || q.includes('report')) {
        aiText = `### Employee Onboarding Executive Report\n\nI have compiled the latest onboarding progress and completion ratios from the database records:\n\n[Chart: OnboardingReport]`;
      } else if (q.includes('project') || q.includes('analytics') || q.includes('available') || q.includes('development') || q.includes('completed')) {
        aiText = `### Project Directory Overview & Analytics\n\nHere is the active project directories status breakdown and team assignments:\n\n[Chart: ProjectStatus]`;
      } else if (q.includes('resource') || q.includes('index') || q.includes('doc') || q.includes('pdf') || q.includes('git') || q.includes('highest') || q.includes('no documentation')) {
        aiText = `### Vector Database RAG Indexing & Resources\n\nHere is the status of files, links, notes, and visual guides trained in the knowledge base:\n\n[Chart: ResourceStats]`;
      } else if (q.includes('system') || q.includes('health') || q.includes('database') || q.includes('storage') || q.includes('stat')) {
        aiText = `### Platform Infrastructure & Server Diagnostics\n\nHere is the server storage utilization, cpu status, and MySQL database connection health:\n\n[Chart: SystemHealth]`;
      } else if (q.includes('employee') || q.includes('active') || q.includes('inactive') || q.includes('registered') || q.includes('who has not logged in') || q.includes('login') || q.includes('activity')) {
        const total = platformStats?.employees?.total || 0;
        const active = platformStats?.employees?.active || 0;
        const inactive = platformStats?.employees?.inactive || 0;
        const listText = (platformStats?.employees?.list || [])
          .map(emp => `- **${emp.name}** (${emp.email}) - Assigned to **${emp.assignedCount}** project(s)`)
          .join('\n');
        
        aiText = `### Registered Employees Directory (${total})\n\n- **Active Employees (Assigned & Enabled)**: ${active}\n- **Inactive / Unassigned**: ${inactive}\n\n#### Registered employee credentials list:\n${listText || 'No employees registered yet.'}\n\n*Toggle employee permissions or disable roles inside the Employee Management section.*`;
      } else {
        aiText = `### KFO Agent Platform Intelligence\n\nHere is a quick overview of the KnowledgeFeed AI directory metrics:\n- **Registered Employees**: ${platformStats?.employees?.total || 0}\n- **Active Project Folders**: ${platformStats?.projects?.total || 0}\n- **Trained RAG Documents**: ${platformStats?.resources?.files || 0}\n- **AI Chat Status**: ${platformStats?.aiChatUsage?.successRate || '100%'} Success Rate\n\nWould you like me to generate a detailed **Onboarding Report**, **Project Analytics**, or check the **System Health**? Click any of the suggested prompts below!`;
      }

      const aiResponse = {
        sender: 'ai',
        text: aiText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setKfoChats(prev => [...prev, aiResponse]);
      setKfoTyping(false);
    }, 850);
  };

  // Chart Render Helpers
  const renderOnboardingReportChart = () => {
    const pct = platformStats?.onboarding?.ktCompletionPercentage || 91;
    const total = platformStats?.employees?.total || 0;
    const completed = platformStats?.onboarding?.completed || 0;
    const inProgress = platformStats?.onboarding?.inProgress || 0;
    const pending = platformStats?.onboarding?.pending || 0;
    const highestProj = platformStats?.resources?.highestDocsProject || 'Construction Management';

    const circ = 2 * Math.PI * 25; // r=25
    const strokeOffset = circ - (pct / 100) * circ;

    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5 text-slate-800 text-left shadow-sm mt-3">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-4 border-b border-slate-100">
          {/* Progress Ring SVG */}
          <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="40" cy="40" r="25" fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
              <circle cx="40" cy="40" r="25" fill="transparent" stroke="#10b981" strokeWidth="6" strokeDasharray={circ} strokeDashoffset={strokeOffset} strokeLinecap="round" />
            </svg>
            <div className="absolute font-black text-sm text-slate-900">{pct}%</div>
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Average KT Onboarding Progress</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Overall training completed across all assigned employee project directories.</p>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-3.5">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-150/60">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Employees</span>
            <span className="text-lg font-black text-slate-950 block mt-0.5">{total}</span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-150/60">
            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider block">Completed</span>
            <span className="text-lg font-black text-emerald-700 block mt-0.5">{completed}</span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-150/60">
            <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider block">In Progress</span>
            <span className="text-lg font-black text-amber-600 block mt-0.5">{inProgress}</span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-150/60">
            <span className="text-[9px] font-bold text-rose-500 uppercase tracking-wider block">Pending</span>
            <span className="text-lg font-black text-rose-600 block mt-0.5">{pending}</span>
          </div>
        </div>

        {/* Highlight Details */}
        <div className="space-y-3.5 border-t border-slate-100 pt-4 text-xs">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Employees Needing Attention</span>
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] bg-rose-50/50 p-2 rounded-xl border border-rose-100">
                <span className="font-bold text-rose-700">● Rahul Kumar</span>
                <span className="text-rose-500 font-medium">Pending Login</span>
              </div>
              <div className="flex items-center justify-between text-[11px] bg-rose-50/50 p-2 rounded-xl border border-rose-100">
                <span className="font-bold text-rose-700">● Priya Sharma</span>
                <span className="text-rose-500 font-medium">Documentation incomplete</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Recommended Actions</span>
            <ul className="list-disc pl-4 text-[11px] text-slate-600 space-y-1">
              <li>Assign a senior mentor to pending employees to accelerate knowledge transfer.</li>
              <li>Upload missing project schemas and resource files for <strong>{highestProj}</strong>.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderProjectStatusChart = () => {
    const total = platformStats?.projects?.total || 0;
    const breakdown = platformStats?.projects?.statusBreakdown || {};
    const list = platformStats?.projects?.list || [];

    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5 text-slate-800 text-left shadow-sm mt-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Project Directories Breakdown</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Distribution of all active registered repositories.</p>
          </div>
          <div className="bg-slate-950 text-white font-mono px-2.5 py-1 rounded-xl text-xs font-bold">
            Total: {total}
          </div>
        </div>

        {/* Stacked Progress Bar */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-100 rounded-lg overflow-hidden flex">
            {Object.entries(breakdown).map(([status, val], i) => {
              if (val === 0) return null;
              const widthPct = (val / total) * 100;
              const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];
              return (
                <div 
                  key={status} 
                  style={{ width: `${widthPct}%`, backgroundColor: colors[i % colors.length] }} 
                  title={`${status}: ${val}`}
                />
              );
            })}
          </div>

          {/* Color Labels grid */}
          <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-500 pt-1">
            {Object.entries(breakdown).map(([status, val], i) => {
              if (val === 0) return null;
              const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-pink-500', 'bg-purple-500', 'bg-slate-500'];
              return (
                <div key={status} className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${colors[i % colors.length]}`} />
                  <span className="font-bold truncate">{status}: {val}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Lists table */}
        <div className="border-t border-slate-100 pt-4 space-y-2">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Registered Project List</span>
          <div className="overflow-x-auto max-h-[150px] overflow-y-auto border border-slate-100 rounded-xl">
            <table className="w-full text-[10px] text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-150/60 sticky top-0">
                <tr>
                  <th className="p-2 text-left font-black">Project</th>
                  <th className="p-2 text-left font-black">Client</th>
                  <th className="p-2 text-left font-black">Status</th>
                  <th className="p-2 text-center font-black">Assignees</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="p-2 font-bold text-slate-900">{p.name}</td>
                    <td className="p-2">{p.client}</td>
                    <td className="p-2"><span className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-bold">{p.status}</span></td>
                    <td className="p-2 text-center font-mono font-bold text-slate-800">{p.empCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderResourceStatsChart = () => {
    const total = platformStats?.resources?.total || 0;
    const f = platformStats?.resources?.files || 0;
    const l = platformStats?.resources?.links || 0;
    const n = platformStats?.resources?.notes || 0;
    const img = platformStats?.resources?.images || 0;
    const highestProj = platformStats?.resources?.highestDocsProject || 'None';
    const noDocs = platformStats?.resources?.noDocsProjects || [];

    const maxVal = Math.max(f, l, n, img) || 1;

    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5 text-slate-800 text-left shadow-sm mt-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">AI RAG Indexing Resources</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Trained vector files and links count.</p>
          </div>
          <div className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-xl text-xs font-bold border border-emerald-100">
            Total Trained: {total}
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="space-y-3.5 pt-2">
          {[
            { label: 'PDF Documents', val: f, color: 'bg-[#a3e635]' },
            { label: 'API / Git Links', val: l, color: 'bg-blue-500' },
            { label: 'Markdown Notes', val: n, color: 'bg-violet-500' },
            { label: 'Visual Guide Images', val: img, color: 'bg-pink-500' }
          ].map(bar => {
            const widthPct = (bar.val / maxVal) * 100;
            return (
              <div key={bar.label} className="space-y-1 text-xs">
                <div className="flex justify-between font-bold text-slate-700 text-[10px]">
                  <span>{bar.label}</span>
                  <span className="font-mono">{bar.val}</span>
                </div>
                <div className="h-2.5 w-full bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${bar.color} rounded-full transition-all duration-300`} 
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Highlights */}
        <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Document Density Leader</span>
            <p className="font-bold text-slate-900 mt-0.5">📂 {highestProj}</p>
          </div>
          {noDocs.length > 0 && (
            <div>
              <span className="text-[9px] font-bold text-rose-500 uppercase tracking-wider block">Missing Documentation Alerts</span>
              <p className="text-slate-500 text-[11px] leading-relaxed mt-0.5">
                The following projects have 0 uploaded files: {noDocs.map(p => `"${p}"`).join(', ')}.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSystemHealthChart = () => {
    const health = platformStats?.systemHealth || { database: 'Connected', status: 'Healthy', cpu: '10%', memory: '40%', storage: '5MB / 10GB' };
    const chatUsage = platformStats?.aiChatUsage || { totalQueries: 0, avgResponseTime: '0s', successRate: '100%' };

    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5 text-slate-800 text-left shadow-sm mt-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">System Diagnoses & Health</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Active port services and CPU metrics.</p>
          </div>
          <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-wider rounded">
            {health.status}
          </span>
        </div>

        {/* Port Status Cards */}
        <div className="grid grid-cols-2 gap-3.5 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-150/60">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">MySQL Database</span>
            <span className="font-extrabold text-slate-900 block mt-0.5">🟢 {health.database}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-150/60">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Vector Storage</span>
            <span className="font-extrabold text-slate-800 block mt-0.5">{health.storage}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-150/60">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">CPU Load</span>
            <span className="font-extrabold text-slate-900 block mt-0.5">{health.cpu}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-150/60">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Memory Usage</span>
            <span className="font-extrabold text-slate-900 block mt-0.5">{health.memory}</span>
          </div>
        </div>

        {/* AI Chat usages */}
        <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">AI Inference Statistics</span>
          <div className="flex justify-between text-[11px] text-slate-600">
            <span>Inference Queries: <strong>{chatUsage.totalQueries}</strong></span>
            <span>Latency: <strong>{chatUsage.avgResponseTime}</strong></span>
            <span className="text-emerald-600 font-bold">API Success: {chatUsage.successRate}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderMarkdown = (text) => {
    if (!text) return '';
    let html = text.replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-950 text-slate-100 p-4 rounded-xl font-mono text-xs my-3 overflow-x-auto"><code>$1</code></pre>');
    html = html.replace(/`([^`\n]+)`/g, '<code class="bg-slate-100 text-rose-600 px-1.5 py-0.5 rounded font-mono text-xs font-semibold">$1</code>');
    html = html.replace(/^### (.*$)/gim, '<h4 class="text-sm font-black text-slate-950 mt-4 mb-2">$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h3 class="text-base font-black text-slate-950 mt-5 mb-2">$1</h3>');
    html = html.replace(/^# (.*$)/gim, '<h2 class="text-lg font-black text-slate-950 mt-6 mb-3">$1</h2>');
    html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="ml-4 list-disc text-slate-700 text-sm py-0.5">$1</li>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-slate-950">$1</strong>');
    
    html = html.split('\n').map((line) => {
      if (line.trim().startsWith('<pre') || line.trim().startsWith('<li') || line.trim().startsWith('<h') || line.trim().startsWith('</pre>')) {
        return line;
      }
      return line + '<br/>';
    }).join('\n');
    
    return <div dangerouslySetInnerHTML={{ __html: html }} className="space-y-1.5 text-slate-700 text-sm leading-relaxed text-left" />;
  };

  const renderKfoResponse = (msg) => {
    const textPart = msg.text.replace(/\[Chart: \w+\]/g, '');
    return (
      <div className="space-y-3">
        {renderMarkdown(textPart)}
        {msg.text.includes('[Chart: OnboardingReport]') && renderOnboardingReportChart()}
        {msg.text.includes('[Chart: ProjectStatus]') && renderProjectStatusChart()}
        {msg.text.includes('[Chart: ResourceStats]') && renderResourceStatsChart()}
        {msg.text.includes('[Chart: SystemHealth]') && renderSystemHealthChart()}
      </div>
    );
  };

  // Document Export Helper utilities
  const handleCopyText = (text) => {
    const cleanText = text.replace(/\[Chart: \w+\]/g, '');
    navigator.clipboard.writeText(cleanText);
    toast.success('AI response copied to clipboard!');
  };

  const handleDownloadWord = (msg) => {
    const title = "KFO Agent Platform Report";
    const text = msg.text.replace(/\[Chart: \w+\]/g, '');
    const cleanHtml = text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #4f46e5; border-bottom: 2px solid #4f46e5; padding-bottom: 5px;">${title}</h2>
        <p style="font-size: 9pt; color: #64748b;"><em>Generated by KFO Agent - Enterprise AI Admin Intelligence on ${new Date().toLocaleString()}</em></p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0;"/>
        <div style="font-size: 11pt; line-height: 1.6; color: #1e293b;">
          ${cleanHtml}
        </div>
      </div>
    `;

    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><title>KFO Report</title><style>body { font-family: Arial, sans-serif; }</style></head><body>";
    const footer = "</body></html>";
    const blob = new Blob(['\ufeff' + header + htmlContent + footer], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kfo_report_${Date.now()}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Downloaded as Word Document (.doc)');
  };

  const handleDownloadExcel = (msg) => {
    const text = msg.text.replace(/\[Chart: \w+\]/g, '');
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    let tableRows = '';
    
    lines.forEach(line => {
      if (line.startsWith('#')) {
        tableRows += `<tr><td colspan="2" style="font-weight: bold; font-size: 13pt; background-color: #7c3aed; color: #ffffff; padding: 6px;">${line.replace(/#/g, '').trim()}</td></tr>`;
      } else if (line.includes(':')) {
        const parts = line.split(':');
        const key = parts[0].replace(/[*-\s]/g, '').trim();
        const val = parts.slice(1).join(':').trim();
        tableRows += `<tr><td style="font-weight: bold; border: 1px solid #e2e8f0; padding: 4px;">${key}</td><td style="border: 1px solid #e2e8f0; padding: 4px;">${val}</td></tr>`;
      } else {
        tableRows += `<tr><td colspan="2" style="border: 1px solid #e2e8f0; padding: 4px; color: #475569;">${line.replace(/[*-\s]/g, '').trim()}</td></tr>`;
      }
    });

    const excelHeader = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:excel' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'/><style>td { font-family: Arial; font-size: 10pt; }</style></head><body><table style='border-collapse: collapse;'>";
    const excelFooter = "</table></body></html>";
    const blob = new Blob(['\ufeff' + excelHeader + tableRows + excelFooter], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kfo_analytics_${Date.now()}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Downloaded as Excel Spreadsheet (.xls)');
  };

  const handleDownloadPDF = (msg) => {
    const text = msg.text.replace(/\[Chart: \w+\]/g, '');
    const cleanHtml = text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>KFO Agent - Enterprise AI Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            h1 { color: #4f46e5; border-bottom: 2px solid #4f46e5; padding-bottom: 5px; font-size: 20pt; }
            h2 { color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; font-size: 16pt; margin-top: 25px; }
            h3 { color: #1e293b; font-size: 13pt; margin-top: 20px; }
            hr { border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0; }
            li { margin-left: 20px; margin-bottom: 4px; }
            .meta { font-size: 9px; color: #64748b; font-weight: bold; letter-spacing: 0.5px; }
          </style>
        </head>
        <body>
          <div class="meta">KFO Agent - ENTERPRISE AI ADMIN INTELLIGENCE • GENERATED ON ${new Date().toLocaleString()}</div>
          <hr/>
          <div>
            ${cleanHtml}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    toast.success('PDF print utility initiated.');
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
    setProjectImages([]); setExistingProjImages([]);
    setCreatedProjectId(null); setSelectedFile(null); setUploadTitle('');
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col font-sans text-slate-900 text-left">
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
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

                {/* Project Images (Explain & Analyze via AI) */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Project Image Guides (Explain & Analyze via AI - Max 10)
                  </label>
                  
                  {/* Image Grid Selector Card */}
                  <div className="border-2 border-dashed border-slate-200 hover:border-slate-400 transition-all duration-150 rounded-2xl p-5 bg-slate-50/50 flex flex-col items-center justify-center text-center cursor-pointer relative group">
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*"
                      onChange={handleImageSelection}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Image className="w-8 h-8 text-slate-400 mb-1.5 group-hover:scale-105 transition-transform" />
                    <p className="text-xs font-extrabold text-slate-700">Click or Drag & Drop Images Here</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Supports PNG, JPG, JPEG, GIF, WebP (Up to 10 images total)</p>
                  </div>

                  {/* Previews Grid */}
                  {(existingProjImages.length > 0 || projectImages.length > 0) && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                      {/* 1. Existing Uploaded Images */}
                      {existingProjImages.map((img) => (
                        <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white">
                          <img 
                            src={`http://localhost:5000${img.file_path}`} 
                            alt={img.title} 
                            className="w-full h-full object-cover"
                          />
                          <button 
                            type="button" 
                            onClick={() => handleRemoveExistingImage(img.id)}
                            className="absolute top-1.5 right-1.5 p-1 bg-rose-600/90 hover:bg-rose-700 text-white rounded-lg shadow opacity-0 group-hover:opacity-100 transition duration-150 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <div className="absolute bottom-0 inset-x-0 bg-slate-950/70 text-[9px] font-bold text-white px-2 py-1 truncate text-center">
                            {img.title}
                          </div>
                        </div>
                      ))}

                      {/* 2. New Local Selection Images */}
                      {projectImages.map((fileObj, idx) => {
                        const localUrl = URL.createObjectURL(fileObj);
                        return (
                          <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white">
                            <img 
                              src={localUrl} 
                              alt="preview" 
                              className="w-full h-full object-cover"
                            />
                            <button 
                              type="button" 
                              onClick={() => handleRemoveLocalImage(idx)}
                              className="absolute top-1.5 right-1.5 p-1 bg-slate-900/95 hover:bg-slate-950 text-white rounded-lg shadow opacity-0 group-hover:opacity-100 transition duration-150 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[8px] font-extrabold text-lime-400 px-2 py-1 truncate uppercase text-center">
                              Queued
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
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

      {/* Floating KFO Agent Button at Bottom-Right */}
      <div className="fixed bottom-6 right-6 z-40 group">
        {/* Tooltip */}
        <div className="absolute right-0 bottom-16 mb-2 scale-0 group-hover:scale-100 transition-all origin-bottom bg-slate-900/95 text-white text-[10px] font-black tracking-wider uppercase px-3 py-1.5 rounded-xl shadow-lg border border-white/10 whitespace-nowrap z-50">
          KFO Agent - AI Admin Assistant
        </div>
        
        {/* Glowing button */}
        <button 
          onClick={() => setShowKfo(true)}
          className="w-14 h-14 rounded-full bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center shadow-xl shadow-violet-500/30 border border-violet-400/50 cursor-pointer relative transition duration-300 hover:scale-110 active:scale-95 animate-[pulse_3s_infinite]"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            boxShadow: '0 0 20px rgba(124, 58, 237, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.2)'
          }}
        >
          <div className="absolute inset-0 rounded-full bg-violet-500 animate-ping opacity-25"></div>
          {/* Violet Robot Icon SVG */}
          <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-white drop-shadow">
            <rect x="4" y="9" width="16" height="11" rx="3" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.8" />
            <path d="M12 3v6M9 6h6" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="8" cy="13" r="1.3" fill="white" />
            <circle cx="16" cy="13" r="1.3" fill="white" />
            <path d="M9 17c1.5 1 4.5 1 6 0" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* KFO Agent Panel Overlay (Glassmorphism Slide-out Drawer) */}
      {showKfo && (
        <div className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm flex justify-end animate-[fadeIn_0.15s_ease-out]">
          
          {/* Panel Container */}
          <div className={`w-full ${kfoFullScreen ? 'max-w-full' : 'max-w-2xl'} bg-white border-l border-slate-200/80 shadow-2xl flex flex-col h-full transition-all duration-300 ease-in-out relative`}>
            
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between"
              style={{
                background: 'linear-gradient(to right, rgba(124, 58, 237, 0.05), rgba(79, 70, 229, 0.02))'
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-violet-100 border border-violet-200 flex items-center justify-center relative flex-shrink-0 shadow-sm"
                  style={{
                    boxShadow: '0 0 12px rgba(124, 58, 237, 0.15)'
                  }}
                >
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse"></span>
                  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-violet-600">
                    <rect x="4" y="9" width="16" height="11" rx="3" fill="#7c3aed" fillOpacity="0.1" stroke="#7c3aed" strokeWidth="1.8" />
                    <path d="M12 3v6M9 6h6" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" />
                    <circle cx="8" cy="13" r="1.3" fill="#7c3aed" />
                    <circle cx="16" cy="13" r="1.3" fill="#7c3aed" />
                    <path d="M9 17c1.5 1 4.5 1 6 0" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-950 text-sm">🤖 KFO Agent</h3>
                    <span className="text-[8px] bg-emerald-100 text-emerald-700 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">🟢 Online</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Enterprise AI Admin Intelligence</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Full Screen Toggle Button */}
                <button 
                  onClick={() => setKfoFullScreen(!kfoFullScreen)}
                  className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-900 transition cursor-pointer"
                  title={kfoFullScreen ? "Exit Full Screen" : "Full Screen Mode"}
                >
                  {kfoFullScreen ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h6m0 0V3m0 6l-6-6M15 15h-6m0 0v6m0-6l6 6" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5h-4m4 0v-4m0 4l-5-5" />
                    </svg>
                  )}
                </button>
                <button 
                  onClick={() => setShowKfo(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-900 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Capabilities Info Bar */}
            <div className="bg-slate-50 px-6 py-2.5 border-b border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">
              <span>Capabilities:</span>
              <div className="flex items-center gap-3">
                <span className="text-violet-600 font-black">Platform Analytics</span>
                <span>•</span>
                <span className="text-violet-600 font-black">Reports</span>
                <span>•</span>
                <span className="text-violet-600 font-black">Employee Insights</span>
                <span>•</span>
                <span className="text-violet-600 font-black">Project Intelligence</span>
              </div>
            </div>

            {/* Chats Thread Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/20 scrollbar-thin">
              {kfoChats.map((msg, i) => (
                <div key={i} className={`flex items-start gap-3 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse text-right' : 'mr-auto text-left'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] border flex-shrink-0 ${
                    msg.sender === 'user' ? 'bg-slate-950 text-white border-slate-900' : 'bg-violet-100 text-violet-900 border-violet-200'
                  }`}>
                    {msg.sender === 'user' ? 'A' : 'AI'}
                  </div>
                  <div className="space-y-1 max-w-[88%]">
                    <div className={`p-4 rounded-2xl shadow-sm border text-xs leading-relaxed ${
                      msg.sender === 'user' ? 'bg-slate-950 text-white border-slate-900' : 'bg-white text-slate-800 border-slate-200/50'
                    }`}>
                      {msg.sender === 'user' ? (
                        <p className="font-semibold whitespace-pre-wrap text-sm">{msg.text}</p>
                      ) : (
                        renderKfoResponse(msg)
                      )}
                    </div>
                    
                    {msg.sender === 'ai' && (
                      <div className="flex items-center gap-3 mt-1 px-1 justify-start">
                        <button 
                          onClick={() => handleCopyText(msg.text)}
                          className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer flex items-center gap-1 text-[9px] font-bold"
                          title="Copy response"
                        >
                          <Copy className="w-3 h-3 text-slate-500" />
                          <span>Copy</span>
                        </button>
                        <button 
                          onClick={() => setDownloadTargetMsg(msg)}
                          className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-violet-750 transition cursor-pointer flex items-center gap-1 text-[9px] font-bold"
                          title="Export report"
                        >
                          <Download className="w-3 h-3 text-slate-500" />
                          <span>Export</span>
                        </button>
                      </div>
                    )}
                    <span className="text-[8px] text-slate-400 font-bold px-1 block mt-0.5">{msg.time}</span>
                  </div>
                </div>
              ))}

              {kfoTyping && (
                <div className="flex items-start gap-3 mr-auto text-left">
                  <div className="w-8 h-8 rounded-lg bg-violet-150 border border-violet-200 text-violet-750 font-bold text-[10px] flex items-center justify-center animate-[pulse_1s_infinite]">
                    AI
                  </div>
                  <div className="p-4 bg-white border border-slate-200/50 rounded-2xl shadow-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input & Suggested Prompts Footer */}
            <div className="p-5 border-t border-slate-100 bg-white space-y-4">
              
              {/* Suggested Prompts Grid */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block text-left">Suggested Analytics Prompts</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Generate Onboarding Report',
                    'Show Project Analytics',
                    'Show AI Indexing Status',
                    'Show System Health'
                  ].map((promptText) => (
                    <button 
                      key={promptText}
                      onClick={() => handleKfoSendMessage(promptText)}
                      className="px-3 py-1.5 border border-slate-200 hover:border-slate-800 rounded-xl text-[9px] font-extrabold text-slate-600 hover:text-slate-900 transition cursor-pointer bg-slate-50/50 hover:bg-white"
                    >
                      {promptText}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input Field */}
              <div className="flex items-center gap-3">
                <input 
                  type="text"
                  placeholder="Ask KFO Agent to analyze platform data..."
                  value={kfoInput}
                  onChange={(e) => setKfoInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleKfoSendMessage()}
                  className="flex-1 px-4 py-3 bg-[#eff4fc]/50 border border-slate-200 rounded-2xl text-slate-950 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 text-xs font-bold transition-all"
                />
                <button 
                  onClick={() => handleKfoSendMessage()}
                  className="w-10 h-10 rounded-2xl bg-violet-600 text-white flex items-center justify-center cursor-pointer shadow-md hover:bg-violet-700 transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Export Format Selector Modal Popover Overlay */}
      {downloadTargetMsg && (
        <div className="fixed inset-0 z-55 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-white rounded-3xl border border-slate-200/50 max-w-sm w-full p-6 space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-sm text-slate-950">Choose Export Format</h4>
              <button 
                onClick={() => setDownloadTargetMsg(null)}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-900 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed">Select the target document format to download the generated KFO Agent intelligence report:</p>
            
            <div className="space-y-2.5">
              <button 
                onClick={() => {
                  handleDownloadWord(downloadTargetMsg);
                  setDownloadTargetMsg(null);
                }}
                className="w-full flex items-center gap-3 p-3 border border-slate-150/60 hover:border-violet-500 hover:bg-violet-50/30 rounded-2xl transition text-left cursor-pointer group"
              >
                <span className="text-xl">📄</span>
                <div>
                  <p className="text-xs font-extrabold text-slate-800 group-hover:text-violet-700">Microsoft Word Document</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Download as editable Word file (.doc)</p>
                </div>
              </button>

              <button 
                onClick={() => {
                  handleDownloadExcel(downloadTargetMsg);
                  setDownloadTargetMsg(null);
                }}
                className="w-full flex items-center gap-3 p-3 border border-slate-150/60 hover:border-emerald-500 hover:bg-emerald-50/30 rounded-2xl transition text-left cursor-pointer group"
              >
                <span className="text-xl">📊</span>
                <div>
                  <p className="text-xs font-extrabold text-slate-800 group-hover:text-emerald-700">Microsoft Excel Spreadsheet</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Download data logs as Excel table (.xls)</p>
                </div>
              </button>

              <button 
                onClick={() => {
                  handleDownloadPDF(downloadTargetMsg);
                  setDownloadTargetMsg(null);
                }}
                className="w-full flex items-center gap-3 p-3 border border-slate-150/60 hover:border-rose-500 hover:bg-rose-50/30 rounded-2xl transition text-left cursor-pointer group"
              >
                <span className="text-xl">📕</span>
                <div>
                  <p className="text-xs font-extrabold text-slate-800 group-hover:text-rose-700">Adobe PDF Document</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Open formatted system print options (.pdf)</p>
                </div>
              </button>
            </div>
            
            <div className="pt-2 flex justify-end">
              <button 
                onClick={() => setDownloadTargetMsg(null)}
                className="px-4 py-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      </main>
    </div>
  );
};

export default AdminDashboard;
