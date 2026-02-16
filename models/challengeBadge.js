const { Model, DataTypes } = require("sequelize");

class ChallengeBadge extends Model {
  static init(sequelize) {
    return super.init(
      {
        badge_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        participant_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "participant",
            key: "participant_id",
          },
        },
        challenge_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "challenge",
            key: "challenge_id",
          },
        },
        week_start: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        week_end: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        awarded_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        modelName: "ChallengeBadge",
        tableName: "challengeBadge",
        paranoid: false,
        timestamps: false,
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
      }
    );
  }
  static associate(models) {
    this.belongsTo(models.Participant, { foreignKey: "participant_id" });
    this.belongsTo(models.Challenge, { foreignKey: "challenge_id" });
  }
}
module.exports = ChallengeBadge;
