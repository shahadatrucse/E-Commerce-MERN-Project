const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const createError = require("http-errors");
const xssClean = require('xss-clean');
const rateLimit = require('express-rate-limit');
const userRouter = require("./routers/userRouter");
const seedRouter = require("./routers/seedRouter");
const { errorResponse } = require("./controllers/responseController");


const app = express();

const rateLimiter = rateLimit({
    windowMs: 1 * 60 * 10000, // 1 mintue
    max: 100,
    message: 'Too many requests from this IP. Please try again later.'
});


app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(xssClean());
app.use(rateLimiter);

app.use('/api/seed',seedRouter);
app.use('/api/users',userRouter);

// middleware function //
const isLoggedIn = (req,res,next) => {
    //console.log("isLoggedIn middleware");
    const login = true;
    if(login){
        req.body.id=104;
        next();
    }
    else{
        return res.status(401).json({message: 'please login first'});
    }
};
// app.use(isLoggedIn); // custom middleware use for all request
 

// http get request //
app.get("/",rateLimiter, (req, res) => {
  res.status(234).send("welcome to new server in get again again.");
});

app.get("/test", (req, res) => {
  res.status(200).send({
    message: "api works very fine in get.",
  });
});

app.get("/tester", (req, res) => {
  res.send({
    message: "get: api works very fine in tester in get.",
  });
});

app.post("/test", (req, res) => {
  res.send({
    message: "post: api works very fine in post.",
  });
});

app.put("/test", (req, res) => {
  res.send({
    message: "put: api works very fine in put.",
  });
});

app.delete("/test", (req, res) => {
  res.send({
    message: "delete: api works very fine in delete.",
  });
});

app.get("/api/users",isLoggedIn,(req, res) => {
  console.log(req.body.id);
  res.send({
    message: "get: user profile is returned",
  });
});

// client error handling
app.use((req,res,next)=>{
    // res.status(401).send({
    //     message: 'route not found'
    // });
    // next();
    next(createError(404,'route not found'));
});

// server error handling -> all the errors
app.use((err,req,res,next)=>{
    // console.error(err.stack)
    // res.status(500).send('Something broke!')
    
    // return res.status(err.status || 500).json({
    //     success: false,
    //     message: err.message
    // })
    return errorResponse(res,{
      statusCode: err.status,
      message: err.message,
    });
});

module.exports = app;