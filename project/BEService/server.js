// https://www.bezkoder.com/react-node-express-mongodb-mern-stack/

const bodyParser = require("body-parser");
const cors = require("cors");

// Initalizes express server
const express = require("express");
const app = express();
var expressWs = require("express-ws")(app);

const usersRouter = require("./routes/users");

// Loads env variables
require("dotenv").config();

// specifies what port to run the server on
const PORT = process.env.PORT || 8080;

// Adds json parsing middleware to incoming requests
app.use(express.json());

var corsOptions = {
  origin: "*",
};
app.use(cors(corsOptions));

app.use(bodyParser.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res, next) => {
  console.log("get route", req.url);
  res.json({ message: "Welcome" });
  res.end();
});

// makes the app aware of routes in another folder
app.use("/users", usersRouter);

app.use(function (req, res, next) {
  req.websocket = "/websocket";
  return next();
});

var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/";
var CLIENTS = [];
var CLIENTSArray = [];
var DRIVERS = [];
var DRIVERSArray = [];
var ADMINS = [];
var ADMINSArray = [];
var id;
app.ws("/websocket", function (ws, req) {
  ws.on("connection", (ws) => {
    console.log("on connection");
    console.log(ws);
  });

  // Reveive location from driver
  ws.on("message", function (msg, request) {
    var parsedMessage = JSON.parse(msg);
    console.log("Receive message:" + JSON.stringify(parsedMessage));
    if (parsedMessage.messageType === "REGISTER") {
      processRegisterMessage(parsedMessage, ws);
      
    } else if (parsedMessage.messageType === "BOOKING") {
      //connection.send(`{"messageType": "BOOKING", "application":"CLIENT", "userId":${this.state.userId}}`);
      if (ADMINSArray.length > 0) {
        ADMINSArray.forEach((id) => {
          console.log("Forward message to admin dashboard");
          ADMINS[id].send(msg, ADMINS[id]);
        });
      }
    } else if (parsedMessage.messageType === "BOOKING_ALERT") {
      // Logic here, just send alert to drivers in distance
      if (DRIVERSArray.length > 0) {
        // get location data of all drives and calculate distance.
        // https://github.com/TijsM/distance-between-coordinates#readme
        MongoClient.connect(url, function (err, db) {
          if (err) throw err;
          var dbo = db.db("datxe_db");
          var locations = dbo.collection("user-locations").find({ userId: { $ne: parsedMessage.clientId } });
          
          locations.forEach((location) => {
            var driver = DRIVERS["DRIVER-" + location.userId];
            if (driver) {
              console.log("get all drivers in db");
              if (location.lat !== undefined && location.lng !== undefined) {
                let value  = getDistanceBetweenTwoPoints({lat: location.lat, lon: location.lng}, {lat: parsedMessage.lat, lon: parsedMessage.lng}, 'km');
                console.log('distance: ' + value + ' km');
                console.log("send alert to");
                if (value <= parsedMessage.distance) {
                  var msg1 = parsedMessage;
                  msg1.distanceToUser = value.toFixed(2);;
                  console.log("Forward message to drivers " + "DRIVER-" + location.userId + ", address:" + location.address);
                  driver.send(JSON.stringify(msg1), driver);
                }
              }
            }
          });
        });
      }
    } else if (parsedMessage.messageType === "BOOKING_ACCEPT") {
      // {
      //   "messageType": "BOOKING_ACCEPT",
      //   "application": "DRIVER",
      //   "clientId": "${this.state.clientId}",
      //   "bookingId": "${this.state.bookingId}",
      //   "driverId": "${this.state.userId}",
      //   "driverName": "${this.state.name}",
      //   "driverPhoneNumber": "${this.state.phoneNumber}"
      //   }
      if (ADMINSArray.length > 0) {
        ADMINSArray.forEach((id) => {
          console.log("Forward accept message from driver to admin dashboard");
          ADMINS[id].send(msg, ADMINS[id]);
        });
      }
    } else if (parsedMessage.messageType === "CONFIRM_BOOKING_ACCEPT") {
      console.log("Admin connect request send message to client and driver");
      if (DRIVERSArray.length > 0) {
        let id = "DRIVER-" + parsedMessage.driverId;
        DRIVERS[id].send(msg, DRIVERS[id]);
      }
      if (CLIENTSArray.length > 0) {
        let id = "CLIENT-" + parsedMessage.clientId;
        CLIENTS[id].send(msg, CLIENTS[id]);
        // TODO Store booking with client and driver
      }
    } else if (parsedMessage.messageType === "BOOKING_CANCELED") {
      // {
      //   "messageType": "BOOKING_ACCEPT",
      //   "application": "DRIVER",
      //   "clientId": "${this.state.clientId}",
      //   "bookingId": "${this.state.bookingId}",
      //   "driverId": "${this.state.userId}",
      //   "driverName": "${this.state.name}",
      //   "driverPhoneNumber": "${this.state.phoneNumber}"
      //   }
      if (parsedMessage.application === 'DRIVER') {
        // Driver cancel booking:
        // - Notify for user
        if (CLIENTSArray.length > 0) {
          let id = "CLIENT-" + parsedMessage.clientId;
          CLIENTS[id].send(msg, CLIENTS[id]);
        }
        // - Find another driver for user
        if (ADMINSArray.length > 0) {
          // let id = "ADMIN" + "-" + parsedMessage.clientId;
          ADMINSArray.forEach((id) => {
            console.log("Forward canceled booking message to admin dashboard");
            ADMINS[id].send(msg, ADMINS[id]);
          });
        }
      }
      if (parsedMessage.application === 'CLIENT') {
        // Client cancel booking:
        // - Notify for driver
        if (DRIVERSArray.length > 0) {
          let id = "DRIVER-" + parsedMessage.driverId;
          DRIVERS[id].send(msg, DRIVERS[id]);
        }
        if (ADMINSArray.length > 0) {
          // let id = "ADMIN" + "-" + parsedMessage.clientId;
          ADMINSArray.forEach((id) => {
            console.log("Forward canceled booking message to admin dashboard");
            ADMINS[id].send(msg, ADMINS[id]);
          });
        }
      }
    } else if (parsedMessage.messageType === 'MEET_CLIENT') {
      if (ADMINSArray.length > 0) {
        ADMINSArray.forEach((id) => {
          console.log("Forward message from driver to admin dashboard");
          ADMINS[id].send(msg, ADMINS[id]);
        });
      }
      if (CLIENTSArray.length > 0) {
        let id = "CLIENT-" + parsedMessage.clientId;
        CLIENTS[id].send(msg, CLIENTS[id]);
      }
    }
  });
});

