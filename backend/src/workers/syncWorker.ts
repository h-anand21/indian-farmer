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

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 3000,
  context = 'Operation'
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      if (attempt === retries) throw err;
      console.warn(
        `[SyncWorker] ⏳ ${context} waiting for database (attempt ${attempt}/${retries}). Retrying in ${delayMs / 1000}s...`
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error(`${context} failed after ${retries} attempts`);
}

let cronTask: ScheduledTask | null = null;

export function startSyncWorker(): void {
  console.log('[SyncWorker] 🌾 Initializing Government Data Sync Worker...');

  // Allow database connection pool to settle (Neon serverless wake-up)
  setTimeout(async () => {
    try {
      await retryWithBackoff(() => seedSyncSources(), 3, 3000, 'Source Seeding');
      console.log('[SyncWorker] ✅ Sync sources verified & ready');

      // Run initial sync after seeding successfully completes
      await retryWithBackoff(() => executeSyncJob(), 2, 4000, 'Initial Sync');
    } catch (err: any) {
      console.warn('[SyncWorker] ⚠️ Sync worker initialization deferred:', err.message);
    }
  }, 3000);

  // Schedule recurring sync every 6 hours
  cronTask = cron.schedule('0 */6 * * *', async () => {
    console.log('[SyncWorker] 🕐 Cron triggered — running scheduled sync');
    await executeSyncJob();
  });

  console.log('[SyncWorker] ✅ Cron worker scheduled — runs every 6 hours');
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
