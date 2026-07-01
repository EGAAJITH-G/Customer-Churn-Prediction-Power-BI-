const jwt = require('jsonwebtoken');
const { dbState, localDb } = require('../config/db');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');

    if (dbState.isFallback) {
      const user = localDb.collection('users').findOne({ _id: decoded.id });
      if (!user) {
        return res.status(401).json({ message: 'User not found, auth failed' });
      }
      req.user = { id: user._id, username: user.username, role: user.role };
    } else {
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ message: 'User not found, auth failed' });
      }
      req.user = { id: user._id, username: user.username, role: user.role };
    }
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
