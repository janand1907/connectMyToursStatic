class BlogError extends Error {
  constructor(message, code = "INVALID_INPUT", status = 400, fields = {}) {
    super(message);
    this.name = "BlogError";
    this.code = code;
    this.status = status;
    this.fields = fields;
  }
}

function duplicateError(error, field) {
  if (error.code === "ER_DUP_ENTRY") {
    throw new BlogError(`This ${field} is already in use.`, "DUPLICATE", 409, {
      [field]: `Choose a different ${field}.`,
    });
  }
  throw error;
}

module.exports = { BlogError, duplicateError };
