const TU = require('../TestUtils');
const { by } = require('../TestUtils');

// const selector = '[bh-add-item]';

module.exports = {

  set      : async function set(increment, anchor) {
    // get the input and enter the increment provided
    await TU.input('$ctrl.itemIncrement', increment, anchor);

    const btn = anchor
      ? await anchor.locator(by.id('btn-add-rows'))
      : await TU.locator(by.id('btn-add-rows'));

    // submit the value
    return btn.click();
  },
};
