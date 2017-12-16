/* global by, element */
const FU = require('../shared/FormUtils');

/**
 * @function selectDropdownAction
 *
 * @description
 * This function selects an option from the menu at the top of the stock modules.
 */
function selectDropdownAction(action) {
  // open the dropdown menu
  $('[data-action="open-tools"]').click();

  // get the action and click it
  $(`[data-action="${action}"]`).click();
}

/**
 * @function ensureModalIsOpen
 *
 * @description
 * Makes sure that the modal is either already open or opens it.
 *
 * TODO(@jniles) This isn't great practice ... it probably should be re-examined
 * if tests should have conditionals like this.
 */
function ensureModalIsOpen() {
  const modal = $('[data-depot-selection-modal]');

  return modal.isPresent()
    .then((isPresent) => {

      // if this is present, return
      if (isPresent) { return; }

      // else, open the modal
      selectDropdownAction('change-depot');
    });
}

/**
 * @function setDepot
 *
 * @description
 * Uses the helper methods to set the depot on all pages.
 */
function setDepot(label) {
  ensureModalIsOpen();

  const depot = element(by.cssContainingText('li.list-group-item', label));
  depot.click();

  FU.modal.submit();
}

// make this available to all modules
module.exports = {
  setDepot,
};
