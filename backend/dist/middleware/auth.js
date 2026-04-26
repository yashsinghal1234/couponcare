import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
export function requireAuth(req, res, next) {
    const header = req.header("authorization");
    if (!header?.startsWith("Bearer "))
        return res.status(401).json({ error: "Unauthorized" });
    const token = header.slice("Bearer ".length).trim();
    try {
        const payload = jwt.verify(token, env.jwtSecret);
        req.auth = { userId: payload.userId };
        return next();
    }
    catch {
        return res.status(401).json({ error: "Unauthorized" });
    }
}
