

export const parseFormula = (formula: string): Record<string, number> => {
    const matches = [...formula.matchAll(/([A-Z][a-z]*)(\d*)/g)];
    const result: Record<string, number> = {};

    for (const [, element, count] of matches) {
        result[element] = (result[element] || 0) + (parseInt(count || '1'));
    }

    return result;
}