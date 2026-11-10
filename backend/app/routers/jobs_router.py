import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc

from ..database import get_db
from ..models import Job, Company, User, SavedJob, Application, ResumeProfile
from ..schemas import JobCreate, JobUpdate, JobResponse, SavedJobResponse
from ..auth import get_current_user, get_optional_current_user, require_role
from ..matching_engine import calculate_match_score

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])

@router.get("", response_model=List[JobResponse])
def get_jobs(
    q: Optional[str] = Query(None, description="Keyword search in title, description or skills"),
    location: Optional[str] = Query(None, description="Filter by location"),
    workplace_type: Optional[str] = Query(None, description="Remote, Hybrid, On-site"),
    job_type: Optional[str] = Query(None, description="Full-time, Part-time, Contract, Internship"),
    experience_level: Optional[str] = Query(None, description="Entry, Mid, Senior, Lead, Executive"),
    department: Optional[str] = Query(None, description="Engineering, Design, Product, etc."),
    min_salary: Optional[int] = Query(None, description="Minimum salary threshold"),
    sort_by: Optional[str] = Query("newest", description="newest, highest_salary, most_viewed"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Job).filter(Job.status == "active")

    if q:
        search_pattern = f"%{q.lower()}%"
        query = query.filter(
            or_(
                Job.title.ilike(search_pattern),
                Job.description.ilike(search_pattern),
                Job.skills_required.ilike(search_pattern),
                Job.department.ilike(search_pattern)
            )
        )

    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))

    if workplace_type:
        query = query.filter(Job.workplace_type == workplace_type)

    if job_type:
        query = query.filter(Job.job_type == job_type)

    if experience_level:
        query = query.filter(Job.experience_level == experience_level)

    if department:
        query = query.filter(Job.department.ilike(f"%{department}%"))

    if min_salary:
        query = query.filter(Job.max_salary >= min_salary)

    # Sorting
    if sort_by == "highest_salary":
        query = query.order_by(desc(Job.max_salary.nulls_last()))
    elif sort_by == "most_viewed":
        query = query.order_by(desc(Job.views_count))
    else:
        query = query.order_by(desc(Job.created_at))

    jobs = query.limit(100).all()

    # Pre-fetch user's saved and applied jobs to enrich the response
    user_saved_job_ids = set()
    user_applied_job_ids = set()
    candidate_profile = None

    if current_user:
        saved_records = db.query(SavedJob.job_id).filter(SavedJob.user_id == current_user.id).all()
        user_saved_job_ids = {r[0] for r in saved_records}

        applied_records = db.query(Application.job_id).filter(Application.applicant_id == current_user.id).all()
        user_applied_job_ids = {r[0] for r in applied_records}

        if current_user.role == "job_seeker":
            candidate_profile = db.query(ResumeProfile).filter(ResumeProfile.user_id == current_user.id).first()

    # Prepare candidate skills for smart match scoring
    candidate_skills = []
    candidate_summary = ""
    candidate_exp_titles = []
    if candidate_profile:
        try:
            candidate_skills = json.loads(candidate_profile.skills or "[]")
            candidate_summary = candidate_profile.summary or ""
            exp_list = json.loads(candidate_profile.experience or "[]")
            candidate_exp_titles = [e.get("title", "") for e in exp_list if isinstance(e, dict)]
        except Exception:
            pass

    response_list = []
    for job in jobs:
        try:
            skills = json.loads(job.skills_required) if job.skills_required else []
        except Exception:
            skills = [s.strip() for s in job.skills_required.split(",")] if job.skills_required else []

        match_score = None
        if candidate_profile and skills:
            score, _ = calculate_match_score(
                candidate_skills=candidate_skills,
                candidate_summary=candidate_summary,
                candidate_experience_titles=candidate_exp_titles,
                job_skills_required=skills,
                job_title=job.title,
                job_description=job.description
            )
            match_score = score

        response_list.append(
            JobResponse(
                id=job.id,
                title=job.title,
                company_id=job.company_id,
                posted_by_id=job.posted_by_id,
                department=job.department,
                location=job.location,
                workplace_type=job.workplace_type,
                job_type=job.job_type,
                experience_level=job.experience_level,
                min_salary=job.min_salary,
                max_salary=job.max_salary,
                salary_currency=job.salary_currency,
                description=job.description,
                requirements=job.requirements,
                benefits=job.benefits,
                skills_required=skills,
                status=job.status,
                views_count=job.views_count,
                created_at=job.created_at,
                updated_at=job.updated_at,
                company=job.company,
                is_saved=(job.id in user_saved_job_ids),
                has_applied=(job.id in user_applied_job_ids),
                match_score=match_score
            )
        )

    return response_list


