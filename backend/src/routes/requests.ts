import { Router } from "express";
import { z } from "zod";

import { requireAuth } from "../middleware/auth.js";
import { CouponModel } from "../models/Coupon.js";
import { CouponRequestModel } from "../models/CouponRequest.js";
import { UserModel } from "../models/User.js";

export const requestsRouter = Router();

requestsRouter.get("/requests/incoming", requireAuth, async (req, res) => {
  const donorId = req.auth!.userId;
  const requests = await CouponRequestModel.find({ donorId })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  const couponIds = [...new Set(requests.map((r) => r.couponId.toString()))];
  const recipientIds = [...new Set(requests.map((r) => r.recipientId.toString()))];

  const [coupons, recipients] = await Promise.all([
    CouponModel.find({ _id: { $in: couponIds } }).lean(),
    UserModel.find({ _id: { $in: recipientIds } }, { displayName: 1 }).lean()
  ]);

  const couponsById = new Map(coupons.map((coupon) => [coupon._id.toString(), coupon]));
  const recipientsById = new Map(
    recipients.map((recipient) => [recipient._id.toString(), recipient])
  );

  res.json({
    requests: requests.map((r) => {
      const coupon = couponsById.get(r.couponId.toString());
      const recipient = recipientsById.get(r.recipientId.toString());
      const recipientName = recipient?.displayName ?? null;

      return {
        id: r._id.toString(),
        couponId: r.couponId.toString(),
        recipientId: r.recipientId.toString(),
        donorId: r.donorId.toString(),
        status: r.status,
        createdAt: r.createdAt,
        recipientName,
        coupon: coupon
          ? {
            id: coupon._id.toString(),
            brand: coupon.brand,
            valueDescription: coupon.valueDescription,
            category: coupon.category,
            expiryDate: coupon.expiryDate,
            brandLogoUrl: coupon.brandLogoUrl ?? null,
            productImageUrl: coupon.productImageUrl ?? null
          }
          : null,
        recipient: recipient
          ? {
            id: recipient._id.toString(),
            displayName: recipient.displayName
          }
          : null
      };
    })
  });
});

requestsRouter.get("/requests/outgoing", requireAuth, async (req, res) => {
  const recipientId = req.auth!.userId;
  const requests = await CouponRequestModel.find({ recipientId })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  const couponIds = [...new Set(requests.map((r) => r.couponId.toString()))];
  const donorIds = [...new Set(requests.map((r) => r.donorId.toString()))];

  const [coupons, donors] = await Promise.all([
    CouponModel.find({ _id: { $in: couponIds } }).lean(),
    UserModel.find({ _id: { $in: donorIds } }, { displayName: 1 }).lean()
  ]);

  const couponsById = new Map(coupons.map((coupon) => [coupon._id.toString(), coupon]));
  const donorsById = new Map(donors.map((donor) => [donor._id.toString(), donor]));

  res.json({
    requests: requests.map((r) => {
      const coupon = couponsById.get(r.couponId.toString());
      const donor = donorsById.get(r.donorId.toString());
      const donorName = coupon?.showDonorName ? donor?.displayName ?? "Donor" : null;

      return {
        id: r._id.toString(),
        couponId: r.couponId.toString(),
        recipientId: r.recipientId.toString(),
        donorId: r.donorId.toString(),
        status: r.status,
        createdAt: r.createdAt,
        donorName,
        coupon: coupon
          ? {
            id: coupon._id.toString(),
            brand: coupon.brand,
            valueDescription: coupon.valueDescription,
            category: coupon.category,
            expiryDate: coupon.expiryDate,
            showDonorName: coupon.showDonorName,
            brandLogoUrl: coupon.brandLogoUrl ?? null,
            productImageUrl: coupon.productImageUrl ?? null
          }
          : null,
        donor: donor && coupon?.showDonorName
          ? { id: donor._id.toString(), displayName: donor.displayName }
          : null
      };
    })
  });
});

