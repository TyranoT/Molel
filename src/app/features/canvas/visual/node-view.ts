import { Container, Graphics, Text } from 'pixi.js';
import type { AtomNode } from '../domain';

const R = 26;
const FILL = 0xe2e8f0;
const STROKE = 0x14213d;

export function createNodeView(atom: AtomNode): Container {
  const root = new Container();
  root.position.set(atom.x, atom.y);

  const circle = new Graphics();
  circle.circle(0, 0, R).fill({ color: FILL }).stroke({ width: 2, color: STROKE });

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
  return root;
}
