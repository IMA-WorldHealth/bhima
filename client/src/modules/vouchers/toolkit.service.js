angular.module('bhima.services')
  .service('VoucherToolkitService', VoucherToolkitService);

VoucherToolkitService.$inject = ['$http', '$uibModal', 'util'];

function VoucherToolkitService($http, Modal, util) {
  var service = this;

  // expose the service
  service.open = open;

  // tools of advanced journal voucher
  service.tools = {
    // this tool help to import transaction rows for a convention payment
    convention_payment : {
      icon        : 'fa-building',
      label       : 'VOUCHERS.GLOBAL.CONVENTION_INVOICES',
      controller  : 'ConventionPaymentKitController',
      templateUrl : 'modules/vouchers/toolkit/convention_payment/convention_payment.modal.html',
    },
    generic_income : {
      icon        : 'fa-level-down',
      label       : 'VOUCHERS.GLOBAL.GENERIC_INCOME',
      controller  : 'GenericIncomeKitController',
      templateUrl : 'modules/vouchers/toolkit/generic_income/generic_income.html',
    },
    generic_expense : {
      icon        : 'fa-level-up',
      label       : 'VOUCHERS.GLOBAL.GENERIC_EXPENSE',
      controller  : 'GenericExpenseKitController',
      templateUrl : 'modules/vouchers/toolkit/generic_expense/generic_expense.html',
    },
    cash_transfer : {
      icon        : 'fa-reply-all',
      label       : 'VOUCHERS.GLOBAL.CASH_TRANSFER',
      controller  : 'CashTransferKitController',
      templateUrl : 'modules/vouchers/toolkit/cash_transfer/cash_transfer.html',
    },
    support_patient : {
      icon        : 'fa-wpforms',
      label       : 'VOUCHERS.GLOBAL.SUPPORT_FORM',
      controller  : 'SupportPatientKitController',
      templateUrl : 'modules/vouchers/toolkit/support_patient/support_patient.modal.html'
    },
  };

  // service options
  service.options = Object.keys(service.tools).map(function (item) {
    var tool = service.tools[item];
    return tool;
  });

  /**
   * @function open
   * @description This function initialise a modal for the selected tool
   * @param {Object} option A detailed option object that should provide
   * label, controller string, templateUrl string
   */
  function open(option) {
    if (!option.controller || !option.templateUrl) {
      throw new Error('Toolkit.open() requires a controller or templateUrl!');
    }

    var instance = Modal.open({
      templateUrl  : option.templateUrl,
      controller   : option.controller,
      controllerAs : 'ToolCtrl',
      size         : 'md',
      backdrop     : 'static',
      resolve      : { data: function () { return option; } },
    });

    return instance.result;
  }

}
