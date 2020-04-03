const helpers = require('../shared/helpers');
const DisplayMetadataManagement = require('./displayMetadata.page');
const SearchModalPage = require('./searchModal.page.js');

describe('Metadata Management', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/display_metadata'));

  const Page = new DisplayMetadataManagement();
  const searchModalPage = new SearchModalPage();
  const formulaire = 'Formulaire Special';

  const newSurveyData1 = {
    label : 'Update',
    longueur : 205,
    largeur : 450,
    nombre_agent : 300,
    nombre_femme : 0,
  };

  const dataDelete = {
    label : 'Access Project',
  };

  it('successfully Delete data for survey', async () => {
    await searchModalPage.surveyFormSelect(formulaire);
    await searchModalPage.submit();

    await Page.deleteDataSurvey(dataDelete);
  });

  it('successfully Searching for form data for posting and updatingSearches'
    .concat(' = for form data for posting and updating'), async () => {
    await Page.updateMetadata('IMA World Health', newSurveyData1);
  });

});
