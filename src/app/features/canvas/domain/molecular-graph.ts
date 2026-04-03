import type { AtomNode } from './atom-node';
import type { BondEdge } from './bond-edge';

/** Snapshot imutável para notação e serialização. */
export interface MolecularGraphSnapshot {
  readonly atoms: ReadonlyMap<string, AtomNode>;
  readonly bonds: ReadonlyMap<string, BondEdge>;
}

export class MolecularGraph implements MolecularGraphSnapshot {
  readonly atoms: ReadonlyMap<string, AtomNode>;
  readonly bonds: ReadonlyMap<string, BondEdge>;

  private constructor(
    atoms: Map<string, AtomNode>,
    bonds: Map<string, BondEdge>,
  ) {
    this.atoms = atoms;
    this.bonds = bonds;
  }

  static empty(): MolecularGraph {
    return new MolecularGraph(new Map(), new Map());
  }

  /** Cópia superficial para leitura segura fora do domínio. */
  toSnapshot(): MolecularGraphSnapshot {
    return {
      atoms: new Map(this.atoms),
      bonds: new Map(this.bonds),
    };
  }

  addAtom(atom: AtomNode): MolecularGraph {
    if (this.atoms.has(atom.id)) {
      throw new Error(`AtomNode id já existe: ${atom.id}`);
    }
    const nextAtoms = new Map(this.atoms);
    nextAtoms.set(atom.id, atom);
    return new MolecularGraph(nextAtoms, new Map(this.bonds));
  }

  addBond(edge: BondEdge): MolecularGraph {
    if (this.bonds.has(edge.id)) {
      throw new Error(`BondEdge id já existe: ${edge.id}`);
    }
    if (edge.fromAtomId === edge.toAtomId) {
      throw new Error('Ligação não pode conectar um átomo a ele mesmo.');
    }
    if (!this.atoms.has(edge.fromAtomId) || !this.atoms.has(edge.toAtomId)) {
      throw new Error('Ambos os átomos da ligação devem existir no grafo.');
    }

    const pairKey = bondPairKey(edge.fromAtomId, edge.toAtomId);

    for (const b of this.bonds.values()) {
      if (bondPairKey(b.fromAtomId, b.toAtomId) === pairKey) {
        throw new Error('Já existe ligação entre este par de átomos.');
      }
    }

    const nextBonds = new Map(this.bonds);
    nextBonds.set(edge.id, edge);
    return new MolecularGraph(new Map(this.atoms), nextBonds);
  }
}

function bondPairKey(a: string, b: string): string {
  return a < b ? `${a}::${b}` : `${b}::${a}`;
}
