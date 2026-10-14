const express = require('express');
const app = express();

const PORT = 3012;

// Needed to read POST data from req.body
app.use(express.urlencoded({ extended: true }));

// Use EJS as the template engine (templates go in the "views" folder)
app.set('view engine', 'ejs');


/* =====================================================================
   PART 1 - Basic web content
   ===================================================================== */

// ---------- Express "Hello world" ----------
app.get('/route1', (req, res) => {
    res.send('Route 1 successfully requested!');
});

app.get('/route2', (req, res) => {
    res.send('Route 2 successfully requested!');
});
// /route3 is not defined -> Express answers "Cannot GET /route3" (404)

// ---------- Basic form: page with 2 forms ----------
app.get('/', (req, res) => {
    res.send(`
        <h1>Find the Maximum</h1>

        <h2>Form 1 - GET (no template)</h2>
        <form action="/maximum" method="GET">
            <label>Number 1:</label> <input type="number" name="n1" required><br><br>
            <label>Number 2:</label> <input type="number" name="n2" required><br><br>
            <label>Number 3:</label> <input type="number" name="n3" required><br><br>
            <button type="submit">Calculate (GET)</button>
        </form>

        <hr>

        <h2>Form 2 - POST (with EJS template)</h2>
        <form action="/maximumPost" method="POST">
            <label>Number 1:</label> <input type="number" name="n1" required><br><br>
            <label>Number 2:</label> <input type="number" name="n2" required><br><br>
            <label>Number 3:</label> <input type="number" name="n3" required><br><br>
            <button type="submit">Calculate (POST)</button>
        </form>

        <hr>
        <h2>Database part</h2>
        <ul>
            <li><a href="/getAllRPI">/getAllRPI</a> - all RPI data (MongoDB)</li>
            <li><a href="/getRPI/1">/getRPI/1</a> - RPI 1 as JSON</li>
            <li><a href="/addRPI">/addRPI</a> - add RPI data</li>
            <li><a href="/copyDB/1">/copyDB/1</a> - copy max value of RPI 1 into MariaDB</li>
        </ul>
    `);
});

// Helper: read the 3 numbers, return null if one is missing/invalid
function readNumbers(source) {
    const values = [source.n1, source.n2, source.n3];
    if (values.some(v => v === undefined || v === '')) return null;
    const nums = values.map(Number);
    if (nums.some(n => !Number.isFinite(n))) return null;
    return nums;
}

// ---------- GET: send only the value ----------
app.get('/maximum', (req, res) => {
    const nums = readNumbers(req.query);          // GET data is in req.query
    if (!nums) return res.status(400).send('Invalid numbers');

    const max = Math.max(...nums);
    res.send(`The maximum is: ${max}`);
});

// ---------- POST: use a template ----------
app.post('/maximumPost', (req, res) => {
    const nums = readNumbers(req.body);           // POST data is in req.body
    if (!nums) return res.status(400).send('Invalid numbers');

    const max = Math.max(...nums);
    const min = Math.min(...nums);

    // All integers between min and max (inclusive)
    const between = [];
    for (let i = Math.ceil(min); i <= Math.floor(max); i++) {
        between.push(i);
    }

    // Render views/result.ejs and give it the data
    res.render('result', { numbers: nums, min: min, max: max, between: between });
});


/* =====================================================================
   PART 2 - Storing and retrieving data (MongoDB & MariaDB)
   ===================================================================== */

// ---------- Configuration: CHANGE THESE to your own values ----------
const MONGO_URL = 'mongodb://localhost:27017';   // your MongoDB server address
const MONGO_DB = 'iot2026';                       // database name
const MONGO_COLLECTION = 'RpiSensors';            // collection name

const mysql = require('mysql');

const sqlDb = mysql.createConnection({
    host: '',
    user: '',
    password: '',
    database: ''
});

sqlDb.connect((err) => {
    if (err) {
        console.log('MariaDB connection error: ' + err.message);
        return;
    }
    console.log('Connected to MariaDB!');
});

// ---------- MongoDB connection (done once, at startup) ----------
const MongoClient = require('mongodb').MongoClient;
let rpiCollection = null;   // will hold the collection once connected

MongoClient.connect(MONGO_URL, { useUnifiedTopology: true }, (err, client) => {
    if (err) {
        console.log('MongoDB connection error: ' + err.message);
        return;
    }
    rpiCollection = client.db(MONGO_DB).collection(MONGO_COLLECTION);
    console.log('Connected to MongoDB!');
});

// Small helper: stop the request if MongoDB is not connected yet
function mongoReady(res) {
    if (!rpiCollection) {
        res.status(503).send('MongoDB is not connected');
        return false;
    }
    return true;
}

// The id in the URL is always a string ("1"), but in Mongo it may be stored
// as a number (1) or a string ("1"). This filter matches both.
function idFilter(idFromUrl) {
    const asNumber = Number(idFromUrl);
    if (Number.isNaN(asNumber)) return { id: idFromUrl };
    return { id: { $in: [idFromUrl, asNumber] } };
}

// ---------- /getAllRPI : all documents, displayed with a template ----------
app.get('/getAllRPI', (req, res) => {
    if (!mongoReady(res)) return;

    rpiCollection.find({}).toArray((err, docs) => {
        if (err) return res.status(500).send(err.message);
        res.render('allRPI', { rpis: docs });
    });
});

// ---------- /getRPI/:id : data of one RPI, as JSON ----------
app.get('/getRPI/:id', (req, res) => {
    if (!mongoReady(res)) return;

    rpiCollection.find(idFilter(req.params.id)).toArray((err, docs) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(docs);
    });
});

// ---------- /addRPI : form page (GET) ----------
app.get('/addRPI', (req, res) => {
    res.render('addRPI');
});

// ---------- /addRPI : receive the form (POST) and insert in MongoDB ----------
app.post('/addRPI', (req, res) => {
    if (!mongoReady(res)) return;

    const value = Number(req.body.value);
    if (!req.body.id || req.body.value === undefined || req.body.value === '' || !Number.isFinite(value)) {
        return res.status(400).send('Invalid data: id and a numeric value are required');
    }

    const newDoc = {
        id: Number.isNaN(Number(req.body.id)) ? req.body.id : Number(req.body.id),
        type: req.body.type,
        value: value,
        date: new Date()
    };

    rpiCollection.insertOne(newDoc, (err, result) => {
        if (err) return res.status(500).send(err.message);
        res.render('rpiAdded', { rpi: newDoc });
    });
});

// ---------- /copyDB/:id : max value from MongoDB -> MariaDB ----------
app.get('/copyDB/:id', (req, res) => {
    if (!mongoReady(res)) return;

    // 1) In MongoDB: documents of this sensor, sorted by value (biggest first), keep 1
    rpiCollection.find(idFilter(req.params.id))
        .sort({ value: -1 })
        .limit(1)
        .toArray((err, docs) => {
            if (err) return res.status(500).send(err.message);
            if (docs.length === 0) return res.status(404).send('No data for RPI ' + req.params.id);

            const maxDoc = docs[0];

            // 2) In MariaDB: insert that document
            const sql = 'INSERT INTO RpiSensors(sensorId, type, value, date) VALUES (?, ?, ?, ?)';
            const values = [String(maxDoc.id), maxDoc.type, maxDoc.value, new Date(maxDoc.date || Date.now())];

            sqlDb.query(sql, values, (err2, result) => {
                if (err2) return res.status(500).send('MariaDB error: ' + err2.message);
                res.json({
                    message: 'Max value copied to MariaDB',
                    insertedId: result.insertId,
                    copied: maxDoc
                });
            });
        });
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
