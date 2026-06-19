-- College Bus Fees Management System - Database Schema
-- Run this in MySQL to create the database

CREATE DATABASE IF NOT EXISTS bus_fees_db;
USE bus_fees_db;

-- Tables are auto-created by Sequelize sync
-- But you can also run this manually:

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'student') DEFAULT 'student',
  phone VARCHAR(15),
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS routes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  routeNumber VARCHAR(20) UNIQUE NOT NULL,
  routeName VARCHAR(100) NOT NULL,
  startPoint VARCHAR(100) NOT NULL,
  endPoint VARCHAR(100) NOT NULL,
  stops TEXT,
  distanceKm DECIMAL(8,2),
  monthlyFee DECIMAL(10,2) NOT NULL,
  termFee DECIMAL(10,2),
  annualFee DECIMAL(10,2),
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  routeId INT,
  studentId VARCHAR(30) UNIQUE NOT NULL,
  rollNumber VARCHAR(30),
  department VARCHAR(100),
  year INT,
  section VARCHAR(10),
  address TEXT,
  boardingPoint VARCHAR(100),
  parentName VARCHAR(100),
  parentPhone VARCHAR(15),
  admissionDate DATE,
  feeType ENUM('monthly','term','annual') DEFAULT 'monthly',
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (routeId) REFERENCES routes(id)
);

CREATE TABLE IF NOT EXISTS fees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  studentId INT NOT NULL,
  routeId INT NOT NULL,
  feeMonth VARCHAR(7),
  feePeriod VARCHAR(20),
  feeType ENUM('monthly','term','annual') DEFAULT 'monthly',
  amount DECIMAL(10,2) NOT NULL,
  lateFee DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  totalAmount DECIMAL(10,2) NOT NULL,
  status ENUM('pending','paid','overdue','waived') DEFAULT 'pending',
  dueDate DATE NOT NULL,
  paidDate DATE,
  paymentMode ENUM('cash','online','cheque','dd'),
  receiptNumber VARCHAR(50) UNIQUE,
  transactionId VARCHAR(100),
  remarks TEXT,
  collectedBy INT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(id),
  FOREIGN KEY (routeId) REFERENCES routes(id),
  FOREIGN KEY (collectedBy) REFERENCES users(id)
);

-- Sample seed data
INSERT INTO routes (routeNumber, routeName, startPoint, endPoint, stops, distanceKm, monthlyFee, termFee, annualFee) VALUES
('R01', 'City Center Route', 'College', 'Central Bus Stand', 'Gate 1,Market,Junction,Bus Stand', 12.5, 800, 2200, 8000),
('R02', 'North Zone Route', 'College', 'North Railway Station', 'Gate 1,North Market,Railway Station', 18.0, 1000, 2800, 10000),
('R03', 'South Zone Route', 'College', 'South Town', 'Gate 1,South Market,Town Center', 15.0, 900, 2500, 9000);
