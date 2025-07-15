
export const ListAlcanosPreFixo = [
    {
        n: 1,
        fixo: 'MET'
    },
    {
        n: 2,
        fixo: 'ET'
    },
    {
        n: 3,
        fixo: 'PROP'
    },
    {
        n: 4,
        fixo: 'BUT'
    },
    {
        n: 5,
        fixo: 'PENT'
    },
    {
        n: 6,
        fixo: 'HEX'
    },
    {
        n: 7,
        fixo: 'HEPT'
    },
    {
        n: 8,
        fixo: 'OCT'
    },
    {
        n: 9,
        fixo: 'NON'
    },
    {
        n: 10,
        fixo: 'DEC'
    }
];

export const ListAlcanosInfixo = [
    {
        ligacoes: 'simples',
        fixo: 'AN'
    },
    {
        ligacoes: 'dupla',
        fixo: 'EN'
    },
    {
        ligacoes: 'tripla',
        fixo: 'IN',
    },
    {
        ligacoes: 'duasLigacoesDuplas',
        fixo: 'DIEN'
    },
    {
        ligacoes: 'duasLigacoesTriplas',
        fixo: 'DIIN'
    }
]

export function getFixo(simples: number, duplas: number, triplas: number) {
  if (duplas === 2) {
    return ListAlcanosInfixo.find(e => e.ligacoes === 'duasLigacoesDuplas')?.fixo;
  } else if (triplas === 2) {
    return ListAlcanosInfixo.find(e => e.ligacoes === 'duasLigacoesTriplas')?.fixo;
  } else if (triplas >= 1) {
    return ListAlcanosInfixo.find(e => e.ligacoes === 'tripla')?.fixo;
  } else if (duplas >= 1) {
    return ListAlcanosInfixo.find(e => e.ligacoes === 'dupla')?.fixo;
  } else if (simples >= 1) {
    return ListAlcanosInfixo.find(e => e.ligacoes === 'simples')?.fixo;
  }
  return null;
}