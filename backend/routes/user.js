const User = require("../models/user");
const { signupValidation, loginValidation } = require("../validation");
const bcrypt = require("bcryptjs");

const router = require("express").Router();
const Jwt = require("jsonwebtoken");

// signup
router.post("/signup", async (req, res) => {
  try {
    const { firstname, lastname, password, email, role } = req.body;
    const { error } = signupValidation(req.body);
    if (error)
      return res.status(400).json({
        status: "Fail",
        message: error.details[0].message,
      });

    const emailExists = await User.findOne({ email: email });
    if (emailExists)
      return res.status(400).json({
        status: "Fail",
        message: "Email already exists.",
      });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      role,
    });

    const savedUser = await newUser.save();
    res.status(200).json({
      status: "Success",
      message: "User created.",
      data: savedUser,
    });
  } catch (error) {
    return res.status(400).json({
      status: "Fail",
      message: error.message,
    });
  }
});

// login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { error } = loginValidation(req.body);
    if (error)
      return res.status(400).json({
        status: "Fail",
        message: error.details[0].message,
      });
    const user = await User.findOne({ email: email });
    if (!user)
      return res.status(400).json({
        status: "Fail",
        message: "User does not exist",
      });
    const hashedPassword = await bcrypt.compare(password, user.password);
    if (!hashedPassword)
      return res.status(400).json({
        status: "Fail",
        message: "Incorrect email or password",
      });
    const token = Jwt.sign(
      { _id: user._id, role: user.role },
      process.env.TOKEN_SECRET
    );
    req.header = "auth-token";
    res.status(200).json({
      status: "Success",
      data: token,
    });
  } catch (error) {
    return res.status(400).json({
      status: "Fail",
      message: error.message,
    });
  }
});

module.exports = router;
