const Joi = require("@hapi/joi");

const signupValidation = (data) => {
  const Schema = Joi.object({
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    password: Joi.string().min(6).max(1024).required(),
    email: Joi.string().email().min(6).max(255).required(),
    role: Joi.string(),
    createdAt: Joi.date(),
  });
  return Schema.validate(data);
};
const loginValidation = (data) => {
  const Schema = Joi.object({
    email: Joi.string().email().min(6).max(255).required(),
    password: Joi.string().required().min(6).max(1024).required(),
  });
  return Schema.validate(data);
};
const productValidation = (data) => {
  const Schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    category: Joi.string().required(),
    price: Joi.number().required(),
  });
  return Schema.validate(data);
};

module.exports.signupValidation = signupValidation;
module.exports.loginValidation = loginValidation;
module.exports.productValidation = productValidation;
