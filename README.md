# AI-Powered Talent Acquisition Platform

A modern, investor-worthy SaaS platform for talent acquisition and hiring with AI-powered candidate matching and real-time interview analysis.

## ✨ Features

### 🎯 Core Functionality

- **Role-Based Dashboards**: Admin, Hiring Manager, Interviewer, and TA Team views
- **Resume Upload & AI Parsing**: Drag-and-drop with automatic data extraction
- **Job Description Management**: AI-powered skill auto-tagging
- **AI Candidate Matching**: Transparent match scores (0-100) with detailed breakdowns
- **ATS Pipeline**: Kanban board for candidate tracking through hiring stages
- **Interview Scheduling**: Audio recording with real-time AI analysis
- **Analytics Dashboard**: Hiring metrics and performance tracking

### 🤖 AI Features

- **Smart Resume Parsing**: Extract skills, experience, and education automatically
- **Intelligent Matching**: Score candidates based on skills, experience, and fit
- **Live Interview Analysis**: Real-time sentiment, engagement, and transcription
- **Auto Skill Tagging**: Generate required skills from job descriptions

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
src/
├── components/
│   ├── candidate/         # Resume upload & parsing
│   ├── job/              # Job description editor
│   ├── matching/         # AI match scoring
│   ├── kanban/           # ATS pipeline board
│   ├── interview/        # Interview scheduler & audio
│   ├── analytics/        # Dashboard metrics
│   └── layout/           # Sidebar & main layout
├── pages/
│   ├── dashboard/        # Role-specific dashboards
│   ├── jobs/
│   ├── candidates/
│   ├── interviews.tsx
│   ├── analytics.tsx
│   └── settings.tsx
└── types/                # TypeScript interfaces
```

## 🎨 Design System

- **Typography**: Poppins for headings, Inter for body
- **Colors**: Modern gradient blues, greens, purples
- **Components**: Rounded cards with soft shadows
- **Animations**: Framer Motion for smooth transitions

## 📱 Pages

1. **Dashboard** (`/dashboard`): Role-based overview with KPIs
2. **Jobs** (`/jobs`): Create and manage job postings
3. **Candidates** (`/candidates`): View applicants with AI match scores
4. **Interviews** (`/interviews`): Schedule and conduct interviews
5. **Analytics** (`/analytics`): Track hiring metrics
6. **Users** (`/users`): Manage team members (Admin only)
7. **Settings** (`/settings`): Platform configuration

## 🔑 Key Components

### Match Score Card

Displays AI-generated match scores with:

- Visual score (0-100)
- Matched vs missing skills
- Role fit categorization
- Gap analysis

### Interview Scheduler

Features:

- Calendar integration
- Audio recording
- Real-time AI analysis (sentiment, engagement)
- Live transcription
- Google Meet integration

### ATS Pipeline

Kanban board with:

- 5 hiring stages
- Drag-and-drop functionality
- Visual progress tracking
- Stage-specific actions

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router v7
- **State**: Redux Toolkit

## 🎯 Demo-Ready Features

This is a **fully functional frontend MVP** ready for:

- Investor presentations
- User testing
- Backend integration
- Production deployment (with API)

## 📄 Documentation

- [Frontend Features Guide](./FRONTEND_FEATURES.md) - Detailed feature list
- [Project Structure](./PROJECT_STRUCTURE.md) - Architecture overview

## 🚧 Next Steps

To make this production-ready:

1. Connect to FastAPI backend API
2. Integrate real resume parsing
3. Implement actual AI matching
4. Add authentication flow
5. Deploy to cloud

## 📸 Screenshots

The platform features:

- Modern, clean UI design
- Gradient buttons and cards
- Smooth animations
- Responsive layouts
- Professional color scheme

---

Built with ❤️ for modern talent acquisition teams
