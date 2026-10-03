# Technical Documentation: Unit Testing Suite & Error Boundaries

## Overview
This document provides granular technical details on the automated **Backend Unit Testing Suite** and the **Frontend React Error Boundary Architecture** implemented in **DocAuthority**.

---

## 1. Backend Unit Testing Architecture (`pytest`)

DocAuthority utilizes `pytest` with an in-memory SQLite database (`sqlite:///:memory:`) to execute isolated, deterministic unit tests for the core resolver algorithm and security layers without mutating production database tables.

### A. Test Suite Structure
Location: `backend/tests/test_resolver.py`

| Test Case | Method | Description | Verification Criterion |
|---|---|---|---|
| **Older Approved vs. Newer Draft** | `test_older_approved_beats_newer_draft()` | Validates that an older `APPROVED` document version outranks a newer `DRAFT` document version. | Selected Version = v1 (Approved), Score = 90 vs Draft Score = 60 |
| **RBAC Security Access Enforcement** | `test_rbac_unauthorized_access_denied()` | Validates that users with unauthorized roles (e.g. `Consultant` attempting HR document) are blocked. | HTTP 403 status returned & `ACCESS_DENIED` entry created in `AuditLog`. |
| **Conflicting Approved Versions** | `test_conflicting_approved_versions_detection()` | Validates system conflict detection when multiple versions carry `APPROVED` status. | `has_conflict` flag set to `True`; tie-broken by update timestamp. |

### B. Executing Unit Tests
Run the automated test suite from the backend directory:
```bash
cd backend
python -m pytest
```

---

## 2. Frontend React Error Boundary Architecture

DocAuthority implements a class-based React **Error Boundary** (`ErrorBoundary.tsx`) to wrap the top-level application component tree (`App.tsx`).

### A. Core Architecture
- **Component:** `frontend/src/components/ErrorBoundary.tsx`
- **Wrapping Location:** `frontend/src/App.tsx`
- **Lifecycle Methods:**
  - `getDerivedStateFromError(error)`: Catches unhandled JavaScript rendering exceptions and sets `hasError: true`.
  - `componentDidCatch(error, errorInfo)`: Logs the full error object and React component stack trace for diagnostic tracking.

### B. User Experience & Fallback UI
When a JavaScript runtime error occurs in any child page (Dashboard, Search, Evaluation, etc.):
1. The Error Boundary intercepts the crash before the DOM unmounts.
2. Displays a clean, enterprise-styled fallback card with the error message and component stack.
3. Provides a single-click **"Reload Application"** button to reset state gracefully without white-screening the browser.
