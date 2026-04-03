import { Graphics } from 'pixi.js';
import type { BondOrder } from '../domain';

const STROKE = 0x14213d;

function strokeWidth(order: BondOrder): number {
  switch (order) {
    case 'double':
      return 4;
    case 'triple':
      return 5;
    case 'aromatic':
      return 3;
    default:
      return 3;
  }
}

export function createEdgeView(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  order: BondOrder,
): Graphics {
  const g = new Graphics();
  const w = strokeWidth(order);

  if (order === 'double') {
    const dx = y2 - y1;
    const dy = -(x2 - x1);
    const len = Math.hypot(dx, dy) || 1;
    const nx = (dx / len) * 3;
    const ny = (dy / len) * 3;
    g.moveTo(x1 + nx, y1 + ny)
      .lineTo(x2 + nx, y2 + ny)
      .stroke({ width: w - 1, color: STROKE });
    g.moveTo(x1 - nx, y1 - ny)
      .lineTo(x2 - nx, y2 - ny)
      .stroke({ width: w - 1, color: STROKE });
  } else {
    g.moveTo(x1, y1).lineTo(x2, y2).stroke({ width: w, color: STROKE });
  }

  return g;
}
