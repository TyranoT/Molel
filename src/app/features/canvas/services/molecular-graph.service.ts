import { computed, Injectable, signal } from '@angular/core';
import type { AtomNode, BondOrder, BondEdge } from '../domain';
import { MolecularGraph } from '../domain';
import { serializeMermaidLike, serializeSmilesStub } from '../notation';
import { ElementoQuimico } from '../domain/atom-node';

@Injectable()
export class MolecularGraphService {
  private readonly _graph = signal(MolecularGraph.empty());
  readonly graph = this._graph.asReadonly();

  readonly notationMermaid = computed(() => serializeMermaidLike(this._graph()));
  readonly notationSmiles = computed(() => serializeSmilesStub(this._graph()));

  private atomSeq = 0;
  private bondSeq = 0;

  constructor() {
    this.seedDemo();
  }

  /** C–O–H em linha para validar visual e notação. */
  private seedDemo(): void {
    let g = MolecularGraph.empty();
    const atoms: AtomNode[] = [
      { id: 'atom_1', symbol: ElementoQuimico.Carbono, x: 2350, y: 2500 },
      { id: 'atom_2', symbol: ElementoQuimico.Oxigenio, x: 2520, y: 2500 },
      { id: 'atom_3', symbol: ElementoQuimico.Hidrogenio, x: 2690, y: 2500 },
    ];
    for (const a of atoms) {
      g = g.addAtom(a);
    }
    g = g.addBond({
      id: 'bond_1',
      fromAtomId: 'atom_1',
      toAtomId: 'atom_2',
      order: 'single',
    });
    g = g.addBond({
      id: 'bond_2',
      fromAtomId: 'atom_2',
      toAtomId: 'atom_3',
      order: 'single',
    });
    this._graph.set(g);
    this.atomSeq = 3;
    this.bondSeq = 2;
  }

  addAtom(symbol: ElementoQuimico, x: number, y: number): string {
    const id = `atom_${++this.atomSeq}`;
    const node: AtomNode = { id, symbol, x, y };
    this._graph.update((prev) => prev.addAtom(node));
    return id;
  }

  addBond(fromAtomId: string, toAtomId: string, order: BondOrder): string {
    const id = `bond_${++this.bondSeq}`;
    const edge: BondEdge = { id, fromAtomId, toAtomId, order };
    this._graph.update((prev) => prev.addBond(edge));
    return id;
  }
}
