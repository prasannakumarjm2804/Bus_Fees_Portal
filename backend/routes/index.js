const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const studentCtrl = require('../controllers/studentController');
const routeCtrl = require('../controllers/routeController');
const feeCtrl = require('../controllers/feeController');
const schedCtrl = require('../controllers/scheduleController');
const supportCtrl = require('../controllers/supportController');
const concessionCtrl = require('../controllers/concessionController');
const { protect, adminOnly, studentOnly } = require('../middleware/auth');

// Public
router.get('/routes/public', routeCtrl.getPublicRoutes);

// Auth
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.get('/auth/me', protect, authCtrl.getMe);
router.put('/auth/profile', protect, authCtrl.updateProfile);
router.put('/auth/change-password', protect, authCtrl.changePassword);

// Routes (bus routes)
router.get('/routes', protect, routeCtrl.getAllRoutes);
router.get('/routes/:id', protect, routeCtrl.getRouteById);
router.post('/routes', protect, adminOnly, routeCtrl.createRoute);
router.put('/routes/:id', protect, adminOnly, routeCtrl.updateRoute);
router.delete('/routes/:id', protect, adminOnly, routeCtrl.deleteRoute);

// Students
router.get('/students', protect, adminOnly, studentCtrl.getAllStudents);
router.get('/students/profile', protect, studentCtrl.getMyProfile);
router.put('/students/profile', protect, studentCtrl.updateMyProfile);
router.get('/students/bus-pass', protect, studentOnly, studentCtrl.getBusPass);
router.get('/students/:id', protect, adminOnly, studentCtrl.getStudentById);
router.post('/students', protect, adminOnly, studentCtrl.createStudent);
router.put('/students/:id', protect, adminOnly, studentCtrl.updateStudent);
router.delete('/students/:id', protect, adminOnly, studentCtrl.deleteStudent);

// Fees
router.get('/fees', protect, adminOnly, feeCtrl.getAllFees);
router.get('/fees/my', protect, feeCtrl.getMyFees);
router.get('/fees/dashboard', protect, adminOnly, feeCtrl.getDashboardStats);
router.get('/fees/reports', protect, adminOnly, feeCtrl.getReports);
router.post('/fees/generate', protect, adminOnly, feeCtrl.generateMonthlyFees);
router.put('/fees/:id/collect', protect, adminOnly, feeCtrl.collectPayment);
router.put('/fees/:id/pay', protect, studentOnly, feeCtrl.payOnline);
router.put('/fees/:id/status', protect, adminOnly, feeCtrl.updateFeeStatus);

// Payment Schedules
router.get('/schedules', protect, schedCtrl.getAllSchedules);
router.post('/schedules', protect, adminOnly, schedCtrl.createSchedule);
router.post('/schedules/:id/generate-fees', protect, adminOnly, schedCtrl.generateScheduleFees);
router.put('/schedules/:id', protect, adminOnly, schedCtrl.updateSchedule);
router.delete('/schedules/:id', protect, adminOnly, schedCtrl.deleteSchedule);
router.get('/schedules/upcoming', protect, adminOnly, schedCtrl.getUpcomingDues);
router.get('/schedules/overdue', protect, adminOnly, schedCtrl.getOverdueFees);
router.post('/schedules/reminders', protect, adminOnly, schedCtrl.sendReminders);

// Notifications
router.get('/notifications', protect, schedCtrl.getNotifications);
router.put('/notifications/:id/read', protect, schedCtrl.markNotificationRead);
router.put('/notifications/read-all', protect, schedCtrl.markAllRead);

// Support
router.post('/support', protect, supportCtrl.createTicket);
router.get('/support/my', protect, supportCtrl.getMyTickets);
router.get('/support', protect, adminOnly, supportCtrl.getAllTickets);
router.get('/support/stats', protect, adminOnly, supportCtrl.getTicketStats);
router.put('/support/:id', protect, adminOnly, supportCtrl.updateTicket);

// Concessions
router.post('/concessions', protect, studentOnly, concessionCtrl.createRequest);
router.get('/concessions/my', protect, studentOnly, concessionCtrl.getMyRequests);
router.get('/concessions', protect, adminOnly, concessionCtrl.getAllRequests);
router.put('/concessions/:id/review', protect, adminOnly, concessionCtrl.reviewRequest);

module.exports = router;
