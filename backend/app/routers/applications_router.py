import json
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..database import get_db
from ..models import Application, Job, User, ResumeProfile
from ..schemas import (
    ApplicationCreate, ApplicationStatusUpdate, ApplicationResponse, JobResponse, UserResponse
)
from ..auth import get_current_user, require_role
from ..matching_engine import calculate_match_score

router = APIRouter(prefix="/api/applications", tags=["Applications & ATS"])

def format_application_response(app: Application) -> ApplicationResponse:
    job_resp = None
    if app.job:
        try:
            skills = json.loads(app.job.skills_required) if app.job.skills_required else []
        except Exception:
            skills = []
        job_resp = JobResponse(
            id=app.job.id,
            title=app.job.title,
            company_id=app.job.company_id,
            posted_by_id=app.job.posted_by_id,
            department=app.job.department,
            location=app.job.location,
            workplace_type=app.job.workplace_type,
            job_type=app.job.job_type,
            experience_level=app.job.experience_level,
            min_salary=app.job.min_salary,
            max_salary=app.job.max_salary,
            salary_currency=app.job.salary_currency,
            description=app.job.description,
            requirements=app.job.requirements,
            benefits=app.job.benefits,
            skills_required=skills,
            status=app.job.status,
            views_count=app.job.views_count,
            created_at=app.job.created_at,
            updated_at=app.job.updated_at,
            company=app.job.company
        )

    return ApplicationResponse(
        id=app.id,
        job_id=app.job_id,
        applicant_id=app.applicant_id,
        status=app.status,
        cover_letter=app.cover_letter,
        resume_snapshot=app.resume_snapshot,
        match_score=app.match_score,
        match_reasons=app.match_reasons,
        notes=app.notes,
        interview_date=app.interview_date,
        created_at=app.created_at,
        updated_at=app.updated_at,
        applicant=UserResponse.from_orm(app.applicant) if app.applicant else None,
        job=job_resp
    )


@router.post("", response_model=ApplicationResponse)
def submit_application(
    app_in: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == app_in.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")

    if job.status != "active":
        raise HTTPException(status_code=400, detail="This job is no longer accepting applications.")

    # Check for existing application
    existing = db.query(Application).filter(
        Application.job_id == app_in.job_id,
        Application.applicant_id == current_user.id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="You have already submitted an application for this role.")

    # Retrieve candidate resume profile for snapshot and AI scoring
    resume = db.query(ResumeProfile).filter(ResumeProfile.user_id == current_user.id).first()
    resume_dict = {}
    candidate_skills = []
    candidate_summary = ""
    candidate_exp_titles = []

    if resume:
        try:
            candidate_skills = json.loads(resume.skills or "[]")
            exp_list = json.loads(resume.experience or "[]")
            candidate_exp_titles = [e.get("title", "") for e in exp_list if isinstance(e, dict)]
            candidate_summary = resume.summary or ""
            resume_dict = {
                "title": resume.title,
                "summary": resume.summary,
                "skills": candidate_skills,
                "experience": exp_list,
                "education": json.loads(resume.education or "[]"),
                "projects": json.loads(resume.projects or "[]"),
                "certifications": json.loads(resume.certifications or "[]"),
                "website_url": resume.website_url,
                "github_url": resume.github_url,
                "linkedin_url": resume.linkedin_url
            }
        except Exception:
            pass

    # Compute AI Match Score
    try:
        job_skills = json.loads(job.skills_required or "[]")
    except Exception:
        job_skills = []

    match_score, match_breakdown = calculate_match_score(
        candidate_skills=candidate_skills,
        candidate_summary=candidate_summary,
        candidate_experience_titles=candidate_exp_titles,
        job_skills_required=job_skills,
        job_title=job.title,
        job_description=job.description
    )

    application = Application(
        job_id=job.id,
        applicant_id=current_user.id,
        status="applied",
        cover_letter=app_in.cover_letter,
        resume_snapshot=json.dumps(resume_dict),
        match_score=match_score,
        match_reasons=json.dumps(match_breakdown),
        notes=None
    )
    db.add(application)
    db.commit()
    db.refresh(application)

    return format_application_response(application)


@router.get("/my", response_model=List[ApplicationResponse])
def get_my_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    apps = db.query(Application).filter(
        Application.applicant_id == current_user.id
    ).order_by(desc(Application.created_at)).all()

    return [format_application_response(a) for a in apps]


@router.get("/job/{job_id}", response_model=List[ApplicationResponse])
def get_job_applications(
    job_id: int,
    status_filter: Optional[str] = Query(None, alias="status"),
    min_match: Optional[float] = Query(None),
    current_user: User = Depends(require_role(["employer", "admin"])),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if current_user.role != "admin" and job.posted_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Permission denied to view applicants for this job.")

    query = db.query(Application).filter(Application.job_id == job_id)
    if status_filter:
        query = query.filter(Application.status == status_filter)
    if min_match is not None:
        query = query.filter(Application.match_score >= min_match)

    apps = query.order_by(desc(Application.match_score), desc(Application.created_at)).all()
    return [format_application_response(a) for a in apps]


@router.get("/ats-pipeline/{job_id}")
def get_ats_pipeline(
    job_id: int,
    current_user: User = Depends(require_role(["employer", "admin"])),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if current_user.role != "admin" and job.posted_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Permission denied to view ATS pipeline.")

    apps = db.query(Application).filter(Application.job_id == job_id).all()
    
    stages = [
        "applied", 
        "under_review", 
        "shortlisted", 
        "interview_scheduled", 
        "offered", 
        "rejected"
    ]
    pipeline = {s: [] for s in stages}

    for a in apps:
        resp = format_application_response(a).dict()
        st = a.status if a.status in pipeline else "applied"
        pipeline[st].append(resp)

    return {
        "job_id": job.id,
        "job_title": job.title,
        "total_applicants": len(apps),
        "stages": pipeline
    }


@router.patch("/{application_id}/status", response_model=ApplicationResponse)
def update_application_status(
    application_id: int,
    status_update: ApplicationStatusUpdate,
    current_user: User = Depends(require_role(["employer", "admin"])),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    job = app.job
    if current_user.role != "admin" and job.posted_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Permission denied to update application.")

    app.status = status_update.status
    if status_update.notes is not None:
        app.notes = status_update.notes
    if status_update.interview_date is not None:
        app.interview_date = status_update.interview_date

    app.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(app)

    return format_application_response(app)


@router.post("/{application_id}/withdraw")
def withdraw_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(
        Application.id == application_id,
        Application.applicant_id == current_user.id
    ).first()

    if not app:
        raise HTTPException(status_code=404, detail="Application not found or not owned by you.")

    app.status = "withdrawn"
    db.commit()
    return {"message": "Application has been withdrawn successfully."}

