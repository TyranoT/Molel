import { isPlatformBrowser } from '@angular/common';
import { computed, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { AtomNode, BondOrder, BondEdge } from '../domain';
import { MolecularGraph, resumoCombinacaoCanvas } from '../domain';
import { serializeMermaidLike, serializeMolfileV2000 } from '../notation';
import { ElementoQuimico } from '../domain/atom-node';
import { PubchemCompoundService } from './pubchem-compound.service';
import { RdkitBridgeService } from './rdkit-bridge.service';

@Injectable()
export class MolecularGraphService {
  private readonly _graph = signal(MolecularGraph.empty());
  readonly graph = this._graph.asReadonly();

  private readonly rdkit = inject(RdkitBridgeService);
  private readonly pubchem = inject(PubchemCompoundService);
  private readonly platformId = inject(PLATFORM_ID);

  private requestSeq = 0;

  readonly notationMermaid = computed(() => serializeMermaidLike(this._graph()));

  /** Fórmula (Hill) e massa a partir dos átomos desenhados no canvas. */
  readonly combinacaoCanvas = computed(() => resumoCombinacaoCanvas(this._graph()));

  /** Molfile V2000 derivado do grafo (entrada do RDKit). */
  readonly molfileText = computed(() => serializeMolfileV2000(this._graph()));

  readonly notationSmiles = signal<string>('—');
  readonly notationInchi = signal<string>('—');
  readonly rdkitError = signal<string | null>(null);

  readonly pubchemTitle = signal<string | null>(null);
  readonly pubchemIupac = signal<string | null>(null);
  readonly pubchemLoading = signal(false);
  readonly pubchemError = signal<string | null>(null);

  private atomSeq = 0;
  private bondSeq = 0;

  constructor() {
    this._graph.set(MolecularGraph.empty());

    effect(() => {
      const mol = this.molfileText();
      const seq = ++this.requestSeq;

      if (!isPlatformBrowser(this.platformId)) {
        this.notationSmiles.set('—');
        this.notationInchi.set('—');
        this.rdkitError.set(null);
        this.pubchemTitle.set(null);
        this.pubchemIupac.set(null);
        this.pubchemLoading.set(false);
        this.pubchemError.set(null);
        return;
      }

      void (async () => {
        this.rdkitError.set(null);
        this.pubchemError.set(null);

        const r = await this.rdkit.molBlockToDescriptor(mol);
        if (seq !== this.requestSeq) {
          return;
        }

        this.rdkitError.set(r.error);
        this.notationSmiles.set(r.smiles && r.smiles.length > 0 ? r.smiles : '—');
        this.notationInchi.set(r.inchi && r.inchi.length > 0 ? r.inchi : '—');

        if (!r.smiles || r.error) {
          this.pubchemTitle.set(null);
          this.pubchemIupac.set(null);
          this.pubchemLoading.set(false);
          return;
        }

        this.pubchemLoading.set(true);
        try {
          const names = await firstValueFrom(this.pubchem.getNamesBySmiles(r.smiles));
          if (seq !== this.requestSeq) {
            return;
          }
          this.pubchemTitle.set(names.title);
          this.pubchemIupac.set(names.iupac);
          this.pubchemError.set(null);
        } catch (e) {
          if (seq !== this.requestSeq) {
            return;
          }
          this.pubchemTitle.set(null);
          this.pubchemIupac.set(null);
          this.pubchemError.set(
            e instanceof Error ? e.message : 'Falha ao consultar o PubChem.',
          );
        } finally {
          if (seq === this.requestSeq) {
            this.pubchemLoading.set(false);
          }
        }
      })();
    });
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

  moveAtom(atomId: string, x: number, y: number): void {
    this._graph.update((prev) => prev.moveAtom(atomId, x, y));
  }

  removeAtom(atomId: string): void {
    this._graph.update((prev) => prev.removeAtom(atomId));
  }

  removeBond(bondId: string): void {
    this._graph.update((prev) => prev.removeBond(bondId));
  }

  setBondOrder(bondId: string, order: BondOrder): void {
    this._graph.update((prev) => prev.updateBondOrder(bondId, order));
  }
}
