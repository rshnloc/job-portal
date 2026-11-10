import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float
)
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="job_seeker", nullable=False) # job_seeker, employer, admin
    headline = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)
    phone = Column(String(100), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    companies = relationship("Company", back_populates="owner", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="applicant", cascade="all, delete-orphan")
    saved_jobs = relationship("SavedJob", back_populates="user", cascade="all, delete-orphan")
    resume_profile = relationship("ResumeProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    job_alerts = relationship("JobAlert", back_populates="user", cascade="all, delete-orphan")


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True, index=True)
    slug = Column(String(255), nullable=False, unique=True, index=True)
    logo_url = Column(String(500), nullable=True)
    website = Column(String(255), nullable=True)
    industry = Column(String(100), nullable=False) # e.g. "Cloud & AI", "Fintech", "Healthtech"
    company_size = Column(String(50), default="51-200") # "1-10", "11-50", "51-200", "201-500", "500+"
    location = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="companies")
    jobs = relationship("Job", back_populates="company", cascade="all, delete-orphan")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    posted_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    department = Column(String(100), default="Engineering")
    location = Column(String(255), nullable=False)
    workplace_type = Column(String(50), default="Remote") # Remote, Hybrid, On-site
    job_type = Column(String(50), default="Full-time") # Full-time, Part-time, Contract, Internship
    experience_level = Column(String(50), default="Mid-Senior") # Entry, Mid, Senior, Lead, Executive
    min_salary = Column(Integer, nullable=True)
    max_salary = Column(Integer, nullable=True)
    salary_currency = Column(String(10), default="USD")
    description = Column(Text, nullable=False)
    requirements = Column(Text, nullable=True)
    benefits = Column(Text, nullable=True)
    skills_required = Column(Text, default="[]") # JSON array string of required skills
    status = Column(String(50), default="active", index=True) # active, closed, draft
    views_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    company = relationship("Company", back_populates="jobs")
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")
    saved_by = relationship("SavedJob", back_populates="job", cascade="all, delete-orphan")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    applicant_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(50), default="applied", index=True)
    # Statuses: applied, under_review, shortlisted, interview_scheduled, offered, rejected, withdrawn
    cover_letter = Column(Text, nullable=True)
    resume_snapshot = Column(Text, nullable=True) # JSON snapshot of applicant profile at time of application
    match_score = Column(Float, default=0.0) # 0 to 100 percentage
    match_reasons = Column(Text, default="{}") # JSON breakdown of matched & missing skills
    notes = Column(Text, nullable=True) # Employer internal hiring notes
    interview_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    job = relationship("Job", back_populates="applications")
    applicant = relationship("User", back_populates="applications")


class SavedJob(Base):
    __tablename__ = "saved_jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="saved_jobs")
    job = relationship("Job", back_populates="saved_by")


class ResumeProfile(Base):
    __tablename__ = "resume_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    title = Column(String(255), nullable=True)
    summary = Column(Text, nullable=True)
    skills = Column(Text, default="[]") # JSON array string
    experience = Column(Text, default="[]") # JSON array of {title, company, duration, description}
    education = Column(Text, default="[]") # JSON array of {degree, school, year}
    projects = Column(Text, default="[]") # JSON array of {name, description, link}
    certifications = Column(Text, default="[]") # JSON array of strings
    website_url = Column(String(500), nullable=True)
    github_url = Column(String(500), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="resume_profile")


class JobAlert(Base):
    __tablename__ = "job_alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    keyword = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)
    job_type = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="job_alerts")
