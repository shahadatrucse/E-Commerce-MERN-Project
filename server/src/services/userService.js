const createError = require('http-errors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const {jwtResetPasswordKey } = require('../secret');
const User = require('../models/userModel');
const { createJSONWebToken } = require('../helper/jsonwebtoken');
const {clientURL} = require('../secret');
const jwt = require('jsonwebtoken');


// getUsers using this service
const findUsers = async(search, limit, page) =>
{
  try {
    const searchRegExp = new RegExp('.*' + search + '.*', 'i');
    const filter = {
      isAdmin: {$ne: true},
      $or:[
        {address: {$regex: searchRegExp}},
        {email: {$regex: searchRegExp}},
        {phone: {$regex: searchRegExp}},
      ]
    };
    const options = {password: 0};

    const users = await User.find(filter,options)
      .limit(limit)
      .skip((page - 1) * limit);
    
    const count = await User.find(filter).countDocuments();
    if(!users || users.length == 0) throw createError(
      404, 
      'no users found',
    );

    return{
      users,
      pagination: {
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        previousPage: page - 1 > 0 ? page - 1 : null,
        nextPage: page + 1 <= Math.ceil(count / limit) ? page + 1 : null,
      }
    }
  } 
  catch (error) {
    throw (error);
  }
}

// getUser using this service
const findUserById = async(id, options={}) => {
  try {
    const user = User.findById(id, options);
    if(!user){
      throw createError(404, "User not found");
    }
    return user;
  } catch (error) {
    if(error instanceof mongoose.Error.CastError){
      throw createError(400, 'Invalid ID');
    }
    throw error;
  }
}

// deleteUser using this service
const deleteUserByIdService = async (id, options = {}) => {
  try {
    const user = await User.findByIdAndDelete({
      _id: id,
      isAdmin: false,
    });

    if(user && user.image) {
      await deleteImage(user.image);
    }   

    return;
  } 
  catch (error) {
    if(error instanceof mongoose.Error.CastError){
      throw createError(400, 'Invalid ID');
    }
    throw error;
  }
}

// updateUser using this service
const updateUserByIdService = async (req) => {

  try {
    const userId = req.params.id;
    options = { password: 0 };
    const updateOptions = {new: true, runValidators: true, contest: 'query'};
    const updates = {};

    // name,email,phone,address,image,password
    if(req.body.name){
      updates.name = req.body.name;
    }
    if(req.body.phone){
      updates.phone = req.body.phone;
    }
    if(req.body.address){
      updates.address = req.body.address;
    }
    if(req.body.password){
      updates.password = req.body.password;
    }

    if(req.body.email){
      throw createError(400, 'Email is not updated');
    }
    
    // image update
    const image = req.file;

    if(image){
      if(image.size > 1024 * 1024 * 2){
        throw createError(400, 'Image size is very big');
      }
      updates.image = image.buffer.toString('base64');
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, updateOptions).select("-password");
    if(!updatedUser){
      throw createError(400, 'User with this ID does not exist');
    }
    
    return updatedUser;
  } 
  catch (error) {
    if(error instanceof mongoose.Error.CastError){
      throw createError(400, 'Invalid ID');
    }
    throw error;
  }
}

// updateUser using this service
const updateUserPasswordByIdService = async (userId, email, oldPassword, newPassword, confirmedPassword) => {

  try {
    const user = await User.findOne({email: email});
    
    if(!user){
      throw createError( 
        404, 
        'user is not found with this email',
      );
    }

    if(newPassword != confirmedPassword){
      throw createError(400, 'new password and confirmed password did not match');
    }

    //compare password
    const isPasswordMatch = await bcrypt.compare
    (oldPassword, user.password);
    if (!isPasswordMatch) {
        throw createError( 
          400, 
          'OldPassword is not correct',
        );
    }
    
    // kiveba newPassword er hash value create holo by harun
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {password: newPassword},
      {new: true}
    ).select('-password');
    
    if(!updatedUser){
      throw createError(400, 'User password not updated successfully');
    }
    return updatedUser;
  } 
  catch (error) {
    if(error instanceof mongoose.Error.CastError){
      throw createError(400, 'Invalid ID');
    }
    throw error;
  }
}


const forgetPasswordByEmailService = async (email) => {

  try {
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
    return token;
  } 
  catch (error) {
    throw error;
  }
}

const resetPasswordByEmailService = async (token, password) => {

  try {
    const decoded = jwt.verify(token, jwtResetPasswordKey);

    if(!decoded){
      throw createError(400, "Invalid or expired token");
    }

    const filter = {email: decoded.email};
    const update = {password: password};
    const options = {new: true};

    const updatedUser = await User.findOneAndUpdate(
      filter,
      update,
      options
    ).select('-password');

    if(!updatedUser){
      throw createError(400, 'Password reset failed');
    }

  } 
  catch (error) {
    throw error;
  }
}



// handle ban_unban action using this service
const handleUserAction = async (userId,action) => {
    try {
        let update;
        let successMessage;
        if(action == 'ban'){
          update = {isBanned: true};
          successMessage="User was banned successfully";
        }
        else if(action == 'unban'){
          update = {isBanned: false};
          successMessage="User was unbanned successfully";
        }
        else{
          throw createError(400, 'Invalid action. Use "ban" or "unban"');
        }
        const updateOptions = {new: true, runValidators: true, contest: 'query'};
    
        const updatedUser = await User.findByIdAndUpdate(
          userId, 
          update,
          updateOptions).select("-password");
        
        if(!updatedUser){
          throw createError(400,
            'User was not ban_unban successfully');
        }
        return successMessage;
    } 
    catch (error) {
      if(error instanceof mongoose.Error.CastError){
        throw createError(400, 'Invalid ID');
      }
      next(error);
    }
};

module.exports = {  
  findUsers, 
  findUserById, 
  deleteUserByIdService, 
  updateUserByIdService,
  updateUserPasswordByIdService,
  forgetPasswordByEmailService,
  resetPasswordByEmailService,
  handleUserAction, 
};



