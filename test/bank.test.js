const bank = require('../private/bank');

describe("Deposit", () => {
    test("Deposit a positive amount", () => {
        let result = bank.deposit(100, 50);
        expect(result).toBe(150);
    })

    test("Deposit a negative amount", () => {
        expect(() => bank.deposit(100, -50)).toThrow('Cash cannot be negative')
    })
});

describe("Withdraw", () => {
    test("Withdraw a positive amount with enough money", () => {
        let result = bank.withdraw(100, 50);
        expect(result).toBe(50);
    })

    test("Withdraw a negative amount with enough money", () => {
        expect(() => bank.withdraw(100, -50)).toThrow('Cash cannot be negative')
    })

    test("Withdraw a positive amount without enough money", () => {
        expect(() => bank.withdraw(10, 50)).toThrow('Not enough money')
    })

    test("Withdraw a negative amount without enough money", () => {
        expect(() => bank.withdraw(10, -50)).toThrow('Cash cannot be negative')
    })
});

