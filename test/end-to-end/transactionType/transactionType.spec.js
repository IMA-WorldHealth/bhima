/* global element, by */

const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
const components = require('../shared/components');

describe('transaction types', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/transaction_type'));

  const newType = {
    text        : 'E2E Transaction Type',
    type        : 'Récettes',
  };

  const updateType = {
    text        : 'E2E Transaction Type updated',
    type        : 'Dépenses',
  };

  const otherType = {
    text        : 'E2E Other Transaction Type',
    type        : 'Autre',
  };

  it('successfully creates a transaction type', () => {
    FU.buttons.create();
    FU.input('$ctrl.transactionType.text', newType.text);
    FU.select('$ctrl.transactionType.type', newType.type);
    FU.buttons.submit();
    components.notification.hasSuccess();
  });

  it('successfully updates an existing transaction type', () => {
    $(`[data-edit-type="${newType.text}"]`).click();
    FU.input('$ctrl.transactionType.text', updateType.text);
    FU.select('$ctrl.transactionType.type', updateType.type);
    FU.buttons.submit();
    components.notification.hasSuccess();
  });

  it('successfully creates a transaction type with a specific type', () => {
    FU.buttons.create();
    FU.input('$ctrl.transactionType.text', otherType.text);
    FU.select('$ctrl.transactionType.type', updateType.type);
    FU.buttons.submit();
    components.notification.hasSuccess();
  });

  it('dont creates a new transaction type for missing type', () => {
    FU.buttons.create();
    element(by.model('$ctrl.transactionType.type')).click();
    FU.buttons.submit();

    // check validations
    FU.validation.error('$ctrl.transactionType.type');

    FU.modal.cancel();

    components.notification.hasDanger();
  });


  it('Dont creates a new transaction type for missing required values', () => {
    FU.buttons.create();
    FU.buttons.submit();

    // check validations
    FU.validation.error('$ctrl.transactionType.text');
    FU.validation.error('$ctrl.transactionType.type');

    FU.modal.cancel();

    components.notification.hasDanger();
  });
});
