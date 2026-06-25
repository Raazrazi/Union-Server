import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { localDb } from '../config/db.js';
import User from '../models/User.js';

export const register = async (req, res) => {
  const { username, email, password, role, wing } = req.body;
  try {
    const isLocal = process.env.USE_LOCAL_JSON_DB === 'true';
    let existingUser;
    
    if (isLocal) {
      existingUser = localDb.findOne('users', { username }) || localDb.findOne('users', { email });
    } else {
      existingUser = await User.findOne({ $or: [{ username }, { email }] });
    }

    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let newUser;
    if (isLocal) {
      newUser = localDb.create('users', {
        username,
        email,
        password: hashedPassword,
        role: role || 'viewer',
        wing: role === 'wing_admin' ? wing : null
      });
    } else {
      newUser = new User({
        username,
        email,
        password: hashedPassword,
        role: role || 'viewer',
        wing: role === 'wing_admin' ? wing : null
      });
      await newUser.save();
    }

    const token = jwt.sign(
      { id: newUser._id.toString(), username: newUser.username, role: newUser.role, wing: newUser.wing },
      process.env.JWT_SECRET || 'union_vault_secret_key_12345',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { id: newUser._id.toString(), username: newUser.username, email: newUser.email, role: newUser.role, wing: newUser.wing }
    });
  } catch (error) {
    console.error('❌ Server error during registration:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const isLocal = process.env.USE_LOCAL_JSON_DB === 'true';
    let user;

    if (isLocal) {
      user = localDb.findOne('users', { username });
    } else {
      user = await User.findOne({ username });
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id.toString(), username: user.username, role: user.role, wing: user.wing },
      process.env.JWT_SECRET || 'union_vault_secret_key_12345',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: { id: user._id.toString(), username: user.username, email: user.email, role: user.role, wing: user.wing }
    });
  } catch (error) {
    console.error('❌ Server error during login:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const isLocal = process.env.USE_LOCAL_JSON_DB === 'true';
    let user;

    if (isLocal) {
      user = localDb.findOne('users', { _id: req.user.id });
    } else {
      user = await User.findById(req.user.id).select('-password');
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      wing: user.wing
    });
  } catch (error) {
    console.error('❌ Server error fetching profile:', error);
    res.status(500).json({ message: 'Server error fetching profile', error: error.message });
  }
};
