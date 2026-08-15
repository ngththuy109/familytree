'use client';

import { useState } from 'react';
import { useClan } from '@/lib/data/useClan';
import { getRepository } from '@/lib/data';
import { useAppStore } from '@/lib/store/useAppStore';
import { toJson } from '@/lib/export/toJson';
import { fromJson } from '@/lib/export/fromJson';

function slug(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function ExportImportPage() {
  const { snapshot, reload } = useClan();
  const setClan = useAppStore((s) => s.setCurrentClan);
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  function download() {
    if (!snapshot) return;
    const blob = new Blob([toJson(snapshot)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const d = new Date();
    a.href = url;
    a.download = `giapha-${slug(snapshot.clan.name)}-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function doImport(content: string) {
    setErr('');
    setMsg('');
    try {
      const snap = fromJson(content);
      if (typeof window !== 'undefined' && !window.confirm('Nhập sẽ GHI ĐÈ dữ liệu dòng họ này. Tiếp tục?')) {
        return;
      }
      await getRepository().importSnapshot(snap);
      setClan(snap.clan.id);
      reload();
      setMsg(`Đã nhập ${snap.members.length} thành viên.`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Lỗi khi nhập dữ liệu.');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">Xuất / Nhập dữ liệu (sao lưu)</h1>

      <section className="card flex flex-col gap-2 p-4">
        <h2 className="font-semibold">Xuất JSON</h2>
        <p className="text-sm text-muted">Tải toàn bộ dòng họ về máy để tự sao lưu.</p>
        <button
          type="button"
          onClick={download}
          disabled={!snapshot}
          className="self-start rounded-xl bg-primary px-4 py-2 font-semibold text-primary-fg disabled:opacity-60"
        >
          ⬇️ Tải file JSON
        </button>
      </section>

      <section className="card flex flex-col gap-2 p-4">
        <h2 className="font-semibold">Nhập JSON</h2>
        <p className="text-sm text-muted">Chọn file hoặc dán nội dung. ⚠️ Sẽ ghi đè dữ liệu hiện tại.</p>
        <input
          type="file"
          accept="application/json,.json"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void f.text().then(doImport);
          }}
          className="text-sm"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="…hoặc dán JSON vào đây"
          className="w-full rounded-xl border border-border bg-surface p-3 font-mono text-xs"
        />
        <button
          type="button"
          onClick={() => doImport(text)}
          disabled={!text.trim()}
          className="self-start rounded-xl border border-border px-4 py-2 disabled:opacity-60"
        >
          Nhập từ ô dán
        </button>
        {msg && <p className="text-green-700">{msg}</p>}
        {err && <p className="text-red-600">{err}</p>}
      </section>
    </div>
  );
}
