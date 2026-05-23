create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (auth_user_id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (auth_user_id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name),
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.claim_initial_owner()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_uuid uuid;
  auth_email text;
  auth_name text;
  super_role_uuid uuid;
  content_role_uuid uuid;
  employee_system_role_uuid uuid;
  manager_employee_role_uuid uuid;
  general_employee_role_uuid uuid;
  business_row record;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to claim owner access.';
  end if;

  if exists (
    select 1
    from public.user_system_roles usr
    join public.system_roles sr on sr.id = usr.system_role_id
    where sr.slug = 'super-admin'
  ) then
    return false;
  end if;

  select id into profile_uuid
  from public.profiles
  where auth_user_id = auth.uid();

  if profile_uuid is null then
    select
      email,
      coalesce(raw_user_meta_data ->> 'full_name', split_part(email, '@', 1))
    into auth_email, auth_name
    from auth.users
    where id = auth.uid();

    insert into public.profiles (auth_user_id, email, full_name)
    values (auth.uid(), auth_email, auth_name)
    returning id into profile_uuid;
  end if;

  select id into super_role_uuid from public.system_roles where slug = 'super-admin';
  select id into content_role_uuid from public.system_roles where slug = 'content-admin';
  select id into employee_system_role_uuid from public.system_roles where slug = 'employee';
  select id into manager_employee_role_uuid from public.employee_roles where slug = 'manager';
  select id into general_employee_role_uuid from public.employee_roles where slug = 'general-staff';

  insert into public.user_system_roles (user_id, system_role_id)
  values
    (profile_uuid, super_role_uuid),
    (profile_uuid, content_role_uuid),
    (profile_uuid, employee_system_role_uuid)
  on conflict do nothing;

  for business_row in select id from public.businesses where is_active = true loop
    insert into public.user_businesses (user_id, business_id)
    values (profile_uuid, business_row.id)
    on conflict do nothing;

    insert into public.user_employee_roles (user_id, business_id, employee_role_id)
    values
      (profile_uuid, business_row.id, manager_employee_role_uuid),
      (profile_uuid, business_row.id, general_employee_role_uuid)
    on conflict do nothing;
  end loop;

  return true;
end;
$$;

grant execute on function public.claim_initial_owner() to authenticated;
