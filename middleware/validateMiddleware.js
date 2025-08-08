const Joi = require("joi");

const validate = (type, schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req[type], { abortEarly: false });

    if (error) {
      return res.status(400).json({
        message: "Validation Error",
        errors: error.details.map((err) => err.message),
      });
    }

    next();
  };
};

module.exports = validate;
