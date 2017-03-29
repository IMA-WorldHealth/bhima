angular.module('bhima.services')
  .service('ModalService', ModalService);

ModalService.$inject = ['$uibModal'];

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
    size      : 'md',
    backdrop  : 'static',
    animation : false,
  };

  service.alert = alert;
  service.confirm = confirm;
  service.openSelectCashbox = openSelectCashbox;
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

  // confirm deletion modal
  service.openConfirmDialog = openConfirmDialog;

  // project actions : add or edit
  service.openProjectActions = openProjectActions;

  // transaction type : add or edit
  service.openTransactionTypeActions = openTransactionTypeActions;

  // closing fiscal year
  service.openClosingFiscalYear = openClosingFiscalYear;

  // search cash payment
  service.openSearchCashPayment = openSearchCashPayment;

  // purchase order status
  service.openPurchaseOrderStatus = openPurchaseOrderStatus;

  // search purchase order
  service.openSearchPurchaseOrder = openSearchPurchaseOrder;

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
      templateUrl : '/modules/templates/modals/confirm.modal.html'
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
      templateUrl : '/modules/templates/modals/alert.modal.html'
    });
  }

  /**
   * Select cashbox modal
   */
  function openSelectCashbox(request) {
    var params = angular.extend(modalParameters, {
      templateUrl : 'modules/cash/modals/selectCashbox.modal.html',
      controller  : 'SelectCashboxModalController as $ctrl',
      resolve     : {
        cashboxId : function cashboxIdProvider() { return request.cashboxId; }
      }
    });

    return Modal.open(params).result;
  }

  /**
   * upload document Modal
   */
  function openUploadDocument(request) {

    var params = angular.extend(modalParameters, {
      templateUrl  : 'modules/patients/documents/modals/documents.modal.html',
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
       templateUrl  : 'modules/templates/modals/reports.modal.html',
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
        templateUrl  : 'modules/inventory/configuration/groups/modals/actions.tmpl.html',
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
        templateUrl  : 'modules/inventory/configuration/types/modals/actions.tmpl.html',
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
    function openInventoryUnitActions(data) {
      var params = angular.extend(modalParameters, {
        templateUrl  : 'modules/inventory/configuration/units/modals/actions.tmpl.html',
        controller   : 'InventoryUnitActionsModalController',
        controllerAs : '$ctrl',
        resolve : {
          data : function dataProvider() { return data; }
        }
      });

      var instance = Modal.open(params);
      return instance.result;
    }

    /** Inventory List Modals for actions */
    function openInventoryListActions(request) {
      var params = angular.extend(modalParameters, {
        templateUrl  : 'modules/inventory/list/modals/actions.tmpl.html',
        controller   : 'InventoryListActionsModalController',
        controllerAs : '$ctrl',
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
        templateUrl  : 'modules/templates/modals/dateInterval.tmpl.html',
        controller   : 'DateIntervalModalController',
        controllerAs : '$ctrl',
        size         : 'xs',
        backdrop     : 'static',
        animation    : true,
        resolve : {
          data :  function dataProvider() { return request; }
        }
      });

      var instance = Modal.open(params);
      return instance.result;
    }

    /**
     * confirm deletion modal
     * @param {object} request
     * The request parameter take :
     *  pattern: the text to match,
     *  elementName: the name translated of the element to delete (document, transaction)
     * @example
     * request = {
     *   pattern: '#HBB17',
     *   elementName: $translate.instant('FORM.LABELS.TRANSACTION')
     *  }
     */
    function openConfirmDialog(request) {

      var params = angular.extend(modalParameters, {
        templateUrl  : 'modules/templates/modals/confirmDialog.modal.html',
        controller   : 'ConfirmDialogModalController',
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

    /** project modal actions */
    function openProjectActions(request) {
      var params = angular.extend(modalParameters, {
        templateUrl  : 'modules/templates/modals/project.modal.html',
        controller   : 'ProjectModalController',
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

    /** transaction type modal actions */
    function openTransactionTypeActions(request) {
      var params = angular.extend(modalParameters, {
        templateUrl  : 'modules/templates/modals/transactionType.modal.html',
        controller   : 'TransactionTypeModalController',
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

    /** closing fiscal year modal */
    function openClosingFiscalYear(request) {
      var params = angular.extend(modalParameters, {
        templateUrl  : 'modules/fiscal/templates/modals/fiscal.closing.modal.html',
        controller   : 'ClosingFiscalYearModalController',
        controllerAs : '$ctrl',
        size         : 'lg',
        backdrop     : 'static',
        animation    : false,
        resolve : {
          data :  function dataProvider() { return request; }
        }
      });

      var instance = Modal.open(params);
      return instance.result;
    }

    /** searchCashPayment */
    function openSearchCashPayment(filters) {
      var params = angular.extend(modalParameters, {
        templateUrl  : 'modules/cash/payments/templates/search.modal.html',
        controller   : 'SearchCashPaymentModalController',
        controllerAs : '$ctrl',
        size         : 'md',
        backdrop     : 'static',
        animation    : false,
        resolve : {
          filters :  function filtersProvider() { return filters; }
        }
      });

      var instance = Modal.open(params);
      return instance.result;
    }

    /** purchase order status */
    function openPurchaseOrderStatus(request) {
      var params = angular.extend(modalParameters, {
        templateUrl  : 'modules/purchases/modals/status.tmpl.html',
        controller   : 'PurchaseOrderStatusModalController',
        controllerAs : '$ctrl',
        size         : 'md',
        backdrop     : 'static',
        animation    : false,
        resolve : {
          data :  function dataProvider() { return request; }
        }
      });

      var instance = Modal.open(params);
      return instance.result;
    }

    /** search purchase order */
    function openSearchPurchaseOrder(request) {
      var params = angular.extend(modalParameters, {
        templateUrl  : 'modules/purchases/modals/search.tmpl.html',
        controller   : 'SearchPurchaseOrderModalController',
        controllerAs : '$ctrl',
        size         : 'md',
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
