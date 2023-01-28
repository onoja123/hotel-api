const Hotel = require("../models/hotel.model")
const Room = require("../models/room.model");
const catchAsync = require("../utils/catchAsync")


exports.createRoom = catchAsync(async(req, res, next)=>{
const hotelId = req.params.hotelid;
  const newRoom = new Room(req.body);

  const savedRoom = await newRoom.save();

  await Hotel.findByIdAndUpdate(hotelId, {
    $push: { rooms: savedRoom._id },
  });


  res.status(200).json(
    {
        sucess: true,
        data: savedRoom
    }
  )
})

exports.updateRoom = catchAsync(async(req, res, next)=>{
    const updatedRoom = await Room.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );

      res.status(200).json(
        {
            sucess: true,
            data: updatedRoom
        }
      )
})

exports.updateRoomAvailability = catchAsync(async(req, res, next)=>{
    await Room.updateOne(
        { "roomNumbers._id": req.params.id },
        {
          $push: {
            "roomNumbers.$.unavailableDates": req.body.dates
          },
        }
      );

      res.status(200).json(
        {
            sucess: true,
            message: "Room status has been updated"
        }
      )
})

exports.deleteRoom = catchAsync(async(req, res, next)=>{
    const hotelId = req.params.hotelid;

    await Room.findByIdAndDelete(req.params.id);

    await Hotel.findByIdAndUpdate(hotelId, {
        $pull: { rooms: req.params.id },
      });

      res.status(200).json(
        {
            sucess: true,
            message: "Room has been deleted"
        }
      )

})


exports.getRoom = catchAsync(async(req, res, next)=>{
    const room = await Room.findById(req.params.id);
    res.status(200).json(
        {
            sucess: true,
            data: room
        }
      )
})

exports.getRooms = catchAsync(async(req, res, next)=>{
    const room = await Room.find();
    res.status(200).json(
        {
            sucess: true,
            data: room
        }
      )
})