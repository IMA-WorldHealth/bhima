angular.module('bhima.controllers')
.controller('ReceiptCashController', ReceiptCashController);

ReceiptCashController.$inject = [
  'validate', 'appstate', 'messenger'
];

function ReceiptCashController (validate, appstate, messenger) {
  var vm           = this,
      dependencies = {},
      model        = vm.model = {common : {}},
      session      = vm.session = {};

  vm.updateCurrency = updateCurrency;

  function processCash(invoiceId) {
    dependencies.cash = {
      required: true,
      query:  {
        tables: {
          cash: { columns: ['reference', 'uuid', 'date', 'cost', 'deb_cred_uuid', 'currency_id'] },
          cash_item: { columns: ['cash_uuid', 'allocated_cost', 'invoice_uuid'] },
          sale: { columns : ['reference::saleReference']}
        },
        join: ['cash_item.cash_uuid=cash.uuid', 'cash_item.invoice_uuid=sale.uuid'],
        where: ['cash_item.cash_uuid=' + invoiceId]
      }
    };

    dependencies.getTransaction = {
      query : {
        identifier : 'uuid',
        tables : {
          cash : { columns : ['uuid'] },
          cash_item : { columns : ['cash_uuid'] },
          posting_journal : { columns : ['trans_id'] }
        },
        distinct : true,
        join  : ['cash.uuid=cash_item.cash_uuid','posting_journal.doc_num=cash.document_id'],
        where : ['cash.uuid=' + invoiceId]
      }
    };

    dependencies.getGeneraLedger = {
      query : {
        identifier : 'uuid',
        tables : {
          cash : { columns : ['uuid'] },
          cash_item : { columns : ['cash_uuid'] },
          general_ledger : { columns : ['trans_id'] }
        },
        distinct : true,
        join  : ['cash.uuid=cash_item.cash_uuid','general_ledger.doc_num=cash.document_id'],
        where : ['cash.uuid=' + invoiceId]
      }
    };

    dependencies.recipient = {
      required: true
    };

    dependencies.location = {
      required: true
    };

    return validate.process(dependencies, ['cash', 'getTransaction', 'getGeneraLedger'])
    .then(buildInvoiceQuery);
  }

  function buildInvoiceQuery(model) {
    var invoiceCondition = [],
        invoiceItemCondition = [];

    // Handling transactions
    if(model.getTransaction.data.length){
      session.journalTransaction = model.getTransaction.data.map(function(item){
        return item.trans_id;
      }).join(';');
    } else {
      session.journalTransaction = model.getGeneraLedger.data.map(function (item){
        return item.trans_id;
      }).join(';');
    }

    model.cash.data.forEach(function(invoiceRef, index) {
      if (index !== 0) {
        invoiceCondition.push('OR');
      }

      invoiceCondition.push('sale.uuid=' + invoiceRef.invoice_uuid);
      invoiceItemCondition.push('sale_item.sale_uuid=' + invoiceRef.invoice_uuid);

      if (index !== model.cash.data.length - 1) {
        invoiceItemCondition.push('OR');
      }
    });

    dependencies.invoice = {
      required: true,
      query: {
        tables: {
          'sale' : {
            columns: ['uuid', 'cost', 'currency_id', 'debitor_uuid', 'seller_id', 'invoice_date', 'note', 'project_id', 'reference']
          },
          'project' : {
            columns : ['abbr']
          }
        },
        join : ['sale.project_id=project.id'],
        where: invoiceCondition
      }
    };

    dependencies.invoiceItem = {
      required: true,
      query: {
        tables: {
          inventory : {
            columns: ['uuid', 'code', 'text']
          },
          sale_item : {
            columns: ['uuid', 'quantity', 'debit', 'credit', 'transaction_price', 'sale_uuid']
          }
        },
        join: ['sale_item.inventory_uuid=inventory.uuid'],
        where: invoiceItemCondition
      }
    };

    return validate.process(dependencies, ['invoice', 'invoiceItem'])
    .then(buildRecipientQuery);
  }

  function buildRecipientQuery(model) {
    var invoiceData = model.invoice.data[0];

    dependencies.recipient.query = {
      tables: {
        'patient' : {
          columns: ['first_name', 'last_name', 'middle_name', 'dob', 'current_location_id', 'reference', 'registration_date']
        },
        'project' : {
          columns: ['abbr']
        },
        'debitor' : {
          columns: ['text']
        },
        'debitor_group' : {
          columns : ['name', 'is_convention'],
        }
      },
      where: [
        'patient.debitor_uuid=' + invoiceData.debitor_uuid,
      ],
      join : [
        'patient.project_id=project.id',
        'patient.debitor_uuid=debitor.uuid',
        'debitor.group_uuid=debitor_group.uuid'
      ]
    };

    dependencies.currency = {
      query : {
        tables : {
          'currency' : {
            columns : ['id', 'symbol']
          }
        }
      }
    };

    dependencies.ledger = {
      identifier: 'inv_po_id'
    };

    dependencies.ledger.query = 'ledgers/debitor/' + invoiceData.debitor_uuid;

    return validate.process(dependencies, ['recipient', 'currency'])
    .then(buildLocationQuery);
  }

  function buildLocationQuery(model) {
    var recipient_data = model.recipient.data[0];
    vm.model.currency = model.currency;
    dependencies.location.query = 'location/detail/' + recipient_data.current_location_id;
    return validate.process(dependencies).then(invoice);
  }

  function invoice(invoiceModel) {
    model.cash = { allData : invoiceModel, invoice : {}, recipient : {} };
    model.cash.currentCurrency = model.cash.allData.currency.get(model.common.enterprise.currency_id);

    model.cash.cashTransaction = model.cash.allData.cash.data[model.cash.allData.cash.data.length-1];
    model.cash.invoice = model.cash.allData.invoice.data[model.cash.allData.invoice.data.length-1];
    model.cash.invoice.ledger = model.cash.allData.ledger.get(model.cash.invoice.uuid);
    model.cash.invoice.totalSum = model.cash.allData.invoice.data.reduce(sum, 0) || 0;

    model.cash.recipient = model.cash.allData.recipient.data[0];
    model.cash.recipient.location = model.cash.allData.location.data[0];

    session.currency_id = model.cash.cashTransaction.currency_id;
    session.cashTransactionCost = model.cash.cashTransaction.cost;
    model.selectedCurrency = model.currency.get(session.currency_id);

    updateCost(session.currency_id);
  }

  function sum (a,b) { return a + b.cost; }

  function updateCost(currency_id) {
    model.cash.invoice.localeCost = model.common.doConvert(model.cash.invoice.cost, currency_id, model.cash.invoice.invoice_date);
    if (model.cash.invoice.ledger)  {
      model.cash.invoice.localeBalance = model.common.doConvert(model.cash.invoice.ledger.balance, currency_id, model.cash.invoice.invoice_date);
      model.cash.invoice.ledger.localeCredit = model.common.doConvert(model.cash.invoice.ledger.credit, currency_id, model.cash.invoice.invoice_date);
    }

    model.cash.invoice.localeTotalSum = model.common.doConvert(model.cash.invoice.totalSum, currency_id, model.cash.invoice.invoice_date);

    model.cash.allData.invoiceItem.data.forEach(function (item) {
      item.localeTransaction = model.common.doConvert(item.transaction_price, currency_id, model.cash.invoice.invoice_date);
      item.localeCost = model.common.doConvert((item.credit - item.debit), currency_id, model.cash.invoice.invoice_date);
    });

  }

  function updateCurrency (currency_id) {
    session.currency_id = currency_id;
    updateCost(session.currency_id);
    updateCashTransaction(session.currency_id);
  }

  function updateCashTransaction (currency_id) {
    session.cashTransaction = model.cash.cashTransaction;
    /* FIXME handle Fc currency (currency_id===1) differently */
    if (session.cashTransaction.currency_id === 1) {
      // Selected currency equals cash transaction currency ?
      if (session.cashTransaction.currency_id !== currency_id) {
        session.cashTransactionCost = model.common.convert(session.cashTransaction.cost, session.cashTransaction.currency_id, model.cash.invoice.invoice_date);
      } else {
        session.cashTransactionCost = session.cashTransaction.cost;
      }

    } else {
      session.cashTransactionCost = model.common.doConvert(session.cashTransaction.cost, currency_id, model.cash.invoice.invoice_date);
    }
  }

  appstate.register('receipts.commonData', function (commonData) {
    commonData.then(function (values) {
      model.common.location = values.location.data.pop();
      model.common.enterprise = values.enterprise.data.pop();
      model.common.convert = values.convert;
      model.common.doConvert = values.doConvert;
      processCash(values.invoiceId)
      .catch(function (err){
        messenger.danger('error', err);
      });
    });
  });
}
