const {Model, DataTypes, Sequelize} = require("sequelize");

class Comment extends Model {
    static initiate(sequelize) {
        return Comment.init({
            comment_id:{
                type:DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            post_id:{
                type:DataTypes.INTEGER,
                allowNull:false},
            user_id:{
                type:DataTypes.INTEGER, 
                allowNull:false},
            content:{
                type:DataTypes.TEXT, 
                allowNull:false},
            created_at:{
                type:DataTypes.DATE,
                defaultValue:Sequelize.fn('now'),
                allowNull:false},
        },{sequelize, modelName:"Comment", tableName:"comment", paranoid:false, timestamps:false, charset:"utf8mb4", collate:"utf8mb4_general_ci",})
    }
    static associate(models){
        this.belongsTo(models.User, {foreignKey:"user_id"});
        this.belongsTo(models.Post, {foreignKey:"post_id"});
    }
}
module.exports = Comment;