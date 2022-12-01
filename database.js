// Imports of packages
const { Sequelize, DataTypes, Model, QueryTypes } = require('sequelize');
// Creation of link with db
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: "db.sqlite"
});

// Creation of tables
class User extends Model { }
User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    username: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    password: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    money: {
        type: DataTypes.INTEGER
    }
}, { sequelize, modelName: 'users' });

class Email extends Model { }
Email.init({
    email: {
        type: DataTypes.TEXT,
        primaryKey: true,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: User,
            key: 'id'
        }
    },
}, { sequelize, modelName: 'emails' });

class Article extends Model { }
Article.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    title: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false
    },
    rate: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, { sequelize, modelName: 'articles' });

class ArticleUser extends Model { }
ArticleUser.init({
    ArtId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Article,
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: User,
            key: 'id'
        }
    },
}, { sequelize, modelName: 'articleUsers' });

const DBOperations = {
    AddUser: async function (username, email, password) {
        let newUser = await User.create({
            username: username,
            password: password,
            money: 0
        });

        Email.create({
            email: email,
            userId: newUser.id
        });

        sequelize.sync();
        return newUser.id;
    },

    LoginUser: async function (email, password) {
        let userIDFromEmail = await sequelize.query("SELECT userId FROM emails WHERE email = ?", { replacements: [email], type: QueryTypes.SELECT });

        if (typeof userIDFromEmail !== 'undefined' && typeof userIDFromEmail[0] !== 'undefined' && typeof userIDFromEmail[0]['userId'] !== 'undefined') {
            let passwordOfID = await sequelize.query("SELECT password FROM users WHERE id = ?", { replacements: [userIDFromEmail[0]['userId']], type: QueryTypes.SELECT });

            if (typeof passwordOfID !== 'undefined' && typeof passwordOfID[0] !== 'undefined' && typeof passwordOfID[0]['password'] !== 'undefined') {
                if (passwordOfID[0]['password'] === password) {
                    return userIDFromEmail[0]['userId'];
                }
            }
        }
        return -1;
    },

    CheckUniqueIDs: async function (username, email) { //check unique email and pseudo
        const existingUsernames = await sequelize.query("SELECT COUNT(*) FROM users WHERE username = ?", { replacements: [username], type: QueryTypes.SELECT })
        const existingEmails = await sequelize.query("SELECT COUNT(*) FROM emails WHERE email = ?", { replacements: [email], type: QueryTypes.SELECT })

        let amountUsername = JSON.stringify(existingUsernames[0]).replace(/[^0-9]*/g, '');
        let amountEmail = JSON.stringify(existingEmails[0]).replace(/[^0-9]*/g, '');

        if (parseInt(amountUsername) === 0 && parseInt(amountEmail) === 0) {
            return true
        }
        return false;
    },

    //Getters
    GetUsernameByID: async function (id) {
        const usernameFromId = await sequelize.query("SELECT username FROM users WHERE id = ?", { replacements: [id], type: QueryTypes.SELECT });

        if (typeof usernameFromId !== 'undefined' && typeof usernameFromId[0] !== 'undefined' && typeof usernameFromId[0]['username'] !== 'undefined') {
            return usernameFromId[0]["username"];
        }
    },

    GetEmailByID: async function (id) {
        const emailFromId = await sequelize.query("SELECT email FROM emails WHERE userId = ?", { replacements: [id], type: QueryTypes.SELECT });

        if (typeof emailFromId !== 'undefined' && typeof emailFromId[0] !== 'undefined' && typeof emailFromId[0]['email'] !== 'undefined') {
            return emailFromId[0]["email"];
        }
    },

    GetMoneyByID: async function (id) {
        const moneyFromId = await sequelize.query("SELECT money FROM users WHERE id = ?", { replacements: [id], type: QueryTypes.SELECT });

        if (typeof moneyFromId !== 'undefined' && typeof moneyFromId[0] !== 'undefined' && typeof moneyFromId[0]['money'] !== 'undefined') {
            return moneyFromId[0]["money"];
        }
    },

    //SETTERS
    SetNewUsername: async function (userID, newUsername) {
        await User.update(
            { username: newUsername },
            { where: { id: userID } }
        );
    },

    SetNewMoney: async function (userID, newMoney) {
        await User.update(
            { money: newMoney },
            { where: { id: userID } }
        );
    },

    SetNewEmail: async function (userID, newEmail) {
        await Email.update(
            { email: newEmail },
            { where: { userId: userID } }
        );
    },

    SetNewPassword: async function (userID, newPassword) {
        await User.update(
            { password: newPassword },
            { where: { id: userID } }
        );
    },

    //Article related

    AddArticle: async function (userID, title, desc, price, image, stars, date) {
        let newArticle = await Article.create({
            title: title,
            description: desc,
            price: price,
            image: image,
            rate: stars,
            date: date
        });

        ArticleUser.create({
            ArtId: newArticle.id,
            userId: userID
        });

        sequelize.sync();
    },

    GetArticleInfoByID: async function (artID) {
        const article = await sequelize.query("SELECT title, description, price, image, rate, date FROM articles WHERE id = ?", { replacements: [artID], type: QueryTypes.SELECT });
        const sellerID = await sequelize.query("SELECT userId FROM articleUsers WHERE ArtId = ?", { replacements: [artID], type: QueryTypes.SELECT });

        return { title: article[0]["title"], desc: article[0]["description"], price: article[0]["price"], image: article[0]["image"].replace("private", ""), rate: article[0]["rate"], date: article[0]["date"], sellerID: sellerID[0]["userId"] };
    },

    GetAllArticleInfo: async function () {
        const articlesList = await Article.findAll();

        let allInfos = [];
        for (let article of articlesList) {
            artInfo = article.dataValues;

            let info = { id: artInfo.id, title: artInfo.title, desc: artInfo.description, price: artInfo.price, image: artInfo.image.replace("private", ""), rate: artInfo.rate, date: artInfo.date };
            allInfos.push(info);
        }

        return allInfos.reverse();
    },

    isArtIDAvailable: async function (artID) {
        const existingArticle = await sequelize.query("SELECT COUNT(*) FROM articles WHERE id = ?", { replacements: [artID], type: QueryTypes.SELECT })

        let amountArticle = JSON.stringify(existingArticle[0]).replace(/[^0-9]*/g, '');

        return amountArticle > 0 ? true : false;
    }
}

module.exports = DBOperations;

sequelize.sync();