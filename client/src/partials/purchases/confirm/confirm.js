var purchaseConfirm = function (validate, sessionService, connect, $location, messenger) {

  var vm = this;
  var dependencies = {};
  vm.is_direct = false;

  dependencies.indirect_purchase = {
    query : {
      identifier : 'uuid',
      tables : {
        purchase : { columns : ['uuid', 'reference', 'cost', 'creditor_uuid', 'purchaser_id', 'project_id', 'purchase_date', 'note', 'paid_uuid'] },
        employee : { columns : ['name'] },
        project : { columns : ['abbr'] }
      },
      join : ['purchase.project_id=project.id', 'purchase.purchaser_id=employee.id'],
      where : ['purchase.paid=1', 'AND' ,'purchase.confirmed=' + 0, 'AND', 'purchase.is_direct=0', 'AND', 'purchase.is_donation=0', 'AND', 'purchase.closed=1']
    }
  };

  dependencies.direct_purchase = {
    query : {
      identifier : 'uuid',
      tables : {
        purchase : { columns : ['uuid', 'reference', 'cost', 'creditor_uuid', 'purchaser_id', 'project_id', 'purchase_date', 'note', 'is_direct'] },
        supplier : { columns : ['name'] },
        project : { columns : ['abbr'] }
      },
      join : ['purchase.project_id=project.id', 'purchase.creditor_uuid=supplier.creditor_uuid'],
      where : ['purchase.confirmed=' + 0, 'AND', 'purchase.is_direct=1', 'AND', 'purchase.is_donation=0', 'AND', 'purchase.closed=1']
    }
  };

  vm.project = sessionService.project;
  validate.process(dependencies).then(initialise);

  function initialise(model) {
    vm.idUser = sessionService.user.id;
    angular.extend(vm, model);
  }

  vm.confirmPurchase = function confirmPurchase(purchaseId) {
    vm.selected = (vm.is_direct) ? vm.direct_purchase.get(purchaseId) : vm.indirect_purchase.get(purchaseId);
  };

  vm.confirmPayment = function confirmPayment () {
    writeToJournal()
    .then(updatePurchase)
    .then(generateDocument)
    .catch(handleError);
  };

  function updatePurchase () {
    var purchase = {
        uuid         : vm.selected.uuid,
        confirmed    : 1,
        confirmed_by : vm.idUser,
        paid         : 1
    };
    return connect.put('purchase', [purchase], ['uuid']);
  }

  function writeToJournal () {
    var query = (vm.is_direct) ? '/confirm_direct_purchase/' + vm.selected.uuid : '/confirm_indirect_purchase/' + vm.selected.paid_uuid;
    return connect.fetch('/journal' + query);
  }

  function paymentSuccess(result) {
    var purchase = {
      uuid : vm.selected.uuid,
      paid : 1
    };
    return connect.put('purchase', [purchase], ['uuid']);
  }

  function generateDocument(res) {
    var query = (vm.is_direct) ? '/confirm_direct_purchase/' + vm.selected.uuid : '/confirm_indirect_purchase/' + vm.selected.uuid;
    $location.path('/invoice' + query);
  }

  function handleError(error) {
    //TO DO catch the server error
    messenger.danger(error.data);
  }

  function getDate() {
    var currentDate = new Date();
    return currentDate.getFullYear() + '-' + (currentDate.getMonth() + 1) + '-' + ('0' + currentDate.getDate()).slice(-2);
  }

  vm.resetSelected = function () {
    vm.selected = null;
  };
};

purchaseConfirm.$inject = ['validate', 'SessionService', 'connect', '$location', 'messenger'];

angular.module('bhima.controllers').controller('PurchaseConfirm', purchaseConfirm);
