const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SupportTicket = sequelize.define('SupportTicket', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  studentId: { type: DataTypes.INTEGER },
  subject: { type: DataTypes.STRING(200), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  category: { type: DataTypes.ENUM('fee', 'route', 'payment', 'pass', 'other'), defaultValue: 'other' },
  status: { type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'), defaultValue: 'open' },
  adminResponse: { type: DataTypes.TEXT },
  resolvedAt: { type: DataTypes.DATE },
}, { tableName: 'support_tickets' });

module.exports = SupportTicket;
