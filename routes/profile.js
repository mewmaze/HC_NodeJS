const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { User, Profile, Post, Comment } = require('../models');

const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');

// uploads 디렉토리를 정적 파일로 제공
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + ext);
  },
});

const upload = multer({ storage: storage });

router.get('/myPage/:user_id', authenticateToken, async (req, res) => {
    const user_id = req.params.user_id;
  try {
      if (!user_id) {
          return res.status(400).json({ error: '사용자 ID가 필요합니다.' });
      }

      const user = await User.findByPk(user_id, {
          attributes: ['nickname', 'profile_picture']
      });

      const profile = await Profile.findOne({
          where: { user_id },
          attributes: ['intro', 'achievement_count']
      });

      res.status(200).json({
          nickname: user.nickname,
          profile_picture: user.profile_picture,
          intro: profile.intro,
          achievement_count: profile.achievement_count
      });
  } catch (error) {
      console.error('Error fetching user and profile data:', error);
      res.status(500).json({ error: '데이터 조회 중 오류가 발생했습니다.' });
  }
});

router.put('/update/:user_id', authenticateToken, upload.single('profile_picture'), async (req, res) => {
    const userId = req.params.user_id;
  const { nickname, intro } = req.body;
  const profilePicture = req.file ? req.file.filename : null;

  try {
      const profile = await Profile.findOne({ where: { user_id: userId } });
      if (!profile) {
          return res.status(404).json({ error: 'Profile not found' });
      }

      if (intro) profile.intro = intro;
      await profile.save();

      const user = await User.findByPk(userId);
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      if (nickname) user.nickname = nickname;
      if (profilePicture) user.profile_picture = profilePicture;
      await user.save();

      res.json({ user, profile });
  } catch (error) {
      console.error('Failed to update profile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.get('/myPage/:user_id/getPosts', async (req, res) => {
  const user_id = req.params.user_id;

  try {
    if (!user_id) {
        return res.status(400).json({ error: '사용자 ID가 필요합니다.' });
    }

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    const posts = await Post.findAll({
        where: { user_id },
        attributes: ['post_id', 'title', 'content', 'created_at']
    });

    res.status(200).json({ posts });
  } catch (error) {
    console.error('Error fetching user post data:', error);
    res.status(500).json({ error: '데이터 조회 중 오류가 발생했습니다.' });
  }
});

router.get('/myPage/:user_id/:postId', async (req, res) => {
  const user_id = req.params.user_id;
  const { postId } = req.params;

  try {
    if (!user_id) {
        return res.status(400).json({ error: '사용자 ID가 필요합니다.' });
    }

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    const post = await Post.findOne({ where: { post_id: postId } });
    if (!post) {
        return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }

    res.status(200).json(post);
  }
  catch (err) {
    console.error('게시글을 불러오는 데 실패했습니다:', err); 
    res.status(500).send('게시글을 불러오는 데 실패했습니다.');
  }
});

router.get('/myPage/:user_id/:post_id/getComments', async (req, res) => {
  const user_id = req.params.user_id;

  try {
    if (!user_id) {
        return res.status(400).json({ error: '사용자 ID가 필요합니다.' });
    }

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    const comments = await Comment.findAll({
        where: { user_id },
        attributes: ['comment_id', 'post_id', 'content', 'created_at']
    });

    res.status(200).json({ comments });
  } catch (error) {
    console.error('Error fetching user comment data:', error);
    res.status(500).json({ error: '데이터 조회 중 오류가 발생했습니다.' });
  }
});

// 챌린지 랭킹 (상위 5명)
router.get('/rankings', async (req, res) => {
  try {
    const profiles = await Profile.findAll({
      include: {
        model: User,
        attributes: ['nickname', 'profile_picture'],
      },
      order: [['achievement_count', 'DESC']],
      limit: 5,
    });

    const rankings = profiles.map((p) => ({
      user_id: p.user_id,
      nickname: p.User.nickname,
      profile_picture: p.User.profile_picture,
      achievement_count: p.achievement_count,
    }));

    res.json(rankings);
  } catch (error) {
    console.error('Failed to fetch rankings:', error);
    res.status(500).json({ error: 'Failed to fetch rankings' });
  }
});

//챌린지 랭킹을 위해 모든 유저의 프로필 정보를 가져옴
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.findAll({
      include: {
        model: User,
        attributes: ['nickname', 'profile_picture'] // 필요한 유저 정보만 가져오기
      },
      order: [['achievement_count', 'DESC']],
      limit: 5 // 상위 5개의 프로필만 가져옴
    });
    res.json(profiles);
  } catch(error){
    res.status(500).json({error: 'Failed to fetch 챌린지 랭킹을 위한 모든 유저의 프로필정보 '});
  }
});
module.exports = router;