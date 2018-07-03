angular.module('bhima.services')
  .service('FiscalService', FiscalService);

FiscalService.$inject = ['PrototypeApiService'];

/**
 * @class FiscalService
 * @extends PrototypeApiService
 *
 * This service is responsible for loading the Fiscal Years and Periods, as well
 * as providing metadata like period totals, opening balances and such.
 *
 * @requires PrototypeApiService
 */
function FiscalService(Api) {
  const service = new Api('/fiscal/');

  // TODO - rename this something like 'byDate()'
  service.closeFiscalYear = closeFiscalYear;
  service.fiscalYearDate = fiscalYearDate;
  service.setOpeningBalance = setOpeningBalance;
  service.getOpeningBalance = getOpeningBalance;
  service.getPeriods = getPeriods;

  service.getBalance = getBalance;

  /**
   * @method fiscalYearDate
   *
   * @description
   * Find the fiscal year for a given date.
   */
  function fiscalYearDate(params) {
    const url = service.url.concat('date');
    return service.$http.get(url, { params })
      .then(service.util.unwrapHttpResponse);
  }

  /**
   * @method getBalance
   *
   * @description
   * Gets the balance for the fiscal year using all transactions posted against
   * the fiscal year.
   */
  function getBalance(id, params) {
    const url = service.url.concat(id, '/balance');
    return service.$http.get(url, { params })
      .then(service.util.unwrapHttpResponse);
  }

  /**
   * @function getOpeningBalance
   *
   * @description
   * Returns the opening balance for all accounts in a fiscal year.
   */
  function getOpeningBalance(fiscalYearId) {
    const url = `${service.url}${fiscalYearId}/opening_balance`;
    return service.$http.get(url)
      .then(service.util.unwrapHttpResponse);
  }

  /**
   * @method setOpeningBalance
   *
   * @description set the opening balance for a fiscal year
   */
  function setOpeningBalance(params) {
    const url = service.url.concat(params.id, '/opening_balance/');
    return service.$http.post(url, { params })
      .then(service.util.unwrapHttpResponse);
  }

  /**
   * @method closing
   *
   * @description closing a fiscal year
   */
  function closeFiscalYear(id, params) {
    const url = service.url.concat(id, '/closing');
    return service.$http.put(url, { params })
      .then(service.util.unwrapHttpResponse);
  }

  /**
   * @method getPeriods
   *
   * @description
   * Retrieves the periods for a fiscal year by the fiscal year id.
   */
  function getPeriods(id) {
    const url = service.url.concat(id, '/periods');
    return service.$http.get(url)
      .then(service.util.unwrapHttpResponse)
      .then(periods =>
        periods.map(p => {
          p.start_date = new Date(p.start_date);
          p.end_date = new Date(p.end_date);
          return p;
        }));
  }

  return service;
}
