import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, type Observable } from 'rxjs';

interface PubChemPropertyResponse {
  readonly PropertyTable?: {
    readonly Properties?: ReadonlyArray<{
      readonly Title?: string;
      readonly IUPACName?: string;
    }>;
  };
}

/** Cliente mínimo PUG REST para nome a partir de SMILES. */
@Injectable({ providedIn: 'root' })
export class PubchemCompoundService {
  private readonly http = inject(HttpClient);

  /**
   * Título PubChem (nome comum) e IUPAC quando existirem.
   * Pode falhar por rede, CORS ou composto desconhecido.
   */
  getNamesBySmiles(smiles: string): Observable<{ title: string | null; iupac: string | null }> {
    const enc = encodeURIComponent(smiles.trim());
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${enc}/property/Title,IUPACName/JSON`;
    return this.http.get<PubChemPropertyResponse>(url).pipe(
      map((body) => {
        const p = body.PropertyTable?.Properties?.[0];
        return {
          title: p?.Title?.trim() || null,
          iupac: p?.IUPACName?.trim() || null,
        };
      }),
    );
  }
}
