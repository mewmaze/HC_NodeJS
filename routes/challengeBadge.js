const express = require("express");
const router = express.Router();
const {
  ChallengeRecord,
  ChallengeBadge,
  Challenge,
  Profile,
  Participant,
} = require("../models");
const { Op } = require("sequelize");
const { addDays, startOfDay, endOfDay, format } = require("date-fns");

const updateChallengeStatus = async (participant_id, challenge_id) => {
  try {
    const challenge = await Challenge.findByPk(challenge_id);
    if (!challenge) return;

    const targetDays = challenge.target_days; // 주 단위 최소 완료 횟수
    const startDate = new Date(challenge.start_date);
    const endDate = new Date(challenge.end_date);

    let currentStartDate = startOfDay(startDate);
    let currentEndDate = endOfDay(addDays(startDate, 6)); // 7일 주간

    while (currentStartDate <= endDate) {
      // 주간 기록 조회
      const records = await ChallengeRecord.findAll({
        where: {
          participant_id,
          challenge_id,
          completion_date: { [Op.between]: [currentStartDate, currentEndDate] },
        },
      });

      // 완료한 고유 날짜 수
      const uniqueDays = new Set(
        records.map((r) => format(new Date(r.completion_date), "yyyy-MM-dd"))
      );

      // 주간 달성 조건 충족 여부
      if (uniqueDays.size >= targetDays) {
        // 이미 뱃지가 존재하는지 확인
        const existingBadge = await ChallengeBadge.findOne({
          where: {
            participant_id,
            week_start: currentStartDate,
            week_end: currentEndDate,
          },
        });

        if (!existingBadge) {
          await ChallengeBadge.create({
            participant_id,
            challenge_id,
            week_start: currentStartDate,
            week_end: currentEndDate,
          });

          // 프로필 achievement_count 증가
          const participant = await Participant.findByPk(participant_id);
          if (participant) {
            const profile = await Profile.findOne({
              where: { user_id: participant.user_id },
            });
            if (profile) {
              profile.achievement_count += 1;
              await profile.save();
            }
          }
        }
      }

      // 다음 주로 이동
      currentStartDate = addDays(currentStartDate, 7);
      currentEndDate = addDays(currentEndDate, 7);
    }
  } catch (error) {
    console.error("Failed to update challenge status:", error);
  }
};

// 유저 뱃지 전체 조회
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const participants = await Participant.findAll({
      where: { user_id: userId },
    });

    if (participants.length === 0) {
      return res.json([]);
    }

    const participantIds = participants.map((p) => p.participant_id);

    const badges = await ChallengeBadge.findAll({
      where: { participant_id: participantIds },
      include: [{ model: Challenge, attributes: ["challenge_id", "challenge_name", "challenge_img"] }],
      order: [["awarded_at", "DESC"]],
    });

    res.json(badges);
  } catch (error) {
    console.error("Failed to fetch user badges:", error);
    res.status(500).json({ error: "Failed to fetch user badges" });
  }
});

// 특정 챌린지 뱃지 조회
router.get("/challenge/:challengeId/user/:userId", async (req, res) => {
  try {
    const { challengeId, userId } = req.params;

    const participant = await Participant.findOne({
      where: { user_id: userId, challenge_id: challengeId },
    });

    if (!participant) {
      return res.json([]);
    }

    const badges = await ChallengeBadge.findAll({
      where: { participant_id: participant.participant_id, challenge_id: challengeId },
      order: [["week_start", "ASC"]],
    });

    res.json(badges);
  } catch (error) {
    console.error("Failed to fetch challenge badges:", error);
    res.status(500).json({ error: "Failed to fetch challenge badges" });
  }
});

module.exports = { router, updateChallengeStatus };
