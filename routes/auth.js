const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Profile, sequelize } = require('../models');
const router = express.Router();

const generateToken = (user) => {
  return jwt.sign({ id: user.user_id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.user_id, email: user.email }, process.env.JWT_SECRET + '_refresh', { expiresIn: '7d' });
};

const INTERESTS_ENUM = ['런닝', '헬스', '자전거', '다이어트'];
const GENDER_ENUM = ['남성', '여성'];

router.post('/register', async (req, res, next) => {
  let transaction;
  try {
    transaction = await sequelize.transaction();
    const { name, nickname, email, password, gender, height, weight, age, profile_picture, interest } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const defaultProfilePicture = 'path_to_default_image.png';
    const numHeight = height != null && !isNaN(Number(height)) ? Number(height) : 0;
    const numWeight = weight != null && !isNaN(Number(weight)) ? Number(weight) : 0;
    const safeGender = GENDER_ENUM.includes(gender) ? gender : '남성';
    const safeInterest = INTERESTS_ENUM.includes(interest) ? interest : '런닝';

    const newUser = await User.create({
      username: name,
      nickname: nickname || '',
      email,
      password_hash: hashedPassword,
      gender: safeGender,
      height: numHeight,
      weight: numWeight,
      age: age != null ? String(age) : null,
      profile_picture: profile_picture || defaultProfilePicture,
      interests: safeInterest,
      created_at: new Date()
    }, { transaction });

    await Profile.create({
      intro: "자기 소개 내용이 없어요",
      achievement_count: 0,
      user_id: newUser.user_id,
    }, { transaction });

    await transaction.commit();

    res.status(201).json({user_id: newUser.user_id});
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Error creating new user:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ error: '회원가입 실패', detail: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
});

  
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (user && await bcrypt.compare(password, user.password_hash)) {
      
      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);
      res.status(200).json({
        message: '로그인 성공',
        token,
        refreshToken,
        user: {
          user_id: user.user_id,
          username: user.nickname,
          email: user.email,
          profile_img: user.profile_picture
        }
      });
    } else {
      res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: '로그인 실패' });
  }
});


router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token이 없습니다.' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET + '_refresh');
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(403).json({ error: '유효하지 않은 사용자입니다.' });
    }

    const token = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.json({ token, refreshToken: newRefreshToken });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Refresh token이 만료되었습니다.' });
    }
    return res.status(403).json({ error: 'Refresh token이 유효하지 않습니다.' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.status(200).json({ message: 'Logout successful' });
  });
});
module.exports = router;