import json
import re
from typing import List, Dict, Any, Tuple

def normalize_skill(skill: str) -> str:
    """Normalize skill strings for robust matching."""
    s = skill.lower().strip()
    s = re.sub(r'[\s\-_.]+', '', s)
    alias_map = {
        "reactjs": "react",
        "react": "react",
        "nodejs": "node",
        "node": "node",
        "ts": "typescript",
        "typescript": "typescript",
        "js": "javascript",
        "javascript": "javascript",
        "py": "python",
        "python": "python",
        "postgres": "postgresql",
        "postgresql": "postgresql",
        "k8s": "kubernetes",
        "kubernetes": "kubernetes",
        "fastapi": "fastapi",
        "aws": "aws",
        "gcp": "gcp",
        "azure": "azure",
        "docker": "docker",
        "graphql": "graphql",
        "rest": "restapis",
        "restful": "restapis",
        "restapi": "restapis",
        "restapis": "restapis",
        "tailwind": "tailwindcss",
        "tailwindcss": "tailwindcss",
    }
    return alias_map.get(s, s)

def calculate_match_score(
    candidate_skills: List[str],
    candidate_summary: str,
    candidate_experience_titles: List[str],
    job_skills_required: List[str],
    job_title: str,
    job_description: str
) -> Tuple[float, Dict[str, Any]]:
    """
    Computes a smart match score (0.0 to 100.0) and breakdown between a candidate and a job.
    """
    if not job_skills_required:
        return 80.0, {
            "matched_skills": candidate_skills[:5],
            "missing_skills": [],
            "score_breakdown": {
                "skills_score": 80,
                "title_relevance": 80,
                "content_relevance": 80
            },
            "verdict": "Good general match"
        }

    norm_candidate_skills = {normalize_skill(s) for s in candidate_skills}
    # Also extract skills mentioned in summary & experience
    full_candidate_text = f"{candidate_summary} {' '.join(candidate_experience_titles)}".lower()

    matched_skills = []
    missing_skills = []

    for req in job_skills_required:
        n_req = normalize_skill(req)
        # Check direct skill match or presence in summary text
        if n_req in norm_candidate_skills or re.search(r'\b' + re.escape(req.lower()) + r'\b', full_candidate_text):
            matched_skills.append(req)
        else:
            missing_skills.append(req)

    total_req = len(job_skills_required)
    skill_match_ratio = (len(matched_skills) / total_req) if total_req > 0 else 1.0

    # Title keyword overlap
    job_title_words = set(re.findall(r'\w+', job_title.lower()))
    stop_words = {"senior", "junior", "lead", "staff", "principal", "developer", "engineer", "manager", "specialist"}
    core_title_words = job_title_words - stop_words
    
    title_overlap = 0.5
    for exp_title in candidate_experience_titles:
        exp_words = set(re.findall(r'\w+', exp_title.lower()))
        if core_title_words and (core_title_words & exp_words):
            title_overlap = 1.0
            break

    # Calculate overall weighted score
    # 65% skills + 20% title/experience relevance + 15% baseline/activity
    raw_score = (skill_match_ratio * 65.0) + (title_overlap * 20.0) + 15.0
    final_score = round(min(100.0, max(15.0, raw_score)), 1)

    if final_score >= 85:
        verdict = "Exceptional Match"
    elif final_score >= 70:
        verdict = "Strong Match"
    elif final_score >= 50:
        verdict = "Moderate Match"
    else:
        verdict = "Potential Growth Candidate"

    breakdown = {
        "score": final_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "matched_count": len(matched_skills),
        "total_required": total_req,
        "verdict": verdict,
        "recommendation": (
            "Highly recommended for immediate technical review."
            if final_score >= 80 else
            "Meets most core competencies; review experience depth."
            if final_score >= 60 else
            "Review candidate transferable skills and projects."
        )
    }

    return final_score, breakdown
