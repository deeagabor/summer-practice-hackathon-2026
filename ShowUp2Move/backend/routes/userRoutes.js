const express = require("express");
const router = express.Router();

const users = require("../data/usersData");

router.get("/", (req,res) => {
    res.json(users);
});

router.post("/", (req,res) =>{
    const newUser={
        id: users.length +1,
        name: req.body.name,
        sport: req.body.sport,
        description: req.body.description,
        available: false,
    };

    users.push(newUser);
    res.json(newUser);
});

router.patch("/:id", (req, res) => {

  const user = users.find(
    user => user.id == req.params.id
  );

  if(user){

    if(req.body.available !== undefined){
      user.available = req.body.available;
    }

    if(req.body.name !== undefined){
      user.name = req.body.name;
    }

    if(req.body.sport !== undefined){
      user.sport = req.body.sport;
    }

    if(req.body.description !== undefined){
      user.description = req.body.description;
    }

    if(req.body.skillLevel !== undefined){
      user.skillLevel = req.body.skillLevel;
    }  

    if(req.body.yearsPlaying !== undefined){
      user.yearsPlaying = req.body.yearsPlaying;
    }

  }

  res.json(user);

});

module.exports = router;