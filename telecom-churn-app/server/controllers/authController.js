const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbState, localDb } = require('../config/db');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

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

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: 'Please enter your email address' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (dbState.isFallback) {
      const user = localDb.collection('users').findOne({ email: normalizedEmail });
      if (!user) {
        return res.status(404).json({ message: 'No user registered with this email' });
      }

      localDb.collection('users').updateById(user._id, {
        resetCode: code,
        resetCodeExpires: expires.toISOString()
      });
    } else {
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return res.status(404).json({ message: 'No user registered with this email' });
      }

      user.resetCode = code;
      user.resetCodeExpires = expires;
      await user.save();
    }

    // Send email using nodemailer if configured (run asynchronously to prevent HTTP lag)
    let emailSent = false;
    if (process.env.SMTP_HOST && process.env.SMTP_MAIL && process.env.SMTP_PASSWORD) {
      emailSent = true;
      sendEmail({
        email: normalizedEmail,
        subject: 'ChurnPredict AI - Password Reset Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #2563eb; margin: 0; font-size: 24px;">Password Reset Request</h2>
              <p style="color: #64748b; font-size: 14px; margin-top: 6px;">ChurnPredict AI Telecom Portal</p>
            </div>
            <p style="font-size: 15px; color: #334155; line-height: 1.5;">Hello,</p>
            <p style="font-size: 15px; color: #334155; line-height: 1.5;">We received a request to reset the password for your account. Please use the 6-digit verification code below to set a new password:</p>
            <div style="text-align: center; margin: 32px 0;">
              <span style="display: inline-block; font-size: 36px; font-weight: bold; letter-spacing: 6px; color: #2563eb; background-color: #f8fafc; padding: 16px 32px; border-radius: 12px; border: 1.5px dashed #cbd5e1;">${code}</span>
            </div>
            <p style="font-size: 13.5px; color: #64748b; line-height: 1.5;">This code will expire in <strong>10 minutes</strong>. If you did not request a password reset, please ignore this message securely.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="text-align: center; color: #94a3b8; font-size: 11px; margin: 0;">&copy; 2026 ChurnPredict AI. All rights reserved.</p>
          </div>
        `
      }).catch(mailErr => {
        console.error('Nodemailer background dispatch failed:', mailErr.message);
      });
    }

    // Output to server console for testing/development
    console.log(`
┌────────────────────────────────────────────────────────┐
│                   RESET CODE REQUEST                   │
├────────────────────────────────────────────────────────┤
│ Email:   ${normalizedEmail.padEnd(46)} │
│ Code:    \x1b[36m${code}\x1b[0m (Expires in 10 minutes)            │
│ Status:  ${(emailSent ? 'Sent via Nodemailer SMTP' : 'Printed to Console (No SMTP config)').padEnd(46)} │
└────────────────────────────────────────────────────────┘
`);

    return res.json({ message: 'Verification code sent to your email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    if (dbState.isFallback) {
      const user = localDb.collection('users').findOne({ email: normalizedEmail });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isCodeMatch = user.resetCode === code;
      const isExpired = !user.resetCodeExpires || new Date(user.resetCodeExpires) < new Date();

      if (!isCodeMatch || isExpired) {
        return res.status(400).json({ message: 'Invalid or expired verification code' });
      }

      localDb.collection('users').updateById(user._id, {
        password: hashedPassword,
        resetCode: null,
        resetCodeExpires: null
      });
    } else {
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isCodeMatch = user.resetCode === code;
      const isExpired = !user.resetCodeExpires || user.resetCodeExpires < Date.now();

      if (!isCodeMatch || isExpired) {
        return res.status(400).json({ message: 'Invalid or expired verification code' });
      }

      user.password = hashedPassword;
      user.resetCode = undefined;
      user.resetCodeExpires = undefined;
      await user.save();
    }

    return res.json({ message: 'Password reset successful. You can now login.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
