-- ==========================================================================
-- RPC redeem_invite — đường DUY NHẤT để người ngoài tham gia một dòng họ.
-- security definer: bỏ qua RLS để tạo membership sau khi kiểm mã hợp lệ.
-- ==========================================================================

create or replace function public.redeem_invite(p_code text)
returns public.memberships
language plpgsql security definer set search_path = public as $$
declare
  v_invite public.invites;
  v_membership public.memberships;
begin
  if auth.uid() is null then
    raise exception 'Cần đăng nhập để dùng mã mời';
  end if;

  select * into v_invite from public.invites where code = p_code for update;
  if not found then
    raise exception 'Mã mời không tồn tại';
  end if;
  if v_invite.revoked then
    raise exception 'Mã mời đã bị thu hồi';
  end if;
  if v_invite.expires_at is not null and v_invite.expires_at < now() then
    raise exception 'Mã mời đã hết hạn';
  end if;
  if v_invite.max_uses is not null and v_invite.used_count >= v_invite.max_uses then
    raise exception 'Mã mời đã hết lượt sử dụng';
  end if;

  insert into public.memberships(clan_id, user_id, role)
  values (v_invite.clan_id, auth.uid(), v_invite.role)
  on conflict (clan_id, user_id) do update set role = excluded.role
  returning * into v_membership;

  update public.invites set used_count = used_count + 1 where id = v_invite.id;

  return v_membership;
end;
$$;

grant execute on function public.redeem_invite(text) to authenticated;
