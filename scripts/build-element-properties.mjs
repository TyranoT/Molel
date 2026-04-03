/**
 * Gera src/app/features/canvas/data/element-properties.json a partir do CSV PubChem.
 * Uso: node scripts/build-element-properties.mjs [caminho/csv]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function parseCsvLine(line) {
  const out = [];
  let i = 0;
  let field = '';
  let inQuotes = false;
  while (i < line.length) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
      i++;
      continue;
    }
    if (!inQuotes && c === ',') {
      out.push(field);
      field = '';
      i++;
      continue;
    }
    field += c;
    i++;
  }
  out.push(field);
  return out;
}

function numOrNull(s) {
  const t = (s ?? '').trim();
  if (t === '') return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

const csvPath = process.argv[2] || path.join(root, 'public', 'data', 'pubchem-elements.csv');
const outPath = path.join(root, 'src', 'app', 'features', 'canvas', 'data', 'element-properties.json');

const raw = fs.readFileSync(csvPath, 'utf8');
const lines = raw.split(/\r?\n/).filter((l) => l.length > 0);

const header = parseCsvLine(lines[0]);
const bySymbol = {};

for (let li = 1; li < lines.length; li++) {
  const cols = parseCsvLine(lines[li]);
  if (cols.length < 17) continue;

  const [
    atomicNumber,
    symbol,
    name,
    atomicMass,
    cpkHexColor,
    electronConfiguration,
    electronegativity,
    atomicRadius,
    ionizationEnergy,
    electronAffinity,
    oxidationStates,
    standardState,
    meltingPoint,
    boilingPoint,
    density,
    groupBlock,
    yearDiscovered,
  ] = cols;

  const sym = symbol.trim();
  bySymbol[sym] = {
    atomicNumber: Number(atomicNumber),
    symbol: sym,
    name: name.trim(),
    atomicMass: numOrNull(atomicMass) ?? 0,
    cpkHexColor: (cpkHexColor || '').trim(),
    electronConfiguration: electronConfiguration.trim(),
    electronegativity: numOrNull(electronegativity),
    atomicRadius: numOrNull(atomicRadius),
    ionizationEnergy: numOrNull(ionizationEnergy),
    electronAffinity: numOrNull(electronAffinity),
    oxidationStates: oxidationStates.trim(),
    standardState: standardState.trim(),
    meltingPoint: numOrNull(meltingPoint),
    boilingPoint: numOrNull(boilingPoint),
    density: numOrNull(density),
    groupBlock: groupBlock.trim(),
    yearDiscovered: String(yearDiscovered ?? '').trim(),
  };
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(bySymbol, null, 2), 'utf8');
console.log(`Written ${Object.keys(bySymbol).length} elements to ${outPath}`);
