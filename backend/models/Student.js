const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Student = sequelize.define('Student', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  routeId: { type: DataTypes.INTEGER },
  studentId: { type: DataTypes.STRING(30), allowNull: false, unique: true },
  rollNumber: { type: DataTypes.STRING(30) },
  department: { type: DataTypes.STRING(100) },
  year: { type: DataTypes.INTEGER },
  section: { type: DataTypes.STRING(10) },
  address: { type: DataTypes.TEXT },
  boardingPoint: { type: DataTypes.STRING(100) },
  parentName: { type: DataTypes.STRING(100) },
  parentPhone: { type: DataTypes.STRING(15) },
  admissionDate: { type: DataTypes.DATEONLY },
  feeType: { type: DataTypes.ENUM('monthly', 'term', 'annual'), defaultValue: 'monthly' },
  registrationSource: { type: DataTypes.ENUM('admin', 'self'), defaultValue: 'admin' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'students' });

module.exports = Student;
