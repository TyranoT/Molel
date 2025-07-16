import { Edge } from "@xyflow/react";
import { NodeMolType } from "../components/nodes/node_mol";
import { parseFormula } from "./parseFormula";
import { Dispatch, SetStateAction } from "react";
import { ValidarCompostoCH } from "../utils/validarQtd";
import { getFixo, ListAlcanosPreFixo } from "../utils/listNomeclatura";

type Props = {
    nodes: NodeMolType[]
    edges: Edge[]
    setFormula: Dispatch<SetStateAction<string>>
    setResultOrg: Dispatch<SetStateAction<string>>
}

export const connectNome = ({ edges, nodes, setFormula, setResultOrg }: Props) => {
    const atomCounts: Record<string, number> = {};

    nodes.forEach(n => {
        const parsed = parseFormula(n.data.nome);
        for (const el in parsed) {
            atomCounts[el] = (atomCounts[el] || 0) + parsed[el];
        }
    });

    let conexoesCC = 0;
    const ligacoesCCMap = new Map<string, number>();

    edges.forEach(e => {
        const nodeA = nodes.find(n => n.id === e.source);
        const nodeB = nodes.find(n => n.id === e.target);
        if (!nodeA || !nodeB) return;

        const parsedA = parseFormula(nodeA.data.nome);
        const parsedB = parseFormula(nodeB.data.nome);

        const hasC_A = parsedA['C'] ?? 0;
        const hasC_B = parsedB['C'] ?? 0;

        if (hasC_A > 0 && hasC_B > 0) {
            const idsOrdenados = [e.source, e.target].sort();
            const key = idsOrdenados.join('-');
            ligacoesCCMap.set(key, (ligacoesCCMap.get(key) || 0) + 1);
            conexoesCC++;
        }
    });

    const mol = Object.entries(atomCounts)
        .sort(([a], [b]) => (a === 'C' ? -1 : b === 'C' ? 1 : a.localeCompare(b)))
        .map(([el, n]) => el + (n > 1 ? n : ''))
        .join('');
    setFormula(mol);

    const parsed = { C: atomCounts['C'] ?? 0, H: atomCounts['H'] ?? 0 };
    const isValid = ValidarCompostoCH(parsed.C, parsed.H);

    if (!isValid) return;

    let simples = 0, duplas = 0, triplas = 0;
    for (const count of ligacoesCCMap.values()) {
        if (count === 1) simples++;
        else if (count === 2) duplas++;
        else if (count >= 3) triplas++;
    }

    const findPreFixo = ListAlcanosPreFixo.find(e => e.n == parsed.C)?.fixo;
    const findInFixo = getFixo(simples, duplas, triplas);

    const result = findPreFixo?.concat(findInFixo ?? '', 'O');
    setResultOrg(result ?? '');
};