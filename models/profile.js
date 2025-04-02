const { Model, DataTypes } = require("sequelize");

class Profile extends Model {
  static init(sequelize) {
    return super.init(
      {
        // id가 저절로 맨 위에 만들어짐
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "user", // User 테이블을 참조
            key: "user_id",
          },
          onDelete: "CASCADE", // 사용자가 삭제될 때 프로필도 삭제되도록 설정
          onUpdate: "CASCADE",
        },
        intro: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        achievement_count: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        modelName: "Profile",
        tableName: "profile",
        paranoid: false,
        timestamps: false,
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
      }
    );
  }
  static associate(models) {
    this.belongsTo(models.User, { foreignKey: "user_id" });
  }
}
module.exports = Profile;
