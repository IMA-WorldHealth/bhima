angular.module('bhima.controllers')
.controller('StockStatusReportController', StockStatusReportController);

StockStatusReportController.$inject = ['$http', '$timeout'];

/**
* Stock Status Report
*
* This controller gives a broad overview of stock levels, expiration times,
* lead times, and more for all depots.
*
* NOTES
*  1) I have removed "quantity to order", as I think this should really be a
*     parameter provided by an alert.  Currently, our calculations are inaccurate
*     due to poor data.
*/
function StockStatusReportController($http, $timeout) {
  var vm = this;

  vm.loading = true;
  vm.timestamp = new Date();
  vm.report = {};

  /* ------------------------------------------------------------------------ */

  // start up the module
  $http.get('/inventory/status')
  .then(template)
  .catch(handler)
  .finally(function () {

    // use $timeout trick to delay rendering until all other rendering is done
    $timeout(endLoading);
  });

  function endLoading() {
    vm.loading = false;
  }

  // template the data into the view
  function template(response) {
    var report;

    // FIXME - we are hard-coding procurement period to 1 until there is a
    // good system for estimating procurement period.
    var pp = 1;

    // filter out items that are missing both a quantity and a lead time.  This
    // should ensure that we have only relevant data.
    report = response.data.filter(function (row) {
      return (row.quantity > 0 || row.leadtime !== null);
    });

    // calculate the security/safety stock if applicable
    // NOTE -- this goes by the "old" formula.  What do we do with this in the
    // case of stock integration?  What about donations?
    report.forEach(function (row) {

      // TODO
      // For stock integrations and donations, the lead time does not exist.
      // How should the system handle security stock calculations when the
      // lead time doesn't exist?

      // security stock is defined as leadtime multiplied by avg consumption
      // rate
      row.securityStock = row.leadtime !== null ?
          row.leadtime * row.consumption:
          null;

      // make sure we have nice formatting for days remaining column.
      row.remaining = Math.floor(row.remaining);

      // calculate consumption by month on the fly from the
      // NOTE: every month does not have exactly 30 days, but this is an
      // approximation anyway.
      row.consumptionByMonth = Math.round(row.consumption * 30);

      // like consumption by month, show months of stock remaining.
      row.monthsRemaining = row.consumptionByMonth ?
        (row.quantity  / row.consumptionByMonth).toFixed(2) :
        0;

      // FIXME
      // These are temporary patches until we have more data to work with.
      // This type of analysis should be done on the server as well
      row.shortage = row.consumptionByMonth !== 0 && row.monthsRemaining < 3;
      row.minimumStock = (row.securityStock || 0) * 2;
      row.maximumStock = (row.consumptionByMonth || 0)*pp + row.minimumStock;

      // if there is an alert, we template it in
      row.alert = row.stockout ? 'STOCK.ALERTS.STOCKOUT' :
                  row.shortage ? 'STOCK.ALERTS.SHORTAGE' :
                  row.overstock ? 'STOCK.ALERTS.OVERSTOCK' :
                  false;
    });

    vm.report = report;
  }

  // generic error handler
  function handler(error) {
    console.log(error);
  }

}
