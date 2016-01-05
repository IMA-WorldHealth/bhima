angular.module('bhima.controllers')
.controller('configureEmployeeState', [
  '$scope',
  '$http',
  '$routeParams',
  'reportConfigService',
  'messenger',

  // Prototype document building module, requests document given configuration obejct
  function ($scope, $http, $routeParams, reportConfigService, messenger) {

    // Configuration objects optionally passed to /report/build - drives configuration UI
    var configuration = reportConfigService.configuration;
    var serverUtilityPath = '/report/build/employee_state';
    var generatedDocumentPath = null;
    var session = $scope.session = {};

    // Expose configuration to scope - set module state
    session.building = false;
    $scope.configuration = configuration;

    // TODO Load default configuration from appcache if it exists before selecting default
    setDefaultConfiguration();

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
