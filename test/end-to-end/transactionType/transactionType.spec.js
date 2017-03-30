/* global element, by, browser */

const chai = require('chai');
const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
const components = require('../shared/components');

const expect = chai.expect;
helpers.configure(chai);

describe('Transaction Types', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/transaction_type'));

  const newType = {
    text        : 'E2E Transaction Type',
    description : 'Test transaction type',
    type        : 'income',
    prefix      : 'E2ETT',
  };

  const updateType = {
    text        : 'E2E Transaction Type updated',
    description : 'Test transaction type updated',
    type        : 'expense',
    prefix      : 'E2ETT_UPDATED',
  };

  const otherType = {
    text        : 'E2E Other Transaction Type',
    description : 'Test Other transaction type',
    type        : 'other',
    prefix      : 'E2EOTT',
    other       : 'OTHER_TYPE',
  };

  it('Successfully creates a transaction type', () => {
    FU.buttons.create();
    FU.input('$ctrl.transactionType.text', newType.text);
    FU.input('$ctrl.transactionType.description', newType.description);
    FU.input('$ctrl.transactionType.prefix', newType.prefix);
    element(by.model('$ctrl.transactionType.type')).click();
    element(by.css(`[value=${newType.type}]`)).click();
    FU.buttons.submit();
    components.notification.hasSuccess();
  });

  it('Successfully updates an existing transaction type', () => {
    element(by.css(`[data-edit-type="${newType.text}"]`)).click();
    FU.input('$ctrl.transactionType.text', updateType.text);
    FU.input('$ctrl.transactionType.description', updateType.description);
    FU.input('$ctrl.transactionType.prefix', updateType.prefix);
    element(by.model('$ctrl.transactionType.type')).click();
    element(by.css(`[value=${updateType.type}]`)).click();
    FU.buttons.submit();
    components.notification.hasSuccess();
  });

  it('Successfully creates a transaction type with a specific type', () => {
    FU.buttons.create();
    FU.input('$ctrl.transactionType.text', otherType.text);
    FU.input('$ctrl.transactionType.description', otherType.description);
    FU.input('$ctrl.transactionType.prefix', otherType.prefix);
    element(by.model('$ctrl.transactionType.type')).click();
    element(by.css(`[value=${otherType.type}]`)).click();
    FU.input('$ctrl.otherType', otherType.other);
    FU.buttons.submit();
    components.notification.hasSuccess();
  });

  it('Dont creates a new transaction type for missing type', () => {
    FU.buttons.create();
    element(by.model('$ctrl.transactionType.type')).click();
    element(by.css(`[value=${otherType.type}]`)).click();
    FU.buttons.submit();

    // check validations
    FU.validation.error('$ctrl.transactionType.text');
    FU.validation.error('$ctrl.transactionType.description');
    FU.validation.error('$ctrl.transactionType.prefix');
    FU.validation.error('$ctrl.otherType');

    // be sure not success
    expect(element(by.css('[data-notification-type="notification-success"]')).isPresent())
      .to.eventually.equal(false);

    FU.modal.cancel();

    components.notification.hasDanger();
  });


  it('Dont creates a new transaction type for missing required values', () => {
    FU.buttons.create();
    FU.buttons.submit();

    // check validations
    FU.validation.error('$ctrl.transactionType.text');
    FU.validation.error('$ctrl.transactionType.description');
    FU.validation.error('$ctrl.transactionType.prefix');
    FU.validation.error('$ctrl.transactionType.type');

    // be sure not success
    expect(element(by.css('[data-notification-type="notification-success"]')).isPresent())
      .to.eventually.equal(false);

    FU.modal.cancel();

    components.notification.hasDanger();
  });
});
