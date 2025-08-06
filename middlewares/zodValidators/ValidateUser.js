const userSchema = require("../../Validations/userSchema");

const validateUser = (req, res, next) => {
  //   console.log(userSchema.safeParse(req.body));s
  const isUservalid = userSchema.safeParse(req.body);
  //   console.log(isUservalid.error);

  if (!isUservalid.success) {
    // console.log(isUservalid.error.errors);

    return res.status(400).json({
      success: false,
      errors: isUservalid.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      })),
    });
  }
};

module.exports = validateUser;
