import { Container } from 'pixi.js';
import type { Viewport } from 'pixi-viewport';
import type { MolecularGraph } from '../domain';
import { createEdgeView } from './edge-view';
import { createNodeView } from './node-view';

/**
 * Camada Pixi só-visual: sincroniza nós e ligações com o grafo do domínio.
 */
export class MoleculeSceneLayer {
  private readonly root = new Container();
  private readonly edgesLayer = new Container();
  private readonly nodesLayer = new Container();

  constructor(viewport: Viewport) {
    this.root.addChild(this.edgesLayer);
    this.root.addChild(this.nodesLayer);
    viewport.addChild(this.root);
  }

  sync(graph: MolecularGraph): void {
    for (const c of this.edgesLayer.removeChildren()) {
      c.destroy({ children: true });
    }
    for (const c of this.nodesLayer.removeChildren()) {
      c.destroy({ children: true });
    }

    const atoms = graph.atoms;

    for (const bond of graph.bonds.values()) {
      const a = atoms.get(bond.fromAtomId);
      const b = atoms.get(bond.toAtomId);
      if (!a || !b) continue;
      this.edgesLayer.addChild(createEdgeView(a.x, a.y, b.x, b.y, bond.order));
    }

    for (const atom of graph.atoms.values()) {
      this.nodesLayer.addChild(createNodeView(atom));
    }
  }

  destroy(): void {
    this.root.parent?.removeChild(this.root);
    this.root.destroy({ children: true });
  }
}
