const getAmountForType = (route, feeType) => {
  if (!route) return null;
  switch (feeType) {
    case 'annual': return route.annualFee ? parseFloat(route.annualFee) : null;
    case 'term': return route.termFee ? parseFloat(route.termFee) : null;
    default: return route.monthlyFee ? parseFloat(route.monthlyFee) : null;
  }
};

const buildFeePeriod = (feeType, feeMonth, academicYear) => {
  const year = academicYear || new Date().getFullYear();
  if (feeType === 'annual') {
    const label = `Annual ${year}-${year + 1}`;
    return { feePeriod: label, feeMonth: feeMonth || String(year) };
  }
  if (feeType === 'term') {
    const label = feeMonth ? `Term ${feeMonth}` : `Term 1 ${year}`;
    return { feePeriod: label, feeMonth: feeMonth || `${year}-T1` };
  }
  return { feePeriod: feeMonth, feeMonth };
};

const resolveStudentFee = (student, route, options = {}) => {
  const { feeType: feeTypeOverride = 'by_student', feeMonth, academicYear } = options;
  const feeType = feeTypeOverride === 'by_student' ? (student.feeType || 'monthly') : feeTypeOverride;
  const amount = getAmountForType(route, feeType);

  if (!amount || amount <= 0) {
    return { error: `No ${feeType} fee configured on route ${route?.routeNumber}` };
  }

  const { feePeriod, feeMonth: periodKey } = buildFeePeriod(feeType, feeMonth, academicYear);

  return {
    feeType,
    amount,
    totalAmount: amount,
    feePeriod,
    feeMonth: periodKey,
  };
};

const calculateDueDate = (schedule) => {
  const base = schedule.startDate ? new Date(schedule.startDate) : new Date();
  const dueDay = schedule.dueDay || 10;
  const due = new Date(base.getFullYear(), base.getMonth(), dueDay);
  if (due < base) due.setMonth(due.getMonth() + 1);
  return due.toISOString().slice(0, 10);
};

module.exports = { getAmountForType, buildFeePeriod, resolveStudentFee, calculateDueDate };
