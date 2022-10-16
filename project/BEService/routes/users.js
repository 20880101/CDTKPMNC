const router = require('express').Router()
const axios = require('axios');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

router.get('/initData', async function (req, res) {
    console.log('get route', req.url);
    // data the conserves our API quota for development
    try {
        var users = [
            {"userId" : "1", "name":"Nguyen Thi Thuy Trang 1",  "role" : "CLIENT"},
            {"userId" : "2", "name":"Nguyen Thi Thuy Trang 2", "role" : "CLIENT"},
            {"userId" : "3", "name":"Nguyen Thi Thuy Trang 3", "role" : "CLIENT"},

            {"userId" : "11", "name":"Tài xế 1", "role" : "DRIVER"},
            {"userId" : "12", "name":"Tài xế 2", "role" : "DRIVER"},
            {"userId" : "13", "name":"Tài xế 3", "role" : "DRIVER"},
            {"userId" : "14", "name":"Tài xế 4", "role" : "DRIVER"},
            {"userId" : "15", "name":"Tài xế 5", "role" : "DRIVER"},
            {"userId" : "16", "name":"Tài xế 6", "role" : "DRIVER"},
            {"userId" : "17", "name":"Tài xế 7", "role" : "DRIVER"},
            {"userId" : "18", "name":"Tài xế 8", "role" : "DRIVER"},
            {"userId" : "19", "name":"Tài xế 9", "role" : "DRIVER"},
            {"userId" : "20", "name":"Tài xế 10", "role" : "DRIVER"},

            {"userId" : "101", "name":"Admin 1", "role" : "ADMIN"},
            {"userId" : "102", "name":"Admin 2", "role" : "ADMIN"},
            {"userId" : "103", 'name':"Admin 3", "role" : "ADMIN"},
        ];
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("datxe_db");
                dbo.collection("users").insertMany(users, function(err, out) {
                    if (err) throw err;
                    console.log("documents inserted");
                    db.close();
                    console.log(out);
                });
        });
    } catch (e) {
        console.log(e)
        res.status(500).send('Error.')
    }
})

router.post('/booking', function (req, res) {
    // extract booking text from request body
    console.log(req.body)
    try {
        var booking = {...req.body};
        booking.finished = false;
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("datxe_db");
            dbo.collection("bookings").insertOne(booking, function(err, out) {
                if (err) throw err;
                console.log("1 document inserted");
                db.close();
                console.log(out);
                res.json({...booking});
            });
        });
        
    } catch (e) {
        console.log(e)
        res.status(500).send("Error.")
    }
})

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
router.get('/detail', async function (req, res) {
    console.log('get detail user  ', req.url);
    // data the conserves our API quota for development
    try {
        var client = {...req.query};
        console.log(client);
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("datxe_db");
            var result = dbo.collection("users").findOne(client, function(err, result) {
                if (err) throw err;
                console.log(result);
                res.json({...result});
                db.close();
              });
        });
    } catch (e) {
        console.log(e)
        res.status(500).send('Error.')
    }
})
// router.post('/add', async function (req, res) {
//     // extract note text from request body
//     const { note } = req.body
//     const data = {
//         note
//     }
//     console.log(note)
//     try {
//         // add api call
//         res.json({
//             message: 'Note added'
//         })
//     } catch (e) {
//         console.log(e)
//         res.status(500).send("Error.")
//     }
// })


module.exports = router