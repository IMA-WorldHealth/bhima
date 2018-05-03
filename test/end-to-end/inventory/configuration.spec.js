const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
const components = require('../shared/components');

describe('Inventory Configuration', () => {
  const url = '#/inventory/configuration';

  // navigate to the page
  before(() => helpers.navigate(url));

  const group = {
    name : 'Medicaments en Sirop for Fun',
    code : '1700',
    sales_account : 'Caisse Principale USD',
    stock_account : 'Medicaments en Sirop',
    cogs_account  : 'Médicaments en Sirop',
    expires : 1,
    unique_item : 0,
  };

  const groupWithOnlySalesAccount = {
    name : 'Group With Only Sales Account',
    code : '1900',
    sales_account : '77111010', // 77111010 - Interets de Prets *
  };

  const updateGroup = {
    name : '[E2E] Inventory Group updated',
    code : '2500',
    sales_account : 'Caisse Principale USD',
  };

  // inventory type
  const type = { text : '[E2E] Inventory Type' };
  const updateType = { text : '[E2E] Inventory Type updated' };

  // inventory unit
  const unit = { text : '[E2E] Inventory Unit', abbr : 'IUE2E' };
  const updateUnit = { text : '[E2E] Inventory Unit updated', abbr : 'IUu' };

  describe('Groups', () => {
    // navigate to the page
    before(() => helpers.navigate(url));

    it('creates a new inventory group', () => {
      $('[data-create-group]').click();
      FU.input('$ctrl.session.name', group.name);
      FU.input('$ctrl.session.code', group.code);

      components.accountSelect.set(group.sales_account, 'sales_account');
      components.accountSelect.set(group.stock_account, 'stock_account');
      components.accountSelect.set(group.cogs_account, 'cogs_account');

      FU.buttons.submit();
      components.notification.hasSuccess();
    });

    it('updates an existing inventory group', () => {
      $(`[data-edit-group="${group.code}"]`).click();
      FU.input('$ctrl.session.name', updateGroup.name);
      FU.input('$ctrl.session.code', updateGroup.code);

      components.accountSelect.set(updateGroup.sales_account, 'sales_account');

      FU.buttons.submit();
      components.notification.hasSuccess();
    });

    it('deletes an existing inventory group', () => {
      $(`[data-delete-group="${updateGroup.code}"]`).click();
      FU.buttons.submit();
      components.notification.hasSuccess();
    });

    it('creates an inventory group with only a sales account', () => {
      $('[data-create-group]').click();
      FU.input('$ctrl.session.name', groupWithOnlySalesAccount.name);
      FU.input('$ctrl.session.code', groupWithOnlySalesAccount.code);

      components.accountSelect.set(groupWithOnlySalesAccount.sales_account, 'sales_account');

      FU.buttons.submit();
      components.notification.hasSuccess();
    });
  });

  // test inventory type
  describe('Types', () => {
    // navigate to the page
    before(() => helpers.navigate(url));

    it('creates a new inventory type', () => {
      $('[data-create-type]').click();
      FU.input('$ctrl.session.text', type.text);
      FU.buttons.submit();
      components.notification.hasSuccess();
    });

    it('updates an existing inventory type', () => {
      $(`[data-edit-type="${type.text}"]`).click();
      FU.input('$ctrl.session.text', updateType.text);
      FU.buttons.submit();
      components.notification.hasSuccess();
    });

    it('deletes an existing inventory type', () => {
      $(`[data-delete-type="${updateType.text}"]`).click();
      FU.buttons.submit();
      components.notification.hasSuccess();
    });
  });

  // test inventory unit
  describe('Units', () => {
    // navigate to the page
    before(() => helpers.navigate(url));

    it('creates a new inventory unit', () => {
      $('[data-create-unit]').click();
      FU.input('$ctrl.session.text', unit.text);
      FU.input('$ctrl.session.abbr', unit.abbr);
      FU.buttons.submit();
      components.notification.hasSuccess();
    });

    it('updates an existing inventory unit', () => {
      $(`[data-edit-unit="${unit.abbr}"]`).click();
      FU.input('$ctrl.session.text', updateUnit.text);
      FU.input('$ctrl.session.abbr', updateUnit.abbr);
      FU.buttons.submit();
      components.notification.hasSuccess();
    });

    it('deletes an existing inventory unit', () => {
      $(`[data-delete-unit="${updateUnit.abbr}"]`).click();
      FU.buttons.submit();
      components.notification.hasSuccess();
    });
  });
});
