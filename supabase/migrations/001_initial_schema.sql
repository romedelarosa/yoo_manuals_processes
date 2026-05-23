create extension if not exists pgcrypto;

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  job_title text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.system_roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  permissions jsonb not null default '{}'
);

create table public.employee_roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text
);

create table public.user_businesses (
  user_id uuid not null references public.profiles(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, business_id)
);

create table public.user_system_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  system_role_id uuid not null references public.system_roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, system_role_id)
);

create table public.user_employee_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  employee_role_id uuid not null references public.employee_roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, business_id, employee_role_id)
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null,
  current_version text not null default '1.0.0',
  required boolean not null default true,
  acknowledgment_required boolean not null default true,
  is_active boolean not null default true,
  estimated_minutes integer not null default 10 check (estimated_minutes > 0),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.module_businesses (
  module_id uuid not null references public.modules(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  primary key (module_id, business_id)
);

create table public.module_roles (
  module_id uuid not null references public.modules(id) on delete cascade,
  employee_role_id uuid not null references public.employee_roles(id) on delete cascade,
  primary key (module_id, employee_role_id)
);

create table public.module_sections (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  content text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.module_attachments (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  description text,
  file_name text not null,
  file_type text not null check (file_type in ('image', 'pdf', 'document', 'spreadsheet')),
  mime_type text not null,
  storage_bucket text not null default 'module-attachments',
  storage_path text not null,
  file_size_bytes bigint not null check (file_size_bytes > 0),
  downloadable boolean not null default false,
  visible_to_employees boolean not null default true,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (storage_bucket, storage_path)
);

create table public.process_blueprints (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null unique references public.modules(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamptz not null default now()
);

create table public.process_steps (
  id uuid primary key default gen_random_uuid(),
  blueprint_id uuid not null references public.process_blueprints(id) on delete cascade,
  title text not null,
  description text not null,
  owner_role_id uuid references public.employee_roles(id),
  escalation text,
  sort_order integer not null default 0
);

create table public.process_step_connections (
  id uuid primary key default gen_random_uuid(),
  blueprint_id uuid not null references public.process_blueprints(id) on delete cascade,
  from_step_id uuid not null references public.process_steps(id) on delete cascade,
  to_step_id uuid not null references public.process_steps(id) on delete cascade,
  label text,
  constraint process_connection_unique unique (blueprint_id, from_step_id, to_step_id)
);

create table public.policy_versions (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  version text not null,
  change_notes text,
  published_by uuid references public.profiles(id),
  published_at timestamptz not null default now(),
  requires_reacknowledgment boolean not null default false,
  unique (module_id, version)
);

create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null unique references public.modules(id) on delete cascade,
  passing_score integer not null default 80 check (passing_score between 0 and 100),
  is_required boolean not null default true,
  access_enabled boolean not null default false,
  assessment_mode text not null default 'closed_reference' check (assessment_mode in ('closed_reference', 'open_reference')),
  time_limit_minutes integer not null default 10 check (time_limit_minutes > 0),
  randomize_questions boolean not null default true,
  max_attempts integer not null default 2 check (max_attempts > 0),
  unlock_requires_sections_read boolean not null default true
);

create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  module_section_id uuid references public.module_sections(id) on delete set null,
  question text not null,
  question_type text not null default 'single_choice',
  options jsonb not null default '[]',
  correct_answer jsonb not null,
  explanation text,
  difficulty text not null default 'easy' check (difficulty in ('easy', 'medium', 'hard')),
  topic_tag text,
  source text not null default 'manual' check (source in ('manual', 'ai_draft', 'ai_approved')),
  is_active boolean not null default true,
  sort_order integer not null default 0
);

create table public.quiz_generation_requests (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  requested_by uuid references public.profiles(id),
  status text not null default 'draft' check (status in ('draft', 'generated', 'reviewed', 'discarded')),
  prompt_notes text,
  generated_question_count integer not null default 0,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  score integer not null check (score between 0 and 100),
  passed boolean not null,
  answers jsonb not null default '{}',
  submitted_at timestamptz not null default now()
);

create table public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'in-progress', 'completed')),
  module_version text not null,
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, module_id, module_version)
);

