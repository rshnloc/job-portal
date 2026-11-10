from typing import Optional, List, Any
import datetime
from pydantic import BaseModel, EmailStr, Field

# ----------------- Auth & User Schemas -----------------
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "job_seeker" # "job_seeker", "employer", "admin"
    headline: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None

# ----------------- Company Schemas -----------------
class CompanyBase(BaseModel):
    name: str
    website: Optional[str] = None
    industry: str
    company_size: str = "51-200"
    location: str
    description: Optional[str] = None
    logo_url: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyResponse(CompanyBase):
    id: int
    slug: str
    owner_id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# ----------------- Job Schemas -----------------
class JobBase(BaseModel):
    title: str
    department: str = "Engineering"
    location: str
    workplace_type: str = "Remote" # Remote, Hybrid, On-site
    job_type: str = "Full-time" # Full-time, Part-time, Contract, Internship
    experience_level: str = "Mid-Senior" # Entry, Mid, Senior, Lead, Executive
    min_salary: Optional[int] = None
    max_salary: Optional[int] = None
    salary_currency: str = "USD"
    description: str
    requirements: Optional[str] = None
    benefits: Optional[str] = None
    skills_required: List[str] = []

class JobCreate(JobBase):
    company_id: int

class JobUpdate(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    workplace_type: Optional[str] = None
    job_type: Optional[str] = None
    experience_level: Optional[str] = None
    min_salary: Optional[int] = None
    max_salary: Optional[int] = None
    salary_currency: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    benefits: Optional[str] = None
    skills_required: Optional[List[str]] = None
    status: Optional[str] = None

class JobResponse(JobBase):
    id: int
    company_id: int
    posted_by_id: int
    status: str
    views_count: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
    company: Optional[CompanyResponse] = None
    is_saved: Optional[bool] = False
    has_applied: Optional[bool] = False
    match_score: Optional[float] = None

    class Config:
        from_attributes = True

# ----------------- Application Schemas -----------------
class ApplicationCreate(BaseModel):
    job_id: int
    cover_letter: Optional[str] = None

class ApplicationStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None
    interview_date: Optional[datetime.datetime] = None

class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    applicant_id: int
    status: str
    cover_letter: Optional[str] = None
    resume_snapshot: Optional[str] = None
    match_score: float
    match_reasons: Optional[str] = None
    notes: Optional[str] = None
    interview_date: Optional[datetime.datetime] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime
    applicant: Optional[UserResponse] = None
    job: Optional[JobResponse] = None

    class Config:
        from_attributes = True

# ----------------- Saved Job Schemas -----------------
class SavedJobResponse(BaseModel):
    id: int
    user_id: int
    job_id: int
    created_at: datetime.datetime
    job: Optional[JobResponse] = None

    class Config:
        from_attributes = True

# ----------------- Resume Schemas -----------------
class ExperienceItem(BaseModel):
    title: str
    company: str
    duration: str
    description: str

class EducationItem(BaseModel):
    degree: str
    school: str
    year: str

class ProjectItem(BaseModel):
    name: str
    description: str
    link: Optional[str] = None

class ResumeProfileBase(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    skills: List[str] = []
    experience: List[ExperienceItem] = []
    education: List[EducationItem] = []
    projects: List[ProjectItem] = []
    certifications: List[str] = []
    website_url: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None

class ResumeProfileCreateOrUpdate(ResumeProfileBase):
    pass

class ResumeProfileResponse(ResumeProfileBase):
    id: int
    user_id: int
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

# ----------------- Analytics & Summary -----------------
class AnalyticsOverview(BaseModel):
    total_jobs: int
    active_jobs: int
    total_companies: int
    total_candidates: int
    total_applications: int
    applications_by_status: dict[str, int]
    top_departments: dict[str, int]
    top_skills: list[dict[str, Any]]
