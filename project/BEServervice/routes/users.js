const router = require('express').Router()
const axios = require('axios');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

router.post('/booking', function (req, res) {
    // extract booking text from request body
    console.log(req.body)
    try {
        var booking = {...req.body};
        booking.finished = false;
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("datxe_db");
            // var result = dbo.collection("bookings").findOne({'userId': booking.userId, 'finished': false});
            // console.log(result);
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

// // define the default route that fetches all of our notes
// router.get('/', async function (req, res) {
//     console.log('get route', req.url);
//     // data the conserves our API quota for development
//     try {
//         // add api call
//         res.json({ users: usersData })
//     } catch (e) {
//         console.log(e)
//         res.status(500).send('Error.')
//     }
// })
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