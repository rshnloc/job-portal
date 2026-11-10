import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Clock, Calendar, Sparkles, Building2, MapPin, 
  Trash2, Bookmark, ChevronRight, AlertCircle, FileText, X 
} from 'lucide-react';
import { Application, SavedJob } from '../types';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export const MyApplications: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'applications' | 'saved'>('applications');
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'applications') {
        const data = await api.getMyApplications();
        setApplications(data);
      } else {
        const data = await api.getSavedJobs();
        setSavedJobs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (applicationId: number) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;
    try {
      await api.withdrawApplication(applicationId);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to withdraw application');
    }
  };

  const stages = [
    { key: 'applied', label: 'Applied' },
    { key: 'under_review', label: 'Under Review' },
    { key: 'shortlisted', label: 'Shortlisted' },
    { key: 'interview_scheduled', label: 'Interview' },
    { key: 'offered', label: 'Offer' },
  ];

  const getStageIndex = (status: string) => {
    const idx = stages.findIndex((s) => s.key === status);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Candidate Application Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time tracking of your job submissions, ATS stages, and interview dates.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'applications' 
                ? 'bg-white text-indigo-700 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Applications ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'saved' 
                ? 'bg-white text-indigo-700 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Saved Bookmarks ({savedJobs.length})
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-16">
          <div className="inline-block w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-3 text-xs text-slate-500 font-medium">Fetching status updates...</p>
        </div>
      )}

      {/* Applications Tab */}
      {!loading && activeTab === 'applications' && (
        <>
          {applications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No applications submitted yet</h3>
              <p className="text-xs text-slate-500 mt-1">
                Explore the job listings and apply with your AI match score to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => {
                const currentStageIdx = getStageIndex(app.status);
                const isRejected = app.status === 'rejected';
                const isWithdrawn = app.status === 'withdrawn';

                return (
                  <div
                    key={app.id}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-indigo-200 transition-all space-y-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      {/* Job & Company Info */}
                      <div className="flex items-center gap-3">
                        <img
                          src={app.job?.company?.logo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${app.job?.company?.slug || 'co'}`}
                          alt={app.job?.company?.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                        />
                        <div>
                          <h3 className="text-base font-bold text-slate-900">{app.job?.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span className="font-semibold text-indigo-600">{app.job?.company?.name}</span>
                            <span>•</span>
                            <span>{app.job?.location}</span>
                            <span>•</span>
                            <span>Applied on {new Date(app.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Match Score + Details modal trigger */}
                      <div className="flex items-center gap-3">
                        <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{app.match_score}% Match Score</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedApp(app)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
                      </div>

                    </div>

                    {/* ATS Pipeline Progress Bar */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          ATS Pipeline Status
                        </span>
                        {isRejected ? (
                          <span className="text-xs font-bold text-rose-600">Application Closed</span>
                        ) : isWithdrawn ? (
                          <span className="text-xs font-bold text-slate-400">Withdrawn by Applicant</span>
                        ) : (
                          <span className="text-xs font-bold text-indigo-600 capitalize">
                            Current Stage: {app.status.replace('_', ' ')}
                          </span>
                        )}
                      </div>

                      {/* Step circles */}
                      {!isRejected && !isWithdrawn ? (
                        <div className="grid grid-cols-5 gap-2 pt-2">
                          {stages.map((st, i) => {
                            const isCompleted = i <= currentStageIdx;
                            const isCurrent = i === currentStageIdx;
                            return (
                              <div key={st.key} className="text-center">
                                <div
                                  className={`h-2 rounded-full mb-1.5 transition-colors ${
                                    isCurrent 
                                      ? 'bg-indigo-600' 
                                      : isCompleted 
                                      ? 'bg-indigo-400' 
                                      : 'bg-slate-200'
                                  }`}
                                />
                                <span
                                  className={`text-[10px] font-semibold block truncate ${
                                    isCurrent 
                                      ? 'text-indigo-700 font-bold' 
                                      : isCompleted 
                                      ? 'text-slate-700' 
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {st.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="py-2 text-xs text-slate-500 italic">
                          This submission is no longer actively progressing in the pipeline.
                        </div>
                      )}
                    </div>

                    {/* Interview Notification Banner if scheduled */}
                    {app.interview_date && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-amber-600" />
                          <span className="font-semibold">
                            Interview Scheduled: {new Date(app.interview_date).toLocaleString()}
                          </span>
                        </div>
                        {app.notes && (
                          <span className="text-[11px] text-amber-700 italic">"{app.notes}"</span>
                        )}
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <span>Application Reference #{app.id}</span>
                      {!isWithdrawn && !isRejected && (
                        <button
                          type="button"
                          onClick={() => handleWithdraw(app.id)}
                          className="text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
                        >
                          Withdraw Application
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Saved Jobs Tab */}
      {!loading && activeTab === 'saved' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedJobs.length === 0 ? (
            <div className="col-span-2 bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
              <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No saved roles yet</h3>
              <p className="text-xs text-slate-500 mt-1">
                Click the bookmark icon on any job card to save it for later.
              </p>
            </div>
          ) : (
            savedJobs.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{item.job?.title}</h3>
                  <p className="text-xs text-indigo-600 font-semibold mt-0.5">{item.job?.company?.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{item.job?.location} • {item.job?.workplace_type}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Saved on {new Date(item.created_at).toLocaleDateString()}</span>
                  <span className="text-indigo-600 font-bold">Open Role Details →</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{selectedApp.job?.title}</h3>
                <p className="text-xs text-slate-500">Application Snapshot</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-700 uppercase tracking-wider mb-1">Your Cover Note</h4>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 whitespace-pre-line text-slate-700 font-mono">
                  {selectedApp.cover_letter || 'No custom note attached.'}
                </div>
              </div>

              {selectedApp.match_reasons && (
                <div>
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider mb-1">AI Match Breakdown</h4>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 space-y-2">
                    <p className="font-semibold">Match Score: {selectedApp.match_score}%</p>
                    <p className="text-[11px] leading-relaxed">
                      Evaluated against required core technical competencies, role level, and experience depth.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

