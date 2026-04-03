import type { MolecularGraph } from './molecular-graph';

/** Retorna o id do átomo cujo centro está mais próximo de (x,y) dentro do raio, ou null. */
export function atomIdMaisProximo(
  graph: MolecularGraph,
  x: number,
  y: number,
  raio: number,
): string | null {
  const r2 = raio * raio;
  let melhorId: string | null = null;
  let melhorD2 = Infinity;
  for (const atom of graph.atoms.values()) {
    const dx = atom.x - x;
    const dy = atom.y - y;
    const d2 = dx * dx + dy * dy;
    if (d2 <= r2 && d2 < melhorD2) {
      melhorD2 = d2;
      melhorId = atom.id;
    }
  }
  return melhorId;
}
