const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();

// JWT 생성 함수
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, 'your_jwt_secret', { expiresIn: '1h' });
};

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

    res.status(201).json(newUser); // 생성된 사용자 객체 반환
  } catch (error) {
    console.error('Error creating new user:', error);
    res.status(500).json({ error: '회원가입 실패' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (user && await bcrypt.compare(password, user.password_hash)) {
      const token = jwt.sign({ id: user.id, email: user.email }, 'your_jwt_secret', { expiresIn: '1h' });
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


// router.post('/logout', (req, res) => {
//   req.session.destroy();
//   res.status(200).json({ message: 'Logout successful' });
// });

module.exports = router;
