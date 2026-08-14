# Mô Hình Dữ Liệu (ERD) — Gia Phả Việt

Nguồn sự thật kiểu dữ liệu: [`lib/domain/types.ts`](../lib/domain/types.ts). Schema
Postgres tương ứng: [`supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql).

## 1. Sơ đồ thực thể

```
                    ┌────────────┐
                    │   clans    │  (dòng họ)
                    │  founder ──┼──► members.id
                    └─────┬──────┘
        ┌─────────────────┼──────────────────┬───────────────┐
        ▼                 ▼                  ▼               ▼
  ┌──────────┐     ┌────────────┐     ┌────────────┐   ┌───────────┐
  │ branches │     │  members   │     │memberships │   │  invites  │
  │ Chi/Phái │◄────┤ (thành viên)│     │ (vai trò)  │   │ (mã mời)  │
  │ parent ──┼─┐   └─────┬──────┘     └────────────┘   └───────────┘
  └──────────┘ │  ┌──────┴───────┐
   (tự tham    │  ▼              ▼
    chiếu)     │ ┌───────────┐ ┌─────────┐
               │ │parent_links│ │ unions  │
               │ │cha/mẹ→con  │ │hôn phối │
               │ └───────────┘ └─────────┘
               └► root_member ► members.id
```

- **Quan hệ là CẠNH:** `parent_links` (một dòng cho mỗi cha/mẹ→con) và `unions`
  (một dòng cho mỗi cặp; nhiều đời vợ/chồng = nhiều dòng). Không nhúng mảng lồng.
- **Đời (generation)** và **thứ tự sinh** là cột **cache** — nguồn sự thật là cạnh
  (tính bằng `lib/domain/ordering.ts`).
- **Bên nội/ngoại KHÔNG lưu** — tính khi cần (`lib/domain/kinship`).
- **Ngày** lưu `jsonb` theo `DualDate` (âm + dương + cờ `source` + `isLeapMonth`).

## 2. Bảng chính

| Bảng | Vai trò | Trường đáng chú ý |
|---|---|---|
| `clans` | Dòng họ | `founder_member_id`, `settings` (jsonb: region, timezoneOffset, remindLeadDays) |
| `branches` | Chi/Phái/Nhánh | `kind (phai/chi/nhanh/other)`, `parent_branch_id`, `root_member_id` |
| `members` | Thành viên | `full_name`, `ten_tu`, `ten_hieu`, `gender`, `is_alive`, `birth/death (jsonb)`, `resting_place`, `sibling_order`, `generation`, `search_name (generated, khử dấu)` |
| `parent_links` | Cạnh cha/mẹ→con | `role (father/mother/parent)`, `kind (biological/adopted/step/foster)`, `union_id` |
| `unions` | Hôn phối | `partner_a_id`, `partner_b_id`, `status`, `order`, `start_date/end_date (jsonb)` |
| `memberships` | Tài khoản↔dòng họ | `user_id`, `role (owner/editor/member)`, `linked_member_id` |
| `invites` | Mã mời | `code`, `role`, `max_uses`, `used_count`, `expires_at`, `revoked` |

## 3. Chỉ mục
- `members (clan_id)`, `(clan_id, generation)`, `(clan_id, branch_id)`.
- `members` **GIN `search_name gin_trgm_ops`** → tìm theo tên **khử dấu** nhanh.
- `parent_links (clan_id, parent_id)` và `(clan_id, child_id)`; `unions (clan_id, partner_*)`.

## 4. Bản local (IndexedDB)
Cùng mô hình, lưu trong object stores tương ứng (`giaphaviet` DB) — xem
[`lib/data/local/db.ts`](../lib/data/local/db.ts). `snapshot(clanId)` nạp cả dòng họ để
domain tính trong bộ nhớ.
