/* global browser, element, by */
const chai = require('chai');
const helpers = require('../shared/helpers');
const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');
const components = require('../shared/components');

helpers.configure(chai);
const expect = chai.expect;

describe('Edit Posting Journal', () => {
  const path = '#!/journal';
  const gridId = 'journal-grid';
  before(() => helpers.navigate(path));

  var validAccount = 1100;
  var inValidAccount = 111100000;
  var dateBadPeriod = new Date('2015-01-01');


  it('edits a transaction change an account', function () {
    // click the "grouping" button
    FU.buttons.grouping();
    element.all(by.css('[class="ui-grid-icon-plus-squared"]')).get(0).click();
    element.all(by.css('[class="fa fa-edit"]')).get(0).click();
    const accountNumberCell = GU.getCell(gridId, 1, 4);
    // simulate dbl click
    browser.actions().mouseMove(accountNumberCell).doubleClick().perform();
    
    accountNumberCell.element(by.css("input")).sendKeys(validAccount);
    element.all(by.css('[class="fa fa-save"]')).click();

    components.notification.hasSuccess();
    element.all(by.css('[class="ui-grid-icon-minus-squared"]')).get(0).click();
    FU.buttons.grouping();
  });

  it('edits a transaction change an invalid account', function () {
    FU.buttons.grouping();
    element.all(by.css('[class="ui-grid-icon-plus-squared"]')).get(0).click();
    element.all(by.css('[class="fa fa-edit"]')).get(0).click();
    const accountNumberCell = GU.getCell(gridId, 1, 4);
    // simulate dbl click
    browser.actions().mouseMove(accountNumberCell).doubleClick().perform();
    
    accountNumberCell.element(by.css("input")).sendKeys(inValidAccount);
    element.all(by.css('[class="fa fa-save"]')).click();

    components.notification.hasError();
    element.all(by.css('[class="fa fa-ban"]')).click();
    element.all(by.css('[class="ui-grid-icon-minus-squared"]')).get(0).click();
    FU.buttons.grouping();
  });

  it('edits a transaction change value of Debit and Credit', function () {
    FU.buttons.grouping();
    element.all(by.css('[class="ui-grid-icon-plus-squared"]')).get(1).click();
    element.all(by.css('[class="fa fa-edit"]')).get(1).click();
    
    const debitCell = GU.getCell(gridId, 2, 5);
    const creditCell = GU.getCell(gridId, 3, 6);
    // simulate dbl click
    browser.actions().mouseMove(debitCell).doubleClick().perform();
    debitCell.element(by.css("input")).sendKeys(50);

    browser.actions().mouseMove(creditCell).doubleClick().perform();
    creditCell.element(by.css("input")).sendKeys(50);

    element.all(by.css('[class="fa fa-save"]')).click();

    components.notification.hasSuccess();
    element.all(by.css('[class="ui-grid-icon-minus-squared"]')).get(0).click();
    FU.buttons.grouping();
  });

  // Test for validation 
  it('Preventing a single-line transaction', function () {
    FU.buttons.grouping();
    element.all(by.css('[class="ui-grid-icon-plus-squared"]')).get(1).click();
    element.all(by.css('[class="fa fa-edit"]')).get(1).click();

    element.all(by.css('[class="ui-grid-selection-row-header-buttons ui-grid-icon-ok ng-scope"]')).get(3).click();

    element.all(by.css('[class="fa fa-trash"]')).click();
    element.all(by.css('[class="fa fa-save"]')).click();

    components.notification.hasWarn();
    element.all(by.css('[class="fa fa-ban"]')).click();
    element.all(by.css('[class="ui-grid-icon-minus-squared"]')).get(0).click();
    FU.buttons.grouping();
  });


  it('Preventing a Missing Account transaction', function () {
    FU.buttons.grouping();
    element.all(by.css('[class="ui-grid-icon-plus-squared"]')).get(1).click();
    element.all(by.css('[class="fa fa-edit"]')).get(1).click();
    
    const accountCell = GU.getCell(gridId, 2, 4);

    // simulate dbl click
    browser.actions().mouseMove(accountCell).doubleClick().perform();
    accountCell.element(by.css("input")).sendKeys(' ');

    element.all(by.css('[class="fa fa-save"]')).click();

    components.notification.hasError();
    element.all(by.css('[class="fa fa-ban"]')).click();
    element.all(by.css('[class="ui-grid-icon-minus-squared"]')).get(0).click();
    FU.buttons.grouping();
  });

  it('Preventing unbalanced transaction', function () {
    FU.buttons.grouping();
    element.all(by.css('[class="ui-grid-icon-plus-squared"]')).get(1).click();
    element.all(by.css('[class="fa fa-edit"]')).get(1).click();
    
    const debitCell = GU.getCell(gridId, 2, 5);
    const creditCell = GU.getCell(gridId, 3, 6);
    // simulate dbl click
    browser.actions().mouseMove(debitCell).doubleClick().perform();
    debitCell.element(by.css("input")).sendKeys(100);

    browser.actions().mouseMove(creditCell).doubleClick().perform();
    creditCell.element(by.css("input")).sendKeys(50);

    element.all(by.css('[class="fa fa-save"]')).click();

    components.notification.hasWarn();
    element.all(by.css('[class="fa fa-ban"]')).click();
    element.all(by.css('[class="ui-grid-icon-minus-squared"]')).get(0).click();
    FU.buttons.grouping();
  });

  it('Preventing transaction who have debit and Credit null', function () {
    FU.buttons.grouping();
    element.all(by.css('[class="ui-grid-icon-plus-squared"]')).get(1).click();
    element.all(by.css('[class="fa fa-edit"]')).get(1).click();
    
    const debitCell = GU.getCell(gridId, 2, 5);
    const creditCell = GU.getCell(gridId, 2, 6);
    // simulate dbl click
    browser.actions().mouseMove(debitCell).doubleClick().perform();
    debitCell.element(by.css("input")).sendKeys(0);

    browser.actions().mouseMove(creditCell).doubleClick().perform();
    creditCell.element(by.css("input")).sendKeys(0);

    element.all(by.css('[class="fa fa-save"]')).click();

    components.notification.hasWarn();
    element.all(by.css('[class="fa fa-ban"]')).click();
    element.all(by.css('[class="ui-grid-icon-minus-squared"]')).get(0).click();
    FU.buttons.grouping();
  });

  it('Preventing transaction who was debited and Credited in a same line', function () {
    FU.buttons.grouping();
    element.all(by.css('[class="ui-grid-icon-plus-squared"]')).get(1).click();
    element.all(by.css('[class="fa fa-edit"]')).get(1).click();
    
    const debitCell = GU.getCell(gridId, 2, 5);
    const creditCell = GU.getCell(gridId, 2, 6);
    // simulate dbl click
    browser.actions().mouseMove(debitCell).doubleClick().perform();
    debitCell.element(by.css("input")).sendKeys(50);

    browser.actions().mouseMove(creditCell).doubleClick().perform();
    creditCell.element(by.css("input")).sendKeys(50);

    element.all(by.css('[class="fa fa-save"]')).click();

    components.notification.hasWarn();
    element.all(by.css('[class="fa fa-ban"]')).click();
    element.all(by.css('[class="ui-grid-icon-minus-squared"]')).get(0).click();
    FU.buttons.grouping();
  });

});
