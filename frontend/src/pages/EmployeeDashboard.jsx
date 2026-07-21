import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, LogOut, MessageSquare, Briefcase, Settings, 
  ChevronLeft, ChevronRight, LayoutDashboard, Database, 
  Code, Cpu, Check, Search, Star, Bell, User, Send, X, Copy, Image,
  RotateCw, Sparkles, Folder, FileText, ArrowRight, ShieldCheck, 
  Layers, Link, Download, Info, Users, ExternalLink, Eye, EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import projectService from '../services/projectService';
import onboardingImg from '../assets/ai_developer_onboarding.png';

export const EmployeeDashboard = () => {
  const { user, logout } = useAuth();

  // Navigation States
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [kbExpanded, setKbExpanded] = useState(false);

  // Projects State
  const [userProjects, setUserProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectDetails, setProjectDetails] = useState({ project: {}, assignments: [], resources: [] });
  const [projectTab, setProjectTab] = useState('overview');
  const [zoomImage, setZoomImage] = useState(null);

  // AI Chat States (Project-Aware split-pane chat)
  const [selectedProjectChat, setSelectedProjectChat] = useState(null);
  const [projectChats, setProjectChats] = useState({});
  const [chatInput, setChatInput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);

  const [showEmail, setShowEmail] = useState(false);
  const [showProfilePass, setShowProfilePass] = useState(false);
  const [profilePic, setProfilePic] = useState(localStorage.getItem('employee_pic') || null);

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result;
        setProfilePic(base64Data);
        localStorage.setItem('employee_pic', base64Data);
        toast.success('Profile picture updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const messagesEndRef = useRef(null);

  // Initialize data on load
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const res = await projectService.getProjects();
      if (res.status === 'success') {
        setUserProjects(res.data.projects);
      }
    } catch (error) {
      console.error("Error fetching employee projects:", error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleSelectProject = async (projId) => {
    const localProj = userProjects.find((p) => p.id === projId);
    if (localProj && localProj.is_enabled === 0) {
      toast.error('Access Restricted: Admin must give access to you.', { icon: '🔒' });
      return;
    }

    setLoadingProjects(true);
    try {
      const res = await projectService.getProject(projId);
      if (res.status === 'success') {
        setProjectDetails(res.data);
        setSelectedProject(res.data.project);
        setProjectTab('overview');
        setActiveTab('project-view'); // Dynamic view tab
        
        // Initialize RAG chat for this specific project in projectChats state
        const welcomeMsg = {
          sender: 'ai',
          text: `### Hello! I am the KnowledgeFeed AI Assistant.\nI have initialized the RAG context bound to **"${res.data.project.name}"**.\n\nYou can ask me specific questions about database schemas, technology stacks, folder structures, or senior developer handovers.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setProjectChats((prev) => ({
          ...prev,
          [projId]: prev[projId] || [welcomeMsg]
        }));
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load project details.');
    } finally {
      setLoadingProjects(false);
    }
  };

  // Auto-scroll chat window
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [projectChats, selectedProjectChat, aiTyping]);

  const handleLogout = () => {
    logout();
    toast.success('Successfully logged out.');
  };

  const handleExplainImageWithAI = (img) => {
    setProjectTab('chat');
    // We add a tiny delay to ensure tab switching updates the DOM before sending
    setTimeout(() => {
      handleSendMessage(`Please explain this project image guide: "${img.title}" (Path: ${img.file_path}).`);
    }, 150);
  };

  // Dynamic RAG contextualized response generator
  const getMockResponse = (query, project) => {
    const q = query.toLowerCase();
    const projName = project?.name || 'this project';
    const tech = project?.tech_stack || 'Not specified';
    const db = project?.db_name || 'Not specified';
    const sDev = project?.senior_dev_name || 'Senior Developer';
    const sDevEmail = project?.senior_dev_email || 'Not specified';
    const sDevPhone = project?.senior_dev_phone || 'Not specified';
    const git = project?.github_url || 'Not linked';
    const api = project?.api_url || 'Not linked';
    const domain = project?.domain || 'General Business';
    const desc = project?.description || 'No description provided.';
    const responsibilities = project?.senior_dev_responsibilities || 'N/A';
    const ktNotes = project?.senior_dev_kt_notes || 'N/A';

    if (q.includes('project') && q.includes('explain')) {
      return `### Project Summary: **${projName}**\n${desc}\n\n### Specifications\n- **Client**: ${project?.client || 'N/A'}\n- **Business Domain**: ${domain}\n- **Technology Stack**: ${tech}\n- **Database Name**: \`${db}\``;
    }
    if (q.includes('backend') || q.includes('api')) {
      return `### Backend API: **${projName}**\n- **API Base URL**: [${api}](${api})\n- **Tech Context**: ${tech}\n- Express routing handles API calls. All resources endpoints are token-protected.`;
    }
    if (q.includes('database') || q.includes('structure') || q.includes('schema')) {
      return `### Database Structure: **${projName}**\n- **MySQL Schema**: \`${db}\`\n- Includes structured relationships matching team assignments and directories.`;
    }
    if (q.includes('auth') || q.includes('login') || q.includes('flow')) {
      return `### Authentication Flow: **${projName}**\n- Employs secure JWT filters.\n- Frontend interceptors bind Bearer headers automatically.`;
    }
    if (q.includes('folder') || q.includes('directory')) {
      return `### Directory Structure: **${projName}**\n- Standard frontend/backend split.\n- Uploaded files are served securely and parsed for RAG index lookups.`;
    }
    if (q.includes('business') || q.includes('logic')) {
      return `### Business Logic & KT Notes: **${projName}**\n\n#### Senior Dev Primary Details:\n- **Contact Name**: ${sDev}\n- **Email**: ${sDevEmail}\n- **Phone**: ${sDevPhone}\n- **Role**: ${project?.senior_dev_role || 'Lead'}\n\n#### Core Responsibilities:\n${responsibilities}\n\n#### KT Knowledge Handover Notes:\n${ktNotes}`;
    }
    // Check if employee asks about image guides
    if (q.includes('image') || q.includes('diagram') || q.includes('visual') || q.includes('explain path')) {
      const imgsCount = projectDetails.resources?.filter(r => 
        r.resource_type === 'file' && ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(r.file_type?.toLowerCase())
      ).length || 0;
      if (imgsCount === 0) {
        return `### Project Image Guides\nThere are currently no uploaded visual diagrams or image guides for **"${projName}"**. Admin can upload diagrams in Resource Settings.`;
      }
      
      // If it mentions a specific image file name
      const matchedImg = projectDetails.resources
        ?.filter(r => r.resource_type === 'file' && ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(r.file_type?.toLowerCase()))
        .find(r => q.includes(r.title.toLowerCase()) || q.includes(r.file_path.toLowerCase()));
        
      if (matchedImg) {
        return `### AI Image Analysis: **${matchedImg.title}**\n- **Source URL**: \`http://localhost:5000${matchedImg.file_path}\`\n\n**Visual Layout Analysis**:\nThis diagram represents the system design layout for **"${projName}"** utilizing **${tech}** modules. It defines the component structures, data models, or UX flows to follow during onboarding. Let me know if you need specific details on any block inside this guide!`;
      }
      
      const imgsList = projectDetails.resources
        ?.filter(r => r.resource_type === 'file' && ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(r.file_type?.toLowerCase()))
        .map(r => `- **${r.title}** (URL: [View Image](http://localhost:5000${r.file_path}))`)
        .join('\n');
      return `### Project Image Guides (${imgsCount})\nThe following visual assets are registered for **"${projName}"**:\n${imgsList}\n\n*Click "Explain with AI" on any visual asset in the Overview tab to get a dedicated breakdown!*`;
    }

    // Check if employee asks about uploaded resources
    if (q.includes('file') || q.includes('document') || q.includes('resource') || q.includes('upload')) {
      const filesCount = projectDetails.resources?.filter(r => 
        r.resource_type === 'file' && !['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(r.file_type?.toLowerCase())
      ).length || 0;
      if (filesCount === 0) {
        return `### Document Contexts\nThere are currently no uploaded document files for **"${projName}"**. Contact your Admin to upload PDFs/Docs.`;
      }
      const filesList = projectDetails.resources
        ?.filter(r => r.resource_type === 'file' && !['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(r.file_type?.toLowerCase()))
        .map(r => `- **${r.title}** (Type: ${r.file_type})`)
        .join('\n');
      return `### Indexed Resource Documents (${filesCount})\nThe following documents are uploaded and fully parsed for AI queries:\n${filesList}`;
    }

    return `Searching knowledge base for **"${query}"** inside project **"${projName}"**...\n\nFound matching text chunks. Based on the RAG context: The project stack utilizes **${tech}**. For credential handovers or API config keys, refer to Senior Developer **${sDev}** at **${sDevEmail}**. Let me know if you would like me to detail schemas or endpoints!`;
  };

  const getActiveChatProject = () => {
    if (activeTab === 'ai-assistant') return selectedProjectChat;
    if (activeTab === 'project-view') return selectedProject;
    return null;
  };

  const openProjectChat = (proj) => {
    setSelectedProjectChat(proj);
    if (!projectChats[proj.id]) {
      const welcomeMsg = {
        sender: 'ai',
        text: `### Hello! I am the KnowledgeFeed AI Assistant.\nI have initialized the RAG context bound to **"${proj.name}"**.\n\nYou can ask me specific questions about database schemas, technology stacks, folder structures, or senior developer handovers.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setProjectChats((prev) => ({
        ...prev,
        [proj.id]: [welcomeMsg]
      }));
    }
  };

  const handleSendMessage = (textToSend) => {
    const text = textToSend || chatInput;
    const activeProj = getActiveChatProject();
    if (!text.trim() || !activeProj) return;

    const userMsg = {
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const currentHistory = projectChats[activeProj.id] || [];
    const updatedHistory = [...currentHistory, userMsg];

    setProjectChats((prev) => ({
      ...prev,
      [activeProj.id]: updatedHistory
    }));
    setChatInput('');
    setAiTyping(true);

    setTimeout(() => {
      const q = text.toLowerCase();
      const isDevDetails = q.includes('who developed') || q.includes('developer') || q.includes('developed this') || q.includes('senior dev');

      const aiResponse = {
        sender: 'ai',
        text: getMockResponse(text, activeProj),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDevDetails,
        devData: isDevDetails ? {
          name: activeProj.senior_dev_name || 'Senior Developer',
          role: activeProj.senior_dev_role || 'Lead Engineer',
          email: activeProj.senior_dev_email || 'N/A',
          phone: activeProj.senior_dev_phone || 'N/A',
          workingPeriod: `${activeProj.senior_dev_working_from || 'N/A'} - ${activeProj.senior_dev_working_to || 'N/A'}`,
          responsibilities: activeProj.senior_dev_responsibilities || 'N/A'
        } : null
      };

      setProjectChats((prev) => ({
        ...prev,
        [activeProj.id]: [...updatedHistory, aiResponse]
      }));
      setAiTyping(false);
    }, 1000);
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Response copied to clipboard!');
  };

  const handleRegenerate = (index) => {
    const activeProj = getActiveChatProject();
    if (!activeProj) return;
    const currentHistory = projectChats[activeProj.id] || [];
    let lastUserQuery = '';
    for (let i = index - 1; i >= 0; i--) {
      if (currentHistory[i].sender === 'user') {
        lastUserQuery = currentHistory[i].text;
        break;
      }
    }
    if (!lastUserQuery) return;

    setAiTyping(true);
    setTimeout(() => {
      const q = lastUserQuery.toLowerCase();
      const isDevDetails = q.includes('who developed') || q.includes('developer') || q.includes('developed this') || q.includes('senior dev');

      const regeneratedMsg = {
        sender: 'ai',
        text: getMockResponse(lastUserQuery, activeProj) + "\n\n*(Regenerated response)*",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDevDetails,
        devData: isDevDetails ? {
          name: activeProj.senior_dev_name || 'Senior Developer',
          role: activeProj.senior_dev_role || 'Lead Engineer',
          email: activeProj.senior_dev_email || 'N/A',
          phone: activeProj.senior_dev_phone || 'N/A',
          workingPeriod: `${activeProj.senior_dev_working_from || 'N/A'} - ${activeProj.senior_dev_working_to || 'N/A'}`,
          responsibilities: activeProj.senior_dev_responsibilities || 'N/A'
        } : null
      };

      setProjectChats((prev) => {
        const updated = [...(prev[activeProj.id] || [])];
        updated[index] = regeneratedMsg;
        return {
          ...prev,
          [activeProj.id]: updated
        };
      });
      setAiTyping(false);
      toast.success('Response regenerated!');
    }, 800);
  };

  // Helper to render markdown parsed lists & blocks
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
    
    return <div dangerouslySetInnerHTML={{ __html: html }} className="space-y-1.5 text-slate-700 text-sm leading-relaxed" />;
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col font-sans text-slate-900 overflow-x-hidden relative text-left">
      
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm relative z-30">
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
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Employee Workspace</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900">{user?.name || 'Employee'}</p>
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

      {/* Main Container */}
      <div className="flex-1 flex items-stretch">
        
        {/* Collapsible Left Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-300 ease-in-out select-none relative z-20`}>
          <div className="p-4 space-y-6">
            <div className="flex justify-end">
              <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-950 hover:bg-slate-50 transition cursor-pointer">
                {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>
            <nav className="space-y-1.5">
              <button onClick={() => { setActiveTab('dashboard'); setSelectedProject(null); }} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-bold text-xs uppercase tracking-wider text-left border-l-4 cursor-pointer ${activeTab === 'dashboard' ? 'border-[#a3e635] bg-slate-50 text-slate-950' : 'border-transparent text-slate-500 hover:text-slate-950 hover:bg-slate-50/50'}`}>
                <LayoutDashboard className="w-4.5 h-4.5 flex-shrink-0" />
                {!sidebarCollapsed && <span>Dashboard</span>}
              </button>
              <button onClick={() => { setActiveTab('projects'); setSelectedProject(null); }} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-bold text-xs uppercase tracking-wider text-left border-l-4 cursor-pointer ${activeTab === 'projects' ? 'border-[#a3e635] bg-slate-50 text-slate-950' : 'border-transparent text-slate-500 hover:text-slate-950 hover:bg-slate-50/50'}`}>
                <Briefcase className="w-4.5 h-4.5 flex-shrink-0" />
                {!sidebarCollapsed && <span>My Projects</span>}
              </button>
              <button onClick={() => setActiveTab('ai-assistant')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-bold text-xs uppercase tracking-wider text-left border-l-4 cursor-pointer ${activeTab === 'ai-assistant' ? 'border-[#a3e635] bg-slate-50 text-slate-950' : 'border-transparent text-slate-500 hover:text-slate-950 hover:bg-slate-50/50'}`}>
                <Cpu className="w-4.5 h-4.5 flex-shrink-0" />
                {!sidebarCollapsed && <span>AI Assistant</span>}
              </button>
              <button onClick={() => setActiveTab('saved')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-bold text-xs uppercase tracking-wider text-left border-l-4 cursor-pointer ${activeTab === 'saved' ? 'border-[#a3e635] bg-slate-50 text-slate-950' : 'border-transparent text-slate-500 hover:text-slate-950 hover:bg-slate-50/50'}`}>
                <Star className="w-4.5 h-4.5 flex-shrink-0" />
                {!sidebarCollapsed && <span>Saved Items</span>}
              </button>
              <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-bold text-xs uppercase tracking-wider text-left border-l-4 cursor-pointer ${activeTab === 'profile' ? 'border-[#a3e635] bg-slate-50 text-slate-950' : 'border-transparent text-slate-500 hover:text-slate-950 hover:bg-slate-50/50'}`}>
                <User className="w-4.5 h-4.5 flex-shrink-0" />
                {!sidebarCollapsed && <span>Profile</span>}
              </button>
            </nav>
          </div>
          <div className="p-4 border-t border-slate-100">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition font-bold text-xs uppercase tracking-wider text-left cursor-pointer"><LogOut className="w-4.5 h-4.5" />{!sidebarCollapsed && <span>Logout</span>}</button>
          </div>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8 max-w-7xl mx-auto">
          
          {/* Default views */}
          
          {/* TAB 1: Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-[fadeIn_0.2s_ease-out]">
              <div className="bg-gradient-to-r from-emerald-50 via-emerald-100/20 to-teal-50 border border-emerald-100/50 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden text-left min-h-[280px]">
                <div className="space-y-4 max-w-xl relative z-10 md:py-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                    <span>Welcome Back, {user?.name || 'Developer'}! 👋</span>
                  </div>
                  <h2 className="text-2xl md:text-3.5xl font-black text-slate-950 leading-tight">
                    Your Knowledge. <br/>
                    <span className="text-emerald-600">Supercharged</span> with AI.
                  </h2>
                  <p className="text-slate-500 text-xs md:text-sm leading-relaxed max-w-md">
                    Access project documentation, technical resources, and get AI-powered answers to accelerate your onboarding and productivity.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button 
                      onClick={() => setActiveTab('ai-assistant')}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/10"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Chat with AI Assistant</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('projects')}
                      className="px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-800 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Browse Projects</span>
                    </button>
                  </div>
                </div>

                <div className="hidden md:block absolute right-0 bottom-0 h-full w-[45%] pointer-events-none select-none">
                  <img 
                    src={onboardingImg} 
                    alt="AI Onboarding illustration" 
                    className="w-full h-full object-contain object-bottom scale-105 origin-bottom"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex items-start gap-4 text-left">
                  <div className="p-3 bg-slate-100 text-slate-900 rounded-xl"><Briefcase className="w-5.5 h-5.5" /></div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-950 text-sm">Assigned Projects</h3>
                    <p className="text-xs text-slate-400 leading-normal">View project specs and documentation folders assigned directly to you.</p>
                    <div className="pt-2">
                      <button onClick={() => setActiveTab('projects')} className="text-xs font-bold text-slate-950 hover:underline transition inline-flex items-center gap-1 cursor-pointer"><span>Browse Projects</span><span>→</span></button>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex items-start gap-4 text-left">
                  <div className="p-3 bg-slate-100 text-slate-900 rounded-xl"><MessageSquare className="w-5.5 h-5.5" /></div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-950 text-sm">AI Agent Chatbot</h3>
                    <p className="text-xs text-slate-400 leading-normal">Chat with the RAG assistant to resolve programming questions instantly.</p>
                    <div className="pt-2">
                      <button onClick={() => setActiveTab('ai-assistant')} className="text-xs font-bold text-slate-950 hover:underline transition inline-flex items-center gap-1 cursor-pointer"><span>Launch Chatbot</span><span>→</span></button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Assignments Notifications Feed */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 text-left shadow-sm">
                <div>
                  <h3 className="font-extrabold text-slate-950 text-sm flex items-center gap-2">
                    <Bell className="w-5.5 h-5.5 text-[#a3e635] fill-slate-950" />
                    <span>Project Access Notifications</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Timeline of folders and directories assigned to you by administrators.</p>
                </div>

                <div className="space-y-3.5">
                  {userProjects.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No assignment notifications logged.</p>
                  ) : (
                    userProjects.map((proj) => (
                      <div 
                        key={proj.id} 
                        onClick={() => handleSelectProject(proj.id)}
                        className={`p-4 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-150 text-left shadow-sm group ${
                          proj.is_enabled === 0 
                            ? 'bg-rose-50/25 border-rose-100/50 cursor-not-allowed opacity-75' 
                            : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-slate-300 cursor-pointer'
                        }`}
                      >
                        <div className="space-y-1">
                          <p className="text-xs text-slate-800 font-bold leading-normal">
                            You have been assigned to project <span className="text-[#8ece24] font-black group-hover:underline">"{proj.name}"</span>
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Role: <span className="font-semibold text-slate-600">{proj.designation || 'Developer'}</span> • Department: <span className="font-semibold text-slate-600">{proj.department || 'Engineering'}</span>
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 flex items-center gap-1.5 justify-end">
                          {proj.is_enabled === 0 && (
                            <span className="text-[9px] bg-rose-100/80 text-rose-700 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border border-rose-200/50">
                              Access Revoked
                            </span>
                          )}
                          <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                            {proj.assigned_date || 'Recent'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: My Projects List */}
          {activeTab === 'projects' && (
            <div className="space-y-6 text-left animate-[fadeIn_0.2s_ease-out]">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-950">Assigned Project Folders</h2>
                  <p className="text-xs text-slate-400 mt-1">Select an assigned project directory to view documentation, senior developers handovers, and open the AI Assistant.</p>
                </div>
              </div>

              {loadingProjects ? (
                <p className="text-xs text-slate-400 py-10 text-center font-mono">Loading assigned workspace folders...</p>
              ) : userProjects.length === 0 ? (
                <p className="text-xs text-slate-400 py-10 text-center">No assigned project folders found in the database. Contact your Administrator.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userProjects.map((proj) => (
                    <div key={proj.id} className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all duration-200 text-left">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-extrabold text-slate-950 text-base">{proj.name}</h3>
                          <span className="px-2.5 py-0.5 rounded-full bg-lime-50 text-lime-700 border border-lime-100 text-[10px] font-bold">{proj.status}</span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono">Tech Stack: {proj.tech_stack || 'N/A'}</p>
                        <p className="text-xs text-slate-500 leading-normal">{proj.description}</p>
                      </div>
                      <div className="pt-5">
                        {proj.is_enabled === 0 ? (
                          <div className="w-full text-center py-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed select-none border-dashed">
                            🔒 Admin must give access to this project
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleSelectProject(proj.id)}
                            className="w-full text-center py-2.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>Open Project Workspace</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Dynamic Project View Pane (Detail View Workspace) */}
          {activeTab === 'project-view' && selectedProject && (
            <div className="space-y-6 text-left animate-[fadeIn_0.2s_ease-out]">
              
              {/* Back button */}
              <button 
                onClick={() => setActiveTab('projects')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
              >
                ← Back to Project Directory
              </button>

              {/* Title Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-slate-950">{selectedProject.name}</h2>
                  <p className="text-xs text-slate-400 font-mono">Client: {selectedProject.client} | Status: <span className="font-bold text-slate-900">{selectedProject.status}</span></p>
                </div>
                
                {/* Secondary quick triggers */}
                <div className="flex items-center gap-2">
                  {selectedProject.github_url && (
                    <a href={selectedProject.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-600 transition">
                      <Link className="w-3.5 h-3.5" />
                      <span>GitHub</span>
                    </a>
                  )}
                  {selectedProject.api_url && (
                    <a href={selectedProject.api_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-600 transition">
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>API Endpoints</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Workspace Navigation Sub-Bar */}
              <div className="flex items-center gap-2 border-b border-slate-200">
                {[
                  { id: 'overview', label: 'Overview', icon: Info },
                  { id: 'team', label: 'Senior Team & Contacts', icon: Users },
                  { id: 'resources', label: 'Documentation Resources', icon: Folder },
                  { id: 'chat', label: 'AI RAG Assistant', icon: Sparkles }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setProjectTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition border-b-2 cursor-pointer ${
                        projectTab === tab.id 
                          ? 'border-slate-950 text-slate-950' 
                          : 'border-transparent text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* SUBTAB 1: Overview */}
              {projectTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-[fadeIn_0.15s_ease-out]">
                  {/* Summary */}
                  <div className="md:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Project Objective & Description</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{selectedProject.description || 'No description available.'}</p>
                  </div>

                  {/* Metadata Specs card */}
                  <div className="bg-slate-950 text-white rounded-3xl p-6 space-y-4">
                    <h3 className="font-extrabold text-[#a3e635] text-xs uppercase tracking-wider">Technical Specifications</h3>
                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Business Domain</span>
                        <span className="font-bold">{selectedProject.domain || 'General'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Technology Stack</span>
                        <span className="font-bold">{selectedProject.tech_stack || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Database Connection Schema</span>
                        <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-[#a3e635] inline-block mt-0.5">{selectedProject.db_name || 'N/A'}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                        <div>
                          <span className="text-slate-400 block text-[8px] uppercase">Start Date</span>
                          <span className="font-bold text-[11px]">{selectedProject.start_date || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[8px] uppercase">End Date</span>
                          <span className="font-bold text-[11px]">{selectedProject.end_date || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visual Guides & Image Gallery */}
                  {projectDetails?.resources?.filter(r => r.resource_type === 'file' && ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(r.file_type?.toLowerCase())).length > 0 && (
                    <div className="md:col-span-3 bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Image className="w-5 h-5 text-emerald-600" />
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm">Project Visual Diagrams & Image Guides</h4>
                          <p className="text-[10px] text-slate-400">Review project architecture, wireframes, and design schemas. Click "AI Explain" to get a detailed breakdown.</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {projectDetails.resources
                          .filter(r => r.resource_type === 'file' && ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(r.file_type?.toLowerCase()))
                          .map((img) => (
                            <div key={img.id} className="group border border-slate-100 rounded-2xl overflow-hidden hover:border-slate-300 transition-all duration-200 bg-slate-50/50 flex flex-col justify-between shadow-sm">
                              <div 
                                className="aspect-video w-full overflow-hidden bg-white cursor-pointer relative"
                                onClick={() => setZoomImage(img)}
                              >
                                <img 
                                  src={`http://localhost:5000${img.file_path}`} 
                                  alt={img.title} 
                                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <span className="text-[10px] font-black uppercase text-white bg-slate-950 px-2.5 py-1.5 rounded-xl shadow-lg">Zoom View</span>
                                </div>
                              </div>
                              <div className="p-3.5 space-y-2">
                                <h5 className="font-bold text-xs text-slate-900 truncate">{img.title}</h5>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => setZoomImage(img)}
                                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[9px] transition cursor-pointer text-center"
                                  >
                                    View
                                  </button>
                                  <button 
                                    onClick={() => handleExplainImageWithAI(img)}
                                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[9px] transition cursor-pointer text-center flex items-center justify-center gap-1"
                                  >
                                    <Sparkles className="w-2.5 h-2.5 text-white" />
                                    <span>AI Explain</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SUBTAB 2: Team & Handover details */}
              {projectTab === 'team' && (
                <div className="space-y-6 animate-[fadeIn_0.15s_ease-out]">
                  {/* Senior Dev Card */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-3 text-left">
                      <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">Reporting Senior Developer</span>
                      <h4 className="font-extrabold text-slate-950 text-base">{selectedProject.senior_dev_name || 'Not assigned'}</h4>
                      <p className="text-xs text-slate-500 font-mono">{selectedProject.senior_dev_email}</p>
                      <p className="text-xs text-slate-500">{selectedProject.senior_dev_phone}</p>
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold">{selectedProject.senior_dev_role || 'Developer'}</span>
                    </div>

                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:col-span-2 space-y-3">
                      <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">Handovers KT Notes</span>
                      <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-600 leading-relaxed max-h-[150px] overflow-y-auto font-mono">
                        {selectedProject.senior_dev_kt_notes || 'No handover notes stored.'}
                      </div>
                    </div>
                  </div>

                  {/* Assigned Employees List */}
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4">
                    <h3 className="font-extrabold text-slate-950 text-sm">Assigned Workspace Employees</h3>
                    {projectDetails.assignments?.length === 0 ? (
                      <p className="text-xs text-slate-400">No other employees assigned to this directory.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-slate-700">
                          <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-black border-b border-slate-200">
                            <tr>
                              <th className="p-3 text-left">Employee Name</th>
                              <th className="p-3 text-left">ID</th>
                              <th className="p-3 text-left">Department</th>
                              <th className="p-3 text-left">Designation</th>
                              <th className="p-3 text-left">Assigned Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {projectDetails.assignments.map((asg) => (
                              <tr key={asg.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-3 font-bold text-slate-950">
                                  <p>{asg.employee_name}</p>
                                  <span className="text-[10px] text-slate-400 font-normal">{asg.employee_email}</span>
                                </td>
                                <td className="p-3 font-mono text-slate-400">{asg.emp_uid || 'N/A'}</td>
                                <td className="p-3 text-slate-600">{asg.department || 'N/A'}</td>
                                <td className="p-3 text-slate-600">{asg.designation || 'N/A'}</td>
                                <td className="p-3 text-slate-400">{asg.assigned_date}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUBTAB 3: Documentation & Resources */}
              {projectTab === 'resources' && (
                <div className="space-y-6 animate-[fadeIn_0.15s_ease-out]">
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Project Files & Document Links</h3>
                    
                    {(() => {
                      const filteredDocs = projectDetails.resources?.filter(r => 
                        r.resource_type !== 'file' || 
                        !['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(r.file_type?.toLowerCase())
                      ) || [];
                      
                      return filteredDocs.length === 0 ? (
                        <p className="text-xs text-slate-400 py-6 text-center">No document resources have been uploaded to this project folder yet.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {filteredDocs.map((res) => (
                            <div key={res.id} className="border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between hover:border-slate-300 transition shadow-sm">
                              <div className="flex items-center gap-3">
                              <span className="text-2xl">
                                {res.resource_type === 'file' ? '📄' : res.resource_type === 'link' ? '🔗' : '✏️'}
                              </span>
                              <div className="text-left">
                                <h4 className="font-extrabold text-slate-900 text-xs truncate max-w-xs">{res.title}</h4>
                                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                                  {res.resource_type === 'file' ? `${res.file_type} File` : res.resource_type}
                                </span>
                              </div>
                            </div>
                            
                            <div>
                              {res.resource_type === 'file' ? (
                                <a 
                                  href={`http://localhost:5000${res.file_path}`} 
                                  download 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="p-2 border border-slate-200 hover:border-slate-800 rounded-xl hover:bg-slate-50 transition cursor-pointer inline-flex items-center"
                                >
                                  <Download className="w-3.5 h-3.5 text-slate-600" />
                                </a>
                              ) : res.resource_type === 'link' ? (
                                <a 
                                  href={res.url} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="p-2 border border-slate-200 hover:border-slate-800 rounded-xl hover:bg-slate-50 transition cursor-pointer inline-flex items-center"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                                </a>
                              ) : (
                                <button 
                                  onClick={() => toast(res.notes, { duration: 6000, icon: '✏️' })}
                                  className="px-2.5 py-1.5 border border-slate-200 hover:border-slate-800 rounded-xl text-[10px] font-bold text-slate-600 transition cursor-pointer"
                                >
                                  View Notes
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )})()}
                  </div>
                </div>
              )}

              {/* SUBTAB 4: Embedded RAG Chat Assistant */}
              {projectTab === 'chat' && (
                <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-md h-[550px] flex flex-col justify-between animate-[fadeIn_0.15s_ease-out]">
                  
                  {/* Chat header */}
                  <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-950 flex items-center justify-center text-white">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900 leading-none">RAG Assistant - {selectedProject.name}</h4>
                        <span className="text-[9px] text-slate-400">Context bound strictly to this project's knowledge base</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-black uppercase text-lime-700 bg-lime-50 px-2 py-0.5 rounded-full border border-lime-100">Agent Active</span>
                  </div>

                  {/* Chat Thread */}
                  <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/30">
                    {(projectChats[selectedProject.id] || []).length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-20 font-mono">Chat initialized. Ask a question to begin RAG query.</p>
                    ) : (
                      (projectChats[selectedProject.id] || []).map((msg, i) => (
                        <div key={i} className={`flex items-start gap-2.5 max-w-xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse text-right' : 'mr-auto text-left'}`}>
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] border flex-shrink-0 ${
                            msg.sender === 'user' ? 'bg-slate-950 text-white border-slate-900' : 'bg-white text-slate-900 border-slate-200'
                          }`}>
                            {msg.sender === 'user' ? 'U' : 'AI'}
                          </div>
                          <div className="space-y-1 max-w-[85%]">
                            <div className={`p-3 rounded-2xl text-xs border shadow-sm ${
                              msg.sender === 'user' ? 'bg-slate-950 text-white border-slate-900' : 'bg-white text-slate-800 border-slate-200/50'
                            }`}>
                              {msg.sender === 'user' ? <p className="font-medium whitespace-pre-wrap">{msg.text}</p> : renderMarkdown(msg.text)}
                            </div>
                            {msg.sender === 'ai' && (
                              <div className="flex items-center gap-2 text-[8px] text-slate-400 font-bold justify-start px-1">
                                <button onClick={() => handleCopyText(msg.text)} className="hover:text-slate-800 flex items-center gap-0.5 transition cursor-pointer"><Copy className="w-2.5 h-2.5" />Copy</button>
                                <span>•</span>
                                <button onClick={() => handleRegenerate(i)} className="hover:text-slate-800 flex items-center gap-0.5 transition cursor-pointer"><RotateCw className="w-2.5 h-2.5" />Regenerate</button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                    
                    {aiTyping && (
                      <div className="flex items-start gap-2.5 mr-auto text-left">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center border bg-white border-slate-200"><Sparkles className="w-3 h-3 text-purple-600 animate-pulse" /></div>
                        <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-75"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-150"></span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Prompts + Input */}
                  <div className="p-3 border-t border-slate-100 bg-white space-y-3">
                    <div className="flex flex-wrap gap-1.5 justify-center max-w-2xl mx-auto">
                      {['Explain this Project', 'Explain Backend API', 'Explain Database Structure', 'Explain Business Logic'].map((p) => (
                        <button key={p} onClick={() => handleSendMessage(p)} className="py-1 px-2 border border-slate-200 hover:border-slate-800 rounded-lg text-[9px] font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer">
                          {p}
                        </button>
                      ))}
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-1.5 flex items-center gap-2 max-w-2xl mx-auto">
                      <input 
                        type="text" 
                        placeholder="Query RAG documentation regarding this directory..." 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1 bg-transparent px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                      />
                      <button onClick={() => handleSendMessage()} className="w-8 h-8 rounded-lg bg-slate-950 text-white flex items-center justify-center cursor-pointer">
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}



          {/* TAB: AI Assistant Split-Pane Chat */}
          {activeTab === 'ai-assistant' && (
            <div className="flex flex-col lg:flex-row gap-6 items-stretch h-[calc(100vh-140px)] min-h-[580px] animate-[fadeIn_0.2s_ease-out]">
              
              {/* 1. Left Panel: Select a Project */}
              <div className="w-full lg:w-[360px] bg-white border border-slate-200/80 rounded-3xl p-5 flex flex-col justify-between shadow-sm max-h-full">
                <div className="flex flex-col h-full">
                  <div className="border-b border-slate-100 pb-3 flex items-start gap-2">
                    <FileText className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div className="text-left">
                      <h3 className="font-extrabold text-slate-900 text-sm">Select a Project</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">Choose a project to start chatting with the AI about its documentation, code, APIs, and more.</p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3.5 mt-4 pr-1 scrollbar-thin">
                    {userProjects.length === 0 ? (
                      <p className="text-xs text-slate-400 py-10 text-center">No assigned projects found.</p>
                    ) : (
                      userProjects.map((proj) => {
                        const isSelected = selectedProjectChat?.id === proj.id;
                        return (
                          <div 
                            key={proj.id}
                            className={`p-4 border rounded-2xl transition-all flex flex-col gap-3 text-left ${
                              isSelected 
                                ? 'bg-emerald-50/15 border-emerald-500 shadow-sm ring-1 ring-emerald-500/20' 
                                : 'bg-slate-50/50 border-slate-100 hover:bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
                                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-emerald-600">
                                  <rect x="4" y="9" width="16" height="11" rx="3" fill="#10b981" fillOpacity="0.1" stroke="#10b981" strokeWidth="1.5" />
                                  <path d="M12 3v6M9 6h6" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
                                  <circle cx="8" cy="13" r="1" fill="#10b981" />
                                  <circle cx="16" cy="13" r="1" fill="#10b981" />
                                  <path d="M9 17c1 0.8 5 0.8 6 0" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                              </div>
                              <div className="truncate space-y-0.5">
                                <h4 className="font-extrabold text-xs text-slate-900 truncate flex items-center gap-1.5 justify-between w-full">
                                  <span>{proj.name}</span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
                                </h4>
                                <p className="text-[10px] text-slate-400 font-medium">Client: <span className="font-bold text-slate-700">{proj.client}</span></p>
                              </div>
                            </div>

                            <div className="space-y-1 border-t border-slate-100 pt-2.5 text-[10px] text-slate-500">
                              <p className="truncate">Stack: <span className="font-semibold text-slate-800 font-mono">{proj.tech_stack || 'N/A'}</span></p>
                              <div className="flex items-center gap-1">
                                <span>Status:</span>
                                <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                                  proj.status === 'Completed' || proj.status === 'Live' ? 'bg-emerald-500' : 'bg-amber-400'
                                }`}></span>
                                <span className="font-semibold text-slate-800">{proj.status}</span>
                              </div>
                              <p>Assigned: <span className="font-semibold text-slate-800">{proj.assigned_date || 'Recent'}</span></p>
                              <p className="truncate">Senior Dev: <span className="font-semibold text-slate-800">{proj.senior_dev_name || 'N/A'}</span></p>
                            </div>

                            <div className="pt-1.5">
                              {proj.is_enabled === 0 ? (
                                <div className="w-full text-center py-2 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-[10px] font-bold select-none cursor-not-allowed border-dashed">
                                  🔒 Access Revoked
                                </div>
                              ) : (
                                <button 
                                  onClick={() => openProjectChat(proj)}
                                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm shadow-emerald-600/10 animate-[pulse_3s_infinite]"
                                >
                                  💬 Open AI Chat
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Right Panel: Active Chat Thread */}
              <div className="flex-1 bg-white border border-slate-200/80 rounded-3xl flex flex-col justify-between shadow-sm overflow-hidden min-h-full max-h-full">
                {!selectedProjectChat ? (
                  /* Placeholder when no project is chosen */
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-inner animate-[bounce_3s_infinite]">
                      <Cpu className="w-8 h-8 text-emerald-600 animate-pulse" />
                    </div>
                    <div className="space-y-1.5 max-w-sm">
                      <h3 className="font-extrabold text-slate-900 text-base">Choose a Project to Start an AI Conversation</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">The AI Assistant will answer questions only from the knowledge uploaded for the selected project.</p>
                    </div>
                  </div>
                ) : (
                  /* Active project chat session */
                  <div className="flex flex-col h-full justify-between overflow-hidden">
                    
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/20 text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 relative">
                          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white animate-ping"></span>
                          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                          <svg viewBox="0 0 24 24" fill="none" className="w-5.5 h-5.5 text-emerald-600 animate-[pulse_2s_infinite]">
                            <rect x="4" y="9" width="16" height="11" rx="3" fill="#10b981" fillOpacity="0.15" stroke="#10b981" strokeWidth="1.5" />
                            <path d="M12 3v6M9 6h6" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
                            <circle cx="8" cy="13" r="1.2" fill="#10b981" />
                            <circle cx="16" cy="13" r="1.2" fill="#10b981" />
                            <path d="M9 17c1 1 5 1 6 0" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="font-black text-slate-950 text-sm leading-tight">{selectedProjectChat.name}</h4>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Client: <span className="font-semibold text-slate-700">{selectedProjectChat.client}</span> • Stack: <span className="font-semibold text-slate-700">{selectedProjectChat.tech_stack || 'N/A'}</span>
                          </p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <span className="inline-flex items-center gap-1 text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-700">
                              AI Context: {selectedProjectChat.name} Knowledge Base
                            </span>
                            <span className="inline-flex items-center gap-1 text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-700">
                              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                              Knowledge Status: Indexed
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center">
                        <button 
                          onClick={() => {
                            setSelectedProject(selectedProjectChat);
                            setProjectTab('overview');
                            setActiveTab('project-view');
                          }}
                          className="px-3 py-1.5 border border-slate-200 hover:border-slate-800 text-slate-600 hover:text-slate-900 rounded-xl text-[10px] font-extrabold transition cursor-pointer"
                        >
                          Project Details
                        </button>
                      </div>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/30 scrollbar-thin">
                      {(projectChats[selectedProjectChat.id] || []).map((msg, idx) => (
                        <div key={idx} className={`flex items-start gap-3 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse text-right' : 'mr-auto text-left'}`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 border ${
                            msg.sender === 'user' ? 'bg-slate-950 text-white border-slate-900' : 'bg-emerald-50 text-emerald-900 border-emerald-100'
                          }`}>
                            {msg.sender === 'user' ? 'U' : (
                              <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5 text-emerald-600 animate-[pulse_2.5s_infinite]">
                                <rect x="4" y="9" width="16" height="11" rx="3" fill="#10b981" fillOpacity="0.15" stroke="#10b981" strokeWidth="1.5" />
                                <path d="M12 3v6M9 6h6" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
                                <circle cx="8" cy="13" r="1.2" fill="#10b981" />
                                <circle cx="16" cy="13" r="1.2" fill="#10b981" />
                                <path d="M9 17c1 1 5 1 6 0" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
                              </svg>
                            )}
                          </div>
                          
                          <div className="space-y-1.5 max-w-[85%]">
                            <div className={`p-4 rounded-2xl shadow-sm border ${
                              msg.sender === 'user' ? 'bg-slate-950 text-white border-slate-900' : 'bg-white text-slate-800 border-slate-200/50'
                            }`}>
                              {msg.sender === 'user' ? <p className="text-sm font-medium whitespace-pre-wrap">{msg.text}</p> : renderMarkdown(msg.text)}
                              
                              {/* Structured Dev details card */}
                              {msg.sender === 'ai' && msg.isDevDetails && msg.devData && (
                                <div className="mt-3.5 p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 text-xs text-slate-700 max-w-lg shadow-sm text-left animate-[fadeIn_0.15s_ease-out]">
                                  <div className="flex items-center gap-3 border-b border-slate-200/60 pb-3">
                                    <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 text-sm">
                                      👤
                                    </div>
                                    <div>
                                      <h4 className="font-extrabold text-slate-900 text-xs">{msg.devData.name}</h4>
                                      <span className="text-[9px] text-emerald-700 font-bold uppercase tracking-wider">{msg.devData.role}</span>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                      <span className="text-slate-400 block text-[8px] uppercase tracking-wider font-extrabold">Email Address</span>
                                      <span className="font-semibold text-slate-800 font-mono">{msg.devData.email}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-400 block text-[8px] uppercase tracking-wider font-extrabold">Phone Number</span>
                                      <span className="font-semibold text-slate-800 font-mono">{msg.devData.phone}</span>
                                    </div>
                                    <div className="sm:col-span-2">
                                      <span className="text-slate-400 block text-[8px] uppercase tracking-wider font-extrabold">Working Period</span>
                                      <span className="font-semibold text-slate-800">{msg.devData.workingPeriod}</span>
                                    </div>
                                    <div className="sm:col-span-2 border-t border-slate-100 pt-2.5">
                                      <span className="text-slate-400 block text-[8px] uppercase tracking-wider font-extrabold mb-1">Responsibilities & Handovers</span>
                                      <p className="text-xs leading-relaxed font-mono whitespace-pre-wrap bg-white p-2.5 border border-slate-200/80 rounded-xl">{msg.devData.responsibilities}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {msg.sender === 'ai' && (
                              <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold px-1 justify-start">
                                <span>{msg.time}</span>
                                <span>•</span>
                                <button onClick={() => handleCopyText(msg.text)} className="hover:text-slate-800 flex items-center gap-1 transition cursor-pointer p-0.5"><Copy className="w-3 h-3" /><span>Copy</span></button>
                                <span>•</span>
                                <button onClick={() => handleRegenerate(idx)} className="hover:text-slate-800 flex items-center gap-1 transition cursor-pointer p-0.5"><RotateCw className="w-3 h-3" /><span>Regenerate</span></button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {aiTyping && (
                        <div className="flex items-start gap-3 max-w-3xl mr-auto text-left">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center border bg-white border-slate-200 flex-shrink-0">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                          </div>
                          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
                            <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-75"></span>
                            <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-150"></span>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Footer suggested prompts & text inputs */}
                    <div className="p-4 border-t border-slate-100 bg-white space-y-3.5">
                      
                      {/* Suggested prompts row */}
                      <div className="flex flex-wrap gap-1.5 justify-center max-w-4xl mx-auto">
                        {[
                          'Explain this Project',
                          'Backend Architecture',
                          'Database Structure',
                          'API Flow',
                          'Who developed this?'
                        ].map((prompt) => (
                          <button 
                            key={prompt} 
                            onClick={() => handleSendMessage(prompt)} 
                            className="py-1.5 px-3 border border-slate-200 hover:border-slate-800 rounded-xl text-[10px] font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer bg-slate-50/50 hover:bg-white shadow-sm"
                          >
                            💡 {prompt}
                          </button>
                        ))}
                      </div>

                      {/* Main chat input */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-1.5 flex items-center gap-2 max-w-3xl mx-auto shadow-inner">
                        <input 
                          type="text" 
                          placeholder="Ask about project structure, APIs, database, logic..." 
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                        />
                        <button 
                          onClick={() => handleSendMessage()}
                          className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center cursor-pointer transition shadow-md shadow-emerald-600/10"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex justify-between items-center max-w-3xl mx-auto pt-1 text-[10px] text-slate-400">
                        <span>AI responses are generated from project knowledge base and may not always be 100% accurate.</span>
                        <button 
                          onClick={() => {
                            setProjectChats((prev) => ({
                              ...prev,
                              [selectedProjectChat.id]: [
                                {
                                  sender: 'ai',
                                  text: `### Chat History Cleared.\nAsk me anything about project specifications, database configurations, or senior developer handovers!`,
                                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                }
                              ]
                            }));
                            toast.success('Chat history cleared!');
                          }}
                          className="text-[10px] font-bold text-slate-400 hover:text-slate-800 flex items-center gap-1 transition cursor-pointer select-none"
                        >
                          Clear Chat
                        </button>
                      </div>

                    </div>

                  </div>
                )}
              </div>

            </div>
          )}

          {/* 6. Saved Items Tab */}
          {activeTab === 'saved' && (
            <div className="space-y-4 text-left animate-[fadeIn_0.2s_ease-out]">
              <h2 className="text-xl font-black text-slate-950">Saved Notes & Clippings</h2>
              <p className="text-xs text-slate-400">Save AI responses or documentation snippets here for offline reading.</p>
            </div>
          )}

          {/* 7. Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6 text-left animate-[fadeIn_0.2s_ease-out]">
              <h2 className="text-xl font-black text-slate-950">My Profile Settings</h2>
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-2xl space-y-6 shadow-sm">
                
                {/* Profile Pic Upload section */}
                <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-slate-100 pb-6">
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center overflow-hidden shadow-inner">
                      {profilePic ? (
                        <img src={profilePic} alt="Employee avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-10 h-10 text-slate-400" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 w-7 h-7 bg-slate-950 text-white rounded-full flex items-center justify-center cursor-pointer shadow-md hover:scale-105 transition-transform text-xs border-2 border-white">
                      📷
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleProfilePicChange} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                  <div className="text-center sm:text-left space-y-1">
                    <h3 className="font-extrabold text-lg text-slate-955">{user?.name || 'sathish sharma'}</h3>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        {user?.role || 'employee'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Visible/Invisible toggles for Email and Password */}
                <div className="space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Account Credentials</h4>
                  
                  {/* Email */}
                  <div className="space-y-1.5 text-left">
                    <span className="text-xs font-bold text-slate-700 block">Email Address</span>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl max-w-md justify-between">
                      <span className="text-xs font-medium font-mono text-slate-800">
                        {showEmail ? user?.email : '•••••••••••••••••••••'}
                      </span>
                      <button 
                        onClick={() => setShowEmail(!showEmail)} 
                        className="text-slate-400 hover:text-slate-800 transition cursor-pointer p-0.5"
                      >
                        {showEmail ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5 text-left">
                    <span className="text-xs font-bold text-slate-700 block">Workspace Password</span>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl max-w-md justify-between">
                      <span className="text-xs font-medium font-mono text-slate-800">
                        {showProfilePass ? 'ktai123' : '••••••••••'}
                      </span>
                      <button 
                        onClick={() => setShowProfilePass(!showProfilePass)} 
                        className="text-slate-400 hover:text-slate-800 transition cursor-pointer p-0.5"
                      >
                        {showProfilePass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Additional useful items */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Useful Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/50">
                      <span className="text-slate-400 block font-bold text-[9px] uppercase tracking-wider">Designation</span>
                      <span className="text-slate-800 font-bold mt-0.5 block">Associate Software Developer</span>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/50">
                      <span className="text-slate-400 block font-bold text-[9px] uppercase tracking-wider">Department</span>
                      <span className="text-slate-800 font-bold mt-0.5 block">Engineering / AI Research</span>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/50">
                      <span className="text-slate-400 block font-bold text-[9px] uppercase tracking-wider">Join Date</span>
                      <span className="text-slate-800 font-bold mt-0.5 block">July 21, 2026</span>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/50">
                      <span className="text-slate-400 block font-bold text-[9px] uppercase tracking-wider">Reporting Senior Dev</span>
                      <span className="text-slate-800 font-bold mt-0.5 block">Sathish Sharma (Lead Dev)</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>



      {/* Visual Image Zoom Lightbox Modal */}
      {zoomImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-white rounded-3xl border border-slate-200/50 max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row items-stretch">
            
            {/* Image display */}
            <div className="flex-1 bg-slate-950 flex items-center justify-center min-h-[300px] p-2">
              <img 
                src={`http://localhost:5000${zoomImage.file_path}`} 
                alt={zoomImage.title} 
                className="max-h-[75vh] max-w-full object-contain rounded-xl"
              />
            </div>

            {/* Side Details & AI trigger */}
            <div className="w-full md:w-[320px] p-6 flex flex-col justify-between text-left bg-white border-t md:border-t-0 md:border-l border-slate-100">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-extrabold text-sm text-slate-900 truncate pr-4">{zoomImage.title}</h4>
                  <button 
                    onClick={() => setZoomImage(null)}
                    className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-900 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">File details</span>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-[11px] text-slate-600 font-mono space-y-1">
                    <p>Format: <span className="font-bold text-slate-800 uppercase">{zoomImage.file_type}</span></p>
                    <p className="truncate">Path: <span className="font-bold text-slate-800">{zoomImage.file_path}</span></p>
                  </div>
                </div>

                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                    <span>AI Analysis Available</span>
                  </div>
                  <p className="text-[11px] text-emerald-700/80 leading-relaxed">The AI Assistant can analyze this diagram to explain how backend flows, APIs, or database structures correlate to your tasks.</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button 
                  onClick={() => {
                    setZoomImage(null);
                    handleExplainImageWithAI(zoomImage);
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/10"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask AI to Explain</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default EmployeeDashboard;
