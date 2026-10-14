const { execFileSync } = require('node:child_process');
const { readFileSync, rmSync } = require('node:fs');
const { join, resolve } = require('node:path');
const os = require('node:os');

const ROOT = resolve(__dirname, '..');
const COMMITTED = join(ROOT, 'src/shared/api/generated/openapi.d.ts');
const FRESH = join(os.tmpdir(), `openapi-fresh-${process.pid}.d.ts`);

execFileSync(
  process.execPath,
  [
    join(ROOT, 'scripts/generate-contract-types.cjs'),
    FRESH,
  ],
  { stdio: 'pipe' },
);

const committed = readFileSync(COMMITTED, 'utf8').replace(/\r\n/g, '\n');
const fresh = readFileSync(FRESH, 'utf8').replace(/\r\n/g, '\n');
rmSync(FRESH);

if (committed !== fresh) {
  console.error(
    'src/shared/api/generated/openapi.d.ts is stale. Run "npm run contract:types" and commit the result.',
  );
  process.exit(1);
}
console.log('Generated types match the current contract.');
