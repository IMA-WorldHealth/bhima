/* global browser, element, by */

const FU = require('../FormUtils');

module.exports = {
    set : function set(id) {
        var prefix = 'entry-exit-type-';
        const locator = by.id(prefix.concat(id));
        const target = element(locator);

        target.click();
    }
};