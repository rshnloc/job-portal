import React, { useState, useEffect } from 'react';
import { 
  Plus, Briefcase, Users, Eye, Sparkles, Building2, CheckCircle2, 
  Trash2, Edit, X, ExternalLink, Calendar, MapPin, DollarSign, Layers 
} from 'lucide-react';
import { Job, Company } from '../types';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

interface EmployerDashboardProps {
  onOpenAts: (jobId: number) => void;
}

export const EmployerDashboard: React.FC<EmployerDashboardProps> = ({ onOpenAts }) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Post Job Modal State
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('Remote');
  const [workplaceType, setWorkplaceType] = useState('Remote');
  const [jobType, setJobType] = useState('Full-time');
  const [experienceLevel, setExperienceLevel] = useState('Senior');
  const [minSalary, setMinSalary] = useState<number | ''>(140000);
  const [maxSalary, setMaxSalary] = useState<number | ''>(185000);
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [benefits, setBenefits] = useState('');
  const [skillTags, setSkillTags] = useState<string[]>(['React', 'TypeScript', 'Python', 'FastAPI']);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEmployerData();
  }, []);

  const fetchEmployerData = async () => {
    setLoading(true);
    try {
      const [jobsData, companiesData] = await Promise.all([
        api.getEmployerJobs(),
        api.getCompanies()
      ]);
      setJobs(jobsData);
      setCompanies(companiesData);
      if (companiesData.length > 0) {
        setSelectedCompanyId(companiesData[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    const trimmed = newSkillInput.trim();
    if (trimmed && !skillTags.includes(trimmed)) {
      setSkillTags([...skillTags, trimmed]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkillTags(skillTags.filter((s) => s !== skill));
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId) {
      alert('Please select or create a company profile first');
      return;
    }
    setSubmitting(true);
    try {
      await api.createJob({
        company_id: Number(selectedCompanyId),
        title,
        department,
        location,
        workplace_type: workplaceType,
        job_type: jobType,
        experience_level: experienceLevel,
        min_salary: minSalary ? Number(minSalary) : undefined,
        max_salary: maxSalary ? Number(maxSalary) : undefined,
        description,
        requirements,
        benefits,
        skills_required: skillTags,
      });
      setPostModalOpen(false);
      fetchEmployerData();
    } catch (err: any) {
      alert(err.message || 'Failed to post job');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await api.deleteJob(jobId);
      fetchEmployerData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete job');
    }
  };

  const handleToggleStatus = async (job: Job) => {
    const newStatus = job.status === 'active' ? 'closed' : 'active';
    try {
      await api.updateJob(job.id, { status: newStatus });
      fetchEmployerData();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner & Quick Metrics */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
              <Building2 className="w-3.5 h-3.5" />
              Employer Hiring Console
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Talent Acquisition & Job Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Logged in as <span className="font-semibold text-slate-800">{user?.full_name}</span> ({user?.headline})
            </p>
          </div>

          <button
            type="button"
            onClick={() => setPostModalOpen(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Job Posting</span>
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Active Job Postings
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {jobs.filter((j) => j.status === 'active').length}
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Job Views
            </span>
            <span className="text-2xl font-black text-indigo-600 mt-1 block">
              {jobs.reduce((acc, j) => acc + (j.views_count || 0), 0)}
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Managed Companies
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {companies.length}
            </span>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
              AI Matching Engine
            </span>
            <span className="text-sm font-bold text-emerald-900 mt-2 block flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Active & Scoring
            </span>
          </div>
        </div>
      </div>

      {/* Posted Jobs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            Your Posted Roles ({jobs.length})
          </h2>
          <span className="text-xs text-slate-400">Click 'Open ATS' to review candidate pipeline</span>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-2 text-xs text-slate-500">Loading your jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No jobs posted yet</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Get started by creating your first high-visibility tech role posting.
            </p>
            <button
              onClick={() => setPostModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
            >
              Post a Role
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">Job Title</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Workplace & Type</th>
                  <th className="px-6 py-3.5">Views</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{job.title}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{job.company?.name} • {job.location}</div>
                    </td>
                    <td className="px-6 py-4">{job.department}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-semibold text-[11px]">
                        {job.workplace_type}
                      </span>
                      <span className="block text-slate-400 text-[11px] mt-0.5">{job.job_type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.views_count}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(job)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer ${
                          job.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {job.status === 'active' ? 'Active' : 'Closed'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenAts(job.id)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                          title="Open Applicant Tracking System Kanban board"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>ATS Pipeline</span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Job"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Post a Job Modal */}
      {postModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Post a New Position</h3>
                  <p className="text-xs text-slate-500">Reach top technical candidates with AI fit analysis</p>
                </div>
              </div>
              <button
                onClick={() => setPostModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="p-6 overflow-y-auto space-y-4 text-xs">
              
              {/* Company Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Company Profile</label>
                <select
                  required
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-medium"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.location})</option>
                  ))}
                </select>
              </div>

              {/* Title & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Backend Engineer"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Engineering / Product / DevOps"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Location & Workplace type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Remote / San Francisco, CA"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Workplace Style</label>
                  <select
                    value={workplaceType}
                    onChange={(e) => setWorkplaceType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                  >
                    <option value="Remote">100% Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Experience Level</label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                  >
                    <option value="Entry">Entry Level</option>
                    <option value="Mid">Mid Level</option>
                    <option value="Senior">Senior Level</option>
                    <option value="Lead">Lead / Architect</option>
                  </select>
                </div>
              </div>

              {/* Salary Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Salary (USD/yr)</label>
                  <input
                    type="number"
                    value={minSalary}
                    onChange={(e) => setMinSalary(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Salary (USD/yr)</label>
                  <input
                    type="number"
                    value={maxSalary}
                    onChange={(e) => setMaxSalary(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              {/* Skills Tags */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Required Skills & Technologies</label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder="Type skill & press Enter (e.g. Docker, Python)..."
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-2 bg-slate-800 text-white rounded-xl font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {skillTags.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-[11px]"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s)}
                        className="text-indigo-400 hover:text-rose-600 cursor-pointer ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role Description</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline responsibilities, team structure, and impact..."
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none font-sans"
                />
              </div>

              {/* Requirements & Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Qualifications / Requirements</label>
                  <textarea
                    rows={3}
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="• 4+ years React\n• Strong Python skills..."
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none font-sans"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Perks & Benefits</label>
                  <textarea
                    rows={3}
                    value={benefits}
                    onChange={(e) => setBenefits(e.target.value)}
                    placeholder="• Health & dental\n• Flexible remote schedule..."
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none font-sans"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPostModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Publishing...' : 'Publish Role'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

