# Page Design — AI-Powered News Aggregation (Desktop-first)

## Global Styles (All Pages)
- Layout system: CSS Grid for page shells (header + main + optional sidebar); Flexbox inside components.
- Breakpoints: Desktop primary (≥1024px). Tablet collapses right sidebar under content. Mobile stacks sections.
- Design tokens:
  - Background: #0B1220 (app shell), Surface: #111B2E, Card: #0F172A
  - Text: #E5E7EB, Muted: #9CA3AF, Accent: #4F46E5, Success: #22C55E, Danger: #EF4444, Warning: #F59E0B
  - Typography: 14/16 base, H1 24, H2 18, mono for IDs/hashes
  - Buttons: primary solid accent; secondary outline; hover = +8% brightness; disabled = 50% opacity
  - Links: accent, underline on hover
- Shared components:
  - Top App Bar: product name, global search (if permitted), user menu, environment badge
  - Left Nav: Feed, Profiles, Moderation (role-gated), Admin (role-gated)
  - Toasts: success/error; inline validation messages

## 1) Login Page
- Meta:
  - Title: “Sign in — News Intelligence”
  - Description: “Secure access to aggregated, moderated coverage.”
- Page structure: Centered authentication card over subtle gradient background.
- Sections & components:
  - Brand header (logo + name)
  - Sign-in form (email, password) + optional “Use SSO” button
  - MFA step (conditional)
  - Support links: reset password, request access
- Interaction states: loading spinner on submit; clear error banners for invalid credentials.

## 2) News Feed Page (/feed)
- Meta:
  - Title: “News Feed”
  - Description: “Latest approved and pending coverage refreshed every 15 minutes.”
- Layout: 3-column desktop grid
  - Left: navigation
  - Center: feed list
  - Right: filters + selected item quick view
- Sections & components:
  - Feed header: “Last refresh time”, manual refresh button (rate-limited), status chips (Approved/Pending/Rejected)
  - Filters panel:
    - Date range, Source tier, Language, Profile/entity selector, Status
  - Feed list:
    - Item cards with title, source, time, matched profiles chips, duplicate count badge
    - Infinite scroll or paginated list
  - Item quick view:
    - AI summary, extracted entities list, duplicate cluster preview, original link
    - “Flag for moderation” (Analyst) or “Moderate” shortcut (Moderator)

## 3) Profile Briefing Page (/profiles/:id)
- Meta:
  - Title: “Profile Briefing”
  - Description: “Coverage and context for an official/profile.”
- Layout: 2-column desktop grid
  - Main: coverage timeline
  - Right: profile metadata + related entities
- Sections & components:
  - Profile header card: name, aliases, organization/country, last updated, watch toggle
  - Coverage timeline:
    - Group by day/week; show duplicate clusters collapsed by default
    - Sorting (newest/oldest) and filter by source tier/status
  - Related entities module:
    - Top co-mentioned entities/topics as clickable chips that re-filter timeline

## 4) Moderation Dashboard (/moderation)
- Meta:
  - Title: “Moderation”
  - Description: “Review entity matches, duplicates, and policy actions.”
- Layout: Dashboard grid with table + detail inspector
- Sections & components:
  - Queue table:
    - Columns: title, source, time, match confidence, duplicate cluster, status, flags
    - Bulk actions: approve/reject (requires reason)
  - Detail inspector:
    - Full summary + original link
    - Entity match editor (relink to profile, add/remove matches)
    - Dedupe tools (merge into cluster, split)
  - Audit preview: show last actions on item (read-only)
- Interaction states: confirmation modal for reject/takedown; optimistic UI with rollback on failure.

## 5) Admin Settings (/admin)
- Meta:
  - Title: “Admin Settings”
  - Description: “Manage sources, profiles, privacy, and users.”
- Layout: Tabs within admin page (Sources, Profiles, Privacy & Retention, Users & Roles, Audit)
- Sections & components:
  - Sources tab:
    - Source list table + add/edit drawer
    - Fields: name, base URL, ingest type, tier, active toggle
  - Profiles tab:
    - Profile editor with aliases management and matching hints
  - Privacy & retention tab:
    - Retention window selector, deletion request workflow notes, export restrictions toggles
  - Users & roles tab:
    - Invite user, assign role, deactivate, view role-change history
  - Audit tab:
    - Filterable log view (actor, action, target, timestamp); export restricted to admins