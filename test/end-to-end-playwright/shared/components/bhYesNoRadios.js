const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const selector = '[data-bh-yes-no-radios]';

module.exports = {

  set : async function set(value, id) {

    // get the root value of the field
    const root = await TU.locator(id ? by.id(id) : selector);

    // get the appropriate option by the locator
    const option = await root.locator(`[data-choice="${value}"]`);

    // click it!
    return option.click();
  },
};
