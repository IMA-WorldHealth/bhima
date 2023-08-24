const TU = require('../TestUtils');
const { by } = require('../TestUtils');

// const selector = '[bh-ipr-scale]';

module.exports = {

  exists : async function exists(scale) {
    // get the dropdown
    const dropdown = await TU.locator(by.id('ipr_scale'));
    await dropdown.click();

    // See if the desired scale is present
    const count = await TU.getByRole('link', scale).count();
    return count > 0;
  },

  set  : async function set(scale) {
    // get the dropdown
    const dropdown = await TU.locator(by.id('ipr_scale'));
    await dropdown.click();

    // click the correct dropdown item
    const option = TU.getByRole('link', scale);
    await option.click();
  },
};
