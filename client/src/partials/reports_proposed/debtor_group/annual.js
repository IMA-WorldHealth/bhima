angular.module('bhima.controllers')
.controller('DebtorGroupAnnualReportController', DebtorGroupAnnualReportController);

DebtorGroupAnnualReportController.$inject = [ '$http', 'reportConfigService'];

/**
* Debtor Group Annual PDF Report
*
* This report provides an overview of all debits and credits accrued by each
* debtor group over the selected fiscal year.  This should only be done for
* fiscal years that are closed, and therefore have closing balances posted.
*/
function DebtorGroupAnnualReportController($http, ReportConfigService) {
  var vm = this;

  vm.state = 'fresh';

  // TODO -- is this defined in a central location somewhere?  Maybe a service?
  // Configuration objects optionally passed to /report/build - drives configuration UI
  vm.configuration = ReportConfigService.configuration;

  vm.setLanguage = setLanguage;
  vm.generateDocument = generateDocument;
  vm.clearPath = clearPath;

  /* ------------------------------------------------------------------------ */

  // generic error handler
  function handler(error) {
    console.log('An error occurred:', error);
  }

  // start the module up.
  function startup() {

    // get the fiscal years
    $http.get('/fiscal')
    .then(function (response) {
      vm.fiscalYears = response.data;
    })
    .catch(handler);

    // set a default language
    setLanguage(vm.configuration.language.options[0]);
  }

  // set the desired language configuration
  function setLanguage(lang) {
    vm.configuration.language.selected = lang;
  }

  // POST configuration object to /report/build/:target
  function generateDocument(invalid) {

    // TODO -- find a better path name
    var path = '/report/build/debtor_group_annual_report';
    var configurationObject = {};

    // if it did not pass Angular's form validation, do not submit to the server
    if (invalid) { return; }

    // Temporarily set configuration options - This shouldn't be manually compiled
    configurationObject.language = vm.configuration.language.selected.value;
    configurationObject.fy = vm.fiscalYearId;

    // Update state
    vm.state = 'loading';

    $http.post(path, configurationObject)
    .then(function (response) {
      vm.generatedDocumentPath = response.data;
    })
    .catch(handler)
    .finally(function () { vm.state = 'done'; });
  }
  function clearPath() {
    vm.generatedDocumentPath = null;
  }

  startup();
}
