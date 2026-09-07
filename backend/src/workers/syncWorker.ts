/**
 * syncWorker.ts — Phase 12
 * Cron-based background worker that runs the government data sync
 *
 * Schedule: Every 6 hours (0 *\/6 * * *)
 * Also exposes a manual trigger for admin use
 */

import cron, { ScheduledTask } from 'node-cron';
import { runSync, seedSyncSources } from '../services/govtSyncService';

let isRunning = false;

async function executeSyncJob(sourceId?: string): Promise<void> {
  if (isRunning) {
    console.log('[SyncWorker] Sync already in progress — skipping this run');
    return;
  }

  isRunning = true;
  const startTime = Date.now();
  console.log(`[SyncWorker] ⚡ Starting government data sync${sourceId ? ` for source ${sourceId}` : ' (all sources)'}...`);

  try {
    const { results } = await runSync(sourceId);

    const totalImported = Object.values(results).reduce((sum, r) => sum + r.imported, 0);
    const totalSkipped = Object.values(results).reduce((sum, r) => sum + r.skipped, 0);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`[SyncWorker] ✅ Sync complete in ${duration}s — imported: ${totalImported}, skipped (duplicates): ${totalSkipped}`);
  } catch (err: any) {
    console.error('[SyncWorker] ❌ Sync failed:', err.message);
  } finally {
    isRunning = false;
  }
}

let cronTask: ScheduledTask | null = null;

export function startSyncWorker(): void {
  console.log('[SyncWorker] 🌾 Initializing Government Data Sync Worker...');

  // Seed source registry on first boot
  seedSyncSources().catch((err) =>
    console.error('[SyncWorker] Source seeding failed:', err.message)
  );

  // Run an immediate first sync (with a 5s delay to allow DB connections to settle)
  setTimeout(() => {
    executeSyncJob().catch((err) =>
      console.error('[SyncWorker] Initial sync failed:', err.message)
    );
  }, 5000);

  // Schedule recurring sync every 6 hours
  cronTask = cron.schedule('0 */6 * * *', async () => {
    console.log('[SyncWorker] 🕐 Cron triggered — running scheduled sync');
    await executeSyncJob();
  });

  console.log('[SyncWorker] ✅ Cron worker started — runs every 6 hours');
}

export function stopSyncWorker(): void {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
    console.log('[SyncWorker] Stopped');
  }
}

/** Manual trigger — called from admin API */
export async function triggerManualSync(sourceId?: string): Promise<void> {
  return executeSyncJob(sourceId);
}

export function isSyncRunning(): boolean {
  return isRunning;
}
