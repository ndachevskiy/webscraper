const express = require("express");
const router = new express.Router();
const requestBodyValidator = require("../middleware/validator");
const exportData = require("../controllers/exportController");

router.post(
  "/api/getmenus",
  requestBodyValidator.validateRestaurantId,
  exportData.exportMenus
);

router.post(
  "/api/getrestaurants",
  requestBodyValidator.validateCity,
  exportData.exportRestaurants
);

module.exports = router;
