/* global element, by */

module.exports = {
  set : async function set(id) {
    const prefix = 'entry-exit-type-';
    const locator = by.id(prefix.concat(id));
    const target = element(locator);

    await target.click();
  },
};
