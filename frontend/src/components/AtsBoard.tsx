import React, { useState, useEffect } from 'react';
import { 
  Sparkles, User, Calendar, MessageSquare, ChevronRight, CheckCircle2, 
  X, Briefcase, FileText, Check, AlertCircle, ArrowRightLeft, Clock, ExternalLink 
} from 'lucide-react';
import { Application, Job, ApplicationStatus } from '../types';
import { api } from '../api';

interface AtsBoardProps {
  initialJobId?: number | null;
}

const STAGES: { key: ApplicationStatus; label: string; color: string; badge: string }[] = [
  { key: 'applied', label: 'Applied', color: 'border-slate-300 bg-slate-50', badge: 'bg-slate-200 text-slate-800' },
  { key: 'under_review', label: 'Under Review', color: 'border-blue-300 bg-blue-50/40', badge: 'bg-blue-100 text-blue-800' },
  { key: 'shortlisted', label: 'Shortlisted', color: 'border-indigo-300 bg-indigo-50/40', badge: 'bg-indigo-100 text-indigo-800' },
  { key: 'interview_scheduled', label: 'Interview Scheduled', color: 'border-amber-300 bg-amber-50/40', badge: 'bg-amber-100 text-amber-800' },
  { key: 'offered', label: 'Offer Extended', color: 'border-emerald-300 bg-emerald-50/40', badge: 'bg-emerald-100 text-emerald-800' },
  { key: 'rejected', label: 'Rejected', color: 'border-rose-200 bg-rose-50/30', badge: 'bg-rose-100 text-rose-800' },
];

