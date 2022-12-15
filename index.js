// Import of packages
const express = require('express');
const session = require('express-session');
const bodyParser = require("body-parser");
const DBop = require('./database');
const https = require('https');
const fs = require('fs');
const multer = require('multer'); // use for image
const path = require('path'); // use for image

const bank = require('./private/bank')
const utility = require('./private/utility')

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
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: '1000000' }, // max 1MB
    fileFilter: (req, file, cb) => {
        const fileType = /jpeg|jpg|png/ //image format allowed
        const mimeType = fileType.test(file.mimetype)
        const extname = fileType.test(path.extname(file.originalname))

        if (mimeType && extname) {
            return cb(null, true)
        }
        cb('Check your image format')
    }
});

// APP GET

app.get('/', async function (req, res, next) {
    let name = "Connexion"
    let viewPref = false;
    if (req.session.userID) {
        name = await DBop.GetUsernameByID(req.session.userID); // On modifie name uniquement si le user est connecter
        viewPref = await DBop.GetHorizontalViewByID(req.session.userID);
    }

    if (req.query.btn_search === "searching") { // Using search bar
        let research = '%' + req.query.looking_for + '%';
        const researchedInfo = await DBop.GetArticleFromSearchBar(research);

        res.render('index.ejs', { user: name, articleList: researchedInfo, viewPref: viewPref });

    } else {
        switch (req.query.tri) { // Sort Mode
            case "name":
                res.render('index.ejs', { user: name, articleList: await DBop.GetArticlesByName(), viewPref: viewPref });
                break;

            case "price":
                res.render('index.ejs', { user: name, articleList: await DBop.GetArticleByPrice(), viewPref: viewPref });
                break;

            default:
                res.render('index.ejs', { user: name, articleList: await DBop.GetAllArticleInfo(), viewPref: viewPref });
                break;
        }
    }
});

app.get('/login', function (req, res, next) {
    if (req.session.userID) { //login page available only when logout
        res.redirect('/profil');
    } else {
        res.render('login.ejs', { error: "" });
    }
});

app.get('/profil', async function (req, res, next) {
    if (!req.session.userID) { //profil page available only when connected
        res.redirect('/');
    } else {
        let name = await DBop.GetUsernameByID(req.session.userID);
        let money = await DBop.GetMoneyByID(req.session.userID);
        let email = await DBop.GetEmailByID(req.session.userID);
        let nightMode = await DBop.GetNightModeByID(req.session.userID);
        let privateEmail = await DBop.GetPrivateEmailByID(req.session.userID);
        let horizontalView = await DBop.GetHorizontalViewByID(req.session.userID);

        let purchases =  await DBop.GetBoughtArticleOf(req.session.userID);

        res.render('profil.ejs', { user: name, money: money, email: email, nightMode: nightMode, privateEmail: privateEmail, horizontalView: horizontalView, purchases: purchases.reverse() });
    }
});

app.get('/sell', async function (req, res, next) {
    if (!req.session.userID) {
        req.session.from = "sell"
        res.redirect('/login');
        return
    }

    const name = await DBop.GetUsernameByID(req.session.userID);

    res.render('sell.ejs', { user: name });
});

app.get('/buy', async function (req, res, next) {
    let name = "Connexion"

    if (req.session.userID) name = await DBop.GetUsernameByID(req.session.userID);

    const artId = req.query.artID

    if (!artId) { // page available only if artID is passed in the url
        res.redirect("/");
        return;
    }

    await DBop.isArtIDAvailable(artId).then(async available => { // Display only if artID exists
        if (available) {
            await DBop.GetArticleInfoByID(artId).then(async artInfo => {
                if (artInfo.selled === 0) {
                    sellerID = artInfo.sellerID
                    await DBop.GetUsernameByID(sellerID).then(sellerName => {
                        res.render('buy.ejs', { user: name, title: artInfo["title"], image: artInfo["image"], desc: artInfo["desc"], seller: sellerName, sellerid: sellerID, rate: artInfo["rate"], price: artInfo["price"], id: artId });
                    });
                } else {
                    res.redirect('/');
                }
            });
        } else {
            res.redirect("/");
        }
    });
});

app.get('/basket', async function (req, res, next) {
    let name = "Connexion"
    let money = "Please connect first"
    const error = req.query.error
    let message = ""
    if (error !== undefined) message = "Not enough money"
    if (req.session.userID) {
        name = await DBop.GetUsernameByID(req.session.userID);
        money = await DBop.GetMoneyByID(req.session.userID);
    }
    if (req.session.basketList == undefined) req.session.basketList = []

    let totalPrice = 0

    req.session.basketList.forEach(element => {
        totalPrice += element.price
    });

    res.render('basket.ejs', { user: name, articleList: req.session.basketList, totalPrice: totalPrice, money: money, message: message });
});

// APP POST

