import type { BondOrder } from './bond-edge';

/** Ordem usada ao ciclar cliques na aresta (UI). */
export const BOND_ORDER_CYCLE: readonly BondOrder[] = [
  'single',
  'double',
  'triple',
  'aromatic',
];

export function nextBondOrder(current: BondOrder): BondOrder {
  const i = BOND_ORDER_CYCLE.indexOf(current);
  const next = (i < 0 ? 0 : i + 1) % BOND_ORDER_CYCLE.length;
  return BOND_ORDER_CYCLE[next]!;
}
