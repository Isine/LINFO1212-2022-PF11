const DBOperations = require('../database');

let __DEV__ = { id: 5 };

beforeAll(async () => {
    const infos = await DBOperations.AddUser("TestUsername", "test@test.com", "test");
    __DEV__ = { id: infos, username: "TestUsername", email: "test@test.com", password: "test" };
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



afterAll(async () => {
    await DBOperations.DeleteUserByID(__DEV__.id, __DEV__.email);
})

