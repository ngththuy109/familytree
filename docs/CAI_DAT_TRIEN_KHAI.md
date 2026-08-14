# Cài Đặt & Triển Khai — Gia Phả Việt

## 1. Chạy local (không cần đăng ký gì)
```bash
npm install
npm run dev          # http://localhost:3000 — tự có dòng họ demo (IndexedDB)
```
Kiểm thử:
```bash
npm run typecheck    # tsc --noEmit
npm test             # Vitest: âm lịch, vai vế, ngày giỗ, thứ tự đời, tầng dữ liệu…
npm run e2e          # Playwright (Chromium)
npm run build        # build tĩnh → thư mục out/
```

## 2. Bật Supabase (tùy chọn — cộng tác nhiều người)
1. Tạo project free tại https://supabase.com.
2. Áp migration (xem [`supabase/README.md`](../supabase/README.md)):
   `0001_init.sql` → `0002_rls.sql` → `0003_rpc.sql`.
3. Tạo `.env.local` từ [`.env.example`](../.env.example):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
   ```
4. Bật provider đăng nhập (Email/Google) trong Supabase Auth.
5. `npm run dev` lại → app tự dùng Supabase (đăng nhập, phân quyền, RLS).

> Kiến trúc `getRepository()` chọn backend theo env → **không đổi mã UI** khi chuyển
> local ↔ Supabase.

## 3. Deploy web tĩnh ($0)
App build ra **static export** (`out/`), host miễn phí:

**Vercel**
- Import repo → Framework: Next.js. Build: `next build`. Output tự nhận.
- (Tùy chọn) đặt biến môi trường `NEXT_PUBLIC_SUPABASE_*` trong Project Settings.

**Cloudflare Pages / GitHub Pages**
- Build command: `npm run build`; thư mục xuất: `out`.
- Đặt biến môi trường Supabase (nếu dùng) trong cấu hình build.

> PWA: sau khi deploy (production), service worker (`public/sw.js`) tự đăng ký; người
> dùng có thể **cài app** lên màn hình chính và mở offline app-shell.

## 4. Cấu trúc lệnh
| Lệnh | Mô tả |
|---|---|
| `npm run dev` | máy chủ phát triển |
| `npm run build` | build production (static export) |
| `npm run typecheck` | kiểm kiểu TypeScript |
| `npm test` | unit test (Vitest) |
| `npm run e2e` | test đầu-cuối (Playwright) |
| `npm run lint` | ESLint |

## 5. Gợi ý vận hành
- Sao lưu định kỳ bằng **Xuất JSON** (`/xuat-nhap`).
- Free-tier Supabase đủ cho vài ngàn thành viên; theo dõi dung lượng DB (500MB) & MAU.
