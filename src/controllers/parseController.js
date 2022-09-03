const parseService = require("../services/parseService");

class ParseController {
  // Scrape, parse and save data from a website
  async parseData(req, res, next) {
    try {
      const cities = [
        "Kladno, Kladno, Czech Republic",
        "Zlín, Zlín, Czech Republic",
      ];
      // 1. Open page, scroll down, get links for all restaurants
      const restaurantLinks = [];
      for (const city of cities) {
        const result = await parseService.getRestaurantLinks(city);
        restaurantLinks.push(result);
      }

      // 2. Scrape, parse and save to MongoDb
      await parseService.scrapeParseAndSave(restaurantLinks);

      res
        .status(200)
        .send({ msg: "Data successfully parsed and stored in the DB!" });
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new ParseController();
