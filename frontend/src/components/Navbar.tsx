import React, { useState } from 'react';
import { 
  Briefcase, Sparkles, Building2, FileText, LayoutDashboard, 
  BarChart3, User as UserIcon, LogOut, ChevronDown, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openAuthModal: (mode: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, openAuthModal }) => {
  const { user, isAuthenticated, logout, demoLogin } = useAuth();
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleDemoSwitch = async (role: 'candidate' | 'employer' | 'admin') => {
    setDemoMenuOpen(false);
    await demoLogin(role);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setCurrentTab('jobs')}
              className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                  NextHire
                  <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200/60 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-indigo-600" /> AI
                  </span>
                </span>
                <span className="text-xs text-slate-400 block -mt-1 font-medium">Smart Career Platform</span>
              </div>
            </button>

            {/* Main Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => setCurrentTab('jobs')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  currentTab === 'jobs' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                Find Jobs
              </button>

              <button
                onClick={() => setCurrentTab('companies')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  currentTab === 'companies' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Companies
              </button>

              {/* Candidate Only Links */}
              {(!user || user.role === 'job_seeker') && (
                <>
                  <button
                    onClick={() => setCurrentTab('resume')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      currentTab === 'resume' 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    AI Resume
                  </button>

                  {user && (
                    <button
                      onClick={() => setCurrentTab('applications')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        currentTab === 'applications' 
                          ? 'bg-indigo-50 text-indigo-700' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      My Applications
                    </button>
                  )}
                </>
              )}

              {/* Employer / Admin Links */}
              {user && (user.role === 'employer' || user.role === 'admin') && (
                <>
                  <button
                    onClick={() => setCurrentTab('employer')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      currentTab === 'employer' 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Employer Portal
                  </button>
                  <button
                    onClick={() => setCurrentTab('ats')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      currentTab === 'ats' 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    ATS Pipeline
                  </button>
                </>
              )}

              <button
                onClick={() => setCurrentTab('analytics')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  currentTab === 'analytics' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </button>
            </nav>
          </div>

          {/* Right Header: Role switcher, Demo accounts, Auth */}
          <div className="flex items-center gap-3">
            
            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 hover:bg-amber-100 transition-colors cursor-pointer"
                title="Switch demo persona for instant testing"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Demo Switcher</span>
                <ChevronDown className="w-3.5 h-3.5 text-amber-600" />
              </button>

              {demoMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setDemoMenuOpen(false)}
                >
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Instant 1-Click Personas
                  </div>
                  <button
                    onClick={() => handleDemoSwitch('candidate')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Alex Rivera (Candidate)</div>
                      <div className="text-[11px] text-slate-500">Senior Full-Stack Engineer</div>
                    </div>
                    {user?.email === 'candidate@example.com' && (
                      <span className="text-emerald-600 font-bold">✓</span>
                    )}
                  </button>

                  <button
                    onClick={() => handleDemoSwitch('employer')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Sarah Lin (Employer)</div>
                      <div className="text-[11px] text-slate-500">TechNova VP Talent</div>
                    </div>
                    {user?.email === 'employer@example.com' && (
                      <span className="text-emerald-600 font-bold">✓</span>
                    )}
                  </button>

                  <button
                    onClick={() => handleDemoSwitch('admin')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Jordan Taylor (Admin)</div>
                      <div className="text-[11px] text-slate-500">Platform Administrator</div>
                    </div>
                    {user?.email === 'admin@example.com' && (
                      <span className="text-emerald-600 font-bold">✓</span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Auth Buttons or User Profile */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 bg-white transition-all text-left"
                >
                  <img
                    src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.full_name}`}
                    alt={user.full_name}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/20"
                  />
                  <div className="hidden sm:block text-xs">
                    <p className="font-semibold text-slate-800 leading-tight">{user.full_name}</p>
                    <p className="text-[10px] text-indigo-600 font-medium capitalize">{user.role.replace('_', ' ')}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50"
                    onMouseLeave={() => setProfileMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900">{user.full_name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium bg-indigo-50 text-indigo-700 rounded-md">
                        {user.role === 'job_seeker' ? 'Candidate Profile' : user.role === 'employer' ? 'Employer Account' : 'Administrator'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        if (user.role === 'employer' || user.role === 'admin') {
                          setCurrentTab('employer');
                        } else {
                          setCurrentTab('resume');
                        }
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      Manage Profile & Resume
                    </button>

                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
