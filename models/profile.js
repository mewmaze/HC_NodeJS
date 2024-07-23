const {Model, DataTypes} = require("sequelize");

class Profile extends Model {
    static init(sequelize) {
        return super.init({ // id가 저절로 맨 위에 만들어짐
            intro:{
                type:DataTypes.TEXT, 
                allowNull:true},
            achievement_count:{
                type:DataTypes.INTEGER, 
                allowNull:true, 
                defaultValue: 0},
        },{sequelize, modelName:"Profile", tableName:"profile", paranoid:false, timestamps:false})
    }
    static associate(models){
        this.belongsTo(models.User, {foreignKey:"user_id"});
    }
}
module.exports = Profile;