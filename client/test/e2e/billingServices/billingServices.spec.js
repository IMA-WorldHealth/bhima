/* global browser, element, by, protractor */
const chai = require('chai');
const expect = chai.expect;

// import testing utiliites
const helpers = require('../shared/helpers');
helpers.configure(chai);

const GU = require('../shared/gridTestUtils.spec.js');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

describe('Billing Services', function () {
  'use strict';

  const path = '#/admin/billing_services';
  const gridId = 'BillingServicesGrid';

  before(() => helpers.navigate(path));

  it('can create a billing service', function () {

    // click on the create button
    FU.buttons.create();

    // anticipate that the form should come up
    FU.exists(by.css('[name="BillingServicesForm"]'), true);

    var root = element(by.css('[data-component-find-account]'));

    // search for a particular account using the account input
    var accountInput = root.element(by.model('BillingServicesFormCtrl.model.account'));
    accountInput.sendKeys('410');

    // click select the proper account
    var option = root.all(by.repeater('match in matches track by $index')).first();
    option.click();

    // fill in the rest of the fields
    FU.input('BillingServicesFormCtrl.model.label', 'Value Added Tax');
    FU.input('BillingServicesFormCtrl.model.description', 'A tax added for people who want value!');
    FU.input('BillingServicesFormCtrl.model.value', 25);

    FU.buttons.submit();

    // check that the grid as exactly one record
    var grid = GU.getGrid(gridId);

    var rows = grid.element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'));

    expect(rows.count()).to.eventually.equal(3);
  });

  it('can update a billing service', function () {
    // get the cell with the update button and click it
    var cell = GU.dataCell(gridId, 0, 6);
    cell.element(by.css('[data-method="update"]')).click();

    // expect to find the update form has loaded
    FU.exists(by.css('[name="BillingServicesForm"]'), true);

    // update the label
    FU.input('BillingServicesFormCtrl.model.label', 'Value Reduced Tax');

    // submit the forn
    FU.buttons.submit();
  });

  it('can delete a billing service', function () {
    // get the cell with the delete button and click it
    var cell = GU.dataCell(gridId, 0, 7);
    cell.element(by.css('[data-method="delete"]')).click();

    // expect the modal to appear
    FU.exists(by.css('[data-confirm-modal]'), true);

    //Confirm the action by a click on the buttom confirm
    components.modalAction.confirm();

    // check that the grid does not have any rows in it anymore
    var grid = GU.getGrid(gridId);

    var rows = grid.element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'));

    expect(rows.count()).to.eventually.equal(3);
  });
});
