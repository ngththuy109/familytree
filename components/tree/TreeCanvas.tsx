'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { select } from 'd3-selection';
import { zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from 'd3-zoom';
import type { ClanSnapshot } from '@/lib/domain/types';
import { computeTreeLayout, type TreeEdge } from './useTreeLayout';
import { TreeNode } from './TreeNode';
import { CoupleGroup } from './CoupleGroup';

function elbow(e: TreeEdge): string {
  const midY = (e.parentY + e.childY) / 2;
  return `M ${e.parentX} ${e.parentY} V ${midY} H ${e.childX} V ${e.childY}`;
}

export function TreeCanvas({ snapshot }: { snapshot: ClanSnapshot }) {
  const router = useRouter();
  const layout = useMemo(() => computeTreeLayout(snapshot), [snapshot]);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [tf, setTf] = useState<ZoomTransform>(() => zoomIdentity.translate(40, 20));

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const sel = select(svg);
    const z = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 2.5])
      .on('zoom', (e) => setTf(e.transform));
    zoomRef.current = z;
    sel.call(z);

    const rect = svg.getBoundingClientRect();
    const scale = Math.min(1, (rect.width - 40) / Math.max(1, layout.width));
    const init = zoomIdentity
      .translate(Math.max(20, (rect.width - layout.width * scale) / 2), 20)
      .scale(scale);
    sel.call(z.transform, init);
    setTf(init);

    return () => {
      sel.on('.zoom', null);
    };
  }, [layout]);

  const zoomBy = (k: number) => {
    const svg = svgRef.current;
    const z = zoomRef.current;
    if (svg && z) select(svg).call(z.scaleBy, k);
  };

  return (
    <div className="relative h-[70vh] w-full overflow-hidden rounded-xl border border-border bg-bg">
      <svg ref={svgRef} className="h-full w-full touch-none">
        <g transform={tf.toString()}>
          {layout.edges.map((e) => (
            <path
              key={`${e.parentId}-${e.childId}`}
              d={elbow(e)}
              fill="none"
              stroke="var(--border)"
              strokeWidth={1.5}
              strokeDasharray={e.adopted ? '5 4' : undefined}
            />
          ))}
          {layout.couples.map((c, i) => (
            <CoupleGroup key={`${c.aId}-${c.bId}-${i}`} couple={c} />
          ))}
          {layout.nodes.map((n) => (
            <TreeNode key={n.id} node={n} onSelect={(id) => router.push(`/thanh-vien?id=${id}`)} />
          ))}
        </g>
      </svg>
      <div className="absolute bottom-3 right-3 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => zoomBy(1.25)}
          aria-label="Phóng to"
          className="h-11 w-11 rounded-full border border-border bg-surface text-xl shadow"
        >
          ＋
        </button>
        <button
          type="button"
          onClick={() => zoomBy(1 / 1.25)}
          aria-label="Thu nhỏ"
          className="h-11 w-11 rounded-full border border-border bg-surface text-xl shadow"
        >
          －
        </button>
      </div>
      <p className="absolute left-3 top-3 rounded-lg bg-surface/80 px-2 py-1 text-xs text-muted">
        Kéo để di chuyển · chụm để phóng · chạm vào người để xem hồ sơ
      </p>
    </div>
  );
}
