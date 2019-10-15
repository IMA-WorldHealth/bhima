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
