const Joi = require('joi');

exports.employeeValidation = (data) => {
  const schema = Joi.object({
    fName: Joi.string().required(),
    lName: Joi.string().required(),
    departmentID: Joi.required(), // Remove specific validation for departmentID
    onBoardDate: Joi.date().required(),
    age: Joi.number().integer().required()
  });
  return schema.validate(data);
};

exports.projectTrackValidation = (data) => {
  const schema = Joi.object({
    projectId: Joi.string().required(),
    employeeId: Joi.string().required(),
    joined: Joi.date().required(),
    exit: Joi.date().allow(null)
  });
  return schema.validate(data);
};
