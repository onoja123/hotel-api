const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const crypto = require('crypto');

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
            type: String
          },
          img: {
            type: String,
          },
          city: {
            type: String
          },
          phone: {
            type: String
          },
          password: {
            type: String,
            required: true,
          },
          role: {
            type: Boolean,
            default: false,
          },
          isActive: {
            type: Boolean,
            required: true,
            default: false,
        },
          verifyEmailToken:{
            type: String,
            select: false,
          },
          createdAt: {
            type: Date,
            default: Date.now         
          },
        changedPasswordAt: Date,
        passwordResetToken: String,
        passwordExpiresToken: String
    }
)
userSchema.pre('save', async function(next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next();
  
    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
  
    // Delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
  });
  
userSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();
  
    this.passwordChangedAt = Date.now() - 1000;
    next();
});


userSchema.methods.correctPassword = async function(
    candidatePassword,
    userPassword
  ) {
    return await bcrypt.compare(candidatePassword, userPassword);
};
  
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
      const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
      );
  
      return JWTTimestamp < changedTimestamp;
}
  
    // False means NOT changed
    return false;
};

userSchema.methods.createPasswordResetToken =  function(){
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest("hex");

    this.passwordExpireToken = Date.now() + 10 * 60 * 1000;

    return resetToken;
};



userSchema.methods.getVerifyEmailToken = function () {
const resetToken = crypto.randomBytes(20).toString('hex');

this.verifyEmailToken = crypto.createHash('sha256').update(resetToken).digest('hex');

	return resetToken;
    
}



const User = mongoose.model("User", userSchema)

module.exports = User;