const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Profile, sequelize } = require('../models');// profile 모델 추가
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();

// JWT 생성 함수
const generateToken = (user) => {
  return jwt.sign({ id: user.user_id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

router.post('/register', async (req, res, next) => {
  const transaction = await sequelize.transaction(); //트랜잭션 시작 추가
  try {
    const { name, nickname, email, password, gender, height, weight, age, profile_picture, interest } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); // 해시된 비밀번호 생성

    const newUser = await User.create({
      username: name,
      nickname,
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

    // Profile 테이블에 기본 값과 함께 user_id 삽입
    await Profile.create({
      intro: "자기 소개 내용이 없어요",
      achievement_count: 0, // 기본 프로필 값 설정
      user_id: newUser.user_id, // user_id 대신 id로 수정
    }, { transaction });

    // 트랜잭션 커밋
    await transaction.commit();

    res.status(201).json({user_id: newUser.user_id}); // 생성된 사용자 객체, user_id 반환
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
      
      const token = generateToken(user);
      res.status(200).json({ message: '로그인 성공', token, user_id: user.user_id });
    } else {
      res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
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
