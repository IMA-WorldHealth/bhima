angular.module('bhima.controllers')
  .controller('RubricConfigModalController', RubricConfigModalController);

RubricConfigModalController.$inject = [
  '$state', 'ConfigurationService', 'NotifyService', 'appcache', 'RubricService', 'params',
];

function RubricConfigModalController($state, Configs, Notify, AppCache, Rubrics, params) {
  const vm = this;
  vm.config = {};

  const cache = AppCache('RubricConfigModal');

  if (params.isCreateState || params.id) {
    cache.stateParams = params;
    vm.stateParams = cache.stateParams;
  } else {
    vm.stateParams = cache.stateParams;
  }

  vm.isCreateState = params.isCreateState;

  // exposed methods
  vm.all = false;
  vm.socialCheck = false;
  vm.taxCheck = false;
  vm.otherCheck = false;
  vm.membershipFeeCheck = false;
  vm.loading = true;

  vm.toggleAllRubrics = toggleAllRubrics;
  vm.toggleSocialCares = toggleSocialCares;
  vm.toggleTaxes = toggleTaxes;
  vm.toggleMembershipFee = toggleMembershipFee;
  vm.toggleOthers = toggleOthers;
  vm.toggleIndexes = toggleIndexes;

  vm.submit = submit;
  vm.closeModal = closeModal;

  Configs.read(vm.stateParams.id)
    .then(config => {
      vm.config = config;
    })
    .catch(Notify.handleError);

  Rubrics.read()
    .then(rubrics => {
      vm.rubrics = rubrics;

      vm.socialCares = rubrics.filter(item => item.is_social_care);

      vm.taxes = rubrics.filter(item => item.is_tax);

      vm.indexes = rubrics.filter(item => item.is_indice);

      vm.membershipFee = rubrics.filter(item => item.is_membership_fee);

      vm.others = rubrics.filter(item => {
        return (!item.is_tax && !item.is_social_care && !item.is_membership_fee && !item.is_indice);
      });

      vm.loading = false;

      return Configs.getRubrics(vm.stateParams.id);
    })
    .then(rubConfig => {
      vm.rubConfig = rubConfig;
      const rubConfigMap = {};
      rubConfig.forEach(object => {
        rubConfigMap[object.rubric_payroll_id] = true;
      });

      const rubricGroups = [vm.socialCares, vm.taxes, vm.indexes, vm.membershipFee, vm.others];

      rubricGroups.forEach(group => {
        group.forEach(unit => {
          if (rubConfigMap[unit.id]) {
            unit.checked = true;
          }
        });
      });

    })
    .catch(Notify.handleError);

  // toggles all Rubrics to match there Configuration Rubric's setting
  function toggleAllRubrics(bool) {
    vm.headSocial = bool;
    vm.headTax = bool;
    vm.headOther = bool;
    vm.headMembershipFee = bool;

    vm.rubrics.forEach(rubric => {
      rubric.checked = bool;
    });
  }

  function toggleSocialCares(status) {
    vm.headSocial = !status;
    vm.socialCares.forEach(rubric => {
      vm.socialCheck = !status;
      rubric.checked = !status;
    });
  }

  function toggleIndexes(status) {
    vm.indexes.forEach(rubric => {
      rubric.checked = status;
    });
  }

  function toggleTaxes(status) {
    vm.headTax = !status;

    vm.taxes.forEach(rubric => {
      vm.taxCheck = !status;
      rubric.checked = !status;
    });
  }

  function toggleOthers(status) {
    vm.headOther = !status;

    vm.others.forEach(rubric => {
      vm.otherCheck = !status;
      rubric.checked = !status;
    });
  }

  function toggleMembershipFee(status) {
    vm.headMembershipFee = !status;

    vm.membershipFee.forEach(rubric => {
      vm.membershipFeeCheck = !status;
      rubric.checked = !status;
    });
  }

  // submit the data to the server from all two forms (update, create)
  function submit() {
    const rubricChecked = [];
    const rubricGroups = [vm.socialCares, vm.taxes, vm.indexes, vm.membershipFee, vm.others];

    rubricGroups.forEach(group => {
      group.forEach(rubric => {
        if (rubric.checked) rubricChecked.push(rubric.id);
      });
    });

    return Configs.setRubrics(vm.stateParams.id, rubricChecked)
      .then(() => {
        Notify.success('FORM.INFO.UPDATE_SUCCESS');
        $state.go('configurationRubric', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function closeModal() {
    $state.go('configurationRubric');
  }
}
