/**
 * GovtContentService — Phase 11
 * Manages Government Hub content: MSP updates, schemes, weather advisories, etc.
 */

import prisma from '../config/database';
import { GovContentType, GovContentPriority, GovContentStatus } from '@prisma/client';

// ── Types ──────────────────────────────────────────────────────────────────

export interface CreateGovContentInput {
  type: GovContentType;
  priority?: GovContentPriority;
  title: string;
  titleHindi?: string;
  summary: string;
  summaryHindi?: string;
  body?: string;
  bodyHindi?: string;
  targetStates?: string[];
  targetCrops?: string[];
  targetRoles?: string[];
  sourceOrg: string;
  sourceUrl?: string;
  verifiedAt?: Date;
  expiresAt?: Date;
  effectiveDate?: Date;
  cropName?: string;
  mspAmount?: number;
  mspSeason?: string;
  previousMsp?: number;
  schemeId?: string;
  benefitAmount?: number;
  applyUrl?: string;
  deadline?: Date;
}

export interface GovContentFilters {
  type?: GovContentType;
  priority?: GovContentPriority;
  state?: string;
  crop?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

// ── Service ────────────────────────────────────────────────────────────────

export const govtContentService = {

  /** List published content with optional filters */
  async list(filters: GovContentFilters = {}) {
    const { type, priority, state, crop, search, limit = 20, offset = 0 } = filters;

    const where: any = {
      status: GovContentStatus.PUBLISHED,
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } },
      ],
    };

    if (type) where.type = type;
    if (priority) where.priority = priority;
    if (state) where.targetStates = { hasSome: [state, 'ALL'] };
    if (crop) where.targetCrops = { hasSome: [crop, 'ALL'] };
    if (search) {
      where.AND = [
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { summary: { contains: search, mode: 'insensitive' } },
            { titleHindi: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.governmentContent.findMany({
        where,
        orderBy: [
          { priority: 'desc' },
          { publishedAt: 'desc' },
        ],
        take: limit,
        skip: offset,
        include: { _count: { select: { bookmarks: true } } },
      }),
      prisma.governmentContent.count({ where }),
    ]);

    return { items, total, limit, offset };
  },

  /** Get single content by ID and increment view count */
  async getById(id: string) {
    const content = await prisma.governmentContent.findUnique({
      where: { id },
      include: { _count: { select: { bookmarks: true } } },
    });

    if (!content) return null;

    // Increment view count async (fire-and-forget)
    prisma.governmentContent.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {});

    return content;
  },

  /** Get urgent / high-priority items for dashboard widget */
  async getAlerts(state?: string, limit = 5) {
    const where: any = {
      status: GovContentStatus.PUBLISHED,
      priority: { in: [GovContentPriority.URGENT, GovContentPriority.HIGH] },
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } },
      ],
    };

    if (state) {
      where.targetStates = { hasSome: [state, 'ALL'] };
    }

    return prisma.governmentContent.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { publishedAt: 'desc' }],
      take: limit,
    });
  },

  /** "For You" personalised feed based on farmer profile */
  async getForYouFeed(farmerId: string, limit = 10) {
    // Fetch farmer profile for personalisation
    const farmer = await prisma.farmer.findUnique({
      where: { id: farmerId },
      include: { crops: { select: { name: true } } },
    });

    if (!farmer) return [];

    const farmerState = farmer.state ?? 'ALL';
    const farmerCrops = farmer.crops.map((c) => c.name);

    const where: any = {
      status: GovContentStatus.PUBLISHED,
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } },
      ],
      // Relevant to farmer's state or national
      AND: [
        {
          OR: [
            { targetStates: { hasSome: [farmerState] } },
            { targetStates: { isEmpty: true } },
          ],
        },
      ],
    };

    const items = await prisma.governmentContent.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { publishedAt: 'desc' }],
      take: limit * 3, // Over-fetch to allow crop-relevance boost
    });

    // Boost items matching farmer's crops
    const scored = items.map((item) => {
      let score = 0;
      if (item.priority === GovContentPriority.URGENT) score += 100;
      if (item.priority === GovContentPriority.HIGH) score += 50;
      if (item.type === GovContentType.MSP_UPDATE && item.cropName && farmerCrops.includes(item.cropName)) score += 80;
      if (item.type === GovContentType.SCHEME) score += 30;
      if (item.type === GovContentType.WEATHER_ADVISORY) score += 20;
      if (item.targetStates.includes(farmerState)) score += 40;
      return { ...item, _score: score };
    });

    return scored
      .sort((a, b) => b._score - a._score)
      .slice(0, limit);
  },

  /** Get all current MSP rates */
  async getMspRates(season?: string) {
    const where: any = {
      type: GovContentType.MSP_UPDATE,
      status: GovContentStatus.PUBLISHED,
      mspAmount: { not: null },
    };

    if (season) where.mspSeason = season;

    return prisma.governmentContent.findMany({
      where,
      orderBy: [{ mspSeason: 'desc' }, { cropName: 'asc' }],
    });
  },

  /** Get active schemes */
  async getSchemes(state?: string) {
    const where: any = {
      type: GovContentType.SCHEME,
      status: GovContentStatus.PUBLISHED,
      OR: [
        { deadline: null },
        { deadline: { gte: new Date() } },
      ],
    };

    if (state) {
      where.AND = [
        {
          OR: [
            { targetStates: { hasSome: [state] } },
            { targetStates: { isEmpty: true } },
          ],
        },
      ];
    }

    return prisma.governmentContent.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { publishedAt: 'desc' }],
    });
  },

  /** Toggle bookmark for a farmer */
  async toggleBookmark(contentId: string, farmerId: string) {
    const existing = await prisma.govContentBookmark.findUnique({
      where: { contentId_farmerId: { contentId, farmerId } },
    });

    if (existing) {
      await prisma.govContentBookmark.delete({
        where: { contentId_farmerId: { contentId, farmerId } },
      });
      return { bookmarked: false };
    } else {
      await prisma.govContentBookmark.create({
        data: { contentId, farmerId },
      });
      return { bookmarked: true };
    }
  },

  /** Get farmer's bookmarks */
  async getBookmarks(farmerId: string) {
    const bookmarks = await prisma.govContentBookmark.findMany({
      where: { farmerId },
      include: { content: true },
      orderBy: { createdAt: 'desc' },
    });
    return bookmarks.map((b) => b.content);
  },

  /** Admin: Create new content */
  async create(data: CreateGovContentInput) {
    return prisma.governmentContent.create({
      data: {
        ...data,
        targetStates: data.targetStates ?? [],
        targetCrops: data.targetCrops ?? [],
        targetRoles: data.targetRoles ?? ['FARMER'],
        verifiedAt: data.verifiedAt ?? new Date(),
      },
    });
  },

  /** Admin: Update content */
  async update(id: string, data: Partial<CreateGovContentInput> & { status?: GovContentStatus }) {
    return prisma.governmentContent.update({
      where: { id },
      data,
    });
  },

  /** Admin: Delete content */
  async delete(id: string) {
    return prisma.governmentContent.delete({ where: { id } });
  },

  /** Seed initial government data (run once) */
  async seed() {
    const existing = await prisma.governmentContent.count();
    if (existing > 0) return { message: 'Already seeded', count: existing };

    const items: CreateGovContentInput[] = [
      // ── MSP Updates ──────────────────────────────────────────────────
      {
        type: GovContentType.MSP_UPDATE,
        priority: GovContentPriority.HIGH,
        title: 'MSP for Wheat (Rabi 2025-26) fixed at ₹2,425/quintal',
        titleHindi: 'गेहूँ का एमएसपी (रबी 2025-26) ₹2,425/क्विंटल निर्धारित',
        summary: 'Cabinet Committee on Economic Affairs (CCEA) has approved MSP for Wheat at ₹2,425 per quintal for Rabi Marketing Season 2025-26, an increase of ₹150 from last year.',
        summaryHindi: 'सीसीईए ने रबी विपणन सीजन 2025-26 के लिए गेहूँ का एमएसपी ₹2,425 प्रति क्विंटल अनुमोदित किया।',
        sourceOrg: 'CCEA / MoA&FW',
        sourceUrl: 'https://pib.gov.in/PressReleasePage.aspx?PRID=2080000',
        verifiedAt: new Date('2025-10-15'),
        effectiveDate: new Date('2026-04-01'),
        cropName: 'Wheat',
        mspAmount: 2425,
        mspSeason: 'Rabi 2025-26',
        previousMsp: 2275,
        targetStates: [],
        targetCrops: ['Wheat'],
        targetRoles: ['FARMER'],
      },
      {
        type: GovContentType.MSP_UPDATE,
        priority: GovContentPriority.HIGH,
        title: 'MSP for Paddy (Kharif 2025-26) fixed at ₹2,300/quintal',
        titleHindi: 'धान का एमएसपी (खरीफ 2025-26) ₹2,300/क्विंटल निर्धारित',
        summary: 'Government has announced MSP for Common Grade Paddy at ₹2,300/quintal for Kharif Marketing Season 2025-26.',
        summaryHindi: 'सरकार ने खरीफ विपणन सीजन 2025-26 के लिए सामान्य ग्रेड धान का एमएसपी ₹2,300 प्रति क्विंटल घोषित किया।',
        sourceOrg: 'CCEA / MoA&FW',
        sourceUrl: 'https://pib.gov.in',
        verifiedAt: new Date('2025-06-01'),
        effectiveDate: new Date('2025-10-01'),
        cropName: 'Paddy',
        mspAmount: 2300,
        mspSeason: 'Kharif 2025-26',
        previousMsp: 2183,
        targetStates: [],
        targetCrops: ['Paddy'],
        targetRoles: ['FARMER'],
      },
      {
        type: GovContentType.MSP_UPDATE,
        priority: GovContentPriority.NORMAL,
        title: 'MSP for Mustard (Rabi 2025-26) set at ₹5,950/quintal',
        titleHindi: 'सरसों का एमएसपी (रबी 2025-26) ₹5,950/क्विंटल',
        summary: 'CCEA approves Mustard (Rapeseed) MSP at ₹5,950 per quintal for Rabi 2025-26 season.',
        summaryHindi: 'सीसीईए ने रबी 2025-26 सीजन के लिए सरसों का एमएसपी ₹5,950 प्रति क्विंटल अनुमोदित किया।',
        sourceOrg: 'CCEA / MoA&FW',
        sourceUrl: 'https://pib.gov.in',
        verifiedAt: new Date('2025-10-15'),
        effectiveDate: new Date('2026-02-01'),
        cropName: 'Mustard',
        mspAmount: 5950,
        mspSeason: 'Rabi 2025-26',
        previousMsp: 5650,
        targetStates: ['Rajasthan', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh'],
        targetCrops: ['Mustard'],
        targetRoles: ['FARMER'],
      },
      // ── Schemes ──────────────────────────────────────────────────────
      {
        type: GovContentType.SCHEME,
        priority: GovContentPriority.HIGH,
        title: 'PM-Kisan: 19th Instalment ₹2,000 to be released',
        titleHindi: 'पीएम किसान: 19वीं किस्त ₹2,000 जारी होगी',
        summary: 'The 19th instalment of PM-KISAN (Pradhan Mantri Kisan Samman Nidhi) is scheduled for release. Registered farmers will receive ₹2,000 directly into their bank accounts.',
        summaryHindi: 'पीएम-किसान की 19वीं किस्त ₹2,000 सीधे बैंक खाते में आएगी।',
        schemeId: 'PM-KISAN',
        benefitAmount: 2000,
        applyUrl: 'https://pmkisan.gov.in',
        sourceOrg: 'MoA&FW / PM-KISAN',
        sourceUrl: 'https://pmkisan.gov.in',
        verifiedAt: new Date('2026-01-01'),
        deadline: new Date('2026-03-31'),
        targetStates: [],
        targetCrops: [],
        targetRoles: ['FARMER'],
      },
      {
        type: GovContentType.SCHEME,
        priority: GovContentPriority.HIGH,
        title: 'PMFBY: Kharif Crop Insurance — Application Open',
        titleHindi: 'पीएमएफबीवाई: खरीफ फसल बीमा — आवेदन खुला है',
        summary: 'Pradhan Mantri Fasal Bima Yojana (PMFBY) applications are now open for Kharif season 2025-26. Farmers can register through bank branches, CSCs, or the PMFBY app.',
        summaryHindi: 'पीएमएफबीवाई खरीफ 2025-26 के लिए आवेदन खुले हैं। बैंक, सीएससी या पीएमएफबीवाई ऐप से आवेदन करें।',
        schemeId: 'PMFBY',
        benefitAmount: 0,
        applyUrl: 'https://pmfby.gov.in',
        sourceOrg: 'MoA&FW / PMFBY',
        sourceUrl: 'https://pmfby.gov.in',
        verifiedAt: new Date('2025-06-01'),
        deadline: new Date('2025-08-31'),
        targetStates: [],
        targetCrops: [],
        targetRoles: ['FARMER'],
      },
      {
        type: GovContentType.SCHEME,
        priority: GovContentPriority.NORMAL,
        title: 'Kisan Credit Card (KCC) — Easy Loan up to ₹3 Lakh @ 4%',
        titleHindi: 'किसान क्रेडिट कार्ड (केसीसी) — ₹3 लाख तक ऋण 4% पर',
        summary: 'KCC provides short-term credit to farmers for crop cultivation, post-harvest expenses, and maintenance of farm assets. Interest subvention makes it effectively available at 4% p.a.',
        summaryHindi: 'केसीसी से किसानों को फसल उत्पादन, कटाई के बाद की लागत के लिए अल्पकालिक ऋण मिलता है।',
        schemeId: 'KCC',
        benefitAmount: 300000,
        applyUrl: 'https://www.nabard.org/content.aspx?id=484',
        sourceOrg: 'NABARD / MoF',
        sourceUrl: 'https://www.nabard.org',
        verifiedAt: new Date('2025-01-01'),
        targetStates: [],
        targetCrops: [],
        targetRoles: ['FARMER'],
      },
      // ── Weather Advisories ────────────────────────────────────────────
      {
        type: GovContentType.WEATHER_ADVISORY,
        priority: GovContentPriority.URGENT,
        title: 'IMD Alert: Heavy Rainfall Expected in Northern India (Jan 10-14)',
        titleHindi: 'आईएमडी अलर्ट: उत्तर भारत में भारी वर्षा (10-14 जनवरी)',
        summary: 'India Meteorological Department warns of heavy to very heavy rainfall in Punjab, Haryana, UP and Uttarakhand due to active Western Disturbance. Farmers advised to delay harvesting and protect stored crops.',
        summaryHindi: 'पश्चिमी विक्षोभ के कारण पंजाब, हरियाणा, यूपी में भारी वर्षा। किसानों को कटाई स्थगित करने की सलाह।',
        sourceOrg: 'IMD (India Meteorological Department)',
        sourceUrl: 'https://mausam.imd.gov.in',
        verifiedAt: new Date('2026-01-09'),
        expiresAt: new Date('2026-01-15'),
        targetStates: ['Punjab', 'Haryana', 'Uttar Pradesh', 'Uttarakhand'],
        targetCrops: [],
        targetRoles: ['FARMER'],
      },
      // ── Market Alerts ─────────────────────────────────────────────────
      {
        type: GovContentType.MARKET_ALERT,
        priority: GovContentPriority.NORMAL,
        title: 'Rajasthan APMC Mandi Rates Update — Mustard & Wheat',
        titleHindi: 'राजस्थान एपीएमसी मंडी भाव — सरसों और गेहूँ',
        summary: 'Mustard prices at Jaipur mandi are at ₹5,800-6,100/quintal (above MSP). Wheat procurement at Kota has begun. Farmers are advised to check local mandi rates before selling.',
        summaryHindi: 'जयपुर मंडी में सरसों के भाव ₹5,800-6,100/क्विंटल (एमएसपी से ऊपर)। किसान स्थानीय मंडी भाव जाँचें।',
        sourceOrg: 'Rajasthan APMC / eNAM',
        sourceUrl: 'https://www.enam.gov.in',
        verifiedAt: new Date('2026-01-07'),
        targetStates: ['Rajasthan'],
        targetCrops: ['Mustard', 'Wheat'],
        targetRoles: ['FARMER'],
      },
      // ── Procurement Notices ───────────────────────────────────────────
      {
        type: GovContentType.PROCUREMENT_NOTICE,
        priority: GovContentPriority.HIGH,
        title: 'Rabi 2025-26 Wheat Procurement — Centres Opening April 1',
        titleHindi: 'रबी 2025-26 गेहूँ खरीद — केंद्र 1 अप्रैल से खुलेंगे',
        summary: 'State governments have announced that Rabi 2025-26 wheat procurement at MSP centres will begin from April 1, 2026. Farmers must pre-register online or at their nearest KisanQueue centre.',
        summaryHindi: 'गेहूँ एमएसपी खरीद केंद्र 1 अप्रैल 2026 से खुलेंगे। किसान पूर्व-पंजीकरण कराएं।',
        sourceOrg: 'FCI / State Food Department',
        sourceUrl: 'https://fci.gov.in',
        verifiedAt: new Date('2026-01-05'),
        effectiveDate: new Date('2026-04-01'),
        targetStates: ['Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan'],
        targetCrops: ['Wheat'],
        targetRoles: ['FARMER', 'OPERATOR'],
      },
      // ── Central Notices ───────────────────────────────────────────────
      {
        type: GovContentType.CENTRAL_NOTICE,
        priority: GovContentPriority.NORMAL,
        title: 'AgriStack Farmer ID — Registration Now Open in Pilot States',
        titleHindi: 'एग्रीस्टैक फार्मर आईडी — पायलट राज्यों में पंजीकरण शुरू',
        summary: 'The Government of India has launched the Farmer Registry under AgriStack for pilot states. A Farmer ID links land records, PM-KISAN, KCC, and insurance data for seamless benefit delivery.',
        summaryHindi: 'भारत सरकार ने एग्रीस्टैक के तहत फार्मर रजिस्ट्री शुरू की। फार्मर आईडी से सभी सरकारी योजनाओं का लाभ आसानी से मिलेगा।',
        sourceOrg: 'MoA&FW / Digital Agriculture Mission',
        sourceUrl: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2117390',
        verifiedAt: new Date('2026-01-01'),
        targetStates: [],
        targetCrops: [],
        targetRoles: ['FARMER'],
      },
    ];

    const created = await Promise.all(
      items.map((item) => govtContentService.create(item))
    );

    return { message: 'Seeded successfully', count: created.length };
  },
};
