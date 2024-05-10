const express = require("express");
const { getUsers, createUser, getUserById, deleteUserById, processRegister, activateUserAccount } = require("../controllers/userController");
const upload = require('../middlewares/uploadFile');

const userRouter = express.Router();

userRouter.get("/", getUsers);
userRouter.get("/:id", getUserById);

userRouter.post("/process-register", upload.single("image") ,processRegister);
userRouter.post("/", createUser);
userRouter.post('/verify', activateUserAccount);


userRouter.delete("/:id", deleteUserById);

module.exports = userRouter;
