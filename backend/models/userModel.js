const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        email: {
            type: String,
            unique: true,
            sparse: true, // Allow nulls while maintaining uniqueness
        },
        // collegeNumber: {
        //     type: String,
        //     unique: true,
        //     sparse: true,
        // },
         boardingNumber: {
    type: String,
    required: false,  // ✅ not required for admin/superadmin
    unique: true,
    sparse: true,     // ✅ allows multiple nulls without unique conflict
},
        password: {
            type: String,
            required: [true, 'Please add a password'],
        },
        isAdmin: {
            type: Boolean,
            required: true,
            default: false,
        },
        role: {
            type: String,
            required: true,
            enum: ['student', 'admin', 'superadmin'],
        },
    },
    {
        timestamps: true,
    }
);

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);
