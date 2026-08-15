'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getRepository, isSupabaseConfigured } from '@/lib/data';

function JoinInner() {
  const code = useSearchParams().get('code') ?? '';
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  if (!isSupabaseConfigured()) {
    return <p className="text-muted">Cần bật Supabase để dùng mã mời (xem supabase/README.md).</p>;
  }

  async function join() {
    setErr('');
    setMsg('');
    try {
      await getRepository().invites.redeem(code);
      setMsg('Đã tham gia dòng họ thành công!');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Không thể tham gia.');
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Tham gia dòng họ</h1>
      <p className="text-muted">
        Mã mời: <b>{code || '(chưa có)'}</b>
      </p>
      <button
        type="button"
        onClick={join}
        disabled={!code}
        className="self-start rounded-xl bg-primary px-5 py-3 font-semibold text-primary-fg disabled:opacity-60"
      >
        Tham gia
      </button>
      {msg && (
        <p className="text-green-700">
          {msg}{' '}
          <Link href="/danh-sach" className="underline">
            Xem gia phả →
          </Link>
        </p>
      )}
      {err && <p className="text-red-600">{err}</p>}
      <p className="text-sm text-muted">Chưa đăng nhập? <Link href="/dang-nhap" className="underline">Đăng nhập</Link> trước.</p>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<p className="text-muted">Đang tải…</p>}>
      <JoinInner />
    </Suspense>
  );
}
