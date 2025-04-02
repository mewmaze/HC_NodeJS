const { Model, DataTypes, Sequelize } = require("sequelize");

class User extends Model {
  static initiate(sequelize) {
    return User.init(
      {
        user_id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        }, //기본키로 설정
        username: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        nickname: {
          type: DataTypes.STRING(50),
          allowNull: true,
          defaultValue: "",
        },
        email: {
          type: DataTypes.STRING(100),
          unique: true,
          allowNull: false,
        },
        password_hash: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        gender: {
          type: DataTypes.ENUM("남성", "여성"),
          allowNull: true,
          defaultValue: "남성",
        },
        height: {
          type: DataTypes.FLOAT,
          allowNull: false,
        },
        weight: {
          type: DataTypes.FLOAT,
          allowNull: false,
        },
        bmi: {
          type: DataTypes.FLOAT,
          allowNull: true,
        },
        age: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        profile_picture: {
          type: DataTypes.STRING(255), // 수정: 문자열 타입으로 변경
          allowNull: true,
          defaultValue: "",
        }, // 필요에 따라 allowNull 설정 변경
        goal_height: {
          // 예네 cmd에서 null로 뜸
          type: DataTypes.FLOAT,
          allowNull: true,
        },
        goal_weight: {
          // 예네 cmd에서 null로 뜸
          type: DataTypes.FLOAT,
          allowNull: true,
        },
        goal_bmi: {
          // 예네 cmd에서 null로 뜸
          type: DataTypes.FLOAT,
          allowNull: true,
        },
        interests: {
          type: DataTypes.ENUM("런닝", "헬스", "자전거", "다이어트"),
          allowNull: false,
          defaultValue: "런닝",
        },
        current_challenge_id: {
          // 예도 cmd에서 null로 뜸
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: Sequelize.fn("now"),
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: "User",
        freezeTableName: true,
        tableName: "user",
        paranoid: false,
        timestamps: false,
      }
    );
  }
  static associate(db) {
    // User.hasMany(db.Order, {foreignKey:"bookid"}) // 설정 필요
    User.hasMany(db.Challenge, { foreignKey: "user_id" });
    this.hasMany(db.Post, { foreignKey: "user_id", as: "posts" });
  }
}
module.exports = User;
