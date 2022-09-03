const express = require("express");
const errorHandler = require("./middleware/errorHandler");
const parseRouter = require("./routes/parseData");
const exportRouter = require("./routes/exportData");

const app = express();
const port = 3000 || process.env.PORT;

app.use(express.json());

// Scrape, parse and save data to the db
app.use(parseRouter);

// Export data to google docs
app.use(exportRouter);

// Error handling
app.use(errorHandler);

// Page not found handler
app.use(function (req, res) {
  res.status(404).send({
    message: "Endpoint not found!",
    error: { type: "Not found", status: 404 },
  });
});

app.listen(port, () => {
  console.log(`Server is up and running on port ${port}!`);
});
