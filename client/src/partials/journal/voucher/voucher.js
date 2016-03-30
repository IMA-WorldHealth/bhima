angular.module('bhima.controllers')

// TODO Move the shared data login into a service
.controller('JournalVoucherController', JournalVoucherController)
.controller('JournalVoucherTableController', JournalVoucherTableController);

JournalVoucherController.$inject = [ '$scope', '$http', 'appcache', '$uibModal' ];

/**
* This controller wraps all the global metadata
* for the journal voucher and the JournalVoucherTableController.
* It is responsible for validation checks, submitting
* the form, and any error handling.
*
* AngularJS only allows child $scopes access to parents (via
* prototypical inheritence on the $parent property), so we define
* the transaction rows here (master.rows).  All the mechanics of
* adding and removing rows is done in JournalVoucherTableController,
* however the final validation check is done here in the function
* correctTableInput().
*
* This is one of the better models for sharing data we have
* used so far...  Can we do better?
*
* EDIT: yes, we can do better.  These should use a service to share
* data.
*/
function JournalVoucherController($scope, $http, AppCache, Modal) {
  var dependencies = {},
      isDefined = angular.isDefined,

      // cache TODO
      db = new AppCache('JournalVoucher');

  // alias this
  var vm = this;

  // trigger error/success text for the transaction table
  vm.clientTableError = false;
  vm.serverSuccessMessage = false;
  vm.serverFailureMessage = false;

  // current timestamp
  vm.today = new Date();

  vm.showComment = false;
  vm.hasCachedForm = false;

  // the master form
  // We must define this on the $scope so that the
  // child can access it via $scope.$parent
  $scope.master = vm.master = {
    date : vm.today,
    rows : [] // the child
  };

  vm.openReferenceLookupModal = openReferenceLookupModal;

  // load dependencies
  $http.get('/currencies')
  .then(function (response) {
    vm.currencies = response.data;
  })
  .catch(function (error) {
    console.error(error);
  });

  // toggle comment field
  vm.toggleComment = function () {
    vm.showComment = !vm.showComment;
  };

  // do the final submit checks
  vm.submitForm = function () {
    vm.serverFailureMessage = false;
    vm.serverSuccessMessage = false;

    // cache the working form in case something breaks
    cacheWorkingForm();

    // validation of table rows
    if (!correctTableInput()) {
      vm.clientTableError = true;
      return;
    }

    // submit to the server
    $http.post('/finance/journalvoucher', { data : $scope.master })

    // success!  Clear the data to start again.
    .then(function (response) {

      // if everything went correctly, remove the old copy
      removeCachedForm();

      vm.serverSuccessMessage = response.data;

      // reset form validation checks
      $scope.VoucherForm.$setPristine();

      // new form set up
      vm.master = $scope.master = { date : vm.today, rows : [] };

      // tell the child controller to import the new form
      $scope.$broadcast('table.reset');
    })

    // something went wrong... log it!
    .catch(function (error) {
      vm.serverFailureMessage = error.data;
    });
  };

  // ensure that the table portion is valid before submitting
  function correctTableInput() {

    // validate that the rows contain the correct format
    var validRows = vm.master.rows.every(function (row) {

      // must have a one non-zero value
      var validAmount =
          (row.debit > 0 && !row.credit) ||
          (!row.debit && row.credit > 0);

      // must have either a debitor/creditor switch
      // or an account
      var validAccount =
          (isDefined(row.deb_cred_uuid) && isDefined(row.deb_cred_type)) ||
           isDefined(row.account_id);

      return validAmount && validAccount;
    });

    // validate that the transaction balances
    var totals = vm.master.rows.reduce(function (aggregate, row) {
      aggregate.debit += row.debit;
      aggregate.credit += row.credit;
      return aggregate;
    }, { debit : 0, credit : 0 });

    var validTotals = totals.debit === totals.credit;

    // validate that there is only one cost or profit center per line
    var validCenters = vm.master.rows.every(function (row) {
      return !(row.cc_id && row.pc_id);
    });

    // TODO
    // Should we include specific error messages (the debits/credits
    // do not balance, missing an account?)
    // It would be easy to do, but very verbose, especially considering
    // translation..
    return validRows && validTotals && validCenters;
  }

  // stores the 'master' form in the browser cache in
  // case anything goes wrong.
  function cacheWorkingForm() {
    db.put('CachedForm', vm.master);
  }

  // look to see if there is an old form in the broswer cache
  function findCachedForm() {
    db.fetch('CachedForm')
    .then(function (data) {
      if (data) { vm.hasCachedForm = true; }
    });
  }

  function removeCachedForm() {
    db.remove('CachedForm');
  }

  // load an old form from the browser cache
  vm.loadCachedForm = function () {
    db.fetch('CachedForm')
    .then(function (data) {
      if (data) {

        // load meta-data
        vm.master.date = data.date;
        vm.master.description = data.description;
        vm.master.currencyId = data.currencyId;
        vm.master.comment = data.comment;
        vm.master.documentId = data.documentId;

        // show if has a cached comment/documentId
        vm.showComment = !!data.comment;
        vm.showReference = !!data.documentId;

        // load the rows into the master
        vm.master.rows.length = 0;
        data.rows.forEach(function (row) {
          vm.master.rows.push(row);
        });

        // remove the button from the UI
        vm.hasCachedForm = false;

        // tell the child controller to retotal
        $scope.$broadcast('table.retotal');
      }
    });
  };

  function openReferenceLookupModal() {
    var instance = Modal.open({
      size : 'md',
      controller : 'ReferenceLookupModalController as ReferenceLookupModalCtrl',
      templateUrl : 'partials/journal/modals/references.modal.html',
      keyboard : false
    });

    /** bind the reference to the view */
    instance.result.then(function (result) {
      vm.master.documentId = ['[', result.reference, '] ', result.type].join('');
      vm.master.document_id = result.uuid;
    });
  }

  // auto-detect if there is an old form
  findCachedForm();
}

