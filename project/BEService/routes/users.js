const router = require("express").Router();
const axios = require("axios");
const { ObjectId } = require("mongodb");
var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/";

router.get("/initData", async function (req, res) {
  console.log("get route", req.url);
  // data the conserves our API quota for development
  try {
    // userId: String,
    // name: String,
    // phoneNumber: String,
    // password: String,
    // gender: String,
    // userRole: String,
    // activated: Boolean

    var users = [
      { userId: "1", name: "Nguyen Thi Thuy Trang 1", phoneNumber: "123456789", role: "CLIENT", activated: true },
      { userId: "2", name: "Nguyen Thi Thuy Trang 2", phoneNumber: "222222222", role: "CLIENT", activated: true },
      { userId: "3", name: "Nguyen Thi Thuy Trang 3", phoneNumber: "333333333", role: "CLIENT", activated: true },

      { userId: "11", name: "Tài xế 1", role: "DRIVER", phoneNumber: "555555555", activated: true},
      { userId: "12", name: "Tài xế 2", role: "DRIVER", phoneNumber: "666666666", activated: true },
      { userId: "13", name: "Tài xế 3", role: "DRIVER", phoneNumber: "777777777", activated: true },
      { userId: "14", name: "Tài xế 4", role: "DRIVER", phoneNumber: "999999999", activated: true },
      { userId: "15", name: "Tài xế 5", role: "DRIVER" },
      { userId: "16", name: "Tài xế 6", role: "DRIVER" },
      { userId: "17", name: "Tài xế 7", role: "DRIVER" },
      { userId: "18", name: "Tài xế 8", role: "DRIVER" },
      { userId: "19", name: "Tài xế 9", role: "DRIVER" },
      { userId: "20", name: "Tài xế 10", role: "DRIVER" },

      { userId: "101", name: "Admin 1", role: "ADMIN" },
      { userId: "102", name: "Admin 2", role: "ADMIN" },
      { userId: "103", name: "Admin 3", role: "ADMIN" },
    ];
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("datxe_db");
      dbo.collection("users").insertMany(users, function (err, out) {
        if (err) throw err;
        console.log("documents inserted");
        db.close();
        console.log(out);
      });
    });
  } catch (e) {
    console.log(e);
    res.status(500).send("Error.");
  }
});

router.get("/updateData", async function (req, res) {
  console.log("get route", req.url);
  // data the conserves our API quota for development
  var booking = {
    userId: "12",
    _id: "6354ff31f8ed6b9e529b7091",
    status: "CANCELED",
  };
  try {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("datxe_db");
      dbo
        .collection("bookings")
        .updateOne(
          { _id: ObjectId(booking._id) },
          { $set: { status: booking.status, userId: booking.userId } },
          function (err, out) {
            if (err) throw err;
            console.log("1 document updated ");
            db.close();
            console.log(out);
            res.json({ ...booking });
          }
        );
    });
  } catch (e) {
    console.log(e);
    res.status(500).send("Error.");
  }
});

router.post("/booking", function (req, res) {
  // extract booking text from request body
  console.log(req.body);
  try {
    var booking = { ...req.body };
    booking.status = "NEW_BOOKING";
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("datxe_db");
      dbo.collection("bookings").insertOne(booking, function (err, out) {
        if (err) throw err;
        console.log("1 document inserted");
        db.close();
        console.log(out);
        res.json({ ...booking });
      });
    });
  } catch (e) {
    console.log(e);
    res.status(500).send("Error.");
  }
});

router.put("/location", function (req, res) {
  // extract booking text from request body
  console.log(req.body);
  try {
    var location = { ...req.body };
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("datxe_db");
      dbo
        .collection("user_location")
        .updateOne({ userId: location.userId }, location, function (err, out) {
          if (err) throw err;
          console.log("1 document updated");
          db.close();
          console.log(out);
          res.json({ ...booking });
        });
    });
  } catch (e) {
    console.log(e);
    res.status(500).send("Error.");
  }
});

router.put("/booking-status", function (req, res) {
  // extract booking text from request body
  console.log("booking-status" + JSON.stringify(req.body));
  try {
    var booking = { ...req.body };
    booking.finished = false;
    // sample data var booking = {"userId":"12","_id":"6354ff31f8ed6b9e529b7091","status":"CANCELED"};
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("datxe_db");
      dbo
        .collection("bookings")
        .updateOne(
          { _id: ObjectId(booking._id) },
          {
            $set: {
              status: booking.status,
              lastUpdatedBy: booking.userId,
              timestamps: Date.now(),
            },
          },
          function (err, out) {
            if (err) throw err;
            console.log("1 document updated ");
            db.close();
            console.log(out);
            res.json({ ...booking });
          }
        );
    });
  } catch (e) {
    console.log(e);
    res.status(500).send("Error.");
  }
});

// router.post('/delete', async function (req, res) {
//     // extract the note id to delete from request body
//     const { noteId } = req.body
//     console.log(noteId)
//     try {
//         // add api call
//         res.send('Note deleted')
//     } catch (e) {
//         console.log(e)
//         res.status(500).send('Error.')
//     }
// })

// define the default route that fetches all of our notes
router.get("/detail", async function (req, res) {
  console.log("get detail user  ", req.url);
  // data the conserves our API quota for development
  try {
    var client = { ...req.query };
    console.log(client);
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("datxe_db");
      var result = dbo
        .collection("users")
        .findOne(client, function (err, result) {
          if (err) throw err;
          console.log(result);
          res.json({ ...result });
          db.close();
        });
    });
  } catch (e) {
    console.log(e);
    res.status(500).send("Error.");
  }
});

router.get("/bookings-top5Addresses", async function (req, res) {
  console.log("get top5 address  ", req.url);
  // data the conserves our API quota for development
  try {
    var client = { ...req.query };
    console.log(client);
    phoneNumber = client.phoneNumber;
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("datxe_db");
      var result = dbo
        .collection("bookings")
        .aggregate([
          {
            $match: { phoneNumber: client.phoneNumber, status: "MEET_CLIENT" },
          },
          {
            $group: {
              _id: {
                address: "$address"
              },
              count: {
                $sum: 1
              }
            }
          },
          {
            $sort: {
              count: -1
            }
          }
        ])
        .limit(5)
        .toArray(function (err, result) {
          if (err) throw err;
          console.log(result);
          res.json(result);
          db.close();
        });
    });
  } catch (e) {
    console.log(e);
    res.status(500).send("Error.");
  }
});

router.get("/bookings-last5Addresses", async function (req, res) {
  console.log("get top5 address  ", req.url);
  // data the conserves our API quota for development
  try {
    var client = { ...req.query };
    console.log(client);
    phoneNumber = client.phoneNumber;
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("datxe_db");
      var result = dbo
        .collection("bookings")
        .find({ phoneNumber: client.phoneNumber, status: "MEET_CLIENT" })
        .sort({ timestamps: -1 })
        .limit(5)
        .toArray(function (err, result) {
          if (err) throw err;
          console.log(result);
          res.json(result);
          db.close();
        });
    });
  } catch (e) {
    console.log(e);
    res.status(500).send("Error.");
  }
});

module.exports = router;
