const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ConcessionRequest = sequelize.define('ConcessionRequest', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  studentId: { type: DataTypes.INTEGER, allowNull: false },
  concessionType: { type: DataTypes.ENUM('scholarship', 'financial', 'sibling', 'staff_child', 'other'), defaultValue: 'financial' },
  requestedPercent: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 25 },
  reason: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
  adminNotes: { type: DataTypes.TEXT },
  reviewedBy: { type: DataTypes.INTEGER },
  reviewedAt: { type: DataTypes.DATE },
}, { tableName: 'concession_requests' });

module.exports = ConcessionRequest;
