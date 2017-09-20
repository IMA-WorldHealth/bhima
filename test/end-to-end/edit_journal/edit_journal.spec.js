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


  it('edits a transaction change value of Debit and Credit', () => {
    GU.selectRow(gridId, 0);
    FU.buttons.edit();

    const debitCellA = GU.getCell(editingGridId, 0, 2);
    const creditCellA = GU.getCell(editingGridId, 0, 3);
    const debitCellB = GU.getCell(editingGridId, 1, 2);
    const creditCellB = GU.getCell(editingGridId, 1, 3);

    doubleClick(debitCellA);
    debitCellA.element(by.css('input')).sendKeys(150);
    doubleClick(creditCellA);
    creditCellA.element(by.css('input')).sendKeys(0);

    doubleClick(debitCellB);
    debitCellB.element(by.css('input')).sendKeys(0);
    doubleClick(creditCellB);
    creditCellB.element(by.css('input')).sendKeys(150);

    FU.buttons.submit();
    components.notification.hasSuccess();
  });

  // Test for validation
  it('Preventing a single-line transaction', () => {
    GU.selectRow(gridId, 1);
    FU.buttons.edit();

    GU.selectRow(editingGridId, 3);
    FU.buttons.delete();
    FU.buttons.submit();

    element(by.id('validation-errored-alert')).isPresent();

    FU.buttons.cancel();
  });

  it('Preventing unbalanced transaction', () => {
    GU.selectRow(gridId, 1);
    FU.buttons.edit();

    const debitCell = GU.getCellName(gridId, 2, 3);
    const creditCell = GU.getCellName(gridId, 3, 4);

    doubleClick(debitCell);
    debitCell.element(by.css('input')).sendKeys(100);

    doubleClick(creditCell);
    creditCell.element(by.css('input')).sendKeys(50);

    FU.buttons.submit();
    element(by.id('validation-errored-alert')).isPresent();
    FU.buttons.cancel();
  });

  it('Preventing transaction who have debit and Credit null', () => {
    GU.selectRow(gridId, 1);
    FU.buttons.edit();

    const debitCell = GU.getCellName(gridId, 2, 3);
    const creditCell = GU.getCellName(gridId, 2, 4);

    doubleClick(debitCell);
    debitCell.element(by.css('input')).sendKeys(0);

    doubleClick(creditCell);
    creditCell.element(by.css('input')).sendKeys(0);

    FU.buttons.submit();
    element(by.id('validation-errored-alert')).isPresent();
    FU.buttons.cancel();
  });

  it('Preventing transaction who was debited and Credited in a same line', () => {
    GU.selectRow(gridId, 1);
    FU.buttons.edit();

    const debitCell = GU.getCellName(gridId, 2, 3);
    const creditCell = GU.getCellName(gridId, 2, 4);

    doubleClick(debitCell);
    debitCell.element(by.css('input')).sendKeys(50);

    doubleClick(creditCell);
    creditCell.element(by.css('input')).sendKeys(50);

    FU.buttons.submit();
    element(by.id('validation-errored-alert')).isPresent();
    FU.buttons.cancel();
  });
});
