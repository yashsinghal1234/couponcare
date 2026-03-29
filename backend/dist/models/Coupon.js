import mongoose from "mongoose";
export const CouponCategories = [
    "Food",
    "Grocery",
    "Entertainment",
    "Shopping",
    "Travel",
    "Other"
];
export const CouponRevealModes = ["donorApproval", "autoRelease"];
export const CouponStatuses = ["available", "claimed", "expired"];
const CouponSchema = new mongoose.Schema({
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    brand: { type: String, required: true, trim: true, index: true },
    code: { type: String, required: true, trim: true },
    valueDescription: { type: String, required: true, trim: true },
    expiryDate: { type: Date, required: true, index: true },
    category: { type: String, required: true, enum: CouponCategories, index: true },
    city: { type: String, required: false, trim: true, index: true },
    restrictions: { type: String, required: false, trim: true },
    enhancedDescription: { type: String, required: false, trim: true, maxlength: 300 },
    brandLogoUrl: { type: String, required: false, trim: true, maxlength: 500 },
    productImageUrl: { type: String, required: false, trim: true, maxlength: 500 },
    revealMode: { type: String, required: true, enum: CouponRevealModes },
    showDonorName: { type: Boolean, default: true },
    status: { type: String, required: true, enum: CouponStatuses, default: "available", index: true },
    claimedByRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "CouponRequest", required: false }
}, { timestamps: true });
CouponSchema.index({ status: 1, expiryDate: 1 });
export const CouponModel = mongoose.model("Coupon", CouponSchema);
