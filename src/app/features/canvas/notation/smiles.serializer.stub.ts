import type { MolecularGraphSnapshot } from '../domain';
import type { MolecularNotationSink } from './molecular-notation';

/**
 * SMILES completo exige valência, hidrogênios implícitos, aromaticidade e ordem de travessia.
 * Esta implementação é um stub até o domínio expor regras químicas suficientes.
 */
export function serializeSmilesStub(_graph: MolecularGraphSnapshot): string {
  return '# SMILES: não implementado — requer modelo químico (valência, H implícitos, etc.)';
}

export const smilesNotationStub: MolecularNotationSink = {
  serialize: serializeSmilesStub,
};
