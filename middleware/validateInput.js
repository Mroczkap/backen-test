const Joi = require('joi');

const loginSchema = Joi.object({
  user: Joi.string().required(),
  pwd: Joi.string().required()
});

const addCycleSchema = Joi.object({
    idzawodow: Joi.string().required(),
    idrankingu: Joi.string().required()
  });

const validateLoginInput = (data) => {
  return loginSchema.validate(data);
};

  const validateAddCycleInput = (data) => {
    return addCycleSchema.validate(data);
  };
  

module.exports = { validateLoginInput, validateAddCycleInput };