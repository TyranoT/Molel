import { ElementoQuimico } from './atom-node';

export interface CategoriaElemento {
  readonly id: string;
  readonly label: string;
  readonly elementos: readonly ElementoQuimico[];
}

/** Agrupamento didático (IUPAC simplificado) — cada elemento aparece uma vez. */
export const CATEGORIAS_ELEMENTO: readonly CategoriaElemento[] = [
  {
    id: 'alcalinos',
    label: 'Metais alcalinos',
    elementos: [
      ElementoQuimico.Litio,
      ElementoQuimico.Sodio,
      ElementoQuimico.Potassio,
      ElementoQuimico.Rubidio,
      ElementoQuimico.Cesio,
      ElementoQuimico.Francio,
    ],
  },
  {
    id: 'alcalino_terrosos',
    label: 'Metais alcalino-terrosos',
    elementos: [
      ElementoQuimico.Berilio,
      ElementoQuimico.Magnesio,
      ElementoQuimico.Calcio,
      ElementoQuimico.Estroncio,
      ElementoQuimico.Bario,
      ElementoQuimico.Radio,
    ],
  },
  {
    id: 'transicao',
    label: 'Metais de transição',
    elementos: [
      ElementoQuimico.Escandio,
      ElementoQuimico.Titanio,
      ElementoQuimico.Vanadio,
      ElementoQuimico.Cromo,
      ElementoQuimico.Manganes,
      ElementoQuimico.Ferro,
      ElementoQuimico.Cobalto,
      ElementoQuimico.Niquel,
      ElementoQuimico.Cobre,
      ElementoQuimico.Zinco,
      ElementoQuimico.Itrio,
      ElementoQuimico.Zirconio,
      ElementoQuimico.Niobio,
      ElementoQuimico.Molibdenio,
      ElementoQuimico.Tecnecio,
      ElementoQuimico.Rutenio,
      ElementoQuimico.Rodio,
      ElementoQuimico.Paladio,
      ElementoQuimico.Prata,
      ElementoQuimico.Cadmio,
      ElementoQuimico.Hafnio,
      ElementoQuimico.Tantalo,
      ElementoQuimico.Tungstenio,
      ElementoQuimico.Renio,
      ElementoQuimico.Osmio,
      ElementoQuimico.Iridio,
      ElementoQuimico.Platina,
      ElementoQuimico.Ouro,
      ElementoQuimico.Mercurio,
      ElementoQuimico.Rutherfordio,
      ElementoQuimico.Dubnio,
      ElementoQuimico.Seaborgio,
      ElementoQuimico.Bohrio,
      ElementoQuimico.Hassio,
      ElementoQuimico.Meitnerio,
      ElementoQuimico.Darmstadtio,
      ElementoQuimico.Roentgenio,
      ElementoQuimico.Copernicio,
    ],
  },
  {
    id: 'lantanideos',
    label: 'Lantanídeos',
    elementos: [
      ElementoQuimico.Lantanio,
      ElementoQuimico.Cerio,
      ElementoQuimico.Praseodimio,
      ElementoQuimico.Neodimio,
      ElementoQuimico.Promecio,
      ElementoQuimico.Samario,
      ElementoQuimico.Europio,
      ElementoQuimico.Gadolinio,
      ElementoQuimico.Terbio,
      ElementoQuimico.Disprosio,
      ElementoQuimico.Holmio,
      ElementoQuimico.Erbio,
      ElementoQuimico.Tulio,
      ElementoQuimico.Iterbio,
      ElementoQuimico.Lutecio,
    ],
  },
  {
    id: 'actinideos',
    label: 'Actinídeos',
    elementos: [
      ElementoQuimico.Actinio,
      ElementoQuimico.Torio,
      ElementoQuimico.Protactinio,
      ElementoQuimico.Uranio,
      ElementoQuimico.Neptunio,
      ElementoQuimico.Plutonio,
      ElementoQuimico.Americio,
      ElementoQuimico.Curio,
      ElementoQuimico.Berquelio,
      ElementoQuimico.Californio,
      ElementoQuimico.Einsteinio,
      ElementoQuimico.Fermio,
      ElementoQuimico.Mendelevio,
      ElementoQuimico.Nobelio,
      ElementoQuimico.Laurencio,
    ],
  },
  {
    id: 'semimetais',
    label: 'Semimetais',
    elementos: [
      ElementoQuimico.Boro,
      ElementoQuimico.Silicio,
      ElementoQuimico.Germanio,
      ElementoQuimico.Arsenio,
      ElementoQuimico.Antimonio,
      ElementoQuimico.Telurio,
      ElementoQuimico.Polonio,
    ],
  },
  {
    id: 'nao_metais',
    label: 'Não metais',
    elementos: [
      ElementoQuimico.Hidrogenio,
      ElementoQuimico.Carbono,
      ElementoQuimico.Nitrogenio,
      ElementoQuimico.Oxigenio,
      ElementoQuimico.Fosforo,
      ElementoQuimico.Enxofre,
      ElementoQuimico.Selenio,
    ],
  },
  {
    id: 'halogenios',
    label: 'Halogênios',
    elementos: [
      ElementoQuimico.Fluor,
      ElementoQuimico.Cloro,
      ElementoQuimico.Bromo,
      ElementoQuimico.Iodo,
      ElementoQuimico.Astato,
      ElementoQuimico.Tenessino,
    ],
  },
  {
    id: 'gases_nobres',
    label: 'Gases nobres',
    elementos: [
      ElementoQuimico.Helio,
      ElementoQuimico.Neonio,
      ElementoQuimico.Argonio,
      ElementoQuimico.Criptonio,
      ElementoQuimico.Xenonio,
      ElementoQuimico.Radonio,
      ElementoQuimico.Oganesson,
    ],
  },
  {
    id: 'outros_metais',
    label: 'Outros metais (pós-transição)',
    elementos: [
      ElementoQuimico.Aluminio,
      ElementoQuimico.Galio,
      ElementoQuimico.Indio,
      ElementoQuimico.Estanho,
      ElementoQuimico.Talio,
      ElementoQuimico.Chumbo,
      ElementoQuimico.Bismuto,
      ElementoQuimico.Nihonio,
      ElementoQuimico.Flerovio,
      ElementoQuimico.Moscovio,
      ElementoQuimico.Livermorio,
    ],
  },
];

/** Verifica cobertura completa do enum (falha em dev se faltar elemento). */
export function assertCoberturaPaleta(): void {
  const todos = new Set(Object.values(ElementoQuimico));
  const cobertos = new Set<ElementoQuimico>();
  for (const cat of CATEGORIAS_ELEMENTO) {
    for (const el of cat.elementos) {
      if (cobertos.has(el)) {
        throw new Error(`Elemento duplicado na paleta: ${el}`);
      }
      cobertos.add(el);
    }
  }
  if (cobertos.size !== todos.size) {
    const faltando = [...todos].filter((v) => !cobertos.has(v));
    throw new Error(`Elementos sem categoria: ${faltando.join(', ')}`);
  }
}

assertCoberturaPaleta();
