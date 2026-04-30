import { spawnSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = join(scriptDir, "..");
const srcDir = join(backendRoot, "src");
const require = createRequire(import.meta.url);

const findTestFiles = (dir) => {
  return readdirSync(dir)
    .flatMap((entry) => {
      const fullPath = join(dir, entry);
      const stats = statSync(fullPath);

      if (stats.isDirectory()) {
        return findTestFiles(fullPath);
      }

      return entry.endsWith(".test.ts") ? [relative(backendRoot, fullPath)] : [];
    })
    .sort();
};

const testFiles = findTestFiles(srcDir);

if (testFiles.length === 0) {
  console.error("No backend test files found under src.");
  process.exit(1);
}

const tsxCli = require.resolve("tsx/cli");
const result = spawnSync(process.execPath, [tsxCli, "--test", ...testFiles], {
  cwd: backendRoot,
  stdio: "inherit",
  shell: false
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
