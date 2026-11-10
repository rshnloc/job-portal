import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { HeroSearch } from './components/HeroSearch';
import { JobList } from './components/JobList';
import { ResumeBuilder } from './components/ResumeBuilder';
import { MyApplications } from './components/MyApplications';
import { EmployerDashboard } from './components/EmployerDashboard';
import { AtsBoard } from './components/AtsBoard';
import { CompanyDirectory } from './components/CompanyDirectory';
import { AnalyticsView } from './components/AnalyticsView';
import { Job } from './types';
import { api } from './api';
import { ShieldCheck } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('jobs');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [workplaceType, setWorkplaceType] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // ATS target job if opened from employer dashboard
  const [targetAtsJobId, setTargetAtsJobId] = useState<number | null>(null);

  // Jobs state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [searchQuery, locationQuery, workplaceType, experienceFilter, jobTypeFilter, departmentFilter, sortBy, selectedTag]);

  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const q = selectedTag ? `${searchQuery} ${selectedTag}`.trim() : searchQuery;
      const data = await api.getJobs({
        q: q || undefined,
        location: locationQuery || undefined,
        workplace_type: workplaceType || undefined,
        experience_level: experienceFilter || undefined,
        job_type: jobTypeFilter || undefined,
        department: departmentFilter || undefined,
        sort_by: sortBy,
      });
      setJobs(data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleSelectJobFromCompany = (jobId: number) => {
    setCurrentTab('jobs');
    setSearchQuery('');
  };

  const handleOpenAtsForJob = (jobId: number) => {
    setTargetAtsJobId(jobId);
    setCurrentTab('ats');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openAuthModal={handleOpenAuth}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {currentTab === 'jobs' && (
          <>
            <HeroSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              locationQuery={locationQuery}
              setLocationQuery={setLocationQuery}
              workplaceType={workplaceType}
              setWorkplaceType={setWorkplaceType}
              onSearch={fetchJobs}
              selectedTag={selectedTag}
              onSelectTag={(tag) => setSelectedTag(tag === selectedTag ? null : tag)}
            />

            <JobList
              jobs={jobs}
              loading={loadingJobs}
              onRefresh={fetchJobs}
              openAuthModal={handleOpenAuth}
              experienceFilter={experienceFilter}
              setExperienceFilter={setExperienceFilter}
              jobTypeFilter={jobTypeFilter}
              setJobTypeFilter={setJobTypeFilter}
              departmentFilter={departmentFilter}
              setDepartmentFilter={setDepartmentFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          </>
        )}

        {currentTab === 'companies' && (
          <CompanyDirectory onSelectJob={handleSelectJobFromCompany} />
        )}

        {currentTab === 'resume' && (
          <ResumeBuilder />
        )}

        {currentTab === 'applications' && (
          <MyApplications />
        )}

        {currentTab === 'employer' && (
          <EmployerDashboard onOpenAts={handleOpenAtsForJob} />
        )}

        {currentTab === 'ats' && (
          <AtsBoard initialJobId={targetAtsJobId} />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-[10px]">
              NH
            </div>
            <span className="font-bold text-slate-800">NextHire Job Portal Engine</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              100% Synthetic & Secure Data
            </span>
          </div>

          <p className="text-center sm:text-right">
            Engineered with Python (FastAPI), TypeScript & React • Zero credentials stored • High-precision AI matching
          </p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
      />

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
