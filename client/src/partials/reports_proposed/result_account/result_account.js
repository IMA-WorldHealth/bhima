angular.module('bhima.controllers')
.controller('configureResult', [
  '$scope',
  '$http',
  '$translate',
  'validate',
  'reportConfigService',
  'messenger',
  // Prototype document building module, requests document given configuration obejct
  function ($scope, $http, $translate, validate, reportConfigService, messenger) {

    // Configuration objects optionally passed to /report/build - drives configuration UI
    var session = $scope.session = {},
        dependencies = {},
        generatedDocumentPath = null,
        serverUtilityPath = '/report/build/result_account',
        configuration = reportConfigService.configuration;

    dependencies.fiscalYears = {
      query : {
        identifier : 'id',
        tables : {
          'fiscal_year' : {
            columns : ['id', 'fiscal_year_txt', 'previous_fiscal_year']
          }
        }
      }
    };

    $scope.generate_doc = $translate.instant('ACCOUNT_RESULT.GENERATE_DOC');
    $scope.loading = $translate.instant('ACCOUNT_RESULT.LOADING');

    //getting fiscal years

    validate.process(dependencies)
    .then(setDefaultConfiguration);

    // Expose configuration to scope - set module state
    session.building = false;
    $scope.configuration = configuration;

    function selectConfiguration(key, value) {
      configuration[key].selected = value;
    }

    function setDefaultConfiguration(models) {
      angular.extend($scope, models);
      selectConfiguration('language', configuration.language.options[1]);
      $scope.session.fiscal_year_id = $scope.fiscalYears.data[$scope.fiscalYears.data.length-1].id;
      $scope.session.previous_fiscal_year_id = $scope.fiscalYears.data[$scope.fiscalYears.data.length-1].previous_fiscal_year;
    }

    // POST configuration object to /report/build/:target
    function generateDocument() {
      var path = serverUtilityPath;
      var configurationObject = {};

      // Temporarily set configuration options - This shouldn't be manually compiled
      configurationObject.language = configuration.language.selected.value;
      configurationObject.fy = $scope.session.fiscal_year_id;
      configurationObject.fy_txt = $scope.fiscalYears.get(configurationObject.fy).fiscal_year_txt;
      configurationObject.pfy = $scope.session.previous_fiscal_year_id ||  $scope.session.fiscal_year_id;
      configurationObject.enterprise = configuration.enterprise;
      configurationObject.project = configuration.project;

      // Update state
      session.building = true;

      $http.post(path, configurationObject)
      .success(function (result) {
        // Expose generated document path to template
        session.building = false;
        $scope.generatedDocumentPath = result;
      })
      .error(function (code) {
        session.building = false;
        messenger.danger('error' + code);
      });
    }
    
    function clearPath() {
      $scope.generatedDocumentPath = null;
    }

    $scope.selectConfiguration = selectConfiguration;
    $scope.generateDocument = generateDocument;
    $scope.clearPath = clearPath;
  }
]);
