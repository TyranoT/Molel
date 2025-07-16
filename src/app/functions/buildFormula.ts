

export const buildFormula = (counts: Record<string, number>): string => {
    return Object.entries(counts)
        .sort(([a], [b]) => (a === 'C' ? -1 : b === 'C' ? 1 : a.localeCompare(b)))
        .map(([el, n]) => el + (n > 1 ? n : ''))
        .join('');
}