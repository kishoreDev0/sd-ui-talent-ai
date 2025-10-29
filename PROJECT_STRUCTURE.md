# AI-Powered Talent Acquisition Assistant - Project Structure

## Technology Stack

### Frontend

- **React 19** with TypeScript
- **Tailwind CSS 4** (already configured)
- **ShadCN UI** components
- **Framer Motion** for animations
- **React Query** for data fetching
- **Zustand** for state management
- **React Hook Form** + **Zod** for validation
- **Axios** for API calls

### Backend

- **FastAPI** (Python 3.11+)
- **SQLAlchemy** ORM with Alembic migrations
- **PostgreSQL** database
- **Redis** for caching and task queue
- **Celery** for async background tasks
- **Pydantic** for data validation

### AI & ML

- **Hugging Face Transformers** for NLP
- **OpenAI Whisper** for audio transcription
- **OpenAI GPT-4** or **Groq** for AI features
- **scikit-learn** for matching algorithms
- **spaCy** for NER and text processing

### Infrastructure

- **AWS S3** for file storage
- **boto3** for AWS integration
- **JWT** + **OAuth2** for authentication
- **Google Calendar API**
- **Microsoft Graph API**
- **LinkedIn API**
- **GitHub API**
- **Zoom API**

## Project Structure

```
talent-ai-platform/
├── frontend/                          # React + TypeScript app (existing)
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   │   ├── ui/                   # ShadCN UI base components
│   │   │   ├── candidate/            # Candidate-specific components
│   │   │   ├── job/                  # Job management components
│   │   │   ├── interview/            # Interview scheduling & audio analysis
│   │   │   ├── matching/             # AI matching visualization
│   │   │   ├── kanban/               # ATS pipeline board
│   │   │   └── analytics/            # Analytics widgets
│   │   ├── pages/                    # Route pages
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── services/                 # API services
│   │   ├── store/                    # State management
│   │   └── types/                    # TypeScript types
│   └── package.json
│
├── backend/                           # FastAPI backend (new)
│   ├── app/
│   │   ├── api/                      # API routes
│   │   │   ├── v1/
│   │   │   │   ├── candidates.py
│   │   │   │   ├── jobs.py
│   │   │   │   ├── interviews.py
│   │   │   │   ├── matching.py
│   │   │   │   ├── analytics.py
│   │   │   │   └── auth.py
│   │   │   └── dependencies.py
│   │   ├── core/                     # Core configuration
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── database.py
│   │   ├── models/                   # SQLAlchemy models
│   │   │   ├── candidate.py
│   │   │   ├── job.py
│   │   │   ├── interview.py
│   │   │   ├── match.py
│   │   │   └── user.py
│   │   ├── schemas/                  # Pydantic schemas
│   │   │   ├── candidate.py
│   │   │   ├── job.py
│   │   │   └── interview.py
│   │   ├── services/                 # Business logic
│   │   │   ├── parsing/
│   │   │   │   ├── resume_parser.py
│   │   │   │   └── email_parser.py
│   │   │   ├── ai/
│   │   │   │   ├── matching_engine.py
│   │   │   │   ├── interview_analyzer.py
│   │   │   │   └── chat_service.py
│   │   │   ├── enrichment/
│   │   │   │   ├── linkedin_enricher.py
│   │   │   │   └── github_enricher.py
│   │   │   ├── calendar/
│   │   │   │   └── scheduler.py
│   │   │   └── storage/
│   │   │       └── s3_service.py
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ui/               # ShadCN UI base components
│   │   │   │   ├── candidate/        # Candidate-specific components
│   │   │   │   ├── job/              # Job management components
│   │   │   │   ├── interview/        # Interview scheduling & audio analysis
│   │   │   │   ├── matching/         # AI matching visualization
│   │   │   │   ├── kanban/           # ATS pipeline board
│   │   │   │   └── analytics/        # Analytics widgets
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   └── types/
│   │   ├── tasks/                    # Celery tasks
│   │   │   ├── parsing_tasks.py
│   │   │   └── enrichment_tasks.py
│   │   └── main.py                   # FastAPI app entry
│   ├── alembic/                      # Database migrations
│   ├── tests/                        # Unit & integration tests
│   ├── requirements.txt
│   └── Dockerfile
│
├── chrome-extension/                  # LinkedIn/GitHub scraper (future)
│   ├── manifest.json
│   ├── content.js
│   └── background.js
│
├── docker-compose.yml                # Local dev environment
├── README.md
└── .gitignore
```

## Core Modules Implementation Plan

### Phase 1: Foundation (Week 1-2)

1. ✅ Frontend structure with role-based dashboards
2. 🔄 FastAPI backend setup with authentication
3. PostgreSQL schema design
4. Basic CRUD APIs for candidates and jobs

### Phase 2: Resume Parsing & Matching (Week 3-4)

1. Resume parsing service with AI
2. AI matching engine with explainable scores
3. Candidate enrichment pipeline
4. Frontend visualization for match scores

### Phase 3: Interview & Audio Analysis (Week 5-6) - **Core Differentiator**

1. Audio interview recording
2. Whisper transcription
3. Sentiment & emotion analysis
4. AI-powered interview summaries
5. Real-time scorecard during interviews

### Phase 4: Integrations & Automation (Week 7-8)

1. Calendar sync (Google/Microsoft)
2. Email automation workflows
3. LinkedIn/GitHub enrichment
4. Video interview integration (Zoom)

### Phase 5: ATS & Analytics (Week 9-10)

1. Kanban pipeline board
2. Analytics dashboards
3. Reporting system
4. Bulk operations

## Next Steps

I've already built the frontend foundation with:

- ✅ Role-based routing and dashboards
- ✅ Modern UI with Poppins/Inter fonts
- ✅ Rounded cards and soft shadows
- ✅ Candidate management with AI match display
- ✅ Job management interface
- ✅ Interview scheduling UI

Next, I'll build the FastAPI backend to power these features.
