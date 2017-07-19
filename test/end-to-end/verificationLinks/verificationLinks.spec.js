/* global browser, element, by */
const chai = require('chai');
const helpers = require('../shared/helpers');
const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');
const components = require('../shared/components');
const Filters = require('../shared/components/bhFilters');
const InvoiceRegistryPage = require('../patient/invoice/registry.page.js');
const expect = chai.expect;

helpers.configure(chai);

describe('Check links', () => {
  const path = '#!/';
  const filters = new Filters();
  const page = new InvoiceRegistryPage();

  before(() => helpers.navigate(path));


  function expectNumberOfGridRows(number) {
    expect(rows.count(),
      `Expected Patient Registry ui-grid's row count to be ${number}.`
    ).to.eventually.equal(number);
  }

  const grid = element(by.id('patient-registry'));
  const rows = grid.element(by.css('.ui-grid-render-container-body'))
    .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'));  

  it('Check link betwen Inventory Group -> Inventory Registry', () => {
    browser.get('#!/inventory/configuration');
    element.all(by.css('[class="fa fa-link"]')).click();
    GU.expectRowCount('inventoryListGrid', 4);
  });

  it('Check link betwen Patient Groups -> Patient Registry', () => {
    browser.get('#!/patients/groups');

    element.all(by.css('[class="fa fa-list"]')).get(2).click();
    expectNumberOfGridRows(2);
  });

  it('Check link betwen Debtor Groups -> Patient Registry', () => {
    browser.get('#!/debtors/groups');

    element.all(by.css('[class="fa fa-bars"]')).get(1).click();
    expectNumberOfGridRows(4);
  });

  it('Check link betwen Invoice Registry -> Patient Registry', () => {
    browser.get('#!/invoices');

    element.all(by.css('[data-method="action"]')).get(2).click();
    element.all(by.css('[data-method="viewPatient"]')).get(2).click();
    expectNumberOfGridRows(1);
  });

  it('Check link betwen Cash Registry -> Patient Registry', () => {
    browser.get('#!/payments');

    element.all(by.css('[data-method="action"]')).get(0).click();
    element.all(by.css('[data-method="viewPatient"]')).get(0).click();
    expectNumberOfGridRows(1);
  });

  it('Check link betwen Patient Registry -> Cash Registry', () => {
    browser.get('#!/patients');
    filters.resetFilters();

    element.all(by.css('[data-method="action"]')).get(2).click();
    element.all(by.css('[data-method="payment"]')).get(2).click();
    GU.expectRowCount('payment-registry', 1);
  });

  it('Check link betwen Patient Registry -> Invoice Registry', () => {
    browser.get('#!/patients');
    filters.resetFilters();

    element.all(by.css('[data-method="action"]')).get(3).click();
    element.all(by.css('[data-method="invoice"]')).get(3).click();
    page.expectNumberOfGridRows(3);
  });

  it('Check link betwen Invoice Registry -> Cash Registry', () => {
    browser.get('#!/invoices');
    element.all(by.css('[data-method="action"]')).get(2).click();
    element.all(by.css('[data-method="viewPayment"]')).get(2).click();
    GU.expectRowCount('payment-registry', 0);
  });

});

