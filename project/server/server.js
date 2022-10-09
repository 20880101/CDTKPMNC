// https://www.bezkoder.com/react-node-express-mongodb-mern-stack/

const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const notesRouter = require("./routes/notes");

// Loads env variables
require("dotenv").config();

// Initalizes express server
const app = express();

var corsOptions = {
  origin: "http://localhost:8081",
};

// specifies what port to run the server on
const PORT = process.env.PORT || 8080;

// Adds json parsing middleware to incoming requests
app.use(express.json());
app.use(cors(corsOptions));
app.use(bodyParser.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Chào mừng đến với ứng dụng đặt xe." });
});

// makes the app aware of routes in another folder
app.use("/notes", notesRouter);

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
