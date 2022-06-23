const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");

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
    try{
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res
        .status(400)
        .json({ error: "sorry a user with same email already exixst" });
    }
    //creating new user
    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
    res.json(user);
  }
  catch (error)
  {
    console.error(error.message);
    res.status(500).send("some error occoured");
  }

    //.then(user => res.json(user));
  }
);

module.exports = router;