@router.get("/my-posted-jobs", response_model=List[JobResponse])
def get_employer_jobs(
    current_user: User = Depends(require_role(["employer", "admin"])),
    db: Session = Depends(get_db)
):
    jobs = db.query(Job).filter(Job.posted_by_id == current_user.id).order_by(desc(Job.created_at)).all()
    results = []
    for job in jobs:
        try:
            skills = json.loads(job.skills_required) if job.skills_required else []
        except Exception:
            skills = []
        results.append(
            JobResponse(
                id=job.id,
                title=job.title,
                company_id=job.company_id,
                posted_by_id=job.posted_by_id,
                department=job.department,
                location=job.location,
                workplace_type=job.workplace_type,
                job_type=job.job_type,
                experience_level=job.experience_level,
                min_salary=job.min_salary,
                max_salary=job.max_salary,
                salary_currency=job.salary_currency,
                description=job.description,
                requirements=job.requirements,
                benefits=job.benefits,
                skills_required=skills,
                status=job.status,
                views_count=job.views_count,
                created_at=job.created_at,
                updated_at=job.updated_at,
                company=job.company
            )
        )
    return results


@router.get("/saved", response_model=List[SavedJobResponse])
def get_saved_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    saved = db.query(SavedJob).filter(SavedJob.user_id == current_user.id).order_by(desc(SavedJob.created_at)).all()
    out = []
    for s in saved:
        job = s.job
        try:
            skills = json.loads(job.skills_required) if job.skills_required else []
        except Exception:
            skills = []
        job_resp = JobResponse(
            id=job.id,
            title=job.title,
            company_id=job.company_id,
            posted_by_id=job.posted_by_id,
            department=job.department,
            location=job.location,
            workplace_type=job.workplace_type,
            job_type=job.job_type,
            experience_level=job.experience_level,
            min_salary=job.min_salary,
            max_salary=job.max_salary,
            salary_currency=job.salary_currency,
            description=job.description,
            requirements=job.requirements,
            benefits=job.benefits,
            skills_required=skills,
            status=job.status,
            views_count=job.views_count,
            created_at=job.created_at,
            updated_at=job.updated_at,
            company=job.company,
            is_saved=True
        )
        out.append(SavedJobResponse(
            id=s.id,
            user_id=s.user_id,
            job_id=s.job_id,
            created_at=s.created_at,
            job=job_resp
        ))
    return out


@router.post("/saved/{job_id}")
def toggle_save_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    existing = db.query(SavedJob).filter(
        SavedJob.user_id == current_user.id,
        SavedJob.job_id == job_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"status": "unmarked", "is_saved": False, "message": "Job removed from saved list."}
    else:
        new_save = SavedJob(user_id=current_user.id, job_id=job_id)
        db.add(new_save)
        db.commit()
        return {"status": "saved", "is_saved": True, "message": "Job saved to your bookmarks."}


