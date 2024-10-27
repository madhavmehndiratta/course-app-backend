const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const { userRouter } = require("./routes/user");
const { adminRouter } = require("./routes/admin");
const { courseRouter } = require("./routes/course");

const app = express();
app.use(express.json());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/course", courseRouter);

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to the database");
  } catch {
    console.log("Error connecting to the database");
  }

  app.listen(3000);
  console.log("Listening on port 3000");
}

main();
