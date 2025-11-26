const mongoose = require('mongoose');
const bcrypt = require('bcrypt');//----ADDED
const SALT_WORK_FACTOR = 10;//----ADDED
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    minlength: [3, 'Username must be at least 3 characters']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email is invalid']
  },
  role: {
    type: String,
    enum: ['Client', 'Admin'],
    default: 'Client'
  },

  referenceNums: [{
    type: String,
  }],
});

//----------------------------------------------------ADDED
UserSchema.pre('save', async function() {
    const user = this;
    if (!user.isModified('password')) return;

    try {
        const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
        const hash = await bcrypt.hash(user.password, salt);
        user.password = hash;
    } catch (err) {
        throw new Error(err);
    }
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};


module.exports = mongoose.model('User', UserSchema);

