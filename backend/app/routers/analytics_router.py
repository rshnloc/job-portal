import json
from collections import Counter
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Job, Company, User, Application
from ..schemas import AnalyticsOverview

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/overview", response_model=AnalyticsOverview)
def get_analytics(db: Session = Depends(get_db)):
    total_jobs = db.query(Job).count()
    active_jobs = db.query(Job).filter(Job.status == "active").count()
    total_companies = db.query(Company).count()
    total_candidates = db.query(User).filter(User.role == "job_seeker").count()
    total_applications = db.query(Application).count()

    # Application status breakdown
    apps = db.query(Application.status).all()
    status_counts = Counter([a[0] for a in apps])
    
    # Department breakdown
    jobs = db.query(Job.department, Job.skills_required).filter(Job.status == "active").all()
    dept_counts = Counter([j[0] for j in jobs if j[0]])

    # Top skills demanded across active jobs
    all_skills = []
    for j in jobs:
        try:
            skills = json.loads(j[1] or "[]")
            all_skills.extend(skills)
        except Exception:
            pass

    skill_counts = Counter(all_skills).most_common(10)
    top_skills_list = [{"skill": s, "count": c} for s, c in skill_counts]

    return AnalyticsOverview(
        total_jobs=total_jobs,
        active_jobs=active_jobs,
        total_companies=total_companies,
        total_candidates=total_candidates,
        total_applications=total_applications,
        applications_by_status=dict(status_counts),
        top_departments=dict(dept_counts),
        top_skills=top_skills_list
    )
