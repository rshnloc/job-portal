import json
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import ResumeProfile, User
from ..schemas import ResumeProfileResponse, ResumeProfileCreateOrUpdate
from ..auth import get_current_user

router = APIRouter(prefix="/api/resume", tags=["Resume Profile"])

def format_profile(profile: ResumeProfile) -> ResumeProfileResponse:
    try:
        skills = json.loads(profile.skills or "[]")
    except Exception:
        skills = []
    try:
        experience = json.loads(profile.experience or "[]")
    except Exception:
        experience = []
    try:
        education = json.loads(profile.education or "[]")
    except Exception:
        education = []
    try:
        projects = json.loads(profile.projects or "[]")
    except Exception:
        projects = []
    try:
        certifications = json.loads(profile.certifications or "[]")
    except Exception:
        certifications = []

    return ResumeProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        title=profile.title,
        summary=profile.summary,
        skills=skills,
        experience=experience,
        education=education,
        projects=projects,
        certifications=certifications,
        website_url=profile.website_url,
        github_url=profile.github_url,
        linkedin_url=profile.linkedin_url,
        updated_at=profile.updated_at
    )


@router.get("/me", response_model=ResumeProfileResponse)
def get_my_resume(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(ResumeProfile).filter(ResumeProfile.user_id == current_user.id).first()
    if not profile:
        profile = ResumeProfile(
            user_id=current_user.id,
            title=current_user.headline or "Software Developer",
            summary="Passionate developer ready for new technical challenges.",
            skills="[]",
            experience="[]",
            education="[]",
            projects="[]",
            certifications="[]"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return format_profile(profile)


@router.put("/me", response_model=ResumeProfileResponse)
def update_my_resume(
    resume_in: ResumeProfileCreateOrUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(ResumeProfile).filter(ResumeProfile.user_id == current_user.id).first()
    if not profile:
        profile = ResumeProfile(user_id=current_user.id)
        db.add(profile)

    profile.title = resume_in.title
    profile.summary = resume_in.summary
    profile.skills = json.dumps(resume_in.skills)
    profile.experience = json.dumps([e.dict() for e in resume_in.experience])
    profile.education = json.dumps([e.dict() for e in resume_in.education])
    profile.projects = json.dumps([p.dict() for p in resume_in.projects])
    profile.certifications = json.dumps(resume_in.certifications)
    profile.website_url = resume_in.website_url
    profile.github_url = resume_in.github_url
    profile.linkedin_url = resume_in.linkedin_url

    # Also sync user headline if updated
    if resume_in.title:
        current_user.headline = resume_in.title

    db.commit()
    db.refresh(profile)
    return format_profile(profile)


@router.post("/parse-text")
def parse_resume_text(
    payload: dict = Body(...),
    current_user: User = Depends(get_current_user)
):
    """
    Intelligent skill and keyword extraction from raw resume text pasted by candidate.
    """
    raw_text = payload.get("text", "").lower()
    
    known_skills = [
        "Python", "FastAPI", "Django", "Flask", "TypeScript", "JavaScript",
        "React", "Next.js", "Vue.js", "Node.js", "Express", "GraphQL", "REST APIs",
        "PostgreSQL", "MySQL", "MongoDB", "Redis", "Docker", "Kubernetes",
        "AWS", "GCP", "Azure", "CI/CD", "Git", "GitHub Actions",
        "Tailwind CSS", "HTML5", "CSS3", "Redux", "Linux", "Microservices",
        "SQLAlchemy", "PyTorch", "TensorFlow", "Pandas", "Kafka", "Elasticsearch"
    ]

    extracted_skills = []
    for skill in known_skills:
        # Check skill presence
        if skill.lower() in raw_text:
            extracted_skills.append(skill)

    # Heuristic detection for potential title
    detected_title = None
    common_titles = [
        "Full Stack Developer", "Backend Engineer", "Frontend Engineer",
        "Senior Software Engineer", "DevOps Engineer", "Data Engineer",
        "Machine Learning Engineer", "Product Manager", "Cloud Architect"
    ]
    for title in common_titles:
        if title.lower() in raw_text:
            detected_title = title
            break

    return {
        "detected_title": detected_title,
        "extracted_skills": extracted_skills,
        "skills_count": len(extracted_skills)
    }

