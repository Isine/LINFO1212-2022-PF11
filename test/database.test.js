const DBOperations = require('../database');

let __DEV__ = { id: 5, username:"", email: "",  artID: 5 };

beforeAll(async () => {
    const infos = await DBOperations.AddUser("TestUsername", "test@test.com", "test");
    __DEV__ = { id: infos, username: "TestUsername", email: "test@test.com" };

    const artInfos = await DBOperations.AddArticle(infos, "articleTitle", "artDescription", 20, "private\test.jpg", 3);
    __DEV__.artID = artInfos;
})
  

describe("LoginUser", () => {
    test("Login with correct info", async () => {
        const loginID =  await DBOperations.LoginUser("test@test.com", "test");
        expect(loginID).toBe(__DEV__.id);
    })

    test("Login with incorrect info", async () => {
        const loginID =  await DBOperations.LoginUser("imsurethisemailwillneverbeused@nevernver.never", "randompassword");
        expect(loginID).toBe(-1);
    })
});

describe("CheckUniqueID", () => {
    test("Unique username AND email", async () => {
        const result = await DBOperations.CheckUniqueIDs("uniqueusernameihope","imreallysurethisemailadresswillneverbeused@never.never");
        expect(result).toBeTruthy();
    })

    test("Unique NOT username AND NOT email", async () => {
        const result = await DBOperations.CheckUniqueIDs("TestUsername","test@test.com");
        expect(result).toBeFalsy();
    })
});

describe("Getter and Setter of username", () => {
    test("Change and get new username", async () => {
        await DBOperations.SetNewUsername(__DEV__.id, "newTestUsername");
        const resultUsername = await DBOperations.GetUsernameByID(__DEV__.id);
        __DEV__.username = "newTestUsername";
        expect(resultUsername).toMatch("newTestUsername");
    })

    test("Change and get new email", async () => {
        await DBOperations.SetNewEmail(__DEV__.id, "newTest@test.com");
        const resultEmail = await DBOperations.GetEmailByID(__DEV__.id);
        __DEV__.email = "newTest@test.com";
        expect(resultEmail).toMatch("newTest@test.com");
    })

    test("Change and get new money", async () => {
        await DBOperations.SetNewMoney(__DEV__.id, "100");
        const resultMoney = await DBOperations.GetMoneyByID(__DEV__.id);
        expect(resultMoney).toBe(100);
    })

    test("Change and get new nightMode", async () => {
        await DBOperations.SetNewNightMode(__DEV__.id, 1);
        const resultNightMode = await DBOperations.GetNightModeByID(__DEV__.id);
        expect(resultNightMode).toBeTruthy();
    })

    test("Change and get new PrivateEmail", async () => {
        await DBOperations.SetNewPrivateEmail(__DEV__.id, 0);
        const resultPrivateEmail = await DBOperations.GetPrivateEmailByID(__DEV__.id);
        expect(resultPrivateEmail).toBeFalsy();
    })

    test("Change and get new HorizontalView", async () => {
        await DBOperations.SetNewHorizontalView(__DEV__.id, 0);
        const resultHorizontalView = await DBOperations.GetHorizontalViewByID(__DEV__.id);
        expect(resultHorizontalView).toBeFalsy();
    })
});

describe("GetArticleInfoByID", () => {
    test("Get article info", async () => {
        const infos = await DBOperations.GetArticleInfoByID(__DEV__.artID);
        const infosExpected = { title: "articleTitle", desc: "artDescription", price: 20, image: "\test.jpg", rate: 3, selled: 0, sellerID: __DEV__.id };
    
        expect(infos).toEqual(infosExpected);
    })

    test("Get article info if it is selled", async () => {
        await DBOperations.SetArticleSelled(__DEV__.artID, 1)
        const infos = await DBOperations.GetArticleInfoByID(__DEV__.artID);
        const infosExpected = { title: "articleTitle", desc: "artDescription", price: 20, image: "\test.jpg", rate: 3, selled: 1, sellerID: __DEV__.id };
    
        expect(infos).toEqual(infosExpected);
    })
});

describe("isArtIDAvailable", () => {
    test("Check if articleID 1 exists (it should exists as we at least add one article) (! can fail if id 1 is deleted)", async () => {
        const isAvailable = await DBOperations.isArtIDAvailable(__DEV__.artID);
        expect(isAvailable).toBeTruthy();
    })

    test("Check if articleID -1 exists (it should not exists as ids have positive values)", async () => {
        const isAvailable = await DBOperations.isArtIDAvailable(-1);
        expect(isAvailable).toBeFalsy();
    })
})

describe("GetArticleFromSearchBar", () => {
    test("Look for an unexisting item", async () => {
        const infos = await DBOperations.GetArticleFromSearchBar("imsurethisarticlewillneverbeinsalesoimusingthisnametotestit");
        const infosExpected = [];
    
        expect(infos).toEqual(infosExpected);
    })

    test("Look for a selled item", async () => {
        await DBOperations.SetArticleSelled(__DEV__.artID, 1)
        const infos = await DBOperations.GetArticleFromSearchBar("articleTitle");
        const infosExpected = [];
    
        expect(infos).toEqual(infosExpected);
    })
})

describe("GetSellerByArtID", () => {
    test("Get seller email", async () => {
        await DBOperations.SetNewPrivateEmail(__DEV__.id, 0);
        const sellerEmail = await DBOperations.GetSellerByArtID(__DEV__.artID);

        expect(sellerEmail).toMatch(__DEV__.email);
    })
    
    test("Get seller username", async () => {
        await DBOperations.SetNewPrivateEmail(__DEV__.id, 1);
        const sellerUsername = await DBOperations.GetSellerByArtID(__DEV__.artID);

        expect(sellerUsername).toMatch(__DEV__.username);
    })
})

describe("SetArticleBuyer and GetBoughtArticleOf", () => {
    test("Set article buyer and GetBoughtArticleOf", async () => {
        await DBOperations.SetArticleBuyer(__DEV__.artID, __DEV__.id);
        const articles = await DBOperations.GetBoughtArticleOf(__DEV__.id);

        expect(articles).toEqual([{"id": __DEV__.artID}]);
    })
})


afterAll(async () => {
    await DBOperations.Delete(__DEV__.id,__DEV__.artID);
})

