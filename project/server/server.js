// https://www.bezkoder.com/react-node-express-mongodb-mern-stack/

const bodyParser = require("body-parser");
const cors = require("cors");

// Initalizes express server
const express = require("express");
const app = express();
var expressWs = require('express-ws')(app);

const usersRouter = require("./routes/users");

// Loads env variables
require("dotenv").config();

var corsOptions = {
  origin: "http://localhost:3000",
};

// specifies what port to run the server on
const PORT = process.env.PORT || 8080;

// Adds json parsing middleware to incoming requests
app.use(express.json());
app.use(cors(corsOptions));
app.use(bodyParser.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function (req, res, next) {
  req.websocket = '/websocket';
  return next();
});

// simple route
app.get("/", (req, res, next) => {
  console.log('get route', req.url);
  res.json({message: 'Wellcom'});
  res.end();
});

// makes the app aware of routes in another folder
app.use("/users", usersRouter);

app.ws('/websocket', function(ws, req) {
  ws.on('message', function(msg) {
    console.log(msg);
    ws.send("Receive message: " + msg);
    ws.send("end");
  });
  console.log('socket', req.websocket);
});


// Connect to db
const db = require("./app/models");
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

// console.log that your server is up and running
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
