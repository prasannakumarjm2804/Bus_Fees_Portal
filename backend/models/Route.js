const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Route = sequelize.define('Route', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  routeNumber: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  routeName: { type: DataTypes.STRING(100), allowNull: false },
  startPoint: { type: DataTypes.STRING(100), allowNull: false },
  endPoint: { type: DataTypes.STRING(100), allowNull: false },
  stops: { type: DataTypes.TEXT },
  distanceKm: { type: DataTypes.DECIMAL(8, 2) },
  monthlyFee: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  termFee: { type: DataTypes.DECIMAL(10, 2) },
  annualFee: { type: DataTypes.DECIMAL(10, 2) },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'routes' });

module.exports = Route;
