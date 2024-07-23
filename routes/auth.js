const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sequelize, User, Profile } = require('../models');

const router = express.Router();
const SECRET_KEY = 'your_secret_key'; // 환경변수를 사용 권장

router.post('/register', async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { name, nickname, email, password, gender, height, weight, age, profile_picture, interest } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); // 해시된 비밀번호 생성

    // User 테이블에 사용자 생성
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
    }, { transaction });

    // Profile 테이블에 기본 값과 함께 user_id 삽입
    await Profile.create({
      intro: "자기 소개 내용이 없어요",
      achievement_count: 0, // 기본 프로필 값 설정
      user_id: newUser.id // user_id 설정
    }, { transaction });

    // 트랜잭션 커밋
    await transaction.commit();

    res.status(201).json({user_id: newUser.id}); // 생성된 사용자 객체, user_id 반환
  } catch (error) {
    // 트랜잭션 롤백
    if (transaction) await transaction.rollback();
    console.error('Error creating new user:', error);
    res.status(500).json({ error: '회원가입 실패' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (user && await bcrypt.compare(password, user.password_hash)) {
      const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
      res.status(200).json({ message: '로그인 성공', token, user_id: user.id });
    } else {
      res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: '로그인 실패' });
  }
});

module.exports = router;