create table public.acknowledgments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  module_version text not null,
  acknowledged_at timestamptz not null default now(),
  ip_address inet,
  unique (user_id, module_id, module_version)
);

create table public.admin_activity_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles(id),
  action text not null,
  target_type text,
  target_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index idx_profiles_auth_user_id on public.profiles(auth_user_id);
create index idx_user_businesses_business on public.user_businesses(business_id);
create index idx_user_employee_roles_business_role on public.user_employee_roles(business_id, employee_role_id);
create index idx_module_businesses_business on public.module_businesses(business_id);
create index idx_module_roles_role on public.module_roles(employee_role_id);
create index idx_module_attachments_module on public.module_attachments(module_id);
create index idx_progress_user on public.progress(user_id);
create index idx_acknowledgments_user on public.acknowledgments(user_id);

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.profiles where auth_user_id = auth.uid()
$$;

create or replace function public.has_system_role(role_slug text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_system_roles usr
    join public.system_roles sr on sr.id = usr.system_role_id
    where usr.user_id = public.current_profile_id()
      and sr.slug = role_slug
  )
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_system_role('super-admin')
    or public.has_system_role('business-admin')
    or public.has_system_role('content-admin')
$$;

create or replace function public.can_access_module(module_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1
      from public.module_businesses mb
      join public.user_businesses ub
        on ub.business_id = mb.business_id
      join public.module_roles mr
        on mr.module_id = mb.module_id
      join public.user_employee_roles uer
        on uer.user_id = ub.user_id
       and uer.business_id = ub.business_id
       and uer.employee_role_id = mr.employee_role_id
      where mb.module_id = module_uuid
        and ub.user_id = public.current_profile_id()
    )
$$;

alter table public.businesses enable row level security;
alter table public.profiles enable row level security;
alter table public.system_roles enable row level security;
alter table public.employee_roles enable row level security;
alter table public.user_businesses enable row level security;
alter table public.user_system_roles enable row level security;
alter table public.user_employee_roles enable row level security;
alter table public.modules enable row level security;
alter table public.module_businesses enable row level security;
alter table public.module_roles enable row level security;
alter table public.module_sections enable row level security;
alter table public.module_attachments enable row level security;
alter table public.process_blueprints enable row level security;
alter table public.process_steps enable row level security;
alter table public.process_step_connections enable row level security;
alter table public.policy_versions enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_generation_requests enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.progress enable row level security;
alter table public.acknowledgments enable row level security;
alter table public.admin_activity_logs enable row level security;

create policy "Authenticated users can view active businesses"
on public.businesses for select
to authenticated
using (is_active = true);

create policy "Admins can manage businesses"
on public.businesses for all
to authenticated
using (public.has_system_role('super-admin'))
with check (public.has_system_role('super-admin'));

create policy "Users can view own profile"
on public.profiles for select
to authenticated
using (id = public.current_profile_id() or public.is_admin());

create policy "Admins can manage profiles"
on public.profiles for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Authenticated users can view role definitions"
on public.system_roles for select
to authenticated
using (true);

create policy "Authenticated users can view employee role definitions"
on public.employee_roles for select
to authenticated
using (true);

create policy "Admins can manage role definitions"
on public.system_roles for all
to authenticated
using (public.has_system_role('super-admin'))
with check (public.has_system_role('super-admin'));

create policy "Admins can manage employee role definitions"
on public.employee_roles for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Users can view own business assignments"
on public.user_businesses for select
to authenticated
using (user_id = public.current_profile_id() or public.is_admin());

create policy "Admins can manage business assignments"
on public.user_businesses for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Users can view own system roles"
on public.user_system_roles for select
to authenticated
using (user_id = public.current_profile_id() or public.is_admin());

create policy "Super admins can manage system role assignments"
on public.user_system_roles for all
to authenticated
using (public.has_system_role('super-admin'))
with check (public.has_system_role('super-admin'));

create policy "Users can view own employee roles"
on public.user_employee_roles for select
to authenticated
using (user_id = public.current_profile_id() or public.is_admin());

