import type { MolecularGraphSnapshot } from '../domain';
import type { MolecularNotationSink } from './molecular-notation';

function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_]/g, '_');
}

/** Gera texto estilo Mermaid (flowchart) para painel de documentação. */
export function serializeMermaidLike(graph: MolecularGraphSnapshot): string {
  const lines: string[] = ['flowchart LR'];

  for (const atom of graph.atoms.values()) {
    const nid = sanitizeId(atom.id);
    lines.push(`    ${nid}["${atom.symbol}"]`);
  }

  for (const bond of graph.bonds.values()) {
    const a = sanitizeId(bond.fromAtomId);
    const b = sanitizeId(bond.toAtomId);
    lines.push(`    ${a} -->|${bond.order}| ${b}`);
  }

  return lines.join('\n');
}

export const mermaidLikeNotationSink: MolecularNotationSink = {
  serialize: serializeMermaidLike,
};
