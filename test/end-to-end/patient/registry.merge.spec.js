const helpers = require('../shared/helpers');
const components = require('../shared/components');
const MergePatientPage = require('./registry.merge.page');

describe('Merge Patients', () => {
  beforeEach(() => helpers.navigate('#/patients'));

  const Page = new MergePatientPage();

  it('forbid selection of more than two patients', async () => {
    await Page.gridSelectRows(0, 1, 2);
    await Page.openMergeTool();
    await components.notification.hasWarn();
  });

  it('successfully merge two selected patients into one', async () => {
    const reference = 'PA.TPA.2';

    await Page.gridSelectRows(1, 2);
    await Page.openMergeTool();
    await Page.selectPatientToKeep(reference);
    await Page.merge();
    await components.notification.hasSuccess();
  });

});
