export type { AtomNode } from './atom-node';
export type { BondEdge, BondOrder } from './bond-edge';
export { BOND_ORDER_CYCLE, nextBondOrder } from './bond-order';
export { MolecularGraph, type MolecularGraphSnapshot } from './molecular-graph';
export {
  CATEGORIAS_ELEMENTO,
  assertCoberturaPaleta,
  type CategoriaElemento,
} from './element-palette';
export { atomIdMaisProximo } from './hit-test';
export type { PropriedadesElemento } from './propriedades-elemento';
export { getPropriedadesElemento, todasPropriedadesPorSimbolo } from './element-properties-lookup';
export {
  countAtomsBySymbol,
  formatHillFormula,
  massaMolecularU,
  resumoCombinacaoCanvas,
  resumoLigacoes,
  textoResumoLigacoesPt,
  type MassaMolecularResultado,
  type ResumoLigacoes,
} from './molecular-summary';
