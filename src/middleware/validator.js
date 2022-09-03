const { ValidationError } = require("../errors/index");
const {
  getRestaurantsSchema,
  getMenuSchema,
} = require("../schemas/requestBody");

class RequestBodyValidator {
  // Validation of city name
  async validateCity(req, res, next) {
    try {
      await getRestaurantsSchema.validate({ body: req.body });
      next();
    } catch (e) {
      next(new ValidationError());
    }
  }
  // Validation of restaurant ID
  async validateRestaurantId(req, res, next) {
    try {
      await getMenuSchema.validate({ body: req.body });
      next();
    } catch (e) {
      next(new ValidationError());
    }
  }
}

module.exports = new RequestBodyValidator();
