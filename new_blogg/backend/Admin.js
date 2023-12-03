// Admin.js
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: String,
  password: String // Store password
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
