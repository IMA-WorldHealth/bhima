angular.module('bhima.controllers')
.controller('TransactionTypeModalController', TransactionTypeModalController);

// dependencies injections
TransactionTypeModalController.$inject = [
  '$uibModalInstance', '$translate', 'TransactionTypeService', 'NotifyService', 'data'
];

function TransactionTypeModalController(Instance, $translate, TransactionType, Notify, Data) {
  var vm = this;

  vm.optionType = [
    { label: $translate.instant('VOUCHERS.SIMPLE.INCOME'), value: 'income' },
    { label: $translate.instant('VOUCHERS.SIMPLE.EXPENSE'), value: 'expense' },
    { label: $translate.instant('FORM.LABELS.OTHER'), value: 'other' }
  ];

  vm.transactionType = {};
  vm.action  = Data.action; // action must be 'create' or 'update'

  // expose to the view
  vm.submit = submit;
  vm.close  = Instance.close;

  /**
   * @function submitProject
   * @desc submit project data to the server for create or update
   * @param {object} form The project form instance
   */
  function submit(form) {
    if (form.$invalid) {
      Notify.danger('FORM.ERRORS.HAS_ERRORS');
      return;
    }

    handleTransactionType();

    var promise;
    var creation = (Data.action === 'create');
    var transactionType = angular.copy(vm.transactionType);

    // set enterprise
    if (creation) {
      transactionType.id = vm.generatedIdentifier;
    }

    promise = (creation) ?
      TransactionType.create(transactionType) :
      TransactionType.update(transactionType.id, transactionType);

    return promise
    .then(function (response) {
      Instance.close(true);
    })
    .catch(Notify.handleError);
  }

  /** check the transaction type */
  function handleTransactionType() {
    if (vm.transactionType.type === 'other') {
      vm.transactionType.type = vm.otherType;
    }
  }

  /** startup function */
  function startup() {

    TransactionType.read()
    .then(function (list) {
      var lastId = list.length ? list[list.length - 1].id : 0;
      vm.generatedIdentifier = lastId + 1;
    })
    .catch(Notify.handleError);

    if (Data.action === 'edit' && Data.identifier) {
      TransactionType.read(Data.identifier)
      .then(function (type) {
        vm.transactionType = type;
      })
      .catch(Notify.handleError);
    }
  }

  // run
  startup();

}
