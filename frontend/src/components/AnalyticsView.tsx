import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Users, Building2, Briefcase, 
  Sparkles, Layers, CheckCircle2, PieChart 
} from 'lucide-react';
import { AnalyticsOverview } from '../types';
import { api } from '../api';

export const AnalyticsView: React.FC = () => {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getAnalyticsOverview();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="inline-block w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-xs text-slate-500 font-medium">Aggregating platform intelligence...</p>
      </div>
    );
  }

  const maxSkillCount = data.top_skills.length > 0 ? Math.max(...data.top_skills.map((s) => s.count)) : 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-semibold backdrop-blur-md mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Live Platform Intelligence & Labor Market Trends
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          Job Market & Hiring Analytics
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
          Real-time metrics on tech talent supply, compensation trends, and high-demand engineering skill sets.
        </p>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
              Active Job Openings
            </span>
            <span className="text-3xl font-black text-white mt-1 block">
              {data.active_jobs}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
              Hiring Companies
            </span>
            <span className="text-3xl font-black text-white mt-1 block">
              {data.total_companies}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
              Registered Candidates
            </span>
            <span className="text-3xl font-black text-white mt-1 block">
              {data.total_candidates}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
              Processed Applications
            </span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">
              {data.total_applications}
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Most Demanded Technical Skills */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              Most In-Demand Skills in Active Roles
            </h2>
            <span className="text-xs text-slate-400 font-semibold">Frequency in Requirements</span>
          </div>

          <div className="space-y-3 pt-2">
            {data.top_skills.map((item) => {
              const percentage = Math.round((item.count / maxSkillCount) * 100);
              return (
                <div key={item.skill} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{item.skill}</span>
                    <span className="text-slate-500 font-bold">{item.count} roles ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-violet-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ATS Pipeline Funnel Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Application Pipeline Stage Funnel
            </h2>
            <span className="text-xs text-slate-400 font-semibold">Overall Platform</span>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(data.applications_by_status).map(([stage, count]) => {
              const total = data.total_applications || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={stage} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    <span className="text-xs font-bold text-slate-800 capitalize">
                      {stage.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900">{count}</span>
                    <span className="text-[11px] text-slate-400 ml-1.5 font-medium">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Department Breakdown */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Job Distribution by Department
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(data.top_departments).map(([dept, count]) => (
                <span
                  key={dept}
                  className="px-3 py-1 bg-indigo-50 text-indigo-800 text-xs font-semibold rounded-lg border border-indigo-200/60"
                >
                  {dept}: <span className="font-bold">{count}</span>
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

