const express = require('express');
const router = express.Router();
const { User } = require('../models');

// 사용자 정보를 조회하는 엔드포인트
router.get('/:user_id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.user_id, {
            attributes: ['height', 'weight'] // 필요한 필드만 선택
        });

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Failed to fetch user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

module.exports = router;
