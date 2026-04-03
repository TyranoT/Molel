import type { MolecularGraphSnapshot } from '../domain';
import type { BondOrder } from '../domain/bond-edge';

/** Escala arbitrária mundo (px) → Å para o CTAB (só geometria; SMILES depende da topologia). */
export const MOLFILE_PIXELS_TO_ANGSTROM = 0.02;

function bondOrderToMdlType(order: BondOrder): number {
  switch (order) {
    case 'single':
      return 1;
    case 'double':
      return 2;
    case 'triple':
      return 3;
    case 'aromatic':
      return 4;
    default:
      return 1;
  }
}

/** Formata número em campo de 10 caracteres (estilo MDL, alinhado à direita). */
function fmtCoord(v: number): string {
  let s = v.toFixed(4);
  if (s.length > 10) {
    s = s.slice(0, 10);
  }
  return s.length < 10 ? s.padStart(10, ' ') : s;
}

/**
 * Escreve um MDL Molfile V2000 mínimo (átomos + ligações).
 * @see CTAB V2000
 */
export function serializeMolfileV2000(graph: MolecularGraphSnapshot): string {
  const atoms = [...graph.atoms.values()];
  const bonds = [...graph.bonds.values()];
  const idToIndex = new Map(atoms.map((a, i) => [a.id, i + 1]));

  const lines: string[] = [];
  lines.push('Molel-export');
  lines.push('  Molel          2D');
  lines.push('');

  const na = atoms.length;
  const nb = bonds.length;
  // Linha de contagem CTAB V2000 (12 campos × 3 chars + "0999 V2000"): ver especificação MDL / exemplos RDKit.
  lines.push(
    `${String(na).padStart(3, ' ')}${String(nb).padStart(3, ' ')}  0  0  0  0  0  0  0  0999 V2000`,
  );

  for (const a of atoms) {
    const x = a.x * MOLFILE_PIXELS_TO_ANGSTROM;
    const y = -a.y * MOLFILE_PIXELS_TO_ANGSTROM;
    const z = 0;
    const sym = a.symbol.padEnd(3, ' ');
    lines.push(
      `${fmtCoord(x)}${fmtCoord(y)}${fmtCoord(z)}${sym}0  0  0  0  0  0  0  0  0  0  0  0`,
    );
  }

  for (const b of bonds) {
    const i = idToIndex.get(b.fromAtomId);
    const j = idToIndex.get(b.toAtomId);
    if (i === undefined || j === undefined) {
      continue;
    }
    const t = bondOrderToMdlType(b.order);
    // Cada campo de índice/tipo ocupa 3 colunas; sem espaços extra no início da linha.
    lines.push(
      `${String(i).padStart(3, ' ')}${String(j).padStart(3, ' ')}${String(t).padStart(3, ' ')}  0  0  0  0`,
    );
  }

  lines.push('M  END');
  lines.push('');
  return lines.join('\n');
}
