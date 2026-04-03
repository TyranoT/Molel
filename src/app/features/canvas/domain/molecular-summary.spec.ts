import { MolecularGraph } from './molecular-graph';
import { ElementoQuimico } from './atom-node';
import {
  countAtomsBySymbol,
  formatHillFormula,
  massaMolecularU,
  resumoCombinacaoCanvas,
  resumoLigacoes,
  textoResumoLigacoesPt,
} from './molecular-summary';

describe('molecular-summary', () => {
  it('Hill com carbono: C antes de H, depois alfabético', () => {
    const m = new Map<ElementoQuimico, number>([
      [ElementoQuimico.Hidrogenio, 8],
      [ElementoQuimico.Carbono, 3],
      [ElementoQuimico.Oxigenio, 1],
    ]);
    expect(formatHillFormula(m)).toBe('C3H8O');
  });

  it('sem carbono: ordem alfabética por símbolo', () => {
    const m = new Map<ElementoQuimico, number>([
      [ElementoQuimico.Oxigenio, 2],
      [ElementoQuimico.Hidrogenio, 2],
    ]);
    expect(formatHillFormula(m)).toBe('H2O2');
  });

  it('grafo vazio', () => {
    const g = MolecularGraph.empty().toSnapshot();
    expect(resumoCombinacaoCanvas(g).formula).toBe('—');
    expect(countAtomsBySymbol(g).size).toBe(0);
  });

  it('massaMolecularU soma quando dados existem', () => {
    const m = new Map<ElementoQuimico, number>([[ElementoQuimico.Hidrogenio, 2]]);
    const r = massaMolecularU(m);
    expect(r.massaU).not.toBeNull();
    expect(r.massaU!).toBeGreaterThan(1);
    expect(r.simbolosSemMassa.length).toBe(0);
  });

  it('resumoLigacoes: uma ligação simples entre dois átomos', () => {
    let g = MolecularGraph.empty();
    g = g.addAtom({ id: 'a1', symbol: ElementoQuimico.Carbono, x: 0, y: 0 });
    g = g.addAtom({ id: 'a2', symbol: ElementoQuimico.Carbono, x: 1, y: 0 });
    g = g.addBond({
      id: 'b1',
      fromAtomId: 'a1',
      toAtomId: 'a2',
      order: 'single',
    });
    const r = resumoLigacoes(g.toSnapshot());
    expect(r.total).toBe(1);
    expect(r.single).toBe(1);
    expect(r.double).toBe(0);
    expect(r.triple).toBe(0);
    expect(r.aromatic).toBe(0);
    expect(textoResumoLigacoesPt(r)).toBe('1× simples');
  });

  it('resumoCombinacaoCanvas inclui ligacoes', () => {
    let g = MolecularGraph.empty();
    g = g.addAtom({ id: 'a1', symbol: ElementoQuimico.Carbono, x: 0, y: 0 });
    g = g.addAtom({ id: 'a2', symbol: ElementoQuimico.Oxigenio, x: 1, y: 0 });
    g = g.addBond({
      id: 'b1',
      fromAtomId: 'a1',
      toAtomId: 'a2',
      order: 'double',
    });
    const c = resumoCombinacaoCanvas(g.toSnapshot());
    expect(c.ligacoes.total).toBe(1);
    expect(c.ligacoes.double).toBe(1);
    expect(textoResumoLigacoesPt(c.ligacoes)).toBe('1× duplas');
  });
});
