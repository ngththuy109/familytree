import type { CoupleLink } from './useTreeLayout';

/** Đường nối hôn phối giữa hai node vợ/chồng. */
export function CoupleGroup({ couple }: { couple: CoupleLink }) {
  return (
    <line
      x1={couple.ax}
      y1={couple.y}
      x2={couple.bx}
      y2={couple.y}
      stroke="var(--accent)"
      strokeWidth={2.5}
    />
  );
}
