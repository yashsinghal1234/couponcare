import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    displayName: { type: String, required: true, trim: true },
    roles: {
        donor: { type: Boolean, default: false },
        recipient: { type: Boolean, default: false }
    },
    stats: {
        donatedCount: { type: Number, default: 0 },
        receivedCount: { type: Number, default: 0 },
        impactScore: { type: Number, default: 0 }
    }
}, { timestamps: true });
export const UserModel = mongoose.model("User", UserSchema);
