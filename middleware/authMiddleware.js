const jwt = require('jsonwebtoken');

// JWT 인증 미들웨어
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);
  
    jwt.verify(token, 'your_jwt_secret', (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

module.exports = authenticateToken;