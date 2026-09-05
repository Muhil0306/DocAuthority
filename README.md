# DocAuthority - Authoritative Version Resolver

DocAuthority is a full-stack enterprise web application designed to solve knowledge fragmentation in consulting firms. When documents are spread across various systems, employees struggle to identify the "officially approved" current version.

DocAuthority resolves this by implementing a deterministic ranking algorithm that identifies authoritative documents based on approval status, ownership, recency, access permissions, and source citations.

## Features

- **Knowledge Search (Resolver):** Ask a question, and the engine evaluates all available document versions to return the single, authoritative, approved source.
- **Authority Scoring Algorithm:** Ranks versions based on:
  - **Approval (0-50 pts):** Approved > Pending > Draft.
  - **Ownership (0-25 pts):** Verified owners receive higher scores.
  - **Recency (0-25 pts):** Newer versions rank higher *only if* they meet approval criteria. An older *approved* version will outrank a newer *draft* version.
- **Role-Based Access Control:** Documents are automatically filtered based on the user's role (Consultant, Manager, HR, Finance, Administrator) *before* ranking.
- **Failure Edge-Case Testing:** A dedicated testing page to demonstrate the system handling conflicting approvals, unauthorized access, and draft vs. approved scenarios.
- **Rollback System:** Easily restore a previous document version to authoritative status, automatically archiving subsequent versions.
- **System Audit Log:** Full traceability of all resolver decisions, rollbacks, and access events.
- **Evaluation Dashboard:** Visual comparison of the DocAuthority algorithm against a naive "baseline" method.

## Architecture & Technology Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Lucide React icons, Recharts
- **Backend:** Python, FastAPI, SQLModel (SQLAlchemy + Pydantic)
- **Database:** SQLite (lightweight, local, requires no external setup)
- **API:** RESTful JSON API

## Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate
pip install -r requirements.txt
set PYTHONPATH=.
uvicorn main:app --reload
```
*Note: On first startup, the backend automatically creates `docauthority.db` and seeds it with ~100 realistic consulting documents to ensure the app works immediately.*

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

### 4. Access the Application
Open your browser and navigate to `http://localhost:5173`.

## Demo Scenario Walkthrough

1. **Dashboard:** View system statistics, charts, and system health.
2. **Role Switching:** Use the top-right dropdown to change your role (e.g., from Consultant to HR).
3. **Knowledge Search:**
   - Search for `Pricing Policy`.
   - The resolver correctly identifies **Version 1 (APPROVED)** as authoritative instead of the newer **Version 2 (DRAFT)**.
   - Observe the authority score breakdown and source citation.
4. **Access Control:**
   - Switch your role to `Consultant`.
   - Search for `Employee Disciplinary Procedure` (HR-only document).
   - The system blocks access.
5. **Failure Tests Page:** Click the "Run Test" buttons to see how the resolver handles programmatic edge cases.
6. **Rollback:** Navigate to the Rollback page to restore a previous document version and view the resulting Audit Log.

## Limitations
- **Local Prototype:** Uses SQLite and basic keyword matching for the initial document retrieval phase instead of a vector database/LLM, to ensure it runs efficiently on modest hardware without API keys. The core value—the *Authority Ranking Resolver*—is fully implemented and functional.
- **Mock Authentication:** Role switching is handled via React Context for easy demonstration purposes rather than a real JWT/OAuth flow.
