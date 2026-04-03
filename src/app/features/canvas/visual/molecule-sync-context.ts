import type { FederatedPointerEvent } from 'pixi.js';

/** Contexto passado ao reconstruir nós e arestas (destaques + cliques). */
export type MoleculeSyncContext = {
  bondOriginId: string | null;
  selectedAtomId: string | null;
  onAtomPointerDown: (atomId: string, e: FederatedPointerEvent) => void;
  onBondPointerDown: (bondId: string, e: FederatedPointerEvent) => void;
};
