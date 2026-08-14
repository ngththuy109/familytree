# Kiến Trúc Kỹ Thuật — Gia Phả Việt

> Tài liệu này mô tả kiến trúc tổng thể. Chi tiết mô hình dữ liệu xem
> [`MO_HINH_DU_LIEU.md`](./MO_HINH_DU_LIEU.md); bảo mật xem [`BAO_MAT.md`](./BAO_MAT.md).

## 1. Tổng quan
Ứng dụng **Next.js (App Router) + TypeScript**, đóng gói **PWA**, xuất **tĩnh**
(`output: 'export'`) để host miễn phí (Vercel/Cloudflare Pages). App **local-first**:
chạy ngay với dữ liệu demo trong IndexedDB; khi cấu hình Supabase (env) thì chuyển sang
Postgres + Auth + RLS mà **không đổi mã UI**.

```
┌─────────────────────────────────────────────┐
│                Client (PWA)                  │
│  app/ (App Router)   components/   lib/      │
│                                              │
│   UI  ──►  lib/domain (thuần TS, có test)    │
│    │           lunar · kinship · gio · order │
│    └────►  lib/data: getRepository()         │
│                 ├── local (IndexedDB)  ◄─ mặc định
│                 └── supabase (khi có env)     │
└───────────────────────┬─────────────────────┘
                        │ (chỉ khi bật)
                        ▼
        ┌─────────────────────────────────┐
        │           Supabase              │
        │  Auth · PostgreSQL · Storage    │
        │  Row Level Security (RLS)       │
        └─────────────────────────────────┘
```

## 2. Phân tầng
- **`lib/domain/`** — lõi nghiệp vụ **thuần TypeScript, không React/DOM**, có unit test:
  - `lunar/` chuyển đổi Âm↔Dương (Hồ Ngọc Đức, tz=7).
  - `kinship/` tính vai vế/xưng hô (LCA + nội/ngoại + trọng trưởng), mặc định miền Trung.
  - `gio/` tính ngày giỗ + cửa sổ nhắc 3–7 ngày.
  - `ordering.ts` thứ tự sinh + đánh số đời.
- **`lib/data/`** — trừu tượng truy cập dữ liệu:
  - `repository.ts` định nghĩa `DataRepository` (+ `snapshot(clanId)`).
  - `local/` hiện thực IndexedDB (`idb`) + seed demo.
  - `supabase/` hiện thực bằng `@supabase/supabase-js` (nạp khi có env).
  - `index.ts` `getRepository()` chọn hiện thực theo biến môi trường.
- **`app/` + `components/`** — UI (React). Chỉ gọi `getRepository()` và các module domain;
  **không** chứa business logic hay truy cập backend trực tiếp.
- **`lib/store/`** (Zustand) — state UI: dòng họ hiện tại, "tôi là ai", chế độ xem, chế
  độ người lớn tuổi, vùng miền.
- **`lib/i18n/`** — chuỗi giao diện tiếng Việt (danh xưng vai vế **không** ở đây — do code tính).

## 3. Nguyên tắc "trục snapshot"
Mỗi dòng họ (vài ngàn người) được **nạp một lần** qua `snapshot(clanId)` rồi mọi tính
toán (vai vế, cây, giỗ) chạy **trong bộ nhớ** bằng module domain. Giúp: hiệu năng ổn
định, cùng một lõi dùng chung cho cả Local lẫn Supabase, và dễ test.

## 4. Chiến lược "chạy ngay & $0"
- **Local-first:** không cần đăng ký; dữ liệu demo seed sẵn → xem cây/giỗ/vai vế tức thì.
- **Static export:** không cần server → host tĩnh miễn phí, CDN toàn cầu.
- **Supabase free-tier:** khi cần cộng tác nhiều người, bật bằng env; RLS đảm bảo cô lập.
- **PWA:** cài như app, chạy offline app-shell.

## 5. Đổi backend không đổi UI
Vì UI chỉ phụ thuộc **interface** `DataRepository`, việc chuyển Local ↔ Supabase chỉ là
đổi biến môi trường `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`. Đây là
điểm mấu chốt giúp phát triển nhanh (local) mà vẫn lên production an toàn (Supabase).

## 6. Kiểm thử
- **Vitest** cho `lib/domain/**` (golden tests: âm lịch, vai vế, ngày giỗ, thứ tự đời).
- **Playwright** cho luồng UI chính (danh sách, hồ sơ, xác định quan hệ, giỗ, cây).
- `npm run typecheck | test | e2e | build` — xem [`tasks/CONVENTIONS.md`](./tasks/CONVENTIONS.md) §6.

## 7. Công nghệ & lý do
| Thành phần | Chọn | Lý do |
|---|---|---|
| Framework | Next.js App Router + TS | 1 codebase Web + PWA; static-export $0 |
| UI | Tailwind CSS | mobile-first; dễ làm chế độ người lớn tuổi (font/tương phản) |
| State | Zustand (persist) | nhẹ, subscribe chọn lọc |
| Cây | d3-hierarchy + SVG + d3-zoom | nhẹ, kiểm soát bố cục cặp/nhánh, code-split |
| Local DB | IndexedDB (`idb`) | offline, dung lượng tốt, chạy ngay |
| Backend | Supabase (Postgres + Auth + RLS) | free-tier, bảo mật hàng, cô lập dòng họ |
| Âm lịch | Vendor Hồ Ngọc Đức | chuẩn VN, không phụ thuộc npm, dễ test |
