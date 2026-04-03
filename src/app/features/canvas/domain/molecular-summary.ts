import type { MolecularGraphSnapshot } from './molecular-graph';
import type { ElementoQuimico } from './atom-node';
import { ElementoQuimico as El } from './atom-node';
import { getPropriedadesElemento } from './element-properties-lookup';

/** Contagens de ligações no grafo por ordem (arestas explícitas). */
export interface ResumoLigacoes {
  readonly total: number;
  readonly single: number;
  readonly double: number;
  readonly triple: number;
  readonly aromatic: number;
}

/** Agrega ligações do snapshot (cada aresta conta uma vez). */
export function resumoLigacoes(graph: MolecularGraphSnapshot): ResumoLigacoes {
  let single = 0;
  let double = 0;
  let triple = 0;
  let aromatic = 0;
  for (const b of graph.bonds.values()) {
    switch (b.order) {
      case 'single':
        single++;
        break;
      case 'double':
        double++;
        break;
      case 'triple':
        triple++;
        break;
      case 'aromatic':
        aromatic++;
        break;
      default:
        break;
    }
  }
  return {
    total: graph.bonds.size,
    single,
    double,
    triple,
    aromatic,
  };
}

/** Texto compacto para o painel (só tipos com contagem > 0). */
export function textoResumoLigacoesPt(r: ResumoLigacoes): string {
  if (r.total === 0) {
    return '—';
  }
  const parts: string[] = [];
  if (r.single > 0) {
    parts.push(`${r.single}× simples`);
  }
  if (r.double > 0) {
    parts.push(`${r.double}× duplas`);
  }
  if (r.triple > 0) {
    parts.push(`${r.triple}× triplas`);
  }
  if (r.aromatic > 0) {
    parts.push(`${r.aromatic}× aromáticas`);
  }
  return parts.join(' · ');
}

/** Conta átomos no grafo por símbolo. */
export function countAtomsBySymbol(graph: MolecularGraphSnapshot): Map<ElementoQuimico, number> {
  const m = new Map<ElementoQuimico, number>();
  for (const a of graph.atoms.values()) {
    m.set(a.symbol, (m.get(a.symbol) ?? 0) + 1);
  }
  return m;
}

/**
 * Fórmula em texto (convenção de Hill): com carbono → C, depois H, depois restantes por ordem alfabético do símbolo;
 * sem carbono → todos por ordem alfabética.
 */
export function formatHillFormula(counts: ReadonlyMap<ElementoQuimico, number>): string {
  const entries = [...counts.entries()].filter(([, n]) => n > 0);
  if (entries.length === 0) {
    return '—';
  }

  const piece = (symbol: string, n: number): string =>
    n <= 0 ? '' : n === 1 ? symbol : `${symbol}${n}`;

  const hasC = (counts.get(El.Carbono) ?? 0) > 0;
  if (hasC) {
    const out: string[] = [];
    const nc = counts.get(El.Carbono) ?? 0;
    const nh = counts.get(El.Hidrogenio) ?? 0;
    out.push(piece(El.Carbono, nc));
    out.push(piece(El.Hidrogenio, nh));
    const rest = entries
      .filter(([sym]) => sym !== El.Carbono && sym !== El.Hidrogenio)
      .sort(([a], [b]) => a.localeCompare(b));
    for (const [sym, n] of rest) {
      out.push(piece(sym, n));
    }
    return out.filter(Boolean).join('');
  }

  return entries
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([sym, n]) => piece(sym, n))
    .join('');
}

export interface MassaMolecularResultado {
  /** Massa em u (unidade unificada), ou null se faltar massa atómica para algum símbolo presente. */
  readonly massaU: number | null;
  readonly simbolosSemMassa: readonly ElementoQuimico[];
}

/** Soma massas atómicas (dados PubChem) × contagens. */
export function massaMolecularU(counts: ReadonlyMap<ElementoQuimico, number>): MassaMolecularResultado {
  const semMassa: ElementoQuimico[] = [];
  let sum = 0;
  for (const [sym, n] of counts.entries()) {
    if (n <= 0) {
      continue;
    }
    const p = getPropriedadesElemento(sym);
    if (p === undefined || typeof p.atomicMass !== 'number') {
      semMassa.push(sym);
      continue;
    }
    sum += p.atomicMass * n;
  }
  if (semMassa.length > 0) {
    return { massaU: null, simbolosSemMassa: semMassa };
  }
  return { massaU: sum, simbolosSemMassa: [] };
}

/** Resumo para o painel: fórmula, massa e ligações a partir do snapshot do grafo. */
export function resumoCombinacaoCanvas(graph: MolecularGraphSnapshot): {
  formula: string;
  massa: MassaMolecularResultado;
  ligacoes: ResumoLigacoes;
} {
  const counts = countAtomsBySymbol(graph);
  return {
    formula: formatHillFormula(counts),
    massa: massaMolecularU(counts),
    ligacoes: resumoLigacoes(graph),
  };
}
