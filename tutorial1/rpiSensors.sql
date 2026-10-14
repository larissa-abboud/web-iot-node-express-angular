-- Table to store RPI sensor data in MariaDB (run in phpMyAdmin > SQL tab)
CREATE TABLE IF NOT EXISTS RpiSensors (
    id INT NOT NULL AUTO_INCREMENT,
    sensorId VARCHAR(50) NOT NULL,
    type VARCHAR(50),
    value FLOAT,
    date DATETIME,
    PRIMARY KEY (id)
);
