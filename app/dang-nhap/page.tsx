'use client';

import { useState } from 'react';
import { isSupabaseConfigured } from '@/lib/data';
import { getSupabaseClient } from '@/lib/data/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  if (!isSupabaseConfigured()) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="text-xl font-bold">Đăng nhập</h1>
        <p className="text-muted">
          App đang chạy chế độ <b>local</b> (không cần đăng nhập). Bật Supabase (xem{' '}
          <code>supabase/README.md</code>) để dùng đăng nhập & cộng tác nhiều người.
        </p>
      </div>
    );
  }

  async function magicLink() {
    setErr('');
    setMsg('');
    try {
      const sb = await getSupabaseClient();
      const { error } = await sb.auth.signInWithOtp({ email });
      if (error) throw error;
      setMsg('Đã gửi liên kết đăng nhập tới email của bạn.');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Lỗi đăng nhập.');
    }
  }

  async function google() {
    const sb = await getSupabaseClient();
    await sb.auth.signInWithOAuth({ provider: 'google' });
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Đăng nhập</h1>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email của bạn"
        className="w-full rounded-xl border border-border bg-surface p-4"
      />
      <button
        type="button"
        onClick={magicLink}
        disabled={!email}
        className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-fg disabled:opacity-60"
      >
        Gửi liên kết đăng nhập (email)
      </button>
      <button type="button" onClick={google} className="rounded-xl border border-border px-5 py-3">
        Đăng nhập với Google
      </button>
      {msg && <p className="text-green-700">{msg}</p>}
      {err && <p className="text-red-600">{err}</p>}
    </div>
  );
}
