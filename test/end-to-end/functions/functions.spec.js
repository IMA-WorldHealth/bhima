const helpers = require('../shared/helpers');
const { notification } = require('../shared/components');
const FunctionPage = require('./functions.page');

describe('Job Titles Management', () => {
  before(() => helpers.navigate('#!/functions'));

  const page = new FunctionPage();

  const newProfession = 'Comptable';
  const updateProfession = 'Chef Comptable';

  it('successfully creates a new job title', () => {
    page.create(newProfession);
    notification.hasSuccess();
  });

  it('successfully edits a job title', () => {
    page.update(newProfession, updateProfession);
    notification.hasSuccess();
  });

  it('errors when missing job tit create when incorrect job title', () => {
    page.errorOnCreateFunction();
  });

  it('successfully delete a job title', () => {
    page.remove(updateProfession);
    notification.hasSuccess();
  });

});
