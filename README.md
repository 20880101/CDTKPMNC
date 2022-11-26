# Run Server
Listening on port 8080
`cd BEService`
`npm start`

# Run Client app
Listening on port 5000, http://localhost:5000
`cd FEClient`
`npm start`

# Run driver app
Listening on port 5001, http://localhost:5001
`cd FEDriver`
`npm start`

# Run admin app
Listening on port 4000, http://localhost:4000
`cd FEAdmin`
`npm start`

# Init user to db:
Call this get request on browser: http://localhost:8080/users/initData

# Init location to DB:
Call this get request on browser: http://localhost:8080/users/initDataLocation

# Filter data in mongodb:
{_id: ObjectId('635504d3fb145eb7fcccd982')}

# last5Addresses by phone
http://localhost:8080/users/bookings-last5Addresses?phoneNumber=123456

# top5Addresses by phone
http://localhost:8080/users/bookings-top5Addresses?phoneNumber=123456