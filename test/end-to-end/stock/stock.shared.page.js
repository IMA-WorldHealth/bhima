/* global by, element */
const path = require('path');
const FU = require('../shared/FormUtils');

const fixtures = path.resolve(__dirname, '../../fixtures/');

/**
 * @function selectDropdownAction
 *
 * @description
 * This function selects an option from the menu at the top of the stock modules.
 */
async function selectDropdownAction(action) {
  // open the dropdown menu
  await $('[data-action="open-tools"]').click();

  // get the action and click it
  await $(`[data-action="${action}"]`).click();
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
    .then(isPresent => {

      // if this is present, return
      if (isPresent) { return 0; }

      // else, open the modal
      return selectDropdownAction('change-depot');
    });
}

/**
 * @function setDepot
 *
 * @description
 * Uses the helper methods to set the depot on all pages.
 */
async function setDepot(label) {
  await ensureModalIsOpen();

  const depot = element(by.cssContainingText('li.list-group-item', label));
  await depot.click();

  await FU.modal.submit();
}

/**
 * @method uploadFile
 *
 * @description
 * Use this helper method to use an input type file for uploading
 * a file
 */
async function uploadFile(fileToUpload, elementId = 'import-input') {
  const absolutePath = path.resolve(fixtures, fileToUpload);
  await element(by.id(elementId)).sendKeys(absolutePath);
}

// make this available to all modules
module.exports = {
  setDepot,
  uploadFile,
};
