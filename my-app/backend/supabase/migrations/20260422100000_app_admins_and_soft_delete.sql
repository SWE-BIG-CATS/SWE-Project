-- App moderators: user IDs in public.app_admins can soft-delete any post.
-- To promote a user, run (with their auth.users / public.users id):
--   insert into public.app_admins (user_id) values ('<uuid>');

create table if not exists public.app_admins (
  user_id uuid not null
    references public.users (user_id) on delete cascade,
  primary key (user_id)
);

comment on table public.app_admins is
  'Moderation: listed users may delete any post via soft_delete_post. Add/remove rows in SQL (service role) only.';

alter table public.app_admins enable row level security;

-- Only service role (and table owner) can read/write; clients use is_app_admin() / soft_delete_post only.
create or replace function public.is_app_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.app_admins a
    where a.user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_app_admin() from public;
grant execute on function public.is_app_admin() to authenticated;

-- Allow moderators to soft-delete posts they do not own.
create or replace function public.soft_delete_post(p_post_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count integer := 0;
  is_owner boolean;
  can_delete boolean;
begin
  is_owner := coalesce(
    (select p.creator_id = auth.uid() from public.posts p where p.post_id = p_post_id),
    false
  );
  can_delete := is_owner or public.is_app_admin();

  if not can_delete then
    return false;
  end if;

  update public.posts
  set deleted_at = timezone('utc', now())
  where post_id = p_post_id
    and deleted_at is null;

  get diagnostics updated_count = row_count;
  return updated_count = 1;
end;
$$;

revoke all on function public.soft_delete_post(uuid) from public;
grant execute on function public.soft_delete_post(uuid) to authenticated;
