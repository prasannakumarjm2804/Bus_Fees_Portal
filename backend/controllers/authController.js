const jwt = require('jsonwebtoken');
const { User, Student, Route } = require('../models');

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'Bus1010';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const generateStudentId = async () => {
  const year = new Date().getFullYear();
  let id;
  let exists = true;
  while (exists) {
    const num = Math.floor(Math.random() * 9000) + 1000;
    id = `STU${year}${num}`;
    exists = await Student.findOne({ where: { studentId: id } });
  }
  return id;
};

exports.register = async (req, res) => {
  try {
    const {
      name, email, password, phone, role,
      adminSecret,
      studentId, rollNumber, department, year, section,
      address, boardingPoint, routeId, parentName, parentPhone, feeType,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const userRole = role === 'admin' ? 'admin' : 'student';

    if (userRole === 'admin') {
      if (adminSecret !== ADMIN_SECRET) {
        return res.status(403).json({ message: 'Invalid administrator access code' });
      }
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, phone, role: userRole });

    let profile = null;
    if (userRole === 'student') {
      const sid = studentId || await generateStudentId();
      if (studentId) {
        const dup = await Student.findOne({ where: { studentId } });
        if (dup) {
          await user.destroy();
          return res.status(400).json({ message: 'Student ID already in use' });
        }
      }

      profile = await Student.create({
        userId: user.id,
        studentId: sid,
        rollNumber: rollNumber || null,
        department: department || null,
        year: year ? parseInt(year) : null,
        section: section || null,
        address: address || null,
        boardingPoint: boardingPoint || null,
        routeId: routeId || null,
        parentName: parentName || null,
        parentPhone: parentPhone || null,
        admissionDate: new Date().toISOString().slice(0, 10),
        feeType: feeType || 'monthly',
        registrationSource: 'self',
      });

      if (profile.routeId) {
        profile = await Student.findByPk(profile.id, {
          include: [{ model: Route, as: 'route' }],
        });
      }
    }

    res.status(201).json({
      message: 'Account created successfully',
      token: generateToken(user.id),
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
      profile,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, adminSecret, role } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.isActive) return res.status(401).json({ message: 'Account deactivated' });

    if (user.role === 'admin' || role === 'admin') {
      if (adminSecret !== ADMIN_SECRET) {
        return res.status(403).json({ message: 'Administrator access code is required' });
      }
    }

    if (role === 'student' && user.role !== 'student') {
      return res.status(403).json({ message: 'This account is not registered as a student' });
    }
    if (role === 'admin' && user.role !== 'admin') {
      return res.status(403).json({ message: 'This account is not registered as an administrator' });
    }

    let profile = null;
    if (user.role === 'student') {
      profile = await Student.findOne({
        where: { userId: user.id },
        include: [{ model: Route, as: 'route' }],
      });
    }

    res.json({
      token: generateToken(user.id),
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
      profile,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    let profile = null;
    if (req.user.role === 'student') {
      profile = await Student.findOne({
        where: { userId: req.user.id },
        include: [{ model: Route, as: 'route' }],
      });
    }
    res.json({ user: req.user, profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findByPk(req.user.id);
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByPk(req.user.id);
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    
    await user.save();
    
    // If student, the name is stored in user, but maybe we need to sync?
    // In this model User and Student are linked. Student doesn't have name, it's in User.
    
    res.json({ 
      message: 'Profile updated successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
