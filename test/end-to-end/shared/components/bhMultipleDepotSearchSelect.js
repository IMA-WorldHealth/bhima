/* global by */

module.exports = {
  selector : '[bh-multiple-depot-seach-select]',
  set      : async function set(depot, id) {

    const root = $(this.selector);
    const input = root.element(by.id(id));
    input.clear();
    input.sendKeys(depot);
    const option = root.element(by.css(`[title="${depot}"]`));
    await option.click();
  },
};
