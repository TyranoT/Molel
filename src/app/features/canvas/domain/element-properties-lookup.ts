import type { ElementoQuimico } from './atom-node';
import type { PropriedadesElemento } from './propriedades-elemento';
import raw from '../data/element-properties.json';

const POR_SIMBOLO = raw as Record<string, PropriedadesElemento>;

export function getPropriedadesElemento(simbolo: ElementoQuimico): PropriedadesElemento | undefined {
  return POR_SIMBOLO[simbolo];
}

export function todasPropriedadesPorSimbolo(): Readonly<Record<string, PropriedadesElemento>> {
  return POR_SIMBOLO;
}
