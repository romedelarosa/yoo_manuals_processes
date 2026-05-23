create or replace function public.can_claim_initial_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.user_system_roles usr
    join public.system_roles sr on sr.id = usr.system_role_id
    where sr.slug = 'super-admin'
  )
$$;

grant execute on function public.can_claim_initial_owner() to anon, authenticated;
