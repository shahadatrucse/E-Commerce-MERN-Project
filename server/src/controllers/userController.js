const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const User = require("../models/userModel");
const { successResponse } = require('./responseController');
const mongoose = require('mongoose');
const { findWithId } = require('../services/findItem');
const { createJSONWebToken } = require('../helper/jsonwebtoken');
const { jwtActivationKey,jwtResetPasswordKey } = require('../secret');
const emailWithNodeMailer = require('../helper/email');
const {clientURL} = require('../secret');
const { handleUserAction, findUsers, findUserById, deleteUserByIdService, updateUserByIdService,forgetPasswordByEmailService, resetPasswordByEmailService } = require('../services/userService');
const bcrypt = require('bcryptjs');

// read a list of all users done by findUsers service
const getUsers = async (req, res, next) => {
  try {

    const search = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 3;

    const { users, pagination } = await findUsers(search, limit, page);

    return successResponse(res, {
      statusCode: 200,
      message: "users were returned Successfully",
      payload: {
        users: users,
        pagination: pagination,
      }
    });
    
  } 
  catch (error) { 
    next(error);
  }
};


// read a single user by id
const getUserById = async (req, res, next) => {
  try {
    //console.log(req.body.uesr_Id); // from after cookie token verify
    //console.log(req.uesr); // from after cookie token verify
    const id = req.params.id;
    const options = {password: 0};
    const user = await findUserById(id, options);
    return successResponse(res, {
      statusCode: 200,
      message: "single user were returned Successfully",
      payload: {user},
    });
  } 
  catch (error) { 
    next(error);
  }
};


// create a new user with informations
const createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);

    res.status(201).send({
      data: user,
      message: "User create successful",
    });
  } catch (error) {
    next(error);
  }
};


// delete a user by id
const deleteUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const options = {password: 0};
    await deleteUserByIdService(id, options);

    //image delete helper does not work check by harun
    // const userImagePath = user.image;
    // deleteImage(userImagePath);

    // fs.access(userImagePath, (err) => {
    //   if(err){
    //     console.error('user image does not exist');
    //   }
    //   else{
    //     fs.unlink(userImagePath, (err) => {
    //       if(err) throw err;
    //       console.log("user image was deleted");
    //     })
    //   }
    // })

    // await User.findByIdAndDelete({
    //   _id: id,
    //   isAdmin: false,
    // });

    return successResponse(res, {
      statusCode: 200,
      message: "user was deleted successfully",
    });


  } 
  catch (error) { 
    next(error);
  }
};



// process register for a user
const processRegister = async (req, res, next) => {
  try {
    const {name, email, password, phone, address } = req.body;

    const image = req.file;
    if(!image){
      throw createError(400, 'Image file is required');
    }

    if(image.size > 1024 * 1024 * 2){
      throw createError(400, 'Image size is very big');
    }

    const imageBufferString = image.buffer.toString('base64');
    
    const userExists = await User.exists({email: email});
    if(userExists) {
      throw createError(409, 'User with this email already exists. please sign in');
    } 
    
    //create jwt
    const token = createJSONWebToken(
      {name, email, password, phone, address, image: 
      imageBufferString }, 
      jwtActivationKey,
      '10m'
    );


    // prepare email
    const emailData = {
      email,
      subject: 'Reset password Email',
      html: `
        <h2> Hello ${userData.name} ! <h2>
        <p> please click here to <a href="${clientURL}/api/users/reset-password/${token}"  target="_blank"> Reset your password </a> </p>
      `
    }

    // send email with nodemailer
    try {
      await emailWithNodeMailer(emailData);
    }
    catch (emailError) {
      next(createError(500, 'Failed to send reset password email'));
      return;
    }
    return successResponse(res, {
      statusCode: 200,
      message: `Please go to your ${email} for reseting the password`,
      payload: token,
    });
  } 
  catch (error) { 
    next(error);
  }
};



// activateUserAccount after verify
const activateUserAccount = async (req,res,next) => {
  try{
    const token = req.body.token;
    if(!token) throw createError(404, 'token not found');

    try{
      const decoded = jwt.verify(token, jwtActivationKey);
      if(!decoded) throw createError(401, 'Unable to verify user');

      const userExists = await User.exists({email: decoded.email});
      if(userExists){
        throw createError(409, 'User with this email already exits. Please sign in');
      }
      
      console.log(decoded);
      await User.create(decoded);

      return successResponse(res, {
          statusCode: 201,
          message: 'user was registered successfully',
        });
    }
    catch(error)
    {
      if(error.name === 'TokenExpiredError'){
        throw createError(401, 'Token has expired');
      }
      else if(error.name === 'JsonWebTokenError'){
        throw createError(401, 'Invalid Token');
      }
      else{
        throw error;
      }
    }
  } 
  catch (error) { 
    next(error);
  }
};



