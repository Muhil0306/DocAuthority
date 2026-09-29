# Heterogeneous Input Ingestion & Mapping Architecture

## Overview
DocAuthority is designed to ingest and resolve knowledge across diverse, unstructured enterprise communication channels beyond standard PDF/Word documents—including **Slack/Teams Chat Logs**, **Meeting Transcripts (Teams/Zoom)**, and **Email Records**.

---

## 1. Heterogeneous Data Types & Ingestion Schema

Every input channel is ingested, normalized, and mapped into the unified `DocumentVersion` authority model:

| Input Channel | Ingestion Format | Owner Mapping | Timestamp Mapping | Citation Format |
|---|---|---|---|---|
| **PDF / Office Docs** | Structured PDF / DOCX | Designated Document Owner | File Modification Date | `[File.pdf, Page X, Sec Y]` |
| **Slack / Teams Chats** | JSON Export / Webhook API | Sender User ID & Channel | Message Timestamp | `[Slack #channel, Page 1, Sec Msg-ID]` |
| **Meeting Transcripts** | VTT / SRT Transcript Logs | Speaker ID & Meeting Chair | Transcript Timestamp | `[Meeting.vtt, Page X, Sec Timestamp]` |
| **Email Records** | EML / MSG Archive | Sender Email | Sent Date Header | `[Email.eml, Page 1, Sec Thread-ID]` |

---

## 2. Ingestion & Authority Normalization Pipeline

```
+-----------------------------------------------------------------------+
|                       Heterogeneous Input Ingestion                  |
+-----------------------------------------------------------------------+
|  PDF / Office Docs   |   Slack / Teams Chats   |  Meeting Transcripts |
+----------------------+-------------------------+----------------------+
                                  |
                                  v
+-----------------------------------------------------------------------+
|                       Normalization Layer                             |
|  - Extract Text Content & Metadata                                    |
|  - Map Owner to Departmental Directory                                |
|  - Assign Initial Approval Status (APPROVED / DRAFT / PENDING)        |
|  - Assign Allowed RBAC Roles (Consultant, Manager, HR, etc.)          |
+-----------------------------------------------------------------------+
                                  |
                                  v
+-----------------------------------------------------------------------+
|                     Authority Resolver Ranking                        |
|  - Stage 1: RBAC Access Control Filtering                             |
|  - Stage 2: Authority Scoring (Approval: 50 | Owner: 25 | Recency: 25) |
|  - Stage 3: Traceable Source Citation Generation                      |
+-----------------------------------------------------------------------+
```

---

## 3. Approval Workflow Mapping for Unstructured Content

- **Chat Logs:** Messages sent by departmental leads or explicitly marked as `#official-announcement` inherit `APPROVED` status; general discussions inherit `DRAFT` status.
- **Meeting Transcripts:** Key decisions in executive board transcripts inherit `APPROVED` status with board chairperson as `approved_by`.
- **Emails:** Broadcast emails from executive accounts are mapped to `APPROVED` policy updates.
