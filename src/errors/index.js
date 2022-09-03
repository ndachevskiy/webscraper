class BaseError extends Error {
  constructor(type, message, status) {
    super(message);
    this.type = type;
    this.status = status;
  }
}

class ValidationError extends BaseError {
  constructor(message = "Invalid data format.") {
    super("Validation", message, 400);
  }
}

class NotFoundError extends BaseError {
  constructor(message = "No data matching your request was found.") {
    super("Not found", message, 404);
  }
}

module.exports = {
  BaseError,
  ValidationError,
  NotFoundError,
};
