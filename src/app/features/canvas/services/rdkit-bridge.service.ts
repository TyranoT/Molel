import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import type { RDKitModule } from '@rdkit/rdkit';

export interface RdkitMolDescriptor {
  readonly smiles: string;
  readonly inchi: string;
  /** Mensagem quando get_mol falha ou mol inválido. */
  readonly error: string | null;
}

@Injectable({ providedIn: 'root' })
export class RdkitBridgeService {
  private readonly platformId = inject(PLATFORM_ID);
  private module: RDKitModule | null = null;
  private loadPromise: Promise<RDKitModule | null> | null = null;

  /** Inicializa o WASM (idempotente). No SSR devolve null. */
  getModule(): Promise<RDKitModule | null> {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve(null);
    }
    if (this.module) {
      return Promise.resolve(this.module);
    }
    if (!this.loadPromise) {
      this.loadPromise = (async () => {
        const init = window.initRDKitModule;
        if (typeof init !== 'function') {
          return null;
        }
        const mod = await init({
          locateFile: (file: string) =>
            file.endsWith('.wasm') ? '/rdkit/RDKit_minimal.wasm' : file,
        } as Parameters<typeof init>[0]);
        this.module = mod;
        return mod;
      })();
    }
    return this.loadPromise;
  }

  /**
   * Lê um Molblock V2000 e devolve SMILES/InChI.
   * Grafo vazio (0 átomos) não chama RDKit.
   */
  async molBlockToDescriptor(molblock: string): Promise<RdkitMolDescriptor> {
    const countsLine = molblock.split('\n').find((l) => l.includes('V2000'));
    if (countsLine) {
      const na = Number.parseInt(countsLine.trim().split(/\s+/)[0] ?? '', 10);
      if (na === 0) {
        return { smiles: '', inchi: '', error: null };
      }
    }

    const RDKit = await this.getModule();
    if (!RDKit) {
      return { smiles: '', inchi: '', error: 'RDKit não carregou (script ou WASM em falta).' };
    }

    const mol = RDKit.get_mol(molblock);
    if (!mol) {
      return { smiles: '', inchi: '', error: 'Não foi possível interpretar o Molfile.' };
    }

    try {
      if (!mol.is_valid()) {
        return { smiles: '', inchi: '', error: 'Estrutura química inválida (valência ou ligações).' };
      }
      const smiles = mol.get_smiles() ?? '';
      let inchi = '';
      try {
        inchi = mol.get_inchi() ?? '';
      } catch {
        inchi = '';
      }
      return { smiles, inchi, error: null };
    } finally {
      mol.delete();
    }
  }
}
