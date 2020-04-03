/* global by browser */
/* eslint no-await-in-loop:off */

const EC = require('protractor').ExpectedConditions;
const helpers = require('../shared/helpers');
const components = require('../shared/components');
const ComplexVoucherPage = require('./complex.page');
const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');

describe('Complex Vouchers', () => {
  before(() => helpers.navigate('vouchers/complex'));
  beforeEach(() => browser.refresh()); // eslint-disable-line

  it('creates a complex voucher', async function create() {
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
    await page.date(voucher.date);

    // set the description
    await page.description(voucher.description);

    // set the currency to USD
    await page.currency(2);

    // add four rows
    await page.addRow();
    await page.addRow();
    await page.addRow();
    await page.addRow();

    // loop through each row and assign the correct form values
    let idx = 0;
    // eslint-disable-next-line
    for (const row of voucher.rows) {
      const current = page.row(idx);
      await current.account(row.account);
      await current.debit(row.debit);
      await current.credit(row.credit);
      if (row.entity) {
        await current.entity(row.entity.type, row.entity.name);
      }
      if (row.reference) {
        await current.reference(row.reference.type, row.reference.index);
      }

      idx += 1;
    }

    /*
     * set the transaction type to one which have a specific Id
     * (e.g. cash payment Id is 1)
     * @see client/src/js/services/VoucherService.js
     */
    await page.transactionType('Autres R');

    // submit the page
    await page.submit();

    // make sure a receipt was opened
    await FU.exists(by.id('receipt-confirm-created'), true);

    // close the modal
    await FU.modal.close();
  });

  it('Convention import invoices and payment via the tool', async () => {
    const page = new ComplexVoucherPage();

    const detail = {
      tool            : 'Convention - Paiement factures',
      cashbox         : '$', // use Caisse Aux USD
      convention      : 'NGO IMA World Health',
      invoices        : [0, 1],
      description     : 'Convention payment with journal voucher',
    };

    // click on the convention tool
    await FU.dropdown('[toolbar-dropdown]', detail.tool);

    await browser.wait(EC.visibilityOf($('[uib-modal-window]')), 1500);

    await components.cashboxSelect.set(detail.cashbox);

    // select the convention
    await components.debtorGroupSelect.set(detail.convention);

    // select invoices
    await GU.selectRow('invoiceGrid', detail.invoices[0]);

    // validate selection
    await FU.modal.submit();

    // description
    await page.description(detail.description);

    // submit voucher
    await FU.buttons.submit();

    // make sure a receipt was opened
    await FU.exists(by.id('receipt-confirm-created'), true);

    // close the modal
    await FU.modal.close();
  });

  it('Support Patient Invoices by an Account via the tool', async () => {
    const page = new ComplexVoucherPage();

    const detail = {
      tool          : 'Prise en Charge',
      accountNumber : '42210010', // 42210010 - Salaires à payer
      patientName   : 'Test 2',
      description   : 'Patient Support invoices',
      invoices      : [0, 1],
    };

    // click on the Support Patient Tool
    await FU.dropdown('[toolbar-dropdown]', detail.tool);

    await browser.wait(EC.visibilityOf($('[uib-modal-window]')), 1500);

    // select account
    await components.accountSelect.set(detail.accountNumber);

    // Find Patient
    await components.findPatient.findByName(detail.patientName);

    // select invoices
    await GU.selectRow('invoiceGrid', detail.invoices[0]);

    // validate selection
    await FU.modal.submit();

    // description
    await page.description(detail.description);

    // submit voucher
    await FU.buttons.submit();

    // make sure a receipt was opened
    await FU.exists(by.id('receipt-confirm-created'), true);

    // close the modal
    await FU.modal.close();
  });

  it('Generic Income via the tool', async () => {
    const detail = {
      tool        : 'Recette Générique',
      cashbox     : 'Caisse Aux',
      account     : '41111010', // CHURCH
      description : 'E2E RECETTE GENERIQUE',
      amount      : 3000,
    };

    // click on the convention tool
    await FU.dropdown('[toolbar-dropdown]', detail.tool);

    await browser.wait(EC.visibilityOf($('[uib-modal-window]')), 1500);

    // select the cashbox (the first ie Fc)
    await FU.uiSelect('ToolCtrl.cashbox', detail.cashbox);

    // select the account
    await components.accountSelect.set(detail.account);

    // description
    await FU.input('ToolCtrl.description', detail.description);

    // amount
    await components.currencyInput.set(detail.amount);

    // validate selection
    await FU.modal.submit();

    // submit voucher
    await FU.buttons.submit();

    // make sure a receipt was opened
    await FU.exists(by.id('receipt-confirm-created'), true);

    // close the modal
    await FU.modal.close();
  });

  it('Generic Expense via the tool', async () => {
    const detail = {
      tool        : 'Dépense Générique',
      cashbox     : 'Caisse Aux',
      account     : '60521010', // 60521010 - Electricité
      description : 'Payment for electricity',
      amount      : 1000,
    };

    // click on the convention tool
    await FU.dropdown('[toolbar-dropdown]', detail.tool);

    await browser.wait(EC.visibilityOf($('[uib-modal-window]')), 1500);

    // select the cashbox (the first ie Fc)
    await FU.uiSelect('ToolCtrl.cashbox', detail.cashbox);

    // select the account
    await components.accountSelect.set(detail.account);

    // description
    await FU.input('ToolCtrl.description', detail.description);

    // amount
    await components.currencyInput.set(detail.amount);

    // validate selection
    await FU.modal.submit();

    // submit voucher
    await FU.buttons.submit();

    // make sure a receipt was opened
    await FU.exists(by.id('receipt-confirm-created'), true);

    // close the modal
    await FU.modal.close();
  });

  it('Employees Salary Paiement via the tool', async () => {
    const page = new ComplexVoucherPage();
    const gridId = 'paymentGrid';

    const detail = {
      cashbox       : '$',
      tool          : 'Paiement des salaires',
      period        : 'Février 2018',
      description   : 'Paiement Salaire Février 2018',
    };

    // click on the Support Patient Tool
    await FU.dropdown('[toolbar-dropdown]', detail.tool);

    await browser.wait(EC.visibilityOf($('[uib-modal-window]')), 1500);

    // Select Cashbox
    await components.cashboxSelect.set(detail.cashbox);

    // Select Payroll Period
    await components.payrollPeriodSelect.set(detail.period);

    await GU.selectRow(gridId, 1);

    // validate selection
    await FU.modal.submit();

    // description
    await page.description(detail.description);

    // submit voucher
    await FU.buttons.submit();

    // make sure a receipt was opened
    await FU.exists(by.id('receipt-confirm-created'), true);

    // close the modal
    await FU.modal.close();
  });
});
