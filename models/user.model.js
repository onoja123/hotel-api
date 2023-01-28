const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
          },
          email: {
            type: String,
            required: true,
            unique: true,
          },
          country: {
            type: String,
            required: true,
          },
          img: {
            type: String,
          },
          city: {
            type: String,
            required: true,
          },
          phone: {
            type: String,
            required: true,
          },
          password: {
            type: String,
            required: true,
          },
          isAdmin: {
            type: Boolean,
            default: false,
          },
          getVerifyEmailToken:{
            type: String,
            select: false,
          },
        changedPasswordAt: Date,
        passwordResetToken: String,
        passwordExpiresToken: String
    }
)


const User = mongoose.model("User", userSchema)

module.exports = User;