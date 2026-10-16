#!/usr/bin/env node














const { createHash } = require('node:crypto');
const { execFileSync, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const net = require('node:net');
const path = require('node:path');

const WEB_ROOT = path.resolve(__dirname, '..', '..');
const BACKEND_ROOT = process.env.ALLERVIA_BACKEND_ROOT
  ? path.resolve(process.env.ALLERVIA_BACKEND_ROOT)
  : path.resolve(WEB_ROOT, '..', 'allervia-backend');

function parseArguments(argv) {
  const options = { runId: null, gates: null, out: null, list: false };
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flag === '--run-id') options.runId = argv[index + 1];
    if (flag === '--gates') options.gates = argv[index + 1].split(',').map((gate) => gate.trim());
    if (flag === '--out') options.out = argv[index + 1];
    if (flag === '--list') options.list = true;
  }
  return options;
}

function portIsOpen(host, port, timeoutMs = 1500) {
  const probe = spawnSync(
    process.execPath,
    [
      '-e',
      `const net=require('node:net');const s=net.connect(${port},${JSON.stringify(host)});` +
        `s.setTimeout(${timeoutMs});` +
        `s.on('connect',()=>{s.destroy();process.exit(0)});` +
        `s.on('timeout',()=>{s.destroy();process.exit(1)});` +
        `s.on('error',()=>process.exit(1));`,
    ],
    { encoding: 'utf8' },
  );
  return probe.status === 0;
}

