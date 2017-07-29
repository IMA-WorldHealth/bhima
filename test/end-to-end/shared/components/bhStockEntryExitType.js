/* global browser, element, by */

const FU = require('../FormUtils');

module.exports = {
    set : function set(id) {
        const locator = by.id(id);
        const target = element(locator);

        target.click();
    }
};