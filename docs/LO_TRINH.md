# Lộ Trình — Gia Phả Việt

## ✅ Giai đoạn 1 (MVP+) — ĐÃ LÀM
- Kiến trúc local-first + sẵn sàng Supabase (một interface `DataRepository`).
- **Âm lịch** (Hồ Ngọc Đức) + chuyển đổi Âm↔Dương + can-chi.
- **Ngày giỗ** từ ngày mất Âm lịch + nhắc 3–7 ngày (dashboard `/gio`).
- **Vai vế/xưng hô** tự động (LCA + nội/ngoại + trọng trưởng), mặc định **miền Trung**
  (O, Cố…), có "Xác định quan hệ" giữa 2 người bất kỳ.
- **CRUD** thành viên + quan hệ (cha–mẹ–con, nhiều đời vợ/chồng, con nuôi, con trưởng/thứ),
  quản lý **Chi/Phái**, nhập ngày Âm/Dương (`DualDateInput`).
- **Cây gia phả** đồ họa (d3 + SVG + zoom, code-split) + **Danh sách/Thẻ** theo đời.
- **Tìm kiếm** khử dấu + lọc đời/chi.
- **Chế độ người lớn tuổi** (chữ to, tương phản cao) + i18n tiếng Việt.
- **Xuất/Nhập JSON** (sao lưu).
- **Supabase**: schema + RLS + RPC mã mời; đăng nhập (Email/Google) + tham gia bằng mã mời.
- **PWA** cài đặt được + offline app-shell; **unit test** phủ lõi nghiệp vụ.

## 🔜 Giai đoạn 2 — TIẾP THEO
- **Xuất PDF/ảnh** cây gia phả chất lượng in.
- **Danh xưng thông gia đầy đủ** theo vùng (dâu/rể/dượng/mợ/thím… mọi trường hợp).
- **Thông báo đẩy (push) & email** nhắc giỗ tự động (Edge Function/cron).
- **Nâng cấp đồ họa cây**: React Flow / union-node cho hôn phối phức tạp, chỉnh kéo-thả.
- **Ảnh đại diện & tài liệu** qua Supabase Storage/Cloudflare R2 (bucket riêng tư).
- **Quản trị chi/phái sâu**: phân quyền theo chi, nhật ký thay đổi.
- **Đa ngôn ngữ** (thêm English) trên nền i18n sẵn có.

## 💡 Ý tưởng xa hơn
- Nhập gia phả từ **GEDCOM**; gợi ý trùng lặp; dòng thời gian sự kiện; bản đồ nơi an nghỉ.
