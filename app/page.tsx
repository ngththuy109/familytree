import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col gap-6">
      <section className="card p-6 text-center">
        <div aria-hidden className="text-5xl">🌳</div>
        <h1 className="mt-2 text-2xl font-bold text-primary">Gia Phả Việt</h1>
        <p className="mt-2 text-muted">
          Số hóa gia phả gia đình: xem cây, tra ngày giỗ, tính vai vế xưng hô — ngay trên
          điện thoại.
        </p>
        <Link
          href="/danh-sach"
          className="mt-4 inline-block rounded-xl bg-primary px-5 py-3 font-semibold text-primary-fg"
        >
          Xem gia phả demo
        </Link>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <HomeTile href="/cay" icon="🌳" title="Cây gia phả" desc="Xem theo nhánh, thu/phóng" />
        <HomeTile href="/danh-sach" icon="📋" title="Danh sách" desc="Theo đời & chi" />
        <HomeTile href="/gio" icon="🕯️" title="Ngày giỗ" desc="Nhắc trước 3–7 ngày" />
        <HomeTile href="/quan-he" icon="👨‍👩‍👧" title="Xác định quan hệ" desc="Ai gọi ai bằng gì" />
      </section>
    </div>
  );
}

function HomeTile({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <Link href={href} className="card flex flex-col gap-1 p-4">
      <span aria-hidden className="text-2xl">
        {icon}
      </span>
      <span className="font-semibold">{title}</span>
      <span className="text-sm text-muted">{desc}</span>
    </Link>
  );
}
