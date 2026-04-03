import { ElementoQuimico } from './atom-node';
import { getPropriedadesElemento } from './element-properties-lookup';

describe('Propriedades PubChem por símbolo', () => {
  it('cobre todos os valores do enum ElementoQuimico', () => {
    const valores = Object.values(ElementoQuimico) as string[];
    const faltando: string[] = [];
    for (const sym of valores) {
      const p = getPropriedadesElemento(sym as ElementoQuimico);
      if (!p || p.symbol !== sym) {
        faltando.push(sym);
      }
    }
    expect(faltando).toEqual([]);
  });

  it('hidrógeno tem dados esperados', () => {
    const p = getPropriedadesElemento(ElementoQuimico.Hidrogenio);
    expect(p?.atomicNumber).toBe(1);
    expect(p?.name).toBe('Hydrogen');
    expect(p?.cpkHexColor).toBe('FFFFFF');
  });
});
