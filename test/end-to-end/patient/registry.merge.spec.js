const MergePatientPage = require('./registry.merge.page');

describe('Merge Patients', () => {

  const Page = new MergePatientPage();

  it('successfully merge two selected patients into one', async () => {
    await Page.openMergeTool();
  });

});
