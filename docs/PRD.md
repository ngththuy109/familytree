# TÀI LIỆU YÊU CẦU SẢN PHẨM (PRD)
## Phần Mềm Quản Lý & Kết Nối Gia Phả — "Gia Phả Việt"

> Phiên bản: 1.0 · Ngôn ngữ sản phẩm: Tiếng Việt · Nền tảng: Web/PWA (mobile-first)
> Tài liệu này là **nguồn sự thật (source of truth)**. Mỗi task card trỏ tới các mục `§` ở đây qua trường `prd_refs`.

---

## §1. Tổng Quan Dự Án & Mục Tiêu

### §1.1. Bối cảnh & Tầm nhìn
Gia phả truyền thống Việt Nam thường được ghi trên sách giấy, dễ thất lạc, khó tra cứu và khó tiếp cận với thế hệ trẻ. Nhiều ứng dụng gia phả hiện nay giao diện rườm rà, phức tạp hoặc không đúng đặc thù văn hóa gia đình Việt (ngày giỗ Âm lịch, phân cấp chi/phái, vai vế xưng hô).

Sản phẩm hướng tới **số hóa gia phả gia đình** thành nền tảng hiện đại, dễ thao tác trên mọi thiết bị (Web & Mobile/PWA), giúp kết nối các thế hệ, giữ gìn truyền thống và bảo mật dữ liệu với chi phí hạ tầng tối ưu (**$0 khi khởi chạy**).

### §1.2. Mục tiêu cốt lõi
- **Đơn giản hóa trải nghiệm:** người lớn tuổi cũng dễ dàng xem cây gia phả; người quản trị dễ nhập liệu.
- **Đúng nghiệp vụ Việt Nam:** hỗ trợ lịch Âm/Dương, tính vai vế xưng hô, nhắc ngày giỗ, phân chi/ngành.
- **Hạ tầng $0 & An toàn:** dùng nền tảng free-tier hiện đại, mã hóa dữ liệu và phân quyền chặt chẽ.

### §1.3. Chỉ số thành công (mục tiêu định hướng)
- Người dùng mới xem được cây gia phả demo trong < 30 giây, không cần đăng ký.
- Tra cứu vai vế giữa 2 người bất kỳ cho ra kết quả trong < 1 giây.
- Chi phí hạ tầng = $0 cho tới vài ngàn thành viên.

---

## §2. Người Dùng Mục Tiêu (User Personas)

1. **Trưởng họ / Người quản trị (Owner/Editor):** thu thập thông tin, cập nhật sự kiện, cây gia phả. Cần công cụ nhập liệu nhanh, rõ ràng, không lỗi logic thế hệ.
2. **Con cháu / Thành viên (Member/Viewer):** tra cứu nhanh vai vế (phải gọi bằng gì), xem ngày giỗ, tìm thông tin người trong họ, xem cây trực quan trên điện thoại.

---

## §3. Tính Năng Sản Phẩm & Nghiệp Vụ Cốt Lõi

### §3.1. Quản lý Cây Gia Phả (Visual Family Tree)
- **Hiển thị linh hoạt:**
  - Dạng cây phân nhánh (Tree View): thu phóng (Zoom/Pan) mượt trên điện thoại.
  - Dạng danh sách/thẻ theo thế hệ (List/Card View): xem nhanh trên màn hình nhỏ.
- **Nghiệp vụ quan hệ:**
  - Quan hệ chính: Cha – Mẹ – Con; Vợ – Chồng (chấp nhận nhiều đời vợ/chồng); Con nuôi; Con trưởng/Con thứ.
  - Tự động sắp xếp theo thứ tự sinh và thế hệ (Đời thứ 1, 2, …).
  - Tự động tính vai vế & danh xưng (Cụ, Ông, Bà, Bác, Chú, Cô/O, Cậu, Dì, …) dựa trên cây quan hệ.

### §3.2. Quản lý Thông tin Thành viên (Profile Management)
- **Thông tin cá nhân:** họ tên, tên tự, tên hiệu, ngày sinh/ngày mất (đầy đủ Âm & Dương lịch), ảnh đại diện, tiểu sử, thành tựu, nơi an nghỉ.
- **Trạng thái:** Còn sống / Đã mất.
- **Lịch & Ngày Giỗ:**
  - Chuyển đổi tự động giữa Âm lịch và Dương lịch (múi giờ Việt Nam, UTC+7).
  - Nhắc lịch giỗ sắp tới qua Notification/Email trước **3–7 ngày** (tính từ **ngày mất Âm lịch**).

### §3.3. Tìm kiếm & Tra cứu Thông minh
- Tra cứu theo tên, đời, nhánh/chi, địa phương (hỗ trợ **khử dấu**).
- Tính năng **"Xác định quan hệ"**: chọn 2 người bất kỳ → app tự tính quan hệ dòng tộc và gợi ý cách xưng hô chuẩn xác (kèm chiều ngược lại).

---

