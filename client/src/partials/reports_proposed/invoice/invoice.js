angular.module('bhima.controllers')
.controller('configureInvoice', ConfigInvoiceController);

ConfigInvoiceController.$inject = [
  '$scope', '$http', '$routeParams', 'reportConfigService'
];

/**
* Config Invoice Controller
*
* Responsible for making a PDF printable receipt for a patient sale.
*/
function ConfigInvoiceController($scope, $http, $routeParams, ReportConfig) {
  $scope.configuration = ReportConfig.configuration;

  var serverUtilityPath = '/report/build/invoice';
  var generatedDocumentPath = null;
  var session = $scope.session = {};

  $scope.selectConfiguration = selectConfiguration;
  $scope.generateDocument = generateDocument;
  $scope.clearPath = clearPath;

  // TODO Validate sale target is valid before requesting document
  var target = $routeParams.target;

  // Expose configuration to scope - set module state
  session.building = false;

  // TODO Load default configuration from appcache if it exists before selecting default
  setDefaultConfiguration();

  function selectConfiguration(key, value) {
    $scope.configuration[key].selected = value;
  }

  // FIXME/TODO -- these should be defaulted something
  function setDefaultConfiguration() {
    selectConfiguration('format', $scope.configuration.format.options[1]);
    selectConfiguration('language', $scope.configuration.language.options[0]);
    selectConfiguration('currency', $scope.configuration.currency.options[0]);
  }

  // POST configuration object to /report/build/:target
  function generateDocument() {
    var path = serverUtilityPath;
    var configurationObject = {};

    // Temporarily set configuration options - This shouldn't be manually compiled
    configurationObject.language = $scope.configuration.language.selected.value;
    configurationObject.format = $scope.configuration.format.selected.value;
    configurationObject.currency = $scope.configuration.currency.selected.value;
    configurationObject.sale = target;

    // Update state
    session.building = true;

    $http.post(path, configurationObject)
    .then(function (response) {

      // Expose generated document path to template
      $scope.generatedDocumentPath = response.data;
    })
    .catch(function (error) {
      console.log(error);
    })
    .finally(function () { session.building = false; });
  }

  function clearPath() {
    $scope.generatedDocumentPath = null;
  }
}
