const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbState, localDb } = require('../config/db');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: '30d'
  });
};

exports.register = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (dbState.isFallback) {
      const existingUser = localDb.collection('users').findOne({ email: normalizedEmail }) || localDb.collection('users').findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const newUser = localDb.collection('users').create({
        username,
        email: normalizedEmail,
        password: hashedPassword,
        role: role || 'user'
      });

      const token = generateToken(newUser._id);
      return res.status(201).json({
        token,
        user: { id: newUser._id, username: newUser.username, email: newUser.email, role: newUser.role }
      });
    } else {
      const userExists = await User.findOne({ $or: [{ email: normalizedEmail }, { username }] });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = await User.create({
        username,
        email: normalizedEmail,
        password: hashedPassword,
        role: role || 'user'
      });

      const token = generateToken(user._id);
      return res.status(201).json({
        token,
        user: { id: user._id, username: user.username, email: user.email, role: user.role }
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (dbState.isFallback) {
      const user = localDb.collection('users').findOne({ email: normalizedEmail });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = generateToken(user._id);
      return res.json({
        token,
        user: { id: user._id, username: user.username, email: user.email, role: user.role }
      });
    } else {
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = generateToken(user._id);
      return res.json({
        token,
        user: { id: user._id, username: user.username, email: user.email, role: user.role }
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    if (dbState.isFallback) {
      const user = localDb.collection('users').findOne({ _id: req.user.id });
      if (!user) return res.status(404).json({ message: 'User not found' });
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } else {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json(user);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const normalizedEmail = email ? email.toLowerCase().trim() : undefined;
    let hashedPassword;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    if (dbState.isFallback) {
      const user = localDb.collection('users').findOne({ _id: req.user.id });
      if (!user) return res.status(404).json({ message: 'User not found' });

      // Check conflict if email changes
      if (normalizedEmail && normalizedEmail !== user.email) {
        const conflict = localDb.collection('users').findOne({ email: normalizedEmail });
        if (conflict) return res.status(400).json({ message: 'Email already in use' });
      }

      // Check conflict if username changes
      if (username && username !== user.username) {
        const conflict = localDb.collection('users').findOne({ username });
        if (conflict) return res.status(400).json({ message: 'Username already in use' });
      }

      const updated = localDb.collection('users').updateById(req.user.id, {
        ...(username && { username }),
        ...(normalizedEmail && { email: normalizedEmail }),
        ...(password && { password: hashedPassword })
      });

      const { password: _, ...userWithoutPassword } = updated;
      return res.json({ message: 'Profile updated successfully', user: userWithoutPassword });
    } else {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      if (normalizedEmail && normalizedEmail !== user.email) {
        const conflict = await User.findOne({ email: normalizedEmail });
        if (conflict) return res.status(400).json({ message: 'Email already in use' });
        user.email = normalizedEmail;
      }

      if (username && username !== user.username) {
        const conflict = await User.findOne({ username });
        if (conflict) return res.status(400).json({ message: 'Username already in use' });
        user.username = username;
      }

      if (password) {
        user.password = hashedPassword;
      }

      await user.save();
      const userWithoutPassword = { id: user._id, username: user.username, email: user.email, role: user.role };
      return res.json({ message: 'Profile updated successfully', user: userWithoutPassword });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
