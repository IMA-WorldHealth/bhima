angular.module('bhima.controllers')
  .controller('RubricConfigModalController', RubricConfigModalController);

RubricConfigModalController.$inject = [
  '$state', 'ConfigurationService', 'ModalService', 'NotifyService', 'appcache', 'RubricService',
];

function RubricConfigModalController($state, Configs, ModalService, Notify, AppCache, Rubrics) {
  var vm = this;
  vm.config = {};

  var cache = AppCache('RubricConfigModal');

  if ($state.params.creating || $state.params.id) {
    vm.stateParams = cache.stateParams = $state.params;
  } else {
    vm.stateParams = cache.stateParams;
  }
  vm.isCreating = vm.stateParams.creating;

  // exposed methods
  vm.all = false;
  vm.socialCheck = false;
  vm.taxCheck = false;
  vm.otherCheck = false;

  vm.toggleAllRubrics = toggleAllRubrics;
  vm.toggleSocialCares = toggleSocialCares;
  vm.toggleTaxes = toggleTaxes;
  vm.toggleOthers = toggleOthers;

  vm.submit = submit;
  vm.closeModal = closeModal;

  Configs.read(vm.stateParams.id)
    .then(function (config) {
      vm.config = config;
    })
    .catch(Notify.handleError);

  Rubrics.read()
    .then(function (rubrics) {
      vm.rubrics = rubrics;
      vm.socialCares = rubrics.filter(function (item) {
        return item.is_social_care === 1;
      });

      vm.taxes = rubrics.filter(function (item) {
        return item.is_tax === 1;
      });

      vm.others = rubrics.filter(function (item) {
        return item.is_tax !== 1 && item.is_social_care !== 1;
      });
    })
    .catch(Notify.handleError);

  Configs.getRubrics(vm.stateParams.id)
    .then(function (rubConfig) {
      vm.rubConfig = rubConfig;

      rubConfig.forEach(function (object) {
        vm.socialCares.forEach(function (unit) {
          if (unit.id === object.rubric_payroll_id) {
            unit.checked = true;
          }
        });
      });

      rubConfig.forEach(function (object) {
        vm.taxes.forEach(function (unit) {
          if (unit.id === object.rubric_payroll_id) {
            unit.checked = true;
          }
        });
      });

      rubConfig.forEach(function (object) {
        vm.others.forEach(function (unit) {
          if (unit.id === object.rubric_payroll_id) {
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

    vm.rubrics.forEach(function (rubric) {
      rubric.checked = bool;
    });
  }

  function toggleSocialCares(status) {
    vm.headSocial = !status;

    vm.socialCares.forEach(function (rubric) {
      vm.socialCheck = !status;
      rubric.checked = !status;
    });
  }

  function toggleTaxes(status) {
    vm.headTax = !status;

    vm.taxes.forEach(function (rubric) {
      vm.taxCheck = !status;
      rubric.checked = !status;
    });
  }

  function toggleOthers(status) {
    vm.headOther = !status;

    vm.others.forEach(function (rubric) {
      vm.otherCheck = !status;
      rubric.checked = !status;
    });
  }

  // submit the data to the server from all two forms (update, create)
  function submit() {
    var socialChecked,
      taxChecked,
      otherChecked;
    var rubricChecked = [];

    socialChecked = vm.socialCares.filter(function (rubric) {
      return rubric.checked;
    })
      .map(function (rubric) {
        return rubric.id;
      });

    taxChecked = vm.taxes.filter(function (rubric) {
      return rubric.checked;
    })
      .map(function (rubric) {
        return rubric.id;
      });

    otherChecked = vm.others.filter(function (rubric) {
      return rubric.checked;
    })
      .map(function (rubric) {
        return rubric.id;
      });

    rubricChecked = socialChecked.concat(taxChecked, otherChecked);

    return Configs.setRubrics(vm.stateParams.id, rubricChecked)
      .then(function () {
        Notify.success('FORM.INFO.UPDATE_SUCCESS');
        $state.go('configurationRubric', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function closeModal() {
    $state.go('configurationRubric');
  }
}
