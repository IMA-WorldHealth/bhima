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
  var vm = this, message;

  // expose to the view
  vm.accept = accept;
  vm.close = Instance.close;

  // initial setup
  startup();

  /** startup */
  function startup() {

    // Global objects
    vm.pattern = Data.pattern;
    vm.elementName = Data.elementName;

    // make sure the modal isn't accidentally called with empty values
    if (!Data.pattern || !Data.elementName) {
      throw new Error(
        'ConfirmDeletionModal requires both a pattern and an element name to be defined, but received:' +
        'data.pattern = ' + Data.pattern + ' ' +
        'data.elementName = ' + Data.elementName
      );
    }

    // Confirmation name message
    message = $translate.instant('FORM.DIALOGS.PLEASE_TYPE_TEXT');

    vm.message = Data.elementName ?
      message.replace('%ELEMENT%', Data.elementName) :
      message.replace('%ELEMENT%', 'element');
  }

  /** matching */
  function isMatching(text, pattern) {
    return pattern && text === pattern;
  }

  /** validation message */
  function validate(form) {
    vm.hasErrorMessage = form.text.$invalid && form.$submitted;
    vm.hasWarningMessage = form.text.$valid && form.$submitted && vm.noCorrespondancy;
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
