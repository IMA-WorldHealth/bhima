/* global element, by */

module.exports = {
  selector : '[bh-data-collector]',
  set      : async function set(dataCollector) {
    // get the dropdown
    const dropdown = element(by.css('[uib-dropdown-toggle]'));
    await dropdown.click();

    // click the correct dropdown item
    const option = element(by.linkText(dataCollector));
    await option.click();
  },
};
