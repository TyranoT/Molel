import { Container, FederatedPointerEvent, Graphics, Polygon } from 'pixi.js';
import type { BondOrder } from '../domain';

const STROKE = 0x14213d;
const STROKE_AROMATIC = 0x6d28d9;
/** Meia-espessura da faixa clicável ao longo da ligação (coordenadas do mundo). */
const HIT_HALF_WIDTH = 14;

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

function perpUnit(x1: number, y1: number, x2: number, y2: number): { px: number; py: number; len: number } {
  const dx = y2 - y1;
  const dy = -(x2 - x1);
  const len = Math.hypot(dx, dy) || 1;
  return { px: dx / len, py: dy / len, len };
}

function strokeDashedSegment(
  g: Graphics,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  dash: number,
  gap: number,
  width: number,
  color: number,
): void {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const segLen = Math.hypot(dx, dy) || 1;
  const ux = dx / segLen;
  const uy = dy / segLen;
  let d = 0;
  while (d < segLen) {
    const d0 = d;
    const d1 = Math.min(d + dash, segLen);
    g.moveTo(x1 + ux * d0, y1 + uy * d0)
      .lineTo(x1 + ux * d1, y1 + uy * d1)
      .stroke({ width, color });
    d += dash + gap;
  }
}

/**
 * Ligação com desenho por ordem, hit alargado e clique para ciclar ordem (callback).
 */
export function createBondEdgeView(
  bondId: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  order: BondOrder,
  onBondPointerDown: (id: string, e: FederatedPointerEvent) => void,
): Container {
  const root = new Container();
  root.eventMode = 'static';
  root.cursor = 'pointer';

  const { px, py } = perpUnit(x1, y1, x2, y2);
  const hw = HIT_HALF_WIDTH;
  const hx = px * hw;
  const hy = py * hw;
  root.hitArea = new Polygon([
    x1 + hx,
    y1 + hy,
    x2 + hx,
    y2 + hy,
    x2 - hx,
    y2 - hy,
    x1 - hx,
    y1 - hy,
  ]);

  const g = new Graphics();
  const w = strokeWidth(order);

  if (order === 'double') {
    const nx = px * 3.5;
    const ny = py * 3.5;
    g.moveTo(x1 + nx, y1 + ny)
      .lineTo(x2 + nx, y2 + ny)
      .stroke({ width: w - 1, color: STROKE });
    g.moveTo(x1 - nx, y1 - ny)
      .lineTo(x2 - nx, y2 - ny)
      .stroke({ width: w - 1, color: STROKE });
  } else if (order === 'triple') {
    const s = 4;
    const nx = px * s;
    const ny = py * s;
    g.moveTo(x1 + nx, y1 + ny)
      .lineTo(x2 + nx, y2 + ny)
      .stroke({ width: w - 1, color: STROKE });
    g.moveTo(x1, y1).lineTo(x2, y2).stroke({ width: w - 1, color: STROKE });
    g.moveTo(x1 - nx, y1 - ny)
      .lineTo(x2 - nx, y2 - ny)
      .stroke({ width: w - 1, color: STROKE });
  } else if (order === 'aromatic') {
    strokeDashedSegment(g, x1, y1, x2, y2, 10, 6, w, STROKE_AROMATIC);
  } else {
    g.moveTo(x1, y1).lineTo(x2, y2).stroke({ width: w, color: STROKE });
  }

  root.addChild(g);

  root.on('pointertap', (e: FederatedPointerEvent) => {
    e.stopPropagation();
    onBondPointerDown(bondId, e);
  });

  return root;
}
