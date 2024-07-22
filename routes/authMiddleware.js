// 인증 미들웨어
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET; // 환경변수에서 비밀키를 가져옵니다.

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log('Authorization Header:', req.headers['authorization']); // 디버깅: Authorization 헤더 확인
  console.log('Extracted Token:', token); // 디버깅: 추출된 토큰 확인
  
  if (token == null) return res.status(401).json({ error: '토큰이 없습니다.' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: '토큰이 유효하지 않습니다.' });
    console.log('Authenticated User:', user);
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;