import React, { useState, useEffect } from 'react';
import { 
  FileText, Sparkles, Plus, Trash2, CheckCircle2, Download, 
  ExternalLink, Briefcase, GraduationCap, Code2, Link as LinkIcon, AlertCircle 
} from 'lucide-react';
import { ResumeProfile, ExperienceItem, EducationItem, ProjectItem } from '../types';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export const ResumeBuilder: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ResumeProfile>({
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  
  // Skill input
  const [newSkillInput, setNewSkillInput] = useState('');

  // AI Resume Text Parser modal/drawer state
  const [showAiParser, setShowAiParser] = useState(false);
  const [rawResumeText, setRawResumeText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<{ detected_title: string | null; extracted_skills: string[] } | null>(null);

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    setLoading(true);
    try {
      const data = await api.getMyResume();
      setProfile(data);
    } catch (err) {
      console.error('Failed to load resume profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.updateMyResume(profile);
      setProfile(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  // Skill management
  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (!profile.skills.includes(trimmed)) {
      setProfile({ ...profile, skills: [...profile.skills, trimmed] });
    }
    setNewSkillInput('');
  };

  const removeSkill = (skillToRemove: string) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((s) => s !== skillToRemove)
    });
  };

  // Experience management
  const addExperience = () => {
    const newExp: ExperienceItem = {
      title: 'Software Engineer',
      company: 'Tech Company',
      duration: '2023 - Present',
      description: 'Developed scalable microservices and APIs with modern cloud patterns.'
    };
    setProfile({ ...profile, experience: [newExp, ...profile.experience] });
  };

  const updateExperience = (index: number, field: keyof ExperienceItem, value: string) => {
    const updated = [...profile.experience];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, experience: updated });
  };

  const removeExperience = (index: number) => {
    setProfile({
      ...profile,
      experience: profile.experience.filter((_, i) => i !== index)
    });
  };

  // Education management
  const addEducation = () => {
    const newEdu: EducationItem = {
      degree: 'B.S. in Computer Science',
      school: 'University of Technology',
      year: '2020'
    };
    setProfile({ ...profile, education: [...profile.education, newEdu] });
  };

  const updateEducation = (index: number, field: keyof EducationItem, value: string) => {
    const updated = [...profile.education];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, education: updated });
  };

  const removeEducation = (index: number) => {
    setProfile({
      ...profile,
      education: profile.education.filter((_, i) => i !== index)
    });
  };

  // AI Parser handler
  const handleParseText = async () => {
    if (!rawResumeText.trim()) return;
    setIsParsing(true);
    try {
      const res = await api.parseResumeText(rawResumeText);
      setParseResult(res);
      // Auto-merge newly detected skills
      const mergedSkills = Array.from(new Set([...profile.skills, ...res.extracted_skills]));
      setProfile({
        ...profile,
        title: profile.title || res.detected_title || profile.title,
        skills: mergedSkills
      });
    } catch (err: any) {
      alert(err.message || 'Parsing failed');
    } finally {
      setIsParsing(false);
    }
  };

  // Download JSON
  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${user?.full_name?.toLowerCase().replace(/\s+/g, '_')}_resume.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="inline-block w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-xs text-slate-500 font-medium">Loading AI Resume Profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-md mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            AI Resume Profile & Smart Matching
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Curate Your Career Profile
          </h1>
          <p className="text-indigo-100 text-xs sm:text-sm mt-1 max-w-xl">
            Keep your skills and experience up to date to get matched with high-salary roles aligned with your superpowers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowAiParser(!showAiParser)}
            className="px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Resume Scanner</span>
          </button>
          
          <button
            type="button"
            onClick={handleDownloadJson}
            className="px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {saving ? 'Syncing...' : savedSuccess ? '✓ Synced!' : 'Save & Sync'}
          </button>
        </div>
      </div>

      {/* AI Resume Scanner Section */}
      {showAiParser && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 shadow-sm space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Smart Resume Text Extractor</span>
            </div>
            <button
              onClick={() => setShowAiParser(false)}
              className="text-xs font-semibold text-amber-800 hover:text-amber-950 underline"
            >
              Close
            </button>
          </div>
          <p className="text-xs text-amber-800">
            Paste your raw resume text or LinkedIn summary below. Our AI extraction engine will automatically identify relevant technical competencies, role titles, and populate your profile!
          </p>
          <textarea
            rows={5}
            value={rawResumeText}
            onChange={(e) => setRawResumeText(e.target.value)}
            placeholder="Paste your resume content here (e.g. 'Senior Software Engineer with experience in Python, FastAPI, React, Docker, Kubernetes, AWS...')"
            className="w-full p-3 bg-white border border-amber-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
          <div className="flex items-center justify-between">
            {parseResult && (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Extracted {parseResult.extracted_skills.length} skills & synced with profile!
              </span>
            )}
            <button
              type="button"
              onClick={handleParseText}
              disabled={isParsing || !rawResumeText.trim()}
              className="ml-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isParsing ? 'Extracting...' : 'Extract Skills Now'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            Headline & Professional Summary
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Title / Headline</label>
              <input
                type="text"
                value={profile.title || ''}
                onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                placeholder="e.g. Senior Full-Stack Engineer"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Portfolio / Personal Website</label>
              <input
                type="text"
                value={profile.website_url || ''}
                onChange={(e) => setProfile({ ...profile, website_url: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Executive Summary</label>
            <textarea
              rows={4}
              value={profile.summary || ''}
              onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
              placeholder="Highlight your key achievements, preferred technical stack, and architecture strengths..."
              className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Technical Skills Manager */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-600" />
              Verified Core Competencies ({profile.skills.length})
            </h2>
            <span className="text-xs text-slate-400">Used by AI Match Engine</span>
          </div>

          {/* Add skill input */}
          <div className="flex items-center gap-2 max-w-md">
            <input
              type="text"
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill(newSkillInput);
                }
              }}
              placeholder="Type a skill and hit enter (e.g. GraphQL, AWS)..."
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => addSkill(newSkillInput)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Add
            </button>
          </div>

          {/* Skills Badges */}
          <div className="flex flex-wrap gap-2 pt-1">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-indigo-400 hover:text-rose-600 ml-0.5 cursor-pointer"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Work Experience */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              Work History
            </h2>
            <button
              type="button"
              onClick={addExperience}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Position</span>
            </button>
          </div>

          <div className="space-y-4">
            {profile.experience.map((exp, idx) => (
              <div key={idx} className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Position #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeExperience(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Role Title</label>
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => updateExperience(idx, 'title', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Dates / Duration</label>
                    <input
                      type="text"
                      value={exp.duration}
                      onChange={(e) => updateExperience(idx, 'duration', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Key Responsibilities & Achievements</label>
                  <textarea
                    rows={2}
                    value={exp.description}
                    onChange={(e) => updateExperience(idx, 'description', e.target.value)}
                    className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              Education & Degrees
            </h2>
            <button
              type="button"
              onClick={addEducation}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Degree</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.education.map((edu, idx) => (
              <div key={idx} className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl relative">
                <button
                  type="button"
                  onClick={() => removeEducation(idx)}
                  className="absolute top-2 right-2 text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                    placeholder="Degree"
                    className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-md font-semibold text-slate-800"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={edu.school}
                      onChange={(e) => updateEducation(idx, 'school', e.target.value)}
                      placeholder="University"
                      className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-md text-slate-600"
                    />
                    <input
                      type="text"
                      value={edu.year}
                      onChange={(e) => updateEducation(idx, 'year', e.target.value)}
                      placeholder="Graduation Year"
                      className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-md text-slate-600"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Save Trigger */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{saving ? 'Syncing...' : 'Save Profile Changes'}</span>
          </button>
        </div>

      </div>

    </div>
  );
};

