/**
 * govtSyncRoutes.ts — Phase 12
 * Routes for Government Data Sync admin API
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getSyncHealthHandler,
  listSources,
  triggerSync,
  getSyncLogs,
  updateSource,
  approveContent,
  rejectContent,
  getPendingContent,
  getLastSyncTime,
} from '../controllers/govtSyncController';

const router = Router();

// ── Public endpoint (no auth) ─────────────────────────────────────────────
router.get('/last-sync', getLastSyncTime);

// ── Admin endpoints ───────────────────────────────────────────────────────
router.get('/health', authMiddleware, getSyncHealthHandler);
router.get('/sources', authMiddleware, listSources);
router.post('/trigger', authMiddleware, triggerSync);
router.get('/logs', authMiddleware, getSyncLogs);
router.put('/sources/:id', authMiddleware, updateSource);
router.get('/pending', authMiddleware, getPendingContent);
router.post('/pending/:id/approve', authMiddleware, approveContent);
router.post('/pending/:id/reject', authMiddleware, rejectContent);

export default router;
