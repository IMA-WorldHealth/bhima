const helpers = require('../shared/helpers');
const ChoiseListManagement = require('./choiseListManagement.page');

describe.only('Choise List Management', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/choises_list_management'));

  const Page = new ChoiseListManagement();

  const newChoiseListElement = {
    name : 'oshwe',
    label : 'OSHWE',
  };

  const deleteListElement = {
    name : 'fruit',
    label : 'Fruit',
  };

  const updateChoiseListElement = {
    parent : 'Matonge',
    group_label : 'Avenue',
  };

  it('successfully creates a new Choise List Management', async () => {
    await Page.create(newChoiseListElement);
  });

  it('successfully edits a Choise List Management', async () => {
    await Page.edit(newChoiseListElement.label, updateChoiseListElement);
  });

  it('don\'t create when incorrect Choise List Management', async () => {
    await Page.errorOnCreate();
  });

  it('successfully creates a deletable element', async () => {
    await Page.create(deleteListElement);
  });

  it('successfully delete a list Element', async () => {
    await Page.delete(deleteListElement.label);
  });
});
