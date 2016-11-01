angular.module('bhima.controllers')
.controller('ChargeSubscriptions', ChargeSubscriptions);

ChargeSubscriptions.$inject = ['DebtorGroup', 'BillingServicesService'];

function ChargeSubscriptions(DebtorGroup, BillingServices) {
  var vm = this;

  vm.group = DebtorGroup;

  vm.billingServices = [];

  BillingServices.read()
    .then(function (result) {
      console.log(result);

      vm.billingServices = result;
    });

  console.log(vm.group);


  console.log('charge subscriptions fired');
}
