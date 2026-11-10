import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Globe, Users, Briefcase, ExternalLink, Search, CheckCircle2 } from 'lucide-react';
import { Company } from '../types';
import { api } from '../api';

interface CompanyDirectoryProps {
  onSelectJob: (jobId: number) => void;
}

export const CompanyDirectory: React.FC<CompanyDirectoryProps> = ({ onSelectJob }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, [search, selectedIndustry]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const data = await api.getCompanies({
        search: search || undefined,
        industry: selectedIndustry || undefined,
      });
      setCompanies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCompany = async (slug: string) => {
    try {
      const full = await api.getCompany(slug);
      setSelectedCompany(full);
    } catch (err) {
      console.error(err);
    }
  };

  const industries = [
    "Cloud & AI Infrastructure",
    "Artificial Intelligence",
    "Fintech & Payments",
    "Healthtech"
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            Verified Tech Employers
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Explore Hiring Engineering Teams
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse forward-thinking engineering organizations with transparent salaries and active hiring pipelines.
          </p>
        </div>

        {/* Filter bar */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search companies by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-800 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="">All Tech Sectors</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-16">
          <div className="inline-block w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-3 text-xs text-slate-500">Loading verified employers...</p>
        </div>
      )}

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {companies.map((company) => (
          <div
            key={company.id}
            onClick={() => handleOpenCompany(company.slug)}
            className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 p-5 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center gap-3">
                <img
                  src={company.logo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${company.slug}`}
                  alt={company.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-2xs group-hover:scale-105 transition-transform"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                    {company.name}
                  </h3>
                  <span className="text-[11px] text-indigo-600 font-semibold">{company.industry}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed">
                {company.description || 'Pioneering modern digital infrastructure and developer systems.'}
              </p>

              <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{company.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{company.company_size} Employees</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">Explore Open Roles</span>
              <span className="text-indigo-600 font-bold group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Company Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={selectedCompany.logo_url}
                  alt={selectedCompany.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                />
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedCompany.name}</h2>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 font-medium">
                    <span className="text-indigo-600 font-semibold">{selectedCompany.industry}</span>
                    <span>•</span>
                    <span>{selectedCompany.location}</span>
                    <span>•</span>
                    <span>{selectedCompany.company_size} Team</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedCompany(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2">About {selectedCompany.name}</h4>
                <p className="leading-relaxed text-slate-600">
                  {selectedCompany.description}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Current Open Positions ({selectedCompany.jobs?.length || 0})
                </h4>

                <div className="space-y-3">
                  {selectedCompany.jobs?.map((job: any) => (
                    <div
                      key={job.id}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs">{job.title}</h5>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {job.location} • {job.workplace_type} • {job.job_type}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCompany(null);
                          onSelectJob(job.id);
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] rounded-lg cursor-pointer"
                      >
                        View & Apply
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedCompany(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl text-xs"
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
