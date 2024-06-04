const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const User = require("../models/userModel");
const { successResponse } = require('./responseController');
const { createJSONWebToken } = require('../helper/jsonwebtoken');
const bcrypt = require('bcryptjs');
const { jwtAccessKey, jwtRefreshKey } = require('../secret');



// login
const handleLogin = async (req,res,next) => {
    try{
        // email, password
        const { email, password } = req.body;
        // check isExist
        const user = await User.findOne({email});
        if(!user){
            throw createError(
                404,
                'User does not exist with this email. Please register first'
            );
        }
        // compare the password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (password != user.password) {
            throw createError( 401, 'User password does not match. Please try again');
        }
        

        // isBaned
        if (user.isBanned) {
            throw createError( 401, 'User is Banned. Please contact with authority');
        }

        // token, cookie
        // create access token
        const accessToken = createJSONWebToken({user}, jwtAccessKey, '5m');
        res.cookie('accessToken', accessToken, {
            maxAge: 5 * 60 * 1000, // 5 mintue
            httpOnly: true,
            secure: true, 
            sameSite: 'none',
        });

        // refresh token
        const refreshToken = createJSONWebToken({user}, jwtRefreshKey, '7d');
        res.cookie('refreshToken', refreshToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7days
            httpOnly: true,
            secure: true, 
            sameSite: 'none',
        });


        const userWithoutPassword = await User.findOne({email}).select('-password');
        // success response
        return successResponse(res, {
            statusCode: 200,
            message: "user logged in successfully",
            payload: {userWithoutPassword},
        });
    }
    catch( error ){
        next(error);
    }
};

// logout
const handleLogout = async (req,res,next) => {
    try{         
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        // success response
        return successResponse(res, {
            statusCode: 200,
            message: "user logged out successfully",
            payload: {},
        });
    }
    catch( error ){
        next(error);
    }
};


//refresh token
const handleRefreshToken = async (req,res,next) => {
    try{         
        const oldRefreshToken = req.cookies.refreshToken;

        // verify old refresh token
        const decodedToken = jwt.verify(oldRefreshToken, jwtRefreshKey);

        if(!decodedToken){
            throw createError(401, 'Invaid refresh token. Please login again.' );
        }


        // create access token
        const accessToken = createJSONWebToken(decodedToken.user, jwtAccessKey, '5m');
        res.cookie('accessToken', accessToken, {
            maxAge: 5 * 60 * 1000, // 5 mintue
            httpOnly: true,
            secure: true, 
            sameSite: 'none',
        });

        // success response
        return successResponse(res, {
            statusCode: 200,
            message: "new access token is generated successfully",
            payload: {},
        });
    }
    catch( error ){
        next(error);
    }
};

//protected token
const handleProtectedRoute = async (req,res,next) => {
    try{         
        const oldaccessToken = req.cookies.accessToken;

        // verify old refresh token
        const decodedToken = jwt.verify(oldaccessToken, jwtAccessKey);

        if(!decodedToken){
            throw createError(401, 'Invaid access token. Please login again.' );
        }

        // success response
        return successResponse(res, {
            statusCode: 200,
            message: "Protected resources accessed successfully",
            payload: {},
        });
    }
    catch( error ){
        next(error);
    }
};



module.exports = { 
    handleLogin, 
    handleLogout, 
    handleRefreshToken, 
    handleProtectedRoute,
};