const express = require('express')
const router = express()

const userController = require("../controllers/user.controller")


//UPDATE
router.put("/:id", userController.updateUser);

//DELETE
router.delete("/:id", userController.deleteUser);

//GET
router.get("/:id", userController.getUser);

//GET ALL
router.get("/",  userController.getUsers);


module.exports = router;