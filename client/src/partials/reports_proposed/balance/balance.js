angular.module('bhima.controllers')
.controller('configureBalance', ConfigureBalanceSheetController);

ConfigureBalanceSheetController.$inject = [
  '$scope', '$http', '$sce', 'validate', 'reportConfigService'
];

function ConfigureBalanceSheetController($scope, $http, $sce, validate, ReportConfig) {
  var dependencies = {};

  // Configuration objects optionally passed to /report/build - drives configuration UI

  var serverUtilityPath = '/report/build/balance';
  var generatedDocumentPath = null;
  var session = $scope.session = {};

  dependencies.fiscalYears = {
    query : {
      identifier : 'id',
      tables : {
        'fiscal_year' : {
          columns : ['id', 'fiscal_year_txt']
        }
      }
    }
  };

  // Expose configuration to scope - set module state
  session.building = false;
  $scope.configuration = ReportConfig.configuration;

  // TODO Load default configuration from appcache if it exists before selecting default
  validate.process(dependencies)
  .then(complete);

  function complete(res) {
    $scope.model = res;
    setDefaultConfiguration();
  }

  function selectConfiguration(key, value) {
    $scope.configuration[key].selected = value;
  }

  function setDefaultConfiguration() {
    selectConfiguration('language', $scope.configuration.language.options[0]);
  }

  // POST configuration object to /report/build/:target
  function generateDocument() {
    var path = serverUtilityPath;
    var configurationObject = {};

    // Temporarily set configuration options - This shouldn't be manually compiled
    configurationObject.language = $scope.configuration.language.selected.value;
    configurationObject.fy = session.fy_id || $scope.model.fiscalYears.data[0].id;

    // Update state
    session.building = true;

    $http.post(path, configurationObject)
    .then(function (response) {
      $scope.generatedDocumentPath = response.data;
    })
    .finally(function () { session.building = false; });
  }

  function clearPath() {
    $scope.generatedDocumentPath = null;
  }

  $scope.selectConfiguration = selectConfiguration;
  $scope.generateDocument = generateDocument;
  $scope.clearPath = clearPath;
}
