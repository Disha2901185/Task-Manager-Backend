const validator = require("validator");

const validationSignupData = (req) => {
  const { username, emailId, password } = req.body;

  if (!username) {
    throw new Error("username is rquired");
  } else if (username.length < 4 || username.length > 50) {
    throw new Error("username should be 4 to 50 characters");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Invalid Email");
  }

  //password
  if (typeof password !== "string") {
    throw new Error("Password must be a string");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error(
      "Password should be 8 to 50 characters and should contain at least 1 small, 1 Caps.1 numeric 1 symbol"
    );
  }
};

const validateEditProfileData = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "photoUrl",
    "emailId",
    "gender",
    "age",
    "about",
    "skills",
  ];

  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field)
  );

  return isEditAllowed;
  if (isEditAllowed) {
  }
};

module.exports = { validationSignupData, validateEditProfileData };
