const helpers = require('../shared/helpers');
const ChoiceListManagement = require('./choiceListManagement.page');

describe('Choice List Management', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/choices_list_management'));

  const Page = new ChoiceListManagement();

  const newChoiceListElement = {
    name : 'oshwe',
    label : 'OSHWE',
  };

  const deleteListElement = {
    name : 'fruit',
    label : 'Fruit',
  };

  const updateChoiceListElement = {
    parent : 'Matonge',
    group_label : 'Avenue',
  };

  it('successfully creates a new Choice List Management', async () => {
    await Page.create(newChoiceListElement);
  });

  it('successfully edits a Choice List Management', async () => {
    await Page.edit(newChoiceListElement.label, updateChoiceListElement);
  });

  it('don\'t create when incorrect Choice List Management', async () => {
    await Page.errorOnCreate();
  });

  it('successfully creates a deletable element', async () => {
    await Page.create(deleteListElement);
  });

  it('successfully delete a list Element', async () => {
    await Page.delete(deleteListElement.label);
  });
});
