import { Container, FederatedPointerEvent, Graphics, Text } from 'pixi.js';
import type { AtomNode } from '../domain';
import type { MoleculeSyncContext } from './molecule-sync-context';

export const NODE_HIT_RADIUS = 26;

const FILL = 0xe2e8f0;
const STROKE = 0x14213d;
const RING_ORIGEM = 0xf59e0b;
const RING_SELECIONADO = 0x2dd4bf;

export function createNodeView(atom: AtomNode, ctx: MoleculeSyncContext): Container {
  const root = new Container();
  root.position.set(atom.x, atom.y);
  root.eventMode = 'static';
  root.cursor = 'pointer';

  const bondOrigin = ctx.bondOriginId === atom.id;
  const selected = ctx.selectedAtomId === atom.id;

  if (bondOrigin || selected) {
    const ring = new Graphics();
    const color = bondOrigin ? RING_ORIGEM : RING_SELECIONADO;
    ring.circle(0, 0, NODE_HIT_RADIUS + 4).stroke({ width: 2, color });
    root.addChild(ring);
  }

  const circle = new Graphics();
  circle.circle(0, 0, NODE_HIT_RADIUS).fill({ color: FILL }).stroke({ width: 2, color: STROKE });

  const label = new Text({
    text: atom.symbol,
    style: {
      fontFamily: 'IBM Plex Sans, sans-serif',
      fontSize: 18,
      fontWeight: '600',
      fill: STROKE,
    },
  });
  label.anchor.set(0.5, 0.5);

  root.addChild(circle);
  root.addChild(label);

  root.on('pointerdown', (e: FederatedPointerEvent) => {
    e.stopPropagation();
    ctx.onAtomPointerDown(atom.id, e);
  });

  return root;
}
