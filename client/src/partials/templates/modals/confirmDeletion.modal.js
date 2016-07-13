angular.module('bhima.controllers')
.controller('ConfirmDeletionModalController', ConfirmDeletionModalController);

// dependencies injection
ConfirmDeletionModalController.$inject = ['$uibModalInstance', '$translate', 'data'];

/**
 * Confirm Deletion Controller
 * This controller is responsible for check a match text given to continue
 * the deletion process
 */
function ConfirmDeletionModalController (Instance, $translate, Data) {
  var vm = this;

  // Global objects
  vm.pattern = Data.pattern;
  vm.elementName = Data.elementName;

  // expose functions to the view
  vm.close = close;
  vm.accept = accept;

  // startup
  startup();

  /** actions at start */
  function startup() {

    // Confirmation name message
    var message = $translate.instant('FORM.DIALOGS.PLEASE_TYPE_TEXT');

    vm.message = Data.elementName ?
      message.replace('%ELEMENT%', Data.elementName) :
      message.replace('%ELEMENT%', 'element');
  }

  /** matching */
  function isMatching(text, pattern) {
    return pattern && text === pattern;
  }

  /** close the modal instance*/
  function close() {
    Instance.close();
  }

  /** validation message */
  function validate(form) {
    vm.errorMessage = form.text.$invalid && form.$submitted;
    vm.warningMessage = form.text.$valid && form.$submitted && vm.noCorrespondancy;
  }

  /** accept the action */
  function accept(form) {
    validate(form);

    var result = isMatching(vm.pattern, vm.text);

    if (!form.$invalid && result) {
      Instance.close(result);
    } else if (!form.$invalid && !result) {
      vm.noCorrespondancy = $translate.instant('FORM.DIALOGS.NO_CORRESPONDANCY')
        .replace('%ELEMENT%', vm.elementName)
        .concat('"', vm.text, '"');
    } else {
      vm.noCorrespondancy = $translate.instant('FORM.ERRORS.REQUIRED');
    }
  }
}
