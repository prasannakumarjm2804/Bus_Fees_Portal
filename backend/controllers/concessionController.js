const { ConcessionRequest, Student, User, Notification } = require('../models');

exports.createRequest = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const { concessionType, requestedPercent, reason } = req.body;
    if (!reason?.trim()) return res.status(400).json({ message: 'Reason is required' });
    const percent = parseInt(requestedPercent) || 25;
    if (percent < 5 || percent > 75) {
      return res.status(400).json({ message: 'Requested concession must be between 5% and 75%' });
    }

    const pending = await ConcessionRequest.findOne({
      where: { studentId: student.id, status: 'pending' },
    });
    if (pending) {
      return res.status(400).json({ message: 'You already have a pending concession request' });
    }

    const request = await ConcessionRequest.create({
      studentId: student.id,
      concessionType: concessionType || 'financial',
      requestedPercent: percent,
      reason: reason.trim(),
    });

    res.status(201).json({ message: 'Concession request submitted', request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const requests = await ConcessionRequest.findAll({
      where: { studentId: student.id },
      order: [['createdAt', 'DESC']],
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;

    const offset = (page - 1) * limit;
    const { count, rows } = await ConcessionRequest.findAndCountAll({
      where,
      include: [{
        model: Student,
        as: 'student',
        include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
      }],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({ requests: rows, total: count, page: parseInt(page), pages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.reviewRequest = async (req, res) => {
  try {
    const request = await ConcessionRequest.findByPk(req.params.id, {
      include: [{ model: Student, as: 'student' }],
    });
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already reviewed' });
    }

    const { status, adminNotes } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    await request.update({
      status,
      adminNotes: adminNotes || null,
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
    });

    if (request.student) {
      await Notification.create({
        userId: request.student.userId,
        title: status === 'approved' ? 'Concession Approved' : 'Concession Request Declined',
        message: status === 'approved'
          ? `Your ${request.requestedPercent}% fee concession request has been approved.`
          : `Your concession request was not approved.${adminNotes ? ` Note: ${adminNotes}` : ''}`,
        type: 'general',
        relatedId: request.id,
      });
    }

    res.json({ message: `Request ${status}`, request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
