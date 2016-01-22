/**
 * The Cash Payments Controller
 *
 * This controller is responsible for binding the cash payments controller to
 * its view.  Cash payments can be made against future invocies (cautions) or
 * against previous invoices (sales).  The cash payments module provides
 * functionality to pay both in multiple currencies.
 *
 * @todo documentation improvements
 *
 * @module controllers/CashController
 */

angular.module('bhima.controllers')
.controller('CashController', CashController);

CashController.$inject = [
  '$scope', '$location', '$modal', '$q', 'connect', 'appcache',
  'appstate', 'messenger', 'validate', 'exchange', 'util', 'precision',
  'calc', 'uuid', 'SessionService'
];

function CashController($scope, $location, $modal, $q, connect, Appcache, appstate, messenger, validate, exchange, util, precision, calc, uuid, Session) {
  var vm = this;
  var cache = new Appcache('cash');
  var session;

  // bind data
  vm.user = Session.user;

  // bind methods
  vm.loadInvoices = loadInvoices;
  vm.setCashbox = setCashbox;

  /* ------------------------------------------------------------------------ */

  function loadCashbox() {
    cache.fetch('cashbox')
    .then(function (cashbox) {
      if (!cashbox) { return; }
    });
  }

  function setCashbox() {}

  function loadCurrency() {
    cache.fetch('currency');
  }

  function setup(models) {
    haltOnNoExchange();
  }

  function haltOnNoExchange () {
    if (exchange.hasDailyRate()) { return; }

    var instance = $modal.open({
      templateUrl: 'partials/exchangeRateModal/exchangeRateModal.html',
      keyboard:    false,
      size:        'md',
      controller:  'exchangeRateModal'
    });

    instance.result.then(function () {
      $location.path('/exchange');
    })
    .catch(function () {
      $scope.errorState = true;
    });
  }

  function handleErrors(error) {
    messenger.danger('Error:', JSON.stringify(error));
  }


  function loadInvoices(patient) {
    $scope.ledger = [];
    $scope.queue = [];
    $scope.patient = patient;

    // TODO -- why can't we just use the is_convention property?
    if (patient.is_convention === 1) {
      session.patient = 'is_convention';
    } else {
      session.patient = 'not_convention';
    }

    session.loading = true;

    // TODO -- error handling?
    connect.fetch('/ledgers/debitor/' + patient.debitor_uuid)
    .then(function (data) {

      // why doesn't this filter out zeros?
      $scope.ledger = data.filter(function (row) {
        return row.balance > 0;
      });
    })
    .finally(function () {
      session.loading = false;
    });
  }

  $scope.add = function add(idx) {
    var invoice = $scope.ledger.splice(idx, 1)[0];
    invoice.allocated = 0;
    $scope.queue.push(invoice);
  };

  $scope.remove = function remove(idx) {
    $scope.ledger.push($scope.queue.splice(idx, 1)[0]);
  };

  function addTotal(n, m) {
    return precision.round(n + m.locale);
  }

  $scope.digestTotal = function () {
    $scope.data.raw = $scope.queue.reduce(addTotal, 0);
    if (!$scope.cashbox) { return; }
    var dirty = calc($scope.data.raw, $scope.currency.currency_id);
    $scope.data.total = dirty.total;
    $scope.data.difference = dirty.difference;

    // digest overdue
    var over  = precision.round($scope.data.payment - $scope.data.total, 3);
    $scope.data.overdue = over > 0 ? over : 0;
  };

  $scope.digestInvoice = function () {
    if (!$scope.queue) { return null; }

    var proposed = $scope.data.payment || 0;

    $scope.queue.forEach(function (invoice) {
      if (proposed < 0) {
        invoice.allocated = 0;
        return null;
      }

      var diff = precision.round(proposed - invoice.locale);
      invoice.allocated = diff >= 0 ? invoice.locale : proposed;
      proposed = diff >= 0 ? diff : 0;

      invoice.remaining = precision.compare(invoice.locale, invoice.allocated);
    });

    var over  = $scope.data.payment - $scope.data.total;
    $scope.data.overdue = over > 0 ? over : 0;

  };

  function initPayment () {
    var id, date, invoice, instance, defer = $q.defer();

    date = util.sqlDate(new Date());

    invoice = {
      date : date,
      document_id : id,
      description : [$scope.project.abbr + '_CAISSEAUX', id, $scope.patient.last_name, date].join('/')
    };

    if ($scope.data.overdue) {
      instance = $modal.open({
        templateUrl : 'partials/cash/justify_modal.html',
        backdrop    : 'static',
        keyboard    : false,
        controller  : 'CashJustifyModalController as ModalCtrl',
        resolve : {
          data : function () {
            return $scope.data;
          }
        }
      });

      instance.result.then(function (description) {
        if (description) { invoice.description += ' ' + description; }
        defer.resolve({invoice : invoice, creditAccount : !!description });
      }, function () {
        defer.reject();
      });
    } else {
      defer.resolve({ invoice : invoice, creditAccount : false });
    }

    return defer.promise;
  }

  $scope.invoice = function invoice () {
    var payment, records, creditAccount, id = uuid();

    initPayment()
    .then(function (data) {
      // pay the cash payment
      creditAccount = data.creditAccount;
      var account = $scope.cashbox_accounts.get($scope.currency.currency_id);

      payment = data.invoice;
      payment.uuid = id;
      payment.type = 'E';
      payment.project_id = $scope.project.id;
      payment.debit_account = account.account_id;
      payment.credit_account = $scope.patient.account_id;
      payment.currency_id = $scope.currency.currency_id;
      payment.cost = precision.round($scope.data.payment);
      payment.deb_cred_uuid = $scope.patient.debitor_uuid;
      payment.deb_cred_type = 'D';
      payment.cashbox_id = $scope.cashbox.id;
      payment.reference = 1; // TODO : This is a mistake

      payment.user_id = $scope.user.id;

      return connect.post('cash', [payment]);
    })
    .then(function () {
      // pay each of the cash items
      records = [];

      $scope.queue.forEach(function (record) {
        if (record.allocated < 0) { return; }
        records.push({
          uuid           : uuid(),
          cash_uuid      : id,
          allocated_cost : precision.round(record.allocated),
          invoice_uuid   : record.inv_po_id
        });
      });

      if (creditAccount) {
        records.push({
          uuid : uuid(),
          cash_uuid : id,
          allocated_cost : precision.round($scope.data.payment - $scope.data.raw),
          invoice_uuid : null
        });
      }

      return connect.post('cash_item', records);
    })
    .then(function () {
      return connect.fetch('/journal/cash/' + id);
    })
    .then(function () {
      $location.path('/invoice/cash/' + id);
    })
    .catch(function (err) {
    })
    .finally();
  };

  // FIXME: This is suboptimal, but very readable.
  // Everytime a cashbox changes or the ledger gains
  // or loses items, the invoice balances are
  // exchanged into the appropriate locale currency.

  // NOTE -- $watchCollection is not appropriate here
  // far too shallow
  $scope.$watch('queue', $scope.digestTotal, true);
  $scope.$watch('data.payment', $scope.digestInvoice);
}
