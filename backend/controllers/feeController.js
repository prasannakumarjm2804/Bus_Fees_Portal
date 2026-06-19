const { Fee, Student, Route, User, Notification } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { generateFeesForStudents } = require('../services/feeGenerationService');

const generateReceiptNumber = () => {
  const date = new Date();
  const prefix = `RCP${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
  const random = Math.floor(Math.random() * 90000) + 10000;
  return `${prefix}${random}`;
};

exports.generateMonthlyFees = async (req, res) => {
  try {
    const { feeMonth, dueDate, feeType = 'by_student', academicYear } = req.body;

    if (!dueDate) return res.status(400).json({ message: 'Due date is required' });
    if (!feeMonth && feeType === 'monthly') {
      return res.status(400).json({ message: 'Fee month is required for monthly fees' });
    }

    const students = await Student.findAll({
      where: { isActive: true },
      include: [
        { model: Route, as: 'route' },
        { model: User, as: 'user', attributes: ['name'] },
      ],
    });

    const result = await generateFeesForStudents({
      students,
      feeType,
      feeMonth,
      dueDate,
      academicYear: academicYear ? parseInt(academicYear) : undefined,
      collectedBy: req.user.id,
    });

    res.json({
      message: `Generated ${result.created} fee record(s)`,
      created: result.created,
      skipped: result.skipped.length,
      errors: result.errors,
      notified: result.created,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllFees = async (req, res) => {
  try {
    const { studentId, routeId, status, feeMonth, page = 1, limit = 20 } = req.query;
    const where = {};
    if (studentId) where.studentId = studentId;
    if (routeId) where.routeId = routeId;
    if (status) where.status = status;
    if (feeMonth) where.feeMonth = feeMonth;

    const offset = (page - 1) * limit;
    const { count, rows } = await Fee.findAndCountAll({
      where,
      include: [
        { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: ['name', 'email'] }] },
        { model: Route, as: 'route', attributes: ['routeNumber', 'routeName'] },
      ],
      limit: parseInt(limit),
      offset,
      order: [['dueDate', 'DESC']],
    });
    res.json({ fees: rows, total: count, page: parseInt(page), pages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.collectPayment = async (req, res) => {
  try {
    const fee = await Fee.findByPk(req.params.id);
    if (!fee) return res.status(404).json({ message: 'Fee record not found' });
    if (fee.status === 'paid') return res.status(400).json({ message: 'Fee already paid' });

    const { paymentMode, transactionId, lateFee = 0, discount = 0, remarks } = req.body;
    const totalAmount = parseFloat(fee.amount) + parseFloat(lateFee) - parseFloat(discount);

    await fee.update({
      paymentMode, transactionId, lateFee, discount,
      totalAmount,
      status: 'paid',
      paidDate: new Date(),
      receiptNumber: generateReceiptNumber(),
      collectedBy: req.user.id,
      remarks,
    });
    res.json({ message: 'Payment collected successfully', fee });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyFees = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const fees = await Fee.findAll({
      where: { studentId: student.id },
      include: [{ model: Route, as: 'route', attributes: ['routeNumber', 'routeName'] }],
      order: [['dueDate', 'DESC'], ['createdAt', 'DESC']],
    });
    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);

    const [totalStudents, totalRoutes, monthlyFees, allFees] = await Promise.all([
      Student.count({ where: { isActive: true } }),
      Route.count({ where: { isActive: true } }),
      Fee.findAll({ where: { feeMonth: currentMonth } }),
      Fee.findAll({ where: { feeMonth: currentMonth } }),
    ]);

    const collected = allFees.filter(f => f.status === 'paid').reduce((s, f) => s + parseFloat(f.totalAmount), 0);
    const pending = allFees.filter(f => f.status === 'pending').reduce((s, f) => s + parseFloat(f.totalAmount), 0);
    const overdue = allFees.filter(f => f.status === 'overdue').reduce((s, f) => s + parseFloat(f.totalAmount), 0);

    const routeStats = await Fee.findAll({
      where: { feeMonth: currentMonth, status: 'paid' },
      attributes: ['routeId', [sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalCollected'], [sequelize.fn('COUNT', sequelize.col('Fee.id')), 'count']],
      include: [{ model: Route, as: 'route', attributes: ['routeNumber', 'routeName'] }],
      group: ['routeId', 'route.id'],
    });

    res.json({
      totalStudents, totalRoutes, currentMonth,
      summary: { collected, pending, overdue, total: collected + pending + overdue },
      paidCount: allFees.filter(f => f.status === 'paid').length,
      pendingCount: allFees.filter(f => f.status === 'pending').length,
      routeStats,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateFeeStatus = async (req, res) => {
  try {
    const fee = await Fee.findByPk(req.params.id);
    if (!fee) return res.status(404).json({ message: 'Fee not found' });
    await fee.update({ status: req.body.status });
    res.json({ message: 'Status updated', fee });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { period } = req.query;
    const currentMonth = period || new Date().toISOString().slice(0, 7);

    const fees = await Fee.findAll({
      where: period ? { feeMonth: currentMonth } : {},
      include: [
        { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: ['name'] }] },
        { model: Route, as: 'route', attributes: ['routeNumber', 'routeName'] },
      ],
      order: [['dueDate', 'DESC']],
    });

    const byStatus = { paid: 0, pending: 0, overdue: 0, waived: 0 };
    const byType = { monthly: 0, term: 0, annual: 0 };
    const byPaymentMode = { cash: 0, online: 0, cheque: 0, dd: 0 };
    let totalCollected = 0;
    let totalOutstanding = 0;

    fees.forEach(f => {
      const amt = parseFloat(f.totalAmount);
      if (byStatus[f.status] !== undefined) byStatus[f.status] += amt;
      if (f.status === 'paid') {
        totalCollected += amt;
        if (byPaymentMode[f.paymentMode] !== undefined) byPaymentMode[f.paymentMode] += amt;
      }
      if (f.status === 'pending' || f.status === 'overdue') totalOutstanding += amt;
      if (byType[f.feeType] !== undefined) byType[f.feeType] += amt;
    });

    const monthlyTrend = await Fee.findAll({
      attributes: [
        'feeMonth',
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'paid' THEN totalAmount ELSE 0 END")), 'collected'],
        [sequelize.fn('COUNT', sequelize.col('Fee.id')), 'count'],
      ],
      where: { feeMonth: { [Op.not]: null } },
      group: ['feeMonth'],
      order: [['feeMonth', 'DESC']],
      limit: 6,
      raw: true,
    });

    const routeCollection = await Fee.findAll({
      attributes: [
        'routeId',
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'paid' THEN totalAmount ELSE 0 END")), 'collected'],
        [sequelize.fn('COUNT', sequelize.col('Fee.id')), 'totalFees'],
      ],
      include: [{ model: Route, as: 'route', attributes: ['routeNumber', 'routeName'] }],
      group: ['routeId', 'route.id'],
      order: [[sequelize.literal('collected'), 'DESC']],
    });

    res.json({
      period: currentMonth,
      summary: {
        totalRecords: fees.length,
        totalCollected,
        totalOutstanding,
        byStatus,
        byType,
        byPaymentMode,
      },
      monthlyTrend: monthlyTrend.reverse(),
      routeCollection,
      recentPayments: fees.filter(f => f.status === 'paid').slice(0, 15),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.payOnline = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const fee = await Fee.findByPk(req.params.id, {
      include: [{ model: Route, as: 'route', attributes: ['routeNumber', 'routeName'] }],
    });
    if (!fee || fee.studentId !== student.id) {
      return res.status(404).json({ message: 'Fee record not found' });
    }
    if (fee.status === 'paid') return res.status(400).json({ message: 'Fee already paid' });
    if (fee.status === 'waived') return res.status(400).json({ message: 'This fee has been waived' });

    const { paymentMethod } = req.body;
    const validMethods = ['upi', 'card', 'netbanking'];
    if (!validMethods.includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 9000 + 1000)}`;
    const receiptNumber = generateReceiptNumber();

    await fee.update({
      paymentMode: 'online',
      transactionId,
      status: 'paid',
      paidDate: new Date().toISOString().slice(0, 10),
      receiptNumber,
      collectedBy: req.user.id,
      remarks: `Online payment via ${paymentMethod}`,
    });

    await Notification.create({
      userId: req.user.id,
      title: 'Payment Successful',
      message: `Your bus fee of ₹${fee.totalAmount} for ${fee.feeMonth} has been paid. Receipt: ${receiptNumber}`,
      type: 'payment_received',
      relatedId: fee.id,
    });

    res.json({
      message: 'Payment completed successfully',
      fee: await Fee.findByPk(fee.id, {
        include: [{ model: Route, as: 'route', attributes: ['routeNumber', 'routeName'] }],
      }),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
