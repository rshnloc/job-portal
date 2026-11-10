import React from 'react';
import { Search, MapPin, Sparkles, SlidersHorizontal, Briefcase } from 'lucide-react';

interface HeroSearchProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  locationQuery: string;
  setLocationQuery: (loc: string) => void;
  workplaceType: string;
  setWorkplaceType: (type: string) => void;
  onSearch: () => void;
  selectedTag: string | null;
  onSelectTag: (tag: string) => void;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  searchQuery,
  setSearchQuery,
  locationQuery,
  setLocationQuery,
  workplaceType,
  setWorkplaceType,
  onSearch,
  selectedTag,
  onSelectTag
}) => {
  const popularTags = ["Python", "React", "FastAPI", "TypeScript", "PostgreSQL", "Docker", "Kubernetes", "AWS"];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="relative bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-950 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-indigo-500/15 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[200px] bg-violet-600/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="relative max-w-5xl mx-auto text-center space-y-6">
        
        {/* Highlight badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Real-time Semantic & Skills Match Scoring</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
          Discover Tech Roles with <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-teal-300">
            Intelligent AI Fit Analysis
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed">
          Search verified software engineering and tech leadership positions. Instant resume alignment, ATS pipeline status tracking, and salary transparency.
        </p>

        {/* Search Bar Container */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-2 sm:p-2.5 rounded-2xl shadow-2xl max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 text-slate-900">
            
            {/* Keyword Input */}
            <div className="md:col-span-5 flex items-center bg-white rounded-xl px-3 py-2.5 border border-slate-100 shadow-xs">
              <Search className="w-4 h-4 text-indigo-600 shrink-0 mr-2.5" />
              <input
                type="text"
                placeholder="Job title, skill (e.g. FastAPI, React)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full text-xs sm:text-sm font-medium focus:outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Location Input */}
            <div className="md:col-span-4 flex items-center bg-white rounded-xl px-3 py-2.5 border border-slate-100 shadow-xs">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0 mr-2.5" />
              <input
                type="text"
                placeholder="Location or 'Remote'..."
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full text-xs sm:text-sm font-medium focus:outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Workplace Toggle / Search Button */}
            <div className="md:col-span-3 flex items-center gap-2">
              <select
                value={workplaceType}
                onChange={(e) => setWorkplaceType(e.target.value)}
                className="bg-white px-2 py-2.5 rounded-xl border border-slate-100 text-xs font-semibold text-slate-700 focus:outline-none h-full shadow-xs cursor-pointer"
              >
                <option value="">Any Workstyle</option>
                <option value="Remote">100% Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>

              <button
                type="button"
                onClick={onSearch}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer h-full"
              >
                <span>Search</span>
              </button>
            </div>

          </div>
        </div>

        {/* Popular Tags Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
          <span className="text-slate-400 font-medium">Trending Skills:</span>
          {popularTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onSelectTag(tag)}
              className={`px-2.5 py-1 rounded-full border transition-all cursor-pointer font-medium ${
                selectedTag === tag 
                  ? 'bg-indigo-500 text-white border-indigo-400 shadow-xs' 
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/15 hover:text-white'
              }`}
            >
              #{tag}
            </button>
          ))}
          {selectedTag && (
            <button
              onClick={() => onSelectTag('')}
              className="text-xs text-rose-300 hover:text-rose-200 underline cursor-pointer"
            >
              Clear tag
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

