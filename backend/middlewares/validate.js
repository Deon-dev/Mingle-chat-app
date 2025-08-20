export const validate = (schema) => (req, _res, next) => {
  const { error, value } = schema.validate(req.body);
  if (error) return next({ status: 400, message: error.details[0].message });
  req.body = value;
  next();
};
