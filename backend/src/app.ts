import cors from "cors";
import express from "express";
import morgan from "morgan";

import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.js";
import { couponsRouter } from "./routes/coupons.js";
import { requestsRouter } from "./routes/requests.js";

export function createApp() {
  const app = express();

  app.use(morgan("dev"));
  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/coupons", couponsRouter);
  app.use("/api", requestsRouter);

  return app;
}

