-- ==========================================================================
-- Gia Phả Việt — Schema (Postgres / Supabase)
-- Phản chiếu lib/domain/types.ts: quan hệ dạng cạnh (parent_links, unions);
-- ngày lưu jsonb (DualDate); đời/thứ tự sinh là cột cache.
-- ==========================================================================

create extension if not exists unaccent;
create extension if not exists pg_trgm;
create extension if not exists pgcrypto;

-- unaccent bản IMMUTABLE để dùng trong cột generated + index.
create or replace function public.immutable_unaccent(text)
returns text language sql immutable parallel safe as $$
  select public.unaccent('public.unaccent', $1)
$$;

-- Dòng họ
create table if not exists public.clans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  founder_member_id uuid,                 -- FK thêm sau khi có members
  cover_image_url text,
  settings jsonb not null default '{"region":"trung","timezoneOffset":7,"remindLeadDays":7}',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Chi / Phái / Nhánh
create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  clan_id uuid not null references public.clans(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('phai','chi','nhanh','other')),
  parent_branch_id uuid references public.branches(id) on delete set null,
  root_member_id uuid,                    -- FK thêm sau
  note text
);

-- Thành viên
create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  clan_id uuid not null references public.clans(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  full_name text not null,
  family_name text,
  given_name text,
  ten_tu text,
  ten_hieu text,
  other_names text[],
  gender text not null default 'unknown' check (gender in ('male','female','other','unknown')),
  is_alive boolean not null default true,
  birth jsonb,                            -- DualDate
  death jsonb,                            -- DualDate
  resting_place text,
  photo_url text,
  biography text,
  achievements text,
  sibling_order int,
  generation int,
  note text,
  search_name text generated always as (lower(public.immutable_unaccent(coalesce(full_name, '')))) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Cạnh cha/mẹ → con
create table if not exists public.parent_links (
  id uuid primary key default gen_random_uuid(),
  clan_id uuid not null references public.clans(id) on delete cascade,
  parent_id uuid not null references public.members(id) on delete cascade,
  child_id uuid not null references public.members(id) on delete cascade,
  role text not null check (role in ('father','mother','parent')),
  kind text not null default 'biological' check (kind in ('biological','adopted','step','foster')),
  union_id uuid,
  unique (parent_id, child_id, role)
);

-- Hôn phối (nhiều đời vợ/chồng)
create table if not exists public.unions (
  id uuid primary key default gen_random_uuid(),
  clan_id uuid not null references public.clans(id) on delete cascade,
  partner_a_id uuid not null references public.members(id) on delete cascade,
  partner_b_id uuid not null references public.members(id) on delete cascade,
  status text not null default 'married' check (status in ('married','divorced','widowed','partner','unknown')),
  "order" int,
  start_date jsonb,
  end_date jsonb,
  note text
);

-- Thành viên tài khoản của dòng họ (vai trò)
create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  clan_id uuid not null references public.clans(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','editor','member')),
  linked_member_id uuid references public.members(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (clan_id, user_id)
);

-- Mã mời
create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  clan_id uuid not null references public.clans(id) on delete cascade,
  code text not null unique,
  role text not null default 'member' check (role in ('owner','editor','member')),
  max_uses int,
  used_count int not null default 0,
  expires_at timestamptz,
  revoked boolean not null default false,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

-- FK trễ (member được tham chiếu bởi clan/branch)
alter table public.clans
  add constraint clans_founder_fk foreign key (founder_member_id)
  references public.members(id) on delete set null;
alter table public.branches
  add constraint branches_root_fk foreign key (root_member_id)
  references public.members(id) on delete set null;

-- Chỉ mục cho các truy vấn nóng
create index if not exists idx_members_clan on public.members (clan_id);
create index if not exists idx_members_clan_gen on public.members (clan_id, generation);
create index if not exists idx_members_clan_branch on public.members (clan_id, branch_id);
create index if not exists idx_members_search on public.members using gin (search_name gin_trgm_ops);
create index if not exists idx_parentlinks_clan_parent on public.parent_links (clan_id, parent_id);
create index if not exists idx_parentlinks_clan_child on public.parent_links (clan_id, child_id);
create index if not exists idx_unions_clan_a on public.unions (clan_id, partner_a_id);
create index if not exists idx_unions_clan_b on public.unions (clan_id, partner_b_id);
create index if not exists idx_branches_clan on public.branches (clan_id);
create index if not exists idx_memberships_user on public.memberships (user_id);
