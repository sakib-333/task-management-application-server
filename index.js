require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const userSchema = require("./schemas/userSchema");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(cookieParser());

const port = process.env.port || 3000;

const URI = process.env.uri
  .replace("<db_username>", process.env.db_username)
  .replace("<db_password>", process.env.db_password);

mongoose
  .connect(URI)
  .then(() => console.log("Connected to db."))
  .catch(() => console.log("Something went wrong."));

// const User = new mongoose.model("User", userSchema);
const User = mongoose.model("User", userSchema);

app.post("/jwt", async (req, res) => {
  const { name, email } = req.body;
  const user = await User.findOne({ email }).exec();

  if (!user) {
    try {
      const user = new User({ name, email });
      await user.save();
    } catch (err) {
      console.log(err);
    }
  }

  const token = jwt.sign({ name, email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.cookie("TASK_MANAGEMENT_APPLICATION", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  });
  res.send({ acknowledgement: true, status: "cookie created" });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
