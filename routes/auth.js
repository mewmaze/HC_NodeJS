const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();
const SECRET_KEY = 'your_secret_key'; // 환경변수를 사용 권장

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, gender, height, weight, age, interest, profile_picture } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); // 해시된 비밀번호 생성

    const newUser = await User.create({
      username: name,
      email,
      password_hash: hashedPassword, // 해시된 비밀번호 저장
      gender,
      height,
      weight,
      age,
      profile_picture,
      interests: interest,
      created_at: new Date()
    });

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (user && await bcrypt.compare(password, user.password_hash)) {
      const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
      res.status(200).json({ message: '로그인 성공', token });
      console.log(`${user.username}님, 반가워요!`);
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: '로그인 실패' });
  }
});

// 인증 미들웨어
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (token == null) return res.status(401).json({ error: '토큰이 없습니다.' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: '토큰이 유효하지 않습니다.' });
    req.user = user;
    next();
  });
};

// router.post('/logout', (req, res) => {
//   req.session.destroy();
//   res.status(200).json({ message: 'Logout successful' });
// });

module.exports = router;
