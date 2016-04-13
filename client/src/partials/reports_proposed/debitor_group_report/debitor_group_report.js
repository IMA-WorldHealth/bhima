var DebtorGroupReportController = function ($http, $translate, validate, reportConfigService, messenger) {

  var vm = this,
  generatedDocumentPath = null,
  serverUtilityPath = '/report/build/debtor_group_report',
  configuration = reportConfigService.configuration,
  dependencies = {};

  dependencies.debtorGroup = {
      query : {
        identifier : 'uuid',
        tables : {
          'debtor_group' : {
            columns : ['uuid', 'name', 'account_id', 'is_convention']
          }
        },
        where : ['debtor_group.is_convention=1']
      }
  };

  vm.generate_doc = $translate.instant('DEBITOR_GROUP_REPORT.GENERATE_DOC');
  vm.loading = $translate.instant('DEBITOR_GROUP_REPORT.LOADING');

  validate.process(dependencies).then(setDefaultConfiguration);

  // Expose configuration to scope - set module state
  vm.building = false;
  vm.configuration = configuration;

  function selectConfiguration(key, value) {
    configuration[key].selected = value;
  }

  function setDefaultConfiguration(models) {
    angular.extend(vm, models);
    selectConfiguration('language', configuration.language.options[1]);
  }

  // POST configuration object to /report/build/:target
  function generateDocument() {
    var path = serverUtilityPath;
    var configurationObject = {};
    configurationObject.language = configuration.language.selected.value;
    configurationObject.enterprise = configuration.enterprise;
    configurationObject.project = configuration.project;    
    configurationObject.dg = vm.debtorGroup.get(vm.debtor_group_uuid);
    configurationObject.unsoldOnly = vm.unsold_only;
    configurationObject.involveJournal = vm.involve_journal;

    // Update state
    vm.building = true;

    $http.post(path, configurationObject)
    .then(function (result) {
      vm.generatedDocumentPath = result.data;
    })
    .catch(function (err) {
      messenger.danger('error' + err);
    }).
    finally(function (){
      vm.building = false;
    });
  }

  function clearPath() {
    vm.generatedDocumentPath = null;
  }

  vm.selectConfiguration = selectConfiguration;
  vm.generateDocument = generateDocument;
  vm.clearPath = clearPath;
};

DebtorGroupReportController.$inject =['$http', '$translate', 'validate', 'reportConfigService', 'messenger'];
angular.module('bhima.controllers').controller('DebtorGroupReportController', DebtorGroupReportController);
