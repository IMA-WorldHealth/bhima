angular.module('bhima.controllers')
.controller('GroupInvoiceController', GroupInvoiceController);

GroupInvoiceController.$inject = [
  '$translate', 'connect', 'validate', 'messenger', 'uuid', 'SessionService',
];

/**
* Group Invoice Controller
*
* This controller allows conventions to pay for bills of patients.
*/
function GroupInvoiceController($translate, connect, validate, messenger, uuid, SessionService) {
  var vm = this;

  var dependencies = {};
  vm.action = 'default';
  vm.loading = false;
  vm.queue = [];

  // import session variables
  vm.project = SessionService.project;
  vm.enterprise = SessionService.enterprise;

  // bind methods
  vm.authorize = authorize;
  vm.setDebtor = setDebtor;
  vm.examineInvoice = examineInvoice;
  vm.enqueue = enqueue;
  vm.dequeue = dequeue;
  vm.pay = pay;
  vm.positive = positive;
  vm.retotal = retotal;

  /* ------------------------------------------------------------------------ */

  dependencies.invoices = {
    query : 'ledgers/debtor/'
  };

  dependencies.conventions = {
    required: true,
    query : {
      tables : {
        'debtor_group'  : {
          columns : ['uuid', 'name', 'account_id']
        }
      },
      where : [
        'debtor_group.is_convention<>0', 'AND',
        'debtor_group.enterprise_id=' + vm.project.enterprise_id
      ]
    }
  };

  dependencies.debtors = {
    required : true,
    query : {
      tables : {
        'debtor' : {
          columns : ['uuid', 'text']
        },
        'debtor_group' : {
          columns : ['account_id']
        }
      },
      join : ['debtor.group_uuid=debtor_group.uuid']
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
      join : ['enterprise.currency_id=currency.id'],
      where : ['enterprise.id=' + vm.enterprise.id]
    }
  };

  // startup the module
  function initialise() {
    validate.process(dependencies, ['debtors', 'conventions', 'currency'])
    .then(setUpModels)
    .catch(handler);
  }

  // generic error logger
  function handler(error) {
    console.log(error);
  }

  // select the debtor
  function setDebtor() {
    dependencies.invoices.query += vm.debtor.uuid;

    // turn on loading
    vm.loading = true;
    vm.showInvoices = true;

    validate.process(dependencies)
    .then(setUpModels)
    .catch(handler)
    .finally(function () {
      vm.loading = false;
    });

    vm.action = 'info';
  }

  // bind data to modules
  function setUpModels(models) {
    angular.extend(vm, models);

    vm.currency = models.currency.data[0];

    if (vm.invoices) {

      // FIXME: this is hack
      vm.invoices.data = vm.invoices.data.filter(function (d) {
        return d.balance !== 0;
      });

      // proper formatting
      vm.invoices.data.forEach(function (i) {
        i.invoiceRef = i.abbr + ' ' + i.reference;
      });
    }

    vm.payment = {};
  }

  function examineInvoice(invoice) {
    vm.examine = invoice;
    vm.action = 'examine';
  }

  function enqueue(idx) {
    var invoice = vm.invoices.data.splice(idx, 1)[0];
    invoice.payment = invoice.balance; // initialize payment to be the exact amount -- 100%
    vm.queue.push(invoice);

    vm.action = 'pay';

    // run totaller
    retotal();
  }

  function dequeue() {
    vm.queue.forEach(function (i) {
      vm.invoices.data.push(i);
    });

    // empty the queue
    vm.queue.length = 0;
    vm.action = 'default';

    // run totaller
    retotal();
  }

  function pay() {
    var payment = vm.payment;
    payment.project_id = vm.project.id;
    payment.group_uuid = vm.convention.uuid;
    payment.debtor_uuid  = vm.debtor.uuid;
    payment.total = vm.paymentBalance;
    payment.date = new Date();
    vm.action = 'confirm';
  }

  function retotal() {

    var sums = {
      balance : 0,
      debit   : 0,
      credit  : 0
    };

    vm.queue.reduce(function (totals, row) {
      totals.balance += row.payment;
      totals.debit += row.debit;
      totals += row.credit;
      return totals;
    }, sums);

    vm.balance = (sums.debit - sums.credit) - sums.balance;
    vm.paymentBalance = sums.balance;
  }

  function authorize() {
    var id,
        payment = connect.clean(vm.payment);

    payment.uuid = uuid();

    connect.post('group_invoice', [payment])
    .then(function () {
      id = payment.uuid;
      return connect.post('group_invoice_item', formatItems(id));
    })
    .then(function () {
      vm.action = 'default';
      vm.queue = [];
      return connect.fetch('/journal/group_invoice/' + id);
    })
    .then(function () {
      messenger.success($translate.instant('GROUP_INVOICE.SUCCES'));
    })
    .catch(handler);
  }

  function formatItems(id) {
    return vm.queue.map(function (i) {
      var item = {};
      item.uuid = uuid();
      item.cost = i.payment;
      item.invoice_uuid = i.inv_po_id;
      item.payment_uuid = id;
      return item;
    });
  }

  function positive(invoice) {
    return invoice.balance > 0;
  }

  initialise();
}
