import express from "express";

const app = express();

app.use(express.json());

app.get("/api", (req, res) => {
  res.send({ msg: "API is working!" });
});

export default app;