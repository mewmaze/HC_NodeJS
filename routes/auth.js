const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Profile, sequelize } = require('../models');// profile 모델 추가
const authenticateToken = require('./authMiddleware');


const router = express.Router();
const SECRET_KEY = 'your_secret_key'; // 환경변수를 사용 권장

// JWT 생성 함수
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, 'your_jwt_secret', { expiresIn: '1h' });
};

router.post('/register', async (req, res, next) => {
  const transaction = await sequelize.transaction(); //트랜잭션 시작 추가
  try {
    const { name, nickname, email, password, gender, height, weight, age, profile_picture, interest } = req.body;
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

//     });
//     res.status(201).json({merge:'회원가입 성공', user: newUser});
//   } catch(error) {
//     console.error('Error registering user:', error);
//     res.status(500).json({ error: '회원가입 실패'});
//   }
// });
  
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
