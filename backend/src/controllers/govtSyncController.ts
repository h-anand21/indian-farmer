/**
 * govtSyncController.ts — Phase 12
 * Admin REST endpoints for the Government Data Sync system
 */

import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { getSyncHealth } from '../services/govtSyncService';
import { triggerManualSync, isSyncRunning } from '../workers/syncWorker';
import { SyncSourceStatus } from '@prisma/client';

// GET /api/govt-sync/health
export async function getSyncHealthHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const health = await getSyncHealth();
    res.json({ success: true, data: health });
  } catch (error) {
    next(error);
  }
}

// GET /api/govt-sync/sources
export async function listSources(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sources = await prisma.govSyncSource.findMany({
      orderBy: { name: 'asc' },
      include: {
        syncLogs: {
          orderBy: { startedAt: 'desc' },
          take: 1,
        },
      },
    });
    res.json({ success: true, data: sources });
  } catch (error) {
    next(error);
  }
}

// POST /api/govt-sync/trigger  (manual sync — all or specific source)
export async function triggerSync(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (isSyncRunning()) {
      res.status(409).json({
        success: false,
        error: 'Sync already in progress. Please wait for it to finish.',
      });
      return;
    }

    const { sourceId } = req.body;

    // Fire sync in background (non-blocking)
    triggerManualSync(sourceId).catch((err) =>
      console.error('[SyncController] Manual sync error:', err.message)
    );

    res.json({
      success: true,
      message: sourceId
        ? `Sync triggered for source ${sourceId}`
        : 'Full sync triggered for all active sources',
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/govt-sync/logs
export async function getSyncLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = Math.min(parseInt(String(req.query.limit) || '20'), 100);
    const sourceId = req.query.sourceId ? String(req.query.sourceId) : undefined;

    const logs = await prisma.syncLog.findMany({
      where: sourceId ? { sourceId } : undefined,
      orderBy: { startedAt: 'desc' },
      take: limit,
      include: {
        source: { select: { name: true, type: true } },
      },
    });

    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
}

// PUT /api/govt-sync/sources/:id  (enable/disable/update a source)
export async function updateSource(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params.id);
    const { status, autoPublish, cronExpression } = req.body;

    const updated = await prisma.govSyncSource.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(autoPublish !== undefined && { autoPublish }),
        ...(cronExpression !== undefined && { cronExpression }),
        // Reset error count when manually re-enabling
        ...(status === SyncSourceStatus.ACTIVE && { consecutiveErrors: 0 }),
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

// POST /api/govt-sync/pending/:id/approve  (approve a DRAFT item → PUBLISHED)
export async function approveContent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params.id);
    const content = await prisma.governmentContent.update({
      where: { id },
      data: { status: 'PUBLISHED', verifiedAt: new Date() },
    });
    res.json({ success: true, data: content });
  } catch (error) {
    next(error);
  }
}

// POST /api/govt-sync/pending/:id/reject  (reject a DRAFT item → ARCHIVED)
export async function rejectContent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params.id);
    const content = await prisma.governmentContent.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
    res.json({ success: true, data: content });
  } catch (error) {
    next(error);
  }
}

// GET /api/govt-sync/pending  (items awaiting admin verification)
export async function getPendingContent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = Math.min(parseInt(String(req.query.limit) || '20'), 50);
    const items = await prisma.governmentContent.findMany({
      where: { status: 'DRAFT' },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });
    const total = await prisma.governmentContent.count({ where: { status: 'DRAFT' } });
    res.json({ success: true, data: { items, total } });
  } catch (error) {
    next(error);
  }
}

// GET /api/govt-sync/last-sync  (public — last sync time for "Last synced X ago" UI)
export async function getLastSyncTime(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const lastLog = await prisma.syncLog.findFirst({
      where: { status: { in: ['SUCCESS', 'PARTIAL', 'SKIPPED'] } },
      orderBy: { completedAt: 'desc' },
      select: { completedAt: true, itemsImported: true, status: true },
    });

    const lastContent = await prisma.governmentContent.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    res.json({
      success: true,
      data: {
        lastSyncAt: lastLog?.completedAt || null,
        lastContentAt: lastContent?.createdAt || null,
        isRunning: isSyncRunning(),
        lastImported: lastLog?.itemsImported || 0,
      },
    });
  } catch (error) {
    next(error);
  }
}
