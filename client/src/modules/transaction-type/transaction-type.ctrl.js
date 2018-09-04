angular.module('bhima.controllers')
  .controller('TransactionTypeController', TransactionTypeController);

TransactionTypeController.$inject = [
  '$translate', '$timeout', 'TransactionTypeService', 'NotifyService',
  'ModalService', 'uiGridConstants', 'bhConstants',
];

/**
 * @function TransactionTypeController
 *
 * @description
 * This controller powers the transaction type grid.
 */
function TransactionTypeController($translate, $timeout, TransactionType, Notify, Modal, uiGridConstants, bhConstants) {
  const vm = this;

  // global variables
  vm.gridOptions = {};
  vm.gridApi = {};

  // grid default options
  vm.gridOptions.appScopeProvider = vm;
  vm.gridOptions.columnDefs = [{
    field : 'descriptionLabel',
    displayName : 'FORM.LABELS.TEXT',
    headerCellFilter : 'translate',
    enableColumnMenu : false,
    sort : {
      direction : uiGridConstants.ASC,
      priority : 1,
    },
  }, {
    field : 'typeLabel',
    displayName : 'FORM.LABELS.TYPE',
    headerCellFilter : 'translate',
    cellFilter : 'translate',
    enableColumnMenu : false,
  }, {
    field : 'fixed',
    displayName : '',
    maxWidth : '150',
    cellTemplate : '/modules/transaction-type/templates/fixedStatus.cell.html',
    enableFiltering : false,
    enableColumnMenu : false,
    sort : {
      direction : uiGridConstants.DESC,
      priority : 0,
    },
  }];

  // register API
  vm.gridOptions.onRegisterApi = onRegisterApi;

  // expose to the view
  vm.addType = addType;
  vm.editType = editType;

  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  }

  // add new transaction type
  function addType() {
    const request = { action : 'create' };

    return Modal.openTransactionTypeActions(request)
      .then(res => {
        if (!res) { return; }
        Notify.success('FORM.INFO.SAVE_SUCCESS');
        loadTransactionTypes();
      })
      .catch(Notify.handleError);
  }

  // edit en existing transaction type
  function editType(transactionType) {
    if (transactionType.fixed) { return 0; }

    const request = { action : 'edit', identifier : transactionType.id };

    return Modal.openTransactionTypeActions(request)
      .then(res => {
        if (!res) { return; }
        Notify.success('FORM.INFO.UPDATE_SUCCESS');
        loadTransactionTypes();
      })
      .catch(Notify.handleError);
  }

  async function loadTransactionTypes() {
    try {
      const types = await TransactionType.read();

      // ensure ALL transaction types have translated keys before displaying data
      const parsedTypes = await Promise.all(types.map(assignDescriptionTranslation));

      // this promise returns outside of Angular's digest loop for some reason, this
      // ensures the data change is propegated
      $timeout(() => {
        vm.gridOptions.data = parsedTypes.map(assignTransactionTypeLabels);
      });

    } catch (e) {
      Notify.handleError(e);
    }
  }

  // Assign translatable labels to each transaction type based on the hardcoded
  // database strings
  function assignTransactionTypeLabels(transactionType) {
    // @TODO(sfount) The `transaction_type` database currently hard codes 'income',
    //               'expense' and 'other' transaction types. When this is updated
    //               with a more data driven approach it should include translatable
    //               labels
    transactionType.typeLabel = bhConstants.transactionTypeMap[transactionType.type].label;
    return transactionType;
  }


  async function assignDescriptionTranslation(type) {
    try {
      const translatedDescription = await $translate(type.text);
      type.descriptionLabel = translatedDescription;
    } catch (e) {
      // there was an issue with the translation, this is most commonly caused
      // by no value found for this key, throwing an exception
      // - default to the translate key as the directive does
      type.descriptionLabel = type.text;
    }
    return type;
  }

  function startup() {
    // startup executes load only once Angular is initalised and has set the default
    // language setting correctly, executing this earlier will use the default language
    // @TODO(sfount) an abstract, clear way of guaranteeing language files are downloaded should be considerd
    $timeout(() => loadTransactionTypes());
  }

  // startup the module
  startup();
}
