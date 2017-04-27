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
    'convention_payment' : {
      label : 'VOUCHERS.GLOBAL.CONVENTION_INVOICES',
      controller : 'ConventionPaymentKitController',
      templateUrl : 'modules/vouchers/toolkit/convention_payment.modal.html'
    }
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
      resolve      : { data : function () { return option; } }
    });

    return instance.result;
  }

}
