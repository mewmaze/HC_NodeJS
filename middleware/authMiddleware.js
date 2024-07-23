const jwt = require('jsonwebtoken');
require('dotenv').config();

// JWT 인증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"에서 <token> 추출
    
  if (!token) {
    console.log('No token provided');
    return res.sendStatus(401); // 토큰이 없으면 401
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Token verification failed:', err.message);
      return res.sendStatus(403); // 인증 실패시 403
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;