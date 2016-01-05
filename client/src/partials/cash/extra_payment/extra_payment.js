angular.module('bhima.controllers')
.controller('ExtraPaymentController', ExtraPaymentController);

ExtraPaymentController.$inject = [
  '$http', '$translate', 'validate', 'messenger', 'appcache', 'exchange', '$window', 'SessionService'
];

/**
* Extra Payment Controller
*
* This controller powers the extra payments interface, allowing users to record
* payments made externally to bhima's cash system and close out sale records.  this
* is useful if the system has been misused (such as using cautions rather than cash
* payments to balance a debtor's account).
*/
function ExtraPaymentController($http, $translate, validate, messenger, Appcache, exchange, $window, Session) {
  var vm = this;

  // initialise in the default (configuration) state
  vm.state = 'default';
  vm.user = Session.user;
  vm.project = Session.project;
  vm.loading = false;

  // bind methods
  vm.print = function () { $window.print(); };
  vm.search = search;
  vm.reconfigure = reconfigure;
  vm.setCurrency = setCurrency;
  vm.submit = submit;

  vm.formatAccount = formatAccount;
  vm.formatPatient = formatPatient;

  /* ------------------------------------------------------------------------ */

  var dependencies = {},
      cache = new Appcache('extra');

  dependencies.patients = {
    required : true,
    query : {
      tables : {
        patient : {columns : ['uuid', 'project_id', 'reference', 'debitor_uuid', 'first_name', 'last_name', 'middle_name', 'sex', 'dob', 'origin_location_id', 'registration_date']},
        debitor : { columns : ['text']},
        debitor_group : { columns : ['account_id', 'price_list_uuid', 'is_convention']},
        project : { columns : ['abbr']}
      },
      join : ['patient.debitor_uuid=debitor.uuid', 'debitor.group_uuid=debitor_group.uuid', 'patient.project_id=project.id']
    }
  };

  dependencies.accounts = {
    query : {
      tables : {
        'account' :{
          columns : ['id', 'account_txt', 'account_number']
        }
      },
      where : ['account.classe=4']
    }
  };

  dependencies.currencies = {
    query : {
      tables : {
        'currency' : {
          columns : ['id', 'name', 'symbol']
        }
      }
    }
  };

  function formatPatient(patient) {
    return patient ? [patient.first_name, patient.last_name, patient.middle_name].join(' ') : '';
  }

  function formatAccount(account) {
    if (account) {
      return account.account_number + ' - ' + account.account_txt;
    }
  }

  function processModels(models) {

    // expose to view
    angular.extend(vm, models);
  }

  function handler(err) {
    messenger.danger('An error occured:' + JSON.stringify(err));
  }

  function search() {
    vm.state = 'generate';
    vm.loading = true;

    var id = vm.patient.debitor_uuid;

    $http.get('/ledgers/debitor/' + id)
    .then(function (response) {
      var rows = response.data;

      var items = rows.filter(function (row) {
        return row.balance > 0;
      });

      items.forEach(function (row) {
        row.transaction = row.abbr + row.reference;
        row.cost = row.balance;
        row.currency = vm.project.currency_id;
        row.currency_id = vm.project.currency_id;
      });

      // we should this in the database.  No reason to send data we
      // will not use to the client
      vm.data = filterUnique(items, 'transaction');
    })
    .catch(handler)
    .finally(function () {
      vm.loading = false;
    });
  }

  // filter an array of objects ensuring a unique key
  function filterUnique(array, key) {
    var k,
        filter = {},
        unique = [];

    array.forEach(function (element, idx) {
      k = array[idx][key];
      if (typeof(unique[k]) === 'undefined') {
        unique.push(array[idx]);
      }
      unique[k] = 1;
    });

    return unique;
  }

  function setCurrency(obj) {
    if (obj.currency !== vm.project.currency_id && obj.currency_id === vm.project.currency_id) {
      obj.balance = obj.balance * exchange.rate(null, obj.currency);
      obj.cost = obj.balance;
      obj.currency_id = obj.currency;
    } else if (obj.currency === vm.project.currency_id && obj.currency_id !== vm.project.currency_id) {
      obj.balance = obj.balance / exchange.rate(null, obj.currency_id);
      obj.cost = obj.balance;
      obj.currency_id = obj.currency;
    }
  }

  function initialise() {
    validate.process(dependencies)
    .then(processModels, handler);

    cache.fetch('account')
    .then(getAccount);
  }

  function submit(sale) {
    var details = {
      user_id      : vm.user.id,
      project_id   : vm.project.id,
      sale_uuid    : sale.inv_po_id,
      wait_account : vm.account.id,
      debitor_uuid : sale.deb_cred_uuid,
      cost         : sale.cost || 0,
      currency_id  : sale.currency_id
    };

    $http.post('/extraPayment/', {
      params : {
        user_id : details.user_id,
        sale_uuid : details.sale_uuid,
        details : details
      }
    })
    .then(function () {
      return validate.refresh(dependencies);
    })
    .then(function () {
      messenger.success($translate.instant('UTIL.SUCCESS'), true);
    })
    .catch(handler);
  }

  function reconfigure() {
    vm.state = 'default';
  }

  function getAccount(account) {
    if (!account) { return; }
    vm.account = account;
  }

  // startup
  initialise();
}
