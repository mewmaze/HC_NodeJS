const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];
const User = require("./user");
const Profile = require("./profile");
const Challenge = require("./challenge");
const Participant = require("./participant");
const ChallengeRecord = require("./challengeRecord");
const Post = require("./post");
const Comment = require("./comment");

let sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    ...config,
    timezone: "+00:00", // UTC 시간대 설정
  }
);

const db = {};
db.sequelize = sequelize;

db.User = User;
db.Profile = Profile;
db.Challenge = Challenge;
db.Participant = Participant;
db.ChallengeRecord = ChallengeRecord;
db.Post = Post;
db.Comment = Comment;

User.initiate(sequelize);
Challenge.init(sequelize);
Participant.init(sequelize);
Profile.init(sequelize);
Post.initiate(sequelize);
Comment.initiate(sequelize);
ChallengeRecord.init(sequelize);

User.associate(db);
Challenge.associate?.(db);
Participant.associate(db);
Profile.associate(db);
Post.associate(db);
Comment.associate(db);
ChallengeRecord.associate(db);

module.exports = db;
