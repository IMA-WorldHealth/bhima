const helpers = require('../shared/helpers');
const LocationFormManagement = require('./configurations.page');

describe('Locations Configuration', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/locations/configuration'));

  const Page = new LocationFormManagement();

  // Create Country
  const newLocationElement = {
    name : 'United States of America',
    latitude : '38.8973',
    longitude : '-77.0362',
    type : 'Pays',
  };

  // Create District
  const newLocationDistrict = {
    name : 'Columbia',
    parent : 'United States of America',
    latitude : '38.8973',
    longitude : '-77.0362',
    type : 'District',
  };

  // Create Town
  const newLocationTown = {
    name : 'Washington',
    parent : 'United States of America',
    parent01 : 'Columbia',
    latitude : '38.8973',
    longitude : '-77.0362',
    type : 'Ville',
  };

  // Create Sector
  const newLocationSector = {
    name : 'Northwest',
    parent : 'United States of America',
    parent01 : 'Columbia',
    parent02 : 'Washington',
    latitude : '',
    longitude : '',
    type : 'Secteur',
  };

  const newLocationTownParent = {
    parent : 'Merge Country',
    name : 'Other Town',
    type : 'Ville',
  };

  const updateLocationElement = {
    name : 'Merge Township 1',
    updateName : 'Kananga',
    type : 'Ville',
    parent : 'République Démocratique du Congo',
    parent01 : 'Kasaï-Central',
  };

  it('successfully creates a new Location', async () => {
    await Page.createLocationRoot(newLocationElement);
  });

  it('successfully creates a new Disctrit', async () => {
    await Page.createLocationLevel01(newLocationDistrict);
  });

  it('successfully creates a new Town', async () => {
    await Page.createLocationLevel02(newLocationTown);
  });

  it('successfully creates a new Sector', async () => {
    await Page.createLocationLevel03(newLocationSector);
  });

  it('Add a new Township from its Parent', async () => {
    await Page.openAddChild(newLocationTownParent.parent);
    await Page.createLocationFromParent(newLocationTownParent);
  });

  // Change Name, and Parent for a location
  it('successfully edits a Location', async () => {
    await Page.openEdit(updateLocationElement.name);
    await Page.edit(updateLocationElement);
  });

  it('successfully delete a location Element', async () => {
    await Page.delete(updateLocationElement.updateName);
  });

  it('Unable to delete because this location is defined as parent', async () => {
    await Page.deleteError('Merge Town 2');
  });

  it('Cannot delete entity because entity is used in another table', async () => {
    await Page.deleteError('Gombe');
  });
});
