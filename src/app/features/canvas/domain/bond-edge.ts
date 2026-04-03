export type BondOrder = 'single' | 'double' | 'triple' | 'aromatic';

export interface BondEdge {
  readonly id: string;
  readonly fromAtomId: string;
  readonly toAtomId: string;
  readonly order: BondOrder;
}
