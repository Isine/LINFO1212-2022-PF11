const utility = {
    // see https://stackoverflow.com/a/9728530
    compareDictionaries: function (d1, d2) {
        // quick check for the same object
        if (d1 == d2)
            return true;

        // check for null
        if (d1 == null || d2 == null)
            return false;

        // go through the keys in d1 and check if they're in d2 - also keep a count
        var count = 0;
        for (var key in d1) {
            // check if the key exists
            if (!(key in d2))
                return false;

            // check that the values are the same
            if (d1[key] != d2[key])
                return false;

            count++;
        }

        // now just make sure d2 has the same number of keys
        var count2 = 0;
        for (key in d2)
            count2++;

        // return if they're the same size
        return (count == count2);
    },

    checkIfSelled: function (dict) {
        if (dict == null) return true
        return !dict["selled"] == 0
    }
}

module.exports = utility