import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { z } from "zod";

import { env } from "../config/env.js";
import { requireAuth } from "../middleware/auth.js";
import { UserModel } from "../models/User.js";

const jwtSignOptions: SignOptions = {
  expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"]
};

export const authRouter = Router();

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
  displayName: z.string().min(1).max(80)
});

authRouter.post("/signup", async (req, res) => {
  const parsed = SignupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

  const { email, password, displayName } = parsed.data;
  const existing = await UserModel.findOne({ email }).lean();
  if (existing) return res.status(409).json({ error: "Email already in use" });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await UserModel.create({
    email,
    passwordHash,
    displayName,
    roles: { donor: true, recipient: true }
  });

  const token = jwt.sign({ userId: user._id.toString() }, env.jwtSecret, jwtSignOptions);
  res.status(201).json({
    token,
    user: { id: user._id.toString(), email: user.email, displayName: user.displayName, roles: user.roles, stats: user.stats }
  });
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200)
});

authRouter.post("/login", async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

  const { email, password } = parsed.data;
  const user = await UserModel.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ userId: user._id.toString() }, env.jwtSecret, jwtSignOptions);
  res.json({
    token,
    user: { id: user._id.toString(), email: user.email, displayName: user.displayName, roles: user.roles, stats: user.stats }
  });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await UserModel.findById(req.auth!.userId).lean();
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json({
    user: {
      id: user._id.toString(),
      email: user.email,
      displayName: user.displayName,
      roles: user.roles,
      stats: user.stats
    }
  });
});

