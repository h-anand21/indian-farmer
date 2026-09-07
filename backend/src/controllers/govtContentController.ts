/**
 * govtContentController — Phase 11
 * REST handlers for Government Hub API
 */

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { govtContentService } from '../services/govtContentService.js';
import { GovContentType, GovContentPriority } from '@prisma/client';

const prisma = new PrismaClient();

// Helper — get farmerId from firebaseUid
async function getFarmerId(firebaseUid: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { firebaseUid },
    include: { farmer: { select: { id: true } } },
  });
  return user?.farmer?.id ?? null;
}

// GET /api/govt-content — List all with filters
export async function listContent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { type, priority, state, crop, search, limit, offset } = req.query;
    const result = await govtContentService.list({
      type: type as GovContentType | undefined,
      priority: priority as GovContentPriority | undefined,
      state: state as string | undefined,
      crop: crop as string | undefined,
      search: search as string | undefined,
      limit: limit ? parseInt(String(limit)) : 20,
      offset: offset ? parseInt(String(offset)) : 0,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

// GET /api/govt-content/alerts — Urgent + High priority items
export async function getAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { state, limit } = req.query;
    const alerts = await govtContentService.getAlerts(
      state as string | undefined,
      limit ? parseInt(String(limit)) : 5
    );
    res.json({ success: true, data: alerts });
  } catch (error) {
    next(error);
  }
}

// GET /api/govt-content/msp — All current MSP rates
export async function getMspRates(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { season } = req.query;
    const rates = await govtContentService.getMspRates(season as string | undefined);
    res.json({ success: true, data: rates });
  } catch (error) {
    next(error);
  }
}

// GET /api/govt-content/schemes — Active schemes
export async function getSchemes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { state } = req.query;
    const schemes = await govtContentService.getSchemes(state as string | undefined);
    res.json({ success: true, data: schemes });
  } catch (error) {
    next(error);
  }
}

// GET /api/govt-content/farmer/for-you — Personalised feed
export async function getForYouFeed(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const farmerId = await getFarmerId(req.user!.uid);
    if (!farmerId) {
      res.status(404).json({ success: false, error: 'Farmer profile not found' });
      return;
    }
    const { limit } = req.query;
    const feed = await govtContentService.getForYouFeed(farmerId, limit ? parseInt(String(limit)) : 10);
    res.json({ success: true, data: feed });
  } catch (error) {
    next(error);
  }
}

// GET /api/govt-content/farmer/bookmarks — Farmer's saved items
export async function getBookmarks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const farmerId = await getFarmerId(req.user!.uid);
    if (!farmerId) {
      res.status(404).json({ success: false, error: 'Farmer profile not found' });
      return;
    }
    const bookmarks = await govtContentService.getBookmarks(farmerId);
    res.json({ success: true, data: bookmarks });
  } catch (error) {
    next(error);
  }
}

// POST /api/govt-content/:id/bookmark — Toggle bookmark
export async function toggleBookmark(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const farmerId = await getFarmerId(req.user!.uid);
    if (!farmerId) {
      res.status(404).json({ success: false, error: 'Farmer profile not found' });
      return;
    }
    const result = await govtContentService.toggleBookmark(id, farmerId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

// GET /api/govt-content/:id — Single content item
export async function getContentById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const content = await govtContentService.getById(id);
    if (!content) {
      res.status(404).json({ success: false, error: 'Content not found' });
      return;
    }
    res.json({ success: true, data: content });
  } catch (error) {
    next(error);
  }
}

// POST /api/govt-content — Create (Admin only)
export async function createContent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const content = await govtContentService.create(req.body);
    res.status(201).json({ success: true, data: content });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/govt-content/:id — Update (Admin only)
export async function updateContent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const content = await govtContentService.update(id, req.body);
    res.json({ success: true, data: content });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/govt-content/:id — Delete (Admin only)
export async function deleteContent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await govtContentService.delete(id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    next(error);
  }
}

// POST /api/govt-content/seed — Seed initial data
export async function seedContent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await govtContentService.seed();
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
