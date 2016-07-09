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
  service.openUploadDocument = openUploadDocument;
  // modal for reporting
  service.openReports = openReports;
  // inventory group action : add or edit
  service.openInventoryGroupActions = openInventoryGroupActions;

  // inventory type action : add or edit
  service.openInventoryTypeActions = openInventoryTypeActions;

  // inventory unit action : add or edit
  service.openInventoryUnitActions = openInventoryUnitActions;

  // inventory list action : add or edit
  service.openInventoryListActions = openInventoryListActions;

  // date interval modal
  service.openDateInterval = openDateInterval;

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
    var params = angular.extend(modalParameters, {
      templateUrl : 'partials/cash/modals/selectCashbox.modal.html',
      controller  : 'SelectCashboxModalController as $ctrl',
      resolve     : {
        cashboxId : function cashboxIdProvider() { return request.cashboxId; }
      }
    });

    return Modal.open(params).result;
  }

  /**
   * Cash Receipt Modal
   */
  function openPatientReceipt(request) {

    var params = angular.extend(modalParameters, {
      templateUrl : 'partials/cash/modals/receipt.modal.html',
      controller  : 'CashReceiptModalController as CashReceiptModalCtrl',
      resolve     : {
        uuid : function uuidProvider() { return request.uuid; },
        patientUuid : function patientUuidProvider() { return request.patientUuid; }
      }
    });

    var instance = Modal.open(params);
  }

  /**
   * Debtor invoices Modal
   */
  function openDebtorInvoices(request) {
    var params = angular.extend(modalParameters, {
      templateUrl : 'partials/cash/modals/invoices.modal.html',
      controller  : 'CashInvoiceModalController as CashInvoiceModalCtrl',
      resolve     : {
        debtorId : function debtorIdProvider() { return request.debtorUuid; },
        invoiceIds : function invoiceIdsProvider() {
          if (!request.invoices) { return []; }
          return request.invoices.map(function (invoice) {
            return invoice.invoice_uuid;
          });
        }
      }
    });

    var instance = Modal.open(params);
    return instance.result;
  }

  /**
   * Transfer Modal
   */
  function openTransfer(request) {
    var params = angular.extend(modalParameters, {
      templateUrl : 'partials/cash/modals/transfer.modal.html',
      controller  : 'CashTransferModalController as CashTransferModalCtrl',
      resolve     : {
        cashBox:  function transferProvider() { return request.cashbox; }
      }
    });

    var instance = Modal.open(params);
  }

  /**
   * upload document Modal
   */
  function openUploadDocument(request) {

    var params = angular.extend(modalParameters, {
      templateUrl  : 'partials/patients/documents/modals/documents.modal.html',
      controller   : 'PatientDocumentsModalController',
      controllerAs : '$ctrl',
      resolve : {
        patientUuid :  function patientProvider() { return request.patient_uuid; }
      }
    });

    var instance = Modal.open(params);
    return instance.result;
  }

  /**
   * Page for printing in Modal
   */
   function openReports(request) {

     var params = angular.extend(modalParameters, {
       templateUrl  : 'partials/templates/modals/reports.modal.html',
       controller   : 'ReportsModalController',
       controllerAs : '$ctrl',
       size         : 'lg',
       backdrop     : 'static',
       animation    : false,
       resolve : {
         data :  function dataProvider() { return request; }
       }
     });

     var instance = Modal.open(params);
   }

   /**
    * Inventory Group Actions
    */
    function openInventoryGroupActions(request) {

      var params = angular.extend(modalParameters, {
        templateUrl  : 'partials/inventory/configuration/groups/modals/actions.tmpl.html',
        controller   : 'InventoryGroupsActionsModalController',
        controllerAs : '$ctrl',
        size         : 'xs',
        backdrop     : 'static',
        animation    : false,
        resolve : {
          data :  function dataProvider() { return request; }
        }
      });

      var instance = Modal.open(params);
      return instance.result;
    }

    /** Inventory Types Modal for actions */
    function openInventoryTypeActions(request) {

      var params = angular.extend(modalParameters, {
        templateUrl  : 'partials/inventory/configuration/types/modals/actions.tmpl.html',
        controller   : 'InventoryTypeActionsModalController',
        controllerAs : '$ctrl',
        size         : 'xs',
        backdrop     : 'static',
        animation    : false,
        resolve : {
          data :  function dataProvider() { return request; }
        }
      });

      var instance = Modal.open(params);
      return instance.result;
    }

    /** Inventory Units Modals for actions */
    function openInventoryUnitActions(request) {

      var params = angular.extend(modalParameters, {
        templateUrl  : 'partials/inventory/configuration/units/modals/actions.tmpl.html',
        controller   : 'InventoryUnitActionsModalController',
        controllerAs : '$ctrl',
        size         : 'xs',
        backdrop     : 'static',
        animation    : false,
        resolve : {
          data :  function dataProvider() { return request; }
        }
      });

      var instance = Modal.open(params);
      return instance.result;
    }

    /** Inventory List Modals for actions */
    function openInventoryListActions(request) {

      var params = angular.extend(modalParameters, {
        templateUrl  : 'partials/inventory/list/modals/actions.tmpl.html',
        controller   : 'InventoryListActionsModalController',
        controllerAs : '$ctrl',
        size         : 'xs',
        backdrop     : 'static',
        animation    : false,
        resolve : {
          data :  function dataProvider() { return request; }
        }
      });

      var instance = Modal.open(params);
      return instance.result;
    }

    /** Find by Date interval modal */
    function openDateInterval(request) {

      var params = angular.extend(modalParameters, {
        templateUrl  : 'partials/templates/modals/dateInterval.tmpl.html',
        controller   : 'DateIntervalModalController',
        controllerAs : '$ctrl',
        size         : 'xs',
        backdrop     : 'static',
        animation    : false,
        resolve : {
          data :  function dataProvider() { return request; }
        }
      });

      var instance = Modal.open(params);
      return instance.result;
    }

}
