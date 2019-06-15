/* global element, by */

module.exports = {
  selector : '[bh-ipr-scale]',
  set      : async function set(scale) {

    // get the dropdown
    const dropdown = element(by.css('[uib-dropdown-toggle]'));
    await dropdown.click();

    // click the correct dropdown item
    const option = element(by.linkText(scale));
    await option.click();
  },
};
