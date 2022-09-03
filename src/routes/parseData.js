const express = require("express");
const router = new express.Router();
const parseController = require("../controllers/parseController");

// Scrape, parse and save data to the db
router.get("/api/parsedata", parseController.parseData);

module.exports = router;
