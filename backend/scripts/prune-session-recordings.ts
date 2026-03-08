import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";
import { env } from "../src/config/env.js";
import { deleteObject } from "../src/lib/storage.js";

const BATCH_SIZE = 200;

interface PruneStats {
  scanned: number;
  deleted: number;
  storageDeleteFailures: number;
}

const run = async (): Promise<void> => {
  const cutoff = new Date(Date.now() - env.SESSION_RECORDING_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const stats: PruneStats = {
    scanned: 0,
    deleted: 0,
    storageDeleteFailures: 0
  };

  while (true) {
    const expired = await prisma.sessionRecording.findMany({
      where: {
        createdAt: {
          lt: cutoff
        }
      },
      orderBy: {
        createdAt: "asc"
      },
      take: BATCH_SIZE,
      select: {
        id: true,
        storagePath: true
      }
    });

    if (expired.length === 0) {
      break;
    }

    stats.scanned += expired.length;

    for (const item of expired) {
      try {
        await deleteObject(item.storagePath);
      } catch {
        stats.storageDeleteFailures += 1;
      }

      await prisma.sessionRecording.delete({ where: { id: item.id } });
      stats.deleted += 1;
    }
  }

  console.log("\nSession Recording Retention Prune Report");
  console.log("======================================");
  console.log(`cutoff=${cutoff.toISOString()}`);
  console.log(`scanned=${stats.scanned}`);
  console.log(`deleted=${stats.deleted}`);
  console.log(`storage_delete_failures=${stats.storageDeleteFailures}`);
};

run()
  .catch((error) => {
    const message = error instanceof Error ? error.message : "unknown error";
    console.error(`Retention prune failed: ${message}`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
