const express = require('express')
const router = express()

const hotelController = require("../controllers/hotel.controller")

router.post("/",  hotelController.createHotel);

//UPDATE
router.put("/:id",  hotelController.updateHotel);
//DELETE
router.delete("/:id",  hotelController.deleteHotel);
//GET

router.get("/find/:id", hotelController.getHotel);
//GET ALL

router.get("/",hotelController.getHotels);
router.get("/countByCity", hotelController.countByCity);
router.get("/countByType", hotelController.countByType);
router.get("/room/:id", hotelController.getHotelRooms);


module.exports = router;