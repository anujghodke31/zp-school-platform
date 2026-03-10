const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['SuperAdmin', 'Admin', 'Teacher', 'Parent', 'Student'],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    // References for specific roles (e.g., Parent -> Student lookup, Teacher -> assigned classes)
    contactNumber: {
        type: String,
        required: false
    }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('passwordHash')) return;

    // In our case we might be feeding it an already generated hash or a raw password.
    // Assuming 'passwordHash' field receives raw password initially for simplicity:
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
