const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
const components = require('../shared/components');

describe('Inventory Configuration', () => {
  const url = '#/inventory/configuration';

  // navigate to the page
  before(() => helpers.navigate(url));

  const group = {
    name : 'Médicaments en Sirop Comprimes',
    code : '1700',
    sales_account : 'Vente Médicaments en comprimes',
    stock_account : 'Médicaments en comprimes',
    cogs_account  : 'Achat Médicaments',
    expires : 1,
    unique_item : 0,
  };

  const groupWithOnlySalesAccount = {
    name : 'Group With Only Sales Account',
    code : '1900',
    sales_account : '70611012', // Hospitalisation
  };

  const updateGroup = {
    name : '[E2E] Inventory Group updated',
    code : '2500',
    sales_account : '70611011', // Optique
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

    // beforeEach(() => browser.refresh()); // eslint-disable-line

    it('creates a new inventory group', async () => {
      await $('[data-create-group]').click();
      await FU.input('$ctrl.session.name', group.name);
      await FU.input('$ctrl.session.code', group.code);

      await components.accountSelect.set(group.sales_account, null, $('[data-sales-account]'), 'accountName');
      await components.accountSelect.set(group.stock_account, null, $('[data-stock-account]'), 'accountName');
      await components.accountSelect.set(group.cogs_account, null, $('[data-cogs-account]'), 'accountName');

      await FU.buttons.submit();
      await components.notification.hasSuccess();
    });

    it('updates an existing inventory group', async () => {
      await $(`[data-edit-group="${group.code}"]`).click();
      await FU.input('$ctrl.session.name', updateGroup.name);
      await FU.input('$ctrl.session.code', updateGroup.code);

      await components.accountSelect.set(updateGroup.sales_account, null, $('[data-sales-account]'));

      await FU.buttons.submit();
      await components.notification.hasSuccess();
    });

    it('deletes an existing inventory group', async () => {
      await $(`[data-delete-group="${updateGroup.code}"]`).click();
      await FU.buttons.submit();
      await components.notification.hasSuccess();
    });

    it('creates an inventory group with only a sales account', async () => {
      await $('[data-create-group]').click();
      await FU.input('$ctrl.session.name', groupWithOnlySalesAccount.name);
      await FU.input('$ctrl.session.code', groupWithOnlySalesAccount.code);

      await components.accountSelect.set(groupWithOnlySalesAccount.sales_account, null, $('[data-sales-account]'));

      await FU.buttons.submit();
      await components.notification.hasSuccess();
    });
  });

  // test inventory type
  describe('Types', () => {
    // navigate to the page
    before(() => helpers.navigate(url));

    it('creates a new inventory type', async () => {
      await $('[data-create-type]').click();
      await FU.input('$ctrl.session.text', type.text);
      await FU.buttons.submit();
      await components.notification.hasSuccess();
    });

    it('updates an existing inventory type', async () => {
      await $(`[data-edit-type="${type.text}"]`).click();
      await FU.input('$ctrl.session.text', updateType.text);
      await FU.buttons.submit();
      await components.notification.hasSuccess();
    });

    it('deletes an existing inventory type', async () => {
      await $(`[data-delete-type="${updateType.text}"]`).click();
      await FU.buttons.submit();
      await components.notification.hasSuccess();
    });
  });

  // test inventory unit
  describe('Units', () => {
    // navigate to the page
    before(() => helpers.navigate(url));

    it('creates a new inventory unit', async () => {
      await $('[data-create-unit]').click();
      await FU.input('$ctrl.session.text', unit.text);
      await FU.input('$ctrl.session.abbr', unit.abbr);
      await FU.buttons.submit();
      await components.notification.hasSuccess();
    });

    it('updates an existing inventory unit', async () => {
      await $(`[data-edit-unit="${unit.abbr}"]`).click();
      await FU.input('$ctrl.session.text', updateUnit.text);
      await FU.input('$ctrl.session.abbr', updateUnit.abbr);
      await FU.buttons.submit();
      await components.notification.hasSuccess();
    });

    it('deletes an existing inventory unit', async () => {
      await $(`[data-delete-unit="${updateUnit.abbr}"]`).click();
      await FU.buttons.submit();
      await components.notification.hasSuccess();
    });
  });
});
