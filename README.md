# Company Manual and Onboarding System

Internal web app MVP for YOO Clinic and ORI Wellness Center. The app helps employees read assigned policies, complete checkpoints, sign acknowledgments, and view process blueprint flowcharts for operational workflows.

## Current implementation

- Next.js app router frontend
- Supabase-ready client helpers
- Supabase migration with tables, relationships, RLS helpers, and policies
- Seeded demo data for immediate product review
- Employee dashboard, module details, quiz flow, acknowledgment flow, and progress screen
- Admin dashboard, employee list, roles, modules, assignment map, module editor, and reports
- Service blueprint flowchart module for appointment handling
- Admin blueprint builder fields for drafting process steps, responsible roles, and escalation notes
- Closed-reference checkpoint settings for time limits, attempts, randomized questions, and lesson-read unlock behavior
- Admin checkpoint access toggle so quizzes can be closed or opened to employees by module
- Module attachments for inline visual guides and controlled document downloads
- Supabase Storage bucket and attachment metadata table for private, role-scoped files
- Manual quiz question bank with topic, difficulty, explanation, section mapping, and active/inactive controls
- AI-ready quiz schema for future admin-reviewed generated question drafts

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Supabase setup

Create `.env.local` from `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Run the migration in `supabase/migrations/001_initial_schema.sql` using the Supabase SQL editor or Supabase CLI.

## Important notes

The app currently uses demo data from `src/lib/mock-data.ts` so the MVP can be reviewed without live credentials. The next implementation step is replacing demo reads/writes with Supabase queries and server actions while keeping RLS as the source of truth.
