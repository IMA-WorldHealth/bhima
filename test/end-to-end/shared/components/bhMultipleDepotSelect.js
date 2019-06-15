/* global element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-multiple-depot-select]',
  set      : async function set(depots, uuid) {
    const locator = (uuid) ? by.id(uuid) : by.css(this.selector);
    const target = element(locator);

    await target.click();

    return Promise.all(
      depots.map(uid => FU.uiSelect('$ctrl.depotsUuids', uid))
    );
  },
};