function git(root, args) {
  try {
    return execFileSync('git', ['-C', root, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}

function headOf(root) {
  return git(root, ['rev-parse', 'HEAD']);
}

function workingTreeDirty(root) {
  const status = git(root, ['status', '--porcelain=v1']);
  return status === null ? null : status.length > 0;
}

function sha256OfFile(absolute) {
  if (!fs.existsSync(absolute)) return null;
  return createHash('sha256').update(fs.readFileSync(absolute)).digest('hex');
}


const preconditions = {
  backendCheckout: () =>
    fs.existsSync(BACKEND_ROOT)
      ? null
      : `checkout do backend ausente em ${BACKEND_ROOT}`,
  backendDependencies: () =>
    fs.existsSync(path.join(BACKEND_ROOT, 'node_modules'))
      ? null
      : 'dependencias do backend nao instaladas (npm ci no allervia-backend)',
  testDatabaseEnvironment: () =>
    fs.existsSync(path.join(BACKEND_ROOT, '.env.test.local'))
      ? null
      : 'arquivo .env.test.local ausente no backend (banco de teste nao declarado)',
  testDatabaseReachable: () => {
    const file = path.join(BACKEND_ROOT, '.env.test.local');
    if (!fs.existsSync(file)) return 'arquivo .env.test.local ausente no backend';
    const line = fs
      .readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .find((entry) => entry.startsWith('DATABASE_URL='));
    if (!line) return 'DATABASE_URL ausente em .env.test.local';
    const url = new URL(line.slice('DATABASE_URL='.length).replace(/^"|"$/g, ''));
    const port = Number(url.port || 5432);
    return portIsOpen(url.hostname, port)
      ? null
      : `banco de teste inacessivel em ${url.hostname}:${port}`;
  },
  laboratory: () => {
    const base = process.env.PLAYWRIGHT_BASE_URL;
    if (!base) return null;
    const url = new URL(base);
    const port = Number(url.port || (url.protocol === 'https:' ? 443 : 80));
    return portIsOpen(url.hostname, port)
      ? null
      : `laboratorio inacessivel em ${url.host}`;
  },
};






function gateCatalogue(runDirectory) {
  const artifact = (name) => path.join(runDirectory, name);
  return [
    {
      id: 'lint',
      description: 'eslint sobre o projeto',
      command: ['npm', ['run', 'lint']],
      cwd: WEB_ROOT,
      requires: [],
    },
    {
      id: 'typecheck',
      description: 'tsc sobre app e testes',
      command: ['npm', ['run', 'test:typecheck']],
      cwd: WEB_ROOT,
      requires: [],
    },
    {
      id: 'unit',
      description: 'vitest run com relatorio JSON',
      command: [
        'npm',
        ['run', 'test', '--', '--reporter=json', `--outputFile=${artifact('unit.json')}`],
      ],
      cwd: WEB_ROOT,
      requires: [],
      parse: () => {
        const file = artifact('unit.json');
        if (!fs.existsSync(file)) return { reason: 'relatorio JSON ausente' };
        const report = JSON.parse(fs.readFileSync(file, 'utf8'));
        return {
          suites: report.numTotalTestSuites ?? null,
          passed: report.numPassedTests ?? null,
          failed: report.numFailedTests ?? null,
          skipped: (report.numPendingTests ?? 0) + (report.numTodoTests ?? 0),
        };
      },
    },
    {
      id: 'contract',
      description: 'contrato HTTP real dirigido pelo backend (jest + vitest consumidor)',
      command: ['npm', ['run', 'test:contract']],
      cwd: BACKEND_ROOT,
      requires: [
        'backendCheckout',
        'backendDependencies',
        'testDatabaseEnvironment',
        'testDatabaseReachable',
      ],
    },
    {
      id: 'contract-types',
      description: 'tipos gerados conferem com o contrato publicado',
      command: ['npm', ['run', 'contract:check']],
      cwd: WEB_ROOT,
      requires: ['backendCheckout'],
    },
    {
      id: 'build',
      description: 'tsc -b e vite build',
      command: ['npm', ['run', 'build']],
      cwd: WEB_ROOT,
      requires: [],
    },
    {
      id: 'e2e',
      description: 'playwright end to end',
      command: ['npm', ['run', 'e2e']],
      cwd: WEB_ROOT,
      requires: ['laboratory'],
    },
  ];
}

function runGate(gate, runDirectory) {
  const blocked = [
    ...new Set(gate.requires.map((name) => preconditions[name]()).filter(Boolean)),
  ];
  const startedAt = new Date().toISOString();
  if (blocked.length > 0) {
    return {
      id: gate.id,
      description: gate.description,
      status: 'BLOQUEADO',
      reason: blocked.join('; '),
      command: `${gate.command[0]} ${gate.command[1].join(' ')}`,
      cwd: gate.cwd,
      startedAt,
      finishedAt: new Date().toISOString(),
      exitCode: null,
      suites: null,
      passed: null,
      failed: null,
      skipped: null,
      logPath: null,
      artifactSha256: null,
    };
  }

  const logPath = path.join(runDirectory, `${gate.id}.log`);
  const result = spawnSync(gate.command[0], gate.command[1], {
    cwd: gate.cwd,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    maxBuffer: 64 * 1024 * 1024,
  });
  const output = `$ ${gate.command[0]} ${gate.command[1].join(' ')}\n[cwd] ${gate.cwd}\n\n${result.stdout ?? ''}\n${result.stderr ?? ''}`;
  fs.writeFileSync(logPath, output);
  const counters = gate.parse
    ? gate.parse()
    : { suites: null, passed: null, failed: null, skipped: null };

  return {
    id: gate.id,
    description: gate.description,
    status: result.status === 0 ? 'PASSOU' : 'FALHOU',
    reason: counters.reason ?? null,
    command: `${gate.command[0]} ${gate.command[1].join(' ')}`,
    cwd: gate.cwd,
    startedAt,
    finishedAt: new Date().toISOString(),
    exitCode: result.status,
    suites: counters.suites ?? null,
    passed: counters.passed ?? null,
    failed: counters.failed ?? null,
    skipped: counters.skipped ?? null,
    logPath: path.relative(WEB_ROOT, logPath).split(path.sep).join('/'),
    artifactSha256: sha256OfFile(logPath),
  };
}

function main() {
  const options = parseArguments(process.argv.slice(2));
  const runId = options.runId || `run-${new Date().toISOString().replace(/[:.]/g, '-')}`;
  const runDirectory = path.join(WEB_ROOT, 'artifacts', 'frontend-stabilization', runId);
  const catalogue = gateCatalogue(runDirectory);

  if (options.list) {
    process.stdout.write(catalogue.map((gate) => `${gate.id}\t${gate.description}`).join('\n') + '\n');
    return;
  }

  const selected = options.gates
    ? catalogue.filter((gate) => options.gates.includes(gate.id))
    : catalogue.filter((gate) => gate.id !== 'e2e');
  const unknown = (options.gates ?? []).filter(
    (requested) => !catalogue.some((gate) => gate.id === requested),
  );
  if (unknown.length > 0) {
    throw new Error(`Gate desconhecido: ${unknown.join(', ')}`);
  }

  fs.mkdirSync(runDirectory, { recursive: true });
  const startedAt = new Date().toISOString();
  const gates = [];
  for (const gate of selected) {
    process.stdout.write(`> ${gate.id}\n`);
    const outcome = runGate(gate, runDirectory);
    process.stdout.write(`  ${outcome.status}${outcome.reason ? ` (${outcome.reason})` : ''}\n`);
    gates.push(outcome);
  }

  const limitations = gates
    .filter((gate) => gate.status === 'BLOQUEADO')
    .map((gate) => `${gate.id}: ${gate.reason}`);
  const verdict = gates.some((gate) => gate.status === 'FALHOU')
    ? 'FALHOU'
    : gates.some((gate) => gate.status === 'BLOQUEADO')
      ? 'BLOQUEADO'
      : 'PASSOU';

  const results = {
    schemaVersion: 1,
    runId,
    verdict,
    scope: 'LOCAL_INTEGRADO',
    snapshotFrontend: { head: headOf(WEB_ROOT), dirty: workingTreeDirty(WEB_ROOT) },
    snapshotBackend: { head: headOf(BACKEND_ROOT), dirty: workingTreeDirty(BACKEND_ROOT) },
    environment: {
      platform: process.platform,
      node: process.version,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    startedAt,
    finishedAt: new Date().toISOString(),
    unexpectedConsoleErrors: null,
    gates,
    limitations,
  };

  const outPath = path.resolve(
    options.out ||
      path.join(WEB_ROOT, 'docs', 'review', 'frontend', 'execucao-frontend', 'resultados.json'),
  );
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const serialized = JSON.stringify(results, null, 2) + '\n';
  fs.writeFileSync(outPath, serialized);

  const perRun = path.join(
    path.dirname(outPath),
    `resultados-${runId.replace(/[^A-Za-z0-9._-]/g, '-')}.json`,
  );
  if (perRun !== outPath) fs.writeFileSync(perRun, serialized);
  process.stdout.write(`\nveredito=${verdict}\n${outPath}\n`);
  process.exitCode = verdict === 'FALHOU' ? 1 : 0;
}

main();
