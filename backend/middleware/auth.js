const jwt = require('jsonwebtoken');
const { users } = require('../routes/auth');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ error: 'Not authenticated' });

  try {
    const { userId } = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
    const user = [...users.values()].find(u => u.id === userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { protect };