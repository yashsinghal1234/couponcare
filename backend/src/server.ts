import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { createApp } from "./app.js";
import { env } from "./config/env.js";

async function main() {
  let mongoUri = env.mongoUri;
  let memory: MongoMemoryServer | undefined;

  if (mongoUri === "memory") {
    memory = await MongoMemoryServer.create();
    mongoUri = memory.getUri("couponcare");
  }

  await mongoose.connect(mongoUri);

  const app = createApp();
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${env.port}`);
  });

  process.on("SIGINT", async () => {
    await mongoose.disconnect().catch(() => undefined);
    if (memory) await memory.stop().catch(() => undefined);
    process.exit(0);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

