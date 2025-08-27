// backend/routes/papers.js
const express = require("express");
const router = express.Router();
const Paper = require("../models/Paper");

// 📥 Upload paper (title, abstract, etc.)
router.post("/upload", async (req, res) => {
  try {
    const { title, author, year, tags, abstract } = req.body;

    const newPaper = new Paper({
      title,
      author,
      year,
      tags,
      abstract,
      favorite: false,
    });

    await newPaper.save();
    res.json({ msg: "Paper uploaded successfully ✅", paper: newPaper });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📂 Get all papers
router.get("/", async (req, res) => {
  try {
    const papers = await Paper.find();
    res.json(papers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔎 Filter papers (by year, tag, or author)
router.get("/filter", async (req, res) => {
  try {
    const { year, tag, author } = req.query;
    let query = {};

    if (year) query.year = year;
    if (tag) query.tags = { $in: [tag] };
    if (author) query.author = new RegExp(author, "i");

    const papers = await Paper.find(query);
    res.json(papers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ⭐ Toggle favorite
router.post("/:id/favorite", async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) return res.status(404).json({ error: "Paper not found ❌" });

    paper.favorite = !paper.favorite;
    await paper.save();

    res.json({ msg: "Favorite updated ✅", paper });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📝 Get paper details
router.get("/:id", async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) return res.status(404).json({ error: "Paper not found ❌" });

    res.json(paper);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📊 Analytics (counts & stats)
router.get("/analytics/stats", async (req, res) => {
  try {
    const total = await Paper.countDocuments();
    const thisYear = await Paper.countDocuments({ year: new Date().getFullYear() });

    const tagsAgg = await Paper.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalPapers: total,
      papersThisYear: thisYear,
      topTags: tagsAgg,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
