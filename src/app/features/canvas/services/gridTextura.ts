import { Application, Graphics } from 'pixi.js';

const CELL = 50;
/** Cinza visível sobre o fundo claro do canvas (~slate-400) */
const LINE = 0x94a3b8;

export function createGridTexture(app: Application) {
  const g = new Graphics();

  g.moveTo(0, 0).lineTo(CELL, 0).stroke({ width: 1, color: LINE });
  g.moveTo(0, 0).lineTo(0, CELL).stroke({ width: 1, color: LINE });

  return app.renderer.generateTexture(g);
}
