#!/usr/bin/env node










const fs = require('node:fs');
const path = require('node:path');

const WEB_ROOT = path.resolve(__dirname, '..', '..');
const CATALOG = path.join(
  WEB_ROOT,
  'src',
  'features',
  'dev',
  'error-catalog.generated.ts',
);


const PRESENTATION_BY_STATUS = {
  400: 'toast atenção — "Revise os dados informados"',
  401: 'toast atenção — "Sessão expirada"',
  403: 'toast atenção — "Sem permissão"',
  404: 'toast atenção — "Registro não encontrado"',
  409: 'toast atenção — "Ação não permitida agora"',
  422: 'toast atenção — "Revise os dados informados"',
  429: 'toast atenção — "Muitas tentativas" (usa Retry-After)',
};

function presentationFor(status) {
  if (status >= 500) return 'toast crítico — "Falha no servidor"';
  return PRESENTATION_BY_STATUS[status] ?? 'toast atenção — "Ação não concluída"';
}

function sourceFiles(directory, collected = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) sourceFiles(absolute, collected);
    else if (/\.(ts|tsx)$/.test(entry.name)) collected.push(absolute);
  }
  return collected;
}

function main() {
  const outIndex = process.argv.indexOf('--out');
  const out = outIndex > -1 ? path.resolve(process.argv[outIndex + 1]) : null;
  const catalogSource = fs.readFileSync(CATALOG, 'utf8');
  const entries = [...catalogSource.matchAll(
    /\{\s*code:\s*'([A-Z0-9_]+)',\s*status:\s*(\d+),\s*message:\s*"((?:[^"\\]|\\.)*)"/g,
  )].map((match) => ({
    code: match[1],
    status: Number(match[2]),
    message: match[3],
  }));
  if (entries.length === 0) throw new Error('Catálogo de erros vazio ou em formato inesperado.');

  const sources = sourceFiles(path.join(WEB_ROOT, 'src')).filter(
    (file) => path.resolve(file) !== CATALOG,
  );
  const contents = sources.map((file) => ({
    file: path.relative(WEB_ROOT, file).split(path.sep).join('/'),
    text: fs.readFileSync(file, 'utf8'),
  }));

  const rows = [
    ['codigo', 'status', 'mensagemBackend', 'apresentacaoPadrao', 'tratamentoEspecifico', 'arquivos'],
  ];
  let handled = 0;
  for (const entry of entries) {
    const files = contents
      .filter(({ text }) => text.includes(`'${entry.code}'`))
      .map(({ file }) => file);
    if (files.length > 0) handled += 1;
    rows.push([
      entry.code,
      String(entry.status),
      entry.message,
      presentationFor(entry.status),
      files.length > 0 ? 'sim' : 'não',
      files.join('|'),
    ]);
  }


  const referenced = new Set();
  for (const { text } of contents) {
    for (const match of text.matchAll(/\.code\s*===\s*'([A-Z][A-Z0-9_]+)'/g)) {
      referenced.add(match[1]);
    }

    for (const block of text.matchAll(/\w*ERROR_CODES\s*(?::[^=]*)?=\s*\{([^}]*)\}/g)) {
      for (const match of block[1].matchAll(/'([A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+)'/g)) {
        referenced.add(match[1]);
      }
    }
  }
  const known = new Set(entries.map((entry) => entry.code));
  const orphans = [...referenced].filter((code) => !known.has(code)).sort();
  for (const code of orphans) {
    const files = contents
      .filter(({ text }) => text.includes(`'${code}'`))
      .map(({ file }) => file);
    rows.push([
      code,
      'fora-do-catalogo',
      'não publicado em error-catalog.generated.ts',
      'depende do status recebido',
      'sim',
      files.join('|'),
    ]);
  }

  const csv = rows
    .map((row) =>
      row
        .map((cell) => (/[",;\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell))
        .join(','),
    )
    .join('\n');
  if (out) {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, csv + '\n');
  } else {
    process.stdout.write(csv + '\n');
  }
  process.stderr.write(
    `codigos=${entries.length} com tratamento especifico=${handled} apenas apresentacao padrao=${entries.length - handled} fora-do-catalogo=${orphans.length}\n`,
  );
}

main();
