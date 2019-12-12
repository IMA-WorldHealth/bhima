const helpers = require('../shared/helpers');
const { notification } = require('../shared/components');
const FunctionPage = require('./functions.page');

describe('Job Titles Management', () => {
  before(() => helpers.navigate('#!/functions'));

  const page = new FunctionPage();

  const newProfession = 'Comptable';
  const updateProfession = 'Chef Comptable';

  it('successfully creates a new job title', async () => {
    await page.create(newProfession);
    await notification.hasSuccess();
  });

  it('successfully edits a job title', async () => {
    await page.update(newProfession, updateProfession);
    await notification.hasSuccess();
  });

  it('errors when missing job tit create when incorrect job title', async () => {
    await page.errorOnCreateFunction();
  });

  it('successfully delete a job title', async () => {
    await page.remove(updateProfession);
    await notification.hasSuccess();
  });
});
