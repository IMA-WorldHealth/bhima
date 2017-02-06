/* global element, by, browser */
'use strict';

const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');
const helpers = require('../shared/helpers');
const components = require('../shared/components');
const PurchasesRegistryPage = require('./purchases.registry.page');

function PurchasesRegistryTests() {

  // navigate to the page
  before(() => helpers.navigate('#/purchases/list'));

  const PURCHASES_INSIDE_REGISTRY = 1;

  const page = new PurchasesRegistryPage();

  it('find purchases by date interval', () => {

    /** Get all purchases of the year 2016 */
    FU.buttons.search();
    components.dateInterval.range('01/01/2016', '31/12/2016');
    FU.modal.submit();
    GU.expectRowCount('PurchaseListGrid', PURCHASES_INSIDE_REGISTRY);

    /** Get all purchase of january 2016 */
    FU.buttons.search();
    components.dateInterval.range('01/01/2016', '31/01/2016');
    FU.modal.submit();
    GU.expectRowCount('PurchaseListGrid', 0);

    /** Get all purchase of february 2016 */
    FU.buttons.search();
    components.dateInterval.range('01/02/2016', '28/02/2016');
    FU.modal.submit();
    GU.expectRowCount('PurchaseListGrid', PURCHASES_INSIDE_REGISTRY);

    /** Get all purchase of the year 2017 */
    FU.buttons.search();
    components.dateInterval.range('01/01/2017', '31/12/2017');
    FU.modal.submit();
    GU.expectRowCount('PurchaseListGrid', 0);

    // clear filters
    FU.buttons.clear();
  });

  it('find purchase by reference', () => {

    /** Existing reference */
    FU.buttons.search();
    FU.input('$ctrl.bundle.reference', 'TPA1');
    FU.modal.submit();
    GU.expectRowCount('PurchaseListGrid', 1);

    /** Not Existing reference */
    FU.buttons.search();
    FU.input('$ctrl.bundle.reference', 'NOT_A_REFERENCE');
    FU.modal.submit();
    GU.expectRowCount('PurchaseListGrid', 0);

    // clear filters
    FU.buttons.clear();
  });

  it('find purchase by supplier', () => {

    /** Get all purchase of test Supplier */
    FU.buttons.search();
    FU.uiSelect('$ctrl.bundle.supplier_uuid', 'Test Supplier');
    FU.modal.submit();
    GU.expectRowCount('PurchaseListGrid', PURCHASES_INSIDE_REGISTRY);

    // clear filters
    FU.buttons.clear();
  });


  it('find purchase by user', () => {

    /** Get all purchase of Regular User */
    FU.buttons.search();
    FU.uiSelect('$ctrl.bundle.user_id', 'Regular User');
    FU.modal.submit();
    GU.expectRowCount('PurchaseListGrid', 0);

    /** Get all purchase of super user */
    FU.buttons.search();
    FU.uiSelect('$ctrl.bundle.user_id', 'Super User');
    FU.modal.submit();
    GU.expectRowCount('PurchaseListGrid', PURCHASES_INSIDE_REGISTRY);

    // clear filters
    FU.buttons.clear();
  });

  it('find confirmed purchases', () => {

    /** Get all confirmed purchases */
    FU.buttons.search();
    element(by.model('$ctrl.bundle.is_confirmed')).click();
    FU.modal.submit();
    GU.expectRowCount('PurchaseListGrid', 0);

    // clear filters
    FU.buttons.clear();
  });

  it('set status to confirmed', () => {

    /** Set to confirmed for first */
    page.editStatus(0);

    FU.radio('$ctrl.status', 0);
    FU.modal.submit();
  });

  it('find confirmed purchases order after update status', () => {

    /** Get all confirmed purchases */
    FU.buttons.search();
    element(by.model('$ctrl.bundle.is_confirmed')).click();
    FU.modal.submit();
    GU.expectRowCount('PurchaseListGrid', 1);

    // clear filters
    FU.buttons.clear();
  });

}

describe('Purchase Order Registry', PurchasesRegistryTests);
