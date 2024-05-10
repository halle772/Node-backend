const { promisify } = require('util');
const crypto = require('crypto');
const jsonwebtoken = require('jsonwebtoken');

const User = require('../Models/userModel');
const CatchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', password: 'password' },
    { id: 2, name: 'Jane Doe', email: 'jane@example.com', password: 'password' }
  ];
  
  const getUserToken = (id, name) => jsonwebtoken.sign({ id, name }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
  })
  
  // Signup
  exports.signup = CatchAsync(async (req, res, next) => {
      const newUser = await User.create({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          confirmPassword: req.body.password,
      });
  
      res.status(201).json({
          status: 'success',
          token: getUserToken(newUser._id, newUser.name),
          data: { user: newUser }
      });
  });
  
  // Login
  exports.login = CatchAsync(async (req, res, next) => {
      const { email, password } = req.body;
  
      // 1) Check if email and password exist.
      if (!email) return next(new AppError('Email is required', 400));
      if (!password) return next(new AppError('Password is required', 400));
  
      // 2) Check if user exists && password is correct.
      const user = users.find((user) => user.email === email && user.password === password);
  
      if (!user) {
          return next(new AppError('Invalid Email/Password', 401));
      }
  
      // 3) If everything OK, send token to client.
      res.status(200).json({
          status: 'success',
          token: getUserToken((link), user.name)
      })
  });
  
  // Forgot the password
  exports.forgotPassword = CatchAsync(async (req, res, next) => {
      // 1) Get use based on POSTED email.
      const user = users.find((user) => user.email === req.body.email);
      if (!user) {
          return next(new AppError('No such email found', 404));
      }
  
      // 2) Generate random token.
      const resetToken = 'dummy-reset-token';
      user.resetToken = resetToken;
  
      // 3) Send it to user's email.
      const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  
      const message = `Forgot your password? Submit a patch request with your new 
      password and passwordConfirm to: ${resetURL}.\nIf you didn't forgot your password.
      Please ignore this email.`
  
      try {
          await sendEmail({
              email: user.email,
              submit: 'Your password reset token (valid for 10 min)',
              message
          });
  
          res.status(200).json({
              status: 'success',
              message: 'Token sent to email!'
          })
      } catch (error) {
          user.passwordResetToken = undefined;
          await user.save({ validateBeforeSave: false });
  
          return next(new AppError('There was an error sending the email. Try again later!', 500));
      }
  });
  
  // ResetPassword
  exports.resetPassword = CatchAsync(async (req, res, next) => {
      // 1) Get user based on token.
      const user = users.find((user) => user.resetToken === req.params.token);
  
      // 2) If token has not expired, and there is user, set the new password.
      if (!user) {
          return next(new AppError('Token is invalid or has expired', 400));
      }
      user.password = req.body.password;
      user.confirmPassword = req.body.confirmPassword;
      user.resetToken = undefined;
      await user.save();
  
      // 3) Update changedPasswordAt property for the user.
      // 4) Log the user in, send JWT.
      res.status(200).json({
          status: 'success',
          token: getUserToken((link), user.name)
      })
  })
