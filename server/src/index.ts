import express from "express";
import cors from "cors";
import { nodes, edges } from "./data.js";

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Senriva Dependency Mapper API"
  });
});

app.get("/api/dependencies", (_req, res) => {
  res.json({
    nodes,
    edges
  });
});

app.get("/api/summary", (_req, res) => {
  res.json({
    totalAssets: nodes.length,
    relationships: edges.length,
    orphaned: nodes.filter((node) => node.status === "orphaned").length,
    broken: nodes.filter((node) => node.status === "broken").length,
    mapped: nodes.filter((node) => node.sourceId && node.targetId).length
  });
});

app.listen(port, () => {
  console.log(`Senriva Dependency Mapper API running on http://localhost:${port}`);
});
