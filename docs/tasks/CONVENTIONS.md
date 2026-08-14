# CONVENTIONS — Quy ước dự án Gia Phả Việt

> Mọi task card **copy các mục liên quan** từ đây vào phần "Quy ước bắt buộc".
> Đây là nơi ngăn mỗi agent tự chế lại convention đã chốt. Khi có mâu thuẫn: **PRD > CONVENTIONS > thói quen cá nhân**.

## 1. Ngôn ngữ & công cụ
- **TypeScript strict** (`strict: true`, không `any` ngầm; ưu tiên kiểu tường minh cho API công khai).
- Lint/format: **ESLint + Prettier** (2 space, semicolons, single quotes, trailing comma). Không tự đổi cấu hình format.
- Node 20+, **npm** là package manager chuẩn của repo (đã có `package-lock.json`). Không thêm yarn/pnpm lockfile.
- UI: **Next.js App Router + React 18 + Tailwind CSS**. Component mặc định là Server Component; thêm `'use client'` khi cần state/effect/trình duyệt.

## 2. Cấu trúc & ranh giới (rất quan trọng)
- `lib/domain/**` = **thuần TypeScript, KHÔNG import React/Next/DOM**. Đây là lõi có test. Không đọc `window`, `localStorage`, `fetch` trong domain.
- `lib/data/**` = tầng truy cập dữ liệu. **UI chỉ gọi `getRepository()`** (từ `lib/data`), **không import trực tiếp** `localRepository`/`supabaseRepository`.
- `components/**`, `app/**` = UI. Không nhét business logic vào component — gọi sang `lib/domain`.
- **Chỉ sửa file nằm trong `touches` của card.** Nếu cần đụng file ngoài phạm vi → dừng, ghi chú vào card, không tự ý sửa (tránh xung đột khi chạy song song).

## 3. Quy ước dữ liệu (khớp `lib/domain/types.ts`)
- Quan hệ là **cạnh (edge)**: `ParentLink` (father/mother/parent + kind biological/adopted/step/foster), `Union` (hôn phối, nhiều dòng/người). **Không** nhét quan hệ thành mảng id lồng nhau.
- Ngày = **`DualDate`**: giữ cả `solar` và `lunar`, cờ `source` = loại người dùng nhập; loại kia **suy ra** bằng `lib/domain/lunar`.
- **Đời (generation) là computed** (tính từ thủy tổ), có thể cache vào `Member.generation` nhưng **không phải nguồn sự thật**.
- **Bên nội/ngoại KHÔNG lưu** trong DB — là thuộc tính của một *cặp*, do `lib/domain/kinship` tính.
- Múi giờ âm lịch cố định **tz = 7**.

## 4. Vai vế & i18n
- **Danh xưng vai vế do `lib/domain/kinship/terms.ts` TÍNH**, tuyệt đối **không** đặt trong file dịch i18n.
- Chuỗi giao diện tĩnh → đặt trong `lib/i18n/vi.ts`, truy cập qua `useT()`. Mặc định `vi`.
- Quy ước vùng miền lấy từ `Clan.settings.region` (`'bac' | 'trung' | 'nam'`), **mặc định `'trung'`**. Biến thể miền Trung: **O** (chị/em gái của cha), **cố** (đời +3), ba/mạ… Có **fallback** an toàn khi rule không xác định.

## 5. Kiểm thử
- **Vitest** cho `lib/domain/**` (golden tests). File test đặt cạnh mã hoặc trong `tests/`, tên `*.test.ts`.
- **Đặt tên test theo hành vi nghiệp vụ**, không theo tên hàm. VD: `"anh trai của bố (con trưởng) → Bác"`, không phải `"test relate() case 3"`.
- **Playwright** cho E2E luồng UI chính; spec trong `e2e/`. Bắt buộc nếu task tạo/đổi UI.
- Không commit khi test liên quan đỏ.

## 6. Scripts chuẩn (mọi card dùng đúng tên này)
```
npm run dev         # chạy dev
npm run build       # build production (static export)
npm run typecheck   # tsc --noEmit  → phải xanh
npm test            # vitest run
npm run e2e         # playwright test
npm run lint        # eslint
```

## 7. Vòng đời task card
- Khi bắt đầu: đặt `status: in_progress`, `owner: <agent>`, `started_at`.
- Khi xong: chạy đủ **Checklist đầu ra**; đặt `status: review`, điền `finished_at`; viết **3–5 dòng "Đã làm gì"** ở cuối card.
- Chỉ chuyển `done` sau khi được review/hợp nhất. `blocked` kèm 1 dòng lý do.
- **Không** sửa `touches`/`depends_on` của card khác.

## 8. Git & commit
- Nhánh phát triển: `claude/family-tree-app-svrhlz`.
- Commit nhỏ, theo task, thông điệp rõ ràng (tiếng Việt được), tiền tố `T-NN:` khi hợp lý. VD: `T-04: thêm module âm lịch Hồ Ngọc Đức + test`.
- Không commit secret/khóa; `.env*` không lên git (trừ `.env.example`).

## 9. Phụ thuộc mới
- Ưu tiên tối giản & nhẹ (ảnh hưởng bundle/$0). Cần thư viện mới → ghi lý do vào card. Đã chốt: `zustand`, `idb`, `d3-hierarchy`, `d3-zoom`, `@supabase/supabase-js` (chỉ nạp khi có env). **Không** thêm thư viện âm lịch từ npm (vendor thuật toán Hồ Ngọc Đức).
