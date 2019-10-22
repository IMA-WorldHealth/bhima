const helpers = require('../shared/helpers');
const FillFormManagement = require('./fillForm.page');

describe('Fill Form Management', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/fill_form'));

  const Page = new FillFormManagement();

  const newSurveyData1 = {
    label : 'Formulaire Special',
    structure : 'IMA World Health',
    longueur : 75,
    largeur : 40,
    nombre_agent : 120,
    nombre_femme : 2,
    raison : 'Pas de raison valable',
  };

  const newSurveyData2 = {
    patientName : 'Employee Test 1',
    choice_list_id : 'Paracetamol500 mg',
    poids : 45,
    dosekilos : '2',
    nombreFois : 3,
    voie : 'IV',
    date : '2008-05-18',
    temps : '14:50',
    hours : '12',
    minutes : '45',
  };

  it('successfully creates a new Survey data Element', async () => {
    await Page.create(newSurveyData1);
  });

  it('successfully creates a new Survey data Element for complexe form', async () => {
    await Page.createComplexe(newSurveyData2);
  });
});
