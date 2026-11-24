import express from "express";
import healthRoutes from "./api/routes/healthRoutes.js";

const app = express();

app.use(express.json());
app.use("/health", healthRoutes);

export default app;
