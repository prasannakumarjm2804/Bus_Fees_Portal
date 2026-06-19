const { Fee, Student, Route, User, Notification } = require('../models');
const { Op } = require('sequelize');
const { resolveStudentFee, calculateDueDate } = require('../utils/feeHelpers');

async function generateFeesForStudents({
  students,
  feeType = 'by_student',
  feeMonth,
  dueDate,
  academicYear,
  collectedBy,
}) {
  const newFees = [];
  const skipped = [];
  const errors = [];

  for (const student of students) {
    if (!student.routeId || !student.route) {
      skipped.push({ studentId: student.studentId, name: student.user?.name, reason: 'No route assigned' });
      continue;
    }

    const studentFeeType = student.feeType || 'monthly';
    const targetType = feeType === 'by_student' ? studentFeeType : feeType;

    if (feeType !== 'by_student' && studentFeeType !== feeType) {
      skipped.push({ studentId: student.studentId, reason: `Student profile is ${studentFeeType}, not ${feeType}` });
      continue;
    }

    const resolved = resolveStudentFee(student, student.route, { feeType: targetType, feeMonth, academicYear });

    if (resolved.error) {
      errors.push({ studentId: student.studentId, reason: resolved.error });
      continue;
    }

    const existing = await Fee.findOne({
      where: {
        studentId: student.id,
        feeType: resolved.feeType,
        feePeriod: resolved.feePeriod,
        status: { [Op.ne]: 'waived' },
      },
    });

    if (existing) {
      skipped.push({ studentId: student.studentId, reason: `Already scheduled: ${resolved.feePeriod}` });
      continue;
    }

    newFees.push({
      studentId: student.id,
      routeId: student.routeId,
      feeMonth: resolved.feeMonth,
      feePeriod: resolved.feePeriod,
      feeType: resolved.feeType,
      amount: resolved.amount,
      lateFee: 0,
      discount: 0,
      totalAmount: resolved.totalAmount,
      status: 'pending',
      dueDate,
      collectedBy,
    });
  }

  if (newFees.length > 0) {
    await Fee.bulkCreate(newFees);

    const studentMap = Object.fromEntries(students.map(s => [s.id, s]));
    const notifications = newFees.map(f => ({
      userId: studentMap[f.studentId]?.userId,
      title: 'New Bus Fee Scheduled',
      message: `A ${f.feeType} bus fee of ₹${f.totalAmount} for ${f.feePeriod} is due on ${dueDate}. Log in to pay online.`,
      type: 'payment_due',
    })).filter(n => n.userId);

    if (notifications.length) await Notification.bulkCreate(notifications);
  }

  return { created: newFees.length, skipped, errors, fees: newFees };
}

async function generateFeesFromSchedule(schedule, adminUserId) {
  if (!schedule.isActive || schedule.scheduleType === 'custom') {
    return { created: 0, skipped: [], errors: [] };
  }

  const where = { isActive: true, routeId: { [Op.not]: null }, feeType: schedule.scheduleType };
  if (schedule.routeId) where.routeId = schedule.routeId;

  const students = await Student.findAll({
    where,
    include: [
      { model: Route, as: 'route' },
      { model: User, as: 'user', attributes: ['name'] },
    ],
  });

  const dueDate = calculateDueDate(schedule);
  const academicYear = schedule.startDate
    ? new Date(schedule.startDate).getFullYear()
    : new Date().getFullYear();

  return generateFeesForStudents({
    students,
    feeType: schedule.scheduleType,
    feeMonth: schedule.title,
    dueDate,
    academicYear,
    collectedBy: adminUserId,
  });
}

module.exports = { generateFeesForStudents, generateFeesFromSchedule };
