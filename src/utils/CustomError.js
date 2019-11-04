class CustomError extends Error {
  constructor(type = 'Exception', ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }

    // Custom debugging information
    // 'Exception' if was caused by a bug or 'Normal' if
    // thrown as a part of normal program flow
    this.type = type;
    this.custom = true;
    this.date = new Date();
  }
}

module.exports = CustomError;
