import json
import datetime
from sqlalchemy.orm import Session
from .models import User, Company, Job, Application, SavedJob, ResumeProfile
from .auth import get_password_hash
from .matching_engine import calculate_match_score

def seed_database(db: Session):
    # Check if already seeded
    if db.query(User).first():
        return

    print("🌱 Seeding realistic test data (no PII, no real credentials)...")

    # Common default password for demo testing accounts
    default_hashed_pwd = get_password_hash("Password123!")

    # 1. Users
    candidate_user = User(
        email="candidate@example.com",
        hashed_password=default_hashed_pwd,
        full_name="Alex Rivera",
        role="job_seeker",
        headline="Senior Full-Stack Engineer | React & Python Specialist",
        location="San Francisco, CA",
        phone="+1-555-0101",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    )

    employer_user = User(
        email="employer@example.com",
        hashed_password=default_hashed_pwd,
        full_name="Sarah Lin",
        role="employer",
        headline="VP of Talent & Engineering at TechNova",
        location="Austin, TX",
        phone="+1-555-0102",
        avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
    )

    admin_user = User(
        email="admin@example.com",
        hashed_password=default_hashed_pwd,
        full_name="Jordan Taylor",
        role="admin",
        headline="System Administrator & Platform Lead",
        location="Seattle, WA",
        phone="+1-555-0103",
        avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    )

    candidate_2 = User(
        email="devon.vance@example.com",
        hashed_password=default_hashed_pwd,
        full_name="Devon Vance",
        role="job_seeker",
        headline="Cloud Infrastructure & DevOps Engineer",
        location="New York, NY",
        phone="+1-555-0104",
        avatar_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
    )

    candidate_3 = User(
        email="samira.patel@example.com",
        hashed_password=default_hashed_pwd,
        full_name="Samira Patel",
        role="job_seeker",
        headline="Machine Learning & Data Systems Engineer",
        location="Boston, MA",
        phone="+1-555-0105",
        avatar_url="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
    )

    db.add_all([candidate_user, employer_user, admin_user, candidate_2, candidate_3])
    db.commit()
    db.refresh(candidate_user)
    db.refresh(employer_user)
    db.refresh(candidate_2)
    db.refresh(candidate_3)

    # 2. Candidate Resume Profiles
    alex_resume = ResumeProfile(
        user_id=candidate_user.id,
        title="Senior Full-Stack Engineer",
        summary="7+ years of experience designing scalable distributed web platforms using Python (FastAPI/Django) and modern TypeScript (React/Next.js). Strong background in cloud architecture, CI/CD, and high-performance REST/GraphQL APIs.",
        skills=json.dumps([
            "Python", "FastAPI", "React", "TypeScript", "PostgreSQL",
            "Docker", "Tailwind CSS", "Redis", "AWS", "Git", "REST APIs"
        ]),
        experience=json.dumps([
            {
                "title": "Lead Software Engineer",
                "company": "Apex Cloud Systems",
                "duration": "2022 - Present",
                "description": "Architected microservices handling 25M daily requests. Reduced p99 latency by 42% through query caching and FastAPI asynchronous workflows."
            },
            {
                "title": "Full-Stack Developer",
                "company": "Beacon Tech Labs",
                "duration": "2019 - 2022",
                "description": "Built responsive candidate analytics dashboards with React and Tailwind CSS. Implemented OAuth2 and RBAC authentication system."
            }
        ]),
        education=json.dumps([
            {
                "degree": "B.S. in Computer Science",
                "school": "University of Technology",
                "year": "2015 - 2019"
            }
        ]),
        projects=json.dumps([
            {
                "name": "Distributed Task Orchestrator",
                "description": "Lightweight open-source queue processing engine built with Python and Redis.",
                "link": "https://example.com/projects/task-queue"
            },
            {
                "name": "NextUI Component Library",
                "description": "Accessible Tailwind CSS and React component system with zero dependencies.",
                "link": "https://example.com/projects/next-ui"
            }
        ]),
        certifications=json.dumps([
            "AWS Certified Solutions Architect - Associate",
            "Certified Kubernetes Application Developer (CKAD)"
        ]),
        website_url="https://alexrivera.dev.example.com",
        github_url="https://github.com/alexrivera-example",
        linkedin_url="https://linkedin.com/in/alexrivera-example"
    )

    devon_resume = ResumeProfile(
        user_id=candidate_2.id,
        title="Cloud DevOps & Site Reliability Engineer",
        summary="Specialized in Kubernetes orchestration, Terraform infrastructure as code, CI/CD automation pipelines, and multi-region AWS cloud architectures.",
        skills=json.dumps(["Docker", "Kubernetes", "AWS", "Terraform", "Python", "CI/CD", "Linux", "Prometheus", "Grafana"]),
        experience=json.dumps([
            {
                "title": "DevOps Engineer",
                "company": "SkyNet Infra",
                "duration": "2021 - Present",
                "description": "Managed 12 production EKS clusters, automated zero-downtime releases via ArgoCD."
            }
        ]),
        education=json.dumps([{"degree": "B.S. in Information Systems", "school": "State Institute", "year": "2017 - 2021"}]),
        projects=json.dumps([]),
        certifications=json.dumps(["AWS Certified DevOps Professional"])
    )

    samira_resume = ResumeProfile(
        user_id=candidate_3.id,
        title="AI/ML Engineer",
        summary="Expert in LLM fine-tuning, retrieval-augmented generation (RAG), PyTorch, and deploying machine learning models into production inference pipelines.",
        skills=json.dumps(["Python", "PyTorch", "FastAPI", "Docker", "PostgreSQL", "Pandas", "Scikit-Learn", "Vector Databases"]),
        experience=json.dumps([
            {
                "title": "Machine Learning Engineer",
                "company": "NeuralEdge",
                "duration": "2022 - Present",
                "description": "Developed document classification and embeddings pipelines with 94% accuracy."
            }
        ]),
        education=json.dumps([{"degree": "M.S. in Artificial Intelligence", "school": "Tech University", "year": "2020 - 2022"}]),
        projects=json.dumps([]),
        certifications=json.dumps(["TensorFlow Developer Certificate"])
    )

    db.add_all([alex_resume, devon_resume, samira_resume])
    db.commit()

    # 3. Companies
    companies = [
        Company(
            name="TechNova Cloud",
            slug="technova-cloud",
            logo_url="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
            website="https://technova.example.com",
            industry="Cloud & AI Infrastructure",
            company_size="51-200",
            location="San Francisco, CA",
            description="TechNova builds next-generation distributed compute infrastructure and developer tooling for global engineering teams.",
            owner_id=employer_user.id
        ),
        Company(
            name="QuantumByte Labs",
            slug="quantumbyte-labs",
            logo_url="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=100&auto=format&fit=crop&q=80",
            website="https://quantumbyte.example.com",
            industry="Artificial Intelligence",
            company_size="11-50",
            location="New York, NY",
            description="Pioneering applied foundation models and intelligent decision systems for modern enterprises.",
            owner_id=employer_user.id
        ),
        Company(
            name="FinFlow Global",
            slug="finflow-global",
            logo_url="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&auto=format&fit=crop&q=80",
            website="https://finflow.example.com",
            industry="Fintech & Payments",
            company_size="201-500",
            location="London, UK",
            description="Empowering borderless digital payments and treasury management with bank-grade security.",
            owner_id=employer_user.id
        ),
        Company(
            name="Aura Health AI",
            slug="aura-health-ai",
            logo_url="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=100&auto=format&fit=crop&q=80",
            website="https://aurahealth.example.com",
            industry="Healthtech",
            company_size="11-50",
            location="Boston, MA",
            description="Transforming preventative healthcare diagnostic systems using multimodal clinical AI.",
            owner_id=employer_user.id
        ),
    ]
    db.add_all(companies)
    db.commit()
    for c in companies:
        db.refresh(c)

    # 4. Jobs
    c1, c2, c3, c4 = companies[0], companies[1], companies[2], companies[3]

    jobs = [
        Job(
            title="Senior Full-Stack Engineer (React & Python)",
            company_id=c1.id,
            posted_by_id=employer_user.id,
            department="Engineering",
            location="Remote / San Francisco, CA",
            workplace_type="Remote",
            job_type="Full-time",
            experience_level="Senior",
            min_salary=150000,
            max_salary=195000,
            salary_currency="USD",
            description="We are seeking an experienced Senior Full-Stack Engineer to lead the design and evolution of our real-time cloud management console. You will work closely with product designers and platform engineers to build snappy, elegant interfaces backed by robust Python APIs.",
            requirements="• 5+ years building full-stack production web applications\n• Deep expertise in React, TypeScript, and modern state management\n• Strong Python skills with FastAPI or similar async web frameworks\n• Experience with relational databases (PostgreSQL) and caching (Redis)\n• Excellent system design and API contract design skills",
            benefits="• 100% Remote flexibility with home office stipend\n• Comprehensive health, dental, and vision insurance\n• 401(k) matching up to 5%\n• Unlimited PTO and annual learning allowance",
            skills_required=json.dumps(["React", "TypeScript", "Python", "FastAPI", "PostgreSQL", "Docker", "Tailwind CSS"]),
            status="active",
            views_count=142
        ),
        Job(
            title="Staff Cloud Infrastructure & DevOps Architect",
            company_id=c1.id,
            posted_by_id=employer_user.id,
            department="DevOps & SRE",
            location="Austin, TX / Hybrid",
            workplace_type="Hybrid",
            job_type="Full-time",
            experience_level="Lead",
            min_salary=180000,
            max_salary=225000,
            salary_currency="USD",
            description="Lead the architecture of our multi-region Kubernetes clusters on AWS. You will define our Infrastructure-as-Code standards, optimize containerized service mesh performance, and ensure 99.99% uptime for mission-critical customer workloads.",
            requirements="• 7+ years in Site Reliability Engineering or Cloud Operations\n• Hands-on mastery of Kubernetes, Terraform, and AWS ecosystem\n• Deep understanding of Linux internals, network protocols, and security hardening\n• Experience with CI/CD pipeline optimization (GitHub Actions, ArgoCD)",
            benefits="• Competitive base + equity package\n• Flexible hybrid schedule (2 days in office)\n• Top-tier hardware setup (MacBook Pro M3 Max)\n• Wellness stipend",
            skills_required=json.dumps(["Kubernetes", "AWS", "Terraform", "Docker", "CI/CD", "Linux", "Python"]),
            status="active",
            views_count=89
        ),
        Job(
            title="Senior Machine Learning Engineer (Applied GenAI)",
            company_id=c2.id,
            posted_by_id=employer_user.id,
            department="AI Research",
            location="New York, NY",
            workplace_type="Hybrid",
            job_type="Full-time",
            experience_level="Senior",
            min_salary=170000,
            max_salary=210000,
            salary_currency="USD",
            description="Join our core AI research and engineering team to develop high-throughput model serving pipelines and advanced Retrieval-Augmented Generation (RAG) workflows for enterprise knowledge graphs.",
            requirements="• Solid background in PyTorch, Python, and modern transformer architectures\n• Experience deploying models into production with sub-100ms latency\n• Familiarity with vector search engines (Milvus, Qdrant, pgvector)\n• Strong algorithmic and mathematical foundation",
            benefits="• Cutting-edge GPU cluster compute access\n• Generous stock options with accelerated vesting\n• Catered gourmet lunches and barista bar in NYC office",
            skills_required=json.dumps(["Python", "PyTorch", "FastAPI", "Docker", "PostgreSQL", "Vector Databases"]),
            status="active",
            views_count=215
        ),
        Job(
            title="Frontend UI/UX Engineer (React & TypeScript)",
            company_id=c3.id,
            posted_by_id=employer_user.id,
            department="Engineering",
            location="Remote",
            workplace_type="Remote",
            job_type="Full-time",
            experience_level="Mid",
            min_salary=120000,
            max_salary=155000,
            salary_currency="USD",
            description="Help build the next generation of financial dashboards, payment flows, and data visualizations. We value pixel-perfection, buttery 60fps animations, and accessible component architectures.",
            requirements="• 3+ years of professional React and TypeScript experience\n• Mastery of modern CSS, Tailwind, and responsive design systems\n• Experience with client-side charting libraries (Recharts, D3)\n• Passion for UX micro-interactions and performance profiling",
            benefits="• Work from anywhere in the world\n• Annual company offsites in Europe and North America\n• Comprehensive mental health and wellness program",
            skills_required=json.dumps(["React", "TypeScript", "Tailwind CSS", "JavaScript", "REST APIs", "Git"]),
            status="active",
            views_count=178
        ),
        Job(
            title="Backend Engineer (High-Throughput APIs)",
            company_id=c3.id,
            posted_by_id=employer_user.id,
            department="Engineering",
            location="London, UK / Remote",
            workplace_type="Hybrid",
            job_type="Full-time",
            experience_level="Mid-Senior",
            min_salary=135000,
            max_salary=165000,
            salary_currency="USD",
            description="Build resilient transactional processing services handling global multicurrency payments. Focus on zero-data-loss event streaming, idempotent webhook deliveries, and sub-50ms API endpoints.",
            requirements="• Strong expertise in Python (FastAPI/SQLAlchemy) or Go\n• Solid experience with message brokers (Kafka, RabbitMQ, Redis)\n• Proven track record with SQL database tuning and schema migrations\n• Understanding of financial compliance and distributed locking",
            benefits="• Hybrid remote schedule\n• Pension match up to 8%\n• Generous parental leave policy",
            skills_required=json.dumps(["Python", "FastAPI", "PostgreSQL", "Redis", "Docker", "REST APIs"]),
            status="active",
            views_count=98
        ),
        Job(
            title="Health Data Systems Engineer",
            company_id=c4.id,
            posted_by_id=employer_user.id,
            department="Data Platform",
            location="Boston, MA / Remote",
            workplace_type="Remote",
            job_type="Full-time",
            experience_level="Senior",
            min_salary=145000,
            max_salary=180000,
            salary_currency="USD",
            description="Design HIPAA-compliant ETL pipelines integrating hospital EHR feeds into our clinical AI models. Build data quality monitoring and secure batch processing architectures.",
            requirements="• 4+ years building robust data pipelines in Python\n• Experience with healthcare interoperability standards (FHIR, HL7) is a plus\n• Deep knowledge of PostgreSQL, data warehousing, and Docker\n• Commitment to high security standards and automated testing",
            benefits="• Comprehensive medical and pharmacy coverage with zero deductible\n• Flexible hours\n• Continuing education and conference reimbursement",
            skills_required=json.dumps(["Python", "PostgreSQL", "Docker", "AWS", "REST APIs"]),
            status="active",
            views_count=67
        )
    ]

    db.add_all(jobs)
    db.commit()
    for j in jobs:
        db.refresh(j)

    # 5. Saved Jobs for Demo Candidate
    saved_1 = SavedJob(user_id=candidate_user.id, job_id=jobs[0].id)
    saved_2 = SavedJob(user_id=candidate_user.id, job_id=jobs[3].id)
    db.add_all([saved_1, saved_2])

    # 6. Pre-populated Applications across ATS pipeline
    # Job 1: Alex Rivera applied (Senior Full-Stack) -> High Match!
    score_1, breakdown_1 = calculate_match_score(
        candidate_skills=["React", "TypeScript", "Python", "FastAPI", "PostgreSQL", "Docker", "Tailwind CSS", "Redis"],
        candidate_summary="Senior Full-Stack Engineer with 7+ years building React & Python web applications.",
        candidate_experience_titles=["Lead Software Engineer", "Full-Stack Developer"],
        job_skills_required=["React", "TypeScript", "Python", "FastAPI", "PostgreSQL", "Docker", "Tailwind CSS"],
        job_title=jobs[0].title,
        job_description=jobs[0].description
    )

    app_1 = Application(
        job_id=jobs[0].id,
        applicant_id=candidate_user.id,
        status="shortlisted",
        cover_letter="I have spent the past 5 years building scalable web applications with FastAPI and modern React. TechNova's vision for developer tooling resonates strongly with my experience optimizing developer workflows at Apex Cloud.",
        resume_snapshot=json.dumps({"title": alex_resume.title, "skills": json.loads(alex_resume.skills)}),
        match_score=score_1,
        match_reasons=json.dumps(breakdown_1),
        notes="Strong candidate with outstanding portfolio. Invited for 45-min system design round.",
        interview_date=datetime.datetime.utcnow() + datetime.timedelta(days=2)
    )

    # Application 2: Devon Vance for DevOps Job -> High Match!
    score_2, breakdown_2 = calculate_match_score(
        candidate_skills=["Docker", "Kubernetes", "AWS", "Terraform", "Python", "CI/CD"],
        candidate_summary="Specialized in Kubernetes orchestration, Terraform, and AWS architectures.",
        candidate_experience_titles=["DevOps Engineer"],
        job_skills_required=["Kubernetes", "AWS", "Terraform", "Docker", "CI/CD", "Linux", "Python"],
        job_title=jobs[1].title,
        job_description=jobs[1].description
    )

    app_2 = Application(
        job_id=jobs[1].id,
        applicant_id=candidate_2.id,
        status="interview_scheduled",
        cover_letter="Passionate about zero-downtime deployments and infrastructure automation. Eager to contribute to TechNova's AWS EKS clusters.",
        resume_snapshot=json.dumps({"title": devon_resume.title, "skills": json.loads(devon_resume.skills)}),
        match_score=score_2,
        match_reasons=json.dumps(breakdown_2),
        notes="Passed initial phone screen. Technical round scheduled for Thursday.",
        interview_date=datetime.datetime.utcnow() + datetime.timedelta(days=3)
    )

    # Application 3: Samira Patel for ML Job -> High Match!
    score_3, breakdown_3 = calculate_match_score(
        candidate_skills=["Python", "PyTorch", "FastAPI", "Docker", "PostgreSQL", "Vector Databases"],
        candidate_summary="Expert in LLM fine-tuning, RAG, PyTorch and FastAPI.",
        candidate_experience_titles=["Machine Learning Engineer"],
        job_skills_required=["Python", "PyTorch", "FastAPI", "Docker", "PostgreSQL", "Vector Databases"],
        job_title=jobs[2].title,
        job_description=jobs[2].description
    )

    app_3 = Application(
        job_id=jobs[2].id,
        applicant_id=candidate_3.id,
        status="under_review",
        cover_letter="My research and industry experience aligns directly with low-latency LLM inference pipelines.",
        resume_snapshot=json.dumps({"title": samira_resume.title, "skills": json.loads(samira_resume.skills)}),
        match_score=score_3,
        match_reasons=json.dumps(breakdown_3),
        notes="Reviewing published thesis and GitHub samples."
    )

    db.add_all([app_1, app_2, app_3])
    db.commit()

    print("✅ Realistic test data seeded successfully!")

