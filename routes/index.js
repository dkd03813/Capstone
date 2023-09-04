var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const saltRounds = 10;
const { User } = require("../models");
const findProfile = require("../middleware/findProfile");
const authCheck = require("../middleware/authCheck");

router.post("/create", async (req, res) => {
  console.log("Received POST request to /api/create");
  let { username, password } = req.body;
  console.log(username, password);

  try {
    let hashPassword = await bcrypt.hash(password, saltRounds);

    console.log("Original Password: ", password);

    console.log(password);
    const newProfile = await User.create({
      username,
      password: hashPassword,
    });

    console.log("New User's auto-generated ID:", newProfile.id);

    // Send a success response
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.log(error);

    // Send an error response
    res.status(500).json({ message: "User creation failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const hashPassword = user.password;
    const userID = user.id;

    
    const result = await bcrypt.compare(password, hashPassword);

    if (result) {
      const token = jwt.sign({ foo: userID }, "superSecretPrivateKey", {
        expiresIn: "1h",
      });
      console.log("Password:", password);
      console.log("Hashed Password:", hashPassword);
      console.log("Comparison Result:", result);
      console.log("Token:", token);
      res.cookie("token", token);
      return res.status(200).json({ success: true, message: "User successfully logged in" });
    } else {
      console.log("User couldn't login");
      return res.status(401).json({ error: "Authentication failed" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
