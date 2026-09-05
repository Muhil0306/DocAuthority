# DocAuthority – Authoritative Version Resolver
## Project Review 1 Document & Presentation Script

---

### 1. PROJECT OVERVIEW
- **Project Title:** DocAuthority – Authoritative Version Resolver
- **Domain:** Full-Stack Enterprise Knowledge Base & Document Intelligence
- **GitHub Repository:** https://github.com/Muhil0306/DocAuthority
- **Local Application URL:** http://localhost:5173

---

### 2. PROBLEM STATEMENT
In consulting firms and large enterprises, corporate knowledge is fragmented across multiple documents, chat records, and emails. Employees frequently struggle to determine which document version is the **official, currently approved version**. 

- **Existing Problem:** 
  - Newer draft documents often get mistaken for approved policies.
  - Employees cite outdated or unauthorized files.
  - Traditional search engines only look for keywords or newest timestamps, ignoring approval workflows and access permissions.

---

### 3. PROPOSED SOLUTION
**DocAuthority** is an intelligent, deterministic version resolution platform. Instead of simply picking the newest file, it evaluates candidate documents using a multi-factor **Authority Resolver Algorithm**:

1. **Role-Based Access Control (RBAC):** Filters out unauthorized documents before ranking.
2. **Approval Status Scoring (50 Points Max):** Prioritizes APPROVED documents over DRAFT or PENDING versions.
3. **Ownership Scoring (25 Points Max):** Verifies departmental ownership.
4. **Recency Scoring (25 Points Max):** Ranks newer versions higher *only if* approval criteria are satisfied.
5. **Traceable Citations:** Generates exact source citations (file name, page number, section).

---

### 4. TECHNICAL ARCHITECTURE & STACK

| Layer | Technologies Used |
|---|---|
| **Frontend** | React, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons |
| **Backend** | Python, FastAPI, SQLModel (SQLAlchemy + Pydantic) |
| **Database** | SQLite (`docauthority.db`) |
| **Ranking Engine** | Deterministic Multi-Factor Authority Resolver |

---

### 5. SYSTEM MODULES BUILT & COMPLETED

1. **Executive Dashboard:** Tracks total documents, versions, approved vs draft counts, and resolver accuracy.
2. **Knowledge Search (Resolver Engine):** Allows users to search policies and returns authoritative answers with scoring breakdowns.
3. **Role-Based Access Control (RBAC):** Real-time role switching (Consultant, Manager, HR, Finance, Admin) affecting search results.
4. **Document Repository & History Timeline:** Displays complete document versions, timelines, and metadata.
5. **Failure & Edge-Case Testing:** Built-in test suite for edge cases (older approved vs newer draft, unauthorized access, conflicting approvals).
6. **Version Rollback & Audit Logs:** Allows single-click rollback of authoritative versions with full action logging.
7. **System Evaluation:** Empirical benchmark comparing Baseline (newest version strategy) vs DocAuthority (~95% accuracy vs ~45%).

---

### 6. SAMPLE REVIEW 1 Q&A FOR FACULTY

**Q1: How does your system handle a scenario where a draft version is newer than an approved version?**
> *Answer:* The Authority Resolver assigns 50 points to APPROVED status and only 10 points to DRAFT. Even if the draft gets maximum recency points (25), the older approved version scores higher (50 approval + 15 recency = 65 vs 10 approval + 25 recency = 35), ensuring the approved version is selected.

**Q2: What is the benefit of your system over standard keyword search?**
> *Answer:* Standard search selects files based only on text match or latest date, which leads to retrieving unapproved or restricted drafts. DocAuthority incorporates approval state, ownership verification, and security role filtering into the ranking logic.

---

### 7. DEMO SCENARIO FOR REVIEW 1
1. **Show Dashboard:** Display KPIs and accuracy metrics.
2. **Search Scenario:** Search `"Pricing Policy"` to show **Version 1 (APPROVED)** winning over **Version 2 (DRAFT)**.
3. **Access Control:** Switch role to **Consultant** and search `"Employee Disciplinary Procedure"` to show **Access Denied**.
4. **Failure Tests:** Execute the 3 built-in edge-case tests.
