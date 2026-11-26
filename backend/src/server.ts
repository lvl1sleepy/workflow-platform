import { createApp } from "./app.js";
import { PORT } from "./config/env.js";
import { checkDatabase } from "./db/pool.js";

const app = createApp({
  checkDatabase,
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.info(`Server listening on port ${PORT}`);
});
