angular.module('bhima.controllers')
.controller('support', [
  '$scope',
  '$translate',
  'connect',
  'validate',
  'appstate',
  'messenger',
  'uuid',
  'SessionService',
  function ($scope, $translate, connect, validate, appstate, messenger, uuid, SessionService) {

    var dependencies = {};
    $scope.action = '';
    $scope.employee = '';
    $scope.selected = {};
    $scope.paying = [];

    dependencies.invoices = {
      query : 'ledgers/debitor/'
    };

    dependencies.employees = {
      required: true,
      query : {
        tables : {
          'employee'  : {
            columns : ['creditor_uuid','name', 'postnom', 'prenom', 'id']
          }
        },
        where : ['employee.locked<>1']
      }
    };

    dependencies.debitors = {
      required : true,
      query : {
        tables : {
          'debitor' : {
            columns : ['uuid', 'text']
          },
          'debitor_group' : {
            columns : ['account_id']
          }
        },
        join : ['debitor.group_uuid=debitor_group.uuid']
      }
    };

    dependencies.currency = {
      required : true,
      query : {
        tables : {
          'enterprise' : {
            columns : ['currency_id']
          },
          'currency' : {
            columns : ['symbol']
          }
        },
        join : ['enterprise.currency_id=currency.id']
      }
    };

    $scope.project = SessionService.project;
    //dependencies.invoices.query.where = ['posting_journal.project_id=' + $scope.project.id];
    validate.process(dependencies, ['debitors', 'employees', 'currency']).then(setUpModels);

    $scope.setDebitor = function () {
      if (!$scope.selected.debitor) {
        return messenger.danger('Error: No debitor selected');
      }

      dependencies.invoices.query += $scope.selected.debitor.uuid;
      validate.process(dependencies).then(setUpModels);
      $scope.hasDebitor = true;
      $scope.action = 'info';
    };

    function setUpModels (models) {
      angular.extend($scope, models);      
      if ($scope.invoices) {
        $scope.invoices.data = $scope.invoices.data.filter(function (d) {
          return d.balance !== 0;
        });
      }
      $scope.payment = {};
    }

    $scope.examineInvoice = function (invoice) {
      $scope.examine = invoice;
      $scope.old_action = $scope.action;
      $scope.action = 'examine';
    };

    $scope.back = function () {
      $scope.action = $scope.old_action;
    };

    $scope.selectConvention = function () {
      $scope.action = 'selectConvention';
      $scope.original_id = $scope.data.invoice.employee_id;
    };

    $scope.saveConvention = function () {
      $scope.action = '';
    };

    $scope.resetConvention = function () {
      $scope.data.invoice.employee_id = $scope.original_id;
      $scope.action = 'default';
    };

    $scope.enqueue = function (idx) {
      var invoice = $scope.invoices.data.splice(idx, 1)[0];
      invoice.payment = invoice.balance; // initialize payment to be the exact amount -- 100%
      $scope.paying.push(invoice);
      $scope.action = 'pay';
    };

    $scope.dequeue = function () {
      $scope.paying.forEach(function (i) {
        $scope.invoices.data.push(i);
      });
      $scope.paying.length = 0;
      $scope.action = '';
    };

    $scope.pay = function () {
      var payment = $scope.payment;
      payment.project_id = $scope.project.id;
      payment.creditor_uuid = $scope.selected.employee.creditor_uuid;
      payment.debitor_uuid  = $scope.selected.debitor.uuid;
      payment.total = $scope.paymentBalance;
      payment.date = new Date().toISOString().slice(0,10);
      $scope.action = 'confirm';
    };

    $scope.$watch('paying', function () {
      var s = 0, total_debit = 0, total_credit = 0;
      $scope.paying.forEach(function (i) {
        s = s + i.payment;
        total_debit += i.debit;
        total_credit += i.credit;         
      });
      var balance = total_debit - total_credit;
      $scope.balance =  balance - s;      
      $scope.paymentBalance = s;
    }, true);

    $scope.authorize = function () {
      var id, items, payment = connect.clean($scope.payment);
      payment.uuid = uuid();

      connect.post('employee_invoice', [payment])
      .then(function () {
        id = payment.uuid;
        items = formatItems(id);
        return connect.post('employee_invoice_item', items);
      })
      .then(function () {
        $scope.action = '';
        $scope.paying = [];
        return connect.fetch('/journal/employee_invoice/' + id);
      })
     .then(function () {
        messenger.info($translate.instant('SUPPORT.SUCCES'));       
      });       
    };

    function formatItems (id) {
      var items = [];
      $scope.paying.forEach(function (i) {
        var item = {};
        item.uuid = uuid();
        item.cost = i.payment;
        item.invoice_uuid = i.inv_po_id;
        item.payment_uuid = id;
        items.push(item);
      });

      return items;
    }

    $scope.filter = function (invoice) {
      return invoice.balance > 0;
    };
  }
]);
