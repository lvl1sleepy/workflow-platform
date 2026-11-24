import app from "./app.js";
import { PORT } from "./config/env.js";

const server = app.listen(PORT, "0.0.0.0", () => {
  console.info(`Server listening on port ${PORT}`);
});
