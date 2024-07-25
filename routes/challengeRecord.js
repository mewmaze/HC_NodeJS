const express = require('express');
const router = express.Router();
const { ChallengeRecord, Challenge, Profile  } = require('../models');
const { Op } = require('sequelize');
const { addDays, startOfDay, endOfDay, format } = require('date-fns');

router.post('/update', async (req,res) => {
    const {participant_id, challenge_id, completion_date} = req.body;

    console.log('Received data:', { participant_id, challenge_id, completion_date });

    try{
        // 챌린지 기록 저장
        const newRecord = await ChallengeRecord.create({
            participant_id,
            challenge_id,
            completion_date
        });

        console.log('Challenge record created:', newRecord);

        // 챌린지 상태 평가 및 프로필 업데이트
        await updateChallengeStatus(participant_id, challenge_id);        

        res.status(201).json(newRecord);
    } catch(error) {
        console.error('Failed to update challenge record:', error);
        res.status(500).json({ error: 'Failed to update challenge record'});
    }
});

// 챌린지 완료 기록 삭제
router.post('/delete', async (req, res) => {
    const { participant_id, challenge_id, completion_date } = req.body;

    console.log('Received DELETE request:', { participant_id, challenge_id, completion_date });

    try {
        await ChallengeRecord.destroy({
            where: {
                participant_id,
                challenge_id,
                completion_date: {
                    [Op.eq]: new Date(completion_date)
                }
            }
        });

        // 챌린지 상태 평가 및 프로필 업데이트
        await updateChallengeStatus(participant_id, challenge_id);

        res.status(204).send(); // 성공적으로 삭제된 경우 No Content 상태 코드 반환
    } catch (error) {
        console.error('Failed to delete challenge record:', error);
        res.status(500).json({ error: 'Failed to delete challenge record' });
    }
});

const updateChallengeStatus = async (participant_id, challenge_id) => {
    try {
        console.log(`Updating challenge status for participant ${participant_id} and challenge ${challenge_id}`);
        const challenge = await Challenge.findByPk(challenge_id);
        console.log('Fetched challenge:', challenge);

        const targetPeriod = challenge.target_period; // 기간 (주)
        const targetDays = challenge.target_days; // 매주 필요한 완료 횟수

        const startDate = new Date(challenge.start_date);
        let endDate = new Date(challenge.end_date);

        let currentStartDate = startOfDay(startDate); //현재 평가 중인 주의 시작일과 종료일
        let currentEndDate =  endOfDay(addDays(startDate, 6));// 현재 평가 중인 주의 종료일 (7일)

        const completionStatus = [];

        // 7일 단위로 평가 진행
        while (currentStartDate <= endDate) {
            console.log(`Checking records from ${format(currentStartDate, 'yyyy-MM-dd')} to ${format(currentEndDate, 'yyyy-MM-dd')}`);
            const records = await ChallengeRecord.findAll({
                where: {
                    participant_id,
                    challenge_id,
                    completion_date: {
                        [Op.between]: [currentStartDate, currentEndDate]
                    }
                }
            });

            const weeklyRecords = records.map(record => format(new Date(record.completion_date), 'yyyy-MM-dd'));
            const uniqueDays = new Set(weeklyRecords.map(date => date));

            if (uniqueDays.size >= targetDays) {
                completionStatus.push({
                    weekStartDate: format(currentStartDate, 'yyyy-MM-dd'),
                    weekEndDate: format(currentEndDate, 'yyyy-MM-dd'),
                    completed: true
                });
            } else {
                completionStatus.push({
                    weekStartDate: format(currentStartDate, 'yyyy-MM-dd'),
                    weekEndDate: format(currentEndDate, 'yyyy-MM-dd'),
                    completed: false
                });
            }

            // 다음 7일 단위로 이동
            currentStartDate = addDays(currentStartDate, 7);
            currentEndDate = addDays(currentEndDate, 7);
        }

        // 프로필 뱃지 업데이트
        const isCompleted = completionStatus.every(status => status.completed);

        if (isCompleted) {
            const userProfile = await Profile.findOne({ where: { user_id: participant_id } });
            if (userProfile) {
                userProfile.achievement_count += 1; // 뱃지 개수 증가
                await userProfile.save();
                console.log('Updated user profile with new achievement count:', userProfile);
            }
        }
    } catch (error) {
        console.error('Failed to update challenge status:', error);
    }
};


// 챌린지 상태 조회
router.get('/challenge-status',async (req,res) => {
    const {date} = req.query;

    try{
        const challengeRecords = await ChallengeRecord.findAll({
            where: {
                completion_date: date
            }
        });

        res.json(challengeRecords);
    } catch(error) {
        console.error('Failed to fetch challenge status:', error);
        res.status(500).json({ error: 'Failed to fetch challenge status'});
    }
});

module.exports = router;