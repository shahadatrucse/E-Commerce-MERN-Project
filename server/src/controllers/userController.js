const createError = require('http-errors');
const fs = require('fs');
const User = require("../models/userModel");
const { successResponse } = require('./responseController');
const mongoose = require('mongoose');
const { findWithId } = require('../services/findItem');
const { createJSONWebToken } = require('../helper/jsonwebtoken');
const { jwtActivationKey } = require('../secret');

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
    return successResponse(res, {
      statusCode: 200,
      message: "user was created uccessfully",
      payload: { token },
    });
  } 
  catch (error) { 
    next(error);
  }
};

module.exports = { getUsers, createUser, getUserById, deleteUserById, processRegister};
