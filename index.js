require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const userSchema = require("./schemas/userSchema");
const taskSchema = require("./schemas/taskSchema");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://task-management-applicat-d14b5.web.app",
      "https://task-management-applicat-d14b5.firebaseapp.com",
    ],
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

const checkToken = (req, res, next) => {
  const token = req?.cookies?.TASK_MANAGEMENT_APPLICATION;

  if (!token) {
    return res.status(403).send({ message: "Unauthorized access" });
  } else {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).send({ message: "Unauthorized access" });
      }
      req.decodedEmail = decoded.email;
      next();
    });
  }
};

// const User = new mongoose.model("User", userSchema);
const User = mongoose.model("User", userSchema);
const Task = mongoose.model("Task", taskSchema);

app.post("/jwt", async (req, res) => {
  const { name, email } = req.body;

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

app.post("/logout", async (req, res) => {
  res.clearCookie("TASK_MANAGEMENT_APPLICATION", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  });
  res.send({ acknowledgement: true, status: "cookie cleared" });
});

app.post("/registration", async (req, res) => {
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
  res.send({ acknowledgement: true, message: "Registration successful." });
});

app.post("/add-task", checkToken, async (req, res) => {
  const { title, description, category } = req.body;
  const author = req.decodedEmail;
  try {
    const task = new Task({ author, title, description, category });
    const result = await task.save();

    if (result) {
      res.send({ acknowledgement: true, message: "Task added successfully." });
    } else {
      res.send({ acknowledgement: false, message: "Something went wrong." });
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/my-tasks", checkToken, async (req, res) => {
  const email = req.decodedEmail;
  try {
    const result = await Task.find({ author: email });
    res.send(result);
  } catch (err) {
    console.log(err);
  }
});

app.post("/get-my-task", checkToken, async (req, res) => {
  const { id } = req.body;
  try {
    const result = await Task.findById({ _id: id });
    res.send(result);
  } catch (err) {
    console.log(err);
  }
});

app.post("/delete-task", checkToken, async (req, res) => {
  const { id } = req.body;
  try {
    const result = await Task.findByIdAndDelete({ _id: id });
    if (result) {
      res.send({
        acknowledgement: true,
        message: "Task deleted successfully.",
      });
    } else {
      res.send({
        acknowledgement: false,
        message: "Something went wrong.",
      });
    }
  } catch (err) {
    console.log(err);
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
