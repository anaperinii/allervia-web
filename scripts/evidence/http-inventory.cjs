#!/usr/bin/env node












const fs = require('node:fs');
const path = require('node:path');

const WEB_ROOT = path.resolve(__dirname, '..', '..');
const BACKEND_ROOT = process.env.ALLERVIA_BACKEND_ROOT
  ? path.resolve(process.env.ALLERVIA_BACKEND_ROOT)
  : path.resolve(WEB_ROOT, '..', 'allervia-backend');
const CONTRACT = path.join(BACKEND_ROOT, 'docs', 'contracts', 'openapi.json');
const METHODS = ['get', 'put', 'post', 'delete', 'patch', 'options', 'head', 'trace'];

function sourceFiles(directory, collected = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) sourceFiles(absolute, collected);
    else if (/\.(ts|tsx)$/.test(entry.name)) collected.push(absolute);
  }
  return collected;
}


function collapseInterpolations(value) {
  let result = '';
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === '$' && value[index + 1] === '{') {
      let depth = 1;
      index += 2;
      while (index < value.length && depth > 0) {
        if (value[index] === '{') depth += 1;
        if (value[index] === '}') depth -= 1;
        index += 1;
      }
      index -= 1;
      result += ':p';
      continue;
    }
    result += value[index];
  }
  return result;
}


function normalisePath(value) {
  const collapsed = collapseInterpolations(value)
    .replace(/\{[^}]*\}/g, ':p')
    .split('?')[0];


  const withoutQueryBuilder = /[^/]:p$/.test(collapsed)
    ? collapsed.slice(0, -2)
    : collapsed;
  return withoutQueryBuilder.replace(/\/+$/, '');
}


function stringConstants(content) {
  const constants = new Map();
  for (const match of content.matchAll(/const\s+(\w+)\s*=\s*(['"])([^'"\n]*)\2/g)) {
    constants.set(match[1], match[3]);
  }
  return constants;
}


function collectRequestedPaths(sources) {
  const byPath = new Map();
  const pattern = /apiRequest\s*(?:<[^>]*>)?\s*\(\s*(?:`((?:[^`\\]|\\.)*)`|'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")/g;
  for (const file of sources) {
    const content = fs.readFileSync(file, 'utf8');
    const constants = stringConstants(content);
    for (const match of content.matchAll(pattern)) {
      const raw = (match[1] ?? match[2] ?? match[3] ?? '').replace(
        /\$\{(\w+)\}/g,
        (interpolation, name) => constants.get(name) ?? interpolation,
      );
      const normalised = normalisePath(raw);
      if (!normalised.startsWith('/')) continue;
      const relative = path.relative(WEB_ROOT, file).split(path.sep).join('/');
      const files = byPath.get(normalised) ?? new Set();
      files.add(relative);
      byPath.set(normalised, files);
    }
  }
  return byPath;
}

function main() {
  const outIndex = process.argv.indexOf('--out');
  const out = outIndex > -1 ? path.resolve(process.argv[outIndex + 1]) : null;
  if (!fs.existsSync(CONTRACT)) {
    throw new Error(`BLOQUEADO: contrato ausente em ${CONTRACT}`);
  }
  const document = JSON.parse(fs.readFileSync(CONTRACT, 'utf8'));
  const sources = sourceFiles(path.join(WEB_ROOT, 'src'));
  const requested = collectRequestedPaths(sources);
  const matched = new Set();
  const rows = [['metodo', 'caminho', 'operationId', 'tags', 'consumoFrontend', 'arquivos']];
  let total = 0;
  let consumed = 0;
  for (const [template, item] of Object.entries(document.paths)) {
    for (const method of METHODS) {
      const operation = item[method];
      if (!operation) continue;
      total += 1;
      const key = normalisePath(template);
      const exact = [...(requested.get(key) ?? [])];



      const dynamic =
        exact.length > 0
          ? []
          : [...requested.entries()]
              .filter(([candidate]) => {
                if (!candidate.includes(':p')) return false;
                const left = candidate.split('/');
                const right = key.split('/');
                if (left.length !== right.length) return false;
                return left.every(
                  (segment, index) => segment === ':p' || segment === right[index],
                );
              })
              .flatMap(([candidate, files]) => {
                matched.add(candidate);
                return [...files];
              });
      const files = exact.length > 0 ? exact : dynamic;
      if (files.length > 0) {
        consumed += 1;
        matched.add(key);
      }
      rows.push([
        method.toUpperCase(),
        template,
        operation.operationId ?? '',
        (operation.tags ?? []).join('|'),
        exact.length > 0 ? 'detectado' : dynamic.length > 0 ? 'detectado-dinamico' : 'nao-detectado',
        files.sort().join('|'),
      ]);
    }
  }
  for (const [requestedPath, files] of [...requested.entries()].sort()) {
    if (matched.has(requestedPath)) continue;
    rows.push(['?', requestedPath, '', 'fora-do-contrato', 'chamado-sem-operacao', [...files].sort().join('|')]);
  }
  const csv = rows
    .map((row) => row.map((cell) => (/[",;\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell)).join(','))
    .join('\n');
  if (out) {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, csv + '\n');
  } else {
    process.stdout.write(csv + '\n');
  }
  process.stderr.write(
    `operacoes=${total} com consumo detectado=${consumed} sem consumo detectado=${total - consumed}\n`,
  );
}

main();
