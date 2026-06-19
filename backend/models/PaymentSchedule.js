const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PaymentSchedule = sequelize.define('PaymentSchedule', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.TEXT },
  scheduleType: { type: DataTypes.ENUM('monthly', 'term', 'annual', 'custom'), defaultValue: 'monthly' },
  startDate: { type: DataTypes.DATEONLY, allowNull: false },
  endDate: { type: DataTypes.DATEONLY },
  dueDay: { type: DataTypes.INTEGER }, // day of month (1-28)
  lateFeePerDay: { type: DataTypes.DECIMAL(8,2), defaultValue: 0 },
  lateFeeFixed: { type: DataTypes.DECIMAL(8,2), defaultValue: 0 },
  gracePeriodDays: { type: DataTypes.INTEGER, defaultValue: 5 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  routeId: { type: DataTypes.INTEGER },
  reminderDaysBefore: { type: DataTypes.INTEGER, defaultValue: 3 },
}, { tableName: 'payment_schedules' });

module.exports = PaymentSchedule;
