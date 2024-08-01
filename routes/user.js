const express = require('express');
const router = express.Router();
const { User } = require('../models');

// 사용자 정보를 조회하는 엔드포인트
router.get('/:user_id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.user_id, {
            attributes: [
                'height', 
                'weight', 
                'bmi', 
                'goal_height', 
                'goal_weight', 
                'goal_bmi'
            ]
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

// 사용자 정보를 업데이트하는 엔드포인트
router.put('/:user_id', async (req, res) => {
    try {
        const { height, weight, bmi, goal_height, goal_weight, goal_bmi } = req.body;
        const user = await User.findByPk(req.params.user_id);

        if (user) {
            // 목표와 현재 상태를 구분하여 업데이트
            if (height || weight || bmi) {
                user.height = height || user.height;
                user.weight = weight || user.weight;
                user.bmi = bmi || user.bmi;
            }
            if (goal_height || goal_weight || goal_bmi) {
                user.goal_height = goal_height || user.goal_height;
                user.goal_weight = goal_weight || user.goal_weight;
                user.goal_bmi = goal_bmi || user.goal_bmi;
            }

            const result = await user.save();
            res.json(result);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Failed to update user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

module.exports = router;
