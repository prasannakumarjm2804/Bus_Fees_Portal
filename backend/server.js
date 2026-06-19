const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize } = require('./models');
const routes = require('./routes');

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true }).then(async () => {
  console.log('✅ Database synced');
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

  const { User } = require('./models');
  const { seedDatabase } = require('./seed');

  const [, adminCreated] = await User.findOrCreate({
    where: { email: 'admin@college.edu' },
    defaults: { name: 'Admin', email: 'admin@college.edu', password: 'Admin@123', role: 'admin', phone: '9999999999' },
  });
  if (adminCreated) console.log('🌱 Default admin created: admin@college.edu / Admin@123');

  try {
    await seedDatabase();
  } catch (err) {
    console.error('⚠️ Seed warning:', err.message);
  }
}).catch(err => console.error('❌ DB error:', err));