export const AtsBoard: React.FC<AtsBoardProps> = ({ initialJobId }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(initialJobId || null);
  const [pipeline, setPipeline] = useState<Record<string, Application[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  
  // Note & interview update inside modal
  const [modalNotes, setModalNotes] = useState('');
  const [modalInterviewDate, setModalInterviewDate] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      fetchPipeline(selectedJobId);
    }
  }, [selectedJobId]);

  const fetchJobs = async () => {
    try {
      const data = await api.getEmployerJobs();
      setJobs(data);
      if (data.length > 0 && !selectedJobId) {
        setSelectedJobId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPipeline = async (jobId: number) => {
    setLoading(true);
    try {
      const res = await api.getAtsPipeline(jobId);
      setPipeline(res.stages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (appId: number, newStage: string) => {
    try {
      await api.updateApplicationStatus(appId, { status: newStage });
      if (selectedJobId) fetchPipeline(selectedJobId);
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp({ ...selectedApp, status: newStage as ApplicationStatus });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update stage');
    }
  };

  const handleOpenDetailModal = (app: Application) => {
    setSelectedApp(app);
    setModalNotes(app.notes || '');
    setModalInterviewDate(app.interview_date ? app.interview_date.substring(0, 16) : '');
  };

  const handleSaveAppDetails = async () => {
    if (!selectedApp) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await api.updateApplicationStatus(selectedApp.id, {
        status: selectedApp.status,
        notes: modalNotes,
        interview_date: modalInterviewDate ? new Date(modalInterviewDate).toISOString() : undefined,
      });
      setSelectedApp(updated);
      if (selectedJobId) fetchPipeline(selectedJobId);
      alert('Candidate record updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to update record');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Helper to parse snapshot
  const getResumeSnapshot = (app: Application) => {
    if (!app.resume_snapshot) return null;
    try {
      return JSON.parse(app.resume_snapshot);
    } catch {
      return null;
    }
  };

  const getMatchBreakdown = (app: Application) => {
    if (!app.match_reasons) return null;
    try {
      return JSON.parse(app.match_reasons);
    } catch {
      return null;
    }
  };

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header & Role Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Applicant Tracking System (ATS) Pipeline
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Kanban Candidate Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Drag, evaluate, and transition talent through each recruiting stage with AI match insights.
          </p>
        </div>

        {/* Job selector dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Filter Role:</label>
          <select
            value={selectedJobId || ''}
            onChange={(e) => setSelectedJobId(Number(e.target.value))}
            className="px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} ({j.department})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board Container */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <div className="inline-block w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-3 text-xs text-slate-500 font-medium">Loading ATS stages and candidate evaluations...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-6">
          {STAGES.map((stage) => {
            const apps = pipeline[stage.key] || [];

            return (
              <div
                key={stage.key}
                className={`rounded-2xl border ${stage.color} p-3.5 flex flex-col min-w-[240px] max-h-[75vh]`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 mb-3">
                  <span className="font-bold text-xs text-slate-800 tracking-tight">
                    {stage.label}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${stage.badge}`}>
                    {apps.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                  {apps.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-slate-400 font-medium border border-dashed border-slate-200/60 rounded-xl">
                      No candidates in this stage
                    </div>
                  ) : (
                    apps.map((app) => (
                      <div
                        key={app.id}
                        onClick={() => handleOpenDetailModal(app)}
                        className="bg-white rounded-xl border border-slate-200 hover:border-indigo-400 p-3.5 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-2.5 group relative"
                      >
                        {/* Candidate Top */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <img
                              src={app.applicant?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${app.applicant?.full_name || 'applicant'}`}
                              alt={app.applicant?.full_name}
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                            />
                            <div>
                              <h4 className="font-bold text-slate-900 text-xs group-hover:text-indigo-600 transition-colors">
                                {app.applicant?.full_name}
                              </h4>
                              <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                                {app.applicant?.headline || 'Candidate'}
                              </p>
                            </div>
                          </div>

                          {/* Match score badge */}
                          <div 
                            className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                              app.match_score >= 80 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : app.match_score >= 60 
                                ? 'bg-amber-100 text-amber-800' 
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {app.match_score}%
                          </div>
                        </div>

                        {/* Interview Date Preview if set */}
                        {app.interview_date && (
                          <div className="p-1.5 bg-amber-50 rounded-lg text-[10px] text-amber-900 font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="truncate">{new Date(app.interview_date).toLocaleDateString()}</span>
                          </div>
                        )}

                        {/* Stage Transition Selector right on card */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <select
                            value={app.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleStageChange(app.id, e.target.value)}
                            className="text-[10px] font-semibold bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-600 focus:outline-none cursor-pointer"
                          >
                            {STAGES.map((s) => (
                              <option key={s.key} value={s.key}>Move: {s.label}</option>
                            ))}
                          </select>

                          <span className="text-[10px] text-indigo-600 font-bold group-hover:translate-x-0.5 transition-transform">
                            Inspect →
                          </span>
                        </div>

                      </div>
                    ))
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Candidate Full Evaluation Drawer / Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <img
                  src={selectedApp.applicant?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedApp.applicant?.full_name}`}
                  alt={selectedApp.applicant?.full_name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{selectedApp.applicant?.full_name}</h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                      Applied for: {selectedApp.job?.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    {selectedApp.applicant?.headline} • {selectedApp.applicant?.location || 'Remote'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Contact: {selectedApp.applicant?.email}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Evaluation Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              
              {/* AI Match Verdict Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-xs">
                    {selectedApp.match_score}%
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      AI Scoring Verdict: {getMatchBreakdown(selectedApp)?.verdict || 'Evaluated'}
                    </h4>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      {getMatchBreakdown(selectedApp)?.recommendation || 'Meets key technical qualifications.'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-[11px]">
                  <span className="text-emerald-900 font-semibold">
                    Matched: <span className="font-bold">{getMatchBreakdown(selectedApp)?.matched_skills?.join(', ') || 'Skills'}</span>
                  </span>
                  {getMatchBreakdown(selectedApp)?.missing_skills?.length > 0 && (
                    <span className="text-amber-800 font-medium">
                      Missing: {getMatchBreakdown(selectedApp)?.missing_skills?.join(', ')}
                    </span>
                  )}
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                  Candidate Note / Cover Letter
                </h4>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl whitespace-pre-line text-slate-700 font-mono">
                  {selectedApp.cover_letter || 'No cover note attached.'}
                </div>
              </div>

              {/* Candidate Resume Snapshot */}
              {getResumeSnapshot(selectedApp) && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    Resume Profile Snapshot
                  </h4>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div>
                      <span className="font-bold text-slate-800 block mb-1">Executive Summary:</span>
                      <p className="text-slate-600 leading-relaxed">
                        {getResumeSnapshot(selectedApp)?.summary || 'Experienced software professional.'}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-800 block mb-1">Skills:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {getResumeSnapshot(selectedApp)?.skills?.map((sk: string) => (
                          <span key={sk} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-semibold text-[11px]">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Hiring Manager Notes & Interview Schedule Section */}
              <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/80 space-y-4">
                <h4 className="font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  Recruiter Notes & Interview Scheduling
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-amber-900 mb-1">Schedule Interview Date & Time</label>
                    <input
                      type="datetime-local"
                      value={modalInterviewDate}
                      onChange={(e) => setModalInterviewDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-amber-900 mb-1">Current ATS Stage</label>
                    <select
                      value={selectedApp.status}
                      onChange={(e) => setSelectedApp({ ...selectedApp, status: e.target.value as ApplicationStatus })}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-slate-800 font-semibold focus:outline-none"
                    >
                      {STAGES.map((s) => (
                        <option key={s.key} value={s.key}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-amber-900 mb-1">Internal Hiring Team Feedback / Notes</label>
                  <textarea
                    rows={3}
                    value={modalNotes}
                    onChange={(e) => setModalNotes(e.target.value)}
                    placeholder="e.g. Completed initial screen. Strong answers on asynchronous Python and React state architecture. Proceeding to coding session..."
                    className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleSaveAppDetails}
                disabled={isUpdatingStatus}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
              >
                {isUpdatingStatus ? 'Saving...' : 'Save Evaluation & Schedule'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