app.post("/login", async function (req, res) {
    if (req.body.btn === "login") { //Login request
        if (req.body.email === null || req.body.password === null) {
            return;
        }

        let userID = await DBop.LoginUser(req.body.email, req.body.password);
        if (userID === -1) {
            res.render('login.ejs', { error: "Email and password don't match !" });
            return;
        }
        req.session.userID = userID;


    } else { // Register request
        if (req.body.username === null || req.body.email === null || req.body.password === null || req.body.password_confirm === null) {
            return;
        }

        if (req.body.password !== req.body.password_confirm) {
            res.render('login.ejs', { error: "Both passwords should be equal !" });
            return;
        }

        let unique = await DBop.CheckUniqueIDs(req.body.username, req.body.email)
        if (!unique) {
            res.render('login.ejs', { error: "Email already used !" });
            return;
        }

        // Il nous faut une variable ici afin que la req.session.userID soit bien enregistee
        const output = await DBop.AddUser(req.body.username, req.body.email, req.body.password).then(userID => {
            req.session.userID = userID; // User added to db, and connected
            return
        });
    }
    // Redirection si necessaire
    let from = req.session.from
    if (from === undefined) from = "";
    res.redirect("/" + from);
});

app.post("/profil", async function (req, res) {
    if (!req.session.userID) {
        req.session.from = "profil"
        res.redirect('/login');
        return;
    }

    if (req.body.logout === "logout") { //logout button
        req.session.destroy();
        res.redirect('/login');
    }

    switch (req.body.modify) { //modify profil
        case 'username':
            if (req.body.new_username !== null) DBop.SetNewUsername(req.session.userID, req.body.new_username);

            res.redirect("/profil");
            break;

        case 'email':
            if (req.body.new_email !== null) DBop.SetNewEmail(req.session.userID, req.body.new_email);

            res.redirect("/profil");
            break;

        case 'password':
            if (req.body.new_password !== null) DBop.SetNewPassword(req.session.userID, req.body.new_password);

            res.redirect("/profil");
            break;

        case 'money':
            if (req.body.new_money !== null) DBop.SetNewMoney(req.session.userID, req.body.new_money);

            res.redirect("/profil");
            break;

        case 'nightMode':
            if (req.body.night_mode !== null) {
                if (req.body.night_mode) {
                    DBop.SetNewNightMode(req.session.userID, 1);
                } else {
                    DBop.SetNewNightMode(req.session.userID, 0);
                }
            }

            res.redirect("/profil");
            break;

        case 'privateEmail':
            if (req.body.privateEmail !== null) {
                if (req.body.privateEmail) {
                    DBop.SetNewPrivateEmail(req.session.userID, 1);
                } else {
                    DBop.SetNewPrivateEmail(req.session.userID, 0);
                }
            }

            res.redirect("/profil");
            break;

        case 'horizontalView':
            if (req.body.horizontalView !== null) {
                if (req.body.horizontalView) {
                    DBop.SetNewHorizontalView(req.session.userID, 1);
                } else {
                    DBop.SetNewHorizontalView(req.session.userID, 0);
                }
            }

            res.redirect("/profil");
            break;
    }

});


app.post('/sell', upload.single('image'), async function (req, res) {
    if (!req.session.userID) {
        req.session.from = "sell"
        res.redirect('/login');
    } else {
        await DBop.AddArticle(req.session.userID, req.body.title, req.body.description, req.body.price, req.file.path, req.body.stars);
        res.redirect('/');
    }
});


app.post('/buy', async function (req, res) {
    const artID = req.body.id
    artInfo = await DBop.GetArticleInfoByID(artID)
    artInfo["id"] = artID
    artInfo["seller"] = await DBop.GetSellerByArtID(artID);

    if (req.session.basketList == undefined) req.session.basketList = []

    let notInBasket = true
    req.session.basketList.forEach(element => {
        if (utility.compareDictionaries(element, artInfo) || artInfo["selled"] != 0) {
            notInBasket = false
            return
        }
    });
    if (notInBasket) req.session.basketList.push(artInfo)

    return res.redirect("/")
});


app.post('/removeFromBasket', async function (req, res) {
    const artID = req.body.artID
    artInfo = await DBop.GetArticleInfoByID(artID)

    let itemIndex
    req.session.basketList.forEach((element, index, arr) => {
        if (element.id == artID) {
            itemIndex = index
            return
        }
    });

    if (itemIndex != undefined) req.session.basketList.splice(itemIndex, 1)

    res.redirect("/basket")
});


app.post('/acheter', async function (req, res) {
    if (!req.session.userID) {
        req.session.from = "basket"
        return res.redirect('/login');
    }

    if (parseFloat(req.body.money) < parseFloat(req.body.price)) return res.redirect("/basket?error=1")

    req.session.basketList.forEach(async element => {
        const price = element.price

        await DBop.GetMoneyByID(req.session.userID).then(async amount => { // First withdraw money from buyer
            const newBuyerMoney = bank.withdraw(amount, price);
            await DBop.SetNewMoney(req.session.userID, newBuyerMoney)
        })

        await DBop.GetMoneyByID(element.sellerID).then(async amount => { // Then deposit money on seller account
            const newSellerMoney = bank.deposit(amount, price)
            await DBop.SetNewMoney(element.sellerID, newSellerMoney)
        })

        DBop.SetArticleSelled(element.id, true)
        DBop.SetArticleBuyer(element.id, req.session.userID)
    });

    req.session.basketList = []

    res.redirect("/")
});
// OTHER

app.use(express.static('private'));

https.createServer({
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem'),
    passphrase: 'ingi'
}, app).listen(8080);