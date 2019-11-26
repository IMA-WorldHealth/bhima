/* global element, by */

const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
const components = require('../shared/components');

describe('transaction types', () => {
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

  it('successfully creates a transaction type', async () => {
    await FU.buttons.create();
    await FU.input('$ctrl.transactionType.text', newType.text);
    await FU.select('$ctrl.transactionType.type', newType.type);
    await FU.buttons.submit();
    await components.notification.hasSuccess();
  });

  it('successfully updates an existing transaction type', async () => {
    await $(`[data-edit-type="${newType.text}"]`).click();
    await FU.input('$ctrl.transactionType.text', updateType.text);
    await FU.select('$ctrl.transactionType.type', updateType.type);
    await FU.buttons.submit();
    await components.notification.hasSuccess();
  });

  it('successfully creates a transaction type with a specific type', async () => {
    await FU.buttons.create();
    await FU.input('$ctrl.transactionType.text', otherType.text);
    await FU.select('$ctrl.transactionType.type', updateType.type);
    await FU.buttons.submit();
    await components.notification.hasSuccess();
  });

  it('don\'t create a new transaction type for missing type', async () => {
    await FU.buttons.create();
    await element(by.model('$ctrl.transactionType.type')).click();
    await FU.buttons.submit();

    // check validations
    await FU.validation.error('$ctrl.transactionType.type');

    await FU.modal.cancel();
    await components.notification.hasDanger();
  });


  it('Don\'t create a new transaction type for missing required values', async () => {
    await FU.buttons.create();
    await FU.buttons.submit();

    // check validations
    await FU.validation.error('$ctrl.transactionType.text');
    await FU.validation.error('$ctrl.transactionType.type');

    await FU.modal.cancel();
    await components.notification.hasDanger();
  });
});
