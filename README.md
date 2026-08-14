# 🌳 Gia Phả Việt — Phần mềm Quản lý & Kết nối Gia phả

Ứng dụng **số hóa gia phả gia đình Việt Nam**: hiện đại, mobile-first, đúng nghiệp vụ
Việt (Âm lịch, ngày giỗ, vai vế xưng hô, chi/phái) và chi phí hạ tầng **$0** khi khởi chạy.

> Trạng thái: đang phát triển theo hệ thống **task card** — xem [`docs/tasks/README.md`](docs/tasks/README.md).

## ✨ Tính năng chính
- 🌲 **Cây gia phả** trực quan (thu/phóng trên điện thoại) + danh sách/thẻ theo đời & chi.
- 👤 **Hồ sơ thành viên** đầy đủ: họ tên, tên tự/hiệu, ngày sinh/mất **Âm + Dương lịch**,
  ảnh, tiểu sử, thành tựu, nơi an nghỉ, còn sống/đã mất.
- 🗓️ **Âm ↔ Dương lịch** tự động (thuật toán Hồ Ngọc Đức, múi giờ VN) + **nhắc ngày giỗ**
  trước 3–7 ngày.
- 👨‍👩‍👧 **Tự động tính vai vế / xưng hô** giữa 2 người bất kỳ (Bác, Chú, O, Cậu, Dì, Cố…),
  mặc định quy ước **miền Trung**.
- 🔎 **Tìm kiếm** theo tên (khử dấu), đời, chi, địa phương.
- ♿ **Chế độ người lớn tuổi** (chữ to, tương phản cao, tra cứu theo tên).
- 💾 **Xuất/nhập JSON** để tự sao lưu.
- 🔒 **Bảo mật**: local-first; khi bật Supabase có phân quyền Owner/Editor/Member + RLS
  cô lập dòng họ + mã mời.

## 🏗️ Công nghệ
Next.js (App Router) + TypeScript · Tailwind CSS · PWA · Zustand · d3-hierarchy/d3-zoom ·
IndexedDB (local-first) · Supabase (Postgres + Auth + RLS, tùy chọn) · Vitest + Playwright.

Chi tiết: [`docs/KIEN_TRUC.md`](docs/KIEN_TRUC.md).

## 🚀 Bắt đầu nhanh
```bash
npm install
npm run dev        # http://localhost:3000 — chạy ngay với dòng họ demo, KHÔNG cần đăng ký
```

Các lệnh khác:
```bash
npm run build      # build production (static export)
npm run typecheck  # kiểm kiểu (tsc --noEmit)
npm test           # unit test (Vitest) — âm lịch, vai vế, ngày giỗ, thứ tự đời
npm run e2e        # E2E (Playwright)
```

### Bật Supabase (tùy chọn, để cộng tác nhiều người)
1. Tạo project Supabase (free-tier), áp migration trong [`supabase/`](supabase/).
2. Tạo `.env.local` từ [`.env.example`](.env.example): điền `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Chạy lại — app tự dùng Supabase thay cho local. Xem [`docs/CAI_DAT_TRIEN_KHAI.md`](docs/CAI_DAT_TRIEN_KHAI.md).

## 📁 Cấu trúc thư mục
```
app/            # Next.js App Router (các màn hình)
components/     # UI (tree, member, date, gio, relationship, ui, layout)
lib/
  domain/       # lõi thuần TS có test: lunar, kinship, gio, ordering
  data/         # DataRepository + local (IndexedDB) + supabase
  store/        # Zustand
  i18n/         # chuỗi tiếng Việt
supabase/       # migrations SQL (schema + RLS + RPC)
docs/           # PRD, KIẾN TRÚC, MÔ HÌNH DỮ LIỆU, BẢO MẬT, TRIỂN KHAI, LỘ TRÌNH
  tasks/        # hệ thống task card (_TEMPLATE, CONVENTIONS, README board, T-01..T-18)
tests/          # unit test + fixtures
e2e/            # Playwright specs
```

## 📚 Tài liệu
- [PRD (yêu cầu sản phẩm)](docs/PRD.md) — nguồn sự thật, đánh số §.
- [Kiến trúc](docs/KIEN_TRUC.md) · [Mô hình dữ liệu](docs/MO_HINH_DU_LIEU.md) ·
  [Bảo mật](docs/BAO_MAT.md) · [Cài đặt & Triển khai](docs/CAI_DAT_TRIEN_KHAI.md) ·
  [Lộ trình](docs/LO_TRINH.md).
- [Hệ thống Task Card](docs/tasks/README.md) · [Quy ước](docs/tasks/CONVENTIONS.md).

## 🗺️ Lộ trình
- **Giai đoạn 1 (MVP+):** CRUD + quan hệ, cây + danh sách, Âm/Dương + giỗ, vai vế, tìm
  kiếm, xuất JSON, chế độ người lớn tuổi; bật Supabase + RLS.
- **Giai đoạn 2:** xuất PDF/ảnh chất lượng in, danh xưng thông gia đầy đủ, push/email
  nhắc giỗ, nâng cấp đồ họa cây. Chi tiết: [`docs/LO_TRINH.md`](docs/LO_TRINH.md).
