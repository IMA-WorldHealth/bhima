angular.module('bhima.services')
  .service('VoucherToolkitService', VoucherToolkitService);

VoucherToolkitService.$inject = ['$uibModal'];

function VoucherToolkitService(Modal) {
  var service = this;

  // expose the service
  service.open = open;

  // tools of advanced journal voucher
  service.tools = {
    // this tool help to import transaction rows for a convention payment
    convention_payment : {
      controller  : 'ConventionPaymentKitController',
      templateUrl : 'modules/vouchers/toolkit/convention_payment/convention_payment.modal.html',
    },
    generic_income : {
      controller  : 'GenericIncomeKitController',
      templateUrl : 'modules/vouchers/toolkit/generic_income/generic_income.html',
    },
    generic_expense : {
      controller  : 'GenericExpenseKitController',
      templateUrl : 'modules/vouchers/toolkit/generic_expense/generic_expense.html',
    },
    cash_transfer : {
      controller  : 'CashTransferKitController',
      templateUrl : 'modules/vouchers/toolkit/cash_transfer/cash_transfer.html',
    },
    support_patient : {
      controller  : 'SupportPatientKitController',
      templateUrl : 'modules/vouchers/toolkit/support_patient/support_patient.modal.html',
    },
  };

  service.openConventionPaymentModal = function openConventionPaymentModal() {
    return open(service.tools.convention_payment);
  };

  service.openGenericIncomeModal = function openGenericIncomeModal() {
    return open(service.tools.generic_income);
  };

  service.openGenericExpenseModal = function openGenericExpenseModal() {
    return open(service.tools.generic_expense);
  };

  service.openCashTransferModal = function openCashTransferModal() {
    return open(service.tools.cash_transfer);
  };

  service.openSupportPatientModal = function openSupportPatientModal() {
    return open(service.tools.support_patient);
  };

  /**
   * @method getBlankVoucherRow
   *
   * @description
   * Generates a new, unfilled voucher row.  This is used in almost every voucher tool.
   *
   * @returns {object} - the voucher row object
   */
  service.getBlankVoucherRow = function getBlankVoucherRow() {
    return {
      account_id     : undefined,
      debit          : 0,
      credit         : 0,
      reference_uuid : undefined,
      entity_uuid    : undefined,
    };
  };

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
