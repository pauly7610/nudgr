import { PrismaClient } from "@prisma/client";
import { promises as fs } from "node:fs";
import path from "node:path";
import "dotenv/config";

interface CheckResult {
  name: string;
  ok: boolean;
  details: string;
}

const prisma = new PrismaClient();

const requiredEnv = [
  "DATABASE_URL",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "S3_ENDPOINT",
  "S3_BUCKET",
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY"
] as const;

const run = async (): Promise<void> => {
  const results: CheckResult[] = [];

  const scanForDeprecatedSupabaseImports = async (directory: string): Promise<number> => {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    let staleRefs = 0;

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        staleRefs += await scanForDeprecatedSupabaseImports(fullPath);
        continue;
      }

      if (!entry.isFile() || (!fullPath.endsWith(".ts") && !fullPath.endsWith(".tsx"))) {
        continue;
      }

      const content = await fs.readFile(fullPath, "utf8");
      if (content.includes("@/integrations/supabase/client")) {
        staleRefs += 1;
      }
    }

    return staleRefs;
  };

  const srcDir = path.resolve(process.cwd(), "..", "src");
  try {
    const staleRefCount = await scanForDeprecatedSupabaseImports(srcDir);
    results.push({
      name: "app:supabase-runtime-references",
      ok: staleRefCount === 0,
      details: staleRefCount === 0 ? "none found" : `${staleRefCount} stale import(s)`
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "scan failed";
    results.push({
      name: "app:supabase-runtime-references",
      ok: false,
      details: message
    });
  }

  for (const key of requiredEnv) {
    const value = process.env[key];
    results.push({
      name: `env:${key}`,
      ok: Boolean(value && value.length > 0),
      details: value ? "set" : "missing"
    });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    results.push({ name: "db:connectivity", ok: true, details: "reachable" });

    const pendingMigrations = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count
      FROM "_prisma_migrations"
      WHERE finished_at IS NULL AND rolled_back_at IS NULL
    `;

    const migrationIssues = Number(pendingMigrations[0]?.count ?? 0n);
    results.push({
      name: "db:migrations",
      ok: migrationIssues === 0,
      details: migrationIssues === 0 ? "all applied" : `${migrationIssues} unfinished migration(s)`
    });

    const counts = await Promise.all([
      prisma.user.count(),
      prisma.frictionEvent.count(),
      prisma.performanceMetric.count(),
      prisma.errorLog.count(),
      prisma.sessionRecording.count(),
      prisma.exportJob.count()
    ]);

    results.push({ name: "data:user", ok: true, details: `${counts[0]} rows` });
    results.push({ name: "data:friction_event", ok: true, details: `${counts[1]} rows` });
    results.push({ name: "data:performance_metric", ok: true, details: `${counts[2]} rows` });
    results.push({ name: "data:error_log", ok: true, details: `${counts[3]} rows` });
    results.push({ name: "data:session_recording", ok: true, details: `${counts[4]} rows` });
    results.push({ name: "data:export_job", ok: true, details: `${counts[5]} rows` });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    results.push({ name: "db:connectivity", ok: false, details: message });
  } finally {
    await prisma.$disconnect();
  }

  const failures = results.filter((item) => !item.ok);

  console.log("\nPhase 7 Cutover Readiness Report");
  console.log("================================");
  for (const result of results) {
    console.log(`${result.ok ? "PASS" : "FAIL"}  ${result.name}  (${result.details})`);
  }

  if (failures.length > 0) {
    console.error(`\nCutover check failed with ${failures.length} blocking issue(s).`);
    process.exit(1);
  }

  console.log("\nCutover check passed.");
};

void run();
