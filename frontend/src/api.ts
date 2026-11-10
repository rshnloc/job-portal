import { 
  User, Company, Job, Application, ResumeProfile, AnalyticsOverview, SavedJob 
} from './types';

const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('nexthire_token');
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'Request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      errorDetail = response.statusText || errorDetail;
    }
    throw new ApiError(response.status, errorDetail);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Auth
  login: (data: { email: string; password: string }) =>
    request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  register: (data: { email: string; password: string; full_name: string; role: string; headline?: string }) =>
    request<{ access_token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  demoLogin: (role: 'candidate' | 'employer' | 'admin') =>
    request<{ access_token: string; user: User }>(`/auth/demo-login/${role}`, {
      method: 'POST',
    }),

  getMe: () => request<User>('/auth/me'),

  updateProfile: (data: Partial<User>) =>
    request<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Jobs
  getJobs: (params?: Record<string, string | number | undefined>) => {
    const url = new URL(`${window.location.origin}/api/jobs`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return request<Job[]>(`/jobs${url.search}`);
  },

  getJobById: (id: number) => request<Job>(`/jobs/${id}`),

  createJob: (data: Partial<Job>) =>
    request<Job>('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateJob: (id: number, data: Partial<Job>) =>
    request<Job>(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteJob: (id: number) =>
    request<{ message: string }>(`/jobs/${id}`, {
      method: 'DELETE',
    }),

  getEmployerJobs: () => request<Job[]>('/jobs/my-posted-jobs'),

  getSavedJobs: () => request<SavedJob[]>('/jobs/saved'),

  toggleSaveJob: (jobId: number) =>
    request<{ status: string; is_saved: boolean; message: string }>(`/jobs/saved/${jobId}`, {
      method: 'POST',
    }),

  // Applications & ATS
  submitApplication: (data: { job_id: number; cover_letter?: string }) =>
    request<Application>('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMyApplications: () => request<Application[]>('/applications/my'),

  getJobApplications: (jobId: number, status?: string) => {
    const query = status ? `?status=${status}` : '';
    return request<Application[]>(`/applications/job/${jobId}${query}`);
  },

  getAtsPipeline: (jobId: number) =>
    request<{
      job_id: number;
      job_title: string;
      total_applicants: number;
      stages: Record<string, Application[]>;
    }>(`/applications/ats-pipeline/${jobId}`),

  updateApplicationStatus: (
    applicationId: number,
    data: { status: string; notes?: string; interview_date?: string }
  ) =>
    request<Application>(`/applications/${applicationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  withdrawApplication: (applicationId: number) =>
    request<{ message: string }>(`/applications/${applicationId}/withdraw`, {
      method: 'POST',
    }),

  // Resume Profile
  getMyResume: () => request<ResumeProfile>('/resume/me'),

  updateMyResume: (data: Partial<ResumeProfile>) =>
    request<ResumeProfile>('/resume/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  parseResumeText: (text: string) =>
    request<{
      detected_title: string | null;
      extracted_skills: string[];
      skills_count: number;
    }>('/resume/parse-text', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  // Companies
  getCompanies: (params?: { search?: string; industry?: string }) => {
    const url = new URL(`${window.location.origin}/api/companies`);
    if (params?.search) url.searchParams.append('search', params.search);
    if (params?.industry) url.searchParams.append('industry', params.industry);
    return request<Company[]>(`/companies${url.search}`);
  },

  getCompany: (slugOrId: string | number) => request<Company>(`/companies/${slugOrId}`),

  createCompany: (data: Partial<Company>) =>
    request<Company>('/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Analytics
  getAnalyticsOverview: () => request<AnalyticsOverview>('/analytics/overview'),
};

