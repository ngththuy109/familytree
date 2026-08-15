import Link from 'next/link';

export function TopBar() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
          <span aria-hidden className="text-xl">🌳</span>
          <span>Gia Phả Việt</span>
        </Link>
        <Link
          href="/cai-dat"
          aria-label="Cài đặt"
          className="rounded-lg px-2 py-1 text-muted hover:text-text"
        >
          ⚙️
        </Link>
      </div>
    </header>
  );
}
