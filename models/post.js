const { Model, DataTypes, Sequelize } = require("sequelize");

class Post extends Model {
    static initiate(sequelize) {
        return Post.init({
            post_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            title: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: Sequelize.fn('now'),
                allowNull: false
            },
            community_id: {
                type: DataTypes.INTEGER,
                allowNull: true
            }
        }, {
            sequelize,
            modelName: "Post",
            tableName: "post",
            paranoid: false,
            timestamps: false
        });
    }

    static associate(models) {
        this.belongsTo(models.User, { foreignKey: "user_id" });
    }
}

module.exports = Post;
