const { PaymentSchedule, Route, Fee, Student, User, Notification } = require('../models');
const { Op } = require('sequelize');

exports.getAllSchedules = async (req, res) => {
  try {
    const where = { isActive: true };
    if (req.user.role === 'student') {
      const student = await Student.findOne({ where: { userId: req.user.id } });
      if (student?.routeId) {
        where[Op.or] = [{ routeId: null }, { routeId: student.routeId }];
      } else {
        where.routeId = null;
      }
    }

    const schedules = await PaymentSchedule.findAll({
      where,
      include: [{ model: Route, as: 'route', attributes: ['routeNumber', 'routeName'], required: false }],
      order: [['startDate', 'DESC']],
    });
    res.json(schedules);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createSchedule = async (req, res) => {
  try {
    const schedule = await PaymentSchedule.create(req.body);

    const { generateFeesFromSchedule } = require('../services/feeGenerationService');
    const feeResult = await generateFeesFromSchedule(schedule, req.user.id);

    res.status(201).json({
      message: 'Schedule created',
      schedule,
      feesGenerated: feeResult.created,
      feeSkipped: feeResult.skipped?.length || 0,
      feeErrors: feeResult.errors || [],
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.generateScheduleFees = async (req, res) => {
  try {
    const schedule = await PaymentSchedule.findByPk(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });

    const { generateFeesFromSchedule } = require('../services/feeGenerationService');
    const result = await generateFeesFromSchedule(schedule, req.user.id);

    res.json({
      message: `Generated ${result.created} fee record(s)`,
      created: result.created,
      skipped: result.skipped,
      errors: result.errors,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateSchedule = async (req, res) => {
  try {
    const s = await PaymentSchedule.findByPk(req.params.id);
    if (!s) return res.status(404).json({ message: 'Not found' });
    await s.update(req.body);
    res.json({ message: 'Updated', schedule: s });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const s = await PaymentSchedule.findByPk(req.params.id);
    if (!s) return res.status(404).json({ message: 'Not found' });
    await s.update({ isActive: false });
    res.json({ message: 'Deactivated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getUpcomingDues = async (req, res) => {
  try {
    const today = new Date();
    const next30 = new Date(); next30.setDate(today.getDate() + 30);
    const fees = await Fee.findAll({
      where: {
        status: 'pending',
        dueDate: { [Op.between]: [today.toISOString().slice(0,10), next30.toISOString().slice(0,10)] }
      },
      include: [
        { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: ['name','email','phone'] }] },
        { model: Route, as: 'route', attributes: ['routeNumber','routeName'] }
      ],
      order: [['dueDate', 'ASC']],
      limit: 50,
    });
    res.json(fees);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getOverdueFees = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0,10);
    const fees = await Fee.findAll({
      where: { status: 'pending', dueDate: { [Op.lt]: today } },
      include: [
        { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: ['name','email','phone'] }] },
        { model: Route, as: 'route', attributes: ['routeNumber','routeName'] }
      ],
      order: [['dueDate', 'ASC']],
    });
    // Auto-mark as overdue
    const ids = fees.map(f => f.id);
    if (ids.length) await Fee.update({ status: 'overdue' }, { where: { id: { [Op.in]: ids } } });
    res.json(fees);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.sendReminders = async (req, res) => {
  try {
    const { feeIds } = req.body;
    const fees = await Fee.findAll({
      where: { id: { [Op.in]: feeIds } },
      include: [{ model: Student, as: 'student', include: [{ model: User, as: 'user' }] }]
    });
    const notifications = fees.map(f => ({
      userId: f.student.userId,
      title: '🚌 Bus Fee Reminder',
      message: `Your bus fee of ₹${f.totalAmount} for ${f.feeMonth} is due on ${f.dueDate}. Please pay on time to avoid late fees.`,
      type: 'payment_due',
      relatedId: f.id,
    }));
    await Notification.bulkCreate(notifications);
    res.json({ message: `Reminders sent to ${notifications.length} students` });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifs = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 20,
    });
    res.json(notifs);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.markNotificationRead = async (req, res) => {
  try {
    await Notification.update({ isRead: true }, { where: { userId: req.user.id, id: req.params.id } });
    res.json({ message: 'Marked as read' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.update({ isRead: true }, { where: { userId: req.user.id } });
    res.json({ message: 'All marked as read' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
