const {Model, DataTypes, Sequelize} = require("sequelize");

class Post extends Model {
    static initiate(sequelize) {
        return Post.init({
            post_id:{
                type:DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            user_id:{
                type:DataTypes.INTEGER,
                allowNull:false},
            title:{
                type:DataTypes.STRING(255), 
                allowNull:false},
            content:{
                type:DataTypes.TEXT, 
                allowNull:false},
            created_at:{
                type:DataTypes.DATE,
                defaultValue:Sequelize.fn('now'),
                allowNull:false},
        },{sequelize, modelName:"Post", tableName:"post", paranoid:false, timestamps:false, charset:"utf8mb4", collate:"utf8mb4_general_ci",})
    }
    static associate(models){
        this.belongsTo(models.User, {foreignKey:"user_id"});
    }
}
module.exports = Post;