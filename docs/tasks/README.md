# Bảng theo dõi Task (Task Board) — Gia Phả Việt

> Trạng thái cập nhật **thủ công**. Nguồn sự thật của từng task là file `T-NN.md`
> (frontmatter `status`). Template: [`_TEMPLATE.md`](./_TEMPLATE.md) · Quy ước:
> [`CONVENTIONS.md`](./CONVENTIONS.md) · PRD: [`../PRD.md`](../PRD.md).

## Cách chạy một task
1. Chọn card `status: todo` mà mọi `depends_on` đã `done`/`review`.
2. Đặt `status: in_progress`, `owner`, `started_at`.
3. Làm đúng "Việc phải làm" + "Quy ước bắt buộc"; **chỉ sửa file trong `touches`**.
4. Chạy hết "Checklist đầu ra"; đặt `status: review`, `finished_at`; ghi "Đã làm gì".

## Danh sách task

| ID | Tên | Trạng thái | Model | Effort | depends_on |
|----|-----|-----------|-------|--------|-----------|
| [T-01](./T-01.md) | Khởi tạo Next.js + TS + Tailwind + PWA + hạ tầng test | todo | sonnet | high | – |
| [T-02](./T-02.md) | Kiểu dữ liệu domain + dữ liệu demo | todo | sonnet | medium | T-01 |
| [T-03](./T-03.md) | Tài liệu gốc (PRD/CONVENTIONS/README/KIẾN TRÚC) | todo | sonnet | medium | – |
| [T-04](./T-04.md) | Module Âm lịch (Hồ Ngọc Đức) + test | todo | opus | high | T-02 |
| [T-05](./T-05.md) | Thứ tự sinh & đánh số đời + test | todo | sonnet | medium | T-02 |
| [T-06](./T-06.md) | Vai vế/xưng hô (LCA + nội/ngoại + trọng trưởng) + test | todo | opus | high | T-02, T-05 |
| [T-07](./T-07.md) | Ngày giỗ (âm lịch, nhắc 3–7 ngày) + test | todo | opus | medium | T-02, T-04 |
| [T-08](./T-08.md) | Repository + Local (IndexedDB) + seed | todo | sonnet | high | T-02 |
| [T-09](./T-09.md) | Store (Zustand) + i18n + chế độ người lớn tuổi | todo | sonnet | medium | T-01 |
| [T-10](./T-10.md) | Danh sách/Thẻ + tìm kiếm + lọc | todo | sonnet | high | T-08, T-05, T-09 |
| [T-11](./T-11.md) | Hồ sơ + vai vế + giỗ + Xác định quan hệ | todo | sonnet | high | T-06, T-07, T-08 |
| [T-12](./T-12.md) | Dashboard Ngày giỗ | todo | sonnet | medium | T-07, T-08 |
| [T-13](./T-13.md) | Cây gia phả đồ họa (d3 + SVG + zoom) | todo | opus | high | T-08, T-05 |
| [T-14](./T-14.md) | Form CRUD + DualDateInput + Chi/Phái | todo | sonnet | high | T-08, T-04 |
| [T-15](./T-15.md) | Xuất/Nhập JSON (backup) | todo | sonnet | low | T-08 |
| [T-16](./T-16.md) | Migrations Supabase (schema + RLS + RPC) | todo | opus | high | T-02 |
| [T-17](./T-17.md) | Supabase repo + Auth + mời/tham gia | todo | opus | high | T-08, T-16 |
| [T-18](./T-18.md) | Hoàn thiện PWA + tài liệu còn lại | todo | sonnet | medium | T-01, T-16 |

## Đồ thị phụ thuộc (thứ tự gợi ý)
```
T-01 ─┬─ T-02 ─┬─ T-04 ─┬─ T-07 ┐
      │        ├─ T-05 ─┼─ T-06 ┼─ T-11 ┐
      │        ├─ T-08 ─┤       ├─ T-10 ┼─(UI)
      │        └─ T-16 ─┴─ T-17 ┘       ├─ T-12
      ├─ T-03 (tài liệu, song song)     ├─ T-13
      └─ T-09 ───────────────────────── ┼─ T-14
                                         └─ T-15
T-18 (PWA + tài liệu) ← T-01, T-16
```

## Chạy song song an toàn
- Sau **T-02**: {T-04, T-05, T-08, T-16} độc lập file → chạy song song.
- Sau khi domain+data xong: {T-10, T-11, T-12, T-13, T-14, T-15} phần lớn tách file.
- **T-03** (tài liệu) độc lập, có thể làm bất cứ lúc nào.
- Quy tắc chống xung đột: mỗi card khai báo `touches` cụ thể; không sửa ngoài phạm vi.

## Giai đoạn
- **Giai đoạn 1 (MVP+):** T-01 → T-15 (local-first chạy đầy đủ) + T-16/T-17 (bật Supabase).
- **Giai đoạn 2 (PRD §6.2):** PDF/Excel, danh xưng thông gia đầy đủ, push/email, nâng cấp cây (React Flow).
