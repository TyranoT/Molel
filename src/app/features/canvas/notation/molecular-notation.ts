import type { MolecularGraphSnapshot } from '../domain';

/**
 * Contrato para qualquer serializador que produz texto a partir do grafo completo (rebuild).
 */
export interface MolecularNotationSink {
  serialize(graph: MolecularGraphSnapshot): string;
}
