// Import of packages
const express = require('express');
const session = require('express-session');
const bodyParser = require("body-parser");
const DBop = require('./database');
const https = require('https');
const fs = require('fs');
const multer = require('multer'); // use for image
const path = require('path'); // use for image

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'private');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: "syllaexchange",
    resave: false,
    saveUninitialized: true,
    cookie: {
        path: '/',
        httpOnly: true,
        maxAge: 3600000
    }
}));

// Multer parameters
// based on https://www.npmjs.com/package/multer and https://www.bezkoder.com/node-js-upload-image-mysql/

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'private/images/articles')
    },
    filename: (req, file, cb) => {
        cb(null,  Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: '1000000' }, // max 1MB
    fileFilter: (req, file, cb) => {
        const fileType = /jpeg|jpg|png/ //allowed image format
        const mimeType = fileType.test(file.mimetype)
        const extname = fileType.test(path.extname(file.originalname))

        if(mimeType && extname) {
            return cb(null, true)
        }
        cb('Check your image format')
    }
});

// APP GET

app.get('/', async function (req, res, next) {
    let name = "Connexion"
    
    if (req.session.userID) name = await DBop.GetUsernameByID(req.session.userID); // On modifie name uniquement si le user est connecter

    const articleList = await DBop.GetAllArticleInfo();

    console.log(articleList);
    res.render('index.ejs', { user: name, articleList: articleList });
    
});

app.get('/login',function(req, res, next){
    if(req.session.userID) { //login page available only when logout
        res.redirect('/profil');
    } else {
        res.render('login.ejs');
    }
});

app.get('/profil', async function(req, res, next){
    if(!req.session.userID) { //profil page available only when connected
        res.redirect('/');
    } else {
        let name = await DBop.GetUsernameByID(req.session.userID);
        let money = await DBop.GetMoneyByID(req.session.userID);
        let email = await DBop.GetEmailByID(req.session.userID);

        res.render('profil.ejs', { user: name, money: money, email: email });
    }
});

app.get('/sell', async function(req, res, next){
    let name = "Connexion"
    
    if (req.session.userID) name = await DBop.GetUsernameByID(req.session.userID);

    res.render('sell.ejs', { user: name });
});

// APP POST

app.post("/login", async function (req, res) {
    if(req.body.btn === "login") { //Login request
        if (req.body.email === null || req.body.password === null) {
            return;
        }

        let userID = await DBop.LoginUser(req.body.email, req.body.password);
        if (userID === -1) {
            console.log("error"); // inform user of this error !
        } else {
            req.session.userID = userID;
        }
        
    } else { // Register request
        if (req.body.username === null || req.body.email === null || req.body.password === null || req.body.password_confirm === null) {
            return;
        }

        if(req.body.password !== req.body.password_confirm){
            return; //inform user both password should be equal !
        }

        DBop.CheckUniqueIDs(req.body.username, req.body.email).then(async unique => {
            if(unique){
                await DBop.AddUser(req.body.username, req.body.email, req.body.password).then(userID => {
                    req.session.userID = userID; // User added to db, and connected
                });
            } else {
                console.log("email already used"); // inform user of this error !
            }
        });
    }
    res.redirect('/');
});

app.post("/profil", async function (req, res){
    if(!req.session.userID) {
        res.redirect('/login');
        return;
    }

    if(req.body.logout === "logout"){ //logout button
        req.session.destroy();
        res.redirect('/login');
    } 

    switch(req.body.modify){ //modify profil
        case 'username':
            if(req.body.new_username !== null) DBop.SetNewUsername(req.session.userID, req.body.new_username);

            res.redirect("/profil");
            break;

        case 'email':
            if(req.body.new_email !== null) DBop.SetNewEmail(req.session.userID, req.body.new_email);
            
            res.redirect("/profil");
            break;

        case 'password':
            if(req.body.new_password !== null) DBop.SetNewPassword(req.session.userID, req.body.new_password);
            
            res.redirect("/profil");
            break;

        case 'money':
            if(req.body.new_money !== null)  DBop.SetNewMoney(req.session.userID, req.body.new_money);
           
            res.redirect("/profil");
            break;
    }

});


app.post('/sell', upload.single('image'), async function(req, res){
    if(!req.session.userID){
        res.redirect('/login');
    } else {
        let date = new Date();

        await DBop.AddArticle(req.session.userID, req.body.title, req.body.description, req.body.price, req.file.path, req.body.stars, `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`);
        res.redirect('/');
    }
});

// OTHER

app.use(express.static('private'));

https.createServer({
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem'),
    passphrase: 'ingi'
}, app).listen(8080);