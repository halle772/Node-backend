const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name']
    },
    email: {
        type: String,
        required: [true, 'Please provide your name'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function(el) {
                return el === this.password;
            },
            message: 'Password are not the same'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpire: Date
})

// Pre Middleware 
userSchema.pre('save', async function(next) {
    // Only runs this function if password was actually.
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);

    this.confirmPassword = undefined;
    next();
});

// Pre Middleware for resetting password.
userSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

// Instance method for checking password is correct or not.
userSchema.methods.checkPassword = async function(
    candidatePassword, 
    userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

// Instance method
userSchema.methods.changedPasswordAfter = function(JWTTimeStamp) {
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        
        return JWTTimeStamp < changedTimeStamp
    }

    // False means NOT changed
    return false;
};

// Instance method
userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    this.passwordResetToken = crypto
        .createHash('sha256').
        update(resetToken)
        .digest('hex');

    this.passwordResetExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};


const User = mongoose.model('User', userSchema);

module.exports = User;