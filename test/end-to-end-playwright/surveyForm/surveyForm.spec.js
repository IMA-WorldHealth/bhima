const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');

const SurveyFormManagement = require('./surveyForm.page');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Survey Form Management', () => {

  test.beforeEach(async () => {
    await TU.navigate('/#!/survey_form');
  });

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

  const updateSurveyFormElement = {
    type : 'Select Multiple',
    choice_list_id : 'Médicament',
    name : 'medConsommes',
    label : 'Médicaments consommés',
    hint : 'Effacer',
  };

  const deleteListElement = {
    type : 'Select One',
    choice_list_id : 'Médicament',
    filter_choice_list_id : 'Médicaments consommés',
    name : 'ElementSup',
    label : 'Element a supprimer',
  };

  test('successfully creates a new Survey Form Element', async () => {
    await Page.create(newSurveyFormElement);
  });

  test('Failed to create a form element whose name parameter with space', async () => {
    await Page.checkValidate(checkValidationName, checkValidationName.name1);
  });

  test('Failed to create a form element whose name parameter with virgul', async () => {
    await Page.checkValidate(checkValidationName, checkValidationName.name2);
  });

  test('Failed to create a form element whose name parameter with @ ', async () => {
    await Page.checkValidate(checkValidationName, checkValidationName.name3);
  });

  test('Failed to create a form element whose name parameter with Quotation mark and apostrophe ', async () => {
    await Page.checkValidate(checkValidationName, checkValidationName.name4);
  });

  test('Failed to create a form element whose name parameter with parenthesis ', async () => {
    await Page.checkValidate(checkValidationName, checkValidationName.name5);
  });

  test('successfully edits a Survey Form Element', async () => {
    await Page.edit(newSurveyFormElement.label, updateSurveyFormElement);
  });

  test('successfully creates a deletable element', async () => {
    await Page.createDeletable(deleteListElement);
  });

  test('successfully delete a list Element', async () => {
    await Page.delete(deleteListElement.label);
  });
});
