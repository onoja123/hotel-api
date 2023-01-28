const User = require("../models/user.model")
const AppError = require("../utils/AppError")
const catchAsync = require("../utils/catchAsync")
const { promisify } = require('util');
const jwt = require("jsonwebtoken")
const crypto = require('crypto');
const sendEmail = require("../utils/sendEmail")

//sign user token using jwt
const signToken = id =>{
    return jwt.sign({id: id}, process.env.JWT_SECRET_KEY,{
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

// const refreshToken = id => {
//     return jwt.sign({ id: id }, process.env.JWT_SECRET_KEY, {
//       expiresIn: "1y",
//   });
// };


const createSendToken = (user, statusCode, res) =>{
  const token = signToken(user._id)

  const cookieOptions = {
    expiresIn: new Date( Date.now () * process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000)
  ,
  httpOnly: true
  }

  if(process.env.NODE_ENV === "production") cookieOptions.seucure = true
  res.status(statusCode)
  .cookie("jwt", token, cookieOptions)
  .json({
      status: true,
      token,
      data: {
          user
      }
  })
}

//signup controller
exports.signup = catchAsync(async(req, res, next)=>{
  const {username, email, password} = req.body;
 
     //check for required fields
     switch ((username, email, password)) {
      case !username && !email && !password:
        return res.status(400).send("Please fill in the required fields");
      case !username:
        return res.status(400).send("Please enter your fullusername");
      case !email:
        return res.status(400).send("Please enter your email");
      case !password:
        return res.status(400).send("Please enter your password");
    }

    const existingusername = await User.findOne({ username: req.body.username });

    if (existingusername){
      res.status(400).json({
        status: false,
        message: "The email address is already taken"
      })
    }

    const newUser = await User.create({
      username: username,
      email: email,
      password: password,
      
    })

    await newUser.save()

    const emailToken = newUser.getVerifyEmailToken()

    await newUser.save();
    const URL = "https://string-cz7x.onrender.com";
    const resetURL = `${URL}/api/auth/verify/${emailToken}`

    // const resetURL = `${req.protocol}://${req.get(
    //   'host'
    // )}/api/auth/verify/${emailToken}`;
  
    const message = `
    <p>Hi ${req.body.username}, welcome to String 🚀</p>
    <p>Before doing anything, we recommend verifying your account to use most of the features available.</p>
    <a href="${resetURL}" clicktracking=off>Verify Account</a>
    <p>String. 🚀</p>
`;
  try {
      await sendEmail({
        email: newUser.email,
        subject:  "Welcome to String 🚀",
        message
      });
      
  }catch(err){
    newUser.getVerifyEmailToken = undefined
    await newUser.save().select({verifyEmailToken:1})

    return res.status(500).send({
      status: true,
      message: "Couldn't send the verification email"});
  }

createSendToken(newUser, 201,  res)
})


exports.login = catchAsync(async(req, res, next)=>{
    //check if user and password exist
    
    const { username, password} = req.body;
  


    // 1) Check if username and password exist
     switch((username, password)){
       case !username || !password:
         return  next(new AppError("Please provide username an password!"),400)
     }
     
     // 2) Check if user exists && password is correct
     const user = await User.findOne({ username }).select('+password');

     if(user.isActive === false){
      return res.status(400).send("Please provide verify your username and try again.")
    }
     if (!user || !(await user.correctPassword(password, user.password))) {
       return next(new AppError('Incorrect email or password', 401));
     }
   
     //once everything is okay, send token
     createSendToken(user, 200,  res)
})




exports.resendVerification = catchAsync(async(req, res, next)=>{

  const user = await User.findById(req.user).select("+email");
  if (!user) return res.status(400).send("Please login");

  if (user.isActive === true) {
    return res.status(400).send("Account has already been verified");
  }

  const verifyToken = user.getVerifyEmailToken();

  await user.save();
  
    // const URL = "https://string-cz7x.onrender.com"
    // const resetURL = `${URL}/api/auth/verify/${verifyToken}`
        const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/auth/verify/${verifyToken}`;
    const message = `
    <p>Hi there ${user.username}!,</p>
    <p>Here's a new link to verify your account.</p>
    <a href="${resetURL}" clicktracking=off>Verify Account</a>
    <p>String 🚀</p>
`;

    try{
        await sendEmail(
            {
                to: user.email,
                subject: 'Verification Link 🚀!',
                message
            }
        )
        res.status(200).json({
            status: true,
            message: 'Verification link sent successfully!'
        })
    }catch(err){
        user.verifyEmailToken = undefined;
        await user.save()

        return res.status(500).json({
            status: false,
            message: "Couldn't send the verification email"});
        
    }
})

exports.forgotPassword = catchAsync(async(req, res, next)=>{
    //Get user based on email
  
    const user = await User.findOne({email: req.body.email})
  
    if(!user){
        return next(new AppError("There is no user with this email address"), 404)
    }
  
    const resetToken = user.createPasswordResetToken()
  
    await user.save({validateBeforeSave: false})
    
  
  console.log(resetToken)
    // const URL = "https://string-cz7x.onrender.com"
    //   const resetURL = `${URL}/api/auth/resetPassword/${resetToken}`;
  
        const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/auth/resetpassword/${resetToken}`;
  /** @type {*} */
  const message = `
  <p>Hi ${user.username}</p>
  <p>We heard you are having problems with your password.</p>
  <p>Click on the link below to reset your password, link expires in 10 minutes.</p>  
  <a href="${resetURL}" clicktracking=off>Reset Password</a>
  `;
  
    try {
        await sendEmail({
          email: user.email,
          subject: 'Forgot password',
          message
        });
    
        res.status(200).json({
          status: true,
          message: 'Email sent sucessfully 🚀!'
        });
      } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
    
        return next(
          new AppError('There was an error sending the email. Try again later!'),
          500
        );
      }
  })

exports.resetPassword = catchAsync(async(req, res, next)=>{

  //Get user based on the token
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest('hex')

  const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()}})


  //Check if token expired, and if there is user, set new password

  if(!user){
      return next(new AppError("Token is invalid or has expired"), 401)
  }
  user.password = req.body.password,
  user.passwordConfirm = req.body.passwordConfirm,
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined

  await user.save()
    createSendToken(user, 200, res)
})


exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};


exports.verify = catchAsync(async(req, res, next)=>{
    const verifyEmailToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
        verifyEmailToken: verifyEmailToken
      }).select("+verifyEmailToken");
    
    if(!user){
        return next(new AppError("Not a Vaild Link / An Expired Url"), 400)

    }

    if (user.isActive === true) {
      user.verifyEmailToken = null;
      return res.status(400).send("Your account has not been verified.");
    }


      //then change the user's status to active
      user.isActive = true;

      //void the token
      user.verifyEmailToken = null;


    await user.save()

   createSendToken(user, 200, res)
})

exports.protect = catchAsync(async(req, res, next)=>{
    let token;

    if(
        req.header.authorization 
        &&
        req.headers.authorization.startswith("Bearer")
    )
    token = req.headers.authorization.split(' ')[1]

    if (!token) {
        return next(
          new AppError('You are not logged in! Please log in to get access.',
           401)
        );
      }

      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY)

       const currentUser = await User.findById(decoded.id);
       if(!currentUser){
        return next(
            new AppError('The user belonging to this token does no longer exist.'),
       401)
       }
       
       if(currentUser.changedPasswordAfter(decoded.iat)){
        return next(
            new AppError("User recently changed password, please login again!"),
        401)
       }

       req.user = currentUser;
       next()
})



exports.admin = catchAsync(async(req, res, next)=>{
  const { email, password } = req.body;
  // 1) Check if email and password exist
   switch((email, password)){
     case !email || !password:
       return  next(new AppError("Please provide email and password!"),400)
   }

   // 2) Check if user exists && password is correct
   const user = await User.findOne({ email }).select('+password');
 
   if (!user || !(await user.correctPassword(password, user.password))) {
     return next(new AppError('Incorrect email or password', 401));
   }
 
   //once everything is okay, send token
   createSendToken(user, 200, res)
})


exports.logout = catchAsync(async(req, res, next)=>{
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
})
