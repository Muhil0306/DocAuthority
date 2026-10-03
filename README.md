# DocAuthority - Authoritative Version Resolver

DocAuthority is a full-stack enterprise web application designed to solve knowledge fragmentation in consulting firms. When corporate knowledge is spread across documents, chat channels, and meeting transcripts, employees struggle to identify the "officially approved" current version.

DocAuthority resolves this by implementing a deterministic ranking algorithm that identifies authoritative document versions based on approval status, ownership, recency, access permissions, and traceable source citations.

---

## 📚 Technical Documentation Quick Links
- **[UNIT_TESTING_AND_ERROR_BOUNDARIES.md](./UNIT_TESTING_AND_ERROR_BOUNDARIES.md):** Granular guide on backend `pytest` unit testing and React `ErrorBoundary` component architecture.
- **[HETEROGENEOUS_INPUT_MAPPING.md](./HETEROGENEOUS_INPUT_MAPPING.md):** Ingestion specifications for PDF documents, Slack/Teams chat logs, meeting transcripts, and emails.
- **[EVALUATION_DATASET_SPEC.md](./EVALUATION_DATASET_SPEC.md):** Benchmark dataset sample size (105 docs / 312 versions / 50 labeled queries) and accuracy metrics.

---

## 🗄️ Database Schema & Data Models

DocAuthority uses SQLite with SQLModel (SQLAlchemy ORM + Pydantic) containing 6 normalized entities:

### 1. `Document` Table
| Column | Type | Constraints / Description |
|---|---|---|
| `id` | Integer | Primary Key, Auto-Increment |
| `title` | String | Indexed document title |
| `department` | String | Target department (Finance, HR, Tech, Strategy, Operations, Risk) |
| `owner_id` | Integer | Foreign key reference to primary owner |
| `source_type` | String | Input channel (`PDF Document`, `Slack/Teams Chat Log`, `Meeting Transcript`, `Email Record`) |
| `created_at` | DateTime | Timestamp of initial document record creation |

### 2. `DocumentVersion` Table
| Column | Type | Constraints / Description |
|---|---|---|
| `id` | Integer | Primary Key, Auto-Increment |
| `document_id` | Integer | Foreign Key -> `document.id` |
| `version_num` | Integer | Chronological version number (1, 2, 3...) |
| `content` | Text | Full body content / raw transcript text |
| `owner` | String | Verified version owner name |
| `updated_at` | DateTime | Modification timestamp |
| `approval_status` | Enum | `APPROVED`, `PENDING`, `DRAFT`, `REJECTED`, `ARCHIVED` |
| `approved_by` | String | Name/Role of approving authority |
| `allowed_roles` | String | Comma-separated RBAC roles (`Consultant,Manager,HR,Finance,Administrator`) |
| `source_file` | String | Source filename / JSON log reference |
| `source_type` | String | Channel classification |
| `page_number` | Integer | Page or log sequence number |
| `section` | String | Section identifier / transcript timestamp |
| `is_archived` | Boolean | Archive flag (`True` / `False`) |
| `previous_version_id` | Integer | Optional Foreign Key -> `documentversion.id` |

### 3. `Approval` Table
| Column | Type | Description |
|---|---|---|
| `id` | Integer | Primary Key |
| `document_version_id` | Integer | Foreign Key -> `documentversion.id` |
| `submitted_by` | String | User submitting for review |
| `approved_by` | String | Reviewer name |
| `status` | Enum | Approval decision status |
| `date` | DateTime | Approval timestamp |

### 4. `AuditLog` Table
| Column | Type | Description |
|---|---|---|
| `id` | Integer | Primary Key |
| `user` | String | Role / Username executing action |
| `action` | String | Action type (`RESOLVE`, `ACCESS_DENIED`, `ROLLBACK`) |
| `document_id` | Integer | Associated document ID |
| `version_id` | Integer | Associated version ID |
| `result` | String | Result status (`SUCCESS`, `FAIL`) |
| `timestamp` | DateTime | Event timestamp |

---

## 🌐 REST API Endpoints Specification

Base URL: `http://localhost:8000/api`

| Method | Endpoint | Query / Body Params | Description | Sample Response |
|---|---|---|---|---|
| `GET` | `/api/documents` | None | Returns all documents cataloged | `[{"id": 1, "title": "Pricing Policy", "department": "Finance"}]` |
| `GET` | `/api/documents/{id}` | `id` (path) | Returns single document details | `{"id": 1, "title": "Pricing Policy"}` |
| `GET` | `/api/documents/{id}/versions` | `id` (path) | Returns version history for document | `[{"version_num": 1, "approval_status": "APPROVED"}]` |
| `GET` | `/api/search` | `q` (string), `role` (string) | Executes Authority Resolver ranking | `{"selected_version": {...}, "scores": {"total_score": 90}}` |
| `GET` | `/api/audit-logs` | None | Retrieves permanent audit trail | `[{"action": "RESOLVE", "result": "SUCCESS"}]` |
| `POST` | `/api/rollback` | `doc_id`, `target_version_id`, `role` | Restores older version to APPROVED | `{"message": "Rollback successful"}` |
| `GET` | `/api/evaluation` | None | Returns benchmark evaluation stats & specs | `{"metrics": {...}, "dataset_spec": {...}}` |

---

## 🧪 Unit Testing & Quality Assurance

DocAuthority includes automated backend unit tests powered by `pytest`.

```bash
cd backend
python -m pytest
```

Test suite coverage includes:
- **Authority Resolver Scoring:** Verifies that APPROVED v1 outranks DRAFT v2.
- **RBAC Security Access Control:** Verifies HTTP 403 access denial for unauthorized roles.
- **Conflict Handling:** Verifies conflict detection when multiple versions carry `APPROVED` status.

---

## 🚨 React Error Boundary Architecture

The frontend is wrapped with an enterprise React `ErrorBoundary` component (`frontend/src/components/ErrorBoundary.tsx`):
- Intercepts unhandled component tree JavaScript exceptions.
- Prevents white-screen browser crashes.
- Displays a diagnostic card with component stack traces and a single-click reset button.

---

## 🐳 Containerized Deployment (Docker)

```bash
docker-compose up --build
```
- **Frontend App:** `http://localhost:5173`
- **Backend API:** `http://localhost:8000`
