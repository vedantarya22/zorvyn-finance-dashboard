import FinancialRecord from "../models/financialRecord.model.js";

// GET /api/records  — supports ?type, ?category, ?startDate, ?endDate, ?page, ?limit
export const getRecords = async (req, res) => {
    try {
        const { type, category, startDate, endDate, page = 1, limit = 10 } = req.query;

        const query = {};
        if (type) query.type = type;
        if (category) query.category = new RegExp(category, 'i'); // case-insensitive search
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [records, totalCount] = await Promise.all([
            FinancialRecord.find(query)
                .populate('createdBy', 'name email')
                .sort({ date: -1 })
                .skip(skip)
                .limit(Number(limit)),
            FinancialRecord.countDocuments(query),
        ]);

        res.status(200).json({
            success: true,
            totalCount,
            page: Number(page),
            totalPages: Math.ceil(totalCount / Number(limit)),
            records,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/records/:id
export const getRecordById = async (req, res) => {
    try {
        const record = await FinancialRecord.findById(req.params.id).populate('createdBy', 'name email');
        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }
        res.status(200).json({ success: true, record });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/records
export const createRecord = async (req, res) => {
    try {
        const { amount, type, category, date, notes } = req.body;

        if (!amount || !type || !category || !date) {
            return res.status(400).json({ success: false, message: 'Amount, type, category and date are required' });
        }

        if (amount <= 0) {
            return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
        }

        if (!['income', 'expense'].includes(type)) {
            return res.status(400).json({ success: false, message: 'Type must be income or expense' });
        }

        const record = await FinancialRecord.create({
            amount,
            type,
            category: category.trim(),
            date: new Date(date),
            notes,
            createdBy: req.user._id,
        });

        await record.populate('createdBy', 'name email');
        res.status(201).json({ success: true, record });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PATCH /api/records/:id
export const updateRecord = async (req, res) => {
    try {
        const { amount, type, category, date, notes } = req.body;

        if (amount !== undefined && amount <= 0) {
            return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
        }

        if (type && !['income', 'expense'].includes(type)) {
            return res.status(400).json({ success: false, message: 'Type must be income or expense' });
        }

        const updateData = {};
        if (amount !== undefined) updateData.amount = amount;
        if (type !== undefined) updateData.type = type;
        if (category !== undefined) updateData.category = category.trim();
        if (date !== undefined) updateData.date = new Date(date);
        if (notes !== undefined) updateData.notes = notes;

        const record = await FinancialRecord.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('createdBy', 'name email');

        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }

        res.status(200).json({ success: true, record });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE /api/records/:id  — soft delete
export const deleteRecord = async (req, res) => {
    try {
        const record = await FinancialRecord.findByIdAndUpdate(
            req.params.id,
            { isDeleted: true },
            { new: true }
        );

        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }

        res.status(200).json({ success: true, message: 'Record deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};