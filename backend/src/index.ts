import "dotenv/config";
import express from "express";
import cors from "cors";
import { onchainRouter } from "./api/onchain.js";
import { micaRouter } from "./api/mica.js";

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || "http://localhost:5173" }));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/onchain", onchainRouter);
app.use("/api/mica", micaRouter);

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`API compliance simulator sur http://localhost:${port}`);
});