## §4. Trải Nghiệm Người Dùng (UX/UI Constraints)
- **Mobile-first & Responsive:** ưu tiên màn hình dọc smartphone (chạm/vuốt, tối giản menu).
- **Chế độ xem tối giản cho người lớn tuổi:** font to, tương phản cao; màn hình tra cứu nhanh chỉ cần nhập tên là thấy thông tin.
- **Đa ngôn ngữ & thuật ngữ thân thiện:** dùng thuật ngữ gia đình Việt dễ hiểu (Chi, Phái, Đời, Ngày Giỗ). Mặc định tiếng Việt; khung i18n để mở rộng.
- **Quy ước vùng miền:** danh xưng theo vùng (Bắc/Trung/Nam), **mặc định miền Trung** (ví dụ **O** = chị/em gái của cha; **cố** = đời +3), đổi được trong Cài đặt.

---

## §5. Kiến Trúc Kỹ Thuật & Hạ Tầng Miễn Phí, An Toàn

Mục tiêu: chi phí vận hành **$0** giai đoạn đầu (vài ngàn thành viên) mà **bảo mật cao**.

```
        +-----------------------------------+
        |   Cross-Platform / Web Client     |
        |        (Next.js + PWA)            |
        +-----------------+-----------------+
                          |
                          v
        +-----------------+-----------------+
        |         Supabase Backend          |
        | (Auth, PostgreSQL, Storage, RLS)  |
        +-----------------------------------+
```

### §5.1. Tech Stack
| Thành phần | Công nghệ | Lý do & Free-Tier |
| --- | --- | --- |
| **Frontend** | **Next.js (App Router) + TypeScript + PWA** | Một codebase chạy Web + cài như app điện thoại (PWA). Static-export → host $0. |
| **Backend & DB** | **Supabase (PostgreSQL)** | Free-tier: 500MB DB, 50k MAU. Sẵn Authentication, Storage và **Row Level Security (RLS)**. |
| **Hosting (Web)** | **Vercel / Cloudflare Pages** | Miễn phí, CDN toàn cầu, nhanh. |
| **File Storage** | **Supabase Storage / Cloudflare R2** | Lưu ảnh, tài liệu. R2 free 10GB/tháng. |
| **Chạy ngay (dev/demo)** | **Local-first (IndexedDB)** | App chạy với dữ liệu demo, **không cần đăng ký**; đổi sang Supabase bằng biến môi trường. |

> Nguyên tắc kiến trúc: **tầng truy cập dữ liệu trừu tượng** (`DataRepository`) với 2 hiện thực — Local (IndexedDB) và Supabase — chọn theo env. Phần còn lại của app chỉ phụ thuộc interface.

### §5.2. An toàn & Bảo mật Dữ liệu
1. **Phân quyền truy cập:**
   - Gia phả **Riêng tư (Private):** chỉ thành viên có **mã mời (Invite Code/Link)** mới xem.
   - **Vai trò:** `Owner` (Chủ họ), `Editor` (Trưởng chi/người nhập), `Member` (chỉ xem).
   - **Row Level Security (RLS):** quy tắc truy vấn ngay trên DB Supabase — người dùng **họ A tuyệt đối không đọc được dữ liệu họ B**. Nhận mã mời chỉ qua RPC `redeem_invite` (security definer).
2. **Mã hóa & Backup:**
   - HTTPS/TLS mặc định cho toàn bộ kết nối.
   - **Xuất dữ liệu (Export):** Admin xuất toàn bộ dòng họ ra **JSON** (và sau này PDF/Excel) bất kỳ lúc nào để tự sao lưu — tránh phụ thuộc nền tảng.

---

## §6. Lộ Trình Phát Triển (Roadmap)

### §6.1. Giai đoạn 1 — MVP
- Đăng ký/Đăng nhập (Email, Google, SĐT) — qua Supabase Auth (bật bằng env).
- Cây gia phả cơ bản: Thêm/Sửa/Xóa thành viên; gán quan hệ Cha–Mẹ–Con–Vợ/Chồng.
- Hiển thị danh sách và cây gia phả trên Web/Mobile.
- Tích hợp Lịch Âm & nhắc ngày giỗ.
- **Bổ sung (đã đưa vào phạm vi bản dựng đầu):** tính vai vế tự động, tìm kiếm, xuất JSON, chế độ người lớn tuổi.

### §6.2. Giai đoạn 2 — Nâng cao UX & Kết nối
- Mở rộng danh xưng thông gia (dâu/rể/dượng/mợ/thím) đầy đủ theo vùng.
- Phân quyền quản trị chi/phái sâu hơn.
- Xuất cây gia phả đẹp dạng **PDF/hình ảnh** chất lượng cao để in.
- Tối ưu đồ họa cây (nâng cấp lên thư viện đồ thị: React Flow / D3 union-node).
- Thông báo đẩy (push) & email nhắc giỗ tự động qua dịch vụ nền.

---

## §7. Phi chức năng (Non-functional) & Ràng buộc
- **Hiệu năng:** nạp cả dòng họ 1 lần (`snapshot`) rồi tính toán trong bộ nhớ; ảo hóa danh sách; code-split cây đồ họa.
- **Khả dụng offline:** PWA cache app-shell + dữ liệu local.
- **Khả chuyển (portability):** xuất/nhập JSON; schema SQL kèm sẵn.
- **Kiểm thử:** logic lõi (âm lịch, vai vế, ngày giỗ, thứ tự đời) có **unit test** (Vitest); luồng UI chính có **E2E** (Playwright).
- **Khả truy cập (a11y):** tương phản cao, cỡ chữ lớn ở chế độ người lớn tuổi.