@router.get("/{job_id}", response_model=JobResponse)
def get_job(
    job_id: int,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Increment view count
    job.views_count += 1
    db.commit()

    is_saved = False
    has_applied = False
    match_score = None

    if current_user:
        is_saved = db.query(SavedJob).filter(
            SavedJob.user_id == current_user.id,
            SavedJob.job_id == job_id
        ).first() is not None

        has_applied = db.query(Application).filter(
            Application.applicant_id == current_user.id,
            Application.job_id == job_id
        ).first() is not None

        if current_user.role == "job_seeker":
            profile = db.query(ResumeProfile).filter(ResumeProfile.user_id == current_user.id).first()
            if profile:
                try:
                    c_skills = json.loads(profile.skills or "[]")
                    exp_list = json.loads(profile.experience or "[]")
                    exp_titles = [e.get("title", "") for e in exp_list if isinstance(e, dict)]
                    j_skills = json.loads(job.skills_required or "[]")
                    score, _ = calculate_match_score(
                        candidate_skills=c_skills,
                        candidate_summary=profile.summary or "",
                        candidate_experience_titles=exp_titles,
                        job_skills_required=j_skills,
                        job_title=job.title,
                        job_description=job.description
                    )
                    match_score = score
                except Exception:
                    pass

    try:
        skills = json.loads(job.skills_required) if job.skills_required else []
    except Exception:
        skills = []

    return JobResponse(
        id=job.id,
        title=job.title,
        company_id=job.company_id,
        posted_by_id=job.posted_by_id,
        department=job.department,
        location=job.location,
        workplace_type=job.workplace_type,
        job_type=job.job_type,
        experience_level=job.experience_level,
        min_salary=job.min_salary,
        max_salary=job.max_salary,
        salary_currency=job.salary_currency,
        description=job.description,
        requirements=job.requirements,
        benefits=job.benefits,
        skills_required=skills,
        status=job.status,
        views_count=job.views_count,
        created_at=job.created_at,
        updated_at=job.updated_at,
        company=job.company,
        is_saved=is_saved,
        has_applied=has_applied,
        match_score=match_score
    )


@router.post("", response_model=JobResponse)
def create_job(
    job_in: JobCreate,
    current_user: User = Depends(require_role(["employer", "admin"])),
    db: Session = Depends(get_db)
):
    company = db.query(Company).filter(Company.id == job_in.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    # If not admin, verify user owns company
    if current_user.role != "admin" and company.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to post for this company.")

    job = Job(
        title=job_in.title,
        company_id=job_in.company_id,
        posted_by_id=current_user.id,
        department=job_in.department,
        location=job_in.location,
        workplace_type=job_in.workplace_type,
        job_type=job_in.job_type,
        experience_level=job_in.experience_level,
        min_salary=job_in.min_salary,
        max_salary=job_in.max_salary,
        salary_currency=job_in.salary_currency,
        description=job_in.description,
        requirements=job_in.requirements,
        benefits=job_in.benefits,
        skills_required=json.dumps(job_in.skills_required or []),
        status="active"
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    return JobResponse(
        id=job.id,
        title=job.title,
        company_id=job.company_id,
        posted_by_id=job.posted_by_id,
        department=job.department,
        location=job.location,
        workplace_type=job.workplace_type,
        job_type=job.job_type,
        experience_level=job.experience_level,
        min_salary=job.min_salary,
        max_salary=job.max_salary,
        salary_currency=job.salary_currency,
        description=job.description,
        requirements=job.requirements,
        benefits=job.benefits,
        skills_required=job_in.skills_required,
        status=job.status,
        views_count=job.views_count,
        created_at=job.created_at,
        updated_at=job.updated_at,
        company=company
    )


@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: int,
    job_update: JobUpdate,
    current_user: User = Depends(require_role(["employer", "admin"])),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if current_user.role != "admin" and job.posted_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to modify this job.")

    update_data = job_update.dict(exclude_unset=True)
    if "skills_required" in update_data and update_data["skills_required"] is not None:
        job.skills_required = json.dumps(update_data["skills_required"])
        del update_data["skills_required"]

    for key, value in update_data.items():
        setattr(job, key, value)

    db.commit()
    db.refresh(job)

    try:
        skills = json.loads(job.skills_required) if job.skills_required else []
    except Exception:
        skills = []

    return JobResponse(
        id=job.id,
        title=job.title,
        company_id=job.company_id,
        posted_by_id=job.posted_by_id,
        department=job.department,
        location=job.location,
        workplace_type=job.workplace_type,
        job_type=job.job_type,
        experience_level=job.experience_level,
        min_salary=job.min_salary,
        max_salary=job.max_salary,
        salary_currency=job.salary_currency,
        description=job.description,
        requirements=job.requirements,
        benefits=job.benefits,
        skills_required=skills,
        status=job.status,
        views_count=job.views_count,
        created_at=job.created_at,
        updated_at=job.updated_at,
        company=job.company
    )


@router.delete("/{job_id}")
def delete_job(
    job_id: int,
    current_user: User = Depends(require_role(["employer", "admin"])),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if current_user.role != "admin" and job.posted_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Permission denied")

    db.delete(job)
    db.commit()
    return {"message": "Job posting deleted successfully"}

