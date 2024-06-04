const express = require("express");
const { getUsers,
    createUser, 
    getUserById, 
    deleteUserById, 
    processRegister, 
    activateUserAccount, 
    updateUserById, 
    handleManageUserStatusById,
    handleUpdatePassword,
    handleForgetPassword, 
    handleResetPassword
} = require("../controllers/userController");
const upload = require('../middlewares/uploadFile');
const { validateUserRegistration, validateUserPasswordUpdate, validateUserForgetPassword, validateUserResetPassword } = require("../validators/auth");
const runValidation = require("../validators/index");
const {isLoggedIn, isLoggedOut, isAdmin } = require("../middlewares/auth");

const userRouter = express.Router();

userRouter.get("/", isLoggedIn, isAdmin, getUsers);
userRouter.get("/:id", isLoggedIn, getUserById);

userRouter.post("/", createUser);
userRouter.post("/process-register", upload.single("image"), isLoggedOut, validateUserRegistration, runValidation, processRegister);
userRouter.post('/activate', isLoggedOut, activateUserAccount);
userRouter.post("/forget-password", 
    validateUserForgetPassword,
    runValidation, 
    handleForgetPassword
);


userRouter.put("/reset-password", 
    validateUserResetPassword,
    runValidation, 
    handleResetPassword,
);
userRouter.put("/:id", isLoggedIn, upload.single("image"), updateUserById);
userRouter.put("/manage-user/:id", isLoggedIn, isAdmin, handleManageUserStatusById);
userRouter.put("/update-password/:id", validateUserPasswordUpdate, runValidation, isLoggedIn, handleUpdatePassword);



userRouter.delete("/:id", isLoggedIn, deleteUserById);

module.exports = userRouter;


//([0-9a-fA-F]{24})