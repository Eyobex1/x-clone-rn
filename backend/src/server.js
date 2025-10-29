import express from "express";
import { startServer } from "./utils/startServer.js";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello from server");
});

// Start the process
startServer(app);
