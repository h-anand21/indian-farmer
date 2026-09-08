import { Router, Request, Response } from "express";

const router = Router();

// In-memory cache for resolved district tehsils / blocks
const districtCache = new Map<string, { timestamp: number; data: { name: string; pincode: string }[] }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * GET /api/geo/tehsils
 * Query params:
 *   - state (string)
 *   - district (string)
 * Dynamically resolves all authentic sub-divisions, blocks, and PIN codes for ANY district in India
 */
router.get("/tehsils", async (req: Request, res: Response): Promise<void> => {
  try {
    const state = ((req.query.state as string) || "").trim();
    const district = ((req.query.district as string) || "").trim();

    if (!district) {
      res.status(400).json({ success: false, message: "district parameter is required" });
      return;
    }

    const cacheKey = `${state.toLowerCase()}__${district.toLowerCase()}`;
    const cached = districtCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      res.json({
        success: true,
        source: "cache",
        state,
        district,
        total: cached.data.length,
        tehsils: cached.data,
      });
      return;
    }

    // Extract search terms (e.g. "Kaimur (Bhabua)" -> ["Kaimur", "Bhabua"])
    const cleanDistrict = district.replace(/\(.*\)/, "").trim();
    const queries: string[] = [cleanDistrict];
    const parenMatch = district.match(/\(([^)]+)\)/);
    if (parenMatch && parenMatch[1].trim() && parenMatch[1].trim().toLowerCase() !== cleanDistrict.toLowerCase()) {
      queries.push(parenMatch[1].trim());
    }

    const resultsMap = new Map<string, { name: string; pincode: string }>();

    for (const q of queries) {
      try {
        const url = `https://api.postalpincode.in/postoffice/${encodeURIComponent(q)}`;
        const response = await fetch(url);
        const json: any = await response.json();

        if (json && json[0] && json[0].Status === "Success" && Array.isArray(json[0].PostOffice)) {
          for (const po of json[0].PostOffice) {
            const rawName = po.Name || "";
            const cleanName = rawName.replace(/\([^)]*\)/g, "").replace(/[()]/g, "").trim();
            const pincode = (po.Pincode || "").trim();

            if (cleanName && pincode && cleanName.length >= 2) {
              const key = cleanName.toLowerCase();
              if (!resultsMap.has(key)) {
                resultsMap.set(key, { name: cleanName, pincode });
              }
            }
          }
        }
      } catch (err) {
        console.warn(`[GeoResolver] Postal fetch error for query ${q}:`, err);
      }
    }

    const list = Array.from(resultsMap.values()).sort((a, b) => a.name.localeCompare(b.name));

    districtCache.set(cacheKey, { timestamp: Date.now(), data: list });

    res.json({
      success: true,
      source: "live_postal_api",
      state,
      district,
      total: list.length,
      tehsils: list,
    });
  } catch (error: any) {
    console.error("[GeoResolver] Error resolving tehsils:", error);
    res.status(500).json({ success: false, message: "Failed to resolve tehsils", error: error.message });
  }
});

export default router;