requestsRouter.post("/coupons/:couponId/requests", requireAuth, async (req, res) => {
  const recipientId = req.auth!.userId;
  const coupon = await CouponModel.findById(req.params.couponId);
  if (!coupon) return res.status(404).json({ error: "Not found" });

  if (coupon.status !== "available") return res.status(409).json({ error: "Coupon is not available" });
  if (coupon.expiryDate.getTime() <= Date.now()) {
    coupon.status = "expired";
    await coupon.save();
    return res.status(409).json({ error: "Coupon expired" });
  }

  if (coupon.donorId.toString() === recipientId) {
    return res.status(400).json({ error: "Donor cannot request own coupon" });
  }

  const existing = await CouponRequestModel.findOne({ couponId: coupon._id, recipientId }).lean();
  if (existing) return res.status(409).json({ error: "Already requested", requestId: existing._id.toString(), status: existing.status });

  const isAuto = coupon.revealMode === "autoRelease";
  const request = await CouponRequestModel.create({
    couponId: coupon._id,
    recipientId,
    donorId: coupon.donorId,
    status: isAuto ? "approved" : "pending"
  });

  if (isAuto) {
    const updated = await CouponModel.findOneAndUpdate(
      { _id: coupon._id, status: "available", claimedByRequestId: { $exists: false } },
      { $set: { status: "claimed", claimedByRequestId: request._id } },
      { new: true }
    );

    if (!updated) {
      await CouponRequestModel.findByIdAndUpdate(request._id, { $set: { status: "rejected" } });
      return res.status(409).json({ error: "Coupon already claimed" });
    }

    await UserModel.findByIdAndUpdate(recipientId, { $inc: { "stats.receivedCount": 1, "stats.impactScore": 1 } });
  }

  res.status(201).json({
    request: { id: request._id.toString(), status: request.status, couponId: coupon._id.toString() }
  });
});

const DecideSchema = z.object({}).strict();

requestsRouter.post("/requests/:id/approve", requireAuth, async (req, res) => {
  const parsed = DecideSchema.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const donorId = req.auth!.userId;
  const request = await CouponRequestModel.findById(req.params.id);
  if (!request) return res.status(404).json({ error: "Not found" });
  if (request.donorId.toString() !== donorId) return res.status(403).json({ error: "Forbidden" });

  const coupon = await CouponModel.findById(request.couponId);
  if (!coupon) return res.status(404).json({ error: "Coupon missing" });
  if (coupon.revealMode !== "donorApproval") return res.status(409).json({ error: "Approval not required for this coupon" });

  if (coupon.status !== "available") return res.status(409).json({ error: "Coupon not available" });
  if (request.status !== "pending") return res.status(409).json({ error: "Request not pending" });

  const updatedCoupon = await CouponModel.findOneAndUpdate(
    { _id: coupon._id, status: "available", claimedByRequestId: { $exists: false } },
    { $set: { status: "claimed", claimedByRequestId: request._id } },
    { new: true }
  );

  if (!updatedCoupon) return res.status(409).json({ error: "Coupon already claimed" });

  request.status = "approved";
  await request.save();

  await UserModel.findByIdAndUpdate(request.recipientId, { $inc: { "stats.receivedCount": 1, "stats.impactScore": 1 } });

  res.json({ request: { id: request._id.toString(), status: request.status } });
});

requestsRouter.post("/requests/:id/reject", requireAuth, async (req, res) => {
  const donorId = req.auth!.userId;
  const request = await CouponRequestModel.findById(req.params.id);
  if (!request) return res.status(404).json({ error: "Not found" });
  if (request.donorId.toString() !== donorId) return res.status(403).json({ error: "Forbidden" });

  if (request.status !== "pending") return res.status(409).json({ error: "Request not pending" });
  request.status = "rejected";
  await request.save();

  res.json({ request: { id: request._id.toString(), status: request.status } });
});

