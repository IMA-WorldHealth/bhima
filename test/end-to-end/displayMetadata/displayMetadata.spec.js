const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');

const DisplayMetadataManagement = require('./displayMetadata.page');
const SearchModalPage = require('./searchModal.page');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Metadata Management', () => {
  let page;

  // navigate to the page
  test.beforeEach(async () => {
    page = await DisplayMetadataManagement.new();
    await TU.navigate('/#!/display_metadata');
  });

  const searchModalPage = new SearchModalPage();
  const formulaire = 'Formulaire Special';

  const newSurveyData1 = {
    label : 'Update',
    longueur : '205',
    largeur : '450',
    nombre_agent : '300',
    nombre_femme : '0',
  };

  const dataDelete = {
    label : 'Access Project',
  };

  test('successfully Delete data for survey', async () => {
    await searchModalPage.surveyFormSelect(formulaire);
    await searchModalPage.submit();
    await page.deleteDataSurvey(dataDelete);
  });

  test('successfully Searching for form data for posting and updatingSearches'
    .concat(' = for form data for posting and updating'), async () => {
    await page.updateMetadata('IMA World Health', newSurveyData1);
  });

});
