const yup = require("yup");

const getRestaurantsSchema = yup.object({
  body: yup.object({
    city: yup.string().required(),
  }),
});

const getMenuSchema = yup.object({
  body: yup.object({
    restaurantId: yup.string().required(),
  }),
});

module.exports = { getRestaurantsSchema, getMenuSchema };