// update a user by id
const updateUserById = async (req, res, next) => {
  try {
    // const userId = req.params.id;
    // options = { password: 0 };
    const updatedUser = await updateUserByIdService(req);

    // const updateOptions = {new: true, runValidators: true, contest: 'query'};
    // const updates = {};

    // // name,email,phone,address,image,password
    // if(req.body.name){
    //   updates.name = req.body.name;
    // }
    // if(req.body.phone){
    //   updates.phone = req.body.phone;
    // }
    // if(req.body.address){
    //   updates.address = req.body.address;
    // }
    // if(req.body.password){
    //   updates.password = req.body.password;
    // }

    // if(req.body.email){
    //   throw createError(400, 'Email is not updated');
    // }
    
    // // image update
    // const image = req.file;

    // if(image){
    //   if(image.size > 1024 * 1024 * 2){
    //     throw createError(400, 'Image size is very big');
    //   }
    //   updates.image = image.buffer.toString('base64');
    // }

    

    // const updatedUser = await User.findByIdAndUpdate(userId, updates, updateOptions).select("-password");
    // if(!updatedUser){
    //   throw createError(400, 'User with this ID does not exist');
    // }

    return successResponse(res, {
      statusCode: 200,
      message: "user was updated uccessfully",
      payload: updatedUser,
    });
  } 
  catch (error) { 
    next(error);
  }
};


// update password of a user
const handleUpdatePassword = async (req, res, next) => {
  try {

    const { email, oldPassword, newPassword, confrimedPassword } = req.body;
    const userId = req.params.id;

    const updatedUser = await updateUserPasswordByIdService(userId, email, oldPassword, newPassword, confrimedPassword);
 
    return successResponse(res, {
      statusCode: 200,
      message: "user password was updated successfully",
      payload: {updatedUser},
    });
  } 
  catch (error) { 
    next(error);
  }
};


// ban_unban a user by id, done by handleUserAction service completed
const handleManageUserStatusById = async (req, res, next) => {
  try {
    const userId = req.params.id;    
    const action = req.body.action;
    
    const successMessage = await handleUserAction(userId, action);

    return successResponse(res, {
      statusCode: 200,
      message: successMessage,
      //payload: updatedUser,
    });
  } 
  catch (error) { 
    next(error);
  }
};


const handleForgetPassword = async(req, res, next) => {
  try{
    const {email} = req.body;

    //const token = await forgetPasswordByEmailService(email);
    const userData = await User.findOne({email: email});
    
    if(!userData){
      throw createError(404, 'Email is incorrect or you hava not verified your email address. Please register yourself first');
    }

    //create jwt
    const token = createJSONWebToken(
      {email}, 
      jwtResetPasswordKey,
      '10m'
    );


    // prepare email
    const emailData = {
      email,
      subject: 'Reset password Email',
      html: `
        <h2> Hello ${userData.name} ! <h2>
        <p> please click here to <a href="${clientURL}/api/users/reset-password/${token}"  target="_blank"> Reset your password </a> </p>
      `
    }

    //send email with nodemailer
    try {
      await emailWithNodeMailer(emailData);
    }
    catch (emailError) {
      next(createError(500, 'Failed to send reset password email'));
      return;
    }
    
    return successResponse(res, {
      statusCode: 200,
      message: `Please go to your ${email} for reseting the password`,
      payload: token,
    });
  }
  catch (error) { 
    next(error);
  }
}; 


const handleResetPassword = async (req, res, next) => {
  try {
    const {token, password} = req.body;
    await resetPasswordByEmailService(token, password);
    return successResponse(res, {
      statusCode: 200,
      message: "user password reset successfully",
    });
  } 
  catch (error) { 
    next(error);
  }
};


module.exports = { 
  getUsers, 
  createUser, 
  getUserById, 
  deleteUserById, 
  processRegister, 
  activateUserAccount, 
  updateUserById, 
  handleManageUserStatusById,
  handleUpdatePassword,
  handleForgetPassword,
  handleResetPassword,
};
