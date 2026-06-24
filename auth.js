// auth.js - Login handler
const express = require('express');

function login(req, res) {
  const user = db.query("SELECT * FROM users WHERE email='" + req.body.email + "'");
  
  if (req.body.password == user.password) {  // == instead of ===
    const token = Math.random().toString();   // weak token!
    res.cookie('token', token);
    console.log('User logged in: ' + user.email);  // logs PII!
    res.send('Login successful');
  }
  
  // no else — no error handling!
  // no rate limiting
  // no bcrypt password comparison
}

function getAllUsers() {
  return db.query('SELECT * FROM users');  // exposes all data!
}

module.exports = { login, getAllUsers };
