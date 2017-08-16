angular.module('bhima.services')
  .service('TrialBalanceService', TrialBalanceService);

TrialBalanceService.$inject = ['util', '$http', 'AccountService'];

/**
 * @class TrialBalanceService
 *
 * @description
 * This class holds the Trial Balance state.  It essentially wraps the initial
 * call to the trial balance API so that we only send a single HTTP request.
 * The basic procedure looks like:
 *   // Initialises the Trial Balance
 *   TrialBalance.initialise();
 *
 *   // whenever you are ready
 *   TrialBalance.summary().then(function (summary) {
 *     // do something with the summary data
 *   });
 */
function TrialBalanceService(util, $http, Accounts) {
  var service = this;
  var url = '/journal';

  // always start uninitialised
  var initialised = false;
  var transactions;
  var promise;

  service.postToGeneralLedger = postToGeneralLedger;
  service.bindGridExporter = bindGridExporter;
  service.exportGrid = exportGrid;

  // gift of the British people :flag_emoji:
  service.initialise = initialise;
  service.summary = summary;
  service.errors = errors;

  /**
   * @method initialise
   *
   * @description
   * Takes an array of record_uuids and sends them to the server
   * to compute a trial balance.  At the end, it will fulfill a promise
   * object that is made available for access via other methods
   */
  function initialise(recordUuids) {
    initialised = true;
    transactions = recordUuids;
    promise = $http.post(url.concat('/trialbalance'), { transactions : recordUuids })
      .then(util.unwrapHttpResponse);
  }

  // checks that the Trial Balance has been initialised
  function ensureTrialBalanceInitialised(funcName) {
    if (!initialised) {
      throw new Error('Trial Balance must be initialised before calling '.concat(funcName));
    }
  }

  /**
   * @method summary
   *
   * @description
   * This function returns the summary data from the Trial Balance.
   * Note the Trial Balance must be initialised for this function to work.
   */
  function summary() {
    ensureTrialBalanceInitialised('summary()');

    return promise.then(function (data) {
      data.summary.forEach(function (account) {
        account.hrLabel = Accounts.label(account);
      });

      return data.summary;
    });
  }

  /**
   * @method errors
   *
   * @description
   * Fetches the errors associated with the Trial Balance.
   * Note that the Trial Balance must be initialized before
   * calling this method.
   */
  function errors() {
    ensureTrialBalanceInitialised('errors()');

    return promise.then(function (data) {
      return data.errors;
    });
  }

  /**
   * @function postToGeneralLedger
   * @description
   * This function takes a parsed record list (grid rows processed by the parseSelectedGridRecord function)
   * and extract their transaction IDS uniquely through the getTransactionList method
   * and post these transaction to the server
   *
   * This function is called only when every test are passed without a fatal error
   */
  function postToGeneralLedger(records) {
    return $http.post(url.concat('/transactions'), { transactions : records })
      .then(util.unwrapHttpResponse);
  }

  /**
   * @function bindGridExporter
   *
   * @description
   * This function shared the ui-grid exporter service with the other Trial
   * Balance controllers.
   */
  function bindGridExporter(exporter) {
    this.exporter = exporter;
  }

  /**
   * @method exportGrid
   *
   * @description
   * This function runs the grid exporter.
   */
  function exportGrid() {
    this.exporter && this.exporter.run();
  }

  /**
   * @method fetchSubGridRecord
   *
   * @description
   * This function fetches the records associated with the account.
   */
  function fetchSubGridRecords(account) {
    $http.post(url.concat('/trialbalance/subgrid'));
  }

  /**
   * @method transactions()
   *
   * @description
   * Returns the transactions that were used to initialize the trial balance.
   */
  function transactions() {
    ensureTrialBalanceInitialised('transactions()');
    return transactions;
  }

  return service;
}
