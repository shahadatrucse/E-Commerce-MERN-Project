const {body} = require("express-validator");
// registration validation
const validateUserRegistration = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage('Name is required from auth')
        .isLength({min: 3, max: 31})
        .withMessage( 'Name should be at least 3-31 characters long frm auth' ),
    
    body("email")
        .trim()
        .notEmpty()
        .withMessage('Email is required from auth')
        .isEmail()
        .withMessage( 'Invalid Email from auth' ),
    body("password")
        .trim()
        .notEmpty()
        .withMessage('Password is required from auth')
        .isLength({min: 6})
        // .matches(
        //     //ekhane kaj korbo
        // )
        .withMessage( 'Password should be at least 6 characters long frm auth' ),

    body("address")
        .trim()
        .notEmpty()
        .withMessage('Address is required from auth')
        .isLength({min: 3})
        .withMessage( 'Address should be at least 3 characters long frm auth' ),
    body("phone")
        .trim()
        .notEmpty()
        .withMessage('Phone is required from auth'),
    body('image')
        .custom((value, { req }) => {
            if(!req.file || !req.file.buffer){
                throw new Error('User image is required');
            }
            return true;
        })
        .withMessage('Image is required from auth'),
];



// registration validation
const validateUserLogin = [
   body("email")
        .trim()
        .notEmpty()
        .withMessage('Email is required from auth')
        .isEmail()
        .withMessage( 'Invalid Email from auth' ),
    body("password")
        .trim()
        .notEmpty()
        .withMessage('Password is required from auth')
        .isLength({min: 6})
        // .matches(
        //     //ekhane kaj korbo
        // )
        .withMessage( 'Password should be at least 6 characters long frm auth' ),
];


const validateUserPasswordUpdate = [
    body("email")
         .trim()
         .notEmpty()
         .withMessage('Email is required from auth')
         .isEmail()
         .withMessage( 'Invalid Email from auth' ),
    body("oldPassword")
         .trim()
         .notEmpty()
         .withMessage('Old Password is required. Enter your old password')
         .isLength({min: 6})
         .withMessage( 'Old Password should be at least 6 characters long frm auth' ),
    body("newPassword")
         .trim()
         .notEmpty()
         .withMessage('New Password is required. Enter your New password')
         .isLength({min: 6})
         // .matches(
         //     //ekhane kaj korbo
         // )
         .withMessage( 'New Password should be at least 6 characters long frm auth' ),

    body("confirmedPassword")
         .trim()
         .notEmpty()
         .withMessage('Confirmed Password is required. Enter your old password')
         .isLength({min: 6})
         // .matches(
         //     //ekhane kaj korbo
         // )
         .withMessage( 'Confirmed Password should be at least 6 characters long frm auth' ),

        body('confirmedPassword').custom((value, { req }) => {
            if(value != req.body.newPassword){
                throw new Error("New Password and Confirmed Password do not match");
            }
            return true;
        }),


];

const validateUserForgetPassword = [
    body("email")
         .trim()
         .notEmpty()
         .withMessage('Email is required from auth')
         .isEmail()
         .withMessage( 'Invalid Email from auth' ),
];


const validateUserResetPassword = [
    body("token")
         .trim()
         .notEmpty()
         .withMessage('Token is required from auth validator'),
    body("password")
        .trim()
        .notEmpty()
        .withMessage('Password is required from auth')
        .isLength({min: 6})
        // .matches(
        //     //ekhane kaj korbo
        // )
        .withMessage( 'Password should be at least 6 characters long frm auth' ),
];


// sign in validation
module.exports = { validateUserRegistration, validateUserLogin, validateUserPasswordUpdate, validateUserForgetPassword, validateUserResetPassword };