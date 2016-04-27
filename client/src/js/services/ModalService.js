angular.module('bhima.services')
.service('ModalService', ModalService);

ModalService.$inject = [ '$uibModal' ];

/**
 * Modal Service
 *
 * A service to house generic modals useful through out the application.  These
 * will replace a lot of the native JavaScript alerts/confirms to allow easier
 * translation, testing, and functionality.
 *
 * @todo - build following methods/modals:
 *  - alert() to show a generic alert with "dismiss" or "acknowledge" button.
 *    It might be useful to have an associated icon and state (error, info,
 *    warning, etc).
 *
 *  - sudo() to bring up a modal requiring correct user password entry and set
 *    the application state into super user mode (if appropriate)
 *
 *  - confirmText() to bring up a "type this text to confirm" input that will
 *    only allow a user to enter text and only enable the "confirm" button once
 *    the text matches exactly what is anticipated.
 *
 */
function ModalService(Modal) {
  var service = this;
  
  service.alert = alert;
  service.confirm = confirm;  
  /**
   * Opens a "confirm delete" modal with a button for "Confirm" or "Cancel".
   * The modal is a safe replacement for $window.confirm(), since you cannot
   * disable javascript alerts from within it.
   *
   * @param {String} prompt - a translateable message to pass the template
   * @param {Object} options - optional object with properties to configure the
   *  ui-bootstrap modal.
   * @returns {Promise} result - a promise resolved by the modal instance
   */
  function confirm(prompt, options) {

    // default options for modal rendering
    var opts = options || {};

    var instance = Modal.open({
      animation : opts.animation || false,
      keyboard : opts.keyboard || true,
      size : opts.size || 'md',
      controller : 'ConfirmModalController as ConfirmModalCtrl',
      resolve : { prompt : function provider() { return prompt;} },
      templateUrl : '/partials/templates/modals/confirm.modal.html'
    });

    return instance.result;
  }

  function alert(prompt, options) { 
    // default options for modal rendering
    var opts = options || {};

    var instance = Modal.open({
      animation : opts.animation || false,
      keyboard : opts.keyboard || true,
      size : opts.size || 'md',
      controller : 'AlertModalController as AlertModalCtrl',
      resolve : { prompt : function provider() { return prompt;} },
      templateUrl : '/partials/templates/modals/alert.modal.html'
    });
  }


}
