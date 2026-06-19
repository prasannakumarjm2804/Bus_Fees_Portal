const { Route, Student, User } = require('../models');

exports.getPublicRoutes = async (req, res) => {
  try {
    const routes = await Route.findAll({
      where: { isActive: true },
      attributes: ['id', 'routeNumber', 'routeName', 'startPoint', 'endPoint', 'monthlyFee'],
      order: [['routeNumber', 'ASC']],
    });
    res.json(routes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.findAll({
      where: { isActive: true },
      include: [{ model: Student, as: 'students', where: { isActive: true }, required: false, attributes: ['id'] }],
      order: [['routeNumber', 'ASC']],
    });
    const result = routes.map(r => ({
      ...r.toJSON(),
      studentCount: r.students.length,
      students: undefined,
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRouteById = async (req, res) => {
  try {
    const route = await Route.findByPk(req.params.id, {
      include: [{
        model: Student, as: 'students', where: { isActive: true }, required: false,
        include: [{ model: User, as: 'user', attributes: ['name', 'email', 'phone'] }],
      }],
    });
    if (!route) return res.status(404).json({ message: 'Route not found' });
    res.json(route);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createRoute = async (req, res) => {
  try {
    const route = await Route.create(req.body);
    res.status(201).json({ message: 'Route created', route });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateRoute = async (req, res) => {
  try {
    const route = await Route.findByPk(req.params.id);
    if (!route) return res.status(404).json({ message: 'Route not found' });
    await route.update(req.body);
    res.json({ message: 'Route updated', route });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteRoute = async (req, res) => {
  try {
    const route = await Route.findByPk(req.params.id);
    if (!route) return res.status(404).json({ message: 'Route not found' });
    await route.update({ isActive: false });
    res.json({ message: 'Route deactivated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
