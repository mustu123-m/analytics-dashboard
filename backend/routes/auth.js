const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const {
  findByEmail,
  findById,
  createUser
} = require('../utils/userStore');

const router = express.Router();

const signToken = (userId) =>
  jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
    {
      return res.status(400).json({
        error: 'Name, email and password are required'
      });
    }

    if (password.length < 6)
    {
      return res.status(400).json({
        error: 'Password must be at least 6 characters'
      });
    }

    const existingUser = await findByEmail(email);

    if (existingUser)
    {
      return res.status(409).json({
        error: 'Email already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await createUser({
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      role: 'user'
    });

    const token = signToken(user.id);

    res.status(201).json({
      token,
      user
    });
  }
  catch (err)
  {
    console.error(err);

    res.status(500).json({
      error: 'Registration failed'
    });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
    {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    const user = await findByEmail(email);

    if (!user)
    {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword)
    {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    const token = signToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  }
  catch (err)
  {
    console.error(err);

    res.status(500).json({
      error: 'Login failed'
    });
  }
});

// LOGOUT
router.post('/logout', (req, res) => {
  res.json({ success: true });
});

// CURRENT USER
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer '))
    {
      return res.status(401).json({
        error: 'Not authenticated'
      });
    }

    const token = authHeader.slice(7);

    const { userId } = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await findById(userId);

    if (!user)
    {
      return res.status(401).json({
        error: 'User not found'
      });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  }
  catch (err)
  {
    res.status(401).json({
      error: 'Invalid or expired token'
    });
  }
});

module.exports = router;