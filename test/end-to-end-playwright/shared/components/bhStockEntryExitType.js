const TU = require('../TestUtils');
const { by } = require('../TestUtils');

module.exports = {
  set : async function set(id) {
    // ??? const prefix = 'entry-exit-type-';
    // const locator = by.id(prefix.concat(id));
    const locator = by.id(`entry-exit-type-${id}`);
    const target = await TU.locator(locator);

    await target.click();
  },
};