create policy "Admins can manage employee role assignments"
on public.user_employee_roles for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Users can view assigned active modules"
on public.modules for select
to authenticated
using (is_active = true and public.can_access_module(id));

create policy "Content admins can manage modules"
on public.modules for all
to authenticated
using (public.has_system_role('super-admin') or public.has_system_role('content-admin'))
with check (public.has_system_role('super-admin') or public.has_system_role('content-admin'));

create policy "Users can view module scope when module is assigned"
on public.module_businesses for select
to authenticated
using (public.can_access_module(module_id));

create policy "Users can view module roles when module is assigned"
on public.module_roles for select
to authenticated
using (public.can_access_module(module_id));

create policy "Content admins can manage module scopes"
on public.module_businesses for all
to authenticated
using (public.has_system_role('super-admin') or public.has_system_role('content-admin'))
with check (public.has_system_role('super-admin') or public.has_system_role('content-admin'));

create policy "Content admins can manage module roles"
on public.module_roles for all
to authenticated
using (public.has_system_role('super-admin') or public.has_system_role('content-admin'))
with check (public.has_system_role('super-admin') or public.has_system_role('content-admin'));

create policy "Users can view assigned module sections"
on public.module_sections for select
to authenticated
using (public.can_access_module(module_id));

create policy "Content admins can manage module sections"
on public.module_sections for all
to authenticated
using (public.has_system_role('super-admin') or public.has_system_role('content-admin'))
with check (public.has_system_role('super-admin') or public.has_system_role('content-admin'));

create policy "Users can view assigned module attachments"
on public.module_attachments for select
to authenticated
using (
  visible_to_employees = true
  and public.can_access_module(module_id)
);

create policy "Content admins can manage module attachments"
on public.module_attachments for all
to authenticated
using (public.has_system_role('super-admin') or public.has_system_role('content-admin'))
with check (public.has_system_role('super-admin') or public.has_system_role('content-admin'));

create policy "Users can view assigned blueprints"
on public.process_blueprints for select
to authenticated
using (public.can_access_module(module_id));

create policy "Content admins can manage blueprints"
on public.process_blueprints for all
to authenticated
using (public.has_system_role('super-admin') or public.has_system_role('content-admin'))
with check (public.has_system_role('super-admin') or public.has_system_role('content-admin'));

create policy "Users can view assigned blueprint steps"
on public.process_steps for select
to authenticated
using (
  exists (
    select 1 from public.process_blueprints pb
    where pb.id = blueprint_id
      and public.can_access_module(pb.module_id)
  )
);

create policy "Users can view assigned blueprint connections"
on public.process_step_connections for select
to authenticated
using (
  exists (
    select 1 from public.process_blueprints pb
    where pb.id = blueprint_id
      and public.can_access_module(pb.module_id)
  )
);

create policy "Content admins can manage blueprint steps"
on public.process_steps for all
to authenticated
using (public.has_system_role('super-admin') or public.has_system_role('content-admin'))
with check (public.has_system_role('super-admin') or public.has_system_role('content-admin'));

create policy "Content admins can manage blueprint connections"
on public.process_step_connections for all
to authenticated
using (public.has_system_role('super-admin') or public.has_system_role('content-admin'))
with check (public.has_system_role('super-admin') or public.has_system_role('content-admin'));

create policy "Users can view assigned policy versions"
on public.policy_versions for select
to authenticated
using (public.can_access_module(module_id));

create policy "Content admins can manage policy versions"
on public.policy_versions for all
to authenticated
using (public.has_system_role('super-admin') or public.has_system_role('content-admin'))
with check (public.has_system_role('super-admin') or public.has_system_role('content-admin'));

create policy "Users can view assigned quizzes"
on public.quizzes for select
to authenticated
using (public.can_access_module(module_id));

create policy "Users can view assigned quiz questions"
on public.quiz_questions for select
to authenticated
using (
  (
    is_active = true
    and source in ('manual', 'ai_approved')
    and exists (
      select 1 from public.quizzes q
      where q.id = quiz_id
        and public.can_access_module(q.module_id)
    )
  )
  or public.is_admin()
);

