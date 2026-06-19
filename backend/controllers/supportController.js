const { SupportTicket, User, Student } = require('../models');
const { Op } = require('sequelize');

exports.createTicket = async (req, res) => {
  try {
    const { subject, message, category = 'other' } = req.body;
    if (!subject?.trim() || !message?.trim()) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    let studentId = null;
    if (req.user.role === 'student') {
      const student = await Student.findOne({ where: { userId: req.user.id } });
      if (!student) return res.status(404).json({ message: 'Student profile not found' });
      studentId = student.id;
    }

    const ticket = await SupportTicket.create({
      userId: req.user.id,
      studentId,
      subject: subject.trim(),
      message: message.trim(),
      category,
    });

    res.status(201).json({ message: 'Support ticket submitted', ticket });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllTickets = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;

    const offset = (page - 1) * limit;
    const { count, rows } = await SupportTicket.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['name', 'email', 'role'] },
        { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: ['name'] }] },
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({ tickets: rows, total: count, page: parseInt(page), pages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const { status, adminResponse } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (adminResponse !== undefined) updates.adminResponse = adminResponse;
    if (status === 'resolved' || status === 'closed') updates.resolvedAt = new Date();

    await ticket.update(updates);
    res.json({ message: 'Ticket updated', ticket });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTicketStats = async (req, res) => {
  try {
    const [open, inProgress, resolved] = await Promise.all([
      SupportTicket.count({ where: { status: 'open' } }),
      SupportTicket.count({ where: { status: 'in_progress' } }),
      SupportTicket.count({ where: { status: { [Op.in]: ['resolved', 'closed'] } } }),
    ]);
    res.json({ open, inProgress, resolved, total: open + inProgress + resolved });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
