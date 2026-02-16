const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.status(401).json({ error: '토큰이 없습니다.' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: '토큰이 만료되었습니다.' });
      }
      return res.status(403).json({ error: '토큰이 유효하지 않습니다.' });
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;