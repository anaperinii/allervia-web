const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { default: openapiTS, astToString } = require('openapi-typescript');

async function main() {
  const root = path.resolve(__dirname, '..');
  const contract = path.resolve(root, '../allervia-backend/docs/contracts/openapi.json');
  const target = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, 'src/shared/api/generated/openapi.d.ts');
  const ast = await openapiTS(pathToFileURL(contract));
  const source = astToString(ast, { formatOptions: { removeComments: true } });
  fs.writeFileSync(target, source);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
