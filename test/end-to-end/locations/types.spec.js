const helpers = require('../shared/helpers');
const LocationTypeFormManagement = require('./types.page');

describe('Locations types', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/locations/types'));

  const Page = new LocationTypeFormManagement();

  // Create Country
  const newTypeElements = {
    typeLabel : 'Location Type Sample',
    color : 'burlywood',
    is_leaves : 1,
    label_name : 'location_type_sample',
  };

  const updateTypeElements = {
    typeLabel : 'Update Location Type',
    color : 'chartreuse',
    is_leaves : 1,
    label_name : 'location_type_sample',
  };

  it('successfully creates a new Location type', async () => {
    await Page.createType(newTypeElements);
  });

  // Change Name, and Parent for a location
  it('successfully edits a Location', async () => {
    await Page.openEdit(newTypeElements.typeLabel);
    await Page.edit(updateTypeElements);
  });

  it('successfully delete a location Element', async () => {
    await Page.delete(updateTypeElements.typeLabel);
  });
});
