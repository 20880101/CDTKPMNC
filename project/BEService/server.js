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
  res.json({ message: "Wellcom" });
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
var DRIVERS = [];
var ADMINS = [];
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
      if (ADMINS?.length > 0) {
        ADMINS.forEach((admin) => {
          console.log("Forward message to admin dashboard");
          admin.send(msg, admin);
        });
      }
    } else if (parsedMessage.messageType === "BOOKING_ALERT") {
      // Logic here, just send alert to drivers in distance
      if (DRIVERS?.length > 0) {
        const distance = parsedMessage.distance;
        // get location data of all drives and calculate distance.
        let selectedDrivers = [];
        
        // https://github.com/TijsM/distance-between-coordinates#readme
        // DRIVERS
        MongoClient.connect(url, function (err, db) {
          if (err) throw err;
          var dbo = db.db("datxe_db");
          var cursor = dbo.collection("user-locations").find({ userId: { $ne: parsedMessage.clientId } });
          
          cursor.forEach((location) => {
            console.log(location.address);
            var driver = DRIVERS["DRIVER-" + location.userId];
            if (driver) {
              if (location.lat !== undefined && location.lng !== undefined) {
                let value  = getDistanceBetweenTwoPoints({lat: location.lat, lon: location.lng}, {lat: parsedMessage.lat, lon: parsedMessage.lng}, 'km');
                console.log(value);
                if (value <= parsedMessage.distance) {
                  console.log("Forward message to admin drivers ");
                  driver.send(msg, driver);
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
      if (ADMINS.length > 0) {
        // let id = "ADMIN" + "-" + parsedMessage.clientId;
        ADMINS.forEach((admin) => {
          console.log("Forward accept message from driver to admin dashboard");
          admin.send(msg, admin);
        });
      }
    } else if (parsedMessage.messageType === "CONFIRM_BOOKING_ACCEPT") {
      console.log("Admin connect request send message to client and driver");
      if (DRIVERS.length > 0) {
        let id = "DRIVER-" + parsedMessage.driverId;
        DRIVERS[id].send(msg, DRIVERS[id]);
      }
      if (CLIENTS.length > 0) {
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
        if (CLIENTS.length > 0) {
          let id = "CLIENT-" + parsedMessage.clientId;
          CLIENTS[id]?.send(msg, CLIENTS[id]);
        }
        // - Find another driver for user
        if (ADMINS.length > 0) {
          // let id = "ADMIN" + "-" + parsedMessage.clientId;
          ADMINS.forEach((admin) => {
            console.log("Forward canceled booking message to admin dashboard");
            admin.send(msg, admin);
          });
        }
      }
      if (parsedMessage.application === 'CLIENT') {
        // Client cancel booking:
        // - Notify for driver
        if (DRIVERS.length > 0) {
          let id = "DRIVER-" + parsedMessage.driverId;
          DRIVERS[id]?.send(msg, DRIVERS[id]);
        }
        if (ADMINS.length > 0) {
          // let id = "ADMIN" + "-" + parsedMessage.clientId;
          ADMINS.forEach((admin) => {
            console.log("Forward canceled booking message to admin dashboard");
            admin.send(msg, admin);
          });
        }
      }
    }
  });

  // console.log('socket', req.websocket);
  // clients.push(req.socket.remoteAddress);
  console.log(CLIENTS.length);
});

function processRegisterMessage(parsedMessage, ws) {
  id = parsedMessage.application + "-" + parsedMessage.userId;
  console.log(id);
  if (parsedMessage.application === "ADMIN") {
    if (ADMINS[id] === null || ADMINS[id] === undefined) {
      ADMINS[id] = ws;
      ADMINS.push(ws);
    }
  } else if (parsedMessage.application === "DRIVER") {
    if (DRIVERS[id] === null || DRIVERS[id] === undefined) {
      DRIVERS[id] = ws;
      DRIVERS.push(ws);
    }
  } else if (parsedMessage.application === "CLIENT") {
    if (CLIENTS[id] === null || CLIENTS[id] === undefined) {
      CLIENTS[id] = ws;
      CLIENTS.push(ws);
    }
  } else {
    ws.send("ERROR");
  }
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
