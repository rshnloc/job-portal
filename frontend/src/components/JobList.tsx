import React, { useState } from 'react';
import { 
  Building2, MapPin, DollarSign, Clock, Bookmark, BookmarkCheck, 
  Sparkles, CheckCircle2, ChevronRight, X, Briefcase, Send, AlertCircle, Eye
} from 'lucide-react';
import { Job } from '../types';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

interface JobListProps {
  jobs: Job[];
  loading: boolean;
  onRefresh: () => void;
  openAuthModal: (mode: 'login' | 'register') => void;
  experienceFilter: string;
  setExperienceFilter: (val: string) => void;
  jobTypeFilter: string;
  setJobTypeFilter: (val: string) => void;
  departmentFilter: string;
  setDepartmentFilter: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
}

export const JobList: React.FC<JobListProps> = ({
  jobs,
  loading,
  onRefresh,
  openAuthModal,
  experienceFilter,
  setExperienceFilter,
  jobTypeFilter,
  setJobTypeFilter,
  departmentFilter,
  setDepartmentFilter,
  sortBy,
  setSortBy
}) => {
  const { user, isAuthenticated } = useAuth();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [saveLoadingId, setSaveLoadingId] = useState<number | null>(null);

  const handleToggleSave = async (e: React.MouseEvent, jobId: number) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    setSaveLoadingId(jobId);
    try {
      await api.toggleSaveJob(jobId);
      onRefresh();
      if (selectedJob && selectedJob.id === jobId) {
        setSelectedJob({ ...selectedJob, is_saved: !selectedJob.is_saved });
      }
    } finally {
      setSaveLoadingId(null);
    }
  };

  const handleOpenApply = (job: Job) => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    setSelectedJob(job);
    setCoverLetter(`Hello,\n\nI am thrilled to apply for the ${job.title} position at ${job.company?.name || 'your company'}. My technical background and skill set align strongly with your requirements.\n\nBest regards,\n${user?.full_name}`);
    setApplyModalOpen(true);
    setApplicationSuccess(false);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setIsSubmittingApp(true);
    try {
      await api.submitApplication({
        job_id: selectedJob.id,
        cover_letter: coverLetter,
      });
      setApplicationSuccess(true);
      onRefresh();
      setSelectedJob({ ...selectedJob, has_applied: true });
      setTimeout(() => {
        setApplyModalOpen(false);
        setApplicationSuccess(false);
      }, 1800);
    } catch (err: any) {
      alert(err.message || 'Failed to submit application');
    } finally {
      setIsSubmittingApp(false);
    }
  };

  const formatSalary = (min?: number, max?: number, curr = 'USD') => {
    if (!min && !max) return 'Competitive compensation';
    const fmt = (n: number) => `$${(n / 1000).toFixed(0)}k`;
    if (min && max) return `${fmt(min)} - ${fmt(max)} / year`;
    if (min) return `From ${fmt(min)} / year`;
    return `Up to ${fmt(max!)} / year`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Faceted Filters Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        
        {/* Left Filters */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Experience Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Experience Level
            </label>
            <select
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Levels</option>
              <option value="Entry">Entry Level</option>
              <option value="Mid">Mid Level</option>
              <option value="Senior">Senior Level</option>
              <option value="Lead">Lead / Architect</option>
            </select>
          </div>

          {/* Job Type Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Job Type
            </label>
            <select
              value={jobTypeFilter}
              onChange={(e) => setJobTypeFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Employment Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Department
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="DevOps & SRE">DevOps & SRE</option>
              <option value="AI Research">AI Research</option>
              <option value="Data Platform">Data Platform</option>
            </select>
          </div>

        </div>

        {/* Right Sort By */}
        <div className="flex items-center gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Sort Results
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-slate-50 text-slate-800 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="highest_salary">Highest Salary</option>
              <option value="most_viewed">Most Viewed</option>
            </select>
          </div>
          
          <div className="text-xs font-semibold text-slate-500 pt-5">
            Showing <span className="text-slate-900 font-bold">{jobs.length}</span> positions
          </div>
        </div>

      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-16">
          <div className="inline-block w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-3 text-xs font-medium text-slate-500">Loading verified job openings...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && jobs.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No positions match your filter criteria</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords, location filter, or employment type options.
          </p>
        </div>
      )}

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {jobs.map((job) => (
          <div
            key={job.id}
            onClick={() => setSelectedJob(job)}
            className="group bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all p-5 flex flex-col justify-between cursor-pointer relative overflow-hidden"
          >
            {/* Top Bar: Company Info & Save Icon */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={job.company?.logo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${job.company?.slug || 'company'}`}
                    alt={job.company?.name}
                    className="w-11 h-11 rounded-xl object-cover border border-slate-100 shadow-2xs"
                  />
                  <div>
                    <h4 className="text-xs font-semibold text-slate-600 group-hover:text-indigo-600 transition-colors">
                      {job.company?.name || 'Innovative Tech Corp'}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium">{job.department}</p>
                  </div>
                </div>

                {/* Bookmark Button */}
                <button
                  type="button"
                  onClick={(e) => handleToggleSave(e, job.id)}
                  disabled={saveLoadingId === job.id}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                  title={job.is_saved ? "Remove from saved" : "Save job"}
                >
                  {job.is_saved ? (
                    <BookmarkCheck className="w-5 h-5 text-indigo-600 fill-indigo-100" />
                  ) : (
                    <Bookmark className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Job Title */}
              <h3 className="font-bold text-slate-900 text-base mt-3 group-hover:text-indigo-600 transition-colors line-clamp-1">
                {job.title}
              </h3>

              {/* Meta details badges */}
              <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {job.location}
                </span>
                <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-medium">
                  {job.workplace_type}
                </span>
                <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {job.job_type}
                </span>
              </div>

              {/* Salary */}
              <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <DollarSign className="w-4 h-4 text-emerald-600 -mr-1" />
                <span>{formatSalary(job.min_salary, job.max_salary, job.salary_currency)}</span>
              </div>

              {/* Skill Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {job.skills_required.slice(0, 4).map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200/60 px-2 py-0.5 rounded-md"
                  >
                    {skill}
                  </span>
                ))}
                {job.skills_required.length > 4 && (
                  <span className="text-[11px] font-medium text-slate-400 px-1 py-0.5">
                    +{job.skills_required.length - 4} more
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Footer: Match Score & Action */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              
              {/* AI Match Score (if calculated) */}
              {job.match_score !== null && job.match_score !== undefined ? (
                <div 
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                    job.match_score >= 80 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : job.match_score >= 60 
                      ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{job.match_score}% Match</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{job.views_count} views</span>
                </div>
              )}

              {/* Application Button / Status */}
              {job.has_applied ? (
                <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> Applied
                </span>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenApply(job);
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <span>Easy Apply</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}

            </div>
          </div>
        ))}
      </div>

      {/* Selected Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={selectedJob.company?.logo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${selectedJob.company?.slug || 'comp'}`}
                  alt={selectedJob.company?.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm"
                />
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedJob.title}</h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                    <span className="text-indigo-600 font-semibold">{selectedJob.company?.name}</span>
                    <span>•</span>
                    <span>{selectedJob.location}</span>
                    <span>•</span>
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-semibold">
                      {selectedJob.workplace_type}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-600 font-bold">
                      {formatSalary(selectedJob.min_salary, selectedJob.max_salary, selectedJob.salary_currency)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedJob(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
              
              {/* AI Match Overview Banner if logged in as candidate */}
              {selectedJob.match_score !== null && selectedJob.match_score !== undefined && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border border-emerald-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      {selectedJob.match_score}%
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-900 text-xs">AI Resume Alignment Score</h4>
                      <p className="text-xs text-emerald-700">
                        Based on your skills profile, previous experience, and role qualifications.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Skills required */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Required Core Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.skills_required.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Role Overview</h4>
                <p className="leading-relaxed whitespace-pre-line text-slate-600">
                  {selectedJob.description}
                </p>
              </div>

              {/* Requirements */}
              {selectedJob.requirements && (
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Key Requirements</h4>
                  <div className="leading-relaxed whitespace-pre-line text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {selectedJob.requirements}
                  </div>
                </div>
              )}

              {/* Benefits */}
              {selectedJob.benefits && (
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Perks & Compensation Benefits</h4>
                  <div className="leading-relaxed whitespace-pre-line text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {selectedJob.benefits}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <button
                type="button"
                onClick={(e) => handleToggleSave(e, selectedJob.id)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                {selectedJob.is_saved ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 text-indigo-600" />
                    <span>Saved to Bookmarks</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    <span>Save Role</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedJob(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Close
                </button>
                {selectedJob.has_applied ? (
                  <button
                    disabled
                    className="px-5 py-2.5 bg-emerald-600 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 opacity-90"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Application Submitted
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenApply(selectedJob)}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    Apply for this Role
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Easy Apply Modal */}
      {applyModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Submit Application</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedJob.title} at {selectedJob.company?.name}
                </p>
              </div>
              <button
                onClick={() => setApplyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {applicationSuccess ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Application Submitted Successfully!</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Your profile and match score have been forwarded to the hiring team at {selectedJob.company?.name}. Track progress in My Applications.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="p-6 space-y-4">
                
                {/* Candidate Summary Snapshot */}
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs space-y-1">
                  <div className="font-bold text-indigo-900 flex items-center justify-between">
                    <span>Applicant Profile: {user?.full_name}</span>
                    <span className="text-[10px] bg-indigo-200/60 text-indigo-800 px-2 py-0.5 rounded-full font-semibold">
                      Auto-Attached
                    </span>
                  </div>
                  <p className="text-indigo-700">{user?.headline || 'Candidate'}</p>
                  <p className="text-indigo-600/80 text-[11px]">Email: {user?.email}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cover Note / Message to Hiring Manager
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                    placeholder="Describe why you are a great match for this role..."
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setApplyModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingApp}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmittingApp ? 'Submitting...' : 'Confirm & Apply'}</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

