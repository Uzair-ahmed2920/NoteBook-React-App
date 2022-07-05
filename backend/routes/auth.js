const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "VerySecure";

// creating new user using post : "/api/auth/createuser"
router.post(
  "/createuser",
  [
    body("name").isLength({ min: 5 }),
    body("email").isEmail(),
    body("password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    //eroor handling for bad request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // handling erroe for user with same email id
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ error: "sorry a user with same email already exixst" });
      }
      // generating salt for securing password
      const salt = await bcrypt.genSaltSync(10);
      // generating hash by using packeg 'bcrypt' for securing password
      const scrPassword = await bcrypt.hashSync(req.body.password, salt);
      //creating new user
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: scrPassword,
      });
      // authtocken data : using id index from mongodb
      const data = {
        user: {
          id: user.id,
        },
      };
      // generating authtoken
      const authtoken = jwt.sign(data, JWT_SECRET);
      res.json({ authtoken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("some error occoured");
    }
    //.then(user => res.json(user));
  }
);

// Authenticating user using post : "/api/auth/login"
router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "password can not be blanck").exists(),
  ],
  async (req, res) => {
    //eroor handling for bad request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({email});
      if (!user) {
        return res
          .status(400)
          .json({ error: "Please login with correct credentials" });
      }
      let compPassword = await bcrypt.compare(password, user.password);
      if (!compPassword) {
        return res
          .status(400)
          .json({ error: "Please login with correct credentials" });
      }
      const data = {
        user: {
          id: user.id,
        },
      };
      // generating authtoken
      const authtoken = jwt.sign(data, JWT_SECRET);
      res.json({ authtoken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("some error occoured");
    }
  }
);

// stoping project on video 50 
module.exports = router;
