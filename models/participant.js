const { Model, DataTypes } = require("sequelize");

class Participant extends Model {
  static init(sequelize) {
    return super.init(
      {
        participant_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        challenge_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "challenge", // 참조할 모델 이름 (Challenge 테이블)
            key: "challenge_id", // 참조할 모델의 기본 키 (challenge_id)
          },
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "user",
            key: "user_id",
          },
        },
        progress: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        start_date: {
          type: DataTypes.DATEONLY,
          allowNull: true,
        },
        end_date: {
          type: DataTypes.DATEONLY,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "Participant",
        tableName: "participant",
        paranoid: false,
        timestamps: false,
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
      }
    );
  }
  static associate(models) {
    this.belongsTo(models.Challenge, { foreignKey: "challenge_id" });
    this.belongsTo(models.User, { foreignKey: "user_id" });
  }
}
module.exports = Participant;
