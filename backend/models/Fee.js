const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Fee = sequelize.define('Fee', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  studentId: { type: DataTypes.INTEGER, allowNull: false },
  routeId: { type: DataTypes.INTEGER, allowNull: false },
  feeMonth: { type: DataTypes.STRING(7) }, // e.g., "2024-01"
  feePeriod: { type: DataTypes.STRING(20) }, // e.g., "Term 1 2024"
  feeType: { type: DataTypes.ENUM('monthly', 'term', 'annual'), defaultValue: 'monthly' },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  lateFee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  discount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'paid', 'overdue', 'waived'), defaultValue: 'pending' },
  dueDate: { type: DataTypes.DATEONLY, allowNull: false },
  paidDate: { type: DataTypes.DATEONLY },
  paymentMode: { type: DataTypes.ENUM('cash', 'online', 'cheque', 'dd'), },
  receiptNumber: { type: DataTypes.STRING(50), unique: true },
  transactionId: { type: DataTypes.STRING(100) },
  remarks: { type: DataTypes.TEXT },
  collectedBy: { type: DataTypes.INTEGER },
}, { tableName: 'fees' });

module.exports = Fee;
