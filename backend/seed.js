const { User, Route, Student, Fee, PaymentSchedule, Notification } = require('./models');

const ROUTE_SEEDS = [
  { routeNumber: 'R01', routeName: 'City Center Route', startPoint: 'College', endPoint: 'Central Bus Stand', stops: 'Gate 1, Market, Junction, Bus Stand', distanceKm: 12.5, monthlyFee: 800, termFee: 2200, annualFee: 8000 },
  { routeNumber: 'R02', routeName: 'North Zone Route', startPoint: 'College', endPoint: 'North Railway Station', stops: 'Gate 1, North Market, Railway Station', distanceKm: 18.0, monthlyFee: 1000, termFee: 2800, annualFee: 10000 },
  { routeNumber: 'R03', routeName: 'South Zone Route', startPoint: 'College', endPoint: 'South Town', stops: 'Gate 1, South Market, Town Center', distanceKm: 15.0, monthlyFee: 900, termFee: 2500, annualFee: 9000 },
];

async function seedDatabase() {
  for (const r of ROUTE_SEEDS) {
    await Route.findOrCreate({ where: { routeNumber: r.routeNumber }, defaults: r });
  }

  const route1 = await Route.findOne({ where: { routeNumber: 'R01' } });

  const [studentUser, studentCreated] = await User.findOrCreate({
    where: { email: 'student@college.edu' },
    defaults: {
      name: 'Rahul Sharma',
      email: 'student@college.edu',
      password: 'Student@123',
      role: 'student',
      phone: '9876543210',
    },
  });

  if (studentCreated) {
    console.log('🌱 Demo student created: student@college.edu / Student@123');
  }

  const [studentProfile] = await Student.findOrCreate({
    where: { studentId: 'STU2024001' },
    defaults: {
      userId: studentUser.id,
      studentId: 'STU2024001',
      rollNumber: '21CS045',
      department: 'Computer Science',
      year: 3,
      section: 'A',
      address: '12 MG Road, City Center',
      boardingPoint: 'Market Junction',
      routeId: route1.id,
      parentName: 'Mr. Sharma',
      parentPhone: '9876501234',
      admissionDate: '2022-08-01',
      feeType: 'monthly',
    },
  });

  const feeCount = await Fee.count({ where: { studentId: studentProfile.id } });
  if (feeCount === 0) {
    const now = new Date();
    const months = [];
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    const feeRecords = months.map((month, idx) => {
      const [y, m] = month.split('-').map(Number);
      const dueDate = new Date(y, m - 1, 10);
      const isPaid = idx < 2;
      const amount = 800;
      return {
        studentId: studentProfile.id,
        routeId: route1.id,
        feeMonth: month,
        feePeriod: month,
        feeType: 'monthly',
        amount,
        lateFee: 0,
        discount: 0,
        totalAmount: amount,
        status: isPaid ? 'paid' : (idx === 2 ? 'pending' : 'pending'),
        dueDate: dueDate.toISOString().slice(0, 10),
        paidDate: isPaid ? dueDate.toISOString().slice(0, 10) : null,
        paymentMode: isPaid ? 'online' : null,
        receiptNumber: isPaid ? `RCP-${month.replace('-', '')}-001` : null,
        transactionId: isPaid ? `TXN${month.replace('-', '')}ABC` : null,
      };
    });

    await Fee.bulkCreate(feeRecords);
    console.log('🌱 Sample fee records created for demo student');
  }

  const [schedule] = await PaymentSchedule.findOrCreate({
    where: { title: 'Monthly Bus Fee Schedule' },
    defaults: {
      title: 'Monthly Bus Fee Schedule',
      description: 'Standard monthly bus fee payment schedule for all routes',
      scheduleType: 'monthly',
      dueDay: 10,
      gracePeriodDays: 5,
      lateFeePerDay: 10,
      lateFeeFixed: 50,
      reminderDaysBefore: 7,
      routeId: null,
      isActive: true,
      startDate: new Date().toISOString().slice(0, 10),
    },
  });

  if (studentCreated) {
    await Notification.bulkCreate([
      { userId: studentUser.id, title: 'Welcome to Campus Bus Portal', message: 'Your student account is ready. View your fees and payment schedule here.', type: 'general', isRead: false },
      { userId: studentUser.id, title: 'Fee Payment Reminder', message: 'Your bus fee for this month is due soon. Please pay before the due date to avoid late fees.', type: 'payment_due', isRead: false },
    ]);
    console.log('🌱 Welcome notifications created for demo student');
  }

  return { route1, studentUser, studentProfile, schedule };
}

module.exports = { seedDatabase };
