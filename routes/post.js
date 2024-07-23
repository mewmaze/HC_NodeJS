const express = require('express');
const Post = require('../models/post');
const {Comment} = require('../models');
const authenticateToken = require('../middleware/authMiddleware'); // JWT 인증 미들웨어

const router = express.Router();

// 모든 게시글 가져오기
router.get('/', async (req, res) => {
  try {
    const posts = await Post.findAll();
    res.status(200).json(posts);
  } catch (err) {
    console.error('게시글을 불러오는 데 실패했습니다:', err);
    res.status(500).send('게시글을 불러오는 데 실패했습니다.');
  }
});

// 게시글 작성
router.post('/', authenticateToken, async (req, res) => {
  const { title, content } = req.body;
  const user_id = req.user.id;

  try {
    const post = await Post.create({ title, content, user_id });
    res.status(201).json(post);
  } catch (err) {
    console.error('게시글 작성에 실패했습니다:', err); 
    res.status(500).send('게시글 작성에 실패했습니다.');
  }
});

// 특정 게시글의 댓글 가져오기
router.get('/:postId/comments', async (req, res) => {
  const { postId } = req.params;

  try {
    const comments = await Comment.findAll({ where: { post_id: postId } });
    res.status(200).json(comments);
  } catch (err) {
    console.error('댓글을 불러오는 데 실패했습니다:', err); 
    res.status(500).send('댓글을 불러오는 데 실패했습니다.');
  }
});

// 댓글 작성
router.post('/:postId/comments', authenticateToken, async (req, res) => {
  const { content } = req.body;
  const { postId } = req.params;
  const user_id = req.user.id;

  try {
    const comment = await Comment.create({ post_id: postId, user_id, content });
    res.status(201).json(comment);
  } catch (err) {
    console.error('댓글 작성에 실패했습니다:', err);
    res.status(500).send('댓글 작성에 실패했습니다.');
  }
});

module.exports = router;