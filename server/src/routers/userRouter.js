const express = require("express");
const { getUsers, createUser, getUserById, deleteUserById, processRegister } = require("../controllers/userController");

const userRouter = express.Router();

userRouter.get("/", getUsers);
userRouter.get("/:id", getUserById);

userRouter.post("/process-register", processRegister);
userRouter.post("/", createUser);

userRouter.delete("/:id", deleteUserById);

module.exports = userRouter;
