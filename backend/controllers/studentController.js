const { Student, User, Route, Fee } = require('../models');
const { Op } = require('sequelize');

const getFeeValidityEnd = (fee) => {
  if (fee.feeType === 'annual') {
    const year = fee.feePeriod?.match(/\d{4}/)?.[0] || new Date(fee.paidDate).getFullYear();
    return `${year}-05-31`;
  }
  if (fee.feeType === 'term') {
    const paid = new Date(fee.paidDate);
    paid.setMonth(paid.getMonth() + 4);
    return paid.toISOString().slice(0, 10);
  }
  if (fee.feeMonth) {
    const [y, m] = fee.feeMonth.split('-').map(Number);
    const lastDay = new Date(y, m, 0).getDate();
    return `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  }
  const paid = new Date(fee.paidDate);
  paid.setMonth(paid.getMonth() + 1);
  return paid.toISOString().slice(0, 10);
};

exports.getAllStudents = async (req, res) => {
  try {
    const { search, routeId, year, department, registrationSource, page = 1, limit = 20 } = req.query;
    const where = { isActive: true };
    if (routeId) where.routeId = routeId;
    if (year) where.year = year;
    if (department) where.department = { [Op.like]: `%${department}%` };
    if (registrationSource) where.registrationSource = registrationSource;

    const userWhere = {};
    if (search) {
      userWhere[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;
    const { count, rows } = await Student.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['name', 'email', 'phone'], where: Object.keys(userWhere).length ? userWhere : undefined },
        { model: Route, as: 'route', attributes: ['routeNumber', 'routeName', 'monthlyFee'] },
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({ students: rows, total: count, page: parseInt(page), pages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: Route, as: 'route' },
      ],
    });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const { name, email, password, phone, studentId, rollNumber, department, year, section, address, boardingPoint, routeId, parentName, parentPhone, admissionDate, feeType } = req.body;

    const user = await User.create({ name, email, password: password || 'Student@123', phone, role: 'student' });
    const student = await Student.create({ userId: user.id, studentId, rollNumber, department, year, section, address, boardingPoint, routeId, parentName, parentPhone, admissionDate, feeType, registrationSource: 'admin' });

    res.status(201).json({ message: 'Student created successfully', student });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const { name, phone } = req.body;
    if (name || phone) {
      await User.update({ name, phone }, { where: { id: student.userId } });
    }
    await student.update(req.body);
    res.json({ message: 'Student updated', student });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    await student.update({ isActive: false });
    await User.update({ isActive: false }, { where: { id: student.userId } });
    res.json({ message: 'Student deactivated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const student = await Student.findOne({
      where: { userId: req.user.id },
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: Route, as: 'route' },
      ],
    });
    if (!student) return res.status(404).json({ message: 'Profile not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ message: 'Profile not found' });

    const { phone, address, boardingPoint, parentPhone } = req.body;
    if (phone) await User.update({ phone }, { where: { id: req.user.id } });
    await student.update({
      ...(address !== undefined && { address }),
      ...(boardingPoint !== undefined && { boardingPoint }),
      ...(parentPhone !== undefined && { parentPhone }),
    });

    const updated = await Student.findOne({
      where: { userId: req.user.id },
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: Route, as: 'route' },
      ],
    });
    res.json({ message: 'Profile updated', profile: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBusPass = async (req, res) => {
  try {
    const student = await Student.findOne({
      where: { userId: req.user.id },
      include: [
        { model: User, as: 'user', attributes: ['name', 'email', 'phone'] },
        { model: Route, as: 'route' },
      ],
    });
    if (!student) return res.status(404).json({ message: 'Profile not found' });
    if (!student.routeId || !student.route) {
      return res.json({ active: false, reason: 'No bus route assigned to your profile' });
    }

    const overdueCount = await Fee.count({
      where: { studentId: student.id, status: 'overdue' },
    });
    if (overdueCount > 0) {
      return res.json({
        active: false,
        reason: 'Pass suspended due to overdue fees',
        overdueCount,
        student: { studentId: student.studentId, name: student.user?.name },
        route: student.route,
      });
    }

    const coveringFee = await Fee.findOne({
      where: { studentId: student.id, status: 'paid' },
      order: [['paidDate', 'DESC']],
    });
    if (!coveringFee) {
      return res.json({
        active: false,
        reason: 'No paid fees found. Pay your bus fee to activate your pass.',
        student: { studentId: student.studentId, name: student.user?.name },
        route: student.route,
      });
    }

    const validUntil = getFeeValidityEnd(coveringFee);
    const today = new Date().toISOString().slice(0, 10);
    const isExpired = today > validUntil;

    const passId = `KEC-BP-${student.studentId}-${String(coveringFee.id).padStart(5, '0')}`;

    res.json({
      active: !isExpired,
      passId,
      validFrom: coveringFee.paidDate,
      validUntil,
      reason: isExpired ? 'Pass expired. Renew by paying the current fee.' : null,
      student: {
        studentId: student.studentId,
        name: student.user?.name,
        department: student.department,
        year: student.year,
        section: student.section,
        boardingPoint: student.boardingPoint,
        feeType: student.feeType,
      },
      route: {
        routeNumber: student.route.routeNumber,
        routeName: student.route.routeName,
        startPoint: student.route.startPoint,
        endPoint: student.route.endPoint,
      },
      coveringFee: {
        feePeriod: coveringFee.feePeriod || coveringFee.feeMonth,
        feeType: coveringFee.feeType,
        receiptNumber: coveringFee.receiptNumber,
        paidDate: coveringFee.paidDate,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
