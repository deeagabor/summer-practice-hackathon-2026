const express = require("express");

const router = express.Router();

const authUsers = require("../data/authData");

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = authUsers.find(
    user =>
      user.username === username
      &&
      user.password === password
  );

  if(user){
    res.json(user);
  } else {
    res.status(401).json({
      message: "Invalid credentials"
    });

  }

});

module.exports = router;