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

  var modalParameters = {
    size : 'md',
    backdrop : 'static',
    animation : false
  };

  service.alert = alert;
  service.confirm = confirm;
  service.openSelectCashbox = openSelectCashbox;
  service.openPatientReceipt = openPatientReceipt;
  service.openDebtorInvoices = openDebtorInvoices;
  service.openTransfer = openTransfer;

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

  /**
   * Select cashbox modal
   */
  function openSelectCashbox(request) {
    /**
     * request contains :
     * cashboxId => the cashbox id send in url : /cash/:id
     * cashbox.id => the cashbox id which is in the cache 
     */
    var cashboxIsSet = request.cashbox && request.cashbox.id;

    var params = angular.extend(modalParameters, {
      templateUrl : 'partials/cash/modals/selectCashbox.modal.html',
      controller  : 'SelectCashboxModalController',
      controllerAs: '$ctrl',
      resolve     : {
        cashboxId : function () { return request.cashboxId || cashboxIsSet; }
      }
    });

    var instance = Modal.open(params);

    return instance.result;
  }

  /**
   * Cash Receipt Modal
   */
  function openPatientReceipt(request) {

    var instance = Modal.open({
      templateUrl: 'partials/cash/modals/receipt.modal.html',
      controller:  'CashReceiptModalController as CashReceiptModalCtrl',
      size:        'md',
      backdrop:    'static',
      animation:   false,
      resolve : {
        uuid : function uuidProvider() { return request.uuid; },
        patientUuid : function patientUuidProvider() { return request.patientUuid; }
      }
    });
  }

  function openDebtorInvoices(request) {

    var instance = Modal.open({
      templateUrl: 'partials/cash/modals/invoices.modal.html',
      controller:  'CashInvoiceModalController as CashInvoiceModalCtrl',
      size:        'md',
      backdrop:    'static',
      animation:   false,
      resolve:     {
        debtorId:  function debtorIdProvider() { return request.debtorUuid; },
        invoiceIds : function invoiceIdsProvider() {

          if (!request.invoices) { return []; }

          return request.invoices.map(function (invoice) {
            return invoice.sale_uuid;
          });
        }
      }
    });

    return instance.result;
  }

  function openTransfer(request) {

    var instance = Modal.open({
      templateUrl: 'partials/cash/modals/transfer.modal.html',
      controller:  'CashTransferModalController as CashTransferModalCtrl',
      size:        'md',
      backdrop:    'static',
      animation:   true,
      resolve:     {
        cashBox:  function cashBoxProvider() { return request.cashbox; }
      }
    });
  }

}
