angular.module('bhima.controllers')
  .controller('RubricModalController', RubricModalController);

RubricModalController.$inject = [
  '$state', 'RubricService', 'NotifyService',
  'appcache', 'SessionService',
];

function RubricModalController($state, Rubrics, Notify, AppCache, Session) {
  const vm = this;

  const cache = AppCache('RubricModal');
  vm.rubric = {
    is_monetary_value : 1,
    is_indice : 0,
    indice_to_grap : 0,
  };
  vm.indexesMap = Rubrics.indexesMap;

  vm.enableIndexPayment = Session.enterprise.settings.enable_index_payment_system;

  if ($state.params.creating || $state.params.id) {
    vm.stateParams = $state.params;
    cache.stateParams = $state.params;
  } else {
    vm.stateParams = cache.stateParams;
  }
  vm.isCreating = vm.stateParams.creating;

  vm.selectDebtorAccount = (account) => {
    vm.rubric.debtor_account_id = account.id;
  };

  vm.indiceToGrapSetting = (value) => {
    vm.rubric.indice_to_grap = value;
  };

  vm.selectExpenseAccount = (account) => {
    vm.rubric.expense_account_id = account.id;
  };

  vm.setMaxPercent = () => {
    vm.maxPercent = vm.rubric.is_percent ? (!!vm.rubric.is_percent) : false;
  };

  vm.onInputTextChange = (key, value) => {
    vm.rubric[key] = value;
  };

  vm.isMonetaryValueSetting = (value) => {
    vm.rubric.is_monetary_value = value;
  };

  vm.isIndexSetting = (value) => {
    vm.rubric.is_indice = value;
  };


  // exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;

  if (!vm.isCreating) {
    Rubrics.read(vm.stateParams.id)
      .then((rubric) => {
        vm.rubric = rubric;
        vm.setting = true;
      })
      .catch(Notify.handleError);
  }

  // submit the data to the server from all two forms (update, create)
  function submit(rubricForm) {

    if (!vm.rubric.is_discount) {
      vm.rubric.is_discount = 0;
      vm.rubric.is_tax = 0;
      vm.rubric.is_ipr = 0;
    }

    if (vm.rubric.is_discount) {
      vm.rubric.is_discount = 1;
      vm.rubric.is_social_care = 0;
    }

    if (rubricForm.$invalid || rubricForm.$pristine) {
      Notify.danger('FORM.ERRORS.HAS_ERRORS');
      return false;
    }

    const promise = (vm.isCreating) ? Rubrics.create(vm.rubric) : Rubrics.update(vm.rubric.id, vm.rubric);

    return promise
      .then(() => {
        const translateKey = (vm.isCreating) ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS';
        Notify.success(translateKey);
        $state.go('rubrics', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function closeModal() {
    $state.go('rubrics');
  }
}
