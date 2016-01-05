angular.module('bhima.controllers')
.controller('TrialBalanceController', [
  '$modalInstance',
  '$location',
  '$http',
  'precision',
  'transactions',
  'JournalPrintService',
  function ($modalInstance, $location, $http, precision, transactions, PrintService) {

    // alias controller object
    var self = this;

    // globals
    self.totals = {};
    self.state = 'loading';

    // load data and perform totalling
    $http.post('/journal/trialbalance', { transactions : transactions })
    .then(function (response) {
      self.state = 'default';

      // attach to controller
      self.balances = response.data.balances;
      self.metadata = response.data.metadata;
      self.exceptions = response.data.exceptions;

      // helper toggles
      self.hasExceptions = self.exceptions.length > 0;
      self.hasErrors = self.exceptions.some(function (e) {
        return e.fatal;
      });

      // sum the totals up
      self.totals  = self.balances.reduce(function (totals, row) {
        totals.before += row.balance;
        totals.debit += row.debit;
        totals.credit += row.credit;
        totals.after += (row.balance + precision.round(row.credit - row.debit));
        return totals;
      }, { before : 0, debit : 0, credit : 0, after : 0 });

      // make sure exceptions with fewer than 9 items are displayed
      // open ('visible') by default
      self.exceptions.forEach(function (e) {
        if (e.transactions.length < 9) {
          e.visible = true;
        }
      });
    })
    .catch(function (error) {
      console.error(error);
    });

    // TODO
    // implement posting to the general ledger with error handling
    self.postToGeneralLedger = function submit () {
      $http.post('/journal/togeneralledger', { transactions : transactions })
      .then(function () {
        $modalInstance.close();
      })
      .catch(function (error) {
        console.log(error);
        $modalInstance.close(error);
      });
    };

    // kill the modal and resume posting journal editting
    self.cancelModal = function () {
      $modalInstance.dismiss();
    };

    // print the trial balance in a separate HTML page
    self.print = function print () {

      // share data with the trial balance printer
      PrintService.setData({ balances : self.balances, metadata: self.metadata, exceptions : self.exceptions });

      // go to the controller
      $location.path('/trialbalance/print');
      $modalInstance.dismiss();
    };

    // switches between viewing the trial balance
    // and the errors in the trial balance
    self.toggleExceptionState = function () {
      self.state = (self.state === 'exception') ? 'default' : 'exception';
    };

    // reveals the transactions of a certain exception
    self.toggleVisibility = function (e) {
      e.visible = !e.visible;
    };
  }
]);