create policy "Content admins can manage quizzes"
on public.quizzes for all
to authenticated
using (public.has_system_role('super-admin') or public.has_system_role('content-admin'))
with check (public.has_system_role('super-admin') or public.has_system_role('content-admin'));

create policy "Content admins can manage quiz questions"
on public.quiz_questions for all
to authenticated
using (public.has_system_role('super-admin') or public.has_system_role('content-admin'))
with check (public.has_system_role('super-admin') or public.has_system_role('content-admin'));

create policy "Content admins can manage quiz generation requests"
on public.quiz_generation_requests for all
to authenticated
using (public.has_system_role('super-admin') or public.has_system_role('content-admin'))
with check (public.has_system_role('super-admin') or public.has_system_role('content-admin'));

create policy "Users can create own quiz attempts"
on public.quiz_attempts for insert
to authenticated
with check (user_id = public.current_profile_id());

create policy "Users can view own quiz attempts"
on public.quiz_attempts for select
to authenticated
using (user_id = public.current_profile_id() or public.is_admin());

create policy "Users can manage own progress"
on public.progress for all
to authenticated
using (user_id = public.current_profile_id() or public.is_admin())
with check (user_id = public.current_profile_id() or public.is_admin());

create policy "Users can create own acknowledgments"
on public.acknowledgments for insert
to authenticated
with check (user_id = public.current_profile_id());

create policy "Users can view own acknowledgments"
on public.acknowledgments for select
to authenticated
using (user_id = public.current_profile_id() or public.is_admin());

create policy "Admins can view activity logs"
on public.admin_activity_logs for select
to authenticated
using (public.is_admin());

create policy "Admins can write activity logs"
on public.admin_activity_logs for insert
to authenticated
with check (public.is_admin());

insert into public.businesses (name, slug) values
  ('YOO Clinic', 'yoo-clinic'),
  ('ORI Wellness Center', 'ori-wellness')
on conflict do nothing;

insert into public.system_roles (name, slug, permissions) values
  ('Super Admin / Owner', 'super-admin', '{"all": true}'),
  ('Business Admin / Manager', 'business-admin', '{"manage_business": true}'),
  ('Content Admin', 'content-admin', '{"manage_content": true}'),
  ('Employee', 'employee', '{"complete_modules": true}')
on conflict do nothing;

insert into public.employee_roles (name, slug, description) values
  ('Front Desk / Admin Coordinator', 'front-desk', 'Bookings, reception, client check-in, and coordination.'),
  ('Nurse', 'nurse', 'Clinical preparation, patient safety, and treatment support.'),
  ('Therapist', 'therapist', 'Service execution, room readiness, and client care.'),
  ('Doctor / Medical Director', 'doctor', 'Clinical governance and treatment decisions.'),
  ('Sales / Client Relations', 'sales', 'Inquiries, client education, conversion, and follow-up.'),
  ('Manager / Supervisor', 'manager', 'Approvals, issue handling, coaching, and compliance review.'),
  ('General Staff', 'general-staff', 'Shared workplace rules and standards.')
on conflict do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'module-attachments',
  'module-attachments',
  false,
  10485760,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Users can read assigned module attachment files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'module-attachments'
  and exists (
    select 1
    from public.module_attachments ma
    where ma.storage_bucket = bucket_id
      and ma.storage_path = name
      and ma.visible_to_employees = true
      and public.can_access_module(ma.module_id)
  )
);

create policy "Content admins can upload module attachment files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'module-attachments'
  and (public.has_system_role('super-admin') or public.has_system_role('content-admin'))
);

create policy "Content admins can update module attachment files"
on storage.objects for update
to authenticated
using (
  bucket_id = 'module-attachments'
  and (public.has_system_role('super-admin') or public.has_system_role('content-admin'))
)
with check (
  bucket_id = 'module-attachments'
  and (public.has_system_role('super-admin') or public.has_system_role('content-admin'))
);

create policy "Content admins can delete module attachment files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'module-attachments'
  and (public.has_system_role('super-admin') or public.has_system_role('content-admin'))
);
