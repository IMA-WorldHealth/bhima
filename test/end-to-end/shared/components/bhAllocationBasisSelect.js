const TU = require('../TestUtils');
const { by } = require('../TestUtils');

module.exports = {
  set : async function set(model, basis) {

    const target = await TU.locator(by.model(model));

    // @TODO: Fix! The following does not open the dropdown
    await target.click();

    return target.selectOption({ label : basis });
  },
};
