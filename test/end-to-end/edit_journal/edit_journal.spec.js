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

  // simulates a double click
  const doubleClick = element => browser.actions().mouseMove(element).doubleClick().perform();

  before(() => helpers.navigate(path));

  it('edits a transaction change an account', () => {
    // click the "grouping" button
    FU.buttons.grouping();
    element.all(by.css('[class="ui-grid-icon-plus-squared"]')).get(0).click();
    element.all(by.css('[class="fa fa-edit"]')).get(0).click();
    const accountNumberCell = GU.getCellName(gridId, 1, 4);
    doubleClick(accountNumberCell);

    FU.typeahead('accountInputValue', '1100', accountNumberCell);
    element.all(by.css('[data-method="save"]')).click();

    components.notification.hasSuccess();
    element.all(by.css('[class="ui-grid-icon-minus-squared"]')).get(0).click();
    FU.buttons.grouping();
  });


  it('edits a transaction change value of Debit and Credit', () => {
    FU.buttons.grouping();
    element.all(by.css('[class="ui-grid-icon-plus-squared"]')).get(1).click();
    element.all(by.css('[class="fa fa-edit"]')).get(1).click();

    const debitCell = GU.getCellName(gridId, 2, 5);
    const creditCell = GU.getCellName(gridId, 3, 6);

    doubleClick(debitCell);
    debitCell.element(by.css('input')).sendKeys(50);

    doubleClick(creditCell);
    creditCell.element(by.css('input')).sendKeys(50);

    element.all(by.css('[data-method="save"]')).click();

    components.notification.hasSuccess();
    element.all(by.css('[class="ui-grid-icon-minus-squared"]')).get(0).click();
    FU.buttons.grouping();
  });

  // Test for validation
  it('Preventing a single-line transaction', () => {
    FU.buttons.grouping();
    element.all(by.css('[class="ui-grid-icon-plus-squared"]')).get(1).click();
    element.all(by.css('[class="fa fa-edit"]')).get(1).click();

    element.all(by.css('[class="ui-grid-selection-row-header-buttons ui-grid-icon-ok ng-scope"]')).get(3).click();

    element.all(by.css('[data-method="delete"]')).click();
    element.all(by.css('[data-method="save"]')).click();

    components.notification.hasWarn();
    element.all(by.css('[data-method="cancel"]')).click();
    element.all(by.css('[class="ui-grid-icon-minus-squared"]')).get(0).click();
    FU.buttons.grouping();
  });

  it('Preventing unbalanced transaction', () => {
    FU.buttons.grouping();
    element.all(by.css('[class="ui-grid-icon-plus-squared"]')).get(1).click();
    element.all(by.css('[class="fa fa-edit"]')).get(1).click();

    const debitCell = GU.getCellName(gridId, 2, 5);
    const creditCell = GU.getCellName(gridId, 3, 6);

    doubleClick(debitCell);
    debitCell.element(by.css('input')).sendKeys(100);

    browser.actions().mouseMove(creditCell).doubleClick().perform();
    creditCell.element(by.css('input')).sendKeys(50);

    element.all(by.css('[data-method="save"]')).click();

    components.notification.hasWarn();
    element.all(by.css('[data-method="cancel"]')).click();
    element.all(by.css('[class="ui-grid-icon-minus-squared"]')).get(0).click();
    FU.buttons.grouping();
  });

  it('Preventing transaction who have debit and Credit null', () => {
    FU.buttons.grouping();
    element.all(by.css('[class="ui-grid-icon-plus-squared"]')).get(1).click();
    element.all(by.css('[class="fa fa-edit"]')).get(1).click();

    const debitCell = GU.getCellName(gridId, 2, 5);
    const creditCell = GU.getCellName(gridId, 2, 6);

    doubleClick(debitCell);
    debitCell.element(by.css('input')).sendKeys(0);

    doubleClick(creditCell);
    creditCell.element(by.css('input')).sendKeys(0);

    element.all(by.css('[data-method="save"]')).click();

    components.notification.hasWarn();
    element.all(by.css('[data-method="cancel"]')).click();
    element.all(by.css('[class="ui-grid-icon-minus-squared"]')).get(0).click();
    FU.buttons.grouping();
  });

  it('Preventing transaction who was debited and Credited in a same line', () => {
    FU.buttons.grouping();
    element.all(by.css('[class="ui-grid-icon-plus-squared"]')).get(1).click();
    element.all(by.css('[class="fa fa-edit"]')).get(1).click();

    const debitCell = GU.getCellName(gridId, 2, 5);
    const creditCell = GU.getCellName(gridId, 2, 6);

    doubleClick(debitCell);
    debitCell.element(by.css('input')).sendKeys(50);

    doubleClick(creditCell);
    creditCell.element(by.css('input')).sendKeys(50);

    element.all(by.css('[data-method="save"]')).click();

    components.notification.hasWarn();
    element.all(by.css('[data-method="cancel"]')).click();
    element.all(by.css('[class="ui-grid-icon-minus-squared"]')).get(0).click();
    FU.buttons.grouping();
  });
});
