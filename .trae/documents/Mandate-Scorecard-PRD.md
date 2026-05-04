## 1. Product Overview
A people-powered mandate scorecard that tracks political promises and their completion.
It uses per-promise yes/no votes to produce transparent 0–100% completion scores, with strong anti-duplicate controls and an auditable history.

## 2. Core Features

### 2.1 User Roles
| Role | Registration Method | Core Permissions |
|------|---------------------|------------------|
| Visitor (Anon) | None | Browse scorecards, promises, evidence, and audit trail (read-only) |
| Contributor | Email magic link / OTP | Cast yes/no vote per promise, submit evidence links, view own activity |
| Maintainer | Allowlisted account | Create/edit mandates & promises, resolve duplicates, moderate evidence, trigger AI verification |

### 2.2 Feature Module
Our scorecard requirements consist of the following main pages:
1. **Home**: browse mandates, search, sort, quick score overview.
2. **Mandate Scorecard**: per-promise voting, overall completion, evidence list, audit trail, duplicate reporting.
3. **Sign in**: authenticate contributors/maintainers.

### 2.3 Page Details
| Page Name | Module Name | Feature description |
|---|---|---|
| Home | Mandate directory | List mandates with current completion %, last updated time, and status badges. |
| Home | Search & sort | Search by mandate/official/promise keyword; sort by completion, recency, popularity. |
| Mandate Scorecard | Completion scoring | Show overall 0–100% score computed as average of per-promise completion (yes/(yes+no)). |
| Mandate Scorecard | Promise list | Display promises with description, timeframe, per-promise completion %, vote counts, and “vote yes/no”. |
| Mandate Scorecard | Anti-duplicate voting | Enforce 1 vote per user per promise; allow user to change vote (records revision in audit). |
| Mandate Scorecard | Evidence submission | Add supporting links with required title/summary and URL canonicalization; block duplicates. |
| Mandate Scorecard | Duplicate controls | Report duplicate evidence; maintainers can merge/mark duplicates with reason logged. |
| Mandate Scorecard | Audit trail | Display append-only activity timeline (votes changed, evidence added/removed, merges, AI checks). |
| Mandate Scorecard | AI verification (secondary) | Show AI assessment of evidence as advisory (not authoritative), with model, timestamp, and confidence. |
| Sign in | Authentication | Email-based login; redirect back to prior page; show role-based access (maintainer tools hidden otherwise). |

## 3. Core Process
**Contributor Flow**: Browse a mandate → open scorecard → vote yes/no on one or more promises → optionally submit evidence → see updated per-promise and overall completion → review audit trail for transparency.

**Maintainer Flow**: Sign in → open scorecard → create/edit mandate/promise text as needed → review duplicate reports → merge/mark duplicates → optionally run AI verification on evidence → all actions recorded in audit trail.

```mermaid
graph TD
  A["Home"] --> B["Mandate Scorecard"]
  A --> C["Sign in"]
  C --> B
``