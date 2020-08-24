const helpers = require('../shared/helpers');
const locationFormManagement = require('./configurations.page');

describe.only('Locations Configuration', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/locations/configuration'));

  const Page = new locationFormManagement();

  // Create Country
  const newLocationElement = {
    name : 'United States of America',
    latitude : '38.8973',
    longitude : '-77.0362',
    type : 'Pays',
  };

  // Create District
  const newLocationDistrict = {
    name : 'Columbia',
    parent : 'United States of America',
    latitude : '38.8973',
    longitude : '-77.0362',
    type : 'District',
  };

  // Create Town
  const newLocationTown = {
    name : 'Washington',
    parent : 'United States of America',
    parent01 : 'Columbia',
    latitude : '38.8973',
    longitude : '-77.0362',
    type : 'Ville',
  };

  // Create Sector
  const newLocationSector = {
    name : 'Northwest',
    parent : 'United States of America',
    parent01 : 'Columbia',
    parent02 : 'Washington',
    latitude : '',
    longitude : '',
    type : 'Secteur',
  };

  // it('successfully creates a new Location', async () => {
  //   await Page.createLocationRoot(newLocationElement);
  // });

  // it('successfully creates a new Disctrit', async () => {
  //   await Page.createLocationLevel01(newLocationDistrict);
  // });

  // it('successfully creates a new Town', async () => {
  //   await Page.createLocationLevel02(newLocationTown);
  // });

  it('successfully creates a new Sector', async () => {
    await Page.createLocationLevel03(newLocationSector);
  });

  // const checkValidationName = {
  //   dataCollector : 'Fiche Kardex',
  //   type : 'Image',
  //   label : 'Validation Variable Name',
  //   name1 : 'Name with space',
  //   name2 : 'Namewith,and;',
  //   name3 : 'Namewith@',
  //   name4 : 'Namewith\'and "',
  //   name5 : 'Namewith()',
  //   hint : 'Veuillez renseigner le nom de l\' image',
  // };

  //  Sélection Multiple

  // const updateSurveyFormElement = {
  //   type : 'Sélection Multiple',
  //   choice_list_id : 'Médicament',
  //   name : 'medConsommes',
  //   label : 'Médicaments consommés',
  //   hint : 'Effacer',
  // };

  // const deleteListElement = {
  //   type : 'Sélection Unique',
  //   choice_list_id : 'Médicament',
  //   filter_choice_list_id : 'Médicaments consommés',
  //   name : 'ElementSup',
  //   label : 'Element a supprimer',
  // };

  // it('Failed to create a form element whose name parameter with space', async () => {
  //   await Page.checkValidate(checkValidationName, checkValidationName.name1);
  // });

  // it('Failed to create a form element whose name parameter with virgul', async () => {
  //   await Page.checkValidate(checkValidationName, checkValidationName.name2);
  // });

  // it('Failed to create a form element whose name parameter with @ ', async () => {
  //   await Page.checkValidate(checkValidationName, checkValidationName.name3);
  // });

  // it('Failed to create a form element whose name parameter with Quotation mark and apostrophe ', async () => {
  //   await Page.checkValidate(checkValidationName, checkValidationName.name4);
  // });

  // it('Failed to create a form element whose name parameter with parenthesis ', async () => {
  //   await Page.checkValidate(checkValidationName, checkValidationName.name5);
  // });

  // it('successfully edits a Survey Form Element', async () => {
  //   await Page.edit(newSurveyFormElement.label, updateSurveyFormElement);
  // });

  // it('successfully creates a deletable element', async () => {
  //   await Page.createDeletable(deleteListElement);
  // });

  // it('successfully delete a list Element', async () => {
  //   await Page.delete(deleteListElement.label);
  // });
});
