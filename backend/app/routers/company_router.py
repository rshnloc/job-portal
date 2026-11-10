import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import Company, User, Job
from ..schemas import CompanyCreate, CompanyResponse
from ..auth import get_current_user, require_role

router = APIRouter(prefix="/api/companies", tags=["Companies"])

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    return re.sub(r'[\s_-]+', '-', text)

@router.get("", response_model=List[CompanyResponse])
def get_companies(
    search: Optional[str] = None,
    industry: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Company)
    if search:
        query = query.filter(Company.name.ilike(f"%{search}%"))
    if industry:
        query = query.filter(Company.industry == industry)
    return query.all()

@router.get("/{slug_or_id}")
def get_company(slug_or_id: str, db: Session = Depends(get_db)):
    if slug_or_id.isdigit():
        company = db.query(Company).filter(Company.id == int(slug_or_id)).first()
    else:
        company = db.query(Company).filter(Company.slug == slug_or_id).first()

    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    active_jobs = db.query(Job).filter(Job.company_id == company.id, Job.status == "active").all()
    
    return {
        "id": company.id,
        "name": company.name,
        "slug": company.slug,
        "logo_url": company.logo_url,
        "website": company.website,
        "industry": company.industry,
        "company_size": company.company_size,
        "location": company.location,
        "description": company.description,
        "owner_id": company.owner_id,
        "created_at": company.created_at,
        "active_jobs_count": len(active_jobs),
        "jobs": [
            {
                "id": j.id,
                "title": j.title,
                "location": j.location,
                "workplace_type": j.workplace_type,
                "job_type": j.job_type,
                "experience_level": j.experience_level,
                "min_salary": j.min_salary,
                "max_salary": j.max_salary,
                "salary_currency": j.salary_currency,
                "created_at": j.created_at
            }
            for j in active_jobs
        ]
    }

@router.post("", response_model=CompanyResponse)
def create_company(
    company_in: CompanyCreate,
    current_user: User = Depends(require_role(["employer", "admin"])),
    db: Session = Depends(get_db)
):
    base_slug = slugify(company_in.name)
    existing_slug = db.query(Company).filter(Company.slug == base_slug).first()
    slug = f"{base_slug}-{current_user.id}" if existing_slug else base_slug

    company = Company(
        name=company_in.name,
        slug=slug,
        logo_url=company_in.logo_url or f"https://api.dicebear.com/7.x/identicon/svg?seed={slug}",
        website=company_in.website,
        industry=company_in.industry,
        company_size=company_in.company_size,
        location=company_in.location,
        description=company_in.description,
        owner_id=current_user.id
    )
    db.add(company)
    db.commit()
    db.refresh(company)
    return company
