#!/usr/bin/env node














const { createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const EXCLUDED_DIRECTORIES = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  'coverage',
  'artifacts',
  'playwright-report',
  'test-results',
  'tmp',
  '.vite',
  '.turbo',
]);

let manifestOutputPath = null;

function parseArguments(argv) {
  const options = { out: null, runId: null };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--out') options.out = argv[index + 1];
    if (argv[index] === '--run-id') options.runId = argv[index + 1];
  }
  return options;
}

function git(root, args) {


  return execFileSync('git', ['-C', root, ...args], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  }).replace(/\s+$/, '');
}

function commandVersion(command, args) {
  try {
    return execFileSync(command, args, { encoding: 'utf8', shell: process.platform === 'win32' }).trim();
  } catch {
    return null;
  }
}

function isExcluded(relativePath) {
  return relativePath
    .split('/')
    .some((segment) => EXCLUDED_DIRECTORIES.has(segment));
}

function walkDirectory(root, relativeDirectory, collected) {
  const absolute = path.join(root, relativeDirectory);
  for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
    const relative = relativeDirectory
      ? `${relativeDirectory}/${entry.name}`
      : entry.name;
    if (isExcluded(relative)) continue;

    if (manifestOutputPath && path.resolve(root, relative).toLowerCase() === manifestOutputPath.toLowerCase()) continue;
    if (entry.isDirectory()) {
      walkDirectory(root, relative, collected);
    } else if (entry.isFile()) {
      collected.push(relative);
    }
  }
  return collected;
}


function ignoredPaths(root, candidates) {
  if (candidates.length === 0) return new Set();
  try {
    const output = execFileSync('git', ['-C', root, 'check-ignore', '--stdin'], {
      encoding: 'utf8',
      input: candidates.join('\n'),
      maxBuffer: 64 * 1024 * 1024,
    });
    return new Set(output.split('\n').filter(Boolean));
  } catch (error) {

    if (error.status === 1) return new Set(String(error.stdout ?? '').split('\n').filter(Boolean));
    throw error;
  }
}

function listFiles(root) {
  const present = walkDirectory(root, '', []);
  const tracked = new Set(git(root, ['ls-files']).split('\n').filter(Boolean));
  const ignored = ignoredPaths(
    root,
    present.filter((file) => !tracked.has(file)),
  );
  return present
    .map((file) => ({
      path: file,
      classification: tracked.has(file)
        ? 'rastreado'
        : ignored.has(file)
          ? 'ignorado'
          : 'nao-rastreado',
    }))
    .sort((left, right) => left.path.localeCompare(right.path));
}

function hashFile(absolute) {
  return createHash('sha256').update(fs.readFileSync(absolute)).digest('hex');
}

function describeRepository(name, root) {
  if (!fs.existsSync(root)) {
    return { name, root, available: false, reason: 'checkout ausente' };
  }
  const files = listFiles(root).map((file) => {
    const absolute = path.join(root, file.path);
    const stats = fs.statSync(absolute);
    return {
      path: file.path,
      classification: file.classification,
      bytes: stats.size,
      sha256: hashFile(absolute),
    };
  });
  const aggregate = createHash('sha256');
  for (const file of files) aggregate.update(`${file.path}:${file.sha256}\n`);
  const status = git(root, ['status', '--porcelain=v1']);
  return {
    name,
    root: path.resolve(root),
    available: true,
    head: git(root, ['rev-parse', 'HEAD']),
    branch: git(root, ['rev-parse', '--abbrev-ref', 'HEAD']),
    dirty: status.length > 0,
    trackedFiles: files.filter((file) => file.classification === 'rastreado').length,
    untrackedFiles: files.filter((file) => file.classification === 'nao-rastreado').length,
    ignoredFiles: files.filter((file) => file.classification === 'ignorado').length,
    modifiedTracked: status
      .split('\n')
      .filter((line) => line && !line.startsWith('??'))
      .map((line) => line.slice(3).replace(/^"|"$/g, '')),
    workingTreeSha256: aggregate.digest('hex'),
    files,
  };
}

function main() {
  const options = parseArguments(process.argv.slice(2));
  manifestOutputPath = options.out ? path.resolve(options.out) : null;
  const webRoot = path.resolve(__dirname, '..', '..');
  const backendRoot = process.env.ALLERVIA_BACKEND_ROOT
    ? path.resolve(process.env.ALLERVIA_BACKEND_ROOT)
    : path.resolve(webRoot, '..', 'allervia-backend');

  const manifest = {
    schemaVersion: 1,
    runId: options.runId,
    generatedAt: new Date().toISOString(),
    scope: 'LOCAL_INTEGRADO',
    excludedGeneratedFiles: manifestOutputPath ? [manifestOutputPath] : [],
    environment: {
      platform: process.platform,
      release: require('node:os').release(),
      node: process.version,
      npm: commandVersion('npm', ['-v']),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    repositories: [
      describeRepository('allervia-web', webRoot),
      describeRepository('allervia-backend', backendRoot),
    ],
  };

  const serialized = JSON.stringify(manifest, null, 2) + '\n';
  if (options.out) {
    fs.mkdirSync(path.dirname(path.resolve(options.out)), { recursive: true });
    fs.writeFileSync(path.resolve(options.out), serialized);
    const summary = manifest.repositories
      .filter((repository) => repository.available)
      .map(
        (repository) =>
          `${repository.name} ${repository.head.slice(0, 10)} tree=${repository.workingTreeSha256.slice(0, 12)} arquivos=${repository.files.length}`,
      )
      .join('\n');
    process.stdout.write(`${summary}\n${path.resolve(options.out)}\n`);
  } else {
    process.stdout.write(serialized);
  }
}

main();
