export type UserRole = 'job_seeker' | 'employer' | 'admin';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  headline?: string;
  location?: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface Company {
  id: number;
  name: string;
  slug: string;
  logo_url?: string;
  website?: string;
  industry: string;
  company_size: string;
  location: string;
  description?: string;
  owner_id: number;
  created_at: string;
  active_jobs_count?: number;
  jobs?: JobSummary[];
}

export interface JobSummary {
  id: number;
  title: string;
  location: string;
  workplace_type: string;
  job_type: string;
  experience_level: string;
  min_salary?: number;
  max_salary?: number;
  salary_currency: string;
  created_at: string;
}

export interface Job {
  id: number;
  title: string;
  company_id: number;
  posted_by_id: number;
  department: string;
  location: string;
  workplace_type: string; // Remote, Hybrid, On-site
  job_type: string; // Full-time, Part-time, Contract, Internship
  experience_level: string; // Entry, Mid, Senior, Lead, Executive
  min_salary?: number;
  max_salary?: number;
  salary_currency: string;
  description: string;
  requirements?: string;
  benefits?: string;
  skills_required: string[];
  status: 'active' | 'closed' | 'draft';
  views_count: number;
  created_at: string;
  updated_at: string;
  company?: Company;
  is_saved?: boolean;
  has_applied?: boolean;
  match_score?: number | null;
}

export interface ExperienceItem {
  title: string;
  company: string;
  duration: string;
  description: string;
}

export interface EducationItem {
  degree: string;
  school: string;
  year: string;
}

export interface ProjectItem {
  name: string;
  description: string;
  link?: string;
}

export interface ResumeProfile {
  id?: number;
  user_id?: number;
  title?: string;
  summary?: string;
  skills: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  certifications: string[];
  website_url?: string;
  github_url?: string;
  linkedin_url?: string;
  updated_at?: string;
}

export type ApplicationStatus = 
  | 'applied' 
  | 'under_review' 
  | 'shortlisted' 
  | 'interview_scheduled' 
  | 'offered' 
  | 'rejected' 
  | 'withdrawn';

export interface Application {
  id: number;
  job_id: number;
  applicant_id: number;
  status: ApplicationStatus;
  cover_letter?: string;
  resume_snapshot?: string;
  match_score: number;
  match_reasons?: string;
  notes?: string;
  interview_date?: string;
  created_at: string;
  updated_at: string;
  applicant?: User;
  job?: Job;
}

export interface SavedJob {
  id: number;
  user_id: number;
  job_id: number;
  created_at: string;
  job?: Job;
}

export interface AnalyticsOverview {
  total_jobs: number;
  active_jobs: number;
  total_companies: number;
  total_candidates: number;
  total_applications: number;
  applications_by_status: Record<string, number>;
  top_departments: Record<string, number>;
  top_skills: Array<{ skill: string; count: number }>;
}

