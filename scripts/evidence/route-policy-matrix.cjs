#!/usr/bin/env node









const fs = require('node:fs');
const path = require('node:path');

const WEB_ROOT = path.resolve(__dirname, '..', '..');
const POLICY = path.join(WEB_ROOT, 'src', 'shared', 'auth', 'navigation-policy.ts');
const STORE = path.join(WEB_ROOT, 'src', 'shared', 'stores', 'useUserStore.ts');
const ROUTES_DIRECTORY = path.join(WEB_ROOT, 'src', 'routes');

function readPolicies() {
  const source = fs.readFileSync(POLICY, 'utf8');
  const block = source.match(/ROUTE_POLICIES[^=]*=\s*\[([\s\S]*?)\n\]/);
  if (!block) throw new Error('Route policy declaration not found');
  return [...block[1].matchAll(/\{([^{}]+)\}/g)].map((match) => {
    const properties = match[1];
    const value = (name) => properties.match(new RegExp(name + ":\\s*'([^']+)'"))?.[1];
    return { path: value('path'), label: value('label'), requires: value('requires'), public: /public:\s*true/.test(properties) };
  });
}

function readCapabilities() {
  const source = fs.readFileSync(STORE, 'utf8');
  const block = source.match(/PERMISSION_CAPABILITIES[^=]*=\s*\{([\s\S]*?)\n\}/);
  if (!block) throw new Error('Permission capability declaration not found');
  return new Map([...block[1].matchAll(/(\w+):\s*'([^']+)'/g)].map((match) => [match[1], match[2]]));
}


function declaredRoutes() {
  const paths = [];
  for (const file of fs.readdirSync(ROUTES_DIRECTORY)) {
    const text = fs.readFileSync(path.join(ROUTES_DIRECTORY, file), 'utf8');
    const match = text.match(/createFileRoute\('([^']+)'\)/);
    if (match) paths.push({ path: match[1], file: `src/routes/${file}` });
  }
  return paths;
}

function main() {
  const outIndex = process.argv.indexOf('--out');
  const out = outIndex > -1 ? path.resolve(process.argv[outIndex + 1]) : null;
  const policies = readPolicies();
  const capabilities = readCapabilities();
  const routes = declaredRoutes();

  const rows = [
    ['rota', 'arquivo', 'rotulo', 'acesso', 'permissao', 'capabilityBackend', 'guardaNaRota'],
  ];
  for (const route of routes.sort((a, b) => a.path.localeCompare(b.path))) {

    const policy =
      policies.find((item) => item.path === route.path) ??
      policies.find(
        (item) => item.path !== '/' && route.path.startsWith(`${item.path}/`),
      );
    const guarded = fs
      .readFileSync(path.join(WEB_ROOT, route.file), 'utf8')
      .includes('RequireCapability');
    rows.push([
      route.path,
      route.file,
      policy?.label ?? 'SEM POLÍTICA',
      policy ? (policy.public ? 'público' : policy.requires ? 'por capacidade' : 'qualquer sessão') : 'SEM POLÍTICA',
      policy?.requires ?? '',
      policy?.requires ? (capabilities.get(policy.requires) ?? 'DESCONHECIDA') : '',
      guarded ? 'sim' : 'não',
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
  const missing = rows.slice(1).filter((row) => row[3] === 'SEM POLÍTICA');
  process.stderr.write(
    `rotas=${routes.length} com politica=${routes.length - missing.length} sem politica=${missing.length}\n`,
  );
  if (missing.length > 0) {
    process.stderr.write(missing.map((row) => `  ${row[0]}`).join('\n') + '\n');
  }
}

main();
