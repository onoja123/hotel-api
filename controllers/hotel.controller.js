const Hotel = require("../models/hotel.model")
const Room = require("../models/room.model");
const catchAsync = require("../utils/catchAsync")

exports.createHotel = catchAsync(async(req, res, next)=>{
    const newHotel = new Hotel(req.body);

    const data = await newHotel.save();

    res.status(201).json(
        {
            sucess: true,
            data: data
        }
    )
})


exports.updateHotel = catchAsync(async(req, res, next)=>{
    const newHotel = await Room.findByIdAndUpdate(req.params.id, {$set: req.body}, {new: true})

    res.status(200).json(
        {
            sucess: true,
            data: newHotel
        }
    )

})

exports.deleteHotel = catchAsync(async(req, res, next)=>{
    const newHotel = await Room.findByIdAndDelete(req.params.id)

    res.status(200).json(
        {
            sucess: true,
            data: newHotel,
            message: "Hotel has been deleted."
        }
    )

})

exports.getHotel = catchAsync(async(req, res, next)=>{
    const hot = await Room.findById(req.params.id)
    
    res.status(202).json(
        {
            sucess: true,
            data: hot
        }
    )
})

exports.getHotels = catchAsync(async(req, res, next)=>{
    const { min, max, ...others } = req.query;
    const hotels = await Hotel.find({
        ...others,
        cheapestPrice: { $gt: min | 1, $lt: max || 999 },
      }).limit(req.query.limit);

      res.status(200).json(
        {
            sucess: true,
            data: hotels
        }
      )
})


exports.countByCity = catchAsync(async(req, res, next)=>{
    const cities = req.query.cities.split(",");
    const list = await Promise.all(
        cities.map((city) => {
          return Hotel.countDocuments({ city: city });
        })
    )

    res.status(200).json(
        {
            sucess: true,
            data: list
        }
    )
})

exports.countByType = catchAsync(async(req, res, next)=>{
    const hotelCount = await Hotel.countDocuments({ type: "hotel" });
    const apartmentCount = await Hotel.countDocuments({ type: "apartment" });
    const resortCount = await Hotel.countDocuments({ type: "resort" });
    const villaCount = await Hotel.countDocuments({ type: "villa" });
    const cabinCount = await Hotel.countDocuments({ type: "cabin" });

    res.status(200).json([
      { type: "hotel", count: hotelCount },
      { type: "apartments", count: apartmentCount },
      { type: "resorts", count: resortCount },
      { type: "villas", count: villaCount },
      { type: "cabins", count: cabinCount },
    ]);
})


exports.getHotelRooms = catchAsync(async(req, res, next)=>{
    const hotel = await Hotel.findById(req.params.id);
    const list = await Promise.all(
      hotel.rooms.map((room) => {
        return Room.findById(room);
      })
    );

    res.status(200).json(
        {
            sucess: true,
            data: list
        }
    )
})