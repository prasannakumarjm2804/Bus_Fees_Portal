const sequelize = require('../config/database');
const User = require('./User');
const Student = require('./Student');
const Route = require('./Route');
const Fee = require('./Fee');
const PaymentSchedule = require('./PaymentSchedule');
const Notification = require('./Notification');
const SupportTicket = require('./SupportTicket');
const ConcessionRequest = require('./ConcessionRequest');

// Associations
User.hasOne(Student, { foreignKey: 'userId', as: 'studentProfile' });
Student.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Route.hasMany(Student, { foreignKey: 'routeId', as: 'students' });
Student.belongsTo(Route, { foreignKey: 'routeId', as: 'route' });

Student.hasMany(Fee, { foreignKey: 'studentId', as: 'fees' });
Fee.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

Route.hasMany(Fee, { foreignKey: 'routeId', as: 'fees' });
Fee.belongsTo(Route, { foreignKey: 'routeId', as: 'route' });

User.hasMany(Fee, { foreignKey: 'collectedBy', as: 'collectedFees' });
Fee.belongsTo(User, { foreignKey: 'collectedBy', as: 'collector' });

Route.hasMany(PaymentSchedule, { foreignKey: 'routeId', as: 'schedules' });
PaymentSchedule.belongsTo(Route, { foreignKey: 'routeId', as: 'route' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(SupportTicket, { foreignKey: 'userId', as: 'supportTickets' });
SupportTicket.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Student.hasMany(SupportTicket, { foreignKey: 'studentId', as: 'supportTickets' });
SupportTicket.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

Student.hasMany(ConcessionRequest, { foreignKey: 'studentId', as: 'concessionRequests' });
ConcessionRequest.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
User.hasMany(ConcessionRequest, { foreignKey: 'reviewedBy', as: 'reviewedConcessions' });
ConcessionRequest.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

module.exports = { sequelize, User, Student, Route, Fee, PaymentSchedule, Notification, SupportTicket, ConcessionRequest };
