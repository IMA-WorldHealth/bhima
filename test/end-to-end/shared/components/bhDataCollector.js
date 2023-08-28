const TU = require('../TestUtils');
const { by } = require('../TestUtils');

module.exports = {

  set      : async function set(dataCollector) {

    // Open the drop-down menu
    await TU.locator('bh-data-collector [uib-dropdown-toggle]').click();

    // click the correct dropdown item
    const option = await TU.locator(by.linkContainsText(dataCollector));
    await option.click();
  },
};
