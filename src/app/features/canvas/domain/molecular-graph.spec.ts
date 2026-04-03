import { MolecularGraph } from './molecular-graph';

describe('MolecularGraph', () => {
  it('addAtom e addBond produzem novo grafo imutável', () => {
    const g0 = MolecularGraph.empty();
    const g1 = g0.addAtom({ id: 'a1', symbol: 'C', x: 0, y: 0 });
    expect(g0.atoms.size).toBe(0);
    expect(g1.atoms.size).toBe(1);

    const g2 = g1.addAtom({ id: 'a2', symbol: 'O', x: 1, y: 0 });
    const g3 = g2.addBond({
      id: 'b1',
      fromAtomId: 'a1',
      toAtomId: 'a2',
      order: 'single',
    });
    expect(g3.bonds.size).toBe(1);
  });

  it('rejeita ligação duplicada no mesmo par', () => {
    let g = MolecularGraph.empty();
    g = g.addAtom({ id: 'a1', symbol: 'C', x: 0, y: 0 });
    g = g.addAtom({ id: 'a2', symbol: 'O', x: 1, y: 0 });
    g = g.addBond({
      id: 'b1',
      fromAtomId: 'a1',
      toAtomId: 'a2',
      order: 'single',
    });
    expect(() =>
      g.addBond({
        id: 'b2',
        fromAtomId: 'a2',
        toAtomId: 'a1',
        order: 'single',
      }),
    ).toThrow();
  });
});
