const express = require('express');
const bcrypt = require('bcrypt');
const { sequelize, User, Profile } = require('../models');

const router = express.Router();

router.post('/register', async (req, res, next) => {
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
    });

    // Profile 테이블에 기본 값과 함께 user_id 삽입
    await Profile.create({
      intro: "자기 소개 내용이 없어요",
      achievement_count: 0, // 기본 프로필 값 설정
      user_id: newUser.id, // user_id 대신 id로 수정
    }, { transaction });

    // 트랜잭션 커밋
    await transaction.commit();

    res.status(201).json({user_id: newUser.id}); // 생성된 사용자 객체, user_id 반환
  } catch (error) {
    console.error('Error creating new user:', error);
    res.status(500).json({ error: '회원가입 실패' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (user && await bcrypt.compare(password, user.password_hash)) {
    res.status(200).json({ message: 'Login successful', user_id: user.user_id }); // 로그인 성공 시 user_id 반환
    console.log(`${user.username}님, 반가워요!`);
  } else {
    res.status(401).json({ error: 'Invalid username or password' });
  }
});

// router.post('/logout', (req, res) => {
//   req.session.destroy();
//   res.status(200).json({ message: 'Logout successful' });
// });

module.exports = router;
