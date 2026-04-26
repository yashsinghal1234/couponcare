import { Router } from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";

import { requireAuth } from "../middleware/auth.js";
import { CouponModel, CouponRevealModes, CouponCategories } from "../models/Coupon.js";
import { CouponRequestModel } from "../models/CouponRequest.js";
import { UserModel } from "../models/User.js";
import { env } from "../config/env.js";

export const couponsRouter = Router();

const CreateCouponSchema = z.object({
  brand: z.string().min(1).max(80),
  code: z.string().min(1).max(120),
  valueDescription: z.string().min(1).max(200),
  expiryDate: z.coerce.date(),
  category: z.enum(CouponCategories),
  city: z.string().min(1).max(80).optional(),
  restrictions: z.string().min(1).max(300).optional(),
  enhancedDescription: z.string().min(1).max(300).optional(),
  brandLogoUrl: z.string().url().max(500).optional(),
  productImageUrl: z.string().url().max(500).optional(),
  revealMode: z.enum(CouponRevealModes),
  showDonorName: z.boolean().optional()
});

couponsRouter.post("/", requireAuth, async (req, res) => {
  const parsed = CreateCouponSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

  const now = new Date();
  if (parsed.data.expiryDate.getTime() <= now.getTime()) {
    return res.status(400).json({ error: "Expiry must be in the future" });
  }

  const coupon = await CouponModel.create({
    donorId: req.auth!.userId,
    ...parsed.data,
    showDonorName: parsed.data.showDonorName ?? true
  });

  await UserModel.findByIdAndUpdate(req.auth!.userId, { $inc: { "stats.donatedCount": 1, "stats.impactScore": 1 } });

  res.status(201).json({
    coupon: {
      id: coupon._id.toString(),
      brand: coupon.brand,
      valueDescription: coupon.valueDescription,
      expiryDate: coupon.expiryDate,
      category: coupon.category,
      city: coupon.city,
      restrictions: coupon.restrictions,
      enhancedDescription: coupon.enhancedDescription,
      brandLogoUrl: coupon.brandLogoUrl,
      productImageUrl: coupon.productImageUrl,
      revealMode: coupon.revealMode,
      showDonorName: coupon.showDonorName,
      status: coupon.status,
      createdAt: coupon.createdAt
    }
  });
});

couponsRouter.get("/", async (req, res) => {
  const { category, brand, city } = req.query;

  const now = new Date();
  await CouponModel.updateMany(
    { status: "available", expiryDate: { $lte: now } },
    { $set: { status: "expired" } }
  );

  const filter: Record<string, unknown> = { status: "available", expiryDate: { $gt: now } };
  if (typeof category === "string" && category.length) filter.category = category;
  if (typeof brand === "string" && brand.length) filter.brand = new RegExp(`^${escapeRegex(brand)}$`, "i");
  if (typeof city === "string" && city.length) filter.city = new RegExp(`^${escapeRegex(city)}$`, "i");

  const coupons = await CouponModel.find(filter)
    .sort({ expiryDate: 1, createdAt: -1 })
    .limit(100)
    .lean();

  const donorIds = Array.from(new Set(coupons.map((c) => c.donorId.toString())));
  const donors = await UserModel.find({ _id: { $in: donorIds } }, { displayName: 1, stats: 1 }).lean();
  const donorById = new Map(donors.map((d) => [d._id.toString(), d]));

  res.json({
    coupons: coupons.map((c) => ({
      id: c._id.toString(),
      brand: c.brand,
      valueDescription: c.valueDescription,
      expiryDate: c.expiryDate,
      category: c.category,
      city: c.city,
      restrictions: c.restrictions,
      enhancedDescription: c.enhancedDescription,
      brandLogoUrl: c.brandLogoUrl,
      productImageUrl: c.productImageUrl,
      revealMode: c.revealMode,
      showDonorName: c.showDonorName,
      donor: (() => {
        const donor = donorById.get(c.donorId.toString());
        if (!donor) return { trustScore: null };
        return {
          displayName: c.showDonorName ? donor.displayName ?? "Donor" : undefined,
          trustScore: computeTrustScore(donor.stats ?? undefined)
        };
      })(),
      status: c.status
    }))
  });
});

function computeTrustScore(stats?: { donatedCount?: number; impactScore?: number }) {
  if (!stats) return null;
  const donated = stats.donatedCount ?? 0;
  const impact = stats.impactScore ?? 0;
  const donatedBoost = Math.min(45, donated * 3);
  const impactBoost = Math.min(20, impact * 2);
  const score = 35 + donatedBoost + impactBoost;
  return Math.max(0, Math.min(100, Math.round(score)));
}

couponsRouter.get("/:id", async (req, res) => {
  const coupon = await CouponModel.findById(req.params.id).lean();
  if (!coupon) return res.status(404).json({ error: "Not found" });

  const now = new Date();
  let status = coupon.status;
  if (coupon.expiryDate.getTime() <= now.getTime() && coupon.status !== "expired") {
    await CouponModel.findByIdAndUpdate(coupon._id, { $set: { status: "expired" } });
    status = "expired";
  }

  let code: string | undefined;
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : undefined;
  const userId = token ? safeExtractUserId(token) : undefined;

  if (userId) {
    if (coupon.donorId.toString() === userId) {
      code = coupon.code;
    } else {
      const approved = await CouponRequestModel.findOne({ couponId: coupon._id, recipientId: userId, status: "approved" }).lean();
      if (approved) code = coupon.code;
    }
  }

  const donor = coupon.showDonorName
    ? await UserModel.findById(coupon.donorId, { displayName: 1 }).lean()
    : null;

  res.json({
    coupon: {
      id: coupon._id.toString(),
      brand: coupon.brand,
      valueDescription: coupon.valueDescription,
      expiryDate: coupon.expiryDate,
      category: coupon.category,
      city: coupon.city,
      restrictions: coupon.restrictions,
      enhancedDescription: coupon.enhancedDescription,
      brandLogoUrl: coupon.brandLogoUrl,
      productImageUrl: coupon.productImageUrl,
      revealMode: coupon.revealMode,
      showDonorName: coupon.showDonorName,
      donor: coupon.showDonorName && donor ? { displayName: donor.displayName } : undefined,
      status,
      code
    }
  });
});

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function safeExtractUserId(_token: string): string | undefined {
  // Coupon detail can be public; code reveal is optional. We keep auth optional here.
  // The actual verification happens in middleware for protected routes.
  // This helper avoids making the whole route protected.
  try {
    const payload = jwt.verify(_token, env.jwtSecret) as { userId?: string };
    return payload.userId;
  } catch {
    return undefined;
  }
}