function processRegisterMessage(parsedMessage, ws) {
  id = parsedMessage.application + "-" + parsedMessage.userId;
  console.log(id);
  if (parsedMessage.application === "ADMIN") {
    if (ADMINSArray[id] === null || ADMINSArray[id] === undefined) {
      ADMINS[id] = ws;
      ADMINSArray.push(id);
    }
  } else if (parsedMessage.application === "DRIVER") {
    if (DRIVERSArray[id] === null || DRIVERSArray[id] === undefined) {
      DRIVERS[id] = ws;
      DRIVERSArray.push(id);
    }
  } else if (parsedMessage.application === "CLIENT") {
    if (CLIENTSArray[id] === null || CLIENTSArray[id] === undefined) {
      CLIENTS[id] = ws;
      CLIENTSArray.push(id);
    }
  } else {
    ws.send("ERROR");
  }
  console.log("ADMINSArray.length:" + ADMINSArray.length);
  console.log("DRIVERSArray.length:" + DRIVERSArray.length);
  console.log("CLIENTSArray.length:" + CLIENTSArray.length);
}

// setInterval(() => {
//   // ws.clients.forEach((client) => {
//   //   client.send(new Date().toTimeString());
//   // });
// }, 1000);

// Connect to db
const db = require("./app/models");
const { application } = require("express");
const { getDistanceBetweenTwoPoints } = require("calculate-distance-between-coordinates");
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch((err) => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

// console.log that your server is up and running
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
