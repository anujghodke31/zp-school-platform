const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    audience: { type: String, required: true }, // e.g., 'all', 'absent', 'at-risk'
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);
