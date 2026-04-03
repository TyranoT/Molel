import { MolecularGraph } from '../domain/molecular-graph';
import { ElementoQuimico } from '../domain/atom-node';
import { serializeMolfileV2000 } from './molfile-v2000.serializer';

describe('serializeMolfileV2000', () => {
  it('gera bloco counts, dois átomos e uma ligação simples', () => {
    let g = MolecularGraph.empty();
    g = g.addAtom({ id: 'a1', symbol: ElementoQuimico.Carbono, x: 0, y: 0 });
    g = g.addAtom({ id: 'a2', symbol: ElementoQuimico.Oxigenio, x: 100, y: 0 });
    g = g.addBond({
      id: 'b1',
      fromAtomId: 'a1',
      toAtomId: 'a2',
      order: 'single',
    });

    const mol = serializeMolfileV2000(g.toSnapshot());
    expect(mol).toContain('Molel-export');
    expect(mol).toContain('999 V2000');
    expect(mol).toMatch(/^  2  1  /m);
    expect(mol).toContain('C  ');
    expect(mol).toContain('O  ');
    expect(mol).toContain('M  END');
    expect(mol).toContain('  1  2  1  ');
  });

  it('grafo vazio: 0 átomos', () => {
    const mol = serializeMolfileV2000(MolecularGraph.empty().toSnapshot());
    expect(mol).toContain('  0  0  ');
    expect(mol).toContain('M  END');
  });
});
