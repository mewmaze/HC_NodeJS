const express = require("express");
const router = express.Router();
const { Participant, Challenge, ChallengeRecord, ChallengeBadge } = require("../models");
const authenticateToken = require("../middleware/authMiddleware");
const { Op } = require("sequelize");
const { addDays, startOfDay, endOfDay, format } = require("date-fns");

router.use(authenticateToken);

router.get("/user-challenges", async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      throw new Error("userId is not defined");
    }

    const participants = await Participant.findAll({
      where: { user_id: userId },
      include: [Challenge],
    });

    const challenges = participants.map((p) => ({
      challenge_id: p.Challenge.challenge_id,
      challenge_name: p.Challenge.challenge_name,
      participant_id: p.participant_id,
      start_date: p.Challenge.start_date,
      end_date: p.Challenge.end_date,
      target_days: p.Challenge.target_days,
      target_period: p.Challenge.target_period,
    }));

    res.json(challenges);
  } catch (error) {
    console.error("Failed to fetch user challenges:", error);
    res.status(500).json({ error: "Failed to fetch user challenges" });
  }
});

router.post("/", async (req, res) => {
  const { challenge_id, start_date, end_date, progress } = req.body;
  const user_id = req.user.id;

  try {
    const existingParticipant = await Participant.findOne({
      where: {
        user_id: user_id,
        challenge_id: challenge_id,
      },
    });

    if (existingParticipant) {
      return res.status(400).json({ error: "이미 참가한 챌린지입니다." });
    }

    const newParticipant = await Participant.create({
      user_id: user_id,
      challenge_id: challenge_id,
      start_date,
      end_date,
      progress,
    });

    const challenge = await Challenge.findByPk(challenge_id);
    if (challenge) {
      await challenge.increment("participant_count");
    }

    res.status(201).json(newParticipant);
  } catch (error) {
    console.error("Failed to add participant:", error);
    res.status(500).json({ error: "Failed to add participant" });
  }
});

router.get("/:challengeId/:userId", async (req, res) => {
  try {
    const { challengeId, userId } = req.params;
    if (!userId) {
      throw new Error("userId is not defined");
    }
    const participant = await Participant.findOne({
      where: {
        user_id: userId,
        challenge_id: challengeId,
      },
    });
    res.json({ isParticipant: !!participant });
  } catch (error) {
    console.error("Failed to check participant status:", error);
    res.status(500).json({ error: "Failed to check participant status" });
  }
});

// 참가자 진행률 조회
router.get("/progress/:participantId", async (req, res) => {
  try {
    const { participantId } = req.params;

    const participant = await Participant.findByPk(participantId, {
      include: [{ model: Challenge }],
    });

    if (!participant || !participant.Challenge) {
      return res.status(404).json({ error: "참가자 또는 챌린지를 찾을 수 없습니다." });
    }

    const challenge = participant.Challenge;
    const targetDays = challenge.target_days;
    const startDate = new Date(challenge.start_date);
    const endDate = new Date(challenge.end_date);

    const records = await ChallengeRecord.findAll({
      where: { participant_id: participantId, challenge_id: challenge.challenge_id },
    });

    const badges = await ChallengeBadge.findAll({
      where: { participant_id: participantId, challenge_id: challenge.challenge_id },
    });

    const weeks = [];
    let currentStartDate = startOfDay(startDate);
    let currentEndDate = endOfDay(addDays(startDate, 6));

    while (currentStartDate <= endDate) {
      const weekRecords = records.filter((r) => {
        const d = new Date(r.completion_date);
        return d >= currentStartDate && d <= currentEndDate;
      });

      const uniqueDays = new Set(
        weekRecords.map((r) => format(new Date(r.completion_date), "yyyy-MM-dd"))
      );

      const badgeEarned = badges.some(
        (b) => new Date(b.week_start).getTime() === currentStartDate.getTime()
      );

      weeks.push({
        week_start: format(currentStartDate, "yyyy-MM-dd"),
        week_end: format(currentEndDate, "yyyy-MM-dd"),
        completed_days: uniqueDays.size,
        target_days: targetDays,
        badge_earned: badgeEarned,
      });

      currentStartDate = addDays(currentStartDate, 7);
      currentEndDate = addDays(currentEndDate, 7);
    }

    res.json({
      participant_id: participant.participant_id,
      challenge_id: challenge.challenge_id,
      challenge_name: challenge.challenge_name,
      target_days: targetDays,
      total_weeks: weeks.length,
      completed_weeks: weeks.filter((w) => w.badge_earned).length,
      total_badges: badges.length,
      weeks,
    });
  } catch (error) {
    console.error("Failed to fetch participant progress:", error);
    res.status(500).json({ error: "Failed to fetch participant progress" });
  }
});

module.exports = router;
