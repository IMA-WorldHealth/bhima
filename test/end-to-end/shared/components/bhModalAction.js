/* global browser, element, by */

/**
* Modal Action component interface for e2e test
* @public
*/
module.exports = {

  confirm: function confirm() {
    //This function is called when the test requires
    //a click on the button confirms the modal window
    $('[data-confirm-modal] [data-method="submit"]').click();
  },

  dismiss: function dismiss() {
    //This function is called when the test requires
    //a click on the button cancel for dismiss the action
    $('[data-confirm-modal] [data-method="cancel"]').click();
  }
};
