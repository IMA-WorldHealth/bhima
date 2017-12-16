const helpers = require('../shared/helpers');
const FunctionPage = require('./functions.page');
const chai = require('chai');


/** configuring helpers**/
helpers.configure(chai);

describe('Job Titles Management', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/functions'));

  const Page = new FunctionPage();

  const title = {
    fonction_txt : 'Comptable'
  };

  const updateFunction = {
    fonction_txt : 'Chef Comptable',
  };

  it('successfully creates a new Job Title', () => {
    Page.createFunction(title);
  });

  it('successfully edits a Job Title', () => {
    Page.editFunction(title.fonction_txt, updateFunction);
  });

  it('don\'t create when incorrect Job Title', () => {
    Page.errorOnCreateFunction();
  });

  it('successfully delete a Job Title', () => {
    Page.deleteFunction(updateFunction.fonction_txt);
  });

});