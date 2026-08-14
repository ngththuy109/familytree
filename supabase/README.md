# Supabase — Bật backend (Postgres + Auth + RLS)

Bản local-first chạy được ngay **không cần** Supabase. Khi muốn nhiều người cùng
quản lý một dòng họ (đăng nhập, phân quyền, cô lập dữ liệu), làm theo các bước sau.

## 1. Tạo project
- Tạo project miễn phí tại https://supabase.com (free-tier: 500MB DB, ~50k MAU).

## 2. Áp migration
Có 2 cách:

**A. Supabase CLI**
```bash
supabase link --project-ref <ref>
supabase db push        # áp toàn bộ supabase/migrations/*.sql theo thứ tự
```

**B. SQL Editor (thủ công)** — dán và chạy lần lượt:
1. `migrations/0001_init.sql` — schema (bảng + FK + index).
2. `migrations/0002_rls.sql` — helper + RLS + trigger owner.
3. `migrations/0003_rpc.sql` — RPC `redeem_invite`.

> Extension `unaccent`, `pg_trgm`, `pgcrypto` được bật tự động trong `0001_init.sql`.

## 3. Cấu hình app
Tạo `.env.local` ở gốc dự án (xem `.env.example`):
```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```
Khởi động lại `npm run dev` → app tự dùng Supabase thay cho local.
(Chi tiết Auth/mời/tham gia: xem code `lib/data/supabase/*` và `app/join/[code]`.)

## 4. Mô hình phân quyền
| Vai trò | Quyền |
|---|---|
| **Owner** (Chủ họ) | toàn quyền: sửa dữ liệu, quản trị vai trò, tạo/thu hồi mã mời |
| **Editor** (Trưởng chi) | thêm/sửa/xóa thành viên, quan hệ, chi/phái |
| **Member** | chỉ xem |

- **Cô lập tuyệt đối:** mọi policy gate theo `is_clan_member(clan_id)` → dòng họ A
  không đọc được dòng họ B.
- **Bootstrap:** tạo `clans` → trigger `on_clan_created` tự tạo membership Owner.
- **Tham gia:** chỉ qua RPC `redeem_invite(code)` (security definer) — không insert
  membership trực tiếp.

## 5. Checklist kiểm thử RLS (nên chạy sau khi áp)
Dùng 2 tài khoản (A, B) và 2 dòng họ:
1. **Đọc chéo bị chặn:** đăng nhập bằng A (chỉ ở dòng họ 1) → `select * from members`
   phải **không** trả bản ghi của dòng họ 2.
2. **Ghi theo vai trò:** user vai `member` `insert into members` → **bị từ chối**;
   vai `editor` → **thành công**.
3. **Quản trị:** chỉ `owner` mới `insert into memberships` / tạo `invites`.
4. **Redeem:** `select redeem_invite('<mã hợp lệ>')` → tạo membership; mã hết hạn/hết
   lượt/không tồn tại → báo lỗi tương ứng.

> Có thể kiểm nhanh trong SQL Editor bằng cách set `request.jwt.claim.sub` để giả lập
> `auth.uid()`, hoặc test từ client thật đã đăng nhập.
