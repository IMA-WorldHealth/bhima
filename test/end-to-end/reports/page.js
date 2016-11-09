'use strict';

const chai = require('chai');
const expect = chai.expect;
const helpers = require('../shared/helpers');
helpers.configure(chai);

const _ = require('lodash');
const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');

const gridId = 'report-grid';

class ReportPage {
  constructor(key) {
    this.url = `/reports/${key}`;
  }

  // "form" is a JSON description of the ngModel mapped to a value
  // @todo - this could be way more generic
  create(form) {

    // click the create button.
    $('[data-method="create"]').click();

    const modal = $('[uib-modal-window="modal-window"]');

    // look through the form JSON description, setting
    // ng-model keys to input values
    _.forEach(form, (value, key) => {
      FU.input(key, value, modal);
    });

    // click the generate button
    modal.$('[data-method="submit"]').click();
  }

  // deletes an account from the grid
  delete(row) {
    let cell = GU.getCell(gridId, row, 5);

    // open the dropdown menu
    cell.$('[uib-dropdown-toggle]').click();

    // click the "delete" link
    $('[data-action="delete"]').click();
  }

  // asserts that there are no items in the grid
  expectPageToBeEmpty() {
    expect(GU.getRows(gridId).count()).to.eventually.equal(0);
  }
}

module.exports = ReportPage;
