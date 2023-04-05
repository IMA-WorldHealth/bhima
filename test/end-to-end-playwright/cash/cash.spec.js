const { chromium } = require('playwright');
const { test, expect } = require('@playwright/test');

const components = require('../shared/components');
const TU = require('../shared/TestUtils');
const GU = require('../shared/GridUtils');
const GridRow = require('../shared/GridRow');
const SearchModal = require('../shared/search.page');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Cash Payments', () => {
  const path = 'cash';

  const cashboxB = {
    id : 2,
    text : 'Test Aux Cashbox A',
  };

  const cashboxC = {
    id : 3,
    text : 'Test Aux Cashbox B',
  };

  // this is a shortcut function for clicking an action in the cash page
  async function selectDropdownAction(action) {
    // open the dropdown menu
    const open = await TU.locator('[data-action="open-tools"]');
    await open.click();

    // get the action and click it
    const actionBtn = await TU.locator(`[data-action="${action}"]`);
    return actionBtn.click();
  }

  test.describe('Cashbox Select Interface', () => {

    test('navigating to /cash/:unknown should send a notification error ', async () => {
      // navigate to an invalid cashbox
      await TU.navigate(`${path}/unknown`);

      // expect the 'cashbox selection' modal to appear
      // Note: We cannot just check for [data-cashbox-modal] because
      //       Going to an unknown cashbox redirects to the cashbox
      //       selection modal so we need to wait for it to appear.

      await TU.waitForSelector('[data-cashbox-modal]');

      // select a cashbox
      await (await TU.locator('#cashbox-2')).click();

      await (await TU.locator('[data-cashbox-modal-submit]')).click();

      // expect the 'cashbox selection' modal to disappear
      await TU.exists('[data-cashbox-modal]', false);
    });

    test('navigating directly to /cash should be re-routed to selected cashbox after a selection is made', async () => {
      // our target is cashbox B
      const target = `/#!/${path}/${cashboxB.id}`;

      // implicitly choose cashbox B by navigating to it directly
      await TU.navigate(target);

      expect(await TU.getCurrentPath()).toBe(target);

      // Back to the root path
      await TU.navigate(path);

      // Wait for it to redirect
      await TU.waitForURL(`**/${path}/${cashboxB.id}`);

      // the cashbox selection modal should not appear
      await TU.exists('[data-cashbox-modal]', false);

      // the url should be the original target
      expect(await TU.getCurrentPath()).toBe(target);
    });

    test('should allow a user to select and deselect a cashbox', async () => {
      // the auxiliary cashbox is the target
      const targetAuxiliary1 = `/#!/${path}/${cashboxC.id}`;

      await TU.navigate(targetAuxiliary1);

      // verify that we get to the cashboxC page
      expect(await TU.getCurrentPath()).toBe(targetAuxiliary1);

      // the auxiliary cashbox is the target
      const targetAuxiliary2 = `/#!/${path}/${cashboxB.id}`;

      // use the button to navigate back to the cashbox select module
      await selectDropdownAction('change-cashbox');

      // select the auxiliary cashbox B displayed
      await (await TU.locator(`#cashbox-${cashboxB.id}`)).click();

      // click on the ok button of the modal box
      await (await TU.locator('[data-cashbox-modal-submit]')).click();

      // verify that we get to the cashboxB page
      expect(await TU.getCurrentPath()).toBe(targetAuxiliary2);
    });
  });

  /* tests for the cash payments form page */
  test.describe('Cash Payments Form Page', () => {
    test.beforeEach(async () => {
      await TU.navigate(path);
    });

    // this code assumes that the find-patient directive is well tested.
    // we should be able to use a patient ID without thinking about the potential
    // failures

    // This caution payment should succeed
    const mockCautionPayment = {
      patientName : 'Test 2',
      amount : 150,
    };

    // This payment against patient invoices should succeed
    const mockInvoicesPayment = {
      patientId : '2', // we are using PA.TPA.X at patient invoice already
      date : new Date('2016-03-01'),
      amount : 5.12,
    };

    test('should make a caution payment', async () => {
      // select the proper patient
      await components.findPatient.findByName(mockCautionPayment.patientName);

      // we will leave the date input as default

      // select the proper is caution type
      const cautionOption = await TU.locator('[data-caution-option="1"]');
      await cautionOption.click();

      // select the FC currency from the currency select
      await components.currencySelect.set(1);

      // enter the amount to pay for a caution
      await components.currencyInput.set(mockCautionPayment.amount);

      // click the submit button
      await TU.buttons.submit();

      // expect the receipt modal to appear
      await TU.waitForSelector('#receipt-confirm-created');

      // dismiss the modal
      await (await TU.locator('[data-action="close"]')).click();
    });

    test('should block invoice payments without invoices', async () => {
      // select the proper patient
      await components.findPatient.findByName(mockCautionPayment.patientName);

      // we will leave the date input as default

      // select the proper is caution type
      const cautionOption = await TU.locator('[data-caution-option="0"]');
      await cautionOption.click();

      // select the FC currency from the currency select
      await components.currencySelect.set(1);

      // enter the amount to pay for a caution
      await components.currencyInput.set(mockCautionPayment.amount);

      // click the submit button
      await TU.buttons.submit();

      // expect a danger notification
      await components.notification.hasDanger();

      await (await TU.locator('[data-method="clear"]')).click();
    });

    test('should make a payment against previous invoices', async () => {
      const gridId = 'debtorInvoicesGrid';

      // select the proper patient
      await components.findPatient.findById(mockInvoicesPayment.patientId);

      // select the proper date
      await components.dateEditor.set(mockInvoicesPayment.date);

      // select the "invoices payment" option type
      const cautionOption = await TU.locator('[data-caution-option="0"]');
      await cautionOption.click();

      // open the invoices modal to select constious invoices
      await TU.exists('[data-open-invoices-btn]', true);
      await (await TU.locator('[data-open-invoices-btn]')).click();

      // be sure that the modal opened
      await TU.exists('[data-debtor-invoice-modal]', true);

      // inside the modal, we want to select the first row to pay against
      await GU.selectRow(gridId, 2);

      // submit the modal
      await TU.modal.submit();

      // select the USD currency from the currency radio buttons
      await components.currencySelect.set(2);

      // enter the amount to pay for an invoice
      await components.currencyInput.set(mockInvoicesPayment.amount);

      // click the submit button
      await TU.buttons.submit();

      // expect the receipt modal to appear
      await TU.waitForSelector('#receipt-confirm-created');

      // dismiss the modal
      await (await TU.locator('[data-action="close"]')).click();
    });
  });

  test.describe('Cash transfer', () => {
    test.beforeEach(async () => {
      await TU.navigate(path);
    });

    const gridId = 'debtorInvoicesGrid';
    // test.describe('Cash Transfer ', CashTransfer);

    // this transfer should succeed
    const mockTransfer = { amount : 100 };

    test('should make a transfer between accounts', async () => {
      // open the dropdown menu
      await (await TU.locator('[data-action="open-tools"]')).click();

      // get the transfer button and click it
      await (await TU.locator('[data-action="transfer"]')).click();

      // choose CDF as transfer currency
      await components.currencySelect.set(2, 'transfer-currency-select');

      // set a value in the currency component by model to avoid conflict
      await components.currencyInput.set(mockTransfer.amount, 'transfer-currency-input');

      // submit the modal button
      await TU.modal.submit();

      // expect the receipt modal to appear
      await TU.waitForSelector('#receipt-confirm-created');

      // dismiss the modal
      await (await TU.locator('[data-action="close"]')).click();
    });

  });

  test.describe('Credit Notes', () => {
    test.beforeEach(async () => {
      await TU.navigate('payments');
    });

    test('cancels a payment with a credit note', async () => {
      const row = new GridRow('CP.TPA.1');
      await row.dropdown();
      await row.reverse(); // Eg cancel

      await TU.input('ModalCtrl.cancelCash.description', 'Cancel This Payment');
      await TU.modal.submit();
      await components.notification.hasSuccess();
    });

    test('deletes a cash payment from the database', async () => {
      const modal = new SearchModal('cash-payment-search');
      modal.init();
      await modal.init();
      await modal.open();
      await modal.switchToDefaultFilterTab();
      await modal.setPeriod('allTime');
      await modal.setLimit(1000);
      await modal.submit();

      const row = new GridRow('CP.TPA.4');
      await row.dropdown();
      await row.remove();

      // accept the confirm modal
      await TU.modal.submit();

      await components.notification.hasSuccess();
    });

  });

});
