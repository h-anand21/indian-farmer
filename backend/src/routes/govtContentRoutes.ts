/**
 * govtContentRoutes — Phase 11
 * Government Hub API routes
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  listContent,
  getAlerts,
  getMspRates,
  getSchemes,
  getForYouFeed,
  getBookmarks,
  toggleBookmark,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
  seedContent,
} from '../controllers/govtContentController.js';

const router = Router();

// ── Public endpoints (no auth required) ──────────────────────────────────
router.get('/', listContent);
router.get('/alerts', getAlerts);
router.get('/msp', getMspRates);
router.get('/schemes', getSchemes);
router.get('/:id', getContentById);

// ── Farmer endpoints (auth required) ─────────────────────────────────────
router.get('/farmer/for-you', authMiddleware, getForYouFeed);
router.get('/farmer/bookmarks', authMiddleware, getBookmarks);
router.post('/:id/bookmark', authMiddleware, toggleBookmark);

// ── Admin endpoints (admin auth required) ────────────────────────────────
router.post('/', authMiddleware, createContent);
router.post('/seed', authMiddleware, seedContent);
router.patch('/:id', authMiddleware, updateContent);
router.delete('/:id', authMiddleware, deleteContent);

export default router;
