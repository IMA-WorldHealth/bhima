/* global element, by, browser, protractor */
const { expect } = require('chai');
const helpers = require('../shared/helpers');

const EC = protractor.ExpectedConditions;

const components = require('../shared/components');
const FU = require('../shared/FormUtils');

describe('Debtor Groups Management', () => {
  const INITIAL_GROUPS = 3;
  const DELETEABLE_DEBTOR_GROUP = 'A11E6B7FFBBB432EAC2A5312A66DCCF4';

  const root = '#/debtors/groups';
  before(() => helpers.navigate(root));

  // helper to quickly get a group by uuid
  const getGroupRow = (uuid) => $(`[data-group-entry="${uuid}"]`);

  const locations = [
    {
      location01 : 'Merge Country',
      location02 : 'Merge Province',
      location03 : 'Merge Town 1',
      location04 : 'Merge Township 1',
    },
    {
      location01 : 'République Démocratique du Congo',
      location02 : 'Kinshasa',
      location03 : 'Lukunga',
      location04 : 'Gombe',
    },
  ];

  it('lists base test debtor groups', async () => {
    expect(await element.all(by.css('[data-group-entry]')).count()).to.equal(INITIAL_GROUPS);
  });

  it('creates a debtor group', async () => {
    await FU.buttons.create();

    await FU.input('GroupUpdateCtrl.group.name', 'E2E Debtor Group');

    await FU.uiSelect('GroupUpdateCtrl.group.color', 'Jaune');

    await components.accountSelect.set('41111010'); // CHURCH
    await FU.input('GroupUpdateCtrl.group.max_credit', '1200');
    await FU.input('GroupUpdateCtrl.group.note', 'This debtor group was created by an automated end to end test.');
    await FU.input('GroupUpdateCtrl.group.phone', '+243 834 443');
    await FU.input('GroupUpdateCtrl.group.email', 'e2e@email.com');

    // select the locations specified
    await components.locationConfigurationSelect.set(locations[0].location01);

    // Location Level 2
    const select02 = element(by.id('level_0'));
    await select02.click();
    const filterLocation02 = helpers.selectLocationLabel(locations[0].location02);

    const option02 = select02.element(
      by.cssContainingText(
        '.dropdown-menu [role="option"]', filterLocation02,
      ),
    );
    await option02.click();
    // Location Level 3
    const select03 = element(by.id('level_1'));
    await select03.click();
    const filterLocation03 = helpers.selectLocationLabel(locations[0].location03);

    const option03 = select03.element(
      by.cssContainingText(
        '.dropdown-menu [role="option"]', filterLocation03,
      ),
    );
    await option03.click();

    // Location Level 4
    const select04 = element(by.id('level_2'));
    await select04.click();
    const filterLocation04 = helpers.selectLocationLabel(locations[0].location04);

    const option04 = select04.element(
      by.cssContainingText(
        '.dropdown-menu [role="option"]', filterLocation04,
      ),
    );
    await option04.click();

    FU.select('GroupUpdateCtrl.group.price_list_uuid', 'Test Price List');

    FU.buttons.submit();

    await components.notification.hasSuccess();

    expect(await element.all(by.css('[data-group-entry]')).count()).to.equal(INITIAL_GROUPS + 1);
  });

  it('deletes a debtor group', async () => {
    // find the group by uuid
    const group = getGroupRow(DELETEABLE_DEBTOR_GROUP);

    // delete the creditor group
    await group.$('[data-method="update"]').click();

    // click the "delete" button
    await FU.buttons.delete();

    // submit the confirmation modal
    await FU.modal.submit();

    await components.notification.hasSuccess();
  });

  it('updates a debtor group', async () => {
    const updateGroup = element.all(by.css('[data-group-entry]'));
    await updateGroup.all(by.css('[data-method="update"]')).first().click();

    await FU.input('GroupUpdateCtrl.group.max_credit', '500');
    await FU.input('GroupUpdateCtrl.group.name', '[Updated]');

    // select the locations specified
    await components.locationConfigurationSelect.set(locations[1].location01);

    // Location Level 2
    const select02 = element(by.id('level_0'));
    await select02.click();
    const filterLocation02 = helpers.selectLocationLabel(locations[1].location02);

    const option02 = select02.element(
      by.cssContainingText(
        '.dropdown-menu [role="option"]', filterLocation02,
      ),
    );
    await option02.click();
    // Location Level 3
    const select03 = element(by.id('level_1'));
    await select03.click();
    const filterLocation03 = helpers.selectLocationLabel(locations[1].location03);

    const option03 = select03.element(
      by.cssContainingText(
        '.dropdown-menu [role="option"]', filterLocation03,
      ),
    );
    await option03.click();

    // Location Level 4
    const select04 = element(by.id('level_2'));
    await select04.click();
    const filterLocation04 = helpers.selectLocationLabel(locations[1].location04);

    const option04 = select04.element(
      by.cssContainingText(
        '.dropdown-menu [role="option"]', filterLocation04,
      ),
    );
    await option04.click();

    await FU.buttons.submit();

    await components.notification.hasSuccess();
  });

  it('updates debtor group invoicing fee subscriptions', async () => {
    const updateGroup = element.all(by.css('[data-group-entry]')).first();

    await updateGroup.$('[data-method="update"]').click();

    await element(by.css('#invoicingFeeSubscription')).click();

    await browser.wait(EC.visibilityOf($('.modal-body'), 2000));

    await $('[data-group-option="Test Invoicing Fee"]').click();

    await FU.modal.submit();
    await components.notification.hasSuccess();
  });

  it('updates debtor group subsidy subscriptions', async () => {
    await element(by.css('#subsidySubscription')).click();
    await element.all(by.css('[data-group-option]')).get(1).click();
    await FU.modal.submit();
    await components.notification.hasSuccess();
  });
});
