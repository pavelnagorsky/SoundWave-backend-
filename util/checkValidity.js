const checkValidity = errors => {
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed.');
      error.statusCode = 422;
      error.data = errors.array();
      return error;
    };
};

module.exports = checkValidity;
    