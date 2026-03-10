const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    roll_no: { type: String, required: true },
    name: { type: String, required: true },
    className: { type: String, required: true },
    parent_phone: { type: String, required: true },
    attendance_pct: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
