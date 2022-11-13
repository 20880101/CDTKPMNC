const router = require("express").Router();
const axios = require("axios");
const { ObjectId } = require("mongodb");
var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/";

router.get("/initData", async function (req, res) {
  console.log("get route", req.url);
  // data the conserves our API quota for development
  try {
    var users = [
      { userId: "1", name: "Nguyen Thi Thuy Trang 1", phoneNumber: "123456789", role: "CLIENT", activated: true, password: "123456" },
      { userId: "2", name: "Nguyen Thi Thuy Trang 2", phoneNumber: "1000000001", role: "CLIENT", activated: true, password: "123456" },
      { userId: "3", name: "Nguyen Thi Thuy Trang 3", phoneNumber: "1000000002", role: "CLIENT", activated: true, password: "123456" },

      { userId: "11", name: "Tài xế 1", role: "DRIVER", phoneNumber: "5000000001", activated: true, password: "123456"},
      { userId: "12", name: "Tài xế 2", role: "DRIVER", phoneNumber: "5000000002", activated: true, password: "123456"},
      { userId: "13", name: "Tài xế 3", role: "DRIVER", phoneNumber: "5000000003", activated: true, password: "123456"},
      { userId: "14", name: "Tài xế 4", role: "DRIVER", phoneNumber: "5000000004", activated: true, password: "123456"},
      { userId: "15", name: "Tài xế 5", role: "DRIVER", phoneNumber: "5000000005",password: "123456" },
      { userId: "16", name: "Tài xế 6", role: "DRIVER", phoneNumber: "5000000006",password: "123456" },
      { userId: "17", name: "Tài xế 7", role: "DRIVER", phoneNumber: "5000000007",password: "123456" },
      { userId: "18", name: "Tài xế 8", role: "DRIVER", phoneNumber: "5000000008",password: "123456" },
      { userId: "19", name: "Tài xế 9", role: "DRIVER", phoneNumber: "5000000009",password: "123456" },
      { userId: "20", name: "Tài xế 10", role: "DRIVER", phoneNumber: "5000000010",password: "123456" },

      { userId: "101", name: "Admin 1", role: "ADMIN", phoneNumber: "9000000001", password: "123456" },
      { userId: "102", name: "Admin 2", role: "ADMIN", phoneNumber: "9000000002", password: "123456" },
      { userId: "103", name: "Admin 3", role: "ADMIN", phoneNumber: "9000000003", password: "123456" },
    ];
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("datxe_db");
      dbo.collection("users").insertMany(users, function (err, out) {
        if (err) throw err;
        console.log("documents inserted");
        db.close();
        console.log(out);
        res.json({ ...users });
      });
    });
  } catch (e) {
    console.log(e);
    res.status(500).send("Error.");
  }
});

router.get("/initDataLocation", async function (req, res) {
  console.log("get route", req.url);
  // data the conserves our API quota for development
  try {
    var userLocations = [
      {
        userId: "1",
        name: "Nguyen Thi Thuy Trang 1",
        address: "1, Lê Duẩn, Quận 1, Hồ Chí Minh",
        lng: undefined,
        lat: undefined,
      },
      {
        userId: "2",
        name: "Nguyen Thi Thuy Trang 2",
        address: "2, Xô Viết Nghệ Tĩnh, Bình Thạnh, Hồ Chí Minh",
        lng: undefined,
        lat: undefined,
      },
      {
        userId: "3",
        name: "Nguyen Thi Thuy Trang 3",
        address: "3, Cộng Hòa, Quận Tân Bình, Hồ Chí Minh",
        lng: undefined,
        lat: undefined,
      },

      {
        userId: "11",
        address: "1, Trần Hưng Đạo, Quận 1, Hồ Chí Minh",
        lng:
        106.70404,
        lat:
        10.773045
      },
      {
        userId: "12",
        address: "2, Nam Kỳ Khởi Nghĩa, Quận 3, Hồ Chí Minh",
        lng:
        106.6870033,
        lat:
        10.7866596
      },
      {
        userId: "13",
        address: "3, Âu Cơ, Tân Bình, Hồ Chí Minh",
        lng: 106.6398917,
        lat: 10.7911121,
      },
      {
        userId: "14",
        address: "4, Tô Ký, Quận 12, Hồ Chí Minh",
        lng: 106.6185,
        lat: 10.85932,
      },
      {
        userId: "15",
        address: "5, Tam Bình, Quận Thủ Đức, Hồ Chí Minh",
        lng: 106.7337841,
        lat: 10.8676413,
      },
      {
        userId: "16",
        address: "6, Lê Văn Việt, Quận 9, Hồ Chí Minh",
        lng: 106.7750689,
        lat: 10.8484343,
      },
      {
        userId: "17",
        address: "7, Nam Kỳ Khởi Nghĩa, Quận 3, Hồ Chí Minh",
        lng: 106.6862412,
        lat: 10.7861386,
      },
      {
        userId: "18",
        address: "8, Cách Mạng Tháng 8, Quận 10, Hồ Chí Minh",
        lng: 106.6773282,
        lat: 10.7765963,
      },
      {
        userId: "19",
        address: "9, Lạc Long Quân, Quận 5, Hồ Chí Minh",
        lng: 106.6633746,
        lat: 10.7540279,
      },
      {
        userId: "20",
        address: "10, Trường Sơn, Quận Tân Bình, Hồ Chí Minh",
        lng: 106.664809,
        lat: 10.8075352,
      },
    ];
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("datxe_db");
      dbo
        .collection("user-locations")
        .insertMany(userLocations, function (err, out) {
          if (err) throw err;
          console.log("documents inserted");
          db.close();
          console.log(out);
          res.json({ ...userLocations });
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
        .collection("user-locations")
        .updateOne({ userId: location.userId }, {
          $set: {
            address: location.address,
            lat: location.lat,
            lng: location.lng
          },
        }, function (err, out) {
          if (err) throw err;
          console.log("1 document updated");
          db.close();
          console.log(out);
          res.json({ ...out });
        });
    });
  } catch (e) {
    console.log(e);
    res.status(500).send("Error.");
  }
});

router.post("/location-detail", function (req, res) {
  // extract booking text from request body
  console.log(req.body);
  try {
    var location = { ...req.body };
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("datxe_db");
      dbo
        .collection("user-locations")
        .findOne(location, function (err, result) {
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

router.post("/login", async function (req, res) {
  console.log("user login ", req.url);
  // data the conserves our API quota for development
  console.log(req.body);
  var loginRequest = { ...req.body };
  try {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("datxe_db");
      var result = dbo
        .collection("users")
        .findOne(loginRequest, function (err, result) {
          if (err) throw err;
          console.log(result);
          if (result !== null) {
            res.json({
              name: result.name,
              phoneNumber: result.phoneNumber,
              userId: result.userId,
              gender: result.gender,
              activated: result.activated,
              role: result.role,
              id: result._id
            });
          } else {
            res.json({error:'Không tìm thấy người dùng'});
          }
          db.close();
        });
    });
  } catch (e) {
    console.log(e);
    res.status(500).send("Error.");
  }
});

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
