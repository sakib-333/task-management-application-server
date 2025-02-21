require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
  })
);

const port = process.env.port || 3000;

const URI = process.env.uri
  .replace("<db_username>", process.env.db_username)
  .replace("<db_password>", process.env.db_password);

mongoose
  .connect(URI)
  .then(() => console.log("Connected to db."))
  .catch(() => console.log("Something went wrong."));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
