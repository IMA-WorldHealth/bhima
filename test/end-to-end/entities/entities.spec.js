const helpers = require('../shared/helpers');
const EntityPage = require('./entities.page');

describe('Entity Management', () => {
  before(() => helpers.navigate('#!/entities'));

  const Page = new EntityPage();

  const entity = {
    display_name : 'IMA DEVELOPPERS OFFICE',
    type : 'Bureau',
    gender : 'Autre',
    phone : '+243811838662',
    email : 'info@ima.org',
    address : 'USA',
  };

  const updateEntity = {
    display_name : 'IMA DEVELOPPERS',
    type : 'Entreprise',
    gender : 'Autre',
    phone : '+243811838662',
    email : 'info@ima.org',
    address : 'Kinshasa',
  };

  it('successfully creates a new entity', async () => {
    await Page.createEntity(
      entity.display_name,
      entity.type,
      entity.gender,
      entity.phone,
      entity.email,
      entity.address,
    );
  });

  it('successfully edits a entity', async () => {
    await Page.editEntity(
      entity.display_name,
      updateEntity.display_name,
      updateEntity.type,
      null, null, null,
      updateEntity.address,
    );
  });

  it('don\'t create when incorrect entity name', async () => {
    await Page.errorOnCreateEntity();
  });

  it('successfully delete a entity', async () => {
    await Page.deleteEntity(updateEntity.display_name);
  });
});
