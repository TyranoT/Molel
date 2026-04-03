import { Injectable } from '@angular/core';
import type { ElementoQuimico } from '../domain/atom-node';
import type { PropriedadesElemento } from '../domain/propriedades-elemento';
import { getPropriedadesElemento } from '../domain/element-properties-lookup';

@Injectable({ providedIn: 'root' })
export class ElementPropertiesService {
  get(simbolo: ElementoQuimico): PropriedadesElemento | undefined {
    return getPropriedadesElemento(simbolo);
  }

  /** Cor CSS `#RRGGBB` a partir de CPK, ou undefined se ausente. */
  cpkCssColor(simbolo: ElementoQuimico): string | undefined {
    const p = this.get(simbolo);
    const hex = p?.cpkHexColor?.trim();
    if (!hex) {
      return undefined;
    }
    return `#${hex}`;
  }

  /** Resumo curto para atributo title na paleta. */
  resumoTooltip(simbolo: ElementoQuimico): string {
    const p = this.get(simbolo);
    if (!p) {
      return simbolo;
    }
    return `${p.name} · Z=${p.atomicNumber} · ${p.atomicMass} u`;
  }
}
