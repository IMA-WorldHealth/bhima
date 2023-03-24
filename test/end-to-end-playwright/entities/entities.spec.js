const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');
const EntityPage = require('./entities.page');

// routes used in tests
const location = 'entities';

const Page = new EntityPage();

test.describe('Entity Management', () => {

  test.beforeEach(async ({ page }) => {
    TU.registerPage(page);
    await TU.login();
    await TU.navigate(location);
    Page.init();
  });

  const entity = {
    display_name : 'IMA DEVELOPPERS OFFICE',
    type : 'Office',
    gender : 'Other',
    phone : '+243811838662',
    email : 'info@ima.org',
    address : 'USA',
  };

  const updateEntity = {
    display_name : 'IMA DEVELOPPERS',
    type : 'Enterprise',
    gender : 'Other',
    phone : '+243811838662',
    email : 'info@ima.org',
    address : 'Kinshasa',
  };

  test('successfully creates a new entity', async () => {
    await Page.createEntity(
      entity.display_name,
      entity.type,
      entity.gender,
      entity.phone,
      entity.email,
      entity.address,
    );
  });

  test('successfully edits a entity', async () => {
    await Page.editEntity(
      entity.display_name,
      updateEntity.display_name,
      updateEntity.type,
      null, null, null,
      updateEntity.address,
    );
  });

  test('do not create when an entity with invalid name', async () => {
    await Page.errorOnCreateEntity();
  });

  test('successfully delete a entity', async () => {
    await Page.deleteEntity(updateEntity.display_name);
  });
});
