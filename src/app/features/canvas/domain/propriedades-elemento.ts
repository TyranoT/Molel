/** Dados alinhados ao CSV PubChem (campos vazios no CSV viram null). */
export interface PropriedadesElemento {
  readonly atomicNumber: number;
  readonly symbol: string;
  readonly name: string;
  readonly atomicMass: number;
  /** Cor CPK em hex sem # (ex.: FFFFFF). Pode ser vazio para alguns elementos. */
  readonly cpkHexColor: string;
  readonly electronConfiguration: string;
  readonly electronegativity: number | null;
  readonly atomicRadius: number | null;
  readonly ionizationEnergy: number | null;
  readonly electronAffinity: number | null;
  readonly oxidationStates: string;
  readonly standardState: string;
  readonly meltingPoint: number | null;
  readonly boilingPoint: number | null;
  readonly density: number | null;
  readonly groupBlock: string;
  /** Número como string ou texto tipo "Ancient". */
  readonly yearDiscovered: string;
}
