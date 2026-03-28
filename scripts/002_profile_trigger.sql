-- Auto-create profile row when a new auth user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'b2c')
  )
  on conflict (id) do nothing;

  -- If B2B user, also create distributor_profiles row
  if coalesce(new.raw_user_meta_data ->> 'role', 'b2c') = 'b2b' then
    insert into public.distributor_profiles (user_id, company_name, tier)
    values (
      new.id,
      coalesce(new.raw_user_meta_data ->> 'company_name', ''),
      coalesce((new.raw_user_meta_data ->> 'tier')::int, 1)
    )
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
