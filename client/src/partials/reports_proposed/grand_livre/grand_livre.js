angular.module('bhima.controllers')
.controller('configureGrandLivre', ReportGeneralLedgerController);

ReportGeneralLedgerController.$inject = [
 '$scope', '$http', 'validate'
];

function ReportGeneralLedgerController($scope, $http, validate) {
  var dependencies = {};

  var configuration = {
    language : {
      options : [
        {value : 'en', label : 'English'},
        {value : 'fr', label : 'French'}
      ]
    }
  };

  var serverUtilityPath = '/report/build/grand_livre';
  var generatedDocumentPath = null;
  var session = $scope.session = {};

  $scope.model = {};

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
  $scope.configuration = configuration;

  // TODO Load default configuration from appcache if it exists before selecting default

  validate.process(dependencies)
  .then(complete);

  function complete (res){
    $scope.model = res;
    setDefaultConfiguration();
  }

  function selectConfiguration(key, value) {
    configuration[key].selected = value;
  }

  function setDefaultConfiguration() {
    selectConfiguration('language', configuration.language.options[0]);
  }

  // POST configuration object to /report/build/:target
  function generateDocument() {
    var path = serverUtilityPath;
    var configurationObject = {};

    // Temporarily set configuration options - This shouldn't be manually compiled
    configurationObject.language = configuration.language.selected.value;
    configurationObject.fy = session.fy_id || $scope.model.fiscalYears.data[0].id;

    // Update state
    session.building = true;

    $http.post(path, configurationObject)
    .then(function (result) {

      // Expose generated document path to template
      $scope.generatedDocumentPath = result;
    })
    .catch(function (code) {
      // TODO Handle error
      throw code;
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
