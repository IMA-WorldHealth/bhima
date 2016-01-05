angular.module('bhima.controllers')
.controller('TrialBalancePrintController', [
  '$http',
  'precision',
  'JournalPrintService',
  function ($http, precision, PrintService) {
    // alias controller object
    var self = this;

    // timestamps FTW
    self.timestamp = new Date();

    // retrieve the transactions
    var data = PrintService.getData();

    // NOTE: data is not saved in AppCache, since it
    // might bring up old balances,  We could store the
    // timestamp there, but would a user see it?
    //
    // Therefore, we will simply print an error message
    // when the "refresh" button is hit, and the user
    // must restart their trial balance.
    self.hasData = angular.isDefined(data.balances);

    if (self.hasData) {

      // expose to view
      self.balances = data.balances;
      self.metadata = data.metadata;
      self.exceptions = data.exceptions;

      // pretty hooks
      self.hasExceptions = self.exceptions.length > 0;
      self.hasErrors = self.exceptions.some(function (e) { return e.fatal; });

      // sum the totals up
      self.totals  = self.balances.reduce(function (totals, row) {
        totals.before += row.balance;
        totals.debit += row.debit;
        totals.credit += row.credit;
        totals.after += (row.balance + precision.round(row.credit - row.debit));
        return totals;
      }, { before : 0, debit : 0, credit : 0, after : 0 });
    }
  }
]);
