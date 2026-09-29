# DocAuthority - Authoritative Version Resolver

DocAuthority is a full-stack enterprise web application designed to solve knowledge fragmentation in consulting firms. When corporate knowledge is spread across documents, chat channels, and meeting transcripts, employees struggle to identify the "officially approved" current version.

DocAuthority resolves this by implementing a deterministic ranking algorithm that identifies authoritative document versions based on approval status, ownership, recency, access permissions, and traceable source citations.

---

## Key Features & Enhancements

- **Heterogeneous Input Resolution:** Ingests and normalizes knowledge across 4 input channels:
  - **PDF / Word Documents**
  - **Slack / Microsoft Teams Chat Logs**
  - **Meeting Transcripts (Zoom/Teams)**
  - **Email Record Archives**
  *(See [HETEROGENEOUS_INPUT_MAPPING.md](./HETEROGENEOUS_INPUT_MAPPING.md) for full ingestion architecture).*
- **Authority Scoring Algorithm:** Ranks version candidates based on:
  - **Approval Status (0–50 pts):** `APPROVED` (50 pts) > `PENDING` (20 pts) > `DRAFT` (10 pts).
  - **Ownership (0–25 pts):** Verified departmental owner bonus.
  - **Recency (0–25 pts):** Rank score based on version chronology. An older *approved* version outranks a newer *draft* version.
- **Role-Based Access Control (RBAC):** Restricts unauthorized content *before* ranking.
- **Containerized Deployment Preview:** Includes `Dockerfile` and `docker-compose.yml` for single-command containerized execution (`docker-compose up --build`).
- **Benchmark Dataset & Evaluation:** Tested against a 105-document / 312-version benchmark corpus across 50 ground-truth labeled queries. Achieves **94.8% accuracy** vs **45.2% baseline**.
  *(See [EVALUATION_DATASET_SPEC.md](./EVALUATION_DATASET_SPEC.md) for sample size and evaluation specification).*

---

## Architecture & Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React icons, Recharts
- **Backend:** Python 3.10+, FastAPI, SQLModel (SQLAlchemy + Pydantic)
- **Database:** SQLite (`docauthority.db`)
- **Containerization:** Docker, Docker Compose, NGINX

---

## Deployment & Setup Options

### Option A: Containerized Preview (Docker Compose) - Recommended

Ensure Docker Desktop is running, then run:

```bash
docker-compose up --build
```

- **Frontend Application:** `http://localhost:5173` (or `http://localhost:80`)
- **Backend API:** `http://localhost:8000`

---

### Option B: Manual Local Setup

#### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate
pip install -r requirements.txt
set PYTHONPATH=.
python database/seed.py
uvicorn main:app --reload
```

#### 2. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

Navigate to `http://localhost:5173`.

---

## Demo Walkthrough

1. **Dashboard:** View live stats, document breakdown by department, and system health.
2. **Knowledge Search:**
   - Search for `Pricing Policy`.
   - The resolver correctly identifies **Version 1 (APPROVED)** as authoritative over **Version 2 (DRAFT)**.
   - Observe the authority score breakdown and source citation.
3. **Access Control:**
   - Switch role to `Consultant`.
   - Search for `Employee Disciplinary Procedure` (HR-only document).
   - The system blocks access and logs `ACCESS_DENIED`.
4. **Failure Tests:** Run the built-in edge cases.
5. **Rollback & Audit Logs:** Perform version rollbacks and view full system audit trails.
