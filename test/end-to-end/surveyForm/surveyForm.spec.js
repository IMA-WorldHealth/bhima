const helpers = require('../shared/helpers');
const SurveyFormManagement = require('./surveyForm.page');

describe('Survey Form Management', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/survey_form'));

  const Page = new SurveyFormManagement();

  const newSurveyFormElement = {
    dataCollector : 'Fiche Kardex',
    type : 'Image',
    label : 'Image du patient',
    name : 'imagePatient',
    hint : 'Veuillez renseigner le nom de l\' image',
  };

  const checkValidationName = {
    dataCollector : 'Fiche Kardex',
    type : 'Image',
    label : 'Validation Variable Name',
    name1 : 'Name with space',
    name2 : 'Namewith,and;',
    name3 : 'Namewith@',
    name4 : 'Namewith\'and "',
    name5 : 'Namewith()',
    hint : 'Veuillez renseigner le nom de l\' image',
  };

  //  Sélection Multiple

  const updateSurveyFormElement = {
    type : 'Sélection Multiple',
    choice_list_id : 'Médicament',
    name : 'medConsommes',
    label : 'Médicaments consommés',
    hint : 'Effacer',
  };

  const deleteListElement = {
    type : 'Sélection Unique',
    choice_list_id : 'Médicament',
    filter_choice_list_id : 'Médicaments consommés',
    name : 'ElementSup',
    label : 'Element a supprimer',
  };

  it('successfully creates a new Survey Form Element', async () => {
    await Page.create(newSurveyFormElement);
  });

  it('Failed to create a form element whose name parameter with space', async () => {
    await Page.checkValidate(checkValidationName, checkValidationName.name1);
  });

  it('Failed to create a form element whose name parameter with virgul', async () => {
    await Page.checkValidate(checkValidationName, checkValidationName.name2);
  });

  it('Failed to create a form element whose name parameter with @ ', async () => {
    await Page.checkValidate(checkValidationName, checkValidationName.name3);
  });

  it('Failed to create a form element whose name parameter with Quotation mark and apostrophe ', async () => {
    await Page.checkValidate(checkValidationName, checkValidationName.name4);
  });

  it('Failed to create a form element whose name parameter with parenthesis ', async () => {
    await Page.checkValidate(checkValidationName, checkValidationName.name5);
  });

  it('successfully edits a Survey Form Element', async () => {
    await Page.edit(newSurveyFormElement.label, updateSurveyFormElement);
  });

  it('successfully creates a deletable element', async () => {
    await Page.createDeletable(deleteListElement);
  });

  it('successfully delete a list Element', async () => {
    await Page.delete(deleteListElement.label);
  });
});
