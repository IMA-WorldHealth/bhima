angular.module('bhima.controllers')
.controller('ConfirmStockIntegrationController', ConfirmStockIntegrationController);

ConfirmStockIntegrationController.$inject = [
  'connect', '$location', 'SessionService'
];

function ConfirmStockIntegrationController(connect, $location, Session) {
  var vm = this;

  // bind variables to view
  vm.user = Session.user;
  vm.project = Session.project;
  vm.filter = '';
  vm.loading = false;

  // bind methods
  vm.confirmIntegration = confirmIntegration;
  vm.select = select;

  /* ------------------------------------------------------------------------ */

  function initialise() {
    vm.loading = true;
    connect.fetch('/stockIntegration')
    .then(function (data) {
      vm.data = data;
    })
    .catch(handleError)
    .finally(function () { vm.loading = false; });
  }

  function select(item) {
    vm.selected = item;
  }

  function confirmIntegration() {
    writeToJournal()
    .then(updatePurchase)
    .then(generateDocument)
    .catch(handleError);
  }

  function updatePurchase () {
    var purchase = {
        uuid         : vm.selected.uuid,
        confirmed    : 1,
        confirmed_by : vm.user.id,
        paid         : 1
    };
    return connect.put('purchase', [purchase], ['uuid']);
  }

  function writeToJournal () {
    var query = 'confirm_integration/' + vm.selected.uuid;
    return connect.fetch('/journal/' + query);
  }

  function generateDocument(res) {
    var query = 'confirm_integration/' + vm.selected.document_id;
    $location.path('/invoice/' + query);
  }

  function handleError(error) {
    console.log(error);
  }

  initialise();
}
