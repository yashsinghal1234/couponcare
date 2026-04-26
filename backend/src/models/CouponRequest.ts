import mongoose, { type InferSchemaType, type Types } from "mongoose";

export const CouponRequestStatuses = ["pending", "approved", "rejected"] as const;

const CouponRequestSchema = new mongoose.Schema(
  {
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", required: true, index: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: { type: String, required: true, enum: CouponRequestStatuses, default: "pending", index: true }
  },
  { timestamps: true }
);

CouponRequestSchema.index({ donorId: 1, status: 1, createdAt: -1 });
CouponRequestSchema.index({ recipientId: 1, createdAt: -1 });

export type CouponRequest = InferSchemaType<typeof CouponRequestSchema> & {
  couponId: Types.ObjectId;
  recipientId: Types.ObjectId;
  donorId: Types.ObjectId;
};

export const CouponRequestModel = mongoose.model("CouponRequest", CouponRequestSchema);

