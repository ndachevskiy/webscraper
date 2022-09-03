const { NotFoundError } = require("../errors/index");

class DatabaseOps {
  // Dropping existing collections
  async dropDatabase(client) {
    try {
      await client.connect();
      await client.db("scrapper").dropDatabase();
    } catch (e) {
      throw new Error(e);
    } finally {
      await client.close();
    }
  }

  // Saving menu and restaurants
  async saveData(client, restaurantData, menuData) {
    try {
      await client.connect();
      // Saving restaurant data
      await client
        .db("scrapper")
        .collection("restaurants")
        .insertOne(restaurantData);
      // Saving menu data
      await client.db("scrapper").collection("menus").insertMany(menuData);
    } catch (e) {
      throw new Error(e);
    } finally {
      await client.close();
    }
  }

  // Search for restaurans
  async searchForRestaurants(client, city) {
    try {
      await client.connect();
      const cursor = client.db("scrapper").collection("restaurants").find({
        city,
      });

      const data = await cursor.toArray();
      if (data.length === 0) {
        throw new Error();
      }

      return data;
    } catch (e) {
      throw new NotFoundError();
    } finally {
      await client.close();
    }
  }

  // Search for menus
  async searchForMenus(client, restaurantId) {
    try {
      await client.connect();
      const cursor = client.db("scrapper").collection("menus").find({
        restaurantId,
      });

      const data = await cursor.toArray();
      if (data.length === 0) {
        throw new Error();
      }

      return data;
    } catch (e) {
      throw new NotFoundError();
    } finally {
      await client.close();
    }
  }
}

module.exports = new DatabaseOps();
