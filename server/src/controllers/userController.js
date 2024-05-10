const createError = require ('http-errors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const User = require("../models/userModel");
const { successResponse } = require('./responseController');
const mongoose = require('mongoose');
const { findWithId } = require('../services/findItem');
const { createJSONWebToken } = require('../helper/jsonwebtoken');
const { jwtActivationKey } = require('../secret');
const emailWithNodeMailer = require('../helper/email');
const {clientURL} = require('../secret');

// read a list of all users
const getUsers = async (req, res, next) => {
  try {

    const search = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 3;

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
    if(!users) throw createError(404, 'no users found');
    
    return successResponse(res, {
      statusCode: 200,
      message: "users were returned Successfully",
      payload: {
        data: users,
        pagination: {
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          previousPage: page - 1 > 0 ? page - 1 : null,
          nextPage: page + 1 <= Math.ceil(count / limit) ? page + 1 : null,
        }
      }
    });

  } catch (error) { 
    next(error);
  }
};

// read a single user by id
const getUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const options = {password: 0};
    const user = await findWithId(User, id, options);
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
    const user = await findWithId(User, id, options);

    const userImagePath = user.image;

    //image delete helper does not work check by harun
    // deleteImage(userImagePath);

    fs.access(userImagePath, (err) => {
      if(err){
        console.error('user image does not exist');
      }
      else{
        fs.unlink(userImagePath, (err) => {
          if(err) throw err;
          console.log("user image was deleted");
        })
      }
    })

    await User.findByIdAndDelete({
      _id: id,
      isAdmin: false,
    });

    return successResponse(res, {
      statusCode: 200,
      message: "user was deleted uccessfully",
    });


  } 
  catch (error) { 
    next(error);
  }
};


// process register for a user
const processRegister = async (req, res, next) => {
  try {
    const {name, email, password, phone, address} = req.body;
    
    const userExists = await User.exists({email: email});
    if(userExists) {
      throw createError(409, 'User with this email already exists. please sign in');
    } 
    
    //create jwt
    const token = createJSONWebToken({name, email, password, phone, address}, jwtActivationKey, '10m');


    // prepare email
    const emailData = {
      email,
      subject: 'Account Activation Email',
      html: `
        <h2> Hello ${name} ! <h2>
        <p> please click here to <a href="${clientURL}/api/users/activate/${token}"  target="_blank"> activate your account </a> </p>
      `
    }

    // send email with nodemailer
    try {
      // emailWithNodeMailer(emailData);
    }
    catch (emailError) {
      next(createError(500, 'Failed to send verification email'));
      return;
    }



    console.log("ClientURL: ",clientURL);
    return successResponse(res, {
      statusCode: 200,
      message: `Please go to your ${email} for completing your registration process`,
      payload: { token },
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

module.exports = { getUsers, createUser, getUserById, deleteUserById, processRegister, activateUserAccount};
