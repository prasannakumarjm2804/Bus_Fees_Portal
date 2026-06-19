const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING(150), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  type: { type: DataTypes.ENUM('payment_due', 'payment_received', 'overdue', 'schedule', 'general'), defaultValue: 'general' },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  relatedId: { type: DataTypes.INTEGER },
}, { tableName: 'notifications' });

module.exports = Notification;
