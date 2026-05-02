begin;

create table if not exists public.reward_points_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  action text not null,
  points int not null,
  meta jsonb,
  created_at timestamptz default now()
);

create table if not exists public.reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  provider text default 'vtpass',
  reward_type text default 'airtime',
  amount_ngn int not null,
  points_cost int not null,
  phone text,
  network text,
  status text default 'pending' check (status in ('pending','processing','success','failed','cancelled')),
  provider_ref text,
  provider_response jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_reward_points_user on public.reward_points_ledger(user_id, created_at desc);
create index if not exists idx_reward_redemptions_user on public.reward_redemptions(user_id, created_at desc);

alter table public.reward_points_ledger enable row level security;
alter table public.reward_redemptions enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='reward_points_ledger' and policyname='user_read_own') then
    create policy user_read_own on public.reward_points_ledger for select to authenticated using (auth.uid() = user_id);
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='reward_points_ledger' and policyname='user_insert_own') then
    drop policy user_insert_own on public.reward_points_ledger;
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='reward_redemptions' and policyname='user_read_own') then
    create policy user_read_own on public.reward_redemptions for select to authenticated using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='reward_redemptions' and policyname='user_insert_own') then
    create policy user_insert_own on public.reward_redemptions for insert to authenticated with check (auth.uid() = user_id);
  end if;
end $$;

commit;
