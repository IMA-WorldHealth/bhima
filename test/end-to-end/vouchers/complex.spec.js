/* global by */

const helpers = require('../shared/helpers');
const components = require('../shared/components');
const ComplexVoucherPage = require('./complex.page');
const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');

describe('Complex Vouchers', () => {
  before(() => helpers.navigate('vouchers/complex'));

  it('creates a complex voucher', function () {
    const page = new ComplexVoucherPage();

    // set a new timeout to avoid warnings
    this.timeout(45000);

    /*
     * the voucher we will use in this page
     * NOTE: the Caisse Principale USD is a financial account which involve that we
     * specify the transfer type
     */
    const voucher = {
      date        : new Date(),
      description : 'Complex voucher test e2e',
      rows        : [
        {
          account : 'CASH PAYMENT CLIENT', debit : 18, credit : 0, entity : { type : 'D', name : 'Test 2 Patient' },
        },
        {
          account : 'Caisse Principale USD', debit : 0, credit : 8, reference : { type : 'voucher', index : 0 },
        },
        {
          account : 'CASH PAYMENT CLIENT', debit : 0, credit : 5, reference : { type : 'voucher', index : 2 },
        },
        {
          account : 'CASH PAYMENT CLIENT', debit : 0, credit : 5, reference : { type : 'voucher', index : 1 },
        },
        {
          account : 'Caisse Principale USD', debit : 7, credit : 0, entity : { type : 'C', name : 'SNEL' },
        },
        {
          account : 'CASH PAYMENT CLIENT', debit : 0, credit : 7, reference : { type : 'patient-invoice', index : 1 },
        },
      ],
    };

    // configure the date to today
    page.date(voucher.date);

    // set the description
    page.description(voucher.description);

    // set the currency to USD
    page.currency(2);

    // add four rows
    page.addRow();
    page.addRow();
    page.addRow();
    page.addRow();

    // loop through each row and assign the correct form values
    voucher.rows.forEach((row, idx) => {
      const current = page.row(idx);
      current.account(row.account);
      current.debit(row.debit);
      current.credit(row.credit);
      if (row.entity) {
        current.entity(row.entity.type, row.entity.name);
      }
      if (row.reference) {
        current.reference(row.reference.type, row.reference.index);
      }
    });

    /*
     * set the transaction type to one which have a specific Id
     * (e.g. cash payment Id is 1)
     * @see client/src/js/services/VoucherService.js
     */
    page.transactionType('Autres R');

    // submit the page
    page.submit();

    // make sure a receipt was opened
    FU.exists(by.id('receipt-confirm-created'), true);

    // close the modal
    $('[data-method="close"]').click();
  });

  it.skip('forbid submit when there is no transfer type for financial account', () => {
    const page = new ComplexVoucherPage();

    /*
     * the voucher we will use in this page
     * NOTE: the Caisse Aux is a financial account which involve that we
     * specify the transfer type
     */
    const voucher = {
      date        : new Date(),
      description : 'Complex voucher test e2e',
      rows        : [
        {
          account : 'CASH PAYMENT CLIENT', debit : 17, credit : 0, entity : { type : 'D', name : 'Test 2 Patient' },
        },
        {
          account : 'Caisse Aux', debit : 0, credit : 17, reference : { type : 'voucher', index : 0 },
        },
      ],
    };

    // configure the date to today
    page.date(voucher.date);

    // set the description
    page.description(voucher.description);

    // set the currency to USD
    page.currency(2);

    // loop through each row and assign the correct form values
    voucher.rows.forEach((row, idx) => {
      const current = page.row(idx);
      current.account(row.account);
      current.debit(row.debit);
      current.credit(row.credit);
      if (row.entity) {
        current.entity(row.entity.type, row.entity.name);
      }
      if (row.reference) {
        current.reference(row.reference.type, row.reference.index);
      }
    });

    // submit the page
    page.submit();

    // expect a danger notification
    components.notification.hasDanger();
  });

  it('Convention import invoices and payment via the tool', () => {
    const page = new ComplexVoucherPage();

    const detail = {
      tool            : 'Convention - Paiement factures',
      cashbox         : 'Caisse Aux',
      convention      : 'NGO IMA World Health',
      invoices        : [0, 1],
      description     : 'Convention payment with journal voucher',
      // transactionType : 'Convention',
    };

    // click on the convention tool
    FU.dropdown('[toolbar-dropdown]', detail.tool);

    // select the cashbox
    FU.uiSelect('ToolCtrl.cashbox', detail.cashbox);

    // select the convention
    components.debtorGroupSelect.set(detail.convention);

    // select invoices
    GU.selectRow('invoiceGrid', detail.invoices[0]);

    // validate selection
    FU.modal.submit();

    // description
    page.description(detail.description);

    // submit voucher
    FU.buttons.submit();

    // make sure a receipt was opened
    FU.exists(by.id('receipt-confirm-created'), true);

    // close the modal
    $('[data-method="close"]').click();
  });

  it('Support Patient Invoices by an Account via the tool', () => {
    const page = new ComplexVoucherPage();

    const detail = {
      tool          : 'Prise en Charge',
      accountNumber : '42210010', // 42210010 - Salaires à payer
      patientName   : 'Test 2',
      description   : 'Patient Support invoices',
      invoices      : [0, 1],
    };

    // click on the Support Patient Tool
    FU.dropdown('[toolbar-dropdown]', detail.tool);

    // select account
    components.accountSelect.set(detail.accountNumber);

    // Find Patient
    components.findPatient.findByName(detail.patientName);

    // select invoices
    GU.selectRow('invoiceGrid', detail.invoices[0]);

    // validate selection
    FU.modal.submit();

    // description
    page.description(detail.description);

    // submit voucher
    FU.buttons.submit();

    // make sure a receipt was opened
    FU.exists(by.id('receipt-confirm-created'), true);

    // close the modal
    $('[data-method="close"]').click();
  });

  it('Generic Income via the tool', () => {
    const detail = {
      tool        : 'Recette Generique',
      cashbox     : 'Caisse Aux',
      account     : '41111010', // CHURCH
      description : 'E2E RECETTE GENERIQUE',
      amount      : 3000,
    };

    // click on the convention tool
    FU.dropdown('[toolbar-dropdown]', detail.tool);

    // select the cashbox (the first ie Fc)
    FU.uiSelect('ToolCtrl.cashbox', detail.cashbox);

    // select the account
    components.accountSelect.set(detail.account);

    // description
    FU.input('ToolCtrl.description', detail.description);

    // amount
    components.currencyInput.set(detail.amount);

    // validate selection
    FU.modal.submit();

    // submit voucher
    FU.buttons.submit();

    // make sure a receipt was opened
    FU.exists(by.id('receipt-confirm-created'), true);

    // close the modal
    $('[data-method="close"]').click();
  });

  it('Generic Expense via the tool', () => {
    const detail = {
      tool        : 'Depense Generique',
      cashbox     : 'Caisse Aux',
      account     : '60521010', // 60521010 - Electricité
      description : 'Payment for electricity',
      amount      : 1000,
    };

    // click on the convention tool
    FU.dropdown('[toolbar-dropdown]', detail.tool);

    // select the cashbox (the first ie Fc)
    FU.uiSelect('ToolCtrl.cashbox', detail.cashbox);

    // select the account
    components.accountSelect.set(detail.account);

    // description
    FU.input('ToolCtrl.description', detail.description);

    // amount
    components.currencyInput.set(detail.amount);

    // validate selection
    FU.modal.submit();

    // submit voucher
    FU.buttons.submit();

    // make sure a receipt was opened
    FU.exists(by.id('receipt-confirm-created'), true);

    // close the modal
    $('[data-method="close"]').click();
  });

  it.skip('Cash Transfer via the tool', () => {
    const detail = {
      tool    : 'Transfert d\'argent',
      cashbox : 'Caisse Aux',
      account : '58511010', // 58511010 - Virement des fonds Caisse Auxiliaire - Caisse Principale USD
      amount  : 200,
    };

    // click on the convention tool
    FU.dropdown('[toolbar-dropdown]', detail.tool);

    // select the cashbox (the first ie $)
    FU.uiSelect('ToolCtrl.cashbox', detail.cashbox);

    // select the account
    components.accountSelect.set(detail.account);

    // amount
    components.currencyInput.set(detail.amount);

    // validate selection
    FU.modal.submit();

    // submit voucher
    FU.buttons.submit();

    // make sure a receipt was opened
    FU.exists(by.id('receipt-confirm-created'), true);

    // close the modal
    $('[data-method="close"]').click();
  });
});
