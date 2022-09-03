const databaseOps = require("../services/dbService");
const googleDocsOps = require("../services/googleDocsService");
const { google } = require("googleapis");
const keys = require("../google-keys");
const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URL;
const client = new MongoClient(uri, {
  connectTimeoutMS: 30000,
  useUnifiedTopology: true,
});
const gc = new google.auth.JWT(keys.client_email, null, keys.private_key, [
  "https://www.googleapis.com/auth/spreadsheets",
]);

gc.authorize((err, tokens) => {
  if (err) {
    console.log(err);
    return;
  }
});

class ExportData {
  // Search and exports restaurants data
  async exportRestaurants(req, res, next) {
    try {
      const { city } = req.body;

      const restaurantData = await databaseOps.searchForRestaurants(
        client,
        city
      );
      // console.log(restaurantData);
      await googleDocsOps.exportRestaurants(gc, restaurantData);

      res.status(200).send({ msg: "Data successfully exported!" });
    } catch (e) {
      next(e);
    }
  }

  // Search and exports menus data
  async exportMenus(req, res, next) {
    try {
      const { restaurantId } = req.body;
      const menuData = await databaseOps.searchForMenus(client, restaurantId);
      await googleDocsOps.exportMenus(gc, menuData);

      res.status(200).send({ msg: "Data successfully exported!" });
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new ExportData();
