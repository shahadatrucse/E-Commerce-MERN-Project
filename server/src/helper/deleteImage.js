const fs = require('fs').promises;
const deleteImage = async (userImagePath) => {
    try{
        await fs.access(userImagePath);
        await fs.unlink(userImagePath);
        console.log('user image was deleted');
    }
    catch(error){
        console.error('user image dose not exit');
    }
};

module.exports = { deleteImage };

const createError = require('http-errors');
const User = require("../models/userModel");
const { successResponse } = require('./responseController');
const mongoose = require('mongoose');
const { findWithId } = require('../services/findItem');



// delete a user by id
const deleteUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const options = {password: 0};
    const user = await findWithId(User, id, options);

    const userImagePath = user.image;
    deleteImage(userImagePath);

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

module.exports = {deleteUserById};
