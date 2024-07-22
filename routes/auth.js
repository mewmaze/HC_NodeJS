const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const authenticateToken = require('./authMiddleware');


const router = express.Router();
const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET; // 환경변수에서 비밀키를 가져옵니다.

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
    res.status(201).json({merge:'회원가입 성공', user: newUser});
  } catch(error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: '회원가입 실패'});
  }
});
  
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (user && await bcrypt.compare(password, user.password_hash)) {
      const token = jwt.sign({ id: user.user_id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
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


// 로그인한 사용자의 정보 제공
router.get('/current-user', authenticateToken, async (req, res) => {
  try {
    console.log('Request User:', req.user); // 디버깅을 위한 로그 추가

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: '사용자 인증 실패' });
    }

    const user = await User.findOne({ where: { user_id: req.user.id } });
    console.log('Database User:', user); 
    if (!user) return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    
    res.status(200).json({
      id: user.user_id,
      username: user.username,
      email: user.email,
      gender: user.gender,
      height: user.height,
      weight: user.weight,
      age: user.age,
      profile_picture: user.profile_picture,
      interests: user.interests
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: '사용자 정보를 가져오는 데 실패했습니다.' });
  }
});

// router.post('/logout', (req, res) => {
//   req.session.destroy();
//   res.status(200).json({ message: 'Logout successful' });
// });

module.exports = router;
