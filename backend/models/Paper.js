const mongoose = require("mongoose");

const PaperSchema = new mongoose.Schema({
  title: String,
  author: String,
  year: Number,
  tags: [String],
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Paper", PaperSchema);
