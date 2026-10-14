
// init server
let express = require('express');
let app = express();
let port = 3012;                 // CHANGE: your port (3000-3020)

// database configuration (MariaDB)
let mysql = require('mysql');
let db = mysql.createConnection(
 {
  host: '',             // app
  user: '',                 // CHANGE: your login
  password: '',          // CHANGE: your MariaDB password
  database: ''           // CHANGE: db_<your login>
 }
);


db.connect((err) => {
  if (err) throw err;

  console.log('Connected to MariaDB!');
});

// database configuration (MongoDB) - used by the last part of the tutorial
let MongoClient = require('mongodb').MongoClient;
let MONGO_URL = 'mongodb://localhost:27017';   // CHANGE: your MongoDB address
let mongo = { collection: null };              // filled once connected

MongoClient.connect(MONGO_URL, { useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.log('MongoDB connection error: ' + err.message);
    return;
  }
  mongo.collection = client.db('iot2026').collection('RpiSensors');
  console.log('Connected to MongoDB!');
});

// load routes: define controller which act on db
let routes = require('./components/routes.js');
routes(app, db, mongo);

// run server
app.listen(port, () => {
  console.log('Server running on port ' + port);
});
