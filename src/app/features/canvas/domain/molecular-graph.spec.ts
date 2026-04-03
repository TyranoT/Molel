import { ElementoQuimico } from './atom-node';
import { MolecularGraph } from './molecular-graph';

describe('MolecularGraph', () => {
  it('addAtom e addBond produzem novo grafo imutável', () => {
    const g0 = MolecularGraph.empty();
    const g1 = g0.addAtom({ id: 'a1', symbol: ElementoQuimico.Carbono, x: 0, y: 0 });
    expect(g0.atoms.size).toBe(0);
    expect(g1.atoms.size).toBe(1);

    const g2 = g1.addAtom({ id: 'a2', symbol: ElementoQuimico.Oxigenio, x: 1, y: 0 });
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
    g = g.addAtom({ id: 'a1', symbol: ElementoQuimico.Carbono, x: 0, y: 0 });
    g = g.addAtom({ id: 'a2', symbol: ElementoQuimico.Oxigenio, x: 1, y: 0 });
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

  it('moveAtom atualiza posição sem alterar ligações', () => {
    let g = MolecularGraph.empty();
    g = g.addAtom({ id: 'a1', symbol: ElementoQuimico.Carbono, x: 0, y: 0 });
    g = g.addAtom({ id: 'a2', symbol: ElementoQuimico.Oxigenio, x: 10, y: 0 });
    g = g.addBond({
      id: 'b1',
      fromAtomId: 'a1',
      toAtomId: 'a2',
      order: 'single',
    });
    const g2 = g.moveAtom('a1', 5, 5);
    expect(g2.atoms.get('a1')?.x).toBe(5);
    expect(g2.atoms.get('a1')?.y).toBe(5);
    expect(g2.bonds.size).toBe(1);
  });

  it('removeAtom remove ligações incidentes', () => {
    let g = MolecularGraph.empty();
    g = g.addAtom({ id: 'a1', symbol: ElementoQuimico.Carbono, x: 0, y: 0 });
    g = g.addAtom({ id: 'a2', symbol: ElementoQuimico.Oxigenio, x: 1, y: 0 });
    g = g.addBond({
      id: 'b1',
      fromAtomId: 'a1',
      toAtomId: 'a2',
      order: 'single',
    });
    const g2 = g.removeAtom('a1');
    expect(g2.atoms.has('a1')).toBe(false);
    expect(g2.bonds.size).toBe(0);
  });

  it('updateBondOrder altera só a ordem da ligação', () => {
    let g = MolecularGraph.empty();
    g = g.addAtom({ id: 'a1', symbol: ElementoQuimico.Carbono, x: 0, y: 0 });
    g = g.addAtom({ id: 'a2', symbol: ElementoQuimico.Oxigenio, x: 1, y: 0 });
    g = g.addBond({
      id: 'b1',
      fromAtomId: 'a1',
      toAtomId: 'a2',
      order: 'single',
    });
    const g2 = g.updateBondOrder('b1', 'double');
    expect(g2.bonds.get('b1')?.order).toBe('double');
    expect(g.bonds.get('b1')?.order).toBe('single');
  });
});