JournalVoucherTableController.$inject = ['$http', '$q', '$scope'];

/**
* This controller is somewhat complex because it handles the
* behavior of either specifying an account OR a debtor/creditor
* to debit/credit in the journal voucher table.
*
* If the user has seleted an account, we must remove the deb_cred_type
* before submitting to the server. This is done in the .submitForm()
* method of the parent controller.
*
* If the user has selected a debtor/creditor, we must be sure that the
* row contains
*   1) the account_id associated with the debtor/creditor
*   2) the debtor/creditor uuid
*   3) the debtor/creditor type
* Most of these are taken care of automatically by the user
* when selecting the debtor/creditor.
*
* Every time a row is updated, the totals must be recalculated.  Since a
* transaction can only be in one currency, we don't need to know the
* currency - simply that the transaction balances.  The currency is specified
* in the parent controller (JournalVoucherController).
*/
function JournalVoucherTableController($http, $q, $scope) {
  // alias this
  var vm = this;

  // vm is the format of the rows in the journal voucher table
  function generateRow() {
    return {
      account_id    : undefined,
      deb_cred_uuid : undefined,
      deb_cred_type : 'D',
      debit         : 0,
      credit        : 0,
      cc_id         : undefined,
      pc_id         : undefined,
      selectAccount : true,       // by default, filter accounts
    };
  }

  // reset when all done
  $scope.$on('table.reset', function () {
    vm.rows = $scope.$parent.master.rows;
    vm.rows.push(generateRow());
    vm.rows.push(generateRow());
    vm.totalCredit();
    vm.totalDebit();
  });

  $scope.$on('table.retotal', function () {
    vm.totalCredit();
    vm.totalDebit();
  });

  // pull in parent rows
  vm.rows = $scope.$parent.master.rows;

  // start out with two rows
  vm.rows.push(generateRow());
  vm.rows.push(generateRow());

  vm.totals = {
    credits : 0,
    debits : 0
  };

  /* Load dependencies */

  // error handler
  function handle(error) {
    console.error(error);
  }

  // load all accounts
  $http.get('/accounts?type=ohada')
  .then(function (response) {
    vm.accounts = response.data;
  })
  .catch(handle);

  // load debtors
  $http.get('/finance/debtors')
  .success(function (data) {
    vm.debtors = data;
  })
  .error(handle);

  // load creditors
  $http.get('/finance/creditors')
  .success(function (data) {
    vm.creditors = data;
  })
  .error(handle);

  // load profit + cost centers
  $http.get('/finance/profitcenters')
  .success(function (data) {
    vm.profitcenters = data;
  })
  .error(handle);

  $http.get('/finance/costcenters')
  .success(function (data) {
    vm.costcenters = data;
  })
  .error(handle);

  /* Toggles */

  // switches between the account typeahead
  // and the debtor/creditor typeahead
  vm.toggleAccountSwitch = function (row) {
    row.selectAccount = !row.selectAccount;
  };

  // switches the debtor or creditor type
  // NOTE switching debtor/creditor type destroys
  // previously cached data
  vm.setDebtorOrCreditorType = function (row, type) {
    row.deb_cred_uuid = null;
    row.entity = null;
    row.deb_cred_type = type;
  };

  /* Totalling */

  // total debits
  vm.totalDebit = function () {
    vm.totals.debits = vm.rows.reduce(function (total, row) {
      return total + row.debit;
    }, 0);
  };

  // total credits
  vm.totalCredit = function () {
    vm.totals.credits = vm.rows.reduce(function (total, row) {
      return total + row.credit;
    }, 0);
  };

  /* Row Controls */

  // adds a row to the table
  vm.addRow = function () {
    vm.rows.push(generateRow());
  };

  // removes a row from the table
  vm.removeRow = function (idx) {
    vm.rows.splice(idx, 1);
  };

  /* formatters */
  vm.fmtAccount = function (account) {
    return account ?  account.number + ' ' +  account.label : '';
  };

  // Set a debtor or creditor for the row
  // First, remove the old account_id.
  // Then, set the deb_cred_uuid and account_id properly
  vm.setDebtorOrCreditor = function (row) {
    row.account_id = row.entity.account_id;
    row.deb_cred_uuid = row.entity.uuid;
  };

  // set the account for a row
  // remove all debtor/creditor properties that may
  // have been set on a previous selection
  vm.setAccount = function (row) {
    row.account_id = row.account.id;
    row.deb_cred_uuid = null;
    row.entity = null;
  };
}
