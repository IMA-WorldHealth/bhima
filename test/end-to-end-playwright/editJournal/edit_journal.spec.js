const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');

const TU = require('../shared/TestUtils');
const { by } = require('../shared/TestUtils');
const GU = require('../shared/GridUtils');

const components = require('../shared/components');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

// const protractor = require('protractor');

// const EC = protractor.ExpectedConditions;

test.describe('Edit Posting Journal', () => {
  const path = '/#!/journal';
  const gridId = 'journal-grid';
  const editingGridId = 'transaction-edit-grid';

  /**
   * Open the editing model for the selected row
   * (Select a row first)
   */
  async function openEditingModal() {
    await TU.buttons.edit();
    await TU.waitForSelector(by.id(editingGridId));
  }

  test.beforeEach(async () => {
    await TU.navigate(path);
  });

  test('edits a transaction to change an account', async () => {
    await GU.selectRow(gridId, 0);
    await openEditingModal();

    const accountNumberCell = await GU.getCell(editingGridId, 0, 1);
    await accountNumberCell.dblclick();
    await TU.input('accountInputValue', '11110000', accountNumberCell);
    const acts = await TU.locator('.uib-typeahead-match a').first();
    await acts.click();

    await TU.modal.submit();
    await components.notification.hasSuccess();
  });

  /**
   * Insert a value into a grid cell
   *
   * @param {number} rowIndex - the row
   * @param {number} columnIndex - the column
   * @param {any} value - value to set
   * @returns {Promise} of the completed insertion
   */
  async function editInput(rowIndex, columnIndex, value) {
    const cell = await GU.getCell(editingGridId, rowIndex, columnIndex);

    // open the editing pane
    await cell.dblclick();

    // get the element
    const input = await TU.locator('input[type=number]');
    await input.press('Control+A');
    await TU.fill(input, value);
    return input.press('Enter');
  }

  test('edits a transaction to change the value of debit and credit', async () => {
    await GU.selectRow(gridId, 0);
    await openEditingModal();

    // change the first row (index 0), debit and credit inputs (index 2 and 3)
    await editInput(0, 2, 99);
    await editInput(0, 3, 0);

    await editInput(1, 2, 0);
    await editInput(1, 3, 99);

    await TU.modal.submit();
    await TU.exists(by.id('validation-errored-alert'), false);
    await components.notification.hasSuccess();
  });

  test('prevents an unbalanced transaction', async () => {
    await GU.selectRow(gridId, 0);
    await openEditingModal();

    await editInput(0, 2, 100);
    await editInput(0, 3, 0);

    await editInput(1, 2, 0);
    await editInput(1, 3, 50);

    await TU.modal.submit();

    await TU.exists(by.id('validation-errored-alert'), true);

    await TU.modal.cancel();
  });

  // Test for validation
  test('prevents a single line transaction', async () => {
    await GU.selectRow(gridId, 0);
    await openEditingModal();

    await GU.selectRow(editingGridId, 0);
    const delRowBtn = await TU.locator('button[ng-click="ModalCtrl.removeRows()"]');
    await delRowBtn.click();
    await TU.modal.submit();

    await TU.exists(by.id('validation-errored-alert'), true);
    await TU.modal.cancel();
  });

  test('preventing transaction who have debit and credit null', async () => {
    await GU.selectRow(gridId, 0);
    await openEditingModal();

    await editInput(0, 2, 0);
    await editInput(0, 3, 0);

    await editInput(1, 2, 0);
    await editInput(1, 3, 0);

    await TU.modal.submit();
    await TU.exists(by.id('validation-errored-alert'), true);
    await TU.modal.cancel();
  });

  test('preventing transaction who was debited and credited in a same line', async () => {
    await GU.selectRow(gridId, 0);
    await openEditingModal();

    await editInput(0, 2, 10);
    await editInput(0, 3, 10);

    await editInput(1, 2, 10);
    await editInput(1, 3, 0);

    await TU.modal.submit();
    await TU.exists(by.id('validation-errored-alert'), true);
    await TU.modal.cancel();
  });
});
