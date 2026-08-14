# Bảo Mật & Riêng Tư — Gia Phả Việt

Tham chiếu: [`supabase/migrations/0002_rls.sql`](../supabase/migrations/0002_rls.sql),
[`0003_rpc.sql`](../supabase/migrations/0003_rpc.sql).

## 1. Mô hình phân quyền
| Vai trò | Quyền |
|---|---|
| **Owner** (Chủ họ) | toàn quyền + quản trị vai trò + tạo/thu hồi mã mời |
| **Editor** (Trưởng chi) | thêm/sửa/xóa thành viên, quan hệ, chi/phái |
| **Member** | chỉ xem |

Bản **local-first** coi người dùng là Owner của dòng họ trên máy mình (không có nhiều
người dùng). Phân quyền thực thi khi bật **Supabase**.

## 2. Row Level Security (RLS)
- **Mặc định TỪ CHỐI:** bật RLS trên mọi bảng; không có policy = không truy cập.
- Đọc dữ liệu dòng họ ⇔ `is_clan_member(clan_id)`; ghi ⇔ `has_clan_role(clan_id,'editor')`;
  quản trị vai trò/mời ⇔ `has_clan_role(clan_id,'owner')`.
- Hai helper là `security definer` để **tránh đệ quy RLS** khi tự truy vấn `memberships`.
- **Cô lập tuyệt đối:** mọi policy gate theo `clan_id` → **dòng họ A không đọc được B**.
  Client không thể "khai" một `clan_id` mà mình không phải thành viên.

## 3. Mã mời (Invite) an toàn
- Tham gia một dòng họ **chỉ** qua RPC `redeem_invite(code)` (`security definer`):
  kiểm mã tồn tại / chưa thu hồi / chưa hết hạn / còn lượt → tạo `memberships` cho
  `auth.uid()` + tăng `used_count`.
- **Không** cho `insert` trực tiếp vào `memberships` (policy chỉ cho owner) → không thể
  tự ý chèn mình vào dòng họ khác.
- Tạo dòng họ → trigger `on_clan_created` tự gán người tạo làm **Owner**.

## 4. Truyền tải & khóa
- **HTTPS/TLS** mặc định (Supabase + hosting tĩnh).
- Client chỉ dùng **anon key** (công khai, an toàn nhờ RLS). **Không bao giờ** để lộ
  `service_role` key ở phía client.
- `.env*` không lên git (chỉ `.env.example`).

## 5. Sao lưu & khả chuyển (tránh phụ thuộc nền tảng)
- **Xuất JSON** toàn bộ dòng họ bất kỳ lúc nào ([`/xuat-nhap`](../app/xuat-nhap/page.tsx)) —
  người dùng tự giữ bản sao. Nhập lại có kiểm tra version + toàn vẹn quan hệ.
- Schema SQL kèm sẵn để tự dựng lại backend.

## 6. Quyền riêng tư dữ liệu
- Bản local: dữ liệu nằm trong **IndexedDB trên máy người dùng**, không rời thiết bị
  cho tới khi bật Supabase hoặc xuất file.
- Ảnh/tài liệu (khi bật Supabase Storage) nên đặt bucket riêng tư + policy theo dòng họ.
