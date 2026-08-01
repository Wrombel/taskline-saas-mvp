// import express from "express";
// import cors from "cors";
// import { UserDbSchema, UserDomainSchema } from "@project/shared";
// //import { connectDB } from "./config/database.js"
// const app = express();

// app.use(cors());
// app.use(express.json());

// app.get("/health", (req, res) => {
//   res.json({ status: "ok" });
// });

// const PORT = 3000;

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

import { createApp } from "./app.js";

const PORT = 3000;

async function start() {
  const app = await createApp();

  app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
  });
}

start();
