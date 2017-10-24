/* global browser, element, by */
const chai = require('chai');
const helpers = require('../shared/helpers');
const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');
const components = require('../shared/components');

helpers.configure(chai);

describe('Edit Posting Journal', () => {
  const path = '#!/journal';
  const gridId = 'journal-grid';

  const editingGridId = 'transaction-edit-grid';

  // simulates a double click
  const doubleClick = element => browser.actions().mouseMove(element).doubleClick().perform();

  before(() => helpers.navigate(path));

  it('edits a transaction change an account', () => {
    GU.selectRow(gridId, 0);
    FU.buttons.edit();

    const accountNumberCell = GU.getCell(editingGridId, 0, 1);
    doubleClick(accountNumberCell);
    FU.typeahead('accountInputValue', '1100');

    FU.buttons.submit();
    components.notification.hasSuccess();
  });

  function editInput(rowIndex, columnIndex, value) {
    const cell = GU.getCell(editingGridId, rowIndex, columnIndex);
    // clear old clicks and focus the cell
    cell.click();
    // open the editing pane
    doubleClick(cell);
    cell.element(by.css('input')).clear().sendKeys(value);
  }


  it('edits a transaction change value of debit and credit', () => {
    GU.selectRow(gridId, 0);
    FU.buttons.edit();

    // change the first row (index 0), debit and credit inputs (index 2 and 3)
    editInput(0, 2, 100);
    editInput(0, 3, 0);

    editInput(1, 2, 0);
    editInput(1, 3, 100);

    FU.buttons.submit();
    FU.exists(by.id('validation-errored-alert'), false);
    components.notification.hasSuccess();
  });

  // Test for validation
  it('prevents a single line transaction', () => {
    GU.selectRow(gridId, 0);
    FU.buttons.edit();

    GU.selectRow(editingGridId, 0);
    FU.buttons.delete();
    FU.buttons.submit();

    FU.exists(by.id('validation-errored-alert'), true);

    FU.buttons.cancel();
  });

  it('prevents an unbalanced transaction', () => {
    FU.buttons.edit();

    editInput(0, 2, 100);
    editInput(0, 3, 0);

    editInput(1, 2, 0);
    editInput(1, 3, 50);

    FU.buttons.submit();

    FU.exists(by.id('validation-errored-alert'), true);

    FU.buttons.cancel();
  });

  it('preventing transaction who have debit and credit null', () => {
    FU.buttons.edit();

    editInput(0, 2, 0);
    editInput(0, 3, 0);

    editInput(1, 2, 0);
    editInput(1, 3, 0);

    FU.buttons.submit();
    FU.exists(by.id('validation-errored-alert'), true);
    FU.buttons.cancel();
  });

  it('preventing transaction who was debited and credited in a same line', () => {
    FU.buttons.edit();

    editInput(0, 2, 10);
    editInput(0, 3, 10);

    editInput(1, 2, 10);
    editInput(1, 3, 0);

    FU.buttons.submit();
    FU.exists(by.id('validation-errored-alert'), true);
    FU.buttons.cancel();
  });
});
