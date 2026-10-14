# Web Programming for IoT – Node.js, Express, MariaDB, MongoDB & AngularJS

Lab work for the *Web Programming for IoT* course .
Two small web applications built step by step: a Node.js/Express server with forms,
EJS templates and two databases, then a parcel-tracking app with an AngularJS front end.

## Technologies

- **Node.js** (v10 compatible) and **Express 4.18**
- **EJS** templates (server-side rendering)
- **MariaDB / MySQL** with the `mysql` driver
- **MongoDB** with the `mongodb` 3.x driver
- **AngularJS 1.7** (`$scope`, `$http`, `ng-repeat`, `ng-model`, `ng-options`)

## Project structure

```
tutorial1/                 Node.js + Express + databases
├── helloapp.js            basic HTTP server (no Express)
├── app.js                 Express app: routes, forms, MongoDB, MariaDB
├── rpiSensors.sql         MariaDB table for sensor data
└── views/                 EJS templates
    ├── result.ejs         max + numbers between min and max
    ├── allRPI.ejs         all sensor data
    ├── addRPI.ejs         form to add sensor data
    └── rpiAdded.ejs       confirmation page

angularNodeApp/            Parcel tracking (MVC with AngularJS)
├── angularNodeApp.js      server start + DB connections
└── components/
    ├── routes.js          Express routes (JSON services + pages)
    ├── js/                AngularJS modules (controllers)
    │   ├── ngLocations.js
    │   ├── ngCustomers.js
    │   └── ngRPI.js
    └── views/             HTML views
        ├── ngLocations.html
        ├── ngCustomers.html
        └── ngRPI.html
```

## Features

### Tutorial 1 – Node.js, Express and databases

- Basic HTTP server with Node's `http` module
- Express routing (`/route1`, `/route2`, automatic 404 for unknown routes)
- Form with 3 numbers sent in **GET** (`req.query`, plain answer) and in **POST**
  (`req.body`, EJS template showing the maximum and a table of every number between min and max)
- MongoDB: list all sensor data (`/getAllRPI`), one sensor as JSON (`/getRPI/:id`),
  add data with a form (`/addRPI`)
- MariaDB: copy the maximum value of a sensor from MongoDB into MariaDB (`/copyDB/:id`)

### Tutorial 2 – AngularJS parcel tracking

Database: `Customers`, `Locations`, `Parcels`, `Located`.

- JSON services for locations and customers (SQL `JOIN` to get each customer's address and city)
- AngularJS pages for locations and customers (`ng-repeat`, two-way binding)
- Delete a customer with a confirmation window (blocked with a clear message when the customer still has parcels)
- Add a customer, choosing the location from a dropdown (`ng-options`)
- Display MongoDB sensor data in an AngularJS page
- `/menu` page linking every page and service

## Installation

```bash
# Tutorial 1
cd tutorial1
npm install
node app.js

# Tutorial 2
cd angularNodeApp
npm install
node angularNodeApp.js
```

Before running, set your own values in `app.js` / `angularNodeApp.js`:
the port, the MariaDB connection (host, user, password, database) and the MongoDB URL.
For Tutorial 2, import the sample database (`Customers`, `Locations`, `Parcels`, `Located`) in phpMyAdmin.
For Tutorial 1, create the table with `rpiSensors.sql`.

## Main routes

| Tutorial | Route | Description |
| --- | --- | --- |
| 1 | `/` | Two forms (GET and POST) |
| 1 | `/maximum` | Maximum of 3 numbers (GET) |
| 1 | `/maximumPost` | Maximum + numbers between min and max (POST, EJS) |
| 1 | `/getAllRPI` | All sensor data (HTML) |
| 1 | `/getRPI/:id` | One sensor's data (JSON) |
| 1 | `/addRPI` | Form to add sensor data |
| 1 | `/copyDB/:id` | Copy a sensor's maximum value into MariaDB |
| 2 | `/` | Locations page |
| 2 | `/customers` | Customers page (list, add, delete) |
| 2 | `/rpi` | Sensor data page |
| 2 | `/menu` | Links to all pages and services |
| 2 | `/getAllLocations`, `/getAllCustomers`, `/getAllRPI` | JSON services |
| 2 | `/insLocation`, `/insCustomer`, `/delCustomer` | Insert / delete services |

## What I learned

- How a Node.js server handles requests, and how Express routing works
- The difference between GET (`req.query`) and POST (`req.body`)
- Server-side rendering with EJS templates
- Working with a relational database (SQL, joins, foreign keys) and a document database (MongoDB) from the same app
- Writing safe SQL with `?` placeholders
- The MVC pattern with AngularJS: model (`$scope`), view (HTML), controller, and JSON services
