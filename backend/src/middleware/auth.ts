import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

export type AuthUser = {
  userId: string;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });

  const token = header.slice("Bearer ".length).trim();
  try {
    const payload = jwt.verify(token, env.jwtSecret) as AuthUser;
    req.auth = { userId: payload.userId };
    return next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

