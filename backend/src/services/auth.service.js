const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

const signupUser = async (body) => {
  const existingUser = await User.findOne({ email: body.email });
  if (existingUser) {
    throw new Error("Email already registered");
  }

  const user = await User.create(body);
  return user;
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await user.isPasswordMatch(password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return { user, token };
};

module.exports = {
  signupUser,
  loginUser,
};