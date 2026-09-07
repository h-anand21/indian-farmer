/**
 * Seed script for Phase 11 Government Hub
 * Run: npx tsx src/scripts/seedGovtContent.ts
 */

import prisma from '../config/database';
import { GovContentType, GovContentPriority } from '@prisma/client';

async function seed() {
  console.log('🌾 Seeding Government Hub content...');

  const existing = await prisma.governmentContent.count();
  if (existing > 0) {
    console.log(`✅ Already seeded (${existing} items). Skipping.`);
    await prisma.$disconnect();
    return;
  }

  const items = [
    {
      type: GovContentType.MSP_UPDATE,
      priority: GovContentPriority.HIGH,
      title: 'MSP for Wheat (Rabi 2025-26) fixed at ₹2,425/quintal',
      titleHindi: 'गेहूँ का एमएसपी (रबी 2025-26) ₹2,425/क्विंटल निर्धारित',
      summary: 'Cabinet Committee on Economic Affairs (CCEA) has approved MSP for Wheat at ₹2,425 per quintal for Rabi Marketing Season 2025-26, an increase of ₹150 from last year.',
      summaryHindi: 'सीसीईए ने रबी विपणन सीजन 2025-26 के लिए गेहूँ का एमएसपी ₹2,425 प्रति क्विंटल अनुमोदित किया।',
      sourceOrg: 'CCEA / MoA&FW',
      sourceUrl: 'https://pib.gov.in',
      verifiedAt: new Date('2025-10-15'),
      effectiveDate: new Date('2026-04-01'),
      cropName: 'Wheat',
      mspAmount: 2425,
      mspSeason: 'Rabi 2025-26',
      previousMsp: 2275,
      targetStates: [] as string[],
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
      targetStates: [] as string[],
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
    {
      type: GovContentType.MSP_UPDATE,
      priority: GovContentPriority.NORMAL,
      title: 'MSP for Maize (Kharif 2025-26) set at ₹2,225/quintal',
      titleHindi: 'मक्का का एमएसपी (खरीफ 2025-26) ₹2,225/क्विंटल',
      summary: 'CCEA approves Maize MSP at ₹2,225 per quintal for Kharif 2025-26.',
      summaryHindi: 'सीसीईए ने खरीफ 2025-26 के लिए मक्का का एमएसपी ₹2,225 प्रति क्विंटल अनुमोदित किया।',
      sourceOrg: 'CCEA / MoA&FW',
      sourceUrl: 'https://pib.gov.in',
      verifiedAt: new Date('2025-06-01'),
      cropName: 'Maize',
      mspAmount: 2225,
      mspSeason: 'Kharif 2025-26',
      previousMsp: 2090,
      targetStates: [] as string[],
      targetCrops: ['Maize'],
      targetRoles: ['FARMER'],
    },
    {
      type: GovContentType.SCHEME,
      priority: GovContentPriority.HIGH,
      title: 'PM-Kisan: 19th Instalment ₹2,000 to be released',
      titleHindi: 'पीएम किसान: 19वीं किस्त ₹2,000 जारी होगी',
      summary: 'The 19th instalment of PM-KISAN is scheduled. Registered farmers will receive ₹2,000 directly into their bank accounts. Ensure your eKYC is updated.',
      summaryHindi: 'पीएम-किसान की 19वीं किस्त ₹2,000 सीधे बैंक खाते में आएगी। ईकेवाईसी अपडेट करें।',
      schemeId: 'PM-KISAN',
      benefitAmount: 2000,
      applyUrl: 'https://pmkisan.gov.in',
      sourceOrg: 'MoA&FW / PM-KISAN',
      sourceUrl: 'https://pmkisan.gov.in',
      verifiedAt: new Date('2026-01-01'),
      deadline: new Date('2026-03-31'),
      targetStates: [] as string[],
      targetCrops: [] as string[],
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
      applyUrl: 'https://pmfby.gov.in',
      sourceOrg: 'MoA&FW / PMFBY',
      sourceUrl: 'https://pmfby.gov.in',
      verifiedAt: new Date('2025-06-01'),
      deadline: new Date('2026-08-31'),
      targetStates: [] as string[],
      targetCrops: [] as string[],
      targetRoles: ['FARMER'],
    },
    {
      type: GovContentType.SCHEME,
      priority: GovContentPriority.NORMAL,
      title: 'Kisan Credit Card (KCC) — Easy Loan up to ₹3 Lakh @ 4%',
      titleHindi: 'किसान क्रेडिट कार्ड (केसीसी) — ₹3 लाख तक ऋण 4% पर',
      summary: 'KCC provides short-term credit to farmers for crop cultivation at effectively 4% p.a. with interest subvention. Apply at any bank branch or Common Service Centre.',
      summaryHindi: 'केसीसी से किसानों को फसल उत्पादन के लिए 4% पर अल्पकालिक ऋण मिलता है।',
      schemeId: 'KCC',
      benefitAmount: 300000,
      applyUrl: 'https://www.nabard.org/content.aspx?id=484',
      sourceOrg: 'NABARD / MoF',
      sourceUrl: 'https://www.nabard.org',
      verifiedAt: new Date('2025-01-01'),
      targetStates: [] as string[],
      targetCrops: [] as string[],
      targetRoles: ['FARMER'],
    },
    {
      type: GovContentType.WEATHER_ADVISORY,
      priority: GovContentPriority.URGENT,
      title: 'IMD Alert: Heavy Rainfall Expected in Northern India (Jan 10-14)',
      titleHindi: 'आईएमडी अलर्ट: उत्तर भारत में भारी वर्षा (10-14 जनवरी)',
      summary: 'India Meteorological Department warns of heavy to very heavy rainfall in Punjab, Haryana, UP and Uttarakhand. Farmers advised to delay harvesting and protect stored crops.',
      summaryHindi: 'पश्चिमी विक्षोभ के कारण पंजाब, हरियाणा, यूपी में भारी वर्षा। किसानों को कटाई स्थगित करने की सलाह।',
      sourceOrg: 'IMD (India Meteorological Department)',
      sourceUrl: 'https://mausam.imd.gov.in',
      verifiedAt: new Date('2026-01-09'),
      expiresAt: new Date('2026-12-31'),
      targetStates: ['Punjab', 'Haryana', 'Uttar Pradesh', 'Uttarakhand'],
      targetCrops: [] as string[],
      targetRoles: ['FARMER'],
    },
    {
      type: GovContentType.MARKET_ALERT,
      priority: GovContentPriority.NORMAL,
      title: 'Rajasthan APMC Mandi Rates — Mustard & Wheat Above MSP',
      titleHindi: 'राजस्थान एपीएमसी मंडी भाव — सरसों और गेहूँ एमएसपी से ऊपर',
      summary: 'Mustard prices at Jaipur mandi are at ₹5,800-6,100/quintal (above MSP). Wheat procurement at Kota has begun. Farmers advised to check local mandi rates before selling.',
      summaryHindi: 'जयपुर मंडी में सरसों के भाव ₹5,800-6,100/क्विंटल (एमएसपी से ऊपर)।',
      sourceOrg: 'Rajasthan APMC / eNAM',
      sourceUrl: 'https://www.enam.gov.in',
      verifiedAt: new Date('2026-01-07'),
      targetStates: ['Rajasthan'],
      targetCrops: ['Mustard', 'Wheat'],
      targetRoles: ['FARMER'],
    },
    {
      type: GovContentType.PROCUREMENT_NOTICE,
      priority: GovContentPriority.HIGH,
      title: 'Rabi 2025-26 Wheat Procurement — Centres Opening April 1',
      titleHindi: 'रबी 2025-26 गेहूँ खरीद — केंद्र 1 अप्रैल से खुलेंगे',
      summary: 'State governments have announced Rabi 2025-26 wheat procurement at MSP centres from April 1, 2026. Farmers must pre-register online or at their nearest KisanQueue centre.',
      summaryHindi: 'गेहूँ एमएसपी खरीद केंद्र 1 अप्रैल 2026 से खुलेंगे। किसान पूर्व-पंजीकरण कराएं।',
      sourceOrg: 'FCI / State Food Department',
      sourceUrl: 'https://fci.gov.in',
      verifiedAt: new Date('2026-01-05'),
      effectiveDate: new Date('2026-04-01'),
      targetStates: ['Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan'],
      targetCrops: ['Wheat'],
      targetRoles: ['FARMER', 'OPERATOR'],
    },
    {
      type: GovContentType.CENTRAL_NOTICE,
      priority: GovContentPriority.NORMAL,
      title: 'AgriStack Farmer ID — Registration Now Open in Pilot States',
      titleHindi: 'एग्रीस्टैक फार्मर आईडी — पायलट राज्यों में पंजीकरण शुरू',
      summary: 'Government of India has launched the Farmer Registry under AgriStack. A Farmer ID links land records, PM-KISAN, KCC, and insurance data for seamless benefit delivery.',
      summaryHindi: 'भारत सरकार ने एग्रीस्टैक के तहत फार्मर रजिस्ट्री शुरू की। फार्मर आईडी से सभी सरकारी योजनाओं का लाभ आसानी से मिलेगा।',
      sourceOrg: 'MoA&FW / Digital Agriculture Mission',
      sourceUrl: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2117390',
      verifiedAt: new Date('2026-01-01'),
      targetStates: [] as string[],
      targetCrops: [] as string[],
      targetRoles: ['FARMER'],
    },
  ];

  for (const item of items) {
    await prisma.governmentContent.create({ data: item });
    process.stdout.write('.');
  }

  console.log(`\n✅ Seeded ${items.length} government content items!`);
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
});
