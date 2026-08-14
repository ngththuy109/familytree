import { NODE_H, NODE_W, type TreeNodePos } from './useTreeLayout';
import { memberYears } from '@/components/member/MemberCard';

export function TreeNode({
  node,
  onSelect,
}: {
  node: TreeNodePos;
  onSelect: (id: string) => void;
}) {
  const m = node.member;
  const female = m.gender === 'female';
  const name = m.fullName.length > 16 ? `${m.fullName.slice(0, 15)}…` : m.fullName;
  const years = memberYears(m);
  return (
    <g
      transform={`translate(${node.x - NODE_W / 2}, ${node.y})`}
      style={{ cursor: 'pointer' }}
      onClick={() => onSelect(m.id)}
      role="button"
      aria-label={m.fullName}
    >
      <rect
        width={NODE_W}
        height={NODE_H}
        rx={12}
        fill="var(--surface)"
        stroke={female ? '#db2777' : 'var(--primary)'}
        strokeWidth={1.5}
      />
      <text
        x={NODE_W / 2}
        y={22}
        textAnchor="middle"
        fontSize={12.5}
        fontWeight={600}
        fill="var(--text)"
      >
        {name}
      </text>
      <text x={NODE_W / 2} y={40} textAnchor="middle" fontSize={10.5} fill="var(--muted)">
        {years}
        {m.isAlive ? '' : ' 🕯'}
      </text>
    </g>
  );
}
