'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isSupabaseConfigured } from '@/lib/data';
import { getSupabaseClient } from '@/lib/data/supabase/client';

const PUBLIC_ROUTES = ['/dang-nhap', '/tham-gia'];

/** Khi bật Supabase mà chưa đăng nhập → yêu cầu đăng nhập. Local: cho qua. */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const [state, setState] = useState<'loading' | 'in' | 'out'>(
    isSupabaseConfigured() ? 'loading' : 'in'
  );

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let unsub: (() => void) | undefined;
    getSupabaseClient()
      .then(async (sb) => {
        const { data } = await sb.auth.getSession();
        setState(data.session ? 'in' : 'out');
        const sub = sb.auth.onAuthStateChange((_e, session) => setState(session ? 'in' : 'out'));
        unsub = () => sub.data.subscription.unsubscribe();
      })
      .catch(() => setState('out'));
    return () => unsub?.();
  }, []);

  if (isPublic) return <>{children}</>;
  if (state === 'loading') return <p className="p-4 text-muted">Đang kiểm tra đăng nhập…</p>;
  if (state === 'out') {
    return (
      <div className="flex flex-col items-center gap-3 p-8 text-center">
        <p className="text-muted">Gia phả riêng tư — vui lòng đăng nhập.</p>
        <Link href="/dang-nhap" className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-fg">
          Đăng nhập
        </Link>
      </div>
    );
  }
  return <>{children}</>;
}
