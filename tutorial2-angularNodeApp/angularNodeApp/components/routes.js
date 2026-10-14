module.exports = (app, db, mongo) => {

	/* ============================================================
	   LOCATIONS (given by the teacher)
	   ============================================================ */

	app.get('/', function(req, res) {

		// send the main page
		res.setHeader('Content-Type', 'text/html');
		res.sendFile( __dirname + '/views' + '/ngLocations.html');
	});

	app.get('/ngLocations.js', function(req, res) {

		// send the angular app
		res.setHeader('Content-Type', 'application/javascript');
		res.sendFile( __dirname + '/js' + '/ngLocations.js');
	});

	app.get('/getAllLocations', function(req, res) {

			let sql = 'SELECT locId, locAddress, city FROM Locations';

			// response contains a json array with all tuples
			let postProcessSQL =   function (err, result) {
				if (err) return res.status(500).json({ error: err.message });

				res.json(result);
			};

			db.query(sql, postProcessSQL);

	});

	app.get('/insLocation', function(req, res) {
			let address = (req.query.newAddress);
			let city    = (req.query.newCity);

			let sql = 'INSERT INTO Locations(locAddress, city) VALUES(?, ?)';
			let values = [address, city];

			// create a json object containing the inserted location
			let postProcessInsert =   function (err, result) {
				if (err) return res.status(500).json({ error: err.message });

				res.json({id: result.insertId, address: address, city: city,
								insertedLines: result.affectedRows });
			};

			db.query(sql, values, postProcessInsert);

	});


	/* ============================================================
	   CUSTOMERS
	   ============================================================ */

	// 1. JSON list of all customers, with the address and city of their location
	app.get('/getAllCustomers', function(req, res) {

		// JOIN: Customers.custLocation -> Locations.LocId
		let sql = 'SELECT c.custId, c.custName, c.custLocation, l.locAddress, l.city ' +
		          'FROM Customers c LEFT JOIN Locations l ON c.custLocation = l.LocId ' +
		          'ORDER BY c.custId';

		db.query(sql, function (err, result) {
			if (err) return res.status(500).json({ error: err.message });

			res.json(result);
		});
	});

	// 3. send the angular module for customers
	app.get('/ngCustomers.js', function(req, res) {
		res.setHeader('Content-Type', 'application/javascript');
		res.sendFile( __dirname + '/js' + '/ngCustomers.js');
	});

	// 4. send the customers page (view)
	app.get('/customers', function(req, res) {
		res.setHeader('Content-Type', 'text/html');
		res.sendFile( __dirname + '/views' + '/ngCustomers.html');
	});

	// Delete a customer: /delCustomer?id=3
	app.get('/delCustomer', function(req, res) {
		let id = Number(req.query.id);
		if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });

		let sql = 'DELETE FROM Customers WHERE custId = ?';

		db.query(sql, [id], function (err, result) {
			if (err) {
				// Typical case: the customer still has parcels (foreign key)
				if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
					return res.status(409).json({ error: 'This customer still has parcels, they cannot be deleted.' });
				}
				return res.status(500).json({ error: err.message });
			}

			res.json({ id: id, deletedLines: result.affectedRows });
		});
	});

	// Add a customer: /insCustomer?name=Dupont&locId=2
	app.get('/insCustomer', function(req, res) {
		let name  = req.query.name;
		let locId = Number(req.query.locId);
		if (!name || !Number.isInteger(locId)) {
			return res.status(400).json({ error: 'A name and a location id are required' });
		}

		let sql = 'INSERT INTO Customers(custName, custLocation) VALUES(?, ?)';

		db.query(sql, [name, locId], function (err, result) {
			if (err) {
				if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
					return res.status(400).json({ error: 'This location does not exist' });
				}
				return res.status(500).json({ error: err.message });
			}

			// read back the new customer with its address + city, so the page can show it
			let sqlNew = 'SELECT c.custId, c.custName, c.custLocation, l.locAddress, l.city ' +
			             'FROM Customers c LEFT JOIN Locations l ON c.custLocation = l.LocId ' +
			             'WHERE c.custId = ?';

			db.query(sqlNew, [result.insertId], function (err2, rows) {
				if (err2) return res.status(500).json({ error: err2.message });

				res.json(rows[0]);
			});
		});
	});


	/* ============================================================
	   RPI SENSORS (MongoDB)
	   ============================================================ */

	// JSON list of all RPI documents
	app.get('/getAllRPI', function(req, res) {
		if (!mongo.collection) return res.status(503).json({ error: 'MongoDB is not connected' });

		mongo.collection.find({}).toArray(function (err, docs) {
			if (err) return res.status(500).json({ error: err.message });

			res.json(docs);
		});
	});

	app.get('/ngRPI.js', function(req, res) {
		res.setHeader('Content-Type', 'application/javascript');
		res.sendFile( __dirname + '/js' + '/ngRPI.js');
	});

	app.get('/rpi', function(req, res) {
		res.setHeader('Content-Type', 'text/html');
		res.sendFile( __dirname + '/views' + '/ngRPI.html');
	});


	/* ============================================================
	   MENU
	   ============================================================ */

	app.get('/menu', function(req, res) {
		res.send(`
			<!doctype html>
			<html>
			<head><meta charset="UTF-8"><title>Menu</title></head>
			<body>
				<h1>Menu</h1>
				<h2>Pages</h2>
				<ul>
					<li><a href="/">Locations</a></li>
					<li><a href="/customers">Customers</a></li>
					<li><a href="/rpi">RPI sensors (MongoDB)</a></li>
				</ul>
				<h2>JSON services</h2>
				<ul>
					<li><a href="/getAllLocations">/getAllLocations</a></li>
					<li><a href="/getAllCustomers">/getAllCustomers</a></li>
					<li><a href="/getAllRPI">/getAllRPI</a></li>
				</ul>
			</body>
			</html>
		`);
	});

}
