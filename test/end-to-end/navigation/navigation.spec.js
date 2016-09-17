/* global element, by, inject, browser, protractor */
const chai   = require('chai');
const expect = chai.expect;

const EC = protractor.ExpectedConditions;

const helpers = require('../shared/helpers');
helpers.configure(chai);

describe.skip('Tree Navigation', function () {
  'use strict';

  it('toggles the tree open and closed', function () {

    const nav = $('#expandnav');

    // the navigation starts hidden
    browser.wait(EC.invisbilityOf(nav), 5000, 'Navigation is never invisible.');

    // click to expand
    nav.click();

    // the navigation should become visible
    browser.wait(EC.visibilityOf(nav), 5000, 'Navigation is never visible after click.');
  });

  it('remembers the currently selected node', function () {
    helpers.navigate('#/fiscal');

    let selected = element(by.css('.flex-tree')).$('.selected');
    expect(selected.getAttribute('data-unit-key')).to.eventually.equal('TREE.FISCAL_YEAR');

    // trigger full page reload
    browser.refresh();

    // assert that the node is visible again
    selected = $('.flex-tree .selected');
    expect(selected.isPresent()).to.eventually.equal(true);
    expect(selected.getAttribute('data-unit-key')).to.eventually.equal('TREE.FISCAL_YEAR');
  });

  it('toggles tree nodes open and closed', function () {
    const node = $('[data-unit-key="TREE.PAYROLL"]');

    // expect payroll to be closed by default
    expect(node.$('.fa-folder').isPresent()).to.eventually.equal(true);
    expect(node.$('fa-folder-open').isPresent()).to.eventually.equal(false);

    // click to open
    node.click();

    // the open/closed folder icon should be updated
    expect(node.$('fa-folder-open').isPresent()).to.eventually.equal(true);
    expect(node.$('fa-folder').isPresent()).to.eventually.equal(false);

    // toggle to close again
    node.click();

    expect(node.$('fa-folder-open').isPresent()).to.eventually.equal(false);
    expect(node.$('fa-folder').isPresent()).to.eventually.equal(true);
  });
});

