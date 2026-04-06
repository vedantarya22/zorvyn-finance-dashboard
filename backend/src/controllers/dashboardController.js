import FinancialRecord from "../models/financialRecord.model.js";

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// GET /api/dashboard/summary
export const getSummary = async (req, res) => {
  try {
    const result = await FinancialRecord.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    let totalIncome = 0, totalExpenses = 0, totalRecords = 0;

    for (const row of result) {
      if (row._id === 'income')  totalIncome   = row.total;
      if (row._id === 'expense') totalExpenses = row.total;
      totalRecords += row.count;
    }

    res.status(200).json({
      success: true,
      summary: {
        totalIncome,
        totalExpenses,
        netBalance: totalIncome - totalExpenses,
        totalRecords,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/dashboard/trends?months=6
export const getMonthlyTrends = async (req, res) => {
  try {
    const months = Math.min(Number(req.query.months) || 6, 24);

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - (months - 1));
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const result = await FinancialRecord.aggregate([
      { $match: { isDeleted: false, date: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year:  { $year: '$date' },
            month: { $month: '$date' },
            type:  '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Build a complete month map so months with zero records still appear
    const trendMap = {};
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      trendMap[key] = {
        month: MONTH_NAMES[d.getMonth()],
        year: d.getFullYear(),
        income: 0,
        expenses: 0,
      };
    }

    for (const row of result) {
      const key = `${row._id.year}-${row._id.month}`;
      if (trendMap[key]) {
        if (row._id.type === 'income')  trendMap[key].income   = row.total;
        if (row._id.type === 'expense') trendMap[key].expenses = row.total;
      }
    }

    res.status(200).json({ success: true, trends: Object.values(trendMap) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/dashboard/categories
export const getCategoryTotals = async (req, res) => {
  try {
    const result = await FinancialRecord.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: { category: '$category', type: '$type' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const categories = result.map((row) => ({
      category: row._id.category,
      type:     row._id.type,
      total:    row.total,
      count:    row.count,
    }));

    res.status(200).json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/dashboard/recent?limit=5
export const getRecentTransactions = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 5, 20);

    const records = await FinancialRecord.find()
      .populate('createdBy', 'name email')
      .sort({ date: -1 })
      .limit(limit);

    res.status(200).json({ success: true, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};