-- Persist full "My Projects" editor state without changing existing project schema.

create table if not exists public.my_project_data (
  project_id uuid primary key references public.projects (project_id) on delete cascade,
  owner_id uuid not null references public.users (user_id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_my_project_data_owner_id
  on public.my_project_data (owner_id);

comment on table public.my_project_data is
  'Full serialized data for each user project (folders, canvas elements, and metadata).';

alter table public.my_project_data enable row level security;

drop policy if exists "Read own my project data" on public.my_project_data;
create policy "Read own my project data"
  on public.my_project_data
  for select
  to authenticated
  using (owner_id = auth.uid());

drop policy if exists "Insert own my project data" on public.my_project_data;
create policy "Insert own my project data"
  on public.my_project_data
  for insert
  to authenticated
  with check (
    owner_id = auth.uid()
    and exists (
      select 1
      from public.projects p
      where p.project_id = my_project_data.project_id
        and p.owner_id = auth.uid()
    )
  );

drop policy if exists "Update own my project data" on public.my_project_data;
create policy "Update own my project data"
  on public.my_project_data
  for update
  to authenticated
  using (owner_id = auth.uid())
  with check (
    owner_id = auth.uid()
    and exists (
      select 1
      from public.projects p
      where p.project_id = my_project_data.project_id
        and p.owner_id = auth.uid()
    )
  );

drop policy if exists "Delete own my project data" on public.my_project_data;
create policy "Delete own my project data"
  on public.my_project_data
  for delete
  to authenticated
  using (owner_id = auth.uid());

grant select, insert, update, delete on table public.my_project_data to authenticated;
