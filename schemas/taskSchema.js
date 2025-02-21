const { Schema } = require("mongoose");

const taskSchema = new Schema({
  author: {
    type: String,
    required: [true, "author is required."],
  },
  title: {
    type: String,
    required: [true, "Title is required."],
    maxlength: [50, "Title max length can't greter than 50."],
  },
  description: {
    type: String,
    required: [true, "description is required."],
    maxlength: [200, "Description max length can't greter than 50."],
  },
  category: {
    type: String,
    required: [true, "description is required."],
    enum: ["To-Do", "In Progress", "Done"],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = taskSchema;
