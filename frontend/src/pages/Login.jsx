import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, BookOpen, Cpu, Sparkles, Database, Code, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import devImg from '../assets/ai_developer_onboarding.png';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailReadOnly, setEmailReadOnly] = useState(true);
  const [passReadOnly, setPassReadOnly] = useState(true);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      toast.success('Successfully logged in!');
      if (result.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      toast.error(result.message || 'Login failed. Please check credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] flex items-stretch text-slate-900 font-sans">
      
      {/* LEFT SIDE: Marketing / Knowledge Feed Presentation (Half screen) */}
      <div className="hidden lg:flex lg:w-1/2 bg-white border-r border-slate-100 p-12 xl:p-16 flex-col justify-between select-none relative overflow-hidden">
        
        {/* Header & Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center shadow-md">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path d="M12 3L2 8l10 5 10-5-10-5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17l10 5 10-5" stroke="#a3e635" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 2"/>
            </svg>
          </div>
          <span className="font-black text-lg tracking-tight text-slate-900">
            KnowledgeFeed AI
          </span>
        </div>

        {/* Hero Section */}
        <div className="my-auto grid grid-cols-1 xl:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left Hero Text Column */}
          <div className="xl:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-lime-500 fill-lime-500" />
              Everything you need to succeed in onboarding
            </div>

            <h1 className="text-4xl xl:text-5xl font-black text-slate-950 tracking-tight leading-[1.1] text-balance">
              Preserve, index, and query project knowledge.
            </h1>

            <p className="text-slate-500 text-sm xl:text-base leading-relaxed">
              From codebase transfer and API documentation to database models, schemas, and directories. KnowledgeFeed AI provides the platform, performance, and RAG memory to onboard team members instantly.
            </p>

            {/* Start Building / Start Onboarding Button in Green/Lime */}
            <div className="pt-2">
              <button 
                type="button"
                onClick={() => toast('Welcome! Log in on the right to start onboarding.')}
                className="inline-flex items-center gap-3 px-6 py-3.5 bg-[#a3e635] hover:bg-[#8ece24] text-slate-950 font-bold rounded-full transition-all duration-200 shadow-md shadow-lime-300/30 cursor-pointer"
              >
                <span>Start Onboarding</span>
                <span className="w-6 h-6 rounded-full bg-slate-950 flex items-center justify-center text-white">
                  <ArrowRight className="w-3.5 h-3.5 -rotate-45" />
                </span>
              </button>
            </div>
          </div>

          {/* Right Visual Image & Floating Badges Column */}
          <div className="xl:col-span-5 flex justify-center relative">
            
            {/* Curved Lime Background Shadow Block */}
            <div className="absolute top-2 -left-2 w-[240px] h-[320px] rounded-3xl bg-[#a3e635] -rotate-6 z-0"></div>

            {/* Main Visual Image container */}
            <div className="w-[240px] h-[320px] rounded-3xl overflow-hidden border-2 border-slate-950 shadow-xl relative z-10 bg-slate-100">
              <img 
                src={devImg} 
                alt="AI Developer Onboarding" 
                className="w-full h-full object-cover grayscale-[20%] contrast-[1.05]"
              />

              {/* Circular Rotating Badge Overlay */}
              <div className="absolute bottom-4 right-4 w-18 h-18 bg-slate-950 rounded-full flex items-center justify-center border border-white/20 shadow-lg animate-[spin_20s_linear_infinite] select-none">
                <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
                  <path id="circlePath" d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
                  <text className="font-mono text-[9px] font-bold tracking-[2.4px]">
                    <textPath href="#circlePath">
                      KNOWLEDGE FEED AI • ONBOARDING •
                    </textPath>
                  </text>
                </svg>
              </div>
            </div>

            {/* Floating Tags connected to the main image */}
            <div className="absolute top-12 -left-16 z-20 bg-white border border-slate-200/80 rounded-xl px-3 py-1.5 shadow-md flex items-center gap-1.5 text-[11px] font-bold text-slate-800 animate-[bounce_4s_infinite]">
              <Cpu className="w-3.5 h-3.5 text-indigo-500" />
              <span>Create with AI</span>
            </div>

            <div className="absolute bottom-28 -right-12 z-20 bg-white border border-slate-200/80 rounded-xl px-3 py-1.5 shadow-md flex items-center gap-1.5 text-[11px] font-bold text-slate-800 animate-[bounce_4.5s_infinite]">
              <Database className="w-3.5 h-3.5 text-lime-600" />
              <span>Database Schema</span>
            </div>

            <div className="absolute bottom-12 -left-16 z-20 bg-white border border-slate-200/80 rounded-xl px-3 py-1.5 shadow-md flex items-center gap-1.5 text-[11px] font-bold text-slate-800 animate-[bounce_3.5s_infinite]">
              <Code className="w-3.5 h-3.5 text-violet-600" />
              <span>Ask about APIs</span>
            </div>
          </div>
        </div>

        {/* Info Grid at Bottom */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 relative z-10 pt-8 border-t border-slate-100">
          <div className="space-y-1">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">Processing</h4>
            <p className="text-xs font-bold text-slate-900">⚡ Lightning Fast</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">Security</h4>
            <p className="text-xs font-bold text-slate-900">🔒 Secure & Reliable</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">Search</h4>
            <p className="text-xs font-bold text-slate-900">🌱 Semantic RAG</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">Support</h4>
            <p className="text-xs font-bold text-slate-900">🤝 Expert AI Agent</p>
          </div>
        </div>

      </div>

      {/* RIGHT SIDE: Login Box Container (Half screen) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16 bg-slate-50">
        
        {/* Form Container (Strict copy of screenshot design) */}
        <div className="w-full max-w-[430px] space-y-6 bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-100 border border-slate-100/50">
          
          {/* Form Header */}
          <div className="space-y-2 text-left">
            <h2 className="text-[28px] font-bold text-slate-900 tracking-tight">Login</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Welcome back! Login to access your workspace dashboard.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Email Field */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="email" className="text-xs font-bold text-slate-700 block">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4.5 h-4.5" />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="sathishj0423@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={emailReadOnly}
                  onFocus={() => setEmailReadOnly(false)}
                  onClick={() => setEmailReadOnly(false)}
                  autoComplete="off"
                  className="block w-full pl-11 pr-4 py-3 bg-[#eff4fc]/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-bold text-slate-700 block">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => toast('Please contact your Admin to recover password credentials.', { icon: '🔑' })}
                  className="text-xs font-bold text-slate-800 hover:underline transition"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  readOnly={passReadOnly}
                  onFocus={() => setPassReadOnly(false)}
                  onClick={() => setPassReadOnly(false)}
                  autoComplete="new-password"
                  className="block w-full pl-11 pr-11 py-3 bg-[#eff4fc]/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center text-left">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4.5 w-4.5 rounded border-slate-300 text-slate-900 focus:ring-slate-950 cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 select-none cursor-pointer">
                Remember me on this device
              </label>
            </div>

            {/* Cloudflare Style Verification Block (Strict copy of screenshot) */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 select-none">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-5 h-5 text-emerald-600 fill-emerald-100 flex-shrink-0" />
                <span className="text-xs font-semibold text-slate-800">Success!</span>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Cloudflare</span>
                </div>
                <div className="flex gap-2 text-[9px] text-slate-400 font-semibold justify-end">
                  <a href="#privacy" className="hover:underline">Privacy</a>
                  <span>•</span>
                  <a href="#help" className="hover:underline">Help</a>
                </div>
              </div>
            </div>

            {/* Log In Button (Sleek dark gradient with arrow icon) */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex items-center justify-center py-3.5 px-4 border border-transparent text-sm font-extrabold rounded-xl text-white bg-[#030712] hover:bg-slate-900 focus:outline-none transition-all duration-150 cursor-pointer shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="flex-1 text-center pl-6">{loading ? 'Logging in...' : 'Log In'}</span>
              <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>
          </form>



          {/* Bottom Signup footer */}
          <div className="text-center pt-2">
            <p className="text-sm text-slate-500">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => toast('Registration is managed solely by your Administrator.', { icon: '🔒' })}
                className="font-bold text-slate-900 hover:underline cursor-pointer"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
