# Page Design Specification (Desktop-first)

## Global Styles
- Layout system: CSS Grid for page scaffolding + Flexbox for component alignment.
- Max width: 1200px content container; 24px gutters; 8px spacing scale.
- Typography: 14/16 base; headings 24/20/18; monospace for hashes/IDs.
- Colors: neutral background (#0b0f14 or #ffffff), surface cards, accent for completion (green) and warnings (amber), destructive (red).
- Buttons: primary (solid), secondary (outline), tertiary (text). Hover: +4% contrast, focus ring 2px.
- Links: underline on hover; external-link icon for evidence URLs.

## Page: Home
### Meta Information
- Title: “Mandate Scorecards”
- Description: “Track promise completion with public votes and evidence.”
- Open Graph: title/description + generic preview image.

### Page Structure
- Header (sticky) + main content grid (2 columns) + footer.

### Sections & Components
1. Header
   - Left: product name + short tagline.
   - Center: search input (mandate/official/promise keyword).
   - Right: “Sign in” or user menu.
2. Mandate list (main column)
   - Card per mandate: title, owner/term label, overall completion %, last updated.
   - Sort controls: completion, recency, most voted.
3. Filters (right column)
   - Chips/toggles for status (active/archived), and “has recent activity”.
4. Empty/loading states
   - Skeleton loading; empty result hint text.

Responsive notes
- <900px: filters collapse into a drawer; cards become single-column.

## Page: Mandate Scorecard
### Meta Information
- Title: “{Mandate Title} — Scorecard”
- Description: “Per-promise completion, evidence, and full audit trail.”
- Open Graph: include mandate title and completion %.

### Page Structure
- Top summary band + tabbed content: Promises / Evidence / Audit.

### Sections & Components
1. Summary band
   - Mandate title, owner/term, overall completion (0–100%), last updated.
   - Small “How scoring works” popover: average of per-promise yes rate.
2. Promise list (default tab)
   - Row per promise: title/description, per-promise % bar, yes/no counts.
   - Vote control: two-button toggle (Yes / No) with confirmation of change.
   - Inline note: “One vote per account; changes are logged.”
3. Evidence tab
   - Evidence table: title/summary, canonical URL, submitted by, date.
   - “Add evidence” drawer:
     - Fields: URL, short summary.
     - Client pre-check: show canonical preview; warn on duplicates.
   - AI verification badge (advisory): verdict + confidence + timestamp.
4. Audit tab
   - Timeline: vote cast/changed, evidence added/removed, duplicate merges.
   - Each item shows actor (or “System”), timestamp, and diff summary.
5. Maintainer tools (role-gated)
   - Duplicate resolution actions (merge/mark), promise edit shortcuts.
   - “Run AI verification” action per evidence.

Interaction states
- Voting: optimistic UI with rollback on conflict (duplicate/permission).
- Evidence submit: disable submit until canonicalization completes.

## Page: Sign in
### Meta Information
- Title: “Sign in”
- Description: “Authenticate to vote and submit evidence.”

### Page Structure
- Centered auth card.

### Sections & Components
1. Auth card
   - Email field + “Send magic link/OTP” button.
   - Help text: why sign-in is needed (anti-duplicate + auditability).
2. Post-auth routing
   - Return user to last visited mandate scorecard.
3. Error states
   - Invalid email, expired link/OTP, rate limit message.