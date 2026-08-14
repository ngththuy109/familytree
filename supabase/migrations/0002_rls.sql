-- ==========================================================================
-- Row Level Security — cô lập theo dòng họ + phân quyền theo vai trò.
-- Mặc định TỪ CHỐI: bật RLS, không policy = không truy cập.
-- ==========================================================================

-- Helper (security definer) tránh đệ quy RLS trên memberships.
create or replace function public.is_clan_member(cid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists(
    select 1 from public.memberships m
    where m.clan_id = cid and m.user_id = auth.uid()
  );
$$;

create or replace function public.has_clan_role(cid uuid, min_role text)
returns boolean language sql security definer stable set search_path = public as $$
  select exists(
    select 1 from public.memberships m
    where m.clan_id = cid and m.user_id = auth.uid()
      and case min_role
        when 'member' then m.role in ('member','editor','owner')
        when 'editor' then m.role in ('editor','owner')
        when 'owner'  then m.role = 'owner'
        else false
      end
  );
$$;

-- Khi tạo dòng họ, người tạo tự động thành Owner (giải quyết bootstrap).
create or replace function public.on_clan_created()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.memberships(clan_id, user_id, role)
  values (new.id, new.created_by, 'owner')
  on conflict (clan_id, user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_clan_created on public.clans;
create trigger trg_clan_created
  after insert on public.clans
  for each row execute function public.on_clan_created();

-- Bật RLS
alter table public.clans        enable row level security;
alter table public.branches     enable row level security;
alter table public.members      enable row level security;
alter table public.parent_links enable row level security;
alter table public.unions       enable row level security;
alter table public.memberships  enable row level security;
alter table public.invites      enable row level security;

-- clans
drop policy if exists clans_select on public.clans;
drop policy if exists clans_insert on public.clans;
drop policy if exists clans_update on public.clans;
drop policy if exists clans_delete on public.clans;
create policy clans_select on public.clans for select using (public.is_clan_member(id));
create policy clans_insert on public.clans for insert with check (created_by = auth.uid());
create policy clans_update on public.clans for update using (public.has_clan_role(id, 'owner'))
  with check (public.has_clan_role(id, 'owner'));
create policy clans_delete on public.clans for delete using (public.has_clan_role(id, 'owner'));

-- Bảng gắn với dòng họ: đọc = thành viên, ghi = editor+
do $$
declare tbl text;
begin
  foreach tbl in array array['branches','members','parent_links','unions'] loop
    execute format('drop policy if exists %I on public.%I;', tbl || '_select', tbl);
    execute format('drop policy if exists %I on public.%I;', tbl || '_write', tbl);
    execute format(
      'create policy %I on public.%I for select using (public.is_clan_member(clan_id));',
      tbl || '_select', tbl);
    execute format(
      'create policy %I on public.%I for all using (public.has_clan_role(clan_id, ''editor'')) with check (public.has_clan_role(clan_id, ''editor''));',
      tbl || '_write', tbl);
  end loop;
end $$;

-- memberships: đọc bản ghi của mình hoặc owner của họ; quản trị = owner
drop policy if exists memberships_select on public.memberships;
drop policy if exists memberships_write on public.memberships;
create policy memberships_select on public.memberships for select
  using (user_id = auth.uid() or public.has_clan_role(clan_id, 'owner'));
create policy memberships_write on public.memberships for all
  using (public.has_clan_role(clan_id, 'owner'))
  with check (public.has_clan_role(clan_id, 'owner'));

-- invites: xem/tạo/sửa bởi owner (redeem đi qua RPC, không insert trực tiếp)
drop policy if exists invites_select on public.invites;
drop policy if exists invites_write on public.invites;
create policy invites_select on public.invites for select using (public.has_clan_role(clan_id, 'owner'));
create policy invites_write on public.invites for all
  using (public.has_clan_role(clan_id, 'owner'))
  with check (public.has_clan_role(clan_id, 'owner'));
