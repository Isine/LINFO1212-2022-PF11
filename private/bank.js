const bank = {
    deposit: function (current, cash) {
        if (cash < 0) throw Error('Cash cannot be negative')

        return current += cash
    },

    withdraw: function (current, cash) {
        if (cash < 0) throw Error('Cash cannot be negative')
        if (current < cash) throw Error('Not enough money')

        return current -= cash
    }
}

module.exports = bank