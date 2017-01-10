/* global element, by, browser */
'use strict';

const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');
const helpers = require('../shared/helpers');
const components = require('../shared/components');

function CashPaymentsRegistryTests() {

  // navigate to the page
  before(() => helpers.navigate('#/finance/reports/cash_payment'));

  const PAYMENT_INSIDE_REGISTRY = 3;
  const PAYMENT_PRIMARY_CASHBOX = 0;

  it('find payment by date interval', () => {

    /** Get all payment of the year 2016 */
    FU.buttons.search();
    components.dateInterval.range('01/01/2016', '31/12/2016');
    FU.modal.submit();
    GU.expectRowCount('payment-registry', 2);

    /** Get all payment of january 2016 */
    FU.buttons.search();
    components.dateInterval.range('01/01/2016', '31/01/2016');
    FU.modal.submit();
    GU.expectRowCount('payment-registry', 1);

    /** Get all payment of the year 2015 */
    FU.buttons.search();
    components.dateInterval.range('01/01/2015', '31/12/2015');
    FU.modal.submit();
    GU.expectRowCount('payment-registry', 0);

    // clear filters
    FU.buttons.clear();
  });

  it('find payment by reference', () => {

    /** Existing reference */
    FU.buttons.search();
    FU.input('$ctrl.bundle.reference', 'TPA1');
    FU.modal.submit();
    GU.expectRowCount('payment-registry', 1);

    /** Not Existing reference */
    FU.buttons.search();
    FU.input('$ctrl.bundle.reference', 'NOT_A_REFERENCE');
    FU.modal.submit();
    GU.expectRowCount('payment-registry', 0);

    // clear filters
    FU.buttons.clear();
  });

  it('find payment by client', () => {

    /** Get all payment of Patient/2/Patient */
    FU.buttons.search();
    FU.uiSelect('$ctrl.bundle.debtor_uuid', 'Patient/2/Patient');
    FU.modal.submit();
    GU.expectRowCount('payment-registry', PAYMENT_INSIDE_REGISTRY);

    // clear filters
    FU.buttons.clear();
  });

  it('find payment by cashbox', () => {

    /** Get all payment on Test Primary Cashbox A */
    FU.buttons.search();
    FU.uiSelect('$ctrl.bundle.cashbox_id', 'Test Primary Cashbox A');
    FU.modal.submit();
    GU.expectRowCount('payment-registry', PAYMENT_PRIMARY_CASHBOX);

    /** Get all payment on Test Aux Cashbox A */
    FU.buttons.search();
    FU.uiSelect('$ctrl.bundle.cashbox_id', 'Test Aux Cashbox A');
    FU.modal.submit();
    GU.expectRowCount('payment-registry', PAYMENT_INSIDE_REGISTRY);

    /** Get all payment on Test Aux Cashbox B */
    FU.buttons.search();
    FU.uiSelect('$ctrl.bundle.cashbox_id', 'Test Aux Cashbox B');
    FU.modal.submit();
    GU.expectRowCount('payment-registry', 0);

    // clear filters
    FU.buttons.clear();
  });

  it('find payment by user', () => {

    /** Get all payment of Regular User */
    FU.buttons.search();
    FU.uiSelect('$ctrl.bundle.user_id', 'Regular User');
    FU.modal.submit();
    GU.expectRowCount('payment-registry', 0);

    /** Get all payment of super user */
    FU.buttons.search();
    FU.uiSelect('$ctrl.bundle.user_id', 'Super User');
    FU.modal.submit();
    GU.expectRowCount('payment-registry', PAYMENT_INSIDE_REGISTRY);

    // clear filters
    FU.buttons.clear();
  });

  it('successfully Cancel a Cash Payment', () => {
    element(by.id(`TPA2`)).click();
    FU.input('ModalCtrl.creditNote.description', 'Cancel This Payment');
    FU.modal.submit();
    components.notification.hasSuccess();
  });
}

module.exports = CashPaymentsRegistryTests;
